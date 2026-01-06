using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using ProjectBackend.DTOs.LoanDTOs;
using ProjectBackend.Infrastructure.Interfaces;
using ProjectBackend.Infrastructure.Models;

namespace ProjectBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LoanController : ControllerBase
    {
        private readonly ILoanRepository _loanRepo;
        private readonly IBankAccountRepository _accountRepo;
        private readonly ITransactionRepository _transactionRepo;
        private readonly UserManager<BankUser> _userManager;
        private readonly ILogger<LoanController> _logger;

        public LoanController(
            ILoanRepository loanRepo,
            IBankAccountRepository accountRepo,
            ITransactionRepository transactionRepo,
            UserManager<BankUser> userManager,
            ILogger<LoanController> logger)
        {
            _loanRepo = loanRepo;
            _accountRepo = accountRepo;
            _transactionRepo = transactionRepo;
            _userManager = userManager;
            _logger = logger;
        }

        // GET: api/Loan
        [HttpGet]
        [Authorize(Roles = "Bank")]
        public async Task<ActionResult<IEnumerable<LoanDto>>> GetAll(CancellationToken cancellationToken)
        {
            var loans = await _loanRepo.GetAllAsync(cancellationToken);
            return Ok(loans.Select(MapLoan));
        }

        // GET: api/Loan/{id}
        [HttpGet("{id:guid}")]
        [Authorize]
        public async Task<ActionResult<LoanDto>> GetById(Guid id, CancellationToken cancellationToken)
        {
            var loan = await _loanRepo.GetByIdAsync(id, cancellationToken);
            if (loan == null) return NotFound();

            // allow bank role to view any loan
            if (User.IsInRole("Bank"))
                return Ok(MapLoan(loan));

            // otherwise ensure current user is borrower or lender
            var userId = GetCurrentUserId();
            if (userId == null) return BadRequest("User id claim missing.");

            var involved =
                (loan.BankAccount != null && loan.BankAccount.BankUserId == userId.Value) ||
                (loan.BankLenderAccount != null && loan.BankLenderAccount.BankUserId == userId.Value);

            if (!involved) return Forbid();

            return Ok(MapLoan(loan));
        }

        // POST: api/Loan/me
        // User requests a new loan. Server sets the lender to the single user in role "Bank".
        // Interest rate and term are determined by the controller (not provided by the client).
        [HttpPost("me")]
        [Authorize]
        public async Task<ActionResult<LoanDto>> CreateForMe([FromBody] CreateLoanForMeDto dto, CancellationToken cancellationToken)
        {
            if (dto == null) return BadRequest();
            if (dto.Principal <= 0) return BadRequest("Principal must be greater than zero.");

            var userId = GetCurrentUserId();
            if (userId == null) return BadRequest("User id claim missing.");

            // verify borrower account exists and belongs to current user
            var borrowerAccount = await _accountRepo.GetByIdAsync(dto.BorrowerAccountId, cancellationToken);
            if (borrowerAccount == null) return BadRequest("Borrower account not found.");
            if (borrowerAccount.BankUserId != userId.Value) return Forbid();

            // find the single bank user (role "Bank")
            var bankUsers = await _userManager.GetUsersInRoleAsync("Bank");
            var bankUser = bankUsers.SingleOrDefault();
            if (bankUser == null) return StatusCode(500, "No bank user configured.");
            // find a bank account for the lender
            var bankAccounts = await _accountRepo.GetByUserIdAsync(bankUser.Id, cancellationToken);
            var lenderAccount = bankAccounts.FirstOrDefault();
            if (lenderAccount == null) return StatusCode(500, "Bank lender account not configured.");

            // create initial transaction (lender -> borrower)
            var initialTx = new Transaction
            {
                Amount = dto.Principal,
                Description = "Loan disbursement",
                Type = TransactionType.Transfer,
                FromAccountId = lenderAccount.Id,
                ToAccountId = borrowerAccount.Id
            };

            // update balances
            lenderAccount.Balance -= dto.Principal;
            borrowerAccount.Balance += dto.Principal;

            // controller decides interest rate and term
            var interestRate = DetermineInterestRate(dto.Principal);
            var termMonths = DetermineTermMonths(dto.Principal);

            // create loan entity
            var loan = new Loan
            {
                Principal = dto.Principal,
                RemainingAmount = dto.Principal,
                InterestRate = interestRate,
                TermInMonths = termMonths,
                BorrowerAccountId = borrowerAccount.Id,
                BankLenderAccountId = lenderAccount.Id,
                StartDate = DateTime.UtcNow,
                NextInterestUpdate = DateTime.UtcNow.AddMonths(1),
                Status = LoanStatus.Active
            };

            // attach changes to context via repositories
            _accountRepo.Update(lenderAccount);
            _accountRepo.Update(borrowerAccount);
            await _transactionRepo.AddAsync(initialTx, cancellationToken);
            await _loanRepo.AddAsync(loan, cancellationToken);

            // save all (repositories share same DbContext)
            var saved = await _loanRepo.SaveChangesAsync(cancellationToken);
            if (!saved) return StatusCode(500, "Unable to persist loan.");

            // link initial transaction to loan (tx.Id will be populated after save)
            loan.InitialTransactionId = initialTx.Id;
            _loanRepo.Update(loan);
            var savedAgain = await _loanRepo.SaveChangesAsync(cancellationToken);
            if (!savedAgain) return StatusCode(500, "Unable to persist loan.");

            return CreatedAtAction(nameof(GetById), new { id = loan.Id }, MapLoan(loan));
        }

        // POST: api/Loan/{id}/payments
        // Make a payment towards a loan. User provides sender bank account id and amount.
        [HttpPost("{id:guid}/payments")]
        [Authorize]
        public async Task<ActionResult> PayLoan(Guid id, [FromBody] PayLoanDto dto, CancellationToken cancellationToken)
        {
            if (dto == null) return BadRequest();
            if (dto.Amount <= 0) return BadRequest("Amount must be greater than zero.");

            var userId = GetCurrentUserId();
            if (userId == null) return BadRequest("User id claim missing.");

            var loan = await _loanRepo.GetByIdAsync(id, cancellationToken);
            if (loan == null) return NotFound();
            if (loan.Status != LoanStatus.Active) return BadRequest("Loan is not active.");

            // verify sender account exists and belongs to user
            var sender = await _accountRepo.GetByIdAsync(dto.SenderBankAccountId, cancellationToken);
            if (sender == null) return BadRequest("Sender account not found.");
            if (sender.BankUserId != userId.Value) return Forbid();

            if (sender.Balance < dto.Amount) return BadRequest("Insufficient funds.");

            // load lender account
            var lender = await _accountRepo.GetByIdAsync(loan.BankLenderAccountId, cancellationToken);
            if (lender == null) return StatusCode(500, "Lender account not found.");

            // perform transfer: sender -> lender
            sender.Balance -= dto.Amount;
            lender.Balance += dto.Amount;

            // record transaction
            var tx = new Transaction
            {
                Amount = dto.Amount,
                Description = dto.Description ?? "Loan payment",
                Type = TransactionType.Transfer,
                FromAccountId = sender.Id,
                ToAccountId = lender.Id
            };

            // update loan remaining amount and status
            loan.RemainingAmount -= dto.Amount;
            if (loan.RemainingAmount <= 0)
            {
                loan.RemainingAmount = 0;
                loan.Status = LoanStatus.PaidOff;
            }

            _accountRepo.Update(sender);
            _accountRepo.Update(lender);
            await _transactionRepo.AddAsync(tx, cancellationToken);
            _loanRepo.Update(loan);

            var saved = await _accountRepo.SaveChangesAsync(cancellationToken);
            if (!saved) return StatusCode(500, "Unable to save payment.");

            return NoContent();
        }

        // ---------- Helpers & mapping ----------

        private Guid? GetCurrentUserId()
        {
            var idClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrWhiteSpace(idClaim)) return null;
            return Guid.TryParse(idClaim, out var g) ? g : (Guid?)null;
        }

        private static LoanDto MapLoan(Loan l)
            => new()
            {
                Id = l.Id,
                Principal = l.Principal,
                RemainingAmount = l.RemainingAmount,
                InterestRate = l.InterestRate,
                TermInMonths = l.TermInMonths,
                StartDate = l.StartDate,
                NextInterestUpdate = l.NextInterestUpdate,
                Status = l.Status,
                BorrowerAccountId = l.BorrowerAccountId,
                BankLenderAccountId = l.BankLenderAccountId,
                InitialTransactionId = l.InitialTransactionId
            };

        private static decimal DetermineInterestRate(decimal principal)
        {
            // simple tiered rates for demo purposes
            if (principal <= 1_000m) return 3.5m;
            if (principal <= 10_000m) return 5.0m;
            return 7.5m;
        }

        private static int DetermineTermMonths(decimal principal)
        {
            // simple tiered terms for demo purposes
            if (principal <= 1_000m) return 12;
            if (principal <= 10_000m) return 36;
            return 60;
        }
    }
}
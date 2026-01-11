using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using ProjectBackend.DTOs.TransactionDTOs;
using ProjectBackend.Infrastructure.Interfaces;
using ProjectBackend.Infrastructure.Models;

namespace ProjectBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TransactionController : ControllerBase
    {
        private readonly ITransactionRepository _transactionRepo;
        private readonly IBankAccountRepository _accountRepo;
        private readonly IDebitCardRepository _cardRepo;
        private readonly ILogger<TransactionController> _logger;

        public TransactionController(
            ITransactionRepository transactionRepo,
            IBankAccountRepository accountRepo,
            IDebitCardRepository cardRepo,
            ILogger<TransactionController> logger)
        {
            _transactionRepo = transactionRepo ?? throw new ArgumentNullException(nameof(transactionRepo));
            _accountRepo = accountRepo ?? throw new ArgumentNullException(nameof(accountRepo));
            _cardRepo = cardRepo ?? throw new ArgumentNullException(nameof(cardRepo));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        // ---------- Admin endpoints (role: Bank) ----------

        // GET: api/Transaction
        [HttpGet]
        [Authorize(Roles = "Bank")]
        public async Task<ActionResult<IEnumerable<TransactionDto>>> GetAll(CancellationToken cancellationToken)
        {
            var transactions = await _transactionRepo.GetAllAsync(cancellationToken);
            return Ok(transactions.Select(MapTransaction));
        }

        // GET: api/Transaction/{id}
        [HttpGet("{id:guid}")]
        [Authorize]
        public async Task<ActionResult<TransactionDto>> GetById(Guid id, CancellationToken cancellationToken)
        {
            var tx = await _transactionRepo.GetByIdAsync(id, cancellationToken);
            if (tx == null) return NotFound();

            if (User.IsInRole("Bank"))
                return Ok(MapTransaction(tx));

            var userId = GetCurrentUserId();
            if (userId == null) return BadRequest("User id claim missing.");

            var involved =
                (tx.FromAccount != null && tx.FromAccount.BankUserId == userId.Value) ||
                (tx.ToAccount != null && tx.ToAccount.BankUserId == userId.Value);

            if (!involved) return Forbid();

            return Ok(MapTransaction(tx));
        }

        // GET: api/Transaction/user/{userId}
        [HttpGet("user/{userId:guid}")]
        [Authorize(Roles = "Bank")]
        public async Task<ActionResult<IEnumerable<TransactionDto>>> GetByUserId(Guid userId, CancellationToken cancellationToken)
        {
            var transactions = await _transactionRepo.GetByUserIdAsync(userId, cancellationToken);
            return Ok(transactions.Select(MapTransaction));
        }

        // ---------- User endpoints ----------

        // POST: api/Transaction/me
        [HttpPost("me")]
        [Authorize]
        public async Task<ActionResult<TransactionDto>> CreateForMe([FromBody] CreateTransactionForMeDto dto, CancellationToken cancellationToken)
        {
            if (dto == null) return BadRequest();
            if (dto.Amount <= 0) return BadRequest("Amount must be greater than zero.");

            var userId = GetCurrentUserId();
            if (userId == null) return BadRequest("User id claim missing.");

            if (dto.SenderBankAccountId == Guid.Empty)
                return BadRequest("Sender bank account id is required.");

            var sender = await _accountRepo.GetByIdAsync(dto.SenderBankAccountId, cancellationToken);
            if (sender == null) return BadRequest("Sender account not found.");
            if (sender.BankUserId != userId.Value) return Forbid();

            if (sender.Balance < dto.Amount)
                return BadRequest("Insufficient funds in the selected sender account.");

            var receiver = await _accountRepo.GetByIbanAsync(dto.ReceiverIban, cancellationToken);
            if (receiver == null) return BadRequest("Receiver account not found.");

            sender.Balance -= dto.Amount;
            receiver.Balance += dto.Amount;

            var tx = new Transaction
            {
                Amount = dto.Amount,
                Description = dto.Description ?? string.Empty,
                Type = TransactionType.Transfer,
                FromAccountId = sender.Id,
                ToAccountId = receiver.Id
            };

            _accountRepo.Update(sender);
            _accountRepo.Update(receiver);
            await _transactionRepo.AddAsync(tx, cancellationToken);

            var saved = await _accountRepo.SaveChangesAsync(cancellationToken);
            if (!saved) return StatusCode(500, "Unable to save transaction.");

            return CreatedAtAction(nameof(GetById), new { id = tx.Id }, MapTransaction(tx));
        }

        // POST: api/Transaction/me/deposit
        [HttpPost("me/deposit")]
        [Authorize]
        public async Task<ActionResult<TransactionDto>> DepositWithCard([FromBody] DepositWithCardDto dto, CancellationToken cancellationToken)
        {
            if (dto == null) return BadRequest();
            if (dto.Amount <= 0) return BadRequest("Deposit amount must be greater than zero.");
            if (dto.Amount > 1000m) return BadRequest("Maximum deposit amount is 1000 euros per transaction.");

            var userId = GetCurrentUserId();
            if (userId == null) return BadRequest("User id claim missing.");

            var card = await _cardRepo.GetByIdAsync(dto.DebitCardId, cancellationToken);
            if (card == null) return BadRequest("Debit card not found.");

            if (card.OwnerId != userId.Value) return Forbid();

            var providedPinHash = HashPin(dto.PIN);
            if (card.PINHash != providedPinHash) return BadRequest("Invalid PIN.");

            var account = await _accountRepo.GetByIdAsync(card.BankAccountId, cancellationToken);
            if (account == null) return BadRequest("Bank account not found.");

            account.Balance += dto.Amount;

            var transaction = new Transaction
            {
                Amount = dto.Amount,
                Description = dto.Description ?? "Demo deposit via debit card",
                Type = TransactionType.Deposit,
                ToAccountId = account.Id,
                FromAccountId = null // No source account for deposits
            };

            _accountRepo.Update(account);
            await _transactionRepo.AddAsync(transaction, cancellationToken);

            var saved = await _accountRepo.SaveChangesAsync(cancellationToken);
            if (!saved) return StatusCode(500, "Unable to save deposit.");

            return CreatedAtAction(nameof(GetById), new { id = transaction.Id }, MapTransaction(transaction));
        }

        // POST: api/Transaction/me/withdraw
        [HttpPost("me/withdraw")]
        [Authorize]
        public async Task<ActionResult<TransactionDto>> WithdrawWithCard([FromBody] WithdrawWithCardDto dto, CancellationToken cancellationToken)
        {
            if (dto == null) return BadRequest();
            if (dto.Amount <= 0) return BadRequest("Withdrawal amount must be greater than zero.");
            if (dto.Amount > 1000m) return BadRequest("Maximum withdrawal amount is 1000 euros per transaction.");

            var userId = GetCurrentUserId();
            if (userId == null) return BadRequest("User id claim missing.");

            var card = await _cardRepo.GetByIdAsync(dto.DebitCardId, cancellationToken);
            if (card == null) return BadRequest("Debit card not found.");

            if (card.OwnerId != userId.Value) return Forbid();

            var providedPinHash = HashPin(dto.PIN);
            if (card.PINHash != providedPinHash) return BadRequest("Invalid PIN.");

            var account = await _accountRepo.GetByIdAsync(card.BankAccountId, cancellationToken);
            if (account == null) return BadRequest("Bank account not found.");

            if (account.Balance < dto.Amount)
                return BadRequest("Insufficient funds for withdrawal.");

            account.Balance -= dto.Amount;

            var transaction = new Transaction
            {
                Amount = dto.Amount,
                Description = dto.Description ?? "Demo withdrawal via debit card",
                Type = TransactionType.Withdrawal,
                FromAccountId = account.Id,
                ToAccountId = null
            };

            _accountRepo.Update(account);
            await _transactionRepo.AddAsync(transaction, cancellationToken);

            var saved = await _accountRepo.SaveChangesAsync(cancellationToken);
            if (!saved) return StatusCode(500, "Unable to save withdrawal.");

            return CreatedAtAction(nameof(GetById), new { id = transaction.Id }, MapTransaction(transaction));
        }

        // GET: api/Transaction/me/account/{bankAccountId}
        [HttpGet("me/account/{bankAccountId:guid}")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<TransactionDto>>> GetMyTransactionsByAccount(Guid bankAccountId, CancellationToken cancellationToken)
        {
            var userId = GetCurrentUserId();
            if (userId == null) return BadRequest("User id claim missing.");

            var account = await _accountRepo.GetByIdAsync(bankAccountId, cancellationToken);
            if (account == null) return NotFound("Bank account not found.");
            if (account.BankUserId != userId.Value) return Forbid();

            var transactions = await _transactionRepo.GetByAccountIdAsync(bankAccountId, cancellationToken);
            return Ok(transactions.Select(MapTransaction));
        }

        // ---------- Helpers & mapping ----------

        private Guid? GetCurrentUserId()
        {
            var idClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrWhiteSpace(idClaim)) return null;
            return Guid.TryParse(idClaim, out var g) ? g : (Guid?)null;
        }

        private static TransactionDto MapTransaction(Transaction t)
            => new()
            {
                Id = t.Id,
                Amount = t.Amount,
                Description = t.Description,
                Type = t.Type,
                CreatedAt = t.CreatedAt,
                FromAccountId = t.FromAccountId,
                ToAccountId = t.ToAccountId
            };

        private static string HashPin(string pin)
        {
            using var sha = SHA256.Create();
            var bytes = Encoding.UTF8.GetBytes(pin);
            var hash = sha.ComputeHash(bytes);
            return Convert.ToBase64String(hash);
        }
    }
}
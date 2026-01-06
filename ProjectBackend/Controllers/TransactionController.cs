using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
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
        private readonly ILogger<TransactionController> _logger;

        public TransactionController(
            ITransactionRepository transactionRepo,
            IBankAccountRepository accountRepo,
            ILogger<TransactionController> logger)
        {
            _transactionRepo = transactionRepo ?? throw new ArgumentNullException(nameof(transactionRepo));
            _accountRepo = accountRepo ?? throw new ArgumentNullException(nameof(accountRepo));
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

            // allow admins to see any transaction
            if (User.IsInRole("Bank"))
                return Ok(MapTransaction(tx));

            // otherwise ensure the current user is involved in the transaction
            var userId = GetCurrentUserId();
            if (userId == null) return BadRequest("User id claim missing.");

            var involved =
                (tx.FromAccount != null && tx.FromAccount.BankUserId == userId.Value) ||
                (tx.ToAccount != null && tx.ToAccount.BankUserId == userId.Value);

            if (!involved) return Forbid();

            return Ok(MapTransaction(tx));
        }

        // ---------- User endpoint: make a transfer using receiver IBAN ----------

        // POST: api/Transaction/me
        // Request body: sender bankAccountId + receiver IBAN + amount (+ optional description)
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

            // load sender account and verify ownership
            var sender = await _accountRepo.GetByIdAsync(dto.SenderBankAccountId, cancellationToken);
            if (sender == null) return BadRequest("Sender account not found.");
            if (sender.BankUserId != userId.Value) return Forbid(); // user does not own the provided sender account

            if (sender.Balance < dto.Amount)
                return BadRequest("Insufficient funds in the selected sender account.");

            // find receiver account by IBAN using repository method
            var receiver = await _accountRepo.GetByIbanAsync(dto.ReceiverIban, cancellationToken);
            if (receiver == null) return BadRequest("Receiver account not found.");

            // perform balance updates
            sender.Balance -= dto.Amount;
            receiver.Balance += dto.Amount;

            // create transaction record
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

            // Save all tracked changes (repositories share same DbContext in this project)
            var saved = await _accountRepo.SaveChangesAsync(cancellationToken);
            if (!saved) return StatusCode(500, "Unable to save transaction.");

            return CreatedAtAction(nameof(GetById), new { id = tx.Id }, MapTransaction(tx));
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
                FromAccountId = t.FromAccountId,
                ToAccountId = t.ToAccountId
            };
    }
}
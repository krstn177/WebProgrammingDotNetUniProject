using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using ProjectBackend.DTOs.BankAccountDTOs;
using ProjectBackend.DTOs.DebitCardDTOs;
using ProjectBackend.DTOs.TransactionDTOs;
using ProjectBackend.Infrastructure.Interfaces;
using ProjectBackend.Infrastructure.Models;

namespace ProjectBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BankAccountController : ControllerBase
    {
        private readonly IBankAccountRepository _accountRepo;
        private readonly IDebitCardRepository _cardRepo;
        private readonly ITransactionRepository _transactionRepo;
        private readonly ILogger<BankAccountController> _logger;

        public BankAccountController(
            IBankAccountRepository accountRepo,
            IDebitCardRepository cardRepo,
            ITransactionRepository transactionRepo,
            ILogger<BankAccountController> logger)
        {
            _accountRepo = accountRepo ?? throw new ArgumentNullException(nameof(accountRepo));
            _cardRepo = cardRepo ?? throw new ArgumentNullException(nameof(cardRepo));
            _transactionRepo = transactionRepo ?? throw new ArgumentNullException(nameof(transactionRepo));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        // ---------------- Admin endpoints (role: Bank) ----------------

        // GET: api/BankAccount
        [HttpGet]
        [Authorize(Roles = "Bank")]
        public async Task<ActionResult<IEnumerable<BankAccountDto>>> GetAll(CancellationToken cancellationToken)
        {
            var accounts = await _accountRepo.GetAllAsync(cancellationToken);
            return Ok(accounts.Select(Map));
        }

        // GET: api/BankAccount/{id}
        [HttpGet("{id:guid}")]
        [Authorize(Roles = "Bank")]
        public async Task<ActionResult<BankAccountDto>> GetById(Guid id, CancellationToken cancellationToken)
        {
            var account = await _accountRepo.GetByIdAsync(id, cancellationToken);
            if (account == null) return NotFound();
            return Ok(Map(account));
        }

        // POST: api/BankAccount
        [HttpPost]
        [Authorize(Roles = "Bank")]
        public async Task<ActionResult<BankAccountDto>> Create([FromBody] CreateBankAccountDto dto, CancellationToken cancellationToken)
        {
            if (dto == null) return BadRequest();
            var entity = new BankAccount
            {
                IBAN = dto.IBAN ?? string.Empty,
                AccountNumber = dto.AccountNumber ?? string.Empty,
                Balance = dto.Balance,
                BankUserId = dto.BankUserId
            };

            await _accountRepo.AddAsync(entity, cancellationToken);
            await _accountRepo.SaveChangesAsync(cancellationToken);

            return CreatedAtAction(nameof(GetById), new { id = entity.Id }, Map(entity));
        }

        // PUT: api/BankAccount/{id}
        [HttpPut("{id:guid}")]
        [Authorize(Roles = "Bank")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateBankAccountDto dto, CancellationToken cancellationToken)
        {
            if (dto == null || id != dto.Id) return BadRequest();

            var existing = await _accountRepo.GetByIdAsync(id, cancellationToken);
            if (existing == null) return NotFound();

            existing.IBAN = dto.IBAN ?? existing.IBAN;
            existing.AccountNumber = dto.AccountNumber ?? existing.AccountNumber;
            existing.Balance = dto.Balance ?? existing.Balance;
            existing.BankUserId = dto.BankUserId ?? existing.BankUserId;

            _accountRepo.Update(existing);
            var saved = await _accountRepo.SaveChangesAsync(cancellationToken);
            if (!saved) return StatusCode(500, "Unable to save changes.");

            return NoContent();
        }

        // DELETE: api/BankAccount/{id}
        [HttpDelete("{id:guid}")]
        [Authorize(Roles = "Bank")]
        public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
        {
            var existing = await _accountRepo.GetByIdAsync(id, cancellationToken);
            if (existing == null) return NotFound();

            _accountRepo.Remove(existing);
            await _accountRepo.SaveChangesAsync(cancellationToken);
            return NoContent();
        }

        // ---------------- User endpoints (authenticated) ----------------

        // GET: api/BankAccount/me
        [HttpGet("me")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<BankAccountDto>>> GetMyAccounts(CancellationToken cancellationToken)
        {
            var userId = GetCurrentUserId();
            if (userId == null) return BadRequest("User id claim missing.");

            var accounts = await _accountRepo.GetByUserIdAsync(userId.Value, cancellationToken);
            return Ok(accounts.Select(Map));
        }

        // GET: api/BankAccount/me/{id}
        [HttpGet("me/{id:guid}")]
        [Authorize]
        public async Task<ActionResult<BankAccountDto>> GetMyAccount(Guid id, CancellationToken cancellationToken)
        {
            var userId = GetCurrentUserId();
            if (userId == null) return BadRequest("User id claim missing.");

            var account = await _accountRepo.GetByIdAsync(id, cancellationToken);
            if (account == null) return NotFound();
            if (account.BankUserId != userId.Value) return Forbid();

            return Ok(Map(account));
        }

        // POST: api/BankAccount/me
        [HttpPost("me")]
        [Authorize]
        public async Task<ActionResult<BankAccountDto>> CreateForMe([FromBody] CreateBankAccountDto dto, CancellationToken cancellationToken)
        {
            var userId = GetCurrentUserId();
            if (userId == null) return BadRequest("User id claim missing.");
            if (dto == null) return BadRequest();

            var entity = new BankAccount
            {
                IBAN = dto.IBAN ?? string.Empty,
                AccountNumber = dto.AccountNumber ?? string.Empty,
                Balance = dto.Balance,
                BankUserId = userId.Value
            };

            await _accountRepo.AddAsync(entity, cancellationToken);
            await _accountRepo.SaveChangesAsync(cancellationToken);

            return CreatedAtAction(nameof(GetMyAccount), new { id = entity.Id }, Map(entity));
        }

        // GET: api/BankAccount/me/{id}/cards
        [HttpGet("me/{id:guid}/cards")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<DebitCardDto>>> GetMyAccountCards(Guid id, CancellationToken cancellationToken)
        {
            var userId = GetCurrentUserId();
            if (userId == null) return BadRequest("User id claim missing.");

            var account = await _accountRepo.GetByIdAsync(id, cancellationToken);
            if (account == null) return NotFound();
            if (account.BankUserId != userId.Value) return Forbid();

            var cards = await _cardRepo.GetByBankAccountIdAsync(id, cancellationToken);
            return Ok(cards.Select(MapCard));
        }

        // GET: api/BankAccount/me/{id}/transactions
        [HttpGet("me/{id:guid}/transactions")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<TransactionDto>>> GetMyAccountTransactions(Guid id, CancellationToken cancellationToken)
        {
            var userId = GetCurrentUserId();
            if (userId == null) return BadRequest("User id claim missing.");

            var account = await _accountRepo.GetByIdAsync(id, cancellationToken);
            if (account == null) return NotFound();
            if (account.BankUserId != userId.Value) return Forbid();

            var transactions = await _transactionRepo.GetByAccountIdAsync(id, cancellationToken);
            return Ok(transactions.Select(MapTransaction));
        }

        // ---------------- Helpers & mappers ----------------

        private Guid? GetCurrentUserId()
        {
            var idClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrWhiteSpace(idClaim)) return null;
            return Guid.TryParse(idClaim, out var g) ? g : (Guid?)null;
        }

        private static BankAccountDto Map(BankAccount a)
            => new()
            {
                Id = a.Id,
                IBAN = a.IBAN,
                AccountNumber = a.AccountNumber,
                Balance = a.Balance,
                BankUserId = a.BankUserId
            };

        private static DebitCardDto MapCard(DebitCard c)
            => new()
            {
                Id = c.Id,
                CardNumber = c.CardNumber,
                HolderName = c.HolderName,
                ExpirationDate = c.ExpirationDate,
                Type = c.Type,
                BankAccountId = c.BankAccountId,
                OwnerId = c.OwnerId
            };

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
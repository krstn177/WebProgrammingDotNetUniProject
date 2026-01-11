using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using ProjectBackend.DTOs.DebitCardDTOs;
using ProjectBackend.Infrastructure.Interfaces;
using ProjectBackend.Infrastructure.Models;

namespace ProjectBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DebitCardController : ControllerBase
    {
        private readonly IDebitCardRepository _cardRepo;
        private readonly IBankAccountRepository _accountRepo;
        private readonly ILogger<DebitCardController> _logger;
        private readonly UserManager<BankUser> _userManager;

        public DebitCardController(IDebitCardRepository cardRepo, IBankAccountRepository accountRepo, ILogger<DebitCardController> logger, UserManager<BankUser> userManager)
        {
            _cardRepo = cardRepo;
            _accountRepo = accountRepo;
            _userManager = userManager;
            _logger = logger;
        }

        // ---------- Admin endpoints (role: Bank) ----------

        // GET: api/DebitCard
        [HttpGet]
        [Authorize(Roles = "Bank")]
        public async Task<ActionResult<IEnumerable<DebitCardDto>>> GetAll(CancellationToken cancellationToken)
        {
            var cards = await _cardRepo.GetAllAsync(cancellationToken);
            return Ok(cards.Select(Map));
        }

        // GET: api/DebitCard/{id}
        [HttpGet("{id:guid}")]
        [Authorize(Roles = "Bank")]
        public async Task<ActionResult<DebitCardDto>> GetById(Guid id, CancellationToken cancellationToken)
        {
            var card = await _cardRepo.GetByIdAsync(id, cancellationToken);
            if (card == null) return NotFound();
            return Ok(Map(card));
        }

        // POST: api/DebitCard
        [HttpPost]
        [Authorize(Roles = "Bank")]
        public async Task<ActionResult<DebitCardDto>> Create([FromBody] CreateDebitCardDto dto, CancellationToken cancellationToken)
        {
            if (dto == null) return BadRequest();
            var account = await _accountRepo.GetByIdAsync(dto.BankAccountId, cancellationToken);
            if (account == null) return BadRequest("Bank account not found.");

            var entity = new DebitCard
            {
                CardNumber = dto.CardNumber ?? string.Empty,
                HolderName = dto.HolderName ?? string.Empty,
                ExpirationDate = dto.ExpirationDate,
                Type = dto.Type,
                CVV = dto.CVV ?? GenerateCVV(),
                BankAccountId = dto.BankAccountId,
                OwnerId = dto.OwnerId
            };

            if (!string.IsNullOrEmpty(dto.PIN))
                entity.PINHash = HashPin(dto.PIN);
            else
                entity.PINHash = string.Empty;

            await _cardRepo.AddAsync(entity, cancellationToken);
            await _cardRepo.SaveChangesAsync(cancellationToken);

            return CreatedAtAction(nameof(GetById), new { id = entity.Id }, Map(entity));
        }

        // PUT: api/DebitCard/{id}
        [HttpPut("{id:guid}")]
        [Authorize(Roles = "Bank")]
        public async Task<IActionResult> UpdateAsAdmin(Guid id, [FromBody] UpdateDebitCardDto dto, CancellationToken cancellationToken)
        {
            if (dto == null || id != dto.Id) return BadRequest();

            var existing = await _cardRepo.GetByIdAsync(id, cancellationToken);
            if (existing == null) return NotFound();

            existing.HolderName = dto.HolderName ?? existing.HolderName;
            existing.ExpirationDate = dto.ExpirationDate ?? existing.ExpirationDate;
            existing.Type = dto.Type ?? existing.Type;

            if (!string.IsNullOrEmpty(dto.NewPIN))
                existing.PINHash = HashPin(dto.NewPIN);

            _cardRepo.Update(existing);
            var saved = await _cardRepo.SaveChangesAsync(cancellationToken);
            if (!saved) return StatusCode(500, "Unable to save changes.");

            return NoContent();
        }

        // DELETE: api/DebitCard/{id}
        [HttpDelete("{id:guid}")]
        [Authorize(Roles = "Bank")]
        public async Task<IActionResult> DeleteAsAdmin(Guid id, CancellationToken cancellationToken)
        {
            var existing = await _cardRepo.GetByIdAsync(id, cancellationToken);
            if (existing == null) return NotFound();

            _cardRepo.Remove(existing);
            await _cardRepo.SaveChangesAsync(cancellationToken);
            return NoContent();
        }

        // ---------- User endpoints (authenticated) ----------

        // GET: api/DebitCard/me
        [HttpGet("me")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<DebitCardDto>>> GetMyCards(CancellationToken cancellationToken)
        {
            var userId = GetCurrentUserId();
            if (userId == null) return BadRequest("User id claim missing.");

            var cards = await _cardRepo.GetByOwnerIdAsync(userId.Value, cancellationToken);
            return Ok(cards.Select(Map));
        }

        // GET: api/DebitCard/me/{id}
        [HttpGet("me/{id:guid}")]
        [Authorize]
        public async Task<ActionResult<DebitCardDto>> GetMyCard(Guid id, CancellationToken cancellationToken)
        {
            var userId = GetCurrentUserId();
            if (userId == null) return BadRequest("User id claim missing.");

            var card = await _cardRepo.GetByIdAsync(id, cancellationToken);
            if (card == null) return NotFound();
            if (card.OwnerId != userId.Value) return Forbid();

            return Ok(Map(card));
        }

        // POST: api/DebitCard/me
        [HttpPost("me")]
        [Authorize]
        public async Task<ActionResult<DebitCardDto>> CreateForMe([FromBody] CreateDebitCardForMeDto dto, CancellationToken cancellationToken)
        {
            var userId = GetCurrentUserId();
            if (userId == null) return BadRequest("User id claim missing.");
            if (dto == null) return BadRequest();
            var user = await _userManager.FindByIdAsync(userId.ToString());


            var account = await _accountRepo.GetByIdAsync(dto.BankAccountId, cancellationToken);
            if (account == null) return BadRequest("Bank account not found.");
            if (account.BankUserId != userId.Value) return Forbid();

            var entity = new DebitCard
            {
                CardNumber = GenerateCardNumber(),
                HolderName = user.FirstName + " " + user.LastName,
                ExpirationDate = GenerateExpirationDate(),
                Type = dto.Type,
                CVV = GenerateCVV(),
                BankAccountId = dto.BankAccountId,
                OwnerId = userId.Value,
                PINHash = string.IsNullOrEmpty(dto.PIN) ? string.Empty : HashPin(dto.PIN)
            };

            await _cardRepo.AddAsync(entity, cancellationToken);
            await _cardRepo.SaveChangesAsync(cancellationToken);

            return CreatedAtAction(nameof(GetMyCard), new { id = entity.Id }, Map(entity));
        }

        // DELETE: api/DebitCard/me/{id}
        [HttpDelete("me/{id:guid}")]
        [Authorize]
        public async Task<IActionResult> DeleteMyCard(Guid id, CancellationToken cancellationToken)
        {
            var userId = GetCurrentUserId();
            if (userId == null) return BadRequest("User id claim missing.");

            var existing = await _cardRepo.GetByIdAsync(id, cancellationToken);
            if (existing == null) return NotFound();
            if (existing.OwnerId != userId.Value) return Forbid();

            _cardRepo.Remove(existing);
            await _cardRepo.SaveChangesAsync(cancellationToken);
            return NoContent();
        }

        // PUT: api/DebitCard/me/{id}/pin
        [HttpPut("me/{id:guid}/pin")]
        [Authorize]
        public async Task<IActionResult> UpdateMyCardPin(Guid id, [FromBody] UpdateCardPinDto dto, CancellationToken cancellationToken)
        {
            if (dto == null) return BadRequest();
            if (string.IsNullOrEmpty(dto.NewPIN)) return BadRequest("New PIN is required.");

            var userId = GetCurrentUserId();
            if (userId == null) return BadRequest("User id claim missing.");

            var existing = await _cardRepo.GetByIdAsync(id, cancellationToken);
            if (existing == null) return NotFound();
            if (existing.OwnerId != userId.Value) return Forbid();

            existing.PINHash = HashPin(dto.NewPIN);

            _cardRepo.Update(existing);
            var saved = await _cardRepo.SaveChangesAsync(cancellationToken);
            if (!saved) return StatusCode(500, "Unable to save changes.");

            return NoContent();
        }

        // GET: api/DebitCard/owner/{ownerId}
        [HttpGet("user/{ownerId:guid}")]
        [Authorize(Roles = "Bank")]
        public async Task<ActionResult<IEnumerable<DebitCardDto>>> GetByOwnerId(Guid ownerId, CancellationToken cancellationToken)
        {
            var cards = await _cardRepo.GetByOwnerIdAsync(ownerId, cancellationToken);
            return Ok(cards.Select(Map));
        }

        // GET: api/DebitCard/me/account/{bankAccountId}
        [HttpGet("me/account/{bankAccountId:guid}")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<DebitCardDto>>> GetMyCardsByAccount(Guid bankAccountId, CancellationToken cancellationToken)
        {
            var userId = GetCurrentUserId();
            if (userId == null) return BadRequest("User id claim missing.");

            var account = await _accountRepo.GetByIdAsync(bankAccountId, cancellationToken);
            if (account == null) return NotFound("Bank account not found.");
            if (account.BankUserId != userId.Value) return Forbid();

            var cards = await _cardRepo.GetByBankAccountIdAsync(bankAccountId, cancellationToken);
            return Ok(cards.Select(Map));
        }

        // ---------- Helpers & mapping ----------
        private static string GenerateCardNumber()
        {
            var sb = new StringBuilder(19);
            for (int i = 0; i < 16; i++)
            {
                int digit = RandomNumberGenerator.GetInt32(0, 10);
                sb.Append(digit);
                if ((i + 1) % 4 == 0 && i != 15) sb.Append(' ');
            }
            return sb.ToString();
        }

        private static string GenerateCVV()
        {
            var cvv = RandomNumberGenerator.GetInt32(100, 1000);
            return cvv.ToString("D3");
        }

        private static DateTime GenerateExpirationDate()
        {
            var target = DateTime.UtcNow.AddYears(4);
            var year = target.Year;
            var month = target.Month;
            var day = DateTime.DaysInMonth(year, month);
            return new DateTime(year, month, day, 23, 59, 59, DateTimeKind.Utc);
        }
        private Guid? GetCurrentUserId()
        {
            var idClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrWhiteSpace(idClaim)) return null;
            return Guid.TryParse(idClaim, out var g) ? g : (Guid?)null;
        }

        private static DebitCardDto Map(DebitCard c)
            => new()
            {
                Id = c.Id,
                CardNumber = c.CardNumber,
                HolderName = c.HolderName,
                ExpirationDate = c.ExpirationDate,
                Type = c.Type,
                CVV = c.CVV,
                BankAccountId = c.BankAccountId,
                OwnerId = c.OwnerId
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
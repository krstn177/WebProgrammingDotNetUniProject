using ProjectBackend.Infrastructure.Models;

namespace ProjectBackend.DTOs.DebitCardDTOs
{
    public record CreateDebitCardDto
    {
        public string? CardNumber { get; init; }
        public string? HolderName { get; init; }
        public DateTime ExpirationDate { get; init; }
        public CardType Type { get; init; }
        public string? CVV { get; init; } // optional - will be generated if not provided
        public Guid BankAccountId { get; init; }
        public Guid OwnerId { get; init; } // admin can set owner
        public string? PIN { get; init; } // plain PIN for demo only
    }
}

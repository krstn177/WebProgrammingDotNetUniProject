using ProjectBackend.Infrastructure.Models;

namespace ProjectBackend.DTOs.DebitCardDTOs
{
    public record DebitCardDto
    {
        public Guid Id { get; init; }
        public string CardNumber { get; init; } = string.Empty;
        public string HolderName { get; init; } = string.Empty;
        public DateTime ExpirationDate { get; init; }
        public CardType Type { get; init; }
        public string CVV { get; init; } = string.Empty;
        public Guid BankAccountId { get; init; }
        public Guid OwnerId { get; init; }
    }
}

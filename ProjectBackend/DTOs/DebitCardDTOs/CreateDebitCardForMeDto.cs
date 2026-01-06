using ProjectBackend.Infrastructure.Models;

namespace ProjectBackend.DTOs.DebitCardDTOs
{
    public class CreateDebitCardForMeDto
    {
        public CardType Type { get; init; }
        public Guid BankAccountId { get; init; }
        public string? PIN { get; init; }
    }
}

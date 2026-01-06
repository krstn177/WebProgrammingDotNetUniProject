
namespace ProjectBackend.DTOs.DebitCardDTOs
{
    public record UpdateDebitCardDto
    {
        public Guid Id { get; init; }
        public string? HolderName { get; init; }
        public DateTime? ExpirationDate { get; init; }
        public string? NewPIN { get; init; } // optional PIN change (demo)
    }
}

namespace ProjectBackend.DTOs.TransactionDTOs
{
    public record DepositWithCardDto
    {
        public Guid DebitCardId { get; init; }
        public string PIN { get; init; } = string.Empty;
        public decimal Amount { get; init; }
        public string? Description { get; init; }
    }
}
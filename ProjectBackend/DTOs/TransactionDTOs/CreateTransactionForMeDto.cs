namespace ProjectBackend.DTOs.TransactionDTOs
{
    public record CreateTransactionForMeDto
    {
        public Guid SenderBankAccountId { get; init; }
        public string ReceiverIban { get; init; } = string.Empty;
        public decimal Amount { get; init; }
        public string? Description { get; init; }
    }
}

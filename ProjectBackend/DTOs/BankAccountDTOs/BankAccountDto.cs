namespace ProjectBackend.DTOs.BankAccountDTOs
{
    public record BankAccountDto
    {
        public Guid Id { get; init; }
        public string IBAN { get; init; } = string.Empty;
        public string AccountNumber { get; init; } = string.Empty;
        public decimal Balance { get; init; }
        public Guid BankUserId { get; init; }
    }
}

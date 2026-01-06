namespace ProjectBackend.DTOs.BankAccountDTOs
{
    public record UpdateBankAccountDto
    {
        public Guid Id { get; init; }
        public string? IBAN { get; init; }
        public string? AccountNumber { get; init; }
        public decimal? Balance { get; init; }
        public Guid? BankUserId { get; init; }
    }
}

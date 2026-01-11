namespace ProjectBackend.DTOs.BankAccountDTOs
{
    public record UpdateBankAccountDto
    {
        public string? IBAN { get; init; }
        public string? AccountNumber { get; init; }
        public decimal? Balance { get; init; }
    }
}

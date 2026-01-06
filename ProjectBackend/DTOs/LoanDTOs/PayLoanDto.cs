namespace ProjectBackend.DTOs.LoanDTOs
{
    public record PayLoanDto
    {
        public Guid SenderBankAccountId { get; init; }
        public decimal Amount { get; init; }
        public string? Description { get; init; }
    }
}

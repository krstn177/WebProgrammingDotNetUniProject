using ProjectBackend.Infrastructure.Models;

namespace ProjectBackend.DTOs.LoanDTOs
{
    public record LoanDto
    {
        public Guid Id { get; init; }
        public decimal Principal { get; init; }
        public decimal RemainingAmount { get; init; }
        public decimal InterestRate { get; init; }
        public int TermInMonths { get; init; }
        public DateTime StartDate { get; init; }
        public DateTime NextInterestUpdate { get; init; }
        public LoanStatus Status { get; init; }
        public Guid BorrowerAccountId { get; init; }
        public Guid BankLenderAccountId { get; init; }
        public Guid? InitialTransactionId { get; init; }
    }
}

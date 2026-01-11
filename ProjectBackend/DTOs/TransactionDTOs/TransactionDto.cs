using ProjectBackend.Infrastructure.Models;

namespace ProjectBackend.DTOs.TransactionDTOs
{
    public record TransactionDto
    {
        public Guid Id { get; init; }
        public decimal Amount { get; init; }
        public string Description { get; init; } = string.Empty;
        public DateTime CreatedAt { get; init; }
        public TransactionType Type { get; init; }
        public Guid? FromAccountId { get; init; }
        public Guid? ToAccountId { get; init; }
    }
}

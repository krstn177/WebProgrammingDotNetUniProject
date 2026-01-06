using System.ComponentModel.DataAnnotations;

namespace ProjectBackend.DTOs.LoanDTOs
{
    public record CreateLoanForMeDto
    {
        [Required]
        public decimal Principal { get; init; }
        [Required]
        public Guid BorrowerAccountId { get; init; }


    }
}

namespace ProjectBackend.DTOs.BankAccountDTOs
{
    public record CreateBankAccountDto
    {
       public string? IBAN { get; init; }
       public string? AccountNumber { get; init; }
       public decimal Balance { get; init; } = 0m;
       public Guid BankUserId { get; init; } // used by admin create; ignored/overwritten for "me" endpoint
    }
    
}

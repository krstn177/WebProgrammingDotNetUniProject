namespace ProjectBackend.DTOs.UserDTOs
{
    public class BankUserDtoForAdmin
    {
        public Guid Id { get; init; }
        public string Email { get; init; } = string.Empty;
        public string FirstName { get; init; } = string.Empty;
        public string LastName { get; init; } = string.Empty;
        public string PersonalIdentificationNumber { get; init; } = string.Empty;
        public string[] Roles { get; init; } = Array.Empty<string>();
    }
}

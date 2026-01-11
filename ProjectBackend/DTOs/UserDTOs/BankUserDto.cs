using System;

namespace ProjectBackend.DTOs.UserDTOs
{
    public record BankUserDto
    {
        public Guid Id { get; init; }
        public string Email { get; init; } = string.Empty;
        public string FirstName { get; init; } = string.Empty;
        public string LastName { get; init; } = string.Empty;
        public string Token { get; init; } = string.Empty;
        public string[] Roles { get; init; } = Array.Empty<string>();
    }
}

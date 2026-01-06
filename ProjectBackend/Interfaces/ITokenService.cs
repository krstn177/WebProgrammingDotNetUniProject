using ProjectBackend.Infrastructure.Models;

namespace ProjectBackend.Interfaces
{
    public interface ITokenService
    {
        string CreateToken(BankUser user);
    }
}

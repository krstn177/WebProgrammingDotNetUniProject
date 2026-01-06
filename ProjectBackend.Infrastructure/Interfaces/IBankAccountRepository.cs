using ProjectBackend.Infrastructure.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProjectBackend.Infrastructure.Interfaces
{
    public interface IBankAccountRepository
    {
        Task<BankAccount?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
        Task<BankAccount?> GetByIbanAsync(string iban, CancellationToken cancellationToken = default);
        Task<IEnumerable<BankAccount>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
        Task<IEnumerable<BankAccount>> GetAllAsync(CancellationToken cancellationToken = default);

        Task AddAsync(BankAccount account, CancellationToken cancellationToken = default);
        void Update(BankAccount account);
        void Remove(BankAccount account);

        Task<bool> SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}

using ProjectBackend.Infrastructure.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProjectBackend.Infrastructure.Interfaces
{
    public interface ITransactionRepository
    {
        Task<Transaction?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
        
        Task<IEnumerable<Transaction>> GetByAccountIdAsync(Guid accountId, CancellationToken cancellationToken = default);

        Task<IEnumerable<Transaction>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);

        Task<IEnumerable<Transaction>> GetAllAsync(CancellationToken cancellationToken = default);

        Task AddAsync(Transaction transaction, CancellationToken cancellationToken = default);
        void Update(Transaction transaction);
        void Remove(Transaction transaction);

        Task<bool> SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}

using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using ProjectBackend.Infrastructure.Models;

namespace ProjectBackend.Infrastructure.Interfaces
{
    public interface IDebitCardRepository
    {
        Task<DebitCard?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
        Task<DebitCard?> GetByCardNumberAsync(string cardNumber, CancellationToken cancellationToken = default);
        Task<IEnumerable<DebitCard>> GetByOwnerIdAsync(Guid ownerId, CancellationToken cancellationToken = default);
        Task<IEnumerable<DebitCard>> GetByBankAccountIdAsync(Guid bankAccountId, CancellationToken cancellationToken = default);
        Task<IEnumerable<DebitCard>> GetAllAsync(CancellationToken cancellationToken = default);

        Task AddAsync(DebitCard card, CancellationToken cancellationToken = default);
        void Update(DebitCard card);
        void Remove(DebitCard card);

        Task<bool> SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}
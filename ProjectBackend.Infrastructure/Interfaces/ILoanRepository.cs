using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using ProjectBackend.Infrastructure.Models;

namespace ProjectBackend.Infrastructure.Interfaces
{
    public interface ILoanRepository
    {
        Task<Loan?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

        Task<IEnumerable<Loan>> GetByBorrowerAccountIdAsync(Guid borrowerAccountId, CancellationToken cancellationToken = default);
        Task<IEnumerable<Loan>> GetByLenderAccountIdAsync(Guid lenderAccountId, CancellationToken cancellationToken = default);

        Task<IEnumerable<Loan>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);

        Task<IEnumerable<Loan>> GetAllAsync(CancellationToken cancellationToken = default);

        Task AddAsync(Loan loan, CancellationToken cancellationToken = default);
        void Update(Loan loan);
        void Remove(Loan loan);

        Task<bool> SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}
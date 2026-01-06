using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ProjectBackend.Infrastructure.Interfaces;
using ProjectBackend.Infrastructure.Models;

namespace ProjectBackend.Infrastructure.Repositories
{
    public class LoanRepository : ILoanRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly DbSet<Loan> _dbSet;

        public LoanRepository(ApplicationDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _dbSet = _context.Set<Loan>();
        }

        public async Task<Loan?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            return await _dbSet
                .Include(l => l.BankAccount)
                .Include(l => l.BankLenderAccount)
                .Include(l => l.InitialTransaction)
                .FirstOrDefaultAsync(l => l.Id == id, cancellationToken)
                .ConfigureAwait(false);
        }

        public async Task<IEnumerable<Loan>> GetByBorrowerAccountIdAsync(Guid borrowerAccountId, CancellationToken cancellationToken = default)
        {
            return await _dbSet
                .Include(l => l.BankLenderAccount)
                .Include(l => l.InitialTransaction)
                .Where(l => l.BorrowerAccountId == borrowerAccountId)
                .AsNoTracking()
                .ToListAsync(cancellationToken)
                .ConfigureAwait(false);
        }

        public async Task<IEnumerable<Loan>> GetByLenderAccountIdAsync(Guid lenderAccountId, CancellationToken cancellationToken = default)
        {
            return await _dbSet
                .Include(l => l.BankAccount)
                .Include(l => l.InitialTransaction)
                .Where(l => l.BankLenderAccountId == lenderAccountId)
                .AsNoTracking()
                .ToListAsync(cancellationToken)
                .ConfigureAwait(false);
        }

        public async Task<IEnumerable<Loan>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
        {
            return await _dbSet
                .Include(l => l.BankAccount)
                .Include(l => l.BankLenderAccount)
                .Include(l => l.InitialTransaction)
                .Where(l =>
                    (l.BankAccount != null && l.BankAccount.BankUserId == userId) ||
                    (l.BankLenderAccount != null && l.BankLenderAccount.BankUserId == userId))
                .AsNoTracking()
                .ToListAsync(cancellationToken)
                .ConfigureAwait(false);
        }

        public async Task<IEnumerable<Loan>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            return await _dbSet
                .Include(l => l.BankAccount)
                .Include(l => l.BankLenderAccount)
                .Include(l => l.InitialTransaction)
                .AsNoTracking()
                .ToListAsync(cancellationToken)
                .ConfigureAwait(false);
        }

        public async Task AddAsync(Loan loan, CancellationToken cancellationToken = default)
        {
            if (loan == null) throw new ArgumentNullException(nameof(loan));
            await _dbSet.AddAsync(loan, cancellationToken).ConfigureAwait(false);
        }

        public void Update(Loan loan)
        {
            if (loan == null) throw new ArgumentNullException(nameof(loan));
            _dbSet.Update(loan);
        }

        public void Remove(Loan loan)
        {
            if (loan == null) throw new ArgumentNullException(nameof(loan));
            _dbSet.Remove(loan);
        }

        public async Task<bool> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            var changes = await _context.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
            return changes > 0;
        }
    }
}
using Microsoft.EntityFrameworkCore;
using ProjectBackend.Infrastructure.Interfaces;
using ProjectBackend.Infrastructure.Models;

namespace ProjectBackend.Infrastructure.Repositories
{
    public class TransactionRepository : ITransactionRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly DbSet<Transaction> _dbSet;

        public TransactionRepository(ApplicationDbContext context)
        {
            _context = context;
            _dbSet = _context.Set<Transaction>();
        }

        public async Task<Transaction?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            return await _dbSet
                .Include(t => t.FromAccount)
                .Include(t => t.ToAccount)
                .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
        }

        public async Task<IEnumerable<Transaction>> GetByAccountIdAsync(Guid accountId, CancellationToken cancellationToken = default)
        {
            return await _dbSet
                .Include(t => t.FromAccount)
                .Include(t => t.ToAccount)
                .Where(t => t.FromAccountId == accountId || t.ToAccountId == accountId)
                .AsNoTracking()
                .ToListAsync(cancellationToken);
        }

        public async Task<IEnumerable<Transaction>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
        {
            return await _dbSet
                .Include(t => t.FromAccount)
                .Include(t => t.ToAccount)
                .Where(t =>
                    (t.FromAccount != null && t.FromAccount.BankUserId == userId) ||
                    (t.ToAccount != null && t.ToAccount.BankUserId == userId))
                .AsNoTracking()
                .ToListAsync(cancellationToken);
        }

        public async Task<IEnumerable<Transaction>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            return await _dbSet
                .Include(t => t.FromAccount)
                .Include(t => t.ToAccount)
                .AsNoTracking()
                .ToListAsync(cancellationToken);
        }

        public async Task AddAsync(Transaction transaction, CancellationToken cancellationToken = default)
        {
            if (transaction == null) throw new ArgumentNullException(nameof(transaction));
            await _dbSet.AddAsync(transaction, cancellationToken);
        }

        public void Update(Transaction transaction)
        {
            if (transaction == null) throw new ArgumentNullException(nameof(transaction));
            _dbSet.Update(transaction);
        }

        public void Remove(Transaction transaction)
        {
            if (transaction == null) throw new ArgumentNullException(nameof(transaction));
            _dbSet.Remove(transaction);
        }

        public async Task<bool> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            var changes = await _context.SaveChangesAsync(cancellationToken);
            return changes > 0;
        }
    }
}

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
    public class BankAccountRepository : IBankAccountRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly DbSet<BankAccount> _dbSet;

        public BankAccountRepository(ApplicationDbContext context)
        {
            _context = context;
            _dbSet = _context.Set<BankAccount>();
        }

        public async Task<BankAccount?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            return await _dbSet
                .Include(ba => ba.DebitCards)
                .Include(ba => ba.SentTransactions)
                .Include(ba => ba.ReceivedTransactions)
                .FirstOrDefaultAsync(ba => ba.Id == id, cancellationToken);
        }

        public async Task<BankAccount?> GetByIbanAsync(string iban, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(iban))
                return null;

            return await _dbSet
                .Include(ba => ba.DebitCards)
                .FirstOrDefaultAsync(ba => ba.IBAN == iban, cancellationToken);
        }

        public async Task<IEnumerable<BankAccount>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
        {
            return await _dbSet
                .Where(ba => ba.BankUserId == userId)
                .AsNoTracking()
                .ToListAsync(cancellationToken);
        }

        public async Task<IEnumerable<BankAccount>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            return await _dbSet
                .AsNoTracking()
                .ToListAsync(cancellationToken);
        }

        public async Task AddAsync(BankAccount account, CancellationToken cancellationToken = default)
        {
            if (account == null) throw new ArgumentNullException(nameof(account));
            await _dbSet.AddAsync(account, cancellationToken);
        }

        public void Update(BankAccount account)
        {
            if (account == null) throw new ArgumentNullException(nameof(account));
            _dbSet.Update(account);
        }

        public void Remove(BankAccount account)
        {
            if (account == null) throw new ArgumentNullException(nameof(account));
            _dbSet.Remove(account);
        }

        public async Task<bool> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            var changes = await _context.SaveChangesAsync(cancellationToken);
            return changes > 0;
        }
    }
}
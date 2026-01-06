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
    public class DebitCardRepository : IDebitCardRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly DbSet<DebitCard> _dbSet;

        public DebitCardRepository(ApplicationDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _dbSet = _context.Set<DebitCard>();
        }

        public async Task<DebitCard?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            return await _dbSet
                .Include(dc => dc.BankAccount)
                .Include(dc => dc.Owner)
                .FirstOrDefaultAsync(dc => dc.Id == id, cancellationToken)
                .ConfigureAwait(false);
        }

        public async Task<DebitCard?> GetByCardNumberAsync(string cardNumber, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(cardNumber))
                return null;

            return await _dbSet
                .Include(dc => dc.BankAccount)
                .Include(dc => dc.Owner)
                .FirstOrDefaultAsync(dc => dc.CardNumber == cardNumber, cancellationToken)
                .ConfigureAwait(false);
        }

        public async Task<IEnumerable<DebitCard>> GetByOwnerIdAsync(Guid ownerId, CancellationToken cancellationToken = default)
        {
            return await _dbSet
                .Where(dc => dc.OwnerId == ownerId)
                .Include(dc => dc.BankAccount)
                .AsNoTracking()
                .ToListAsync(cancellationToken)
                .ConfigureAwait(false);
        }

        public async Task<IEnumerable<DebitCard>> GetByBankAccountIdAsync(Guid bankAccountId, CancellationToken cancellationToken = default)
        {
            return await _dbSet
                .Where(dc => dc.BankAccountId == bankAccountId)
                .Include(dc => dc.Owner)
                .AsNoTracking()
                .ToListAsync(cancellationToken)
                .ConfigureAwait(false);
        }

        public async Task<IEnumerable<DebitCard>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            return await _dbSet
                .Include(dc => dc.BankAccount)
                .Include(dc => dc.Owner)
                .AsNoTracking()
                .ToListAsync(cancellationToken)
                .ConfigureAwait(false);
        }

        public async Task AddAsync(DebitCard card, CancellationToken cancellationToken = default)
        {
            if (card == null) throw new ArgumentNullException(nameof(card));
            await _dbSet.AddAsync(card, cancellationToken).ConfigureAwait(false);
        }

        public void Update(DebitCard card)
        {
            if (card == null) throw new ArgumentNullException(nameof(card));
            _dbSet.Update(card);
        }

        public void Remove(DebitCard card)
        {
            if (card == null) throw new ArgumentNullException(nameof(card));
            _dbSet.Remove(card);
        }

        public async Task<bool> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            var changes = await _context.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
            return changes > 0;
        }
    }
}
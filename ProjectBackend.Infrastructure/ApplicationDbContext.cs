using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using ProjectBackend.Infrastructure.Models;

namespace ProjectBackend.Infrastructure
{
    public class ApplicationDbContext : IdentityDbContext<BankUser, IdentityRole<Guid>, Guid>
    {
        public DbSet<BankAccount> BankAccounts { get; set; }
        public DbSet<DebitCard> DebitCards { get; set; }
        public DbSet<Transaction> Transactions { get; set; }
        public DbSet<Loan> Loans { get; set; }

        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Transaction>()
                .HasOne(t => t.FromAccount)
                .WithMany(a => a.SentTransactions)
                .HasForeignKey(t => t.FromAccountId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<Transaction>()
                .HasOne(t => t.ToAccount)
                .WithMany(a => a.ReceivedTransactions)
                .HasForeignKey(t => t.ToAccountId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<DebitCard>()
                .HasOne(dc => dc.BankAccount)
                .WithMany(ba => ba.DebitCards)
                .HasForeignKey(dc => dc.BankAccountId)
                .OnDelete(DeleteBehavior.NoAction);
            
            modelBuilder.Entity<DebitCard>()
                .HasOne(ow => ow.Owner)
                .WithMany(u => u.DebitCards)
                .HasForeignKey(ow => ow.OwnerId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<BankAccount>()
                .HasOne(ba => ba.BankUser)
                .WithMany(u => u.BankAccounts)
                .HasForeignKey(ba => ba.BankUserId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<Loan>()
                .HasOne(l => l.BankAccount)
                .WithMany()
                .HasForeignKey(l => l.BorrowerAccountId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<Loan>()
                .HasOne(l => l.BankLenderAccount)
                .WithMany()
                .HasForeignKey(l => l.BankLenderAccountId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<Loan>()
                .HasOne(l => l.InitialTransaction)
                .WithMany()
                .HasForeignKey(l => l.InitialTransactionId)
                .OnDelete(DeleteBehavior.NoAction);
        }
    }
}

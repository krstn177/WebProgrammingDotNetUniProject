using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProjectBackend.Infrastructure.Models
{
    public enum TransactionType
    {
        Deposit,
        Withdrawal,
        Transfer,
        Payment
    }
    public class Transaction : BaseEntity
    {
        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }
        public string Description { get; set; } = string.Empty;
        public TransactionType Type { get; set; }

        public Guid? FromAccountId { get; set; }
        public BankAccount? FromAccount { get; set; }

        public Guid? ToAccountId { get; set; }
        public BankAccount? ToAccount { get; set; }
    }
}

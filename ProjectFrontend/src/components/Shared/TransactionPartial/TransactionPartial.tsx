import styles from "./TransactionPartial.module.css";
import type { AdminListTransaction } from "../../../models/Transaction";

type Props = {
  transaction: AdminListTransaction;
};

const getTransactionType = (type: string | number): string => {
  const typeNum = typeof type === "string" ? parseInt(type) : type;
  switch (typeNum) {
    case 0:
      return "Deposit";
    case 1:
      return "Withdrawal";
    case 2:
      return "Transfer";
    case 3:
      return "Payment";
    default:
      return "Transaction";
  }
};

const getTransactionIcon = (type: string | number): string => {
  const typeNum = typeof type === "string" ? parseInt(type) : type;
  switch (typeNum) {
    case 0:
      return "fa-arrow-down";
    case 1:
      return "fa-arrow-up";
    case 2:
      return "fa-arrow-right-arrow-left";
    case 3:
      return "fa-credit-card";
    default:
      return "fa-exchange";
  }
};

const getTransactionClass = (type: string | number) => {
  const typeNum = typeof type === "string" ? parseInt(type) : type;
  switch (typeNum) {
    case 0:
      return styles.deposit;
    case 1:
      return styles.withdrawal;
    case 2:
      return styles.transfer;
    case 3:
      return styles.payment;
    default:
      return styles.generic;
  }
};

export default function TransactionPartial({ transaction }: Props) {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(Math.abs(amount));
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "Unknown date";
    const d = new Date(date);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(d);
  };

  const transactionType = getTransactionType(transaction.type);
  const transactionIcon = getTransactionIcon(transaction.type);
  const typeClass = getTransactionClass(transaction.type);

  return (
    <div className={`${styles.transaction} ${typeClass}`}>
      <div className={styles.iconContainer}>
        <i className={`fa-solid ${transactionIcon} ${styles.icon}`} aria-hidden="true"></i>
      </div>

      <div className={styles.content}>
        <div className={styles.header}>
          <h4 className={styles.type}>{transactionType}</h4>
          <span className={styles.amount}>{formatAmount(transaction.amount)}</span>
        </div>

        <p className={styles.description}>{transaction.description || "No description"}</p>

        <div className={styles.metadata}>
          <span className={styles.date}>
            <i className="fa-solid fa-calendar-days" aria-hidden="true"></i>
            {formatDate(transaction.createdAt)}
          </span>
        </div>

        <div className={styles.accounts}>
          {transaction.fromAccountId && (
            <div className={styles.accountInfo}>
              <span className={styles.label}>From:</span>
              <span className={styles.accountId}>{transaction.fromAccountId}</span>
            </div>
          )}
          {transaction.toAccountId && (
            <div className={styles.accountInfo}>
              <span className={styles.label}>To:</span>
              <span className={styles.accountId}>{transaction.toAccountId}</span>
            </div>
          )}
        </div>
      </div>

      <div className={styles.badge}>
        <span className={styles.id}>{transaction.id.slice(0, 8)}...</span>
      </div>
    </div>
  );
}
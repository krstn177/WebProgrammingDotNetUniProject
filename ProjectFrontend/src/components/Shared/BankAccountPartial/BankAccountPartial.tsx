import type { BankAccount } from "../../../models/BankAccount";
import styles from "./BankAccountPartial.module.css";

type Props = {
  account: BankAccount;
  onEdit?: (account: BankAccount) => void;
  onDelete?: (id: string) => void;
};

export default function BankAccountPartial({ account, onEdit, onDelete }: Props) {
  const formatBalance = (balance: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(balance);
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.accountInfo}>
          <h3 className={styles.accountNumber}>{account.accountNumber}</h3>
          <p className={styles.iban}>{account.iban}</p>
        </div>
        <div className={styles.balanceContainer}>
          <span className={styles.balanceLabel}>Balance</span>
          <span className={styles.balance}>{formatBalance(account.balance)}</span>
        </div>
      </div>

      <div className={styles.cardFooter}>
        <div className={styles.userId}>
          <span className={styles.userLabel}>User ID:</span>
          <span className={styles.userValue}>{account.bankUserId}</span>
        </div>
        <div className={styles.actions}>
          {onEdit && (
            <button
              onClick={() => onEdit(account)}
              className={`${styles.button} ${styles.editButton}`}
            >
              <svg className={styles.icon} viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(account.id)}
              className={`${styles.button} ${styles.deleteButton}`}
            >
              <svg className={styles.icon} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
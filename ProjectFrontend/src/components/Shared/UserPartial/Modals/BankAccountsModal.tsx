import { useEffect, useState } from "react";
import { getBankAccountsByUserId } from "../../../../services/bankAccountService";
import type { BankAccount } from "../../../../models/BankAccount";
import styles from "../UserPartial.module.css";
import { toast } from "react-toastify";

type Props = {
  userId: string;
  onClose: () => void;
};

export default function BankAccountsModal({ userId, onClose }: Props) {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAccounts();
  }, [userId]);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const response = await getBankAccountsByUserId(userId);
      if (response?.data) {
        setAccounts(response.data);
      }
    } catch (error) {
      toast.error("Failed to fetch bank accounts");
    } finally {
      setLoading(false);
    }
  };

  const formatBalance = (balance: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(balance);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Bank Accounts</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className={styles.modalContent}>
          {loading ? (
            <div className={styles.centered}>
              <i className="fa-solid fa-circle-notch fa-spin"></i>
              <p>Loading bank accounts...</p>
            </div>
          ) : accounts.length === 0 ? (
            <div className={styles.centered}>
              <i className="fa-solid fa-inbox"></i>
              <p>No bank accounts found</p>
            </div>
          ) : (
            <div className={styles.accountsList}>
              {accounts.map((account) => (
                <div key={account.id} className={styles.accountItem}>
                  <div className={styles.accountHeader}>
                    <h4>{account.accountNumber}</h4>
                    <span className={styles.balance}>{formatBalance(account.balance)}</span>
                  </div>
                  <p className={styles.accountDetail}>IBAN: {account.iban}</p>
                  <p className={styles.accountDetail}>ID: {account.bankUserId}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
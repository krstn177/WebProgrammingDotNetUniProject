import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getBankAccountsForCurrentUser, createBankAccountForMe } from "../../../services/bankAccountService";
import type { BankAccount } from "../../../models/BankAccount";
import BankAccountPartial from "../../Shared/BankAccountPartial/BankAccountPartial";
import styles from "./Dashboard.module.css";
import { toast } from "react-toastify";

export default function Dashboard() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const response = await getBankAccountsForCurrentUser();
      if (response?.data) {
        setAccounts(response.data);
      }
    } catch (error) {
      toast.error("Failed to fetch your bank accounts");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to create a new bank account? This action cannot be undone."
    );

    if (!confirmed) return;

    setCreating(true);
    try {
      const response = await createBankAccountForMe();
      if (response?.data) {
        toast.success("Bank account created successfully!");
        await fetchAccounts();
      }
    } catch (error) {
      toast.error("Failed to create bank account");
    } finally {
      setCreating(false);
    }
  };

  const handleAccountClick = (accountId: string) => {
    navigate(`/account/${accountId}`);
  };

  const calculateTotalBalance = () => {
    return accounts.reduce((sum, account) => sum + account.balance, 0);
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const totalBalance = calculateTotalBalance();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>Welcome back! Here's your financial overview</p>
        </div>
        <button
          onClick={() => fetchAccounts()}
          className={styles.refreshButton}
          disabled={loading}
        >
          <i className={`fa-solid fa-arrows-rotate ${styles.icon}`} aria-hidden="true"></i>
          Refresh
        </button>
      </div>

      <div className={styles.balanceCard}>
        <div className={styles.balanceContent}>
          <p className={styles.balanceLabel}>Total Balance</p>
          <h2 className={styles.balanceAmount}>{formatAmount(totalBalance)}</h2>
          <p className={styles.balanceSubtitle}>Across {accounts.length} account{accounts.length !== 1 ? 's' : ''}</p>
        </div>
        <div className={styles.balanceIcon}>
          <i className="fa-solid fa-wallet" aria-hidden="true"></i>
        </div>
      </div>

      <div className={styles.accountsSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>My Bank Accounts</h2>
          <button
            onClick={handleCreateAccount}
            className={styles.createButton}
            disabled={creating}
          >
            <i className="fa-solid fa-plus" aria-hidden="true"></i>
            {creating ? "Creating..." : "New Account"}
          </button>
        </div>

        {loading ? (
          <div className={styles.loading}>
            <i className={`fa-solid fa-circle-notch fa-spin ${styles.spinnerIcon}`} aria-hidden="true"></i>
            <p>Loading your accounts...</p>
          </div>
        ) : accounts.length === 0 ? (
          <div className={styles.empty}>
            <i className={`fa-solid fa-inbox ${styles.emptyIcon}`} aria-hidden="true"></i>
            <h3>No bank accounts yet</h3>
            <p>Create your first bank account to get started</p>
            <button
              onClick={handleCreateAccount}
              className={styles.emptyCreateButton}
              disabled={creating}
            >
              <i className="fa-solid fa-plus" aria-hidden="true"></i>
              {creating ? "Creating..." : "Create Account"}
            </button>
          </div>
        ) : (
          <div className={styles.accountsGrid}>
            {accounts.map((account) => (
              <div
                key={account.id}
                className={styles.accountWrapper}
                onClick={() => handleAccountClick(account.id)}
              >
                <BankAccountPartial account={account} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllBankAccounts, deleteBankAccount } from "../../../../services/bankAccountService";
import type { BankAccount } from "../../../../models/BankAccount";
import BankAccountPartial from "../../../Shared/BankAccountPartial/BankAccountPartial";
import styles from "./ListBankAccounts.module.css";
import { toast } from "react-toastify";

type SortOption = "accountNumber" | "balance" | "iban";
type SortOrder = "asc" | "desc";

export default function ListBankAccounts() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>("accountNumber");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    handleSort();
  }, [accounts, sortBy, sortOrder, searchTerm]);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const response = await getAllBankAccounts();
      if (response?.data) {
        setAccounts(response.data);
      }
    } catch (error) {
      toast.error("Failed to fetch bank accounts");
    } finally {
      setLoading(false);
    }
  };

  const handleSort = () => {
    let sorted = [...accounts];

    if (searchTerm) {
      sorted = sorted.filter(
        (account) =>
          account.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          account.iban.toLowerCase().includes(searchTerm.toLowerCase()) ||
          account.bankUserId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    sorted.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "balance") {
        comparison = parseFloat(a.balance) - parseFloat(b.balance);
      } else {
        comparison = a[sortBy].localeCompare(b[sortBy]);
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    setFilteredAccounts(sorted);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this bank account?")) {
      try {
        await deleteBankAccount(id);
        toast.success("Bank account deleted successfully");
        fetchAccounts();
      } catch (error) {
        toast.error("Failed to delete bank account");
      }
    }
  };

  const handleEdit = (account: BankAccount) => {
    navigate(`/admin/bank-accounts/edit/${account.id}`, { state: { account } });
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Bank Accounts</h1>
          <p className={styles.subtitle}>Manage all bank accounts in the system</p>
        </div>
        <button
          onClick={() => navigate("/admin/bank-accounts/create")}
          className={styles.createButton}
        >
          <i className={`fa-solid fa-plus ${styles.icon}`} aria-hidden="true"></i>
          Create Account
        </button>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchContainer}>
          <i className={`fa-solid fa-magnifying-glass ${styles.searchIcon}`} aria-hidden="true"></i>
          <input
            type="text"
            placeholder="Search by account number, IBAN, or user ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.sortControls}>
          <label className={styles.sortLabel}>Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className={styles.sortSelect}
          >
            <option value="accountNumber">Account Number</option>
            <option value="iban">IBAN</option>
            <option value="balance">Balance</option>
          </select>
          <button onClick={toggleSortOrder} className={styles.sortOrderButton}>
            {sortOrder === "asc" ? (
              <i className={`fa-solid fa-arrow-up-wide-short ${styles.sortIcon}`} aria-hidden="true"></i>
            ) : (
              <i className={`fa-solid fa-arrow-down-wide-short ${styles.sortIcon}`} aria-hidden="true"></i>
            )}
          </button>
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>
          <i className={`fa-solid fa-circle-notch fa-spin ${styles.spinnerIcon}`} aria-hidden="true"></i>
          <p>Loading bank accounts...</p>
        </div>
      ) : filteredAccounts.length === 0 ? (
        <div className={styles.empty}>
          <i className={`fa-solid fa-wallet ${styles.emptyIcon}`} aria-hidden="true"></i>
          <h3>No bank accounts found</h3>
          <p>
            {searchTerm
              ? "Try adjusting your search criteria"
              : "Get started by creating a new bank account"}
          </p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredAccounts.map((account) => (
            <BankAccountPartial
              key={account.id}
              account={account}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <div className={styles.footer}>
        <p className={styles.resultsCount}>
          Showing {filteredAccounts.length} of {accounts.length} accounts
        </p>
      </div>
    </div>
  );
}
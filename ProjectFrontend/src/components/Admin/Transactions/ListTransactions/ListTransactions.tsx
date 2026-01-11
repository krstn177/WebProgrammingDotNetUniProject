import { useEffect, useState } from "react";
import { getAllTransactions } from "../../../../services/transactionService";
import type { AdminListTransaction } from "../../../../models/Transaction";
import TransactionPartial from "../../../Shared/TransactionPartial/TransactionPartial";
import styles from "./ListTransactions.module.css";
import { toast } from "react-toastify";

type SortOption = "type" | "amount" | "description" | "date";
type SortOrder = "asc" | "desc";

export default function ListTransactions() {
  const [transactions, setTransactions] = useState<AdminListTransaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<AdminListTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    handleSort();
  }, [transactions, sortBy, sortOrder, searchTerm, typeFilter]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await getAllTransactions();
      if (response?.data) {
        setTransactions(response.data);
      }
    } catch (error) {
      toast.error("Failed to fetch transactions");
    } finally {
      setLoading(false);
    }
  };

  const handleSort = () => {
    let sorted = [...transactions];

    // Filter by type
    if (typeFilter !== "all") {
      sorted = sorted.filter((transaction) => String(transaction.type) === typeFilter);
    }

    // Filter by search term
    if (searchTerm) {
      sorted = sorted.filter(
        (transaction) =>
          transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaction.fromAccountId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaction.toAccountId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    sorted.sort((a, b) => {
      let comparison = 0;

      if (sortBy === "amount") {
        comparison = a.amount - b.amount;
      } else if (sortBy === "type") {
        comparison = String(a.type).localeCompare(String(b.type));
      } else if (sortBy === "description") {
        comparison = a.description.localeCompare(b.description);
      } else if (sortBy === "date") {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        comparison = dateA - dateB;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    setFilteredTransactions(sorted);
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const calculateTotals = () => {
    const deposit = transactions
      .filter((t) => String(t.type) === "0")
      .reduce((sum, t) => sum + t.amount, 0);

    const withdrawal = transactions
      .filter((t) => String(t.type) === "1")
      .reduce((sum, t) => sum + t.amount, 0);

    const transfer = transactions
      .filter((t) => String(t.type) === "2")
      .reduce((sum, t) => sum + t.amount, 0);

    const payment = transactions
      .filter((t) => String(t.type) === "3")
      .reduce((sum, t) => sum + t.amount, 0);

    return { deposit, withdrawal, transfer, payment };
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const totals = calculateTotals();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Transactions</h1>
          <p className={styles.subtitle}>View and manage all system transactions</p>
        </div>
        <button
          onClick={() => fetchTransactions()}
          className={styles.refreshButton}
        >
          <i className={`fa-solid fa-arrows-rotate ${styles.icon}`} aria-hidden="true"></i>
          Refresh
        </button>
      </div>

      <div className={styles.stats}>
        <div className={`${styles.statCard} ${styles.depositCard}`}>
          <div className={styles.statIcon}>
            <i className="fa-solid fa-arrow-down" aria-hidden="true"></i>
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Deposits</p>
            <p className={styles.statValue}>{formatAmount(totals.deposit)}</p>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.withdrawalCard}`}>
          <div className={styles.statIcon}>
            <i className="fa-solid fa-arrow-up" aria-hidden="true"></i>
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Withdrawals</p>
            <p className={styles.statValue}>{formatAmount(totals.withdrawal)}</p>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.transferCard}`}>
          <div className={styles.statIcon}>
            <i className="fa-solid fa-arrow-right-arrow-left" aria-hidden="true"></i>
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Transfers</p>
            <p className={styles.statValue}>{formatAmount(totals.transfer)}</p>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.paymentCard}`}>
          <div className={styles.statIcon}>
            <i className="fa-solid fa-credit-card" aria-hidden="true"></i>
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Payments</p>
            <p className={styles.statValue}>{formatAmount(totals.payment)}</p>
          </div>
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchContainer}>
          <i className={`fa-solid fa-magnifying-glass ${styles.searchIcon}`} aria-hidden="true"></i>
          <input
            type="text"
            placeholder="Search by description, ID, or account..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterControls}>
          <label className={styles.filterLabel}>Type:</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Types</option>
            <option value="0">Deposit</option>
            <option value="1">Withdrawal</option>
            <option value="2">Transfer</option>
            <option value="3">Payment</option>
          </select>

          <label className={styles.filterLabel}>Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className={styles.filterSelect}
          >
            <option value="date">Date</option>
            <option value="type">Type</option>
            <option value="amount">Amount</option>
            <option value="description">Description</option>
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
          <p>Loading transactions...</p>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className={styles.empty}>
          <i className={`fa-solid fa-inbox ${styles.emptyIcon}`} aria-hidden="true"></i>
          <h3>No transactions found</h3>
          <p>
            {searchTerm || typeFilter !== "all"
              ? "Try adjusting your search or filter criteria"
              : "No transactions in the system yet"}
          </p>
        </div>
      ) : (
        <div className={styles.transactionsList}>
          {filteredTransactions.map((transaction) => (
            <TransactionPartial key={transaction.id} transaction={transaction} />
          ))}
        </div>
      )}

      <div className={styles.footer}>
        <p className={styles.resultsCount}>
          Showing {filteredTransactions.length} of {transactions.length} transactions
        </p>
      </div>
    </div>
  );
}
import { useEffect, useState } from "react";
import { getTransactionsByUserId } from "../../../../services/transactionService";
import type { AdminListTransaction } from "../../../../models/Transaction";
import TransactionPartial from "../../TransactionPartial/TransactionPartial";
import styles from "../UserPartial.module.css";
import { toast } from "react-toastify";

type Props = {
  userId: string;
  onClose: () => void;
};

type SortOption = "date" | "amount" | "type";
type SortOrder = "asc" | "desc";

export default function TransactionsModal({ userId, onClose }: Props) {
  const [transactions, setTransactions] = useState<AdminListTransaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<AdminListTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  useEffect(() => {
    fetchTransactions();
  }, [userId]);

  useEffect(() => {
    handleSort();
  }, [transactions, sortBy, sortOrder, searchTerm]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await getTransactionsByUserId(userId);
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

    // Filter by search term
    if (searchTerm) {
      sorted = sorted.filter(
        (transaction) =>
          transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaction.type.toString().includes(searchTerm)
      );
    }

    // Sort
    sorted.sort((a, b) => {
      let comparison = 0;

      if (sortBy === "amount") {
        comparison = a.amount - b.amount;
      } else if (sortBy === "type") {
        comparison = String(a.type).localeCompare(String(b.type));
      } else if (sortBy === "date") {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        comparison = dateA - dateB;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    setFilteredTransactions(sorted);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Transactions</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className={styles.transactionControls}>
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.transactionSearchInput}
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className={styles.transactionSelect}
          >
            <option value="date">Date</option>
            <option value="amount">Amount</option>
            <option value="type">Type</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className={styles.transactionSortButton}
          >
            {sortOrder === "asc" ? (
              <i className="fa-solid fa-arrow-up"></i>
            ) : (
              <i className="fa-solid fa-arrow-down"></i>
            )}
          </button>
        </div>

        <div className={styles.modalContent}>
          {loading ? (
            <div className={styles.centered}>
              <i className="fa-solid fa-circle-notch fa-spin"></i>
              <p>Loading transactions...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className={styles.centered}>
              <i className="fa-solid fa-inbox"></i>
              <p>No transactions found</p>
            </div>
          ) : (
            <div className={styles.transactionsList}>
              {filteredTransactions.map((transaction) => (
                <TransactionPartial key={transaction.id} transaction={transaction} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
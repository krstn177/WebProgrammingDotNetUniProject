import { useEffect, useState } from "react";
import { getLoansByUserId } from "../../../../services/loanService";
import type { Loan } from "../../../../models/Loan";
import LoanPartial from "../../LoanPartial/LoanPartial";
import styles from "../UserPartial.module.css";
import { toast } from "react-toastify";

type Props = {
  userId: string;
  onClose: () => void;
};

type StatusFilter = "all" | "0" | "1" | "2";

export default function LoansModal({ userId, onClose }: Props) {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [filteredLoans, setFilteredLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  useEffect(() => {
    fetchLoans();
  }, [userId]);

  useEffect(() => {
    handleFilter();
  }, [loans, statusFilter]);

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const response = await getLoansByUserId(userId);
      if (response?.data) {
        setLoans(response.data);
      }
    } catch (error) {
      toast.error("Failed to fetch loans");
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    let filtered = [...loans];

    if (statusFilter !== "all") {
      filtered = filtered.filter((loan) => String(loan.status) === statusFilter);
    }

    setFilteredLoans(filtered);
  };

  const calculateTotals = () => {
    const totalPrincipal = loans.reduce((sum, loan) => sum + loan.principal, 0);
    const totalRemaining = loans.reduce((sum, loan) => sum + loan.remainingAmount, 0);
    const activeLoans = loans.filter((loan) => String(loan.status) === "0").length;

    return { totalPrincipal, totalRemaining, activeLoans };
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const totals = calculateTotals();

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={`${styles.modal} ${styles.loanModal}`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Loans</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className={styles.loanStats}>
          <div className={styles.loanStatItem}>
            <span className={styles.loanStatLabel}>Total Borrowed</span>
            <span className={styles.loanStatValue}>{formatAmount(totals.totalPrincipal)}</span>
          </div>
          <div className={styles.loanStatItem}>
            <span className={styles.loanStatLabel}>Total Remaining</span>
            <span className={styles.loanStatValue}>{formatAmount(totals.totalRemaining)}</span>
          </div>
          <div className={styles.loanStatItem}>
            <span className={styles.loanStatLabel}>Active Loans</span>
            <span className={styles.loanStatValue}>{totals.activeLoans}</span>
          </div>
        </div>

        <div className={styles.loanControls}>
          <label className={styles.loanFilterLabel}>Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className={styles.loanFilterSelect}
          >
            <option value="all">All Status</option>
            <option value="0">Active</option>
            <option value="1">Paid Off</option>
            <option value="2">Defaulted</option>
          </select>
        </div>

        <div className={styles.modalContent}>
          {loading ? (
            <div className={styles.centered}>
              <i className="fa-solid fa-circle-notch fa-spin"></i>
              <p>Loading loans...</p>
            </div>
          ) : filteredLoans.length === 0 ? (
            <div className={styles.centered}>
              <i className="fa-solid fa-inbox"></i>
              <p>No loans found</p>
            </div>
          ) : (
            <div className={styles.loansList}>
              {filteredLoans.map((loan) => (
                <LoanPartial key={loan.id} loan={loan} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
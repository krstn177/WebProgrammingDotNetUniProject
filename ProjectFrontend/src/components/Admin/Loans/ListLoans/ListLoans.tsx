import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllLoans } from "../../../../services/loanService";
import type { Loan } from "../../../../models/Loan";
import LoanPartial from "../../../Shared/LoanPartial/LoanPartial";
import styles from "./ListLoans.module.css";
import { toast } from "react-toastify";

type SortOption = "principal" | "remainingAmount" | "interestRate" | "status";
type SortOrder = "asc" | "desc";
type StatusFilter = "all" | "0" | "1" | "2";

export default function ListLoans() {
  const navigate = useNavigate();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [filteredLoans, setFilteredLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>("status");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  useEffect(() => {
    fetchLoans();
  }, []);

  useEffect(() => {
    handleSort();
  }, [loans, sortBy, sortOrder, searchTerm, statusFilter]);

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const response = await getAllLoans();
      if (response?.data) {
        setLoans(response.data);
      }
    } catch (error) {
      toast.error("Failed to fetch loans");
    } finally {
      setLoading(false);
    }
  };

  const handleSort = () => {
    let sorted = [...loans];

    // Filter by status
    if (statusFilter !== "all") {
      sorted = sorted.filter((loan) => String(loan.status) === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      sorted = sorted.filter(
        (loan) =>
          loan.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          loan.borrowerAccountId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          loan.bankLenderAccountId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    sorted.sort((a, b) => {
      let comparison = 0;

      if (sortBy === "principal" || sortBy === "remainingAmount" || sortBy === "interestRate") {
        comparison = a[sortBy] - b[sortBy];
      } else if (sortBy === "status") {
        comparison = String(a.status).localeCompare(String(b.status));
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    setFilteredLoans(sorted);
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const calculateStatistics = () => {
    const activeLoans = loans.filter((loan) => String(loan.status) === "0");
    const paidOffLoans = loans.filter((loan) => String(loan.status) === "1");
    const defaultedLoans = loans.filter((loan) => String(loan.status) === "2");

    const totalPrincipal = loans.reduce((sum, loan) => sum + loan.principal, 0);
    const totalRemaining = loans.reduce((sum, loan) => sum + loan.remainingAmount, 0);
    const totalPaid = totalPrincipal - totalRemaining;

    const averageInterestRate = loans.length > 0
      ? loans.reduce((sum, loan) => sum + loan.interestRate, 0) / loans.length
      : 0;

    return {
      activeCount: activeLoans.length,
      paidOffCount: paidOffLoans.length,
      defaultedCount: defaultedLoans.length,
      totalPrincipal,
      totalRemaining,
      totalPaid,
      averageInterestRate,
    };
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const stats = calculateStatistics();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Loans</h1>
          <p className={styles.subtitle}>Manage all system loans</p>
        </div>
        <button
          onClick={() => fetchLoans()}
          className={styles.refreshButton}
        >
          <i className={`fa-solid fa-arrows-rotate ${styles.icon}`} aria-hidden="true"></i>
          Refresh
        </button>
      </div>

      <div className={styles.stats}>
        <div className={`${styles.statCard} ${styles.activeCard}`}>
          <div className={styles.statIcon}>
            <i className="fa-solid fa-circle-check" aria-hidden="true"></i>
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Active Loans</p>
            <p className={styles.statValue}>{stats.activeCount}</p>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.paidOffCard}`}>
          <div className={styles.statIcon}>
            <i className="fa-solid fa-circle-check" aria-hidden="true"></i>
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Paid Off</p>
            <p className={styles.statValue}>{stats.paidOffCount}</p>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.defaultedCard}`}>
          <div className={styles.statIcon}>
            <i className="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Defaulted</p>
            <p className={styles.statValue}>{stats.defaultedCount}</p>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.principalCard}`}>
          <div className={styles.statIcon}>
            <i className="fa-solid fa-money-bill-trend-up" aria-hidden="true"></i>
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Total Principal</p>
            <p className={styles.statValue}>{formatAmount(stats.totalPrincipal)}</p>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.remainingCard}`}>
          <div className={styles.statIcon}>
            <i className="fa-solid fa-hourglass-half" aria-hidden="true"></i>
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Total Remaining</p>
            <p className={styles.statValue}>{formatAmount(stats.totalRemaining)}</p>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.paidCard}`}>
          <div className={styles.statIcon}>
            <i className="fa-solid fa-money-bill-transfer" aria-hidden="true"></i>
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Total Paid</p>
            <p className={styles.statValue}>{formatAmount(stats.totalPaid)}</p>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.rateCard}`}>
          <div className={styles.statIcon}>
            <i className="fa-solid fa-percent" aria-hidden="true"></i>
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Avg Interest</p>
            <p className={styles.statValue}>{stats.averageInterestRate.toFixed(2)}%</p>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.totalCard}`}>
          <div className={styles.statIcon}>
            <i className="fa-solid fa-handshake" aria-hidden="true"></i>
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Total Loans</p>
            <p className={styles.statValue}>{loans.length}</p>
          </div>
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchContainer}>
          <i className={`fa-solid fa-magnifying-glass ${styles.searchIcon}`} aria-hidden="true"></i>
          <input
            type="text"
            placeholder="Search by ID or account..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterControls}>
          <label className={styles.filterLabel}>Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className={styles.filterSelect}
          >
            <option value="all">All Status</option>
            <option value="0">Active</option>
            <option value="1">Paid Off</option>
            <option value="2">Defaulted</option>
          </select>

          <label className={styles.filterLabel}>Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className={styles.filterSelect}
          >
            <option value="status">Status</option>
            <option value="principal">Principal</option>
            <option value="remainingAmount">Remaining</option>
            <option value="interestRate">Interest Rate</option>
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
          <p>Loading loans...</p>
        </div>
      ) : filteredLoans.length === 0 ? (
        <div className={styles.empty}>
          <i className={`fa-solid fa-inbox ${styles.emptyIcon}`} aria-hidden="true"></i>
          <h3>No loans found</h3>
          <p>
            {searchTerm || statusFilter !== "all"
              ? "Try adjusting your search or filter criteria"
              : "No loans in the system yet"}
          </p>
        </div>
      ) : (
        <div className={styles.loansList}>
          {filteredLoans.map((loan) => (
            <LoanPartial key={loan.id} loan={loan} />
          ))}
        </div>
      )}

      <div className={styles.footer}>
        <p className={styles.resultsCount}>
          Showing {filteredLoans.length} of {loans.length} loans
        </p>
      </div>
    </div>
  );
}
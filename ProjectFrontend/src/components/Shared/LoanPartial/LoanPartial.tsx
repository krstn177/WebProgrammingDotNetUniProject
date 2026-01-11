import { useMemo } from "react";
import styles from "./LoanPartial.module.css";
import type { Loan } from "../../../models/Loan";

type Props = {
  loan: Loan;
};

const getLoanStatus = (status: string | number): string => {
  const statusNum = typeof status === "string" ? parseInt(status) : status;
  switch (statusNum) {
    case 0:
      return "Active";
    case 1:
      return "Paid Off";
    case 2:
      return "Defaulted";
    default:
      return "Unknown";
  }
};

const getStatusClass = (status: string | number) => {
  const statusNum = typeof status === "string" ? parseInt(status) : status;
  switch (statusNum) {
    case 0:
      return styles.active;
    case 1:
      return styles.paidOff;
    case 2:
      return styles.defaulted;
    default:
      return styles.unknown;
  }
};

export default function LoanPartial({ loan }: Props) {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const progressPercentage = useMemo(() => {
    const paid = loan.principal - loan.remainingAmount;
    return (paid / loan.principal) * 100;
  }, [loan.principal, loan.remainingAmount]);

  const monthlyPayment = useMemo(() => {
    const monthlyRate = loan.interestRate / 100 / 12;
    const payment = 
      loan.principal * 
      (monthlyRate * Math.pow(1 + monthlyRate, loan.termInMonths)) / 
      (Math.pow(1 + monthlyRate, loan.termInMonths) - 1);
    return payment;
  }, [loan.principal, loan.interestRate, loan.termInMonths]);

  const statusText = getLoanStatus(loan.status);
  const statusClass = getStatusClass(loan.status);

  return (
    <div className={`${styles.loan} ${statusClass}`}>
      <div className={styles.header}>
        <div className={styles.loanInfo}>
          <h3 className={styles.loanId}>Loan #{loan.id.slice(0, 8)}...</h3>
          <span className={`${styles.statusBadge} ${statusClass}`}>{statusText}</span>
        </div>
        <div className={styles.principalAmount}>
          {formatAmount(loan.principal)}
        </div>
      </div>

      <div className={styles.progressSection}>
        <div className={styles.progressLabels}>
          <span className={styles.progressLabel}>Remaining</span>
          <span className={styles.progressAmount}>{formatAmount(loan.remainingAmount)}</span>
        </div>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill} 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <div className={styles.progressPercentage}>
          {progressPercentage.toFixed(1)}% paid
        </div>
      </div>

      <div className={styles.details}>
        <div className={styles.detailRow}>
          <div className={styles.detailItem}>
            <i className="fa-solid fa-percent" aria-hidden="true"></i>
            <div>
              <span className={styles.detailLabel}>Interest Rate</span>
              <span className={styles.detailValue}>{loan.interestRate}%</span>
            </div>
          </div>
          <div className={styles.detailItem}>
            <i className="fa-solid fa-calendar" aria-hidden="true"></i>
            <div>
              <span className={styles.detailLabel}>Term</span>
              <span className={styles.detailValue}>{loan.termInMonths} months</span>
            </div>
          </div>
        </div>

        <div className={styles.detailRow}>
          <div className={styles.detailItem}>
            <i className="fa-solid fa-money-bill-wave" aria-hidden="true"></i>
            <div>
              <span className={styles.detailLabel}>Monthly Payment</span>
              <span className={styles.detailValue}>{formatAmount(monthlyPayment)}</span>
            </div>
          </div>
          <div className={styles.detailItem}>
            <i className="fa-solid fa-clock" aria-hidden="true"></i>
            <div>
              <span className={styles.detailLabel}>Start Date</span>
              <span className={styles.detailValue}>{formatDate(loan.startDate)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.accounts}>
        <div className={styles.accountInfo}>
          <span className={styles.accountLabel}>Borrower Account</span>
          <span className={styles.accountId}>{loan.borrowerAccountId}</span>
        </div>
        <div className={styles.accountInfo}>
          <span className={styles.accountLabel}>Lender Account</span>
          <span className={styles.accountId}>{loan.bankLenderAccountId}</span>
        </div>
      </div>
    </div>
  );
}
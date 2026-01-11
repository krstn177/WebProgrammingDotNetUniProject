import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBankAccountForUserById } from "../../../services/bankAccountService";
import { getLoansByAccountId } from "../../../services/loanService";
import { getTransactionsByAccountId } from "../../../services/transactionService";
import { getCardsByAccountId } from "../../../services/debitCardService";
import type { BankAccount } from "../../../models/BankAccount";
import type { Loan } from "../../../models/Loan";
import type { AdminListTransaction } from "../../../models/Transaction";
import type { DebitCard } from "../../../models/DebitCard";
import LoanPartial from "../../Shared/LoanPartial/LoanPartial";
import TransactionPartial from "../../Shared/TransactionPartial/TransactionPartial";
import DebitCardPartial from "../../Shared/DebitCardPartial/DebitCardPartial";
import CreateATransferModal from "../CreateATransferModal/CreateATransferModal";
import DepositWithdrawalModal from "../DepositWithdrawalModal/DepositWithdrawalModal";
import RequestLoanModal from "../RequestLoanModal/RequestLoanModal";
import PayLoanModal from "../PayLoanModal/PayLoanModal";
import CreateACardModal from "../CreateACardModal/CreateACardModal";
import styles from "./BankAccountOverview.module.css";
import { toast } from "react-toastify";

type TabType = "cards" | "transactions" | "loans";
type TransactionModalType = "deposit" | "withdrawal" | null;

export default function BankAccountOverview() {
  const { id: accountId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [account, setAccount] = useState<BankAccount | null>(null);
  const [cards, setCards] = useState<DebitCard[]>([]);
  const [transactions, setTransactions] = useState<AdminListTransaction[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("cards");
  const [loading, setLoading] = useState(true);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transactionModalType, setTransactionModalType] = useState<TransactionModalType>(null);
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);
  const [isCreateCardModalOpen, setIsCreateCardModalOpen] = useState(false);

  useEffect(() => {
    if (accountId) {
      fetchAccountData();
    }
  }, [accountId]);

  const fetchAccountData = async () => {
    setLoading(true);
    try {
      const [accountRes, cardsRes, transactionsRes, loansRes] = await Promise.all([
        getBankAccountForUserById(accountId!),
        getCardsByAccountId(accountId!),
        getTransactionsByAccountId(accountId!),
        getLoansByAccountId(accountId!),
      ]);

      if (accountRes?.data) setAccount(accountRes.data);
      if (cardsRes?.data) setCards(cardsRes.data);
      if (transactionsRes?.data) {
        const sorted = [...transactionsRes.data].sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        });
        setTransactions(sorted);
      }
      if (loansRes?.data) setLoans(loansRes.data);
    } catch (error) {
      toast.error("Failed to fetch account data");
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: string | number) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(num);
  };

  const handleTransactionSuccess = () => {
    fetchAccountData();
  };

  const handleLoanSuccess = () => {
    fetchAccountData();
  };

  const isLoanActive = (loan: Loan) => {
    const status = String(loan.status).toLowerCase();
    console.log(loan.principal);
    console.log(status);
    return status === "0" && loan.remainingAmount > 0;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <i className={`fa-solid fa-circle-notch fa-spin ${styles.spinnerIcon}`} aria-hidden="true"></i>
          <p>Loading account details...</p>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <i className={`fa-solid fa-exclamation-circle ${styles.errorIcon}`} aria-hidden="true"></i>
          <h3>Account not found</h3>
          <button onClick={() => navigate("/dashboard")} className={styles.backButton}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <button onClick={() => navigate("/dashboard")} className={styles.backButton}>
            <i className="fa-solid fa-arrow-left" aria-hidden="true"></i>
            Back
          </button>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>{account.accountNumber}</h1>
            <p className={styles.subtitle}>{account.iban}</p>
          </div>
        </div>
        <div className={styles.balanceSection}>
          <p className={styles.balanceLabel}>Current Balance</p>
          <h2 className={styles.balance}>{formatAmount(account.balance)}</h2>
        </div>
      </div>

      <div className={styles.tabsContainer}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === "cards" ? styles.active : ""}`}
            onClick={() => setActiveTab("cards")}
          >
            <i className="fa-solid fa-credit-card" aria-hidden="true"></i>
            Cards ({cards.length})
          </button>
          <button
            className={`${styles.tab} ${activeTab === "transactions" ? styles.active : ""}`}
            onClick={() => setActiveTab("transactions")}
          >
            <i className="fa-solid fa-receipt" aria-hidden="true"></i>
            Transactions ({transactions.length})
          </button>
          <button
            className={`${styles.tab} ${activeTab === "loans" ? styles.active : ""}`}
            onClick={() => setActiveTab("loans")}
          >
            <i className="fa-solid fa-handshake" aria-hidden="true"></i>
            Loans ({loans.length})
          </button>
        </div>
      </div>

      <div className={styles.content}>
        {/* Cards Tab */}
        {activeTab === "cards" && (
          <div className={styles.tabContent}>
            {cards.length > 0 && (
              <div className={styles.actionButtons}>
                <button
                  onClick={() => setTransactionModalType("deposit")}
                  className={`${styles.actionButton} ${styles.depositButton}`}
                >
                  <i className="fa-solid fa-arrow-down" aria-hidden="true"></i>
                  <span>Deposit</span>
                </button>
                <button
                  onClick={() => setTransactionModalType("withdrawal")}
                  className={`${styles.actionButton} ${styles.withdrawalButton}`}
                >
                  <i className="fa-solid fa-arrow-up" aria-hidden="true"></i>
                  <span>Withdrawal</span>
                </button>
                <button
                  onClick={() => setIsTransferModalOpen(true)}
                  className={`${styles.actionButton} ${styles.transferButton}`}
                >
                  <i className="fa-solid fa-arrow-right-arrow-left" aria-hidden="true"></i>
                  <span>Transfer</span>
                </button>
              </div>
            )}

            {cards.length === 0 ? (
              <div className={styles.empty}>
                <i className={`fa-solid fa-inbox ${styles.emptyIcon}`} aria-hidden="true"></i>
                <h3>No cards yet</h3>
                <p>You don't have any debit cards for this account</p>
                <button
                  onClick={() => setIsCreateCardModalOpen(true)}
                  className={styles.emptyButton}
                >
                  <i className="fa-solid fa-plus" aria-hidden="true"></i>
                  Create Card
                </button>
              </div>
            ) : (
              <div className={styles.cardsList}>
                {cards.map((card) => (
                  <DebitCardPartial key={card.id} card={card} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === "transactions" && (
          <div className={styles.tabContent}>
            {transactions.length === 0 ? (
              <div className={styles.empty}>
                <i className={`fa-solid fa-inbox ${styles.emptyIcon}`} aria-hidden="true"></i>
                <h3>No transactions yet</h3>
                <p>You don't have any transactions for this account</p>
              </div>
            ) : (
              <div className={styles.transactionsList}>
                {transactions.map((transaction) => (
                  <TransactionPartial key={transaction.id} transaction={transaction} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Loans Tab */}
        {activeTab === "loans" && (
          <div className={styles.tabContent}>
            <div className={styles.actionButtons}>
              <button
                onClick={() => setIsLoanModalOpen(true)}
                className={`${styles.actionButton} ${styles.loanButton}`}
              >
                <i className="fa-solid fa-plus" aria-hidden="true"></i>
                <span>Request Loan</span>
              </button>
            </div>

            {loans.length === 0 ? (
              <div className={styles.empty}>
                <i className={`fa-solid fa-inbox ${styles.emptyIcon}`} aria-hidden="true"></i>
                <h3>No loans yet</h3>
                <p>You don't have any loans associated with this account</p>
                <button
                  onClick={() => setIsLoanModalOpen(true)}
                  className={styles.emptyButton}
                >
                  <i className="fa-solid fa-plus" aria-hidden="true"></i>
                  Request a Loan
                </button>
              </div>
            ) : (
              <div className={styles.loansList}>
                {loans.map((loan) => (
                  <div key={loan.id} className={styles.loanItem}>
                    <LoanPartial loan={loan} />
                    {isLoanActive(loan) && (
                      <div className={styles.inlineActions}>
                        <button
                          onClick={() => setSelectedLoanId(loan.id)}
                          className={`${styles.actionButton} ${styles.paymentButton}`}
                        >
                          <i className="fa-solid fa-money-bill-wave" aria-hidden="true"></i>
                          <span>Pay Loan</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <CreateATransferModal
        isOpen={isTransferModalOpen}
        senderBankAccountId={accountId!}
        onClose={() => setIsTransferModalOpen(false)}
        onSuccess={handleTransactionSuccess}
      />

      <DepositWithdrawalModal
        isOpen={transactionModalType !== null}
        type={transactionModalType || "deposit"}
        cards={cards}
        onClose={() => setTransactionModalType(null)}
        onSuccess={handleTransactionSuccess}
      />

      <RequestLoanModal
        isOpen={isLoanModalOpen}
        borrowerAccountId={accountId!}
        onClose={() => setIsLoanModalOpen(false)}
        onSuccess={handleLoanSuccess}
      />

      {selectedLoanId && (
        <PayLoanModal
          isOpen={selectedLoanId !== null}
          loanId={selectedLoanId}
          senderBankAccountId={accountId!}
          remainingAmount={loans.find(l => l.id === selectedLoanId)?.remainingAmount || 0}
          onClose={() => setSelectedLoanId(null)}
          onSuccess={handleLoanSuccess}
        />
      )}

      <CreateACardModal
        isOpen={isCreateCardModalOpen}
        bankAccountId={accountId!}
        onClose={() => setIsCreateCardModalOpen(false)}
        onSuccess={handleTransactionSuccess}
      />
    </div>
  );
}
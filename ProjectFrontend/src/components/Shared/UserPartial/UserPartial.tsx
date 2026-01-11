import { useState } from "react";
import type { AdminListUser } from "../../../models/User";
import styles from "./UserPartial.module.css";
import BankAccountsModal from "./Modals/BankAccountsModal";
import DebitCardsModal from "./Modals/DebitCardsModal";
import TransactionsModal from "./Modals/TransactionsModal";
import LoansModal from "./Modals/LoansModal";

type Props = {
  user: AdminListUser;
};

export default function UserPartial({ user }: Props) {
  const [activeModal, setActiveModal] = useState<"accounts" | "cards" | "transactions" | "loans" | null>(null);

  return (
    <>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>{user.firstName.charAt(0)}{user.lastName.charAt(0)}</div>
            <div>
              <h3 className={styles.name}>{user.firstName} {user.lastName}</h3>
              <p className={styles.email}>{user.email}</p>
            </div>
          </div>
          <div className={styles.badge}>
            {user.roles && user.roles.length > 0 ? (
              <span className={styles.roleBadge}>{user.roles[0]}</span>
            ) : (
              <span className={styles.roleBadge}>User</span>
            )}
          </div>
        </div>

        <div className={styles.details}>
          <div className={styles.detailRow}>
            <span className={styles.label}>User ID</span>
            <span className={styles.value}>{user.id}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.label}>Personal ID</span>
            <span className={styles.value}>{user.personalIdentificationNumber}</span>
          </div>
        </div>

        <div className={styles.actions}>
          <button
            onClick={() => setActiveModal("accounts")}
            className={`${styles.button} ${styles.accountsButton}`}
          >
            <i className="fa-solid fa-building-columns"></i>
            Bank Accounts
          </button>
          <button
            onClick={() => setActiveModal("cards")}
            className={`${styles.button} ${styles.cardsButton}`}
          >
            <i className="fa-solid fa-credit-card"></i>
            Debit Cards
          </button>
          <button
            onClick={() => setActiveModal("transactions")}
            className={`${styles.button} ${styles.transactionsButton}`}
          >
            <i className="fa-solid fa-exchange"></i>
            Transactions
          </button>
          <button
            onClick={() => setActiveModal("loans")}
            className={`${styles.button} ${styles.loansButton}`}
          >
            <i className="fa-solid fa-handshake"></i>
            Loans
          </button>
        </div>
      </div>

      {activeModal === "accounts" && (
        <BankAccountsModal userId={user.id} onClose={() => setActiveModal(null)} />
      )}
      {activeModal === "cards" && (
        <DebitCardsModal userId={user.id} onClose={() => setActiveModal(null)} />
      )}
      {activeModal === "transactions" && (
        <TransactionsModal userId={user.id} onClose={() => setActiveModal(null)} />
      )}
      {activeModal === "loans" && (
        <LoansModal userId={user.id} onClose={() => setActiveModal(null)} />
      )}
    </>
  );
}
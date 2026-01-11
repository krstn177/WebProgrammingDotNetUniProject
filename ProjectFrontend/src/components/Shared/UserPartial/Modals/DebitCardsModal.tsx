import { useEffect, useState } from "react";
import { getDebitCardsByUserId } from "../../../../services/debitCardService";
import type { DebitCard } from "../../../../models/DebitCard";
import styles from "../UserPartial.module.css";
import { toast } from "react-toastify";

type Props = {
  userId: string;
  onClose: () => void;
};

const getCardTypeName = (type: string | number): string => {
  const typeNum = typeof type === "string" ? parseInt(type) : type;
  switch (typeNum) {
    case 0:
      return "Visa";
    case 1:
      return "Mastercard";
    case 2:
      return "American Express";
    case 3:
      return "Discover";
    default:
      return "Debit";
  }
};

export default function DebitCardsModal({ userId, onClose }: Props) {
  const [cards, setCards] = useState<DebitCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCards();
  }, [userId]);

  const fetchCards = async () => {
    setLoading(true);
    try {
      const response = await getDebitCardsByUserId(userId);
      if (response?.data) {
        setCards(response.data);
      }
    } catch (error) {
      toast.error("Failed to fetch debit cards");
    } finally {
      setLoading(false);
    }
  };

  const maskedCardNumber = (cardNumber: string) => {
    const digits = cardNumber.replace(/\s+/g, "");
    return `****-****-****-${digits.slice(-4)}`;
  };

  const expiry = (date: Date | string) => {
    const d = date instanceof Date ? date : new Date(date);
    const mm = `${d.getMonth() + 1}`.padStart(2, "0");
    const yy = `${d.getFullYear()}`.slice(-2);
    return `${mm}/${yy}`;
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Debit Cards</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className={styles.modalContent}>
          {loading ? (
            <div className={styles.centered}>
              <i className="fa-solid fa-circle-notch fa-spin"></i>
              <p>Loading debit cards...</p>
            </div>
          ) : cards.length === 0 ? (
            <div className={styles.centered}>
              <i className="fa-solid fa-inbox"></i>
              <p>No debit cards found</p>
            </div>
          ) : (
            <div className={styles.cardsList}>
              {cards.map((card) => (
                <div key={card.id} className={styles.cardItem}>
                  <div className={styles.cardHeader}>
                    <h4>{card.holderName}</h4>
                    <span className={styles.cardType}>{getCardTypeName(card.type)}</span>
                  </div>
                  <p className={styles.cardDetail}>{maskedCardNumber(card.cardNumber)}</p>
                  <div className={styles.cardFooter}>
                    <span className={styles.cardDetail}>Expires: {expiry(card.expirationDate)}</span>
                    <span className={styles.cardDetail}>Account: {card.bankAccountId}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
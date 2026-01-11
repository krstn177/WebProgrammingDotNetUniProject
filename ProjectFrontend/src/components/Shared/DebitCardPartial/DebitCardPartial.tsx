import { useMemo, useState } from "react";
import styles from "./DebitCardPartial.module.css";
import type { DebitCard } from "../../../models/DebitCard";

type Props = {
  card: DebitCard;
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

const brandClass = (type: string | number) => {
  const typeNum = typeof type === "string" ? parseInt(type) : type;

  switch (typeNum) {
    case 0:
      return styles.brandVisa;
    case 1:
      return styles.brandMastercard;
    case 2:
      return styles.brandAmex;
    case 3:
      return styles.brandDiscover;
    default:
      return styles.brandGeneric;
  }
};

export default function DebitCardPartial({ card }: Props) {
  const [flipped, setFlipped] = useState(false);

  const maskedNumber = useMemo(() => {
    const digits = card.cardNumber.replace(/\s+/g, "");
    const groups = digits.match(/.{1,4}/g) ?? [];
    return groups
      .map((g, i) => (i < groups.length - 1 ? "****" : g))
      .join(" ");
  }, [card.cardNumber]);

  const expiry = useMemo(() => {
    const d = card.expirationDate instanceof Date ? card.expirationDate : new Date(card.expirationDate);
    const mm = `${d.getMonth() + 1}`.padStart(2, "0");
    const yy = `${d.getFullYear()}`.slice(-2);
    return `${mm}/${yy}`;
  }, [card.expirationDate]);

  const security = card.cvv ?? "•••";
  const brand = getCardTypeName(card.type);

  return (
    <div className={styles.scene} onClick={() => setFlipped((v) => !v)}>
      <div className={`${styles.card} ${flipped ? styles.isFlipped : ""}`}>
        {/* Front */}
        <div className={`${styles.face} ${styles.front}`}>
          <div className={styles.chipRow}>
            <div className={styles.chip}></div>
            <span className={`${styles.brand} ${brandClass(card.type)}`}>{brand}</span>
          </div>

          <div className={styles.number}>{maskedNumber}</div>

          <div className={styles.infoRow}>
            <div>
              <label className={styles.label}>Card Holder</label>
              <div className={styles.value}>{card.holderName || "FULL NAME"}</div>
            </div>
            <div>
              <label className={styles.label}>Expires</label>
              <div className={styles.value}>{expiry}</div>
            </div>
          </div>

          <div className={styles.metaRow}>
            <div className={styles.meta}>
              <label className={styles.label}>Account</label>
              <span className={styles.valueMono}>{card.bankAccountId}</span>
            </div>
            <div className={styles.meta}>
              <label className={styles.label}>Owner Id</label>
              <span className={styles.valueMono}>{card.ownerId}</span>
            </div>
          </div>
        </div>

        {/* Back */}
        <div className={`${styles.face} ${styles.back}`}>
          <div className={styles.strip}></div>
          <div className={styles.cvvRow}>
            <label className={styles.label}>Security</label>
            <div className={styles.cvvBox}>{security}</div>
          </div>
          <div className={styles.backMeta}>
            <span className={`${styles.valueMono} ${brandClass(card.type)}`}>{brand}</span>
            <span className={styles.valueMono}>{card.bankAccountId}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
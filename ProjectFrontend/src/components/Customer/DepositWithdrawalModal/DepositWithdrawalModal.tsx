import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { makeDeposit, requestWithdrawal } from "../../../services/transactionService";
import type { DepositWithdrawalRequest } from "../../../models/Transaction";
import type { DebitCard } from "../../../models/DebitCard";
import styles from "./DepositWithdrawalModal.module.css";
import { toast } from "react-toastify";

type Props = {
  isOpen: boolean;
  type: "deposit" | "withdrawal";
  cards: DebitCard[];
  onClose: () => void;
  onSuccess?: () => void;
};

type FormInputs = {
  debitCardId: string;
  pin: string;
  amount: number;
  description: string;
};

export default function DepositWithdrawalModal({
  isOpen,
  type,
  cards,
  onClose,
  onSuccess,
}: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInputs>({ mode: "onTouched" });

  const [showPin, setShowPin] = useState(false);

  // Close on ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // Clear form when closed
  useEffect(() => {
    if (!isOpen) {
      reset();
      setShowPin(false);
    }
  }, [isOpen, reset]);

  const onSubmit = async (data: FormInputs) => {
    const payload: DepositWithdrawalRequest = {
      debitCardId: data.debitCardId,
      pin: data.pin,
      amount: Number(data.amount),
      description: data.description.trim(),
    };

    try {
      const res = type === "deposit" 
        ? await makeDeposit(payload)
        : await requestWithdrawal(payload);

      if (res) {
        const actionText = type === "deposit" ? "Deposit completed" : "Withdrawal request submitted";
        toast.success(actionText);
        onSuccess?.();
        onClose();
      }
    } catch {
      const errorText = type === "deposit" 
        ? "Failed to complete deposit"
        : "Failed to submit withdrawal request";
      toast.error(errorText);
    }
  };

  if (!isOpen) return null;

  const title = type === "deposit" ? "Make a Deposit" : "Request Withdrawal";
  const buttonText = type === "deposit" ? "Deposit" : "Withdraw";
  const amountLabel = type === "deposit" ? "Deposit Amount" : "Withdrawal Amount";

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>{title}</h2>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="debitCardId">Debit Card *</label>
            <select
              id="debitCardId"
              className={`${styles.input} ${errors.debitCardId ? styles.inputError : ""}`}
              {...register("debitCardId", {
                required: "Please select a debit card",
              })}
            >
              <option value="">Select a card</option>
              {cards.map((card) => (
                <option key={card.id} value={card.id}>
                  {card.holderName} - {card.cardNumber}
                </option>
              ))}
            </select>
            {errors.debitCardId && <span className={styles.error}>{errors.debitCardId.message}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="amount">{amountLabel} *</label>
            <input
              id="amount"
              type="number"
              step="0.01"
              className={`${styles.input} ${errors.amount ? styles.inputError : ""}`}
              placeholder="0.00"
              {...register("amount", {
                required: "Amount is required",
                min: { value: 0.01, message: "Amount must be greater than 0" },
              })}
            />
            {errors.amount && <span className={styles.error}>{errors.amount.message}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="pin">Card PIN *</label>
            <div className={styles.pinInput}>
              <input
                id="pin"
                type={showPin ? "text" : "password"}
                maxLength={4}
                className={`${styles.input} ${errors.pin ? styles.inputError : ""}`}
                placeholder="••••"
                {...register("pin", {
                  required: "PIN is required",
                  pattern: {
                    value: /^\d{4}$/,
                    message: "PIN must be exactly 4 digits",
                  },
                })}
              />
              <button
                type="button"
                className={styles.togglePin}
                onClick={() => setShowPin(!showPin)}
                tabIndex={-1}
              >
                <i className={`fa-solid ${showPin ? "fa-eye-slash" : "fa-eye"}`} aria-hidden="true"></i>
              </button>
            </div>
            {errors.pin && <span className={styles.error}>{errors.pin.message}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              className={styles.textarea}
              placeholder="Optional description"
              rows={3}
              {...register("description", { maxLength: { value: 200, message: "Max 200 characters" } })}
            />
            {errors.description && <span className={styles.error}>{errors.description.message}</span>}
          </div>

          <div className={styles.actions}>
            <button type="button" onClick={onClose} className={styles.secondaryButton}>
              Cancel
            </button>
            <button type="submit" className={styles.primaryButton} disabled={isSubmitting || cards.length === 0}>
              {isSubmitting ? "Processing..." : buttonText}
            </button>
          </div>
        </form>

        {cards.length === 0 && (
          <div className={styles.warning}>
            <i className="fa-solid fa-exclamation-triangle" aria-hidden="true"></i>
            <p>You need at least one debit card to complete this action</p>
          </div>
        )}
      </div>
    </div>
  );
}
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { payLoan } from "../../../services/loanService";
import type { PayLoan } from "../../../models/Loan";
import styles from "./PayLoanModal.module.css";
import { toast } from "react-toastify";

type Props = {
  isOpen: boolean;
  loanId: string;
  senderBankAccountId: string; // NEW
  remainingAmount: number;
  onClose: () => void;
  onSuccess?: () => void;
};

type FormInputs = {
  amount: number;
  description: string;
};

export default function PayLoanModal({
  isOpen,
  loanId,
  senderBankAccountId, // NEW
  remainingAmount,
  onClose,
  onSuccess,
}: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInputs>({ mode: "onTouched" });

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) reset();
  }, [isOpen, reset]);

  const onSubmit = async (data: FormInputs) => {
    const payload: PayLoan = {
      senderBankAccountId, // NEW
      amount: Number(data.amount),
      description: data.description.trim(),
    };

    try {
      const res = await payLoan(loanId, payload);
      if (res) {
        toast.success("Loan payment submitted successfully");
        onSuccess?.();
        onClose();
      }
    } catch {
      toast.error("Failed to submit loan payment");
    }
  };

  if (!isOpen) return null;

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Pay Loan</h2>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className={styles.amountInfo}>
          <div className={styles.infoItem}>
            <span className={styles.label}>Remaining Amount</span>
            <span className={styles.value}>{formatAmount(remainingAmount)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="amount">Payment Amount *</label>
            <input
              id="amount"
              type="number"
              step="0.01"
              className={`${styles.input} ${errors.amount ? styles.inputError : ""}`}
              placeholder="0.00"
              {...register("amount", {
                required: "Payment amount is required",
                min: { value: 0.01, message: "Amount must be greater than 0" },
                max: { value: remainingAmount, message: `Cannot exceed remaining amount of ${formatAmount(remainingAmount)}` },
              })}
            />
            {errors.amount && <span className={styles.error}>{errors.amount.message}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              className={styles.textarea}
              placeholder="Optional payment description"
              rows={3}
              {...register("description", {
                maxLength: { value: 200, message: "Max 200 characters" },
              })}
            />
            {errors.description && <span className={styles.error}>{errors.description.message}</span>}
          </div>

          <div className={styles.actions}>
            <button type="button" onClick={onClose} className={styles.secondaryButton}>
              Cancel
            </button>
            <button type="submit" className={styles.primaryButton} disabled={isSubmitting}>
              {isSubmitting ? "Processing..." : "Pay Loan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
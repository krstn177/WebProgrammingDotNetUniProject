import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { createTransfer } from "../../../services/transactionService";
import type { TransferRequest } from "../../../models/Transaction";
import styles from "./CreateATransferModal.module.css";
import { toast } from "react-toastify";

type Props = {
  isOpen: boolean;
  senderBankAccountId: string;
  onClose: () => void;
  onSuccess?: () => void;
};

type TransferFormInputs = {
  receiverIban: string;
  amount: number;
  description: string;
};

export default function CreateATransferModal({
  isOpen,
  senderBankAccountId,
  onClose,
  onSuccess,
}: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TransferFormInputs>({ mode: "onTouched" });

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
    if (!isOpen) reset();
  }, [isOpen, reset]);

  const onSubmit = async (data: TransferFormInputs) => {
    const payload: TransferRequest = {
      senderBankAccountId,
      receiverIban: data.receiverIban.trim(),
      amount: Number(data.amount),
      description: data.description.trim(),
    };

    try {
      const res = await createTransfer(payload);
      if (res) {
        toast.success("Transfer created successfully");
        onSuccess?.();
        onClose();
      }
    } catch {
      toast.error("Failed to create transfer");
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Create Transfer</h2>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="receiverIban">Receiver IBAN *</label>
            <input
              id="receiverIban"
              className={`${styles.input} ${errors.receiverIban ? styles.inputError : ""}`}
              placeholder="RO49AAAA1B31007593840000"
              {...register("receiverIban", {
                required: "Receiver IBAN is required",
                minLength: { value: 8, message: "IBAN is too short" },
              })}
            />
            {errors.receiverIban && <span className={styles.error}>{errors.receiverIban.message}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="amount">Amount *</label>
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
            <label htmlFor="description">Description</label>
            <input
              id="description"
              className={styles.input}
              placeholder="Optional description"
              {...register("description", { maxLength: { value: 200, message: "Max 200 characters" } })}
            />
            {errors.description && <span className={styles.error}>{errors.description.message}</span>}
          </div>

          <div className={styles.actions}>
            <button type="button" onClick={onClose} className={styles.secondaryButton}>
              Cancel
            </button>
            <button type="submit" className={styles.primaryButton} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Send Transfer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { requestLoan } from "../../../services/loanService";
import type { CreateLoan } from "../../../models/Loan";
import styles from "./RequestLoanModal.module.css";
import { toast } from "react-toastify";

type Props = {
  isOpen: boolean;
  borrowerAccountId: string;
  onClose: () => void;
  onSuccess?: () => void;
};

type FormInputs = {
  principal: number;
};

export default function RequestLoanModal({ isOpen, borrowerAccountId, onClose, onSuccess }: Props) {
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
    const payload: CreateLoan = {
      principal: Number(data.principal),
      borrowerAccountId,
    };

    try {
      const res = await requestLoan(payload);
      if (res) {
        toast.success("Loan request submitted");
        onSuccess?.();
        onClose();
      }
    } catch {
      toast.error("Failed to submit loan request");
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Request a Loan</h2>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close">×</button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="principal">Loan Amount *</label>
            <input
              id="principal"
              type="number"
              step="0.01"
              className={`${styles.input} ${errors.principal ? styles.inputError : ""}`}
              placeholder="0.00"
              {...register("principal", {
                required: "Loan amount is required",
                min: { value: 1, message: "Amount must be at least 1" },
              })}
            />
            {errors.principal && <span className={styles.error}>{errors.principal.message}</span>}
          </div>

          <div className={styles.actions}>
            <button type="button" onClick={onClose} className={styles.secondaryButton}>Cancel</button>
            <button type="submit" className={styles.primaryButton} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Request Loan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
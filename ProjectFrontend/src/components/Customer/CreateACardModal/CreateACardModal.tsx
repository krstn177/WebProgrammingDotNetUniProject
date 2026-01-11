import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { createDebitCardForMe } from "../../../services/debitCardService";
import type { UserCreateDebitCardRequest } from "../../../models/DebitCard";
import styles from "./CreateACardModal.module.css";
import { toast } from "react-toastify";

type Props = {
  isOpen: boolean;
  bankAccountId: string;
  onClose: () => void;
  onSuccess?: () => void;
};

type FormInputs = {
  type: number;
  pin: string;
  confirmPin: string;
};

const CARD_TYPES = [
  { value: 0, label: "Visa" },
  { value: 1, label: "Mastercard" },
  { value: 2, label: "American Express" },
  { value: 3, label: "Discover" }
];

export default function CreateACardModal({
  isOpen,
  bankAccountId,
  onClose,
  onSuccess,
}: Props) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormInputs>({ mode: "onTouched" });

  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);

  const pinValue = watch("pin");

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      reset();
      setShowPin(false);
      setShowConfirmPin(false);
    }
  }, [isOpen, reset]);

  const onSubmit = async (data: FormInputs) => {
    const payload: UserCreateDebitCardRequest = {
      type: Number(data.type),
      bankAccountId,
      pin: data.pin,
    };

    try {
      const res = await createDebitCardForMe(payload);
      if (res) {
        toast.success("Debit card created successfully");
        onSuccess?.();
        onClose();
      }
    } catch {
      toast.error("Failed to create debit card");
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Create Debit Card</h2>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="type">Card Type *</label>
            <select
              id="type"
              className={`${styles.input} ${errors.type ? styles.inputError : ""}`}
              {...register("type", {
                required: "Please select a card type",
              })}
            >
              <option value="">Select card type</option>
              {CARD_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.type && <span className={styles.error}>{errors.type.message}</span>}
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
            <label htmlFor="confirmPin">Confirm PIN *</label>
            <div className={styles.pinInput}>
              <input
                id="confirmPin"
                type={showConfirmPin ? "text" : "password"}
                maxLength={4}
                className={`${styles.input} ${errors.confirmPin ? styles.inputError : ""}`}
                placeholder="••••"
                {...register("confirmPin", {
                  required: "Please confirm your PIN",
                  validate: (value) => value === pinValue || "PINs do not match",
                })}
              />
              <button
                type="button"
                className={styles.togglePin}
                onClick={() => setShowConfirmPin(!showConfirmPin)}
                tabIndex={-1}
              >
                <i className={`fa-solid ${showConfirmPin ? "fa-eye-slash" : "fa-eye"}`} aria-hidden="true"></i>
              </button>
            </div>
            {errors.confirmPin && <span className={styles.error}>{errors.confirmPin.message}</span>}
          </div>

          <div className={styles.info}>
            <i className="fa-solid fa-circle-info" aria-hidden="true"></i>
            <p>Your card details will be automatically generated upon creation.</p>
          </div>

          <div className={styles.actions}>
            <button type="button" onClick={onClose} className={styles.secondaryButton}>
              Cancel
            </button>
            <button type="submit" className={styles.primaryButton} disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Card"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
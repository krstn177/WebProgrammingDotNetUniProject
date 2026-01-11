import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { getBankAccountById, updateBankAccount } from "../../../../services/bankAccountService";
import type { AdminUpdateBankAccountRequest, BankAccount } from "../../../../models/BankAccount";
import styles from "./UpdateBankAccount.module.css";
import { toast } from "react-toastify";

type EditFormInputs = {
  iban: string;
  accountNumber: string;
  balance: number;
};

export default function UpdateBankAccount() {
  const { id } = useParams<{ id: string }>();
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<EditFormInputs>({ mode: "onTouched" });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadAccount(id);
  }, [id]);

  const loadAccount = async (accountId: string) => {
    setLoading(true);
    try {
      const res = await getBankAccountById(accountId);
      if (res?.data) {
        const acc: BankAccount = res.data;
        setValue("iban", acc.iban);
        setValue("accountNumber", acc.accountNumber);
        setValue("balance", acc.balance);
      } else {
        toast.error("Account not found");
        navigate("/admin/bank-accounts");
      }
    } catch {
      toast.error("Failed to load account");
      navigate("/admin/bank-accounts");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: EditFormInputs) => {
    const payload: AdminUpdateBankAccountRequest = {
      iban: data.iban.trim(),
      accountNumber: data.accountNumber.trim(),
      balance: Number(data.balance),
    };

    try {
      const res = await updateBankAccount(id!, payload);
      if (res && res.status === 204) {
        toast.success("Bank account updated");
        navigate("/admin/bank-accounts");
      }
    } catch {
      toast.error("Failed to update bank account");
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <i className={`fa-solid fa-circle-notch fa-spin ${styles.spinnerIcon}`} aria-hidden="true" />
          <p>Loading account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={() => navigate("/admin/bank-accounts")} className={styles.backButton}>
          <i className="fa-solid fa-arrow-left" aria-hidden="true"></i>
          Back
        </button>
        <h1 className={styles.title}>Update Bank Account</h1>
      </div>

      <div className={styles.card}>
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="iban" className={styles.label}>IBAN *</label>
            <input
              id="iban"
              className={`${styles.input} ${errors.iban ? styles.inputError : ""}`}
              {...register("iban", { required: "IBAN is required", minLength: { value: 8, message: "Too short" } })}
            />
            {errors.iban && <span className={styles.error}>{errors.iban.message}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="accountNumber" className={styles.label}>Account Number *</label>
            <input
              id="accountNumber"
              className={`${styles.input} ${errors.accountNumber ? styles.inputError : ""}`}
              {...register("accountNumber", { required: "Account number is required", minLength: { value: 6, message: "Too short" } })}
            />
            {errors.accountNumber && <span className={styles.error}>{errors.accountNumber.message}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="balance" className={styles.label}>Balance *</label>
            <input
              id="balance"
              type="number"
              step="0.01"
              className={`${styles.input} ${errors.balance ? styles.inputError : ""}`}
              {...register("balance", { required: "Balance is required", min: { value: 0, message: "Cannot be negative" } })}
            />
            {errors.balance && <span className={styles.error}>{errors.balance.message}</span>}
          </div>

          <div className={styles.formActions}>
            <button type="button" className={styles.cancelButton} onClick={() => navigate("/admin/bank-accounts")}>
              Cancel
            </button>
            <button type="submit" className={styles.submitButton}>
              <i className="fa-solid fa-floppy-disk" aria-hidden="true"></i>
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
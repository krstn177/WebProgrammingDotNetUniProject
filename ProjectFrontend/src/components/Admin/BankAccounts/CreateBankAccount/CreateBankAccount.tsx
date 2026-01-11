import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { createBankAccount, getAllBankAccounts } from "../../../../services/bankAccountService";
import { getAllUsers } from "../../../../services/userService";
import type { AdminCreateBankAccountRequest } from "../../../../models/BankAccount";
import type { User } from "../../../../models/User";
import styles from "./CreateBankAccount.module.css";
import { toast } from "react-toastify";

type CreateFormInputs = {
  iban: string;
  accountNumber: string;
  balance: number;
  bankUserId: string;
};

export default function CreateBankAccount() {
  const { register, handleSubmit, formState: { errors } } = useForm<CreateFormInputs>({ mode: "onTouched" });
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await getAllUsers();
      if (res?.data) setUsers(res.data);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: CreateFormInputs) => {
    const payload: AdminCreateBankAccountRequest = {
      iban: data.iban.trim(),
      accountNumber: data.accountNumber.trim(),
      balance: Number(data.balance),
      bankUserId: data.bankUserId,
    };

    try {
      const res = await createBankAccount(payload);
      if (res) {
        toast.success("Bank account created");
        navigate("/admin/bank-accounts");
      }
    } catch {
      toast.error("Failed to create bank account");
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <i className={`fa-solid fa-circle-notch fa-spin ${styles.spinnerIcon}`} aria-hidden="true" />
          <p>Loading users...</p>
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
        <h1 className={styles.title}>Create Bank Account</h1>
      </div>

      <div className={styles.card}>
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="iban" className={styles.label}>IBAN *</label>
            <input
              id="iban"
              className={`${styles.input} ${errors.iban ? styles.inputError : ""}`}
              {...register("iban", { required: "IBAN is required", minLength: { value: 8, message: "Too short" } })}
              placeholder="RO49AAAA1B31007593840000"
            />
            {errors.iban && <span className={styles.error}>{errors.iban.message}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="accountNumber" className={styles.label}>Account Number *</label>
            <input
              id="accountNumber"
              className={`${styles.input} ${errors.accountNumber ? styles.inputError : ""}`}
              {...register("accountNumber", { required: "Account number is required", minLength: { value: 6, message: "Too short" } })}
              placeholder="1234567890"
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
              placeholder="0.00"
            />
            {errors.balance && <span className={styles.error}>{errors.balance.message}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="bankUserId" className={styles.label}>Owner *</label>
            <select
              id="bankUserId"
              className={`${styles.input} ${errors.bankUserId ? styles.inputError : ""}`}
              {...register("bankUserId", { required: "Owner is required" })}
            >
              <option value="">Select owner</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.firstName} {u.lastName} ({u.email})
                </option>
              ))}
            </select>
            {errors.bankUserId && <span className={styles.error}>{errors.bankUserId.message}</span>}
          </div>

          <div className={styles.formActions}>
            <button type="button" className={styles.cancelButton} onClick={() => navigate("/admin/bank-accounts")}>
              Cancel
            </button>
            <button type="submit" className={styles.submitButton}>
              <i className="fa-solid fa-plus" aria-hidden="true"></i>
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
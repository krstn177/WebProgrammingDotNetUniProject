import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { updateDebitCard, getDebitCardById } from "../../../../services/debitCardService";
import { getAllBankAccounts } from "../../../../services/bankAccountService";
import { getAllUsers } from "../../../../services/userService";
import type { AdminUpdateDebitCardRequest } from "../../../../models/DebitCard";
import type { BankAccount } from "../../../../models/BankAccount";
import type { User } from "../../../../models/User";
import styles from "./UpdateCard.module.css";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

type EditCardFormInputs = {
  holderName: string;
  expirationDate: string;
  type: number;
  newPIN: string;
};

const CARD_TYPES = [
  { value: 0, label: "Visa" },
  { value: 1, label: "Mastercard" },
  { value: 2, label: "American Express" },
  { value: 3, label: "Discover" }
];

export default function UpdateCard() {
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<EditCardFormInputs>({
    mode: "onTouched",
  });
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [bankAccountId, setBankAccountId] = useState<string>("");
  const [ownerId, setOwnerId] = useState<string>("");

  useEffect(() => {
    if (id) {
        console.log("we here");
      fetchCardAndData();
    }
  }, [id]);

  const fetchCardAndData = async () => {
    setLoading(true);
    try {
      const [cardRes, accountsRes, usersRes] = await Promise.all([
        getDebitCardById(id!),
        getAllBankAccounts(),
        getAllUsers(),
      ]);

      if (cardRes?.data) {
        const card = cardRes.data;
        setValue("holderName", card.holderName);
        setValue("type", card.type);
        setValue("expirationDate", card.expirationDate ? new Date(card.expirationDate).toISOString().split("T")[0] : "");
        setBankAccountId(card.bankAccountId);
        setOwnerId(card.ownerId);
      }
      if (accountsRes?.data) setAccounts(accountsRes.data);
      if (usersRes?.data) setUsers(usersRes.data);
    } catch (error) {
      toast.error("Failed to fetch card data");
      navigate("/admin/cards");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: EditCardFormInputs) => {
    const payload: AdminUpdateDebitCardRequest = {
      id: id!,
      holderName: data.holderName,
      expirationDate: new Date(data.expirationDate),
      type: parseInt(String(data.type)),
      newPIN: data.newPIN,
    };

    try {
      const response = await updateDebitCard(id!, payload);
      if (response && response.status === 204) {
        toast.success("Card updated successfully!");
        navigate("/admin/cards");
      }
    } catch (error) {
      toast.error("Failed to update card");
    }
  };

  const getMinExpirationDate = () => {
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    return nextMonth.toISOString().split("T")[0];
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <i className={`fa-solid fa-circle-notch fa-spin ${styles.spinnerIcon}`} aria-hidden="true"></i>
          <p>Loading card details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={() => navigate("/admin/cards")} className={styles.backButton}>
          <i className="fa-solid fa-arrow-left" aria-hidden="true"></i>
          Back to Cards
        </button>
        <h1 className={styles.title}>Edit Debit Card</h1>
      </div>

      <div className={styles.card}>
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Card Information</h2>

            <div className={styles.formGroup}>
              <label htmlFor="holderName" className={styles.label}>Holder Name *</label>
              <input
                {...register("holderName", {
                  required: "Holder name is required",
                  minLength: {
                    value: 2,
                    message: "Holder name must be at least 2 characters",
                  },
                })}
                type="text"
                id="holderName"
                placeholder="John Doe"
                className={`${styles.input} ${errors.holderName ? styles.inputError : ""}`}
              />
              {errors.holderName && <span className={styles.error}>{errors.holderName.message}</span>}
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="expirationDate" className={styles.label}>Expiration Date *</label>
                <input
                  {...register("expirationDate", {
                    required: "Expiration date is required",
                    validate: (value) => {
                      const date = new Date(value);
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
                      return date >= nextMonth || "Card must expire in the future";
                    },
                  })}
                  type="date"
                  id="expirationDate"
                  min={getMinExpirationDate()}
                  className={`${styles.input} ${errors.expirationDate ? styles.inputError : ""}`}
                />
                {errors.expirationDate && <span className={styles.error}>{errors.expirationDate.message}</span>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="type" className={styles.label}>Card Type *</label>
                <select
                  {...register("type", {
                    required: "Card type is required",
                  })}
                  id="type"
                  className={`${styles.input} ${errors.type ? styles.inputError : ""}`}
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
            </div>
          </div>

          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Security & Account</h2>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="newPIN" className={styles.label}>New PIN *</label>
                <input
                  {...register("newPIN", {
                    required: "PIN is required",
                    pattern: {
                      value: /^\d{4}$/,
                      message: "PIN must be exactly 4 digits",
                    },
                  })}
                  type="password"
                  id="newPIN"
                  placeholder="0000"
                  maxLength={4}
                  className={`${styles.input} ${errors.newPIN ? styles.inputError : ""}`}
                />
                {errors.newPIN && <span className={styles.error}>{errors.newPIN.message}</span>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="bankAccountId" className={styles.label}>Bank Account</label>
                <input
                  type="text"
                  id="bankAccountId"
                  disabled
                  value={accounts.find((a) => a.id === bankAccountId)?.accountNumber || ""}
                  className={`${styles.input} ${styles.disabled}`}
                />
                <small className={styles.hint}>Bank account cannot be changed</small>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="ownerId" className={styles.label}>Card Owner</label>
              <input
                type="text"
                id="ownerId"
                disabled
                value={users.find((u) => u.id === ownerId)?.firstName + " " + users.find((u) => u.id === ownerId)?.lastName || ""}
                className={`${styles.input} ${styles.disabled}`}
              />
              <small className={styles.hint}>Card owner cannot be changed</small>
            </div>
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              onClick={() => navigate("/admin/cards")}
              className={styles.cancelButton}
            >
              Cancel
            </button>
            <button type="submit" className={styles.submitButton}>
              <i className="fa-solid fa-floppy-disk" aria-hidden="true"></i>
              Update Card
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
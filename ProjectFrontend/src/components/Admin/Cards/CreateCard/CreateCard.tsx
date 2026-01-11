import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { createDebitCard } from "../../../../services/debitCardService";
import { getAllBankAccounts } from "../../../../services/bankAccountService";
import { getAllUsers } from "../../../../services/userService";
import type { AdminCreateDebitCardRequest } from "../../../../models/DebitCard";
import type { BankAccount } from "../../../../models/BankAccount";
import type { User } from "../../../../models/User";
import styles from "./CreateCard.module.css";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

type CreateCardFormInputs = {
  cardNumber: string;
  holderName: string;
  expirationDate: string;
  type: number;
  cvv: string;
  bankAccountId: string;
  ownerId: string;
  pin: string;
};

const CARD_TYPES = [
  { value: 0, label: "Visa" },
  { value: 1, label: "Mastercard" },
  { value: 2, label: "American Express" },
  { value: 3, label: "Discover" }
];

export default function CreateCard() {
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<CreateCardFormInputs>({
    mode: "onTouched",
  });
  const navigate = useNavigate();
  const { bankAccountId } = useParams<{ bankAccountId?: string }>();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (bankAccountId) {
      setValue("bankAccountId", bankAccountId);
    }
  }, [bankAccountId, setValue]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [accountsRes, usersRes] = await Promise.all([
        getAllBankAccounts(),
        getAllUsers(),
      ]);
      if (accountsRes?.data) setAccounts(accountsRes.data);
      if (usersRes?.data) setUsers(usersRes.data);
    } catch (error) {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(" ");
    } else {
      return value;
    }
  };

  const onSubmit = async (data: CreateCardFormInputs) => {
    const payload: AdminCreateDebitCardRequest = {
      cardNumber: data.cardNumber.replace(/\s+/g, ""),
      holderName: data.holderName,
      expirationDate: new Date(data.expirationDate),
      type: parseInt(String(data.type)),
      cvv: data.cvv,
      bankAccountId: data.bankAccountId,
      ownerId: data.ownerId,
      pin: data.pin,
    };

    try {
      const response = await createDebitCard(payload);
      if (response?.data) {
        toast.success("Card created successfully!");
        navigate("/admin/cards");
      }
    } catch (error) {
      toast.error("Failed to create card");
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
          <p>Loading...</p>
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
        <h1 className={styles.title}>Create Debit Card</h1>
      </div>

      <div className={styles.card}>
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Card Information</h2>

            <div className={styles.formGroup}>
              <label htmlFor="cardNumber" className={styles.label}>Card Number *</label>
              <input
                {...register("cardNumber", {
                  required: "Card number is required",
                  pattern: {
                    value: /^(\d{4}\s?){4}$/,
                    message: "Card number must be 16 digits",
                  },
                  validate: (value) => value.replace(/\s+/g, "").length === 16 || "Card number must be exactly 16 digits",
                })}
                type="text"
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                onChange={(e) => {
                  const formatted = formatCardNumber(e.target.value);
                  e.target.value = formatted;
                }}
                className={`${styles.input} ${errors.cardNumber ? styles.inputError : ""}`}
              />
              {errors.cardNumber && <span className={styles.error}>{errors.cardNumber.message}</span>}
            </div>

            <div className={styles.formRow}>
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
            </div>

            <div className={styles.formRow}>
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

              <div className={styles.formGroup}>
                <label htmlFor="cvv" className={styles.label}>CVV *</label>
                <input
                  {...register("cvv", {
                    required: "CVV is required",
                    pattern: {
                      value: /^\d{3}$/,
                      message: "CVV must be exactly 3 digits",
                    },
                  })}
                  type="text"
                  id="cvv"
                  placeholder="123"
                  maxLength={3}
                  className={`${styles.input} ${errors.cvv ? styles.inputError : ""}`}
                />
                {errors.cvv && <span className={styles.error}>{errors.cvv.message}</span>}
              </div>
            </div>
          </div>

          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Security & Account</h2>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="pin" className={styles.label}>PIN *</label>
                <input
                  {...register("pin", {
                    required: "PIN is required",
                    pattern: {
                      value: /^\d{4}$/,
                      message: "PIN must be exactly 4 digits",
                    },
                  })}
                  type="password"
                  id="pin"
                  placeholder="0000"
                  maxLength={4}
                  className={`${styles.input} ${errors.pin ? styles.inputError : ""}`}
                />
                {errors.pin && <span className={styles.error}>{errors.pin.message}</span>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="bankAccountId" className={styles.label}>Bank Account *</label>
                <select
                  {...register("bankAccountId", {
                    required: "Bank account is required",
                  })}
                  id="bankAccountId"
                  className={`${styles.input} ${errors.bankAccountId ? styles.inputError : ""}`}
                >
                  <option value="">Select bank account</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.accountNumber} - {account.iban}
                    </option>
                  ))}
                </select>
                {errors.bankAccountId && <span className={styles.error}>{errors.bankAccountId.message}</span>}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="ownerId" className={styles.label}>Card Owner *</label>
              <select
                {...register("ownerId", {
                  required: "Card owner is required",
                })}
                id="ownerId"
                className={`${styles.input} ${errors.ownerId ? styles.inputError : ""}`}
              >
                <option value="">Select card owner</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.firstName} {user.lastName} ({user.email})
                  </option>
                ))}
              </select>
              {errors.ownerId && <span className={styles.error}>{errors.ownerId.message}</span>}
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
              <i className="fa-solid fa-plus" aria-hidden="true"></i>
              Create Card
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
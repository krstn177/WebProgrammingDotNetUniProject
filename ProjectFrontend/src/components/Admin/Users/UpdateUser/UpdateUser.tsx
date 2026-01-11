import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { getUserById, updateUser } from "../../../../services/userService";
import type { AdminEditUserRequest } from "../../../../models/User";
import styles from "./UpdateUser.module.css";
import { toast } from "react-toastify";

type EditFormInputs = {
  email: string;
  firstName: string;
  lastName: string;
  personalIdentificationNumber: string;
  roles: string[];
};

const AVAILABLE_ROLES = [
  { value: "Customer", label: "Customer" },
  { value: "Bank", label: "Bank" },
];

export default function UpdateUser() {
  const { id } = useParams<{ id: string }>();
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<EditFormInputs>({ mode: "onTouched" });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const selectedRoles = watch("roles") || [];

  useEffect(() => {
    if (id) loadUser(id);
  }, [id]);

  const loadUser = async (userId: string) => {
    setLoading(true);
    try {
      const res = await getUserById(userId);
      if (res?.data) {
        const user = res.data;
        setValue("email", user.email);
        setValue("firstName", user.firstName);
        setValue("lastName", user.lastName);
        setValue("personalIdentificationNumber", user.personalIdentificationNumber);
        setValue("roles", user.roles || []);
      } else {
        toast.error("User not found");
        navigate("/admin/users");
      }
    } catch {
      toast.error("Failed to load user");
      navigate("/admin/users");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: EditFormInputs) => {
    const payload: AdminEditUserRequest = {
      email: data.email.trim(),
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      personalIdentificationNumber: data.personalIdentificationNumber.trim(),
      roles: data.roles,
    };

    try {
      const res = await updateUser(id!, payload);
      if (res && res.status === 204) {
        toast.success("User updated successfully");
        navigate("/admin/users");
      }
    } catch {
      toast.error("Failed to update user");
    }
  };

  const handleRoleChange = (role: string, checked: boolean) => {
    const currentRoles = selectedRoles;
    if (checked) {
      setValue("roles", [...currentRoles, role]);
    } else {
      setValue("roles", currentRoles.filter(r => r !== role));
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <i className={`fa-solid fa-circle-notch fa-spin ${styles.spinnerIcon}`} aria-hidden="true" />
          <p>Loading user...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={() => navigate("/admin/users")} className={styles.backButton}>
          <i className="fa-solid fa-arrow-left" aria-hidden="true"></i>
          Back
        </button>
        <h1 className={styles.title}>Update User</h1>
      </div>

      <div className={styles.card}>
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Personal Information</h2>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="firstName" className={styles.label}>First Name *</label>
                <input
                  id="firstName"
                  className={`${styles.input} ${errors.firstName ? styles.inputError : ""}`}
                  {...register("firstName", {
                    required: "First name is required",
                    minLength: { value: 2, message: "Must be at least 2 characters" }
                  })}
                />
                {errors.firstName && <span className={styles.error}>{errors.firstName.message}</span>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="lastName" className={styles.label}>Last Name *</label>
                <input
                  id="lastName"
                  className={`${styles.input} ${errors.lastName ? styles.inputError : ""}`}
                  {...register("lastName", {
                    required: "Last name is required",
                    minLength: { value: 2, message: "Must be at least 2 characters" }
                  })}
                />
                {errors.lastName && <span className={styles.error}>{errors.lastName.message}</span>}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>Email *</label>
              <input
                id="email"
                type="email"
                className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address"
                  }
                })}
              />
              {errors.email && <span className={styles.error}>{errors.email.message}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="personalIdentificationNumber" className={styles.label}>Personal ID Number *</label>
              <input
                id="personalIdentificationNumber"
                className={`${styles.input} ${errors.personalIdentificationNumber ? styles.inputError : ""}`}
                {...register("personalIdentificationNumber", {
                  required: "Personal ID number is required",
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: "Must be exactly 10 digits"
                  }
                })}
                placeholder="1234567890123"
                maxLength={10}
              />
              {errors.personalIdentificationNumber && <span className={styles.error}>{errors.personalIdentificationNumber.message}</span>}
            </div>
          </div>

          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Roles</h2>
            <div className={styles.rolesContainer}>
              {AVAILABLE_ROLES.map(role => (
                <label key={role.value} className={styles.roleCheckbox}>
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(role.value)}
                    onChange={(e) => handleRoleChange(role.value, e.target.checked)}
                  />
                  <span>{role.label}</span>
                </label>
              ))}
            </div>
            {selectedRoles.length === 0 && (
              <span className={styles.error}>At least one role must be selected</span>
            )}
          </div>

          <div className={styles.formActions}>
            <button type="button" className={styles.cancelButton} onClick={() => navigate("/admin/users")}>
              Cancel
            </button>
            <button type="submit" className={styles.submitButton} disabled={selectedRoles.length === 0}>
              <i className="fa-solid fa-floppy-disk" aria-hidden="true"></i>
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
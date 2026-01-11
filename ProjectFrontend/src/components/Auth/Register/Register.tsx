import { useForm } from "react-hook-form";
import { useAuth } from "../../../context/useAuth";
import { useNavigate } from "react-router-dom";
import styles from "./Register.module.css";

type RegisterFormInputs = {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  personalIdentificationNumber: string;
};

export default function Register() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormInputs>({
    mode: "onTouched",
  });
  const { registerUser } = useAuth();
  const navigate = useNavigate();
  const password = watch("password");

  const onSubmit = async (data: RegisterFormInputs) => {
    const success = await registerUser(
      data.email,
      data.password,
      data.firstName,
      data.lastName,
      data.personalIdentificationNumber
    );
    
    // After successful registration, redirect to dashboard
    if (success) {
      navigate("/dashboard");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Create Account</h1>
          <p className={styles.subtitle}>Join us and start banking smarter</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="firstName" className={styles.label}>First Name</label>
              <input
                {...register("firstName", {
                  required: "First name is required",
                  minLength: {
                    value: 2,
                    message: "First name must be at least 2 characters"
                  }
                })}
                type="text"
                id="firstName"
                className={`${styles.input} ${errors.firstName ? styles.inputError : ""}`}
                placeholder="Enter your first name"
              />
              {errors.firstName && <span className={styles.error}>{errors.firstName.message}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="lastName" className={styles.label}>Last Name</label>
              <input
                {...register("lastName", {
                  required: "Last name is required",
                  minLength: {
                    value: 2,
                    message: "Last name must be at least 2 characters"
                  }
                })}
                type="text"
                id="lastName"
                className={`${styles.input} ${errors.lastName ? styles.inputError : ""}`}
                placeholder="Enter your last name"
              />
              {errors.lastName && <span className={styles.error}>{errors.lastName.message}</span>}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>Email</label>
            <input
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address"
                }
              })}
              type="email"
              id="email"
              className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
              placeholder="Enter your email"
            />
            {errors.email && <span className={styles.error}>{errors.email.message}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="personalIdentificationNumber" className={styles.label}>Personal ID Number</label>
            <input
              {...register("personalIdentificationNumber", {
                required: "Personal ID number is required",
                pattern: {
                  value: /^[0-9]{2}(?:0[1-9]|1[0-2]|2[1-9]|3[0-2]|4[1-9]|5[0-2])(?:0[1-9]|[1-2][0-9]|3[0-1])[0-9]{4}$/,
                  message: "Invalid Personal ID number format"
                }
              })}
              type="text"
              id="personalIdentificationNumber"
              className={`${styles.input} ${errors.personalIdentificationNumber ? styles.inputError : ""}`}
              placeholder="Enter your personal ID number"
            />
            {errors.personalIdentificationNumber && <span className={styles.error}>{errors.personalIdentificationNumber.message}</span>}
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.label}>Password</label>
              <input
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 10,
                    message: "Password must be at least 10 characters"
                  },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/,
                    message: "Password must contain uppercase, lowercase, number, and special character"
                  }
                })}
                type="password"
                id="password"
                className={`${styles.input} ${errors.password ? styles.inputError : ""}`}
                placeholder="Enter your password"
              />
              {errors.password && <span className={styles.error}>{errors.password.message}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword" className={styles.label}>Confirm Password</label>
              <input
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (value) => value === password || "Passwords do not match"
                })}
                type="password"
                id="confirmPassword"
                className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ""}`}
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && <span className={styles.error}>{errors.confirmPassword.message}</span>}
            </div>
          </div>

          <button type="submit" className={styles.button}>
            Create Account
          </button>
        </form>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className={styles.link}
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
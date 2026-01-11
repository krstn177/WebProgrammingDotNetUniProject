import { useForm } from "react-hook-form";
import { useAuth } from "../../../context/useAuth";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
import { useEffect } from "react";

type LoginFormInputs = {
  email: string;
  password: string;
};

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormInputs>();
  const { loginUser, user, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn() && user) {
      // Redirect based on role
      if (user.Roles?.includes("Bank") || user.Roles?.includes("Admin")) {
        navigate("/admin/bank-accounts");
      } else {
        navigate("/dashboard");
      }
    }
  }, [user, isLoggedIn, navigate]);

  const onSubmit = async (data: LoginFormInputs) => {
    const success = await loginUser(data.email, data.password);
    if (success && user) {
      // Redirect based on role after login
      if (user.Roles?.includes("Bank") || user.Roles?.includes("Admin")) {
        navigate("/admin/bank-accounts");
      } else {
        navigate("/dashboard");
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Welcome Back</h1>
          <p className={styles.subtitle}>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
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
            <label htmlFor="password" className={styles.label}>Password</label>
            <input
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters"
                }
              })}
              type="password"
              id="password"
              className={`${styles.input} ${errors.password ? styles.inputError : ""}`}
              placeholder="Enter your password"
            />
            {errors.password && <span className={styles.error}>{errors.password.message}</span>}
          </div>

          <button type="submit" className={styles.button}>
            Sign In
          </button>
        </form>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/register")}
              className={styles.link}
            >
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
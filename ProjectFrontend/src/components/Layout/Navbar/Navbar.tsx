import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/useAuth";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const { isLoggedIn, logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setMobileMenuOpen(false);
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  const isAdmin = user?.Roles?.includes("Admin") || user?.Roles?.includes("Bank");

  const adminLinks = [
    { path: "/admin/users", label: "Users", icon: "fa-users" },
    { path: "/admin/bank-accounts", label: "Accounts", icon: "fa-building-columns" },
    { path: "/admin/cards", label: "Cards", icon: "fa-credit-card" },
    { path: "/admin/transactions", label: "Transactions", icon: "fa-exchange" },
    { path: "/admin/loans", label: "Loans", icon: "fa-handshake" },
  ];

  const userLinks = [
    { path: "/dashboard", label: "Dashboard", icon: "fa-house" },
  ];

  const links = isAdmin ? adminLinks : userLinks;

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <div className={styles.logoIcon}>
            <i className="fa-solid fa-bolt" aria-hidden="true"></i>
          </div>
          <span className={styles.logoText}>Project X</span>
        </Link>

        {/* Desktop Navigation */}
        {isLoggedIn() && (
          <div className={styles.navLinks}>
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`${styles.navLink} ${isActive(link.path) ? styles.active : ""}`}
              >
                <i className={`fa-solid ${link.icon}`} aria-hidden="true"></i>
                <span>{link.label}</span>
              </Link>
            ))}
          </div>
        )}

        {/* Right Section */}
        <div className={styles.rightSection}>
          {isLoggedIn() ? (
            <>
              <div className={styles.userInfo}>
                <div className={styles.avatar}>
                  {user?.FirstName?.charAt(0)}{user?.LastName?.charAt(0)}
                </div>
                <div className={styles.userDetails}>
                  <p className={styles.userName}>{user?.FirstName} {user?.LastName}</p>
                  <p className={styles.userRole}>{isAdmin ? "Admin" : "User"}</p>
                </div>
              </div>
              <button onClick={handleLogout} className={styles.logoutButton}>
                <i className="fa-solid fa-right-from-bracket" aria-hidden="true"></i>
                <span>Logout</span>
              </button>
            </>
          ) : (
            <div className={styles.authButtons}>
              <Link to="/login" className={styles.loginButton}>
                Login
              </Link>
              <Link to="/register" className={styles.registerButton}>
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        {isLoggedIn() && (
          <button
            className={styles.mobileMenuButton}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <i className={`fa-solid ${mobileMenuOpen ? "fa-xmark" : "fa-bars"}`} aria-hidden="true"></i>
          </button>
        )}
      </div>

      {/* Mobile Menu */}
      {isLoggedIn() && mobileMenuOpen && (
        <div className={styles.mobileMenu}>
          <div className={styles.mobileUserInfo}>
            <div className={styles.avatar}>
              {user?.FirstName?.charAt(0)}{user?.LastName?.charAt(0)}
            </div>
            <div className={styles.userDetails}>
              <p className={styles.userName}>{user?.FirstName} {user?.LastName}</p>
              <p className={styles.userRole}>{isAdmin ? "Admin" : "User"}</p>
            </div>
          </div>
          
          <div className={styles.mobileNavLinks}>
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`${styles.mobileNavLink} ${isActive(link.path) ? styles.active : ""}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <i className={`fa-solid ${link.icon}`} aria-hidden="true"></i>
                <span>{link.label}</span>
              </Link>
            ))}
          </div>

          <button onClick={handleLogout} className={styles.mobileLogoutButton}>
            <i className="fa-solid fa-right-from-bracket" aria-hidden="true"></i>
            <span>Logout</span>
          </button>
        </div>
      )}
    </nav>
  );
}
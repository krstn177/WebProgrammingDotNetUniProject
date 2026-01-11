import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllUsers, deleteUser } from "../../../../services/userService";
import type { AdminListUser } from "../../../../models/User";
import UserPartial from "../../../Shared/UserPartial/UserPartial";
import styles from "./ListUsers.module.css";
import { toast } from "react-toastify";

type SortOption = "firstName" | "lastName" | "email";
type SortOrder = "asc" | "desc";

export default function ListUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminListUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminListUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>("firstName");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    handleSort();
  }, [users, sortBy, sortOrder, searchTerm]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await getAllUsers();
      if (response?.data) {
        setUsers(response.data);
      }
    } catch (error) {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleSort = () => {
    let sorted = [...users];

    // Filter by search term
    if (searchTerm) {
      sorted = sorted.filter(
        (user) =>
          user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.personalIdentificationNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    sorted.sort((a, b) => {
      let comparison = 0;

      if (sortBy === "firstName" || sortBy === "lastName" || sortBy === "email") {
        comparison = a[sortBy].localeCompare(b[sortBy]);
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    setFilteredUsers(sorted);
  };

  const handleDelete = async (userId: string) => {
    if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      try {
        await deleteUser(userId);
        toast.success("User deleted successfully");
        fetchUsers();
      } catch (error) {
        toast.error("Failed to delete user");
      }
    }
  };

  const handleEdit = (user: AdminListUser) => {
    navigate(`/admin/users/edit/${user.id}`, { state: { user } });
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Users</h1>
          <p className={styles.subtitle}>Manage all users in the system</p>
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchContainer}>
          <i className={`fa-solid fa-magnifying-glass ${styles.searchIcon}`} aria-hidden="true"></i>
          <input
            type="text"
            placeholder="Search by name, email, or PIN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.sortControls}>
          <label className={styles.sortLabel}>Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className={styles.sortSelect}
          >
            <option value="firstName">First Name</option>
            <option value="lastName">Last Name</option>
            <option value="email">Email</option>
          </select>
          <button onClick={toggleSortOrder} className={styles.sortOrderButton}>
            {sortOrder === "asc" ? (
              <i className={`fa-solid fa-arrow-up-wide-short ${styles.sortIcon}`} aria-hidden="true"></i>
            ) : (
              <i className={`fa-solid fa-arrow-down-wide-short ${styles.sortIcon}`} aria-hidden="true"></i>
            )}
          </button>
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>
          <i className={`fa-solid fa-circle-notch fa-spin ${styles.spinnerIcon}`} aria-hidden="true"></i>
          <p>Loading users...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className={styles.empty}>
          <i className={`fa-solid fa-users ${styles.emptyIcon}`} aria-hidden="true"></i>
          <h3>No users found</h3>
          <p>
            {searchTerm
              ? "Try adjusting your search criteria"
              : "Get started by creating a new user"}
          </p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredUsers.map((user) => (
            <div key={user.id} className={styles.userWrapper}>
              <UserPartial user={user} />
              <div className={styles.wrapperActions}>
                <button
                  onClick={() => handleEdit(user)}
                  className={`${styles.button} ${styles.editButton}`}
                >
                  <i className={`fa-solid fa-pen-to-square ${styles.buttonIcon}`} aria-hidden="true"></i>
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(user.id)}
                  className={`${styles.button} ${styles.deleteButton}`}
                >
                  <i className={`fa-solid fa-trash ${styles.buttonIcon}`} aria-hidden="true"></i>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className={styles.footer}>
        <p className={styles.resultsCount}>
          Showing {filteredUsers.length} of {users.length} users
        </p>
      </div>
    </div>
  );
}
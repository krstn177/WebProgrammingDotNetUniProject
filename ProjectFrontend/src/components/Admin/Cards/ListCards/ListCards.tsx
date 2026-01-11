import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllDebitCards, deleteDebitCard } from "../../../../services/debitCardService";
import type { DebitCard } from "../../../../models/DebitCard";
import DebitCardPartial from "../../../Shared/DebitCardPartial/DebitCardPartial";
import styles from "./ListCards.module.css";
import { toast } from "react-toastify";

type SortOption = "cardNumber" | "holderName" | "expirationDate";
type SortOrder = "asc" | "desc";

export default function ListCards() {
  const navigate = useNavigate();
  const [cards, setCards] = useState<DebitCard[]>([]);
  const [filteredCards, setFilteredCards] = useState<DebitCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>("cardNumber");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchCards();
  }, []);

  useEffect(() => {
    handleSort();
  }, [cards, sortBy, sortOrder, searchTerm]);

  const fetchCards = async () => {
    setLoading(true);
    try {
      const response = await getAllDebitCards();
      if (response?.data) {
        setCards(response.data);
      }
    } catch (error) {
      toast.error("Failed to fetch debit cards");
    } finally {
      setLoading(false);
    }
  };

  const handleSort = () => {
    let sorted = [...cards];

    // Filter by search term
    if (searchTerm) {
      sorted = sorted.filter(
        (card) =>
          card.cardNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          card.holderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          card.bankAccountId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    sorted.sort((a, b) => {
      let comparison = 0;

      if (sortBy === "expirationDate") {
        const dateA = new Date(a.expirationDate).getTime();
        const dateB = new Date(b.expirationDate).getTime();
        comparison = dateA - dateB;
      } else {
        comparison = a[sortBy].localeCompare(b[sortBy]);
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    setFilteredCards(sorted);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this debit card?")) {
      try {
        await deleteDebitCard(id);
        toast.success("Debit card deleted successfully");
        fetchCards();
      } catch (error) {
        toast.error("Failed to delete debit card");
      }
    }
  };

  const handleEdit = (card: DebitCard) => {
    navigate(`/admin/cards/edit/${card.id}`, { state: { card } });
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Debit Cards</h1>
          <p className={styles.subtitle}>Manage all debit cards in the system</p>
        </div>
        <button
          onClick={() => navigate("/admin/cards/create")}
          className={styles.createButton}
        >
          <i className={`fa-solid fa-plus ${styles.icon}`} aria-hidden="true"></i>
          Create Card
        </button>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchContainer}>
          <i className={`fa-solid fa-magnifying-glass ${styles.searchIcon}`} aria-hidden="true"></i>
          <input
            type="text"
            placeholder="Search by card number, holder name, type, or account..."
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
            <option value="cardNumber">Card Number</option>
            <option value="holderName">Holder Name</option>
            <option value="expirationDate">Expiration Date</option>
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
          <p>Loading debit cards...</p>
        </div>
      ) : filteredCards.length === 0 ? (
        <div className={styles.empty}>
          <i className={`fa-solid fa-credit-card ${styles.emptyIcon}`} aria-hidden="true"></i>
          <h3>No debit cards found</h3>
          <p>
            {searchTerm
              ? "Try adjusting your search criteria"
              : "Get started by creating a new debit card"}
          </p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredCards.map((card) => (
            <div key={card.id} className={styles.cardWrapper}>
              <DebitCardPartial card={card} />
              <div className={styles.actions}>
                <button
                  onClick={() => handleEdit(card)}
                  className={`${styles.button} ${styles.editButton}`}
                >
                  <i className={`fa-solid fa-pen-to-square ${styles.buttonIcon}`} aria-hidden="true"></i>
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(card.id)}
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
          Showing {filteredCards.length} of {cards.length} cards
        </p>
      </div>
    </div>
  );
}
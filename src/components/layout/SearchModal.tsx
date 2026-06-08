import React, { useState, useEffect } from "react";
import { SEARCH_ITEMS } from "../../lib/constants";
import { TabId } from "../../lib/types";
import styles from "./SearchModal.module.css";

interface SearchModalProps {
  onClose: () => void;
  onSelectTab: (tabId: TabId) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  onClose,
  onSelectTab
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSelectedIndex, setSearchSelectedIndex] = useState(0);

  const filteredSearchItems = SEARCH_ITEMS.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (filteredSearchItems.length > 0) {
        setSearchSelectedIndex(
          (prev) => (prev + 1) % filteredSearchItems.length
        );
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (filteredSearchItems.length > 0) {
        setSearchSelectedIndex(
          (prev) =>
            (prev - 1 + filteredSearchItems.length) %
            filteredSearchItems.length
        );
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredSearchItems[searchSelectedIndex]) {
        onSelectTab(filteredSearchItems[searchSelectedIndex].id as TabId);
        onClose();
      }
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  useEffect(() => {
    const handleOutsideEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleOutsideEsc);
    return () => window.removeEventListener("keydown", handleOutsideEsc);
  }, [onClose]);

  return (
    <div className={styles["search-overlay"]} onClick={onClose}>
      <div className={styles["search-modal"]} onClick={(e) => e.stopPropagation()}>
        <div className={styles["search-modal-header"]}>
          <input
            type="text"
            placeholder="Search documentation, APIs, and SDKs..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSearchSelectedIndex(0);
            }}
            onKeyDown={handleSearchKeyDown}
            autoFocus
          />
          <span className={styles["esc-hint"]}>ESC</span>
        </div>

        <div className={styles["search-results"]}>
          {filteredSearchItems.length > 0 ? (
            filteredSearchItems.map((item, index) => (
              <div
                key={item.id}
                className={`${styles["search-item-row"]} ${
                  index === searchSelectedIndex ? styles["selected"] : ""
                }`}
                onClick={() => {
                  onSelectTab(item.id as TabId);
                  onClose();
                }}
                onMouseEnter={() => setSearchSelectedIndex(index)}
              >
                <div className={styles["search-item-left"]}>
                  <span className={styles["search-item-category"]}>
                    {item.category}
                  </span>
                  <span className={styles["search-item-title"]}>
                    {item.title}
                  </span>
                  <span className={styles["search-item-desc"]}>
                    {item.desc}
                  </span>
                </div>
                <div className={styles["search-item-right"]}>
                  <span className={styles["enter-icon"]}>↵</span>
                </div>
              </div>
            ))
          ) : (
            <div className={styles["search-empty-state"]}>
              No matches found for &quot;{searchQuery}&quot;
            </div>
          )}
        </div>

        <div className={styles["search-modal-footer"]}>
          <span>↑↓ to navigate</span>
          <span>↵ to select</span>
          <span>esc to close</span>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;

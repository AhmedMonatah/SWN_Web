import React from "react";
import { useApp } from "../../context/AppContext";
import { translations } from "../../data/translations";

export const FilterPanel = ({
  selectedCategory,
  setSelectedCategory,
  priceRange,
  setPriceRange,
  minOrderFilter,
  setMinOrderFilter,
  onApply
}) => {
  const { language } = useApp();
  const t = translations[language];

  const categories = [
    { id: "all", label: t.allCategories },
    { id: "clothing", label: t.clothing },
    { id: "electronics", label: t.electronics },
    { id: "food", label: t.food },
    { id: "household", label: t.household },
    { id: "personalCare", label: t.personalCare }
  ];

  const handleClear = () => {
    setSelectedCategory("all");
    setPriceRange(300);
    setMinOrderFilter(200);
  };

  return (
    <div className="filter-panel-content">
      {/* Category selector */}
      <div className="filter-section">
        <h4 className="filter-title">{t.category}</h4>
        <div className="category-options-list">
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`category-filter-btn text-start ${
                selectedCategory === cat.id ? "active" : ""
              }`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Max Price Filter */}
      <div className="filter-section">
        <h4 className="filter-title">
          {t.priceRange} (≤ {priceRange} {language === "ar" ? "ج.م" : "EGP"})
        </h4>
        <input
          type="range"
          min="10"
          max="300"
          step="5"
          value={priceRange}
          onChange={(e) => setPriceRange(Number(e.target.value))}
          className="filter-slider"
        />
        <div className="flex-between slider-labels">
          <span>10 {language === "ar" ? "ج.م" : "EGP"}</span>
          <span>300 {language === "ar" ? "ج.م" : "EGP"}</span>
        </div>
      </div>

      {/* Min Order Limit */}
      <div className="filter-section">
        <h4 className="filter-title">
          {t.minQty} (≤ {minOrderFilter} {language === "ar" ? "قطعة" : "pcs"})
        </h4>
        <input
          type="range"
          min="10"
          max="200"
          step="10"
          value={minOrderFilter}
          onChange={(e) => setMinOrderFilter(Number(e.target.value))}
          className="filter-slider"
        />
        <div className="flex-between slider-labels">
          <span>10 {language === "ar" ? "قطعة" : "pcs"}</span>
          <span>200 {language === "ar" ? "قطعة" : "pcs"}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="filter-actions-row flex-center">
        <button className="btn btn-primary apply-filters-btn" onClick={onApply}>
          {t.applyFilters}
        </button>
        <button className="btn btn-secondary clear-filters-btn" onClick={handleClear}>
          {t.clearAll}
        </button>
      </div>

      <style>{`
        .filter-panel-content {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .filter-section {
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 20px;
        }
        .filter-title {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 12px;
        }
        .category-options-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .category-filter-btn {
          background: none;
          border: none;
          padding: 10px 12px;
          border-radius: var(--radius-sm);
          font-size: 0.9rem;
          color: var(--text-muted);
          cursor: pointer;
          transition: var(--transition-smooth);
          font-weight: 500;
        }
        .category-filter-btn:hover {
          background-color: var(--primary-50);
          color: var(--primary-600);
        }
        .category-filter-btn.active {
          background-color: var(--primary-500);
          color: white;
          font-weight: 600;
        }
        .filter-slider {
          width: 100%;
          accent-color: var(--primary-500);
          height: 6px;
          border-radius: 3px;
          outline: none;
          margin: 8px 0;
          cursor: pointer;
        }
        .slider-labels {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 600;
        }
        .filter-actions-row {
          gap: 12px;
          margin-top: 12px;
        }
        .apply-filters-btn {
          flex: 1;
        }
        .clear-filters-btn {
          flex: 1;
        }
      `}</style>
    </div>
  );
};
export default FilterPanel;

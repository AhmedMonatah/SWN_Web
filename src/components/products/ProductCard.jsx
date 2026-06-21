import React from "react";
import { Star, ShoppingCart, Tag } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { translations } from "../../data/translations";

export const ProductCard = ({ product, onViewDetails }) => {
  const { language, addToCart } = useApp();
  const t = translations[language];

  // Calculate best discount tier for display
  const maxDiscount = product.tiers && product.tiers.length > 0 
    ? Math.max(...product.tiers.map(tier => tier.discount)) 
    : 0;

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product, product.minOrder);
  };

  return (
    <div className="product-card glass-card" onClick={onViewDetails}>
      {/* Product Image Panel (Styled Premium Gradient) */}
      <div 
        className="product-image-container flex-center" 
        style={{ background: product.imageColor }}
      >
        <span className="product-category-tag">
          {t[product.category]}
        </span>
        {maxDiscount > 0 && (
          <span className="discount-tag flex-center">
            <Tag size={12} />
            {language === "ar" ? `خصم حتى ${maxDiscount}%` : `Up to ${maxDiscount}% Off`}
          </span>
        )}
      </div>

      {/* Product Info */}
      <div className="product-info-panel">
        <span className="seller-name-label">
          {language === "ar" ? product.sellerNameAr : product.sellerName}
        </span>
        <h4 className="product-title">
          {language === "ar" ? product.nameAr : product.nameEn}
        </h4>
        
        {/* Rating Row */}
        <div className="rating-row flex-center">
          <div className="stars flex-center">
            <Star size={14} className="star-icon fill-warning text-warning" />
            <span className="rating-value">{product.rating}</span>
          </div>
          <span className="reviews-count">({product.reviewsCount})</span>
        </div>

        {/* Pricing Tiers summary */}
        <div className="price-info-row">
          <div className="price-block">
            <span className="price-amount">{product.basePrice}</span>
            <span className="price-currency">{language === "ar" ? " ج.م" : " EGP"}</span>
            <span className="price-unit">/{language === "ar" ? "قطعة" : "pc"}</span>
          </div>
          
          <div className="min-order-badge">
            {t.minOrderLabel} <strong>{product.minOrder}</strong> {language === "ar" ? "قطع" : "pcs"}
          </div>
        </div>

        {/* Action Button */}
        <button className="btn btn-primary add-to-cart-btn" onClick={handleAddToCart}>
          <ShoppingCart size={16} />
          {t.addToCart}
        </button>
      </div>

      <style>{`
        .product-card {
          padding: 0 !important;
          overflow: hidden;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          border-radius: var(--radius-lg);
          background-color: var(--bg-card);
        }
        .product-image-container {
          height: 180px;
          position: relative;
          color: white;
          font-weight: 700;
          font-size: 1.5rem;
          transition: var(--transition-smooth);
        }
        .product-card:hover .product-image-container {
          transform: scale(1.03);
        }
        .product-category-tag {
          position: absolute;
          top: 12px;
          inset-inline-start: 12px;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(4px);
          font-size: 0.75rem;
          color: white;
          padding: 4px 10px;
          border-radius: 20px;
          font-weight: 600;
        }
        .discount-tag {
          position: absolute;
          top: 12px;
          inset-inline-end: 12px;
          background: var(--warning);
          font-size: 0.75rem;
          color: var(--text-main);
          padding: 4px 10px;
          border-radius: 20px;
          font-weight: 700;
          gap: 4px;
        }
        .product-info-panel {
          padding: 20px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .seller-name-label {
          font-size: 0.75rem;
          color: var(--primary-500);
          font-weight: 700;
          text-transform: uppercase;
          margin-bottom: 6px;
        }
        .product-title {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 8px;
          min-height: 48px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .rating-row {
          gap: 6px;
          justify-content: flex-start;
          margin-bottom: 16px;
        }
        .stars {
          gap: 4px;
        }
        .star-icon {
          color: var(--warning);
        }
        .rating-value {
          font-size: 0.85rem;
          font-weight: 700;
        }
        .reviews-count {
          font-size: 0.8rem;
          color: var(--text-muted);
        }
        .price-info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: auto;
          margin-bottom: 20px;
          border-top: 1px solid var(--border-color);
          padding-top: 16px;
        }
        .price-amount {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--primary-600);
        }
        .price-currency {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--primary-600);
        }
        .price-unit {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        .min-order-badge {
          font-size: 0.75rem;
          background-color: var(--primary-50);
          color: var(--primary-700);
          padding: 4px 8px;
          border-radius: 6px;
          border: 1px solid var(--primary-100);
        }
        .add-to-cart-btn {
          width: 100%;
        }
      `}</style>
    </div>
  );
};
export default ProductCard;

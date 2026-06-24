import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Plus, Trash2, Star, Search, SlidersHorizontal, X, ShoppingCart, Minus, Filter } from "lucide-react";

const CATS = ["all", "clothing", "electronics", "food", "household", "personalCare"];
const CAT_EMOJI = { all: "📦", clothing: "👕", electronics: "📱", food: "🍎", household: "🧹", personalCare: "✨" };
const CAT_LABEL = {
  all: { en: "All Categories", ar: "جميع الفئات" },
  clothing: { en: "Clothing & Apparel", ar: "الملابس والأزياء" },
  electronics: { en: "Electronics & Tech", ar: "الإلكترونيات والتقنية" },
  food: { en: "Food & Groceries", ar: "الغذاء والمواد الغذائية" },
  household: { en: "Household Essentials", ar: "مستلزمات المنزل" },
  personalCare: { en: "Personal Care", ar: "العناية الشخصية" }
};

export default function Products({ onAuthClick }) {
  const { language, currentUser, products, addToCart } = useApp();
  const isRTL = language === "ar";
  const L = (en, ar) => (isRTL ? ar : en);

  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("all");
  const [sort, setSort] = useState("default");
  const [detail, setDetail] = useState(null); // Selected product for details modal
  const [qty, setQty] = useState(1);
  const [minP, setMinP] = useState("");
  const [maxP, setMaxP] = useState("");

  const canBuy = !currentUser || ["wholesaler", "retailer"].includes(currentUser.role);

  // If supplier role somehow enters here, show warning
  if (currentUser?.role === "supplier") {
    return (
      <div className="page-wrap">
        <div className="container" style={{ maxWidth: 600, textAlign: "center", padding: "80px 20px" }}>
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>🏭</div>
          <h2 style={{ fontWeight: 800 }}>{L("Access Denied", "غير مسموح بالدخول")}</h2>
          <p className="text-muted" style={{ marginTop: 8, marginBottom: 20 }}>
            {L(
              "As a supplier, you manage your products from your dashboard. Buying is not permitted.",
              "بصفتك مورداً، يمكنك إدارة منتجاتك من لوحة التحكم الخاصة بك. الشراء غير مسموح به."
            )}
          </p>
        </div>
      </div>
    );
  }

  // Resolve pricing and MOQ by role
  const resolvedProducts = products.map(product => {
    const role = currentUser?.role;
    const price = role === "wholesaler" ? (product.priceWholesaler || product.basePrice) : (product.priceRetailer || product.basePrice);
    const minOrder = role === "wholesaler" ? (product.minOrderWholesaler || product.minOrder) : (product.minOrderRetailer || product.minOrder);
    const maxOrder = role === "wholesaler" ? (product.maxOrderWholesaler || product.maxOrder) : (product.maxOrderRetailer || product.maxOrder);
    return { ...product, basePrice: price, minOrder: minOrder, maxOrder: maxOrder };
  });

  // Filter & Sort Logic
  let list = [...resolvedProducts];

  if (currentUser?.role === "admin") {
    // Admin sees all products
  } else if (currentUser?.role === "wholesaler") {
    // Wholesalers see approved supplier products (visible to wholesalers)
    list = list.filter((p) => p.status === "approved" && p.visibleTo?.includes("wholesaler"));
  } else if (currentUser?.role === "retailer") {
    // Retailers see approved products visible to retailers (from wholesaler/supplier)
    list = list.filter((p) => p.status === "approved" && p.visibleTo?.includes("retailer"));
  } else {
    // Guests see approved supplier products (visible to wholesalers)
    list = list.filter((p) => p.status === "approved" && p.visibleTo?.includes("wholesaler"));
  }

  if (search) {
    const q = search.toLowerCase();
    list = list.filter(
      (p) =>
        p.nameEn.toLowerCase().includes(q) ||
        p.nameAr?.includes(q) ||
        p.descriptionEn?.toLowerCase().includes(q) ||
        p.descriptionAr?.includes(q)
    );
  }

  if (cat !== "all") list = list.filter((p) => p.category === cat);
  if (minP) list = list.filter((p) => p.basePrice >= Number(minP));
  if (maxP) list = list.filter((p) => p.basePrice <= Number(maxP));

  if (sort === "price-asc") list.sort((a, b) => a.basePrice - b.basePrice);
  if (sort === "price-desc") list.sort((a, b) => b.basePrice - a.basePrice);
  if (sort === "rating") list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  if (sort === "newest") list.sort((a, b) => b.id - a.id);

  const openDetail = (p) => {
    setDetail(p);
    setQty(p.minOrder || 1);
  };

  const getBestDiscount = (product, quantity) => {
    if (!product.tiers?.length) return 0;
    const sorted = [...product.tiers].sort((a, b) => b.minQty - a.minQty);
    for (const t of sorted) {
      if (quantity >= t.minQty) return t.discount;
    }
    return 0;
  };

  const handleAddToCart = () => {
    if (!currentUser) {
      onAuthClick("login");
      return;
    }
    addToCart(detail, qty);
    setDetail(null);
  };

  const totalPrice = detail ? Math.round(detail.basePrice * (1 - getBestDiscount(detail, qty) / 100) * qty) : 0;

  return (
    <div className="page-wrap" style={{ background: "var(--bg-page)", minHeight: "calc(100vh - 64px)" }}>
      <div className="container">
        {/* Top Header Section */}
        <div className="flex-between flex-wrap gap-12" style={{ borderBottom: "1px solid var(--border)", paddingBottom: 16, marginBottom: 20 }}>
          <div>
            <h1 className="page-title" style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--text-1)" }}>
              {L("E-Commerce Wholesale Market", "سوق الجملة الإلكتروني")}
            </h1>
            <p className="page-subtitle" style={{ fontSize: "0.82rem", marginTop: 4 }}>
              {L(
                currentUser?.role === "wholesaler" ? "Browse raw materials and supplies from manufacturers" : "Browse wholesale bulk products for your retail shop",
                currentUser?.role === "wholesaler" ? "تصفح المواد الخام والمستلزمات المتاحة من المصنعين مباشرة" : "تصفح منتجات الجملة المتاحة لمتجرك بالتجزئة"
              )}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span className="badge badge-blue" style={{ fontSize: "0.75rem", fontWeight: 700, padding: "5px 12px" }}>
              {L("Verified Listings Only", "منتجات موثوقة فقط")}
            </span>
          </div>
        </div>

        {/* Main Columns (Noon-style layout) */}
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
          
          {/* LEFT COLUMN: Sidebar Filters */}
          <aside className="card" style={{ flex: "0 0 250px", padding: 18, position: "sticky", top: 84, display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <h3 style={{ fontSize: "0.88rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-1)", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                <Filter size={14} />
                {L("Categories", "التصنيفات")}
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {CATS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCat(c)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "8px 10px",
                      background: cat === c ? "var(--brand-50)" : "transparent",
                      border: "none",
                      borderRadius: "var(--radius-sm)",
                      textAlign: isRTL ? "right" : "left",
                      color: cat === c ? "var(--brand)" : "var(--text-2)",
                      fontWeight: cat === c ? 700 : 500,
                      fontSize: "0.82rem",
                      cursor: "pointer",
                      width: "100%",
                      transition: "var(--t-fast)"
                    }}
                  >
                    <span>{CAT_EMOJI[c]}</span>
                    <span style={{ flex: 1 }}>{L(CAT_LABEL[c].en, CAT_LABEL[c].ar)}</span>
                  </button>
                ))}
              </div>
            </div>

            <hr style={{ border: "0", borderTop: "1px solid var(--border)" }} />

            <div>
              <h3 style={{ fontSize: "0.88rem", fontWeight: 800, color: "var(--text-1)", marginBottom: 12 }}>
                {L("Price Filter (EGP)", "تصفية السعر (ج.م)")}
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <input
                  className="form-input"
                  type="number"
                  placeholder={L("Min Price", "الحد الأدنى")}
                  value={minP}
                  onChange={(e) => setMinP(e.target.value)}
                  style={{ padding: "6px 10px", fontSize: "0.78rem" }}
                />
                <input
                  className="form-input"
                  type="number"
                  placeholder={L("Max Price", "الحد الأقصى")}
                  value={maxP}
                  onChange={(e) => setMaxP(e.target.value)}
                  style={{ padding: "6px 10px", fontSize: "0.78rem" }}
                />
              </div>
              {(minP || maxP) && (
                <button
                  className="btn btn-ghost btn-xs w-full"
                  onClick={() => { setMinP(""); setMaxP(""); }}
                  style={{ marginTop: 8, fontSize: "0.7rem" }}
                >
                  {L("Clear Price", "إعادة ضبط السعر")}
                </button>
              )}
            </div>
          </aside>

          {/* RIGHT COLUMN: Toolbar & Grid */}
          <div style={{ flex: 1 }}>
            
            {/* Toolbar */}
            <div className="card" style={{ padding: 12, marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", justifyContent: "space-between" }}>
              <div className="search-bar" style={{ flex: "1 1 300px", background: "var(--bg-surface)", border: "1px solid var(--border)", height: 40, borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", padding: "0 12px", gap: 8 }}>
                <Search size={16} className="search-icon" style={{ color: "var(--text-3)" }} />
                <input
                  className="search-input"
                  placeholder={L("Search by name, brand, tag...", "ابحث عن منتج، علامة تجارية أو وصف...")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ border: "none", outline: "none", background: "transparent", width: "100%", fontSize: "0.85rem", color: "var(--text-1)" }}
                />
                {search && (
                  <button onClick={() => setSearch("")} style={{ border: "none", background: "none", cursor: "pointer", display: "flex", padding: 8 }}>
                    <X size={14} style={{ color: "var(--text-3)" }} />
                  </button>
                )}
              </div>

              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                  {L("Sort By:", "ترتيب بحسب:")}
                </span>
                <select
                  className="form-input form-select"
                  style={{ padding: "6px 30px 6px 10px", fontSize: "0.8rem", width: "auto", border: "1px solid var(--border)" }}
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="default">{L("Default", "الافتراضي")}</option>
                  <option value="price-asc">{L("Price: Low to High", "السعر: من الأقل للأعلى")}</option>
                  <option value="price-desc">{L("Price: High to Low", "السعر: من الأعلى للأقل")}</option>
                  <option value="rating">{L("Customer Rating", "تقييم العملاء")}</option>
                  <option value="newest">{L("Newest Arrivals", "أحدث المنتجات")}</option>
                </select>
              </div>
            </div>

            {/* Results Info */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontWeight: 600 }}>
                {L(`Showing ${list.length} products`, `تم العثور على ${list.length} منتج`)}
              </span>
            </div>

            {/* Product Grid */}
            {list.length === 0 ? (
              <div className="empty-state card" style={{ padding: "60px 20px" }}>
                <div style={{ fontSize: "3rem", marginBottom: 14 }}>🔍</div>
                <h3 className="empty-title">{L("No products match your criteria", "لا توجد منتجات مطابقة")}</h3>
                <p className="empty-desc">
                  {search
                    ? L("Try checking your spelling or adjusting filters", "حاول كتابة مصطلح آخر أو ضبط خيارات التصفية")
                    : L("There are currently no approved products listed on the platform. Please check back later.", "لا توجد منتجات مقبولة معروضة في السوق حالياً. يرجى المراجعة لاحقاً.")}
                </p>
                {search && (
                  <button className="btn btn-secondary btn-sm" onClick={() => setSearch("")} style={{ marginTop: 10 }}>
                    {L("Reset Search", "إعادة تعيين البحث")}
                  </button>
                )}
              </div>
            ) : (
              <div className="product-grid stagger">
                {list.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    isRTL={isRTL}
                    L={L}
                    canBuy={canBuy}
                    currentUser={currentUser}
                    onAuthClick={onAuthClick}
                    onOpen={() => openDetail(p)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Product Detail & Checkout Drawer Modal ─────────────────── */}
      {detail && (
        <div className="modal-bg" onClick={() => setDetail(null)}>
          <div className="modal" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ height: 180, background: detail.imageColor || "var(--brand-50)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", borderRadius: "var(--radius-2xl) var(--radius-2xl) 0 0", overflow: "hidden" }}>
              {detail.image ? (
                <img src={detail.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ fontSize: "5rem", filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.15))" }}>📦</span>
              )}
              <button className="btn btn-ghost btn-icon btn-icon-sm" style={{ position: "absolute", top: 10, insetInlineEnd: 10, background: "rgba(0,0,0,0.2)", color: "white" }} onClick={() => setDetail(null)}>
                <X size={16} />
              </button>
              {detail.tiers?.some((t) => t.discount > 0) && (
                <span className="badge badge-green" style={{ position: "absolute", top: 12, insetInlineStart: 12, fontSize: "0.7rem", fontWeight: 700 }}>
                  🏷️ {L("Volume Discounts Available", "خصومات كمية متوفرة")}
                </span>
              )}
            </div>

            <div className="modal-body">
              <div>
                <div className="flex-between gap-8">
                  <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-1)", lineHeight: 1.3 }}>
                    {isRTL ? detail.nameAr : detail.nameEn}
                  </h2>
                  {detail.rating > 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: 3, flexShrink: 0 }}>
                      <Star size={13} style={{ color: "#f59e0b", fill: "#f59e0b" }} />
                      <span style={{ fontSize: ".82rem", fontWeight: 700 }}>{detail.rating}</span>
                      <span style={{ fontSize: ".72rem", color: "var(--text-3)" }}>({detail.reviewsCount})</span>
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                  <span className="badge badge-blue">{L(CAT_LABEL[detail.category]?.en, CAT_LABEL[detail.category]?.ar)}</span>
                  <span className="badge badge-success">{L("In Stock", "متوفر")}</span>
                </div>
              </div>

              {(isRTL ? detail.descriptionAr : detail.descriptionEn) && (
                <p style={{ fontSize: ".82rem", color: "var(--text-2)", lineHeight: 1.6, background: "var(--bg-surface)", padding: "10px 12px", borderRadius: "var(--radius-sm)" }}>
                  {isRTL ? detail.descriptionAr : detail.descriptionEn}
                </p>
              )}

              {/* Price Details */}
              {(!currentUser || currentUser.role === "admin") && detail.priceWholesaler && detail.priceRetailer ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "14px 16px", background: "var(--bg-surface)", borderRadius: "var(--radius-lg)", width: "100%" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: ".72rem", color: "var(--brand)", fontWeight: 700 }}>
                        {L("Wholesaler Price", "سعر تاجر الجملة")}
                      </div>
                      <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-1)" }}>
                        {detail.priceWholesaler.toLocaleString()} <span style={{ fontSize: ".7rem", color: "var(--text-3)", fontWeight: 400 }}>EGP</span>
                      </div>
                    </div>
                    <div style={{ textAlign: isRTL ? "left" : "right" }}>
                      <div style={{ fontSize: ".68rem", color: "var(--text-3)" }}>{L("Wholesaler MOQ / Max", "حد أدنى / أقصى للجملة")}</div>
                      <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text-1)" }}>
                        {detail.minOrderWholesaler} {detail.maxOrderWholesaler ? `/ ${detail.maxOrderWholesaler}` : ""} {L("pcs", "قطعة")}
                      </div>
                    </div>
                  </div>
                  <hr style={{ border: "0", borderTop: "1px solid var(--border)", margin: "4px 0" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: ".72rem", color: "var(--success)", fontWeight: 700 }}>
                        {L("Retailer Price", "سعر تاجر التجزئة")}
                      </div>
                      <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-1)" }}>
                        {detail.priceRetailer.toLocaleString()} <span style={{ fontSize: ".7rem", color: "var(--text-3)", fontWeight: 400 }}>EGP</span>
                      </div>
                    </div>
                    <div style={{ textAlign: isRTL ? "left" : "right" }}>
                      <div style={{ fontSize: ".68rem", color: "var(--text-3)" }}>{L("Retailer MOQ / Max", "حد أدنى / أقصى للتجزئة")}</div>
                      <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text-1)" }}>
                        {detail.minOrderRetailer} {detail.maxOrderRetailer ? `/ ${detail.maxOrderRetailer}` : ""} {L("pcs", "قطعة")}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", gap: 12, padding: "14px 16px", background: "var(--bg-surface)", borderRadius: "var(--radius-lg)", flexWrap: "wrap", width: "100%" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: ".68rem", color: "var(--text-3)", fontWeight: 600, marginBottom: 2 }}>{L("Price", "السعر")}</div>
                    <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-1)", lineHeight: 1 }}>
                      {detail.basePrice?.toLocaleString()} <span style={{ fontSize: ".75rem", color: "var(--text-3)", fontWeight: 400 }}>EGP / {L("unit", "قطعة")}</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: ".68rem", color: "var(--text-3)", fontWeight: 600, marginBottom: 2 }}>
                      {detail.maxOrder ? L("MOQ / Max Limit", "حد أدنى / أقصى للطلب") : L("Minimum Order (MOQ)", "أقل طلب (MOQ)")}
                    </div>
                    <div style={{ fontWeight: 800, fontSize: "1rem", color: "var(--text-1)" }}>
                      {detail.minOrder} {detail.maxOrder ? `/ ${detail.maxOrder}` : ""} {L("pcs", "قطعة")}
                    </div>
                  </div>
                </div>
              )}

              {/* Manufacturer / Seller */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "var(--brand-50)", borderRadius: "var(--radius-md)", border: "1px solid var(--brand-100)" }}>
                <span style={{ fontSize: "1.2rem" }}>{detail.sellerRole === "supplier" ? "🏭" : "🏪"}</span>
                <div>
                  <div style={{ fontSize: ".68rem", color: "var(--text-muted)", fontWeight: 600 }}>
                    {L("Sold By:", "الجهة البائعة:")} {getRoleLabel(detail.sellerRole)}
                  </div>
                  <div style={{ fontSize: ".82rem", fontWeight: 700, color: "var(--brand)" }}>
                    {isRTL ? detail.sellerNameAr || detail.sellerName : detail.sellerName}
                  </div>
                </div>
              </div>

              {/* Remaining Stock */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.82rem", padding: "10px 12px", background: "var(--bg-muted)", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
                <span style={{ fontWeight: 600, color: "var(--text-2)" }}>{L("Remaining Stock:", "المخزون المتبقي:")}</span>
                <strong style={{ color: detail.quantity < 50 ? "var(--danger)" : "var(--success)" }}>
                  {detail.quantity} {L("units", "قطعة")}
                </strong>
              </div>

              {/* Volume Discount Tiers table */}
              {detail.tiers?.length > 0 && (
                <div>
                  <div style={{ fontSize: ".75rem", fontWeight: 700, color: "var(--text-2)", marginBottom: 8 }}>
                    {L("Volume Discount Structure", "هيكل الخصم بحسب حجم الطلب")}
                  </div>
                  <table className="tier-table" style={{ fontSize: "0.78rem" }}>
                    <thead>
                      <tr>
                        <th>{L("Quantity Threshold", "الكمية المطلوبة")}</th>
                        <th>{L("Discount", "الخصم")}</th>
                        <th>{L("Effective Price", "السعر النهائي بعد الخصم")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.tiers.map((t, i) => {
                        const net = detail.basePrice * (1 - t.discount / 100);
                        const active = qty >= t.minQty;
                        return (
                          <tr key={i} className={active ? "tier-active" : ""}>
                            <td>{t.minQty}+ {L("pcs", "قطعة")}</td>
                            <td>{t.discount > 0 ? `${t.discount}% ${L("Off", "خصم")}` : L("No Discount", "لا يوجد خصم")}</td>
                            <td style={{ fontWeight: 700, color: active ? "var(--success)" : "inherit" }}>
                              {net.toFixed(0)} EGP
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Add to Cart Actions */}
              {canBuy && (
                <div style={{ display: "flex", gap: 10, alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", overflow: "hidden", flexShrink: 0 }}>
                    <button style={{ padding: "8px 12px", background: "var(--bg-surface)", border: "none", cursor: "pointer", color: "var(--text-2)" }} onClick={() => setQty((q) => Math.max(detail.minOrder, q - detail.minOrder))}>
                      <Minus size={14} />
                    </button>
                    <input
                      type="number"
                      value={qty}
                      onChange={(e) => {
                        let val = Math.max(detail.minOrder, Number(e.target.value));
                        if (detail.maxOrder && val > detail.maxOrder) {
                          alert(isRTL 
                            ? `الحد الأقصى للطلب هو ${detail.maxOrder} قطعة فقط.`
                            : `Maximum order limit is ${detail.maxOrder} units.`
                          );
                          val = detail.maxOrder;
                        }
                        if (val > detail.quantity) {
                          alert(isRTL 
                            ? `المخزون غير كافٍ! الكمية المتاحة في المخزون هي ${detail.quantity} قطعة فقط.`
                            : `Insufficient stock! Only ${detail.quantity} units are remaining in stock.`
                          );
                          setQty(detail.quantity);
                        } else {
                          setQty(val);
                        }
                      }}
                      style={{ width: 64, textAlign: "center", border: "none", outline: "none", background: "transparent", color: "var(--text-1)", fontWeight: 700, fontSize: ".85rem", padding: "8px 0" }}
                    />
                    <button style={{ padding: "8px 12px", background: "var(--bg-surface)", border: "none", cursor: "pointer", color: "var(--text-2)" }} onClick={() => setQty((q) => {
                      const next = q + detail.minOrder;
                      if (detail.maxOrder && next > detail.maxOrder) {
                        alert(isRTL 
                          ? `الحد الأقصى للطلب هو ${detail.maxOrder} قطعة فقط.`
                          : `Maximum order limit is ${detail.maxOrder} units.`
                        );
                        return q;
                      }
                      if (next > detail.quantity) {
                        alert(isRTL 
                          ? `المخزون غير كافٍ! الكمية المتاحة في المخزون هي ${detail.quantity} قطعة فقط.`
                          : `Insufficient stock! Only ${detail.quantity} units are remaining in stock.`
                        );
                        return q;
                      }
                      return next;
                    })}>
                      <Plus size={14} />
                    </button>
                  </div>
                  <button className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={handleAddToCart}>
                    <ShoppingCart size={16} style={{ marginInlineEnd: 6 }} />
                    {L(`Add to Cart — EGP ${totalPrice.toLocaleString()}`, `إضافة للسلة — ${totalPrice.toLocaleString()} ج.م`)}
                  </button>
                </div>
              )}

              {!canBuy && (
                <div className="alert alert-info" style={{ justifyContent: "center", fontSize: "0.78rem", width: "100%" }}>
                  {currentUser ? (
                    L("You cannot buy this product because of your account role.", "حسابك لا يمتلك الصلاحية لشراء هذا المنتج.")
                  ) : (
                    <button className="btn btn-primary w-full" style={{ padding: "8px 12px", fontSize: "0.85rem" }} onClick={() => { setDetail(null); onAuthClick("login"); }}>
                      {L("Sign In to Purchase", "سجل الدخول للشراء")}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProductCard({ product, isRTL, L, canBuy, currentUser, onAuthClick, onOpen }) {
  const discount = product.tiers?.find((t) => t.discount > 0)?.discount || 0;
  return (
    <div className="product-card" onClick={onOpen} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", overflow: "hidden", display: "flex", flexDirection: "column", height: "100%", boxShadow: "none", transition: "var(--t-base)" }}>
      {/* Product Image Area */}
      <div className="product-card-img" style={{ background: product.imageColor || "#e2e8f0", height: 160, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
        {product.image ? (
          <img src={product.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span style={{ fontSize: "4rem", filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.1))" }}>📦</span>
        )}
        {discount > 0 && (
          <span className="badge badge-green" style={{ position: "absolute", top: 10, insetInlineStart: 10, fontSize: "0.7rem", fontWeight: 700 }}>
            -{discount}%
          </span>
        )}
      </div>

      {/* Body Area */}
      <div className="product-card-body" style={{ padding: 14, flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
        <span className="product-card-cat" style={{ fontSize: "0.68rem", textTransform: "uppercase", color: "var(--text-3)", fontWeight: 600 }}>
          {isRTL
            ? { clothing: "ملابس", electronics: "إلكترونيات", food: "غذائيات", household: "أدوات منزلية", personalCare: "عناية شخصية" }[product.category] || product.category
            : product.category}
        </span>
        <h3 className="product-card-name" style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-1)", margin: "2px 0 4px 0", height: 38, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", lineHeight: 1.4 }}>
          {isRTL ? product.nameAr : product.nameEn}
        </h3>
        
        {/* Seller / Manufacturer */}
        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.72rem", color: "var(--text-3)", fontWeight: 500 }}>
          <span>{product.sellerRole === "supplier" ? "🏭" : "🏪"}</span>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {isRTL ? product.sellerNameAr || product.sellerName : product.sellerName}
          </span>
        </div>

        {product.rating > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: ".7rem", color: "var(--text-3)" }}>
            <Star size={11} style={{ fill: "#f59e0b", color: "#f59e0b" }} /> 
            <strong>{product.rating}</strong> 
            <span>({product.reviewsCount})</span>
          </div>
        )}

        {/* Pricing Info */}
        <div style={{ marginTop: "auto", paddingTop: 8, width: "100%" }}>
          {(!currentUser || currentUser.role === "admin") && product.priceWholesaler && product.priceRetailer ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 4, width: "100%" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.78rem" }}>
                <span style={{ color: "var(--text-3)" }}>{L("Wholesale:", "جملة:")}</span>
                <span style={{ fontWeight: 700, color: "var(--brand)" }}>
                  {product.priceWholesaler.toLocaleString()} EGP <span style={{ fontSize: "0.65rem", fontWeight: 400, color: "var(--text-3)" }}>({product.minOrderWholesaler}{product.maxOrderWholesaler ? `-${product.maxOrderWholesaler}` : ""})</span>
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.78rem" }}>
                <span style={{ color: "var(--text-3)" }}>{L("Retail:", "تجزئة:")}</span>
                <span style={{ fontWeight: 700, color: "var(--success)" }}>
                  {product.priceRetailer.toLocaleString()} EGP <span style={{ fontSize: "0.65rem", fontWeight: 400, color: "var(--text-3)" }}>({product.minOrderRetailer}{product.maxOrderRetailer ? `-${product.maxOrderRetailer}` : ""})</span>
                </span>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--brand)" }}>
                {product.basePrice?.toLocaleString()} <span style={{ fontSize: "0.65rem", fontWeight: 400, color: "var(--text-3)" }}>EGP</span>
              </div>
              <div style={{ fontSize: "0.7rem", color: "var(--text-3)", marginTop: 2 }}>
                {L("Min/Max Order:", "حد أدنى/أقصى:")} {product.minOrder} {product.maxOrder ? `/ ${product.maxOrder}` : ""} {L("units", "وحدة")}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="product-card-foot" onClick={(e) => e.stopPropagation()} style={{ padding: "10px 14px", borderTop: "1px solid var(--border)", background: "var(--bg-surface)", display: "flex", gap: 8 }}>
        <button className="btn btn-secondary btn-sm" style={{ flex: 1, padding: "6px" }} onClick={onOpen}>
          {L("Details", "التفاصيل")}
        </button>
        {(!currentUser || canBuy) && (
          <button className="btn btn-primary btn-sm" style={{ flex: 1, padding: "6px" }} onClick={() => currentUser ? onOpen() : onAuthClick("login")}>
            <ShoppingCart size={13} style={{ marginInlineEnd: 4 }} />
            {L("Order", "طلب")}
          </button>
        )}
      </div>
    </div>
  );
}

function getRoleLabel(role) {
  if (role === "supplier") return "Supplier";
  if (role === "wholesaler") return "Wholesaler";
  if (role === "retailer") return "Retailer";
  return role;
}

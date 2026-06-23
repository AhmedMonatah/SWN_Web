import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { translations } from "../data/translations";
import { CheckCircle, CreditCard, Banknote, Package, ArrowLeft, ShoppingBag } from "lucide-react";

export default function Checkout({ onNavigate }) {
  const { language, currentUser, cart, createOrder, clearCart } = useApp();
  const t = translations[language];
  const isRTL = language === "ar";

  const [form, setForm] = useState({
    contactName: currentUser?.name || "",
    companyName: currentUser?.companyName || "",
    phone: currentUser?.phone || "",
    shippingAddress: currentUser?.address || "",
    paymentMethod: "bankTransfer",
    notes: "",
    bankAccountNumber: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvc: ""
  });
  const [placing, setPlacing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Calculate totals
  const subtotal = cart.reduce((sum, { product, quantity }) => sum + product.basePrice * quantity, 0);
  const discount = cart.reduce((sum, { product, quantity }) => {
    const sorted = [...product.tiers].sort((a, b) => b.minQty - a.minQty);
    let d = 0;
    for (const tier of sorted) { if (quantity >= tier.minQty) { d = tier.discount; break; } }
    return sum + product.basePrice * quantity * (d / 100);
  }, 0);
  const shipping = (subtotal - discount) > 10000 ? 0 : 250;
  const total = subtotal - discount + shipping;

  const handlePlaceOrder = () => {
    if (!form.shippingAddress || !form.phone) return;
    setPlacing(true);

    // Determine sellerId (first product's seller)
    const sellerId = cart[0]?.product?.sellerId;

    const orderData = {
      sellerId,
      items: cart.map(({ product, quantity }) => ({
        productId: product.id,
        nameEn: product.nameEn,
        nameAr: product.nameAr,
        quantity,
        price: product.basePrice
      })),
      totalAmount: Math.round(total),
      paymentMethod: form.paymentMethod,
      shippingAddress: form.shippingAddress,
      contactName: form.contactName,
      companyName: form.companyName,
      phone: form.phone,
      notes: form.notes
    };

    setTimeout(() => {
      const order = createOrder(orderData);
      setOrderId(order.id);
      setPlacing(false);
      setSuccess(true);
    }, 1000);
  };

  if (success) {
    return (
      <div className="page-wrapper">
        <div className="container" style={{ maxWidth: 500 }}>
          <div className="success-card anim-scale-in">
            <div className="success-icon-wrap">
              <div className="success-ring" />
              <CheckCircle size={48} className="success-icon" />
            </div>
            <h2 className="success-title">{t.orderSuccess}</h2>
            <p className="success-desc">{t.orderSuccessDesc}</p>
            <div className="success-order-id">
              <span>{isRTL ? "رقم الطلب" : "Order ID"}</span>
              <strong>{orderId}</strong>
            </div>
            <div style={{ display: "flex", gap: 10, flexDirection: "column" }}>
              <button className="btn btn-primary btn-lg w-full" onClick={() => onNavigate("orders")}>
                <ShoppingBag size={18} />
                {isRTL ? "تتبع طلبي" : "Track My Order"}
              </button>
              <button className="btn btn-secondary w-full" onClick={() => onNavigate("products")}>
                {isRTL ? "مواصلة التسوق" : "Continue Shopping"}
              </button>
            </div>
          </div>
        </div>
        <style>{`
          .success-card { background: var(--bg-card); border-radius: var(--radius-2xl); padding: 48px 36px; text-align: center; box-shadow: var(--shadow-xl); border: 1px solid var(--border-color); display: flex; flex-direction: column; align-items: center; gap: 20px; margin: 0 auto; }
          .success-icon-wrap { position: relative; width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; }
          .success-ring { position: absolute; inset: 0; border-radius: 50%; border: 3px solid var(--success); animation: scaleIn 0.5s ease both; }
          .success-icon { color: var(--success); animation: scaleIn 0.5s 0.2s cubic-bezier(0.34,1.56,0.64,1) both; }
          .success-title { font-size: 1.3rem; font-weight: 900; color: var(--text-main); }
          .success-desc { font-size: 0.88rem; color: var(--text-muted); line-height: 1.6; max-width: 320px; }
          .success-order-id { display: flex; justify-content: space-between; width: 100%; padding: 12px 16px; background: var(--primary-50); border-radius: var(--radius-md); font-size: 0.85rem; border: 1px solid var(--primary-100); }
          .success-order-id strong { color: var(--primary-700); }
        `}</style>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="page-wrapper">
        <div className="container">
          <div className="empty-state">
            <div className="empty-state-icon">🛒</div>
            <h3 className="empty-state-title">{t.emptyCart}</h3>
            <button className="btn btn-primary" onClick={() => onNavigate("products")}>{t.startShopping}</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header-section">
          <button className="btn btn-ghost btn-sm" style={{ marginBottom: 8 }} onClick={() => onNavigate("products")}>
            <ArrowLeft size={16} /> {isRTL ? "رجوع للمنتجات" : "Back to Products"}
          </button>
          <h1 className="page-title">{isRTL ? "إتمام الطلب" : "Checkout"}</h1>
        </div>

        <div className="checkout-layout">
          {/* Left — Form */}
          <div className="checkout-form-col anim-fade-up">
            <div className="card" style={{ marginBottom: 16 }}>
              <h2 style={{ fontWeight: 800, marginBottom: 16, fontSize: "0.95rem" }}>{t.billingDetails}</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">{t.contactName} *</label>
                  <input className="form-input" name="contactName" value={form.contactName} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">{t.companyName}</label>
                  <input className="form-input" name="companyName" value={form.companyName} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">{t.phone} *</label>
                  <input className="form-input" name="phone" type="tel" value={form.phone} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">{t.shippingAddress} *</label>
                  <textarea className="form-input form-textarea" name="shippingAddress" value={form.shippingAddress} onChange={handleChange} rows={3} />
                </div>
                <div className="form-group">
                  <label className="form-label">{isRTL ? "ملاحظات إضافية" : "Additional Notes"}</label>
                  <textarea className="form-input form-textarea" name="notes" value={form.notes} onChange={handleChange} rows={2} placeholder={isRTL ? "أي تعليمات خاصة للتوصيل..." : "Any special delivery instructions..."} />
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="card">
              <h2 style={{ fontWeight: 800, marginBottom: 16, fontSize: "0.95rem" }}>{t.paymentMethod}</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { id: "bankTransfer", labelEn: t.bankTransfer, labelAr: t.bankTransfer, icon: <Banknote size={20} />, descEn: "3-5 business days processing", descAr: "معالجة خلال 3-5 أيام عمل" },
                  { id: "cod",          labelEn: t.cod,          labelAr: t.cod,          icon: <Package size={20} />,   descEn: "Pay when order arrives",        descAr: "ادفع عند وصول الطلب" },
                  { id: "creditCard",   labelEn: t.creditCard,   labelAr: t.creditCard,   icon: <CreditCard size={20} />, descEn: "Instant confirmation",         descAr: "تأكيد فوري" },
                ].map(method => (
                  <div key={method.id} style={{ display: "flex", flexDirection: "column", gap: 8, border: "1.5px solid var(--border-color)", borderRadius: "var(--radius-lg)", padding: 12, background: form.paymentMethod === method.id ? "var(--primary-50)" : "transparent" }}>
                    <label className={`payment-option ${form.paymentMethod === method.id ? "selected" : ""}`} style={{ border: "none", padding: 0, background: "transparent" }}>
                      <input type="radio" name="paymentMethod" value={method.id} checked={form.paymentMethod === method.id} onChange={handleChange} style={{ display: "none" }} />
                      <div className="payment-icon">{method.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: "0.88rem" }}>{isRTL ? method.labelAr : method.labelEn}</div>
                        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{isRTL ? method.descAr : method.descEn}</div>
                      </div>
                      <div className={`payment-check ${form.paymentMethod === method.id ? "checked" : ""}`} />
                    </label>

                    {form.paymentMethod === method.id && method.id === "bankTransfer" && (
                      <div className="form-group anim-fade-in" style={{ marginTop: 8 }}>
                        <label className="form-label" style={{ fontSize: "0.72rem" }}>{isRTL ? "رقم الحساب البنكي / الرقم المرجعي للتحويل *" : "Bank Account Number / Reference Number *"}</label>
                        <input className="form-input" name="bankAccountNumber" value={form.bankAccountNumber} onChange={handleChange} placeholder="EG03938473847293847..." required style={{ background: "var(--bg-surface)" }} />
                      </div>
                    )}

                    {form.paymentMethod === method.id && method.id === "creditCard" && (
                      <div className="anim-fade-in" style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                        <div className="form-group">
                          <label className="form-label" style={{ fontSize: "0.72rem" }}>{isRTL ? "رقم البطاقة *" : "Card Number *"}</label>
                          <input className="form-input" name="cardNumber" value={form.cardNumber} onChange={handleChange} placeholder="4242 •••• •••• ••••" maxLength={19} required style={{ background: "var(--bg-surface)" }} />
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                          <div className="form-group">
                            <label className="form-label" style={{ fontSize: "0.72rem" }}>{isRTL ? "تاريخ الانتهاء *" : "Expiry Date *"}</label>
                            <input className="form-input" name="cardExpiry" value={form.cardExpiry} onChange={handleChange} placeholder="MM/YY" maxLength={5} required style={{ background: "var(--bg-surface)" }} />
                          </div>
                          <div className="form-group">
                            <label className="form-label" style={{ fontSize: "0.72rem" }}>{isRTL ? "رمز التحقق CVC *" : "CVC *"}</label>
                            <input className="form-input" name="cardCvc" value={form.cardCvc} onChange={handleChange} placeholder="•••" maxLength={4} required style={{ background: "var(--bg-surface)" }} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — Order Summary */}
          <div className="checkout-summary-col anim-fade-up" style={{ animationDelay: "0.1s" }}>
            <div className="card" style={{ position: "sticky", top: 84 }}>
              <h2 style={{ fontWeight: 800, marginBottom: 16, fontSize: "0.95rem" }}>{t.cartSummary}</h2>

              {/* Items */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16, maxHeight: 280, overflowY: "auto" }}>
                {cart.map(({ product, quantity }, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--border-color)" }}>
                    <div style={{ width: 40, height: 40, borderRadius: "var(--radius-sm)", background: product.imageColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", flexShrink: 0 }}>
                      {product.emoji}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.82rem", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {isRTL ? product.nameAr : product.nameEn}
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{quantity} × {product.basePrice} {isRTL ? "ج.م" : "EGP"}</div>
                    </div>
                    <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--primary-600)", flexShrink: 0 }}>
                      {(product.basePrice * quantity).toLocaleString()} {isRTL ? "ج.م" : "EGP"}
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  <span>{t.subtotal}</span><span>{subtotal.toLocaleString()} {isRTL ? "ج.م" : "EGP"}</span>
                </div>
                {discount > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--success)", fontWeight: 700 }}>
                    <span>{t.discount}</span><span>-{discount.toLocaleString()} {isRTL ? "ج.م" : "EGP"}</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  <span>{t.shipping}</span>
                  <span>{shipping === 0 ? (isRTL ? "مجاني 🎉" : "Free 🎉") : `${shipping.toLocaleString()} ${isRTL ? "ج.م" : "EGP"}`}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.1rem", fontWeight: 900, color: "var(--primary-600)", borderTop: "1px solid var(--border-color)", paddingTop: 10, marginTop: 4 }}>
                  <span>{t.total}</span><span>{total.toLocaleString()} {isRTL ? "ج.م" : "EGP"}</span>
                </div>
              </div>

              {shipping === 0 && (
                <div style={{ marginTop: 10, padding: "8px 12px", background: "#dcfce7", borderRadius: "var(--radius-md)", fontSize: "0.78rem", color: "var(--success)", fontWeight: 600 }}>
                  🎉 {isRTL ? "تستحق الشحن المجاني على هذا الطلب!" : "You qualify for FREE shipping on this order!"}
                </div>
              )}

              <button
                className="btn btn-primary btn-xl w-full"
                style={{ marginTop: 16 }}
                onClick={handlePlaceOrder}
                disabled={
                  placing ||
                  !form.phone ||
                  !form.shippingAddress ||
                  (form.paymentMethod === "bankTransfer" && !form.bankAccountNumber.trim()) ||
                  (form.paymentMethod === "creditCard" && (!form.cardNumber.trim() || !form.cardExpiry.trim() || !form.cardCvc.trim()))
                }
              >
                {placing ? (
                  <span className="btn-spinner" style={{ width: 20, height: 20 }} />
                ) : (
                  <>{t.placeOrder} ✓</>
                )}
              </button>

              <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", textAlign: "center", marginTop: 10, lineHeight: 1.5 }}>
                🔒 {isRTL ? "معاملة آمنة ومحمية" : "Secure & protected transaction"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .checkout-layout { display: grid; grid-template-columns: 1fr 380px; gap: 20px; }
        .btn-spinner { width: 20px; height: 20px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block; }
        .payment-option { display: flex; align-items: center; gap: 12px; padding: 14px 16px; border: 1.5px solid var(--border-color); border-radius: var(--radius-lg); cursor: pointer; transition: var(--t-normal); }
        .payment-option:hover { border-color: var(--primary-300); background: var(--primary-50); }
        .payment-option.selected { border-color: var(--primary-500); background: var(--primary-50); }
        .payment-icon { width: 40px; height: 40px; border-radius: var(--radius-md); background: var(--bg-muted); display: flex; align-items: center; justify-content: center; color: var(--primary-600); flex-shrink: 0; }
        .payment-check { width: 20px; height: 20px; border-radius: 50%; border: 2px solid var(--border-color); transition: var(--t-fast); flex-shrink: 0; }
        .payment-check.checked { background: var(--primary-600); border-color: var(--primary-600); box-shadow: inset 0 0 0 4px white; }
        @media (max-width: 900px) { .checkout-layout { grid-template-columns: 1fr; } .checkout-summary-col .card { position: static !important; } }
      `}</style>
    </div>
  );
}

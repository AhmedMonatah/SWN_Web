import React, { useState, useEffect } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import Home from "./pages/Home";
import Products from "./pages/Products";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Drawer from "./components/ui/Drawer";
import { translations } from "./data/translations";
import { Trash2, ArrowRight, Bell, Home as HomeIcon, Package, LayoutDashboard, ClipboardList, User, X } from "lucide-react";

function AppContent() {
  const {
    language, cart, updateCartQty, removeFromCart,
    activeDrawer, setActiveDrawer,
    notifications, markAllNotificationsRead,
    currentUser, logout, getDefaultPage
  } = useApp();

  const t = translations[language];
  const isRTL = language === "ar";

  const [currentPage, setCurrentPage] = useState(() => {
    return currentUser ? getDefaultPage(currentUser.role) : "home";
  });
  
  const [authModal, setAuthModal] = useState(null); // null, "login", "register"

  // Auth routing guard
  useEffect(() => {
    if (!currentUser) {
      const protectedPages = ["dashboard", "orders", "profile", "checkout"];
      if (protectedPages.includes(currentPage)) {
        setCurrentPage("home");
        setAuthModal("login");
      }
    } else {
      setAuthModal(null);
      if (currentPage === "login" || currentPage === "register") {
        setCurrentPage(getDefaultPage(currentUser.role));
      }
    }
  }, [currentUser, currentPage]);

  // Page render
  const renderPage = () => {
    switch (currentPage) {
      case "home":     return <Home onNavigate={setCurrentPage} onAuthClick={setAuthModal} />;
      case "products": return <Products onAuthClick={setAuthModal} />;
      case "dashboard":return <Dashboard onNavigate={setCurrentPage} />;
      case "orders":   return <Orders />;
      case "profile":  return <Profile />;
      case "checkout": return <Checkout onNavigate={setCurrentPage} />;
      default:         return <Home onNavigate={setCurrentPage} onAuthClick={setAuthModal} />;
    }
  };

  // Cart totals
  const subtotal = cart.reduce((s, { product, quantity }) => s + product.basePrice * quantity, 0);
  const discount = cart.reduce((s, { product, quantity }) => {
    const sorted = [...product.tiers].sort((a, b) => b.minQty - a.minQty);
    let d = 0;
    for (const tier of sorted) { if (quantity >= tier.minQty) { d = tier.discount; break; } }
    return s + product.basePrice * quantity * (d / 100);
  }, 0);
  const shipping = (subtotal - discount) > 10000 ? 0 : cart.length > 0 ? 250 : 0;
  const total = subtotal - discount + shipping;

  const userNotifications = currentUser
    ? notifications.filter(n => n.role === currentUser.role || !n.role)
    : [];

  const STATUS_LABEL = {
    pending: isRTL ? "معلق" : "Pending",
    confirmed: isRTL ? "مؤكد" : "Confirmed",
    shipped: isRTL ? "تم الشحن" : "Shipped",
    delivered: isRTL ? "تم التوصيل" : "Delivered",
  };

  const mobileNavLinks = currentUser ? [
    { id: "home",      icon: <HomeIcon size={20} />,          label: isRTL ? "الرئيسية" : "Home" },
    { id: "products",  icon: <Package size={20} />,           label: isRTL ? "المنتجات" : "Products" },
    { id: "dashboard", icon: <LayoutDashboard size={20} />,   label: isRTL ? "لوحة التحكم" : "Dashboard" },
    { id: "orders",    icon: <ClipboardList size={20} />,     label: isRTL ? "طلباتي" : "Orders" },
    { id: "profile",   icon: <User size={20} />,              label: isRTL ? "حسابي" : "Profile" },
  ] : [
    { id: "home",      icon: <HomeIcon size={20} />,          label: isRTL ? "الرئيسية" : "Home" },
    { id: "products",  icon: <Package size={20} />,           label: isRTL ? "المنتجات" : "Products" },
  ];

  return (
    <div className={`app-shell`} dir={isRTL ? "rtl" : "ltr"}>
      <Header currentPage={currentPage} onNavigate={setCurrentPage} onAuthClick={setAuthModal} />
      <main style={{ flex: 1 }}>{renderPage()}</main>
      <Footer />

      {/* ── CART DRAWER ─────────────────────────── */}
      <Drawer
        id="cart"
        title={t.cartSummary}
        footer={
          cart.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                <span>{t.subtotal}</span><span>{subtotal.toLocaleString()} EGP</span>
              </div>
              {discount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--success)", fontWeight: 700 }}>
                  <span>{t.discount}</span><span>-{discount.toLocaleString()} EGP</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 900, fontSize: "1.05rem", color: "var(--primary-600)", borderTop: "1px solid var(--border-color)", paddingTop: 10 }}>
                <span>{t.total}</span><strong>{total.toLocaleString()} EGP</strong>
              </div>
              <button
                className="btn btn-primary"
                style={{ width: "100%", padding: 13 }}
                onClick={() => { setCurrentPage("checkout"); setActiveDrawer(null); }}
              >
                {t.checkout} <ArrowRight size={18} />
              </button>
            </div>
          )
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {cart.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 0", gap: 14, textAlign: "center" }}>
              <span style={{ fontSize: "3.5rem" }}>🛒</span>
              <h3 style={{ fontWeight: 700 }}>{t.emptyCart}</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setActiveDrawer(null)}>{t.startShopping}</button>
            </div>
          ) : (
             cart.map((item, idx) => (
              <div key={idx} style={{ display: "flex", gap: 12, borderBottom: "1px solid var(--border-color)", paddingBottom: 14 }}>
                <div style={{ width: 56, height: 56, borderRadius: "var(--radius-md)", background: item.product.imageColor || "var(--bg-surface)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
                  {item.product.image ? (
                    <img src={item.product.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <span style={{ fontSize: "1.5rem" }}>📦</span>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "0.85rem", fontWeight: 700, marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {isRTL ? item.product.nameAr : item.product.nameEn}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: 8 }}>
                    {item.product.basePrice} EGP / {isRTL ? "قطعة" : "unit"}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button style={{ width: 26, height: 26, borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)", background: "var(--bg-muted)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}
                      onClick={() => updateCartQty(item.product.id, item.quantity - item.product.minOrder)}>−</button>
                    <span style={{ fontWeight: 700, minWidth: 36, textAlign: "center", fontSize: "0.88rem" }}>{item.quantity}</span>
                    <button style={{ width: 26, height: 26, borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)", background: "var(--bg-muted)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}
                      onClick={() => updateCartQty(item.product.id, item.quantity + item.product.minOrder)}>+</button>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--primary-600)" }}>
                    {(item.product.basePrice * item.quantity).toLocaleString()} EGP
                  </span>
                  <button style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", transition: "var(--t-fast)" }}
                    onMouseOver={e => e.currentTarget.style.color = "var(--danger)"}
                    onMouseOut={e => e.currentTarget.style.color = "var(--text-muted)"}
                    onClick={() => removeFromCart(item.product.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </Drawer>

      {/* ── NOTIFICATIONS DRAWER ─────────────────── */}
      <Drawer
        id="notifications"
        title={isRTL ? "الإشعارات" : "Notifications"}
        footer={
          userNotifications.some(n => n.unread) && (
            <button className="btn btn-secondary w-full" onClick={markAllNotificationsRead}>
              {isRTL ? "تحديد الكل كمقروء" : "Mark all as read"}
            </button>
          )
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {userNotifications.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: 10 }}>🔔</div>
              <p>{isRTL ? "لا توجد إشعارات جديدة" : "No new notifications"}</p>
            </div>
          ) : (
            userNotifications.map(notif => (
              <div
                key={notif.id}
                style={{
                  padding: "14px 16px",
                  borderRadius: "var(--radius-lg)",
                  background: notif.unread ? "var(--primary-50)" : "var(--bg-muted)",
                  borderInlineStart: `3px solid ${notif.unread ? "var(--primary-500)" : "var(--border-color)"}`,
                  display: "flex", gap: 12, alignItems: "flex-start"
                }}
              >
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: notif.unread ? "var(--primary-100)" : "var(--border-color)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "var(--primary-600)" }}>
                  <Bell size={15} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.85rem", fontWeight: 700, marginBottom: 3 }}>
                    {isRTL ? notif.titleAr : notif.titleEn}
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 4 }}>
                    {isRTL ? notif.descAr : notif.descEn}
                  </div>
                  <div style={{ fontSize: "0.68rem", color: "var(--text-light)" }}>{notif.time}</div>
                </div>
                {notif.unread && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--primary-500)", flexShrink: 0, marginTop: 4 }} />}
              </div>
            ))
          )}
        </div>
      </Drawer>

      {/* ── MOBILE NAV DRAWER ────────────────────── */}
      <Drawer id="mobile-menu" title={t.appName}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {mobileNavLinks.map(link => (
            <button
              key={link.id}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "13px 16px", borderRadius: "var(--radius-md)",
                background: currentPage === link.id ? "var(--primary-50)" : "transparent",
                color: currentPage === link.id ? "var(--primary-600)" : "var(--text-muted)",
                fontWeight: 600, fontSize: "0.9rem", border: "none", cursor: "pointer",
                width: "100%", textAlign: "start", transition: "var(--t-fast)"
              }}
              onClick={() => { setCurrentPage(link.id); setActiveDrawer(null); }}
            >
              {link.icon}
              {link.label}
            </button>
          ))}
          {currentUser && (
            <div style={{ borderTop: "1px solid var(--border-color)", marginTop: 8, paddingTop: 8 }}>
              <button
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 16px", borderRadius: "var(--radius-md)", color: "var(--danger)", fontWeight: 600, fontSize: "0.9rem", border: "none", cursor: "pointer", width: "100%", background: "none" }}
                onClick={() => { logout(); setActiveDrawer(null); }}
              >
                🚪 {t.logout}
              </button>
            </div>
          )}
        </div>
      </Drawer>

      {/* ── AUTH MODAL POPUP ────────────────────── */}
      {authModal && (
        <div className="modal-bg anim-fade-in" onClick={() => setAuthModal(null)}>
          <div className="modal auth-modal-popup anim-scale-in" onClick={(e) => e.stopPropagation()} style={{ maxWidth: authModal === "register" ? 520 : 420 }}>
            <div className="modal-head" style={{ borderBottom: "none", paddingBottom: 0 }}>
              <div />
              <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => setAuthModal(null)}>
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: "0 24px 24px" }}>
              {authModal === "login" ? (
                <Login onNavigate={(p) => { if (p === "register") setAuthModal("register"); else { setCurrentPage(p); setAuthModal(null); } }} />
              ) : (
                <Register onNavigate={(p) => { if (p === "login") setAuthModal("login"); else { setCurrentPage(p); setAuthModal(null); } }} />
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .app-shell { display: flex; flex-direction: column; min-height: 100vh; }
        .w-full { width: 100%; }
      `}</style>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

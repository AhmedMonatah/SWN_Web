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
import ContactUs from "./pages/ContactUs";
import AboutUs from "./pages/AboutUs";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import Drawer from "./components/ui/Drawer";
import { translations } from "./data/translations";
import { Trash2, ArrowRight, Bell, Home as HomeIcon, Package, LayoutDashboard, ClipboardList, User, X } from "lucide-react";

function AppContent() {
  const {
    language, cart, updateCartQty, removeFromCart,
    activeDrawer, setActiveDrawer,
    notifications, markAllNotificationsRead,
    currentUser, logout, performLogout, getDefaultPage
  } = useApp();

  const t = translations[language];
  const isRTL = language === "ar";

  const [currentPage, setCurrentPage] = useState("home");
  const [authModal, setAuthModal] = useState(null); // null, "login", "register"

  const navigateTo = (page) => {
    window.location.hash = `#/${page}`;
  };

  // Auth & Hash routing logic
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#/", "");
      const validPages = ["home", "products", "dashboard", "orders", "profile", "checkout", "contact", "about", "privacy", "terms"];
      const page = hash && validPages.includes(hash) ? hash : "home";

      // Auth routing guard
      if (!currentUser) {
        const protectedPages = ["dashboard", "orders", "profile", "checkout", "contact"];
        if (protectedPages.includes(page)) {
          window.location.hash = "#/home";
          setAuthModal("login");
          return;
        }
      } else {
        setAuthModal(null);
        if (page === "login" || page === "register") {
          window.location.hash = `#/${getDefaultPage(currentUser.role)}`;
          return;
        }
        if (page === "home" && (currentUser.role === "admin" || currentUser.role === "supplier")) {
          window.location.hash = "#/dashboard";
          return;
        }
      }

      setCurrentPage(page);
    };

    handleHashChange();

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [currentUser]);

  // Page render
  const renderPage = () => {
    switch (currentPage) {
      case "home":     return <Home onNavigate={navigateTo} onAuthClick={setAuthModal} />;
      case "products": return <Products onAuthClick={setAuthModal} />;
      case "dashboard":return <Dashboard onNavigate={navigateTo} />;
      case "orders":   return <Orders />;
      case "profile":  return <Profile />;
      case "checkout": return <Checkout onNavigate={navigateTo} />;
      case "contact":  return <ContactUs onAuthClick={setAuthModal} />;
      case "about":    return <AboutUs />;
      case "privacy":  return <PrivacyPolicy />;
      case "terms":    return <TermsOfService />;
      default:         return <Home onNavigate={navigateTo} onAuthClick={setAuthModal} />;
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
    ...(currentUser.role !== "admin" && currentUser.role !== "supplier"
      ? [{ id: "home",      icon: <HomeIcon size={20} />,          label: isRTL ? "الرئيسية" : "Home" }]
      : []),
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
      <Header currentPage={currentPage} onNavigate={navigateTo} onAuthClick={setAuthModal} />
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
                <span>{t.subtotal}</span><span>{subtotal.toLocaleString()} {isRTL ? "ج.م" : "EGP"}</span>
              </div>
              {discount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--success)", fontWeight: 700 }}>
                  <span>{t.discount}</span><span>-{discount.toLocaleString()} {isRTL ? "ج.م" : "EGP"}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 900, fontSize: "1.05rem", color: "var(--primary-600)", borderTop: "1px solid var(--border-color)", paddingTop: 10 }}>
                <span>{t.total}</span><strong>{total.toLocaleString()} {isRTL ? "ج.م" : "EGP"}</strong>
              </div>
              <button
                className="btn btn-primary"
                style={{ width: "100%", padding: 13 }}
                onClick={() => { navigateTo("checkout"); setActiveDrawer(null); }}
              >
                {t.checkout} <ArrowRight size={18} className="mirror-rtl" />
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
                    {item.product.basePrice} {isRTL ? "ج.م" : "EGP"} / {isRTL ? "قطعة" : "unit"}
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
                    {(item.product.basePrice * item.quantity).toLocaleString()} {isRTL ? "ج.م" : "EGP"}
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

      {/* ── LOGOUT CONFIRMATION MODAL ────────────────────── */}
      {activeDrawer === "logout" && (
        <div className="modal-bg anim-fade-in" onClick={() => setActiveDrawer(null)}>
          <div className="modal anim-scale-in" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div className="modal-head" style={{ borderBottom: "none", paddingBottom: 0 }}>
              <div className="modal-title">{isRTL ? "تسجيل الخروج" : "Sign Out"}</div>
              <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => setActiveDrawer(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body" style={{ textAlign: "center", padding: "20px 24px", paddingTop: 10 }}>
              <div style={{ fontSize: "3rem", marginBottom: 16 }}>👋</div>
              <h3 style={{ marginBottom: 12, fontSize: "1.15rem", fontWeight: 800 }}>
                {isRTL ? "هل أنت متأكد من تسجيل الخروج؟" : "Are you sure you want to sign out?"}
              </h3>
              <p style={{ color: "var(--text-muted)", marginBottom: 20, fontSize: "0.85rem", lineHeight: 1.5 }}>
                {isRTL
                  ? "سيتم تسجيل خروجك من النظام وستحتاج إلى تسجيل الدخول مرة أخرى للوصول إلى حسابك."
                  : "You will be logged out of the system and need to sign in again to access your account."}
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                <button className="btn btn-secondary" onClick={() => setActiveDrawer(null)} style={{ flex: 1, padding: "10px" }}>
                  {isRTL ? "إلغاء" : "Cancel"}
                </button>
                <button
                  className="btn btn-primary"
                  style={{ background: "var(--danger)", border: "none", flex: 1, padding: "10px" }}
                  onClick={() => performLogout()}
                >
                  {isRTL ? "تسجيل خروج" : "Sign Out"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
              onClick={() => { navigateTo(link.id); setActiveDrawer(null); }}
            >
              {link.icon}
              {link.label}
            </button>
          ))}
          {currentUser && (
            <div style={{ borderTop: "1px solid var(--border-color)", marginTop: 8, paddingTop: 8 }}>
              <button
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 16px", borderRadius: "var(--radius-md)", color: "var(--danger)", fontWeight: 600, fontSize: "0.9rem", border: "none", cursor: "pointer", width: "100%", background: "none" }}
                onClick={() => { setActiveDrawer("logout"); }}
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
                <Login onNavigate={(p) => { if (p === "register") setAuthModal("register"); else { navigateTo(p); setAuthModal(null); } }} />
              ) : (
                <Register onNavigate={(p) => { if (p === "login") setAuthModal("login"); else { navigateTo(p); setAuthModal(null); } }} />
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

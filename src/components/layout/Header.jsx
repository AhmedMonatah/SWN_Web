import React, { useState, useRef, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { Sun, Moon, Globe, Bell, ShoppingCart, ChevronDown, LogOut, User, LayoutDashboard, Package, ClipboardList, Settings, Menu, X } from "lucide-react";

const NAV_ICONS = {
  dashboard: <LayoutDashboard size={15} />,
  products:  <Package size={15} />,
  orders:    <ClipboardList size={15} />,
};

const NAV_LABELS = {
  dashboard: { en: "Dashboard",   ar: "لوحة التحكم" },
  products:  { en: "Products",    ar: "المنتجات" },
  orders:    { en: "My Orders",   ar: "طلباتي" },
};

const ROLE_LABEL = {
  supplier:   { en: "Supplier",    ar: "مورد" },
  wholesaler: { en: "Wholesaler",  ar: "تاجر جملة" },
  retailer:   { en: "Retailer",   ar: "تاجر تجزئة" },
  admin:      { en: "Admin",      ar: "مدير" },
};

export default function Header({ currentPage, onNavigate, onAuthClick }) {
  const {
    language, setLanguage,
    theme, toggleTheme,
    currentUser, logout,
    cart, notifications,
    setActiveDrawer, getNavForRole,
  } = useApp();

  const isRTL = language === "ar";
  const L = (en, ar) => isRTL ? ar : en;

  const [dropOpen, setDropOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const fn = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const navLinks = currentUser ? getNavForRole(currentUser.role) : [];
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const unread = notifications.filter(n => n.unread).length;
  const canBuy = currentUser && ["wholesaler", "retailer"].includes(currentUser.role);

  const initials = currentUser
    ? currentUser.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
    : "";

  const handleNav = (page) => {
    onNavigate(page);
    setDropOpen(false);
    setMobileOpen(false);
  };

  const isDarkHeader = currentPage === "home";

  return (
    <>
      <header className={`site-header${isDarkHeader ? " header-dark" : ""}`}>
        <div className="header-inner">
          {/* Logo */}
          <div className="header-logo" onClick={() => currentUser ? handleNav(navLinks[0] || "dashboard") : handleNav("home")} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
            <img src="/Web_Logo.png" alt="SWN Logo" style={{ height: 34, objectFit: "contain", borderRadius: "var(--radius-sm)" }} />
            <div>
              <div className="header-logo-name" style={{ fontSize: "1.05rem", fontWeight: 800 }}>SWN</div>
              <div className="header-logo-sub">{L("B2B Platform", "منصة B2B")}</div>
            </div>
          </div>

          {/* Desktop Nav */}
          {currentUser ? (
            <nav className="header-nav" style={{ marginInlineStart: 20 }}>
              {navLinks.map(id => (
                <button
                  key={id}
                  className={`nav-link ${currentPage === id ? "active" : ""}`}
                  onClick={() => handleNav(id)}
                >
                  {NAV_ICONS[id]}
                  {L(NAV_LABELS[id].en, NAV_LABELS[id].ar)}
                </button>
              ))}
            </nav>
          ) : (
            <nav className="header-nav" style={{ marginInlineStart: 20 }}>
              <button className={`nav-link ${currentPage === "home" ? "active" : ""}`} onClick={() => handleNav("home")}>
                {L("Home", "الرئيسية")}
              </button>
              <button className={`nav-link ${currentPage === "products" ? "active" : ""}`} onClick={() => handleNav("products")}>
                {L("Products", "المنتجات")}
              </button>
              <button className="nav-link" onClick={() => onAuthClick("login")}>
                {L("Suppliers", "الموردين")}
              </button>
              <button className="nav-link" onClick={() => onAuthClick("login")}>
                {L("Offers", "العروض")}
              </button>
              <button className="nav-link" onClick={() => onAuthClick("login")}>
                {L("About Us", "من نحن")}
              </button>
              <button className="nav-link" onClick={() => onAuthClick("login")}>
                {L("Contact Us", "تواصل معنا")}
              </button>
            </nav>
          )}

          {/* Right actions */}
          <div className="header-right">
            {/* Theme toggle */}
            <button className="icon-btn" onClick={toggleTheme} title={L("Toggle theme", "تبديل المظهر")}>
              {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* Language */}
            <button className="icon-btn" onClick={() => setLanguage(isRTL ? "en" : "ar")} title={L("العربية", "English")} style={{ fontSize: ".72rem", fontWeight: 700, width: 36, height: 36 }}>
              {isRTL ? "EN" : "ع"}
            </button>

            {currentUser ? (
              <>
                {/* Notifications */}
                <button className="icon-btn" onClick={() => setActiveDrawer("notifications")} title={L("Notifications", "الإشعارات")}>
                  <Bell size={17} />
                  {unread > 0 && <span className="badge-dot">{unread > 9 ? "9+" : unread}</span>}
                </button>

                {/* Cart (buyers only) */}
                {canBuy && (
                  <button className="icon-btn" onClick={() => setActiveDrawer("cart")} title={L("Cart", "السلة")}>
                    <ShoppingCart size={17} />
                    {cartCount > 0 && <span className="badge-dot">{cartCount > 9 ? "9+" : cartCount}</span>}
                  </button>
                )}

                {/* User dropdown */}
                <div style={{ position: "relative" }} ref={dropRef}>
                  <button className="user-btn" onClick={() => setDropOpen(o => !o)}>
                    <div className="user-avatar">
                      {currentUser.profileImage
                        ? <img src={currentUser.profileImage} alt="" />
                        : initials}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                      <span className="user-name">{isRTL ? currentUser.nameAr || currentUser.name : currentUser.name || currentUser.nameAr}</span>
                      <span className="user-role">{L(ROLE_LABEL[currentUser.role]?.en, ROLE_LABEL[currentUser.role]?.ar)}</span>
                    </div>
                    <ChevronDown size={13} style={{ color: "var(--text-4)", marginInlineStart: 2, transform: dropOpen ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
                  </button>

                  {dropOpen && (
                    <div className="dropdown">
                      <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)" }}>
                        <div style={{ fontSize: ".78rem", fontWeight: 700, color: "var(--text-1)" }}>
                          {isRTL ? currentUser.companyNameAr || currentUser.companyName : currentUser.companyName || currentUser.companyNameAr}
                        </div>
                        <div style={{ marginTop: 4 }}>
                          <span className={`role-chip chip-${currentUser.role}`}>
                            {L(ROLE_LABEL[currentUser.role]?.en, ROLE_LABEL[currentUser.role]?.ar)}
                          </span>
                        </div>
                      </div>
                      <div className="dropdown-divider" />
                      <button className="dropdown-item" onClick={() => handleNav("profile")}>
                        <Settings size={14} /> {L("Profile & Settings", "الملف الشخصي")}
                      </button>
                      <div className="dropdown-divider" />
                      <button className="dropdown-item danger" onClick={() => { logout(); setDropOpen(false); }}>
                        <LogOut size={14} /> {L("Sign Out", "تسجيل الخروج")}
                      </button>
                    </div>
                  )}
                </div>

                {/* Mobile hamburger */}
                <button className="icon-btn" style={{ display: "none" }} id="ham-btn" onClick={() => setMobileOpen(true)}>
                  <Menu size={19} />
                </button>
              </>
            ) : (
              <div style={{ display: "flex", gap: 7 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => onAuthClick("login")} style={{ color: "var(--header-text)" }}>
                  {L("Sign In", "تسجيل الدخول")}
                </button>
                <button className="btn btn-primary btn-sm" onClick={() => onAuthClick("register")}>
                  {L("Register", "إنشاء حساب")}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Nav Overlay */}
      {mobileOpen && (
        <>
          <div className="drawer-overlay" onClick={() => setMobileOpen(false)} />
          <div className="drawer" style={{ width: "280px" }}>
            <div className="drawer-head">
              <span className="drawer-title">Menu</span>
              <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => setMobileOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="drawer-body" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {currentUser ? (
                navLinks.map(id => (
                  <button
                    key={id}
                    style={{
                      display: "flex", alignItems: "center", gap: 10, padding: "12px 14px",
                      borderRadius: "var(--radius-md)", border: "none", cursor: "pointer", textAlign: "start",
                      background: currentPage === id ? "var(--brand-50)" : "transparent",
                      color: currentPage === id ? "var(--brand)" : "var(--text-2)",
                      fontWeight: 600, fontSize: ".88rem", width: "100%",
                    }}
                    onClick={() => handleNav(id)}
                  >
                    {NAV_ICONS[id]}
                    {L(NAV_LABELS[id].en, NAV_LABELS[id].ar)}
                  </button>
                ))
              ) : (
                <>
                  <button style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: "var(--radius-md)", border: "none", cursor: "pointer", textAlign: "start", background: currentPage === "home" ? "var(--brand-50)" : "transparent", color: currentPage === "home" ? "var(--brand)" : "var(--text-2)", fontWeight: 600, fontSize: ".88rem", width: "100%" }} onClick={() => handleNav("home")}>
                    {L("Home", "الرئيسية")}
                  </button>
                  <button style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: "var(--radius-md)", border: "none", cursor: "pointer", textAlign: "start", background: currentPage === "products" ? "var(--brand-50)" : "transparent", color: currentPage === "products" ? "var(--brand)" : "var(--text-2)", fontWeight: 600, fontSize: ".88rem", width: "100%" }} onClick={() => handleNav("products")}>
                    {L("Products", "المنتجات")}
                  </button>
                </>
              )}
              <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "8px 0" }} />
              {currentUser ? (
                <button
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: "var(--radius-md)", border: "none", cursor: "pointer", textAlign: "start", background: "transparent", color: "var(--danger)", fontWeight: 600, fontSize: ".88rem", width: "100%" }}
                  onClick={() => { logout(); setMobileOpen(false); }}
                >
                  <LogOut size={16} /> {L("Sign Out", "تسجيل الخروج")}
                </button>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "8px 14px" }}>
                  <button className="btn btn-secondary w-full" onClick={() => { onAuthClick("login"); setMobileOpen(false); }}>
                    {L("Sign In", "تسجيل الدخول")}
                  </button>
                  <button className="btn btn-primary w-full" onClick={() => { onAuthClick("register"); setMobileOpen(false); }}>
                    {L("Register", "إنشاء حساب")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <style>{`
        @media (max-width: 1024px) { #ham-btn { display: flex !important; } }
      `}</style>
    </>
  );
}

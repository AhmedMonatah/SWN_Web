import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { db } from "../services/db";

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

const getNavForRole = (role) => {
  if (role === "supplier")   return ["dashboard", "orders"];
  if (role === "wholesaler") return ["products", "orders"];
  if (role === "retailer")   return ["products", "orders"];
  if (role === "admin")      return ["dashboard", "orders"];
  return [];
};

const getDefaultPage = (role) => {
  if (role === "supplier" || role === "admin") return "dashboard";
  return "products";
};

export function AppProvider({ children }) {
  // ── Theme ─────────────────────────────────────
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem("swn_theme") || "light";
  });
  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setThemeState(next);
    localStorage.setItem("swn_theme", next);
  };
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // ── Language ──────────────────────────────────
  const [language, setLangState] = useState(() => localStorage.getItem("swn_lang") || "en");
  const setLanguage = (lang) => {
    setLangState(lang);
    localStorage.setItem("swn_lang", lang);
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  };
  useEffect(() => {
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language]);

  // ── DB init ───────────────────────────────────
  useEffect(() => { db.seed(); }, []);

  // ── Session / current user ────────────────────
  const [currentUser, setCurrentUserState] = useState(() => db.getSession());
  const setCurrentUser = (user) => {
    setCurrentUserState(user);
    if (user) db.setSession(user.id);
    else db.clearSession();
  };
  const logout = () => {
    const confirmMsg = language === "ar" ? "هل أنت متأكد من تسجيل الخروج؟" : "Are you sure you want to sign out?";
    if (!window.confirm(confirmMsg)) return;
    db.clearSession();
    setCurrentUserState(null);
    setProducts([]);
    setOrders([]);
    setCart([]);
  };

  // ── Products ──────────────────────────────────
  const [products, setProducts] = useState([]);
  const loadProducts = useCallback(() => {
    setProducts(db.getProducts());
  }, []);
  useEffect(() => { loadProducts(); }, [loadProducts]);

  const addNewProduct = (data) => {
    const imageColors = ["#dbeafe","#dcfce7","#fce7f3","#fef3c7","#ede9fe","#e0f2fe"];
    db.addProduct({
      ...data,
      sellerId:      currentUser.id,
      sellerName:    currentUser.name,
      sellerNameAr:  currentUser.nameAr || currentUser.name,
      sellerRole:    currentUser.role,
      imageColor:    imageColors[Math.floor(Math.random() * imageColors.length)],
      tiers:         data.tiers || [{ minQty: data.minOrder, discount: 0 }],
    });
    loadProducts();
  };

  const deleteProduct = (id) => {
    db.deleteProduct(id);
    loadProducts();
  };

  const approveProduct = (id) => {
    db.approveProduct(id);
    loadProducts();
    showToast(language === "ar" ? "تم قبول المنتج بنجاح" : "Product approved successfully", "success");
  };

  const rejectProduct = (id) => {
    db.rejectProduct(id);
    loadProducts();
    showToast(language === "ar" ? "تم رفض المنتج" : "Product rejected", "info");
  };

  // ── Users (for admin) ──────────────────────────
  const [users, setUsers] = useState([]);
  const loadUsers = useCallback(() => {
    if (currentUser?.role === "admin") {
      setUsers(db.getJSON?.("swn_db_users") || db.getUsers());
    } else {
      setUsers([]);
    }
  }, [currentUser]);
  useEffect(() => { loadUsers(); }, [loadUsers]);

  const approveDocument = (userId, docKey) => {
    db.approveDocument(userId, docKey);
    loadUsers();
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(db.getUserById(userId));
    }
    showToast(language === "ar" ? "تم قبول المستند بنجاح" : "Document approved successfully", "success");
  };

  const rejectDocument = (userId, docKey) => {
    db.rejectDocument(userId, docKey);
    loadUsers();
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(db.getUserById(userId));
    }
    showToast(language === "ar" ? "تم رفض المستند" : "Document rejected", "info");
  };

  // ── Orders ────────────────────────────────────
  const [orders, setOrders] = useState([]);
  const loadOrders = useCallback(() => {
    if (!currentUser) { setOrders([]); return; }
    setOrders(db.getOrdersForRole(currentUser.role, currentUser.id));
  }, [currentUser]);
  useEffect(() => { loadOrders(); }, [loadOrders]);

  const createOrder = (data) => {
    const order = db.addOrder({
      ...data,
      buyerId:      currentUser.id,
      buyerName:    currentUser.name,
      buyerNameAr:  currentUser.nameAr || currentUser.name,
      status:       "pending",
      timeline:     [{ status: "pending", time: new Date().toISOString() }],
    });
    setCart([]);
    loadOrders();
    // Refresh current user session to update tier calculations instantly
    setCurrentUser(db.getUserById(currentUser.id));
    return order;
  };

  const updateOrderStatus = (orderId, newStatus) => {
    db.updateOrderStatus(orderId, newStatus);
    loadOrders();
    // Refresh current user session to update tier calculations instantly
    setCurrentUser(db.getUserById(currentUser.id));
  };

  // ── Cart ──────────────────────────────────────
  const [cart, setCart] = useState([]);
  const addToCart = (product, qty) => {
    setCart(prev => {
      const idx = prev.findIndex(i => i.product.id === product.id);
      if (idx > -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + qty };
        return next;
      }
      return [...prev, { product, quantity: qty }];
    });
  };
  const updateCartQty = (productId, qty) => {
    if (qty <= 0) { removeFromCart(productId); return; }
    setCart(prev => prev.map(i => i.product.id === productId ? { ...i, quantity: qty } : i));
  };
  const removeFromCart = (productId) => setCart(prev => prev.filter(i => i.product.id !== productId));
  const clearCart = () => setCart([]);

  // ── Notifications ─────────────────────────────
  const [notifications, setNotifications] = useState([]);
  const markAllRead = () => setNotifications(n => n.map(x => ({ ...x, unread: false })));
  const markAllNotificationsRead = markAllRead;

  // ── Drawer ────────────────────────────────────
  const [activeDrawer, setActiveDrawer] = useState(null);

  // ── Toast ─────────────────────────────────────
  const [toasts, setToasts] = useState([]);
  const showToast = (msg, type = "ok") => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  };

  const value = {
    theme, toggleTheme,
    language, setLanguage,
    currentUser, setCurrentUser, logout,
    products, loadProducts, addNewProduct, deleteProduct, approveProduct, rejectProduct,
    users, loadUsers, approveDocument, rejectDocument,
    orders, loadOrders, createOrder, updateOrderStatus,
    cart, addToCart, updateCartQty, removeFromCart, clearCart,
    notifications, markAllRead, markAllNotificationsRead,
    activeDrawer, setActiveDrawer,
    toasts, showToast,
    getNavForRole, getDefaultPage,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

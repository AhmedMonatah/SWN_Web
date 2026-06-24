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
    if (user) {
      db.setSession(user.id);
      loadProducts();
      loadOrders(user);
      loadUsers(user);
      loadNotifications(user);
    } else {
      db.clearSession();
    }
  };
  const performLogout = () => {
    db.clearSession();
    setCurrentUserState(null);
    setProducts([]);
    setOrders([]);
    setCart([]);
    setActiveDrawer(null);
    window.location.href = window.location.origin + window.location.pathname;
  };
  const logout = () => {
    setActiveDrawer("logout");
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
    const prod = db.approveProduct(id);
    loadProducts();
    if (prod) {
      db.addNotification({
        userId: prod.sellerId,
        titleEn: "Product Approved",
        titleAr: "تم قبول المنتج",
        descEn: `Your product "${prod.nameEn}" has been approved and is now live!`,
        descAr: `تمت الموافقة على منتجك "${prod.nameAr || prod.nameEn}" وهو متوفر الآن على المنصة!`
      });
      loadNotifications();
    }
    showToast(language === "ar" ? "تم قبول المنتج بنجاح" : "Product approved successfully", "success");
  };

  const rejectProduct = (id, reason) => {
    const prod = db.rejectProduct(id, reason);
    loadProducts();
    if (prod) {
      db.addNotification({
        userId: prod.sellerId,
        titleEn: "Product Rejected",
        titleAr: "تم رفض المنتج",
        descEn: `Your product "${prod.nameEn}" was rejected by the admin. Reason: ${reason}`,
        descAr: `تم رفض منتجك "${prod.nameAr || prod.nameEn}" من قِبل الإدارة. السبب: ${reason}`
      });
      loadNotifications();
    }
    showToast(language === "ar" ? "تم رفض المنتج" : "Product rejected", "info");
  };

  // ── Users (for admin) ──────────────────────────
  const [users, setUsers] = useState([]);
  const loadUsers = useCallback((user = currentUser) => {
    if (user?.role === "admin") {
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

  const deleteUser = (userId) => {
    db.deleteUser(userId);
    loadUsers();
    loadProducts();
    loadOrders();
    showToast(language === "ar" ? "تم حذف الحساب بنجاح" : "Account deleted successfully", "success");
  };

  // ── Orders ────────────────────────────────────
  const [orders, setOrders] = useState([]);
  const loadOrders = useCallback((user = currentUser) => {
    if (!user) { setOrders([]); return; }
    setOrders(db.getOrdersForRole(user.role, user.id));
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
    
    // Deduct remaining stock
    if (data.items?.length) {
      data.items.forEach(item => {
        const prod = products.find(p => p.id === item.productId);
        if (prod) {
          const nextQty = Math.max(0, prod.quantity - item.quantity);
          db.updateProduct(prod.id, { quantity: nextQty });
        }
      });
      loadProducts();
    }
    
    setCart([]);
    loadOrders();
    if (data.items?.length) {
      const sellers = {};
      data.items.forEach(item => {
        const sId = item.sellerId || products.find(x => x.id === item.productId || x.id === item.id)?.sellerId;
        if (sId) {
          if (!sellers[sId]) sellers[sId] = [];
          sellers[sId].push(item);
        }
      });
      Object.keys(sellers).forEach(sellerId => {
        const itemsList = sellers[sellerId];
        const namesEn = itemsList.map(x => x.nameEn || x.product?.nameEn).join(", ");
        const namesAr = itemsList.map(x => x.nameAr || x.product?.nameAr || x.nameEn || x.product?.nameEn).join(", ");
        db.addNotification({
          userId: Number(sellerId),
          titleEn: "New Order Received",
          titleAr: "طلب شراء جديد",
          descEn: `You received a new order from ${currentUser.name} for: ${namesEn}`,
          descAr: `لقد استلمت طلب شراء جديد من ${currentUser.nameAr || currentUser.name} لمنتجات: ${namesAr}`
        });
      });
      loadNotifications();
    }
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
      let newQty = qty;
      if (idx > -1) {
        newQty = prev[idx].quantity + qty;
      }
      
      // Stock checking validation
      if (newQty > product.quantity) {
        alert(language === "ar"
          ? `المخزون غير كافٍ! الكمية المتاحة في المخزون هي ${product.quantity} قطعة فقط.`
          : `Insufficient stock! Only ${product.quantity} units are remaining in stock.`
        );
        return prev;
      }

      // Max Order Quantity validation
      if (product.maxOrder && newQty > product.maxOrder) {
        alert(language === "ar"
          ? `الحد الأقصى للطلب هو ${product.maxOrder} قطعة فقط لكل طلب.`
          : `Maximum order limit is ${product.maxOrder} units per order.`
        );
        return prev;
      }

      if (idx > -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: newQty };
        return next;
      }
      return [...prev, { product, quantity: qty }];
    });
  };
  
  const updateCartQty = (productId, qty) => {
    if (qty <= 0) { removeFromCart(productId); return; }
    
    const prod = products.find(p => p.id === productId);
    if (prod) {
      // Resolve role-specific maxOrder
      const role = currentUser?.role;
      const maxOrderVal = role === "wholesaler" ? (prod.maxOrderWholesaler || prod.maxOrder) : (prod.maxOrderRetailer || prod.maxOrder);

      if (qty > prod.quantity) {
        alert(language === "ar"
          ? `المخزون غير كافٍ! الكمية المتاحة في المخزون هي ${prod.quantity} قطعة فقط.`
          : `Insufficient stock! Only ${prod.quantity} units are remaining in stock.`
        );
        return;
      }

      if (maxOrderVal && qty > maxOrderVal) {
        alert(language === "ar"
          ? `الحد الأقصى للطلب هو ${maxOrderVal} قطعة فقط لكل طلب.`
          : `Maximum order limit is ${maxOrderVal} units per order.`
        );
        return;
      }
    }
    
    setCart(prev => prev.map(i => i.product.id === productId ? { ...i, quantity: qty } : i));
  };
  const removeFromCart = (productId) => setCart(prev => prev.filter(i => i.product.id !== productId));
  const clearCart = () => setCart([]);

  // ── Notifications ─────────────────────────────
  const [notifications, setNotifications] = useState([]);
  const loadNotifications = useCallback((user = currentUser) => {
    if (!user) { setNotifications([]); return; }
    const allNotifs = db.getNotifications();
    setNotifications(allNotifs.filter(n => n.userId === user.id || n.role === user.role || (!n.userId && !n.role)));
  }, [currentUser]);
  useEffect(() => { loadNotifications(); }, [loadNotifications]);

  const markAllRead = () => {
    if (currentUser) {
      db.markNotificationsRead(currentUser.id);
      loadNotifications();
    }
  };
  const markAllNotificationsRead = markAllRead;

  // ── Contact Messages ──────────────────────────
  const [contactMessages, setContactMessages] = useState([]);
  const loadContactMessages = useCallback(() => {
    setContactMessages(db.getContactMessages());
  }, []);
  useEffect(() => { loadContactMessages(); }, [loadContactMessages]);

  const sendContactMessage = (msgData) => {
    db.addContactMessage(msgData);
    loadContactMessages();
    showToast(language === "ar" ? "تم إرسال رسالتك بنجاح للمدير" : "Your message was sent successfully to Admin", "success");
  };

  const replyContactMessage = (id, replyText) => {
    const msg = db.replyToContactMessage(id, replyText);
    loadContactMessages();
    if (msg) {
      db.addNotification({
        userId: msg.userId,
        titleEn: "New Reply from Support",
        titleAr: "رد جديد من الدعم الفني",
        descEn: `Support replied to your message "${msg.subject}": ${replyText}`,
        descAr: `قام الدعم بالرد على رسالتك "${msg.subject}": ${replyText}`
      });
      loadNotifications();
    }
    showToast(language === "ar" ? "تم إرسال الرد بنجاح" : "Reply sent successfully", "success");
  };

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
    currentUser, setCurrentUser, logout, performLogout,
    products, loadProducts, addNewProduct, deleteProduct, approveProduct, rejectProduct,
    users, loadUsers, approveDocument, rejectDocument, deleteUser,
    orders, loadOrders, createOrder, updateOrderStatus,
    cart, addToCart, updateCartQty, removeFromCart, clearCart,
    notifications, markAllRead, markAllNotificationsRead,
    contactMessages, sendContactMessage, replyContactMessage,
    activeDrawer, setActiveDrawer,
    toasts, showToast,
    getNavForRole, getDefaultPage,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

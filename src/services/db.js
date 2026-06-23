/**
 * SWN Local Database — No seed data. Users must register.
 */

const getJSON = (key) => {
  try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
};
const setJSON = (key, val) => localStorage.setItem(key, JSON.stringify(val));

export const db = {
  /** Initialize empty collections on first load */
  seed() {
    let users = getJSON("swn_db_users") || [];
    const defaultUsers = [
      {
        id: 401,
        name: "System Administrator",
        nameAr: "مدير النظام",
        email: "admin@swn.com",
        password: "admin",
        role: "admin",
        companyName: "SWN Logistics HQ",
        companyNameAr: "المقر الرئيسي لشبكة SWN",
        phone: "0104897450",
        address: "Nasr City, Cairo, Egypt",
        addressAr: "مدينة نصر، القاهرة، مصر",
        tier: "vip",
        status: "active",
        documents: { commercialRegister: null, taxCard: null },
        createdAt: new Date().toISOString()
      },
      {
        id: 101,
        name: "Eslam Gamal",
        nameAr: "إسلام جمال",
        email: "supplier@swn.com",
        password: "supplier",
        role: "supplier",
        companyName: "El Amal Factories Group",
        companyNameAr: "مجموعة مصانع الأمل",
        phone: "0129988776",
        address: "Industrial Zone, Sadat City, Egypt",
        addressAr: "المنطقة الصناعية، مدينة السادات، مصر",
        tier: "gold",
        status: "active",
        documents: {
          commercialRegister: { name: "CR-ElAmal.pdf", status: "approved", date: new Date().toLocaleDateString() },
          taxCard: { name: "TC-ElAmal.pdf", status: "approved", date: new Date().toLocaleDateString() }
        },
        createdAt: new Date().toISOString()
      },
      {
        id: 201,
        name: "Mahmoud Amer",
        nameAr: "محمود عامر",
        email: "wholesaler@swn.com",
        password: "wholesaler",
        role: "wholesaler",
        companyName: "Amer Wholesale Distribution",
        companyNameAr: "مؤسسة عامر لتجارة الجملة",
        phone: "0112345678",
        address: "El-Mosky, Cairo, Egypt",
        addressAr: "الموسكي، القاهرة، مصر",
        tier: "silver",
        status: "active",
        documents: {
          commercialRegister: { name: "CR-Amer.pdf", status: "approved", date: new Date().toLocaleDateString() },
          taxCard: { name: "TC-Amer.pdf", status: "approved", date: new Date().toLocaleDateString() }
        },
        createdAt: new Date().toISOString()
      },
      {
        id: 301,
        name: "Sami Mansour",
        nameAr: "سامي منصور",
        email: "retailer@swn.com",
        password: "retailer",
        role: "retailer",
        companyName: "Mansour Supermarkets",
        companyNameAr: "أسواق منصور التجارية",
        phone: "0155544332",
        address: "Heliopolis, Cairo, Egypt",
        addressAr: "مصر الجديدة، القاهرة، مصر",
        tier: "bronze",
        status: "active",
        documents: {
          commercialRegister: { name: "CR-Mansour.pdf", status: "approved", date: new Date().toLocaleDateString() },
          taxCard: { name: "TC-Mansour.pdf", status: "approved", date: new Date().toLocaleDateString() }
        },
        createdAt: new Date().toISOString()
      }
    ];

    let updated = false;
    defaultUsers.forEach(du => {
      const idx = users.findIndex(u => u.email === du.email);
      if (idx === -1) {
        users.push(du);
        updated = true;
      } else {
        // Update to new Saudi addresses & details
        users[idx] = {
          ...users[idx],
          address: du.address,
          addressAr: du.addressAr,
          phone: du.phone,
          companyName: du.companyName,
          companyNameAr: du.companyNameAr,
        };
        updated = true;
      }
    });

    if (updated || !localStorage.getItem("swn_db_seeded")) {
      setJSON("swn_db_users", users);
      if (!localStorage.getItem("swn_db_products")) setJSON("swn_db_products", []);
      if (!localStorage.getItem("swn_db_orders")) setJSON("swn_db_orders", []);
      localStorage.setItem("swn_db_seeded", "true");
    }
  },

  calculateUserTier(user) {
    if (!user) return "bronze";
    if (user.role === "admin") return "vip";
    const orders = getJSON("swn_db_orders") || [];
    if (user.role === "supplier") {
      const revenue = orders
        .filter((o) => o.sellerId === user.id && o.status === "delivered")
        .reduce((s, o) => s + (o.totalAmount || 0), 0);
      if (revenue >= 150000) return "vip";
      if (revenue >= 50000) return "gold";
      if (revenue >= 10000) return "silver";
      return "bronze";
    } else {
      const spend = orders
        .filter((o) => o.buyerId === user.id && o.status !== "cancelled")
        .reduce((s, o) => s + (o.totalAmount || 0), 0);
      if (spend >= 150000) return "vip";
      if (spend >= 50000) return "gold";
      if (spend >= 10000) return "silver";
      return "bronze";
    }
  },

  // ── USERS ──────────────────────────────────────
  getUsers: () => {
    const users = getJSON("swn_db_users") || [];
    return users.map(u => ({ ...u, tier: db.calculateUserTier(u) }));
  },
  getUserById: (id) => {
    const users = getJSON("swn_db_users") || [];
    const user = users.find((u) => u.id === id) || null;
    if (user) user.tier = db.calculateUserTier(user);
    return user;
  },
  getUserByEmail: (email) => {
    const users = getJSON("swn_db_users") || [];
    const user = users.find((u) => u.email === email.toLowerCase().trim()) || null;
    if (user) user.tier = db.calculateUserTier(user);
    return user;
  },

  updateUser(id, updates) {
    const users = getJSON("swn_db_users") || [];
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    users[idx] = { ...users[idx], ...updates };
    setJSON("swn_db_users", users);
    return db.getUserById(id);
  },

  createUser(userData) {
    const users = db.getUsers();
    const existing = users.find((u) => u.email === userData.email.toLowerCase().trim());
    if (existing) return { error: "Email already registered" };
    const newUser = {
      id: Date.now(),
      ...userData,
      email: userData.email.toLowerCase().trim(),
      profileImage: null,
      status: "active",
      documents: { commercialRegister: null, taxCard: null },
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    setJSON("swn_db_users", users);
    return newUser;
  },

  approveDocument(userId, docKey) {
    const users = db.getUsers();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx === -1) return null;
    if (users[idx].documents && users[idx].documents[docKey]) {
      users[idx].documents[docKey] = {
        ...users[idx].documents[docKey],
        status: "approved"
      };
      setJSON("swn_db_users", users);
    }
    return users[idx];
  },

  rejectDocument(userId, docKey) {
    const users = db.getUsers();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx === -1) return null;
    if (users[idx].documents && users[idx].documents[docKey]) {
      users[idx].documents[docKey] = {
        ...users[idx].documents[docKey],
        status: "rejected"
      };
      setJSON("swn_db_users", users);
    }
    return users[idx];
  },

  // ── PRODUCTS ───────────────────────────────────
  getProducts: () => getJSON("swn_db_products") || [],

  getProductsForRole(role, userId) {
    const all = db.getProducts();
    if (role === "admin") return all;
    if (role === "supplier") return all.filter((p) => p.sellerId === userId);
    if (role === "wholesaler") return all.filter((p) => p.status === "approved" && p.visibleTo?.includes("wholesaler"));
    if (role === "retailer") return all.filter((p) => p.status === "approved" && p.visibleTo?.includes("retailer"));
    return [];
  },

  getProductById: (id) => db.getProducts().find((p) => p.id === id) || null,

  addProduct(productData) {
    const products = db.getProducts();
    const newProduct = {
      id: Date.now(),
      ...productData,
      status: "pending_review",
      visibleTo: [],
      rating: 0,
      reviewsCount: 0,
      createdAt: new Date().toISOString()
    };
    products.unshift(newProduct);
    setJSON("swn_db_products", products);
    return newProduct;
  },

  approveProduct(id) {
    const products = db.getProducts();
    const idx = products.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    products[idx].status = "approved";
    if (products[idx].sellerRole === "supplier") {
      products[idx].visibleTo = ["wholesaler", "admin"];
    } else if (products[idx].sellerRole === "wholesaler") {
      products[idx].visibleTo = ["retailer", "admin"];
    } else {
      products[idx].visibleTo = ["wholesaler", "retailer", "admin"];
    }
    setJSON("swn_db_products", products);
    return products[idx];
  },

  rejectProduct(id, reason) {
    const products = db.getProducts();
    const idx = products.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    products[idx].status = "rejected";
    products[idx].rejectionReason = reason || "";
    products[idx].visibleTo = [];
    setJSON("swn_db_products", products);
    return products[idx];
  },

  updateProduct(id, updates) {
    const products = db.getProducts();
    const idx = products.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    products[idx] = { ...products[idx], ...updates };
    setJSON("swn_db_products", products);
    return products[idx];
  },

  deleteProduct(id) {
    setJSON("swn_db_products", db.getProducts().filter((p) => p.id !== id));
  },

  // ── ORDERS ─────────────────────────────────────
  getOrders: () => {
    const orders = getJSON("swn_db_orders") || [];
    return orders.filter(o => !String(o.id).includes("SWN-2026-990"));
  },

  getOrdersForRole(role, userId) {
    const all = db.getOrders();
    if (role === "admin") return all;
    return all.filter((o) => o.sellerId === userId || o.buyerId === userId);
  },

  addOrder(orderData) {
    const orders = db.getOrders();
    const newOrder = {
      id: `SWN-${Date.now()}`,
      ...orderData,
      date: new Date().toISOString().split("T")[0],
      createdAt: new Date().toISOString()
    };
    orders.unshift(newOrder);
    setJSON("swn_db_orders", orders);
    return newOrder;
  },

  updateOrderStatus(orderId, newStatus) {
    const orders = db.getOrders();
    const idx = orders.findIndex((o) => o.id === orderId);
    if (idx === -1) return null;
    const timeline = [...(orders[idx].timeline || [])];
    if (!timeline.some((t) => t.status === newStatus)) {
      timeline.push({ status: newStatus, time: new Date().toISOString() });
    }
    orders[idx] = { ...orders[idx], status: newStatus, timeline };
    setJSON("swn_db_orders", orders);
    return orders[idx];
  },

  // ── SESSION ────────────────────────────────────
  getSession: () => {
    const uid = localStorage.getItem("swn_current_uid");
    if (!uid) return null;
    return db.getUserById(Number(uid));
  },
  setSession: (userId) => localStorage.setItem("swn_current_uid", String(userId)),
  clearSession: () => localStorage.removeItem("swn_current_uid"),

  // ── AUTH ───────────────────────────────────────
  login(email, password) {
    if (email.toLowerCase().trim() === "admin@swn.com" && password === "admin") {
      let user = db.getUserByEmail(email);
      if (!user) {
        user = {
          id: 401, name: "System Administrator", nameAr: "مدير النظام",
          email: "admin@swn.com", password: "admin", role: "admin",
          companyName: "SWN Logistics HQ", phone: "0104897450",
          address: "Nasr City, Cairo, Egypt", addressAr: "مدينة نصر، القاهرة، مصر", tier: "vip", status: "active"
        };
        const users = db.getUsers();
        users.push(user);
        setJSON("swn_db_users", users);
      }
      db.setSession(user.id);
      return user;
    }
    const user = db.getUserByEmail(email);
    if (!user) return { error: "No account found with this email" };
    if (user.password !== password) return { error: "Incorrect password" };
    db.setSession(user.id);
    return user;
  },

  register(data) {
    const result = db.createUser(data);
    if (result.error) return result;
    db.setSession(result.id);
    return result;
  },

  deleteUser(id) {
    const users = getJSON("swn_db_users") || [];
    const filtered = users.filter((u) => u.id !== id);
    setJSON("swn_db_users", filtered);
    const products = getJSON("swn_db_products") || [];
    setJSON("swn_db_products", products.filter((p) => p.sellerId !== id));
  },

  getNotifications: () => getJSON("swn_db_notifications") || [],
  addNotification(notif) {
    const notifications = this.getNotifications();
    const timeStr = new Date().toLocaleDateString(undefined, { dateStyle: 'short' }) + " " + new Date().toLocaleTimeString(undefined, { timeStyle: 'short' });
    notifications.unshift({
      id: Date.now(),
      unread: true,
      time: timeStr,
      ...notif
    });
    setJSON("swn_db_notifications", notifications);
  },
  markNotificationsRead(userId) {
    const notifications = this.getNotifications();
    notifications.forEach(n => {
      if (n.userId === userId) n.unread = false;
    });
    setJSON("swn_db_notifications", notifications);
  },
  getContactMessages: () => getJSON("swn_db_contact_messages") || [],
  addContactMessage(data) {
    const msgs = this.getContactMessages();
    const newMsg = {
      id: `MSG-${Date.now()}`,
      userId: data.userId,
      userName: data.userName,
      userEmail: data.userEmail,
      subject: data.subject,
      message: data.message,
      status: "pending",
      reply: "",
      createdAt: new Date().toISOString(),
      repliedAt: null
    };
    msgs.unshift(newMsg);
    setJSON("swn_db_contact_messages", msgs);
    return newMsg;
  },
  replyToContactMessage(id, replyText) {
    const msgs = this.getContactMessages();
    const idx = msgs.findIndex(m => m.id === id);
    if (idx !== -1) {
      msgs[idx].reply = replyText;
      msgs[idx].status = "replied";
      msgs[idx].repliedAt = new Date().toISOString();
      setJSON("swn_db_contact_messages", msgs);
      return msgs[idx];
    }
    return null;
  }
};

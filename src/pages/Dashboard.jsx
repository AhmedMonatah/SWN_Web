import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { db } from "../services/db";
import { Plus, Trash2, AlertTriangle, X, Check, Eye, FileText, CheckCircle, XCircle, User, ShieldCheck, Mail, Lock, Phone, MapPin } from "lucide-react";

const CATS = ["clothing", "electronics", "food", "household", "personalCare"];
const CAT_LABEL_EN = { clothing: "Clothing", electronics: "Electronics", food: "Food & Groceries", household: "Household Items", personalCare: "Personal Care" };
const CAT_LABEL_AR = { clothing: "ملابس", electronics: "إلكترونيات", food: "غذاء ومواد تموينية", household: "أدوات منزلية", personalCare: "عناية شخصية" };

const STATUS_CLASS = {
  pending: "s-pending",
  confirmed: "s-confirmed",
  preparing: "s-preparing",
  shipped: "s-shipped",
  delivered: "s-delivered",
  cancelled: "s-cancelled"
};
const STATUS_EN = { pending: "Pending", confirmed: "Confirmed", preparing: "Preparing", shipped: "Shipped", delivered: "Delivered", cancelled: "Cancelled" };
const STATUS_AR = { pending: "معلق", confirmed: "مؤكد", preparing: "قيد التجهيز", shipped: "تم الشحن", delivered: "تم التوصيل", cancelled: "ملغي" };

const fileToBase64 = (file) => new Promise((resolve) => {
  const reader = new FileReader();
  reader.onload = (e) => resolve(e.target.result);
  reader.readAsDataURL(file);
});

export default function Dashboard({ onNavigate }) {
  const {
    language,
    currentUser,
    products,
    orders,
    addNewProduct,
    deleteProduct,
    approveProduct,
    rejectProduct,
    users,
    loadUsers,
    approveDocument,
    rejectDocument
  } = useApp();

  const isRTL = language === "ar";
  const L = (en, ar) => (isRTL ? ar : en);

  const [showAdd, setShowAdd] = useState(false);
  const [tab, setTab] = useState("overview");
  const [saving, setSaving] = useState(false);
  const [viewingDoc, setViewingDoc] = useState(null); // { user, docKey, docData }

  const [form, setForm] = useState({
    nameEn: "", nameAr: "", descriptionEn: "", descriptionAr: "",
    category: "clothing", basePrice: "", quantity: "", minOrder: "",
    image: null,
    tiers: [{ minQty: "", discount: 0 }]
  });

  // Admin Account Creation Form State
  const [adminUserForm, setAdminUserForm] = useState({
    name: "", nameAr: "", email: "", password: "",
    role: "wholesaler", companyName: "", companyNameAr: "",
    phone: "", address: ""
  });
  const [adminUserLoading, setAdminUserLoading] = useState(false);
  const [adminUserError, setAdminUserError] = useState("");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const isSupplier = currentUser?.role === "supplier";
  const isWholesaler = currentUser?.role === "wholesaler";
  const isAdmin = currentUser?.role === "admin";

  const myProducts = isAdmin ? products : products.filter((p) => p.sellerId === currentUser?.id);

  // Stats calculation
  const revenue = orders
    .filter((o) => o.sellerId === currentUser?.id && o.status === "delivered")
    .reduce((s, o) => s + (o.totalAmount || 0), 0);

  const spent = orders
    .filter((o) => o.buyerId === currentUser?.id)
    .reduce((s, o) => s + (o.totalAmount || 0), 0);

  const pendingOrdersCount = orders.filter((o) => o.status === "pending").length;
  const lowStock = myProducts.filter((p) => p.quantity < 100);

  // Admin stats
  const pendingProducts = products.filter((p) => p.status === "pending_review");
  const pendingDocsCount = users.reduce((acc, user) => {
    if (user.role === "admin") return acc;
    let count = 0;
    if (user.documents?.commercialRegister?.status === "pending") count++;
    if (user.documents?.taxCard?.status === "pending") count++;
    return acc + count;
  }, 0);

  // Dashboard Stats Config
  const STATS = isAdmin
    ? [
        { label: L("Registered Businesses", "المنشآت المسجلة"), value: users.filter(u => u.role !== "admin").length, icon: "🏢", color: "blue" },
        { label: L("Pending Products", "منتجات قيد المراجعة"), value: pendingProducts.length, icon: "⏳", color: "amber" },
        { label: L("Pending Verifications", "توثيقات معلقة"), value: pendingDocsCount, icon: "📋", color: "purple" },
        { label: L("Total Orders", "إجمالي الطلبات"), value: orders.length, icon: "🛒", color: "green" }
      ]
    : isSupplier
    ? [
        { label: L("Total Revenue", "إجمالي المبيعات"), value: `${revenue.toLocaleString()} EGP`, icon: "💰", color: "green" },
        { label: L("My Products", "منتجاتي"), value: myProducts.length, icon: "📦", color: "blue" },
        { label: L("Pending Orders", "الطلبات المعلقة"), value: pendingOrdersCount, icon: "⏳", color: "amber" },
        { label: L("Low Stock", "مخزون منخفض"), value: lowStock.length, icon: "⚠️", color: "purple" }
      ]
    : isWholesaler
    ? [
        { label: L("Sales Revenue", "مبيعات الجملة"), value: `${revenue.toLocaleString()} EGP`, icon: "💰", color: "green" },
        { label: L("My Products", "منتجاتي للبيع"), value: myProducts.length, icon: "📦", color: "blue" },
        { label: L("Total Purchased", "مشترياتي بالجملة"), value: `${spent.toLocaleString()} EGP`, icon: "🛒", color: "purple" },
        { label: L("Pending Orders", "الطلبات المعلقة"), value: pendingOrdersCount, icon: "⏳", color: "amber" }
      ]
    : [ // Retailer
        { label: L("Total Purchased", "إجمالي مشترياتي"), value: `${spent.toLocaleString()} EGP`, icon: "💰", color: "green" },
        { label: L("Orders Placed", "الطلبات المقدمة"), value: orders.filter((o) => o.buyerId === currentUser?.id).length, icon: "📋", color: "blue" },
        { label: L("Pending Delivery", "قيد التوصيل"), value: orders.filter((o) => o.buyerId === currentUser?.id && o.status !== "delivered" && o.status !== "cancelled").length, icon: "🚚", color: "amber" }
      ];

  const canAddProduct = isSupplier || isWholesaler;
  const recentOrders = orders.slice(0, 5);

  const TABS = isAdmin
    ? [
        { id: "overview", label: L("Overview", "نظرة عامة") },
        { id: "approvals", label: L(`Product Approvals (${pendingProducts.length})`, `مراجعة المنتجات (${pendingProducts.length})`) },
        { id: "users", label: L(`Document Verification (${pendingDocsCount})`, `توثيق الحسابات (${pendingDocsCount})`) }
      ]
    : canAddProduct
    ? [
        { id: "overview", label: L("Overview", "نظرة عامة") },
        { id: "products", label: L("My Products", "منتجاتي") }
      ]
    : [{ id: "overview", label: L("Overview", "نظرة عامة") }];

  const handleProductImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert(isRTL ? "حجم الصورة يجب أن يكون أقل من 2MB" : "Image must be under 2MB");
      return;
    }
    const b64 = await fileToBase64(file);
    set("image", b64);
  };

  const handleAdd = () => {
    if (!form.nameEn || !form.basePrice || !form.minOrder || !form.quantity) return;
    setSaving(true);
    setTimeout(() => {
      addNewProduct({
        ...form,
        basePrice: Number(form.basePrice),
        quantity: Number(form.quantity),
        minOrder: Number(form.minOrder),
        tiers: form.tiers
          .map((t) => ({ minQty: Number(t.minQty), discount: Number(t.discount) }))
          .filter((t) => t.minQty > 0)
      });
      setForm({
        nameEn: "", nameAr: "", descriptionEn: "", descriptionAr: "",
        category: "clothing", basePrice: "", quantity: "", minOrder: "",
        image: null,
        tiers: [{ minQty: "", discount: 0 }]
      });
      setShowAdd(false);
      setSaving(false);
    }, 500);
  };

  const addTier = () => setForm((f) => ({ ...f, tiers: [...f.tiers, { minQty: "", discount: 0 }] }));
  const removeTier = (i) => setForm((f) => ({ ...f, tiers: f.tiers.filter((_, j) => j !== i) }));
  const setTier = (i, k, v) => setForm((f) => ({ ...f, tiers: f.tiers.map((t, j) => (j === i ? { ...t, [k]: v } : t)) }));

  const getDocStatusBadge = (doc) => {
    if (!doc) return <span className="badge badge-gray">{L("Not Uploaded", "لم يتم الرفع")}</span>;
    if (doc.status === "approved") return <span className="badge badge-success">{L("Approved", "مقبول")}</span>;
    if (doc.status === "rejected") return <span className="badge badge-danger">{L("Rejected", "مرفوض")}</span>;
    return <span className="badge badge-warning">{L("Pending Review", "قيد المراجعة")}</span>;
  };

  const getProductStatusBadge = (status) => {
    if (status === "approved") return <span className="badge badge-success">{L("Approved", "مقبول")}</span>;
    if (status === "rejected") return <span className="badge badge-danger">{L("Rejected", "مرفوض")}</span>;
    return <span className="badge badge-warning">{L("Pending Review", "قيد المراجعة")}</span>;
  };

  const getRoleLabel = (role) => {
    return L(
      { supplier: "Supplier", wholesaler: "Wholesaler", retailer: "Retailer", admin: "Admin" }[role] || role,
      { supplier: "مورد", wholesaler: "تاجر جملة", retailer: "تاجر تجزئة", admin: "مدير" }[role] || role
    );
  };

  // ── Profit & Sales Analytics Graph Calculations ──────────────────
  const getAnalyticsData = () => {
    const monthlyData = [];
    const monthNames = isRTL 
      ? ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"]
      : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthIndex = d.getMonth();
      const year = d.getFullYear();
      
      const monthOrders = orders.filter(o => {
        if (o.sellerId !== currentUser?.id || o.status !== "delivered") return false;
        const oDate = new Date(o.createdAt || o.date);
        return oDate.getMonth() === monthIndex && oDate.getFullYear() === year;
      });
      
      const sales = monthOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const profit = Math.round(sales * 0.20); // Dynamic profit estimation (20% margins)
      
      monthlyData.push({
        name: monthNames[monthIndex],
        sales,
        profit
      });
    }
    return monthlyData;
  };

  const getOrderStatusDistribution = () => {
    const statuses = ["pending", "confirmed", "preparing", "shipped", "delivered", "cancelled"];
    const statusCounts = {};
    statuses.forEach(s => { statusCounts[s] = 0; });
    
    const myOrders = isAdmin 
      ? orders 
      : orders.filter(o => o.sellerId === currentUser?.id || o.buyerId === currentUser?.id);
      
    myOrders.forEach(o => {
      if (statusCounts[o.status] !== undefined) {
        statusCounts[o.status]++;
      }
    });

    const colors = {
      pending: "var(--warning)",
      confirmed: "var(--brand)",
      preparing: "#0ea5e9",
      shipped: "#0891b2",
      delivered: "var(--success)",
      cancelled: "var(--danger)"
    };

    const labelsEn = { pending: "Pending", confirmed: "Confirmed", preparing: "Preparing", shipped: "Shipped", delivered: "Delivered", cancelled: "Cancelled" };
    const labelsAr = { pending: "معلق", confirmed: "مؤكد", preparing: "تجهيز", shipped: "شحن", delivered: "توصيل", cancelled: "ملغي" };

    return statuses.map(s => ({
      status: s,
      count: statusCounts[s],
      color: colors[s],
      label: isRTL ? labelsAr[s] : labelsEn[s]
    })).filter(item => item.count > 0);
  };

  const graphData = getAnalyticsData();
  const maxSalesVal = Math.max(...graphData.map(d => d.sales), 1000); // Prevent divide by zero
  const donutData = getOrderStatusDistribution();
  const totalOrdersCount = donutData.reduce((sum, item) => sum + item.count, 0);

  // ── Admin Create User Account Action ──────────────────────────────
  const handleAdminCreateUser = (e) => {
    e.preventDefault();
    setAdminUserError("");
    if (!adminUserForm.name || !adminUserForm.email || !adminUserForm.password || !adminUserForm.companyName) {
      setAdminUserError(L("Please fill all required fields.", "يرجى ملء جميع الحقول المطلوبة."));
      return;
    }
    setAdminUserLoading(true);
    setTimeout(() => {
      const result = db.createUser({
        ...adminUserForm,
        tier: adminUserForm.role === "supplier" ? "gold" : adminUserForm.role === "wholesaler" ? "silver" : "bronze",
        nameAr: adminUserForm.nameAr || adminUserForm.name,
        companyNameAr: adminUserForm.companyNameAr || adminUserForm.companyName,
        documents: {
          commercialRegister: { name: "AdminPreApproved.pdf", data: "data:application/pdf;base64,", type: "application/pdf", date: new Date().toLocaleDateString(), status: "approved" },
          taxCard: { name: "AdminPreApproved.pdf", data: "data:application/pdf;base64,", type: "application/pdf", date: new Date().toLocaleDateString(), status: "approved" }
        }
      });
      if (result.error) {
        setAdminUserError(L(result.error, "هذا البريد الإلكتروني مسجل بالفعل."));
        setAdminUserLoading(false);
      } else {
        setAdminUserForm({ name: "", nameAr: "", email: "", password: "", role: "wholesaler", companyName: "", companyNameAr: "", phone: "", address: "" });
        setAdminUserLoading(false);
        loadUsers();
        alert(isRTL ? "تم إنشاء الحساب بنجاح!" : "Business account created successfully!");
      }
    }, 500);
  };

  const adminSet = (k, v) => setAdminUserForm(f => ({ ...f, [k]: v }));

  return (
    <div className="page-wrap">
      <div className="container">
        {/* Welcome Banner Card */}
        <div className="welcome-banner-card anim-fade-up" style={{ marginBottom: 24 }}>
          <div className="welcome-banner-glow" />
          <div className="welcome-banner-inner">
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <div className="welcome-avatar-circle">
                {currentUser?.profileImage ? (
                  <img src={currentUser.profileImage} alt="" className="welcome-avatar-img" />
                ) : (
                  <div className="welcome-avatar-placeholder">
                    {currentUser?.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?"}
                  </div>
                )}
              </div>
              <div>
                <h1 className="welcome-title">
                  {L(
                    `Welcome back, ${currentUser?.name || currentUser?.nameAr} 👋`,
                    `مرحباً بك مجدداً، ${currentUser?.nameAr || currentUser?.name} 👋`
                  )}
                </h1>
                <p className="welcome-subtitle">
                  {isRTL ? currentUser?.companyNameAr || currentUser?.companyName : currentUser?.companyName || currentUser?.companyNameAr}
                  {" · "}
                  <span className={`role-chip chip-${currentUser?.role}`} style={{ fontSize: ".68rem", fontWeight: 700 }}>
                    {L(
                      { supplier: "Supplier Partner", wholesaler: "Wholesale Partner", retailer: "Retail Business", admin: "Administrator" }[currentUser?.role],
                      { supplier: "شريك مورد", wholesaler: "شريك تاجر جملة", retailer: "تاجر تجزئة مسجل", admin: "مدير النظام" }[currentUser?.role]
                    )}
                  </span>
                </p>
              </div>
            </div>
            <div className="welcome-banner-actions">
              {canAddProduct && (
                <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
                  <Plus size={16} /> {L("Add Product", "إضافة منتج")}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid-4 stagger" style={{ marginBottom: 22 }}>
          {STATS.map((s, i) => (
            <div key={i} className={`stat-card stat-${s.color}`} style={{ padding: "16px 20px" }}>
              <div className={`stat-icon si-${s.color}`} style={{ fontSize: "1.6rem" }}>{s.icon}</div>
              <div>
                <div className="stat-label" style={{ fontSize: "0.75rem", fontWeight: 600 }}>{s.label}</div>
                <div className="stat-value" style={{ fontSize: "1.3rem", fontWeight: 800, marginTop: 4 }}>{s.value ?? "—"}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Low Stock Banner */}
        {lowStock.length > 0 && canAddProduct && (
          <div className="alert alert-warning anim-fade-in" style={{ marginBottom: 16 }}>
            <AlertTriangle size={16} />
            <div>
              <strong>{L("Low Stock Warning: ", "تنبيه مخزون منخفض: ")}</strong>
              {lowStock.map((p) => `${isRTL ? p.nameAr : p.nameEn} (${p.quantity})`).join(" · ")}
            </div>
          </div>
        )}

        {/* Tabs Bar */}
        {TABS.length > 1 && (
          <div className="tabs" style={{ marginBottom: 20 }}>
            {TABS.map((t) => (
              <button key={t.id} className={`tab-btn ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
                {t.label}
              </button>
            ))}
          </div>
        )}

        {/* ── OVERVIEW TAB ──────────────────────────────── */}
        {tab === "overview" && (
          <div className="anim-fade-up" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            
            {/* Sales & Profit Analytics Graph for Suppliers & Wholesalers */}
            {(isSupplier || isWholesaler) && (
              <div className="analytics-grid-row anim-fade-up" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
                {/* SVG Line Chart Card (Sales & Profit Curve) */}
                <div className="card analytics-card-left" style={{ padding: 22 }}>
                  <div className="flex-between" style={{ marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
                    <div>
                      <h3 style={{ fontSize: "0.95rem", fontWeight: 800 }}>{L("Sales & Profit Analytics Curve", "منحنى المبيعات وصافي الأرباح")}</h3>
                      <p className="text-muted" style={{ fontSize: "0.75rem", marginTop: 2 }}>
                        {L("Interactive monthly sales volume and profits overview (20% margin)", "عرض تفاعلي لحجم المبيعات والأرباح الشهرية (هامش ربح تقديري 20%)")}
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: 14, fontSize: "0.78rem", fontWeight: 600 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 12, height: 12, background: "var(--brand)", borderRadius: 3 }} />
                        <span>{L("Sales Volume", "حجم المبيعات")}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 12, height: 12, background: "var(--success)", borderRadius: 3 }} />
                        <span>{L("Gross Profit", "صافي الربح")}</span>
                      </div>
                    </div>
                  </div>

                  {orders.filter(o => o.sellerId === currentUser?.id && o.status === "delivered").length === 0 ? (
                    <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-3)", fontSize: "0.85rem" }}>
                      📊 {L("No delivered sales recorded yet to display graph analytics.", "لا توجد مبيعات مكتملة مسجلة بعد لعرض التحليلات البيانية.")}
                    </div>
                  ) : (
                    <div className="svg-chart-container" style={{ width: "100%", overflowX: "auto" }}>
                      <svg width="100%" height="180" viewBox="0 0 400 160" preserveAspectRatio="none" style={{ minWidth: 360 }}>
                        <defs>
                          <linearGradient id="sales-gradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="var(--brand)" stopOpacity="0.0" />
                          </linearGradient>
                          <linearGradient id="profit-gradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--success)" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="var(--success)" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        {/* Horizontal Grid lines */}
                        {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
                          const yVal = 20 + 110 - (pct * 110);
                          const labelVal = Math.round(pct * maxSalesVal);
                          return (
                            <g key={idx} style={{ opacity: 0.4 }}>
                              <line x1="45" y1={yVal} x2="385" y2={yVal} stroke="var(--border)" strokeWidth="1" strokeDasharray="3 3" />
                              <text x="38" y={yVal} textAnchor="end" dominantBaseline="middle" style={{ fontSize: "0.55rem", fill: "var(--text-3)", fontWeight: 700 }}>
                                {labelVal >= 1000 ? `${(labelVal/1000).toFixed(0)}k` : labelVal}
                              </text>
                            </g>
                          );
                        })}
                        {/* Smooth Area Fills */}
                        {(() => {
                          const chartWidth = 340;
                          const chartHeight = 110;
                          const paddingX = 45;
                          const paddingY = 20;
                          const points = graphData.map((d, i) => {
                            const x = paddingX + (i * (chartWidth / (graphData.length - 1)));
                            const y = paddingY + chartHeight - ((d.sales / maxSalesVal) * chartHeight);
                            const profitY = paddingY + chartHeight - ((d.profit / maxSalesVal) * chartHeight);
                            return { x, y, profitY };
                          });
                          const salesPathD = points.reduce((acc, p, i) => acc + `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`, "");
                          const salesAreaD = salesPathD + ` L ${points[points.length - 1].x} ${paddingY + chartHeight} L ${points[0].x} ${paddingY + chartHeight} Z`;
                          const profitPathD = points.reduce((acc, p, i) => acc + `${i === 0 ? "M" : "L"} ${p.x} ${p.profitY}`, "");
                          const profitAreaD = profitPathD + ` L ${points[points.length - 1].x} ${paddingY + chartHeight} L ${points[0].x} ${paddingY + chartHeight} Z`;
                          return (
                            <>
                              <path d={salesAreaD} fill="url(#sales-gradient)" />
                              <path d={profitAreaD} fill="url(#profit-gradient)" />
                              <path d={salesPathD} stroke="var(--brand)" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                              <path d={profitPathD} stroke="var(--success)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                              {points.map((p, i) => (
                                <g key={i}>
                                  <circle cx={p.x} cy={p.y} r="4" fill="var(--brand)" stroke="#ffffff" strokeWidth="2.5" />
                                  <circle cx={p.x} cy={p.profitY} r="4" fill="var(--success)" stroke="#ffffff" strokeWidth="2.5" />
                                  <text x={p.x} y={148} textAnchor="middle" style={{ fontSize: "0.62rem", fill: "var(--text-3)", fontWeight: 700 }}>
                                    {graphData[i].name}
                                  </text>
                                </g>
                              ))}
                            </>
                          );
                        })()}
                      </svg>
                    </div>
                  )}
                </div>

                {/* SVG Donut Chart Card (Order Status Breakdown) */}
                <div className="card analytics-card-right" style={{ padding: 22, display: "flex", flexDirection: "column" }}>
                  <h3 style={{ fontSize: "0.95rem", fontWeight: 800, marginBottom: 12 }}>{L("Order Fulfillment", "حالات تسليم الطلبات")}</h3>
                  
                  {totalOrdersCount === 0 ? (
                    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 140, color: "var(--text-3)", fontSize: "0.85rem", textAlign: "center" }}>
                      🍩 {L("No active order statistics found.", "لا توجد إحصائيات طلبات نشطة بعد.")}
                    </div>
                  ) : (
                    <div style={{ display: "flex", flex: 1, flexDirection: "column", alignItems: "center", gap: 14, justifyContent: "center" }}>
                      {/* Donut SVG */}
                      <div style={{ position: "relative", width: 100, height: 100, flexShrink: 0 }}>
                        <svg width="100%" height="100%" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="38" fill="transparent" stroke="var(--border)" strokeWidth="8" />
                          {(() => {
                            let accPercent = 0;
                            const radius = 38;
                            const circumference = 2 * Math.PI * radius;
                            return donutData.map((item, idx) => {
                              const percentage = item.count / totalOrdersCount;
                              const strokeLength = percentage * circumference;
                              const strokeOffset = circumference - strokeLength + (accPercent * circumference);
                              accPercent -= percentage;
                              return (
                                <circle
                                  key={idx}
                                  cx="50"
                                  cy="50"
                                  r={radius}
                                  fill="transparent"
                                  stroke={item.color}
                                  strokeWidth="8.5"
                                  strokeDasharray={circumference}
                                  strokeDashoffset={strokeOffset}
                                  transform="rotate(-90 50 50)"
                                  strokeLinecap="round"
                                  className="donut-segment"
                                />
                              );
                            });
                          })()}
                        </svg>
                        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                          <span style={{ fontSize: "1.25rem", fontWeight: 900, color: "var(--text-1)", lineHeight: 1 }}>{totalOrdersCount}</span>
                          <span style={{ fontSize: "0.58rem", color: "var(--text-3)", fontWeight: 700, marginTop: 2 }}>{L("Orders", "الطلبات")}</span>
                        </div>
                      </div>

                      {/* Donut Legend */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, width: "100%" }}>
                        {donutData.map((item, idx) => (
                          <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.72rem", fontWeight: 600 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.color }} />
                              <span style={{ color: "var(--text-2)" }}>{item.label}</span>
                            </div>
                            <span style={{ color: "var(--text-1)", fontWeight: 700 }}>{item.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {/* Recent Orders Card */}
              <div className="card">
                <div className="flex-between" style={{ marginBottom: 14 }}>
                  <h3 className="section-title" style={{ fontSize: ".92rem", fontWeight: 700 }}>{L("Recent Orders", "الطلبيات الأخيرة")}</h3>
                  <button className="btn btn-ghost btn-sm" onClick={() => onNavigate("orders")}>{L("See all →", "عرض الكل →")}</button>
                </div>
                {recentOrders.length === 0 ? (
                  <div className="empty-state" style={{ padding: "32px 0" }}>
                    <div className="empty-icon" style={{ fontSize: "2rem" }}>📋</div>
                    <p className="empty-desc">{L("No orders recorded yet", "لا توجد طلبات مسجلة بعد")}</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {recentOrders.map((o) => (
                      <div key={o.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: "var(--bg-surface)", borderRadius: "var(--radius-md)" }}>
                        <div>
                          <div style={{ fontSize: ".82rem", fontWeight: 700, color: "var(--brand)" }}>{o.id}</div>
                          <div style={{ fontSize: ".68rem", color: "var(--text-3)", marginTop: 2 }}>{o.date}</div>
                        </div>
                        <span className={`status ${STATUS_CLASS[o.status] || "s-pending"}`}>
                          {L(STATUS_EN[o.status], STATUS_AR[o.status])}
                        </span>
                        <div style={{ fontSize: ".85rem", fontWeight: 700, color: "var(--text-1)" }}>
                          {o.totalAmount?.toLocaleString()} EGP
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Seller Products Preview Card (Suppliers/Wholesalers) */}
              {canAddProduct && (
                <div className="card">
                  <div className="flex-between" style={{ marginBottom: 14 }}>
                    <h3 className="section-title" style={{ fontSize: ".92rem", fontWeight: 700 }}>{L("My Products Preview", "نبذة عن منتجاتي")}</h3>
                    <button className="btn btn-ghost btn-sm" onClick={() => setTab("products")}>{L("Manage all →", "إدارة الكل →")}</button>
                  </div>
                  {myProducts.length === 0 ? (
                    <div className="empty-state" style={{ padding: "32px 0" }}>
                      <div className="empty-icon" style={{ fontSize: "2rem" }}>📦</div>
                      <p className="empty-desc">{L("You haven't listed any products yet", "لم تقم بإضافة منتجات بعد")}</p>
                      <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>
                        <Plus size={13} /> {L("Add Product", "إضافة منتج")}
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {myProducts.slice(0, 5).map((p) => (
                        <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", background: "var(--bg-surface)", borderRadius: "var(--radius-md)" }}>
                          <div style={{ width: 36, height: 36, borderRadius: "var(--radius-sm)", background: p.imageColor || "var(--brand-50)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
                            {p.image ? (
                              <img src={p.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                              <span style={{ fontSize: "1.2rem" }}>📦</span>
                            )}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: ".82rem", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {isRTL ? p.nameAr : p.nameEn}
                            </div>
                            <div style={{ fontSize: ".68rem", color: "var(--text-3)", marginTop: 2 }}>
                              {p.quantity} {L("units available", "وحدة متوفرة")}
                            </div>
                          </div>
                          <div style={{ marginInlineEnd: 8 }}>
                            {getProductStatusBadge(p.status)}
                          </div>
                          <div style={{ fontSize: ".82rem", fontWeight: 700, color: "var(--brand)", flexShrink: 0 }}>
                            {p.basePrice} EGP
                          </div>
                          <button className="btn btn-ghost btn-icon-sm" onClick={() => deleteProduct(p.id)} title="Delete">
                            <Trash2 size={13} style={{ color: "var(--danger)" }} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Order Status Donut Chart Card (Retailers/Admins) */}
              {!canAddProduct && (
                <div className="card" style={{ padding: 22, display: "flex", flexDirection: "column" }}>
                  <h3 className="section-title" style={{ fontSize: ".92rem", fontWeight: 700, marginBottom: 14 }}>{L("Order Fulfillment Breakdown", "تحليل تسليم الطلبات")}</h3>
                  {totalOrdersCount === 0 ? (
                    <div className="empty-state" style={{ padding: "32px 0", flex: 1 }}>
                      <div className="empty-icon" style={{ fontSize: "2rem" }}>🍩</div>
                      <p className="empty-desc">{L("No active order statistics found", "لا توجد إحصائيات طلبات نشطة")}</p>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flex: 1, alignItems: "center", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
                      {/* Donut SVG */}
                      <div style={{ position: "relative", width: 100, height: 100, flexShrink: 0 }}>
                        <svg width="100%" height="100%" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="38" fill="transparent" stroke="var(--border)" strokeWidth="8" />
                          {(() => {
                            let accPercent = 0;
                            const radius = 38;
                            const circumference = 2 * Math.PI * radius;
                            return donutData.map((item, idx) => {
                              const percentage = item.count / totalOrdersCount;
                              const strokeLength = percentage * circumference;
                              const strokeOffset = circumference - strokeLength + (accPercent * circumference);
                              accPercent -= percentage;
                              return (
                                <circle
                                  key={idx}
                                  cx="50"
                                  cy="50"
                                  r={radius}
                                  fill="transparent"
                                  stroke={item.color}
                                  strokeWidth="8.5"
                                  strokeDasharray={circumference}
                                  strokeDashoffset={strokeOffset}
                                  transform="rotate(-90 50 50)"
                                  strokeLinecap="round"
                                  className="donut-segment"
                                />
                              );
                            });
                          })()}
                        </svg>
                        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                          <span style={{ fontSize: "1.2rem", fontWeight: 900, color: "var(--text-1)", lineHeight: 1 }}>{totalOrdersCount}</span>
                          <span style={{ fontSize: "0.55rem", color: "var(--text-3)", fontWeight: 700, marginTop: 2 }}>{L("Orders", "الطلبات")}</span>
                        </div>
                      </div>

                      {/* Donut Legend */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, flex: 1 }}>
                        {donutData.map((item, idx) => (
                          <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.72rem", fontWeight: 600 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                              <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.color }} />
                              <span style={{ color: "var(--text-2)" }}>{item.label}</span>
                            </div>
                            <span style={{ color: "var(--text-1)", fontWeight: 700 }}>{item.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── SELLER PRODUCTS TAB ───────────────────────── */}
        {tab === "products" && canAddProduct && (
          <div className="anim-fade-up">
            <div className="flex-between" style={{ marginBottom: 14 }}>
              <span style={{ fontSize: ".82rem", color: "var(--text-3)", fontWeight: 600 }}>
                {myProducts.length} {L("products cataloged", "منتجات مدرجة")}
              </span>
              <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>
                <Plus size={14} /> {L("Add Product", "إضافة منتج")}
              </button>
            </div>
            {myProducts.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📦</div>
                <h3 className="empty-title">{L("No products listed yet", "لا توجد منتجات معروضة بعد")}</h3>
                <p className="empty-desc">{L("Add products to start showing them on the market", "أضف منتجاتك لبدء عرضها في السوق للبيع")}</p>
                <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
                  <Plus size={15} /> {L("Add Product", "إضافة منتج")}
                </button>
              </div>
            ) : (
              <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{L("Product", "المنتج")}</th>
                      <th>{L("Category", "الفئة")}</th>
                      <th>{L("Price", "السعر")}</th>
                      <th>{L("Stock", "المخزون")}</th>
                      <th>{L("Min. Order", "الحد الأدنى للطلب")}</th>
                      <th>{L("Status", "حالة القبول")}</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {myProducts.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                            <div style={{ width: 34, height: 34, borderRadius: "var(--radius-sm)", background: p.imageColor || "var(--brand-50)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
                              {p.image ? (
                                <img src={p.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                              ) : (
                                <span style={{ fontSize: "1rem" }}>📦</span>
                              )}
                            </div>
                            <div style={{ fontWeight: 600, fontSize: ".83rem" }}>
                              {isRTL ? p.nameAr : p.nameEn}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-blue">
                            {L(CAT_LABEL_EN[p.category], CAT_LABEL_AR[p.category])}
                          </span>
                        </td>
                        <td style={{ fontWeight: 700, fontSize: ".85rem" }}>
                          {p.basePrice?.toLocaleString()} EGP
                        </td>
                        <td>
                          <span style={{ color: p.quantity < 100 ? "var(--danger)" : "var(--success)", fontWeight: 700, fontSize: ".82rem" }}>
                            {p.quantity?.toLocaleString()}
                          </span>
                        </td>
                        <td style={{ fontSize: ".82rem", color: "var(--text-2)" }}>
                          {p.minOrder} {L("pcs", "قطعة")}
                        </td>
                        <td>{getProductStatusBadge(p.status)}</td>
                        <td>
                          <button className="btn btn-ghost btn-icon-sm" onClick={() => deleteProduct(p.id)} title="Delete">
                            <Trash2 size={14} style={{ color: "var(--danger)" }} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── ADMIN PRODUCT APPROVALS TAB ────────────────── */}
        {tab === "approvals" && isAdmin && (
          <div className="anim-fade-up">
            <h3 className="section-title" style={{ marginBottom: 14 }}>
              {L("Pending Product Approval Requests", "طلبات قبول المنتجات المعلقة")}
            </h3>
            {pendingProducts.length === 0 ? (
              <div className="empty-state card" style={{ padding: "40px 0" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>✓</div>
                <h3 className="empty-title">{L("No products pending review", "لا توجد منتجات معلقة للمراجعة")}</h3>
                <p className="empty-desc">{L("All submitted products are reviewed.", "تمت مراجعة جميع المنتجات المضافة بنجاح.")}</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {pendingProducts.map((p) => (
                  <div key={p.id} className="card" style={{ padding: 18, border: "1px solid var(--border)", display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                      <div style={{ width: 48, height: 48, borderRadius: "var(--radius-md)", background: p.imageColor || "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
                        {p.image ? (
                          <img src={p.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <span style={{ fontSize: "1.5rem" }}>📦</span>
                        )}
                      </div>
                      <div>
                        <h4 style={{ fontWeight: 800, fontSize: "0.95rem" }}>{isRTL ? p.nameAr : p.nameEn}</h4>
                        <div style={{ display: "flex", gap: 8, fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 4, flexWrap: "wrap" }}>
                          <span>{L("Seller:", "البائع:")} <strong>{isRTL ? p.sellerNameAr || p.sellerName : p.sellerName}</strong> ({getRoleLabel(p.sellerRole)})</span>
                          <span>·</span>
                          <span>{L("Category:", "الفئة:")} <strong>{L(CAT_LABEL_EN[p.category], CAT_LABEL_AR[p.category])}</strong></span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
                      <div style={{ textAlign: "end" }}>
                        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{L("Price / MOQ", "السعر / الحد الأدنى")}</div>
                        <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--brand)", marginTop: 2 }}>{p.basePrice} EGP</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-2)", marginTop: 1 }}>{L("Min Order:", "أقل طلب:")} {p.minOrder}</div>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="btn btn-success btn-sm" onClick={() => approveProduct(p.id)} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <Check size={14} /> {L("Approve", "قبول")}
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={() => rejectProduct(p.id)} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <X size={14} style={{ color: "var(--danger)" }} /> {L("Reject", "رفض")}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ADMIN USER DOCUMENT VERIFICATION & SUB-ACCOUNTS TAB ── */}
        {tab === "users" && isAdmin && (
          <div className="anim-fade-up" style={{ display: "flex", gap: 20, flexDirection: "row", alignItems: "flex-start", flexWrap: "wrap" }}>
            
            {/* Column 1: Document Verification Table */}
            <div style={{ flex: "1 1 500px", display: "flex", flexDirection: "column", gap: 14 }}>
              <h3 className="section-title" style={{ fontSize: "0.95rem", fontWeight: 800 }}>
                {L("Business Verification Requests", "طلبات توثيق حسابات الشركات")}
              </h3>
              {users.filter((u) => u.role !== "admin").length === 0 ? (
                <div className="empty-state card" style={{ padding: "40px 0" }}>
                  <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>👥</div>
                  <h3 className="empty-title">{L("No registered users yet", "لا يوجد مستخدمون مسجلون بعد")}</h3>
                  <p className="empty-desc">{L("Newly registered users will appear here.", "سيظهر المستخدمون الجدد المسجلون هنا.")}</p>
                </div>
              ) : (
                <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>{L("Business / Contact", "الشركة / جهة الاتصال")}</th>
                        <th>{L("Role", "نوع الحساب")}</th>
                        <th>{L("Commercial Register", "السجل التجاري")}</th>
                        <th>{L("Tax Card", "البطاقة الضريبية")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users
                        .filter((u) => u.role !== "admin")
                        .map((u) => {
                          const cr = u.documents?.commercialRegister;
                          const tc = u.documents?.taxCard;
                          return (
                            <tr key={u.id}>
                              <td>
                                <div>
                                  <div style={{ fontWeight: 800, fontSize: "0.85rem" }}>
                                    {isRTL ? u.companyNameAr || u.companyName : u.companyName}
                                  </div>
                                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: 2 }}>
                                    {isRTL ? u.nameAr || u.name : u.name} · {u.email} · {u.phone || "—"}
                                  </div>
                                </div>
                              </td>
                              <td>
                                <span className={`role-chip chip-${u.role}`}>
                                  {getRoleLabel(u.role)}
                                </span>
                              </td>
                              {/* Commercial Register */}
                              <td>
                                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    {getDocStatusBadge(cr)}
                                    {cr && cr.data && (
                                      <button className="btn btn-ghost btn-icon-sm" onClick={() => setViewingDoc({ user: u, docKey: "commercialRegister", docData: cr })} title={L("View Document", "عرض المستند")}>
                                        <Eye size={12} />
                                      </button>
                                    )}
                                  </div>
                                  {cr && cr.status === "pending" && (
                                    <div style={{ display: "flex", gap: 4 }}>
                                      <button className="btn btn-success btn-xs" onClick={() => approveDocument(u.id, "commercialRegister")} style={{ padding: "3px 6px" }}>
                                        {L("Approve", "قبول")}
                                      </button>
                                      <button className="btn btn-secondary btn-xs" onClick={() => rejectDocument(u.id, "commercialRegister")} style={{ padding: "3px 6px" }}>
                                        {L("Reject", "رفض")}
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </td>
                              {/* Tax Card */}
                              <td>
                                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    {getDocStatusBadge(tc)}
                                    {tc && tc.data && (
                                      <button className="btn btn-ghost btn-icon-sm" onClick={() => setViewingDoc({ user: u, docKey: "taxCard", docData: tc })} title={L("View Document", "عرض المستند")}>
                                        <Eye size={12} />
                                      </button>
                                    )}
                                  </div>
                                  {tc && tc.status === "pending" && (
                                    <div style={{ display: "flex", gap: 4 }}>
                                      <button className="btn btn-success btn-xs" onClick={() => approveDocument(u.id, "taxCard")} style={{ padding: "3px 6px" }}>
                                        {L("Approve", "قبول")}
                                      </button>
                                      <button className="btn btn-secondary btn-xs" onClick={() => rejectDocument(u.id, "taxCard")} style={{ padding: "3px 6px" }}>
                                        {L("Reject", "رفض")}
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Column 2: Create Sub-account Credentials */}
            <aside className="card" style={{ flex: "0 0 320px", padding: 20 }}>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 800, marginBottom: 14 }}>
                {L("Create New Account", "إنشاء حساب تجاري جديد")}
              </h3>

              {adminUserError && (
                <div className="auth-error" style={{ marginBottom: 12, padding: "8px 10px", fontSize: "0.78rem" }}>
                  <AlertTriangle size={14} /> {adminUserError}
                </div>
              )}

              <form onSubmit={handleAdminCreateUser} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: "0.72rem" }}>{L("Account Role *", "صلاحية الحساب *")}</label>
                  <select
                    className="form-input form-select"
                    value={adminUserForm.role}
                    onChange={(e) => adminSet("role", e.target.value)}
                    style={{ padding: "6px 10px", fontSize: "0.78rem" }}
                  >
                    <option value="admin">{L("Admin / Staff", "مدير / موظف نظام")}</option>
                    <option value="supplier">{L("Supplier / Manufacturer", "مورد / مصنع")}</option>
                    <option value="wholesaler">{L("Wholesaler / Distributor", "تاجر جملة / موزع")}</option>
                    <option value="retailer">{L("Retailer / Shop Owner", "تاجر تجزئة / صاحب محل")}</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: "0.72rem" }}>{L("Full Name (EN) *", "الاسم بالكامل (إنجليزي) *")}</label>
                  <input
                    className="form-input"
                    value={adminUserForm.name}
                    onChange={(e) => adminSet("name", e.target.value)}
                    placeholder="John Doe"
                    style={{ padding: "6px 10px", fontSize: "0.78rem" }}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: "0.72rem" }}>{L("Full Name (AR)", "الاسم بالكامل (عربي)")}</label>
                  <input
                    className="form-input"
                    value={adminUserForm.nameAr}
                    onChange={(e) => adminSet("nameAr", e.target.value)}
                    placeholder="جون دو"
                    style={{ padding: "6px 10px", fontSize: "0.78rem" }}
                    dir="rtl"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: "0.72rem" }}>{L("Company Name (EN) *", "اسم الشركة (إنجليزي) *")}</label>
                  <input
                    className="form-input"
                    value={adminUserForm.companyName}
                    onChange={(e) => adminSet("companyName", e.target.value)}
                    placeholder="Apex Supplies Ltd"
                    style={{ padding: "6px 10px", fontSize: "0.78rem" }}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: "0.72rem" }}>{L("Company Name (AR)", "اسم الشركة (عربي)")}</label>
                  <input
                    className="form-input"
                    value={adminUserForm.companyNameAr}
                    onChange={(e) => adminSet("companyNameAr", e.target.value)}
                    placeholder="شركة القمة للتوريدات"
                    style={{ padding: "6px 10px", fontSize: "0.78rem" }}
                    dir="rtl"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: "0.72rem" }}>{L("Email address *", "البريد الإلكتروني *")}</label>
                  <input
                    className="form-input"
                    type="email"
                    value={adminUserForm.email}
                    onChange={(e) => adminSet("email", e.target.value)}
                    placeholder="staff@swn.com"
                    style={{ padding: "6px 10px", fontSize: "0.78rem" }}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: "0.72rem" }}>{L("Credentials Password *", "كلمة مرور الحساب *")}</label>
                  <input
                    className="form-input"
                    type="password"
                    value={adminUserForm.password}
                    onChange={(e) => adminSet("password", e.target.value)}
                    placeholder="••••••••"
                    style={{ padding: "6px 10px", fontSize: "0.78rem" }}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: "0.72rem" }}>{L("Phone Number", "رقم الهاتف")}</label>
                  <input
                    className="form-input"
                    value={adminUserForm.phone}
                    onChange={(e) => adminSet("phone", e.target.value)}
                    placeholder="01x xxxx xxxx"
                    style={{ padding: "6px 10px", fontSize: "0.78rem" }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-sm w-full"
                  disabled={adminUserLoading}
                  style={{ marginTop: 6 }}
                >
                  {adminUserLoading ? <span className="btn-spinner" /> : L("Create Account", "إنشاء وتفعيل الحساب")}
                </button>
              </form>
            </aside>
          </div>
        )}
      </div>

      {/* ── Add Product Modal ──────────────────────── */}
      {showAdd && (
        <div className="modal-bg" onClick={() => setShowAdd(false)}>
          <div className="modal" style={{ maxWidth: 540 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h2 className="modal-title">
                <Plus size={16} style={{ display: "inline", marginInlineEnd: 6 }} />
                {L("Add Product for Review", "إضافة منتج للمراجعة")}
              </h2>
              <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => setShowAdd(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              {/* Product Image Uploader */}
              <div className="form-group">
                <label className="form-label">{L("Product Image *", "صورة المنتج *")}</label>
                <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                  <div style={{
                    width: 72,
                    height: 72,
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border)",
                    background: "var(--bg-surface)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    flexShrink: 0
                  }}>
                    {form.image ? (
                      <img src={form.image} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <span style={{ fontSize: "1.8rem" }}>📦</span>
                    )}
                  </div>
                  <label className="btn btn-secondary btn-sm" style={{ cursor: "pointer" }}>
                    {L("Upload Product Image", "رفع صورة للمنتج")}
                    <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleProductImageChange} />
                  </label>
                </div>
              </div>

              <div className="grid-2" style={{ gap: 10 }}>
                <div className="form-group">
                  <label className="form-label">{L("Name (EN) *", "الاسم (EN) *")}</label>
                  <input className="form-input" value={form.nameEn} onChange={(e) => set("nameEn", e.target.value)} placeholder="Cotton T-Shirt..." />
                </div>
                <div className="form-group">
                  <label className="form-label">{L("Name (AR) *", "الاسم (AR) *")}</label>
                  <input className="form-input" value={form.nameAr} onChange={(e) => set("nameAr", e.target.value)} placeholder="تيشيرت قطن..." dir="rtl" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{L("Category", "الفئة")}</label>
                <select className="form-input form-select" value={form.category} onChange={(e) => set("category", e.target.value)}>
                  {CATS.map((c) => (
                    <option key={c} value={c}>{L(CAT_LABEL_EN[c], CAT_LABEL_AR[c])}</option>
                  ))}
                </select>
              </div>

              <div className="grid-2" style={{ gap: 10 }}>
                <div className="form-group">
                  <label className="form-label">{L("Base Price (EGP) *", "السعر الأساسي (ج.م) *")}</label>
                  <input className="form-input" type="number" value={form.basePrice} onChange={(e) => set("basePrice", e.target.value)} placeholder="0" />
                </div>
                <div className="form-group">
                  <label className="form-label">{L("Quantity in Stock *", "الكمية المتاحة في المخزون *")}</label>
                  <input className="form-input" type="number" value={form.quantity} onChange={(e) => set("quantity", e.target.value)} placeholder="0" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{L("Minimum Order Quantity (MOQ) *", "الحد الأدنى للطلب (MOQ) *")}</label>
                <input className="form-input" type="number" value={form.minOrder} onChange={(e) => set("minOrder", e.target.value)} placeholder="e.g. 50" />
              </div>

              <div className="grid-2" style={{ gap: 10 }}>
                <div className="form-group">
                  <label className="form-label">{L("Description (EN)", "الوصف (EN)")}</label>
                  <textarea className="form-input form-textarea" value={form.descriptionEn} onChange={(e) => set("descriptionEn", e.target.value)} placeholder="Details..." style={{ minHeight: 60 }} />
                </div>
                <div className="form-group">
                  <label className="form-label">{L("Description (AR)", "الوصف (AR)")}</label>
                  <textarea className="form-input form-textarea" value={form.descriptionAr} onChange={(e) => set("descriptionAr", e.target.value)} placeholder="تفاصيل المنتج..." style={{ minHeight: 60 }} dir="rtl" />
                </div>
              </div>

              {/* Volume Discount Tiers */}
              <div>
                <div className="flex-between" style={{ marginBottom: 8 }}>
                  <label className="form-label">{L("Volume Pricing Tiers", "خصومات الأسعار بحسب الكميات")}</label>
                  <button className="btn btn-ghost btn-sm" onClick={addTier}>
                    <Plus size={13} /> {L("Add Tier", "إضافة فئة خصم")}
                  </button>
                </div>
                {form.tiers.map((t, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, marginBottom: 7, alignItems: "center" }}>
                    <input className="form-input" type="number" placeholder={L("Min Qty", "أقل كمية")} value={t.minQty} onChange={(e) => setTier(i, "minQty", e.target.value)} style={{ flex: 2 }} />
                    <input className="form-input" type="number" placeholder={L("Discount %", "خصم %")} value={t.discount} onChange={(e) => setTier(i, "discount", e.target.value)} style={{ flex: 1 }} min="0" max="80" />
                    {form.tiers.length > 1 && (
                      <button className="btn btn-ghost btn-icon-sm" onClick={() => removeTier(i)}>
                        <X size={13} style={{ color: "var(--danger)" }} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn btn-secondary" onClick={() => setShowAdd(false)}>{L("Cancel", "إلغاء")}</button>
              <button className="btn btn-primary" onClick={handleAdd} disabled={saving}>
                {saving ? <span className="btn-spinner" /> : <>{L("Submit for Approval", "تقديم للمراجعة")}</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Document Viewer Modal ─────────────────── */}
      {viewingDoc && (
        <div className="modal-bg" onClick={() => setViewingDoc(null)}>
          <div className="modal" style={{ maxWidth: 640 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h2 className="modal-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <FileText size={18} />
                <span>
                  {L(
                    viewingDoc.docKey === "commercialRegister" ? "Commercial Register" : "Tax Card",
                    viewingDoc.docKey === "commercialRegister" ? "السجل التجاري" : "البطاقة الضريبية"
                  )}
                </span>
                <span style={{ fontSize: "0.78rem", fontWeight: 400, color: "var(--text-muted)" }}>
                  ({isRTL ? viewingDoc.user.companyNameAr || viewingDoc.user.companyName : viewingDoc.user.companyName})
                </span>
              </h2>
              <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => setViewingDoc(null)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body" style={{ textAlign: "center", background: "var(--bg-surface)", padding: 20 }}>
              {viewingDoc.docData?.data?.startsWith("data:image/") ? (
                <img
                  src={viewingDoc.docData.data}
                  alt={viewingDoc.docData.name}
                  style={{ maxWidth: "100%", maxHeight: "400px", objectFit: "contain", borderRadius: "var(--radius-md)", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
                />
              ) : (
                <div style={{ padding: "40px 20px", color: "var(--text-muted)", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
                  <FileText size={48} style={{ color: "var(--brand)" }} />
                  <div>
                    <strong style={{ display: "block", color: "var(--text-1)" }}>{viewingDoc.docData.name}</strong>
                    <span style={{ fontSize: "0.72rem" }}>{L("Uploaded on", "تم الرفع بتاريخ")} {viewingDoc.docData.date}</span>
                  </div>
                  <a href={viewingDoc.docData.data} download={viewingDoc.docData.name} className="btn btn-primary btn-sm">
                    {L("Download File to View", "تحميل الملف للعرض")}
                  </a>
                </div>
              )}
            </div>
            <div className="modal-foot" style={{ justifyContent: "space-between" }}>
              <div>{getDocStatusBadge(viewingDoc.docData)}</div>
              <div style={{ display: "flex", gap: 8 }}>
                {viewingDoc.docData.status === "pending" && (
                  <>
                    <button
                      className="btn btn-success"
                      onClick={() => {
                        approveDocument(viewingDoc.user.id, viewingDoc.docKey);
                        setViewingDoc(null);
                      }}
                    >
                      {L("Approve", "قبول")}
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        rejectDocument(viewingDoc.user.id, viewingDoc.docKey);
                        setViewingDoc(null);
                      }}
                    >
                      {L("Reject", "رفض")}
                    </button>
                  </>
                )}
                <button className="btn btn-ghost" onClick={() => setViewingDoc(null)}>{L("Close", "إغلاق")}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

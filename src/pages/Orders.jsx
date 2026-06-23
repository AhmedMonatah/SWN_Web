import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { translations } from "../data/translations";
import { Search, ChevronDown, Check, Truck, Package, Clock, XCircle, Eye } from "lucide-react";
import Drawer from "../components/ui/Drawer";

const STATUS_CONFIG = {
  pending:   { color: "status-pending",   icon: <Clock size={14} />,    steps: 0 },
  confirmed: { color: "status-confirmed", icon: <Check size={14} />,    steps: 1 },
  preparing: { color: "status-preparing", icon: <Package size={14} />, steps: 2 },
  shipped:   { color: "status-shipped",   icon: <Truck size={14} />,   steps: 3 },
  delivered: { color: "status-delivered", icon: <Check size={14} />,   steps: 4 },
  cancelled: { color: "status-cancelled", icon: <XCircle size={14} />, steps: -1 },
};

const TIMELINE_STEPS = [
  { statusKey: "pending",   iconEn: "📥", labelEn: "Order Received",      labelAr: "تم استلام الطلب" },
  { statusKey: "confirmed", iconEn: "✅", labelEn: "Seller Approved",      labelAr: "وافق البائع" },
  { statusKey: "preparing", iconEn: "📦", labelEn: "Packing & Preparing",  labelAr: "جاري التعبئة والتجهيز" },
  { statusKey: "shipped",   iconEn: "🚚", labelEn: "In Transit",           labelAr: "في الطريق إليك" },
  { statusKey: "delivered", iconEn: "🎉", labelEn: "Delivered",            labelAr: "تم التوصيل" },
];

export default function Orders() {
  const { language, currentUser, orders, updateOrderStatus, setActiveDrawer } = useApp();
  const t = translations[language];
  const isRTL = language === "ar";

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const filtered = orders
    .filter(o => statusFilter === "all" || o.status === statusFilter)
    .filter(o => !search || o.id.toLowerCase().includes(search.toLowerCase()));

  const canManage = ["supplier", "wholesaler", "admin"].includes(currentUser?.role);

  const nextStatus = (current) => {
    const flow = ["pending", "confirmed", "preparing", "shipped", "delivered"];
    const idx = flow.indexOf(current);
    return idx >= 0 && idx < flow.length - 1 ? flow[idx + 1] : null;
  };

  const STATUS_LABELS_EN = { pending: "Pending", confirmed: "Confirmed", preparing: "Preparing", shipped: "Shipped", delivered: "Delivered", cancelled: "Cancelled" };
  const STATUS_LABELS_AR = { pending: "معلق", confirmed: "مؤكد", preparing: "قيد التجهيز", shipped: "تم الشحن", delivered: "تم التوصيل", cancelled: "ملغي" };

  const getStepStatus = (stepKey, orderStatus) => {
    if (orderStatus === "cancelled") return "pending";
    const statusIndex = STATUS_CONFIG[orderStatus]?.steps ?? 0;
    const stepIndex = STATUS_CONFIG[stepKey]?.steps ?? 0;
    if (stepIndex < statusIndex) return "done";
    if (stepIndex === statusIndex) return "active";
    return "pending";
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Header */}
        <div className="page-header-section">
          <h1 className="page-title">{t.orders}</h1>
          <p className="page-subtitle">
            {isRTL
              ? `إجمالي ${filtered.length} طلب في سجلك التجاري`
              : `${filtered.length} orders in your business record`}
          </p>
        </div>

        {/* Toolbar */}
        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
          <div className="search-bar" style={{ flex: "1 1 300px", background: "var(--bg-card)", border: "1px solid var(--border)", height: 40, borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", padding: "0 12px", gap: 8 }}>
            <Search size={16} className="search-icon" style={{ color: "var(--text-3)" }} />
            <input
              className="search-input"
              placeholder={isRTL ? "ابحث برقم الطلب..." : "Search by order ID..."}
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ border: "none", outline: "none", background: "transparent", width: "100%", fontSize: "0.82rem", color: "var(--text-1)" }}
            />
          </div>

          {/* Status filter pills */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["all", "pending", "confirmed", "preparing", "shipped", "delivered", "cancelled"].map(s => (
              <button
                key={s}
                className={`btn btn-sm ${statusFilter === s ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setStatusFilter(s)}
                style={{ fontSize: "0.78rem", padding: "6px 12px" }}
              >
                {s === "all" ? (isRTL ? "الكل" : "All") : (isRTL ? STATUS_LABELS_AR[s] : STATUS_LABELS_EN[s])}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3 className="empty-state-title">{isRTL ? "لا توجد طلبات" : "No orders found"}</h3>
            <p className="empty-state-desc">
              {isRTL ? "ستظهر طلباتك هنا بعد إتمام أول عملية شراء" : "Your orders will appear here after your first purchase"}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 20, maxHeight: "70vh", overflowY: "auto", paddingRight: 8, paddingBottom: 20 }} className="stagger-children">
            {filtered.map((order, i) => (
              <div
                key={order.id}
                className="order-card"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                {/* Order header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div className="order-id-badge">#{order.id.split("-").pop()}</div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: "0.88rem", color: "var(--primary-700)" }}>{order.id}</div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{order.date}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span className={`status-badge ${STATUS_CONFIG[order.status]?.color || "status-pending"}`}>
                      {STATUS_CONFIG[order.status]?.icon}
                      {isRTL ? STATUS_LABELS_AR[order.status] : STATUS_LABELS_EN[order.status]}
                    </span>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => { setSelectedOrder(order); setActiveDrawer("order-details"); }}
                    >
                      <Eye size={15} />
                      {isRTL ? "التفاصيل" : "Details"}
                    </button>
                  </div>
                </div>

                {/* Order mini-summary */}
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", fontSize: "0.82rem" }}>
                  <div style={{ display: "flex", gap: 5, alignItems: "center", color: "var(--text-muted)" }}>
                    <span>👤</span>
                    <span>{order.buyerId === currentUser?.id ? (isRTL ? "أنت المشتري" : "You (Buyer)") : (isRTL ? order.buyerNameAr || order.buyerName : order.buyerName)}</span>
                  </div>
                  <div style={{ color: "var(--text-muted)" }}>·</div>
                  <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                    <span>💳</span>
                    <span style={{ color: "var(--text-muted)" }}>
                      {order.paymentMethod === "bankTransfer" ? (isRTL ? "تحويل بنكي" : "Bank Transfer")
                        : order.paymentMethod === "cod" ? (isRTL ? "عند الاستلام" : "Cash on Delivery")
                        : (isRTL ? "بطاقة ائتمان" : "Credit Card")}
                    </span>
                  </div>
                  <div style={{ color: "var(--text-muted)" }}>·</div>
                  <div style={{ fontWeight: 800, color: "var(--primary-600)", fontSize: "0.95rem" }}>
                    {order.totalAmount?.toLocaleString()} {isRTL ? "ج.م" : "EGP"}
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      <Drawer
        id="order-details"
        title={selectedOrder ? (isRTL ? `تفاصيل الطلب #${selectedOrder.id.split("-").pop()}` : `Order Details #${selectedOrder.id.split("-").pop()}`) : ""}
      >
        {selectedOrder && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Timeline */}
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.85rem", marginBottom: 14 }}>{t.orderTimeline}</div>
              <div className="order-timeline">
                {TIMELINE_STEPS.map((step, si) => {
                  const stepStatus = getStepStatus(step.statusKey, selectedOrder.status);
                  const isLast = si === TIMELINE_STEPS.length - 1;
                  const timelineEntry = selectedOrder.timeline?.find(t => t.status === step.statusKey);
                  return (
                    <div key={step.statusKey} className="timeline-item">
                      {!isLast && <div className={`timeline-line ${stepStatus === "done" ? "done" : ""}`} />}
                      <div className={`timeline-dot ${stepStatus}`}>{step.iconEn}</div>
                      <div className="timeline-content">
                        <div className="timeline-title">{isRTL ? step.labelAr : step.labelEn}</div>
                        {timelineEntry && (
                          <div className="timeline-time">
                            {new Date(timelineEntry.time).toLocaleString(isRTL ? "ar-EG" : "en-US", { dateStyle: "short", timeStyle: "short" })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Items + Actions */}
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.85rem", marginBottom: 12 }}>
                {isRTL ? "تفاصيل المنتجات" : "Order Items"}
              </div>
              {selectedOrder.items?.map((item, ii) => (
                <div key={ii} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border-color)", fontSize: "0.82rem" }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{isRTL ? item.nameAr || item.nameEn : item.nameEn}</div>
                    <div style={{ color: "var(--text-muted)" }}>{item.quantity} × {item.price} {isRTL ? "ج.م" : "EGP"}</div>
                  </div>
                  <div style={{ fontWeight: 700, color: "var(--primary-600)" }}>
                    {(item.quantity * item.price).toLocaleString()} {isRTL ? "ج.م" : "EGP"}
                  </div>
                </div>
              ))}

              <div style={{ marginTop: 12, padding: "10px 12px", background: "var(--bg-muted)", borderRadius: "var(--radius-md)", display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 600, fontSize: "0.85rem" }}>{isRTL ? "الإجمالي" : "Total"}</span>
                <span style={{ fontWeight: 900, color: "var(--primary-600)" }}>{selectedOrder.totalAmount?.toLocaleString()} {isRTL ? "ج.م" : "EGP"}</span>
              </div>

              {/* Manage actions — for sellers or admin */}
              {((canManage && selectedOrder.sellerId === currentUser?.id) || currentUser?.role === "admin") && nextStatus(selectedOrder.status) && (
                <div style={{ marginTop: 24 }}>
                  <button
                    className="btn btn-primary w-full"
                    onClick={() => { updateOrderStatus(selectedOrder.id, nextStatus(selectedOrder.status)); setSelectedOrder({ ...selectedOrder, status: nextStatus(selectedOrder.status) }); }}
                    style={{ padding: "12px", fontSize: "0.9rem" }}
                  >
                    {isRTL ? `تحديث إلى: ${STATUS_LABELS_AR[nextStatus(selectedOrder.status)]}` : `Update to: ${STATUS_LABELS_EN[nextStatus(selectedOrder.status)]}`}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </Drawer>

      <style>{`
        .order-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-xl);
          padding: 18px 20px;
          transition: var(--t-normal);
          animation: fadeInUp 0.4s ease both;
        }
        .order-card:hover { box-shadow: var(--shadow-md); border-color: var(--primary-200); }
        .order-id-badge {
          min-width: 40px; height: 40px;
          padding: 0 10px;
          border-radius: var(--radius-md);
          background: var(--primary-50);
          color: var(--primary-700);
          font-weight: 900;
          font-size: 0.7rem;
          display: flex; align-items: center; justify-content: center;
          border: 1px solid var(--primary-100);
          text-align: center;
          line-height: 1.2;
          flex-shrink: 0;
          white-space: nowrap;
        }
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: var(--radius-full);
          font-size: 0.72rem;
          font-weight: 700;
          background: var(--warning-bg, #fef3c7);
          color: var(--warning, #d97706);
        }
        .status-badge.status-delivered {
          background: var(--success-bg, #dcfce7);
          color: var(--success, #16a34a);
        }
        @media (max-width: 640px) {
          .order-detail > div { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

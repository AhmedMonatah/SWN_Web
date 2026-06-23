import React, { useState, useRef } from "react";
import { useApp } from "../context/AppContext";
import { db } from "../services/db";
import { translations } from "../data/translations";
import { Camera, Upload, FileText, CheckCircle, Edit2, Save, X, Phone, MapPin, Building2, Mail, Shield } from "lucide-react";

const TIER_CONFIG = {
  bronze: { label: "Bronze", labelAr: "برونزي", color: "#cd7f32", bg: "#fef3c7" },
  silver: { label: "Silver", labelAr: "فضي",   color: "#9ca3af", bg: "#f1f5f9" },
  gold:   { label: "Gold",   labelAr: "ذهبي",  color: "#d97706", bg: "#fef3c7" },
  vip:    { label: "VIP",    labelAr: "VIP",    color: "#7c3aed", bg: "#ede9fe" },
};

const ROLE_LABELS_AR = { supplier: "مورد", wholesaler: "تاجر جملة", retailer: "تاجر تجزئة", admin: "مدير" };
const ROLE_LABELS_EN = { supplier: "Supplier", wholesaler: "Wholesaler", retailer: "Retailer", admin: "Admin" };

export default function Profile() {
  const { language, currentUser, setCurrentUser } = useApp();
  const t = translations[language];
  const isRTL = language === "ar";
  const L = (en, ar) => (isRTL ? ar : en);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...currentUser });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const avatarRef = useRef(null);
  const crRef = useRef(null);
  const tcRef = useRef(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      const updated = db.updateUser(currentUser.id, form);
      setCurrentUser(updated);
      setEditing(false);
      setSaving(false);
      showToast(isRTL ? "تم حفظ التغييرات بنجاح ✓" : "Changes saved successfully ✓");
    }, 600);
  };

  const handleCancel = () => {
    setForm({ ...currentUser });
    setEditing(false);
  };

  // File to base64 helper
  const fileToBase64 = (file) => new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.readAsDataURL(file);
  });

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { showToast(isRTL ? "حجم الصورة يجب أن يكون أقل من 2MB" : "Image must be under 2MB", "error"); return; }
    const b64 = await fileToBase64(file);
    const updated = db.updateUser(currentUser.id, { profileImage: b64 });
    setCurrentUser(updated);
    setForm(f => ({ ...f, profileImage: b64 }));
    showToast(isRTL ? "تم تحديث صورة الملف الشخصي ✓" : "Profile image updated ✓");
  };

  const handleDocUpload = async (e, docKey) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { showToast(isRTL ? "حجم الملف يجب أن يكون أقل من 5MB" : "Image/File must be under 5MB", "error"); return; }
    const b64 = await fileToBase64(file);
    const newDocs = { 
      ...currentUser.documents, 
      [docKey]: { 
        name: file.name, 
        data: b64, 
        type: file.type, 
        date: new Date().toLocaleDateString(),
        status: "pending"
      } 
    };
    const updated = db.updateUser(currentUser.id, { documents: newDocs });
    setCurrentUser(updated);
    setForm(f => ({ ...f, documents: newDocs }));
    showToast(isRTL ? "تم رفع المستند وبانتظار موافقة المدير ✓" : "Document uploaded and pending admin approval ✓");
  };

  const handleRemoveDoc = (docKey) => {
    const newDocs = { ...currentUser.documents, [docKey]: null };
    const updated = db.updateUser(currentUser.id, { documents: newDocs });
    setCurrentUser(updated);
    setForm(f => ({ ...f, documents: newDocs }));
    showToast(isRTL ? "تم حذف المستند" : "Document removed", "info");
  };

  const tier = TIER_CONFIG[currentUser?.tier] || TIER_CONFIG.bronze;
  
  const displayName = isRTL ? currentUser?.nameAr || currentUser?.name : currentUser?.name || currentUser?.nameAr;
  const displayCompany = isRTL ? currentUser?.companyNameAr || currentUser?.companyName : currentUser?.companyName || currentUser?.companyNameAr;
  
  const initials = displayName
    ? displayName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";
    
  const verifiedDocs = currentUser?.documents?.commercialRegister?.status === "approved" && currentUser?.documents?.taxCard?.status === "approved";

  const DOCS = [
    { key: "commercialRegister", labelEn: "Commercial Register", labelAr: "السجل التجاري", emoji: "📋", ref: crRef },
    { key: "taxCard",            labelEn: "Tax Card",            labelAr: "البطاقة الضريبية", emoji: "🪪", ref: tcRef },
  ];

  return (
    <div className="page-wrap" style={{ background: "var(--bg-page)", padding: "30px 0" }}>
      <div className="container" style={{ maxWidth: 900 }}>

        {/* ── Profile Hero Card ──────────────────── */}
        <div className="profile-hero-card anim-fade-up">
          <div className="profile-hero-bg" />

          <div className="profile-hero-body">
            {/* Avatar */}
            <div className="avatar-wrap" style={{ flexShrink: 0 }}>
              {currentUser?.profileImage ? (
                <img src={currentUser.profileImage} alt={displayName} className="avatar-img" />
              ) : (
                <div className="avatar-placeholder">{initials}</div>
              )}
              <label className="avatar-edit-btn" title={isRTL ? "تغيير الصورة" : "Change photo"}>
                <Camera size={14} style={{ color: "white" }} />
                <input ref={avatarRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarChange} />
              </label>
            </div>

            {/* Info */}
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <h1 style={{ fontSize: "1.4rem", fontWeight: 900, color: "var(--text-1)" }}>
                  {displayName}
                </h1>
                <span className={`role-chip chip-${currentUser?.role}`} style={{ fontSize: ".68rem", fontWeight: 700 }}>
                  {isRTL ? ROLE_LABELS_AR[currentUser?.role] : ROLE_LABELS_EN[currentUser?.role]}
                </span>
                {verifiedDocs && (
                  <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.72rem", fontWeight: 700, color: "var(--success)" }}>
                    <CheckCircle size={13} /> {t.verified}
                  </span>
                )}
              </div>

              <div style={{ fontSize: "0.88rem", color: "var(--text-2)", marginTop: 4 }}>
                {displayCompany}
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 10, flexWrap: "wrap", alignItems: "center" }}>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 12px",
                  borderRadius: "var(--radius-full)", fontWeight: 700, fontSize: "0.75rem",
                  background: tier.bg, color: tier.color, border: `1.5px solid ${tier.color}30`
                }}>
                  ⭐ {isRTL ? tier.labelAr : tier.label} {isRTL ? "عضو" : "Member"}
                </span>
                <span style={{ fontSize: "0.78rem", color: "var(--text-3)", display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <Mail size={13} /> {currentUser?.email}
                </span>
              </div>
            </div>

            {/* Edit button */}
            <button
              className="btn btn-secondary"
              style={{ alignSelf: "flex-start" }}
              onClick={() => setEditing(true)}
            >
              <Edit2 size={14} /> {isRTL ? "تعديل الملف" : "Edit Profile"}
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: currentUser?.role === "admin" ? "1fr" : "1fr 1fr", gap: 20, marginTop: 20 }}>

          {/* ── Company Information ───────────────── */}
          <div className="card anim-fade-up" style={{ animationDelay: "0.1s" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: "0.95rem", fontWeight: 800 }}>{t.companyInfo}</h2>
              {!editing && (
                <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>
                  <Edit2 size={14} /> {isRTL ? "تعديل" : "Edit"}
                </button>
              )}
            </div>

            {editing ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">{isRTL ? "الاسم (EN)" : "Name (EN)"}</label>
                  <input className="form-input" name="name" value={form.name} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">{isRTL ? "الاسم (AR)" : "الاسم (AR)"}</label>
                  <input className="form-input" name="nameAr" value={form.nameAr || ""} onChange={handleChange} dir="rtl" />
                </div>
                <div className="form-group">
                  <label className="form-label">{isRTL ? "اسم الشركة (EN)" : "Company (EN)"}</label>
                  <input className="form-input" name="companyName" value={form.companyName} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">{isRTL ? "اسم الشركة (AR)" : "اسم الشركة (AR)"}</label>
                  <input className="form-input" name="companyNameAr" value={form.companyNameAr || ""} onChange={handleChange} dir="rtl" />
                </div>
                <div className="form-group">
                  <label className="form-label">{t.phone}</label>
                  <input className="form-input" name="phone" value={form.phone || ""} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">{isRTL ? "العنوان (EN)" : "Address (EN)"}</label>
                  <textarea className="form-input form-textarea" name="address" value={form.address || ""} onChange={handleChange} style={{ minHeight: 60 }} />
                </div>
                <div className="form-group">
                  <label className="form-label">{isRTL ? "العنوان (AR)" : "العنوان (AR)"}</label>
                  <textarea className="form-input form-textarea" name="addressAr" value={form.addressAr || ""} onChange={handleChange} style={{ minHeight: 60 }} dir="rtl" />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSave} disabled={saving}>
                    {saving ? <span className="btn-spinner" style={{ width: 16, height: 16 }} /> : <><Save size={15} /> {t.save}</>}
                  </button>
                  <button className="btn btn-secondary" onClick={handleCancel}>
                    <X size={15} /> {t.cancel}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { icon: <Building2 size={15} />, label: isRTL ? "الشركة" : "Company", value: isRTL ? currentUser?.companyNameAr || currentUser?.companyName : currentUser?.companyName },
                  { icon: <Mail size={15} />, label: t.email, value: currentUser?.email },
                  { icon: <Phone size={15} />, label: t.phone, value: currentUser?.phone || "—" },
                  { icon: <MapPin size={15} />, label: isRTL ? "العنوان" : "Address", value: (isRTL ? currentUser?.addressAr || currentUser?.address : currentUser?.address) || "—" },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div style={{ width: 32, height: 32, borderRadius: "var(--radius-sm)", background: "var(--primary-50)", color: "var(--primary-600)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                      {item.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 600, marginBottom: 2 }}>{item.label}</div>
                      <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--text-main)" }}>{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Documents ─────────────────────────── */}
          {currentUser?.role !== "admin" && (
            <div className="card anim-fade-up" style={{ animationDelay: "0.2s" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: "0.95rem", fontWeight: 800 }}>
                <Shield size={16} style={{ display: "inline", marginInlineEnd: 6, color: "var(--primary-600)" }} />
                {t.documents}
              </h2>
              {verifiedDocs && (
                <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.72rem", fontWeight: 700, color: "var(--success)", background: "#dcfce7", padding: "3px 10px", borderRadius: "var(--radius-full)" }}>
                  <CheckCircle size={12} /> {t.verified}
                </span>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {DOCS.map((doc) => {
                const uploaded = currentUser?.documents?.[doc.key];
                return (
                  <div key={doc.key} className="doc-card">
                    <div className="doc-icon" style={{ background: uploaded ? "#dcfce7" : "var(--bg-muted)", color: uploaded ? "var(--success)" : "var(--text-muted)" }}>
                      {doc.emoji}
                    </div>
                    <div className="doc-info">
                      <div className="doc-name">{isRTL ? doc.labelAr : doc.labelEn}</div>
                      {uploaded ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                          <div className="doc-status uploaded" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <CheckCircle size={11} />
                            {isRTL ? `تم الرفع — ${uploaded.name || "مستند"}` : `Uploaded — ${uploaded.name || "document"}`}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.72rem", marginTop: 2 }}>
                            {uploaded.status === "approved" ? (
                              <span style={{ color: "var(--success)", fontWeight: 700 }}>✓ {L("Approved", "مقبول")}</span>
                            ) : uploaded.status === "rejected" ? (
                              <span style={{ color: "var(--danger)", fontWeight: 700 }}>✗ {L("Rejected", "مرفوض")}</span>
                            ) : (
                              <span style={{ color: "var(--warning)", fontWeight: 700 }}>⏳ {L("Pending Review", "قيد الانتظار")}</span>
                            )}
                            {uploaded.date && <span style={{ color: "var(--text-muted)" }}>· {uploaded.date}</span>}
                          </div>
                        </div>
                      ) : (
                        <div className="doc-status missing">{isRTL ? "لم يتم الرفع بعد" : "Not uploaded yet"}</div>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <label className="btn btn-secondary btn-sm" style={{ cursor: "pointer" }}>
                        <Upload size={13} />
                        {uploaded ? (isRTL ? "تحديث" : "Update") : (isRTL ? "رفع" : "Upload")}
                        <input
                          ref={doc.ref}
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          style={{ display: "none" }}
                          onChange={e => handleDocUpload(e, doc.key)}
                        />
                      </label>
                      {uploaded && (
                        <button className="btn btn-ghost btn-sm" onClick={() => handleRemoveDoc(doc.key)} title="Remove">
                          <X size={13} style={{ color: "var(--danger)" }} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {!verifiedDocs && (
                <div style={{ padding: "14px", background: "#fef3c7", border: "1px solid #fde68a", borderRadius: "var(--radius-md)", fontSize: "0.8rem", color: "#b45309", display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <span>⚠️</span>
                  <span>{isRTL ? "يرجى رفع السجل التجاري والبطاقة الضريبية لتفعيل حسابك بالكامل" : "Upload your Commercial Register and Tax Card to fully verify your account."}</span>
                </div>
              )}

              {/* Profile image upload hint */}
              <div style={{ marginTop: 4, padding: "12px 14px", background: "var(--primary-50)", border: "1px solid var(--primary-100)", borderRadius: "var(--radius-md)", fontSize: "0.78rem", color: "var(--primary-700)" }}>
                📸 {isRTL ? "اضغط على صورة الملف الشخصي أعلاه لتغييرها (حد 2MB)" : "Click the profile avatar above to change it (max 2MB)"}
              </div>
            </div>
          </div>
          )}
        </div>

        {/* ── Account Security ───────────────────── */}
        <div className="card anim-fade-up" style={{ marginTop: 20, animationDelay: "0.3s" }}>
          <h2 style={{ fontSize: "0.95rem", fontWeight: 800, marginBottom: 16 }}>
            {isRTL ? "معلومات الأمان" : "Account Security"}
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
            {[
              { label: isRTL ? "البريد الإلكتروني" : "Email", value: currentUser?.email, icon: "📧" },
              { label: isRTL ? "نوع الحساب" : "Account Type", value: isRTL ? ROLE_LABELS_AR[currentUser?.role] : ROLE_LABELS_EN[currentUser?.role], icon: "🏷️" },
              { label: isRTL ? "مستوى العضوية" : "Membership", value: `${isRTL ? tier.labelAr : tier.label} ⭐`, icon: "🎖️" },
            ].map((item, i) => (
              <div key={i} style={{ padding: "14px 16px", background: "var(--bg-muted)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-color)" }}>
                <div style={{ fontSize: "1.2rem", marginBottom: 6 }}>{item.icon}</div>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 600, marginBottom: 3 }}>{item.label}</div>
                <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text-main)" }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>
            {toast.type === "success" ? <CheckCircle size={18} /> : toast.type === "error" ? "❌" : "ℹ️"}
            {toast.msg}
          </div>
        </div>
      )}

      <style>{`
        .profile-hero-card { background: var(--bg-card); border-radius: var(--radius-xl); overflow: hidden; position: relative; border: 1px solid var(--border); box-shadow: var(--shadow-sm); }
        .profile-hero-bg { position: absolute; inset: 0; background: linear-gradient(135deg, var(--brand-50) 0%, transparent 100%); pointer-events: none; opacity: 0.8; }
        [data-theme="dark"] .profile-hero-bg { background: linear-gradient(135deg, rgba(37,99,235,0.15) 0%, transparent 100%); opacity: 0.3; }
        .profile-hero-body { position: relative; z-index: 1; display: flex; align-items: center; gap: 20px; padding: 28px 28px; flex-wrap: wrap; }
        .btn-spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block; }
        @media (max-width: 768px) {
          .profile-hero-body { padding: 20px 18px; gap: 14px; }
          div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
          div[style*="repeat(3, 1fr)"] { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 480px) {
          div[style*="repeat(3, 1fr)"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

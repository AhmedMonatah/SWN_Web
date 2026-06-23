import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { db } from "../services/db";
import { Mail, Lock, Eye, EyeOff, User, Building2, Phone, MapPin, ArrowRight, AlertCircle, ArrowLeft } from "lucide-react";

const ROLES = [
  { id: "supplier",   en: "Manufacturer / Supplier",       ar: "مصنّع / مورّد",         icon: "🏭", descEn: "I manufacture or supply goods to wholesalers", descAr: "أنتج أو أوفر بضائع لتجار الجملة" },
  { id: "wholesaler", en: "Wholesaler / Distributor",      ar: "تاجر جملة / موزّع",      icon: "🏪", descEn: "I buy in bulk and resell to retailers",         descAr: "أشتري بالجملة وأبيع لتجار التجزئة" },
  { id: "retailer",   en: "Retailer / Shop Owner",         ar: "تاجر تجزئة / صاحب محل", icon: "🛒", descEn: "I buy from wholesalers for my retail store",     descAr: "أشتري من تجار الجملة لمحلي" },
];

export default function Register({ onNavigate }) {
  const { setCurrentUser, language, getDefaultPage } = useApp();
  const isRTL = language === "ar";
  const L = (en, ar) => isRTL ? ar : en;

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ role: "", name: "", nameAr: "", email: "", password: "", companyName: "", companyNameAr: "", phone: "", address: "" });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setError(""); };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.companyName) {
      setError(L("Please fill all required fields.", "يرجى ملء جميع الحقول المطلوبة."));
      return;
    }
    if (form.password.length < 6) {
      setError(L("Password must be at least 6 characters.", "كلمة المرور يجب أن تكون 6 أحرف على الأقل."));
      return;
    }
    setLoading(true);
    const tier = form.role === "supplier" ? "gold" : form.role === "wholesaler" ? "silver" : "bronze";
    setTimeout(() => {
      const result = db.register({ ...form, tier, nameAr: form.nameAr || form.name, companyNameAr: form.companyNameAr || form.companyName });
      if (result.error) {
        setError(L(result.error, "هذا البريد الإلكتروني مسجل بالفعل."));
        setLoading(false);
      } else {
        setCurrentUser(result);
        onNavigate(getDefaultPage(result.role));
      }
    }, 600);
  };

  return (
    <div className="auth-page" style={{ alignItems: step === 1 ? "center" : "flex-start", overflowY: "auto", minHeight: "100vh" }}>
      <div className="auth-card" style={{ maxWidth: step === 1 ? 420 : 520, margin: "auto" }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src="/Web_Logo.png" alt="SWN Logo" style={{ height: 42, objectFit: "contain" }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "1rem", fontWeight: 800, color: "var(--text-1)" }}>SWN</div>
            <div style={{ fontSize: ".68rem", color: "var(--text-3)", marginTop: 1 }}>
              {L(`Step ${step} of 2`, `الخطوة ${step} من 2`)}
            </div>
          </div>
          {step === 2 && (
            <button className="btn btn-ghost btn-sm" onClick={() => setStep(1)}>
              <ArrowLeft size={14} /> {L("Back", "رجوع")}
            </button>
          )}
        </div>

        {/* Progress */}
        <div style={{ height: 3, background: "var(--border)", borderRadius: 9999, overflow: "hidden" }}>
          <div style={{ width: `${step * 50}%`, height: "100%", background: "var(--brand)", transition: "width .4s ease", borderRadius: 9999 }} />
        </div>

        <hr className="auth-divider" />

        {/* ── STEP 1: Role ─────────────────────── */}
        {step === 1 && (
          <div className="anim-fade-up">
            <div>
              <h1 className="auth-title">{L("What type of business?", "ما نوع نشاطك التجاري؟")}</h1>
              <p className="auth-subtitle">{L("Choose the role that matches your business", "اختر الدور المناسب لحسابك")}</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
              {ROLES.map(r => (
                <button
                  key={r.id}
                  style={{
                    display: "flex", alignItems: "center", gap: 14, padding: "16px 16px",
                    border: `1.5px solid ${form.role === r.id ? "var(--brand)" : "var(--border)"}`,
                    borderRadius: "var(--radius-lg)", cursor: "pointer", textAlign: "start",
                    background: form.role === r.id ? "var(--brand-50)" : "var(--bg-card)",
                    transition: "all var(--t-base)", width: "100%",
                  }}
                  onClick={() => { set("role", r.id); setTimeout(() => setStep(2), 180); }}
                >
                  <span style={{ fontSize: "1.8rem", flexShrink: 0 }}>{r.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: ".9rem", fontWeight: 700, color: "var(--text-1)" }}>{L(r.en, r.ar)}</div>
                    <div style={{ fontSize: ".75rem", color: "var(--text-3)", marginTop: 2 }}>{L(r.descEn, r.descAr)}</div>
                  </div>
                  <ArrowRight size={16} className="mirror-rtl" style={{ color: "var(--text-4)", flexShrink: 0 }} />
                </button>
              ))}
            </div>

            <p className="auth-switch" style={{ marginTop: 4 }}>
              {L("Already have an account? ", "لديك حساب بالفعل؟ ")}
              <button className="auth-link" onClick={() => onNavigate("login")}>{L("Sign in", "تسجيل الدخول")}</button>
            </p>
          </div>
        )}

        {/* ── STEP 2: Details ──────────────────── */}
        {step === 2 && (
          <div className="anim-fade-up">
            <div style={{ marginBottom: 24 }}>
              <h1 className="auth-title">{L("Account Details", "بيانات الحساب")}</h1>
              <p className="auth-subtitle">{L("Complete your business profile", "أكمل ملفك التجاري")}</p>
            </div>

            {error && (
              <div className="auth-error anim-fade-in">
                <AlertCircle size={15} /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 11 }} noValidate>
              <div className="grid-2" style={{ gap: 10 }}>
                <div className="form-group">
                  <label className="form-label">{L("Full Name (English) *", "الاسم بالكامل (بالإنجليزي) *")}</label>
                  <div className="input-wrap">
                    <User size={14} className="input-icon-l" />
                    <input className="form-input has-icon-l" type="text" value={form.name} onChange={e => set("name", e.target.value)} placeholder={L("e.g. John Doe", "مثال: John Doe")} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">{L("Full Name (Arabic) *", "الاسم بالكامل (بالعربي) *")}</label>
                  <div className="input-wrap">
                    <User size={14} className="input-icon-l" />
                    <input className="form-input has-icon-l" type="text" value={form.nameAr} onChange={e => set("nameAr", e.target.value)} placeholder={L("e.g. أحمد علي", "مثال: أحمد علي")} />
                  </div>
                </div>
              </div>

              <div className="grid-2" style={{ gap: 10 }}>
                <div className="form-group">
                  <label className="form-label">{L("Company Name (English) *", "اسم الشركة (بالإنجليزي) *")}</label>
                  <div className="input-wrap">
                    <Building2 size={14} className="input-icon-l" />
                    <input className="form-input has-icon-l" type="text" value={form.companyName} onChange={e => set("companyName", e.target.value)} placeholder={L("e.g. Apex Trade", "مثال: Apex Trade")} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">{L("Company Name (Arabic) *", "اسم الشركة (بالعربي) *")}</label>
                  <div className="input-wrap">
                    <Building2 size={14} className="input-icon-l" />
                    <input className="form-input has-icon-l" type="text" value={form.companyNameAr} onChange={e => set("companyNameAr", e.target.value)} placeholder={L("e.g. شركة القمة", "مثال: شركة القمة")} />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{L("Email address *", "البريد الإلكتروني *")}</label>
                <div className="input-wrap">
                  <Mail size={14} className="input-icon-l" />
                  <input className="form-input has-icon-l" type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="you@company.com" autoComplete="email" required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{L("Password * (min. 6 characters)", "كلمة المرور * (6 أحرف على الأقل)")}</label>
                <div className="input-wrap">
                  <Lock size={14} className="input-icon-l" />
                  <input className="form-input has-icon-l" type={showPw ? "text" : "password"} value={form.password} onChange={e => set("password", e.target.value)} placeholder="••••••••" style={{ paddingInlineEnd: 40 }} required />
                  <button type="button" className="input-icon-r" onClick={() => setShowPw(p => !p)} tabIndex={-1}>
                    {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{L("Phone", "رقم الهاتف")}</label>
                <div className="input-wrap">
                  <Phone size={14} className="input-icon-l" />
                  <input className="form-input has-icon-l" type="tel" value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="01x xxxx xxxx" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{L("Business Address", "العنوان التجاري")}</label>
                <div className="input-wrap">
                  <MapPin size={14} className="input-icon-l" />
                  <input className="form-input has-icon-l" type="text" value={form.address} onChange={e => set("address", e.target.value)} placeholder={L("City, Area, Country", "المدينة، المنطقة")} />
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading} style={{ marginTop: 4 }}>
                {loading ? <span className="btn-spinner" /> : <>{L("Create Account", "إنشاء الحساب")} <ArrowRight size={17} className="mirror-rtl" /></>}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

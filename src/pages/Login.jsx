import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { db } from "../services/db";
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react";

export default function Login({ onNavigate }) {
  const { setCurrentUser, language, getDefaultPage } = useApp();
  const isRTL = language === "ar";
  const L = (en, ar) => (isRTL ? ar : en);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError(L("Please enter your email and password.", "يرجى إدخال البريد الإلكتروني وكلمة المرور."));
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const result = db.login(email.trim(), password);
      if (result.error) {
        setError(L(result.error, "البريد الإلكتروني أو كلمة المرور غير صحيحة."));
        setLoading(false);
      } else {
        setCurrentUser(result);
        onNavigate(getDefaultPage(result.role));
      }
    }, 500);
  };

  return (
    <div className="login-split-container">
      {/* Left Column: Visual Cover */}
      <div className="login-cover-column" style={{ backgroundImage: "url('/Login_Cover.png')" }}>
        <div className="login-cover-overlay" />
        <div className="login-cover-content">
          <img src="/Web_Logo.png" alt="SWN Logo" style={{ height: 60, objectFit: "contain", marginBottom: 20 }} />
          <h2 style={{ fontSize: "2rem", fontWeight: 900, color: "#ffffff", lineHeight: 1.2 }}>
            {L("SmartWholesale Network", "شبكة الجملة الذكية (SWN)")}
          </h2>
          <p style={{ fontSize: "0.95rem", color: "rgba(255,255,255,0.85)", marginTop: 12, maxWidth: 480, lineHeight: 1.6 }}>
            {L(
              "Welcome to the intelligent B2B marketplace. Connect directly with verified suppliers, secure pricing tiers, and automate your procurement workflows.",
              "مرحباً بك في شبكة الجملة الذكية. تواصل مباشرة مع الموردين المعتمدين، واحصل على خصومات حصرية، ونظّم عمليات الشراء واللوجستيات لشركتك بسهولة."
            )}
          </p>
        </div>
      </div>

      {/* Right Column: Form */}
      <div className="login-form-column">
        <div className="auth-card" style={{ width: "100%", maxWidth: 420 }}>
          {/* Logo Header (appears on mobile only) */}
          <div className="mobile-logo-header" style={{ display: "none", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <img src="/Web_Logo.png" alt="SWN Logo" style={{ height: 42, objectFit: "contain" }} />
            <div>
              <div style={{ fontSize: "1.1rem", fontWeight: 800 }}>SWN</div>
              <div style={{ fontSize: ".62rem", color: "var(--text-3)" }}>{L("B2B Marketplace", "سوق الجملة الذكي")}</div>
            </div>
          </div>

          <hr className="auth-divider mobile-logo-header" style={{ display: "none", margin: "12px 0" }} />

          <div>
            <h1 className="auth-title" style={{ fontSize: "1.4rem", fontWeight: 800 }}>{L("Sign In", "تسجيل الدخول")}</h1>
            <p className="auth-subtitle">{L("Sign in to your business workspace", "سجّل الدخول إلى مساحة عملك التجاري")}</p>
          </div>

          {error && (
            <div className="auth-error anim-fade-in">
              <AlertCircle size={15} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }} noValidate>
            <div className="form-group">
              <label className="form-label">{L("Email address", "البريد الإلكتروني")}</label>
              <div className="input-wrap">
                <Mail size={15} className="input-icon-l" />
                <input
                  className="form-input has-icon-l"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  placeholder="you@company.com"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{L("Password", "كلمة المرور")}</label>
              <div className="input-wrap">
                <Lock size={15} className="input-icon-l" />
                <input
                  className="form-input has-icon-l"
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder="••••••••"
                  style={{ paddingInlineEnd: 40 }}
                  autoComplete="current-password"
                  required
                />
                <button type="button" className="input-icon-r" onClick={() => setShowPw(p => !p)} tabIndex={-1}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading} style={{ marginTop: 4 }}>
              {loading ? (
                <span className="btn-spinner" />
              ) : (
                <>{L("Sign In", "تسجيل الدخول")} <ArrowRight size={17} className="mirror-rtl" style={{ marginInlineStart: 4 }} /></>
              )}
            </button>
          </form>

          <p className="auth-switch" style={{ marginTop: 8 }}>
            {L("Don't have an account? ", "ليس لديك حساب تجاري؟ ")}
            <button className="auth-link" onClick={() => onNavigate("register")}>
              {L("Create one", "إنشاء حساب")}
            </button>
          </p>


        </div>
      </div>

      <style>{`
        .login-split-container {
          display: flex;
          min-height: 100vh;
          width: 100%;
        }
        .login-cover-column {
          flex: 1.2;
          background-size: cover;
          background-position: center;
          position: relative;
          display: flex;
          align-items: flex-end;
          padding: 60px;
        }
        .login-cover-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(15, 23, 42, 0.1) 0%, rgba(15, 23, 42, 0.85) 100%);
        }
        .login-cover-content {
          position: relative;
          z-index: 1;
          color: white;
          text-align: start;
        }
        .login-form-column {
          flex: 0.8;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-card);
          padding: 40px;
          border-inline-start: 1px solid var(--border);
        }
        .login-form-column .auth-card {
          box-shadow: none;
          border: none;
          padding: 0;
          background: transparent;
        }
        @media (max-width: 1024px) {
          .login-cover-column { display: none; }
          .login-form-column { flex: 1; background: var(--bg-page); padding: 20px; }
          .mobile-logo-header { display: flex !important; }
          .login-form-column .auth-card {
            background: var(--bg-card);
            border: 1px solid var(--border) !important;
            border-radius: var(--radius-2xl) !important;
            padding: 32px 28px !important;
            box-shadow: var(--shadow-xl) !important;
            max-width: 420px;
          }
        }
      `}</style>
    </div>
  );
}

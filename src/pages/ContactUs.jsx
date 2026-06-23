import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { translations } from "../data/translations";
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, CheckCircle } from "lucide-react";

export default function ContactUs({ onAuthClick }) {
  const { language, currentUser, contactMessages, sendContactMessage } = useApp();
  const t = translations[language];
  const isRTL = language === "ar";
  const L = (en, ar) => (isRTL ? ar : en);

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  // Prompt to log in if not logged in
  useEffect(() => {
    if (!currentUser && onAuthClick) {
      onAuthClick("login");
    }
  }, [currentUser, onAuthClick]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!currentUser) {
      if (onAuthClick) onAuthClick("login");
      return;
    }
    sendContactMessage({
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      subject,
      message,
    });
    setSubject("");
    setMessage("");
  };

  const myMessages = currentUser
    ? contactMessages.filter((m) => m.userId === currentUser.id)
    : [];

  if (!currentUser) {
    return (
      <div className="page-wrap" style={{ minHeight: "calc(100vh - var(--header-h))", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="card anim-fade-up" style={{ maxWidth: 400, textAlign: "center", padding: "40px 30px" }}>
          <div style={{ fontSize: "3.5rem", marginBottom: 20 }}>🔒</div>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: 10 }}>
            {L("Access Restricted", "تسجيل الدخول مطلوب")}
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: 24, lineHeight: 1.5 }}>
            {L("Please sign in to send messages to support and view responses.", "يرجى تسجيل الدخول لتتمكن من إرسال رسائل للدعم الفني واستعراض الردود.")}
          </p>
          <button className="btn btn-primary w-full" onClick={() => onAuthClick && onAuthClick("login")}>
            {L("Sign In / Register", "تسجيل الدخول / إنشاء حساب")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrap" style={{ minHeight: "calc(100vh - var(--header-h))", background: "var(--bg-page)", padding: "30px 0" }}>
      <div className="container" style={{ maxWidth: 900 }}>
        <div className="anim-fade-up">
          <div style={{ textAlign: "center", marginBottom: 35 }}>
            <h1 className="landing-sec-title">{L("Contact Us", "تواصل معنا")}</h1>
            <p className="landing-sec-subtitle">
              {L("We are here to assist you and answer all your business questions", "نحن هنا لمساعدتكم والإجابة على كافة استفساراتكم التجارية")}
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 24, alignItems: "start" }} className="contact-grid">
            {/* Contact Info & Details */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div className="card">
                <h3 style={{ fontSize: "1.05rem", fontWeight: 800, marginBottom: 18, color: "var(--text-1)" }}>
                  {L("Egypt Headquarters", "المقر الرئيسي - مصر")}
                </h3>
                
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 38, height: 38, borderRadius: "var(--radius-md)", background: "var(--brand-50)", color: "var(--brand)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Mail size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 600 }}>{L("Corporate Support", "البريد الإلكتروني")}</div>
                      <div style={{ fontSize: "0.85rem", color: "var(--text-main)", fontWeight: 700 }}>support@swn.com.eg</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 38, height: 38, borderRadius: "var(--radius-md)", background: "var(--brand-50)", color: "var(--brand)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Phone size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 600 }}>{L("Support Line", "الهاتف")}</div>
                      <div style={{ fontSize: "0.85rem", color: "var(--text-main)", fontWeight: 700, direction: "ltr" }}>+20 10 1234 5678</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 38, height: 38, borderRadius: "var(--radius-md)", background: "var(--brand-50)", color: "var(--brand)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <MapPin size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 600 }}>{L("Cairo Office", "العنوان")}</div>
                      <div style={{ fontSize: "0.85rem", color: "var(--text-main)", fontWeight: 700 }}>
                        {L("Nasr City, Cairo, Egypt", "مدينة نصر، القاهرة، جمهورية مصر العربية")}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tips Card */}
              <div className="card" style={{ background: "linear-gradient(135deg, var(--brand-50) 0%, transparent 100%)", border: "1px solid var(--brand-100)" }}>
                <h4 style={{ fontSize: "0.88rem", fontWeight: 800, color: "var(--brand)", marginBottom: 8 }}>💡 {L("SWN Helpdesk Tip", "نصيحة الدعم الفني")}</h4>
                <p style={{ fontSize: "0.78rem", color: "var(--text-2)", lineHeight: 1.5 }}>
                  {L("Admins typically review and respond to inquiries within 2 hours. Once replied, you will receive an instant account notification.", "يقوم فريق الإدارة عادة بمراجعة الرسائل والرد عليها في غضون ساعتين. ستتلقى إشعاراً فورياً عند استلام الرد.")}
                </p>
              </div>
            </div>

            {/* Send Message Form */}
            <div className="card">
              <h3 style={{ fontSize: "1.05rem", fontWeight: 800, marginBottom: 18, color: "var(--text-1)" }}>
                {L("Submit a Help Request", "أرسل طلب مساعدة")}
              </h3>
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">{L("Sender Name", "الاسم المرسل")}</label>
                    <input className="form-input" type="text" disabled value={currentUser.name} style={{ opacity: 0.8, background: "var(--bg-muted)" }} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{L("Sender Email", "البريد الإلكتروني")}</label>
                    <input className="form-input" type="email" disabled value={currentUser.email} style={{ opacity: 0.8, background: "var(--bg-muted)" }} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">{L("Subject *", "الموضوع *")}</label>
                  <input
                    className="form-input"
                    type="text"
                    required
                    placeholder={L("What issue are you facing?", "ما هي المشكلة التي تواجهها؟")}
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{L("Message *", "تفاصيل الرسالة *")}</label>
                  <textarea
                    className="form-input form-textarea"
                    required
                    placeholder={L("Describe your request in detail...", "اكتب تفاصيل طلبك هنا...")}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    style={{ minHeight: 100 }}
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ alignSelf: "flex-end", marginTop: 6 }}>
                  <Send size={15} /> {L("Send to Admin", "إرسال إلى الإدارة")}
                </button>
              </form>
            </div>
          </div>

          {/* Customer Past Support Tickets */}
          <div className="card" style={{ marginTop: 24 }}>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 800, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <MessageSquare size={18} style={{ color: "var(--brand)" }} />
              {L("Your Support Tickets & Responses", "تذاكر الدعم والردود السابقة")}
            </h3>

            {myMessages.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
                <div style={{ fontSize: "2rem", marginBottom: 10 }}>💬</div>
                <p style={{ fontSize: "0.82rem" }}>
                  {L("You haven't submitted any messages yet.", "لم تقم بإرسال أي رسائل حتى الآن.")}
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {myMessages.map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      background: "var(--bg-surface)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-lg)",
                      padding: 16,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 8, borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>
                      <div style={{ fontWeight: 800, fontSize: "0.9rem", color: "var(--text-main)" }}>
                        {msg.subject}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.72rem" }}>
                        <span style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                          <Clock size={12} />
                          {new Date(msg.createdAt).toLocaleString(isRTL ? "ar-EG" : "en-US", { dateStyle: "short", timeStyle: "short" })}
                        </span>
                        {msg.status === "replied" ? (
                          <span style={{ background: "var(--success-bg)", color: "var(--success)", padding: "2px 8px", borderRadius: "var(--radius-full)", fontWeight: 700 }}>
                            {L("Replied", "تم الرد")}
                          </span>
                        ) : (
                          <span style={{ background: "var(--warning-bg)", color: "var(--warning)", padding: "2px 8px", borderRadius: "var(--radius-full)", fontWeight: 700 }}>
                            {L("Pending Reply", "قيد الانتظار")}
                          </span>
                        )}
                      </div>
                    </div>

                    <p style={{ fontSize: "0.82rem", color: "var(--text-2)", lineHeight: 1.5, marginBottom: msg.reply ? 12 : 0 }}>
                      {msg.message}
                    </p>

                    {msg.reply && (
                      <div
                        style={{
                          background: "var(--bg-muted)",
                          borderLeft: isRTL ? undefined : "3px solid var(--success)",
                          borderRight: isRTL ? "3px solid var(--success)" : undefined,
                          borderRadius: "var(--radius-md)",
                          padding: "10px 14px",
                          marginTop: 8,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.75rem", fontWeight: 800, color: "var(--success)", marginBottom: 4 }}>
                          <CheckCircle size={14} />
                          {L("Admin Response:", "رد الإدارة:")}
                        </div>
                        <p style={{ fontSize: "0.8rem", color: "var(--text-1)", lineHeight: 1.5 }}>
                          {msg.reply}
                        </p>
                        {msg.repliedAt && (
                          <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginTop: 6, textAlign: "end" }}>
                            {new Date(msg.repliedAt).toLocaleString(isRTL ? "ar-EG" : "en-US", { dateStyle: "short", timeStyle: "short" })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .contact-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

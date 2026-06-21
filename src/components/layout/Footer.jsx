import React from "react";
import { useApp } from "../../context/AppContext";
import { translations } from "../../data/translations";

export default function Footer() {
  const { language } = useApp();
  const t = translations[language];
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div style={{
            width: 32, height: 32,
            background: "linear-gradient(135deg, #2563eb, #1e40af)",
            borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1rem"
          }}>🌐</div>
          <div>
            <div className="footer-brand-name">{t.appName}</div>
            <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.3)", marginTop: 2 }}>
              B2B Smart Wholesale Platform
            </div>
          </div>
        </div>

        <div className="footer-copy">
          © {year} SmartWholesale Network. {language === "ar" ? "جميع الحقوق محفوظة." : "All rights reserved."}
        </div>

        <div className="footer-links">
          <span className="footer-link">
            {language === "ar" ? "سياسة الخصوصية" : "Privacy Policy"}
          </span>
          <span className="footer-link">
            {language === "ar" ? "الشروط والأحكام" : "Terms of Service"}
          </span>
          <span className="footer-link">
            {language === "ar" ? "تواصل معنا" : "Contact Us"}
          </span>
        </div>
      </div>
    </footer>
  );
}

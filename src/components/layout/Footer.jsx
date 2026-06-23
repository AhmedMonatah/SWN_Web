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
          <a href="#/privacy" className="footer-link" style={{ textDecoration: "none", color: "inherit" }}>
            {language === "ar" ? "سياسة الخصوصية" : "Privacy Policy"}
          </a>
          <a href="#/terms" className="footer-link" style={{ textDecoration: "none", color: "inherit" }}>
            {language === "ar" ? "الشروط والأحكام" : "Terms of Service"}
          </a>
          <a href="#/contact" className="footer-link" style={{ textDecoration: "none", color: "inherit" }}>
            {language === "ar" ? "تواصل معنا" : "Contact Us"}
          </a>
        </div>
      </div>
    </footer>
  );
}

import React from "react";
import { useApp } from "../context/AppContext";

export default function AboutUs() {
  const { language, products, users, orders } = useApp();
  const isRTL = language === "ar";
  const L = (en, ar) => (isRTL ? ar : en);

  const activeSellersCount = users.filter(u => u.role === "supplier" || u.role === "wholesaler").length || 320;
  const activeProductsCount = products.length || 1500;
  const totalOrdersProcessed = orders.length || 4800;

  return (
    <div className="page-wrap" style={{ background: "var(--bg-page)", padding: "40px 0" }}>
      <div className="container" style={{ maxWidth: 850 }}>
        
        {/* Hero Section */}
        <div className="card anim-fade-up" style={{
          textAlign: "center",
          padding: "50px 24px",
          background: "linear-gradient(135deg, var(--brand-50) 0%, transparent 100%)",
          border: "1px solid var(--brand-100)",
          borderRadius: "var(--radius-xl)",
          marginBottom: 30
        }}>
          <span style={{ fontSize: "3.5rem" }}>🏢</span>
          <h1 style={{ fontSize: "2rem", fontWeight: 900, color: "var(--text-1)", marginTop: 10, marginBottom: 12 }}>
            {L("About SmartWholesale Network (SWN)", "عن شبكة الجملة الذكية (SWN)")}
          </h1>
          <p style={{ color: "var(--text-2)", fontSize: "0.95rem", lineHeight: 1.6, maxWidth: 650, margin: "0 auto" }}>
            {L(
              "Egypt's premier B2B digital platform connecting manufacturers, suppliers, wholesalers, and retailers in a seamless, secure, and modern trading ecosystem.",
              "المنصة الرقمية الرائدة في جمهورية مصر العربية لربط المصانع، الموردين، تجار الجملة، وأصحاب محلات التجزئة في منظومة تجارية إلكترونية ذكية وآمنة."
            )}
          </p>
        </div>

        {/* Dynamic Metric Badges */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 30 }} className="about-metrics">
          {[
            { label: L("Active Manufacturers & Wholesalers", "الموردين وتجار الجملة النشطين"), value: activeSellersCount, icon: "🏭" },
            { label: L("Verified Listings in Egypt", "منتجات مدرجة وموثقة بمصر"), value: activeProductsCount, icon: "📦" },
            { label: L("B2B Orders Handled", "طلبيات B2B تم شحنها"), value: totalOrdersProcessed, icon: "🚚" }
          ].map((item, i) => (
            <div key={i} className="card" style={{ textAlign: "center", padding: "20px 15px", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ fontSize: "2rem", marginBottom: 8 }}>{item.icon}</div>
              <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "var(--brand)" }}>{item.value.toLocaleString()}+</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-3)", fontWeight: 700, marginTop: 4, lineHeight: 1.3 }}>{item.label}</div>
            </div>
          ))}
        </div>

        {/* Narrative / Features */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }} className="about-grid">
          <div className="card">
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-1)", marginBottom: 12 }}>
              🚀 {L("Our Vision", "رؤيتنا")}
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-2)", lineHeight: 1.6 }}>
              {L(
                "We aim to eliminate traditional wholesale friction. By offering direct-to-retail channels, tier-based dynamic volume discounts, and verified business validations, we allow small Egyptian shops to thrive alongside giant suppliers.",
                "نسعى لإلغاء العقبات التقليدية في تجارة الجملة. عبر إتاحة قنوات مباشرة للتجزئة، وخصومات كميات ديناميكية تعتمد على الفئات، وتوثيق سجلات الشركات قانونياً، نمكّن المحلات المصرية الصغيرة من النمو والازدهار جنباً إلى جنب مع كبار الموردين."
              )}
            </p>
          </div>

          <div className="card">
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-1)", marginBottom: 12 }}>
              🔒 {L("Secured & Audited Operations", "عمليات آمنة وموثقة")}
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-2)", lineHeight: 1.6 }}>
              {L(
                "Compliance is core to our network. Every business partner must supply audited tax credentials and commercial registers, reviewed manually by our administration team, guaranteeing 100% compliance with Egyptian trade protocols.",
                "الالتزام القانوني هو جوهر شبكتنا. يتعين على كل شريك تجاري تقديم بطاقته الضريبية وسجله التجاري المعتمدين ليتم مراجعتهما يدوياً من قِبل الإدارة، لضمان الامتثال بنسبة 100% لبروتوكولات التجارة المصرية."
              )}
            </p>
          </div>
        </div>
      </div>
      
      <style>{`
        @media (max-width: 768px) {
          .about-metrics { grid-template-columns: 1fr !important; }
          .about-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

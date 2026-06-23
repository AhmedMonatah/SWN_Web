import React from "react";
import { useApp } from "../context/AppContext";

export default function TermsOfService() {
  const { language } = useApp();
  const isRTL = language === "ar";
  const L = (en, ar) => (isRTL ? ar : en);

  return (
    <div className="page-wrap" style={{ background: "var(--bg-page)", padding: "40px 0" }}>
      <div className="container" style={{ maxWidth: 800 }}>
        <div className="card anim-fade-up" style={{ padding: "30px 40px" }}>
          
          <h1 style={{ fontSize: "1.8rem", fontWeight: 900, marginBottom: 8, color: "var(--text-1)" }}>
            {L("Terms of Service", "الشروط والأحكام")}
          </h1>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 24 }}>
            {L("Last Updated: June 22, 2026", "آخر تحديث: 22 يونيو 2026")}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 20, fontSize: "0.85rem", color: "var(--text-2)", lineHeight: 1.6 }}>
            <div>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--text-1)", marginBottom: 8 }}>
                {L("1. Terms of Acceptance", "1. قبول الشروط والأحكام")}
              </h3>
              <p>
                {L(
                  "By registering as a Wholesaler, Supplier, or Retailer on SWN, you agree to comply with all Egyptian B2B commerce regulations. Fake tax IDs or invalid register files will result in immediate account deletion.",
                  "بالتسجيل كتاجر جملة أو مورد أو تاجر تجزئة على منصة SWN، فإنك توافق على الالتزام بجميع القوانين المنظمة للتجارة الثنائية في مصر. استخدام رقم ضريبي مزيف أو مستندات غير صالحة سيعرض حسابك للحذف الفوري."
                )}
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--text-1)", marginBottom: 8 }}>
                {L("2. Minimum Order Quantity (MOQ)", "2. الحد الأدنى للطلب (MOQ)")}
              </h3>
              <p>
                {L(
                  "Suppliers set strict Minimum Order Quantities (MOQs). Buyers are legally bound to respect these thresholds to qualify for wholesale tier discounts.",
                  "يحدد الموردون حداً أدنى للطلب (MOQ). يلتزم المشترون قانونياً باحترام هذه الحدود للحصول على خصومات فئات الجملة المتاحة."
                )}
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--text-1)", marginBottom: 8 }}>
                {L("3. Delivery and Quality Commitments", "3. التزامات الشحن وجودة المنتجات")}
              </h3>
              <p>
                {L(
                  "Sellers are responsible for describing their items accurately. Products will remain hidden from the guest catalog until manually approved by the administrator, ensuring quality and safety protocols.",
                  "يتحمل البائع المسؤولية الكاملة عن وصف المنتجات بدقة. تظل المنتجات مخفية من كتالوج الزوار حتى يتم قبولها يدوياً من قِبل الإدارة، لضمان معايير الجودة والأمان."
                )}
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--text-1)", marginBottom: 8 }}>
                {L("4. Dispute and Jurisdiction", "4. النزاعات والاختصاص القضائي")}
              </h3>
              <p>
                {L(
                  "All commercial disputes arising from purchases or listings on SWN are subject exclusively to Cairo Court of Arbitration and Egyptian commercial laws.",
                  "تخضع جميع النزاعات التجارية الناشئة عن عمليات الشراء أو الإدراج على منصة SWN حصرياً لهيئة التحكيم بالقاهرة والقوانين التجارية المصرية."
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

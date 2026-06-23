import React from "react";
import { useApp } from "../context/AppContext";

export default function PrivacyPolicy() {
  const { language } = useApp();
  const isRTL = language === "ar";
  const L = (en, ar) => (isRTL ? ar : en);

  return (
    <div className="page-wrap" style={{ background: "var(--bg-page)", padding: "40px 0" }}>
      <div className="container" style={{ maxWidth: 800 }}>
        <div className="card anim-fade-up" style={{ padding: "30px 40px" }}>
          
          <h1 style={{ fontSize: "1.8rem", fontWeight: 900, marginBottom: 8, color: "var(--text-1)" }}>
            {L("Privacy Policy", "سياسة الخصوصية")}
          </h1>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 24 }}>
            {L("Last Updated: June 22, 2026", "آخر تحديث: 22 يونيو 2026")}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 20, fontSize: "0.85rem", color: "var(--text-2)", lineHeight: 1.6 }}>
            <div>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--text-1)", marginBottom: 8 }}>
                {L("1. Information We Collect", "1. البيانات التي نجمعها")}
              </h3>
              <p>
                {L(
                  "We collect business credential documents (Commercial Register, Tax Card) to verify accounts. We also store session data, purchase history, listings, and support tickets to maintain a safe platform ecosystem.",
                  "نقوم بجمع مستندات إثبات الهوية التجارية (السجل التجاري، البطاقة الضريبية) لتوثيق الحسابات. نقوم أيضاً بحفظ بيانات الجلسة، وسجل المشتريات، والمنتجات المدرجة، وتذاكر الدعم الفني للحفاظ على بيئة منصة آمنة."
                )}
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--text-1)", marginBottom: 8 }}>
                {L("2. Data Protection Laws (Egypt)", "2. قانون حماية البيانات الشخصية المصري")}
              </h3>
              <p>
                {L(
                  "In compliance with Egyptian Law No. 151 of 2020 on Personal Data Protection, we enforce secure storage of files, enforce strict administrative checks, and encrypt business identity proofs.",
                  "تزامناً مع القانون المصري رقم 151 لسنة 2020 بشأن حماية البيانات الشخصية، نلتزم بتخزين الملفات بشكل آمن، ونطبق رقابة إدارية صارمة، ونشفر وثائق إثبات الهوية التجارية."
                )}
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--text-1)", marginBottom: 8 }}>
                {L("3. How We Use Corporate Data", "3. كيفية استخدام البيانات")}
              </h3>
              <p>
                {L(
                  "Company statistics and sales figures are strictly handled to display your dashboard graphs, upgrade membership tiers dynamically, and secure payment and delivery flows.",
                  "تتم معالجة إحصائيات الشركة وأرقام المبيعات بدقة لعرض الرسوم البيانية للوحة التحكم الخاصة بك، وترقية مستويات العضوية بشكل ديناميكي، وتأمين عمليات الدفع والشحن."
                )}
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--text-1)", marginBottom: 8 }}>
                {L("4. Sharing and Disclosure", "4. مشاركة الإفصاح عن البيانات")}
              </h3>
              <p>
                {L(
                  "SWN never sells or shares your business credentials to third-party advertisers. Document files are restricted strictly to approved platform administrators for compliance auditing.",
                  "لا تقوم منصة SWN مطلقاً ببيع أو مشاركة بياناتك التجارية لجهات إعلانية خارجية. يُقتصر استعراض ملفات المستندات فقط على مديري المنصة المعتمدين لأغراض التدقيق والمراجعة."
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

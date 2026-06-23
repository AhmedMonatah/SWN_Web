import React, { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { Play, ShoppingCart, ShieldCheck, Truck, Package, Tag, Users } from "lucide-react";

export default function Home({ onNavigate, onAuthClick }) {
  const { language, currentUser, products } = useApp();
  const isRTL = language === "ar";
  const L = (en, ar) => (isRTL ? ar : en);

  const [showVideo, setShowVideo] = useState(false);

  const featuredProducts = products.filter((p) => p.status === "approved").slice(0, 4);

  const features = [
    { Icon: Truck,       title: L("Fast Delivery",    "توصيل سريع"),     sub: L("All regions",         "لكافة المناطق") },
    { Icon: Package,     title: L("Diverse Products", "منتجات متنوعة"), sub: L("Guaranteed quality",  "جودة مضمونة") },
    { Icon: Tag,         title: L("Best Prices",      "أسعار تنافسية"), sub: L("Exclusive offers",    "عروض حصرية") },
    { Icon: ShieldCheck, title: L("Verified",         "موثقون"),         sub: L("Certified suppliers", "موردين معتمدين") },
  ];

  return (
    <div className="home-root">

      {/* ══════════════════════ HERO ══════════════════════ */}
      <section className="hero-section-mockup">
        {/* Background layers */}
        <div className="hero-grid-overlay" />
        <div className="hero-mesh-overlay" />
        <div className="hero-orb orb-top-left" />
        <div className="hero-orb orb-bottom-right" />

        <div className="container">
          {/* Respect RTL/LTR layout direction for text and image columns */}
          <div className="hero-container-mockup" style={{ direction: isRTL ? "rtl" : "ltr" }}>

            {/* ── LEFT: text content ── */}
            <div className="hero-left-content" dir={isRTL ? "rtl" : "ltr"}>
              {/* Badge */}
              <div className="hero-badge-mockup">
                <span className="badge-spark">✦</span>
                <span style={{ marginInlineStart: 8 }}>{L("One platform.. unlimited opportunities", "منصة واحدة.. فرص لا محدودة")}</span>
              </div>

              {/* Main heading */}
              <h1 className="hero-heading-mockup">
                {L("The Digital Platform", "المنصة الرقمية")}
                <br />
                <span className="gradient-text">
                  {L("for Smart Wholesale", "للتجارة الجملة الذكية")}
                </span>
              </h1>

              {/* Sub-text */}
              <p className="hero-subtitle-mockup">
                {L(
                  "Smart connection between suppliers and merchants to save time, reduce costs, and increase profits.",
                  "ربط ذكي بين الموردين والتجار لتوفير الوقت، خفض التكاليف، وزيادة الأرباح."
                )}
              </p>

              {/* 2×2 features */}
              <div className="hero-features-row-mockup">
                {features.map(({ Icon, title, sub }, i) => (
                  <div key={i} className="feat-item-mockup">
                    <div className="feat-icon-wrap">
                      <Icon size={19} />
                    </div>
                    <div>
                      <div className="feat-title">{title}</div>
                      <div className="feat-desc">{sub}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA row */}
              <div className="hero-actions-mockup">
                <button
                  className="btn-cta-primary"
                  onClick={() => (currentUser ? onNavigate("products") : onAuthClick("login"))}
                >
                  <span style={{ marginInlineEnd: 8 }}>{L("Start Buying Now", "ابدأ الشراء الآن")}</span>
                  <span className="arrow-icon">→</span>
                </button>
                <button className="btn-cta-video" onClick={() => setShowVideo(true)}>
                  <span className="play-icon-wrap" style={{ marginInlineEnd: 8 }}>
                    <Play size={11} fill="currentColor" />
                  </span>
                  <span>{L("Watch how it works", "شاهد كيف تعمل المنصة")}</span>
                </button>
              </div>
            </div>

            {/* ── RIGHT: hero visual + floating cards ── */}
            <div className="hero-right-visual-mockup">
              {/* Man image */}
              <div className="visual-image-wrapper">
                <img src="/swn_hero_man.png" alt="SWN Hero" className="visual-hero-img" />
                <div className="visual-radial-glow" />
              </div>

              {/* ── Floating card: traders ── */}
              <div className="float-card float-card-traders">
                <div className="card-icon-circle blue-circle">
                  <Users size={17} />
                </div>
                <div>
                  <div className="card-val">+10,000</div>
                  <div className="card-lbl" dir={isRTL ? "rtl" : "ltr"}>
                    {L("Traders rely on us", "تاجر يعتمدون علينا")}
                  </div>
                </div>
              </div>

              {/* ── Floating card: growth ── */}
              <div className="float-card float-card-growth">
                <div className="growth-text-col" dir={isRTL ? "rtl" : "ltr"}>
                  <div className="growth-title">{L("Grow Your Business", "نمو أعمالك")}</div>
                  <div className="growth-sub" style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span>{L("Sales", "مبيعات")} ↗</span>
                    <span style={{ opacity: 0.5 }}>•</span>
                    <span>{L("Profits", "أرباح")} ↗</span>
                  </div>
                </div>
                <div className="growth-graph-svg" style={{ width: 56, height: 32, display: "flex", alignItems: "center" }}>
                  <img src="/curve_up.png" alt="Growth Curve" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                </div>
              </div>

              {/* ── Floating card: product ── */}
              <div className="float-card float-card-product">
                <div className="product-image-box">
                  <img src="/chair.jpg" alt="Chair" className="visual-product-img" />
                </div>
                <div className="product-info-col" dir={isRTL ? "rtl" : "ltr"}>
                  <div className="product-name">{L("Modern Chair", "كرسي مودرن")}</div>
                  <div className="product-price">320.00 {L("EGP", "ج.م")}</div>
                  <button
                    className="btn-product-buy"
                    onClick={() => (currentUser ? onNavigate("products") : onAuthClick("login"))}
                  >
                    <ShoppingCart size={14} style={{ marginInlineEnd: 6 }} />
                    <span>{L("Add to Cart", "أضف للسلة")}</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════ METRICS BAR ══════════════════ */}
      <section className="footer-metrics-bar-mockup">
        <div className="container footer-metrics-container" dir={isRTL ? "rtl" : "ltr"}>
          {/* Trusted by */}
          <div className="trusted-logos-col">
            <div className="trusted-lbl">
              {L("Trusted by +10,000 traders", "موضع ثقة +10,000 تاجر")}
            </div>
            {/* Infinite auto-scroll logo carousel */}
            <div className="logo-scroll-track-wrap">
              <div className="logo-scroll-track" dir="ltr">
                {[...Array(4)].map((_, loopIdx) => (
                  <React.Fragment key={loopIdx}>
                    {[
                      { img: "/IbnMasoud.png", en: "Ibn Masoud", ar: "ابن مسعود" },
                      { img: "/Anabar.png",    en: "Al Anabar",  ar: "العنبر" },
                      { img: "/YaHalawa.png", en: "Ya Halawa",  ar: "يا حلاوة" },
                      { img: "/Monarch.png",  en: "Monarch",    ar: "مونارك" },
                    ].map((comp, i) => (
                      <div key={i} className="partner-logo-circle-wrap">
                        <div className="partner-logo-circle">
                          <img src={comp.img} alt={comp.en} className="partner-logo-img" />
                        </div>
                        <span className="partner-logo-name">{L(comp.en, comp.ar)}</span>
                      </div>
                    ))}
                  </React.Fragment>
                ))}
              </div>
              <div className="logo-scroll-track" aria-hidden="true" dir="ltr">
                {[...Array(4)].map((_, loopIdx) => (
                  <React.Fragment key={loopIdx}>
                    {[
                      { img: "/IbnMasoud.png", en: "Ibn Masoud", ar: "ابن مسعود" },
                      { img: "/Anabar.png",    en: "Al Anabar",  ar: "العنبر" },
                      { img: "/YaHalawa.png", en: "Ya Halawa",  ar: "يا حلاوة" },
                      { img: "/Monarch.png",  en: "Monarch",    ar: "مونارك" },
                    ].map((comp, i) => (
                      <div key={i} className="partner-logo-circle-wrap">
                        <div className="partner-logo-circle">
                          <img src={comp.img} alt={comp.en} className="partner-logo-img" />
                        </div>
                        <span className="partner-logo-name">{L(comp.en, comp.ar)}</span>
                      </div>
                    ))}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="metrics-counters-row">
            {[
              { Icon: ShoppingCart, val: "+50,000", lbl: L("Available products", "منتج متاح") },
              { Icon: Users,        val: "+5,000",  lbl: L("Trusted suppliers",  "مورد موثوق") },
              { Icon: ShieldCheck,  val: "100%",    lbl: L("Secure experience",  "تجربة آمنة") },
            ].map(({ Icon, val, lbl }, i) => (
              <div key={i} className="counter-item">
                <div className="counter-icon-wrap">
                  <Icon size={20} />
                </div>
                <div>
                  <div className="counter-val">{val}</div>
                  <div className="counter-lbl">{lbl}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ FEATURED ══════════════════ */}
      {featuredProducts.length > 0 && (
        <section className="featured-section-landing">
          <div className="container">
            <div className="flex-between section-header-mockup" dir={isRTL ? "rtl" : "ltr"}>
              <div>
                <h2 className="landing-sec-title">{L("Featured Catalog", "منتجات متميزة")}</h2>
                <p className="landing-sec-subtitle">
                  {L("From verified primary sellers", "من الموردين المعتمدين")}
                </p>
              </div>
              <button className="btn-outline-more" onClick={() => onNavigate("products")}>
                {L("View All →", "عرض الكل ←")}
              </button>
            </div>
            <div className="featured-grid-mockup">
              {featuredProducts.map((p) => (
                <div key={p.id} className="catalog-card-mockup" onClick={() => onNavigate("products")}>
                  <div className="catalog-img-wrap" style={{ background: p.imageColor || "#e2e8f0" }}>
                    {p.image ? (
                      <img src={p.image} alt="" className="catalog-img" />
                    ) : (
                      <span className="box-fallback">📦</span>
                    )}
                  </div>
                  <div className="catalog-body-wrap">
                    <span className="seller-badge">{isRTL ? p.sellerNameAr || p.sellerName : p.sellerName}</span>
                    <h3 className="catalog-name">{isRTL ? p.nameAr : p.nameEn}</h3>
                    <div className="catalog-price-row">
                      <span className="price-val">{p.basePrice.toLocaleString()} {isRTL ? "ج.م" : "EGP"}</span>
                      <span className="moq-val">MOQ: {p.minOrder}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════ HOW IT WORKS ══════════════════ */}
      <section className="how-it-works-section-mockup">
        <div className="container">
          <div className="text-center section-header-mockup" dir={isRTL ? "rtl" : "ltr"}>
            <h2 className="landing-sec-title">
              {L("How SWN Works", "كيف تعمل منصة الجملة الذكية")}
            </h2>
            <p className="landing-sec-subtitle" style={{ maxWidth: 520, margin: "8px auto 0" }}>
              {L(
                "Simplifying supply chain for businesses across the region.",
                "تبسيط عملية البيع والشراء لجميع أطراف التجارة."
              )}
            </p>
          </div>
          <div className="how-grid-mockup">
            {[
              {
                n: "01",
                t: L("Upload Listings", "رفع المنتجات"),
                d: L("Suppliers upload products and set volume discounts.", "يرفع الموردون المنتجات ويحددون خصومات الكميات."),
              },
              {
                n: "02",
                t: L("Admin Verification", "تدقيق الإدارة"),
                d: L("Admin reviews products to guarantee quality.", "تراجع الإدارة المنتجات لضمان الجودة والأمان."),
              },
              {
                n: "03",
                t: L("Buy & Sell", "الشراء والبيع"),
                d: L("Wholesalers and retailers buy with auto bulk discounts.", "يشتري التجار بخصومات تلقائية بناءً على الحجم."),
              },
            ].map((s, i) => (
              <div key={i} className="how-step-card" dir={isRTL ? "rtl" : "ltr"}>
                <div className="how-num">{s.n}</div>
                <h3 className="how-title">{s.t}</h3>
                <p className="how-desc">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ VIDEO MODAL ══════════════════ */}
      {showVideo && (
        <div className="modal-bg anim-fade-in" onClick={() => setShowVideo(false)}>
          <div className="modal anim-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <span className="modal-title">{L("Platform Demo", "عرض تجريبي")}</span>
              <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => setShowVideo(false)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="video-player-mockup">
                <div className="video-glow" />
                <span className="video-icon">🖥️</span>
                <h3>{L("Interactive Demo", "عرض تفاعلي")}</h3>
                <p className="text-muted" style={{ fontSize: ".82rem", marginTop: 8 }}>
                  {L("Learn how the platform connects suppliers and merchants.", "تعلم كيف تربط المنصة الموردين والتجار.")}
                </p>
                <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowVideo(false)}>
                  {L("Close", "إغلاق")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

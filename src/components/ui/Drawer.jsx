import React, { useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { X } from "lucide-react";

export default function Drawer({ id, title, children, footer }) {
  const { activeDrawer, setActiveDrawer } = useApp();
  const isOpen = activeDrawer === id;

  // Lock body scroll when drawer open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape" && isOpen) setActiveDrawer(null); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, setActiveDrawer]);

  if (!isOpen) return null;

  return (
    <>
      <div className="drawer-overlay" onClick={() => setActiveDrawer(null)} />
      <div className="drawer" role="dialog" aria-modal="true" aria-label={title}>
        <div className="drawer-head">
          <h2 className="drawer-title">{title}</h2>
          <button
            onClick={() => setActiveDrawer(null)}
            aria-label="Close"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 4,
              borderRadius: "50%",
              transition: "var(--t-fast)"
            }}
            onMouseOver={(e) => e.currentTarget.style.background = "var(--bg-surface)"}
            onMouseOut={(e) => e.currentTarget.style.background = "none"}
          >
            <X size={18} />
          </button>
        </div>
        <div className="drawer-body">{children}</div>
        {footer && <div className="drawer-foot">{footer}</div>}
      </div>
    </>
  );
}

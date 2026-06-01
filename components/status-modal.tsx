"use client";

import { useEffect, useState, useCallback } from "react";
import { CheckCircle2, XCircle, X, Mail } from "lucide-react";

interface StatusModalProps {
  status: "success" | "error" | null;
  type: "contact" | "quote";
  onClose: () => void;
}

export function StatusModal({ status, type, onClose }: StatusModalProps) {
  const [progress, setProgress] = useState(100);
  const [visible, setVisible] = useState(false);
  const AUTO_CLOSE_MS = 7000;

  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(onClose, 300);
  }, [onClose]);

  useEffect(() => {
    if (!status) return;
    setProgress(100);
    setVisible(true);

    const start = Date.now();
    const tick = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 100 - (elapsed / AUTO_CLOSE_MS) * 100);
      setProgress(remaining);
      if (remaining === 0) { clearInterval(tick); handleClose(); }
    }, 50);

    return () => clearInterval(tick);
  }, [status, handleClose]);

  if (!status) return null;

  const isSuccess = status === "success";
  const accent = isSuccess ? "#22c55e" : "#ef4444";
  const accentRgb = isSuccess ? "34,197,94" : "239,68,68";

  const title = isSuccess
    ? type === "quote" ? "Quote Request Sent!" : "Message Received!"
    : "Something Went Wrong";

  const message = isSuccess
    ? type === "quote"
      ? "Thank you! We've received your quote request. A member of our team will be in touch within 24 hours. A confirmation email has been sent to you."
      : "Thank you for getting in touch! A member of the ScanVault team will review your message and respond within 24 hours. A confirmation email has been sent to you."
    : type === "quote"
      ? "We couldn't send your quote request. Please try again or call us on +44 7359 969266."
      : "We couldn't send your message. Please try again or email us at info@scanvault.co.uk.";

  return (
    <>
      <style>{`
        @keyframes sv-backdrop-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes sv-modal-in {
          0%   { opacity:0; transform: perspective(1200px) rotateX(-18deg) scale(0.75) translateY(40px); }
          60%  { transform: perspective(1200px) rotateX(4deg)  scale(1.03) translateY(-4px); }
          80%  { transform: perspective(1200px) rotateX(-2deg) scale(0.99) translateY(2px);  }
          100% { opacity:1; transform: perspective(1200px) rotateX(0deg)  scale(1)    translateY(0);    }
        }
        @keyframes sv-modal-out {
          from { opacity:1; transform: scale(1)    translateY(0); }
          to   { opacity:0; transform: scale(0.88) translateY(20px); }
        }
        @keyframes sv-icon-pop {
          0%   { transform: scale(0) rotate(-30deg); }
          65%  { transform: scale(1.25) rotate(8deg); }
          85%  { transform: scale(0.92) rotate(-3deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes sv-ring-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(${accentRgb},0.5), 0 0 30px rgba(${accentRgb},0.25); }
          50%       { box-shadow: 0 0 0 12px rgba(${accentRgb},0), 0 0 50px rgba(${accentRgb},0.4); }
        }
        @keyframes sv-shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: "fixed", inset: 0, zIndex: 9998,
          background: "rgba(0,0,0,0.72)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          animation: `sv-backdrop-in 0.3s ease forwards`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        {/* Card */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "relative",
            width: "min(440px, 92vw)",
            borderRadius: "24px",
            overflow: "hidden",
            background: "linear-gradient(160deg, #1c1c2e 0%, #0d0d0d 55%, #180a0a 100%)",
            border: `1px solid rgba(${accentRgb},0.25)`,
            boxShadow: `0 30px 90px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04) inset, 0 0 60px rgba(${accentRgb},0.12)`,
            animation: `${visible ? "sv-modal-in" : "sv-modal-out"} 0.55s cubic-bezier(0.22,1,0.36,1) forwards`,
            padding: "44px 36px 36px",
            textAlign: "center",
          }}
        >
          {/* Shimmer top bar */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: "2px",
            background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
            backgroundSize: "400px 2px",
            animation: "sv-shimmer 2.5s linear infinite",
          }} />

          {/* Close button */}
          <button
            onClick={handleClose}
            style={{
              position: "absolute", top: "16px", right: "16px",
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)",
              borderRadius: "8px", width: "32px", height: "32px",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "#6b7280", transition: "all 0.2s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.12)"; (e.currentTarget as HTMLButtonElement).style.color = "#fff"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)"; (e.currentTarget as HTMLButtonElement).style.color = "#6b7280"; }}
          >
            <X size={15} />
          </button>

          {/* Icon ring */}
          <div style={{
            width: "84px", height: "84px", borderRadius: "50%",
            background: `radial-gradient(circle, rgba(${accentRgb},0.15) 0%, rgba(${accentRgb},0.04) 70%)`,
            border: `2px solid rgba(${accentRgb},0.45)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 28px",
            animation: "sv-ring-pulse 2.4s ease-in-out infinite",
          }}>
            <div style={{ animation: "sv-icon-pop 0.6s cubic-bezier(0.22,1,0.36,1) 0.15s both" }}>
              {isSuccess
                ? <CheckCircle2 size={44} color={accent} />
                : <XCircle size={44} color={accent} />
              }
            </div>
          </div>

          {/* ScanVault label */}
          <p style={{ margin: "0 0 8px", fontSize: "11px", fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", fontFamily: "Arial,sans-serif" }}>
            Scan<span style={{ color: "#dc2626" }}>Vault</span>
          </p>

          {/* Title */}
          <h2 style={{ margin: "0 0 14px", fontSize: "24px", fontWeight: 800, color: "#ffffff", fontFamily: "Arial,sans-serif", lineHeight: 1.2 }}>
            {title}
          </h2>

          {/* Message */}
          <p style={{ margin: "0 0 28px", fontSize: "14px", color: "#9ca3af", lineHeight: 1.75, fontFamily: "Arial,sans-serif" }}>
            {message}
          </p>

          {/* Divider */}
          <div style={{ height: "1px", background: "rgba(255,255,255,0.07)", marginBottom: "24px" }} />

          {/* Action button */}
          <button
            onClick={handleClose}
            style={{
              width: "100%", padding: "13px 24px",
              background: isSuccess ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
              border: `1px solid rgba(${accentRgb},0.35)`,
              borderRadius: "12px",
              color: accent, fontSize: "14px", fontWeight: 700,
              cursor: "pointer", letterSpacing: "0.5px",
              transition: "all 0.2s", fontFamily: "Arial,sans-serif",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = `rgba(${accentRgb},0.22)`; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = `rgba(${accentRgb},0.12)`; }}
          >
            {isSuccess ? (type === "quote" ? "Perfect, thank you!" : "Got it, thanks!") : "Close"}
          </button>

          {/* Auto-close progress bar */}
          <div style={{ marginTop: "16px", height: "3px", background: "rgba(255,255,255,0.06)", borderRadius: "2px", overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: "2px",
              background: `linear-gradient(90deg, rgba(${accentRgb},0.6), ${accent})`,
              width: `${progress}%`,
              transition: "width 0.05s linear",
            }} />
          </div>
          <p style={{ margin: "6px 0 0", fontSize: "10px", color: "rgba(255,255,255,0.2)", fontFamily: "Arial,sans-serif" }}>
            Closes automatically
          </p>
        </div>
      </div>
    </>
  );
}

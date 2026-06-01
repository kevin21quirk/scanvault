"use client";

import { useState, useRef } from "react";
import { X, Send, Paperclip, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Lead {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  service: string | null;
  type: "CONTACT" | "QUOTE";
}

interface ReplyModalProps {
  lead: Lead;
  onClose: () => void;
  onSent: (leadId: string) => void;
}

export function ReplyModal({ lead, onClose, onSent }: ReplyModalProps) {
  const defaultSubject = lead.type === "CONTACT"
    ? `Re: ${lead.subject || "Your Enquiry"} - ScanVault`
    : `Re: Your Quote Request - ${lead.service || "ScanVault"}`;

  const [subject, setSubject]   = useState(defaultSubject);
  const [message, setMessage]   = useState("");
  const [file, setFile]         = useState<File | null>(null);
  const [status, setStatus]     = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError]       = useState("");
  const fileRef                 = useRef<HTMLInputElement>(null);

  const handleSend = async () => {
    if (!message.trim()) { setError("Please write a message before sending."); return; }
    setError("");
    setStatus("sending");

    try {
      const fd = new FormData();
      fd.append("to",      lead.email);
      fd.append("toName",  lead.name);
      fd.append("subject", subject);
      fd.append("message", message);
      if (file) fd.append("file", file);

      const res = await fetch(`/api/leads/${lead.id}/reply`, { method: "POST", body: fd });
      if (!res.ok) throw new Error("Failed");
      setStatus("sent");
      onSent(lead.id);
      setTimeout(onClose, 1800);
    } catch {
      setStatus("error");
      setError("Failed to send — please try again.");
    }
  };

  return (
    <>
      <style>{`
        @keyframes rm-in {
          from { opacity:0; transform: scale(0.94) translateY(16px); }
          to   { opacity:1; transform: scale(1)    translateY(0); }
        }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position:"fixed", inset:0, zIndex:9998,
          background:"rgba(0,0,0,0.6)", backdropFilter:"blur(6px)",
          WebkitBackdropFilter:"blur(6px)",
        }}
      />

      {/* Modal */}
      <div
        style={{
          position:"fixed", inset:0, zIndex:9999,
          display:"flex", alignItems:"center", justifyContent:"center",
          padding:"16px",
        }}
      >
        <div
          style={{
            width:"min(580px,100%)", background:"#fff",
            borderRadius:"16px", boxShadow:"0 24px 80px rgba(0,0,0,0.25)",
            animation:"rm-in 0.3s cubic-bezier(0.22,1,0.36,1) forwards",
            overflow:"hidden",
          }}
        >
          {/* Header */}
          <div style={{ background:"#0d0d0d", padding:"18px 24px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div>
              <p style={{ margin:0, fontSize:"11px", fontWeight:700, letterSpacing:"2px", textTransform:"uppercase", color:"rgba(255,255,255,0.4)" }}>
                Scan<span style={{ color:"#dc2626" }}>Vault</span>
              </p>
              <p style={{ margin:"4px 0 0", fontSize:"15px", fontWeight:700, color:"#fff" }}>
                Reply to {lead.name}
              </p>
            </div>
            <button onClick={onClose} style={{ background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:"8px", width:"32px", height:"32px", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#9ca3af" }}>
              <X size={15} />
            </button>
          </div>

          {/* Body */}
          <div style={{ padding:"24px" }}>
            {/* To */}
            <div style={{ marginBottom:"16px" }}>
              <label style={{ display:"block", fontSize:"12px", fontWeight:600, color:"#6b7280", marginBottom:"6px", textTransform:"uppercase", letterSpacing:"0.5px" }}>To</label>
              <div style={{ padding:"10px 14px", background:"#f9fafb", border:"1px solid #e5e7eb", borderRadius:"8px", fontSize:"14px", color:"#374151" }}>
                {lead.name} &lt;{lead.email}&gt;
              </div>
            </div>

            {/* From */}
            <div style={{ marginBottom:"16px" }}>
              <label style={{ display:"block", fontSize:"12px", fontWeight:600, color:"#6b7280", marginBottom:"6px", textTransform:"uppercase", letterSpacing:"0.5px" }}>From</label>
              <div style={{ padding:"10px 14px", background:"#f9fafb", border:"1px solid #e5e7eb", borderRadius:"8px", fontSize:"14px", color:"#374151" }}>
                Kevin Quirk &lt;kevin@scanvault.co.uk&gt;
              </div>
            </div>

            {/* Subject */}
            <div style={{ marginBottom:"16px" }}>
              <label style={{ display:"block", fontSize:"12px", fontWeight:600, color:"#6b7280", marginBottom:"6px", textTransform:"uppercase", letterSpacing:"0.5px" }}>Subject</label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                style={{ width:"100%", padding:"10px 14px", border:"1px solid #e5e7eb", borderRadius:"8px", fontSize:"14px", color:"#374151", outline:"none", boxSizing:"border-box" }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "#dc2626"; }}
                onBlur={(e)  => { e.currentTarget.style.borderColor = "#e5e7eb"; }}
              />
            </div>

            {/* Message */}
            <div style={{ marginBottom:"16px" }}>
              <label style={{ display:"block", fontSize:"12px", fontWeight:600, color:"#6b7280", marginBottom:"6px", textTransform:"uppercase", letterSpacing:"0.5px" }}>Message</label>
              <textarea
                rows={8}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your reply here…"
                style={{ width:"100%", padding:"10px 14px", border:"1px solid #e5e7eb", borderRadius:"8px", fontSize:"14px", color:"#374151", outline:"none", resize:"vertical", boxSizing:"border-box", fontFamily:"inherit" }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "#dc2626"; }}
                onBlur={(e)  => { e.currentTarget.style.borderColor = "#e5e7eb"; }}
              />
            </div>

            {/* Attachment */}
            <div style={{ marginBottom:"20px" }}>
              <input ref={fileRef} type="file" style={{ display:"none" }} onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
              <button
                onClick={() => fileRef.current?.click()}
                style={{ display:"inline-flex", alignItems:"center", gap:"6px", padding:"8px 14px", background:"#f9fafb", border:"1px solid #e5e7eb", borderRadius:"8px", fontSize:"13px", color:"#6b7280", cursor:"pointer" }}
              >
                <Paperclip size={14} />
                {file ? file.name : "Attach a file"}
              </button>
              {file && (
                <button onClick={() => setFile(null)} style={{ marginLeft:"8px", fontSize:"12px", color:"#ef4444", background:"none", border:"none", cursor:"pointer" }}>
                  Remove
                </button>
              )}
            </div>

            {error && <p style={{ margin:"0 0 12px", fontSize:"13px", color:"#ef4444" }}>{error}</p>}

            {/* Actions */}
            <div style={{ display:"flex", gap:"12px", justifyContent:"flex-end" }}>
              <button onClick={onClose} style={{ padding:"10px 20px", background:"#f9fafb", border:"1px solid #e5e7eb", borderRadius:"10px", fontSize:"14px", color:"#374151", cursor:"pointer" }}>
                Cancel
              </button>
              <Button
                onClick={handleSend}
                disabled={status === "sending" || status === "sent"}
                className="bg-scanvault-red hover:bg-red-700 text-white"
                style={{ padding:"10px 24px", borderRadius:"10px", fontSize:"14px", display:"flex", alignItems:"center", gap:"8px" }}
              >
                {status === "sending" ? (
                  <><Loader2 size={15} className="animate-spin" /> Sending…</>
                ) : status === "sent" ? (
                  <><CheckCircle2 size={15} /> Sent!</>
                ) : (
                  <><Send size={15} /> Send Reply</>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

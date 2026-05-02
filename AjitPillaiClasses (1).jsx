import { useState, useEffect } from "react";

// ─────────────────────────────────────────
//  CONSTANTS & INITIAL DATA
// ─────────────────────────────────────────
const ADMIN_CREDS = { id: "ajitpillai007", password: "AjitSir@2026" };

const BOARD_COLOR = { CBSE: "#2563eb", GSEB: "#059669", ICSE: "#d97706", IB: "#7c3aed" };

const SEED = {
  classrooms: [
    { id: 1, name: "CBSE Class 10 – Batch A", board: "CBSE", grade: "10", schedule: "Mon/Wed/Fri · 7:00 AM", location: "Sector 3D" },
    { id: 2, name: "GSEB Class 9 – Evening", board: "GSEB", grade: "9",  schedule: "Tue/Thu/Sat · 5:30 PM", location: "Sector 3D" },
    { id: 3, name: "ICSE Class 12 – Science", board: "ICSE", grade: "12", schedule: "Daily · 4:00 PM", location: "Randesan" },
    { id: 4, name: "IB Mathematics HL", board: "IB", grade: "11-12", schedule: "Mon/Wed/Fri · 6:00 PM", location: "Randesan" },
  ],
  students: [
    { id: 1, name: "Gautami Pandya",  classroomId: 1, rollNo: "A001", pin: "1234", phone: "9876543210", parentId: 1, pinSet: true },
    { id: 2, name: "Divyaraj Gohil",  classroomId: 1, rollNo: "A002", pin: "2345", phone: "9876543212", parentId: 2, pinSet: true },
    { id: 3, name: "Sonam Meena",     classroomId: 2, rollNo: "B001", pin: "3456", phone: "9876543214", parentId: 3, pinSet: true },
    { id: 4, name: "Navdeep Rathor",  classroomId: 3, rollNo: "C001", pin: "4567", phone: "9876543216", parentId: 4, pinSet: true },
    { id: 5, name: "Arya Ashokan",    classroomId: 4, rollNo: "D001", pin: "5678", phone: "9876543218", parentId: 5, pinSet: true },
    { id: 6, name: "Dev Chaudhari",   classroomId: 1, rollNo: "A003", pin: "6789", phone: "9876543220", parentId: 6, pinSet: true },
    { id: 7, name: "Nairuti Vyas",    classroomId: 3, rollNo: "C002", pin: "7890", phone: "9876543222", parentId: 7, pinSet: true },
  ],
  parents: [
    { id: 1, name: "Priya Pandya",    phone: "9876543211", studentId: 1, pin: "9876", pinSet: true },
    { id: 2, name: "Ramesh Gohil",    phone: "9876543213", studentId: 2, pin: "8765", pinSet: true },
    { id: 3, name: "Sunita Meena",    phone: "9876543215", studentId: 3, pin: "7654", pinSet: true },
    { id: 4, name: "Gajendra Rathor", phone: "9876543217", studentId: 4, pin: "6543", pinSet: true },
    { id: 5, name: "Suresh Ashokan",  phone: "9876543219", studentId: 5, pin: "5432", pinSet: true },
    { id: 6, name: "Hitesh Chaudhari",phone: "9876543221", studentId: 6, pin: "4321", pinSet: true },
    { id: 7, name: "Meena Vyas",      phone: "9876543223", studentId: 7, pin: "3210", pinSet: true },
  ],
  attendance: [
    { date: "2026-04-28", classroomId: 1, records: [{ studentId: 1, status: "present" }, { studentId: 2, status: "absent" }, { studentId: 6, status: "present" }] },
    { date: "2026-04-30", classroomId: 1, records: [{ studentId: 1, status: "present" }, { studentId: 2, status: "present" }, { studentId: 6, status: "late" }] },
    { date: "2026-05-01", classroomId: 1, records: [{ studentId: 1, status: "late"    }, { studentId: 2, status: "present" }, { studentId: 6, status: "present" }] },
    { date: "2026-04-29", classroomId: 2, records: [{ studentId: 3, status: "present" }] },
    { date: "2026-05-01", classroomId: 3, records: [{ studentId: 4, status: "present" }, { studentId: 7, status: "absent" }] },
  ],
  homework: [
    { id: 1, classroomId: 1, title: "Quadratic Equations – Ex 3.1 to 3.4", desc: "Solve all NCERT exercises. Show every step clearly. Neat presentation is mandatory.", due: "2026-05-05", type: "Practice Work", created: "2026-04-28" },
    { id: 2, classroomId: 1, title: "Weekly Test Prep – Polynomials Ch.2",  desc: "Revise all theorems, definitions, and worked examples from Chapter 2. Surprise questions guaranteed!", due: "2026-05-03", type: "Test Prep", created: "2026-04-25" },
    { id: 3, classroomId: 2, title: "Triangles – Theorem Proofs",           desc: "Prove the 5 theorems discussed in class. Include neat diagrams for each.", due: "2026-05-04", type: "Practice Work", created: "2026-04-27" },
    { id: 4, classroomId: 3, title: "Integration – Definite Integrals",     desc: "Solve problems 1–15 from the worksheet provided. Calculator not allowed.", due: "2026-05-06", type: "Practice Work", created: "2026-04-29" },
    { id: 5, classroomId: 4, title: "Calculus IA Draft Submission",         desc: "Submit your Internal Assessment draft. Must include bibliography and methodology section.", due: "2026-05-10", type: "Assignment", created: "2026-04-28" },
  ],
  submissions: [
    { id: 1, hwId: 1, studentId: 1, at: "2026-05-01 08:30", file: "quadratics_gautami.pdf",  grade: "A",  fb: "Excellent! Very neat presentation. Keep it up." },
    { id: 2, hwId: 2, studentId: 2, at: "2026-05-02 07:45", file: "poly_prep_divyaraj.jpg",  grade: null, fb: "" },
    { id: 3, hwId: 3, studentId: 3, at: "2026-05-03 09:00", file: "triangles_sonam.pdf",     grade: "B+", fb: "Good work. Diagrams need to be neater." },
  ],
  broadcasts: [
    { id: 1, text: "🌟 Reminder: Practice work MUST be completed before entering class. Blank faces are NOT accepted – every student is expected to try!", ts: "2026-04-30 10:00", classroomId: null },
    { id: 2, text: "📝 CBSE Batch A: Weekly test on Polynomials this Saturday. Be fully prepared with all theorems!", ts: "2026-04-29 14:30", classroomId: 1 },
    { id: 3, text: "✅ GSEB Evening: Triangle theorem worksheets reviewed. Most students did well – check your grades in the app!", ts: "2026-04-28 09:00", classroomId: 2 },
    { id: 4, text: "📊 Marks Update: WT2 results have been uploaded. Parents can view their child's performance in the app.", ts: "2026-04-27 16:00", classroomId: null },
  ],
  marks: [
    { id: 1, classroomId: 1, studentId: 1, test: "WT1 – Polynomials",       date: "2026-04-20", max: 20, score: 18 },
    { id: 2, classroomId: 1, studentId: 2, test: "WT1 – Polynomials",       date: "2026-04-20", max: 20, score: 15 },
    { id: 3, classroomId: 1, studentId: 6, test: "WT1 – Polynomials",       date: "2026-04-20", max: 20, score: 17 },
    { id: 4, classroomId: 1, studentId: 1, test: "WT2 – Quadratic Eqs",     date: "2026-04-27", max: 25, score: 23 },
    { id: 5, classroomId: 1, studentId: 2, test: "WT2 – Quadratic Eqs",     date: "2026-04-27", max: 25, score: 20 },
    { id: 6, classroomId: 1, studentId: 6, test: "WT2 – Quadratic Eqs",     date: "2026-04-27", max: 25, score: 22 },
    { id: 7, classroomId: 3, studentId: 4, test: "WT1 – Integrals",         date: "2026-04-25", max: 30, score: 27 },
    { id: 8, classroomId: 3, studentId: 7, test: "WT1 – Integrals",         date: "2026-04-25", max: 30, score: 21 },
  ],
  announcements: [
    { id: 1, title: "Admissions Open – Batch 2026-27", body: "New batch starting June 2026 for Class 6th–12th. CBSE, ICSE, IB & GSEB. Limited seats – enroll today! Call: 98258 38108", date: "2026-04-25", pinned: true },
    { id: 2, title: "Holiday Notice – May 14th", body: "Classes suspended on May 14 (National Holiday). Compensatory session on May 16 (Saturday) at same timings. Attendance mandatory.", date: "2026-04-28", pinned: false },
    { id: 3, title: "Parent-Teacher Meeting", body: "PTM scheduled for May 20th (Wednesday) 6:00–8:00 PM at Sector 3D branch. All parents are requested to attend.", date: "2026-05-01", pinned: true },
  ],
};

// ─────────────────────────────────────────
//  THEME
// ─────────────────────────────────────────
const TH = {
  light: {
    bg: "#f5f4f0", card: "#ffffff", sec: "#eceae4", border: "#dedad2",
    text: "#1a2744", sub: "#5a6a82", nav: "#1a2744", navText: "#ffffff",
    accent: "#e8a020", accentDark: "#c8850a", success: "#059669",
    danger: "#dc2626", info: "#1d4ed8", warn: "#d97706",
    inp: "#ffffff", inpBorder: "#ccc8be", shadow: "0 2px 8px rgba(0,0,0,0.08)",
    shadowMd: "0 4px 20px rgba(0,0,0,0.12)", pill: "#f0ece4",
  },
  dark: {
    bg: "#0f172a", card: "#1e293b", sec: "#162032", border: "#2d3f55",
    text: "#e2e8f0", sub: "#8ba0bb", nav: "#0d1829", navText: "#e2e8f0",
    accent: "#fbbf24", accentDark: "#f59e0b", success: "#34d399",
    danger: "#f87171", info: "#60a5fa", warn: "#fbbf24",
    inp: "#243044", inpBorder: "#3b5068", shadow: "0 2px 8px rgba(0,0,0,0.3)",
    shadowMd: "0 4px 20px rgba(0,0,0,0.4)", pill: "#1e3048",
  },
};

// ─────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────
const fmtDate = (s) => s ? new Date(s).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "";
const initials = (n = "") => n.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
const pct = (s, m) => m ? Math.round((s / m) * 100) : 0;
const today = () => new Date().toISOString().split("T")[0];
const now = () => new Date().toLocaleString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
const gradeColor = (p, t) => p >= 90 ? t.success : p >= 70 ? t.info : p >= 50 ? t.warn : t.danger;
const statusColor = (s, t) => s === "present" ? t.success : s === "late" ? t.warn : t.danger;

const loadData = () => {
  try { const s = localStorage.getItem("apc_v2"); return s ? JSON.parse(s) : SEED; } catch { return SEED; }
};
const saveData = (d) => { try { localStorage.setItem("apc_v2", JSON.stringify(d)); } catch {} };

// ─────────────────────────────────────────
//  SMALL COMPONENTS
// ─────────────────────────────────────────
const Avatar = ({ name, size = 38, color = "#1a2744" }) => (
  <div style={{
    width: size, height: size, borderRadius: "50%", background: color,
    color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: size * 0.35, fontWeight: 700, flexShrink: 0, letterSpacing: 1,
  }}>{initials(name)}</div>
);

const Tag = ({ label, color = "#2563eb" }) => (
  <span style={{
    background: color + "18", color, fontSize: 11, fontWeight: 700,
    padding: "2px 8px", borderRadius: 20, letterSpacing: 0.5,
  }}>{label}</span>
);

const StatusDot = ({ status, t }) => (
  <span style={{
    display: "inline-block", width: 8, height: 8, borderRadius: "50%",
    background: statusColor(status, t), marginRight: 5,
  }} />
);

const PinDots = ({ value, max = 4 }) => (
  <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
    {Array.from({ length: max }).map((_, i) => (
      <div key={i} style={{
        width: 14, height: 14, borderRadius: "50%",
        border: "2px solid #64748b",
        background: i < value.length ? "#1a2744" : "transparent",
        transition: "background 0.15s",
      }} />
    ))}
  </div>
);

const ProgressBar = ({ value, max, color = "#2563eb" }) => (
  <div style={{ background: "#e2e8f0", borderRadius: 8, height: 6, overflow: "hidden" }}>
    <div style={{ width: `${pct(value, max)}%`, height: "100%", background: color, borderRadius: 8, transition: "width 0.6s" }} />
  </div>
);

const StatCard = ({ label, value, icon, color, t }) => (
  <div className="hover-lift" style={{
    background: t.card, borderRadius: 14, padding: "18px 20px",
    boxShadow: t.shadow, border: `1px solid ${t.border}`,
    display: "flex", alignItems: "center", gap: 14,
  }}>
    <div style={{ width: 46, height: 46, borderRadius: 12, background: color + "1a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{icon}</div>
    <div>
      <div style={{ fontSize: 24, fontWeight: 800, color: t.text }}>{value}</div>
      <div style={{ fontSize: 12, color: t.sub, marginTop: 1 }}>{label}</div>
    </div>
  </div>
);

const SectionHeader = ({ title, sub, t }) => (
  <div style={{ marginBottom: 18 }}>
    <h2 style={{ fontSize: 20, fontWeight: 800, color: t.text, fontFamily: "'Playfair Display', serif" }}>{title}</h2>
    {sub && <p style={{ fontSize: 13, color: t.sub, marginTop: 3 }}>{sub}</p>}
  </div>
);

const EmptyState = ({ icon, title, sub, t }) => (
  <div style={{ textAlign: "center", padding: "48px 24px", color: t.sub }}>
    <div style={{ fontSize: 48, marginBottom: 12 }}>{icon}</div>
    <div style={{ fontWeight: 700, color: t.text, marginBottom: 6 }}>{title}</div>
    <div style={{ fontSize: 13 }}>{sub}</div>
  </div>
);

const Btn = ({ label, onClick, variant = "primary", small, icon, t, disabled }) => {
  const styles = {
    primary: { bg: t.nav, text: "#fff", border: "none" },
    accent:  { bg: t.accent, text: "#1a2744", border: "none" },
    outline: { bg: "transparent", text: t.text, border: `1.5px solid ${t.border}` },
    danger:  { bg: t.danger, text: "#fff", border: "none" },
    success: { bg: t.success, text: "#fff", border: "none" },
    ghost:   { bg: "transparent", text: t.sub, border: "none" },
  };
  const s = styles[variant] || styles.primary;
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: disabled ? t.sec : s.bg, color: disabled ? t.sub : s.text,
      border: s.border, borderRadius: 10, padding: small ? "7px 14px" : "10px 20px",
      fontSize: small ? 12 : 14, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer",
      fontFamily: "'Nunito', sans-serif", display: "flex", alignItems: "center", gap: 6,
      transition: "opacity 0.15s, transform 0.1s", whiteSpace: "nowrap",
    }}
      onMouseDown={e => !disabled && (e.currentTarget.style.transform = "scale(0.97)")}
      onMouseUp={e => !disabled && (e.currentTarget.style.transform = "scale(1)")}
      onMouseLeave={e => !disabled && (e.currentTarget.style.transform = "scale(1)")}
    >
      {icon && <span>{icon}</span>}{label}
    </button>
  );
};

const Inp = ({ label, value, onChange, type = "text", placeholder, t, small }) => (
  <div style={{ marginBottom: small ? 8 : 14 }}>
    {label && <div style={{ fontSize: 12, fontWeight: 700, color: t.sub, marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>}
    <input value={value} onChange={e => onChange(e.target.value)} type={type} placeholder={placeholder}
      style={{
        width: "100%", padding: small ? "8px 12px" : "11px 14px", borderRadius: 10,
        border: `1.5px solid ${t.inpBorder}`, background: t.inp, color: t.text,
        fontSize: 14, fontFamily: "'Nunito', sans-serif", outline: "none",
        transition: "border 0.2s",
      }}
      onFocus={e => e.target.style.borderColor = t.accent}
      onBlur={e => e.target.style.borderColor = t.inpBorder}
    />
  </div>
);

const TextArea = ({ label, value, onChange, placeholder, rows = 3, t }) => (
  <div style={{ marginBottom: 14 }}>
    {label && <div style={{ fontSize: 12, fontWeight: 700, color: t.sub, marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>}
    <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
      style={{
        width: "100%", padding: "11px 14px", borderRadius: 10,
        border: `1.5px solid ${t.inpBorder}`, background: t.inp, color: t.text,
        fontSize: 14, fontFamily: "'Nunito', sans-serif", outline: "none", resize: "vertical",
      }}
      onFocus={e => e.target.style.borderColor = t.accent}
      onBlur={e => e.target.style.borderColor = t.inpBorder}
    />
  </div>
);

const Select = ({ label, value, onChange, options, t }) => (
  <div style={{ marginBottom: 14 }}>
    {label && <div style={{ fontSize: 12, fontWeight: 700, color: t.sub, marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>}
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{
        width: "100%", padding: "11px 14px", borderRadius: 10,
        border: `1.5px solid ${t.inpBorder}`, background: t.inp, color: t.text,
        fontSize: 14, fontFamily: "'Nunito', sans-serif", outline: "none",
      }}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

const Modal = ({ title, children, onClose, t }) => (
  <div style={{
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 1000,
    display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
  }} onClick={onClose}>
    <div onClick={e => e.stopPropagation()} className="fade-in" style={{
      background: t.card, borderRadius: 18, padding: "28px 28px 24px",
      maxWidth: 500, width: "100%", maxHeight: "85vh", overflowY: "auto",
      boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: t.text, fontFamily: "'Playfair Display', serif" }}>{title}</h3>
        <button onClick={onClose} style={{ background: t.sec, border: "none", borderRadius: 8, width: 30, height: 30, cursor: "pointer", fontSize: 16, color: t.sub, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
      </div>
      {children}
    </div>
  </div>
);

// ─────────────────────────────────────────
//  LANDING PAGE
// ─────────────────────────────────────────
function LandingPage({ t, go }) {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: `linear-gradient(135deg, #1a2744 0%, #0d1829 60%, #1a3a5c 100%)`,
      padding: 24,
    }}>
      <div className="fade-in" style={{ textAlign: "center", maxWidth: 480, width: "100%" }}>
        {/* Logo */}
        <div style={{
          width: 90, height: 90, borderRadius: 24, background: "#e8a020",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px", boxShadow: "0 8px 32px rgba(232,160,32,0.4)",
          overflow: "hidden",
        }}>
          <img src="data:image/png;base64,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PtFYHBLpIeKvlt3qY4IiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIDzx/gtZfSV5jl8q+EOWyGOe0pb1I7R/0jct36bLZv8Fzz9OufoeGGMgfX/teSH9IF/mV3tlMX6utGj5KLGxXk0L4ceIfM701+fJyzb8wxJpyQbDWppiIkIjt6bKaymdy8rJRcy7kninx7g2+LQCQARWqJV7lrLw1bvInOW6CESD3WErf3VnshvUaGxdW2vxDuWp+KtJp9Nu7xVEQdq8I6GjU7UljpEsbH+h/z/lOPPed5CyMjzcQ9WZEc0xHTcsOoI121K1vm+ZdXfV9X8P6Fwt9Fpzy30oRHht4PxX/q+Umrf3hXdHD+P1f08FsCf+NJ/SDk261rXrLUWPSZ/uVERF6WIREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREB4+r+C5X+n/KIcdyxF7bPu/iHTXVK1j45+EOK8U8bEZmZKVjpUK2g+0Inw+ovqtwIS6un/AHq/2rUJptUlr+kFNi5LwcM+G1mydqPGzr4t17Stut81RWdPNbBZHcIDb8VlsXE/Re5rwzroscz4rIRycF1vVaNghMdo+7tVef4Jc+Qmbx4kCe5a1WJYjut8YitX8S0vq9we+le2TrvhTftv023pRfbCtBrfwLJyH9KTl8uJem7qA38pMuD/AHl3r+zgK538FfBLJYrm6HzjzY2y1Nx4uDEitO34/WXcRDt22Korojh9f18FlacooRW+IOc75ZVZr7LKmyWZPaIikMUEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAf/Z" alt="Sir Ajit Pillai Classes Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>

        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 800, color: "#fff", marginBottom: 4 }}>
          Sir Ajit Pillai Classes
        </h1>
        <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 6 }}>
          CBSE · GSEB · ICSE · IB  |  Sector 3D & Randesan, Gandhinagar
        </p>
        <p style={{ color: "#64748b", fontSize: 12, marginBottom: 36, fontStyle: "italic" }}>
          "We are Disciplined, rather than Strict"
        </p>

        {/* Role cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
          {[
            { role: "admin",   icon: "🎓", label: "Sir (Admin)", sub: "Manage everything — classes, students, attendance", color: "#e8a020" },
            { role: "student", icon: "📚", label: "Student Login", sub: "View homework, submit tasks, check attendance", color: "#3b82f6" },
            { role: "parent",  icon: "👨‍👩‍👦", label: "Parent Login", sub: "Track your child's progress & communications", color: "#10b981" },
          ].map(r => (
            <button key={r.role} onClick={() => go(r.role)} style={{
              background: "rgba(255,255,255,0.06)", border: `1.5px solid ${r.color}30`,
              borderRadius: 14, padding: "16px 20px", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 14, textAlign: "left",
              transition: "all 0.2s", color: "#fff",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = `${r.color}20`; e.currentTarget.style.borderColor = r.color; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = `${r.color}30`; }}
            >
              <div style={{ fontSize: 30, width: 46, height: 46, background: `${r.color}25`, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{r.icon}</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 2 }}>{r.label}</div>
                <div style={{ color: "#8ba0bb", fontSize: 12 }}>{r.sub}</div>
              </div>
              <span style={{ marginLeft: "auto", color: "#4a6080", fontSize: 18 }}>›</span>
            </button>
          ))}
        </div>

        <div style={{ color: "#3a4f65", fontSize: 11 }}>
          📞 98258 38108 · ajitpillai007@yahoo.co.in
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
//  PIN PAD  (reusable)
// ─────────────────────────────────────────
function PinPad({ onComplete, maxLen = 4, t }) {
  const [pin, setPin] = useState("");
  const [shake, setShake] = useState(false);
  const press = (v) => {
    if (pin.length >= maxLen) return;
    setPin(prev => prev + v);
  };
  const del = () => setPin(p => p.slice(0, -1));
  const confirm = () => {
    if (pin.length < 4) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    onComplete(pin);
    setTimeout(() => setPin(""), 200);
  };
  const keys = ["1","2","3","4","5","6","7","8","9","","0","⌫"];
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-6px)}40%,80%{transform:translateX(6px)}}`}</style>
      <div style={{ animation: shake ? "shake 0.4s ease" : "none" }}>
        <PinDots value={pin} max={maxLen} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 70px)", gap: 10 }}>
        {keys.map((k, i) => (
          <button key={i} onClick={k === "⌫" ? del : k ? () => press(k) : undefined}
            style={{
              height: 58, borderRadius: 14, border: `1.5px solid ${t.border}`,
              background: k === "⌫" ? t.sec : k ? t.card : "transparent",
              color: t.text, fontSize: k === "⌫" ? 20 : 22, fontWeight: 700,
              cursor: k ? "pointer" : "default", fontFamily: "'Nunito', sans-serif",
              boxShadow: k ? t.shadow : "none", transition: "transform 0.1s",
            }}
            onMouseDown={e => k && (e.currentTarget.style.transform = "scale(0.94)")}
            onMouseUp={e => k && (e.currentTarget.style.transform = "scale(1)")}
            onMouseLeave={e => k && (e.currentTarget.style.transform = "scale(1)")}
          >{k}</button>
        ))}
      </div>
      <button onClick={confirm} disabled={pin.length < 4}
        style={{
          width: "100%", maxWidth: 220, padding: "13px 0", borderRadius: 14,
          background: pin.length >= 4 ? t.nav : t.sec, color: pin.length >= 4 ? "#fff" : t.sub,
          border: "none", fontSize: 15, fontWeight: 800, cursor: pin.length >= 4 ? "pointer" : "not-allowed",
          fontFamily: "'Nunito', sans-serif", transition: "all 0.2s",
          letterSpacing: 1,
        }}>
        {pin.length >= 4 ? "✓  Confirm PIN" : `Enter ${4 - pin.length} more digit${4 - pin.length !== 1 ? "s" : ""}`}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────
//  LOGIN SCREENS
// ─────────────────────────────────────────
function AdminLoginScreen({ t, data, setUser, goBack, notify }) {
  const [id, setId] = useState(""); const [pw, setPw] = useState(""); const [err, setErr] = useState("");
  const login = () => {
    if (id === ADMIN_CREDS.id && pw === ADMIN_CREDS.password) { setUser({ type: "admin", name: "Sir Ajit Pillai" }); }
    else { setErr("Invalid Admin ID or Password"); setTimeout(() => setErr(""), 2500); }
  };
  return (
    <LoginShell title="Admin Login" icon="🎓" sub="Sir Ajit Pillai – Full Access" goBack={goBack} t={t}>
      <Inp label="Admin ID" value={id} onChange={setId} placeholder="ajitpillai007" t={t} />
      <Inp label="Password" value={pw} onChange={setPw} type="password" placeholder="••••••••••" t={t} />
      {err && <div style={{ color: t.danger, fontSize: 13, textAlign: "center", marginBottom: 10, fontWeight: 600 }}>{err}</div>}
      <Btn label="Login as Admin" onClick={login} t={t} />
      <div style={{ marginTop: 14, padding: "10px 14px", background: t.sec, borderRadius: 10, fontSize: 12, color: t.sub }}>
        Demo: ID = <b style={{ color: t.text }}>ajitpillai007</b> · PW = <b style={{ color: t.text }}>AjitSir@2026</b>
      </div>
    </LoginShell>
  );
}

function StudentLoginScreen({ t, data, setUser, goBack, notify }) {
  const [step, setStep] = useState("name"); // name | pin | setpin
  const [search, setSearch] = useState(""); const [sel, setSel] = useState(null); const [err, setErr] = useState("");
  const filtered = data.students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
  const handlePin = (pin) => {
    if (!sel) return;
    if (!sel.pinSet) { /* set pin */ notify("PIN set successfully! Welcome aboard.", "success"); setUser({ type: "student", ...sel }); return; }
    if (pin === sel.pin) { setUser({ type: "student", ...sel }); }
    else { setErr("Incorrect PIN – try again"); setSel({ ...sel }); setTimeout(() => setErr(""), 2500); }
  };
  return (
    <LoginShell title="Student Login" icon="📚" sub="Select your name & enter PIN" goBack={goBack} t={t}>
      {step === "name" && (
        <>
          <Inp label="Search your name" value={search} onChange={setSearch} placeholder="Type your name..." t={t} />
          <div style={{ maxHeight: 220, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
            {filtered.map(s => {
              const cls = data.classrooms.find(c => c.id === s.classroomId);
              return (
                <button key={s.id} onClick={() => { setSel(s); setStep("pin"); }} style={{
                  background: t.sec, border: `1.5px solid ${t.border}`, borderRadius: 12, padding: "12px 14px",
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 12, textAlign: "left", width: "100%",
                }}>
                  <Avatar name={s.name} size={36} color={BOARD_COLOR[cls?.board] || "#1a2744"} />
                  <div>
                    <div style={{ fontWeight: 700, color: t.text, fontSize: 14 }}>{s.name}</div>
                    <div style={{ fontSize: 11, color: t.sub }}>{cls?.name} · Roll {s.rollNo}</div>
                  </div>
                </button>
              );
            })}
            {filtered.length === 0 && <div style={{ textAlign: "center", color: t.sub, padding: 16, fontSize: 13 }}>No student found</div>}
          </div>
        </>
      )}
      {step === "pin" && sel && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, padding: "12px 14px", background: t.sec, borderRadius: 12 }}>
            <Avatar name={sel.name} size={40} color={BOARD_COLOR[data.classrooms.find(c => c.id === sel.classroomId)?.board] || "#1a2744"} />
            <div>
              <div style={{ fontWeight: 700, color: t.text }}>{sel.name}</div>
              <div style={{ fontSize: 12, color: t.sub }}>{!sel.pinSet ? "Set your 4-digit PIN (first time)" : "Enter your PIN"}</div>
            </div>
          </div>
          {err && <div style={{ color: t.danger, fontSize: 13, textAlign: "center", marginBottom: 10, fontWeight: 600 }}>{err}</div>}
          <PinPad onComplete={handlePin} maxLen={4} t={t} />
          <div style={{ marginTop: 12, textAlign: "center" }}>
            <button onClick={() => { setStep("name"); setSel(null); }} style={{ background: "none", border: "none", color: t.sub, cursor: "pointer", fontSize: 13 }}>← Back</button>
          </div>
        </>
      )}
    </LoginShell>
  );
}

function ParentLoginScreen({ t, data, setUser, goBack, notify }) {
  const [step, setStep] = useState("name");
  const [search, setSearch] = useState(""); const [sel, setSel] = useState(null); const [err, setErr] = useState("");
  const filtered = data.parents.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || data.students.find(s => s.id === p.studentId)?.name.toLowerCase().includes(search.toLowerCase()));
  const handlePin = (pin) => {
    if (pin === sel.pin) { setUser({ type: "parent", ...sel }); }
    else { setErr("Incorrect PIN – try again"); setSel({ ...sel }); setTimeout(() => setErr(""), 2500); }
  };
  return (
    <LoginShell title="Parent Login" icon="👨‍👩‍👦" sub="Monitor your child's progress" goBack={goBack} t={t}>
      {step === "name" && (
        <>
          <Inp label="Search by your name or child's name" value={search} onChange={setSearch} placeholder="Type to search..." t={t} />
          <div style={{ maxHeight: 220, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
            {filtered.map(p => {
              const child = data.students.find(s => s.id === p.studentId);
              const cls = data.classrooms.find(c => c.id === child?.classroomId);
              return (
                <button key={p.id} onClick={() => { setSel(p); setStep("pin"); }} style={{
                  background: t.sec, border: `1.5px solid ${t.border}`, borderRadius: 12, padding: "12px 14px",
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 12, textAlign: "left", width: "100%",
                }}>
                  <Avatar name={p.name} size={36} color="#059669" />
                  <div>
                    <div style={{ fontWeight: 700, color: t.text, fontSize: 14 }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: t.sub }}>Parent of {child?.name} · {cls?.board} {cls?.grade}</div>
                  </div>
                </button>
              );
            })}
            {filtered.length === 0 && <div style={{ textAlign: "center", color: t.sub, padding: 16, fontSize: 13 }}>No parent found</div>}
          </div>
        </>
      )}
      {step === "pin" && sel && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, padding: "12px 14px", background: t.sec, borderRadius: 12 }}>
            <Avatar name={sel.name} size={40} color="#059669" />
            <div>
              <div style={{ fontWeight: 700, color: t.text }}>{sel.name}</div>
              <div style={{ fontSize: 12, color: t.sub }}>Parent of {data.students.find(s => s.id === sel.studentId)?.name}</div>
            </div>
          </div>
          {err && <div style={{ color: t.danger, fontSize: 13, textAlign: "center", marginBottom: 10, fontWeight: 600 }}>{err}</div>}
          <PinPad onComplete={handlePin} maxLen={4} t={t} />
          <div style={{ marginTop: 12, textAlign: "center" }}>
            <button onClick={() => { setStep("name"); setSel(null); }} style={{ background: "none", border: "none", color: t.sub, cursor: "pointer", fontSize: 13 }}>← Back</button>
          </div>
        </>
      )}
    </LoginShell>
  );
}

function LoginShell({ title, icon, sub, goBack, t, children }) {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: `linear-gradient(135deg, #1a2744 0%, #0d1829 100%)`, padding: 24,
    }}>
      <div className="fade-in" style={{ background: t.card, borderRadius: 20, padding: "32px 28px", maxWidth: 420, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
        <button onClick={goBack} style={{ background: "none", border: "none", color: t.sub, cursor: "pointer", fontSize: 13, marginBottom: 20, display: "flex", alignItems: "center", gap: 6 }}>← Back</button>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 44, marginBottom: 10 }}>{icon}</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 800, color: t.text }}>{title}</h2>
          <p style={{ color: t.sub, fontSize: 13, marginTop: 4 }}>{sub}</p>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
//  DASHBOARD SHELL
// ─────────────────────────────────────────
const NAV_ADMIN = [
  { id: "home",        icon: "🏠", label: "Dashboard"     },
  { id: "classrooms",  icon: "🏫", label: "Classrooms"    },
  { id: "students",    icon: "👥", label: "Students"      },
  { id: "attendance",  icon: "📋", label: "Attendance"    },
  { id: "homework",    icon: "📚", label: "Homework"      },
  { id: "submissions", icon: "📤", label: "Submissions"   },
  { id: "broadcast",   icon: "📢", label: "Broadcast"     },
  { id: "marks",       icon: "📊", label: "Marks & Tests" },
  { id: "announcements",icon:"📣", label: "Announcements" },
  { id: "settings",   icon: "⚙️", label: "Settings"      },
];
const NAV_STUDENT = [
  { id: "home",        icon: "🏠", label: "My Dashboard"  },
  { id: "tasks",       icon: "📋", label: "My Tasks"      },
  { id: "submit",      icon: "📤", label: "Submit Work"   },
  { id: "attendance",  icon: "📅", label: "Attendance"    },
  { id: "marks",       icon: "📊", label: "My Marks"      },
  { id: "messages",    icon: "💬", label: "Messages"      },
  { id: "announcements",icon:"📣", label: "Announcements" },
  { id: "profile",     icon: "👤", label: "My Profile"    },
];
const NAV_PARENT = [
  { id: "home",        icon: "🏠", label: "Overview"      },
  { id: "attendance",  icon: "📅", label: "Attendance"    },
  { id: "marks",       icon: "📊", label: "Academic Report"},
  { id: "homework",    icon: "📚", label: "Homework Status"},
  { id: "messages",    icon: "💬", label: "Messages"      },
  { id: "announcements",icon:"📣", label: "Announcements" },
  { id: "profile",     icon: "👤", label: "Profile"       },
];

function DashboardShell({ user, t, dark, setDark, logout, view, setView, navItems, data, children }) {
  const [mobileMenu, setMobileMenu] = useState(false);
  const navColor = (id) => id === view ? t.accent : "transparent";
  const navTextCol = (id) => id === view ? "#1a2744" : t.navText;
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <div style={{
        width: 220, background: t.nav, display: "flex", flexDirection: "column",
        position: "fixed", left: 0, top: 0, height: "100vh", zIndex: 100,
        boxShadow: "2px 0 12px rgba(0,0,0,0.15)", transition: "all 0.3s",
      }}>
        {/* Brand */}
        <div style={{ padding: "20px 16px", borderBottom: `1px solid rgba(255,255,255,0.08)` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <img src="data:image/png;base64,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PtFYHBLpIeKvlt3qY4IiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIDzx/gtZfSV5jl8q+EOWyGOe0pb1I7R/0jct36bLZv8Fzz9OufoeGGMgfX/teSH9IF/mV3tlMX6utGj5KLGxXk0L4ceIfM701+fJyzb8wxJpyQbDWppiIkIjt6bKaymdy8rJRcy7kninx7g2+LQCQARWqJV7lrLw1bvInOW6CESD3WErf3VnshvUaGxdW2vxDuWp+KtJp9Nu7xVEQdq8I6GjU7UljpEsbH+h/z/lOPPed5CyMjzcQ9WZEc0xHTcsOoI121K1vm+ZdXfV9X8P6Fwt9Fpzy30oRHht4PxX/q+Umrf3hXdHD+P1f08FsCf+NJ/SDk261rXrLUWPSZ/uVERF6WIREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREB4+r+C5X+n/KIcdyxF7bPu/iHTXVK1j45+EOK8U8bEZmZKVjpUK2g+0Inw+ovqtwIS6un/AHq/2rUJptUlr+kFNi5LwcM+G1mydqPGzr4t17Stut81RWdPNbBZHcIDb8VlsXE/Re5rwzroscz4rIRycF1vVaNghMdo+7tVef4Jc+Qmbx4kCe5a1WJYjut8YitX8S0vq9we+le2TrvhTftv023pRfbCtBrfwLJyH9KTl8uJem7qA38pMuD/AHl3r+zgK538FfBLJYrm6HzjzY2y1Nx4uDEitO34/WXcRDt22Korojh9f18FlacooRW+IOc75ZVZr7LKmyWZPaIikMUEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAf/Z" alt="Logo" style={{ width: 36, height: 36, borderRadius: 10, objectFit: "cover" }} />
            <div>
              <div style={{ color: "#fff", fontWeight: 800, fontSize: 13, fontFamily: "'Playfair Display', serif" }}>Ajit Pillai</div>
              <div style={{ color: "#64748b", fontSize: 10 }}>Classes App</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
            <Avatar name={user.name} size={30} color={t.accent} />
            <div style={{ flex: 1, overflow: "hidden" }}>
              <div style={{ color: "#fff", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name}</div>
              <div style={{ color: "#6b7f99", fontSize: 10, textTransform: "capitalize" }}>{user.type}</div>
            </div>
          </div>
        </div>
        {/* Nav */}
        <nav style={{ flex: 1, overflowY: "auto", padding: "12px 8px" }}>
          {navItems.map(n => (
            <button key={n.id} onClick={() => setView(n.id)} style={{
              width: "100%", background: navColor(n.id), color: navTextCol(n.id),
              border: "none", borderRadius: 10, padding: "10px 12px", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 10, marginBottom: 2,
              fontFamily: "'Nunito', sans-serif", fontWeight: n.id === view ? 800 : 500, fontSize: 13,
              textAlign: "left", transition: "all 0.2s",
            }}
              onMouseEnter={e => n.id !== view && (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
              onMouseLeave={e => n.id !== view && (e.currentTarget.style.background = "transparent")}
            >
              <span style={{ fontSize: 15 }}>{n.icon}</span>{n.label}
            </button>
          ))}
        </nav>
        {/* Bottom */}
        <div style={{ padding: "12px 8px", borderTop: `1px solid rgba(255,255,255,0.08)` }}>
          <button onClick={() => setDark(!dark)} style={{
            width: "100%", background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 10,
            padding: "9px 12px", color: "#94a3b8", cursor: "pointer", fontSize: 13, display: "flex",
            alignItems: "center", gap: 8, fontFamily: "'Nunito', sans-serif", marginBottom: 6,
          }}>{dark ? "☀️" : "🌙"} {dark ? "Light Mode" : "Dark Mode"}</button>
          <button onClick={logout} style={{
            width: "100%", background: "transparent", border: "none", borderRadius: 10,
            padding: "9px 12px", color: "#ef4444", cursor: "pointer", fontSize: 13, display: "flex",
            alignItems: "center", gap: 8, fontFamily: "'Nunito', sans-serif",
          }}>🚪 Logout</button>
        </div>
      </div>
      {/* Main */}
      <div style={{ marginLeft: 220, flex: 1, padding: "28px 28px 48px", overflowY: "auto", minHeight: "100vh" }}>
        <div className="fade-in" key={view}>{children}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
//  ADMIN VIEWS
// ─────────────────────────────────────────
function AdminHome({ data, t }) {
  const totalStudents = data.students.length;
  const todayAtt = data.attendance.filter(a => a.date === today());
  const presentToday = todayAtt.flatMap(a => a.records).filter(r => r.status === "present").length;
  const pending = data.submissions.filter(s => !s.grade).length;
  const allSubs = data.submissions.length;
  const totalHW = data.homework.length;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 800, color: t.text }}>Good morning, Sir! 👋</h1>
        <p style={{ color: t.sub, marginTop: 4 }}>Here's your classroom overview for today.</p>
      </div>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 28 }}>
        <StatCard label="Total Students" value={totalStudents} icon="👥" color="#2563eb" t={t} />
        <StatCard label="Active Classrooms" value={data.classrooms.length} icon="🏫" color="#059669" t={t} />
        <StatCard label="Present Today" value={presentToday} icon="✅" color="#059669" t={t} />
        <StatCard label="Pending Reviews" value={pending} icon="📤" color="#d97706" t={t} />
        <StatCard label="Active Homework" value={totalHW} icon="📚" color="#7c3aed" t={t} />
        <StatCard label="Total Submissions" value={allSubs} icon="📎" color="#dc2626" t={t} />
      </div>
      {/* Quick overview */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        {/* Classrooms */}
        <div style={{ background: t.card, borderRadius: 16, padding: 20, boxShadow: t.shadow }}>
          <div style={{ fontWeight: 800, color: t.text, marginBottom: 14, fontSize: 15 }}>📚 Classrooms</div>
          {data.classrooms.map(c => {
            const count = data.students.filter(s => s.classroomId === c.id).length;
            return (
              <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: BOARD_COLOR[c.board], flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: t.sub }}>{c.schedule}</div>
                </div>
                <Tag label={`${count} students`} color={BOARD_COLOR[c.board]} />
              </div>
            );
          })}
        </div>
        {/* Recent broadcasts */}
        <div style={{ background: t.card, borderRadius: 16, padding: 20, boxShadow: t.shadow }}>
          <div style={{ fontWeight: 800, color: t.text, marginBottom: 14, fontSize: 15 }}>📢 Recent Messages</div>
          {data.broadcasts.slice(0, 3).map(b => (
            <div key={b.id} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: `1px solid ${t.border}` }}>
              <div style={{ fontSize: 12, color: t.text, lineHeight: 1.5 }}>{b.text.length > 90 ? b.text.slice(0, 90) + "..." : b.text}</div>
              <div style={{ fontSize: 11, color: t.sub, marginTop: 4 }}>{b.ts} · {b.classroomId ? data.classrooms.find(c => c.id === b.classroomId)?.board : "All"}</div>
            </div>
          ))}
        </div>
      </div>
      {/* Announcements pinned */}
      {data.announcements.filter(a => a.pinned).length > 0 && (
        <div style={{ marginTop: 18, background: `${t.accent}18`, border: `1.5px solid ${t.accent}60`, borderRadius: 16, padding: 20 }}>
          <div style={{ fontWeight: 800, color: t.accent, marginBottom: 12 }}>📌 Pinned Announcements</div>
          {data.announcements.filter(a => a.pinned).map(a => (
            <div key={a.id} style={{ marginBottom: 8 }}>
              <div style={{ fontWeight: 700, color: t.text, fontSize: 14 }}>{a.title}</div>
              <div style={{ fontSize: 12, color: t.sub }}>{a.body}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ClassroomsView({ data, setData, t, notify }) {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: "", board: "CBSE", grade: "", schedule: "", location: "Sector 3D" });
  const [addStudentModal, setAddStudentModal] = useState(null); // classroomId
  const [stuForm, setStuForm] = useState({ name: "", rollNo: "", phone: "" });

  const createClass = () => {
    if (!form.name || !form.grade) return notify("Fill name and grade", "error");
    const newC = { ...form, id: Date.now() };
    setData(p => ({ ...p, classrooms: [...p.classrooms, newC] }));
    setModal(false); setForm({ name: "", board: "CBSE", grade: "", schedule: "", location: "Sector 3D" });
    notify("Classroom created!", "success");
  };

  const deleteClass = (id) => {
    if (!window.confirm("Delete this classroom?")) return;
    setData(p => ({ ...p, classrooms: p.classrooms.filter(c => c.id !== id), students: p.students.filter(s => s.classroomId !== id) }));
    notify("Classroom deleted");
  };

  const addStudent = () => {
    if (!stuForm.name) return notify("Enter student name", "error");
    const maxId = Math.max(0, ...data.students.map(s => s.id)) + 1;
    const parentId = maxId + 1000;
    const newS = { id: maxId, classroomId: addStudentModal, rollNo: stuForm.rollNo || `R${maxId}`, name: stuForm.name, phone: stuForm.phone, parentId, pin: "0000", pinSet: true };
    const newP = { id: parentId, name: `Parent of ${stuForm.name}`, phone: stuForm.phone, studentId: maxId, pin: "0000", pinSet: true };
    setData(p => ({ ...p, students: [...p.students, newS], parents: [...p.parents, newP] }));
    setAddStudentModal(null); setStuForm({ name: "", rollNo: "", phone: "" });
    notify("Student added!", "success");
  };

  const removeStudent = (sId) => {
    if (!window.confirm("Remove this student?")) return;
    setData(p => ({ ...p, students: p.students.filter(s => s.id !== sId) }));
    notify("Student removed");
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <SectionHeader title="Classrooms" sub={`${data.classrooms.length} active classrooms`} t={t} />
        <Btn label="+ New Classroom" onClick={() => setModal(true)} t={t} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {data.classrooms.map(cls => {
          const students = data.students.filter(s => s.classroomId === cls.id);
          return (
            <div key={cls.id} style={{ background: t.card, borderRadius: 16, boxShadow: t.shadow, overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderLeft: `4px solid ${BOARD_COLOR[cls.board]}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 800, color: t.text, fontSize: 15 }}>{cls.name}</div>
                    <div style={{ fontSize: 12, color: t.sub }}>{cls.schedule} · {cls.location}</div>
                  </div>
                  <Tag label={cls.board} color={BOARD_COLOR[cls.board]} />
                  <Tag label={`${students.length} students`} color="#64748b" />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Btn label="+ Student" onClick={() => setAddStudentModal(cls.id)} variant="outline" small t={t} />
                  <Btn label="Delete" onClick={() => deleteClass(cls.id)} variant="danger" small t={t} />
                </div>
              </div>
              {students.length > 0 && (
                <div style={{ padding: "0 20px 14px" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
                    {students.map(s => (
                      <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 6, background: t.sec, borderRadius: 20, padding: "4px 10px 4px 6px" }}>
                        <Avatar name={s.name} size={22} color={BOARD_COLOR[cls.board]} />
                        <span style={{ fontSize: 12, fontWeight: 600, color: t.text }}>{s.name}</span>
                        <button onClick={() => removeStudent(s.id)} style={{ background: "none", border: "none", color: t.danger, cursor: "pointer", fontSize: 14, padding: "0 2px", lineHeight: 1 }}>×</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {modal && (
        <Modal title="Add New Classroom" onClose={() => setModal(false)} t={t}>
          <Inp label="Classroom Name" value={form.name} onChange={v => setForm(p => ({ ...p, name: v }))} placeholder="e.g. CBSE Class 10 Batch B" t={t} />
          <Select label="Board" value={form.board} onChange={v => setForm(p => ({ ...p, board: v }))} options={["CBSE","GSEB","ICSE","IB"].map(b => ({ value: b, label: b }))} t={t} />
          <Inp label="Grade" value={form.grade} onChange={v => setForm(p => ({ ...p, grade: v }))} placeholder="e.g. 10" t={t} />
          <Inp label="Schedule" value={form.schedule} onChange={v => setForm(p => ({ ...p, schedule: v }))} placeholder="e.g. Mon/Wed/Fri 7:00 AM" t={t} />
          <Select label="Location" value={form.location} onChange={v => setForm(p => ({ ...p, location: v }))} options={["Sector 3D","Randesan"].map(l => ({ value: l, label: l }))} t={t} />
          <Btn label="Create Classroom" onClick={createClass} t={t} />
        </Modal>
      )}
      {addStudentModal && (
        <Modal title={`Add Student to ${data.classrooms.find(c => c.id === addStudentModal)?.name}`} onClose={() => setAddStudentModal(null)} t={t}>
          <Inp label="Student Full Name" value={stuForm.name} onChange={v => setStuForm(p => ({ ...p, name: v }))} placeholder="e.g. Rahul Sharma" t={t} />
          <Inp label="Roll Number" value={stuForm.rollNo} onChange={v => setStuForm(p => ({ ...p, rollNo: v }))} placeholder="e.g. A004" t={t} />
          <Inp label="Student Phone" value={stuForm.phone} onChange={v => setStuForm(p => ({ ...p, phone: v }))} placeholder="10-digit number" t={t} />
          <div style={{ fontSize: 12, color: t.sub, marginBottom: 14 }}>Student will set their PIN on first login. Default is 0000.</div>
          <Btn label="Add Student" onClick={addStudent} t={t} />
        </Modal>
      )}
    </div>
  );
}

function AttendanceView({ data, setData, t, notify }) {
  const [selClass, setSelClass] = useState(data.classrooms[0]?.id || null);
  const [selDate, setSelDate] = useState(today());
  const [taking, setTaking] = useState(false);
  const [records, setRecords] = useState({});

  const students = data.students.filter(s => s.classroomId === selClass);
  const existing = data.attendance.find(a => a.date === selDate && a.classroomId === selClass);
  const history = data.attendance.filter(a => a.classroomId === selClass).sort((a, b) => b.date.localeCompare(a.date));

  const startTaking = () => {
    const init = {};
    students.forEach(s => { init[s.id] = existing?.records.find(r => r.studentId === s.id)?.status || "present"; });
    setRecords(init); setTaking(true);
  };

  const saveAtt = () => {
    const entry = { date: selDate, classroomId: selClass, records: Object.entries(records).map(([id, status]) => ({ studentId: parseInt(id), status })) };
    setData(p => {
      const filtered = p.attendance.filter(a => !(a.date === selDate && a.classroomId === selClass));
      return { ...p, attendance: [...filtered, entry] };
    });
    setTaking(false); notify("Attendance saved!", "success");
  };

  return (
    <div>
      <SectionHeader title="Attendance Management" sub="Take attendance & view history" t={t} />
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <select value={selClass} onChange={e => setSelClass(parseInt(e.target.value))} style={{ padding: "9px 14px", borderRadius: 10, border: `1.5px solid ${t.inpBorder}`, background: t.inp, color: t.text, fontFamily: "'Nunito',sans-serif", fontSize: 13 }}>
          {data.classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input type="date" value={selDate} onChange={e => setSelDate(e.target.value)} style={{ padding: "9px 14px", borderRadius: 10, border: `1.5px solid ${t.inpBorder}`, background: t.inp, color: t.text, fontFamily: "'Nunito',sans-serif", fontSize: 13 }} />
        <Btn label={taking ? "Cancel" : (existing ? "✏️ Edit" : "▶ Take Attendance")} onClick={taking ? () => setTaking(false) : startTaking} t={t} />
        {taking && <Btn label="💾 Save" onClick={saveAtt} variant="success" t={t} />}
      </div>

      {taking && (
        <div style={{ background: t.card, borderRadius: 16, padding: 20, boxShadow: t.shadow, marginBottom: 20 }}>
          <div style={{ fontWeight: 800, color: t.text, marginBottom: 14 }}>Marking Attendance – {selDate}</div>
          {students.map(s => (
            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10, padding: "10px 14px", background: t.sec, borderRadius: 12 }}>
              <Avatar name={s.name} size={34} color={BOARD_COLOR[data.classrooms.find(c => c.id === selClass)?.board] || "#1a2744"} />
              <span style={{ flex: 1, fontWeight: 600, color: t.text, fontSize: 14 }}>{s.name} <span style={{ fontSize: 11, color: t.sub }}>· {s.rollNo}</span></span>
              {["present", "late", "absent"].map(st => (
                <button key={st} onClick={() => setRecords(p => ({ ...p, [s.id]: st }))} style={{
                  padding: "5px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: "pointer",
                  border: records[s.id] === st ? "none" : `1.5px solid ${t.border}`,
                  background: records[s.id] === st ? (st === "present" ? t.success : st === "late" ? t.warn : t.danger) : "transparent",
                  color: records[s.id] === st ? "#fff" : t.sub, textTransform: "capitalize",
                }}>{st}</button>
              ))}
            </div>
          ))}
        </div>
      )}

      <div style={{ background: t.card, borderRadius: 16, padding: 20, boxShadow: t.shadow }}>
        <div style={{ fontWeight: 800, color: t.text, marginBottom: 14 }}>📅 Attendance History</div>
        {history.length === 0 && <EmptyState icon="📋" title="No attendance records yet" sub="Start taking attendance above" t={t} />}
        {history.map(att => {
          const p = att.records.filter(r => r.status === "present").length;
          const l = att.records.filter(r => r.status === "late").length;
          const a = att.records.filter(r => r.status === "absent").length;
          return (
            <div key={att.date + att.classroomId} style={{ marginBottom: 12, padding: "12px 14px", background: t.sec, borderRadius: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontWeight: 700, color: t.text }}>{fmtDate(att.date)}</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Tag label={`✅ ${p} Present`} color={t.success} />
                  {l > 0 && <Tag label={`⏰ ${l} Late`} color={t.warn} />}
                  {a > 0 && <Tag label={`❌ ${a} Absent`} color={t.danger} />}
                </div>
              </div>
              <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
                {att.records.map(r => {
                  const s = data.students.find(st => st.id === r.studentId);
                  return s ? (
                    <span key={r.studentId} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 10, background: statusColor(r.status, t) + "20", color: statusColor(r.status, t), fontWeight: 600 }}>
                      <StatusDot status={r.status} t={t} />{s.name}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HomeworkView({ data, setData, t, notify }) {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ classroomId: data.classrooms[0]?.id || "", title: "", desc: "", due: "", type: "Practice Work" });
  const [attachFile, setAttachFile] = useState(null);

  const handleFileAttach = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return notify("File too large – max 5MB", "error");
    const reader = new FileReader();
    reader.onload = (ev) => setAttachFile({ name: file.name, data: ev.target.result, type: file.type });
    reader.readAsDataURL(file);
  };

  const create = () => {
    if (!form.title || !form.due) return notify("Title and due date required", "error");
    const hw = { ...form, id: Date.now(), classroomId: parseInt(form.classroomId), created: today(), attachment: attachFile || null };
    setData(p => ({ ...p, homework: [...p.homework, hw] }));
    setModal(false);
    setForm({ classroomId: data.classrooms[0]?.id || "", title: "", desc: "", due: "", type: "Practice Work" });
    setAttachFile(null);
    notify("Homework assigned!", "success");
  };

  const deleteHW = (id) => {
    setData(p => ({ ...p, homework: p.homework.filter(h => h.id !== id) }));
    notify("Homework removed");
  };

  const typeColor = (type) => type === "Test Prep" ? t.danger : type === "Assignment" ? t.info : t.warn;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <SectionHeader title="Homework & Tasks" sub="Assign and manage practice work" t={t} />
        <Btn label="+ Assign Homework" onClick={() => setModal(true)} t={t} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {data.homework.length === 0 && <EmptyState icon="📚" title="No homework assigned yet" sub="Click '+ Assign Homework' to get started" t={t} />}
        {data.homework.map(hw => {
          const cls = data.classrooms.find(c => c.id === hw.classroomId);
          const subs = data.submissions.filter(s => s.hwId === hw.id);
          const students = data.students.filter(s => s.classroomId === hw.classroomId);
          const overdue = hw.due < today();
          return (
            <div key={hw.id} className="hover-lift" style={{ background: t.card, borderRadius: 14, padding: "16px 20px", boxShadow: t.shadow, border: `1px solid ${t.border}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                    <Tag label={hw.type} color={typeColor(hw.type)} />
                    <Tag label={cls?.board || ""} color={BOARD_COLOR[cls?.board] || "#64748b"} />
                    {overdue && <Tag label="Overdue" color={t.danger} />}
                  </div>
                  <div style={{ fontWeight: 800, color: t.text, fontSize: 15, marginBottom: 4 }}>{hw.title}</div>
                  <div style={{ fontSize: 12, color: t.sub, marginBottom: 8 }}>{hw.desc}</div>
                  <div style={{ fontSize: 12, color: t.sub }}>
                    📅 Due: <b style={{ color: overdue ? t.danger : t.text }}>{fmtDate(hw.due)}</b>
                    &nbsp;·&nbsp; 📤 {subs.length}/{students.length} submitted
                    &nbsp;·&nbsp; 🏫 {cls?.name}
                  </div>
                  {hw.attachment && (
                    <div style={{ marginTop: 8 }}>
                      <a href={hw.attachment.data} download={hw.attachment.name} style={{ fontSize: 12, color: t.info, fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", background: t.info + "15", borderRadius: 8 }}>
                        📎 {hw.attachment.name}
                      </a>
                    </div>
                  )}
                  <div style={{ marginTop: 8 }}>
                    <ProgressBar value={subs.length} max={students.length} color={t.success} />
                  </div>
                </div>
                <button onClick={() => deleteHW(hw.id)} style={{ background: "none", border: "none", color: t.danger, cursor: "pointer", fontSize: 18, marginLeft: 12 }}>🗑</button>
              </div>
            </div>
          );
        })}
      </div>
      {modal && (
        <Modal title="Assign Homework / Task" onClose={() => { setModal(false); setAttachFile(null); }} t={t}>
          <Select label="Classroom" value={form.classroomId} onChange={v => setForm(p => ({ ...p, classroomId: v }))} options={data.classrooms.map(c => ({ value: c.id, label: c.name }))} t={t} />
          <Select label="Type" value={form.type} onChange={v => setForm(p => ({ ...p, type: v }))} options={["Practice Work","Test Prep","Assignment","Project"].map(x => ({ value: x, label: x }))} t={t} />
          <Inp label="Title" value={form.title} onChange={v => setForm(p => ({ ...p, title: v }))} placeholder="e.g. Chapter 3 – Quadratic Equations" t={t} />
          <TextArea label="Description / Instructions" value={form.desc} onChange={v => setForm(p => ({ ...p, desc: v }))} placeholder="Detailed instructions for students..." t={t} />
          <Inp label="Due Date" value={form.due} onChange={v => setForm(p => ({ ...p, due: v }))} type="date" t={t} />
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: t.sub, marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.5 }}>📎 Attach File for Students (PDF / Image)</div>
            <label style={{ display: "block", padding: "12px 14px", border: `2px dashed ${attachFile ? t.success : t.inpBorder}`, borderRadius: 10, cursor: "pointer", background: attachFile ? t.success + "10" : t.sec, textAlign: "center" }}>
              <input type="file" accept=".pdf,image/*" onChange={handleFileAttach} style={{ display: "none" }} />
              {attachFile ? (
                <span style={{ fontSize: 13, fontWeight: 700, color: t.success }}>✅ {attachFile.name}</span>
              ) : (
                <span style={{ fontSize: 13, color: t.sub }}>Click to attach a PDF or image (max 5 MB)</span>
              )}
            </label>
            {attachFile && <button onClick={() => setAttachFile(null)} style={{ marginTop: 6, background: "none", border: "none", color: t.danger, cursor: "pointer", fontSize: 12 }}>✕ Remove attachment</button>}
          </div>
          <Btn label="Assign to Class" onClick={create} t={t} />
        </Modal>
      )}
    </div>
  );
}

function SubmissionsView({ data, setData, t, notify }) {
  const [selHW, setSelHW] = useState("all");
  const [gradeModal, setGradeModal] = useState(null);
  const [fb, setFb] = useState(""); const [grade, setGrade] = useState("");

  const filtered = selHW === "all" ? data.submissions : data.submissions.filter(s => s.hwId === parseInt(selHW));

  const saveGrade = () => {
    setData(p => ({ ...p, submissions: p.submissions.map(s => s.id === gradeModal.id ? { ...s, grade, fb } : s) }));
    setGradeModal(null); notify("Graded & feedback sent!", "success");
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <SectionHeader title="Student Submissions" sub="Review and grade uploaded work" t={t} />
        <select value={selHW} onChange={e => setSelHW(e.target.value)} style={{ padding: "9px 14px", borderRadius: 10, border: `1.5px solid ${t.inpBorder}`, background: t.inp, color: t.text, fontFamily: "'Nunito',sans-serif", fontSize: 13 }}>
          <option value="all">All Homework</option>
          {data.homework.map(h => <option key={h.id} value={h.id}>{h.title}</option>)}
        </select>
      </div>
      {filtered.length === 0 && <EmptyState icon="📤" title="No submissions yet" sub="Students will upload their work here before class" t={t} />}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map(sub => {
          const student = data.students.find(s => s.id === sub.studentId);
          const hw = data.homework.find(h => h.id === sub.hwId);
          const cls = data.classrooms.find(c => c.id === hw?.classroomId);
          return (
            <div key={sub.id} style={{ background: t.card, borderRadius: 14, padding: "14px 18px", boxShadow: t.shadow, display: "flex", alignItems: "center", gap: 14 }}>
              <Avatar name={student?.name || "?"} size={40} color={BOARD_COLOR[cls?.board] || "#1a2744"} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: t.text, fontSize: 14 }}>{student?.name}</div>
                <div style={{ fontSize: 12, color: t.sub }}>{hw?.title}</div>
                <div style={{ fontSize: 11, color: t.sub, marginTop: 4 }}>📁 {sub.file} · Submitted {sub.at}</div>
                {sub.fileData && (
                  <a href={sub.fileData} download={sub.file} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: t.info, fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                    👁 View / Download File
                  </a>
                )}
                {sub.fb && <div style={{ fontSize: 11, color: t.info, marginTop: 4 }}>💬 {sub.fb}</div>}
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {sub.grade ? <Tag label={`Grade: ${sub.grade}`} color={t.success} /> : <Tag label="Pending Review" color={t.warn} />}
                <Btn label={sub.grade ? "✏️ Edit" : "Grade"} onClick={() => { setGradeModal(sub); setGrade(sub.grade || ""); setFb(sub.fb || ""); }} variant="outline" small t={t} />
              </div>
            </div>
          );
        })}
      </div>
      {gradeModal && (
        <Modal title="Grade Submission" onClose={() => setGradeModal(null)} t={t}>
          <div style={{ marginBottom: 16, padding: "10px 14px", background: t.sec, borderRadius: 10 }}>
            <div style={{ fontWeight: 700, color: t.text }}>{data.students.find(s => s.id === gradeModal.studentId)?.name}</div>
            <div style={{ fontSize: 12, color: t.sub }}>{data.homework.find(h => h.id === gradeModal.hwId)?.title}</div>
            <div style={{ fontSize: 11, color: t.sub, marginTop: 4 }}>📁 {gradeModal.file}</div>
            {gradeModal.fileData && (
              <a href={gradeModal.fileData} download={gradeModal.file} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: t.info, fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, marginTop: 6 }}>
                👁 View / Download Submitted File
              </a>
            )}
          </div>
          <Select label="Grade" value={grade} onChange={setGrade} options={["A+","A","B+","B","C+","C","D","F"].map(g => ({ value: g, label: g }))} t={t} />
          <TextArea label="Feedback for Student" value={fb} onChange={setFb} placeholder="Well done! Keep practicing..." rows={3} t={t} />
          <Btn label="Save Grade & Feedback" onClick={saveGrade} t={t} />
        </Modal>
      )}
    </div>
  );
}

function BroadcastView({ data, setData, t, notify }) {
  const [msg, setMsg] = useState(""); const [selClass, setSelClass] = useState("all");

  const send = () => {
    if (!msg.trim()) return notify("Write a message first", "error");
    const b = { id: Date.now(), text: msg, ts: new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }), classroomId: selClass === "all" ? null : parseInt(selClass) };
    setData(p => ({ ...p, broadcasts: [b, ...p.broadcasts] }));
    setMsg(""); notify("📢 Message sent!", "success");
  };

  return (
    <div>
      <SectionHeader title="Broadcast & Classroom Messages" sub="Send messages to all students or specific classrooms" t={t} />
      {/* Composer */}
      <div style={{ background: t.card, borderRadius: 16, padding: 20, boxShadow: t.shadow, marginBottom: 20 }}>
        <Select label="Send To" value={selClass} onChange={setSelClass} options={[{ value: "all", label: "📢 All Students & Parents" }, ...data.classrooms.map(c => ({ value: c.id, label: `🏫 ${c.name}` }))]} t={t} />
        <TextArea label="Message" value={msg} onChange={setMsg} placeholder="Type your announcement or message here..." rows={4} t={t} />
        <Btn label="📤 Send Message" onClick={send} variant="accent" t={t} />
      </div>
      {/* History */}
      <div style={{ fontWeight: 800, color: t.text, marginBottom: 12 }}>📬 Sent Messages</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {data.broadcasts.map(b => {
          const cls = b.classroomId ? data.classrooms.find(c => c.id === b.classroomId) : null;
          return (
            <div key={b.id} style={{ background: t.card, borderRadius: 14, padding: "14px 18px", boxShadow: t.shadow, borderLeft: `3px solid ${b.classroomId ? BOARD_COLOR[cls?.board] || t.info : t.accent}` }}>
              <div style={{ fontSize: 14, color: t.text, lineHeight: 1.6, marginBottom: 6 }}>{b.text}</div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: 11, color: t.sub }}>{b.ts}</span>
                <Tag label={b.classroomId ? `${cls?.name}` : "All Students & Parents"} color={b.classroomId ? BOARD_COLOR[cls?.board] || t.info : t.accent} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MarksView({ data, setData, t, notify }) {
  const [selClass, setSelClass] = useState(data.classrooms[0]?.id || null);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ studentId: "", test: "", date: today(), max: "20", score: "" });

  const classMarks = data.marks.filter(m => m.classroomId === selClass);
  const students = data.students.filter(s => s.classroomId === selClass);
  const tests = [...new Set(classMarks.map(m => m.test))];

  const save = () => {
    if (!form.studentId || !form.test || !form.score) return notify("Fill all fields", "error");
    const m = { id: Date.now(), classroomId: selClass, studentId: parseInt(form.studentId), test: form.test, date: form.date, max: parseInt(form.max), score: parseInt(form.score) };
    setData(p => ({ ...p, marks: [...p.marks, m] }));
    setModal(false); notify("Marks saved!", "success");
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <SectionHeader title="Marks & Test Results" sub="Enter and manage weekly test scores" t={t} />
        <div style={{ display: "flex", gap: 10 }}>
          <select value={selClass} onChange={e => setSelClass(parseInt(e.target.value))} style={{ padding: "9px 14px", borderRadius: 10, border: `1.5px solid ${t.inpBorder}`, background: t.inp, color: t.text, fontFamily: "'Nunito',sans-serif", fontSize: 13 }}>
            {data.classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <Btn label="+ Add Marks" onClick={() => setModal(true)} t={t} />
        </div>
      </div>
      {/* Student marks table */}
      <div style={{ background: t.card, borderRadius: 16, boxShadow: t.shadow, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: t.sec }}>
                <th style={{ padding: "12px 16px", textAlign: "left", color: t.sub, fontWeight: 700, whiteSpace: "nowrap" }}>Student</th>
                {tests.map(test => <th key={test} style={{ padding: "12px 12px", textAlign: "center", color: t.sub, fontWeight: 700, whiteSpace: "nowrap", maxWidth: 120 }}>{test}</th>)}
                <th style={{ padding: "12px 12px", textAlign: "center", color: t.sub, fontWeight: 700 }}>Avg %</th>
              </tr>
            </thead>
            <tbody>
              {students.map((stu, i) => {
                const stuMarks = classMarks.filter(m => m.studentId === stu.id);
                const avgPct = stuMarks.length ? Math.round(stuMarks.reduce((acc, m) => acc + pct(m.score, m.max), 0) / stuMarks.length) : null;
                return (
                  <tr key={stu.id} style={{ borderTop: `1px solid ${t.border}`, background: i % 2 === 0 ? "transparent" : t.sec + "60" }}>
                    <td style={{ padding: "12px 16px", fontWeight: 600, color: t.text }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Avatar name={stu.name} size={28} color={BOARD_COLOR[data.classrooms.find(c => c.id === selClass)?.board] || "#1a2744"} />
                        <div>
                          <div style={{ fontSize: 13 }}>{stu.name}</div>
                          <div style={{ fontSize: 10, color: t.sub }}>{stu.rollNo}</div>
                        </div>
                      </div>
                    </td>
                    {tests.map(test => {
                      const m = stuMarks.find(mk => mk.test === test);
                      return (
                        <td key={test} style={{ padding: "12px 12px", textAlign: "center" }}>
                          {m ? (
                            <span style={{ fontWeight: 700, color: gradeColor(pct(m.score, m.max), t) }}>
                              {m.score}/{m.max} <span style={{ fontSize: 10, color: t.sub }}>({pct(m.score, m.max)}%)</span>
                            </span>
                          ) : <span style={{ color: t.sub }}>—</span>}
                        </td>
                      );
                    })}
                    <td style={{ padding: "12px 12px", textAlign: "center" }}>
                      {avgPct !== null ? <span style={{ fontWeight: 800, color: gradeColor(avgPct, t) }}>{avgPct}%</span> : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {students.length === 0 && <EmptyState icon="📊" title="No students in this class" sub="Add students first from the Classrooms view" t={t} />}
      </div>
      {modal && (
        <Modal title="Add Test Marks" onClose={() => setModal(false)} t={t}>
          <Select label="Student" value={form.studentId} onChange={v => setForm(p => ({ ...p, studentId: v }))} options={[{ value: "", label: "Select student..." }, ...students.map(s => ({ value: s.id, label: s.name }))]} t={t} />
          <Inp label="Test Name" value={form.test} onChange={v => setForm(p => ({ ...p, test: v }))} placeholder="e.g. WT3 – Circles" t={t} />
          <Inp label="Test Date" value={form.date} onChange={v => setForm(p => ({ ...p, date: v }))} type="date" t={t} />
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}><Inp label="Max Marks" value={form.max} onChange={v => setForm(p => ({ ...p, max: v }))} type="number" t={t} /></div>
            <div style={{ flex: 1 }}><Inp label="Score Obtained" value={form.score} onChange={v => setForm(p => ({ ...p, score: v }))} type="number" t={t} /></div>
          </div>
          <Btn label="Save Marks" onClick={save} t={t} />
        </Modal>
      )}
    </div>
  );
}

function AnnouncementsView({ data, setData, t, notify }) {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", pinned: false });

  const save = () => {
    if (!form.title) return notify("Title required", "error");
    const a = { ...form, id: Date.now(), date: today() };
    setData(p => ({ ...p, announcements: [a, ...p.announcements] }));
    setModal(false); setForm({ title: "", body: "", pinned: false });
    notify("Announcement posted!", "success");
  };

  const del = (id) => setData(p => ({ ...p, announcements: p.announcements.filter(a => a.id !== id) }));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <SectionHeader title="Announcements" sub="Post notices for all students and parents" t={t} />
        <Btn label="+ New Announcement" onClick={() => setModal(true)} t={t} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {data.announcements.map(a => (
          <div key={a.id} style={{ background: t.card, borderRadius: 14, padding: "16px 20px", boxShadow: t.shadow, borderLeft: `3px solid ${a.pinned ? t.accent : t.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                  {a.pinned && <Tag label="📌 Pinned" color={t.accent} />}
                  <span style={{ fontSize: 11, color: t.sub }}>{fmtDate(a.date)}</span>
                </div>
                <div style={{ fontWeight: 800, color: t.text, fontSize: 15, marginBottom: 4 }}>{a.title}</div>
                <div style={{ fontSize: 13, color: t.sub, lineHeight: 1.6 }}>{a.body}</div>
              </div>
              <button onClick={() => del(a.id)} style={{ background: "none", border: "none", color: t.danger, cursor: "pointer", fontSize: 18, marginLeft: 12 }}>🗑</button>
            </div>
          </div>
        ))}
      </div>
      {modal && (
        <Modal title="New Announcement" onClose={() => setModal(false)} t={t}>
          <Inp label="Title" value={form.title} onChange={v => setForm(p => ({ ...p, title: v }))} placeholder="e.g. Holiday Notice" t={t} />
          <TextArea label="Message" value={form.body} onChange={v => setForm(p => ({ ...p, body: v }))} placeholder="Detailed message here..." rows={4} t={t} />
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginBottom: 16, color: t.text, fontSize: 14 }}>
            <input type="checkbox" checked={form.pinned} onChange={e => setForm(p => ({ ...p, pinned: e.target.checked }))} />
            📌 Pin this announcement
          </label>
          <Btn label="Post Announcement" onClick={save} t={t} />
        </Modal>
      )}
    </div>
  );
}

function AdminSettings({ data, setData, t, notify, dark, setDark }) {
  const [newPw, setNewPw] = useState(""); const [confirmPw, setConfirmPw] = useState("");
  const [clearConfirm, setClearConfirm] = useState(false);

  const changePw = () => {
    if (newPw.length < 6) return notify("Password must be at least 6 characters", "error");
    if (newPw !== confirmPw) return notify("Passwords do not match", "error");
    notify("Password updated! (Demo only – use Supabase Auth in production)", "success");
    setNewPw(""); setConfirmPw("");
  };

  const clearAllFiles = () => {
    // Remove all fileData from submissions and all attachments from homework to free storage
    setData(p => ({
      ...p,
      submissions: p.submissions.map(s => ({ ...s, fileData: null })),
      homework: p.homework.map(h => ({ ...h, attachment: null })),
    }));
    setClearConfirm(false);
    notify("🗑 All uploaded files cleared successfully!", "success");
  };

  const totalSubmissions = data.submissions.length;
  const filesWithData = data.submissions.filter(s => s.fileData).length;
  const hwWithAttachments = data.homework.filter(h => h.attachment).length;
  return (
    <div>
      <SectionHeader title="Settings" sub="Manage app preferences and admin credentials" t={t} />
      <div style={{ display: "grid", gap: 16 }}>
        <div style={{ background: t.card, borderRadius: 16, padding: 20, boxShadow: t.shadow }}>
          <div style={{ fontWeight: 800, color: t.text, marginBottom: 16 }}>🎨 Appearance</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div><div style={{ fontWeight: 600, color: t.text }}>Dark Mode</div><div style={{ fontSize: 12, color: t.sub }}>Switch between light and dark themes</div></div>
            <button onClick={() => setDark(!dark)} style={{ width: 52, height: 28, borderRadius: 14, background: dark ? t.accent : t.border, border: "none", cursor: "pointer", position: "relative", transition: "background 0.3s" }}>
              <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: dark ? 26 : 3, transition: "left 0.3s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
            </button>
          </div>
        </div>
        <div style={{ background: t.card, borderRadius: 16, padding: 20, boxShadow: t.shadow }}>
          <div style={{ fontWeight: 800, color: t.text, marginBottom: 16 }}>🔐 Change Admin Password</div>
          <Inp label="New Password" value={newPw} onChange={setNewPw} type="password" placeholder="••••••••" t={t} />
          <Inp label="Confirm Password" value={confirmPw} onChange={setConfirmPw} type="password" placeholder="••••••••" t={t} />
          <Btn label="Update Password" onClick={changePw} t={t} />
        </div>
        <div style={{ background: t.card, borderRadius: 16, padding: 20, boxShadow: t.shadow }}>
          <div style={{ fontWeight: 800, color: t.text, marginBottom: 12 }}>🛠 Tech Stack (Free Services)</div>
          {[
            { label: "Database & Auth", value: "Supabase (PostgreSQL + Row Level Security)", link: "supabase.com" },
            { label: "File Storage", value: "Supabase Storage (1GB free)", link: "supabase.com" },
            { label: "Real-time Messaging", value: "Supabase Realtime", link: "supabase.com" },
            { label: "Frontend Hosting", value: "Vercel (free tier – unlimited bandwidth)", link: "vercel.com" },
            { label: "Push Notifications", value: "OneSignal (free tier)", link: "onesignal.com" },
            { label: "Image CDN", value: "Cloudinary (free tier – 25GB)", link: "cloudinary.com" },
          ].map(item => (
            <div key={item.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 13 }}>
              <span style={{ color: t.sub }}>{item.label}</span>
              <span style={{ fontWeight: 600, color: t.text }}>{item.value}</span>
            </div>
          ))}
        </div>
        <div style={{ background: t.card, borderRadius: 16, padding: 20, boxShadow: t.shadow }}>
          <div style={{ fontWeight: 800, color: t.text, marginBottom: 4 }}>📞 Contact</div>
          <div style={{ color: t.sub, fontSize: 13 }}>Sir Ajit Pillai · Plot No: 1065/1, Sector 3D, Gandhinagar – 382006</div>
          <div style={{ color: t.sub, fontSize: 13, marginTop: 4 }}>📞 98258 38108 · ajitpillai007@yahoo.co.in</div>
        </div>

        {/* Storage Management */}
        <div style={{ background: t.card, borderRadius: 16, padding: 20, boxShadow: t.shadow, border: `1.5px solid ${t.danger}30` }}>
          <div style={{ fontWeight: 800, color: t.text, marginBottom: 4 }}>🗂 Storage Management</div>
          <div style={{ fontSize: 13, color: t.sub, marginBottom: 14 }}>
            Free up device/browser storage by clearing uploaded files. Submission records and grades are kept — only the file data is removed.
          </div>
          <div style={{ display: "flex", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
            <div style={{ background: t.sec, borderRadius: 10, padding: "10px 16px", textAlign: "center" }}>
              <div style={{ fontWeight: 800, color: t.text, fontSize: 18 }}>{filesWithData}</div>
              <div style={{ fontSize: 11, color: t.sub }}>Student files stored</div>
            </div>
            <div style={{ background: t.sec, borderRadius: 10, padding: "10px 16px", textAlign: "center" }}>
              <div style={{ fontWeight: 800, color: t.text, fontSize: 18 }}>{hwWithAttachments}</div>
              <div style={{ fontSize: 11, color: t.sub }}>Homework attachments</div>
            </div>
            <div style={{ background: t.sec, borderRadius: 10, padding: "10px 16px", textAlign: "center" }}>
              <div style={{ fontWeight: 800, color: t.text, fontSize: 18 }}>{totalSubmissions}</div>
              <div style={{ fontSize: 11, color: t.sub }}>Total submissions</div>
            </div>
          </div>
          {!clearConfirm ? (
            <Btn label="🗑 Clear All Uploaded Files" onClick={() => setClearConfirm(true)} variant="danger" t={t} />
          ) : (
            <div style={{ background: t.danger + "12", border: `1.5px solid ${t.danger}50`, borderRadius: 12, padding: "16px 18px" }}>
              <div style={{ fontWeight: 700, color: t.danger, marginBottom: 8 }}>⚠️ Are you sure?</div>
              <div style={{ fontSize: 13, color: t.text, marginBottom: 14 }}>
                This will permanently delete <b>{filesWithData + hwWithAttachments} file(s)</b> stored in the browser. Submission records, grades, and feedback will not be affected. This cannot be undone.
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <Btn label="Yes, Delete All Files" onClick={clearAllFiles} variant="danger" t={t} />
                <Btn label="Cancel" onClick={() => setClearConfirm(false)} variant="outline" t={t} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
//  ADMIN DASHBOARD
// ─────────────────────────────────────────
function AdminDashboard({ user, data, setData, t, dark, setDark, logout, notify }) {
  const [view, setView] = useState("home");
  const views = { home: <AdminHome data={data} t={t} />, classrooms: <ClassroomsView data={data} setData={setData} t={t} notify={notify} />, students: <StudentsOverview data={data} setData={setData} t={t} notify={notify} />, attendance: <AttendanceView data={data} setData={setData} t={t} notify={notify} />, homework: <HomeworkView data={data} setData={setData} t={t} notify={notify} />, submissions: <SubmissionsView data={data} setData={setData} t={t} notify={notify} />, broadcast: <BroadcastView data={data} setData={setData} t={t} notify={notify} />, marks: <MarksView data={data} setData={setData} t={t} notify={notify} />, announcements: <AnnouncementsView data={data} setData={setData} t={t} notify={notify} />, settings: <AdminSettings data={data} setData={setData} t={t} notify={notify} dark={dark} setDark={setDark} /> };
  return (
    <DashboardShell user={user} t={t} dark={dark} setDark={setDark} logout={logout} view={view} setView={setView} navItems={NAV_ADMIN} data={data}>
      {views[view] || views.home}
    </DashboardShell>
  );
}

function StudentsOverview({ data, setData, t, notify }) {
  const [search, setSearch] = useState(""); const [selClass, setSelClass] = useState("all");
  const filtered = data.students.filter(s =>
    (selClass === "all" || s.classroomId === parseInt(selClass)) &&
    s.name.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div>
      <SectionHeader title="All Students" sub={`${data.students.length} students enrolled`} t={t} />
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search student..." style={{ flex: 1, padding: "9px 14px", borderRadius: 10, border: `1.5px solid ${t.inpBorder}`, background: t.inp, color: t.text, fontFamily: "'Nunito',sans-serif", fontSize: 13, outline: "none" }} />
        <select value={selClass} onChange={e => setSelClass(e.target.value)} style={{ padding: "9px 14px", borderRadius: 10, border: `1.5px solid ${t.inpBorder}`, background: t.inp, color: t.text, fontFamily: "'Nunito',sans-serif", fontSize: 13 }}>
          <option value="all">All Classes</option>
          {data.classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
        {filtered.map(s => {
          const cls = data.classrooms.find(c => c.id === s.classroomId);
          const parent = data.parents.find(p => p.id === s.parentId);
          const stuMarks = data.marks.filter(m => m.studentId === s.id);
          const avg = stuMarks.length ? Math.round(stuMarks.reduce((a, m) => a + pct(m.score, m.max), 0) / stuMarks.length) : null;
          const attRecs = data.attendance.filter(a => a.classroomId === s.classroomId).flatMap(a => a.records).filter(r => r.studentId === s.id);
          const attPct = attRecs.length ? Math.round((attRecs.filter(r => r.status !== "absent").length / attRecs.length) * 100) : null;
          return (
            <div key={s.id} className="hover-lift" style={{ background: t.card, borderRadius: 16, padding: 16, boxShadow: t.shadow }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
                <Avatar name={s.name} size={42} color={BOARD_COLOR[cls?.board] || "#1a2744"} />
                <div>
                  <div style={{ fontWeight: 800, color: t.text, fontSize: 14 }}>{s.name}</div>
                  <div style={{ fontSize: 11, color: t.sub }}>{cls?.name} · {s.rollNo}</div>
                  {!s.pinSet && <Tag label="PIN not set" color={t.warn} />}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                {avg !== null && <div style={{ flex: 1, background: t.sec, borderRadius: 8, padding: "6px 10px", textAlign: "center" }}><div style={{ fontSize: 16, fontWeight: 800, color: gradeColor(avg, t) }}>{avg}%</div><div style={{ fontSize: 10, color: t.sub }}>Avg Score</div></div>}
                {attPct !== null && <div style={{ flex: 1, background: t.sec, borderRadius: 8, padding: "6px 10px", textAlign: "center" }}><div style={{ fontSize: 16, fontWeight: 800, color: gradeColor(attPct, t) }}>{attPct}%</div><div style={{ fontSize: 10, color: t.sub }}>Attendance</div></div>}
              </div>
              {parent && <div style={{ fontSize: 11, color: t.sub }}>👨‍👩‍👦 {parent.name} · {parent.phone}</div>}
            </div>
          );
        })}
        {filtered.length === 0 && <div style={{ gridColumn: "1/-1" }}><EmptyState icon="👥" title="No students found" sub="Try changing search or class filter" t={t} /></div>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
//  STUDENT DASHBOARD
// ─────────────────────────────────────────
function StudentHome({ user, data, t }) {
  const cls = data.classrooms.find(c => c.id === user.classroomId);
  const myHW = data.homework.filter(h => h.classroomId === user.classroomId);
  const pending = myHW.filter(h => !data.submissions.find(s => s.hwId === h.id && s.studentId === user.id));
  const attRecs = data.attendance.filter(a => a.classroomId === user.classroomId).flatMap(a => a.records).filter(r => r.studentId === user.id);
  const attPct = attRecs.length ? Math.round((attRecs.filter(r => r.status !== "absent").length / attRecs.length) * 100) : 100;
  const myMarks = data.marks.filter(m => m.studentId === user.id && m.classroomId === user.classroomId);
  const avgScore = myMarks.length ? Math.round(myMarks.reduce((a, m) => a + pct(m.score, m.max), 0) / myMarks.length) : null;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 800, color: t.text }}>Welcome back, {user.name.split(" ")[0]}! 👋</h1>
        <p style={{ color: t.sub, marginTop: 4 }}>{cls?.name} · {cls?.schedule}</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 24 }}>
        <StatCard label="Pending Tasks" value={pending.length} icon="📋" color={pending.length > 0 ? "#dc2626" : "#059669"} t={t} />
        <StatCard label="Attendance" value={`${attPct}%`} icon="📅" color={attPct > 80 ? "#059669" : "#d97706"} t={t} />
        {avgScore !== null && <StatCard label="Avg Score" value={`${avgScore}%`} icon="📊" color={gradeColor(avgScore, t)} t={t} />}
        <StatCard label="Total Tests" value={myMarks.length} icon="✍️" color="#7c3aed" t={t} />
      </div>
      {/* Pending homework */}
      {pending.length > 0 && (
        <div style={{ background: `${t.danger}12`, border: `1.5px solid ${t.danger}40`, borderRadius: 16, padding: 20, marginBottom: 16 }}>
          <div style={{ fontWeight: 800, color: t.danger, marginBottom: 12 }}>⚠️ Pending – Submit Before Class!</div>
          {pending.map(hw => (
            <div key={hw.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div>
                <div style={{ fontWeight: 700, color: t.text, fontSize: 13 }}>{hw.title}</div>
                <div style={{ fontSize: 11, color: t.sub }}>Due: {fmtDate(hw.due)}</div>
              </div>
              <Tag label={hw.type} color={t.warn} />
            </div>
          ))}
        </div>
      )}
      {/* Broadcasts */}
      <div style={{ background: t.card, borderRadius: 16, padding: 20, boxShadow: t.shadow }}>
        <div style={{ fontWeight: 800, color: t.text, marginBottom: 12 }}>📢 Latest Messages from Sir</div>
        {data.broadcasts.filter(b => !b.classroomId || b.classroomId === user.classroomId).slice(0, 3).map(b => (
          <div key={b.id} style={{ marginBottom: 10, padding: "10px 14px", background: t.sec, borderRadius: 10 }}>
            <div style={{ fontSize: 13, color: t.text, lineHeight: 1.5 }}>{b.text}</div>
            <div style={{ fontSize: 11, color: t.sub, marginTop: 4 }}>{b.ts}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StudentTasks({ user, data, t }) {
  const myHW = data.homework.filter(h => h.classroomId === user.classroomId);
  const typeColor = (type) => type === "Test Prep" ? t.danger : type === "Assignment" ? t.info : t.warn;
  return (
    <div>
      <SectionHeader title="My Tasks & Homework" sub="All practice work assigned by Sir" t={t} />
      {myHW.length === 0 && <EmptyState icon="📚" title="No tasks assigned yet" sub="Sir will assign homework here" t={t} />}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {myHW.map(hw => {
          const sub = data.submissions.find(s => s.hwId === hw.id && s.studentId === user.id);
          const overdue = hw.due < today() && !sub;
          return (
            <div key={hw.id} style={{ background: t.card, borderRadius: 14, padding: "16px 20px", boxShadow: t.shadow, borderLeft: `3px solid ${sub ? t.success : overdue ? t.danger : t.warn}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                    <Tag label={hw.type} color={typeColor(hw.type)} />
                    {sub && <Tag label={sub.grade ? `Graded: ${sub.grade}` : "✅ Submitted"} color={t.success} />}
                    {overdue && <Tag label="Overdue!" color={t.danger} />}
                  </div>
                  <div style={{ fontWeight: 800, color: t.text, fontSize: 15, marginBottom: 4 }}>{hw.title}</div>
                  <div style={{ fontSize: 12, color: t.sub, marginBottom: 6, lineHeight: 1.5 }}>{hw.desc}</div>
                  <div style={{ fontSize: 12, color: t.sub }}>📅 Due: <b style={{ color: overdue ? t.danger : t.text }}>{fmtDate(hw.due)}</b></div>
                  {hw.attachment && (
                    <div style={{ marginTop: 8 }}>
                      <a href={hw.attachment.data} download={hw.attachment.name} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: t.info, fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, padding: "5px 10px", background: t.info + "15", borderRadius: 8 }}>
                        📎 Sir's File: {hw.attachment.name}
                      </a>
                    </div>
                  )}
                  {sub?.fb && <div style={{ marginTop: 8, padding: "8px 12px", background: `${t.success}15`, borderRadius: 8, fontSize: 12, color: t.text }}>💬 Sir's Feedback: {sub.fb}</div>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StudentSubmit({ user, data, setData, t, notify }) {
  const [uploadStates, setUploadStates] = useState({});
  const pending = data.homework.filter(h => h.classroomId === user.classroomId && !data.submissions.find(s => s.hwId === h.id && s.studentId === user.id));
  const submitted = data.submissions.filter(s => s.studentId === user.id);

  const handleFile = (hwId, e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return notify("File too large – max 5MB", "error");
    const reader = new FileReader();
    reader.onload = (ev) => setUploadStates(prev => ({ ...prev, [hwId]: { name: file.name, data: ev.target.result, type: file.type } }));
    reader.readAsDataURL(file);
  };

  const submitWork = (hwId) => {
    const upload = uploadStates[hwId];
    if (!upload) return notify("Please select a file first", "error");
    const sub = { id: Date.now(), hwId, studentId: user.id, at: new Date().toLocaleString("en-IN"), file: upload.name, fileData: upload.data, grade: null, fb: "" };
    setData(p => ({ ...p, submissions: [...p.submissions, sub] }));
    setUploadStates(prev => { const n = { ...prev }; delete n[hwId]; return n; });
    notify("✅ Work submitted successfully!", "success");
  };

  const typeColor = (type) => type === "Test Prep" ? t.danger : type === "Assignment" ? t.info : t.warn;

  return (
    <div>
      <SectionHeader title="Submit Your Work" sub="Upload completed homework before coming to class" t={t} />
      <div style={{ background: `${t.info}12`, border: `1.5px solid ${t.info}40`, borderRadius: 14, padding: "14px 18px", marginBottom: 20, fontSize: 13, color: t.text }}>
        📌 <b>Sir's Rule:</b> All practice work MUST be submitted before entering the classroom. Blank submission = not allowed inside!
      </div>

      {pending.length === 0 ? (
        <div style={{ background: t.card, borderRadius: 16, padding: 24, textAlign: "center", boxShadow: t.shadow, marginBottom: 20 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🎉</div>
          <div style={{ fontWeight: 700, color: t.text }}>All caught up!</div>
          <div style={{ color: t.sub, fontSize: 13 }}>No pending submissions. Great work!</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 }}>
          <div style={{ fontWeight: 800, color: t.text, fontSize: 16 }}>⏳ Pending Submissions</div>
          {pending.map(hw => {
            const upload = uploadStates[hw.id];
            const overdue = hw.due < today();
            return (
              <div key={hw.id} style={{ background: t.card, borderRadius: 14, padding: "18px 20px", boxShadow: t.shadow, border: `1.5px solid ${overdue ? t.danger + "60" : t.border}` }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                  <Tag label={hw.type} color={typeColor(hw.type)} />
                  {overdue && <Tag label="Overdue!" color={t.danger} />}
                </div>
                <div style={{ fontWeight: 800, color: t.text, fontSize: 15, marginBottom: 4 }}>{hw.title}</div>
                <div style={{ fontSize: 12, color: t.sub, marginBottom: 8, lineHeight: 1.5 }}>{hw.desc}</div>
                <div style={{ fontSize: 12, color: t.sub, marginBottom: 10 }}>📅 Due: <b style={{ color: overdue ? t.danger : t.text }}>{fmtDate(hw.due)}</b></div>
                {hw.attachment && (
                  <a href={hw.attachment.data} download={hw.attachment.name} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: t.info, fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, padding: "5px 10px", background: t.info + "15", borderRadius: 8, marginBottom: 12 }}>
                    📎 Sir's File: {hw.attachment.name}
                  </a>
                )}
                <div style={{ borderTop: `1px solid ${t.border}`, paddingTop: 12, marginTop: hw.attachment ? 8 : 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: t.sub, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>📤 Upload Your Work (PDF or Image)</div>
                  <label style={{ display: "block", padding: "12px 14px", border: `2px dashed ${upload ? t.success : t.inpBorder}`, borderRadius: 10, cursor: "pointer", background: upload ? t.success + "10" : t.sec, textAlign: "center", marginBottom: 10 }}>
                    <input type="file" accept=".pdf,image/*" onChange={e => handleFile(hw.id, e)} style={{ display: "none" }} />
                    {upload ? (
                      <span style={{ fontSize: 13, fontWeight: 700, color: t.success }}>✅ {upload.name}</span>
                    ) : (
                      <span style={{ fontSize: 13, color: t.sub }}>Tap to select PDF or photo of your work (max 5 MB)</span>
                    )}
                  </label>
                  <Btn label="📤 Submit to Sir" onClick={() => submitWork(hw.id)} variant="accent" t={t} disabled={!upload} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Submitted */}
      <div>
        <div style={{ fontWeight: 800, color: t.text, marginBottom: 12 }}>✅ My Submissions</div>
        {submitted.length === 0 && <EmptyState icon="📁" title="No submissions yet" sub="Submit your homework above" t={t} />}
        {submitted.map(sub => {
          const hw = data.homework.find(h => h.id === sub.hwId);
          return (
            <div key={sub.id} style={{ background: t.card, borderRadius: 12, padding: "12px 16px", boxShadow: t.shadow, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 700, color: t.text, fontSize: 13 }}>{hw?.title}</div>
                <div style={{ fontSize: 11, color: t.sub }}>📁 {sub.file} · {sub.at}</div>
                {sub.fileData && (
                  <a href={sub.fileData} download={sub.file} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: t.info, fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, marginTop: 3 }}>
                    👁 View File
                  </a>
                )}
                {sub.fb && <div style={{ fontSize: 11, color: t.success, marginTop: 4 }}>💬 {sub.fb}</div>}
              </div>
              <Tag label={sub.grade ? `Grade: ${sub.grade}` : "Under Review"} color={sub.grade ? t.success : t.warn} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StudentAttendance({ user, data, t }) {
  const records = data.attendance.filter(a => a.classroomId === user.classroomId).sort((a, b) => b.date.localeCompare(a.date));
  const myRecs = records.flatMap(a => a.records.filter(r => r.studentId === user.id).map(r => ({ date: a.date, ...r })));
  const pres = myRecs.filter(r => r.status === "present").length;
  const late = myRecs.filter(r => r.status === "late").length;
  const abs = myRecs.filter(r => r.status === "absent").length;
  const attPct = myRecs.length ? Math.round(((pres + late) / myRecs.length) * 100) : 100;
  return (
    <div>
      <SectionHeader title="My Attendance" sub="Track your attendance record" t={t} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
        <div style={{ background: `${t.success}18`, borderRadius: 14, padding: 16, textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: t.success }}>{pres}</div>
          <div style={{ fontSize: 12, color: t.sub }}>Present</div>
        </div>
        <div style={{ background: `${t.warn}18`, borderRadius: 14, padding: 16, textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: t.warn }}>{late}</div>
          <div style={{ fontSize: 12, color: t.sub }}>Late</div>
        </div>
        <div style={{ background: `${t.danger}18`, borderRadius: 14, padding: 16, textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: t.danger }}>{abs}</div>
          <div style={{ fontSize: 12, color: t.sub }}>Absent</div>
        </div>
      </div>
      <div style={{ background: t.card, borderRadius: 16, padding: 20, boxShadow: t.shadow, marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontWeight: 700, color: t.text }}>Overall Attendance</span>
          <span style={{ fontWeight: 800, fontSize: 20, color: gradeColor(attPct, t) }}>{attPct}%</span>
        </div>
        <ProgressBar value={pres + late} max={myRecs.length || 1} color={gradeColor(attPct, t)} />
        {attPct < 75 && <div style={{ marginTop: 10, color: t.danger, fontSize: 12, fontWeight: 600 }}>⚠️ Low attendance! Please attend all classes regularly.</div>}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {myRecs.map(r => (
          <div key={r.date} style={{ background: t.card, borderRadius: 10, padding: "10px 14px", boxShadow: t.shadow, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: t.text, fontSize: 13, fontWeight: 600 }}>{fmtDate(r.date)}</span>
            <Tag label={r.status.charAt(0).toUpperCase() + r.status.slice(1)} color={statusColor(r.status, t)} />
          </div>
        ))}
        {myRecs.length === 0 && <EmptyState icon="📅" title="No attendance records yet" sub="Records will appear here after class sessions" t={t} />}
      </div>
    </div>
  );
}

function StudentMarks({ user, data, t }) {
  const myMarks = data.marks.filter(m => m.studentId === user.id && m.classroomId === user.classroomId);
  const avg = myMarks.length ? Math.round(myMarks.reduce((a, m) => a + pct(m.score, m.max), 0) / myMarks.length) : null;
  return (
    <div>
      <SectionHeader title="My Marks & Tests" sub="Weekly test results and scores" t={t} />
      {avg !== null && (
        <div style={{ background: t.card, borderRadius: 16, padding: 20, boxShadow: t.shadow, marginBottom: 20, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 70, height: 70, borderRadius: "50%", background: gradeColor(avg, t) + "20", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: gradeColor(avg, t) }}>{avg}%</div>
          </div>
          <div><div style={{ fontWeight: 800, color: t.text, fontSize: 16 }}>Average Score</div><div style={{ color: t.sub, fontSize: 13 }}>Across {myMarks.length} tests</div></div>
        </div>
      )}
      {myMarks.length === 0 && <EmptyState icon="📊" title="No test scores yet" sub="Weekly test results will appear here" t={t} />}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {myMarks.sort((a, b) => b.date.localeCompare(a.date)).map(m => {
          const p = pct(m.score, m.max);
          return (
            <div key={m.id} style={{ background: t.card, borderRadius: 14, padding: "14px 18px", boxShadow: t.shadow }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <div>
                  <div style={{ fontWeight: 700, color: t.text }}>{m.test}</div>
                  <div style={{ fontSize: 12, color: t.sub }}>{fmtDate(m.date)}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: gradeColor(p, t) }}>{m.score}/{m.max}</div>
                  <div style={{ fontSize: 12, color: t.sub }}>{p}%</div>
                </div>
              </div>
              <ProgressBar value={m.score} max={m.max} color={gradeColor(p, t)} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MessagesView({ user, data, t }) {
  const msgs = data.broadcasts.filter(b => !b.classroomId || b.classroomId === user.classroomId).sort((a, b) => b.id - a.id);
  return (
    <div>
      <SectionHeader title="Messages from Sir" sub="Broadcast and classroom messages" t={t} />
      {msgs.length === 0 && <EmptyState icon="💬" title="No messages yet" sub="Sir's messages will appear here" t={t} />}
      {msgs.map(b => (
        <div key={b.id} style={{ background: t.card, borderRadius: 14, padding: "14px 18px", boxShadow: t.shadow, marginBottom: 10, borderLeft: `3px solid ${b.classroomId ? t.info : t.accent}` }}>
          <div style={{ fontSize: 14, color: t.text, lineHeight: 1.6, marginBottom: 6 }}>{b.text}</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 11, color: t.sub }}>{b.ts}</span>
            <Tag label={b.classroomId ? "Class Message" : "All Students"} color={b.classroomId ? t.info : t.accent} />
          </div>
        </div>
      ))}
    </div>
  );
}

function AnnouncementsList({ data, t }) {
  return (
    <div>
      <SectionHeader title="Announcements" sub="Important notices from Sir Ajit Pillai" t={t} />
      {data.announcements.length === 0 && <EmptyState icon="📣" title="No announcements" sub="Notices will appear here" t={t} />}
      {data.announcements.map(a => (
        <div key={a.id} style={{ background: t.card, borderRadius: 14, padding: "16px 20px", boxShadow: t.shadow, marginBottom: 12, borderLeft: `3px solid ${a.pinned ? t.accent : t.border}` }}>
          {a.pinned && <Tag label="📌 Pinned" color={t.accent} />}
          <div style={{ fontWeight: 800, color: t.text, fontSize: 15, marginTop: a.pinned ? 8 : 0, marginBottom: 4 }}>{a.title}</div>
          <div style={{ fontSize: 13, color: t.sub, lineHeight: 1.6 }}>{a.body}</div>
          <div style={{ fontSize: 11, color: t.sub, marginTop: 8 }}>{fmtDate(a.date)}</div>
        </div>
      ))}
    </div>
  );
}

function StudentProfile({ user, data, setData, t, notify }) {
  const cls = data.classrooms.find(c => c.id === user.classroomId);
  const [newPin, setNewPin] = useState(""); const [step, setStep] = useState("view");
  const savePin = (pin) => {
    if (pin.length < 4) return;
    setData(p => ({ ...p, students: p.students.map(s => s.id === user.id ? { ...s, pin, pinSet: true } : s) }));
    setStep("view"); notify("PIN updated successfully!", "success");
  };
  return (
    <div>
      <SectionHeader title="My Profile" t={t} />
      <div style={{ background: t.card, borderRadius: 16, padding: 24, boxShadow: t.shadow, marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 20 }}>
          <Avatar name={user.name} size={64} color={BOARD_COLOR[cls?.board] || "#1a2744"} />
          <div>
            <div style={{ fontWeight: 800, color: t.text, fontSize: 20 }}>{user.name}</div>
            <div style={{ color: t.sub, fontSize: 13 }}>{cls?.name}</div>
            <Tag label={`Roll No: ${user.rollNo}`} color={BOARD_COLOR[cls?.board] || "#1a2744"} />
          </div>
        </div>
        {[{ label: "Phone", value: user.phone }, { label: "Board", value: cls?.board }, { label: "Schedule", value: cls?.schedule }, { label: "Location", value: cls?.location }].map(item => (
          <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${t.border}` }}>
            <span style={{ color: t.sub, fontSize: 13 }}>{item.label}</span>
            <span style={{ fontWeight: 600, color: t.text, fontSize: 13 }}>{item.value}</span>
          </div>
        ))}
      </div>
      <div style={{ background: t.card, borderRadius: 16, padding: 24, boxShadow: t.shadow }}>
        <div style={{ fontWeight: 800, color: t.text, marginBottom: 12 }}>🔐 Change PIN</div>
        {step === "view" ? (
          <Btn label="Change My PIN" onClick={() => setStep("change")} variant="outline" t={t} />
        ) : (
          <>
            <div style={{ fontSize: 13, color: t.sub, marginBottom: 16 }}>Enter your new 4-digit PIN</div>
            <PinPad onComplete={savePin} maxLen={4} t={t} />
            <div style={{ marginTop: 12 }}>
              <button onClick={() => setStep("view")} style={{ background: "none", border: "none", color: t.sub, cursor: "pointer", fontSize: 13 }}>← Cancel</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StudentDashboard({ user, data, setData, t, dark, setDark, logout, notify }) {
  const [view, setView] = useState("home");
  const views = {
    home: <StudentHome user={user} data={data} t={t} />,
    tasks: <StudentTasks user={user} data={data} t={t} />,
    submit: <StudentSubmit user={user} data={data} setData={setData} t={t} notify={notify} />,
    attendance: <StudentAttendance user={user} data={data} t={t} />,
    marks: <StudentMarks user={user} data={data} t={t} />,
    messages: <MessagesView user={user} data={data} t={t} />,
    announcements: <AnnouncementsList data={data} t={t} />,
    profile: <StudentProfile user={user} data={data} setData={setData} t={t} notify={notify} />,
  };
  return (
    <DashboardShell user={user} t={t} dark={dark} setDark={setDark} logout={logout} view={view} setView={setView} navItems={NAV_STUDENT} data={data}>
      {views[view] || views.home}
    </DashboardShell>
  );
}

// ─────────────────────────────────────────
//  PARENT DASHBOARD
// ─────────────────────────────────────────
function ParentHome({ user, data, t }) {
  const child = data.students.find(s => s.id === user.studentId);
  const cls = data.classrooms.find(c => c.id === child?.classroomId);
  const myMarks = data.marks.filter(m => m.studentId === child?.id && m.classroomId === child?.classroomId);
  const avg = myMarks.length ? Math.round(myMarks.reduce((a, m) => a + pct(m.score, m.max), 0) / myMarks.length) : null;
  const attRecs = data.attendance.filter(a => a.classroomId === child?.classroomId).flatMap(a => a.records).filter(r => r.studentId === child?.id);
  const attPct = attRecs.length ? Math.round(((attRecs.filter(r => r.status !== "absent").length) / attRecs.length) * 100) : 100;
  const pending = data.homework.filter(h => h.classroomId === child?.classroomId && !data.submissions.find(s => s.hwId === h.id && s.studentId === child?.id));
  if (!child) return <EmptyState icon="👤" title="Student profile not found" sub="Contact Sir Ajit for assistance" t={t} />;
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 800, color: t.text }}>Hello, {user.name.split(" ")[0]}! 👋</h1>
        <p style={{ color: t.sub, marginTop: 4 }}>Tracking {child.name}'s progress in {cls?.name}</p>
      </div>
      <div style={{ background: t.card, borderRadius: 16, padding: 20, boxShadow: t.shadow, marginBottom: 20, display: "flex", gap: 14, alignItems: "center" }}>
        <Avatar name={child.name} size={56} color={BOARD_COLOR[cls?.board] || "#1a2744"} />
        <div>
          <div style={{ fontWeight: 800, color: t.text, fontSize: 18 }}>{child.name}</div>
          <div style={{ color: t.sub, fontSize: 13 }}>{cls?.name} · Roll No: {child.rollNo}</div>
          <div style={{ marginTop: 6, display: "flex", gap: 8 }}>
            {avg !== null && <Tag label={`Avg: ${avg}%`} color={gradeColor(avg, t)} />}
            <Tag label={`Attendance: ${attPct}%`} color={gradeColor(attPct, t)} />
          </div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 20 }}>
        <StatCard label="Attendance" value={`${attPct}%`} icon="📅" color={gradeColor(attPct, t)} t={t} />
        {avg !== null && <StatCard label="Avg Score" value={`${avg}%`} icon="📊" color={gradeColor(avg, t)} t={t} />}
        <StatCard label="Tests Taken" value={myMarks.length} icon="✍️" color="#7c3aed" t={t} />
        <StatCard label="Pending Tasks" value={pending.length} icon="📋" color={pending.length > 0 ? t.danger : t.success} t={t} />
      </div>
      {/* Pinned announcements */}
      {data.announcements.filter(a => a.pinned).length > 0 && (
        <div style={{ background: `${t.accent}15`, border: `1.5px solid ${t.accent}50`, borderRadius: 16, padding: 18 }}>
          <div style={{ fontWeight: 800, color: t.accent, marginBottom: 10 }}>📌 Important Notices</div>
          {data.announcements.filter(a => a.pinned).map(a => (
            <div key={a.id} style={{ marginBottom: 8 }}>
              <div style={{ fontWeight: 700, color: t.text, fontSize: 14 }}>{a.title}</div>
              <div style={{ fontSize: 12, color: t.sub }}>{a.body}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ParentAttendance({ user, data, t }) {
  const child = data.students.find(s => s.id === user.studentId);
  const records = data.attendance.filter(a => a.classroomId === child?.classroomId).sort((a, b) => b.date.localeCompare(a.date));
  const myRecs = records.flatMap(a => a.records.filter(r => r.studentId === child?.id).map(r => ({ date: a.date, ...r })));
  const pres = myRecs.filter(r => r.status === "present").length;
  const late = myRecs.filter(r => r.status === "late").length;
  const abs = myRecs.filter(r => r.status === "absent").length;
  const attPct = myRecs.length ? Math.round(((pres + late) / myRecs.length) * 100) : 100;
  return (
    <div>
      <SectionHeader title={`${child?.name}'s Attendance`} t={t} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
        <div style={{ background: `${t.success}18`, borderRadius: 14, padding: 16, textAlign: "center" }}><div style={{ fontSize: 28, fontWeight: 800, color: t.success }}>{pres}</div><div style={{ fontSize: 12, color: t.sub }}>Present</div></div>
        <div style={{ background: `${t.warn}18`, borderRadius: 14, padding: 16, textAlign: "center" }}><div style={{ fontSize: 28, fontWeight: 800, color: t.warn }}>{late}</div><div style={{ fontSize: 12, color: t.sub }}>Late</div></div>
        <div style={{ background: `${t.danger}18`, borderRadius: 14, padding: 16, textAlign: "center" }}><div style={{ fontSize: 28, fontWeight: 800, color: t.danger }}>{abs}</div><div style={{ fontSize: 12, color: t.sub }}>Absent</div></div>
      </div>
      <div style={{ background: t.card, borderRadius: 16, padding: 20, boxShadow: t.shadow, marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontWeight: 700, color: t.text }}>Attendance Rate</span>
          <span style={{ fontWeight: 800, fontSize: 22, color: gradeColor(attPct, t) }}>{attPct}%</span>
        </div>
        <ProgressBar value={pres + late} max={myRecs.length || 1} color={gradeColor(attPct, t)} />
      </div>
      {myRecs.map(r => (
        <div key={r.date} style={{ background: t.card, borderRadius: 10, padding: "10px 14px", boxShadow: t.shadow, marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: t.text, fontSize: 13, fontWeight: 600 }}>{fmtDate(r.date)}</span>
          <Tag label={r.status.charAt(0).toUpperCase() + r.status.slice(1)} color={statusColor(r.status, t)} />
        </div>
      ))}
      {myRecs.length === 0 && <EmptyState icon="📅" title="No records yet" sub="Attendance records will appear here" t={t} />}
    </div>
  );
}

function ParentAcademicReport({ user, data, t }) {
  const child = data.students.find(s => s.id === user.studentId);
  const myMarks = data.marks.filter(m => m.studentId === child?.id && m.classroomId === child?.classroomId).sort((a, b) => b.date.localeCompare(a.date));
  const avg = myMarks.length ? Math.round(myMarks.reduce((a, m) => a + pct(m.score, m.max), 0) / myMarks.length) : null;
  return (
    <div>
      <SectionHeader title="Academic Report" sub={`${child?.name}'s test performance`} t={t} />
      {avg !== null && (
        <div style={{ background: t.card, borderRadius: 16, padding: 20, boxShadow: t.shadow, marginBottom: 20, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 70, height: 70, borderRadius: "50%", background: gradeColor(avg, t) + "20", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: gradeColor(avg, t) }}>{avg}%</div>
          </div>
          <div><div style={{ fontWeight: 800, color: t.text, fontSize: 16 }}>Average Score</div><div style={{ color: t.sub, fontSize: 13 }}>Across {myMarks.length} tests</div></div>
        </div>
      )}
      {myMarks.length === 0 && <EmptyState icon="📊" title="No test scores yet" sub="Weekly test results will appear here" t={t} />}
      {myMarks.map(m => {
        const p = pct(m.score, m.max);
        return (
          <div key={m.id} style={{ background: t.card, borderRadius: 14, padding: "14px 18px", boxShadow: t.shadow, marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <div><div style={{ fontWeight: 700, color: t.text }}>{m.test}</div><div style={{ fontSize: 12, color: t.sub }}>{fmtDate(m.date)}</div></div>
              <div style={{ textAlign: "right" }}><div style={{ fontSize: 20, fontWeight: 800, color: gradeColor(p, t) }}>{m.score}/{m.max}</div><div style={{ fontSize: 12, color: t.sub }}>{p}%</div></div>
            </div>
            <ProgressBar value={m.score} max={m.max} color={gradeColor(p, t)} />
          </div>
        );
      })}
    </div>
  );
}

function ParentHomeworkStatus({ user, data, t }) {
  const child = data.students.find(s => s.id === user.studentId);
  const hw = data.homework.filter(h => h.classroomId === child?.classroomId);
  return (
    <div>
      <SectionHeader title="Homework Status" sub={`Track ${child?.name}'s submissions`} t={t} />
      {hw.length === 0 && <EmptyState icon="📚" title="No homework assigned yet" sub="Homework will appear here" t={t} />}
      {hw.map(h => {
        const sub = data.submissions.find(s => s.hwId === h.id && s.studentId === child?.id);
        const overdue = h.due < today() && !sub;
        return (
          <div key={h.id} style={{ background: t.card, borderRadius: 14, padding: "14px 18px", boxShadow: t.shadow, marginBottom: 10, borderLeft: `3px solid ${sub ? t.success : overdue ? t.danger : t.warn}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 700, color: t.text, fontSize: 14 }}>{h.title}</div>
                <div style={{ fontSize: 12, color: t.sub }}>Due: {fmtDate(h.due)}</div>
                {sub && <div style={{ fontSize: 11, color: t.success, marginTop: 4 }}>✅ Submitted {sub.at}</div>}
                {sub?.fb && <div style={{ fontSize: 11, color: t.info, marginTop: 4 }}>💬 Sir's feedback: {sub.fb}</div>}
              </div>
              <Tag label={sub ? (sub.grade ? `Grade: ${sub.grade}` : "Submitted") : overdue ? "Overdue!" : "Pending"} color={sub ? t.success : overdue ? t.danger : t.warn} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ParentProfile({ user, data, setData, t, notify }) {
  const child = data.students.find(s => s.id === user.studentId);
  const cls = data.classrooms.find(c => c.id === child?.classroomId);
  const [step, setStep] = useState("view");
  const savePin = (pin) => {
    setData(p => ({ ...p, parents: p.parents.map(pr => pr.id === user.id ? { ...pr, pin, pinSet: true } : pr) }));
    setStep("view"); notify("PIN updated!", "success");
  };
  return (
    <div>
      <SectionHeader title="My Profile" t={t} />
      <div style={{ background: t.card, borderRadius: 16, padding: 24, boxShadow: t.shadow, marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 20 }}>
          <Avatar name={user.name} size={56} color="#059669" />
          <div>
            <div style={{ fontWeight: 800, color: t.text, fontSize: 18 }}>{user.name}</div>
            <div style={{ color: t.sub, fontSize: 13 }}>Parent of {child?.name}</div>
          </div>
        </div>
        {[{ label: "Phone", value: user.phone }, { label: "Child's Name", value: child?.name }, { label: "Child's Class", value: cls?.name }, { label: "Board", value: cls?.board }].map(item => (
          <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${t.border}` }}>
            <span style={{ color: t.sub, fontSize: 13 }}>{item.label}</span>
            <span style={{ fontWeight: 600, color: t.text, fontSize: 13 }}>{item.value}</span>
          </div>
        ))}
      </div>
      <div style={{ background: t.card, borderRadius: 16, padding: 24, boxShadow: t.shadow }}>
        <div style={{ fontWeight: 800, color: t.text, marginBottom: 12 }}>🔐 Change PIN</div>
        {step === "view" ? <Btn label="Change My PIN" onClick={() => setStep("change")} variant="outline" t={t} /> : (
          <>
            <div style={{ fontSize: 13, color: t.sub, marginBottom: 16 }}>Enter your new 4-digit PIN</div>
            <PinPad onComplete={savePin} maxLen={4} t={t} />
            <div style={{ marginTop: 12 }}><button onClick={() => setStep("view")} style={{ background: "none", border: "none", color: t.sub, cursor: "pointer", fontSize: 13 }}>← Cancel</button></div>
          </>
        )}
      </div>
    </div>
  );
}

function ParentDashboard({ user, data, setData, t, dark, setDark, logout, notify }) {
  const [view, setView] = useState("home");
  const views = {
    home: <ParentHome user={user} data={data} t={t} />,
    attendance: <ParentAttendance user={user} data={data} t={t} />,
    marks: <ParentAcademicReport user={user} data={data} t={t} />,
    homework: <ParentHomeworkStatus user={user} data={data} t={t} />,
    messages: <MessagesView user={user} data={data} t={t} />,
    announcements: <AnnouncementsList data={data} t={t} />,
    profile: <ParentProfile user={user} data={data} setData={setData} t={t} notify={notify} />,
  };
  return (
    <DashboardShell user={user} t={t} dark={dark} setDark={setDark} logout={logout} view={view} setView={setView} navItems={NAV_PARENT} data={data}>
      {views[view] || views.home}
    </DashboardShell>
  );
}

// ─────────────────────────────────────────
//  ROOT APP
// ─────────────────────────────────────────
export default function App() {
  const [dark, setDark] = useState(false);
  const [data, setData] = useState(loadData);
  const [user, setUser] = useState(null);
  const [screen, setScreen] = useState("landing");
  const [toast, setToast] = useState(null);

  const t = TH[dark ? "dark" : "light"];

  useEffect(() => { saveData(data); }, [data]);

  const notify = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  const handleLogin = (userData) => { setUser(userData); setScreen("dashboard"); };
  const logout = () => { setUser(null); setScreen("landing"); };

  const toastColors = { success: "#059669", error: "#dc2626", info: "#1d4ed8" };

  return (
    <div style={{ background: t.bg, minHeight: "100vh", fontFamily: "'Nunito', sans-serif", color: t.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=Nunito:wght@300;400;500;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:5px;}::-webkit-scrollbar-track{background:transparent;}::-webkit-scrollbar-thumb{background:#475569;border-radius:3px;}
        input,textarea,select,button{font-family:'Nunito',sans-serif;}
        .hover-lift{transition:transform 0.18s,box-shadow 0.18s;}.hover-lift:hover{transform:translateY(-2px);}
        .fade-in{animation:fi 0.35s ease;} @keyframes fi{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 18, right: 18, zIndex: 9999,
          background: toastColors[toast.type] || toastColors.success, color: "#fff",
          padding: "12px 20px", borderRadius: 12, fontSize: 13, fontWeight: 700,
          boxShadow: "0 4px 20px rgba(0,0,0,0.25)", animation: "fi 0.3s ease",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          {toast.type === "success" ? "✓" : toast.type === "error" ? "⚠" : "ℹ"} {toast.msg}
        </div>
      )}

      {screen === "landing" && <LandingPage t={t} go={(role) => setScreen(role + "Login")} />}
      {screen === "adminLogin"   && <AdminLoginScreen   t={t} data={data} setUser={handleLogin} goBack={() => setScreen("landing")} notify={notify} />}
      {screen === "studentLogin" && <StudentLoginScreen t={t} data={data} setUser={handleLogin} goBack={() => setScreen("landing")} notify={notify} />}
      {screen === "parentLogin"  && <ParentLoginScreen  t={t} data={data} setUser={handleLogin} goBack={() => setScreen("landing")} notify={notify} />}

      {screen === "dashboard" && user?.type === "admin"   && <AdminDashboard   user={user} data={data} setData={setData} t={t} dark={dark} setDark={setDark} logout={logout} notify={notify} />}
      {screen === "dashboard" && user?.type === "student" && <StudentDashboard user={user} data={data} setData={setData} t={t} dark={dark} setDark={setDark} logout={logout} notify={notify} />}
      {screen === "dashboard" && user?.type === "parent"  && <ParentDashboard  user={user} data={data} setData={setData} t={t} dark={dark} setDark={setDark} logout={logout} notify={notify} />}
    </div>
  );
}

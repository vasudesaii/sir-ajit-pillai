import { useState, useEffect, useRef } from "react";
import { supabase, isSupabaseReady } from "./supabaseClient";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// ─────────────────────────────────────────
//  CONSTANTS & INITIAL DATA
// ─────────────────────────────────────────
const ADMIN_CREDS = { id: "ajitpillai007", password: "AjitSir@2026" };

const BOARD_COLOR = { CBSE: "#2563eb", GSEB: "#059669", ICSE: "#d97706", IB: "#7c3aed" };

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

// ─────────────────────────────────────────
//  SUPABASE DATA LAYER (NO localStorage)
// ─────────────────────────────────────────
const TABLE_MAP = {
  classrooms: {
    toDb: (c) => ({ id: c.id, name: c.name, board: c.board, grade: c.grade, schedule: c.schedule, location: c.location }),
    fromDb: (c) => ({ id: Number(c.id), name: c.name, board: c.board, grade: c.grade, schedule: c.schedule, location: c.location }),
  },
  students: {
    toDb: (s) => ({ id: s.id, name: s.name, classroom_id: s.classroomId, roll_no: s.rollNo, pin: s.pin, phone: s.phone, parent_id: s.parentId, pin_set: s.pinSet }),
    fromDb: (s) => ({ id: Number(s.id), name: s.name, classroomId: Number(s.classroom_id), rollNo: s.roll_no, pin: s.pin, phone: s.phone, parentId: Number(s.parent_id), pinSet: s.pin_set }),
  },
  parents: {
    toDb: (p) => ({ id: p.id, name: p.name, phone: p.phone, student_id: p.studentId, pin: p.pin, pin_set: p.pinSet }),
    fromDb: (p) => ({ id: Number(p.id), name: p.name, phone: p.phone, studentId: Number(p.student_id), pin: p.pin, pinSet: p.pin_set }),
  },
  attendance: {
    toDb: (a) => ({ id: a.id, date: a.date, classroom_id: a.classroomId, records: a.records }),
    fromDb: (a) => ({ id: Number(a.id), date: a.date, classroomId: Number(a.classroom_id), records: a.records || [] }),
  },
  homework: {
    toDb: (h) => ({ id: h.id, classroom_id: h.classroomId, title: h.title, desc: h.desc, due: h.due, type: h.type, created: h.created, attachment: h.attachment }),
    fromDb: (h) => ({ id: Number(h.id), classroomId: Number(h.classroom_id), title: h.title, desc: h.desc, due: h.due, type: h.type, created: h.created, attachment: h.attachment }),
  },
  submissions: {
    toDb: (s) => ({ id: s.id, hw_id: s.hwId, student_id: s.studentId, at: s.at, file: s.file, file_data: s.fileData, grade: s.grade, fb: s.fb }),
    fromDb: (s) => ({ id: Number(s.id), hwId: Number(s.hw_id), studentId: Number(s.student_id), at: s.at, file: s.file, fileData: s.file_data, grade: s.grade, fb: s.fb }),
  },
  broadcasts: {
    toDb: (b) => ({ id: b.id, text: b.text, ts: b.ts, classroom_id: b.classroomId }),
    fromDb: (b) => ({ id: Number(b.id), text: b.text, ts: b.ts, classroomId: b.classroom_id != null ? Number(b.classroom_id) : null }),
  },
  marks: {
    toDb: (m) => ({ id: m.id, classroom_id: m.classroomId, student_id: m.studentId, test: m.test, date: m.date, max: m.max, score: m.score }),
    fromDb: (m) => ({ id: Number(m.id), classroomId: Number(m.classroom_id), studentId: Number(m.student_id), test: m.test, date: m.date, max: m.max, score: m.score }),
  },
  announcements: {
    toDb: (a) => ({ id: a.id, title: a.title, body: a.body, date: a.date, pinned: a.pinned }),
    fromDb: (a) => ({ id: Number(a.id), title: a.title, body: a.body, date: a.date, pinned: a.pinned }),
  },
};

const TABLES = Object.keys(TABLE_MAP);

// Seed order respects foreign-key dependencies
const SEED_ORDER = ["classrooms", "students", "parents", "announcements", "homework", "attendance", "marks", "broadcasts", "submissions"];

async function fetchAllData() {
  const results = await Promise.all(
    TABLES.map(async (table) => {
      const { data, error } = await supabase.from(table).select("*");
      if (error) throw new Error(`${table}: ${error.message}`);
      return { table, data: (data || []).map((row) => TABLE_MAP[table].fromDb(row)) };
    })
  );
  const out = {};
  results.forEach((r) => { out[r.table] = r.data; });
  return out;
}

async function syncTable(tableName, current, previous, idField = "id") {
  if (!previous || !isSupabaseReady()) return;
  const prevMap = new Map(previous.map((i) => [i[idField], i]));
  const currMap = new Map(current.map((i) => [i[idField], i]));

  // Deletes
  const deleted = previous.filter((p) => !currMap.has(p[idField]));
  if (deleted.length > 0) {
    const ids = deleted.map((d) => d[idField]);
    await supabase.from(tableName).delete().in(idField, ids);
  }

  // Upserts (only changed or new items)
  const toUpsert = current
    .filter(c => {
      const prev = prevMap.get(c[idField]);
      // If it didn't exist before, or if it changed (JSON comparison)
      return !prev || JSON.stringify(prev) !== JSON.stringify(c);
    })
    .map((c) => TABLE_MAP[tableName].toDb(c));
    
  if (toUpsert.length > 0) {
    await supabase.from(tableName).upsert(toUpsert, { onConflict: idField });
  }
}

async function syncAllTables(current, previous) {
  if (!previous || !isSupabaseReady()) return;
  for (const table of TABLES) {
    await syncTable(table, current[table], previous[table]);
  }
}

// Export all data to a downloadable JSON file
function exportToFile(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ajit-pillai-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Import data from JSON object directly into Supabase
async function importToSupabase(obj) {
  if (!isSupabaseReady()) throw new Error("Supabase not connected");
  for (const table of SEED_ORDER) {
    const rows = obj[table];
    if (!Array.isArray(rows) || rows.length === 0) continue;
    const dbRows = rows.map((r) => TABLE_MAP[table].toDb(r));
    const { error } = await supabase.from(table).upsert(dbRows, { onConflict: "id" });
    if (error) throw new Error(`Import error [${table}]: ${error.message}`);
  }
  return await fetchAllData();
}

// ─────────────────────────────────────────
//  PDF REPORT CARD GENERATOR (Free – jsPDF)
// ─────────────────────────────────────────
function generateReportCardPDF(student, data) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 16;

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(26, 39, 68);
  doc.text("Sir Ajit Pillai Classes", pageW / 2, 20, { align: "center" });
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.setFont("helvetica", "normal");
  doc.text("Plot No: 1065/1, Sector 3D, Gandhinagar – 382006", pageW / 2, 26, { align: "center" });
  doc.text("Contact: 98258 38108 | ajitpillai007@yahoo.co.in", pageW / 2, 31, { align: "center" });
  doc.setDrawColor(232, 160, 32);
  doc.setLineWidth(0.8);
  doc.line(margin, 35, pageW - margin, 35);

  // Student Info
  const cls = data.classrooms.find(c => c.id === student.classroomId);
  doc.setFontSize(13);
  doc.setTextColor(26, 39, 68);
  doc.setFont("helvetica", "bold");
  doc.text("STUDENT REPORT CARD", margin, 44);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60);
  const infoY = 52;
  doc.text(`Name: ${student.name}`, margin, infoY);
  doc.text(`Classroom: ${cls?.name || "N/A"}  |  Board: ${cls?.board || "N/A"}`, margin + 70, infoY);
  doc.text(`Roll No: ${student.rollNo || "N/A"}`, margin, infoY + 6);
  doc.text(`Phone: ${student.phone || "N/A"}`, margin + 70, infoY + 6);

  // Attendance Summary
  const studentAttendance = data.attendance
    .filter(a => a.classroomId === student.classroomId)
    .flatMap(a => a.records)
    .filter(r => r.studentId === student.id);
  const present = studentAttendance.filter(r => r.status === "present").length;
  const total = studentAttendance.length;
  const attPct = total ? Math.round((present / total) * 100) : 0;

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(26, 39, 68);
  doc.text("Attendance Summary", margin, 68);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Total Days: ${total}  |  Present: ${present}  |  Absent: ${total - present}  |  Percentage: ${attPct}%`, margin, 74);

  // Marks Table
  const studentMarks = data.marks.filter(m => m.studentId === student.id).sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
  const rows = studentMarks.map(m => {
    const p = m.max ? Math.round((m.score / m.max) * 100) : 0;
    const grade = p >= 90 ? "A+" : p >= 80 ? "A" : p >= 70 ? "B" : p >= 60 ? "C" : p >= 50 ? "D" : "F";
    return [m.test, m.date || "—", `${m.score} / ${m.max}`, `${p}%`, grade];
  });

  if (rows.length > 0) {
    autoTable(doc, {
      startY: 80,
      head: [["Test / Exam", "Date", "Score", "Percentage", "Grade"]],
      body: rows,
      theme: "grid",
      headStyles: { fillColor: [26, 39, 68], textColor: [255, 255, 255], fontSize: 10, fontStyle: "bold" },
      bodyStyles: { fontSize: 10, textColor: [60, 60, 60] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: margin, right: margin },
      styles: { lineColor: [200, 200, 200], lineWidth: 0.3 },
    });
  } else {
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text("No marks recorded for this student.", margin, 85);
  }

  // Overall
  const totalScore = studentMarks.reduce((s, m) => s + (m.score || 0), 0);
  const totalMax = studentMarks.reduce((s, m) => s + (m.max || 0), 0);
  const overallPct = totalMax ? Math.round((totalScore / totalMax) * 100) : 0;
  const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 95;

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(26, 39, 68);
  doc.text("Overall Performance", margin, finalY);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Aggregate Score: ${totalScore} / ${totalMax}  |  Percentage: ${overallPct}%`, margin, finalY + 6);

  // Class Rank
  const allStudents = data.students.filter(s => s.classroomId === student.classroomId);
  const classMarks = allStudents.map(s => {
    const sm = data.marks.filter(m => m.studentId === s.id);
    const sc = sm.reduce((a, m) => a + (m.score || 0), 0);
    const mx = sm.reduce((a, m) => a + (m.max || 0), 0);
    return { id: s.id, pct: mx ? sc / mx : 0 };
  }).sort((a, b) => b.pct - a.pct);
  const rank = classMarks.findIndex(c => c.id === student.id) + 1;
  if (rank > 0 && allStudents.length > 1) {
    doc.text(`Class Rank: ${rank} of ${allStudents.length}`, margin, finalY + 12);
  }

  // Footer
  doc.setFontSize(9);
  doc.setTextColor(150);
  doc.text(`Generated on ${new Date().toLocaleDateString("en-IN")}  |  Sir Ajit Pillai Classes`, pageW / 2, 285, { align: "center" });

  doc.save(`Report-Card-${student.name.replace(/\s+/g, "-")}.pdf`);
}

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
          <span style={{ fontSize: 36, fontWeight: 800, color: "#1a2744", fontFamily: "'Playfair Display', serif" }}>AP</span>
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
  { id: "analytics",   icon: "📈", label: "Analytics"     },
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
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "#e8a020", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#1a2744", fontFamily: "'Playfair Display', serif", flexShrink: 0 }}>AP</div>
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

function BackupRestoreSection({ data, setData, t, notify }) {
  const [file, setFile] = useState(null);
  const [restoring, setRestoring] = useState(false);
  const [confirmRestore, setConfirmRestore] = useState(false);
  const fileInputRef = useRef(null);

  const handleExport = () => {
    exportToFile(data);
    notify("Backup downloaded successfully! Keep the .json file safe.", "success");
  };

  const handleFileSelect = (e) => {
    const f = e.target.files[0];
    if (f && f.type === "application/json") {
      setFile(f);
      setConfirmRestore(false);
    } else {
      notify("Please select a valid .json backup file", "error");
    }
  };

  const handleRestore = async () => {
    if (!file) return;
    setRestoring(true);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const required = ["classrooms", "students", "parents", "homework", "attendance", "marks", "broadcasts", "submissions", "announcements"];
      const missing = required.filter((k) => !Array.isArray(parsed[k]));
      if (missing.length > 0) throw new Error(`Invalid backup file. Missing tables: ${missing.join(", ")}`);
      const fresh = await importToSupabase(parsed);
      setData(fresh);
      setFile(null);
      setConfirmRestore(false);
      notify("Database restored from backup! All data synced to Supabase.", "success");
    } catch (e) {
      notify(e.message || "Restore failed", "error");
    } finally {
      setRestoring(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const recordCounts = [
    { label: "Classrooms", count: data.classrooms.length },
    { label: "Students", count: data.students.length },
    { label: "Parents", count: data.parents.length },
    { label: "Homework", count: data.homework.length },
    { label: "Attendance", count: data.attendance.length },
    { label: "Marks", count: data.marks.length },
    { label: "Broadcasts", count: data.broadcasts.length },
    { label: "Submissions", count: data.submissions.length },
    { label: "Announcements", count: data.announcements.length },
  ];

  return (
    <div style={{ background: t.card, borderRadius: 16, padding: 20, boxShadow: t.shadow }}>
      <div style={{ fontWeight: 800, color: t.text, marginBottom: 16 }}>💾 Backup & Restore</div>

      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        {recordCounts.map((rc) => (
          <div key={rc.label} style={{ background: t.sec, borderRadius: 10, padding: "10px 16px", textAlign: "center" }}>
            <div style={{ fontWeight: 800, color: t.text, fontSize: 18 }}>{rc.count}</div>
            <div style={{ fontSize: 11, color: t.sub }}>{rc.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr", maxWidth: 480 }}>
        <Btn label="📥 Export Backup (.json)" onClick={handleExport} t={t} />
        <div>
          <input ref={fileInputRef} type="file" accept="application/json" onChange={handleFileSelect} style={{ display: "none" }} />
          <Btn label={file ? `📁 ${file.name.slice(0, 22)}${file.name.length > 22 ? "..." : ""}` : "📤 Choose Backup File"} onClick={() => fileInputRef.current?.click()} t={t} />
        </div>
      </div>

      {file && !confirmRestore && (
        <div style={{ marginTop: 14 }}>
          <Btn label="⚠️ Restore from this file" onClick={() => setConfirmRestore(true)} variant="danger" t={t} />
        </div>
      )}

      {confirmRestore && file && (
        <div style={{ background: t.danger + "12", border: `1.5px solid ${t.danger}50`, borderRadius: 12, padding: "16px 18px", marginTop: 14 }}>
          <div style={{ fontWeight: 700, color: t.danger, marginBottom: 8 }}>⚠️ Confirm Restore</div>
          <div style={{ fontSize: 13, color: t.text, marginBottom: 14 }}>
            This will overwrite all data in Supabase with the contents of <b>{file.name}</b>. Existing records with matching IDs will be updated. New records will be added. This cannot be undone.
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn label={restoring ? "Restoring..." : "Yes, Restore Database"} onClick={handleRestore} variant="danger" t={t} disabled={restoring} />
            <Btn label="Cancel" onClick={() => { setConfirmRestore(false); setFile(null); }} variant="outline" t={t} />
          </div>
        </div>
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

        {/* Backup & Restore */}
        <BackupRestoreSection data={data} setData={setData} t={t} notify={notify} />

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
//  ANALYTICS (Free – pure CSS/SVG, no paid libraries)
// ─────────────────────────────────────────
function AdminAnalytics({ data, t }) {
  const [selClass, setSelClass] = useState("all");
  const [selTest, setSelTest] = useState("all");

  const students = selClass === "all" ? data.students : data.students.filter(s => s.classroomId === parseInt(selClass));
  const allTests = [...new Set(data.marks.map(m => m.test))];
  const marksFiltered = selTest === "all" ? data.marks : data.marks.filter(m => m.test === selTest);

  // 1. Class averages per test
  const testAverages = allTests.map(test => {
    const testMarks = data.marks.filter(m => m.test === test && (selClass === "all" || data.students.find(s => s.id === m.studentId)?.classroomId === parseInt(selClass)));
    const avg = testMarks.length ? Math.round(testMarks.reduce((a, m) => a + (m.max ? (m.score / m.max) * 100 : 0), 0) / testMarks.length) : 0;
    return { test, avg, count: testMarks.length };
  }).filter(t => t.count > 0);

  const maxAvg = Math.max(...testAverages.map(t => t.avg), 1);

  // 2. Top 5 performers
  const studentScores = students.map(s => {
    const sm = marksFiltered.filter(m => m.studentId === s.id);
    const total = sm.reduce((a, m) => a + (m.max ? (m.score / m.max) * 100 : 0), 0);
    const avg = sm.length ? Math.round(total / sm.length) : 0;
    return { ...s, avg, testCount: sm.length };
  }).filter(s => s.testCount > 0).sort((a, b) => b.avg - a.avg).slice(0, 5);

  // 3. Attendance vs Marks scatter data
  const scatterData = students.map(s => {
    const att = data.attendance.filter(a => a.classroomId === s.classroomId).flatMap(a => a.records).filter(r => r.studentId === s.id);
    const present = att.filter(r => r.status === "present").length;
    const attPct = att.length ? Math.round((present / att.length) * 100) : 0;
    const sm = marksFiltered.filter(m => m.studentId === s.id);
    const avg = sm.length ? Math.round(sm.reduce((a, m) => a + (m.max ? (m.score / m.max) * 100 : 0), 0) / sm.length) : 0;
    return { name: s.name.slice(0, 12), attPct, avg };
  }).filter(s => s.avg > 0);

  // 4. Grade distribution
  const gradeDist = { "A+": 0, "A": 0, "B": 0, "C": 0, "D": 0, "F": 0 };
  studentScores.forEach(s => {
    const g = s.avg >= 90 ? "A+" : s.avg >= 80 ? "A" : s.avg >= 70 ? "B" : s.avg >= 60 ? "C" : s.avg >= 50 ? "D" : "F";
    gradeDist[g] = (gradeDist[g] || 0) + 1;
  });

  return (
    <div>
      <SectionHeader title="Analytics & Insights" sub="Batch-wise performance, trends, and rankings" t={t} />

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <select value={selClass} onChange={e => setSelClass(e.target.value)} style={{ padding: "8px 14px", borderRadius: 10, border: `1px solid ${t.border}`, background: t.card, color: t.text, fontSize: 13 }}>
          <option value="all">All Classrooms</option>
          {data.classrooms.map(c => <option key={c.id} value={c.id}>{c.name} ({c.board})</option>)}
        </select>
        <select value={selTest} onChange={e => setSelTest(e.target.value)} style={{ padding: "8px 14px", borderRadius: 10, border: `1px solid ${t.border}`, background: t.card, color: t.text, fontSize: 13 }}>
          <option value="all">All Tests</option>
          {allTests.map(test => <option key={test} value={test}>{test}</option>)}
        </select>
      </div>

      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>

        {/* 1. Class Average Bar Chart */}
        <div style={{ background: t.card, borderRadius: 16, padding: 20, boxShadow: t.shadow }}>
          <div style={{ fontWeight: 800, color: t.text, marginBottom: 14, fontSize: 15 }}>📊 Class Average per Test</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {testAverages.length === 0 && <div style={{ color: t.sub, fontSize: 13 }}>No marks data for selected filters.</div>}
            {testAverages.map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 90, fontSize: 12, color: t.sub, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.test}</div>
                <div style={{ flex: 1, height: 22, background: t.sec, borderRadius: 6, overflow: "hidden" }}>
                  <div style={{ width: `${(item.avg / maxAvg) * 100}%`, height: "100%", background: gradeColor(item.avg, { success: t.success, info: t.info, warn: t.warn, danger: t.danger }), borderRadius: 6, transition: "width 0.6s ease" }} />
                </div>
                <div style={{ width: 40, fontSize: 12, fontWeight: 700, color: t.text, textAlign: "right" }}>{item.avg}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Top 5 Performers */}
        <div style={{ background: t.card, borderRadius: 16, padding: 20, boxShadow: t.shadow }}>
          <div style={{ fontWeight: 800, color: t.text, marginBottom: 14, fontSize: 15 }}>🏆 Top 5 Performers</div>
          {studentScores.length === 0 && <div style={{ color: t.sub, fontSize: 13 }}>No marks recorded.</div>}
          {studentScores.map((s, i) => (
            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, padding: "8px 12px", background: i === 0 ? `${t.accent}15` : t.sec, borderRadius: 10, border: i === 0 ? `1.5px solid ${t.accent}40` : "1.5px solid transparent" }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: i === 0 ? t.accent : t.border, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: i === 0 ? "#1a2744" : t.sub }}>{i + 1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: t.text }}>{s.name}</div>
                <div style={{ fontSize: 11, color: t.sub }}>{data.classrooms.find(c => c.id === s.classroomId)?.name || ""}</div>
              </div>
              <div style={{ fontWeight: 800, fontSize: 16, color: gradeColor(s.avg, { success: t.success, info: t.info, warn: t.warn, danger: t.danger }) }}>{s.avg}%</div>
            </div>
          ))}
        </div>

        {/* 3. Attendance vs Marks Scatter */}
        <div style={{ background: t.card, borderRadius: 16, padding: 20, boxShadow: t.shadow }}>
          <div style={{ fontWeight: 800, color: t.text, marginBottom: 14, fontSize: 15 }}>📈 Attendance vs Marks</div>
          {scatterData.length === 0 && <div style={{ color: t.sub, fontSize: 13 }}>Need both attendance and marks data.</div>}
          {scatterData.length > 0 && (
            <svg viewBox="0 0 300 180" style={{ width: "100%", height: "auto" }}>
              {/* Grid lines */}
              {[0, 25, 50, 75, 100].map(pct => (
                <g key={pct}>
                  <line x1={30 + pct * 2.4} y1="10" x2={30 + pct * 2.4} y2="160" stroke={t.border} strokeWidth="0.5" strokeDasharray="2,2" />
                  <line x1="30" y1={160 - pct * 1.5} x2="270" y2={160 - pct * 1.5} stroke={t.border} strokeWidth="0.5" strokeDasharray="2,2" />
                </g>
              ))}
              {/* Axes */}
              <line x1="30" y1="160" x2="270" y2="160" stroke={t.sub} strokeWidth="1" />
              <line x1="30" y1="10" x2="30" y2="160" stroke={t.sub} strokeWidth="1" />
              <text x="150" y="175" textAnchor="middle" fill={t.sub} fontSize="10">Attendance % →</text>
              <text x="15" y="85" textAnchor="middle" fill={t.sub} fontSize="10" transform="rotate(-90 15 85)">Marks % →</text>
              {/* Data points */}
              {scatterData.map((s, i) => (
                <g key={i}>
                  <circle cx={30 + s.attPct * 2.4} cy={160 - s.avg * 1.5} r="5" fill={t.accent} opacity="0.7" />
                  <title>{`${s.name}: ${s.attPct}% attendance, ${s.avg}% marks`}</title>
                </g>
              ))}
            </svg>
          )}
        </div>

        {/* 4. Grade Distribution */}
        <div style={{ background: t.card, borderRadius: 16, padding: 20, boxShadow: t.shadow }}>
          <div style={{ fontWeight: 800, color: t.text, marginBottom: 14, fontSize: 15 }}>🎯 Grade Distribution</div>
          {Object.values(gradeDist).every(v => v === 0) && <div style={{ color: t.sub, fontSize: 13 }}>No data to show distribution.</div>}
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 140, paddingTop: 10 }}>
            {Object.entries(gradeDist).map(([grade, count]) => {
              const maxCount = Math.max(...Object.values(gradeDist), 1);
              const pct = (count / maxCount) * 100;
              const color = grade === "A+" ? t.success : grade === "A" || grade === "B" ? t.info : grade === "C" || grade === "D" ? t.warn : t.danger;
              return (
                <div key={grade} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: t.text }}>{count}</div>
                  <div style={{ width: "100%", height: Math.max(pct * 1.2, 4), background: color, borderRadius: "4px 4px 0 0", transition: "height 0.4s ease" }} />
                  <div style={{ fontSize: 11, fontWeight: 700, color: t.sub }}>{grade}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 5. Summary Stats */}
        <div style={{ background: t.card, borderRadius: 16, padding: 20, boxShadow: t.shadow, gridColumn: "1 / -1" }}>
          <div style={{ fontWeight: 800, color: t.text, marginBottom: 14, fontSize: 15 }}>📋 Quick Stats</div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {[
              { label: "Students Analyzed", val: students.length },
              { label: "Tests Conducted", val: allTests.length },
              { label: "Total Marks Entries", val: marksFiltered.length },
              { label: "Class Avg (All Tests)", val: testAverages.length ? Math.round(testAverages.reduce((a, t) => a + t.avg, 0) / testAverages.length) + "%" : "N/A" },
              { label: "Highest Average", val: studentScores.length ? studentScores[0].avg + "%" : "N/A" },
              { label: "Lowest Average", val: studentScores.length ? studentScores[studentScores.length - 1].avg + "%" : "N/A" },
            ].map((s, i) => (
              <div key={i} style={{ background: t.sec, borderRadius: 10, padding: "12px 18px", textAlign: "center", minWidth: 120 }}>
                <div style={{ fontWeight: 800, color: t.text, fontSize: 20 }}>{s.val}</div>
                <div style={{ fontSize: 11, color: t.sub }}>{s.label}</div>
              </div>
            ))}
          </div>
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
  const views = { home: <AdminHome data={data} t={t} />, classrooms: <ClassroomsView data={data} setData={setData} t={t} notify={notify} />, students: <StudentsOverview data={data} setData={setData} t={t} notify={notify} />, attendance: <AttendanceView data={data} setData={setData} t={t} notify={notify} />, homework: <HomeworkView data={data} setData={setData} t={t} notify={notify} />, submissions: <SubmissionsView data={data} setData={setData} t={t} notify={notify} />, broadcast: <BroadcastView data={data} setData={setData} t={t} notify={notify} />, marks: <MarksView data={data} setData={setData} t={t} notify={notify} />, analytics: <AdminAnalytics data={data} t={t} />, announcements: <AnnouncementsView data={data} setData={setData} t={t} notify={notify} />, settings: <AdminSettings data={data} setData={setData} t={t} notify={notify} dark={dark} setDark={setDark} /> };
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
              {parent && <div style={{ fontSize: 11, color: t.sub, marginBottom: 8 }}>👨‍👩‍👦 {parent.name} · {parent.phone}</div>}
              <button onClick={() => generateReportCardPDF(s, data)} style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "none", background: t.nav, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <span>📝</span> Generate Report Card (PDF)
              </button>
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
//  ROOT APP  — Supabase only, NO localStorage
// ─────────────────────────────────────────
export default function App() {
  const [dark, setDark] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState(null);
  const [user, setUser] = useState(null);
  const [screen, setScreen] = useState("landing");
  const [toast, setToast] = useState(null);
  const prevDataRef = useRef(null);

  const t = TH[dark ? "dark" : "light"];

  // Check Supabase is configured
  if (!isSupabaseReady()) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0d1829", fontFamily: "'Nunito', sans-serif", padding: 24 }}>
        <div style={{ maxWidth: 480, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>🚫</div>
          <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 800, marginBottom: 12 }}>Supabase Not Connected</h1>
          <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.6 }}>
            Add your Supabase credentials to the <code style={{ background: "#1e293b", padding: "2px 6px", borderRadius: 4, color: "#e8a020" }}>.env</code> file and restart the dev server:
          </p>
          <div style={{ background: "#1e293b", borderRadius: 10, padding: 16, margin: "16px 0", textAlign: "left", fontSize: 12, color: "#cbd5e1", fontFamily: "monospace" }}>
            VITE_SUPABASE_URL=https://your-project.supabase.co<br/>
            VITE_SUPABASE_ANON_KEY=eyJ...
          </div>
        </div>
      </div>
    );
  }

  // Initial data fetch — app starts fresh (empty)
  useEffect(() => {
    async function init() {
      try {
        const fresh = await fetchAllData();
        setData(fresh);
        prevDataRef.current = fresh;
      } catch (e) {
        console.error("Database error:", e);
        setDbError(e.message || "Unknown database error");
      }
      setLoading(false);
    }
    init();
  }, []);

  // Sync changes to Supabase only
  useEffect(() => {
    if (!data || !isSupabaseReady()) return;
    if (prevDataRef.current) {
      syncAllTables(data, prevDataRef.current).catch((err) => {
        console.error("Supabase sync error:", err);
      });
    }
    prevDataRef.current = data;
  }, [data]);

  // Realtime subscriptions for live multi-device updates
  useEffect(() => {
    if (!isSupabaseReady()) return;
    const channels = TABLES.map((table) =>
      supabase
        .channel(`public:${table}`)
        .on("postgres_changes", { event: "*", schema: "public", table }, async () => {
          try {
            const fresh = await fetchAllData();
            prevDataRef.current = fresh;
            setData(fresh);
          } catch (e) {
            console.error("Realtime refresh failed:", e);
          }
        })
        .subscribe()
    );
    return () => channels.forEach((c) => supabase.removeChannel(c));
  }, []);

  const notify = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  const handleLogin = (userData) => { setUser(userData); setScreen("dashboard"); };
  const logout = () => { setUser(null); setScreen("landing"); };

  const toastColors = { success: "#059669", error: "#dc2626", info: "#1d4ed8" };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: t.bg, fontFamily: "'Nunito', sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 16, animation: "spin 1s linear infinite" }}>⏳</div>
          <div style={{ color: t.text, fontWeight: 700, fontSize: 16 }}>Loading from Supabase...</div>
          <div style={{ color: t.sub, fontSize: 12, marginTop: 8 }}>Online database</div>
        </div>
        <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (dbError) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0d1829", fontFamily: "'Nunito', sans-serif", padding: 24 }}>
        <div style={{ maxWidth: 520, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>⚠️</div>
          <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 800, marginBottom: 12 }}>Database Not Ready</h1>
          <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>
            The Supabase tables have not been created yet. Run the schema script in your Supabase SQL Editor.
          </p>
          <div style={{ background: "#1e293b", borderRadius: 10, padding: 14, marginBottom: 12, textAlign: "left", fontSize: 12, color: "#f87171", fontFamily: "monospace" }}>
            {dbError}
          </div>
          <p style={{ color: "#64748b", fontSize: 12 }}>
            File: <code style={{ color: "#e8a020" }}>database/schema.sql</code>
          </p>
        </div>
      </div>
    );
  }

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

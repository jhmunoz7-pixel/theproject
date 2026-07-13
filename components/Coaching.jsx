"use client";

import { useState, useEffect, useMemo } from "react";
import { store } from "@/lib/store";
import {
  PALETTES, SERIF, BODY, ITALIC, dayId, cssVars,
  Heart, Grain, Blobs, GlobalStyles,
  chip, primaryBtn, aiMini, H1, Label,
} from "@/components/ui";

// ═══════════════════════════════════════════════════════════
//  THE PROJECT · Coaching
//  Centro privado de Fer: personas, sesiones, notas, docs,
//  timeline de avance y modo "sesión en vivo" para compartir pantalla.
// ═══════════════════════════════════════════════════════════

const KEY = "coach:v1";

const COACHEE_COLORS = [
  "#6E7444", "#A85668", "#7E9885", "#8A5E7E",
  "#C36F5A", "#A9822F", "#6B5E96", "#7A4A63",
];

const emptyData = () => ({
  coachName: "Fer",
  coachees: [],
  sessions: [],
  notes: [],
  docs: [],
  milestones: [],
});

const uid = () =>
  (globalThis.crypto?.randomUUID?.()) ||
  `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

const prettyDay = (key) => {
  if (!key) return "";
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-MX", {
    weekday: "short", day: "numeric", month: "short",
  });
};

const lastNDays = (n) => {
  const out = [];
  const ref = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const dt = new Date(ref);
    dt.setDate(dt.getDate() - i);
    out.push(dayId(dt));
  }
  return out;
};

const MAX_FILE = 2 * 1024 * 1024;
const humanSize = (b) =>
  !b ? "" : b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1048576).toFixed(1)} MB`;

// ═══ ROOT ═══
export default function Coaching() {
  const [phase, setPhase] = useState("loading");
  const [data, setData] = useState(emptyData());
  const [view, setView] = useState({ name: "dashboard" }); // {name, coacheeId?, sessionId?}

  const P = PALETTES.original;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const saved = await store.get(KEY);
        if (cancelled) return;
        if (saved) setData({ ...emptyData(), ...saved });
        setPhase("ready");
      } catch {
        if (!cancelled) setPhase("ready");
      }
    })();
    const t = setTimeout(() => { if (!cancelled) setPhase((p) => (p === "loading" ? "ready" : p)); }, 1500);
    return () => { cancelled = true; clearTimeout(t); };
  }, []);

  const save = async (next) => {
    setData(next);
    try { await store.set(KEY, next); } catch {}
  };

  // ── Mutaciones ──
  const m = useMemo(() => ({
    setCoachName: (name) => save({ ...data, coachName: name }),
    addCoachee: (c) => {
      const id = uid();
      const color = c.color || COACHEE_COLORS[data.coachees.length % COACHEE_COLORS.length];
      save({ ...data, coachees: [...data.coachees, { ...c, id, color, createdAt: new Date().toISOString() }] });
      return id;
    },
    updateCoachee: (id, patch) => save({ ...data, coachees: data.coachees.map((c) => (c.id === id ? { ...c, ...patch } : c)) }),
    removeCoachee: (id) => save({
      ...data,
      coachees: data.coachees.filter((c) => c.id !== id),
      sessions: data.sessions.filter((s) => s.coacheeId !== id),
      notes: data.notes.filter((n) => n.coacheeId !== id),
      docs: data.docs.filter((d) => d.coacheeId !== id),
      milestones: data.milestones.filter((x) => x.coacheeId !== id),
    }),
    addSession: (s) => {
      const id = uid();
      save({ ...data, sessions: [...data.sessions, { id, agenda: [], notes: "", actionItems: [], status: "agendada", createdAt: new Date().toISOString(), ...s }] });
      return id;
    },
    updateSession: (id, patch) => save({ ...data, sessions: data.sessions.map((s) => (s.id === id ? { ...s, ...patch } : s)) }),
    removeSession: (id) => save({ ...data, sessions: data.sessions.filter((s) => s.id !== id) }),
    addAgenda: (id, text) => save({ ...data, sessions: data.sessions.map((s) => (s.id === id ? { ...s, agenda: [...s.agenda, text] } : s)) }),
    removeAgenda: (id, i) => save({ ...data, sessions: data.sessions.map((s) => (s.id === id ? { ...s, agenda: s.agenda.filter((_, j) => j !== i) } : s)) }),
    addAction: (id, text) => save({ ...data, sessions: data.sessions.map((s) => (s.id === id ? { ...s, actionItems: [...s.actionItems, { id: uid(), text, done: false }] } : s)) }),
    toggleAction: (sid, aid) => save({ ...data, sessions: data.sessions.map((s) => (s.id === sid ? { ...s, actionItems: s.actionItems.map((a) => (a.id === aid ? { ...a, done: !a.done } : a)) } : s)) }),
    addNote: (coacheeId, text) => save({ ...data, notes: [{ id: uid(), coacheeId, text, pinned: false, createdAt: new Date().toISOString() }, ...data.notes] }),
    updateNote: (id, patch) => save({ ...data, notes: data.notes.map((n) => (n.id === id ? { ...n, ...patch } : n)) }),
    removeNote: (id) => save({ ...data, notes: data.notes.filter((n) => n.id !== id) }),
    addDoc: (d) => save({ ...data, docs: [{ id: uid(), createdAt: new Date().toISOString(), ...d }, ...data.docs] }),
    removeDoc: (id) => save({ ...data, docs: data.docs.filter((d) => d.id !== id) }),
    addMilestone: (coacheeId, title, date) => save({ ...data, milestones: [...data.milestones, { id: uid(), coacheeId, title, date, done: false }] }),
    toggleMilestone: (id) => save({ ...data, milestones: data.milestones.map((x) => (x.id === id ? { ...x, done: !x.done } : x)) }),
    removeMilestone: (id) => save({ ...data, milestones: data.milestones.filter((x) => x.id !== id) }),
  }), [data]);

  if (phase === "loading") {
    return (
      <div style={{ minHeight: "100vh", background: P.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: BODY, color: P.muted, ...cssVars(P) }}>
        <GlobalStyles />
        <span className="fade">cargando tu centro de coaching…</span>
      </div>
    );
  }

  const rootStyle = {
    minHeight: "100vh",
    background: `linear-gradient(160deg, ${P.bg} 0%, ${P.card} 55%, ${P.bg} 100%)`,
    fontFamily: BODY, color: P.ink, position: "relative", overflowX: "hidden", ...cssVars(P),
  };

  const coachee = view.coacheeId ? data.coachees.find((c) => c.id === view.coacheeId) : null;

  // El modo en vivo ocupa toda la pantalla (limpio para compartir).
  if (view.name === "live" && coachee) {
    return (
      <div style={rootStyle}>
        <GlobalStyles />
        <Grain />
        <div style={{ position: "relative", zIndex: 2 }}>
          <LiveSession P={P} data={data} coachee={coachee} sessionId={view.sessionId} m={m} onExit={() => setView({ name: "coachee", coacheeId: coachee.id })} />
        </div>
      </div>
    );
  }

  return (
    <div style={rootStyle}>
      <GlobalStyles />
      <Grain />
      <Blobs P={P} />
      <div style={{ position: "relative", zIndex: 2 }}>
        {view.name === "dashboard" && (
          <Dashboard P={P} data={data} m={m} onOpen={(id) => setView({ name: "coachee", coacheeId: id })} onLive={(cid, sid) => setView({ name: "live", coacheeId: cid, sessionId: sid })} />
        )}
        {view.name === "coachee" && coachee && (
          <CoacheeDetail P={P} data={data} coachee={coachee} m={m} onBack={() => setView({ name: "dashboard" })} onLive={(sid) => setView({ name: "live", coacheeId: coachee.id, sessionId: sid })} />
        )}
        {view.name === "coachee" && !coachee && (
          <div style={{ maxWidth: 560, margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
            <H1 P={P}>No encontramos a esta persona.</H1>
            <button onClick={() => setView({ name: "dashboard" })} style={primaryBtn(P)}>← Volver</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Estilos reutilizables ──
const card = (P) => ({ background: P.card, border: `1px solid ${P.line}`, borderRadius: 24, boxShadow: "0 10px 30px rgba(0,0,0,.05)" });
const fieldStyle = (P) => ({ width: "100%", fontFamily: BODY, fontSize: 14, padding: "11px 16px", borderRadius: 16, border: `1.5px solid ${P.line}`, background: P.card, color: P.ink, outline: "none" });
const sectionH = (P) => ({ fontFamily: SERIF, fontWeight: 400, fontSize: 19, color: P.ink, margin: 0 });

// ═══ DASHBOARD ═══
function Dashboard({ P, data, m, onOpen, onLive }) {
  const [newOpen, setNewOpen] = useState(false);
  const [editName, setEditName] = useState(false);

  const activas = data.coachees.filter((c) => c.status === "activa").length;
  const week = new Set(lastNDays(7));
  const thisWeek = data.sessions.filter((s) => week.has(s.date)).length;
  const pending = data.sessions.reduce((n, s) => n + s.actionItems.filter((a) => !a.done).length, 0);
  const hitos = data.milestones.filter((x) => x.done).length;

  const today = dayId();
  const upcoming = data.sessions
    .filter((s) => s.date >= today && s.status === "agendada")
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .slice(0, 5)
    .map((s) => ({ ...s, coachee: data.coachees.find((c) => c.id === s.coacheeId) }));

  const progressOf = (id) => {
    const ms = data.milestones.filter((x) => x.coacheeId === id);
    return ms.length ? Math.round((ms.filter((x) => x.done).length / ms.length) * 100) : 0;
  };

  return (
    <div style={{ maxWidth: 1080, margin: "0 auto", padding: "34px 24px 80px" }}>
      {/* Header */}
      <div className="fade" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 30 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 46, height: 46, borderRadius: 16, background: P.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Heart color={P.card} size={22} />
          </div>
          <div>
            {editName ? (
              <input autoFocus defaultValue={data.coachName}
                onBlur={(e) => { m.setCoachName(e.target.value.trim() || data.coachName); setEditName(false); }}
                onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); }}
                style={{ ...fieldStyle(P), fontFamily: SERIF, fontSize: 22, padding: "2px 8px", width: 200 }} />
            ) : (
              <div onClick={() => setEditName(true)} style={{ fontFamily: SERIF, fontSize: 24, color: P.ink, cursor: "pointer", lineHeight: 1.1 }} title="Editar nombre">
                Hola, {data.coachName}
              </div>
            )}
            <div style={{ fontFamily: ITALIC, fontStyle: "italic", fontSize: 15, color: P.accent }}>Tu centro de coaching</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <a href="/espacio" style={{ fontFamily: BODY, fontSize: 14, color: P.muted, textDecoration: "none", padding: "8px 14px" }}>Ir a Space</a>
          <button onClick={() => setNewOpen(true)} style={primaryBtn(P)}>+ Nueva persona</button>
        </div>
      </div>

      {/* Stats */}
      <div className="fade d1" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14, marginBottom: 30 }}>
        {[
          ["Personas activas", activas],
          ["Sesiones esta semana", thisWeek],
          ["Compromisos pendientes", pending],
          ["Hitos logrados", hitos],
        ].map(([label, val]) => (
          <div key={label} style={{ ...card(P), padding: 18 }}>
            <div style={{ fontFamily: SERIF, fontSize: 30, color: P.ink }}>{val}</div>
            <div style={{ fontFamily: BODY, fontSize: 13, color: P.muted }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,2fr) minmax(0,1fr)", gap: 24, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 24, minWidth: 0 }}>
          {/* Próximas sesiones */}
          <div className="fade d2" style={{ ...card(P), padding: 22 }}>
            <h3 style={{ ...sectionH(P), marginBottom: 14 }}>Próximas sesiones</h3>
            {upcoming.length === 0 ? (
              <p style={{ fontFamily: BODY, fontSize: 14, color: P.muted, textAlign: "center", padding: "16px 0" }}>
                No tienes sesiones agendadas. Entra a una persona para agendar.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {upcoming.map((s) => (
                  <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 16, border: `1px solid ${P.line}`, background: P.bg }}>
                    <span style={{ width: 32, height: 32, borderRadius: "50%", background: s.coachee?.color || P.muted, flexShrink: 0 }} />
                    <div onClick={() => onOpen(s.coacheeId)} style={{ flex: 1, minWidth: 0, cursor: "pointer" }}>
                      <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 14, color: P.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {s.coachee?.name || "—"} · {s.title}
                      </div>
                      <div style={{ fontFamily: BODY, fontSize: 12, color: P.muted }}>{prettyDay(s.date)}</div>
                    </div>
                    <button onClick={() => onLive(s.coacheeId, s.id)} style={{ ...aiMini(P), flexShrink: 0 }}>▶ En vivo</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Coachees */}
          <div className="fade d3">
            <h3 style={{ ...sectionH(P), marginBottom: 14 }}>Tus personas</h3>
            {data.coachees.length === 0 ? (
              <div style={{ ...card(P), padding: 34, textAlign: "center" }}>
                <p style={{ fontFamily: ITALIC, fontStyle: "italic", fontSize: 16, color: P.muted, marginBottom: 16 }}>
                  Aún no agregas a nadie. Empieza con tu primera coachee.
                </p>
                <button onClick={() => setNewOpen(true)} style={primaryBtn(P)}>+ Nueva persona</button>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 14 }}>
                {data.coachees.map((c) => {
                  const pct = progressOf(c.id);
                  return (
                    <div key={c.id} onClick={() => onOpen(c.id)} className="lift" style={{ ...card(P), padding: 16, cursor: "pointer" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                        <span style={{ width: 40, height: 40, borderRadius: "50%", background: c.color, color: "#fff", fontFamily: SERIF, fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {c.name.charAt(0).toUpperCase()}
                        </span>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontFamily: BODY, fontWeight: 600, color: P.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</div>
                          <div style={{ fontFamily: BODY, fontSize: 12, color: P.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.role || "—"}</div>
                        </div>
                        <StatusTag P={P} status={c.status} />
                      </div>
                      {c.goal && <p style={{ fontFamily: BODY, fontSize: 12, color: P.ink, opacity: 0.75, margin: "0 0 12px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{c.goal}</p>}
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ flex: 1, height: 6, borderRadius: 100, background: P.line, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${pct}%`, background: P.accent, borderRadius: 100 }} />
                        </div>
                        <span style={{ fontFamily: BODY, fontSize: 11, color: P.muted }}>{pct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Lateral: notas + docs generales */}
        <div className="fade d4" style={{ display: "flex", flexDirection: "column", gap: 24, minWidth: 0 }}>
          <NotesPanel P={P} data={data} m={m} coacheeId={null} title="Notas generales" />
          <DocsPanel P={P} data={data} m={m} coacheeId={null} title="Documentos generales" />
        </div>
      </div>

      {newOpen && <NewCoacheeModal P={P} m={m} onClose={() => setNewOpen(false)} onCreated={(id) => onOpen(id)} />}
    </div>
  );
}

function StatusTag({ P, status }) {
  const active = status === "activa";
  return (
    <span style={{ fontFamily: BODY, fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 100, background: active ? P.accent + "22" : P.line, color: active ? P.accent : P.muted }}>
      {status}
    </span>
  );
}

// ═══ NEW COACHEE MODAL ═══
function NewCoacheeModal({ P, m, onClose, onCreated }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [goal, setGoal] = useState("");
  const [color, setColor] = useState(COACHEE_COLORS[0]);

  const create = () => {
    if (!name.trim()) return;
    const id = m.addCoachee({ name: name.trim(), role: role.trim(), goal: goal.trim(), status: "activa", startDate: dayId(), color });
    onClose();
    onCreated?.(id);
  };

  return (
    <Modal P={P} onClose={onClose}>
      <h2 style={{ ...sectionH(P), fontSize: 22, marginBottom: 18 }}>Nueva persona</h2>
      <Label P={P}>Nombre</Label>
      <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="¿A quién vas a acompañar?" style={{ ...fieldStyle(P), marginBottom: 14 }} />
      <Label P={P}>Puesto / profesión</Label>
      <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Ej. Gerente de finanzas" style={{ ...fieldStyle(P), marginBottom: 14 }} />
      <Label P={P}>Objetivo del coaching</Label>
      <textarea value={goal} onChange={(e) => setGoal(e.target.value)} rows={2} placeholder="¿Qué quiere lograr con tu acompañamiento?" style={{ ...fieldStyle(P), resize: "none", marginBottom: 16 }} />
      <Label P={P}>Color</Label>
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {COACHEE_COLORS.map((c) => (
          <button key={c} onClick={() => setColor(c)} style={{ width: 30, height: 30, borderRadius: "50%", background: c, border: color === c ? `3px solid ${P.ink}` : "3px solid #fff", cursor: "pointer" }} />
        ))}
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onClose} style={{ flex: 1, ...fieldStyle(P), borderRadius: 100, textAlign: "center", cursor: "pointer", color: P.muted, background: "transparent" }}>Cancelar</button>
        <button onClick={create} disabled={!name.trim()} style={{ ...primaryBtn(P, !name.trim()), flex: 1 }}>Agregar</button>
      </div>
    </Modal>
  );
}

function Modal({ P, onClose, children }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} className="fade" style={{ ...card(P), width: "100%", maxWidth: 440, padding: 28, maxHeight: "90vh", overflowY: "auto" }}>
        {children}
      </div>
    </div>
  );
}

// ═══ COACHEE DETAIL ═══
function CoacheeDetail({ P, data, coachee, m, onBack, onLive }) {
  const [goal, setGoal] = useState(coachee.goal || "");
  const [confirmDel, setConfirmDel] = useState(false);
  const STATUSES = ["activa", "pausa", "graduada"];

  return (
    <div style={{ maxWidth: 1080, margin: "0 auto", padding: "34px 24px 80px" }}>
      {/* Header */}
      <div className="fade" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14, marginBottom: 24 }}>
        <button onClick={onBack} style={{ width: 42, height: 42, borderRadius: "50%", border: "none", background: P.accent + "22", color: P.accent, fontSize: 18, cursor: "pointer", flexShrink: 0 }}>←</button>
        <span style={{ width: 50, height: 50, borderRadius: "50%", background: coachee.color, color: "#fff", fontFamily: SERIF, fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {coachee.name.charAt(0).toUpperCase()}
        </span>
        <div style={{ flex: 1, minWidth: 180 }}>
          <input defaultValue={coachee.name} onBlur={(e) => m.updateCoachee(coachee.id, { name: e.target.value.trim() || coachee.name })}
            style={{ fontFamily: SERIF, fontSize: 26, color: P.ink, border: "none", background: "transparent", outline: "none", width: "100%" }} />
          <input defaultValue={coachee.role} placeholder="Puesto / profesión" onBlur={(e) => m.updateCoachee(coachee.id, { role: e.target.value.trim() })}
            style={{ fontFamily: BODY, fontSize: 14, color: P.muted, border: "none", background: "transparent", outline: "none", width: "100%" }} />
        </div>
        <button onClick={() => onLive(undefined)} style={primaryBtn(P)}>▶ Iniciar en vivo</button>
      </div>

      {/* Estado + objetivo */}
      <div className="fade d1" style={{ ...card(P), padding: 20, marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          <span style={{ fontFamily: BODY, fontSize: 12, fontWeight: 600, color: P.muted }}>Estado:</span>
          {STATUSES.map((s) => (
            <button key={s} onClick={() => m.updateCoachee(coachee.id, { status: s })} style={chip(P, coachee.status === s)}>{s}</button>
          ))}
          <span style={{ marginLeft: "auto", fontFamily: BODY, fontSize: 12, color: P.muted }}>Desde {prettyDay(coachee.startDate)}</span>
        </div>
        <Label P={P}>Objetivo del coaching</Label>
        <textarea value={goal} onChange={(e) => setGoal(e.target.value)} onBlur={() => m.updateCoachee(coachee.id, { goal: goal.trim() })} rows={2}
          placeholder="¿Qué quiere lograr con tu acompañamiento?" style={{ ...fieldStyle(P), resize: "none" }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,2fr) minmax(0,1fr)", gap: 24, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 24, minWidth: 0 }}>
          <Sessions P={P} data={data} coacheeId={coachee.id} m={m} onLive={onLive} />
          <NotesPanel P={P} data={data} m={m} coacheeId={coachee.id} title="Notas de esta persona" />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24, minWidth: 0 }}>
          <Timeline P={P} data={data} coacheeId={coachee.id} m={m} />
          <DocsPanel P={P} data={data} m={m} coacheeId={coachee.id} title="Documentos" />
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: 34 }}>
        {!confirmDel ? (
          <button onClick={() => setConfirmDel(true)} style={{ fontFamily: BODY, fontSize: 13, color: P.muted, background: "none", border: "none", cursor: "pointer" }}>
            Eliminar a {coachee.name.split(" ")[0]}
          </button>
        ) : (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 12, ...card(P), padding: "12px 18px" }}>
            <span style={{ fontFamily: BODY, fontSize: 13, color: P.ink }}>Se borra todo su historial. ¿Segura?</span>
            <button onClick={() => setConfirmDel(false)} style={{ fontFamily: BODY, fontSize: 13, color: P.muted, background: "none", border: "none", cursor: "pointer" }}>Cancelar</button>
            <button onClick={() => { m.removeCoachee(coachee.id); onBack(); }} style={{ ...primaryBtn(P), padding: "8px 16px", fontSize: 13 }}>Eliminar</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══ TIMELINE (hitos) ═══
function Timeline({ P, data, coacheeId, m }) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(dayId());
  const milestones = data.milestones.filter((x) => x.coacheeId === coacheeId).sort((a, b) => (a.date < b.date ? -1 : 1));
  const done = milestones.filter((x) => x.done).length;

  return (
    <div style={{ ...card(P), padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h3 style={sectionH(P)}>Timeline de avance</h3>
        {milestones.length > 0 && <span style={{ fontFamily: BODY, fontSize: 12, color: P.muted }}>{done}/{milestones.length}</span>}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); if (title.trim()) { m.addMilestone(coacheeId, title.trim(), date); setTitle(""); } }} style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nuevo hito…" style={{ ...fieldStyle(P), flex: 1, minWidth: 120 }} />
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ ...fieldStyle(P), width: "auto", color: P.muted }} />
        <button type="submit" style={{ ...aiMini(P), padding: "0 14px", fontSize: 18 }}>+</button>
      </form>
      {milestones.length === 0 ? (
        <p style={{ fontFamily: BODY, fontSize: 13, color: P.muted, textAlign: "center", padding: "10px 0" }}>Marca hitos para ver el camino recorrido.</p>
      ) : (
        <div style={{ borderLeft: `2px solid ${P.line}`, marginLeft: 6, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 16 }}>
          {milestones.map((x) => (
            <div key={x.id} style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: -27, top: 2, width: 14, height: 14, borderRadius: "50%", background: x.done ? P.accent : P.line, boxShadow: `0 0 0 4px ${P.card}` }} />
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <div>
                  <button onClick={() => m.toggleMilestone(x.id)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", textAlign: "left", fontFamily: BODY, fontSize: 14, color: x.done ? P.muted : P.ink, textDecoration: x.done ? "line-through" : "none" }}>{x.title}</button>
                  <div style={{ fontFamily: BODY, fontSize: 11, color: P.muted }}>{prettyDay(x.date)}</div>
                </div>
                <button onClick={() => m.removeMilestone(x.id)} style={{ background: "none", border: "none", color: P.muted, cursor: "pointer" }}>×</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══ SESSIONS ═══
function Sessions({ P, data, coacheeId, m, onLive }) {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(dayId());
  const sessions = data.sessions.filter((s) => s.coacheeId === coacheeId).sort((a, b) => (a.date < b.date ? 1 : -1));

  const create = () => {
    m.addSession({ coacheeId, date, title: title.trim() || `Sesión ${sessions.length + 1}` });
    setTitle(""); setDate(dayId()); setAdding(false);
  };

  return (
    <div style={{ ...card(P), padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h3 style={sectionH(P)}>Sesiones</h3>
        {sessions.length > 0 && <span style={{ fontFamily: BODY, fontSize: 12, color: P.muted }}>{sessions.length}</span>}
      </div>
      {!adding ? (
        <button onClick={() => setAdding(true)} style={{ width: "100%", padding: "11px", borderRadius: 16, border: `1.5px dashed ${P.line}`, background: "transparent", color: P.muted, fontFamily: BODY, fontSize: 14, cursor: "pointer", marginBottom: 12 }}>+ Agendar sesión</button>
      ) : (
        <div style={{ ...card(P), padding: 12, marginBottom: 12, display: "flex", flexDirection: "column", gap: 8, background: P.bg }}>
          <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título (ej. Sesión 3 · Límites)" style={fieldStyle(P)} />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ ...fieldStyle(P), color: P.muted }} />
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setAdding(false)} style={{ flex: 1, ...fieldStyle(P), borderRadius: 100, textAlign: "center", cursor: "pointer", color: P.muted, background: "transparent" }}>Cancelar</button>
            <button onClick={create} style={{ ...primaryBtn(P), flex: 1, padding: "11px" }}>Agendar</button>
          </div>
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {sessions.map((s) => <SessionRow key={s.id} P={P} session={s} m={m} onLive={onLive} />)}
      </div>
    </div>
  );
}

function SessionRow({ P, session, m, onLive }) {
  const [open, setOpen] = useState(session.status === "agendada");
  const [agendaInput, setAgendaInput] = useState("");
  const [item, setItem] = useState("");

  return (
    <div style={{ borderRadius: 16, border: `1px solid ${P.line}`, background: P.bg }}>
      <button onClick={() => setOpen((o) => !o)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
        <span style={{ fontFamily: SERIF, fontSize: 15, color: P.ink }}>{session.title}</span>
        <span style={{ fontFamily: BODY, fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 100, background: session.status === "hecha" ? P.accent + "22" : P.line, color: session.status === "hecha" ? P.accent : P.muted }}>
          {session.status === "hecha" ? "Hecha" : "Agendada"}
        </span>
        <span style={{ marginLeft: "auto", fontFamily: BODY, fontSize: 12, color: P.muted }}>{prettyDay(session.date)}</span>
        <span style={{ color: P.muted }}>{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div style={{ borderTop: `1px solid ${P.line}`, padding: "14px" }}>
          <Label P={P}>Qué tocar ese día</Label>
          {session.agenda.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 8 }}>
              {session.agenda.map((a, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: BODY, fontSize: 14, color: P.ink }}>
                  <span style={{ color: P.accent }}>•</span><span style={{ flex: 1 }}>{a}</span>
                  <button onClick={() => m.removeAgenda(session.id, i)} style={{ background: "none", border: "none", color: P.muted, cursor: "pointer" }}>×</button>
                </div>
              ))}
            </div>
          )}
          <form onSubmit={(e) => { e.preventDefault(); if (agendaInput.trim()) { m.addAgenda(session.id, agendaInput.trim()); setAgendaInput(""); } }} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <input value={agendaInput} onChange={(e) => setAgendaInput(e.target.value)} placeholder="Agregar punto…" style={{ ...fieldStyle(P), flex: 1 }} />
            <button type="submit" style={{ ...aiMini(P), padding: "0 12px" }}>+</button>
          </form>

          <Label P={P}>Notas de la sesión</Label>
          <textarea value={session.notes} onChange={(e) => m.updateSession(session.id, { notes: e.target.value })} rows={3} placeholder="Lo que pasó, acuerdos, observaciones…" style={{ ...fieldStyle(P), resize: "none", marginBottom: 16 }} />

          <Label P={P}>Compromisos</Label>
          {session.actionItems.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 8 }}>
              {session.actionItems.map((a) => (
                <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: BODY, fontSize: 14 }}>
                  <button onClick={() => m.toggleAction(session.id, a.id)} style={{ width: 18, height: 18, borderRadius: 5, border: `1.5px solid ${a.done ? P.accent : P.line}`, background: a.done ? P.accent : "transparent", color: "#fff", cursor: "pointer", fontSize: 11, flexShrink: 0 }}>{a.done ? "✓" : ""}</button>
                  <span style={{ color: a.done ? P.muted : P.ink, textDecoration: a.done ? "line-through" : "none" }}>{a.text}</span>
                </div>
              ))}
            </div>
          )}
          <form onSubmit={(e) => { e.preventDefault(); if (item.trim()) { m.addAction(session.id, item.trim()); setItem(""); } }} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <input value={item} onChange={(e) => setItem(e.target.value)} placeholder="Nuevo compromiso…" style={{ ...fieldStyle(P), flex: 1 }} />
            <button type="submit" style={{ ...aiMini(P), padding: "0 12px" }}>+</button>
          </form>

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <button onClick={() => onLive(session.id)} style={aiMini(P)}>▶ Iniciar en vivo</button>
            <button onClick={() => m.updateSession(session.id, { status: session.status === "hecha" ? "agendada" : "hecha" })} style={{ fontFamily: BODY, fontSize: 13, padding: "8px 14px", borderRadius: 100, border: `1px solid ${P.line}`, background: "transparent", color: P.muted, cursor: "pointer" }}>
              {session.status === "hecha" ? "Marcar agendada" : "Marcar hecha"}
            </button>
            <button onClick={() => m.removeSession(session.id)} style={{ marginLeft: "auto", fontFamily: BODY, fontSize: 13, color: P.muted, background: "none", border: "none", cursor: "pointer" }}>Eliminar</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══ NOTES ═══
function NotesPanel({ P, data, m, coacheeId, title }) {
  const [text, setText] = useState("");
  const notes = data.notes.filter((n) => n.coacheeId === coacheeId).sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return a.createdAt < b.createdAt ? 1 : -1;
  });

  return (
    <div style={{ ...card(P), padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h3 style={sectionH(P)}>{title}</h3>
        {notes.length > 0 && <span style={{ fontFamily: BODY, fontSize: 12, color: P.muted }}>{notes.length}</span>}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); if (text.trim()) { m.addNote(coacheeId, text.trim()); setText(""); } }} style={{ marginBottom: 12 }}>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} placeholder="Anota algo para acordarte…" style={{ ...fieldStyle(P), resize: "none" }} />
        <button type="submit" disabled={!text.trim()} style={{ ...aiMini(P), marginTop: 8, opacity: text.trim() ? 1 : 0.5 }}>Guardar nota</button>
      </form>
      {notes.length === 0 ? (
        <p style={{ fontFamily: BODY, fontSize: 13, color: P.muted, textAlign: "center", padding: "8px 0" }}>Sin notas todavía.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {notes.map((n) => (
            <div key={n.id} style={{ borderRadius: 16, border: `1px solid ${n.pinned ? P.accent + "66" : P.line}`, background: n.pinned ? P.accent + "11" : P.bg, padding: "10px 14px" }}>
              <p style={{ fontFamily: BODY, fontSize: 14, color: P.ink, whiteSpace: "pre-wrap", margin: 0 }}>{n.text}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 6, fontFamily: BODY, fontSize: 11, color: P.muted }}>
                <span>{prettyDay(n.createdAt.slice(0, 10))}</span>
                <button onClick={() => m.updateNote(n.id, { pinned: !n.pinned })} style={{ background: "none", border: "none", color: P.muted, cursor: "pointer" }}>{n.pinned ? "Desanclar" : "Anclar"}</button>
                <button onClick={() => m.removeNote(n.id)} style={{ marginLeft: "auto", background: "none", border: "none", color: P.muted, cursor: "pointer" }}>Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══ DOCS ═══
function DocsPanel({ P, data, m, coacheeId, title }) {
  const [linkMode, setLinkMode] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkName, setLinkName] = useState("");
  const [error, setError] = useState(null);
  const docs = data.docs.filter((d) => d.coacheeId === coacheeId);

  const onFile = (e) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE) { setError(`Máximo ${humanSize(MAX_FILE)} por archivo.`); e.target.value = ""; return; }
    const reader = new FileReader();
    reader.onload = () => m.addDoc({ coacheeId, name: file.name, kind: "file", url: String(reader.result), size: file.size });
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const addLink = () => {
    if (!linkUrl.trim()) return;
    let url = linkUrl.trim();
    if (!/^https?:\/\//i.test(url)) url = "https://" + url;
    m.addDoc({ coacheeId, name: linkName.trim() || url.replace(/^https?:\/\//, "").slice(0, 40), kind: "link", url });
    setLinkUrl(""); setLinkName(""); setLinkMode(false);
  };

  return (
    <div style={{ ...card(P), padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h3 style={sectionH(P)}>{title}</h3>
        {docs.length > 0 && <span style={{ fontFamily: BODY, fontSize: 12, color: P.muted }}>{docs.length}</span>}
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        <label style={{ ...aiMini(P), cursor: "pointer" }}>
          ⬆ Subir archivo
          <input type="file" onChange={onFile} style={{ display: "none" }} />
        </label>
        <button onClick={() => setLinkMode((v) => !v)} style={{ fontFamily: BODY, fontSize: 13, fontWeight: 600, padding: "9px 16px", borderRadius: 100, border: `1px solid ${P.line}`, background: "transparent", color: P.muted, cursor: "pointer" }}>🔗 Enlace</button>
      </div>
      {error && <p style={{ fontFamily: BODY, fontSize: 12, color: P.accent, marginBottom: 8 }}>{error}</p>}
      {linkMode && (
        <div style={{ ...card(P), background: P.bg, padding: 12, marginBottom: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          <input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://drive.google.com/…" style={fieldStyle(P)} />
          <input value={linkName} onChange={(e) => setLinkName(e.target.value)} placeholder="Nombre (opcional)" style={fieldStyle(P)} />
          <button onClick={addLink} style={{ ...primaryBtn(P), alignSelf: "flex-start", padding: "9px 18px", fontSize: 13 }}>Guardar enlace</button>
        </div>
      )}
      {docs.length === 0 ? (
        <p style={{ fontFamily: BODY, fontSize: 13, color: P.muted, textAlign: "center", padding: "8px 0" }}>Sube contratos, cuestionarios o material para acordarte.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {docs.map((d) => (
            <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 10, borderRadius: 12, border: `1px solid ${P.line}`, background: P.bg, padding: "8px 12px" }}>
              <span style={{ fontSize: 16 }}>{d.kind === "link" ? "🔗" : "📄"}</span>
              <a href={d.url} target="_blank" rel="noopener noreferrer" download={d.kind === "file" ? d.name : undefined} style={{ flex: 1, minWidth: 0, fontFamily: BODY, fontSize: 14, color: P.ink, textDecoration: "none", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={d.name}>{d.name}</a>
              {d.size ? <span style={{ fontFamily: BODY, fontSize: 11, color: P.muted, flexShrink: 0 }}>{humanSize(d.size)}</span> : null}
              <button onClick={() => m.removeDoc(d.id)} style={{ background: "none", border: "none", color: P.muted, cursor: "pointer", flexShrink: 0 }}>×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══ LIVE SESSION (pantalla completa, para compartir) ═══
function LiveSession({ P, data, coachee, sessionId, m, onExit }) {
  const sessions = data.sessions.filter((s) => s.coacheeId === coachee.id).sort((a, b) => (a.date < b.date ? 1 : -1));
  const today = dayId();
  const initial = sessions.find((s) => s.id === sessionId) || sessions.find((s) => s.date === today) || sessions.find((s) => s.status === "agendada") || sessions[0];
  const [selId, setSelId] = useState(initial?.id);
  const session = sessions.find((s) => s.id === selId) || initial;

  const milestones = data.milestones.filter((x) => x.coacheeId === coachee.id).sort((a, b) => (a.date < b.date ? -1 : 1));
  const doneCount = milestones.filter((x) => x.done).length;
  const pct = milestones.length ? Math.round((doneCount / milestones.length) * 100) : 0;
  const openItems = sessions.filter((s) => s.id !== session?.id).flatMap((s) => s.actionItems.filter((a) => !a.done).map((a) => ({ ...a, sessionId: s.id })));

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 28px 60px" }}>
      {/* barra superior */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 34 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: P.muted }}>
          <Heart color={P.accent} size={20} />
          <span style={{ fontFamily: SERIF, fontSize: 14, letterSpacing: "0.2em" }}>SESIÓN EN VIVO</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {sessions.length > 1 && (
            <select value={session?.id} onChange={(e) => setSelId(e.target.value)} style={{ fontFamily: BODY, fontSize: 14, padding: "8px 14px", borderRadius: 100, border: `1px solid ${P.line}`, background: P.card, color: P.ink, outline: "none" }}>
              {sessions.map((s) => <option key={s.id} value={s.id}>{s.title} · {prettyDay(s.date)}</option>)}
            </select>
          )}
          <button onClick={onExit} style={{ fontFamily: BODY, fontSize: 14, padding: "8px 18px", borderRadius: 100, border: `1px solid ${P.line}`, background: "transparent", color: P.muted, cursor: "pointer" }}>Salir</button>
        </div>
      </div>

      {/* encabezado grande */}
      <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 34 }}>
        <span style={{ width: 66, height: 66, borderRadius: 24, background: coachee.color, color: "#fff", fontFamily: SERIF, fontSize: 30, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 18px 40px rgba(0,0,0,.16)" }}>
          {coachee.name.charAt(0).toUpperCase()}
        </span>
        <div>
          <h1 style={{ fontFamily: SERIF, fontSize: "clamp(2rem,5vw,2.6rem)", color: P.ink, margin: 0, lineHeight: 1.05 }}>{coachee.name}</h1>
          {coachee.role && <p style={{ fontFamily: ITALIC, fontStyle: "italic", fontSize: 17, color: P.accent, margin: 0 }}>{coachee.role}</p>}
        </div>
      </div>

      {/* objetivo */}
      {coachee.goal && (
        <div style={{ background: P.accent, color: "#fff", borderRadius: 26, padding: 28, marginBottom: 34, boxShadow: "0 18px 44px rgba(0,0,0,.14)" }}>
          <div style={{ fontFamily: BODY, fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.85, marginBottom: 6 }}>Nuestro objetivo</div>
          <div style={{ fontFamily: SERIF, fontSize: "clamp(1.4rem,3vw,1.9rem)", lineHeight: 1.2 }}>{coachee.goal}</div>
        </div>
      )}

      {/* avance */}
      <div style={{ marginBottom: 34 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 }}>
          <h2 style={{ fontFamily: SERIF, fontSize: 22, color: P.ink, margin: 0 }}>Tu avance</h2>
          <span style={{ fontFamily: BODY, fontSize: 14, color: P.muted }}>{doneCount} de {milestones.length} hitos · {pct}%</span>
        </div>
        <div style={{ height: 10, borderRadius: 100, background: P.line, overflow: "hidden", marginBottom: 16 }}>
          <div style={{ height: "100%", width: `${pct}%`, background: P.accent, borderRadius: 100 }} />
        </div>
        {milestones.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {milestones.map((x) => (
              <span key={x.id} style={{ fontFamily: BODY, fontSize: 14, padding: "8px 14px", borderRadius: 100, background: x.done ? P.accent + "22" : "transparent", border: x.done ? "none" : `1px solid ${P.line}`, color: x.done ? P.accent : P.muted }}>
                {x.done ? "✓ " : ""}{x.title}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* lo que tocamos hoy */}
      <div style={{ marginBottom: 34 }}>
        <h2 style={{ fontFamily: SERIF, fontSize: 22, color: P.ink, margin: "0 0 14px" }}>Lo que vamos a tocar hoy</h2>
        {session && session.agenda.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {session.agenda.map((a, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, background: P.card, padding: "16px 20px", borderRadius: 18, boxShadow: "0 8px 24px rgba(0,0,0,.05)", fontFamily: BODY, fontSize: 18, color: P.ink }}>
                <span style={{ width: 28, height: 28, borderRadius: "50%", background: P.accent + "22", color: P.accent, fontFamily: SERIF, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</span>
                {a}
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontFamily: BODY, fontSize: 15, color: P.muted, background: P.card, padding: "16px 20px", borderRadius: 18, boxShadow: "0 8px 24px rgba(0,0,0,.05)" }}>
            No hay agenda para esta sesión. Puedes agregarla desde el perfil.
          </p>
        )}
      </div>

      {/* compromisos pendientes */}
      {openItems.length > 0 && (
        <div style={{ marginBottom: 34 }}>
          <h2 style={{ fontFamily: SERIF, fontSize: 22, color: P.ink, margin: "0 0 14px" }}>Compromisos de la sesión pasada</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {openItems.map((a) => (
              <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: BODY, fontSize: 17 }}>
                <button onClick={() => m.toggleAction(a.sessionId, a.id)} style={{ width: 24, height: 24, borderRadius: 7, border: `1.5px solid ${P.line}`, background: "transparent", cursor: "pointer", flexShrink: 0 }} />
                <span style={{ color: P.ink }}>{a.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* notas en vivo */}
      {session && (
        <div>
          <h2 style={{ fontFamily: SERIF, fontSize: 22, color: P.ink, margin: "0 0 14px" }}>Notas de hoy</h2>
          <textarea value={session.notes} onChange={(e) => m.updateSession(session.id, { notes: e.target.value })} rows={5} placeholder="Escribe aquí lo que vaya saliendo en la sesión…"
            style={{ width: "100%", fontFamily: BODY, fontSize: 17, lineHeight: 1.6, padding: "18px 22px", borderRadius: 22, border: `1px solid ${P.line}`, background: P.card, color: P.ink, outline: "none", resize: "none", boxShadow: "0 8px 24px rgba(0,0,0,.05)" }} />
        </div>
      )}
    </div>
  );
}

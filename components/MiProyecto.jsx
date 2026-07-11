"use client";

import { useState, useEffect } from "react";
import { store } from "@/lib/store";
import { askClaude, parseLines } from "@/lib/ai";
import {
  SERIF, BODY, ITALIC, dayId,
  Heart, H1, Sub, Label,
  inputBig, inputSm, chip, primaryBtn, aiMini,
} from "@/components/ui";

// ═══════════════════════════════════════════════════════════
//  MI PROYECTO — "tú también puedes crear tu proyecto"
//  Wizard → plan tailor-made → tareas + inspiración + checkpoint semanal
// ═══════════════════════════════════════════════════════════

const GOALS = ["Aterrizar la idea", "Lanzarlo al mundo", "Primeros clientes", "Construir mi marca", "Ingresos extra", "Cambiar de rumbo"];
const ACTIVITIES = ["Trabajo de tiempo completo", "Media jornada", "Hijos / familia", "Estudios", "Ejercicio", "Vida social", "Cuidado personal"];
const FREE_HOURS = [["30 min", 0.5], ["1 hora", 1], ["2 horas", 2], ["3+ horas", 3]];
const INSPO_TYPES = [
  { key: "quote", label: "Quote", icon: "❝" },
  { key: "idea", label: "Idea", icon: "✨" },
  { key: "referente", label: "Referente", icon: "◎" },
  { key: "link", label: "Link", icon: "→" },
];

// Plan base cuando la IA no está disponible — igual arranca con algo digno.
const FALLBACK_PLAN = [
  "Escribe en una frase qué problema resuelves",
  "Define para quién es tu proyecto",
  "Platícalo con tres personas de confianza",
  "Anota lo que aprendiste de esas pláticas",
  "Haz la versión más pequeña posible de tu idea",
  "Ponle nombre y una línea que lo describa",
  "Compártelo con una primera persona real",
  "Recoge su reacción y ajusta una cosa",
  "Define tu siguiente paso del mes",
];

// Lunes de la semana actual (zona horaria local) — id del checkpoint semanal.
function weekId() {
  const d = new Date();
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day);
  return dayId(d);
}

export default function ProjectView({ P, profile, premium, onPremium }) {
  const [projects, setProjects] = useState(null); // null = cargando
  const [current, setCurrent] = useState(0);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    (async () => {
      const list = (await store.get("tp:projects")) || [];
      setProjects(list);
    })();
  }, []);

  const save = async (list) => {
    setProjects(list);
    await store.set("tp:projects", list);
  };

  const addProject = async (proj) => {
    const list = [...(projects || []), proj];
    await save(list);
    setCurrent(list.length - 1);
    setCreating(false);
  };

  const updateProject = async (patch) => {
    const list = projects.map((p, i) => (i === current ? { ...p, ...patch } : p));
    await save(list);
  };

  if (projects === null) {
    return <div style={{ maxWidth: 1120, margin: "0 auto", padding: "60px 24px", textAlign: "center", color: P.muted }}>cargando tu proyecto…</div>;
  }

  if (projects.length === 0 || creating) {
    return <ProjectWizard P={P} profile={profile} onDone={addProject} onCancel={projects.length ? () => setCreating(false) : null} />;
  }

  const project = projects[current] || projects[0];

  return (
    <div style={{ maxWidth: 1120, margin: "0 auto", padding: "36px 24px 130px" }}>
      {/* Selector de proyectos */}
      <div className="fade" style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 26 }}>
        {projects.map((p, i) => (
          <button key={i} onClick={() => setCurrent(i)} style={{ ...chip(P, i === current), padding: "8px 16px", fontSize: 13 }}>{p.name}</button>
        ))}
        <button onClick={() => setCreating(true)} style={{ ...chip(P, false), padding: "8px 16px", fontSize: 13, borderStyle: "dashed" }}>+ Nuevo</button>
      </div>

      <ProjectBoard P={P} profile={profile} project={project} update={updateProject} premium={premium} onPremium={onPremium} />
    </div>
  );
}

// ═══ WIZARD: CREA TU PROYECTO ═══
function ProjectWizard({ P, profile, onDone, onCancel }) {
  const [q, setQ] = useState(0);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [goals, setGoals] = useState([]);
  const [goalExtra, setGoalExtra] = useState("");
  const [activities, setActivities] = useState([]);
  const [freeHours, setFreeHours] = useState(null);
  const [building, setBuilding] = useState(false);

  const toggle = (list, set, v) => set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  const canNext = [name.trim() && desc.trim(), goals.length || goalExtra.trim(), activities.length && freeHours !== null, true][q];

  const finish = async () => {
    setBuilding(true);
    const allGoals = [...goals, ...(goalExtra.trim() ? [goalExtra.trim()] : [])];
    const dedicacion = (freeHours || 1) + 1; // sus horas libres + 1 hora recuperada con productividad
    const r = await askClaude(
      `Soy ${profile.name} y trabajo en ${profile.role}. Mi proyecto personal se llama "${name.trim()}": ${desc.trim()}. Lo que busco: ${allGoals.join(", ")}. Mi carga diaria: ${activities.join(", ")}. Puedo dedicarle ${dedicacion} horas al día.\n\nDiséñame un plan de trabajo inicial: 9 tareas concretas y accionables en orden (de aterrizar la idea a los primeros pasos reales), realistas para ese tiempo. Una por línea, sin números ni viñetas, máximo 10 palabras cada una. Acentos impecables.`,
      null, 500,
    );
    const planTasks = parseLines(r, 10);
    onDone({
      id: `p${Math.random().toString(36).slice(2, 8)}`,
      name: name.trim(),
      desc: desc.trim(),
      goals: allGoals,
      activities,
      freeHours: freeHours || 1,
      dedicacion,
      tasks: (planTasks.length >= 5 ? planTasks : FALLBACK_PLAN).map((t) => ({ text: t, done: false })),
      inspo: [],
      checkpoints: [],
      tips: null,
      createdAt: dayId(),
    });
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "44px 24px 120px" }}>
      <div className="glass fade" key={q} style={{ maxWidth: 640, width: "100%", borderRadius: q % 2 ? "84px 52px 84px 52px" : "52px 84px 52px 84px", padding: "clamp(30px, 5.5vw, 52px)", textAlign: "center" }}>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 34 }}>
          {[0, 1, 2, 3].map((i) => <div key={i} style={{ width: i === q ? 30 : 8, height: 8, borderRadius: 100, background: i <= q ? P.accent : P.line, transition: "all 0.3s" }} />)}
        </div>

        {q === 0 && (
          <>
            <div style={{ fontFamily: ITALIC, fontStyle: "italic", fontSize: 19, color: P.accent, marginBottom: 12 }}>tú también puedes crear tu proyecto <Heart color={P.accent} size={18} /></div>
            <H1 P={P}>Ponle nombre a eso que traes en la cabeza.</H1>
            <Sub P={P}>No tiene que ser perfecto. Tiene que ser tuyo.</Sub>
            <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre de tu proyecto" className="pill-input" style={{ ...inputBig(P), marginBottom: 14 }} />
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="¿Qué es? Cuéntalo como se lo contarías a una amiga…" className="paper" style={{ minHeight: 90, fontSize: 16, lineHeight: 1.7, padding: "6px 2px 12px", color: P.ink, resize: "vertical", maxWidth: 420, margin: "0 auto", display: "block" }} />
          </>
        )}
        {q === 1 && (
          <>
            <H1 P={P}>¿Qué estás buscando?</H1>
            <Sub P={P}>Elige lo que resuene. Esto le da dirección a tu plan.</Sub>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", marginBottom: 18 }}>
              {GOALS.map((g) => <button key={g} onClick={() => toggle(goals, setGoals, g)} style={chip(P, goals.includes(g))}>{g}</button>)}
            </div>
            <input value={goalExtra} onChange={(e) => setGoalExtra(e.target.value)} placeholder="¿Algo más? Escríbelo aquí…" className="pill-input" style={{ ...inputSm(P), maxWidth: 340, width: "100%" }} />
          </>
        )}
        {q === 2 && (
          <>
            <H1 P={P}>Tu semana real.</H1>
            <Sub P={P}>Sin culpa: el plan se adapta a tu vida, no al revés.</Sub>
            <Label P={P}>¿Qué llena tu día a día?</Label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", marginBottom: 28 }}>
              {ACTIVITIES.map((a) => <button key={a} onClick={() => toggle(activities, setActivities, a)} style={chip(P, activities.includes(a))}>{a}</button>)}
            </div>
            <Label P={P}>¿Cuánto tiempo libre real tienes al día?</Label>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              {FREE_HOURS.map(([t, v]) => <button key={t} onClick={() => setFreeHours(v)} style={chip(P, freeHours === v)}>{t}</button>)}
            </div>
          </>
        )}
        {q === 3 && (
          <>
            <H1 P={P}>Aquí viene la magia.</H1>
            <Sub P={P}>Tu tiempo libre + una hora que vamos a recuperar con productividad:</Sub>
            <div className="glass-dark" style={{ borderRadius: "44px 64px 44px 64px", padding: "26px 28px", margin: "0 auto 26px", maxWidth: 400 }}>
              <div style={{ fontFamily: SERIF, fontSize: 30, color: P.paper, lineHeight: 1.3 }}>
                {freeHours === 0.5 ? "30 min" : `${freeHours}h`} libres + 1h recuperada
              </div>
              <div style={{ fontFamily: ITALIC, fontStyle: "italic", fontSize: 19, color: P.paperSoft, marginTop: 6 }}>
                = {(freeHours || 1) + 1} horas al día para "{name || "tu proyecto"}"
              </div>
            </div>
            <div style={{ fontSize: 14.5, color: P.muted, lineHeight: 1.65, maxWidth: 420, margin: "0 auto" }}>
              Con eso y tus metas, tu guía te arma un plan de trabajo hecho a tu medida — y adentro encontrarás los tips para recuperar esa hora.
            </div>
          </>
        )}

        <div style={{ marginTop: 38, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          {q < 3 && <button onClick={() => setQ(q + 1)} disabled={!canNext} style={primaryBtn(P, !canNext)}>Continuar →</button>}
          {q === 3 && <button onClick={finish} disabled={building} className={building ? "" : "glow"} style={primaryBtn(P, building)}>{building ? "Diseñando tu plan…" : "✦ Crear mi plan"}</button>}
          {onCancel && !building && <button onClick={onCancel} style={{ fontFamily: BODY, fontSize: 13, color: P.muted, background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>Cancelar</button>}
        </div>
      </div>
    </div>
  );
}

// ═══ TABLERO DEL PROYECTO ═══
function ProjectBoard({ P, profile, project, update, premium, onPremium }) {
  const tasks = project.tasks || [];
  const done = tasks.filter((t) => t.done).length;
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  const checkpoints = project.checkpoints || [];
  const greens = checkpoints.filter((c) => c.light === "verde").length;

  return (
    <>
      {/* Hero del proyecto + capacidad */}
      <div className="hero-flex" style={{ marginBottom: 26 }}>
        <div className="fade d1" style={{ flex: "1.15 1 0", minWidth: 0, paddingTop: 8 }}>
          <div style={{ fontFamily: ITALIC, fontStyle: "italic", fontSize: 17, color: P.accent, marginBottom: 6 }}>tu proyecto</div>
          <div style={{ fontFamily: SERIF, fontWeight: 400, fontSize: "clamp(1.9rem, 4.4vw, 3rem)", lineHeight: 1.1, color: P.ink }}>{project.name}</div>
          <div style={{ fontFamily: ITALIC, fontStyle: "italic", fontSize: 17, color: P.muted, margin: "12px 0 16px", lineHeight: 1.55, maxWidth: 520 }}>{project.desc}</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {(project.goals || []).map((g, i) => (
              <span key={i} className="glass-soft" style={{ padding: "6px 13px", borderRadius: 100, fontSize: 12.5, color: P.accent, fontWeight: 600 }}>{g}</span>
            ))}
          </div>
          <div style={{ display: "flex", gap: 14, marginTop: 20, flexWrap: "wrap" }}>
            <Metric P={P} big={`${pct}%`} label="del plan" />
            <Metric P={P} big={`${done}/${tasks.length}`} label="tareas" />
            <Metric P={P} big={checkpoints.length} label="checkpoints" />
            <Metric P={P} big={greens} label="semanas en verde" />
          </div>
        </div>
        <div className="fade d2" style={{ flex: "1 1 0", minWidth: 0 }}>
          <CapacityCard P={P} profile={profile} project={project} update={update} />
        </div>
      </div>

      {/* Plan + Checkpoint */}
      <div className="bento" style={{ marginBottom: 22 }}>
        <div className="w4 fade d2"><PlanCard P={P} profile={profile} project={project} update={update} premium={premium} onPremium={onPremium} /></div>
        <div className="w2 fade d3"><CheckpointCard P={P} project={project} update={update} premium={premium} onPremium={onPremium} /></div>
        <div className="w6 fade d4"><InspoWall P={P} project={project} update={update} /></div>
      </div>

      {/* Coaching 1-1 */}
      <CoachingCard P={P} project={project} update={update} />
    </>
  );
}

// ── Coaching 1-1 con Fer + notas de sesión ──────────────────
function CoachingCard({ P, project, update }) {
  const hasCoaching = Boolean(project.coaching);
  const notes = project.coachingNotes || [];
  const [adding, setAdding] = useState(false);
  const [text, setText] = useState("");
  const [date, setDate] = useState(dayId());
  const [editing, setEditing] = useState(null); // índice de la nota en edición

  const saveNote = async () => {
    if (!text.trim()) return;
    let next;
    if (editing !== null) {
      next = notes.map((n, i) => (i === editing ? { ...n, date, text: text.trim() } : n));
    } else {
      next = [{ date, text: text.trim(), at: dayId() }, ...notes];
    }
    next.sort((a, b) => (a.date < b.date ? 1 : -1));
    await update({ coachingNotes: next });
    setText(""); setDate(dayId()); setAdding(false); setEditing(null);
  };

  const editNote = (i) => {
    setEditing(i); setText(notes[i].text); setDate(notes[i].date); setAdding(true);
  };

  const delNote = async (i) => {
    await update({ coachingNotes: notes.filter((_, j) => j !== i) });
    if (editing === i) { setEditing(null); setAdding(false); setText(""); }
  };

  const fmtDate = (d) => {
    try {
      return new Date(`${d}T12:00:00`).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });
    } catch { return d; }
  };

  return (
    <div className="glass-dark tilt-l fade d5" style={{ borderRadius: "64px 40px 64px 40px", padding: "28px 32px" }}>
      <div style={{ display: "flex", gap: 20, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
        <div style={{ minWidth: 240, flex: 1 }}>
          <div style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: P.paperSoft, marginBottom: 8 }}>{hasCoaching ? "Tu acompañamiento" : "¿Lo quieres guiado?"}</div>
          <div style={{ fontFamily: SERIF, fontSize: 22, color: P.paper, lineHeight: 1.25, marginBottom: 6 }}>Coaching 1-1 con Fer</div>
          <div style={{ fontFamily: ITALIC, fontStyle: "italic", fontSize: 15, color: P.paperSoft, lineHeight: 1.5 }}>
            {hasCoaching
              ? "Tus notas de cada sesión viven aquí — llega a la siguiente con todo fresco."
              : "Sesiones donde revisamos juntas tu proyecto con tus datos y métricas de la app."}
          </div>
        </div>
        {!hasCoaching && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-end" }}>
            <a href="https://instagram.com/theprojectbyfer" target="_blank" rel="noreferrer" style={{ ...primaryBtn(P), textDecoration: "none", display: "inline-block", whiteSpace: "nowrap" }}>Mándame un DM ✦</a>
            <button onClick={() => update({ coaching: true })} style={{ fontFamily: BODY, fontSize: 12.5, color: P.paperSoft, background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
              Ya tengo coaching con Fer →
            </button>
          </div>
        )}
        {hasCoaching && !adding && (
          <button onClick={() => { setAdding(true); setEditing(null); setText(""); setDate(dayId()); }} style={{ ...primaryBtn(P), whiteSpace: "nowrap" }}>+ Nota de sesión</button>
        )}
      </div>

      {hasCoaching && (
        <div style={{ marginTop: 20 }}>
          {adding && (
            <div className="fade" style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: "28px 40px 28px 40px", padding: "16px 18px", marginBottom: 14 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10, flexWrap: "wrap" }}>
                <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: P.paperSoft }}>{editing !== null ? "Editar nota" : "Sesión del"}</span>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ fontFamily: BODY, fontSize: 13, color: P.paper, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.16)", borderRadius: 100, padding: "5px 12px", colorScheme: "dark" }} />
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                autoFocus
                placeholder="Acuerdos, aprendizajes, tareas para la próxima sesión…"
                style={{ width: "100%", minHeight: 90, fontFamily: BODY, fontSize: 14.5, lineHeight: 1.65, color: P.paper, background: "transparent", border: "none", outline: "none", resize: "vertical" }}
              />
              <div style={{ display: "flex", gap: 10, marginTop: 8, alignItems: "center" }}>
                <button onClick={saveNote} disabled={!text.trim()} style={{ ...aiMini(P), background: text.trim() ? P.accent : "transparent", color: text.trim() ? P.card : P.paperSoft, borderColor: text.trim() ? P.accent : "rgba(255,255,255,0.2)" }}>Guardar nota</button>
                <button onClick={() => { setAdding(false); setEditing(null); setText(""); }} style={{ fontFamily: BODY, fontSize: 12.5, color: P.paperSoft, background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>Cancelar</button>
              </div>
            </div>
          )}

          {notes.length === 0 && !adding && (
            <div style={{ fontFamily: ITALIC, fontStyle: "italic", fontSize: 14, color: P.paperSoft }}>Aún no hay notas — después de tu próxima sesión, guarda aquí lo importante.</div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {notes.map((n, i) => (
              <div key={i} className="fade" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: i % 2 ? "36px 22px 36px 22px" : "22px 36px 22px 36px", padding: "14px 18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: ITALIC, fontStyle: "italic", fontSize: 13.5, color: P.paperSoft }}>Sesión · {fmtDate(n.date)}</span>
                  <span style={{ display: "flex", gap: 12 }}>
                    <button onClick={() => editNote(i)} style={{ fontSize: 11.5, color: P.paperSoft, background: "none", border: "none", cursor: "pointer", textDecoration: "underline", fontFamily: BODY }}>editar</button>
                    <button onClick={() => delNote(i)} style={{ fontSize: 11.5, color: P.paperSoft, background: "none", border: "none", cursor: "pointer", fontFamily: BODY, opacity: 0.7 }}>✕</button>
                  </span>
                </div>
                <div style={{ fontFamily: BODY, fontSize: 14, lineHeight: 1.65, color: P.paper, whiteSpace: "pre-wrap" }}>{n.text}</div>
              </div>
            ))}
          </div>

          <button onClick={() => update({ coaching: false })} style={{ marginTop: 14, fontFamily: BODY, fontSize: 11.5, color: P.paperSoft, opacity: 0.7, background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
            Ya no tengo coaching
          </button>
        </div>
      )}
    </div>
  );
}

function Metric({ P, big, label }) {
  return (
    <div className="glass-soft" style={{ padding: "10px 16px", borderRadius: 100, display: "flex", alignItems: "baseline", gap: 7 }}>
      <span style={{ fontFamily: SERIF, fontSize: 21, color: P.accent }}>{big}</span>
      <span style={{ fontSize: 12, color: P.muted }}>{label}</span>
    </div>
  );
}

// ── Capacidad + tips de eficiencia ──────────────────────────
function CapacityCard({ P, profile, project, update }) {
  const [loading, setLoading] = useState(false);
  const genTips = async () => {
    setLoading(true);
    const r = await askClaude(
      `Trabajo en ${profile.role} y mi día incluye: ${(project.activities || []).join(", ")}. Dame 3 tips concretos de productividad para liberar al menos una hora diaria, aplicados a mi carga real (nada genérico). Uno por línea, sin números, máximo 18 palabras cada uno. Acentos impecables.`,
      null, 300,
    );
    const tips = parseLines(r, 3);
    if (tips.length) update({ tips });
    setLoading(false);
  };

  return (
    <div className="glass-dark floaty" style={{ borderRadius: "48px 68px 42px 74px", padding: "26px 28px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <Heart color={P.paperSoft} size={16} />
        <div style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: P.paperSoft }}>Tu capacidad</div>
      </div>
      <div style={{ fontFamily: SERIF, fontSize: 24, color: P.paper, lineHeight: 1.25, marginBottom: 8 }}>
        {project.freeHours === 0.5 ? "30 min" : `${project.freeHours}h`} libres + 1h recuperada = {project.dedicacion}h al día
      </div>
      <div style={{ fontSize: 13, color: P.paperSoft, marginBottom: 14 }}>
        Tu carga: {(project.activities || []).join(" · ")}
      </div>
      {project.tips ? (
        <div className="fade">
          <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: P.paperSoft, margin: "14px 0 8px" }}>✦ Para recuperar tu hora</div>
          {project.tips.map((t, i) => (
            <div key={i} style={{ display: "flex", gap: 9, alignItems: "flex-start", padding: "6px 0", fontSize: 14, lineHeight: 1.55, color: P.paper + "E6" }}>
              <span style={{ color: P.paperSoft, flexShrink: 0 }}>✦</span> {t}
            </div>
          ))}
          <button onClick={genTips} disabled={loading} style={{ fontFamily: BODY, fontSize: 12, color: P.paperSoft, background: "none", border: "none", cursor: "pointer", textDecoration: "underline", padding: 0, marginTop: 8 }}>
            {loading ? "Pensando…" : "Dame otros tips"}
          </button>
        </div>
      ) : (
        <button onClick={genTips} disabled={loading} style={{ fontFamily: BODY, fontSize: 13, fontWeight: 600, padding: "10px 18px", borderRadius: 100, border: `1px solid ${P.paperSoft}`, background: "transparent", color: P.paper, cursor: "pointer", marginTop: 6 }}>
          {loading ? "Pensando en tu día…" : "✦ Tips para recuperar 1 hora"}
        </button>
      )}
    </div>
  );
}

// ── Plan de trabajo (task management) ───────────────────────
function PlanCard({ P, profile, project, update, premium, onPremium }) {
  const [input, setInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const tasks = project.tasks || [];

  const setTasks = (t) => update({ tasks: t });
  const add = () => { if (input.trim()) { setTasks([...tasks, { text: input.trim(), done: false }]); setInput(""); } };
  const toggle = (i) => { const a = [...tasks]; a[i].done = !a[i].done; setTasks(a); };
  const del = (i) => setTasks(tasks.filter((_, j) => j !== i));

  const replan = async () => {
    if (!premium) return onPremium();
    setAiLoading(true);
    const pending = tasks.filter((t) => !t.done).map((t) => t.text).join("; ");
    const r = await askClaude(
      `Mi proyecto "${project.name}" (${project.desc}) busca: ${(project.goals || []).join(", ")}. Le dedico ${project.dedicacion}h al día. Ya completé ${tasks.filter((t) => t.done).length} tareas; me quedan pendientes: ${pending || "ninguna"}.\n\nDame las siguientes 5 tareas concretas para avanzar (no repitas las pendientes). Una por línea, sin números, máximo 10 palabras. Acentos impecables.`,
      null, 300,
    );
    const extra = parseLines(r, 5);
    if (extra.length) setTasks([...tasks, ...extra.map((t) => ({ text: t, done: false }))]);
    setAiLoading(false);
  };

  return (
    <div className="glass tilt-l" style={{ borderRadius: "36px 62px 40px 58px", padding: 26 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: P.ink }}>Tu plan de trabajo</div>
        {tasks.length > 0 && <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: P.accent, border: `1px solid ${P.soft}`, borderRadius: 100, padding: "3px 9px" }}>{tasks.filter((t) => t.done).length}/{tasks.length}</div>}
      </div>
      <div style={{ fontFamily: ITALIC, fontStyle: "italic", fontSize: 14, color: P.muted, marginBottom: 14 }}>Diseñado a tu medida. Palomea, agrega y ajusta — es tuyo.</div>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="Agregar tarea a tu plan…" className="pill-input" style={inputSm(P)} />
        <button onClick={add} style={{ width: 40, height: 40, borderRadius: "50%", border: "none", background: P.accent, color: P.card, fontSize: 18, cursor: "pointer", boxShadow: `0 6px 16px ${P.accent}44`, flexShrink: 0 }}>+</button>
      </div>

      {tasks.map((t, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: `1px dashed ${P.line}` }}>
          <div onClick={() => toggle(i)} style={{ width: 20, height: 20, borderRadius: "50%", border: `1.5px solid ${t.done ? P.accent : P.line}`, background: t.done ? P.accent : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, transition: "all .25s" }}>
            {t.done && <span style={{ color: P.card, fontSize: 11 }}>✓</span>}
          </div>
          <span onClick={() => toggle(i)} style={{ flex: 1, fontSize: 14, color: t.done ? P.muted : P.ink, textDecoration: t.done ? "line-through" : "none", cursor: "pointer", transition: "color .25s" }}>{t.text}</span>
          <button onClick={() => del(i)} style={{ background: "none", border: "none", color: P.muted, cursor: "pointer", fontSize: 16 }}>×</button>
        </div>
      ))}

      <button onClick={replan} disabled={aiLoading} style={{ ...aiMini(P), marginTop: 14 }}>
        {aiLoading ? "Pensando…" : premium ? "✦ Siguientes pasos con IA" : "✦ Siguientes pasos con IA (Premium)"}
      </button>
    </div>
  );
}

// ── Checkpoint semanal (semáforo + reflexión) ───────────────
function CheckpointCard({ P, project, update, premium, onPremium }) {
  const week = weekId();
  const checkpoints = project.checkpoints || [];
  const existing = checkpoints.find((c) => c.week === week);
  const [light, setLight] = useState(existing?.light || null);
  const [note, setNote] = useState(existing?.note || "");
  const [feedback, setFeedback] = useState(existing?.feedback || "");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(Boolean(existing));

  const LIGHTS = [
    ["verde", "🟢", "Avancé"],
    ["amarillo", "🟡", "A medias"],
    ["rojo", "🔴", "Se me fue"],
  ];

  const tasks = project.tasks || [];
  const done = tasks.filter((t) => t.done).length;

  const saveCheckpoint = async (fb = feedback) => {
    const cp = { week, light, note: note.trim(), feedback: fb, done, total: tasks.length, at: dayId() };
    const rest = checkpoints.filter((c) => c.week !== week);
    await update({ checkpoints: [...rest, cp].sort((a, b) => (a.week < b.week ? 1 : -1)) });
    setSaved(true);
  };

  const genFeedback = async () => {
    if (!premium) return onPremium();
    setLoading(true);
    const r = await askClaude(
      `Checkpoint semanal de mi proyecto "${project.name}". Semáforo: ${light}. Completé ${done} de ${tasks.length} tareas del plan. Mi reflexión: "${note.trim() || "sin nota"}".\n\nDame una lectura cálida y honesta de mi semana (máximo 3 líneas) y una sugerencia concreta para la próxima. Sin regañar. Acentos impecables.`,
      null, 300,
    );
    const fb = r || "";
    setFeedback(fb);
    await saveCheckpoint(fb);
    setLoading(false);
  };

  return (
    <div className="glass tilt-r" style={{ borderRadius: "58px 36px 62px 34px", padding: 26 }}>
      <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: P.ink, marginBottom: 4 }}>Checkpoint semanal</div>
      <div style={{ fontFamily: ITALIC, fontStyle: "italic", fontSize: 14, color: P.muted, marginBottom: 16 }}>¿Cómo estuvo tu semana con el proyecto?</div>

      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        {LIGHTS.map(([key, icon, label]) => (
          <button key={key} onClick={() => { setLight(key); setSaved(false); }} style={{ ...chip(P, light === key), flex: 1, justifyContent: "center", padding: "10px 8px", fontSize: 12.5, minWidth: 74 }}>
            {icon} {label}
          </button>
        ))}
      </div>

      <textarea
        value={note}
        onChange={(e) => { setNote(e.target.value); setSaved(false); }}
        placeholder="¿Qué avanzó? ¿Qué lo frenó? Escríbelo sin juzgarte…"
        className="paper"
        style={{ minHeight: 90, fontSize: 15.5, lineHeight: 1.7, padding: "4px 2px 10px", color: P.ink, resize: "vertical" }}
      />

      <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap", alignItems: "center" }}>
        <button onClick={() => saveCheckpoint()} disabled={!light} style={{ ...aiMini(P), background: light ? P.accent : "transparent", color: light ? P.card : P.accent, borderColor: light ? P.accent : P.soft }}>
          {saved ? "Guardado ✓" : "Guardar checkpoint"}
        </button>
        <button onClick={genFeedback} disabled={!light || loading} style={aiMini(P)}>
          {loading ? "Leyendo tu semana…" : premium ? "✦ Feedback de tu guía" : "✦ Feedback (Premium)"}
        </button>
      </div>

      {feedback && (
        <div className="fade glass-soft" style={{ marginTop: 14, borderRadius: "22px 36px 22px 36px", padding: "14px 16px", fontSize: 13.5, lineHeight: 1.6, color: P.ink, whiteSpace: "pre-wrap" }}>{feedback}</div>
      )}

      {checkpoints.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: P.muted, marginBottom: 8 }}>Tus semanas</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {checkpoints.slice(0, 12).map((c, i) => (
              <span key={i} title={`Semana del ${c.week} · ${c.done}/${c.total} tareas${c.note ? ` · "${c.note.slice(0, 80)}"` : ""}`} className="glass-soft" style={{ padding: "5px 11px", borderRadius: 100, fontSize: 12, color: P.muted, cursor: "default" }}>
                {c.light === "verde" ? "🟢" : c.light === "amarillo" ? "🟡" : "🔴"} {c.week.slice(5)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Muro de inspiración (tipo Pinterest) ────────────────────
function InspoWall({ P, project, update }) {
  const [type, setType] = useState("quote");
  const [text, setText] = useState("");
  const inspo = project.inspo || [];

  const add = () => {
    if (!text.trim()) return;
    update({ inspo: [{ type, text: text.trim(), at: dayId() }, ...inspo] });
    setText("");
  };
  const del = (i) => update({ inspo: inspo.filter((_, j) => j !== i) });

  const radii = ["34px 56px 34px 56px", "56px 34px 56px 34px", "34px 34px 56px 34px", "56px 56px 34px 56px"];

  return (
    <div className="glass" style={{ borderRadius: "44px 44px 68px 44px", padding: 26 }}>
      <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: P.ink, marginBottom: 4 }}>Tu inspiración</div>
      <div style={{ fontFamily: ITALIC, fontStyle: "italic", fontSize: 14, color: P.muted, marginBottom: 16 }}>Quotes, referentes, ideas y links que alimentan tu proyecto.</div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {INSPO_TYPES.map((t) => (
            <button key={t.key} onClick={() => setType(t.key)} style={{ ...chip(P, type === t.key), padding: "8px 13px", fontSize: 12.5 }}>{t.icon} {t.label}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, flex: 1, minWidth: 240 }}>
          <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder={type === "link" ? "Pega el link…" : type === "referente" ? "Empresa o persona que te inspira…" : type === "quote" ? "Esa frase que no se te olvida…" : "Esa idea que llegó de la nada…"} className="pill-input" style={inputSm(P)} />
          <button onClick={add} style={{ width: 40, height: 40, borderRadius: "50%", border: "none", background: P.accent, color: P.card, fontSize: 18, cursor: "pointer", boxShadow: `0 6px 16px ${P.accent}44`, flexShrink: 0 }}>+</button>
        </div>
      </div>

      {inspo.length === 0 && (
        <div style={{ fontSize: 13.5, color: P.muted, fontStyle: "italic" }}>Tu muro está esperando. Empieza con la frase o el referente que te trajo hasta aquí.</div>
      )}

      <div style={{ columnWidth: 220, columnGap: 14 }}>
        {inspo.map((item, i) => {
          const isDark = item.type === "quote";
          const t = INSPO_TYPES.find((x) => x.key === item.type) || INSPO_TYPES[1];
          return (
            <div key={i} className={isDark ? "glass-dark lift" : "glass-soft lift"} style={{ breakInside: "avoid", marginBottom: 14, borderRadius: radii[i % radii.length], padding: "18px 20px", position: "relative" }}>
              <button onClick={() => del(i)} style={{ position: "absolute", top: 10, right: 14, background: "none", border: "none", color: isDark ? P.paperSoft : P.muted, cursor: "pointer", fontSize: 14 }}>×</button>
              <div style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: isDark ? P.paperSoft : P.accent, marginBottom: 8 }}>{t.icon} {t.label}</div>
              {item.type === "link" ? (
                <a href={/^https?:\/\//.test(item.text) ? item.text : `https://${item.text}`} target="_blank" rel="noreferrer" style={{ fontSize: 14, color: P.accent, wordBreak: "break-all", lineHeight: 1.5 }}>{item.text}</a>
              ) : (
                <div style={{ fontFamily: item.type === "quote" ? ITALIC : BODY, fontStyle: item.type === "quote" ? "italic" : "normal", fontSize: item.type === "quote" ? 16.5 : 14, lineHeight: 1.55, color: isDark ? P.paper : P.ink }}>
                  {item.type === "quote" ? `"${item.text}"` : item.text}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

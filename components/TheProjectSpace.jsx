"use client";

import { useState, useEffect } from "react";
import { store } from "@/lib/store";

// ═══════════════════════════════════════════════════════════
//  THE PROJECT · Tu espacio
//  Onboarding → check-in matutino → dashboard + historial + progreso
// ═══════════════════════════════════════════════════════════

// ── Paletas: The Project original + variaciones femeninas ───
const PALETTES = {
  original: { name: "Original", bg: "#F1EBDD", card: "#F9F5EC", ink: "#33372C", accent: "#6E7444", accent2: "#B08A5A", soft: "#AAB488", muted: "#9A8F82", line: "#DDD4C4", dark: "#33372C" },
  rosa: { name: "Rosa polvo", bg: "#F0E6E4", card: "#F9F1EF", ink: "#3A2E30", accent: "#A85668", accent2: "#7D8B6A", soft: "#D9A9AE", muted: "#9A8286", line: "#E3D0CE", dark: "#3E2C30" },
  salvia: { name: "Salvia", bg: "#E6E9E0", card: "#F2F4EC", ink: "#2F352C", accent: "#6E8266", accent2: "#B0728A", soft: "#A9BCA0", muted: "#828A7C", line: "#D2D8C8", dark: "#2C332A" },
  malva: { name: "Malva", bg: "#EBE5EA", card: "#F5F0F4", ink: "#332B33", accent: "#8A5E7E", accent2: "#8A9270", soft: "#C4A5BC", muted: "#8E8290", line: "#DDD0DA", dark: "#2F2630" },
  ciruela: { name: "Ciruela", bg: "#ECE3E7", card: "#F6EFF2", ink: "#312530", accent: "#7A4A63", accent2: "#8A9270", soft: "#BC97AC", muted: "#8E8189", line: "#DECDD6", dark: "#2A1F28" },
  coral: { name: "Coral", bg: "#F3E8E2", card: "#FBF4EF", ink: "#3A2A26", accent: "#C36F5A", accent2: "#7D8B6A", soft: "#E0AC9A", muted: "#9E8479", line: "#E8D5CC", dark: "#332420" },
  durazno: { name: "Durazno", bg: "#F2E8DF", card: "#FAF3EC", ink: "#3C2F28", accent: "#C67B5C", accent2: "#7D8B6A", soft: "#E0B49C", muted: "#9C8579", line: "#E7D6C8", dark: "#352820" },
  miel: { name: "Miel", bg: "#F1EADA", card: "#F9F3E6", ink: "#352E20", accent: "#A9822F", accent2: "#7D8B6A", soft: "#D6BC82", muted: "#948970", line: "#E1D5BC", dark: "#2C2618" },
  lavanda: { name: "Lavanda", bg: "#E9E7EF", card: "#F4F2F9", ink: "#2E2B38", accent: "#6B5E96", accent2: "#A87295", soft: "#B4ABD1", muted: "#847E93", line: "#D8D3E4", dark: "#282438" },
  niebla: { name: "Niebla", bg: "#E4E8EA", card: "#F1F4F5", ink: "#293034", accent: "#4E7382", accent2: "#B0728A", soft: "#98B4BE", muted: "#7E888D", line: "#D0D9DC", dark: "#232B2E" },
};

const SERIF = "'Fraunces', Georgia, serif";
const BODY = "'Work Sans', -apple-system, system-ui, sans-serif";
const ITALIC = "'Fraunces', Georgia, serif";

// ── Tips base según el reto (versión gratis) ────────────────
const CHALLENGE_TIPS = {
  "Me siento abrumada": {
    titulo: "Cuando todo pesa a la vez",
    tip: "Elige solo UNA cosa para hoy. No la lista entera — una. El cerebro se calma cuando deja de cargar todo junto. Anótala arriba y deja el resto para después.",
  },
  "No logro desconectar": {
    titulo: "El arte de soltar el trabajo",
    tip: "Ponle una hora de cierre a tu día y hazla ritual: cierra la laptop, escribe lo pendiente para mañana en tu journal, y respira. Tu mente suelta más fácil cuando sabe que nada se va a olvidar.",
  },
  "Quiero organizarme mejor": {
    titulo: "Orden sin agobio",
    tip: "Separa lo laboral de lo personal (aquí ya lo tienes). Al ver tus pendientes en su lugar, dejas de repetirlos en tu cabeza. Empieza el día revisando solo lo de hoy, no todo.",
  },
  "Busco más claridad": {
    titulo: "El camino a la claridad",
    tip: "La claridad no llega pensando más, llega escribiendo. Usa tu journaling hoy para responder: ¿qué es lo que en realidad quiero? Sin filtro. La respuesta suele estar más cerca de lo que crees.",
  },
  "Estoy al borde del burnout": {
    titulo: "Cuidarte es prioridad",
    tip: "El burnout no se resuelve trabajando más. Hoy agenda UNA pausa real (aunque sean 10 minutos) y protégela como una junta. Tu energía es el recurso que todo lo demás necesita.",
  },
};

const dayId = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

// ── IA vía nuestro backend (/api/claude protege la API key) ──
async function askClaude(prompt, system, maxTokens = 800) {
  try {
    const res = await fetch("/api/claude", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, system, maxTokens }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.text || null;
  } catch {
    return null;
  }
}

// ── Corazón SVG ─────────────────────────────────────────────
function Heart({ color, size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "inline-block", verticalAlign: "middle", marginLeft: 3 }}>
      <path d="M12 20.5 C 12 20.5, 3 14.5, 3 8.8 C 3 5.9, 5.2 4, 7.6 4 C 9.4 4, 11 5, 12 6.6 C 13 5, 14.6 4, 16.4 4 C 18.8 4, 21 5.9, 21 8.8 C 21 14.5, 12 20.5, 12 20.5 Z" fill={color} />
    </svg>
  );
}

// ── Grain (textura) ─────────────────────────────────────────
function Grain({ opacity = 0.055 }) {
  const svg = encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>`);
  return <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1, opacity, mixBlendMode: "multiply", backgroundImage: `url("data:image/svg+xml,${svg}")` }} />;
}

// ═══ APP ROOT ═══
export default function TheProjectSpace() {
  const [phase, setPhase] = useState("loading");
  const [profile, setProfile] = useState(null);
  const [premium, setPremium] = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const [dayData, setDayData] = useState(null);

  const P = (profile && PALETTES[profile.paletteKey]) || PALETTES.rosa;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const prof = await store.get("tp:profile");
        if (cancelled) return;
        if (!prof) { setPhase("onboard"); return; }
        setProfile(prof);
        try { if (await store.get("tp:premium")) setPremium(true); } catch {}
        try {
          const today = await store.get(`tp:day:${dayId()}`);
          if (today && today.morningDone) { setDayData(today); setPhase("dashboard"); return; }
        } catch {}
        setPhase("morning");
      } catch {
        // Si el storage falla, arranca en onboarding
        if (!cancelled) setPhase("onboard");
      }
    })();
    // Failsafe: si algo se cuelga, sale de loading en 1.5s
    const t = setTimeout(() => { if (!cancelled) setPhase((p) => (p === "loading" ? "onboard" : p)); }, 1500);
    return () => { cancelled = true; clearTimeout(t); };
  }, []);

  const saveDay = async (data) => { setDayData(data); await store.set(`tp:day:${dayId()}`, data); };
  const completeOnboard = async (prof) => { await store.set("tp:profile", prof); setProfile(prof); setPhase("morning"); };
  const completeMorning = async (md) => {
    const data = { ...md, date: dayId(), tasksWork: [], tasksPersonal: [], journal: "", affirmation: "", morningDone: true };
    await saveDay(data); setPhase("dashboard");
  };
  const goPremium = async () => { setPremium(true); setShowPremium(false); await store.set("tp:premium", true); };
  const resetAll = async () => {
    try {
      const keys = await store.list("tp:");
      for (const k of keys) { await store.delete(k); }
    } catch {}
    setProfile(null); setDayData(null); setPremium(false); setPhase("onboard");
  };

  if (phase === "loading") {
    return <div style={{ minHeight: "100vh", background: P.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: BODY, color: P.muted }}><FontLoader />cargando tu espacio…</div>;
  }

  return (
    <div style={{ minHeight: "100vh", background: P.bg, fontFamily: BODY, color: P.ink, transition: "background 0.6s ease", position: "relative" }}>
      <FontLoader />
      <Grain />
      <div style={{ position: "relative", zIndex: 2 }}>
        {phase === "onboard" && <Onboarding onDone={completeOnboard} />}
        {phase === "morning" && <MorningCheckin P={P} profile={profile} onDone={completeMorning} />}
        {phase === "dashboard" && <Dashboard P={P} profile={profile} dayData={dayData} saveDay={saveDay} premium={premium} onPremium={() => setShowPremium(true)} onNewDay={() => setPhase("morning")} onReset={resetAll} />}
      </div>
      {showPremium && <PremiumModal P={P} onClose={() => setShowPremium(false)} onBuy={goPremium} />}
      <GlobalStyles P={P} />
    </div>
  );
}

// ═══ ONBOARDING ═══
function Onboarding({ onDone }) {
  const [q, setQ] = useState(0);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [paletteKey, setPaletteKey] = useState("");
  const [challenge, setChallenge] = useState("");
  const roles = ["Marketing", "Finanzas", "Ventas", "Producto / Tech", "Consultoría", "Recursos Humanos", "Diseño / Creativo", "Emprendo lo mío", "Otra"];
  const challenges = ["Me siento abrumada", "No logro desconectar", "Quiero organizarme mejor", "Busco más claridad", "Estoy al borde del burnout"];
  const canNext = [name.trim(), role, paletteKey, challenge][q];
  const next = () => { if (q < 3) setQ(q + 1); else onDone({ name: name.trim(), role, paletteKey, challenge }); };
  const previewP = (paletteKey && PALETTES[paletteKey]) || PALETTES.rosa;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, background: previewP.bg, transition: "background 0.6s ease" }}>
      <div className="fade" key={q} style={{ maxWidth: 560, width: "100%", textAlign: "center" }}>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 44 }}>
          {[0, 1, 2, 3].map((i) => <div key={i} style={{ width: i === q ? 30 : 8, height: 8, borderRadius: 100, background: i <= q ? previewP.accent : previewP.line, transition: "all 0.3s" }} />)}
        </div>

        {q === 0 && (
          <>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 30 }}>
              <svg width="40" height="40" viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="18.5" fill="none" stroke={previewP.accent} strokeWidth="1.4" />
                <text x="20" y="27" textAnchor="middle" fontFamily={SERIF} fontSize="16" fill={previewP.ink}>tp</text>
              </svg>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 17, color: previewP.ink, lineHeight: 1 }}>The Project</div>
                <div style={{ fontSize: 11, letterSpacing: "0.3em", color: previewP.accent, marginTop: 3 }}>S P A C E</div>
              </div>
            </div>

            <h1 style={{ fontFamily: SERIF, fontWeight: 600, fontSize: "clamp(2.3rem, 6.5vw, 3.6rem)", lineHeight: 1.08, margin: "0 0 20px", color: previewP.ink }}>
              Tu día, tu mente<br />y tu trabajo —<br /><span style={{ fontStyle: "italic", color: previewP.accent }}>en un solo lugar.</span>
            </h1>
            <p style={{ fontSize: 17, color: previewP.muted, lineHeight: 1.65, maxWidth: 430, margin: "0 auto 12px" }}>
              El espacio diario que junta tus pendientes, tu journaling y tu bienestar. Para dejar de vivir en automático y empezar presente.
            </p>
            <div style={{ fontFamily: ITALIC, fontStyle: "italic", fontSize: 18, color: previewP.accent, margin: "24px 0 36px" }}>
              Vamos a crear el tuyo. ¿Cómo te llamas?
            </div>
            <input autoFocus value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && canNext && next()} placeholder="Tu nombre" style={inputBig(previewP)} />
          </>
        )}
        {q === 1 && (
          <>
            <H1 P={previewP}>Hola, {name} <Heart color={previewP.accent} size={28} /></H1>
            <Sub P={previewP}>¿A qué te dedicas? Esto me ayuda a personalizar tu espacio.</Sub>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
              {roles.map((r) => <button key={r} onClick={() => setRole(r)} style={chip(previewP, role === r)}>{r}</button>)}
            </div>
          </>
        )}
        {q === 2 && (
          <>
            <H1 P={previewP}>Elige tu vibra.</H1>
            <Sub P={previewP}>El color de tu espacio. Puedes cambiarlo después.</Sub>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center", maxHeight: "52vh", overflowY: "auto", padding: "4px 4px 8px" }}>
              {Object.entries(PALETTES).map(([key, pal]) => (
                <button key={key} onClick={() => setPaletteKey(key)} style={{ border: `2.5px solid ${paletteKey === key ? pal.accent : "transparent"}`, borderRadius: 18, padding: 11, background: pal.card, cursor: "pointer", transition: "all 0.2s", width: 118, boxShadow: paletteKey === key ? `0 8px 24px ${pal.accent}33` : "0 2px 8px rgba(0,0,0,0.04)" }}>
                  <div style={{ display: "flex", gap: 4, marginBottom: 8, justifyContent: "center" }}>
                    {[pal.accent, pal.accent2, pal.soft].map((c, i) => <div key={i} style={{ width: 24, height: 24, borderRadius: "50%", background: c }} />)}
                  </div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: pal.ink }}>{pal.name}</div>
                </button>
              ))}
            </div>
          </>
        )}
        {q === 3 && (
          <>
            <H1 P={previewP}>Última cosa.</H1>
            <Sub P={previewP}>¿Qué es lo que más te pesa ahorita?</Sub>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {challenges.map((c) => <button key={c} onClick={() => setChallenge(c)} style={{ ...chip(previewP, challenge === c), justifyContent: "center", padding: "15px 20px" }}>{c}</button>)}
            </div>
          </>
        )}

        <div style={{ marginTop: 44 }}>
          <button onClick={next} disabled={!canNext} style={primaryBtn(previewP, !canNext)}>{q < 3 ? "Continuar →" : "Crear mi espacio ✦"}</button>
        </div>
      </div>
      <GlobalStyles P={previewP} />
    </div>
  );
}

// ═══ MORNING CHECK-IN ═══
function MorningCheckin({ P, profile, onDone }) {
  const [step, setStep] = useState(0);
  const [mood, setMood] = useState(null);
  const [energy, setEnergy] = useState(null);
  const [intention, setIntention] = useState("");
  const [challenge, setChallenge] = useState(profile.challenge);
  const hour = new Date().getHours(); // usa la zona horaria local de la persona
  const franja = hour < 12 ? "mañana" : hour < 19 ? "tarde" : "noche";
  const greet = franja === "mañana" ? "Buenos días" : franja === "tarde" ? "Buenas tardes" : "Buenas noches";
  // Textos que se adaptan a la hora del día
  const T = {
    mañana: {
      titulo: "Hoy empieza tu día.",
      sub: "Hagamos tu check-in matutino. Toma un minuto — es tu momento antes de todo lo demás.",
      pregunta: "¿Cómo amaneciste?",
    },
    tarde: {
      titulo: "¿Cómo va tu día?",
      sub: "Hagamos tu check-in. Un minuto para reconectar contigo en medio de todo.",
      pregunta: "¿Cómo te sientes ahorita?",
    },
    noche: {
      titulo: "Cerremos bien el día.",
      sub: "Hagamos tu check-in de la noche. Un momento para ti antes de descansar.",
      pregunta: "¿Cómo te sientes esta noche?",
    },
  }[franja];
  const moods = [["En paz", 5], ["Bien", 4], ["Neutral", 3], ["Con estrés", 2], ["Abrumada", 1]];
  const challenges = ["Me siento abrumada", "No logro desconectar", "Quiero organizarme mejor", "Busco más claridad", "Estoy al borde del burnout"];
  const finish = () => onDone({ mood, moodScore: moods.find((m) => m[0] === mood)?.[1] || 3, energy, intention, challenge });

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div className="fade" key={step} style={{ maxWidth: 540, width: "100%", textAlign: "center" }}>
        {step === 0 && (
          <>
            <div style={{ fontFamily: ITALIC, fontStyle: "italic", fontSize: 21, color: P.accent, marginBottom: 14 }}>{greet}, {profile.name} <Heart color={P.accent} size={20} /></div>
            <H1 P={P}>{T.titulo}</H1>
            <Sub P={P}>{T.sub}</Sub>
            <button onClick={() => setStep(1)} style={primaryBtn(P)}>Empezar</button>
          </>
        )}
        {step === 1 && (
          <>
            <H1 P={P}>{T.pregunta}</H1>
            <Sub P={P}>Sin filtros. Solo checa cómo llegas.</Sub>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", marginBottom: 30 }}>
              {moods.map(([t]) => <button key={t} onClick={() => setMood(t)} style={chip(P, mood === t)}>{t}</button>)}
            </div>
            <Label P={P}>Tu energía</Label>
            <div style={{ display: "flex", gap: 10, marginBottom: 34 }}>
              {["Baja", "Media", "Alta"].map((t) => <button key={t} onClick={() => setEnergy(t)} style={{ ...chip(P, energy === t), flex: 1, justifyContent: "center" }}>{t}</button>)}
            </div>
            <button onClick={() => setStep(2)} disabled={!mood || !energy} style={primaryBtn(P, !mood || !energy)}>Continuar →</button>
          </>
        )}
        {step === 2 && (
          <>
            <H1 P={P}>¿Cuál es tu intención de hoy?</H1>
            <Sub P={P}>Una sola cosa. Lo que quieres que hoy se sienta o logre.</Sub>
            <input autoFocus value={intention} onChange={(e) => setIntention(e.target.value)} onKeyDown={(e) => e.key === "Enter" && intention.trim() && setStep(3)} placeholder="Hoy quiero…" style={inputBig(P)} />
            <div style={{ marginTop: 34 }}><button onClick={() => setStep(3)} style={primaryBtn(P)}>Continuar →</button></div>
          </>
        )}
        {step === 3 && (
          <>
            <H1 P={P}>¿Qué es lo que más te pesa hoy?</H1>
            <Sub P={P}>La última vez elegiste "{profile.challenge}". ¿Sigue igual o cambió?</Sub>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 34 }}>
              {challenges.map((c) => <button key={c} onClick={() => setChallenge(c)} style={{ ...chip(P, challenge === c), justifyContent: "center", padding: "14px 20px" }}>{c}</button>)}
            </div>
            <button onClick={finish} disabled={!challenge} style={primaryBtn(P, !challenge)}>Entrar a mi espacio →</button>
          </>
        )}
      </div>
    </div>
  );
}

// ═══ DASHBOARD ═══
function Dashboard({ P, profile, dayData, saveDay, premium, onPremium, onNewDay, onReset }) {
  const [view, setView] = useState("hoy");
  const update = (patch) => saveDay({ ...dayData, ...patch });
  const dateStr = new Date().toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div>
      <div style={{ background: P.card, borderBottom: `0.5px solid ${P.line}`, position: "sticky", top: 0, zIndex: 10, boxShadow: "0 1px 12px rgba(0,0,0,0.03)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <svg width="34" height="34" viewBox="0 0 34 34"><circle cx="17" cy="17" r="16" fill="none" stroke={P.soft} strokeWidth="1.2" /><text x="17" y="23" textAnchor="middle" fontFamily={SERIF} fontSize="14" fill={P.ink}>tp</text></svg>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Hola, {profile.name}</div>
              <div style={{ fontSize: 11, color: P.muted, textTransform: "capitalize" }}>{dateStr}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ display: "flex", background: P.bg, borderRadius: 100, padding: 3 }}>
              <button onClick={() => setView("hoy")} style={tabBtn(P, view === "hoy")}>Hoy</button>
              <button onClick={() => setView("progreso")} style={tabBtn(P, view === "progreso")}>Mi progreso</button>
            </div>
            {!premium && <button onClick={onPremium} style={{ fontFamily: BODY, fontSize: 12, fontWeight: 600, color: P.card, background: P.accent, border: "none", borderRadius: 20, padding: "7px 15px", cursor: "pointer" }}>✦ Premium</button>}
            <button onClick={onReset} title="Empezar de nuevo desde la introducción" style={{ fontFamily: BODY, fontSize: 12, color: P.muted, background: "none", border: `1px solid ${P.line}`, borderRadius: 20, padding: "7px 12px", cursor: "pointer" }}>Reiniciar</button>
          </div>
        </div>
      </div>

      {view === "hoy" ? (
        <TodayView P={P} profile={profile} dayData={dayData} update={update} premium={premium} onPremium={onPremium} onNewDay={onNewDay} />
      ) : (
        <ProgressView P={P} profile={profile} premium={premium} onPremium={onPremium} />
      )}
    </div>
  );
}

function TodayView({ P, profile, dayData, update, premium, onPremium, onNewDay }) {
  return (
    <>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px 0" }}>
        <div style={{ fontFamily: ITALIC, fontStyle: "italic", fontSize: 17, color: P.accent, marginBottom: 6 }}>tu intención de hoy</div>
        <div style={{ fontFamily: SERIF, fontWeight: 500, fontSize: "clamp(1.7rem, 4vw, 2.6rem)", lineHeight: 1.2, color: P.ink }}>{dayData.intention || "Vivir hoy con presencia."}</div>
        <div style={{ display: "flex", gap: 20, marginTop: 16, fontSize: 13, color: P.muted, flexWrap: "wrap", alignItems: "center" }}>
          <span>Ánimo: <strong style={{ color: P.accent }}>{dayData.mood}</strong></span>
          <span>Energía: <strong style={{ color: P.accent }}>{dayData.energy}</strong></span>
          <button onClick={onNewDay} style={{ fontFamily: BODY, fontSize: 13, color: P.muted, background: "none", border: "none", cursor: "pointer", textDecoration: "underline", padding: 0 }}>Rehacer check-in</button>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 24px 0" }}>
        <RecoCard P={P} profile={profile} dayData={dayData} premium={premium} onPremium={onPremium} />
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 24px 80px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))", gap: 20, alignItems: "start" }}>
        <TasksWidget P={P} label="Pendientes laborales" hint="Aquí van tus pendientes del trabajo." k="tasksWork" dayData={dayData} update={update} premium={premium} onPremium={onPremium} profile={profile} kind="work" />
        <TasksWidget P={P} label="Pendientes personales" hint="Aquí va todo lo tuyo, fuera del trabajo." k="tasksPersonal" dayData={dayData} update={update} premium={premium} onPremium={onPremium} profile={profile} kind="personal" />
        <JournalWidget P={P} dayData={dayData} update={update} premium={premium} onPremium={onPremium} />
        <AffirmWidget P={P} dayData={dayData} update={update} premium={premium} onPremium={onPremium} />
        <AssistantWidget P={P} profile={profile} dayData={dayData} premium={premium} onPremium={onPremium} />
        <PauseWidget P={P} premium={premium} onPremium={onPremium} />
      </div>
    </>
  );
}

// ═══ PROGRESO MENSUAL ═══
function ProgressView({ P, profile, premium, onPremium }) {
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [insight, setInsight] = useState("");
  const [insightLoading, setInsightLoading] = useState(false);
  const [openDay, setOpenDay] = useState(null);

  useEffect(() => {
    (async () => {
      const keys = await store.list("tp:day:");
      const all = [];
      for (const k of keys) { const d = await store.get(k); if (d && d.date) all.push(d); }
      all.sort((a, b) => (a.date < b.date ? 1 : -1));
      setDays(all); setLoading(false);
    })();
  }, []);

  const thisMonth = days.filter((d) => d.date && d.date.slice(0, 7) === dayId().slice(0, 7));
  const avgMood = thisMonth.length ? (thisMonth.reduce((s, d) => s + (d.moodScore || 3), 0) / thisMonth.length) : 0;
  const totalTasks = thisMonth.reduce((s, d) => s + (d.tasksWork?.length || 0) + (d.tasksPersonal?.length || 0), 0);
  const doneTasks = thisMonth.reduce((s, d) => s + (d.tasksWork?.filter((t) => t.done).length || 0) + (d.tasksPersonal?.filter((t) => t.done).length || 0), 0);
  const journalDays = thisMonth.filter((d) => d.journal && d.journal.trim()).length;
  const completion = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const moodLabel = avgMood >= 4.2 ? "Vienes muy bien" : avgMood >= 3.2 ? "Vienes estable" : avgMood >= 2.2 ? "Semana pesada" : avgMood > 0 ? "Necesitas cuidarte" : "Aún sin datos";

  const genInsight = async () => {
    if (!premium) return onPremium();
    setInsightLoading(true);
    const r = await askClaude(`Soy ${profile.name}, trabajo en ${profile.role}. Este mes: registré ${thisMonth.length} días, ánimo promedio ${avgMood.toFixed(1)}/5, completé ${doneTasks} de ${totalTasks} pendientes (${completion}%), escribí en mi journal ${journalDays} días. Mi reto es "${profile.challenge}".\n\nDame una lectura cálida y honesta de cómo vengo este mes (3-4 líneas), en qué necesito trabajar más, y una sugerencia concreta y amable. Ortografía y acentos impecables.`);
    setInsight(r || "No pude conectar ahorita. Intenta de nuevo en un momento."); setInsightLoading(false);
  };

  if (loading) return <div style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 24px", textAlign: "center", color: P.muted }}>cargando tu progreso…</div>;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px 80px" }}>
      <div style={{ fontFamily: ITALIC, fontStyle: "italic", fontSize: 17, color: P.accent, marginBottom: 6 }}>cómo vas este mes</div>
      <H1 P={P}>{moodLabel}.</H1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginTop: 28, marginBottom: 32 }}>
        <MetricCard P={P} big={thisMonth.length} label="días registrados" sub="tu constancia" />
        <MetricCard P={P} big={avgMood ? avgMood.toFixed(1) : "—"} label="ánimo promedio" sub="sobre 5" />
        <MetricCard P={P} big={`${completion}%`} label="pendientes cumplidos" sub={`${doneTasks} de ${totalTasks}`} />
        <MetricCard P={P} big={journalDays} label="días de journaling" sub="tu mente en orden" />
      </div>

      {thisMonth.length > 0 && (
        <div style={{ background: P.card, border: `0.5px solid ${P.line}`, borderRadius: 20, padding: 24, marginBottom: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
          <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: P.ink, marginBottom: 16 }}>Tu ánimo, día a día</div>
          <div style={{ display: "flex", gap: 5, alignItems: "flex-end", height: 90 }}>
            {thisMonth.slice().reverse().map((d, i) => (
              <div key={i} title={`${d.date}: ${d.mood}`} style={{ flex: 1, minWidth: 6, height: `${((d.moodScore || 3) / 5) * 100}%`, background: P.accent, borderRadius: 4, opacity: 0.35 + ((d.moodScore || 3) / 5) * 0.65 }} />
            ))}
          </div>
        </div>
      )}

      <div style={{ background: P.dark, borderRadius: 20, padding: 28, marginBottom: 28 }}>
        <div style={{ fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color: P.soft, marginBottom: 12 }}>✦ Tu lectura del mes</div>
        {insight ? (
          <div style={{ fontSize: 15, lineHeight: 1.7, color: P.bg, whiteSpace: "pre-wrap" }}>{insight}</div>
        ) : (
          <>
            <div style={{ fontFamily: ITALIC, fontStyle: "italic", fontSize: 19, color: P.bg, lineHeight: 1.5, marginBottom: 18 }}>Deja que tu guía lea tu mes y te diga en qué enfocarte.</div>
            <button onClick={genInsight} disabled={insightLoading} style={{ fontFamily: BODY, fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 100, border: `1.5px solid ${P.soft}`, background: "transparent", color: P.bg, cursor: "pointer" }}>
              {insightLoading ? "Leyendo tu mes…" : premium ? "✦ Generar mi análisis" : "✦ Análisis del mes (Premium)"}
            </button>
          </>
        )}
      </div>

      <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: P.ink, marginBottom: 14 }}>Tu diario, día por día</div>
      {days.filter((d) => d.journal && d.journal.trim()).length === 0 && (
        <div style={{ fontSize: 14, color: P.muted, fontStyle: "italic" }}>Cuando escribas en tu journal, tus entradas aparecerán aquí para que regreses a verlas.</div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {days.filter((d) => d.journal && d.journal.trim()).map((d, i) => {
          const fecha = new Date(d.date + "T12:00:00").toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" });
          const open = openDay === d.date;
          return (
            <div key={i} onClick={() => setOpenDay(open ? null : d.date)} style={{ background: P.card, border: `0.5px solid ${P.line}`, borderRadius: 16, padding: "16px 20px", cursor: "pointer", transition: "all 0.2s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: P.ink, textTransform: "capitalize" }}>{fecha}</div>
                <div style={{ fontSize: 12, color: P.muted }}>{d.mood} · {open ? "cerrar" : "leer"}</div>
              </div>
              {open && <div style={{ fontFamily: ITALIC, fontSize: 16, lineHeight: 1.7, color: P.ink, marginTop: 12, whiteSpace: "pre-wrap" }}>{d.journal}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MetricCard({ P, big, label, sub }) {
  return (
    <div style={{ background: P.card, border: `0.5px solid ${P.line}`, borderRadius: 18, padding: "22px 20px", boxShadow: "0 4px 16px rgba(0,0,0,0.03)" }}>
      <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 40, color: P.accent, lineHeight: 1 }}>{big}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: P.ink, marginTop: 8 }}>{label}</div>
      <div style={{ fontSize: 12, color: P.muted, marginTop: 2 }}>{sub}</div>
    </div>
  );
}

// ── Widgets ─────────────────────────────────────────────────
// ── Tarjeta de recomendación según el reto ──────────────────
function RecoCard({ P, profile, dayData, premium, onPremium }) {
  const [aiReco, setAiReco] = useState("");
  const [loading, setLoading] = useState(false);
  const reto = dayData.challenge || profile.challenge;
  const base = CHALLENGE_TIPS[reto] || CHALLENGE_TIPS["Quiero organizarme mejor"];

  const genReco = async () => {
    if (!premium) return onPremium();
    setLoading(true);
    const r = await askClaude(
      `Soy ${profile.name}, trabajo en ${profile.role}. Hoy me siento "${dayData.mood}" con energía "${dayData.energy}". Lo que más me pesa hoy es: "${reto}". Mi intención de hoy es: "${dayData.intention || "estar presente"}".\n\nDame UNA recomendación concreta, cálida y accionable para hoy que ataque justo eso (máximo 3 líneas). Habla de tú, cercano, con acentos impecables. Sin preámbulo.`,
      null, 300
    );
    setAiReco(r || "No pude conectar ahorita. Intenta de nuevo en un momento.");
    setLoading(false);
  };

  return (
    <div style={{ background: P.dark, borderRadius: 20, padding: "26px 28px", boxShadow: "0 8px 30px rgba(0,0,0,0.08)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <Heart color={P.soft} size={16} />
        <div style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: P.soft }}>Para ti hoy · {reto}</div>
      </div>
      <div style={{ fontFamily: SERIF, fontWeight: 500, fontSize: "clamp(1.2rem, 3vw, 1.5rem)", color: P.card, marginBottom: 10, lineHeight: 1.2 }}>{base.titulo}</div>
      <div style={{ fontSize: 15, lineHeight: 1.65, color: P.line }}>{base.tip}</div>

      {aiReco && (
        <div className="fade" style={{ marginTop: 18, paddingTop: 18, borderTop: `1px solid ${P.muted}44` }}>
          <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: P.soft, marginBottom: 8 }}>✦ Tu recomendación de hoy</div>
          <div style={{ fontSize: 15, lineHeight: 1.65, color: P.card, whiteSpace: "pre-wrap" }}>{aiReco}</div>
        </div>
      )}

      {!aiReco && (
        <button onClick={genReco} disabled={loading} style={{ fontFamily: BODY, fontSize: 13, fontWeight: 600, padding: "10px 18px", borderRadius: 100, border: `1px solid ${P.soft}`, background: "transparent", color: P.card, cursor: "pointer", marginTop: 16 }}>
          {loading ? "Pensando en ti…" : premium ? "✦ Dame una recomendación personalizada" : "✦ Recomendación personalizada (Premium)"}
        </button>
      )}
    </div>
  );
}

function WidgetShell({ P, title, hint, tag, children, span }) {
  return (
    <div style={{ background: P.card, border: `0.5px solid ${P.line}`, borderRadius: 20, padding: 22, gridColumn: span ? "1 / -1" : "auto", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: hint ? 4 : 14 }}>
        <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: P.ink }}>{title}</div>
        {tag && <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: P.accent, border: `1px solid ${P.soft}`, borderRadius: 20, padding: "3px 8px" }}>{tag}</div>}
      </div>
      {hint && <div style={{ fontFamily: ITALIC, fontStyle: "italic", fontSize: 14, color: P.muted, marginBottom: 14 }}>{hint}</div>}
      {children}
    </div>
  );
}

function TasksWidget({ P, label, hint, k, dayData, update, premium, onPremium, profile, kind }) {
  const [input, setInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const tasks = dayData[k] || [];
  const add = () => { if (input.trim()) { update({ [k]: [...tasks, { text: input.trim(), done: false }] }); setInput(""); } };
  const toggle = (i) => { const a = [...tasks]; a[i].done = !a[i].done; update({ [k]: a }); };
  const del = (i) => update({ [k]: tasks.filter((_, j) => j !== i) });
  const suggest = async () => {
    if (!premium) return onPremium();
    setAiLoading(true);
    const r = await askClaude(`Trabajo en ${profile.role}. Sugiéreme 3 pendientes típicos de ${kind === "work" ? "mi trabajo" : "mi vida personal"} para hoy, cortos. Solo los 3, uno por línea, sin números ni preámbulo. Acentos impecables.`, null, 200);
    if (r) { const items = r.split("\n").map((s) => s.replace(/^[-•\d.]+\s*/, "").trim()).filter(Boolean).slice(0, 3); update({ [k]: [...tasks, ...items.map((t) => ({ text: t, done: false }))] }); }
    setAiLoading(false);
  };
  const done = tasks.filter((t) => t.done).length;
  return (
    <WidgetShell P={P} title={label} hint={hint} tag={tasks.length ? `${done}/${tasks.length}` : null}>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="Agregar pendiente…" style={inputSm(P)} />
        <button onClick={add} style={{ width: 40, borderRadius: 10, border: "none", background: P.accent, color: P.card, fontSize: 18, cursor: "pointer" }}>+</button>
      </div>
      {tasks.length === 0 && <div style={{ fontSize: 13, color: P.muted, fontStyle: "italic", padding: "4px 0 10px" }}>Nada aún. Escríbelo arriba y sácalo de tu cabeza.</div>}
      {tasks.map((t, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `0.5px solid ${P.bg}` }}>
          <div onClick={() => toggle(i)} style={{ width: 19, height: 19, borderRadius: 6, border: `1.5px solid ${t.done ? P.accent : P.line}`, background: t.done ? P.accent : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
            {t.done && <span style={{ color: P.card, fontSize: 12 }}>✓</span>}
          </div>
          <span onClick={() => toggle(i)} style={{ flex: 1, fontSize: 14, color: t.done ? P.muted : P.ink, textDecoration: t.done ? "line-through" : "none", cursor: "pointer" }}>{t.text}</span>
          <button onClick={() => del(i)} style={{ background: "none", border: "none", color: P.muted, cursor: "pointer", fontSize: 16 }}>×</button>
        </div>
      ))}
      <button onClick={suggest} disabled={aiLoading} style={{ ...aiMini(P), marginTop: 12 }}>{aiLoading ? "Pensando…" : premium ? "✦ Sugerir con IA" : "✦ Sugerir con IA (Premium)"}</button>
    </WidgetShell>
  );
}

function JournalWidget({ P, dayData, update, premium, onPremium }) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const staticP = ["¿Qué necesitas soltar hoy?", "¿Qué es lo que más pesa ahora?", "Si hoy saliera bien, ¿cómo se vería?"];
  const gen = async () => {
    if (!premium) return onPremium();
    setLoading(true);
    const r = await askClaude(`Me siento "${dayData.mood}". Dame UN prompt de journaling corto y cálido para hoy. Solo el prompt, máximo 15 palabras, con acentos impecables.`, null, 120);
    setPrompt(r || staticP[0]); setLoading(false);
  };
  const shown = prompt || staticP[new Date().getDate() % staticP.length];
  const words = (dayData.journal || "").trim() ? (dayData.journal || "").trim().split(/\s+/).length : 0;
  return (
    <WidgetShell P={P} title="Journaling del día" hint="Aquí vacías tu mente. Solo para ti, se guarda cada día." tag={words ? `${words} palabras` : null}>
      <div style={{ fontFamily: ITALIC, fontStyle: "italic", fontSize: 16, color: P.accent, marginBottom: 10, lineHeight: 1.4 }}>{shown}</div>
      <textarea value={dayData.journal || ""} onChange={(e) => update({ journal: e.target.value })} placeholder="Escribe sin pensar en la forma…" style={{ width: "100%", minHeight: 130, fontFamily: ITALIC, fontSize: 16, lineHeight: 1.7, padding: 16, borderRadius: 14, border: `0.5px solid ${P.line}`, background: P.bg, color: P.ink, outline: "none", resize: "vertical" }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
        <button onClick={gen} disabled={loading} style={aiMini(P)}>{loading ? "Pensando…" : premium ? "✦ Prompt para mi día" : "✦ Prompt (Premium)"}</button>
        <span style={{ fontSize: 12, color: P.muted, fontStyle: "italic" }}>se guarda solo</span>
      </div>
    </WidgetShell>
  );
}

function AffirmWidget({ P, dayData, update, premium, onPremium }) {
  const [loading, setLoading] = useState(false);
  const affs = ["Hoy elijo avanzar con calma, no con prisa.", "No tengo que hacerlo todo. Solo lo que importa.", "Mi valor no depende de mi lista de pendientes.", "Puedo estar presente en una cosa a la vez."];
  const gen = async () => {
    setLoading(true);
    const r = await askClaude(`Me siento "${dayData.mood}". Dame UNA afirmación corta, cálida y realista (no cursi). Solo la frase, máximo 12 palabras, sin comillas, con acentos impecables.`, null, 80);
    update({ affirmation: r || affs[Math.floor(Math.random() * affs.length)] }); setLoading(false);
  };
  const shown = dayData.affirmation || affs[new Date().getDate() % affs.length];
  return (
    <WidgetShell P={P} title="Tu afirmación de hoy" hint="Una frase para volver cuando el día se acelere.">
      <div style={{ background: P.dark, borderRadius: 16, padding: "30px 24px", textAlign: "center", marginBottom: 12 }}>
        <div style={{ fontFamily: ITALIC, fontStyle: "italic", fontSize: 20, color: P.bg, lineHeight: 1.4 }}>“{shown}”</div>
      </div>
      <button onClick={gen} disabled={loading} style={{ ...aiMini(P), width: "100%" }}>{loading ? "Pensando…" : "✦ Dame otra afirmación"}</button>
    </WidgetShell>
  );
}

function AssistantWidget({ P, profile, dayData, premium, onPremium }) {
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const send = async () => {
    if (!premium) return onPremium();
    if (!input.trim()) return;
    const userMsg = input.trim(); setInput(""); setMsgs((m) => [...m, { role: "user", text: userMsg }]); setLoading(true);
    const ctx = `Contexto: ${profile.name}, trabaja en ${profile.role}, hoy se siente ${dayData.mood} con energía ${dayData.energy}. Su reto: ${profile.challenge}.`;
    const r = await askClaude(`${ctx}\n\nMe dice: "${userMsg}"\n\nResponde como su guía cálida y breve (máximo 4 líneas), con acentos impecables.`, null, 400);
    setMsgs((m) => [...m, { role: "ai", text: r || "No pude conectar ahorita." }]); setLoading(false);
  };
  return (
    <WidgetShell P={P} title="Tu guía" hint="Habla con ella cuando te sientas abrumada o quieras ordenar ideas." tag={premium ? "IA" : "Premium"} span>
      {!premium ? (
        <div style={{ textAlign: "center", padding: "10px 0" }}>
          <button onClick={onPremium} style={primaryBtn(P)}>Desbloquear mi guía ✦</button>
        </div>
      ) : (
        <>
          <div style={{ minHeight: 60, maxHeight: 240, overflowY: "auto", marginBottom: 12 }}>
            {msgs.length === 0 && <div style={{ fontSize: 14, color: P.muted, fontStyle: "italic" }}>Cuéntame cómo vas, o pídeme ayuda para ordenar tu día.</div>}
            {msgs.map((m, i) => (
              <div key={i} style={{ margin: "8px 0", textAlign: m.role === "user" ? "right" : "left" }}>
                <span style={{ display: "inline-block", maxWidth: "80%", padding: "10px 14px", borderRadius: 14, fontSize: 14, lineHeight: 1.5, background: m.role === "user" ? P.accent : P.bg, color: m.role === "user" ? P.card : P.ink }}>{m.text}</span>
              </div>
            ))}
            {loading && <div style={{ fontSize: 13, color: P.muted, fontStyle: "italic" }}>escribiendo…</div>}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Escríbele a tu guía…" style={inputSm(P)} />
            <button onClick={send} style={{ padding: "0 20px", borderRadius: 10, border: "none", background: P.accent, color: P.card, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Enviar</button>
          </div>
        </>
      )}
    </WidgetShell>
  );
}

function PauseWidget({ P, premium, onPremium }) {
  const [breathing, setBreathing] = useState(false);
  return (
    <WidgetShell P={P} title="Pausa consciente" hint="Un momento para ti cuando lo necesites.">
      <div style={{ textAlign: "center", padding: "6px 0" }}>
        <div onClick={() => setBreathing(!breathing)} className={breathing ? "breathe" : ""} style={{ width: 92, height: 92, borderRadius: "50%", background: P.soft, margin: "0 auto 14px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: P.ink, fontSize: 13, fontWeight: 600 }}>
          {breathing ? "respira…" : "toca"}
        </div>
        <div style={{ fontSize: 13, color: P.muted, lineHeight: 1.5 }}>Inhala 4, sostén 4, exhala 4.</div>
        <button onClick={() => !premium && onPremium()} style={{ ...aiMini(P), marginTop: 14 }}>{premium ? "✦ Activar recordatorios" : "✦ Recordatorios de pausa (Premium)"}</button>
      </div>
    </WidgetShell>
  );
}

function PremiumModal({ P, onClose, onBuy }) {
  const perks = ["Guía de IA que te habla y organiza tu día", "Prompts de journaling que se adaptan a ti", "Sugerencias de pendientes según tu profesión", "Análisis mensual de tus patrones de burnout", "Recordatorios inteligentes de pausas"];
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(20,20,15,0.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, zIndex: 100 }}>
      <div onClick={(e) => e.stopPropagation()} className="fade" style={{ background: P.bg, borderRadius: 24, maxWidth: 450, width: "100%", padding: 38, textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ fontFamily: ITALIC, fontStyle: "italic", fontSize: 20, color: P.accent, marginBottom: 6 }}>The Project ✦ Premium</div>
        <h2 style={{ fontFamily: SERIF, fontWeight: 600, fontSize: "2rem", margin: "0 0 4px", color: P.ink }}>Tu día, potenciado con IA</h2>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 6, margin: "16px 0 24px" }}>
          <span style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 44, color: P.ink }}>$10</span>
          <span style={{ fontSize: 15, color: P.muted }}>USD / mes</span>
        </div>
        <div style={{ textAlign: "left", marginBottom: 28 }}>
          {perks.map((p, i) => <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "8px 0", fontSize: 14, color: P.ink }}><span style={{ color: P.accent, flexShrink: 0 }}>✦</span> {p}</div>)}
        </div>
        <button onClick={onBuy} style={{ ...primaryBtn(P), width: "100%" }}>Activar Premium</button>
        <button onClick={onClose} style={{ fontFamily: BODY, fontSize: 13, color: P.muted, background: "none", border: "none", cursor: "pointer", marginTop: 14, textDecoration: "underline" }}>Ahora no</button>
      </div>
    </div>
  );
}

// ── Primitives ──────────────────────────────────────────────
function H1({ P, children }) { return <h1 style={{ fontFamily: SERIF, fontWeight: 600, fontSize: "clamp(2rem, 5vw, 3rem)", lineHeight: 1.1, margin: "0 0 14px", color: P.ink }}>{children}</h1>; }
function Sub({ P, children }) { return <p style={{ fontFamily: ITALIC, fontStyle: "italic", fontSize: 19, color: P.accent, margin: "0 0 32px", lineHeight: 1.4 }}>{children}</p>; }
function Label({ P, children }) { return <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: P.muted, marginBottom: 12 }}>{children}</div>; }

const inputBig = (P) => ({ width: "100%", maxWidth: 400, fontFamily: BODY, fontSize: 18, padding: "17px 22px", borderRadius: 16, border: `1.5px solid ${P.line}`, background: P.card, color: P.ink, outline: "none", textAlign: "center", boxShadow: "0 4px 16px rgba(0,0,0,0.04)" });
const inputSm = (P) => ({ flex: 1, fontFamily: BODY, fontSize: 14, padding: "10px 13px", borderRadius: 10, border: `1px solid ${P.line}`, background: P.bg, color: P.ink, outline: "none" });
const chip = (P, active) => ({ fontFamily: BODY, fontSize: 14, padding: "11px 18px", borderRadius: 100, border: `1.5px solid ${active ? P.accent : P.line}`, background: active ? P.accent : P.card, color: active ? P.card : P.ink, cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 6, boxShadow: active ? `0 4px 14px ${P.accent}33` : "none" });
const primaryBtn = (P, disabled) => ({ fontFamily: BODY, fontSize: 15, fontWeight: 600, padding: "16px 38px", borderRadius: 100, border: "none", background: disabled ? P.line : P.accent, color: P.card, cursor: disabled ? "default" : "pointer", transition: "all 0.25s", opacity: disabled ? 0.7 : 1, boxShadow: disabled ? "none" : `0 6px 20px ${P.accent}44` });
const aiMini = (P) => ({ fontFamily: BODY, fontSize: 13, fontWeight: 600, padding: "9px 15px", borderRadius: 100, border: `1px solid ${P.soft}`, background: "transparent", color: P.accent, cursor: "pointer" });
const tabBtn = (P, active) => ({ fontFamily: BODY, fontSize: 13, fontWeight: 600, padding: "7px 16px", borderRadius: 100, border: "none", background: active ? P.card : "transparent", color: active ? P.accent : P.muted, cursor: "pointer", transition: "all 0.2s", boxShadow: active ? "0 2px 8px rgba(0,0,0,0.06)" : "none" });

function FontLoader() { return <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..600;1,9..144,400..600&family=Work+Sans:wght@400;500;600&display=swap" />; }
function GlobalStyles({ P }) {
  return (
    <style>{`
      @keyframes fadeUp { from { opacity:0; transform:translateY(18px);} to { opacity:1; transform:translateY(0);} }
      .fade { animation: fadeUp 0.55s ease; }
      @keyframes breathe { 0%,100% { transform:scale(1);} 50% { transform:scale(1.3);} }
      .breathe { animation: breathe 8s ease-in-out infinite; }
      * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
      input::placeholder, textarea::placeholder { color: ${P.muted}; opacity: 0.55; }
      button:disabled { opacity: 0.6; }
      ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-thumb { background: ${P.line}; border-radius: 3px; }
    `}</style>
  );
}

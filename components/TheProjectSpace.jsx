"use client";

import { useState, useEffect } from "react";
import { store, getUid } from "@/lib/store";
import { askClaude } from "@/lib/ai";
import ProjectView from "@/components/MiProyecto";
import {
  PALETTES, SERIF, BODY, ITALIC, dayId, cssVars,
  Heart, Grain, Blobs, GlobalStyles,
  inputBig, inputSm, chip, primaryBtn, aiMini, tabBtn,
  H1, Sub, Label,
} from "@/components/ui";

// ═══════════════════════════════════════════════════════════
//  THE PROJECT · Tu espacio
//  Onboarding → check-in diario → dashboard flotante + progreso
// ═══════════════════════════════════════════════════════════

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

// Día en blanco: se crea solo al entrar — el check-in es opcional.
const emptyDay = () => ({ date: dayId(), mood: null, moodScore: null, energy: null, intention: "", challenge: null, tasksWork: [], tasksPersonal: [], journal: "", affirmation: "", morningDone: true, skipCheckin: false, checkinTouched: false });

// ═══ APP ROOT ═══
export default function TheProjectSpace() {
  const [phase, setPhase] = useState("loading");
  const [profile, setProfile] = useState(null);
  const [premium, setPremium] = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const [dayData, setDayData] = useState(null);
  const [signupName, setSignupName] = useState("");

  const P = (profile && PALETTES[profile.paletteKey]) || PALETTES.original;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const prof = await store.get("tp:profile");
        if (cancelled) return;
        if (!prof) {
          try {
            const signup = await store.get("tp:signup");
            if (signup?.name && !cancelled) setSignupName(signup.name);
          } catch {}
          setPhase("onboard");
          return;
        }
        setProfile(prof);
        try { if (await store.get("tp:premium")) setPremium(true); } catch {}
        // Directo al espacio: el día se crea solo y el check-in queda opcional.
        let today = null;
        try { today = await store.get(`tp:day:${dayId()}`); } catch {}
        const data = { ...emptyDay(), ...(today || {}) };
        setDayData(data);
        if (!today) { try { await store.set(`tp:day:${dayId()}`, data); } catch {} }
        setPhase("dashboard");
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
  const completeOnboard = async (prof) => { await store.set("tp:profile", prof); setProfile(prof); await saveDay(emptyDay()); setPhase("dashboard"); };
  const completeMorning = async (md) => {
    const data = { ...(dayData || emptyDay()), ...md, date: dayId(), morningDone: true, skipCheckin: false, checkinTouched: true };
    await saveDay(data); setPhase("dashboard");
  };
  // Con Stripe configurado manda al Checkout real (tarjeta, Apple Pay…);
  // sin Stripe (o sin Supabase) cae a la activación simulada del piloto.
  const goPremium = async () => {
    try {
      const uid = await getUid();
      if (uid) {
        const res = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uid }),
        });
        if (res.ok) {
          const { url } = await res.json();
          if (url) { window.location.href = url; return; }
        }
      }
    } catch {}
    setPremium(true); setShowPremium(false); await store.set("tp:premium", true);
  };
  const updatePalette = async (paletteKey) => {
    const p = { ...profile, paletteKey };
    setProfile(p); await store.set("tp:profile", p);
  };
  const resetAll = async () => {
    try {
      const keys = await store.list("tp:");
      for (const k of keys) { await store.delete(k); }
    } catch {}
    setProfile(null); setDayData(null); setPremium(false); setSignupName(""); setPhase("onboard");
  };

  if (phase === "loading") {
    return (
      <div style={{ minHeight: "100vh", background: P.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: BODY, color: P.muted, ...cssVars(P) }}>
        <GlobalStyles />
        <span className="fade">cargando tu espacio…</span>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(160deg, ${P.bg} 0%, ${P.card} 55%, ${P.bg} 100%)`, fontFamily: BODY, color: P.ink, transition: "background 0.6s ease", position: "relative", overflowX: "hidden", ...cssVars(P) }}>
      <GlobalStyles />
      <Grain />
      <Blobs P={P} />
      <div style={{ position: "relative", zIndex: 2 }}>
        {phase === "onboard" && <Onboarding onDone={completeOnboard} initialName={signupName} />}
        {phase === "morning" && <MorningCheckin P={P} profile={profile} onDone={completeMorning} />}
        {phase === "dashboard" && <Dashboard P={P} profile={profile} dayData={dayData} saveDay={saveDay} premium={premium} onPremium={() => setShowPremium(true)} onNewDay={() => setPhase("morning")} onReset={resetAll} onPalette={updatePalette} />}
      </div>
      {phase === "dashboard" && <PauseBubble P={P} premium={premium} onPremium={() => setShowPremium(true)} />}
      {showPremium && <PremiumModal P={P} onClose={() => setShowPremium(false)} onBuy={goPremium} />}
    </div>
  );
}

// ── Panel de vidrio centrado para flujos (onboarding / check-in) ──
function GlassStage({ children }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div className="glass fade" style={{ maxWidth: 640, width: "100%", borderRadius: "52px 84px 52px 84px", padding: "clamp(30px, 5.5vw, 52px)", textAlign: "center" }}>
        {children}
      </div>
    </div>
  );
}

// ═══ ONBOARDING ═══
function Onboarding({ onDone, initialName = "" }) {
  const [q, setQ] = useState(0);
  const [name, setName] = useState(initialName);
  const [role, setRole] = useState("");
  const [paletteKey, setPaletteKey] = useState("");
  const [challenge, setChallenge] = useState("");
  const roles = ["Marketing", "Finanzas", "Ventas", "Producto / Tech", "Consultoría", "Recursos Humanos", "Diseño / Creativo", "Emprendo lo mío", "Otra"];
  const challenges = ["Me siento abrumada", "No logro desconectar", "Quiero organizarme mejor", "Busco más claridad", "Estoy al borde del burnout"];
  const canNext = [name.trim(), role, paletteKey, challenge][q];
  const next = () => { if (q < 3) setQ(q + 1); else onDone({ name: name.trim(), role, paletteKey, challenge }); };
  const previewP = (paletteKey && PALETTES[paletteKey]) || PALETTES.original;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, background: `linear-gradient(160deg, ${previewP.bg}, ${previewP.card} 55%, ${previewP.bg})`, transition: "background 0.6s ease", ...cssVars(previewP) }}>
      <Blobs P={previewP} />
      <div className="glass fade" key={q} style={{ maxWidth: 640, width: "100%", borderRadius: q % 2 ? "84px 52px 84px 52px" : "52px 84px 52px 84px", padding: "clamp(30px, 5.5vw, 52px)", textAlign: "center", position: "relative", zIndex: 2 }}>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 38 }}>
          {[0, 1, 2, 3].map((i) => <div key={i} style={{ width: i === q ? 30 : 8, height: 8, borderRadius: 100, background: i <= q ? previewP.accent : previewP.line, transition: "all 0.3s" }} />)}
        </div>

        {q === 0 && (
          <>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 26 }}>
              <svg width="40" height="40" viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="18.5" fill="none" stroke={previewP.accent} strokeWidth="1.5" />
                <text x="20" y="27" textAnchor="middle" fontFamily={SERIF} fontSize="16" fill={previewP.ink}>tp</text>
              </svg>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 17, color: previewP.ink, lineHeight: 1 }}>The Project</div>
                <div style={{ fontSize: 11, letterSpacing: "0.3em", color: previewP.accent, marginTop: 3 }}>S P A C E</div>
              </div>
            </div>

            <h1 style={{ fontFamily: SERIF, fontWeight: 400, fontSize: "clamp(2rem, 5.5vw, 3rem)", lineHeight: 1.08, margin: "0 0 18px", color: previewP.ink }}>
              {initialName ? <>Qué gusto tenerte,<br /><span style={{ fontStyle: "italic", color: previewP.accent }}>{initialName}.</span></> : <>Tu día, tu mente y tu trabajo — <span style={{ fontStyle: "italic", color: previewP.accent }}>en un solo lugar.</span></>}
            </h1>
            <div style={{ fontFamily: ITALIC, fontStyle: "italic", fontSize: 18, color: previewP.accent, margin: "10px 0 30px" }}>
              {initialName ? "¿Así te gusta que te llamemos? Puedes cambiarlo." : "Vamos a crear el tuyo. ¿Cómo te llamas?"}
            </div>
            <input autoFocus value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && canNext && next()} placeholder="Tu nombre" className="pill-input" style={inputBig(previewP)} />
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
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center", maxHeight: "46vh", overflowY: "auto", padding: "4px 4px 8px" }}>
              {Object.entries(PALETTES).map(([key, pal], i) => (
                <button key={key} onClick={() => setPaletteKey(key)} className="lift" style={{ border: `2px solid ${paletteKey === key ? pal.accent : "rgba(255,255,255,0.5)"}`, borderRadius: i % 2 ? "26px 44px 26px 44px" : "44px 26px 44px 26px", padding: 12, background: pal.card + "D9", backdropFilter: "blur(8px)", cursor: "pointer", width: 116, boxShadow: paletteKey === key ? `0 12px 28px ${pal.accent}44` : "0 4px 12px rgba(0,0,0,0.05)" }}>
                  <div style={{ display: "flex", marginBottom: 8, justifyContent: "center" }}>
                    {[pal.accent, pal.accent2, pal.soft].map((c, j) => <div key={j} style={{ width: 26, height: 26, borderRadius: "50%", background: c, marginLeft: j ? -8 : 0, border: `2px solid ${pal.card}` }} />)}
                  </div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: pal.ink, fontFamily: BODY }}>{pal.name}</div>
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

        <div style={{ marginTop: 40 }}>
          <button onClick={next} disabled={!canNext} style={primaryBtn(previewP, !canNext)}>{q < 3 ? "Continuar →" : "Crear mi espacio ✦"}</button>
        </div>
      </div>
      <GlobalStyles />
    </div>
  );
}

// ═══ CHECK-IN DIARIO ═══
function MorningCheckin({ P, profile, onDone }) {
  const [step, setStep] = useState(0);
  const [mood, setMood] = useState(null);
  const [energy, setEnergy] = useState(null);
  const [intention, setIntention] = useState("");
  const [challenge, setChallenge] = useState(profile.challenge);
  const hour = new Date().getHours(); // zona horaria local de la persona
  const franja = hour < 12 ? "mañana" : hour < 19 ? "tarde" : "noche";
  const greet = franja === "mañana" ? "Buenos días" : franja === "tarde" ? "Buenas tardes" : "Buenas noches";
  const T = {
    mañana: { titulo: "Hoy empieza tu día.", sub: "Hagamos tu check-in matutino. Toma un minuto — es tu momento antes de todo lo demás.", pregunta: "¿Cómo amaneciste?" },
    tarde: { titulo: "¿Cómo va tu día?", sub: "Hagamos tu check-in. Un minuto para reconectar contigo en medio de todo.", pregunta: "¿Cómo te sientes ahorita?" },
    noche: { titulo: "Cerremos bien el día.", sub: "Hagamos tu check-in de la noche. Un momento para ti antes de descansar.", pregunta: "¿Cómo te sientes esta noche?" },
  }[franja];
  const moods = [["En paz", 5], ["Bien", 4], ["Neutral", 3], ["Con estrés", 2], ["Abrumada", 1]];
  const challenges = ["Me siento abrumada", "No logro desconectar", "Quiero organizarme mejor", "Busco más claridad", "Estoy al borde del burnout"];
  const finish = () => onDone({ mood, moodScore: moods.find((m) => m[0] === mood)?.[1] || 3, energy, intention, challenge });

  return (
    <GlassStage key={step}>
      {step === 0 && (
        <>
          <div style={{ fontFamily: ITALIC, fontStyle: "italic", fontSize: 21, color: P.accent, marginBottom: 14 }}>{greet}, {profile.name} <Heart color={P.accent} size={20} /></div>
          <H1 P={P}>{T.titulo}</H1>
          <Sub P={P}>{T.sub}</Sub>
          <button onClick={() => setStep(1)} className="glow" style={primaryBtn(P)}>Empezar</button>
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
          <input autoFocus value={intention} onChange={(e) => setIntention(e.target.value)} onKeyDown={(e) => e.key === "Enter" && intention.trim() && setStep(3)} placeholder="Hoy quiero…" className="pill-input" style={inputBig(P)} />
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
    </GlassStage>
  );
}

// ═══ DASHBOARD ═══
function Dashboard({ P, profile, dayData, saveDay, premium, onPremium, onNewDay, onReset, onPalette }) {
  const [view, setView] = useState("hoy");
  const [showPalettes, setShowPalettes] = useState(false);
  const update = (patch) => saveDay({ ...dayData, ...patch });
  const dateStr = new Date().toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div>
      {/* Header flotante tipo píldora */}
      <div style={{ position: "sticky", top: 14, zIndex: 30, display: "flex", justifyContent: "center", padding: "14px 16px 0" }}>
        <div className="glass fade" style={{ borderRadius: 100, padding: "9px 12px 9px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, width: "100%", maxWidth: 1080, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <svg width="32" height="32" viewBox="0 0 34 34"><circle cx="17" cy="17" r="16" fill="none" stroke={P.paperSoft} strokeWidth="1.5" /><text x="17" y="23" textAnchor="middle" fontFamily={SERIF} fontSize="14" fill={P.ink}>tp</text></svg>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 600 }}>Hola, {profile.name}</div>
              <div style={{ fontSize: 10.5, color: P.muted, textTransform: "capitalize" }}>{dateStr}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ display: "flex", background: P.bg + "99", borderRadius: 100, padding: 3 }}>
              <button onClick={() => setView("hoy")} style={tabBtn(P, view === "hoy")}>Hoy</button>
              <button onClick={() => setView("proyecto")} style={tabBtn(P, view === "proyecto")}>Mi proyecto</button>
              <button onClick={() => setView("progreso")} style={tabBtn(P, view === "progreso")}>Mi progreso</button>
            </div>
            {!premium && <button onClick={onPremium} style={{ fontFamily: BODY, fontSize: 12, fontWeight: 600, color: P.card, background: P.accent, border: "none", borderRadius: 100, padding: "8px 15px", cursor: "pointer", boxShadow: `0 6px 16px ${P.accent}44` }}>✦ Premium</button>}
            <button onClick={() => setShowPalettes(true)} title="Cambiar el color de tu espacio" style={{ background: `conic-gradient(${P.accent}, ${P.accent2}, ${P.soft}, ${P.accent})`, border: `2px solid ${P.card}`, borderRadius: "50%", width: 32, height: 32, cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }} />
            <button onClick={onReset} title="Empezar de nuevo desde la introducción" style={{ fontFamily: BODY, fontSize: 14, color: P.muted, background: "transparent", border: `1px solid ${P.line}`, borderRadius: "50%", width: 34, height: 34, cursor: "pointer" }}>↺</button>
          </div>
        </div>
      </div>

      {view === "hoy" && <TodayView P={P} profile={profile} dayData={dayData} update={update} premium={premium} onPremium={onPremium} onNewDay={onNewDay} />}
      {view === "proyecto" && <ProjectView P={P} profile={profile} premium={premium} onPremium={onPremium} />}
      {view === "progreso" && <ProgressView P={P} profile={profile} premium={premium} onPremium={onPremium} />}

      {showPalettes && <PaletteModal P={P} current={profile.paletteKey} onPick={(k) => { onPalette(k); setShowPalettes(false); }} onClose={() => setShowPalettes(false)} />}
    </div>
  );
}

// ── Pop-up flotante: cambiar la vibra (paleta) ──────────────
function PaletteModal({ P, current, onPick, onClose }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(25,20,18,0.35)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, zIndex: 100 }}>
      <div onClick={(e) => e.stopPropagation()} className="glass fade" style={{ borderRadius: "52px 80px 52px 80px", maxWidth: 560, width: "100%", padding: "40px 36px", textAlign: "center", maxHeight: "86vh", overflowY: "auto" }}>
        <div style={{ fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", color: P.muted, marginBottom: 6 }}>Personaliza tu espacio</div>
        <div style={{ fontFamily: ITALIC, fontStyle: "italic", fontSize: 21, color: P.accent, marginBottom: 26 }}>¿Qué vibra traes hoy?</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
          {Object.entries(PALETTES).map(([key, pal], i) => (
            <button key={key} onClick={() => onPick(key)} className="lift" style={{ border: `2px solid ${current === key ? pal.accent : "rgba(255,255,255,0.5)"}`, borderRadius: i % 2 ? "24px 40px 24px 40px" : "40px 24px 40px 24px", padding: 12, background: pal.card + "E6", cursor: "pointer", width: 110, boxShadow: current === key ? `0 12px 26px ${pal.accent}44` : "0 4px 12px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", marginBottom: 8, justifyContent: "center" }}>
                {[pal.accent, pal.accent2, pal.soft].map((c, j) => <div key={j} style={{ width: 24, height: 24, borderRadius: "50%", background: c, marginLeft: j ? -7 : 0, border: `2px solid ${pal.card}` }} />)}
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: pal.ink, fontFamily: BODY }}>{pal.name}</div>
            </button>
          ))}
        </div>
        <button onClick={onClose} style={{ fontFamily: BODY, fontSize: 13, color: P.muted, background: "none", border: "none", cursor: "pointer", marginTop: 22, textDecoration: "underline" }}>Cerrar</button>
      </div>
    </div>
  );
}

function TodayView({ P, profile, dayData, update, premium, onPremium, onNewDay }) {
  return (
    <>
      {/* Hero asimétrico: intención libre a la izquierda, reco flotante a la derecha */}
      <div className="hero-flex" style={{ maxWidth: 1120, margin: "0 auto", padding: "44px 24px 6px" }}>
        <div className="fade d1" style={{ flex: "1.1 1 0", minWidth: 0, paddingTop: 16 }}>
          <div style={{ fontFamily: ITALIC, fontStyle: "italic", fontSize: 17, color: P.accent, marginBottom: 8 }}>tu intención de hoy</div>
          <div style={{ fontFamily: SERIF, fontWeight: 400, fontSize: "clamp(1.8rem, 4.2vw, 2.9rem)", lineHeight: 1.15, color: P.ink }}>{dayData.intention || "Vivir hoy con presencia."}</div>
          <div style={{ display: "flex", gap: 18, marginTop: 18, fontSize: 13, color: P.muted, flexWrap: "wrap", alignItems: "center" }}>
            {dayData.mood && <span className="glass-soft" style={{ padding: "7px 14px", borderRadius: 100 }}>Ánimo: <strong style={{ color: P.accent }}>{dayData.mood}</strong></span>}
            {dayData.energy && <span className="glass-soft" style={{ padding: "7px 14px", borderRadius: 100 }}>Energía: <strong style={{ color: P.accent }}>{dayData.energy}</strong></span>}
            <button onClick={onNewDay} style={{ fontFamily: BODY, fontSize: 13, color: P.muted, background: "none", border: "none", cursor: "pointer", textDecoration: "underline", padding: 0 }}>{dayData.mood ? "Rehacer check-in" : "Check-in completo"}</button>
          </div>
        </div>
        <div className="fade d2" style={{ flex: "1 1 0", minWidth: 0 }}>
          <RecoCard P={P} profile={profile} dayData={dayData} premium={premium} onPremium={onPremium} />
        </div>
      </div>

      {/* Check-in rápido, totalmente opcional */}
      {!dayData.checkinTouched && !dayData.skipCheckin && !dayData.mood && (
        <div className="fade d2" style={{ maxWidth: 1120, margin: "0 auto", padding: "18px 24px 0" }}>
          <QuickCheckin P={P} dayData={dayData} update={update} />
        </div>
      )}

      {/* Bento asimétrico */}
      <div className="bento" style={{ maxWidth: 1120, margin: "0 auto", padding: "30px 24px 130px" }}>
        <div className="w3 fade d2"><TasksWidget P={P} tilt="tilt-l" radius="34px 62px 40px 58px" label="Pendientes laborales" hint="Aquí van tus pendientes del trabajo." k="tasksWork" dayData={dayData} update={update} premium={premium} onPremium={onPremium} profile={profile} kind="work" /></div>
        <div className="w3 push fade d3"><TasksWidget P={P} tilt="tilt-r" radius="58px 36px 62px 34px" label="Pendientes personales" hint="Aquí va todo lo tuyo, fuera del trabajo." k="tasksPersonal" dayData={dayData} update={update} premium={premium} onPremium={onPremium} profile={profile} kind="personal" /></div>
        <div className="w4 fade d3"><JournalWidget P={P} dayData={dayData} update={update} premium={premium} onPremium={onPremium} /></div>
        <div className="w2 fade d4"><AffirmWidget P={P} dayData={dayData} update={update} premium={premium} onPremium={onPremium} /></div>
        <div className="w6 fade d5"><AssistantWidget P={P} profile={profile} dayData={dayData} premium={premium} onPremium={onPremium} /></div>
      </div>
    </>
  );
}

// ── Check-in rápido y opcional (chips en una sola tarjeta) ──
function QuickCheckin({ P, dayData, update }) {
  const [intention, setIntention] = useState("");
  const moods = [["En paz", 5], ["Bien", 4], ["Neutral", 3], ["Con estrés", 2], ["Abrumada", 1]];
  const saveIntention = () => { if (intention.trim()) update({ intention: intention.trim() }); };

  return (
    <div className="glass-soft" style={{ borderRadius: "30px 56px 30px 56px", padding: "20px 26px", display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
      <div style={{ minWidth: 170 }}>
        <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: P.ink }}>¿Cómo llegas hoy?</div>
        <div style={{ fontFamily: ITALIC, fontStyle: "italic", fontSize: 13, color: P.muted, marginTop: 3 }}>Opcional — tu espacio no te lo exige.</div>
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", flex: 1, minWidth: 260 }}>
        {moods.map(([t, score]) => (
          <button key={t} onClick={() => update({ mood: t, moodScore: score, checkinTouched: true })} style={{ ...chip(P, false), padding: "8px 13px", fontSize: 12.5 }}>{t}</button>
        ))}
      </div>
      <input value={intention} onChange={(e) => setIntention(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { saveIntention(); update({ checkinTouched: true }); } }} onBlur={saveIntention} placeholder="Tu intención de hoy (si quieres)…" className="pill-input" style={{ ...inputSm(P), minWidth: 220, flex: 1 }} />
      <button onClick={() => update({ skipCheckin: true })} title="Ocultar por hoy" style={{ fontFamily: BODY, fontSize: 13, color: P.muted, background: "none", border: "none", cursor: "pointer", textDecoration: "underline", whiteSpace: "nowrap" }}>Ahora no</button>
    </div>
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

  const monthDays = days.filter((d) => d.date && d.date.slice(0, 7) === dayId().slice(0, 7));
  // Un día cuenta como registrado si tuvo actividad real (ánimo, journal o pendientes).
  const thisMonth = monthDays.filter((d) => d.mood || (d.journal || "").trim() || (d.tasksWork?.length || 0) + (d.tasksPersonal?.length || 0) > 0);
  const moodDays = thisMonth.filter((d) => d.moodScore);
  const avgMood = moodDays.length ? (moodDays.reduce((s, d) => s + d.moodScore, 0) / moodDays.length) : 0;
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

  if (loading) return <div style={{ maxWidth: 1120, margin: "0 auto", padding: "60px 24px", textAlign: "center", color: P.muted }}>cargando tu progreso…</div>;

  const radii = ["34px 60px 34px 60px", "60px 34px 60px 34px", "34px 34px 60px 34px", "60px 60px 34px 60px"];

  return (
    <div style={{ maxWidth: 1120, margin: "0 auto", padding: "44px 24px 130px" }}>
      <div className="fade d1">
        <div style={{ fontFamily: ITALIC, fontStyle: "italic", fontSize: 17, color: P.accent, marginBottom: 6 }}>cómo vas este mes</div>
        <H1 P={P}>{moodLabel}.</H1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 18, marginTop: 28, marginBottom: 34 }}>
        {[
          { big: thisMonth.length, label: "días registrados", sub: "tu constancia" },
          { big: avgMood ? avgMood.toFixed(1) : "—", label: "ánimo promedio", sub: "sobre 5" },
          { big: `${completion}%`, label: "pendientes cumplidos", sub: `${doneTasks} de ${totalTasks}` },
          { big: journalDays, label: "días de journaling", sub: "tu mente en orden" },
        ].map((m, i) => (
          <div key={i} className={`glass lift fade d${i + 1}`} style={{ borderRadius: radii[i], padding: "24px 22px", transform: `rotate(${i % 2 ? 0.7 : -0.7}deg)` }}>
            <div style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 42, color: P.accent, lineHeight: 1 }}>{m.big}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: P.ink, marginTop: 8 }}>{m.label}</div>
            <div style={{ fontSize: 12, color: P.muted, marginTop: 2 }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {moodDays.length > 0 && (
        <div className="glass tilt-l fade d3" style={{ borderRadius: "40px 70px 40px 70px", padding: 28, marginBottom: 26 }}>
          <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: P.ink, marginBottom: 16 }}>Tu ánimo, día a día</div>
          <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 90 }}>
            {moodDays.slice().reverse().map((d, i) => (
              <div key={i} title={`${d.date}: ${d.mood}`} style={{ flex: 1, minWidth: 6, height: `${((d.moodScore || 3) / 5) * 100}%`, background: `linear-gradient(180deg, ${P.accent}, ${P.accent}99)`, borderRadius: 100, opacity: 0.4 + ((d.moodScore || 3) / 5) * 0.6, transition: "height .4s ease" }} />
            ))}
          </div>
        </div>
      )}

      <div className="glass-dark tilt-r fade d4" style={{ borderRadius: "70px 40px 70px 40px", padding: 30, marginBottom: 30 }}>
        <div style={{ fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color: P.paperSoft, marginBottom: 12 }}>✦ Tu lectura del mes</div>
        {insight ? (
          <div style={{ fontSize: 15, lineHeight: 1.7, color: P.paper, whiteSpace: "pre-wrap" }}>{insight}</div>
        ) : (
          <>
            <div style={{ fontFamily: ITALIC, fontStyle: "italic", fontSize: 19, color: P.paper, lineHeight: 1.5, marginBottom: 18 }}>Deja que tu guía lea tu mes y te diga en qué enfocarte.</div>
            <button onClick={genInsight} disabled={insightLoading} style={{ fontFamily: BODY, fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 100, border: `1.5px solid ${P.paperSoft}`, background: "transparent", color: P.paper, cursor: "pointer" }}>
              {insightLoading ? "Leyendo tu mes…" : premium ? "✦ Generar mi análisis" : "✦ Análisis del mes (Premium)"}
            </button>
          </>
        )}
      </div>

      <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: P.ink, marginBottom: 14 }}>Tu diario, día por día</div>
      {days.filter((d) => d.journal && d.journal.trim()).length === 0 && (
        <div style={{ fontSize: 14, color: P.muted, fontStyle: "italic" }}>Cuando escribas en tu journal, tus entradas aparecerán aquí para que regreses a verlas.</div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {days.filter((d) => d.journal && d.journal.trim()).map((d, i) => {
          const fecha = new Date(d.date + "T12:00:00").toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" });
          const open = openDay === d.date;
          return (
            <div key={i} onClick={() => setOpenDay(open ? null : d.date)} className="glass-soft lift" style={{ borderRadius: open ? "28px 48px 28px 48px" : 100, padding: open ? "20px 26px" : "16px 24px", cursor: "pointer", transform: `rotate(${i % 2 ? 0.4 : -0.4}deg)` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: P.ink, textTransform: "capitalize" }}>{fecha}</div>
                <div style={{ fontSize: 12, color: P.muted }}>{d.mood} · {open ? "cerrar" : "leer"}</div>
              </div>
              {open && <div style={{ fontFamily: ITALIC, fontSize: 16, lineHeight: 1.7, color: P.ink, marginTop: 12, whiteSpace: "pre-wrap", fontStyle: "italic" }}>{d.journal}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

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
      `Soy ${profile.name}, trabajo en ${profile.role}. Hoy me siento "${dayData.mood || "sin registrar"}" con energía "${dayData.energy || "sin registrar"}". Lo que más me pesa hoy es: "${reto}". Mi intención de hoy es: "${dayData.intention || "estar presente"}".\n\nDame UNA recomendación concreta, cálida y accionable para hoy que ataque justo eso (máximo 3 líneas). Habla de tú, cercano, con acentos impecables. Sin preámbulo.`,
      null, 300
    );
    setAiReco(r || "No pude conectar ahorita. Intenta de nuevo en un momento.");
    setLoading(false);
  };

  return (
    <div className="glass-dark floaty" style={{ "--tilt": "0.8deg", borderRadius: "48px 68px 42px 74px", padding: "28px 30px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <Heart color={P.paperSoft} size={16} />
        <div style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: P.paperSoft }}>Para ti hoy · {reto}</div>
      </div>
      <div style={{ fontFamily: SERIF, fontWeight: 400, fontSize: "clamp(1.2rem, 3vw, 1.5rem)", color: P.paper, marginBottom: 10, lineHeight: 1.2 }}>{base.titulo}</div>
      <div style={{ fontSize: 14.5, lineHeight: 1.65, color: P.paper + "D9" }}>{base.tip}</div>

      {aiReco && (
        <div className="fade" style={{ marginTop: 18, paddingTop: 18, borderTop: `1px solid ${P.muted}44` }}>
          <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: P.paperSoft, marginBottom: 8 }}>✦ Tu recomendación de hoy</div>
          <div style={{ fontSize: 15, lineHeight: 1.65, color: P.paper, whiteSpace: "pre-wrap" }}>{aiReco}</div>
        </div>
      )}

      {!aiReco && (
        <button onClick={genReco} disabled={loading} style={{ fontFamily: BODY, fontSize: 13, fontWeight: 600, padding: "10px 18px", borderRadius: 100, border: `1px solid ${P.paperSoft}`, background: "transparent", color: P.paper, cursor: "pointer", marginTop: 16 }}>
          {loading ? "Pensando en ti…" : premium ? "✦ Dame una recomendación personalizada" : "✦ Recomendación personalizada (Premium)"}
        </button>
      )}
    </div>
  );
}

// ── Cáscara de widget (glass + radio orgánico) ──────────────
function Bubble({ P, title, hint, tag, children, tilt = "", radius = "36px 60px 36px 60px" }) {
  return (
    <div className={`glass ${tilt}`} style={{ borderRadius: radius, padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: hint ? 4 : 14 }}>
        <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: P.ink }}>{title}</div>
        {tag && <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: P.accent, border: `1px solid ${P.soft}`, borderRadius: 100, padding: "3px 9px", background: P.card + "80" }}>{tag}</div>}
      </div>
      {hint && <div style={{ fontFamily: ITALIC, fontStyle: "italic", fontSize: 14, color: P.muted, marginBottom: 14 }}>{hint}</div>}
      {children}
    </div>
  );
}

function TasksWidget({ P, label, hint, k, dayData, update, premium, onPremium, profile, kind, tilt, radius }) {
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
    <Bubble P={P} title={label} hint={hint} tag={tasks.length ? `${done}/${tasks.length}` : null} tilt={tilt} radius={radius}>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="Agregar pendiente…" className="pill-input" style={inputSm(P)} />
        <button onClick={add} style={{ width: 40, height: 40, borderRadius: "50%", border: "none", background: P.accent, color: P.card, fontSize: 18, cursor: "pointer", boxShadow: `0 6px 16px ${P.accent}44`, flexShrink: 0 }}>+</button>
      </div>
      {tasks.length === 0 && <div style={{ fontSize: 13, color: P.muted, fontStyle: "italic", padding: "4px 0 10px" }}>Nada aún. Escríbelo arriba y sácalo de tu cabeza.</div>}
      {tasks.map((t, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: `1px dashed ${P.line}` }}>
          <div onClick={() => toggle(i)} style={{ width: 20, height: 20, borderRadius: "50%", border: `1.5px solid ${t.done ? P.accent : P.line}`, background: t.done ? P.accent : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, transition: "all .25s" }}>
            {t.done && <span style={{ color: P.card, fontSize: 11 }}>✓</span>}
          </div>
          <span onClick={() => toggle(i)} style={{ flex: 1, fontSize: 14, color: t.done ? P.muted : P.ink, textDecoration: t.done ? "line-through" : "none", cursor: "pointer", transition: "color .25s" }}>{t.text}</span>
          <button onClick={() => del(i)} style={{ background: "none", border: "none", color: P.muted, cursor: "pointer", fontSize: 16 }}>×</button>
        </div>
      ))}
      <button onClick={suggest} disabled={aiLoading} style={{ ...aiMini(P), marginTop: 14 }}>{aiLoading ? "Pensando…" : premium ? "✦ Sugerir con IA" : "✦ Sugerir con IA (Premium)"}</button>
    </Bubble>
  );
}

function JournalWidget({ P, dayData, update, premium, onPremium }) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const staticP = ["¿Qué necesitas soltar hoy?", "¿Qué es lo que más pesa ahora?", "Si hoy saliera bien, ¿cómo se vería?"];
  const gen = async () => {
    if (!premium) return onPremium();
    setLoading(true);
    const r = await askClaude(`Me siento "${dayData.mood || "neutral"}". Dame UN prompt de journaling corto y cálido para hoy. Solo el prompt, máximo 15 palabras, con acentos impecables.`, null, 120);
    setPrompt(r || staticP[0]); setLoading(false);
  };
  const shown = prompt || staticP[new Date().getDate() % staticP.length];
  const words = (dayData.journal || "").trim() ? (dayData.journal || "").trim().split(/\s+/).length : 0;
  return (
    <div className="glass tilt-l" style={{ borderRadius: "64px 38px 64px 38px", padding: "30px 32px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: P.ink }}>Journaling del día</div>
        {words > 0 && <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: P.accent, border: `1px solid ${P.soft}`, borderRadius: 100, padding: "3px 9px" }}>{words} palabras</div>}
      </div>
      <div style={{ fontFamily: SERIF, fontSize: 44, lineHeight: 0.4, color: P.soft, marginTop: 16 }}>“</div>
      <div style={{ fontFamily: ITALIC, fontStyle: "italic", fontSize: 21, color: P.accent, margin: "2px 0 16px", lineHeight: 1.4 }}>{shown}</div>
      <textarea
        value={dayData.journal || ""}
        onChange={(e) => update({ journal: e.target.value })}
        placeholder="Escribe sin juzgarte. Nadie más va a leer esto…"
        className="paper"
        style={{ minHeight: 150, fontSize: 17, lineHeight: 1.8, padding: "6px 2px 14px", color: P.ink, resize: "vertical" }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14 }}>
        <button onClick={gen} disabled={loading} style={aiMini(P)}>{loading ? "Pensando…" : premium ? "✦ Prompt para mi día" : "✦ Prompt (Premium)"}</button>
        <span style={{ fontSize: 12, color: P.muted, fontStyle: "italic" }}>se guarda solo</span>
      </div>
    </div>
  );
}

function AffirmWidget({ P, dayData, update }) {
  const [loading, setLoading] = useState(false);
  const affs = ["Hoy elijo avanzar con calma, no con prisa.", "No tengo que hacerlo todo. Solo lo que importa.", "Mi valor no depende de mi lista de pendientes.", "Puedo estar presente en una cosa a la vez."];
  const gen = async () => {
    setLoading(true);
    const r = await askClaude(`Me siento "${dayData.mood || "neutral"}". Dame UNA afirmación corta, cálida y realista (no cursi). Solo la frase, máximo 12 palabras, sin comillas, con acentos impecables.`, null, 80);
    update({ affirmation: r || affs[Math.floor(Math.random() * affs.length)] }); setLoading(false);
  };
  const shown = dayData.affirmation || affs[new Date().getDate() % affs.length];
  return (
    <div className="glass-dark floaty-slow" style={{ "--tilt": "-1deg", borderRadius: "58% 42% 55% 45% / 48% 55% 45% 52%", padding: "38px 30px", textAlign: "center" }}>
      <Heart color={P.paperSoft} size={16} />
      <div style={{ fontFamily: ITALIC, fontStyle: "italic", fontSize: 19, color: P.paper, lineHeight: 1.45, margin: "12px 0 18px" }}>"{shown}"</div>
      <button onClick={gen} disabled={loading} style={{ fontFamily: BODY, fontSize: 12.5, fontWeight: 600, padding: "9px 16px", borderRadius: 100, border: `1px solid ${P.paperSoft}`, background: "transparent", color: P.paper, cursor: "pointer" }}>
        {loading ? "Pensando…" : "✦ Otra afirmación"}
      </button>
    </div>
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
    const ctx = `Contexto: ${profile.name}, trabaja en ${profile.role}, hoy se siente ${dayData.mood || "sin registrar"} con energía ${dayData.energy || "sin registrar"}. Su reto: ${profile.challenge}.`;
    const r = await askClaude(`${ctx}\n\nMe dice: "${userMsg}"\n\nResponde como su guía cálida y breve (máximo 4 líneas), con acentos impecables.`, null, 400);
    setMsgs((m) => [...m, { role: "ai", text: r || "No pude conectar ahorita." }]); setLoading(false);
  };
  return (
    <Bubble P={P} title="Tu guía" hint="Habla con ella cuando te sientas abrumada o quieras ordenar ideas." tag={premium ? "IA" : "Premium"} radius="44px 44px 68px 44px">
      {!premium ? (
        <div style={{ textAlign: "center", padding: "10px 0" }}>
          <button onClick={onPremium} style={primaryBtn(P)}>Desbloquear mi guía ✦</button>
        </div>
      ) : (
        <>
          <div style={{ minHeight: 60, maxHeight: 240, overflowY: "auto", marginBottom: 12 }}>
            {msgs.length === 0 && <div style={{ fontSize: 14, color: P.muted, fontStyle: "italic" }}>Cuéntame cómo vas, o pídeme ayuda para ordenar tu día.</div>}
            {msgs.map((m, i) => (
              <div key={i} className="fade" style={{ margin: "8px 0", textAlign: m.role === "user" ? "right" : "left" }}>
                <span style={{ display: "inline-block", maxWidth: "80%", padding: "11px 16px", borderRadius: m.role === "user" ? "22px 22px 6px 22px" : "22px 22px 22px 6px", fontSize: 14, lineHeight: 1.5, background: m.role === "user" ? P.accent : P.card + "D9", color: m.role === "user" ? P.card : P.ink, boxShadow: "0 4px 14px rgba(0,0,0,0.06)" }}>{m.text}</span>
              </div>
            ))}
            {loading && <div style={{ fontSize: 13, color: P.muted, fontStyle: "italic" }}>escribiendo…</div>}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Escríbele a tu guía…" className="pill-input" style={inputSm(P)} />
            <button onClick={send} style={{ padding: "0 22px", borderRadius: 100, border: "none", background: P.accent, color: P.card, fontSize: 14, fontWeight: 600, cursor: "pointer", boxShadow: `0 6px 16px ${P.accent}44` }}>Enviar</button>
          </div>
        </>
      )}
    </Bubble>
  );
}

// ── Burbuja flotante de pausa consciente + pop-up ───────────
function PauseBubble({ P, premium, onPremium }) {
  const [open, setOpen] = useState(false);
  const [breathing, setBreathing] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Pausa consciente"
        className="glass-dark floaty"
        style={{ "--tilt": "0deg", position: "fixed", bottom: 26, right: 26, zIndex: 60, width: 76, height: 76, borderRadius: "50%", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, color: P.paper }}
      >
        <Heart color={P.paperSoft} size={18} />
        <span style={{ fontFamily: BODY, fontSize: 10.5, fontWeight: 600, letterSpacing: "0.06em" }}>pausa</span>
      </button>

      {open && (
        <div onClick={() => { setOpen(false); setBreathing(false); }} style={{ position: "fixed", inset: 0, background: "rgba(25,20,18,0.35)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, zIndex: 100 }}>
          <div onClick={(e) => e.stopPropagation()} className="glass fade" style={{ borderRadius: "60px 90px 60px 90px", maxWidth: 420, width: "100%", padding: "46px 38px", textAlign: "center", position: "relative" }}>
            <button onClick={() => { setOpen(false); setBreathing(false); }} style={{ position: "absolute", top: 18, right: 24, background: "none", border: "none", fontSize: 22, color: P.muted, cursor: "pointer" }}>×</button>
            <div style={{ fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", color: P.muted, marginBottom: 8 }}>Pausa consciente</div>
            <div style={{ fontFamily: ITALIC, fontStyle: "italic", fontSize: 20, color: P.accent, marginBottom: 30 }}>Un momento para ti.</div>
            <div
              onClick={() => setBreathing(!breathing)}
              className={breathing ? "breathe" : "glow"}
              style={{ width: 130, height: 130, borderRadius: "50%", background: `radial-gradient(circle at 35% 30%, ${P.soft}, ${P.accent}AA)`, margin: "0 auto 26px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: P.card, fontSize: 14, fontWeight: 600, boxShadow: `0 16px 40px ${P.accent}55` }}
            >
              {breathing ? "respira…" : "toca"}
            </div>
            <div style={{ fontSize: 14, color: P.muted, lineHeight: 1.6, marginBottom: 20 }}>Inhala 4 · Sostén 4 · Exhala 4</div>
            <button onClick={() => !premium && onPremium()} style={aiMini(P)}>{premium ? "✦ Activar recordatorios" : "✦ Recordatorios de pausa (Premium)"}</button>
          </div>
        </div>
      )}
    </>
  );
}

function PremiumModal({ P, onClose, onBuy }) {
  const perks = ["Plan de trabajo a la medida para tu proyecto", "Guía de IA que te habla y organiza tu día", "Prompts de journaling que se adaptan a ti", "Sugerencias de pendientes según tu profesión", "Análisis mensual de tus patrones de burnout", "Recordatorios inteligentes de pausas"];
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(25,20,18,0.4)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, zIndex: 100 }}>
      <div onClick={(e) => e.stopPropagation()} className="glass fade" style={{ borderRadius: "56px 84px 56px 84px", maxWidth: 460, width: "100%", padding: "44px 40px", textAlign: "center" }}>
        <div style={{ fontFamily: ITALIC, fontStyle: "italic", fontSize: 20, color: P.accent, marginBottom: 6 }}>The Project ✦ Premium</div>
        <h2 style={{ fontFamily: SERIF, fontWeight: 400, fontSize: "2rem", margin: "0 0 4px", color: P.ink }}>Tu día, potenciado con IA</h2>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 6, margin: "16px 0 24px" }}>
          <span style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 44, color: P.ink }}>$10</span>
          <span style={{ fontSize: 15, color: P.muted }}>USD / mes</span>
        </div>
        <div style={{ textAlign: "left", marginBottom: 28 }}>
          {perks.map((p, i) => <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "8px 0", fontSize: 14, color: P.ink }}><span style={{ color: P.accent, flexShrink: 0 }}>✦</span> {p}</div>)}
        </div>
        <button onClick={onBuy} style={{ ...primaryBtn(P), width: "100%" }}>Activar Premium</button>
        <div style={{ fontSize: 11.5, color: P.muted, marginTop: 10 }}>Pago seguro con Stripe · Cancela cuando quieras</div>
        <button onClick={onClose} style={{ fontFamily: BODY, fontSize: 13, color: P.muted, background: "none", border: "none", cursor: "pointer", marginTop: 10, textDecoration: "underline" }}>Ahora no</button>
      </div>
    </div>
  );
}

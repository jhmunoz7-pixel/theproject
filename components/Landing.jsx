"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { store, registerLead } from "@/lib/store";
import {
  PALETTES, SERIF, BODY, ITALIC, cssVars,
  Heart, Grain, Blobs, GlobalStyles, primaryBtn, chip,
} from "@/components/ui";

const P = PALETTES.original;

export default function Landing() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setErr("");
    if (!name.trim()) { setErr("Cuéntanos tu nombre para crear tu espacio."); return; }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) { setErr("Ese correo no se ve completo. Revísalo, porfa."); return; }
    setBusy(true);
    const clean = { name: name.trim(), email: email.trim().toLowerCase() };
    await registerLead(clean);
    await store.set("tp:signup", { ...clean, at: new Date().toISOString() });
    router.push("/espacio");
  };

  const field = {
    fontFamily: BODY, fontSize: 16, padding: "16px 24px", borderRadius: 100,
    border: `1.5px solid ${P.line}`, background: P.card + "E6", color: P.ink,
    outline: "none", width: "100%",
  };

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(165deg, ${P.bg} 0%, ${P.card} 52%, ${P.bg} 100%)`, fontFamily: BODY, color: P.ink, position: "relative", overflowX: "hidden", ...cssVars(P) }}>
      <Grain />
      <Blobs P={P} />
      <GlobalStyles />

      <div style={{ position: "relative", zIndex: 2 }}>

        {/* ── Nav flotante ── */}
        <div style={{ position: "sticky", top: 16, zIndex: 30, display: "flex", justifyContent: "center", padding: "16px 20px 0" }}>
          <nav className="glass fade" style={{ borderRadius: 100, padding: "10px 12px 10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, width: "100%", maxWidth: 1060 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <svg width="32" height="32" viewBox="0 0 40 40"><circle cx="20" cy="20" r="18.5" fill="none" stroke={P.accent} strokeWidth="1.5" /><text x="20" y="27" textAnchor="middle" fontFamily={SERIF} fontSize="16" fill={P.ink}>tp</text></svg>
              <div>
                <div style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 14, lineHeight: 1 }}>The Project</div>
                <div style={{ fontSize: 9, letterSpacing: "0.32em", color: P.accent, marginTop: 2 }}>S P A C E</div>
              </div>
            </div>
            <button onClick={() => router.push("/espacio")} style={{ fontFamily: BODY, fontSize: 13, fontWeight: 600, color: P.accent, background: "transparent", border: `1px solid ${P.soft}`, borderRadius: 100, padding: "9px 18px", cursor: "pointer" }}>
              Ya tengo mi espacio →
            </button>
          </nav>
        </div>

        {/* ── Hero asimétrico ── */}
        <section className="hero-flex" style={{ maxWidth: 1120, margin: "0 auto", padding: "72px 28px 40px" }}>
          <div className="fade d1" style={{ flex: "1.15 1 0", minWidth: 0, paddingTop: 30 }}>
            <div style={{ fontFamily: ITALIC, fontStyle: "italic", fontSize: 19, color: P.accent, marginBottom: 18 }}>
              para mujeres que lo hacen todo <Heart color={P.accent} size={18} />
            </div>
            <h1 style={{ fontFamily: SERIF, fontWeight: 400, fontSize: "clamp(2.6rem, 6vw, 4.2rem)", lineHeight: 1.05, margin: "0 0 24px" }}>
              Tu día, tu mente<br />y tu trabajo —<br />
              <span style={{ fontStyle: "italic", color: P.accent }}>en un solo lugar.</span>
            </h1>
            <p style={{ fontSize: 18, color: P.muted, lineHeight: 1.7, maxWidth: 460, margin: "0 0 34px" }}>
              El espacio diario que junta tus pendientes, tu journaling y tu bienestar.
              Para dejar de vivir en automático y empezar presente.
            </p>
            <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
              <button onClick={() => document.getElementById("registro")?.scrollIntoView({ behavior: "smooth" })} className="glow" style={primaryBtn(P)}>
                Quiero mi espacio ✦
              </button>
              <span style={{ fontSize: 13, color: P.muted }}>Gratis para empezar · Sin tarjeta</span>
            </div>
          </div>

          {/* Burbujas flotantes de producto */}
          <div className="hide-sm" style={{ flex: "1 1 0", minWidth: 0, position: "relative", height: 560 }}>
            <div className="glass floaty fade d2" style={{ "--tilt": "-2deg", position: "absolute", top: 10, right: 40, width: 300, borderRadius: "36px 60px 36px 60px", padding: "24px 26px" }}>
              <div style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: P.muted, marginBottom: 10 }}>Check-in de hoy</div>
              <div style={{ fontFamily: SERIF, fontSize: 21, marginBottom: 14 }}>¿Cómo amaneciste?</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span style={{ ...chip(P, true), padding: "8px 14px", fontSize: 13 }}>En paz</span>
                <span style={{ ...chip(P, false), padding: "8px 14px", fontSize: 13 }}>Bien</span>
                <span style={{ ...chip(P, false), padding: "8px 14px", fontSize: 13 }}>Abrumada</span>
              </div>
            </div>

            <div className="glass floaty-slow fade d3" style={{ "--tilt": "1.6deg", position: "absolute", top: 216, right: 150, width: 320, borderRadius: "60px 34px 60px 34px", padding: "26px 28px" }}>
              <div style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: P.muted, marginBottom: 10 }}>Journaling</div>
              <div style={{ fontFamily: ITALIC, fontStyle: "italic", fontSize: 18, lineHeight: 1.55, color: P.ink }}>
                "Hoy quiero soltar lo que no me toca cargar…"
              </div>
            </div>

            <div className="glass-dark floaty fade d4" style={{ "--tilt": "-1.4deg", position: "absolute", top: 396, right: 30, width: 290, borderRadius: "50% 50% 46% 54% / 60% 55% 45% 40%", padding: "30px 34px", animationDelay: "-3s" }}>
              <Heart color={P.soft} size={16} />
              <div style={{ fontFamily: ITALIC, fontStyle: "italic", fontSize: 17, lineHeight: 1.5, color: P.bg, marginTop: 8 }}>
                "Mi valor no depende de mi lista de pendientes."
              </div>
            </div>
          </div>
        </section>

        {/* ── Chips de features, tamaños jugados ── */}
        <section style={{ maxWidth: 1120, margin: "0 auto", padding: "10px 28px 30px", display: "flex", gap: 18, flexWrap: "wrap", alignItems: "flex-start" }}>
          {[
            { t: "Check-in diario", d: "60 segundos para ti, antes de todo lo demás.", r: "30px 56px 30px 56px", w: 250, tilt: "-1deg" },
            { t: "Journaling que inspira", d: "Un lugar que se siente tuyo, no una tarea más.", r: "56px 30px 56px 30px", w: 300, tilt: "1.2deg", mt: 22 },
            { t: "Tu guía con IA", d: "Te escucha, te ordena el día y te cuida del burnout.", r: "40px 40px 64px 40px", w: 270, tilt: "-0.8deg", mt: 8 },
          ].map((f, i) => (
            <div key={i} className={`glass-soft lift fade d${i + 2}`} style={{ borderRadius: f.r, padding: "22px 26px", width: f.w, maxWidth: "100%", marginTop: f.mt || 0, transform: `rotate(${f.tilt})` }}>
              <div style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 18, marginBottom: 6 }}>{f.t}</div>
              <div style={{ fontSize: 14, color: P.muted, lineHeight: 1.6 }}>{f.d}</div>
            </div>
          ))}
        </section>

        {/* ── Registro ── */}
        <section id="registro" style={{ maxWidth: 720, margin: "0 auto", padding: "50px 28px 40px" }}>
          <div className="glass fade" style={{ borderRadius: "56px 88px 56px 88px", padding: "clamp(32px, 6vw, 56px)", textAlign: "center" }}>
            <div style={{ display: "inline-block", fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: P.accent, border: `1px solid ${P.soft}`, borderRadius: 100, padding: "6px 14px", marginBottom: 20 }}>
              Acceso de fundadoras · cupo limitado
            </div>
            <h2 style={{ fontFamily: SERIF, fontWeight: 400, fontSize: "clamp(2rem, 4.5vw, 2.8rem)", margin: "0 0 10px" }}>Crea tu espacio.</h2>
            <p style={{ fontFamily: ITALIC, fontStyle: "italic", fontSize: 18, color: P.accent, margin: "0 0 30px" }}>
              Tu nombre, tu correo, y en un minuto estás dentro.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 400, margin: "0 auto" }}>
              <input className="pill-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" style={field} />
              <input className="pill-input" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} placeholder="Tu correo" type="email" style={field} />
              {err && <div style={{ fontSize: 13, color: P.accent, fontStyle: "italic" }}>{err}</div>}
              <button onClick={submit} disabled={busy} style={{ ...primaryBtn(P, busy), width: "100%" }}>
                {busy ? "Creando tu espacio…" : "Crear mi espacio ✦"}
              </button>
              <div style={{ fontSize: 12, color: P.muted, marginTop: 4 }}>
                Te avisaremos cuando abramos nuevas funciones. Cero spam — prometido.
              </div>
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer style={{ textAlign: "center", padding: "30px 24px 50px", position: "relative", zIndex: 2 }}>
          <div style={{ fontFamily: SERIF, fontSize: 14, color: P.muted }}>The Project by Fer</div>
          <div style={{ fontSize: 11, letterSpacing: "0.28em", color: P.accent, marginTop: 6 }}>FIND · ELEVATE · RISE</div>
          <div style={{ fontSize: 12, color: P.muted, marginTop: 10 }}>@theprojectbyfer</div>
        </footer>
      </div>
    </div>
  );
}

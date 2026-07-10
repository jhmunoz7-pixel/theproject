"use client";

// ─── Sistema de diseño compartido: paletas, glass, blobs, primitivas ───

export const PALETTES = {
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

export const SERIF = "'Fraunces', Georgia, serif";
export const BODY = "'Work Sans', -apple-system, system-ui, sans-serif";
export const ITALIC = "'Fraunces', Georgia, serif";

export const dayId = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

// Variables CSS por paleta — las clases .glass/.tilt/etc. las consumen
export const cssVars = (P) => ({
  "--bg": P.bg,
  "--card": P.card,
  "--card-glass": P.card + "C4",
  "--card-glass-soft": P.card + "8C",
  "--ink": P.ink,
  "--accent": P.accent,
  "--accent2": P.accent2,
  "--soft": P.soft,
  "--muted": P.muted,
  "--line": P.line,
  "--dark": P.dark,
  "--dark-glass": P.dark + "E8",
  "--accent-33": P.accent + "33",
});

// ── Corazón SVG ─────────────────────────────────────────────
export function Heart({ color, size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "inline-block", verticalAlign: "middle", marginLeft: 3 }}>
      <path d="M12 20.5 C 12 20.5, 3 14.5, 3 8.8 C 3 5.9, 5.2 4, 7.6 4 C 9.4 4, 11 5, 12 6.6 C 13 5, 14.6 4, 16.4 4 C 18.8 4, 21 5.9, 21 8.8 C 21 14.5, 12 20.5, 12 20.5 Z" fill={color} />
    </svg>
  );
}

// ── Grain (textura sutil) ───────────────────────────────────
export function Grain({ opacity = 0.04 }) {
  const svg = encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>`);
  return <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1, opacity, mixBlendMode: "multiply", backgroundImage: `url("data:image/svg+xml,${svg}")` }} />;
}

// ── Blobs flotantes de fondo ────────────────────────────────
export function Blobs({ P }) {
  const blobs = [
    { c: P.accent, size: 460, top: "-10%", left: "-8%", dur: 30, delay: 0, op: 0.28 },
    { c: P.accent2, size: 380, top: "52%", left: "76%", dur: 36, delay: -9, op: 0.24 },
    { c: P.soft, size: 420, top: "68%", left: "-12%", dur: 42, delay: -18, op: 0.3 },
    { c: P.accent, size: 300, top: "6%", left: "68%", dur: 34, delay: -24, op: 0.18 },
    { c: P.soft, size: 240, top: "34%", left: "42%", dur: 38, delay: -12, op: 0.16 },
  ];
  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", zIndex: 0, pointerEvents: "none" }} aria-hidden>
      {blobs.map((b, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: b.top,
            left: b.left,
            width: b.size,
            height: b.size,
            borderRadius: "50%",
            background: `radial-gradient(circle at 35% 35%, ${b.c}, transparent 70%)`,
            filter: "blur(56px)",
            opacity: b.op,
            animation: `drift ${b.dur}s ease-in-out ${b.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

// ── Estilos globales (estáticos: consumen las variables CSS) ─
export function GlobalStyles() {
  return (
    <style>{`
      @keyframes fadeUp { from { opacity:0; transform:translateY(24px) } to { opacity:1; transform:translateY(0) } }
      .fade { animation: fadeUp .65s cubic-bezier(.22,.8,.32,1) both }
      .d1{animation-delay:.08s}.d2{animation-delay:.16s}.d3{animation-delay:.24s}.d4{animation-delay:.32s}.d5{animation-delay:.42s}.d6{animation-delay:.52s}

      @keyframes drift {
        0%,100% { transform: translate(0,0) scale(1) }
        33% { transform: translate(46px,-34px) scale(1.09) }
        66% { transform: translate(-34px,28px) scale(.94) }
      }
      @keyframes floaty {
        0%,100% { transform: translateY(0) rotate(var(--tilt, 0deg)) }
        50% { transform: translateY(-13px) rotate(var(--tilt, 0deg)) }
      }
      .floaty { animation: floaty 7s ease-in-out infinite }
      .floaty-slow { animation: floaty 10s ease-in-out infinite }

      @keyframes breathe { 0%,100% { transform: scale(1) } 45%,55% { transform: scale(1.4) } }
      .breathe { animation: breathe 8s ease-in-out infinite }

      @keyframes glow { 0%,100% { box-shadow: 0 0 0 0 var(--accent-33) } 50% { box-shadow: 0 0 0 16px transparent } }
      .glow { animation: glow 3.2s ease-in-out infinite }

      .glass {
        background: var(--card-glass);
        backdrop-filter: blur(22px) saturate(1.35);
        -webkit-backdrop-filter: blur(22px) saturate(1.35);
        border: 1px solid rgba(255,255,255,.55);
        box-shadow: 0 18px 48px rgba(0,0,0,.08);
      }
      .glass-soft {
        background: var(--card-glass-soft);
        backdrop-filter: blur(14px) saturate(1.25);
        -webkit-backdrop-filter: blur(14px) saturate(1.25);
        border: 1px solid rgba(255,255,255,.4);
        box-shadow: 0 10px 30px rgba(0,0,0,.05);
      }
      .glass-dark {
        background: var(--dark-glass);
        backdrop-filter: blur(22px) saturate(1.15);
        -webkit-backdrop-filter: blur(22px) saturate(1.15);
        border: 1px solid rgba(255,255,255,.12);
        box-shadow: 0 26px 64px rgba(0,0,0,.2);
      }

      .tilt-l { transform: rotate(-1.2deg); transition: transform .35s ease, box-shadow .35s ease }
      .tilt-r { transform: rotate(1.2deg); transition: transform .35s ease, box-shadow .35s ease }
      .tilt-l:hover, .tilt-r:hover { transform: rotate(0deg) translateY(-6px); box-shadow: 0 28px 64px rgba(0,0,0,.13) }
      .lift { transition: transform .3s ease, box-shadow .3s ease }
      .lift:hover { transform: translateY(-4px); box-shadow: 0 24px 54px rgba(0,0,0,.12) }

      .bento { display: grid; grid-template-columns: repeat(6, 1fr); gap: 22px; align-items: start }
      .w2 { grid-column: span 2 } .w3 { grid-column: span 3 } .w4 { grid-column: span 4 } .w6 { grid-column: 1 / -1 }
      .push { margin-top: 34px }
      .hero-flex { display: flex; gap: 36px; align-items: flex-start }
      @media (max-width: 940px) {
        .w2, .w3, .w4 { grid-column: 1 / -1 }
        .push { margin-top: 0 }
        .hero-flex { flex-direction: column }
        .hide-sm { display: none }
      }

      .paper {
        background: transparent; border: none; outline: none; width: 100%;
        border-bottom: 1.5px dashed var(--line);
        transition: border-color .3s ease;
        font-family: ${ITALIC}; font-style: italic;
      }
      .paper:focus { border-color: var(--accent) }

      .pill-input {
        transition: border-color .25s ease, box-shadow .25s ease;
      }
      .pill-input:focus { border-color: var(--accent) !important; box-shadow: 0 0 0 4px var(--accent-33) }

      * { -webkit-tap-highlight-color: transparent; box-sizing: border-box }
      input::placeholder, textarea::placeholder { color: var(--muted); opacity: .55 }
      button { transition: transform .2s ease, box-shadow .25s ease, background .25s ease, opacity .25s ease }
      button:active { transform: scale(.97) }
      button:disabled { opacity: .6 }
      ::selection { background: var(--accent-33) }
      ::-webkit-scrollbar { width: 6px } ::-webkit-scrollbar-thumb { background: var(--line); border-radius: 3px }
      html { scroll-behavior: smooth }
    `}</style>
  );
}

// ── Primitivas de estilo ────────────────────────────────────
export const inputBig = (P) => ({ width: "100%", maxWidth: 420, fontFamily: BODY, fontSize: 18, padding: "17px 26px", borderRadius: 100, border: `1.5px solid ${P.line}`, background: P.card + "D9", color: P.ink, outline: "none", textAlign: "center", boxShadow: "0 8px 24px rgba(0,0,0,0.05)", backdropFilter: "blur(10px)" });
export const inputSm = (P) => ({ flex: 1, fontFamily: BODY, fontSize: 14, padding: "11px 16px", borderRadius: 100, border: `1px solid ${P.line}`, background: P.card + "B3", color: P.ink, outline: "none", backdropFilter: "blur(8px)" });
export const chip = (P, active) => ({ fontFamily: BODY, fontSize: 14, padding: "11px 19px", borderRadius: 100, border: `1.5px solid ${active ? P.accent : "rgba(255,255,255,0.55)"}`, background: active ? P.accent : P.card + "99", backdropFilter: "blur(10px)", color: active ? P.card : P.ink, cursor: "pointer", transition: "all 0.25s", display: "flex", alignItems: "center", gap: 6, boxShadow: active ? `0 8px 22px ${P.accent}44` : "0 4px 14px rgba(0,0,0,0.04)" });
export const primaryBtn = (P, disabled) => ({ fontFamily: BODY, fontSize: 15, fontWeight: 600, padding: "16px 40px", borderRadius: 100, border: "none", background: disabled ? P.line : P.accent, color: P.card, cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.7 : 1, boxShadow: disabled ? "none" : `0 10px 28px ${P.accent}55` });
export const aiMini = (P) => ({ fontFamily: BODY, fontSize: 13, fontWeight: 600, padding: "9px 16px", borderRadius: 100, border: `1px solid ${P.soft}`, background: P.card + "66", backdropFilter: "blur(8px)", color: P.accent, cursor: "pointer" });
export const tabBtn = (P, active) => ({ fontFamily: BODY, fontSize: 13, fontWeight: 600, padding: "8px 18px", borderRadius: 100, border: "none", background: active ? P.accent : "transparent", color: active ? P.card : P.muted, cursor: "pointer", boxShadow: active ? `0 6px 16px ${P.accent}44` : "none" });

export function H1({ P, children, size = "clamp(2rem, 5vw, 3rem)" }) {
  return <h1 style={{ fontFamily: SERIF, fontWeight: 600, fontSize: size, lineHeight: 1.08, margin: "0 0 14px", color: P.ink }}>{children}</h1>;
}
export function Sub({ P, children }) {
  return <p style={{ fontFamily: ITALIC, fontStyle: "italic", fontSize: 19, color: P.accent, margin: "0 0 32px", lineHeight: 1.4 }}>{children}</p>;
}
export function Label({ P, children }) {
  return <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: P.muted, marginBottom: 12 }}>{children}</div>;
}

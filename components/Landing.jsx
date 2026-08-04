"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/store";

// ═══════════════════════════════════════════════════════════
//  THE PROJECT · Landing "Órbita"
//  Cosmos + naturaleza sobre la paleta de marca. La página gira
//  alrededor de los 3 espacios: asesorías 1:1, foros en vivo y
//  networking consciente. Movimiento 3D con el mouse, campo de
//  estrellas en canvas y tarjetas con inclinación.
// ═══════════════════════════════════════════════════════════

const C = {
  void: "#191D15", //  fondo profundo (cosmos)
  inkSoft: "#232719",
  ink: "#33372C", //   tinta
  olive: "#6E7444", // olivo
  soft: "#AAB488", //  olivo claro
  taupe: "#9A8F82", // topo
  greige: "#CDBFAD",
  sand: "#DDD4C4", //  arena
  nude: "#E7DDCD",
  ivory: "#F1EBDD", // marfil
  cream: "#FBF7EE",
};

const DISPLAY = "'Gloock', Georgia, serif";
const ACCENT = "'Crimson Pro', Georgia, serif";
const BODY = "'Work Sans', -apple-system, system-ui, sans-serif";

const INSTAGRAM_URL = "https://instagram.com/theprojectbyfer";
const INSTAGRAM_HANDLE = "@theprojectbyfer";
const APP_URL = "/espacio";

// ── ¿El visitante pidió menos movimiento? ───────────────────
function useReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mq) return;
    const on = () => setReduce(mq.matches);
    on();
    mq.addEventListener?.("change", on);
    return () => mq.removeEventListener?.("change", on);
  }, []);
  return reduce;
}

// ── Monograma tp ────────────────────────────────────────────
function TpMark({ size = 40, color = C.ink }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <circle cx="24" cy="24" r="22.5" stroke={color} strokeWidth="1.5" />
      <text x="24" y="30" textAnchor="middle" style={{ font: `600 17px ${ACCENT}`, fontStyle: "italic", fill: color }}>
        tp
      </text>
    </svg>
  );
}

// ── Campo cósmico: estrellas + esporas, parallax con el mouse ──
function CosmicField({ density = 1 }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let w = 0, h = 0, raf = 0, running = true;
    let stars = [], motes = [];
    const pointer = { x: 0, y: 0, cx: 0, cy: 0 };

    const build = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      if (w === 0 || h === 0) return;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const area = (w * h) / 18000;
      const count = Math.round(Math.min(150, Math.max(30, area)) * density);
      stars = Array.from({ length: count }, () => {
        const layer = Math.random();
        const depth = layer < 0.55 ? 0.12 : layer < 0.85 ? 0.3 : 0.55;
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          r: depth < 0.2 ? 0.5 + Math.random() * 0.8 : depth < 0.4 ? 0.9 + Math.random() * 1.1 : 1.4 + Math.random() * 1.4,
          a: 0.2 + Math.random() * 0.6,
          tw: 0.4 + Math.random() * 1.6,
          ph: Math.random() * Math.PI * 2,
          depth,
          warm: Math.random() > 0.72,
        };
      });

      // Esporas / hojitas a la deriva — la parte "naturaleza"
      motes = Array.from({ length: Math.round(Math.min(9, Math.max(3, w / 220))) }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        len: 9 + Math.random() * 14,
        vx: 0.06 + Math.random() * 0.12,
        vy: -0.02 - Math.random() * 0.05,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.004,
        a: 0.12 + Math.random() * 0.18,
        depth: 0.25 + Math.random() * 0.4,
      }));
    };

    const draw = (t) => {
      if (!running || w === 0) return;
      ctx.clearRect(0, 0, w, h);
      pointer.cx += (pointer.x - pointer.cx) * 0.06;
      pointer.cy += (pointer.y - pointer.cy) * 0.06;

      for (const s of stars) {
        const tw = reduce ? 1 : 0.55 + 0.45 * Math.sin((t / 900) * s.tw + s.ph);
        const x = s.x + pointer.cx * s.depth * 34;
        const y = s.y + pointer.cy * s.depth * 34;
        ctx.beginPath();
        ctx.arc(x, y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = s.warm ? `rgba(221,212,196,${s.a * tw})` : `rgba(170,180,136,${s.a * tw})`;
        ctx.fill();
        if (s.depth > 0.5) {
          ctx.beginPath();
          ctx.arc(x, y, s.r * 3.4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(170,180,136,${0.05 * tw})`;
          ctx.fill();
        }
      }

      for (const m of motes) {
        if (!reduce) {
          m.x += m.vx;
          m.y += m.vy;
          m.rot += m.vr;
          if (m.x > w + 20) m.x = -20;
          if (m.y < -20) m.y = h + 20;
        }
        const x = m.x + pointer.cx * m.depth * 26;
        const y = m.y + pointer.cy * m.depth * 26;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(m.rot);
        ctx.beginPath();
        ctx.ellipse(0, 0, m.len, m.len * 0.32, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(205,191,173,${m.a})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      }

      raf = requestAnimationFrame(draw);
    };

    const onPointer = (e) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = (e.clientX - rect.left) / rect.width - 0.5;
      pointer.y = (e.clientY - rect.top) / rect.height - 0.5;
    };
    const onVisibility = () => {
      running = !document.hidden;
      cancelAnimationFrame(raf);
      if (running) raf = requestAnimationFrame(draw);
    };

    build();
    if (reduce) {
      draw(0);
    } else {
      raf = requestAnimationFrame(draw);
      window.addEventListener("pointermove", onPointer, { passive: true });
      document.addEventListener("visibilitychange", onVisibility);
    }
    const ro = new ResizeObserver(() => {
      build();
      if (reduce) draw(0);
    });
    ro.observe(canvas);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduce, density]);

  return <canvas ref={ref} className="cosmos" aria-hidden="true" />;
}

// ── Tarjeta con inclinación 3D ──────────────────────────────
function Tilt({ children, max = 7, className = "", style }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();

  const onMove = (e) => {
    const el = ref.current;
    if (!el || reduce) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(1000px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg) translateY(-6px)`;
    el.style.setProperty("--gx", `${((px + 0.5) * 100).toFixed(1)}%`);
    el.style.setProperty("--gy", `${((py + 0.5) * 100).toFixed(1)}%`);
    el.style.setProperty("--glare", "1");
  };
  const reset = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "";
    el.style.setProperty("--glare", "0");
  };

  return (
    <div ref={ref} className={`tilt ${className}`} style={style} onPointerMove={onMove} onPointerLeave={reset}>
      {children}
    </div>
  );
}

// ── Aparición al hacer scroll ───────────────────────────────
function Reveal({ children, delay = 0, style, className = "" }) {
  const ref = useRef(null);
  const [on, setOn] = useState(false);
  const reduce = useReducedMotion();
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setOn(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setOn(true);
          io.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        // Con "reduce motion" el contenido se muestra de inmediato, sin depender de la animación
        opacity: on || reduce ? 1 : 0,
        transform: on || reduce ? "none" : "translateY(26px)",
        transition: `opacity .9s ease ${delay}ms, transform .9s cubic-bezier(.22,1,.36,1) ${delay}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ── Botones ─────────────────────────────────────────────────
function Cta({ children, href, onClick, variant = "solid", small = false, style, className = "" }) {
  const styles = {
    solid: { background: C.olive, color: C.cream, borderColor: C.olive, boxShadow: `0 10px 30px ${C.olive}44` },
    glow: { background: C.soft, color: C.ink, borderColor: C.soft, boxShadow: `0 10px 34px ${C.soft}55` },
    ghost: { background: "transparent", color: C.ink, borderColor: C.ink, boxShadow: "none" },
    ghostLight: { background: "rgba(241,235,221,.06)", color: C.ivory, borderColor: "rgba(241,235,221,.45)", boxShadow: "none" },
  };
  const base = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    fontFamily: BODY,
    fontWeight: 600,
    fontSize: small ? 13.5 : 15,
    letterSpacing: 0.3,
    padding: small ? "11px 22px" : "16px 34px",
    borderRadius: 999,
    cursor: "pointer",
    textDecoration: "none",
    border: "1.5px solid transparent",
    transition: "transform .25s ease, box-shadow .25s ease, background .25s ease, color .25s ease",
    ...styles[variant],
    ...style,
  };
  const props = {
    style: base,
    className,
    onMouseEnter: (e) => {
      e.currentTarget.style.transform = "translateY(-2px)";
      e.currentTarget.style.boxShadow = "0 14px 34px rgba(25,29,21,.3)";
    },
    onMouseLeave: (e) => {
      e.currentTarget.style.transform = "none";
      e.currentTarget.style.boxShadow = styles[variant].boxShadow;
    },
  };
  if (href && href.startsWith("/")) return <Link href={href} {...props}>{children}</Link>;
  if (href) return <a href={href} {...props}>{children}</a>;
  return <button type="button" onClick={onClick} {...props}>{children}</button>;
}

// ── Nav ─────────────────────────────────────────────────────
const NAV = [
  ["Los 3 espacios", "#espacios"],
  ["Reto del mes", "#reto"],
  ["La app", "#la-app"],
  ["Conoce a Fer", "#conoce-a-fer"],
];

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      const hgt = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(hgt > 0 ? Math.min(1, window.scrollY / hgt) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 60,
        padding: scrolled && !open ? "12px 24px" : "20px 24px",
        background: scrolled || open ? "rgba(25,29,21,.94)" : "transparent",
        backdropFilter: scrolled || open ? "blur(14px)" : "none",
        WebkitBackdropFilter: scrolled || open ? "blur(14px)" : "none",
        borderBottom: `1px solid ${scrolled || open ? "rgba(241,235,221,.12)" : "transparent"}`,
        transition: "all .35s ease",
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, height: 2, width: `${progress * 100}%`, background: C.soft, transition: "width .1s linear" }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, maxWidth: 1240, margin: "0 auto" }}>
        <a href="#top" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <TpMark size={32} color={C.ivory} />
          <span style={{ fontFamily: DISPLAY, fontSize: 16, letterSpacing: 2.5, color: C.ivory, whiteSpace: "nowrap" }}>THE PROJECT</span>
        </a>
        <div className="nav-links" style={{ display: "flex", gap: 22, alignItems: "center" }}>
          {NAV.map(([label, href]) => (
            <a
              key={href}
              href={href}
              style={{
                fontFamily: BODY,
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: 1.4,
                textTransform: "uppercase",
                color: C.ivory,
                textDecoration: "none",
                opacity: 0.72,
                transition: "opacity .2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = 0.72)}
            >
              {label}
            </a>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Cta href="#inscribirme" variant="glow" small style={{ whiteSpace: "nowrap" }} className="nav-cta">Reservar mi lugar</Cta>
          <button
            type="button"
            className="nav-burger"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            style={{
              display: "none",
              width: 38,
              height: 38,
              borderRadius: "50%",
              border: "1px solid rgba(241,235,221,.4)",
              background: "transparent",
              color: C.ivory,
              cursor: "pointer",
              fontSize: 15,
            }}
          >
            {open ? "✕" : "☰"}
          </button>
        </div>
      </div>
      {open && (
        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 14, paddingTop: 12, borderTop: "1px solid rgba(241,235,221,.14)" }}>
          {NAV.map(([label, href]) => (
            <a
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              style={{ fontFamily: BODY, fontSize: 14, color: C.ivory, textDecoration: "none", padding: "11px 4px", opacity: 0.85 }}
            >
              {label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}

// ── Hero ────────────────────────────────────────────────────
const HERO_LINES = [
  "¿pero es la vida que tú quieres?",
  "¿o vas en automático?",
  "y aun así algo falta.",
  "wait… ¿y tú cuándo?",
];

function RotatingLine() {
  const [i, setI] = useState(0);
  const [vis, setVis] = useState(true);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => {
      setVis(false);
      setTimeout(() => {
        setI((x) => (x + 1) % HERO_LINES.length);
        setVis(true);
      }, 360);
    }, 3600);
    return () => clearInterval(t);
  }, [reduce]);
  return (
    <em
      style={{
        display: "block",
        fontFamily: ACCENT,
        fontStyle: "italic",
        fontWeight: 500,
        color: C.soft,
        opacity: vis ? 1 : 0,
        transform: vis ? "none" : "translateY(10px)",
        transition: "opacity .36s ease, transform .36s ease",
      }}
    >
      {HERO_LINES[i]}
    </em>
  );
}

// Anillos orbitales del hero — naturaleza en órbita
function Orbits() {
  return (
    <svg className="orbits" viewBox="0 0 600 600" fill="none" aria-hidden="true">
      <circle cx="300" cy="300" r="285" stroke={C.soft} strokeWidth="0.8" opacity="0.22" />
      <circle cx="300" cy="300" r="215" stroke={C.greige} strokeWidth="0.8" opacity="0.18" strokeDasharray="3 9" />
      <circle cx="300" cy="300" r="140" stroke={C.soft} strokeWidth="0.8" opacity="0.14" />
      <g className="orbit-spin" style={{ transformOrigin: "300px 300px" }}>
        <circle cx="585" cy="300" r="4" fill={C.soft} opacity="0.75" />
        <path d="M274 15 c 14 -16, 38 -16, 52 0 c -14 16, -38 16, -52 0 Z" fill="none" stroke={C.greige} strokeWidth="1.1" opacity="0.5" />
      </g>
      <g className="orbit-spin-rev" style={{ transformOrigin: "300px 300px" }}>
        <circle cx="300" cy="85" r="3" fill={C.greige} opacity="0.6" />
      </g>
    </svg>
  );
}

// ── Cinta marquee ───────────────────────────────────────────
function Ribbon({ items }) {
  const seq = [];
  for (let r = 0; r < 4; r++) items.forEach((w) => seq.push(w));
  return (
    <div style={{ background: C.ink, overflow: "hidden", padding: "15px 0" }}>
      <div className="marquee" style={{ display: "flex", width: "max-content" }}>
        {seq.map((w, i) => (
          <span
            key={i}
            style={{
              fontFamily: DISPLAY,
              fontSize: 16,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: C.ivory,
              padding: "0 24px",
              whiteSpace: "nowrap",
            }}
          >
            {w}
            <span style={{ color: C.soft, marginLeft: 44 }}>✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ── LOS 3 ESPACIOS (el corazón de la página) ────────────────
const PRODUCTS = [
  {
    id: "asesorias",
    n: "01",
    kicker: "Sesión 1:1",
    title: "Asesorías conmigo",
    claim: "No es coaching. Es pensar en voz alta con alguien que ya recorrió el camino — y salir con un plan sólido.",
    bullets: [
      "Un espacio para poner sobre la mesa dónde estás y qué quieres",
      "Estructura real: convertimos las ideas sueltas en un plan",
      "Sales con siguientes pasos concretos, no con tarea abstracta",
    ],
    price: "Cupo limitado",
    priceNote: "sesión individual",
    cta: "Reservar mi sesión",
    icon: (
      <svg width="30" height="30" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
        <path d="M5 24V9a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-4 4Z" />
        <path d="M24 12h1a2 2 0 0 1 2 2v13l-4-4h-8" opacity=".55" />
      </svg>
    ),
  },
  {
    id: "foros",
    n: "02",
    kicker: "En vivo · por sesión",
    title: "Foros con expertos",
    claim: "Conversaciones que sí mueven la aguja: IA, liderazgo y cómo ser más eficiente sin quemarte.",
    bullets: [
      "Sesión en vivo con un experto invitado + Q&A abierto",
      "Temas que usas el lunes: IA aplicada, liderazgo, foco",
      "Te llevas la grabación y los recursos de la sesión",
    ],
    price: "desde $5 USD",
    priceNote: "por sesión",
    cta: "Apartar mi lugar",
    icon: (
      <svg width="30" height="30" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
        <circle cx="16" cy="12" r="4.4" />
        <path d="M7 26c0-4.4 4-7.5 9-7.5s9 3.1 9 7.5" />
        <path d="M4.5 8.5A11 11 0 0 1 9 4M27.5 8.5A11 11 0 0 0 23 4" opacity=".55" />
      </svg>
    ),
  },
  {
    id: "eventos",
    n: "03",
    kicker: "En vivo · por evento",
    title: "Networking consciente",
    claim: "Encuentros para conectar de verdad. No venimos a competir — venimos a abrirnos camino juntas.",
    bullets: [
      "Grupos pequeños, moderados para que sí se hable",
      "Conexiones reales, cero intercambio de tarjetas",
      "Calendario por evento: eliges a cuál llegar",
    ],
    price: "Pago por evento",
    priceNote: "próximas fechas pronto",
    cta: "Avísame de la próxima",
    icon: (
      <svg width="30" height="30" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
        <circle cx="11" cy="12" r="3.6" />
        <circle cx="21" cy="12" r="3.6" opacity=".55" />
        <path d="M4 25c0-3.6 3.1-6.2 7-6.2s7 2.6 7 6.2" />
        <path d="M18 19.5c1-.5 2-.7 3-.7 3.9 0 7 2.6 7 6.2" opacity=".55" />
      </svg>
    ),
  },
];

function Products({ onPick }) {
  return (
    <div className="prod-grid">
      {PRODUCTS.map((p, i) => (
        <Reveal key={p.id} delay={i * 110} style={{ display: "flex" }}>
          <Tilt className="prod-card" style={{ width: "100%" }}>
            <span id={p.id} style={{ position: "absolute", top: -110 }} aria-hidden="true" />
            <div className="tilt-inner">
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                <span style={{ color: C.olive }}>{p.icon}</span>
                <span style={{ fontFamily: DISPLAY, fontSize: 30, color: C.sand, lineHeight: 1 }}>{p.n}</span>
              </div>
              <div style={{ marginTop: 18, fontFamily: BODY, fontSize: 11, fontWeight: 600, letterSpacing: 1.8, textTransform: "uppercase", color: C.olive }}>
                {p.kicker}
              </div>
              <h3 style={{ fontFamily: DISPLAY, fontSize: 26, fontWeight: 400, lineHeight: 1.15, color: C.ink, margin: "8px 0 12px" }}>{p.title}</h3>
              <p style={{ fontFamily: ACCENT, fontStyle: "italic", fontSize: 17.5, lineHeight: 1.5, color: C.olive, margin: "0 0 18px" }}>{p.claim}</p>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 22px", display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
                {p.bullets.map((b) => (
                  <li key={b} style={{ display: "flex", gap: 10, fontFamily: BODY, fontSize: 14, lineHeight: 1.6, color: C.ink, opacity: 0.82 }}>
                    <span style={{ color: C.soft, flexShrink: 0 }}>✦</span>
                    {b}
                  </li>
                ))}
              </ul>
              <div style={{ borderTop: `1px solid ${C.sand}`, paddingTop: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontFamily: DISPLAY, fontSize: 22, color: C.ink }}>{p.price}</div>
                  <div style={{ fontFamily: BODY, fontSize: 11.5, color: C.taupe }}>{p.priceNote}</div>
                </div>
                <Cta small onClick={() => onPick(p.title)}>{p.cta}</Cta>
              </div>
            </div>
          </Tilt>
        </Reveal>
      ))}
    </div>
  );
}

// ── Reto del mes ────────────────────────────────────────────
const RETO = {
  mes: "Julio",
  nombre: "AWAKE",
  hashtag: "#Awake21",
  claim: "21 días para despertar",
  desc: "Un prompt al día durante tres semanas: mirar hacia adentro, encontrar claridad y dar el primer paso. Lo llevas dentro de la app y compartes lo que quieras.",
  fases: [
    ["Días 1–7", "Mirar hacia adentro"],
    ["Días 8–14", "Encontrar claridad"],
    ["Días 15–21", "Dar el primer paso"],
  ],
};

function RetoDelMes() {
  return (
    <div className="reto-wrap">
      <Reveal>
        <Tilt max={5} className="reto-card">
          <div className="tilt-inner">
            <div className="reto-grid">
              <div>
                <div style={{ fontFamily: BODY, fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: C.soft }}>
                  Reto de {RETO.mes} · {RETO.hashtag}
                </div>
                <div style={{ fontFamily: DISPLAY, fontSize: "clamp(44px, 8vw, 76px)", lineHeight: 1, color: C.ivory, margin: "10px 0 6px", letterSpacing: 1 }}>
                  {RETO.nombre}
                </div>
                <div style={{ fontFamily: ACCENT, fontStyle: "italic", fontSize: 21, color: C.greige, marginBottom: 18 }}>{RETO.claim}</div>
                <p style={{ fontFamily: BODY, fontSize: 15, lineHeight: 1.7, color: C.ivory, opacity: 0.78, maxWidth: 440, margin: "0 0 24px" }}>{RETO.desc}</p>
                <Cta href={APP_URL} variant="glow">Entrar al reto ✦</Cta>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {RETO.fases.map(([dias, titulo], i) => (
                  <div
                    key={dias}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: "16px 18px",
                      borderRadius: 18,
                      background: "rgba(241,235,221,.06)",
                      border: "1px solid rgba(241,235,221,.16)",
                    }}
                  >
                    <span style={{ fontFamily: DISPLAY, fontSize: 20, color: C.soft, width: 26, flexShrink: 0 }}>{i + 1}</span>
                    <div>
                      <div style={{ fontFamily: BODY, fontSize: 10.5, fontWeight: 600, letterSpacing: 1.4, textTransform: "uppercase", color: C.greige, opacity: 0.85 }}>{dias}</div>
                      <div style={{ fontFamily: BODY, fontSize: 14.5, color: C.ivory }}>{titulo}</div>
                    </div>
                  </div>
                ))}
                <div style={{ padding: "16px 18px", borderRadius: 18, border: "1px dashed rgba(241,235,221,.28)", fontFamily: ACCENT, fontStyle: "italic", fontSize: 15.5, color: C.greige }}>
                  Agosto: el siguiente reto se revela pronto ✦
                </div>
              </div>
            </div>
          </div>
        </Tilt>
      </Reveal>
    </div>
  );
}

// ── Franja de la app ────────────────────────────────────────
const APP_CHIPS = ["Check-in diario", "Journaling guiado", "Pendientes: trabajo + vida", "Tu progreso del mes", "El reto del mes"];

// ── Testimonios ─────────────────────────────────────────────
const TESTIMONIALS = [
  { q: "Llegué pensando que necesitaba otro curso. Salí con un plan que sí es mío.", n: "Mariana G.", r: "Gerente de marketing · CDMX" },
  { q: "El foro de IA me cambió la forma de trabajar. En una hora, cosas que sí uso.", n: "Caro V.", r: "Consultora · Bogotá" },
  { q: "El networking fue otra cosa: mujeres que te empujan sin competirte.", n: "Fernanda R.", r: "Product manager · Monterrey" },
];

// ── Preguntas frecuentes ────────────────────────────────────
const FAQ = [
  ["¿La asesoría 1:1 es coaching?", "No. Es un espacio de conversación y estructura: ponemos sobre la mesa dónde estás y qué quieres, y lo convertimos en un plan sólido con pasos concretos. Sin fórmulas ni pose de gurú."],
  ["¿Tengo que comprar todo?", "Para nada. Cada espacio va por separado y eliges el que necesitas hoy: una asesoría, un foro suelto o un evento. La app es gratis siempre."],
  ["¿Los foros se graban?", "Sí. Si te inscribes y no puedes llegar en vivo, te llega la grabación y los recursos de la sesión."],
  ["¿Cuándo son los eventos de networking?", "Publicamos el calendario evento por evento. Déjanos tu correo aquí abajo y te avisamos antes que a nadie, con tu lugar apartado."],
];

function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", gap: 10 }}>
      {FAQ.map(([q, a], i) => {
        const isOpen = open === i;
        return (
          <div
            key={q}
            style={{
              background: C.cream,
              border: `1px solid ${isOpen ? C.soft : C.sand}`,
              borderRadius: 20,
              overflow: "hidden",
              transition: "border-color .25s ease",
            }}
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? -1 : i)}
              aria-expanded={isOpen}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 14,
                textAlign: "left",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "20px 22px",
                fontFamily: BODY,
                fontSize: 15.5,
                fontWeight: 600,
                color: C.ink,
              }}
            >
              {q}
              <span style={{ color: C.olive, fontSize: 20, transform: isOpen ? "rotate(45deg)" : "none", transition: "transform .3s ease", flexShrink: 0 }}>+</span>
            </button>
            <div style={{ maxHeight: isOpen ? 260 : 0, opacity: isOpen ? 1 : 0, overflow: "hidden", transition: "max-height .4s cubic-bezier(.22,1,.36,1), opacity .3s ease" }}>
              <p style={{ fontFamily: BODY, fontSize: 14.5, lineHeight: 1.75, color: C.ink, opacity: 0.78, margin: 0, padding: "0 22px 22px" }}>{a}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Formulario de inscripción ───────────────────────────────
const INTERESES = ["Asesoría 1:1 con Fer", "Foros con expertos", "Networking consciente", "Membresía fundadoras", "Solo quiero info"];

function LeadForm({ interest, setInterest }) {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("idle");
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    setStatus("sending");
    const msg = [interest ? `Interés: ${interest}` : null, form.message.trim() || null].filter(Boolean).join(" · ");
    try {
      if (supabase) {
        const { error } = await supabase.from("leads").insert({
          name: form.name.trim(),
          email: form.email.trim(),
          message: msg || null,
        });
        if (error) throw error;
      } else if (typeof window !== "undefined") {
        const prev = JSON.parse(window.localStorage.getItem("tp:leads") || "[]");
        prev.push({ ...form, interest, at: new Date().toISOString() });
        window.localStorage.setItem("tp:leads", JSON.stringify(prev));
      }
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  const field = {
    fontFamily: BODY,
    fontSize: 15,
    padding: "15px 18px",
    borderRadius: 14,
    border: `1.5px solid ${C.sand}`,
    background: C.cream,
    color: C.ink,
    outline: "none",
    width: "100%",
    transition: "border-color .25s ease",
  };
  const labelStyle = {
    fontFamily: BODY,
    fontSize: 11.5,
    fontWeight: 600,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    color: C.taupe,
    marginBottom: 7,
    display: "block",
    textAlign: "left",
  };
  const focus = (e) => (e.target.style.borderColor = C.olive);
  const blur = (e) => (e.target.style.borderColor = C.sand);

  if (status === "done") {
    return (
      <div style={{ background: C.cream, border: `1px solid ${C.sand}`, borderRadius: 26, padding: "56px 40px", textAlign: "center" }}>
        <TpMark size={44} color={C.olive} />
        <div style={{ fontFamily: DISPLAY, fontSize: 26, color: C.ink, margin: "16px 0 10px" }}>¡Listo, {form.name.split(" ")[0]}!</div>
        <p style={{ fontFamily: BODY, fontSize: 15, color: C.taupe, lineHeight: 1.7, maxWidth: 420, margin: "0 auto 26px" }}>
          {interest ? `Anotamos tu interés en “${interest}”. ` : ""}Fer te escribe muy pronto con los detalles. Mientras tanto, tu espacio en la app ya te está esperando.
        </p>
        <Cta href={APP_URL}>Abrir mi espacio gratis</Cta>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      style={{
        background: C.cream,
        border: `1px solid ${C.sand}`,
        borderRadius: 26,
        padding: "34px 32px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        boxShadow: "0 20px 50px rgba(25,29,21,.1)",
      }}
    >
      <div>
        <span style={labelStyle}>¿Qué te interesa?</span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {INTERESES.map((it) => {
            const on = interest === it;
            return (
              <button
                key={it}
                type="button"
                onClick={() => setInterest(on ? "" : it)}
                aria-pressed={on}
                style={{
                  fontFamily: BODY,
                  fontSize: 13,
                  fontWeight: on ? 600 : 400,
                  padding: "9px 16px",
                  borderRadius: 999,
                  cursor: "pointer",
                  border: `1.5px solid ${on ? C.olive : C.sand}`,
                  background: on ? C.olive : "transparent",
                  color: on ? C.cream : C.ink,
                  transition: "all .22s ease",
                }}
              >
                {it}
              </button>
            );
          })}
        </div>
      </div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <label style={{ flex: "1 1 200px" }}>
          <span style={labelStyle}>Nombre</span>
          <input style={field} placeholder="Ej. María Olivera" value={form.name} onChange={set("name")} onFocus={focus} onBlur={blur} required />
        </label>
        <label style={{ flex: "1 1 200px" }}>
          <span style={labelStyle}>Correo electrónico</span>
          <input style={field} type="email" placeholder="tucorreo@ejemplo.com" value={form.email} onChange={set("email")} onFocus={focus} onBlur={blur} required />
        </label>
      </div>
      <label>
        <span style={labelStyle}>Mensaje (opcional)</span>
        <textarea
          style={{ ...field, resize: "vertical", minHeight: 88 }}
          placeholder="Cuéntanos dónde estás: ¿stuck, explorando, lista para empezar?"
          value={form.message}
          onChange={set("message")}
          onFocus={focus}
          onBlur={blur}
        />
      </label>
      {status === "error" && (
        <div style={{ fontFamily: BODY, fontSize: 13.5, color: "#A85668" }}>
          Algo falló al enviar. Intenta de nuevo, o escríbenos por Instagram:{" "}
          <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" style={{ color: C.olive, fontWeight: 600 }}>{INSTAGRAM_HANDLE}</a>
        </div>
      )}
      <button
        type="submit"
        disabled={status === "sending"}
        style={{
          fontFamily: BODY,
          fontWeight: 600,
          fontSize: 15,
          padding: "16px 34px",
          borderRadius: 999,
          border: "none",
          background: C.olive,
          color: C.cream,
          cursor: status === "sending" ? "wait" : "pointer",
          opacity: status === "sending" ? 0.7 : 1,
          boxShadow: `0 10px 30px ${C.olive}44`,
        }}
      >
        {status === "sending" ? "Enviando…" : "Quiero mi lugar ✦"}
      </button>
      <div style={{ fontFamily: BODY, fontSize: 12.5, color: C.taupe, textAlign: "center" }}>
        Solo usamos tu correo para responderte. Nada de spam, lo prometemos.
      </div>
    </form>
  );
}

function IconInstagram({ size = 18, color = C.ink }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5.5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.2" cy="6.8" r="1.1" fill={color} stroke="none" />
    </svg>
  );
}

// ═══ LANDING ═══
export default function Landing() {
  const [interest, setInterest] = useState("");

  const pick = useCallback((title) => {
    const map = {
      "Asesorías conmigo": "Asesoría 1:1 con Fer",
      "Foros con expertos": "Foros con expertos",
      "Networking consciente": "Networking consciente",
    };
    setInterest(map[title] || title);
    document.getElementById("inscribirme")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const eyebrow = {
    fontFamily: BODY,
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: 3,
    textTransform: "uppercase",
    color: C.olive,
    marginBottom: 16,
  };
  const eyebrowLight = { ...eyebrow, color: C.soft };
  const h2 = {
    fontFamily: DISPLAY,
    fontSize: "clamp(30px, 4.6vw, 48px)",
    fontWeight: 400,
    lineHeight: 1.12,
    color: C.ink,
    margin: 0,
  };
  const h2Light = { ...h2, color: C.ivory };

  return (
    <div id="top" style={{ background: C.ivory, color: C.ink, fontFamily: BODY, overflowX: "hidden" }}>
      <style>{`
        html { scroll-behavior: smooth; }
        @keyframes tp-marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }
        @keyframes tp-fade-up { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: none } }
        @keyframes tp-float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-12px) } }
        @keyframes tp-spin { to { transform: rotate(360deg) } }
        @keyframes tp-spin-rev { to { transform: rotate(-360deg) } }
        @keyframes tp-aurora {
          0%   { transform: translate3d(-6%, -4%, 0) scale(1) }
          50%  { transform: translate3d(6%, 5%, 0) scale(1.18) }
          100% { transform: translate3d(-6%, -4%, 0) scale(1) }
        }
        .marquee { animation: tp-marquee 30s linear infinite }

        /* ── Cosmos ── */
        .cosmos { position: absolute; inset: 0; width: 100%; height: 100%; display: block; z-index: 0; }
        .aurora { position: absolute; border-radius: 50%; filter: blur(70px); pointer-events: none; will-change: transform; }
        .aurora.a1 { animation: tp-aurora 26s ease-in-out infinite }
        .aurora.a2 { animation: tp-aurora 34s ease-in-out infinite reverse }
        .orbits { position: absolute; top: 50%; left: 50%; width: min(112vh, 1040px); height: min(112vh, 1040px);
                  transform: translate(-50%, -50%); pointer-events: none; z-index: 1; }
        .orbit-spin { animation: tp-spin 70s linear infinite }
        .orbit-spin-rev { animation: tp-spin-rev 46s linear infinite }

        /* ── Tarjetas 3D ── */
        section[id], header[id] { scroll-margin-top: 88px }
        .tilt { position: relative; transform-style: preserve-3d; display: flex;
                transition: transform .5s cubic-bezier(.22,1,.36,1), box-shadow .4s ease; }
        .tilt .tilt-inner { position: relative; width: 100%; flex: 1; display: flex; flex-direction: column;
                background: ${C.cream}; border: 1px solid ${C.sand}; border-radius: 26px; padding: 26px 24px;
                box-shadow: 0 14px 40px rgba(25,29,21,.07); overflow: hidden; }
        .tilt .tilt-inner::after { content: ""; position: absolute; inset: 0; pointer-events: none;
                background: radial-gradient(340px circle at var(--gx,50%) var(--gy,50%), rgba(255,255,255,.5), transparent 62%);
                opacity: calc(var(--glare, 0) * .85); transition: opacity .4s ease; }
        .reto-card .tilt-inner { background: linear-gradient(150deg, ${C.inkSoft}, ${C.ink} 62%, #2C3124);
                border-color: rgba(241,235,221,.16); border-radius: 34px; padding: 0;
                box-shadow: 0 30px 70px rgba(0,0,0,.4); }
        .reto-card .tilt-inner::after { background: radial-gradient(420px circle at var(--gx,50%) var(--gy,50%), rgba(170,180,136,.2), transparent 60%); }

        /* ── Rejillas ── */
        .prod-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px; max-width: 1180px; margin: 0 auto; align-items: stretch; }
        .reto-grid { display: grid; grid-template-columns: 1.15fr 1fr; gap: 40px; padding: 46px 44px; align-items: center; }
        .reto-wrap { max-width: 1080px; margin: 0 auto; }
        .app-grid { display: grid; grid-template-columns: 1.1fr 1fr; gap: 46px; align-items: center; max-width: 1080px; margin: 0 auto; }
        .testi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; max-width: 1080px; margin: 0 auto; align-items: stretch; }
        .fer-grid { display: flex; gap: 56px; align-items: center; max-width: 1080px; margin: 0 auto; }
        .fer-media { flex: 0 0 42%; }
        .fer-media img { width: 100%; height: auto; aspect-ratio: 4 / 5; object-fit: cover; border-radius: 28px; display: block; box-shadow: 0 24px 60px rgba(25,29,21,.2); }
        .fer-body { flex: 1 1 0; min-width: 0; }
        .hero-chips { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; margin-top: 32px; }

        @media (max-width: 980px) {
          .prod-grid, .testi-grid { grid-template-columns: 1fr; }
          .reto-grid, .app-grid { grid-template-columns: 1fr; gap: 28px; }
          .reto-grid { padding: 34px 26px; }
          .fer-grid { flex-direction: column; gap: 34px; }
          .fer-media { flex: none; width: 100%; max-width: 360px; }
          .fer-body { text-align: center; }
        }
        @media (max-width: 860px) {
          .nav-links { display: none !important; }
          .nav-burger { display: block !important; }
        }
        @media (max-width: 560px) {
          .nav-cta { display: none !important; }
        }

        @media (prefers-reduced-motion: reduce) {
          html { scroll-behavior: auto; }
          *, *::before, *::after { animation: none !important; transition: none !important; }
          .tilt { transform: none !important; }
        }
      `}</style>

      <Nav />

      {/* ── HERO CÓSMICO ── */}
      <header
        style={{
          position: "relative",
          minHeight: "100svh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "150px 24px 90px",
          background: `radial-gradient(120% 90% at 50% 8%, #2C3124 0%, ${C.void} 62%)`,
          overflow: "hidden",
          isolation: "isolate",
        }}
      >
        <div className="aurora a1" style={{ width: 620, height: 620, top: "-14%", left: "-10%", background: `radial-gradient(circle, ${C.olive}66, transparent 68%)` }} aria-hidden="true" />
        <div className="aurora a2" style={{ width: 520, height: 520, bottom: "-16%", right: "-8%", background: `radial-gradient(circle, ${C.soft}3D, transparent 70%)` }} aria-hidden="true" />
        <Orbits />
        <CosmicField />

        <div style={{ position: "relative", zIndex: 3, maxWidth: 920, animation: "tp-fade-up 1s ease both" }}>
          <div style={{ ...eyebrowLight, marginBottom: 24 }}>The Project by Fer · Find ✦ Elevate ✦ Rise</div>
          <h1
            style={{
              fontFamily: DISPLAY,
              fontWeight: 400,
              fontSize: "clamp(44px, 7.4vw, 88px)",
              lineHeight: 1.05,
              color: C.ivory,
              margin: "0 0 24px",
              letterSpacing: -0.5,
            }}
          >
            Te va bien.
            <RotatingLine />
          </h1>
          <p style={{ fontFamily: BODY, fontSize: "clamp(16px, 1.9vw, 19px)", lineHeight: 1.7, color: C.ivory, opacity: 0.76, maxWidth: 620, margin: "0 auto 36px" }}>
            Un espacio para mujeres que lo dan todo. Tres formas de entrar: sesiones 1:1 conmigo,
            foros en vivo con expertos y encuentros de networking consciente. Eliges lo que necesitas hoy.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Cta href="#espacios" variant="glow">Ver los 3 espacios ↓</Cta>
            <Cta href={APP_URL} variant="ghostLight">Empezar gratis con la app</Cta>
          </div>
          <div className="hero-chips">
            {PRODUCTS.map((p) => (
              <a
                key={p.id}
                href={`#${p.id}`}
                style={{
                  fontFamily: BODY,
                  fontSize: 12.5,
                  color: C.ivory,
                  textDecoration: "none",
                  padding: "9px 16px",
                  borderRadius: 999,
                  border: "1px solid rgba(241,235,221,.26)",
                  background: "rgba(241,235,221,.05)",
                  backdropFilter: "blur(6px)",
                  opacity: 0.9,
                }}
              >
                {p.n} · {p.title}
              </a>
            ))}
          </div>
        </div>
        <div style={{ position: "absolute", bottom: 26, left: "50%", marginLeft: -8, fontSize: 20, color: C.greige, opacity: 0.7, animation: "tp-float 2.8s ease-in-out infinite", zIndex: 3 }} aria-hidden="true">
          ↓
        </div>
      </header>

      <Ribbon items={["Find", "Elevate", "Rise", "Pensar distinto", "Claridad", "Comunidad"]} />

      {/* ── LOS 3 ESPACIOS ── */}
      <section id="espacios" style={{ padding: "108px 24px 96px", position: "relative", overflow: "hidden" }}>
        <div className="aurora a1" style={{ width: 560, height: 560, top: "6%", right: "-16%", background: `radial-gradient(circle, ${C.soft}33, transparent 70%)`, zIndex: 0 }} aria-hidden="true" />
        <Reveal style={{ position: "relative", zIndex: 1 }}>
          <div style={{ textAlign: "center", marginBottom: 54, maxWidth: 720, marginLeft: "auto", marginRight: "auto" }}>
            <div style={eyebrow}>Los 3 espacios</div>
            <h2 style={h2}>Elige por dónde entrar.</h2>
            <p style={{ fontFamily: BODY, fontSize: 16, lineHeight: 1.7, color: C.ink, opacity: 0.72, marginTop: 16 }}>
              No hay que comprar todo ni comprometerse con nada largo. Cada espacio funciona solo —
              y juntos, se vuelven tu forma de crecer acompañada.
            </p>
          </div>
        </Reveal>
        <div style={{ position: "relative", zIndex: 1 }}>
          <Products onPick={pick} />
        </div>

        <Reveal delay={140}>
          <div
            style={{
              maxWidth: 1180,
              margin: "24px auto 0",
              background: C.nude,
              border: `1px solid ${C.sand}`,
              borderRadius: 26,
              padding: "26px 30px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 20,
              flexWrap: "wrap",
              position: "relative",
              zIndex: 1,
            }}
          >
            <div>
              <div style={{ fontFamily: BODY, fontSize: 11, fontWeight: 600, letterSpacing: 1.8, textTransform: "uppercase", color: C.olive, marginBottom: 6 }}>
                Cupo fundadoras
              </div>
              <div style={{ fontFamily: DISPLAY, fontSize: 23, color: C.ink }}>¿Quieres estar en todo? Membresía The Project</div>
              <div style={{ fontFamily: BODY, fontSize: 14, color: C.taupe, marginTop: 6 }}>
                El mes completo — asesoría, foros, networking y la app — a precio de fundadora.
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: DISPLAY, fontSize: 30, color: C.ink }}>$349</div>
                <div style={{ fontFamily: BODY, fontSize: 11.5, color: C.taupe }}>MXN / mes</div>
              </div>
              <Cta small onClick={() => pick("Membresía fundadoras")}>Quiero ser fundadora</Cta>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── RETO DEL MES (banda cósmica) ── */}
      <section
        id="reto"
        style={{
          padding: "104px 24px",
          position: "relative",
          background: `radial-gradient(110% 80% at 50% 0%, #2C3124 0%, ${C.void} 70%)`,
          overflow: "hidden",
        }}
      >
        <CosmicField density={0.6} />
        <div className="aurora a2" style={{ width: 520, height: 520, bottom: "-20%", left: "-10%", background: `radial-gradient(circle, ${C.olive}55, transparent 70%)` }} aria-hidden="true" />
        <Reveal style={{ position: "relative", zIndex: 2 }}>
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <div style={eyebrowLight}>Cada mes, un reto nuevo</div>
            <h2 style={h2Light}>El reto del mes.</h2>
            <p style={{ fontFamily: ACCENT, fontStyle: "italic", fontSize: 18, color: C.greige, marginTop: 12 }}>
              gratis, dentro de la app — para todas
            </p>
          </div>
        </Reveal>
        <div style={{ position: "relative", zIndex: 2 }}>
          <RetoDelMes />
        </div>
      </section>

      {/* ── LA APP ── */}
      <section id="la-app" style={{ padding: "96px 24px", background: C.nude, borderTop: `1px solid ${C.sand}`, borderBottom: `1px solid ${C.sand}` }}>
        <div className="app-grid">
          <Reveal>
            <div>
              <div style={eyebrow}>Tu espacio diario · gratis</div>
              <h2 style={h2}>La app que sostiene el resto.</h2>
              <p style={{ fontFamily: BODY, fontSize: 16, lineHeight: 1.75, color: C.ink, opacity: 0.76, margin: "16px 0 26px", maxWidth: 480 }}>
                Dos minutos en la mañana, dos en la noche. Tu mente en orden, tus pendientes en su lugar,
                el reto del mes a la mano — y tu progreso creciendo sin que lo persigas.
              </p>
              <Cta href={APP_URL}>Crear mi espacio gratis →</Cta>
            </div>
          </Reveal>
          <Reveal delay={140}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {APP_CHIPS.map((chip, i) => (
                <div
                  key={chip}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    background: C.cream,
                    border: `1px solid ${C.sand}`,
                    borderRadius: 16,
                    padding: "15px 18px",
                    fontFamily: BODY,
                    fontSize: 14.5,
                    color: C.ink,
                  }}
                >
                  <span style={{ fontFamily: DISPLAY, fontSize: 15, color: C.soft, width: 22, flexShrink: 0 }}>{`0${i + 1}`}</span>
                  {chip}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── CONOCE A FER ── */}
      <section id="conoce-a-fer" style={{ padding: "106px 24px", position: "relative", overflow: "hidden" }}>
        <div className="aurora a1" style={{ width: 500, height: 500, top: "10%", left: "-14%", background: `radial-gradient(circle, ${C.greige}55, transparent 70%)`, zIndex: 0 }} aria-hidden="true" />
        <Reveal style={{ position: "relative", zIndex: 1 }}>
          <div className="fer-grid">
            <div className="fer-media">
              <img src="/fer.jpg" alt="Fer, fundadora de The Project" loading="lazy" decoding="async" />
            </div>
            <div className="fer-body">
              <div style={eyebrow}>Fundadora · The Project</div>
              <h2 style={{ ...h2, marginBottom: 18 }}>Conoce a Fer</h2>
              <p style={{ fontFamily: ACCENT, fontStyle: "italic", fontSize: 21, color: C.olive, margin: "0 0 18px" }}>Hola, soy Fer 👋</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 15, maxWidth: 560 }}>
                {[
                  "Durante más de 10 años he construido mi carrera en marketing y alianzas para empresas de tecnología en toda Latinoamérica — hoy lidero marketing y partnerships para LATAM en una empresa global de tecnología y real estate, y en el camino me formé en storytelling y liderazgo en lugares como Northwestern University y el Tec de Monterrey.",
                  "Y aun así, con todo “funcionando bien”, un día me hice la pregunta que quizás tú también te has hecho: ¿es esta la vida que yo quiero?",
                  "The Project nació justo de ahí. De entender que valemos mucho más que nuestra lista de pendientes, y que crecer no tiene por qué sentirse en soledad. Quise crear el espacio que a mí me hubiera encantado tener: uno donde puedas pensar distinto, rodearte de otras mujeres que también lo dan todo, y construir la vida que de verdad quieres — a tu manera.",
                  "Fuera de aquí me vas a encontrar entrenando (todavía no me creo que corrí un medio maratón 🏃‍♀️), con mi familia, mis amigas y mi novio, o disfrutando una copa de vino blanco mientras planeo el siguiente reto. Porque para mí esto no es solo trabajo: es la forma en la que quiero vivir, y ahora quiero compartirla contigo.",
                ].map((t, i) => (
                  <p key={i} style={{ fontFamily: BODY, fontSize: 15.5, lineHeight: 1.75, color: C.ink, opacity: 0.82, margin: 0 }}>
                    {t}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── TESTIMONIOS ── */}
      <section style={{ padding: "92px 24px", background: C.nude, borderTop: `1px solid ${C.sand}` }}>
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: 42 }}>
            <div style={eyebrow}>Ellas ya empezaron</div>
            <h2 style={h2}>No estás sola en esto.</h2>
          </div>
        </Reveal>
        <div className="testi-grid">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.n} delay={i * 110} style={{ display: "flex" }}>
              <Tilt max={5} style={{ width: "100%" }}>
                <div className="tilt-inner" style={{ padding: "28px 26px" }}>
                  <div style={{ fontFamily: DISPLAY, fontSize: 30, color: C.soft, lineHeight: 1 }}>“</div>
                  <p style={{ fontFamily: ACCENT, fontStyle: "italic", fontSize: 18.5, lineHeight: 1.6, color: C.olive, margin: "8px 0 20px", flex: 1 }}>{t.q}</p>
                  <div style={{ fontFamily: BODY, fontSize: 12.5, fontWeight: 600, letterSpacing: 1.4, textTransform: "uppercase", color: C.ink }}>{t.n}</div>
                  <div style={{ fontFamily: BODY, fontSize: 12.5, color: C.taupe, marginTop: 4 }}>{t.r}</div>
                </div>
              </Tilt>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── INSCRIPCIÓN ── */}
      <section id="inscribirme" style={{ padding: "100px 24px", position: "relative", overflow: "hidden" }}>
        <div className="aurora a2" style={{ width: 560, height: 560, bottom: "-18%", right: "-14%", background: `radial-gradient(circle, ${C.soft}3D, transparent 70%)`, zIndex: 0 }} aria-hidden="true" />
        <div style={{ maxWidth: 640, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <div style={eyebrow}>Aparta tu lugar</div>
              <h2 style={h2}>Empecemos.</h2>
              <p style={{ fontFamily: BODY, fontSize: 15.5, lineHeight: 1.7, color: C.ink, opacity: 0.74, maxWidth: 470, margin: "16px auto 0" }}>
                Dime qué te late y te escribo con fechas, detalles y cómo reservar.
                O entra hoy mismo a la app — es gratis y toma dos minutos.
              </p>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <LeadForm interest={interest} setInterest={setInterest} />
          </Reveal>
          <Reveal delay={180}>
            <div style={{ textAlign: "center", marginTop: 28 }}>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 9,
                  fontFamily: BODY,
                  fontSize: 14,
                  fontWeight: 600,
                  color: C.ink,
                  textDecoration: "none",
                  padding: "12px 22px",
                  borderRadius: 999,
                  border: `1.5px solid ${C.sand}`,
                  background: C.cream,
                }}
              >
                <IconInstagram /> O mándanos DM · {INSTAGRAM_HANDLE}
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" style={{ padding: "0 24px 100px" }}>
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: 34 }}>
            <div style={eyebrow}>Preguntas</div>
            <h2 style={{ ...h2, fontSize: "clamp(26px, 3.4vw, 36px)" }}>Lo que suelen preguntarme.</h2>
          </div>
        </Reveal>
        <Reveal delay={100}>
          <Faq />
        </Reveal>
      </section>

      <Ribbon items={["Tu momento es ahora", "Find", "Elevate", "Rise", RETO.hashtag]} />

      {/* ── FOOTER ── */}
      <footer style={{ background: C.void, color: C.ivory, padding: "60px 24px 44px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <CosmicField density={0.45} />
        <div style={{ position: "relative", zIndex: 2 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
            <TpMark size={46} color={C.ivory} />
          </div>
          <div style={{ fontFamily: DISPLAY, fontSize: 21, letterSpacing: 3, marginBottom: 8 }}>THE PROJECT</div>
          <div style={{ fontFamily: ACCENT, fontStyle: "italic", fontSize: 15, opacity: 0.72, marginBottom: 26 }}>Find · Elevate · Rise</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 22, flexWrap: "wrap", marginBottom: 26 }}>
            {[["Los 3 espacios", "#espacios"], ["Reto del mes", "#reto"], ["Conoce a Fer", "#conoce-a-fer"], ["Preguntas", "#faq"]].map(([l, h]) => (
              <a key={h} href={h} style={{ color: C.ivory, fontFamily: BODY, fontSize: 13, opacity: 0.78, textDecoration: "none" }}>{l}</a>
            ))}
            <Link href={APP_URL} style={{ color: C.ivory, fontFamily: BODY, fontSize: 13, opacity: 0.78, textDecoration: "none" }}>Abrir mi espacio</Link>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noreferrer"
              style={{ color: C.ivory, fontFamily: BODY, fontSize: 13, opacity: 0.78, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <IconInstagram size={15} color={C.ivory} /> {INSTAGRAM_HANDLE}
            </a>
          </div>
          <div style={{ fontFamily: BODY, fontSize: 11.5, opacity: 0.45 }}>
            © {new Date().getFullYear()} The Project by Fer · Hecha con 🤍 para mujeres que van por más
          </div>
        </div>
      </footer>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/store";

// ═══════════════════════════════════════════════════════════
//  THE PROJECT · Landing
//  Estética editorial (crema + oliva + dorado, serif Fraunces)
//  con carruseles, tabs y transiciones al hacer scroll.
// ═══════════════════════════════════════════════════════════

const C = {
  bg: "#F1EBDD",
  card: "#F9F5EC",
  ink: "#33372C",
  accent: "#6E7444",
  gold: "#B08A5A",
  soft: "#AAB488",
  muted: "#9A8F82",
  line: "#DDD4C4",
  dark: "#33372C",
};

const SERIF = "'Fraunces', Georgia, serif";
const BODY = "'Work Sans', -apple-system, system-ui, sans-serif";

const INSTAGRAM_URL = "https://instagram.com/theprojectbyfer";
const INSTAGRAM_HANDLE = "@theprojectbyfer";

// ── Textura de grano (misma que la app) ─────────────────────
function Grain({ opacity = 0.05 }) {
  const svg = encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>`,
  );
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 1,
        opacity,
        mixBlendMode: "multiply",
        backgroundImage: `url("data:image/svg+xml,${svg}")`,
      }}
    />
  );
}

// ── Rama de hojas doradas (decoración estilo Pinterest) ─────
function GoldBranch({ style, flip = false, size = 220 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      style={{
        position: "absolute",
        pointerEvents: "none",
        opacity: 0.5,
        transform: flip ? "scaleX(-1)" : "none",
        ...style,
      }}
    >
      <path d="M20 190 C 60 130, 90 90, 170 20" stroke={C.gold} strokeWidth="1.6" />
      {[
        [58, 132, -40],
        [78, 108, -30],
        [100, 84, -25],
        [124, 60, -18],
        [146, 40, -10],
      ].map(([x, y, r], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${r})`}>
          <path
            d="M0 0 C 12 -14, 30 -14, 40 0 C 30 14, 12 14, 0 0 Z"
            fill="none"
            stroke={C.gold}
            strokeWidth="1.4"
          />
          <path d="M2 0 L 38 0" stroke={C.gold} strokeWidth="0.8" opacity="0.7" />
        </g>
      ))}
    </svg>
  );
}

// ── Reveal on scroll ────────────────────────────────────────
function Reveal({ children, delay = 0, style }) {
  const ref = useRef(null);
  const [on, setOn] = useState(false);
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
      style={{
        opacity: on ? 1 : 0,
        transform: on ? "none" : "translateY(28px)",
        transition: `opacity 0.9s ease ${delay}ms, transform 0.9s cubic-bezier(.22,1,.36,1) ${delay}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ── Botones ─────────────────────────────────────────────────
function CtaButton({ children, href, onClick, ghost = false, small = false }) {
  const base = {
    display: "inline-block",
    fontFamily: BODY,
    fontWeight: 600,
    fontSize: small ? 13 : 15,
    letterSpacing: 0.4,
    padding: small ? "10px 22px" : "16px 36px",
    borderRadius: 999,
    border: `1.5px solid ${ghost ? C.ink : C.accent}`,
    background: ghost ? "transparent" : C.accent,
    color: ghost ? C.ink : "#FDFBF5",
    cursor: "pointer",
    textDecoration: "none",
    transition: "transform .25s ease, box-shadow .25s ease, background .25s ease, color .25s ease",
  };
  const hover = (e, over) => {
    e.currentTarget.style.transform = over ? "translateY(-2px)" : "none";
    e.currentTarget.style.boxShadow = over ? "0 10px 26px rgba(51,55,44,.18)" : "none";
    if (ghost) {
      e.currentTarget.style.background = over ? C.ink : "transparent";
      e.currentTarget.style.color = over ? "#FDFBF5" : C.ink;
    }
  };
  const props = {
    style: base,
    onMouseEnter: (e) => hover(e, true),
    onMouseLeave: (e) => hover(e, false),
  };
  if (href && href.startsWith("/"))
    return (
      <Link href={href} {...props}>
        {children}
      </Link>
    );
  if (href)
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  return (
    <button type="button" onClick={onClick} {...props}>
      {children}
    </button>
  );
}

// ── Nav sticky ──────────────────────────────────────────────
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const link = {
    fontFamily: BODY,
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: 1.6,
    textTransform: "uppercase",
    color: C.ink,
    textDecoration: "none",
    opacity: 0.75,
    transition: "opacity .2s",
  };
  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: scrolled ? "14px 28px" : "22px 28px",
        background: scrolled ? "rgba(249,245,236,.88)" : "transparent",
        backdropFilter: scrolled ? "blur(10px)" : "none",
        borderBottom: scrolled ? `1px solid ${C.line}` : "1px solid transparent",
        transition: "all .35s ease",
      }}
    >
      <a
        href="#top"
        style={{
          fontFamily: SERIF,
          fontSize: 18,
          letterSpacing: 3,
          color: C.ink,
          textDecoration: "none",
          fontWeight: 500,
        }}
      >
        THE PROJECT
      </a>
      <div className="tp-nav-links" style={{ display: "flex", gap: 26, alignItems: "center" }}>
        {[
          ["Qué es", "#que-es"],
          ["Cómo ayuda", "#como-ayuda"],
          ["Testimonios", "#testimonios"],
          ["Planes", "#planes"],
          ["Contacto", "#contacto"],
        ].map(([label, href]) => (
          <a
            key={href}
            href={href}
            style={link}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = 0.75)}
          >
            {label}
          </a>
        ))}
      </div>
      <CtaButton href="/space" small>
        Crear mi espacio
      </CtaButton>
    </nav>
  );
}

// ── Mini-mocks de la app para las tarjetas en arco ──────────
function MockCheckin() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
      <div style={{ fontFamily: SERIF, fontSize: 13, fontStyle: "italic", color: C.ink }}>
        ¿Cómo amaneces hoy?
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        {["😌", "🙂", "😐", "😮‍💨", "🥲"].map((e, i) => (
          <div
            key={i}
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              background: i === 1 ? C.soft : "#fff",
              border: `1px solid ${C.line}`,
              display: "grid",
              placeItems: "center",
              fontSize: 14,
            }}
          >
            {e}
          </div>
        ))}
      </div>
      <div style={{ fontSize: 9, letterSpacing: 1.4, textTransform: "uppercase", color: C.muted }}>
        Check-in diario
      </div>
    </div>
  );
}

function MockTodos() {
  const rows = [
    ["Presentación Q3", true],
    ["1:1 con mi equipo", true],
    ["Yoga 7 pm", false],
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
      {rows.map(([t, done], i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 4,
              border: `1.5px solid ${done ? C.accent : C.line}`,
              background: done ? C.accent : "transparent",
              display: "grid",
              placeItems: "center",
              color: "#fff",
              fontSize: 9,
            }}
          >
            {done ? "✓" : ""}
          </div>
          <div
            style={{
              fontSize: 11.5,
              color: C.ink,
              textDecoration: done ? "line-through" : "none",
              opacity: done ? 0.55 : 1,
            }}
          >
            {t}
          </div>
        </div>
      ))}
      <div style={{ fontSize: 9, letterSpacing: 1.4, textTransform: "uppercase", color: C.muted, marginTop: 4 }}>
        Trabajo + vida, separados
      </div>
    </div>
  );
}

function MockJournal() {
  return (
    <div style={{ width: "100%" }}>
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 12.5, color: C.ink, lineHeight: 1.6 }}>
        “Hoy me di cuenta de que no tengo que poder con todo a la vez…”
      </div>
      <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
        {[90, 75, 60].map((w, i) => (
          <div key={i} style={{ height: 4, width: `${w}%`, borderRadius: 4, background: C.line }} />
        ))}
      </div>
      <div style={{ fontSize: 9, letterSpacing: 1.4, textTransform: "uppercase", color: C.muted, marginTop: 10 }}>
        Journaling guiado
      </div>
    </div>
  );
}

function MockProgress() {
  const bars = [46, 70, 58, 88, 76];
  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 7, height: 64 }}>
        {bars.map((h, i) => (
          <div
            key={i}
            style={{
              width: 13,
              height: `${h}%`,
              borderRadius: 6,
              background: i === 3 ? C.accent : C.soft,
              opacity: i === 3 ? 1 : 0.7,
            }}
          />
        ))}
      </div>
      <div style={{ fontSize: 9, letterSpacing: 1.4, textTransform: "uppercase", color: C.muted }}>
        Mi progreso del mes
      </div>
    </div>
  );
}

function MockAI() {
  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
      <div
        style={{
          alignSelf: "flex-start",
          maxWidth: "92%",
          background: "#fff",
          border: `1px solid ${C.line}`,
          borderRadius: "14px 14px 14px 4px",
          padding: "8px 11px",
          fontSize: 11,
          color: C.ink,
          lineHeight: 1.5,
        }}
      >
        Hoy traes mucha carga. Te propongo elegir solo una prioridad y proteger tu pausa de la tarde. 🤍
      </div>
      <div style={{ fontSize: 9, letterSpacing: 1.4, textTransform: "uppercase", color: C.muted }}>
        IA que te acompaña
      </div>
    </div>
  );
}

function MockPalettes() {
  const dots = ["#A85668", "#6E8266", "#8A5E7E", "#C36F5A", "#A9822F", "#6B5E96"];
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 26px)", gap: 9 }}>
        {dots.map((c, i) => (
          <div
            key={i}
            style={{
              width: 26,
              height: 26,
              borderRadius: "50%",
              background: c,
              border: "2px solid #fff",
              boxShadow: "0 2px 6px rgba(51,55,44,.15)",
            }}
          />
        ))}
      </div>
      <div style={{ fontSize: 9, letterSpacing: 1.4, textTransform: "uppercase", color: C.muted }}>
        Tu espacio, tu paleta
      </div>
    </div>
  );
}

const ARCH_CARDS = [
  { key: "checkin", node: <MockCheckin /> },
  { key: "todos", node: <MockTodos /> },
  { key: "journal", node: <MockJournal /> },
  { key: "progress", node: <MockProgress /> },
  { key: "ai", node: <MockAI /> },
  { key: "palettes", node: <MockPalettes /> },
];

function ArchCard({ children }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        flex: "0 0 auto",
        width: 230,
        height: 310,
        borderRadius: "150px 150px 22px 22px",
        background: `linear-gradient(180deg, ${C.card} 0%, #F3EDDE 100%)`,
        border: `1px solid ${C.line}`,
        boxShadow: hover ? "0 22px 44px rgba(51,55,44,.16)" : "0 10px 26px rgba(51,55,44,.07)",
        transform: hover ? "translateY(-10px)" : "none",
        transition: "transform .4s cubic-bezier(.22,1,.36,1), box-shadow .4s ease",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "56px 26px 30px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 8,
          borderRadius: "144px 144px 16px 16px",
          border: `1px solid ${C.gold}44`,
          pointerEvents: "none",
        }}
      />
      {children}
    </div>
  );
}

// ── Carrusel infinito (marquee) de tarjetas en arco ─────────
function ArchMarquee() {
  const [paused, setPaused] = useState(false);
  const cards = [...ARCH_CARDS, ...ARCH_CARDS];
  return (
    <div
      style={{ overflow: "hidden", padding: "30px 0 40px", position: "relative" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        style={{
          display: "flex",
          gap: 28,
          width: "max-content",
          animation: "tp-marquee 40s linear infinite",
          animationPlayState: paused ? "paused" : "running",
        }}
      >
        {cards.map((c, i) => (
          <ArchCard key={`${c.key}-${i}`}>{c.node}</ArchCard>
        ))}
      </div>
      {/* degradados en los bordes */}
      {["left", "right"].map((side) => (
        <div
          key={side}
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            [side]: 0,
            width: 90,
            background: `linear-gradient(to ${side === "left" ? "right" : "left"}, ${C.bg}, transparent)`,
            pointerEvents: "none",
          }}
        />
      ))}
    </div>
  );
}

// ── Iconos de línea (fila "cómo ayudamos") ──────────────────
function IconDay() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" stroke={C.ink} strokeWidth="1.4">
      <circle cx="22" cy="22" r="8" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
        <line
          key={a}
          x1={22 + 12 * Math.cos((a * Math.PI) / 180)}
          y1={22 + 12 * Math.sin((a * Math.PI) / 180)}
          x2={22 + 16 * Math.cos((a * Math.PI) / 180)}
          y2={22 + 16 * Math.sin((a * Math.PI) / 180)}
        />
      ))}
    </svg>
  );
}
function IconSpace() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" stroke={C.ink} strokeWidth="1.4">
      <rect x="7" y="7" width="13" height="18" rx="3" />
      <rect x="24" y="7" width="13" height="10" rx="3" />
      <rect x="24" y="21" width="13" height="16" rx="3" />
      <rect x="7" y="29" width="13" height="8" rx="3" />
    </svg>
  );
}
function IconHeartHand() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" stroke={C.ink} strokeWidth="1.4">
      <path d="M22 30 C 22 30, 12 23.5, 12 17.5 C 12 14.4, 14.4 12.5, 16.9 12.5 C 18.8 12.5, 20.9 13.6, 22 15.3 C 23.1 13.6, 25.2 12.5, 27.1 12.5 C 29.6 12.5, 32 14.4, 32 17.5 C 32 23.5, 22 30, 22 30 Z" />
      <path d="M10 36 C 16 40, 28 40, 34 36" strokeLinecap="round" />
    </svg>
  );
}

// ── Tabs interactivos: un día con The Project ───────────────
const DAY_TABS = [
  {
    key: "Mañana",
    emoji: "☀️",
    title: "Empiezas con intención",
    text: "Un check-in de dos minutos: cómo amaneces, qué es lo más importante hoy y qué necesitas para ti. Tu espacio se acomoda alrededor de eso — no al revés.",
    grad: "linear-gradient(135deg, #F6EED9, #F1E4C8)",
  },
  {
    key: "Tarde",
    emoji: "🌤",
    title: "Todo en su lugar",
    text: "Pendientes de trabajo y de vida en columnas separadas, tu journal a un clic y tips que responden a cómo te sientes. Nada de saltar entre cinco apps.",
    grad: "linear-gradient(135deg, #F3EBDA, #E8E9DA)",
  },
  {
    key: "Noche",
    emoji: "🌙",
    title: "Cierras y sueltas",
    text: "El check-in nocturno te ayuda a soltar el día: qué lograste, qué dejas para mañana y cómo te vas a dormir. Tu mente descansa cuando sabe que nada se olvida.",
    grad: "linear-gradient(135deg, #EAE6DC, #E0DCD4)",
  },
];

function DayTabs() {
  const [active, setActive] = useState(0);
  const tab = DAY_TABS[active];
  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 34, flexWrap: "wrap" }}>
        {DAY_TABS.map((t, i) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActive(i)}
            style={{
              fontFamily: BODY,
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: 1,
              textTransform: "uppercase",
              padding: "11px 26px",
              borderRadius: 999,
              cursor: "pointer",
              border: `1.5px solid ${i === active ? C.accent : C.line}`,
              background: i === active ? C.accent : "transparent",
              color: i === active ? "#FDFBF5" : C.ink,
              transition: "all .3s ease",
            }}
          >
            {t.emoji} {t.key}
          </button>
        ))}
      </div>
      <div
        key={tab.key}
        style={{
          background: tab.grad,
          border: `1px solid ${C.line}`,
          borderRadius: 28,
          padding: "48px 40px",
          textAlign: "center",
          animation: "tp-fade-up .5s ease both",
        }}
      >
        <div style={{ fontFamily: SERIF, fontSize: 28, color: C.ink, marginBottom: 14 }}>{tab.title}</div>
        <p style={{ fontFamily: BODY, fontSize: 16, lineHeight: 1.75, color: C.ink, opacity: 0.8, maxWidth: 560, margin: "0 auto" }}>
          {tab.text}
        </p>
      </div>
    </div>
  );
}

// ── Testimonios (carrusel con flechas + dots + autoplay) ────
const TESTIMONIALS = [
  {
    quote:
      "Antes terminaba el día con la cabeza llena y la agenda vacía. Ahora cierro mi laptop, hago mi check-in de noche y de verdad desconecto.",
    name: "Mariana G.",
    role: "Gerente de marketing · CDMX",
  },
  {
    quote:
      "Lo que más me gusta es que no es otra app de productividad. Me pregunta cómo estoy antes de preguntarme qué voy a hacer.",
    name: "Caro V.",
    role: "Consultora · Bogotá",
  },
  {
    quote:
      "El journaling guiado me salvó en un trimestre horrible. Diez minutos al día y siento que vuelvo a tener claridad.",
    name: "Fernanda R.",
    role: "Product manager · Monterrey",
  },
  {
    quote:
      "Es el único espacio donde mi trabajo y mi vida no compiten. Y la estética… me dan ganas de abrirlo todos los días.",
    name: "Lucía P.",
    role: "Finanzas · Santiago",
  },
];

function Testimonials() {
  const [index, setIndex] = useState(0);
  const timer = useRef(null);
  const go = useCallback((dir) => {
    setIndex((i) => (i + dir + TESTIMONIALS.length) % TESTIMONIALS.length);
  }, []);
  useEffect(() => {
    timer.current = setInterval(() => go(1), 6000);
    return () => clearInterval(timer.current);
  }, [go]);
  const manual = (fn) => {
    clearInterval(timer.current);
    fn();
    timer.current = setInterval(() => go(1), 6000);
  };
  const t = TESTIMONIALS[index];
  const arrow = {
    width: 44,
    height: 44,
    borderRadius: "50%",
    border: `1.5px solid ${C.line}`,
    background: C.card,
    color: C.ink,
    fontSize: 18,
    cursor: "pointer",
    display: "grid",
    placeItems: "center",
    transition: "all .25s ease",
    flexShrink: 0,
  };
  return (
    <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", alignItems: "center", gap: 22 }}>
      <button
        type="button"
        aria-label="Anterior"
        style={arrow}
        onClick={() => manual(() => go(-1))}
        onMouseEnter={(e) => (e.currentTarget.style.background = C.ink) && (e.currentTarget.style.color = "#fff")}
        onMouseLeave={(e) => (e.currentTarget.style.background = C.card) && (e.currentTarget.style.color = C.ink)}
      >
        ←
      </button>
      <div style={{ flex: 1, textAlign: "center", minHeight: 220 }}>
        <div key={index} style={{ animation: "tp-fade-up .55s ease both" }}>
          <div style={{ fontSize: 30, color: C.gold, fontFamily: SERIF, lineHeight: 1 }}>“</div>
          <p
            style={{
              fontFamily: SERIF,
              fontStyle: "italic",
              fontSize: 21,
              lineHeight: 1.65,
              color: C.accent,
              margin: "6px 0 22px",
            }}
          >
            {t.quote}
          </p>
          <div style={{ fontFamily: BODY, fontSize: 13, fontWeight: 600, letterSpacing: 1.6, textTransform: "uppercase", color: C.ink }}>
            — {t.name}
          </div>
          <div style={{ fontFamily: BODY, fontSize: 12.5, color: C.muted, marginTop: 5 }}>{t.role}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 26 }}>
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Testimonio ${i + 1}`}
              onClick={() => manual(() => setIndex(i))}
              style={{
                width: i === index ? 22 : 7,
                height: 7,
                borderRadius: 99,
                border: "none",
                background: i === index ? C.accent : C.line,
                cursor: "pointer",
                transition: "all .35s ease",
                padding: 0,
              }}
            />
          ))}
        </div>
      </div>
      <button
        type="button"
        aria-label="Siguiente"
        style={arrow}
        onClick={() => manual(() => go(1))}
        onMouseEnter={(e) => (e.currentTarget.style.background = C.ink) && (e.currentTarget.style.color = "#fff")}
        onMouseLeave={(e) => (e.currentTarget.style.background = C.card) && (e.currentTarget.style.color = C.ink)}
      >
        →
      </button>
    </div>
  );
}

// ── Planes ──────────────────────────────────────────────────
function Plans() {
  const plans = [
    {
      name: "Gratis",
      price: "$0",
      period: "para siempre",
      featured: false,
      items: [
        "Check-in diario (mañana / tarde / noche)",
        "Pendientes: trabajo y vida, separados",
        "Journaling guiado",
        "Mi progreso: métricas del mes",
        "Tips según tu reto del momento",
        "10 paletas para hacer tuyo el espacio",
      ],
      cta: "Crear mi espacio gratis",
    },
    {
      name: "Premium",
      price: "$10",
      period: "USD / mes",
      featured: true,
      items: [
        "Todo lo del plan gratis",
        "Guía diaria personalizada con IA",
        "Análisis de tu journaling",
        "Recomendaciones según tu energía",
        "Acompañamiento que aprende de ti",
      ],
      cta: "Probar Premium",
    },
  ];
  return (
    <div style={{ display: "flex", gap: 26, justifyContent: "center", flexWrap: "wrap" }}>
      {plans.map((p, idx) => (
        <Reveal key={p.name} delay={idx * 130} style={{ flex: "1 1 300px", maxWidth: 400 }}>
          <div
            style={{
              background: p.featured ? C.dark : C.card,
              color: p.featured ? "#F4EFE2" : C.ink,
              border: `1px solid ${p.featured ? C.dark : C.line}`,
              borderRadius: 26,
              padding: "40px 34px",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              boxShadow: p.featured ? "0 24px 50px rgba(51,55,44,.25)" : "0 12px 30px rgba(51,55,44,.06)",
              position: "relative",
              transition: "transform .35s cubic-bezier(.22,1,.36,1)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-8px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
          >
            {p.featured && (
              <div
                style={{
                  position: "absolute",
                  top: -13,
                  right: 28,
                  background: C.gold,
                  color: "#FFF9EE",
                  fontFamily: BODY,
                  fontSize: 10.5,
                  fontWeight: 600,
                  letterSpacing: 1.6,
                  textTransform: "uppercase",
                  padding: "6px 14px",
                  borderRadius: 99,
                }}
              >
                Con IA
              </div>
            )}
            <div style={{ fontFamily: BODY, fontSize: 12, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", opacity: 0.7 }}>
              {p.name}
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, margin: "12px 0 24px" }}>
              <span style={{ fontFamily: SERIF, fontSize: 46 }}>{p.price}</span>
              <span style={{ fontFamily: BODY, fontSize: 13, opacity: 0.65 }}>{p.period}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32, flex: 1 }}>
              {p.items.map((it) => (
                <div key={it} style={{ display: "flex", gap: 10, fontFamily: BODY, fontSize: 14, lineHeight: 1.5 }}>
                  <span style={{ color: p.featured ? C.gold : C.accent }}>✦</span>
                  <span style={{ opacity: 0.88 }}>{it}</span>
                </div>
              ))}
            </div>
            <Link
              href="/space"
              style={{
                fontFamily: BODY,
                fontWeight: 600,
                fontSize: 14,
                textAlign: "center",
                padding: "14px 20px",
                borderRadius: 999,
                textDecoration: "none",
                background: p.featured ? C.gold : C.accent,
                color: "#FFF9EE",
                transition: "opacity .2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = 0.88)}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = 1)}
            >
              {p.cta}
            </Link>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

// ── Formulario: pedir info / registrarse ────────────────────
function LeadForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("idle"); // idle | sending | done | error
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    setStatus("sending");
    try {
      if (supabase) {
        const { error } = await supabase.from("leads").insert({
          name: form.name.trim(),
          email: form.email.trim(),
          message: form.message.trim() || null,
        });
        if (error) throw error;
      } else if (typeof window !== "undefined") {
        // Sin Supabase configurado: guarda localmente para no perder el dato.
        const prev = JSON.parse(window.localStorage.getItem("tp:leads") || "[]");
        prev.push({ ...form, at: new Date().toISOString() });
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
    border: `1.5px solid ${C.line}`,
    background: "#FDFBF5",
    color: C.ink,
    outline: "none",
    width: "100%",
    transition: "border-color .25s ease",
  };
  const focus = (e) => (e.target.style.borderColor = C.accent);
  const blur = (e) => (e.target.style.borderColor = C.line);

  if (status === "done") {
    return (
      <div
        style={{
          background: C.card,
          border: `1px solid ${C.line}`,
          borderRadius: 26,
          padding: "56px 40px",
          textAlign: "center",
          animation: "tp-fade-up .5s ease both",
        }}
      >
        <div style={{ fontSize: 36 }}>🤍</div>
        <div style={{ fontFamily: SERIF, fontSize: 26, color: C.ink, margin: "14px 0 10px" }}>
          ¡Gracias, {form.name.split(" ")[0]}!
        </div>
        <p style={{ fontFamily: BODY, fontSize: 15, color: C.muted, lineHeight: 1.7, maxWidth: 420, margin: "0 auto 26px" }}>
          Recibimos tu mensaje. Muy pronto te escribimos con toda la info. Mientras tanto, tu espacio ya te está esperando.
        </p>
        <CtaButton href="/space">Crear mi espacio ahora</CtaButton>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      style={{
        background: C.card,
        border: `1px solid ${C.line}`,
        borderRadius: 26,
        padding: "40px 36px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        boxShadow: "0 16px 40px rgba(51,55,44,.07)",
      }}
    >
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <input
          style={{ ...field, flex: "1 1 200px" }}
          placeholder="Tu nombre"
          value={form.name}
          onChange={set("name")}
          onFocus={focus}
          onBlur={blur}
          required
        />
        <input
          style={{ ...field, flex: "1 1 200px" }}
          type="email"
          placeholder="Tu correo"
          value={form.email}
          onChange={set("email")}
          onFocus={focus}
          onBlur={blur}
          required
        />
      </div>
      <textarea
        style={{ ...field, resize: "vertical", minHeight: 110 }}
        placeholder="Cuéntanos: ¿qué te gustaría saber de The Project?"
        value={form.message}
        onChange={set("message")}
        onFocus={focus}
        onBlur={blur}
      />
      {status === "error" && (
        <div style={{ fontFamily: BODY, fontSize: 13.5, color: "#A85668" }}>
          Algo falló al enviar. Intenta de nuevo, o escríbenos por Instagram:{" "}
          <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" style={{ color: C.accent, fontWeight: 600 }}>
            {INSTAGRAM_HANDLE}
          </a>
        </div>
      )}
      <button
        type="submit"
        disabled={status === "sending"}
        style={{
          fontFamily: BODY,
          fontWeight: 600,
          fontSize: 15,
          letterSpacing: 0.4,
          padding: "16px 36px",
          borderRadius: 999,
          border: "none",
          background: C.accent,
          color: "#FDFBF5",
          cursor: status === "sending" ? "wait" : "pointer",
          opacity: status === "sending" ? 0.7 : 1,
          transition: "opacity .25s ease, transform .25s ease",
        }}
      >
        {status === "sending" ? "Enviando…" : "Quiero más info ✦"}
      </button>
      <div style={{ fontFamily: BODY, fontSize: 12.5, color: C.muted, textAlign: "center" }}>
        Solo usamos tu correo para responderte. Nada de spam, lo prometemos.
      </div>
    </form>
  );
}

// ── Icono Instagram ─────────────────────────────────────────
function IconInstagram({ size = 18, color = C.ink }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7">
      <rect x="3" y="3" width="18" height="18" rx="5.5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.2" cy="6.8" r="1.1" fill={color} stroke="none" />
    </svg>
  );
}

// ═══ LANDING ═══
export default function Landing() {
  const sectionPad = { padding: "110px 28px" };
  const eyebrow = {
    fontFamily: BODY,
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: 3,
    textTransform: "uppercase",
    color: C.gold,
    marginBottom: 18,
  };
  const h2 = {
    fontFamily: SERIF,
    fontSize: "clamp(30px, 4.5vw, 44px)",
    fontWeight: 500,
    lineHeight: 1.2,
    color: C.ink,
    margin: 0,
  };

  return (
    <div id="top" style={{ background: C.bg, color: C.ink, fontFamily: BODY, overflowX: "hidden" }}>
      <style>{`
        @keyframes tp-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes tp-fade-up { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }
        @keyframes tp-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        html { scroll-behavior: smooth; }
        @media (max-width: 760px) { .tp-nav-links { display: none !important; } }
      `}</style>
      <Grain />
      <Nav />

      {/* ── HERO ── */}
      <header
        style={{
          position: "relative",
          minHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "140px 24px 60px",
          background: `radial-gradient(ellipse 90% 60% at 50% 0%, #F7F1E2 0%, ${C.bg} 70%)`,
          overflow: "hidden",
        }}
      >
        <GoldBranch style={{ top: 70, right: -30 }} />
        <GoldBranch style={{ bottom: -20, left: -40, transform: "rotate(160deg)" }} flip />
        <div style={{ position: "relative", zIndex: 2, maxWidth: 880, animation: "tp-fade-up 1s ease both" }}>
          <div style={{ ...eyebrow, marginBottom: 24 }}>The Project by Fer</div>
          <h1
            style={{
              fontFamily: SERIF,
              fontWeight: 500,
              fontSize: "clamp(40px, 7vw, 76px)",
              lineHeight: 1.12,
              margin: "0 0 26px",
              letterSpacing: -0.5,
            }}
          >
            Tu día, tu mente y tu trabajo —{" "}
            <em style={{ fontStyle: "italic", color: C.accent }}>en un solo lugar.</em>
          </h1>
          <p
            style={{
              fontFamily: BODY,
              fontSize: "clamp(16px, 2vw, 19px)",
              lineHeight: 1.7,
              color: C.ink,
              opacity: 0.75,
              maxWidth: 620,
              margin: "0 auto 40px",
            }}
          >
            El espacio diario contra el burnout, hecho para mujeres que quieren brillar en lo que hacen
            sin quemarse en el intento.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <CtaButton href="/space">Crear mi espacio gratis</CtaButton>
            <CtaButton href="#que-es" ghost>
              Ver cómo funciona
            </CtaButton>
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 26,
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: 22,
            color: C.muted,
            animation: "tp-float 2.6s ease-in-out infinite",
          }}
        >
          ↓
        </div>
      </header>

      {/* ── CARRUSEL DE ARCOS ── */}
      <section style={{ padding: "70px 0 30px" }}>
        <Reveal>
          <div style={{ textAlign: "center", padding: "0 28px" }}>
            <div style={eyebrow}>Un vistazo adentro</div>
            <h2 style={h2}>Todo lo que cargas en la cabeza, por fin en un espacio.</h2>
          </div>
        </Reveal>
        <ArchMarquee />
      </section>

      {/* ── QUÉ ES ── */}
      <section id="que-es" style={{ ...sectionPad, background: C.card, borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}`, position: "relative", overflow: "hidden" }}>
        <GoldBranch style={{ top: -40, right: -60, transform: "rotate(90deg)" }} size={260} />
        <Reveal>
          <div style={{ maxWidth: 780, margin: "0 auto", textAlign: "center" }}>
            <div style={eyebrow}>Qué es The Project</div>
            <p
              style={{
                fontFamily: SERIF,
                fontSize: "clamp(24px, 3.4vw, 34px)",
                lineHeight: 1.5,
                color: C.ink,
                margin: 0,
              }}
            >
              No es otra app de productividad. Es un <em style={{ color: C.accent }}>espacio anti-burnout</em>:
              junta tus pendientes, tu journaling y tu bienestar en un ritual diario que{" "}
              <em style={{ color: C.gold }}>primero te pregunta cómo estás</em> — y después qué vas a hacer.
            </p>
          </div>
        </Reveal>
      </section>

      {/* ── CÓMO AYUDAMOS ── */}
      <section id="como-ayuda" style={sectionPad}>
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: 70 }}>
            <div style={eyebrow}>Cómo te ayudamos</div>
            <h2 style={h2}>Menos caos, más claridad.</h2>
          </div>
        </Reveal>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 40,
            maxWidth: 980,
            margin: "0 auto 90px",
          }}
        >
          {[
            {
              icon: <IconDay />,
              title: "Ritual diario",
              text: "Check-ins de mañana, tarde y noche que se adaptan a tu momento del día. Dos minutos que cambian cómo lo vives.",
            },
            {
              icon: <IconSpace />,
              title: "Todo en un lugar",
              text: "Pendientes de trabajo y de vida separados, journaling guiado y tu progreso del mes — en un dashboard que se siente tuyo.",
            },
            {
              icon: <IconHeartHand />,
              title: "Acompañamiento real",
              text: "Tips según tu reto del momento y, con Premium, una IA que lee tu energía y te guía con recomendaciones personalizadas.",
            },
          ].map((f, i) => (
            <Reveal key={f.title} delay={i * 140}>
              <div style={{ textAlign: "center", padding: "0 10px" }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>{f.icon}</div>
                <div style={{ fontFamily: SERIF, fontSize: 22, marginBottom: 12 }}>{f.title}</div>
                <p style={{ fontFamily: BODY, fontSize: 14.5, lineHeight: 1.75, color: C.ink, opacity: 0.72, margin: 0 }}>
                  {f.text}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal>
          <DayTabs />
        </Reveal>
      </section>

      {/* ── TESTIMONIOS ── */}
      <section
        id="testimonios"
        style={{
          ...sectionPad,
          background: C.card,
          borderTop: `1px solid ${C.line}`,
          borderBottom: `1px solid ${C.line}`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <GoldBranch style={{ bottom: -50, left: -50, transform: "rotate(200deg)" }} size={240} flip />
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={eyebrow}>Testimonios</div>
            <h2 style={h2}>Ellas ya hicieron suyo el espacio.</h2>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <Testimonials />
        </Reveal>
      </section>

      {/* ── PLANES ── */}
      <section id="planes" style={sectionPad}>
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <div style={eyebrow}>Planes</div>
            <h2 style={h2}>Empieza gratis. Crece cuando quieras.</h2>
          </div>
        </Reveal>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <Plans />
        </div>
      </section>

      {/* ── CONTACTO / REGISTRO ── */}
      <section
        id="contacto"
        style={{
          ...sectionPad,
          background: `linear-gradient(180deg, ${C.card} 0%, #EFE7D4 100%)`,
          borderTop: `1px solid ${C.line}`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <GoldBranch style={{ top: 30, right: -40 }} size={200} />
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 44 }}>
              <div style={eyebrow}>Hablemos</div>
              <h2 style={h2}>¿Quieres saber más?</h2>
              <p style={{ fontFamily: BODY, fontSize: 15.5, lineHeight: 1.7, color: C.ink, opacity: 0.72, maxWidth: 480, margin: "18px auto 0" }}>
                Déjanos tus datos y te contamos todo sobre The Project — o crea tu espacio ahora mismo,
                es gratis y toma menos de dos minutos.
              </p>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <LeadForm />
          </Reveal>
          <Reveal delay={200}>
            <div style={{ textAlign: "center", marginTop: 34 }}>
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
                  border: `1.5px solid ${C.line}`,
                  background: "#FDFBF5",
                  transition: "all .25s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = C.gold;
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = C.line;
                  e.currentTarget.style.transform = "none";
                }}
              >
                <IconInstagram /> Síguenos · {INSTAGRAM_HANDLE}
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        style={{
          background: C.dark,
          color: "#EFEAD9",
          padding: "56px 28px 40px",
          textAlign: "center",
        }}
      >
        <div style={{ fontFamily: SERIF, fontSize: 22, letterSpacing: 3, marginBottom: 10 }}>THE PROJECT</div>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, opacity: 0.7, marginBottom: 26 }}>
          Brillar sin quemarte.
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap", marginBottom: 30 }}>
          <Link href="/space" style={{ color: "#EFEAD9", fontFamily: BODY, fontSize: 13, opacity: 0.8, textDecoration: "none" }}>
            Entrar a mi espacio
          </Link>
          <a href="#planes" style={{ color: "#EFEAD9", fontFamily: BODY, fontSize: 13, opacity: 0.8, textDecoration: "none" }}>
            Planes
          </a>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noreferrer"
            style={{
              color: "#EFEAD9",
              fontFamily: BODY,
              fontSize: 13,
              opacity: 0.8,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <IconInstagram size={15} color="#EFEAD9" /> {INSTAGRAM_HANDLE}
          </a>
        </div>
        <div style={{ fontFamily: BODY, fontSize: 11.5, opacity: 0.45 }}>
          © {new Date().getFullYear()} The Project by Fer · Hecho con 🤍 para mujeres en corporativo LATAM
        </div>
      </footer>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/store";

// ═══════════════════════════════════════════════════════════
//  THE PROJECT · Landing del ecosistema
//  Find · Elevate · Rise — app + mentoring + networking
//  consciente + reto AWAKE 21 días + red de mujeres.
//  Paleta y tipografías del brand guideline (Gloock /
//  Crimson Pro / Work Sans · tinta, olivo, marfil).
// ═══════════════════════════════════════════════════════════

const C = {
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

// ── Monograma tp (círculo de contorno fino, nunca relleno) ──
function TpMark({ size = 40, color = C.ink }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <circle cx="24" cy="24" r="22.5" stroke={color} strokeWidth="1.5" />
      <text
        x="24"
        y="30"
        textAnchor="middle"
        style={{ font: `600 17px ${ACCENT}`, fontStyle: "italic", fill: color }}
      >
        tp
      </text>
    </svg>
  );
}

// ── Textura de grano ────────────────────────────────────────
function Grain({ opacity = 0.045 }) {
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
        transform: on ? "none" : "translateY(26px)",
        transition: `opacity 0.9s ease ${delay}ms, transform 0.9s cubic-bezier(.22,1,.36,1) ${delay}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ── Botones ─────────────────────────────────────────────────
function Cta({ children, href, onClick, ghost = false, small = false, dark = false }) {
  const solidBg = dark ? C.ivory : C.olive;
  const solidColor = dark ? C.ink : C.cream;
  const ghostColor = dark ? C.ivory : C.ink;
  const base = {
    display: "inline-block",
    fontFamily: BODY,
    fontWeight: 600,
    fontSize: small ? 13 : 15,
    letterSpacing: 0.4,
    padding: small ? "10px 22px" : "17px 38px",
    borderRadius: 999,
    border: `1.5px solid ${ghost ? ghostColor : solidBg}`,
    background: ghost ? "transparent" : solidBg,
    color: ghost ? ghostColor : solidColor,
    cursor: "pointer",
    textDecoration: "none",
    transition: "transform .25s ease, box-shadow .25s ease, background .25s ease, color .25s ease",
  };
  const hover = (e, over) => {
    e.currentTarget.style.transform = over ? "translateY(-2px)" : "none";
    e.currentTarget.style.boxShadow = over ? "0 12px 28px rgba(51,55,44,.22)" : "none";
    if (ghost) {
      e.currentTarget.style.background = over ? ghostColor : "transparent";
      e.currentTarget.style.color = over ? (dark ? C.ink : C.cream) : ghostColor;
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

// ── Nav sticky + barra de progreso de scroll ────────────────
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? Math.min(1, window.scrollY / h) : 0);
    };
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
        padding: scrolled ? "12px 28px" : "20px 28px",
        background: scrolled ? "rgba(241,235,221,.9)" : "transparent",
        backdropFilter: scrolled ? "blur(10px)" : "none",
        borderBottom: scrolled ? `1px solid ${C.sand}` : "1px solid transparent",
        transition: "all .35s ease",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          height: 3,
          width: `${progress * 100}%`,
          background: C.olive,
          transition: "width .1s linear",
        }}
      />
      <a href="#top" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
        <TpMark size={34} />
        <span style={{ fontFamily: DISPLAY, fontSize: 17, letterSpacing: 2.5, color: C.ink }}>
          THE PROJECT
        </span>
      </a>
      <div className="tp-nav-links" style={{ display: "flex", gap: 24, alignItems: "center" }}>
        {[
          ["Qué es", "#que-es"],
          ["La app", "#la-app"],
          ["Tu mes", "#tu-mes"],
          ["Reto AWAKE", "#awake"],
          ["Membresía", "#membresia"],
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
      <Cta href={APP_URL} small>
        Empezar gratis
      </Cta>
    </nav>
  );
}

// ── Hero: línea rotativa ────────────────────────────────────
const HERO_LINES = [
  "¿pero es la vida que tú quieres?",
  "¿o solo vas en autopilot?",
  "y aun así sientes que algo falta.",
  "wait… ¿y tú cuándo?",
];

function RotatingLine() {
  const [i, setI] = useState(0);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const t = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setI((x) => (x + 1) % HERO_LINES.length);
        setVisible(true);
      }, 380);
    }, 3400);
    return () => clearInterval(t);
  }, []);
  return (
    <em
      style={{
        display: "block",
        fontFamily: ACCENT,
        fontStyle: "italic",
        fontWeight: 500,
        color: C.olive,
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : "translateY(10px)",
        transition: "opacity .38s ease, transform .38s ease",
      }}
    >
      {HERO_LINES[i]}
    </em>
  );
}

// ── Cinta marquee Find · Elevate · Rise ─────────────────────
function Ribbon({ items, dark = true }) {
  const seq = [...items, ...items, ...items, ...items];
  return (
    <div
      style={{
        background: dark ? C.ink : "transparent",
        borderTop: dark ? "none" : `1px solid ${C.sand}`,
        borderBottom: dark ? "none" : `1px solid ${C.sand}`,
        overflow: "hidden",
        padding: "16px 0",
      }}
    >
      <div style={{ display: "flex", gap: 0, width: "max-content", animation: "tp-marquee 28s linear infinite" }}>
        {seq.map((w, i) => (
          <span
            key={i}
            style={{
              fontFamily: DISPLAY,
              fontSize: 17,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: dark ? C.ivory : C.ink,
              padding: "0 26px",
              whiteSpace: "nowrap",
            }}
          >
            {w} <span style={{ color: dark ? C.soft : C.olive, marginLeft: 46 }}>✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Quiz interactivo: ¿te suena? ────────────────────────────
const QUIZ = [
  "Das mucho y sientes que no te ven.",
  "Llevas meses (o años) sintiéndote stuck.",
  "Quieres más, pero no sabes ni qué.",
  "El networking te drena más de lo que te da.",
  "Te va bien en papel… y aun así algo falta.",
];

function Quiz() {
  const [sel, setSel] = useState([]);
  const toggle = (i) =>
    setSel((s) => (s.includes(i) ? s.filter((x) => x !== i) : [...s, i]));
  const hit = sel.length >= 2;
  return (
    <div style={{ maxWidth: 660, margin: "0 auto" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {QUIZ.map((q, i) => {
          const on = sel.includes(i);
          return (
            <button
              key={i}
              type="button"
              onClick={() => toggle(i)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                textAlign: "left",
                fontFamily: BODY,
                fontSize: 15.5,
                fontWeight: on ? 600 : 400,
                color: C.ink,
                background: on ? C.cream : "rgba(251,247,238,.5)",
                border: `1.5px solid ${on ? C.olive : C.sand}`,
                borderRadius: 16,
                padding: "17px 20px",
                cursor: "pointer",
                transform: on ? "scale(1.015)" : "none",
                boxShadow: on ? "0 10px 26px rgba(51,55,44,.1)" : "none",
                transition: "all .25s ease",
              }}
            >
              <span
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  flexShrink: 0,
                  border: `1.5px solid ${on ? C.olive : C.taupe}`,
                  background: on ? C.olive : "transparent",
                  color: C.cream,
                  display: "grid",
                  placeItems: "center",
                  fontSize: 13,
                  transition: "all .25s ease",
                }}
              >
                {on ? "✦" : ""}
              </span>
              {q}
            </button>
          );
        })}
      </div>
      <div
        style={{
          textAlign: "center",
          marginTop: 28,
          maxHeight: hit ? 220 : 0,
          opacity: hit ? 1 : 0,
          overflow: "hidden",
          transition: "all .5s cubic-bezier(.22,1,.36,1)",
        }}
      >
        <p style={{ fontFamily: ACCENT, fontStyle: "italic", fontSize: 23, color: C.olive, margin: "6px 0 18px" }}>
          Marcaste {sel.length} de 5. No estás sola — y no, no te falta capacidad.
        </p>
        <Cta href="#que-es">Entonces esto es para ti ↓</Cta>
      </div>
      {!hit && (
        <p style={{ textAlign: "center", fontFamily: BODY, fontSize: 12.5, color: C.taupe, marginTop: 22 }}>
          Toca las que te suenen. Sé honesta.
        </p>
      )}
    </div>
  );
}

// ── Ecosistema: tarjetas expandibles ────────────────────────
const ECOSYSTEM = [
  {
    k: "app",
    n: "01",
    title: "La app · tu espacio diario",
    short: "Check-in, journaling y pendientes en un solo lugar.",
    long: "Tu ritual de todos los días: check-ins de mañana, tarde y noche, journaling guiado, pendientes de trabajo y vida separados, y tu progreso del mes. Empiezas gratis, hoy.",
    cta: { label: "Abrir mi espacio →", href: APP_URL },
  },
  {
    k: "mentoring",
    n: "02",
    title: "Mentoring con método",
    short: "De “no sé qué quiero” a un plan real.",
    long: "Masterclass de mindset, la sesión “¿Qué quiero?” para escuchar debajo del ruido, y tu Project Review con Fer para aterrizarlo en un plan accionable. Sin filtros, sin pose de gurú.",
    cta: { label: "Conocer la membresía →", href: "#membresia" },
  },
  {
    k: "awake",
    n: "03",
    title: "Reto AWAKE · 21 días",
    short: "Tres semanas para despertar, con acompañamiento.",
    long: "Un prompt diario durante 21 días: mirar hacia adentro, encontrar claridad y dar el primer paso. En grupo, con Fer guiando cada día. #Awake21",
    cta: { label: "Ver el reto →", href: "#awake" },
  },
  {
    k: "red",
    n: "04",
    title: "Networking consciente",
    short: "Una red de mujeres que van por lo mismo.",
    long: "No venimos a competir ni a intercambiar tarjetas. Venimos a abrirnos camino juntas: encuentros mensuales, conexiones reales y una comunidad que te sostiene cuando dudas.",
    cta: { label: "Unirme →", href: "#membresia" },
  },
];

function EcosystemCards() {
  const [open, setOpen] = useState("app");
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: 18,
        maxWidth: 1040,
        margin: "0 auto",
      }}
    >
      {ECOSYSTEM.map((e) => {
        const on = open === e.k;
        return (
          <button
            key={e.k}
            type="button"
            onClick={() => setOpen(e.k)}
            style={{
              textAlign: "left",
              background: on ? C.ivory : "rgba(241,235,221,.08)",
              color: on ? C.ink : C.ivory,
              border: `1.5px solid ${on ? C.ivory : "rgba(241,235,221,.3)"}`,
              borderRadius: 22,
              padding: "26px 24px",
              cursor: "pointer",
              transition: "all .4s cubic-bezier(.22,1,.36,1)",
              transform: on ? "translateY(-6px)" : "none",
              boxShadow: on ? "0 24px 50px rgba(0,0,0,.3)" : "none",
              display: "flex",
              flexDirection: "column",
              minHeight: 210,
            }}
          >
            <div
              style={{
                fontFamily: DISPLAY,
                fontSize: 26,
                color: on ? C.olive : C.soft,
                marginBottom: 10,
              }}
            >
              {e.n}
            </div>
            <div style={{ fontFamily: DISPLAY, fontSize: 19, lineHeight: 1.25, marginBottom: 8 }}>{e.title}</div>
            <p
              style={{
                fontFamily: BODY,
                fontSize: 13.5,
                lineHeight: 1.65,
                opacity: 0.85,
                margin: 0,
                flex: 1,
              }}
            >
              {on ? e.long : e.short}
            </p>
            <div
              style={{
                marginTop: 14,
                maxHeight: on ? 50 : 0,
                opacity: on ? 1 : 0,
                overflow: "hidden",
                transition: "all .4s ease",
              }}
            >
              {e.cta.href.startsWith("/") ? (
                <Link
                  href={e.cta.href}
                  style={{ fontFamily: BODY, fontSize: 13.5, fontWeight: 600, color: C.olive, textDecoration: "none" }}
                >
                  {e.cta.label}
                </Link>
              ) : (
                <a
                  href={e.cta.href}
                  style={{ fontFamily: BODY, fontSize: 13.5, fontWeight: 600, color: C.olive, textDecoration: "none" }}
                >
                  {e.cta.label}
                </a>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ── Mini-mocks de la app (tarjetas en arco) ─────────────────
function MockCheckin() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
      <div style={{ fontFamily: ACCENT, fontStyle: "italic", fontSize: 14, color: C.ink }}>¿Cómo amaneces hoy?</div>
      <div style={{ display: "flex", gap: 8 }}>
        {["😌", "🙂", "😐", "😮‍💨", "🥲"].map((e, i) => (
          <div
            key={i}
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              background: i === 1 ? C.soft : "#fff",
              border: `1px solid ${C.sand}`,
              display: "grid",
              placeItems: "center",
              fontSize: 14,
            }}
          >
            {e}
          </div>
        ))}
      </div>
      <div style={{ fontSize: 9, letterSpacing: 1.4, textTransform: "uppercase", color: C.taupe }}>Check-in diario</div>
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
              border: `1.5px solid ${done ? C.olive : C.sand}`,
              background: done ? C.olive : "transparent",
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
      <div style={{ fontSize: 9, letterSpacing: 1.4, textTransform: "uppercase", color: C.taupe, marginTop: 4 }}>
        Trabajo + vida, separados
      </div>
    </div>
  );
}

function MockJournal() {
  return (
    <div style={{ width: "100%" }}>
      <div style={{ fontFamily: ACCENT, fontStyle: "italic", fontSize: 13.5, color: C.ink, lineHeight: 1.6 }}>
        “En realidad, lo que quiero es…”
      </div>
      <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
        {[90, 75, 60].map((w, i) => (
          <div key={i} style={{ height: 4, width: `${w}%`, borderRadius: 4, background: C.sand }} />
        ))}
      </div>
      <div style={{ fontSize: 9, letterSpacing: 1.4, textTransform: "uppercase", color: C.taupe, marginTop: 10 }}>
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
              background: i === 3 ? C.olive : C.soft,
              opacity: i === 3 ? 1 : 0.7,
            }}
          />
        ))}
      </div>
      <div style={{ fontSize: 9, letterSpacing: 1.4, textTransform: "uppercase", color: C.taupe }}>
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
          border: `1px solid ${C.sand}`,
          borderRadius: "14px 14px 14px 4px",
          padding: "8px 11px",
          fontSize: 11,
          color: C.ink,
          lineHeight: 1.5,
        }}
      >
        Hoy traes mucha carga. Elige UNA prioridad y protege tu pausa de la tarde. 🤍
      </div>
      <div style={{ fontSize: 9, letterSpacing: 1.4, textTransform: "uppercase", color: C.taupe }}>
        IA que te acompaña · add-on
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
      <div style={{ fontSize: 9, letterSpacing: 1.4, textTransform: "uppercase", color: C.taupe }}>
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
        background: `linear-gradient(180deg, ${C.cream} 0%, ${C.nude} 100%)`,
        border: `1px solid ${C.sand}`,
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
          border: `1px solid ${C.soft}66`,
          pointerEvents: "none",
        }}
      />
      {children}
    </div>
  );
}

function ArchMarquee() {
  const [paused, setPaused] = useState(false);
  const cards = [...ARCH_CARDS, ...ARCH_CARDS];
  return (
    <div
      style={{ overflow: "hidden", padding: "30px 0 36px", position: "relative" }}
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
      {["left", "right"].map((side) => (
        <div
          key={side}
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            [side]: 0,
            width: 90,
            background: `linear-gradient(to ${side === "left" ? "right" : "left"}, ${C.ivory}, transparent)`,
            pointerEvents: "none",
          }}
        />
      ))}
    </div>
  );
}

// ── Un mes adentro ──────────────────────────────────────────
const MONTH = [
  {
    week: "Semana 1",
    title: "Coaching con Fer",
    text: "Tu sesión para aterrizar dónde estás y qué quieres. De ahí sale tu enfoque del mes — todo lo demás gira alrededor de ti.",
  },
  {
    week: "Semana 2",
    title: "Webinar con invitada especial",
    text: "Un hack corporativo real + Q&A íntimo. Mentes que ya recorrieron el camino, sin filtros.",
  },
  {
    week: "Semana 3",
    title: "Wellness check-in",
    text: "Journaling en grupo + meditación guiada por una experta invitada. Bajarle al ruido para escucharte.",
  },
  {
    week: "Semana 4",
    title: "Networking consciente",
    text: "Conexiones reales, moderadas por Fer. No venimos a competir — venimos juntas.",
  },
];

function MonthTimeline() {
  const [active, setActive] = useState(0);
  return (
    <div style={{ maxWidth: 880, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "center", gap: 0, marginBottom: 36, position: "relative" }}>
        <div
          style={{
            position: "absolute",
            top: 21,
            left: "12%",
            right: "12%",
            height: 1.5,
            background: C.greige,
          }}
        />
        {MONTH.map((m, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActive(i)}
            style={{
              flex: 1,
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
              position: "relative",
            }}
          >
            <span
              style={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                border: `1.5px solid ${i === active ? C.olive : C.greige}`,
                background: i === active ? C.olive : C.ivory,
                color: i === active ? C.cream : C.taupe,
                display: "grid",
                placeItems: "center",
                fontFamily: DISPLAY,
                fontSize: 16,
                transition: "all .3s ease",
                transform: i === active ? "scale(1.15)" : "none",
              }}
            >
              {i + 1}
            </span>
            <span
              style={{
                fontFamily: BODY,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: 1.2,
                textTransform: "uppercase",
                color: i === active ? C.ink : C.taupe,
              }}
            >
              {m.week}
            </span>
          </button>
        ))}
      </div>
      <div
        key={active}
        style={{
          background: C.cream,
          border: `1px solid ${C.sand}`,
          borderRadius: 24,
          padding: "40px 38px",
          textAlign: "center",
          animation: "tp-fade-up .45s ease both",
        }}
      >
        <div style={{ fontFamily: DISPLAY, fontSize: 25, color: C.ink, marginBottom: 12 }}>{MONTH[active].title}</div>
        <p style={{ fontFamily: BODY, fontSize: 15.5, lineHeight: 1.75, color: C.ink, opacity: 0.78, maxWidth: 520, margin: "0 auto" }}>
          {MONTH[active].text}
        </p>
      </div>
    </div>
  );
}

// ── Reto AWAKE: 21 puntos + 3 fases ─────────────────────────
const AWAKE_PHASES = [
  {
    days: "Días 1–7",
    title: "Mirar hacia adentro",
    text: "Conocerte de verdad, sin filtros: tu martes ideal, tus momentos de flow, tus no-negociables, la niña que fuiste.",
  },
  {
    days: "Días 8–14",
    title: "Encontrar claridad",
    text: "Aprender a pensar distinto: la duda como brújula, silencio estratégico, menos decisiones que drenan, tu carta al futuro.",
  },
  {
    days: "Días 15–21",
    title: "Dar el primer paso",
    text: "De la reflexión a la acción: el paso más pequeño, tu meta clara, tu red de apoyo y tu compromiso.",
  },
];

function AwakeChallenge() {
  const [phase, setPhase] = useState(0);
  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "center", gap: 9, flexWrap: "wrap", marginBottom: 36 }}>
        {Array.from({ length: 21 }, (_, i) => {
          const p = i < 7 ? 0 : i < 14 ? 1 : 2;
          const on = p === phase;
          return (
            <button
              key={i}
              type="button"
              aria-label={`Día ${i + 1}`}
              onClick={() => setPhase(p)}
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                border: `1.5px solid ${on ? C.soft : "rgba(241,235,221,.3)"}`,
                background: on ? C.soft : "transparent",
                color: on ? C.ink : "rgba(241,235,221,.55)",
                fontFamily: BODY,
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
                display: "grid",
                placeItems: "center",
                transition: `all .3s ease ${(i % 7) * 30}ms`,
                transform: on ? "scale(1.1)" : "none",
              }}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 30, flexWrap: "wrap" }}>
        {AWAKE_PHASES.map((f, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setPhase(i)}
            style={{
              fontFamily: BODY,
              fontSize: 12.5,
              fontWeight: 600,
              letterSpacing: 1,
              textTransform: "uppercase",
              padding: "10px 22px",
              borderRadius: 999,
              cursor: "pointer",
              border: `1.5px solid ${i === phase ? C.soft : "rgba(241,235,221,.35)"}`,
              background: i === phase ? C.soft : "transparent",
              color: i === phase ? C.ink : C.ivory,
              transition: "all .3s ease",
            }}
          >
            {f.days}
          </button>
        ))}
      </div>
      <div key={phase} style={{ textAlign: "center", animation: "tp-fade-up .45s ease both" }}>
        <div style={{ fontFamily: DISPLAY, fontSize: 27, color: C.ivory, marginBottom: 12 }}>
          {AWAKE_PHASES[phase].title}
        </div>
        <p
          style={{
            fontFamily: BODY,
            fontSize: 15.5,
            lineHeight: 1.75,
            color: C.ivory,
            opacity: 0.82,
            maxWidth: 540,
            margin: "0 auto",
          }}
        >
          {AWAKE_PHASES[phase].text}
        </p>
      </div>
    </div>
  );
}

// ── Formas de pensar (mindset, con respaldo) ────────────────
const MINDSET = [
  {
    quote: "Los más originales no son los que no dudan. Son los que actúan a pesar de la duda.",
    src: "Adam Grant · Wharton",
  },
  {
    quote: "La mente resuelve en reposo lo que no puede resolver bajo presión.",
    src: "Neurociencia · default mode network",
  },
  {
    quote: "Demasiada elección no nos hace más libres. Nos paraliza.",
    src: "Sheena Iyengar · Columbia",
  },
  {
    quote: "Los grandes sueños abruman. Un martes normal es concreto.",
    src: "Diseño de vida · Stanford",
  },
  {
    quote: "Un yo vive la experiencia y otro la recuerda. Deciden distinto.",
    src: "Daniel Kahneman · Premio Nobel",
  },
];

function MindsetCarousel() {
  const [i, setI] = useState(0);
  const timer = useRef(null);
  const go = useCallback((d) => setI((x) => (x + d + MINDSET.length) % MINDSET.length), []);
  useEffect(() => {
    timer.current = setInterval(() => go(1), 5200);
    return () => clearInterval(timer.current);
  }, [go]);
  const manual = (fn) => {
    clearInterval(timer.current);
    fn();
    timer.current = setInterval(() => go(1), 5200);
  };
  return (
    <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
      <div key={i} style={{ animation: "tp-fade-up .5s ease both", minHeight: 150 }}>
        <p
          style={{
            fontFamily: ACCENT,
            fontStyle: "italic",
            fontWeight: 500,
            fontSize: "clamp(21px, 3vw, 27px)",
            lineHeight: 1.55,
            color: C.ink,
            margin: "0 0 16px",
          }}
        >
          “{MINDSET[i].quote}”
        </p>
        <div style={{ fontFamily: BODY, fontSize: 12, fontWeight: 600, letterSpacing: 1.8, textTransform: "uppercase", color: C.olive }}>
          {MINDSET[i].src}
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 24 }}>
        {MINDSET.map((_, x) => (
          <button
            key={x}
            type="button"
            aria-label={`Forma ${x + 1}`}
            onClick={() => manual(() => setI(x))}
            style={{
              width: x === i ? 22 : 7,
              height: 7,
              borderRadius: 99,
              border: "none",
              background: x === i ? C.olive : C.greige,
              cursor: "pointer",
              transition: "all .35s ease",
              padding: 0,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ── Testimonios ─────────────────────────────────────────────
const TESTIMONIALS = [
  {
    quote:
      "Llegué pensando que necesitaba otro curso. Lo que encontré fue claridad: en un mes pasé de “no sé qué quiero” a tener un plan que sí es mío.",
    name: "Mariana G.",
    role: "Gerente de marketing · CDMX",
  },
  {
    quote:
      "El reto de 21 días me despertó. Y la comunidad… es otra cosa: mujeres que te empujan sin competirte.",
    name: "Caro V.",
    role: "Consultora · Bogotá",
  },
  {
    quote:
      "La app se volvió mi ritual de las mañanas. Me pregunta cómo estoy antes de preguntarme qué voy a hacer — eso lo cambia todo.",
    name: "Fernanda R.",
    role: "Product manager · Monterrey",
  },
  {
    quote:
      "El Project Review con Fer fue la primera vez que alguien me ayudó a aterrizar lo que quiero en pasos reales. Sin humo.",
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
    border: `1.5px solid ${C.sand}`,
    background: C.cream,
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
        onMouseLeave={(e) => (e.currentTarget.style.background = C.cream) && (e.currentTarget.style.color = C.ink)}
      >
        ←
      </button>
      <div style={{ flex: 1, textAlign: "center", minHeight: 210 }}>
        <div key={index} style={{ animation: "tp-fade-up .55s ease both" }}>
          <div style={{ fontSize: 30, color: C.soft, fontFamily: DISPLAY, lineHeight: 1 }}>“</div>
          <p
            style={{
              fontFamily: ACCENT,
              fontStyle: "italic",
              fontWeight: 500,
              fontSize: 21,
              lineHeight: 1.6,
              color: C.olive,
              margin: "6px 0 20px",
            }}
          >
            {t.quote}
          </p>
          <div style={{ fontFamily: BODY, fontSize: 13, fontWeight: 600, letterSpacing: 1.6, textTransform: "uppercase", color: C.ink }}>
            — {t.name}
          </div>
          <div style={{ fontFamily: BODY, fontSize: 12.5, color: C.taupe, marginTop: 5 }}>{t.role}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 24 }}>
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
                background: i === index ? C.olive : C.sand,
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
        onMouseLeave={(e) => (e.currentTarget.style.background = C.cream) && (e.currentTarget.style.color = C.ink)}
      >
        →
      </button>
    </div>
  );
}

// ── Membresía / planes ──────────────────────────────────────
function Plans() {
  const plans = [
    {
      name: "La app · gratis",
      price: "$0",
      period: "para siempre",
      featured: false,
      tag: null,
      items: [
        "Check-in diario (mañana / tarde / noche)",
        "Journaling guiado",
        "Pendientes: trabajo y vida, separados",
        "Mi progreso del mes",
        "10 paletas para hacerla tuya",
      ],
      cta: { label: "Empezar gratis hoy", href: APP_URL },
      note: "Tu puerta de entrada. Sin tarjeta.",
    },
    {
      name: "Membresía The Project",
      price: "$349",
      period: "MXN / mes",
      featured: true,
      tag: "Precio fundadoras · solo las primeras",
      items: [
        "Coaching con Fer: dónde estás y qué quieres",
        "Webinar mensual con invitada especial",
        "Wellness check-in: journaling + meditación guiada",
        "Networking consciente mensual",
        "Reto AWAKE de 21 días acompañado",
        "Comunidad privada de mujeres",
        "La app completa, incluida",
      ],
      cta: { label: "Apartar mi lugar ✦", href: "#contacto" },
      note: "Menos de $90 por sesión en vivo.",
    },
    {
      name: "Add-on · IA en tu espacio",
      price: "+$10",
      period: "USD / mes",
      featured: false,
      tag: null,
      items: [
        "Guía diaria personalizada con IA",
        "Análisis de tu journaling",
        "Sugerencias según tu energía",
        "Recomendaciones que aprenden de ti",
      ],
      cta: { label: "Activarlo en la app", href: APP_URL },
      note: "Opcional, sobre la app o la membresía.",
    },
  ];
  return (
    <div style={{ display: "flex", gap: 22, justifyContent: "center", flexWrap: "wrap", alignItems: "stretch" }}>
      {plans.map((p, idx) => (
        <Reveal key={p.name} delay={idx * 120} style={{ flex: "1 1 280px", maxWidth: 380, display: "flex" }}>
          <div
            style={{
              background: p.featured ? C.ink : C.cream,
              color: p.featured ? C.ivory : C.ink,
              border: `1px solid ${p.featured ? C.ink : C.sand}`,
              borderRadius: 26,
              padding: "38px 32px",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              boxShadow: p.featured ? "0 26px 54px rgba(51,55,44,.3)" : "0 12px 30px rgba(51,55,44,.06)",
              position: "relative",
              transition: "transform .35s cubic-bezier(.22,1,.36,1)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-8px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
          >
            {p.tag && (
              <div
                style={{
                  position: "absolute",
                  top: -13,
                  left: "50%",
                  transform: "translateX(-50%)",
                  whiteSpace: "nowrap",
                  background: C.soft,
                  color: C.ink,
                  fontFamily: BODY,
                  fontSize: 10.5,
                  fontWeight: 600,
                  letterSpacing: 1.2,
                  textTransform: "uppercase",
                  padding: "6px 16px",
                  borderRadius: 99,
                }}
              >
                {p.tag}
              </div>
            )}
            <div style={{ fontFamily: BODY, fontSize: 12, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", opacity: 0.7 }}>
              {p.name}
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, margin: "12px 0 22px" }}>
              <span style={{ fontFamily: DISPLAY, fontSize: 44 }}>{p.price}</span>
              <span style={{ fontFamily: BODY, fontSize: 13, opacity: 0.65 }}>{p.period}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 11, marginBottom: 26, flex: 1 }}>
              {p.items.map((it) => (
                <div key={it} style={{ display: "flex", gap: 10, fontFamily: BODY, fontSize: 13.5, lineHeight: 1.5 }}>
                  <span style={{ color: p.featured ? C.soft : C.olive }}>✦</span>
                  <span style={{ opacity: 0.9 }}>{it}</span>
                </div>
              ))}
            </div>
            {p.cta.href.startsWith("/") ? (
              <Link
                href={p.cta.href}
                style={{
                  fontFamily: BODY,
                  fontWeight: 600,
                  fontSize: 14,
                  textAlign: "center",
                  padding: "14px 20px",
                  borderRadius: 999,
                  textDecoration: "none",
                  background: p.featured ? C.soft : C.olive,
                  color: p.featured ? C.ink : C.cream,
                  transition: "opacity .2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = 0.88)}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = 1)}
              >
                {p.cta.label}
              </Link>
            ) : (
              <a
                href={p.cta.href}
                style={{
                  fontFamily: BODY,
                  fontWeight: 600,
                  fontSize: 14,
                  textAlign: "center",
                  padding: "14px 20px",
                  borderRadius: 999,
                  textDecoration: "none",
                  background: p.featured ? C.soft : C.olive,
                  color: p.featured ? C.ink : C.cream,
                  transition: "opacity .2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = 0.88)}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = 1)}
              >
                {p.cta.label}
              </a>
            )}
            <div style={{ fontFamily: BODY, fontSize: 11.5, opacity: 0.6, textAlign: "center", marginTop: 12 }}>{p.note}</div>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

// ── Formulario: apartar lugar / pedir info ──────────────────
function LeadForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("idle");
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
      <div
        style={{
          background: C.cream,
          border: `1px solid ${C.sand}`,
          borderRadius: 26,
          padding: "56px 40px",
          textAlign: "center",
          animation: "tp-fade-up .5s ease both",
        }}
      >
        <TpMark size={44} color={C.olive} />
        <div style={{ fontFamily: DISPLAY, fontSize: 26, color: C.ink, margin: "16px 0 10px" }}>
          ¡Listo, {form.name.split(" ")[0]}!
        </div>
        <p style={{ fontFamily: BODY, fontSize: 15, color: C.taupe, lineHeight: 1.7, maxWidth: 420, margin: "0 auto 26px" }}>
          Recibimos tus datos. Fer te escribe muy pronto con todo. Mientras tanto, tu espacio ya te está esperando — empieza gratis hoy.
        </p>
        <Cta href={APP_URL}>Abrir mi espacio ahora</Cta>
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
        padding: "40px 36px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        boxShadow: "0 16px 40px rgba(51,55,44,.07)",
      }}
    >
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <label style={{ flex: "1 1 200px" }}>
          <span style={labelStyle}>Nombre</span>
          <input
            style={field}
            placeholder="Ej. María Olivera"
            value={form.name}
            onChange={set("name")}
            onFocus={focus}
            onBlur={blur}
            required
          />
        </label>
        <label style={{ flex: "1 1 200px" }}>
          <span style={labelStyle}>Correo electrónico</span>
          <input
            style={field}
            type="email"
            placeholder="tucorreo@ejemplo.com"
            value={form.email}
            onChange={set("email")}
            onFocus={focus}
            onBlur={blur}
            required
          />
        </label>
      </div>
      <label>
        <span style={labelStyle}>Mensaje (opcional)</span>
        <textarea
          style={{ ...field, resize: "vertical", minHeight: 100 }}
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
          <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" style={{ color: C.olive, fontWeight: 600 }}>
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
          background: C.olive,
          color: C.cream,
          cursor: status === "sending" ? "wait" : "pointer",
          opacity: status === "sending" ? 0.7 : 1,
          transition: "opacity .25s ease",
        }}
      >
        {status === "sending" ? "Enviando…" : "Apartar mi lugar ✦"}
      </button>
      <div style={{ fontFamily: BODY, fontSize: 12.5, color: C.taupe, textAlign: "center" }}>
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
  const eyebrow = {
    fontFamily: BODY,
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: 3,
    textTransform: "uppercase",
    color: C.olive,
    marginBottom: 18,
  };
  const h2 = {
    fontFamily: DISPLAY,
    fontSize: "clamp(30px, 4.5vw, 46px)",
    fontWeight: 400,
    lineHeight: 1.15,
    color: C.ink,
    margin: 0,
  };

  return (
    <div id="top" style={{ background: C.ivory, color: C.ink, fontFamily: BODY, overflowX: "hidden" }}>
      <style>{`
        @keyframes tp-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes tp-fade-up { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }
        @keyframes tp-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        html { scroll-behavior: smooth; }
        @media (max-width: 820px) { .tp-nav-links { display: none !important; } }
        .fer-grid { display: flex; gap: 56px; align-items: center; max-width: 1080px; margin: 0 auto; }
        .fer-media { flex: 0 0 42%; }
        .fer-media img { width: 100%; height: auto; aspect-ratio: 4 / 5; object-fit: cover; border-radius: 28px; display: block; box-shadow: 0 24px 60px rgba(51,55,44,.18); }
        .fer-body { flex: 1 1 0; min-width: 0; }
        @media (max-width: 820px) {
          .fer-grid { flex-direction: column; gap: 34px; }
          .fer-media { flex: none; width: 100%; max-width: 360px; }
          .fer-body { text-align: center; }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; transition: none !important; }
        }
      `}</style>
      <Grain />
      <Nav />

      {/* ── HERO ── */}
      <header
        style={{
          position: "relative",
          minHeight: "94vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "150px 24px 70px",
          background: `radial-gradient(ellipse 90% 60% at 50% 0%, ${C.nude} 0%, ${C.ivory} 70%)`,
          overflow: "hidden",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: "12%",
            right: "-4%",
            opacity: 0.13,
            animation: "tp-float 5s ease-in-out infinite",
          }}
        >
          <TpMark size={280} color={C.olive} />
        </div>
        <div style={{ position: "relative", zIndex: 2, maxWidth: 900, animation: "tp-fade-up 1s ease both" }}>
          <div style={{ ...eyebrow, marginBottom: 26 }}>The Project by Fer · Find ✦ Elevate ✦ Rise</div>
          <h1
            style={{
              fontFamily: DISPLAY,
              fontWeight: 400,
              fontSize: "clamp(42px, 7.2vw, 82px)",
              lineHeight: 1.08,
              margin: "0 0 26px",
              letterSpacing: -0.5,
              color: C.ink,
            }}
          >
            Te va bien.
            <RotatingLine />
          </h1>
          <p
            style={{
              fontFamily: BODY,
              fontSize: "clamp(16px, 2vw, 19px)",
              lineHeight: 1.7,
              color: C.ink,
              opacity: 0.75,
              maxWidth: 640,
              margin: "0 auto 40px",
            }}
          >
            The Project es el espacio donde las mujeres que lo tienen todo en papel descubren qué
            quieren de verdad — y lo construyen. Con método, con comunidad y contigo en el centro.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <Cta href={APP_URL}>Quiero empezar YA ✦</Cta>
            <Cta href="#membresia" ghost>
              Conocer la membresía
            </Cta>
          </div>
          <p style={{ fontFamily: ACCENT, fontStyle: "italic", fontSize: 15.5, color: C.taupe, marginTop: 26 }}>
            La app es gratis. Tu claridad, no tiene precio.
          </p>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 24,
            left: "50%",
            marginLeft: -8,
            fontSize: 22,
            color: C.taupe,
            animation: "tp-float 2.6s ease-in-out infinite",
          }}
        >
          ↓
        </div>
      </header>

      {/* ── CINTA FIND ELEVATE RISE ── */}
      <Ribbon items={["Find", "Elevate", "Rise", "Despierta", "Claridad", "Intención"]} />

      {/* ── QUIZ ¿TE SUENA? ── */}
      <section style={{ padding: "100px 28px", background: C.nude }}>
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: 46 }}>
            <div style={eyebrow}>Sé honesta</div>
            <h2 style={h2}>¿Te suena?</h2>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <Quiz />
        </Reveal>
      </section>

      {/* ── QUÉ ES ── */}
      <section id="que-es" style={{ padding: "110px 28px", position: "relative", overflow: "hidden" }}>
        <Reveal>
          <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
            <div style={eyebrow}>Qué es The Project</div>
            <p
              style={{
                fontFamily: DISPLAY,
                fontSize: "clamp(26px, 3.6vw, 38px)",
                lineHeight: 1.35,
                color: C.ink,
                margin: "0 0 34px",
              }}
            >
              Tu espacio para dejar de vivir en{" "}
              <em style={{ fontFamily: ACCENT, fontStyle: "italic", color: C.olive }}>autopilot</em> y
              construir la vida que sí quieres.
            </p>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                fontFamily: BODY,
                fontSize: 15.5,
                color: C.taupe,
                marginBottom: 18,
              }}
            >
              <span>— No es una escuela de negocios.</span>
              <span>— No es un retiro espiritual raro.</span>
              <span>— No es networking de tarjetas.</span>
            </div>
            <p style={{ fontFamily: ACCENT, fontStyle: "italic", fontWeight: 500, fontSize: 21, color: C.ink, margin: 0 }}>
              ✦ Es todo eso junto, pero mejor.
            </p>
          </div>
        </Reveal>
        <Reveal delay={150}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 40,
              flexWrap: "wrap",
              marginTop: 64,
              textAlign: "center",
            }}
          >
            {[
              ["Mindset", "el motor", "Las formas de pensar distinto que desbloquean claridad."],
              ["Mentoring", "el método", "Aterrizar el “qué quiero” en un plan real y accionable."],
              ["Networking", "el sostén", "La comunidad de mujeres que acompaña el camino."],
            ].map(([t, sub, d], i) => (
              <div key={t} style={{ maxWidth: 250 }}>
                <div style={{ fontFamily: DISPLAY, fontSize: 24, color: C.ink }}>{t}</div>
                <div style={{ fontFamily: ACCENT, fontStyle: "italic", fontSize: 16, color: C.olive, margin: "4px 0 10px" }}>
                  {sub}
                </div>
                <p style={{ fontFamily: BODY, fontSize: 13.5, lineHeight: 1.7, color: C.ink, opacity: 0.7, margin: 0 }}>{d}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ── ECOSISTEMA (banda tinta) ── */}
      <section style={{ padding: "110px 28px", background: C.ink }}>
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ ...eyebrow, color: C.soft }}>Todo conectado, en un solo lugar</div>
            <h2 style={{ ...h2, color: C.ivory }}>Un ecosistema hecho para ti.</h2>
            <p style={{ fontFamily: ACCENT, fontStyle: "italic", fontSize: 17, color: C.greige, marginTop: 14 }}>
              toca cada pieza para conocerla
            </p>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <EcosystemCards />
        </Reveal>
      </section>

      {/* ── LA APP ── */}
      <section id="la-app" style={{ padding: "100px 0 40px" }}>
        <Reveal>
          <div style={{ textAlign: "center", padding: "0 28px" }}>
            <div style={eyebrow}>La app · empieza hoy, gratis</div>
            <h2 style={h2}>Tu ritual diario vive aquí.</h2>
            <p style={{ fontFamily: BODY, fontSize: 15.5, color: C.taupe, maxWidth: 520, margin: "16px auto 0", lineHeight: 1.7 }}>
              Dos minutos en la mañana, dos en la noche. Tu mente en orden, tus pendientes en su lugar
              y tu progreso creciendo — sin otra app más que abrir.
            </p>
          </div>
        </Reveal>
        <ArchMarquee />
        <Reveal>
          <div style={{ textAlign: "center", paddingBottom: 50 }}>
            <Cta href={APP_URL}>Crear mi espacio gratis →</Cta>
          </div>
        </Reveal>
      </section>

      {/* ── UN MES ADENTRO ── */}
      <section id="tu-mes" style={{ padding: "100px 28px", background: C.nude, borderTop: `1px solid ${C.sand}` }}>
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: 50 }}>
            <div style={eyebrow}>La membresía, por dentro</div>
            <h2 style={h2}>Así se ve tu mes.</h2>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <MonthTimeline />
        </Reveal>
      </section>

      {/* ── CONOCE A FER (bio de la fundadora) ── */}
      <section id="conoce-a-fer" style={{ padding: "110px 28px" }}>
        <Reveal>
          <div className="fer-grid">
            <div className="fer-media">
              <img
                src="/fer.jpg"
                alt="Fer, fundadora de The Project"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="fer-body">
              <div style={eyebrow}>Fundadora · The Project</div>
              <h2 style={{ ...h2, marginBottom: 20 }}>Conoce a Fer</h2>
              <p style={{ fontFamily: ACCENT, fontStyle: "italic", fontSize: 21, color: C.olive, margin: "0 0 20px" }}>
                Hola, soy Fer 👋
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 560 }}>
                {[
                  "Durante más de 10 años he construido mi carrera en marketing y alianzas para empresas de tecnología en toda Latinoamérica — hoy lidero marketing y partnerships para LATAM en una empresa global de tecnología, y en el camino me formé en storytelling y liderazgo en lugares como Northwestern University y el Tec de Monterrey.",
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

      {/* ── RETO AWAKE (banda tinta) ── */}
      <section id="awake" style={{ padding: "110px 28px", background: C.ink }}>
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: 46 }}>
            <div style={{ ...eyebrow, color: C.soft }}>El reto · #Awake21</div>
            <h2 style={{ ...h2, color: C.ivory }}>21 días para despertar.</h2>
            <p style={{ fontFamily: ACCENT, fontStyle: "italic", fontSize: 17, color: C.greige, marginTop: 14 }}>
              un prompt al día, acompañada — el reto termina, el viaje empieza
            </p>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <AwakeChallenge />
        </Reveal>
        <Reveal delay={200}>
          <div style={{ textAlign: "center", marginTop: 44 }}>
            <Cta href="#contacto" dark>
              Quiero el próximo reto ✦
            </Cta>
          </div>
        </Reveal>
      </section>

      {/* ── MINDSET ── */}
      <section style={{ padding: "100px 28px" }}>
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <div style={eyebrow}>Pensar distinto · respaldado por Wharton, Columbia y premios Nobel</div>
            <h2 style={h2}>No te falta capacidad.</h2>
            <p style={{ fontFamily: ACCENT, fontStyle: "italic", fontSize: 22, color: C.olive, marginTop: 10 }}>
              te falta pensar distinto.
            </p>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <MindsetCarousel />
        </Reveal>
      </section>

      {/* ── TESTIMONIOS ── */}
      <section
        style={{
          padding: "100px 28px",
          background: C.nude,
          borderTop: `1px solid ${C.sand}`,
          borderBottom: `1px solid ${C.sand}`,
        }}
      >
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: 50 }}>
            <div style={eyebrow}>Ellas ya empezaron</div>
            <h2 style={h2}>No estás sola en esto.</h2>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <Testimonials />
        </Reveal>
      </section>

      {/* ── MEMBRESÍA ── */}
      <section id="membresia" style={{ padding: "110px 28px 100px" }}>
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={eyebrow}>Membresía</div>
            <h2 style={h2}>Empieza gratis. Crece acompañada.</h2>
            <p style={{ fontFamily: BODY, fontSize: 15.5, color: C.taupe, maxWidth: 560, margin: "16px auto 0", lineHeight: 1.7 }}>
              La app es tuya desde hoy sin pagar nada. La membresía te suma el método, las sesiones en
              vivo y la comunidad — todo en un solo lugar. Y si quieres IA en tu espacio, es un add-on.
            </p>
          </div>
        </Reveal>
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          <Plans />
        </div>
      </section>

      {/* ── CINTA 2 ── */}
      <Ribbon items={["Tu momento es ahora", "Find", "Elevate", "Rise", "#Awake21"]} />

      {/* ── CONTACTO ── */}
      <section
        id="contacto"
        style={{
          padding: "110px 28px",
          background: `linear-gradient(180deg, ${C.ivory} 0%, ${C.nude} 100%)`,
        }}
      >
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 44 }}>
              <div style={eyebrow}>Grupo fundadoras · lugares limitados</div>
              <h2 style={h2}>Aparta tu lugar.</h2>
              <p style={{ fontFamily: BODY, fontSize: 15.5, lineHeight: 1.7, color: C.ink, opacity: 0.72, maxWidth: 480, margin: "18px auto 0" }}>
                Déjanos tus datos y Fer te escribe con todo: fechas, detalles y tu lugar en el grupo
                piloto. O empieza gratis con la app ahora mismo — toma menos de dos minutos.
              </p>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <LeadForm />
          </Reveal>
          <Reveal delay={200}>
            <div style={{ textAlign: "center", marginTop: 32 }}>
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
                  transition: "all .25s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = C.olive;
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = C.sand;
                  e.currentTarget.style.transform = "none";
                }}
              >
                <IconInstagram /> O mándanos DM · {INSTAGRAM_HANDLE}
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: C.ink, color: C.ivory, padding: "60px 28px 42px", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
          <TpMark size={46} color={C.ivory} />
        </div>
        <div style={{ fontFamily: DISPLAY, fontSize: 21, letterSpacing: 3, marginBottom: 8 }}>THE PROJECT</div>
        <div style={{ fontFamily: ACCENT, fontStyle: "italic", fontSize: 15, opacity: 0.75, marginBottom: 28 }}>
          Find · Elevate · Rise
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap", marginBottom: 30 }}>
          <Link href={APP_URL} style={{ color: C.ivory, fontFamily: BODY, fontSize: 13, opacity: 0.8, textDecoration: "none" }}>
            Abrir mi espacio
          </Link>
          <a href="#membresia" style={{ color: C.ivory, fontFamily: BODY, fontSize: 13, opacity: 0.8, textDecoration: "none" }}>
            Membresía
          </a>
          <a href="#awake" style={{ color: C.ivory, fontFamily: BODY, fontSize: 13, opacity: 0.8, textDecoration: "none" }}>
            Reto AWAKE
          </a>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noreferrer"
            style={{
              color: C.ivory,
              fontFamily: BODY,
              fontSize: 13,
              opacity: 0.8,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <IconInstagram size={15} color={C.ivory} /> {INSTAGRAM_HANDLE}
          </a>
        </div>
        <div style={{ fontFamily: BODY, fontSize: 11.5, opacity: 0.45 }}>
          © {new Date().getFullYear()} The Project by Fer · Hecha con 🤍 para mujeres que van por más
        </div>
      </footer>
    </div>
  );
}

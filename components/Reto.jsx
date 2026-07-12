"use client";

import { useState, useEffect } from "react";
import { store } from "@/lib/store";
import { retoActivo } from "@/lib/retos";
import { SERIF, BODY, ITALIC, dayId, Heart, aiMini } from "@/components/ui";

// ═══════════════════════════════════════════════════════════
//  RETO DEL MES — la guía del reto vigente (lib/retos.js),
//  con progreso y respuestas por usuaria.
// ═══════════════════════════════════════════════════════════

export default function RetoView({ P }) {
  const reto = retoActivo();
  const key = `tp:reto:${reto.id}`;
  const [data, setData] = useState(null); // { days: { n: { done, note, at } } }
  const [open, setOpen] = useState(null);

  useEffect(() => {
    (async () => {
      const saved = (await store.get(key)) || { days: {} };
      setData(saved);
      const firstPending = allDays(reto).find((d) => !saved.days?.[d.n]?.done);
      setOpen(firstPending ? firstPending.n : null);
    })();
  }, [key]);

  const save = async (next) => {
    setData(next);
    await store.set(key, next);
  };

  const setDay = (n, patch) => {
    const days = { ...(data.days || {}) };
    days[n] = { ...(days[n] || {}), ...patch, at: dayId() };
    return save({ ...data, days });
  };

  if (data === null) {
    return <div style={{ maxWidth: 1120, margin: "0 auto", padding: "60px 24px", textAlign: "center", color: P.muted }}>cargando el reto…</div>;
  }

  const dias = allDays(reto);
  const done = dias.filter((d) => data.days?.[d.n]?.done).length;
  const pct = Math.round((done / dias.length) * 100);
  const terminado = done === dias.length;
  const hoy = dias.find((d) => !data.days?.[d.n]?.done);

  return (
    <div style={{ maxWidth: 1120, margin: "0 auto", padding: "36px 24px 130px" }}>
      {/* Hero del reto */}
      <div className="hero-flex" style={{ marginBottom: 30 }}>
        <div className="fade d1" style={{ flex: "1.2 1 0", minWidth: 0, paddingTop: 8 }}>
          <div style={{ fontFamily: ITALIC, fontStyle: "italic", fontSize: 17, color: P.accent, marginBottom: 6 }}>el reto del mes</div>
          <div style={{ fontFamily: SERIF, fontWeight: 400, fontSize: "clamp(2.6rem, 6.5vw, 4.4rem)", lineHeight: 1, color: P.ink, letterSpacing: "0.02em" }}>{reto.nombre}</div>
          <div style={{ fontFamily: ITALIC, fontStyle: "italic", fontSize: 18, color: P.muted, margin: "10px 0 14px" }}>{reto.subtitulo}</div>
          <div style={{ fontFamily: BODY, fontSize: 15, color: P.ink, lineHeight: 1.65, maxWidth: 500, marginBottom: 18 }}>{reto.intro}</div>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
            <div className="glass-soft" style={{ padding: "10px 16px", borderRadius: 100, display: "flex", alignItems: "baseline", gap: 7 }}>
              <span style={{ fontFamily: SERIF, fontSize: 21, color: P.accent }}>{done}/{dias.length}</span>
              <span style={{ fontSize: 12, color: P.muted }}>días</span>
            </div>
            <div className="glass-soft" style={{ padding: "10px 16px", borderRadius: 100, display: "flex", alignItems: "baseline", gap: 7 }}>
              <span style={{ fontFamily: SERIF, fontSize: 21, color: P.accent }}>{pct}%</span>
              <span style={{ fontSize: 12, color: P.muted }}>del camino</span>
            </div>
            {hoy && <button onClick={() => { setOpen(hoy.n); document.getElementById(`reto-dia-${hoy.n}`)?.scrollIntoView({ behavior: "smooth", block: "center" }); }} style={{ fontFamily: BODY, fontSize: 13, fontWeight: 600, color: P.card, background: P.accent, border: "none", borderRadius: 100, padding: "10px 18px", cursor: "pointer", boxShadow: `0 6px 16px ${P.accent}44` }}>Hoy te toca: día {hoy.n} →</button>}
          </div>
        </div>

        {/* Cómo funciona */}
        <div className="fade d2 glass-dark floaty" style={{ flex: "1 1 0", minWidth: 0, borderRadius: "48px 68px 42px 74px", padding: "26px 28px", alignSelf: "flex-start" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Heart size={13} color={P.accent2} />
            <span style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: P.paperSoft }}>Cómo funciona</span>
          </div>
          {[
            "Cada día tiene un prompt — léelo con calma.",
            "Respóndelo aquí, en tu espacio. Nadie más lo ve.",
            "Palomea el día y vuelve mañana por el siguiente.",
          ].map((t, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "baseline", marginBottom: 9 }}>
              <span style={{ fontFamily: SERIF, fontSize: 16, color: P.accent2, flexShrink: 0 }}>{i + 1}</span>
              <span style={{ fontFamily: BODY, fontSize: 14, color: P.paper, lineHeight: 1.55 }}>{t}</span>
            </div>
          ))}
          {reto.hashtag && (
            <a href="https://instagram.com/theprojectbyfer" target="_blank" rel="noreferrer" style={{ display: "inline-block", marginTop: 8, fontFamily: ITALIC, fontStyle: "italic", fontSize: 14, color: P.paperSoft, textDecoration: "underline" }}>
              ¿Quieres compartirlo? Usa {reto.hashtag} ✦
            </a>
          )}
        </div>
      </div>

      {/* Semanas */}
      {reto.semanas.map((sem, si) => {
        const first = sem.dias[0].n, last = sem.dias[sem.dias.length - 1].n;
        const semDone = sem.dias.filter((d) => data.days?.[d.n]?.done).length;
        return (
          <div key={si} className={`glass fade d${si + 2}`} style={{ borderRadius: si % 2 ? "58px 36px 62px 34px" : "36px 62px 40px 58px", padding: "26px 28px", marginBottom: 22 }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: P.muted, marginBottom: 6 }}>Semana {si + 1} · Días {first}–{last}</div>
                <div style={{ fontFamily: SERIF, fontSize: "clamp(1.4rem, 2.6vw, 1.9rem)", color: P.ink, lineHeight: 1.15 }}>{sem.titulo}</div>
                <div style={{ fontFamily: ITALIC, fontStyle: "italic", fontSize: 14.5, color: P.muted, marginTop: 4 }}>{sem.sub}</div>
              </div>
              <div style={{ fontSize: 12, color: P.muted }}>{semDone}/{sem.dias.length} ✓</div>
            </div>

            <div style={{ marginTop: 16 }}>
              {sem.dias.map((d) => {
                const st = data.days?.[d.n] || {};
                const isOpen = open === d.n;
                const esHoy = hoy && hoy.n === d.n;
                return (
                  <div key={d.n} id={`reto-dia-${d.n}`} style={{ borderBottom: `1px dashed ${P.line}` }}>
                    <div onClick={() => setOpen(isOpen ? null : d.n)} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 2px", cursor: "pointer" }}>
                      <span style={{ fontFamily: SERIF, fontSize: 19, color: st.done ? P.muted : P.accent, width: 30, flexShrink: 0, textAlign: "right" }}>{String(d.n).padStart(2, "0")}</span>
                      <span style={{ flex: 1, fontFamily: BODY, fontSize: 14.5, fontWeight: 600, color: st.done ? P.muted : P.ink, textDecoration: st.done ? "line-through" : "none" }}>
                        {d.titulo}
                        {esHoy && <span style={{ marginLeft: 10, fontSize: 10.5, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: P.accent, border: `1px solid ${P.soft}`, borderRadius: 100, padding: "2px 9px" }}>hoy</span>}
                      </span>
                      <div style={{ width: 22, height: 22, borderRadius: "50%", border: `1.5px solid ${st.done ? P.accent : P.line}`, background: st.done ? P.accent : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all .25s" }}>
                        {st.done && <span style={{ color: P.card, fontSize: 12 }}>✓</span>}
                      </div>
                    </div>

                    {isOpen && (
                      <div className="fade" style={{ padding: "2px 2px 18px 46px" }}>
                        <div style={{ fontFamily: ITALIC, fontStyle: "italic", fontSize: 15.5, color: P.ink, lineHeight: 1.6, marginBottom: 12, maxWidth: 620 }}>“{d.prompt}”</div>
                        <textarea
                          value={st.note || ""}
                          onChange={(e) => setDay(d.n, { note: e.target.value })}
                          placeholder="Tu respuesta, sin filtros — solo tú la ves…"
                          className="paper"
                          style={{ minHeight: 70, fontSize: 15, lineHeight: 1.7, padding: "4px 2px 8px", color: P.ink, resize: "vertical", maxWidth: 620 }}
                        />
                        <div style={{ display: "flex", gap: 10, marginTop: 10, alignItems: "center" }}>
                          {!st.done ? (
                            <button onClick={() => { setDay(d.n, { done: true }); setOpen(null); }} style={{ ...aiMini(P), background: P.accent, color: P.card, borderColor: P.accent }}>Completar día ✓</button>
                          ) : (
                            <button onClick={() => setDay(d.n, { done: false })} style={aiMini(P)}>Desmarcar</button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Cierre */}
      {terminado && (
        <div className="glass-dark fade" style={{ borderRadius: "64px 40px 64px 40px", padding: "36px 34px", textAlign: "center" }}>
          <Heart size={15} color={P.accent2} />
          <div style={{ fontFamily: SERIF, fontSize: "clamp(1.6rem, 3.4vw, 2.3rem)", color: P.paper, lineHeight: 1.2, margin: "12px 0 10px" }}>{reto.cierre}</div>
          <div style={{ fontFamily: ITALIC, fontStyle: "italic", fontSize: 15.5, color: P.paperSoft, lineHeight: 1.6, maxWidth: 480, margin: "0 auto" }}>{reto.cierreSub}</div>
        </div>
      )}
    </div>
  );
}

function allDays(reto) {
  return reto.semanas.flatMap((s) => s.dias);
}

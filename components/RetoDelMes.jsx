"use client";

import { useState, useEffect } from "react";
import { store } from "@/lib/store";
import { getActiveChallenge, phaseOf } from "@/lib/challenges";
import { SERIF, BODY, ITALIC, Heart, primaryBtn, aiMini } from "@/components/ui";

// ═══════════════════════════════════════════════════════════
//  RETO DEL MES — este mes: AWAKE · 21 días
//  El reto activo viene de Supabase (tabla challenges) y cambia
//  mes con mes. El progreso de la usuaria vive en su user_kv
//  bajo tp:reto:<slug> = { done: { "1": { at, note } }, startedAt }.
// ═══════════════════════════════════════════════════════════

export default function RetoView({ P }) {
  const [challenge, setChallenge] = useState(null); // null = cargando
  const [progress, setProgress] = useState(null);
  const [selected, setSelected] = useState(1);
  const [note, setNote] = useState("");

  useEffect(() => {
    (async () => {
      const ch = await getActiveChallenge();
      const prog = (await store.get(`tp:reto:${ch.slug}`)) || { done: {}, startedAt: null };
      setChallenge(ch);
      setProgress(prog);
      // arranca en el siguiente día pendiente
      const next = ch.days.find((d) => !prog.done[d.n]);
      const sel = next ? next.n : ch.days.length;
      setSelected(sel);
      setNote(prog.done[sel]?.note || "");
    })();
  }, []);

  if (!challenge || !progress) {
    return (
      <div style={{ textAlign: "center", padding: "90px 24px", fontFamily: ITALIC, fontStyle: "italic", fontSize: 18, color: P.muted }}>
        cargando el reto del mes…
      </div>
    );
  }

  const total = challenge.days.length;
  const doneCount = Object.keys(progress.done).length;
  const completed = doneCount >= total;
  const nextPending = challenge.days.find((d) => !progress.done[d.n])?.n ?? total;
  const day = challenge.days.find((d) => d.n === selected) || challenge.days[0];
  const phase = phaseOf(challenge, day.n);
  const isDone = !!progress.done[day.n];

  const saveProgress = async (prog) => {
    setProgress(prog);
    await store.set(`tp:reto:${challenge.slug}`, prog);
  };

  const pick = (n) => {
    setSelected(n);
    setNote(progress.done[n]?.note || "");
  };

  const toggleDone = async () => {
    const done = { ...progress.done };
    if (isDone) {
      delete done[day.n];
    } else {
      done[day.n] = { at: new Date().toISOString(), note: note.trim() || undefined };
    }
    const prog = { ...progress, done, startedAt: progress.startedAt || new Date().toISOString() };
    await saveProgress(prog);
    if (!isDone) {
      // al marcar, brinca al siguiente pendiente
      const next = challenge.days.find((d) => !prog.done[d.n]);
      if (next) pick(next.n);
    }
  };

  const saveNote = async () => {
    if (!isDone) return; // la nota se guarda junto con el día hecho
    const done = { ...progress.done, [day.n]: { ...progress.done[day.n], note: note.trim() || undefined } };
    await saveProgress({ ...progress, done });
  };

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 24px 80px" }}>
      {/* Encabezado del reto */}
      <div className="fade" style={{ textAlign: "center", marginBottom: 30 }}>
        <div style={{ fontSize: 12, letterSpacing: "0.16em", textTransform: "uppercase", color: P.muted, marginBottom: 8 }}>
          Reto del mes {challenge.hashtag ? `· ${challenge.hashtag}` : ""}
        </div>
        <div style={{ fontFamily: SERIF, fontSize: "clamp(2.2rem, 6vw, 3.4rem)", color: P.ink, lineHeight: 1.05 }}>{challenge.title}</div>
        {challenge.subtitle && (
          <div style={{ fontFamily: ITALIC, fontStyle: "italic", fontSize: 19, color: P.accent, marginTop: 6 }}>{challenge.subtitle}</div>
        )}
        {/* Barra de progreso */}
        <div style={{ maxWidth: 380, margin: "22px auto 0" }}>
          <div style={{ height: 8, borderRadius: 100, background: P.line, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(doneCount / total) * 100}%`, borderRadius: 100, background: P.accent, transition: "width .5s cubic-bezier(.22,1,.36,1)" }} />
          </div>
          <div style={{ fontFamily: BODY, fontSize: 12.5, color: P.muted, marginTop: 8 }}>
            {completed ? `Completaste los ${total} días` : `${doneCount} de ${total} días · vas en el día ${nextPending}`}
          </div>
        </div>
      </div>

      {/* Celebración al completar */}
      {completed && challenge.closing && (
        <div className="glass fade" style={{ borderRadius: "48px 72px 48px 72px", padding: "36px 34px", textAlign: "center", marginBottom: 26 }}>
          <div style={{ fontSize: 30 }}>✦</div>
          <div style={{ fontFamily: SERIF, fontSize: 26, color: P.ink, margin: "10px 0 8px" }}>{challenge.closing.title}</div>
          <p style={{ fontFamily: BODY, fontSize: 14.5, color: P.muted, lineHeight: 1.7, maxWidth: 440, margin: "0 auto" }}>
            {challenge.closing.text} <Heart color={P.accent} size={16} />
          </p>
        </div>
      )}

      {/* Rejilla de días por fase */}
      <div className="glass fade d1" style={{ borderRadius: 32, padding: "26px 26px 20px", marginBottom: 24 }}>
        {(challenge.phases || []).map((f) => (
          <div key={f.from} style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
              <span style={{ fontFamily: BODY, fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: P.muted }}>
                Días {f.from}–{f.to}
              </span>
              <span style={{ fontFamily: ITALIC, fontStyle: "italic", fontSize: 15, color: P.accent }}>{f.title}</span>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {challenge.days.filter((d) => d.n >= f.from && d.n <= f.to).map((d) => {
                const dDone = !!progress.done[d.n];
                const isSel = selected === d.n;
                const isNext = d.n === nextPending && !completed;
                return (
                  <button
                    key={d.n}
                    onClick={() => pick(d.n)}
                    title={`Día ${d.n} · ${d.title}`}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      fontFamily: BODY,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      border: `2px solid ${isSel ? P.accent : dDone ? P.accent : isNext ? P.soft : P.line}`,
                      background: dDone ? P.accent : isNext ? P.soft + "55" : "transparent",
                      color: dDone ? P.card : P.ink,
                      boxShadow: isSel ? `0 8px 20px ${P.accent}44` : "none",
                      transform: isSel ? "scale(1.12)" : "none",
                      transition: "all .25s ease",
                    }}
                  >
                    {dDone ? "✓" : d.n}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Tarjeta del día seleccionado */}
      <div key={day.n} className="glass fade" style={{ borderRadius: "56px 36px 56px 36px", padding: "36px 34px" }}>
        {phase && (
          <div style={{ fontSize: 11.5, letterSpacing: "0.14em", textTransform: "uppercase", color: P.muted, marginBottom: 8 }}>
            {phase.title} · {phase.sub}
          </div>
        )}
        <div style={{ fontFamily: SERIF, fontSize: 24, color: P.ink, marginBottom: 14 }}>
          Día {day.n} · {day.title}
        </div>
        <p style={{ fontFamily: ITALIC, fontStyle: "italic", fontSize: 19, lineHeight: 1.6, color: P.accent, margin: "0 0 22px" }}>
          “{day.prompt}”
        </p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onBlur={saveNote}
          placeholder="Tu respuesta de hoy (opcional — queda guardada solo para ti)"
          style={{
            width: "100%",
            minHeight: 90,
            fontFamily: BODY,
            fontSize: 14.5,
            lineHeight: 1.6,
            padding: "14px 18px",
            borderRadius: 18,
            border: `1.5px solid ${P.line}`,
            background: P.card + "B3",
            color: P.ink,
            outline: "none",
            resize: "vertical",
            marginBottom: 18,
          }}
        />
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <button onClick={toggleDone} style={isDone ? aiMini(P) : primaryBtn(P)}>
            {isDone ? "Desmarcar este día" : `Marcar día ${day.n} como hecho ✓`}
          </button>
          {isDone && progress.done[day.n]?.at && (
            <span style={{ fontFamily: BODY, fontSize: 12.5, color: P.muted }}>
              Hecho el {new Date(progress.done[day.n].at).toLocaleDateString("es-MX", { day: "numeric", month: "long" })} 🤍
            </span>
          )}
        </div>
      </div>

      <p style={{ textAlign: "center", fontFamily: BODY, fontSize: 12.5, color: P.muted, marginTop: 22, lineHeight: 1.7 }}>
        Un prompt al día, a tu ritmo. Comparte tu proceso con {challenge.hashtag || "#TheProject"} y guarda tus
        respuestas aquí — son tuyas.
      </p>
    </div>
  );
}

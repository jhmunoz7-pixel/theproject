"use client";

// Capa de persistencia. Reemplaza el window.storage del artifact.
//
// - Si hay variables de Supabase → usa Supabase (sesión anónima por navegador,
//   los datos sobreviven entre días y, al vincular email después, entre equipos).
// - Si no → cae a localStorage del navegador (solo ese equipo).
// - Siempre mantiene un memCache para no repetir lecturas dentro de la sesión.

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase =
  url && anon
    ? createClient(url, anon, {
        auth: { persistSession: true, autoRefreshToken: true },
      })
    : null;

const TABLE = "user_kv";
const memCache = {};

let userIdPromise = null;
async function getUserId() {
  if (!supabase) return null;
  if (!userIdPromise) {
    userIdPromise = (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) return session.user.id;
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
      return data.user?.id ?? null;
    })().catch(() => null);
  }
  return userIdPromise;
}

const local = {
  get(key) {
    try {
      if (typeof window !== "undefined") {
        const v = window.localStorage.getItem(key);
        return v ? JSON.parse(v) : null;
      }
    } catch {}
    return null;
  },
  set(key, val) {
    try {
      if (typeof window !== "undefined")
        window.localStorage.setItem(key, JSON.stringify(val));
    } catch {}
  },
  delete(key) {
    try {
      if (typeof window !== "undefined") window.localStorage.removeItem(key);
    } catch {}
  },
  list(prefix) {
    try {
      if (typeof window !== "undefined")
        return Object.keys(window.localStorage).filter((k) =>
          k.startsWith(prefix),
        );
    } catch {}
    return [];
  },
};

// Id de la usuaria (sesión anónima de Supabase); null si no hay Supabase.
// Lo usa el flujo de Stripe para saber a quién activarle Premium.
export async function getUid() {
  return getUserId();
}

// Registro de la landing: guarda nombre + correo en la tabla `registrations`
// (insert público, sin lectura por API). Sin Supabase, cae a localStorage.
export async function registerLead({ name, email }) {
  try {
    if (supabase) {
      await supabase.from("registrations").insert({ name, email });
      return true;
    }
  } catch {}
  try {
    const list = local.get("tp:leads") || [];
    list.push({ name, email, at: new Date().toISOString() });
    local.set("tp:leads", list);
  } catch {}
  return true;
}

export const store = {
  async get(key) {
    if (key in memCache) return memCache[key];
    const uid = await getUserId();
    if (uid) {
      const { data } = await supabase
        .from(TABLE)
        .select("value")
        .eq("user_id", uid)
        .eq("key", key)
        .maybeSingle();
      const val = data ? data.value : null;
      if (val !== null && val !== undefined) memCache[key] = val;
      return val ?? null;
    }
    const val = local.get(key);
    if (val !== null) memCache[key] = val;
    return val;
  },

  async set(key, val) {
    memCache[key] = val;
    const uid = await getUserId();
    if (uid) {
      await supabase
        .from(TABLE)
        .upsert(
          { user_id: uid, key, value: val, updated_at: new Date().toISOString() },
          { onConflict: "user_id,key" },
        );
      return;
    }
    local.set(key, val);
  },

  async delete(key) {
    delete memCache[key];
    const uid = await getUserId();
    if (uid) {
      await supabase.from(TABLE).delete().eq("user_id", uid).eq("key", key);
      return;
    }
    local.delete(key);
  },

  async list(prefix) {
    const uid = await getUserId();
    if (uid) {
      const { data } = await supabase
        .from(TABLE)
        .select("key")
        .eq("user_id", uid)
        .like("key", `${prefix}%`);
      return (data || []).map((r) => r.key);
    }
    return local.list(prefix);
  },
};

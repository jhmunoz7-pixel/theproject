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

// Aviso visible en la consola del navegador cuando corre sin Supabase —
// facilita detectar deploys a los que no les entraron las variables.
if (!supabase && typeof window !== "undefined") {
  console.warn(
    "The Project · Space: Supabase no está configurado (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY). Guardando solo en este navegador.",
  );
}

const TABLE = "user_kv";
const memCache = {};

let userIdPromise = null;
async function getUserId() {
  if (!supabase) return null;
  if (!userIdPromise) {
    // Solo sesiones existentes (con cuenta, o anónimas creadas antes).
    // Las cuentas nuevas se crean en la puerta de entrada de /espacio.
    userIdPromise = (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      return session?.user?.id ?? null;
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

// Tras iniciar/crear sesión cambia la usuaria: limpia cachés para
// que las siguientes lecturas vengan de SU cuenta.
function resetAuthCache() {
  userIdPromise = null;
  for (const k of Object.keys(memCache)) delete memCache[k];
}

// Usuario de auth actual (o null). user.is_anonymous distingue las
// cuentas de navegador de las cuentas con correo y contraseña.
export async function getAuthUser() {
  if (!supabase) return null;
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.user || null;
}

// A dónde debe volver el correo de confirmación: siempre al sitio desde
// el que se registró la usuaria. Sin esto manda al Site URL de Supabase,
// que suele quedar en http://localhost:3000 y deja a la usuaria en el aire.
function confirmRedirect() {
  if (typeof window === "undefined") return undefined;
  return `${window.location.origin}/espacio`;
}

// Mensaje claro para la usuaria. Prioriza el código de error de Supabase
// (estable) y cae al texto solo si no hay código.
function friendlyAuthError(error) {
  const code = error?.code || "";
  const msg = error?.message || "";

  const byCode = {
    user_already_exists: "Ese correo ya tiene un espacio. Usa “¿Ya tienes cuenta? Entra aquí”.",
    email_exists: "Ese correo ya tiene un espacio. Usa “¿Ya tienes cuenta? Entra aquí”.",
    invalid_credentials: "Correo o contraseña incorrectos. Revísalos e inténtalo de nuevo.",
    email_not_confirmed: "Falta confirmar tu correo. Busca el mensaje de The Project en tu bandeja (revisa spam).",
    weak_password: "Tu contraseña necesita al menos 6 caracteres.",
    over_email_send_rate_limit: "Ya se enviaron varios correos seguidos. Espera unos minutos e inténtalo otra vez.",
    over_request_rate_limit: "Muchos intentos seguidos — espera un minuto e inténtalo de nuevo.",
    signup_disabled: "El registro está pausado un momento. Intenta más tarde.",
    validation_failed: "Revisa que tu correo esté bien escrito.",
    email_address_invalid: "Ese correo no parece válido. Revísalo, porfa.",
  };
  if (byCode[code]) return byCode[code];

  if (/already (been )?registered|already exists/i.test(msg)) return byCode.user_already_exists;
  if (/invalid login credentials/i.test(msg)) return byCode.invalid_credentials;
  if (/email not confirmed/i.test(msg)) return byCode.email_not_confirmed;
  if (/password should be at least|weak password/i.test(msg)) return byCode.weak_password;
  // "For security purposes, you can only request this after N seconds"
  if (/for security purposes|only request this (once |)(after|every)/i.test(msg))
    return "Espera un minuto antes de volver a intentarlo — es una medida de seguridad.";
  if (/rate limit|too many/i.test(msg)) return byCode.over_request_rate_limit;
  if (/anonymous sign-ins are disabled/i.test(msg)) return byCode.signup_disabled;

  // Sin coincidencia: muestra el detalle para no dejarla a ciegas.
  return msg ? `No se pudo completar: ${msg}` : "No se pudo completar. Revisa tus datos e inténtalo de nuevo.";
}

// Crear cuenta con correo + contraseña. Si este navegador ya trae una
// sesión anónima con datos, la CONVIERTE en cuenta permanente para no
// perder nada. Devuelve { ok, error?, needsConfirm? }.
export async function signUpSpace({ name, email, password }) {
  if (!supabase) return { ok: true, localOnly: true };
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.user?.is_anonymous) {
      const { data, error } = await supabase.auth.updateUser(
        { email, password, data: { name } },
        { emailRedirectTo: confirmRedirect() },
      );
      if (!error) return { ok: true, converted: true, needsConfirm: Boolean(data?.user?.new_email) };
      // Si el correo ya existe u otro error, probamos el registro normal.
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      // El correo de confirmación debe volver a ESTE sitio, no al Site URL
      // configurado en Supabase (que puede apuntar a localhost).
      options: { data: { name }, emailRedirectTo: confirmRedirect() },
    });
    if (error) return { ok: false, error: friendlyAuthError(error) };
    if (!data.session) return { ok: true, needsConfirm: true };
    resetAuthCache();
    return { ok: true };
  } catch {
    return { ok: false, error: "No hay conexión ahorita. Inténtalo de nuevo." };
  }
}

// Entrar con correo + contraseña (desde cualquier equipo).
export async function signInSpace({ email, password }) {
  if (!supabase) return { ok: false, error: "El inicio de sesión aún no está disponible." };
  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { ok: false, error: friendlyAuthError(error) };
    resetAuthCache();
    return { ok: true };
  } catch {
    return { ok: false, error: "No hay conexión ahorita. Inténtalo de nuevo." };
  }
}

// Protege una cuenta anónima existente: le agrega correo + contraseña
// conservando todos sus datos (mismo usuario, mismo id).
export async function protectAccount({ email, password }) {
  if (!supabase) return { ok: false, error: "El inicio de sesión aún no está disponible." };
  try {
    const { data, error } = await supabase.auth.updateUser({ email, password });
    if (error) return { ok: false, error: friendlyAuthError(error) };
    return { ok: true, needsConfirm: Boolean(data?.user?.new_email) };
  } catch {
    return { ok: false, error: "No hay conexión ahorita. Inténtalo de nuevo." };
  }
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

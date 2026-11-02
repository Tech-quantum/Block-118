const KEY = "block118_session";
const listeners = new Set();
let mem = null;

const makeError = (code, status) =>
  Object.assign(new Error(code), { code, status });

export function getSession() {
  if (mem) return mem;
  try {
    mem = JSON.parse(localStorage.getItem(KEY));
  } catch (e) {
    mem = null;
  }
  return mem;
}

const publicUser = (s) => (s ? { email: s.email } : null);

function notify() {
  const u = publicUser(getSession());
  listeners.forEach((cb) => cb(u));
}

export function saveSession(s, announce = true) {
  mem = s;
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch (e) {}
  if (announce) notify();
}

export function clearSession() {
  mem = null;
  try {
    localStorage.removeItem(KEY);
  } catch (e) {}
  notify();
}

export function subscribe(cb) {
  listeners.add(cb);
  setTimeout(() => cb(publicUser(getSession())), 0);
  return () => listeners.delete(cb);
}

async function getIdToken() {
  const s = getSession();
  if (!s) throw makeError("not-signed-in", 401);
  if (Date.now() < s.expiresAt - 60000) return s.idToken;
  const r = await fetch("/api/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: s.refreshToken }),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    clearSession();
    throw makeError("session-expired", 401);
  }
  const next = {
    ...s,
    idToken: data.idToken,
    refreshToken: data.refreshToken || s.refreshToken,
    expiresAt: Date.now() + Number(data.expiresIn) * 1000,
  };
  saveSession(next, false);
  return next.idToken;
}

export async function fsRequest(method, path, body) {
  const token = await getIdToken();
  const r = await fetch("/api/fs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({ method, path, body }),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    const e = data.error || {};
    throw makeError(e.status || String(r.status), r.status);
  }
  return data;
}

export function toValue(v) {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === "string") return { stringValue: v };
  if (typeof v === "boolean") return { booleanValue: v };
  if (typeof v === "number") {
    return Number.isInteger(v)
      ? { integerValue: String(v) }
      : { doubleValue: v };
  }
  if (v instanceof Date) return { timestampValue: v.toISOString() };
  throw new Error("unsupported-value");
}

export function toFields(obj) {
  const f = {};
  Object.keys(obj).forEach((k) => {
    f[k] = toValue(obj[k]);
  });
  return f;
}

function fromValue(v) {
  if ("stringValue" in v) return v.stringValue;
  if ("integerValue" in v) return Number(v.integerValue);
  if ("doubleValue" in v) return v.doubleValue;
  if ("booleanValue" in v) return v.booleanValue;
  if ("nullValue" in v) return null;
  if ("timestampValue" in v) {
    const d = new Date(v.timestampValue);
    return { seconds: Math.floor(d.getTime() / 1000), toDate: () => d };
  }
  return null;
}

export function fromDoc(doc) {
  const out = { id: doc.name.split("/").pop() };
  Object.entries(doc.fields || {}).forEach(([k, v]) => {
    out[k] = fromValue(v);
  });
  return out;
    }

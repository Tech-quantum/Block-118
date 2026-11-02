import { saveSession, clearSession, subscribe } from "./api";

const fa = "۰۱۲۳۴۵۶۷۸۹";
const normalize = (s) =>
  s.trim().toLowerCase().replace(/[۰-۹]/g, (d) => fa.indexOf(d));

const toEmail = (username) => `${normalize(username)}@block118.app`;

export async function login(username, password) {
  const r = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: toEmail(username), password }),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    const err = new Error(data.error || "login-failed");
    err.code = data.error || "login-failed";
    throw err;
  }
  saveSession({
    idToken: data.idToken,
    refreshToken: data.refreshToken,
    email: data.email,
    expiresAt: Date.now() + Number(data.expiresIn) * 1000,
  });
}

export const logout = async () => clearSession();

export const watchAuth = (callback) => subscribe(callback);

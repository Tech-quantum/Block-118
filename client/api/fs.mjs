const PROJECT = "block-118-f2918";
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: { message: "method" } });
  }
  const ip =
    (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";
  if (rateLimited(ip)) {
    return res.status(429).json({ error: { message: "too-many-requests" } });
  }
  const auth = req.headers.authorization || "";
  if (!auth.startsWith("Bearer ")) {
    return res.status(401).json({ error: { message: "no-token" } });
  }
  const { method, path, body } = req.body || {};
  const okMethod = ["GET", "POST", "PATCH"].includes(method);
  if (typeof path !== "string") {
    return res.status(400).json({ error: { message: "bad-request" } });
  }
  const pathname = path.split("?")[0];
  const isUnits = /^\/documents\/units(\/[A-Za-z0-9_-]+)?$/.test(pathname);
  const isRequests = /^\/documents\/requests(\/[A-Za-z0-9_-]+)?$/.test(pathname);
  const isRunQuery = pathname === "/documents:runQuery";
  if (!okMethod || (!isUnits && !isRequests && !isRunQuery)) {
    return res.status(400).json({ error: { message: "bad-request" } });
  }
  if (isRunQuery) {
    const from =
      body &&
      body.structuredQuery &&
      body.structuredQuery.from &&
      body.structuredQuery.from[0] &&
      body.structuredQuery.from[0].collectionId;
    if (from !== "requests" && from !== "units") {
      return res.status(400).json({ error: { message: "bad-query" } });
    }
  }
  const serialized = JSON.stringify(body || {});
  if (serialized.length > 100000) {
    return res.status(413).json({ error: { message: "too-large" } });
  }
  try {
    const r = await fetch(BASE + path, {
      method,
      headers: { Authorization: auth, "Content-Type": "application/json" },
      body: method === "GET" ? undefined : serialized,
    });
    const text = await r.text();
    res.status(r.status);
    res.setHeader("Content-Type", "application/json");
    return res.send(text);
  } catch (e) {
    return res.status(502).json({ error: { message: "upstream-failed" } });
  }
}

const WINDOW = 60000;
const MAX = 60;
const attempts = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const arr = (attempts.get(ip) || []).filter((t) => now - t < WINDOW);
  if (arr.length >= MAX) return true;
  arr.push(now);
  attempts.set(ip, arr);
  if (attempts.size > 5000) {
    for (const [k, v] of attempts) {
      if (v.every((t) => now - t > WINDOW)) attempts.delete(k);
    }
  }
  return false;
}

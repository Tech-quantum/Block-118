const PROJECT = "block-118-f2918";
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: { message: "method" } });
  }
  const auth = req.headers.authorization || "";
  if (!auth.startsWith("Bearer ")) {
    return res.status(401).json({ error: { message: "no-token" } });
  }
  const { method, path, body } = req.body || {};
  const okMethod = ["GET", "POST", "PATCH"].includes(method);
  const okPath =
    typeof path === "string" &&
    !path.includes("..") &&
    (path.startsWith("/documents/") || path === "/documents:runQuery");
  if (!okMethod || !okPath) {
    return res.status(400).json({ error: { message: "bad-request" } });
  }
  try {
    const r = await fetch(BASE + path, {
      method,
      headers: { Authorization: auth, "Content-Type": "application/json" },
      body: method === "GET" ? undefined : JSON.stringify(body || {}),
    });
    const text = await r.text();
    res.status(r.status);
    res.setHeader("Content-Type", "application/json");
    return res.send(text);
  } catch (e) {
    return res.status(502).json({ error: { message: "upstream-failed" } });
  }
}

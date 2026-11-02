const API_KEY = process.env.FIREBASE_API_KEY;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: { message: "method" } });
  }
  if (!API_KEY) {
    return res.status(500).json({ error: { message: "server-misconfigured" } });
  }
  const ip =
    (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";
  if (rateLimited(ip)) {
    return res.status(429).json({ error: { message: "too-many-requests" } });
  }
  const { refreshToken } = req.body || {};
  if (typeof refreshToken !== "string" || !refreshToken || refreshToken.length > 2000) {
    return res.status(400).json({ error: { message: "bad-request" } });
  }
  try {
    const r = await fetch(
      "https://securetoken.googleapis.com/v1/token?key=" + API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body:
          "grant_type=refresh_token&refresh_token=" +
          encodeURIComponent(refreshToken),
      }
    );
    const data = await r.json();
    if (!r.ok) {
      return res.status(401).json({ error: { message: "refresh-failed" } });
    }
    return res.status(200).json({
      idToken: data.id_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    });
  } catch (e) {
    return res.status(502).json({ error: { message: "upstream-failed" } });
  }
}

const WINDOW = 60000;
const MAX = 30;
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

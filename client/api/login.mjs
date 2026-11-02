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

  const { email, password } = req.body || {};

  const okEmail =
    typeof email === "string" &&
    /^(admin|[0-9]{3})@block118\.app$/.test(email);
  const okPass =
    typeof password === "string" &&
    password.length >= 4 &&
    password.length <= 100;

  if (!okEmail || !okPass) {
    return res.status(400).json({ error: { message: "bad-request" } });
  }

  try {
    const r = await fetch(
      "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=" +
        API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, returnSecureToken: true }),
      }
    );
    const data = await r.json();
    if (!r.ok) {
      return res
        .status(401)
        .json({ error: { message: "invalid-credentials" } });
    }
    return res.status(200).json({
      idToken: data.idToken,
      refreshToken: data.refreshToken,
      expiresIn: data.expiresIn,
      email: data.email,
    });
  } catch (e) {
    return res.status(502).json({ error: { message: "upstream-failed" } });
  }
}

// rate limit ساده در حافظه (10 تلاش در 60 ثانیه به ازای IP)
const WINDOW = 60_000;
const MAX = 10;
const attempts = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const arr = (attempts.get(ip) || []).filter((t) => now - t < WINDOW);
  if (arr.length >= MAX) return true;
  arr.push(now);
  attempts.set(ip, arr);
  // پاک‌سازی خودکار برای جلوگیری از رشد حافظه
  if (attempts.size > 5000) {
    for (const [k, v] of attempts) {
      if (v.every((t) => now - t > WINDOW)) attempts.delete(k);
    }
  }
  return false;
}

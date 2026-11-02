const API_KEY =
  process.env.FIREBASE_API_KEY || "AIzaSyDwojnNPEpQKADXEXLNI4avDdtDlu9s5qw";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method" });
  }
  const { email, password } = req.body || {};
  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !email.endsWith("@block118.app")
  ) {
    return res.status(400).json({ error: "bad-request" });
  }
  try {
    const r = await fetch(
      "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=" +
        API_KEY,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Referer: "https://block-118.vercel.app/",
        },
        body: JSON.stringify({ email, password, returnSecureToken: true }),
      }
    );
    const data = await r.json();
    if (!r.ok) {
      return res
        .status(401)
        .json({ error: (data.error && data.error.message) || "auth-error" });
    }
    return res.status(200).json({
      idToken: data.idToken,
      refreshToken: data.refreshToken,
      expiresIn: data.expiresIn,
      email: data.email,
    });
  } catch (e) {
    return res.status(502).json({ error: "upstream-failed" });
  }
}

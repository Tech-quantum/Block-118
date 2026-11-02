const API_KEY =
  process.env.FIREBASE_API_KEY || "AIzaSyDwojnNPEpQKADXEXLNI4avDdtDlu9s5qw";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method" });
  }
  const { refreshToken } = req.body || {};
  if (typeof refreshToken !== "string" || !refreshToken) {
    return res.status(400).json({ error: "bad-request" });
  }
  try {
    const r = await fetch(
      "https://securetoken.googleapis.com/v1/token?key=" + API_KEY,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Referer: "https://block-118.vercel.app/",
        },
        body:
          "grant_type=refresh_token&refresh_token=" +
          encodeURIComponent(refreshToken),
      }
    );
    const data = await r.json();
    if (!r.ok) {
      return res.status(401).json({ error: "refresh-failed" });
    }
    return res.status(200).json({
      idToken: data.id_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    });
  } catch (e) {
    return res.status(502).json({ error: "upstream-failed" });
  }
}

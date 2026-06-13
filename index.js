const functions = require("firebase-functions");
const fetch = require("node-fetch");

// reCAPTCHA v3 Secret Key (server-side only, never expose to client)
const RECAPTCHA_SECRET_KEY = "6Lc2JB0tAAAAAD0yWgE-Atn4Q12PtjkcvL-GF5O4";

exports.verifyRecaptcha = functions.https.onRequest(async (req, res) => {
  // CORS
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ success: false, error: "Method Not Allowed" });
    return;
  }

  const token = req.body && req.body.token;
  if (!token) {
    res.status(400).json({ success: false, error: "Token missing" });
    return;
  }

  try {
    const params = new URLSearchParams();
    params.append("secret", RECAPTCHA_SECRET_KEY);
    params.append("response", token);

    const verifyRes = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    });

    const data = await verifyRes.json();
    // data: { success: true/false, score: 0.0-1.0, action: 'submit', ... }

    res.status(200).json({
      success: !!data.success,
      score: data.score,
      action: data.action,
    });
  } catch (err) {
    console.error("reCAPTCHA verify error:", err);
    res.status(500).json({ success: false, error: "Verification failed" });
  }
});

// Trixon — secure AI proxy
// This runs on Vercel's servers (NOT in the browser), so your API key stays hidden.
// The browser calls /api/suggest; this function adds the secret key and calls Claude.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Server is missing the Anthropic API key." });
  }

  try {
    const { inventory } = req.body || {};
    const list = Array.isArray(inventory) ? inventory.join(", ") : String(inventory || "");

    const prompt = `I have these items in my home bar: ${list}.

Suggest 6 cocktails I could make with these (and common basics like ice, citrus, sugar, water).
Only suggest drinks where I plausibly have the main spirits/mixers.
Respond ONLY with a JSON array, no other text, in this exact format:
[{"name":"Drink Name","tagline":"short enticing one-line description","ingredients":["1.5 oz X","0.75 oz Y"],"build":"one or two sentences on how to make it"}]`;

    const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1500,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!aiRes.ok) {
      const detail = await aiRes.text();
      return res.status(aiRes.status).json({ error: "AI request failed", detail });
    }

    const data = await aiRes.json();
    const text = (data.content || [])
      .map((c) => (c.type === "text" ? c.text : ""))
      .join("")
      .replace(/```json|```/g, "")
      .trim();

    let suggestions;
    try {
      suggestions = JSON.parse(text);
    } catch {
      const m = text.match(/\[[\s\S]*\]/);
      suggestions = m ? JSON.parse(m[0]) : [];
    }

    return res.status(200).json({ suggestions });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Unexpected server error" });
  }
}

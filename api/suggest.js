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
    const { inventory, focus } = req.body || {};
    const list = Array.isArray(inventory) ? inventory.join(", ") : String(inventory || "");
    const focusText = (focus || "").toString().trim();

    let instruction;
    if (focusText) {
      instruction = `The host specifically wants: "${focusText}". This is the MOST IMPORTANT requirement — every single one of the 6 suggestions must directly match this request. If they ask for margaritas, suggest 6 margarita variations. If they ask for summer drinks, every drink must be summery. Do not drift to unrelated cocktails. Use my stock where possible, and you may assume common basics (ice, citrus, sugar, simple syrup, salt). If a key ingredient for the theme is missing, still suggest the themed drink and note it.`;
    } else {
      instruction = `Suggest 6 cocktails I could make. Prioritize variety: mix well-known classics with a couple of creative or lesser-known options that genuinely fit my stock. Only suggest drinks where I plausibly have the main spirits and modifiers.`;
    }

    const prompt = `I have these items in my home bar: ${list}.

You are an expert bar manager and creative mixologist. ${instruction}
Respond ONLY with a valid, complete JSON array and nothing else — no preamble, no trailing text. Keep each "build" to one short sentence so the response isn't too long. Format:
[{"name":"Drink Name","tagline":"short enticing one-line description","ingredients":["1.5 oz X","0.75 oz Y"],"build":"one short sentence"}]`;

    const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 2500,
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

    const suggestions = robustParse(text);

    return res.status(200).json({ suggestions });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Unexpected server error" });
  }
}

// Parse a JSON array even if slightly malformed or truncated.
function robustParse(text) {
  try { return JSON.parse(text); } catch {}
  const start = text.indexOf("[");
  if (start === -1) return [];
  let slice = text.slice(start);
  try { return JSON.parse(slice); } catch {}
  let cleaned = slice.replace(/,\s*([}\]])/g, "$1");
  try { return JSON.parse(cleaned); } catch {}
  const objs = [];
  let depth = 0, objStart = -1, inStr = false, esc = false;
  for (let i = 0; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (esc) { esc = false; continue; }
    if (ch === "\\") { esc = true; continue; }
    if (ch === '"') inStr = !inStr;
    if (inStr) continue;
    if (ch === "{") { if (depth === 0) objStart = i; depth++; }
    else if (ch === "}") {
      depth--;
      if (depth === 0 && objStart !== -1) {
        try { objs.push(JSON.parse(cleaned.slice(objStart, i + 1))); } catch {}
        objStart = -1;
      }
    }
  }
  return objs;
}

// Trixon — Ninja Slushi AI helper (secure proxy)
// Two modes:
//   mode: "estimate"  -> estimate sugar (g/oz) and ABV (%) for given ingredients
//   mode: "suggest"   -> suggest Slushi-ready frozen drinks from inventory
// Key stays server-side via ANTHROPIC_API_KEY in Vercel.

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "Server is missing the Anthropic API key." });

  const { mode, ingredients, inventory } = req.body || {};

  let prompt;
  if (mode === "estimate") {
    const list = (ingredients || []).map((i) => `${i.amount || "?"} oz ${i.name}`).join("; ");
    prompt = `For a frozen drink machine, estimate sugar content and alcohol for each ingredient.
Ingredients: ${list}.
For each, return grams of sugar per fluid ounce ("sugarPerOz") and alcohol by volume percent ("abv", 0 if non-alcoholic).
Respond ONLY with a JSON array, no other text:
[{"name":"exact ingredient name","sugarPerOz":number,"abv":number}]`;
  } else {
    const list = Array.isArray(inventory) ? inventory.join(", ") : String(inventory || "");
    prompt = `I have these items in my bar: ${list}.
You are a frozen-drink expert. Suggest 6 cocktails/mocktails that work in a Ninja Slushi frozen drink machine using my items (plus basics like sugar, simple syrup, citrus, juice).
CRITICAL machine rules: the mix must be at least 4% sugar to freeze, and spiked drinks should land roughly 2.8%-16% ABV. Favor drinks that naturally meet these.
For each ingredient include an estimated amount in oz, grams of sugar per oz, and abv percent.
Respond ONLY with a JSON array, no other text:
[{"name":"Drink Name","tagline":"short description","ingredients":[{"name":"X","amount":2,"sugarPerOz":1.5,"abv":40}],"build":"how to make it in the Slushi"}]`;
  }

  try {
    const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 3000,
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

    const parsed = robustParse(text);

    if (mode === "estimate") return res.status(200).json({ estimates: parsed });
    return res.status(200).json({ suggestions: parsed });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Unexpected server error" });
  }
}

// Parse a JSON array even if it's slightly malformed or truncated.
function robustParse(text) {
  // 1) straight parse
  try { return JSON.parse(text); } catch {}
  // 2) grab the outermost [ ... ]
  const start = text.indexOf("[");
  if (start === -1) return [];
  let slice = text.slice(start);
  // 3) try trimming to last complete object and closing the array
  try { return JSON.parse(slice); } catch {}
  // remove trailing commas before } or ]
  let cleaned = slice.replace(/,\s*([}\]])/g, "$1");
  try { return JSON.parse(cleaned); } catch {}
  // 4) salvage: collect complete top-level {...} objects
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
        const piece = cleaned.slice(objStart, i + 1);
        try { objs.push(JSON.parse(piece)); } catch {}
        objStart = -1;
      }
    }
  }
  return objs;
}

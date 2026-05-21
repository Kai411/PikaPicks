// Calls Gemini to read the visible card name + set number off a photo of
// a Pokemon TCG card. The browser sends the image as base64; we forward
// it to Gemini with a strict JSON response schema and return { name,
// number } back. Handles non-English cards by translating the name to its
// canonical English form (the Pokemon TCG API is only indexed in
// English). The actual card lookup happens client-side against
// api.pokemontcg.io using those two fields.

const MODEL = "gemini-3.1-flash-lite";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const PROMPT = `You are reading a single Pokemon TCG card from the image.

The card may be from any region: English, Japanese, Korean, Chinese, German, French, Italian, Spanish, Portuguese. If the printed name is NOT in English, translate it to the canonical English Pokemon name (e.g. リザードン → "Charizard", カイリュー → "Dragonite", ピカチュウ → "Pikachu", 한카리아스 → "Garchomp"). The Pokemon TCG API is only indexed in English, so always return the English name. Keep suffixes like "ex", "V", "VMAX", "GX" if they appear on the card.

The card may be rotated, tilted, partially obscured by a hand or sleeve, or have holo/glare reflections. Mentally rotate the image as needed and look past glare to read the printed text.

Return ONLY a JSON object with three fields:
- "name": the card's English Pokemon name (e.g. "Charizard ex", "Tyranitar", "Chansey", "Pikachu VMAX"). Even if the printed text is in another language, return the English name. Use the main name only — no HP, attack text, or trainer card descriptors.
- "number": the set number printed near the bottom corner, formatted exactly as "N/Total" (e.g. "20/189", "187/167", "222/193"). Japanese cards use the same format (often "001/100"). Strip any leading zeros from N — write "20" not "020".
- "language": the language of the printed text on the card as a 2-letter ISO code. One of: "EN" (English), "JP" (Japanese), "KR" (Korean), "CN" (Chinese, simplified or traditional), "DE" (German), "FR" (French), "IT" (Italian), "ES" (Spanish), "PT" (Portuguese). Default to "EN" if uncertain.

If you genuinely cannot read a field, use null for that field. Do not guess.`;

interface RequestBody {
  imageBase64?: string;
  mimeType?: string;
}

export default defineEventHandler(async (event) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw createError({
      statusCode: 500,
      message: "GEMINI_API_KEY is not set on the server.",
    });
  }

  const body = await readBody<RequestBody>(event);
  if (!body?.imageBase64) {
    throw createError({ statusCode: 400, message: "imageBase64 is required." });
  }

  const requestBody = {
    contents: [
      {
        parts: [
          { text: PROMPT },
          {
            inline_data: {
              mime_type: body.mimeType || "image/jpeg",
              data: body.imageBase64,
            },
          },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          name: { type: "string", nullable: true },
          number: { type: "string", nullable: true },
          language: { type: "string", nullable: true },
        },
        required: ["name", "number", "language"],
      },
      temperature: 0,
    },
  };

  const res = await fetch(`${ENDPOINT}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    console.error(`[identify-card] Gemini ${res.status}:`, errText.slice(0, 500));
    throw createError({
      statusCode: 502,
      message: `Gemini error (${res.status}): ${errText.slice(0, 200)}`,
    });
  }

  const json: any = await res.json();
  const text: string =
    json?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
  console.log("[identify-card] raw response:", text);

  let parsed: {
    name?: string | null;
    number?: string | null;
    language?: string | null;
  } = {};
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = {};
  }

  // Defensive: strip leading zeros from number if the model didn't.
  let number = parsed.number || "";
  const m = number.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (m) number = `${m[1].replace(/^0+/, "") || "0"}/${m[2]}`;

  // Normalize language: uppercase, fall back to EN if missing or unknown.
  const ALLOWED = ["EN", "JP", "KR", "CN", "DE", "FR", "IT", "ES", "PT"];
  const lang = (parsed.language || "").toUpperCase().trim();
  const language = ALLOWED.includes(lang) ? lang : "EN";

  return {
    name: (parsed.name || "").trim(),
    number,
    language,
  };
});

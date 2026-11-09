import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

const MODEL = "openai/gpt-6-astra";

async function askJson(prompt: string): Promise<unknown | null> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) return null;
  const openai = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey: key,
    headers: { "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
  });
  try {
    const result = streamText({
      model: openai.responses(MODEL),
      prompt,
      providerOptions: { openai: { forceReasoning: true, reasoningEffort: "low", reasoningSummary: "auto", store: false, include: ["reasoning.encrypted_content"] } },
    });
    const text = await result.text;
    const m = text.match(/\{[\s\S]*\}/);
    return m ? JSON.parse(m[0]) : null;
  } catch (e) {
    console.error("AI call failed", e);
    return null;
  }
}

export async function refinePreferences(input: object, base: object): Promise<Record<string, unknown> | null> {
  const r = await askJson(`You turn a coffee app check-in into JSON preferences.
Answers + onboarding profile + current local time: ${JSON.stringify(input)}
Rule-based baseline: ${JSON.stringify(base)}
Rules: low battery -> higher caffeine (unless caffeine-sensitive; after 3 PM favor half-caf "light"). "work" -> needs_wifi, needs_outlets, noise quiet. "catchup" -> seating, noise moderate. "grab" -> fast service. The free-text note OVERRIDES when it conflicts (e.g. "iced", "decaf", "somewhere lively", "close by").
Return ONLY JSON with exactly these keys: {"purpose":"grab|work|catchup|treat","duration":"1h|2-3h|allday"|null,"energy":"low|medium|high","mood":"cozy|refreshing|indulgent|clean","social_battery":0-100,"temperature":"hot|iced","flavor_tags":[strings],"caffeine_level":"decaf|light|regular|high","noise":"quiet|moderate|lively","needs_outlets":bool,"needs_wifi":bool,"drink":string|null,"budget":1-4,"radius_minutes":number}`);
  return (r as Record<string, unknown>) ?? null;
}

export interface CardAi { cafeId: string; heroDrink: string; heroLine: string; why: string }

export async function writeCardCopy(
  checkin: object,
  cafes: { cafeId: string; name: string; tags: string[]; drinks: string[]; reviews: string[] }[],
): Promise<CardAi[] | null> {
  const r = await askJson(`Today's check-in: ${JSON.stringify(checkin)}.
Cafés: ${JSON.stringify(cafes)}.
For EACH café pick one hero drink ONLY from its "drinks" list (never invent), phrase heroLine as a suggestion like "Locals love the cortado", and write "why" (max 20 words) referencing today's answers.
Return ONLY JSON: {"cards":[{"cafeId","heroDrink","heroLine","why"}]}`);
  const cards = (r as { cards?: CardAi[] } | null)?.cards;
  return Array.isArray(cards) ? cards : null;
}

export type ChatMsg = { role: "user" | "assistant"; content: string };
/** Café "barista" chat after a match. Only suggests drinks from the café's menu. */
export async function baristaReply(cafe: { name: string; neighborhood: string; drinks: { name: string; temp: string; tags: string[] }[]; tags: string[]; reviewSnippets: string[] }, matchedDrink: string, profile: object, messages: ChatMsg[]): Promise<string> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("AI is not configured.");
  const openai = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey: key,
    headers: { "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
  });
  const menu = cafe.drinks.map((d) => `- ${d.name} (${d.temp}; ${d.tags.join(", ")})`).join("\n");
  const result = streamText({
    model: openai.responses(MODEL),
    system: `You are the friendly barista at ${cafe.name} in ${cafe.neighborhood}, chatting with a customer who just matched with your café on a dating-style coffee app called Coffee Chemistry. Be warm, playful, short (2-4 sentences), with a light dating-app wink.
Help them choose a drink, customize it (milk, size, hot/iced, sweetness), or hear their feedback about what they ordered. Only recommend drinks from this menu; customizations are fine:
${menu}
Café vibe: ${cafe.tags.join(", ")}. What reviewers say: ${cafe.reviewSnippets.join(" / ")}.
The app suggested: ${matchedDrink}. Customer's taste profile: ${JSON.stringify(profile)}.
If they share feedback about a visit, thank them and say you've passed it to the team. Never invent prices, hours or items not listed.`,
    messages,
    providerOptions: { openai: { forceReasoning: true, reasoningEffort: "low", reasoningSummary: "auto", store: false, include: ["reasoning.encrypted_content"] } },
  });
  return (await result.text).trim();
}

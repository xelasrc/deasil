import Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// How far back to look when banning a story's underlying event from
// reappearing under a different entity (see STORY_EXCLUSION_DAYS below).
const STORY_EXCLUSION_DAYS = 14;
const ANSWER_EXCLUSION_DAYS = 180;

// New Zealand switches between NZST (UTC+12) and NZDT (UTC+13) — a fixed
// offset drifts by an hour for half the year. Use the IANA tz database via
// Intl so DST transitions are handled correctly.
export function nzDateString(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Pacific/Auckland",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function addDays(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split("T")[0];
}

type StoredPuzzle = { answer: string; event?: string };

function readRecentPuzzles(referenceDate: string, days: number): StoredPuzzle[] {
  const puzzles: StoredPuzzle[] = [];

  for (let i = 1; i <= days; i++) {
    const dateStr = addDays(referenceDate, -i);
    const filePath = path.join(process.cwd(), "puzzles", `${dateStr}.json`);

    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      puzzles.push(...data.puzzles);
    }
  }

  return puzzles;
}

// Answers already used as a puzzle answer in the last ~6 months — a hard,
// literal-text ban so the exact same answer word doesn't recur.
export function getRecentAnswers(referenceDate: string, days = ANSWER_EXCLUSION_DAYS): string[] {
  return readRecentPuzzles(referenceDate, days).map((p) => p.answer);
}

// Underlying stories used in the last couple of weeks — a broader,
// story-level ban. This is what stops "Person A" being the answer on
// Monday and "Person B" (same lawsuit/conflict/event) being the answer on
// Wednesday: the literal answer text differs, but the story doesn't.
export function getRecentEvents(referenceDate: string, days = STORY_EXCLUSION_DAYS): string[] {
  return readRecentPuzzles(referenceDate, days)
    .map((p) => p.event)
    .filter((e): e is string => !!e);
}

const STOPWORDS = new Set([
  "the", "a", "an", "of", "in", "on", "at", "to", "for", "and", "or", "with",
  "after", "over", "amid", "as", "its", "his", "her", "their", "new", "vs", "v",
  "into", "from", "by", "is", "are", "was", "were", "this", "that",
]);

function significantTokens(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((t) => t.length > 2 && !STOPWORDS.has(t))
  );
}

// Cheap keyword-overlap heuristic used as an automated backstop for the
// "same story, different entity" rule — catches egregious repeats even if
// the model's own compliance with the prompt instruction slips.
export function isLikelyRepeatEvent(candidate: string, others: string[], threshold = 0.6): string | null {
  const candidateTokens = significantTokens(candidate);
  if (candidateTokens.size === 0) return null;

  for (const other of others) {
    const otherTokens = significantTokens(other);
    if (otherTokens.size === 0) continue;

    const shared = [...candidateTokens].filter((t) => otherTokens.has(t)).length;
    const overlap = shared / Math.min(candidateTokens.size, otherTokens.size);

    if (overlap >= threshold) return other;
  }

  return null;
}

// Deterministic per-date PRNG so re-running generation for the same date
// (e.g. via the backfill script) reproduces the same "shape", while
// different dates land on genuinely different shapes.
function seededRandom(seed: string): () => number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822519);
    h = Math.imul(h ^ (h >>> 13), 3266489917);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

function pick<T>(rand: () => number, arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

export type DayShape = {
  sportCap: number;
  usDomesticCap: number;
  emphasis: string;
};

// Rather than every day chasing the same fixed "1-2 sport, 2-3 US" ratio
// (which makes consecutive days feel structurally identical even when the
// headlines differ), vary the day's composition target deterministically
// by date.
export function dayShapeFor(date: string): DayShape {
  const rand = seededRandom(date);

  const sportCap = pick(rand, [0, 0, 1, 1, 2]);
  const usDomesticCap = pick(rand, [1, 2, 2, 3]);
  const emphasis = pick(rand, [
    "Lean toward people (politicians, executives, athletes, cultural figures) as answers today.",
    "Lean toward places and organisations (cities, countries, companies, institutions) as answers today.",
    "Lean toward events and trends (conflicts, elections, product launches, cultural moments) as answers today.",
    "Aim for an even mix across people, places, organisations, and events today.",
  ]);

  return { sportCap, usDomesticCap, emphasis };
}

export async function fetchNews(recentAnswers: string[]): Promise<{
  headlines: string;
  urlMap: Record<string, string>;
  imageMap: Record<string, string>;
}> {
  const url = `https://newsapi.org/v2/top-headlines?language=en&pageSize=100&apiKey=${process.env.NEWS_API_KEY}`;
  const res = await fetch(url);
  const data = (await res.json()) as {
    articles: {
      title: string;
      description: string;
      source: { name: string };
      url: string;
      urlToImage: string | null;
    }[];
  };

  const recentLower = recentAnswers.map((a) => a.toLowerCase());
  const urlMap: Record<string, string> = {};
  const imageMap: Record<string, string> = {};

  const headlines = data.articles
    .filter((a) => {
      if (!a.title || !a.description) return false;
      const text = `${a.title} ${a.description}`.toLowerCase();
      return !recentLower.some((answer) => text.includes(answer.toLowerCase()));
    })
    .map((a, i) => {
      const id = `article_${i}`;
      urlMap[id] = a.url;
      imageMap[id] = a.urlToImage ?? "";
      return `[${id}] ${a.title}: ${a.description} (${a.source.name})`;
    })
    .join("\n");

  return { headlines, urlMap, imageMap };
}

// Claude is told to return ONLY JSON, but under a large, crowded prompt
// (long exclusion lists) it can still wrap the object in a stray sentence
// of commentary despite that instruction. Slice out the outermost {...}
// rather than assuming the whole cleaned response is valid JSON on its own.
function extractJsonObject(text: string): string {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");

  if (start === -1 || end === -1 || end < start) {
    throw new Error("No JSON object found in model response");
  }

  return text.slice(start, end + 1);
}

export async function generatePuzzle(
  headlines: string,
  date: string,
  recentAnswers: string[],
  recentEvents: string[],
  urlMap: Record<string, string>,
  imageMap: Record<string, string>,
  dayShape: DayShape
) {
  const answerExclusion = recentAnswers.length > 0
    ? `\nCRITICAL: You MUST NOT use any of the following as an answer. This is a hard rule — if a topic appears in this list, skip it entirely and pick something else:\n${recentAnswers.map((a) => `- ${a}`).join("\n")}\n`
    : "";

  const eventExclusion = recentEvents.length > 0
    ? `\nCRITICAL: The following underlying news stories were already used as a puzzle answer in the last ${STORY_EXCLUSION_DAYS} days. Do NOT use any of them again — including by picking a *different* person, place, or organisation tied to the same story. Example: if "Israel-Hamas ceasefire negotiations" was already used, neither a negotiator's name nor a different figure from that same negotiation may be used again either. The story is banned, not just the specific answer word:\n${recentEvents.map((e) => `- ${e}`).join("\n")}\n`
    : "";

  const prompt = `You are generating puzzles for Deasil, a daily news guessing game similar to Wordle.

Today's date is ${date}.
${answerExclusion}${eventExclusion}
Here are today's top news headlines (each has an article ID):
${headlines}

Your task:
1. Pick 10 diverse, interesting, globally relevant topics from these headlines, balanced like this:
   - Vary the answer type: mix people, places, events, organisations, companies, and trends.
   - ${dayShape.emphasis}
   - At most ${dayShape.sportCap} of the 10 should be sport, and at most ${dayShape.usDomesticCap} should be US-domestic stories. Actively look for stories relevant to Europe, Asia, Africa, Latin America, the Middle East, and Oceania — the set should feel genuinely global, not dominated by American politics and sport.
   - Make each of the 10 feel distinct from the others — don't pick multiple topics driven by the same underlying story or news cycle (e.g. not both "Iran" and "Strait of Hormuz" if both stem from the same conflict, and not two different people who are both newsmakers in the same court case, election, or conflict).
   - Prefer topics that a global English-speaking audience would know.
2. Answers must be proper nouns - names of people, places, organisations, events, or things. NEVER use a date (e.g. "January 6") as an answer — instead use the event name (e.g. "Capitol riot" or "January 6 Capitol Attack").
3. For each topic, generate 6-10 category-style clue tags (like Wikipedia categories).
4. Remove any clue tag that contains a word from the answer — no giveaways.
5. Clues should be broad enough to be challenging but fair.
6. Write a 1-3 sentence summary explaining why this topic is in the news right now.
7. For sourceUrl, use the article ID (e.g. "article_3") from the headlines list that is most relevant to the topic.
8. For each topic, also write an "event" field: a short (4-10 word) descriptor of the underlying news story that would stay the same no matter which specific person, place, or organisation involved you picked as the answer (e.g. "OpenAI board leadership dispute", "2026 Wimbledon men's singles final", "Venezuela contested election crisis"). Two topics about different entities from the same underlying story must use the same "event" text — this is how repeats across different days get caught, so be precise and consistent rather than vague.

Return ONLY a valid JSON object in this exact format, no markdown, no explanation:
{
  "date": "${date}",
  "puzzles": [
    {
      "id": 1,
      "answer": "Answer Here",
      "acceptedAnswers": ["Answer Here", "Alternative"],
      "clues": ["clue one", "clue two", "clue three", "clue four", "clue five", "clue six"],
      "summary": "One or two sentences about why this is in the news.",
      "sourceUrl": "article_0",
      "difficulty": "medium",
      "region": "global",
      "event": "Short underlying-story descriptor here"
    }
  ]
}`;

  const message = await anthropic.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 4000,
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  const clean = text.replace(/```json|```/g, "").trim();
  const result = JSON.parse(extractJsonObject(clean));

  result.puzzles = result.puzzles.map((p: { sourceUrl: string }) => ({
    ...p,
    imageUrl: imageMap[p.sourceUrl] ?? "",
    sourceUrl: urlMap[p.sourceUrl] ?? p.sourceUrl,
  }));

  return result;
}

function findSameDayEventClashes(puzzles: { event?: string }[]): Array<[string, string]> {
  const clashes: Array<[string, string]> = [];

  for (let i = 0; i < puzzles.length; i++) {
    for (let j = i + 1; j < puzzles.length; j++) {
      const a = puzzles[i].event;
      const b = puzzles[j].event;
      if (a && b && isLikelyRepeatEvent(a, [b])) clashes.push([a, b]);
    }
  }

  return clashes;
}

export async function generatePuzzleWithRetry(
  headlines: string,
  date: string,
  recentAnswers: string[],
  recentEvents: string[],
  urlMap: Record<string, string>,
  imageMap: Record<string, string>,
  dayShape: DayShape,
  retries = 5
): Promise<any> {
  const recentAnswersLower = recentAnswers.map((a) => a.toLowerCase());

  for (let i = 0; i < retries; i++) {
    try {
      const puzzle = await generatePuzzle(headlines, date, recentAnswers, recentEvents, urlMap, imageMap, dayShape);

      const answerRepeats = puzzle.puzzles.filter((p: { answer: string }) =>
        recentAnswersLower.includes(p.answer.toLowerCase())
      );

      const eventRepeats = puzzle.puzzles.filter(
        (p: { event?: string }) => p.event && isLikelyRepeatEvent(p.event, recentEvents)
      );

      const sameDayClashes = findSameDayEventClashes(puzzle.puzzles);

      if (answerRepeats.length > 0 || eventRepeats.length > 0 || sameDayClashes.length > 0) {
        console.log(
          `Rejecting generation: ${answerRepeats.length} literal answer repeats, ` +
          `${eventRepeats.length} same-story repeats vs recent days, ` +
          `${sameDayClashes.length} same-story clashes within today's set. Retrying...`
        );
        continue;
      }

      return puzzle;
    } catch (err: unknown) {
      const isLastAttempt = i === retries - 1;
      if (isLastAttempt) throw err;

      const isOverloaded = err instanceof Error && err.message.includes("529");
      if (isOverloaded) {
        const wait = (i + 1) * 10000;
        console.log(`API overloaded, retrying in ${wait / 1000}s... (attempt ${i + 2}/${retries})`);
        await new Promise((res) => setTimeout(res, wait));
      } else {
        // Malformed JSON, unexpected response shape, etc. — usually a
        // one-off slip, not worth a backoff delay, just try again.
        console.log(`Generation attempt ${i + 1} failed: ${err instanceof Error ? err.message : err}. Retrying...`);
      }
    }
  }
  throw new Error("Failed to generate puzzle without repeats after max retries");
}

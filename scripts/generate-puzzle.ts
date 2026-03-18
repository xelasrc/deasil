import Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function fetchNews(): Promise<string> {
  const url = `https://newsapi.org/v2/top-headlines?language=en&pageSize=50&apiKey=${process.env.NEWS_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json() as { articles: { title: string; description: string; source: { name: string } }[] };

  return data.articles
    .filter((a) => a.title && a.description)
    .map((a) => `- ${a.title}: ${a.description} (${a.source.name})`)
    .join("\n");
}

async function generatePuzzle(headlines: string, date: string) {
  const prompt = `You are generating puzzles for Deasil, a daily news guessing game similar to Wordle.

Today's date is ${date}.

Here are today's top news headlines:
${headlines}

Your task:
1. Pick 10 diverse, interesting, globally relevant topics from these headlines. Mix people, places, events, companies, and trends. Prefer topics that a global English-speaking audience would know.
2. For each topic, generate 6-8 category-style clue tags (like Wikipedia categories).
3. Remove any clue tag that contains a word from the answer — no giveaways.
4. Clues should be broad enough to be challenging but fair.
5. Write a 1-2 sentence summary explaining why this topic is in the news right now.

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
      "sourceUrl": "https://example.com",
      "difficulty": "medium",
      "region": "global"
    }
  ]
}`;

  const message = await anthropic.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 4000,
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";

  // Strip any accidental markdown fences
  const clean = text.replace(/```json|```/g, "").trim();

  return JSON.parse(clean);
}

async function main() {
  const date = new Date().toISOString().split("T")[0];
  const outputPath = path.join(process.cwd(), "puzzles", `${date}.json`);

  // Don't regenerate if already exists
  if (fs.existsSync(outputPath)) {
    console.log(`✓ Puzzle for ${date} already exists, skipping.`);
    return;
  }

  console.log(`Fetching news for ${date}...`);
  const headlines = await fetchNews();

  console.log("Generating puzzle with Claude...");
  const puzzle = await generatePuzzle(headlines, date);

  // Validate we got 10 puzzles
  if (!puzzle.puzzles || puzzle.puzzles.length !== 10) {
    throw new Error(`Expected 10 puzzles, got ${puzzle.puzzles?.length ?? 0}`);
  }

  fs.writeFileSync(outputPath, JSON.stringify(puzzle, null, 2));
  console.log(`✓ Puzzle saved to puzzles/${date}.json`);
  console.log(`Topics: ${puzzle.puzzles.map((p: { answer: string }) => p.answer).join(", ")}`);
}

main().catch((err) => {
  console.error("Generation failed:", err);
  process.exit(1);
});
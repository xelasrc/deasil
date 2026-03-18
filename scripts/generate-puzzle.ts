import Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function fetchNews(recentAnswers: string[]): Promise<string> {
  const url = `https://newsapi.org/v2/top-headlines?language=en&pageSize=100&apiKey=${process.env.NEWS_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json() as { articles: { title: string; description: string; source: { name: string } }[] };

  const recentLower = recentAnswers.map(a => a.toLowerCase());

  return data.articles
    .filter((a) => {
      if (!a.title || !a.description) return false;
      const text = `${a.title} ${a.description}`.toLowerCase();
      // Remove articles that mention any recent answer
      return !recentLower.some(answer => text.includes(answer.toLowerCase()));
    })
    .map((a) => `- ${a.title}: ${a.description} (${a.source.name})`)
    .join("\n");
} 

async function generatePuzzle(headlines: string, date: string, recentAnswers: string[]) {
  const exclusionList = recentAnswers.length > 0
    ? `\nDo NOT use any of these topics that have been used in the past month:\n${recentAnswers.map(a => `- ${a}`).join("\n")}\n`
    : "";

  const prompt = `You are generating puzzles for Deasil, a daily news guessing game similar to Wordle.

Today's date is ${date}.
${exclusionList}
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
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

async function generatePuzzleWithRetry(headlines: string, date: string, recentAnswers: string[], retries = 3): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      return await generatePuzzle(headlines, date, recentAnswers);
    } catch (err: unknown) {
      const isOverloaded = err instanceof Error && err.message.includes("529");
      if (isOverloaded && i < retries - 1) {
        const wait = (i + 1) * 10000;
        console.log(`API overloaded, retrying in ${wait / 1000}s... (attempt ${i + 2}/${retries})`);
        await new Promise((res) => setTimeout(res, wait));
      } else {
        throw err;
      }
    }
  }
}

function getRecentAnswers(): string[] {
  const answers: string[] = [];
  const nztOffset = 13 * 60;
  const now = new Date();
  const today = new Date(now.getTime() + nztOffset * 60 * 1000);

  for (let i = 1; i <= 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const filePath = path.join(process.cwd(), "puzzles", `${dateStr}.json`);

    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      data.puzzles.forEach((p: { answer: string }) => answers.push(p.answer));
    }
  }

  console.log(answers)
  return answers;
}

async function main() {
  const nztOffset = 13 * 60; // UTC+13 in minutes
  const now = new Date();
  const nzt = new Date(now.getTime() + nztOffset * 60 * 1000);
  const date = nzt.toISOString().split("T")[0];
  
  const outputPath = path.join(process.cwd(), "puzzles", `${date}.json`);

  // Don't regenerate if already exists
  if (fs.existsSync(outputPath)) {
    console.log(`✓ Puzzle for ${date} already exists, skipping.`);
    return;
  }

  console.log("Fetching news for ${date}...");
  const recentAnswers = getRecentAnswers();
  console.log(recentAnswers)
  const headlines = await fetchNews(recentAnswers);
  console.log(`Excluding ${recentAnswers.length} recent answers from the past month.`);

  console.log("Generating puzzle with Claude...");
  const puzzle = await generatePuzzleWithRetry(headlines, date, recentAnswers);
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


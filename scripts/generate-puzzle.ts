import Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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

  return answers;
}

async function fetchNews(recentAnswers: string[]): Promise<{ headlines: string; urlMap: Record<string, string> }> {
  const url = `https://newsapi.org/v2/top-headlines?language=en&pageSize=100&apiKey=${process.env.NEWS_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json() as {
    articles: {
      title: string;
      description: string;
      source: { name: string };
      url: string;
    }[];
  };

  const recentLower = recentAnswers.map(a => a.toLowerCase());
  const urlMap: Record<string, string> = {};

  const headlines = data.articles
    .filter((a) => {
      if (!a.title || !a.description) return false;
      const text = `${a.title} ${a.description}`.toLowerCase();
      return !recentLower.some(answer => text.includes(answer.toLowerCase()));
    })
    .map((a, i) => {
      const id = `article_${i}`;
      urlMap[id] = a.url;
      return `[${id}] ${a.title}: ${a.description} (${a.source.name})`;
    })
    .join("\n");

  return { headlines, urlMap };
}

async function generatePuzzle(headlines: string, date: string, recentAnswers: string[], urlMap: Record<string, string>) {
  const exclusionList = recentAnswers.length > 0
    ? `\nCRITICAL: You MUST NOT use any of the following topics as answers. This is a hard rule — if a topic appears in this list, skip it entirely and pick something else:\n${recentAnswers.map(a => `- ${a}`).join("\n")}\n`
    : "";

  const prompt = `You are generating puzzles for Deasil, a daily news guessing game similar to Wordle.

Today's date is ${date}.
${exclusionList}
Here are today's top news headlines (each has an article ID):
${headlines}

Your task:
1. Pick 10 diverse, interesting, globally relevant topics from these headlines. Mix people, places, events, companies, and trends. Prefer topics that a global English-speaking audience would know.
2. For each topic, generate 6-8 category-style clue tags (like Wikipedia categories).
3. Remove any clue tag that contains a word from the answer — no giveaways.
4. Clues should be broad enough to be challenging but fair.
5. Write a 1-2 sentence summary explaining why this topic is in the news right now.
6. For sourceUrl, use the article ID (e.g. "article_3") from the headlines list that is most relevant to the topic.

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
  const result = JSON.parse(clean);

  // Replace article_N references with real URLs
  result.puzzles = result.puzzles.map((p: { sourceUrl: string }) => ({
    ...p,
    sourceUrl: urlMap[p.sourceUrl] ?? p.sourceUrl,
  }));

  return result;
}

async function generatePuzzleWithRetry(
  headlines: string,
  date: string,
  recentAnswers: string[],
  urlMap: Record<string, string>,
  retries = 3
): Promise<any> {
  const recentLower = recentAnswers.map(a => a.toLowerCase());

  for (let i = 0; i < retries; i++) {
    try {
      const puzzle = await generatePuzzle(headlines, date, recentAnswers, urlMap);

      // Validate no repeats
      const repeats = puzzle.puzzles.filter((p: { answer: string }) =>
        recentLower.includes(p.answer.toLowerCase())
      );

      if (repeats.length > 0) {
        console.log(`⚠️ Found ${repeats.length} repeated answers: ${repeats.map((p: { answer: string }) => p.answer).join(", ")}. Retrying...`);
        continue;
      }

      return puzzle;
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
  throw new Error("Failed to generate puzzle without repeats after max retries");
}

async function main() {
  const nztOffset = 13 * 60;
  const now = new Date();
  const nzt = new Date(now.getTime() + nztOffset * 60 * 1000);
  const date = nzt.toISOString().split("T")[0];

  const outputPath = path.join(process.cwd(), "puzzles", `${date}.json`);

  if (fs.existsSync(outputPath)) {
    console.log(`✓ Puzzle for ${date} already exists, skipping.`);
    return;
  }

  console.log(`Fetching news for ${date}...`);
  const recentAnswers = getRecentAnswers();
  console.log(`Excluding ${recentAnswers.length} recent answers from the past month.`);
  const { headlines, urlMap } = await fetchNews(recentAnswers);

  console.log("Generating puzzle with Claude...");
  const puzzle = await generatePuzzleWithRetry(headlines, date, recentAnswers, urlMap);

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
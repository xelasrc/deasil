import * as fs from "fs";
import * as path from "path";
import {
  nzDateString,
  addDays,
  getRecentAnswers,
  getRecentEvents,
  fetchNews,
  generatePuzzleWithRetry,
  dayShapeFor,
} from "./lib/puzzle-generation";

function latestPuzzleDate(): string | null {
  const dir = path.join(process.cwd(), "puzzles");
  const dates = fs.readdirSync(dir)
    .filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
    .map((f) => f.replace(".json", ""))
    .sort();

  return dates.length > 0 ? dates[dates.length - 1] : null;
}

async function main() {
  // Generate for the day after the most recent puzzle in the archive, not
  // "wall-clock NZ today + 1" — scheduled GitHub Actions runs can be delayed
  // by hours (Mondays especially), and if a delay pushes execution past NZ
  // midnight, wall-clock-based dating silently skips a day. Chaining off the
  // latest existing file is self-correcting regardless of how late a run
  // fires, and falls back to wall-clock only when the archive is empty.
  const latest = latestPuzzleDate();
  const date = latest ? addDays(latest, 1) : addDays(nzDateString(new Date()), 1);

  const outputPath = path.join(process.cwd(), "puzzles", `${date}.json`);

  if (fs.existsSync(outputPath)) {
    console.log(`Puzzle for ${date} already exists, skipping.`);
    return;
  }

  console.log(`Fetching news for ${date}...`);
  const recentAnswers = getRecentAnswers(date);
  const recentEvents = getRecentEvents(date);
  console.log(`Excluding ${recentAnswers.length} recent answers (~6 months) and ${recentEvents.length} recent stories (~2 weeks).`);
  const { headlines, urlMap, imageMap } = await fetchNews(recentAnswers);

  console.log("Generating puzzle with Claude...");
  const dayShape = dayShapeFor(date);
  const puzzle = await generatePuzzleWithRetry(headlines, date, recentAnswers, recentEvents, urlMap, imageMap, dayShape);

  if (!puzzle.puzzles || puzzle.puzzles.length !== 10) {
    throw new Error(`Expected 10 puzzles, got ${puzzle.puzzles?.length ?? 0}`);
  }

  fs.writeFileSync(outputPath, JSON.stringify(puzzle, null, 2));
  console.log(`Puzzle saved to puzzles/${date}.json`);
  console.log(`Topics: ${puzzle.puzzles.map((p: { answer: string }) => p.answer).join(", ")}`);
}

main().catch((err) => {
  console.error("Generation failed:", err);
  process.exit(1);
});

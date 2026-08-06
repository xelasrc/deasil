import * as fs from "fs";
import * as path from "path";
import {
  getRecentAnswers,
  getRecentEvents,
  fetchNews,
  generatePuzzleWithRetry,
  dayShapeFor,
} from "./lib/puzzle-generation";

async function main() {
  // Parse command-line arguments
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    console.log(`
Usage: ts-node generate-puzzle-for-date.ts [DATE] [OPTIONS]

Arguments:
  DATE              Date in YYYY-MM-DD format (required)

Options:
  --overwrite, -o   Overwrite existing puzzle file if it exists
  --help, -h        Show this help message

Examples:
  ts-node generate-puzzle-for-date.ts 2026-04-01
  ts-node generate-puzzle-for-date.ts 2026-04-01 --overwrite
`);
    process.exit(0);
  }

  const dateArg = args[0];
  const overwrite = args.includes("--overwrite") || args.includes("-o");

  // Validate date format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateArg)) {
    console.error("Invalid date format. Please use YYYY-MM-DD format.");
    process.exit(1);
  }

  // Validate that the date is actually valid
  const testDate = new Date(dateArg);
  if (isNaN(testDate.getTime())) {
    console.error("Invalid date. Please provide a valid date.");
    process.exit(1);
  }

  const date = dateArg;
  const outputPath = path.join(process.cwd(), "puzzles", `${date}.json`);

  if (fs.existsSync(outputPath) && !overwrite) {
    console.log(`Puzzle for ${date} already exists. Use --overwrite to replace it.`);
    process.exit(1);
  }

  if (fs.existsSync(outputPath) && overwrite) {
    console.log(`Overwriting existing puzzle for ${date}...`);
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

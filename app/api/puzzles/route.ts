import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const puzzlesDir = path.join(process.cwd(), "puzzles");
  const files = fs.readdirSync(puzzlesDir);
  const dates = files
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(".json", ""))
    .sort((a, b) => b.localeCompare(a)); // newest first

  return NextResponse.json({ dates });
}
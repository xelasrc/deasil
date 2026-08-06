import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ date: string }> }
) {
  const { date } = await params;

  // Reject anything that isn't exactly YYYY-MM-DD before it touches the
  // filesystem — the route segment could otherwise carry path-traversal
  // sequences (e.g. "..%2F..%2Fetc%2Fpasswd").
  if (!DATE_PATTERN.test(date)) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  const filePath = path.join(process.cwd(), "puzzles", `${date}.json`);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const data = fs.readFileSync(filePath, "utf-8");
  return new NextResponse(data, {
    headers: { "Content-Type": "application/json" },
  });
}

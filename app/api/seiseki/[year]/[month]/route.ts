import { NextResponse } from "next/server";
import { getSeisekiData } from "@/lib/seiseki";

/**
 * GET /api/seiseki/[year]/[month]
 * 指定年月の成績データを取得（公開API）
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ year: string; month: string }> }
) {
  try {
    const { year, month } = await params;
    const yearNum = parseInt(year, 10);
    const monthNum = parseInt(month, 10);

    if (Number.isNaN(yearNum) || Number.isNaN(monthNum)) {
      return NextResponse.json({ error: "Invalid year or month" }, { status: 400 });
    }

    const data = getSeisekiData(yearNum, monthNum);

    if (!data) {
      return NextResponse.json({ error: "Data not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching seiseki data:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}

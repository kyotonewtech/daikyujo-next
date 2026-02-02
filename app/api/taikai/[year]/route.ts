import { type NextRequest, NextResponse } from "next/server";
import { getTaikaiData } from "@/lib/taikai";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ year: string }> }
) {
  try {
    const resolvedParams = await params;
    const year = parseInt(resolvedParams.year, 10);

    if (Number.isNaN(year)) {
      return NextResponse.json({ error: "Invalid year parameter" }, { status: 400 });
    }

    const data = getTaikaiData(year);

    if (!data) {
      return NextResponse.json(
        { error: `Tournament data not found for year ${year}` },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching taikai data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { type NextRequest, NextResponse } from "next/server";
import { getPersonTaikaiHistory } from "@/lib/taikai";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ personName: string }> }
) {
  try {
    const { personName } = await params;

    if (!personName) {
      return NextResponse.json({ error: "personName is required" }, { status: 400 });
    }

    // URLデコード（日本語名対応）
    const decodedName = decodeURIComponent(personName);

    const personHistory = getPersonTaikaiHistory(decodedName);

    if (!personHistory) {
      return NextResponse.json({ error: "Person not found or no top 10 results" }, { status: 404 });
    }

    return NextResponse.json(personHistory);
  } catch (error) {
    console.error("Error fetching person taikai history:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

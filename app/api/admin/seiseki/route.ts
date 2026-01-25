import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { saveSeisekiData } from "@/lib/seiseki";
import type { SeisekiEntry } from "@/types/seiseki";

function validateSeisekiData(data: { year: number; month: number; entries: SeisekiEntry[] }): {
  valid: boolean;
  error?: string;
} {
  const { year, month, entries } = data;

  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    return { valid: false, error: "Year must be between 2000 and 2100" };
  }

  if (!Number.isInteger(month) || month < 1 || month > 12) {
    return { valid: false, error: "Month must be between 1 and 12" };
  }

  if (!Array.isArray(entries) || entries.length === 0) {
    return { valid: false, error: "At least one entry is required" };
  }

  if (entries.length > 10) {
    return { valid: false, error: "Maximum 10 entries allowed" };
  }

  const ranks = new Set<number>();

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const entryNum = i + 1;

    if (!entry.id || typeof entry.id !== "string") {
      return {
        valid: false,
        error: `Entry ${entryNum}: Invalid ID`,
      };
    }

    if (!Number.isInteger(entry.rank) || entry.rank < 1 || entry.rank > 10) {
      return {
        valid: false,
        error: `Entry ${entryNum}: Rank must be between 1 and 10`,
      };
    }

    if (ranks.has(entry.rank)) {
      return {
        valid: false,
        error: `Entry ${entryNum}: Duplicate rank ${entry.rank}`,
      };
    }
    ranks.add(entry.rank);

    if (!entry.name || typeof entry.name !== "string") {
      return {
        valid: false,
        error: `Entry ${entryNum}: Name is required`,
      };
    }

    if (entry.name.length > 50) {
      return {
        valid: false,
        error: `Entry ${entryNum}: Name must be max 50 characters`,
      };
    }

    if (typeof entry.rankTitle !== "string" || entry.rankTitle.length > 20) {
      return {
        valid: false,
        error: `Entry ${entryNum}: Rank title must be max 20 characters`,
      };
    }

    if (!entry.targetSize || typeof entry.targetSize !== "string") {
      return {
        valid: false,
        error: `Entry ${entryNum}: Target size is required`,
      };
    }

    if (entry.targetSize.length > 20) {
      return {
        valid: false,
        error: `Entry ${entryNum}: Target size must be max 20 characters`,
      };
    }

    const datePattern = /^\d{4}\u5e74\d{1,2}\u6708\d{1,2}\u65e5$/;

    if (!datePattern.test(entry.updatedDate)) {
      return {
        valid: false,
        error: `Entry ${entryNum}: Invalid date format for updatedDate`,
      };
    }

    if (!datePattern.test(entry.expiryDate)) {
      return {
        valid: false,
        error: `Entry ${entryNum}: Invalid date format for expiryDate`,
      };
    }
  }

  return { valid: true };
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { year, month, entries } = body;

    const validation = validateSeisekiData({ year, month, entries });

    if (!validation.valid) {
      return NextResponse.json({ success: false, error: validation.error }, { status: 400 });
    }

    await saveSeisekiData(year, month, entries);

    return NextResponse.json({
      success: true,
      message: `Seiseki data saved for ${year}/${month}`,
    });
  } catch (error) {
    console.error("Save seiseki data error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error saving data",
      },
      { status: 500 }
    );
  }
}

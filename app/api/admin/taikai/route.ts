import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { saveTaikaiData } from "@/lib/taikai";
import type { TaikaiParticipant } from "@/types/taikai";

function validateTaikaiData(data: {
  year: number;
  taikaiName: string;
  eventDate: string;
  participants: TaikaiParticipant[];
}): { valid: boolean; error?: string } {
  const { year, taikaiName, eventDate, participants } = data;

  // Year validation
  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    return { valid: false, error: "Year must be between 2000 and 2100" };
  }

  // Tournament name validation
  if (!taikaiName || typeof taikaiName !== "string" || taikaiName.trim().length === 0) {
    return { valid: false, error: "Tournament name is required" };
  }

  if (taikaiName.length > 50) {
    return { valid: false, error: "Tournament name must be max 50 characters" };
  }

  // Event date validation (format: YYYY年)
  const datePattern = /^\d{4}年$/;
  if (!datePattern.test(eventDate)) {
    return {
      valid: false,
      error: "Event date format must be YYYY年",
    };
  }

  // Participants validation
  if (!Array.isArray(participants) || participants.length === 0) {
    return { valid: false, error: "At least one participant is required" };
  }

  const ranks = new Set<number>();

  for (let i = 0; i < participants.length; i++) {
    const participant = participants[i];
    const entryNum = i + 1;

    if (!participant.id || typeof participant.id !== "string") {
      return {
        valid: false,
        error: `Participant ${entryNum}: Invalid ID`,
      };
    }

    if (!Number.isInteger(participant.rank) || participant.rank < 1) {
      return {
        valid: false,
        error: `Participant ${entryNum}: Rank must be a positive integer`,
      };
    }

    if (ranks.has(participant.rank)) {
      return {
        valid: false,
        error: `Participant ${entryNum}: Duplicate rank ${participant.rank}`,
      };
    }
    ranks.add(participant.rank);

    if (!participant.name || typeof participant.name !== "string") {
      return {
        valid: false,
        error: `Participant ${entryNum}: Name is required`,
      };
    }

    if (participant.name.length > 50) {
      return {
        valid: false,
        error: `Participant ${entryNum}: Name must be max 50 characters`,
      };
    }

    if (typeof participant.rankTitle !== "string" || participant.rankTitle.length > 20) {
      return {
        valid: false,
        error: `Participant ${entryNum}: Rank title must be max 20 characters`,
      };
    }

    if (typeof participant.score1 !== "number" || participant.score1 < 0) {
      return {
        valid: false,
        error: `Participant ${entryNum}: Score 1 must be a non-negative number`,
      };
    }

    if (typeof participant.score2 !== "number" || participant.score2 < 0) {
      return {
        valid: false,
        error: `Participant ${entryNum}: Score 2 must be a non-negative number`,
      };
    }

    if (typeof participant.totalScore !== "number") {
      return {
        valid: false,
        error: `Participant ${entryNum}: Total score must be a number`,
      };
    }

    const expectedTotal = participant.score1 + participant.score2;
    if (participant.totalScore !== expectedTotal) {
      return {
        valid: false,
        error: `Participant ${entryNum}: Total score mismatch (expected ${expectedTotal}, got ${participant.totalScore})`,
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
    const { year, taikaiName, eventDate, participants } = body;

    const validation = validateTaikaiData({
      year,
      taikaiName,
      eventDate,
      participants,
    });

    if (!validation.valid) {
      return NextResponse.json({ success: false, error: validation.error }, { status: 400 });
    }

    // Save tournament data
    saveTaikaiData(year, {
      year,
      taikaiName,
      eventDate,
      participants,
      publishedAt: "", // Will be set by saveTaikaiData
      updatedAt: "", // Will be set by saveTaikaiData
    });

    return NextResponse.json({
      success: true,
      message: `Tournament data saved for year ${year}`,
    });
  } catch (error) {
    console.error("Save taikai data error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error saving data",
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { timeframeStorage } from "@/lib/timeframe-storage";

// GET - Get a specific timeframe group by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "ID parameter is required" },
        { status: 400 }
      );
    }

    const group = timeframeStorage.getById(id);

    if (!group) {
      return NextResponse.json(
        { error: "Timeframe group not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      group: group
    });
  } catch (error) {
    console.error("Error fetching timeframe group:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

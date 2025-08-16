import { NextRequest, NextResponse } from "next/server";
import { timeframeStorage } from "@/lib/timeframe-storage";

// GET - Get all timeframe groups
export async function GET() {
  try {
    const groups = timeframeStorage.getAll();
    return NextResponse.json({
      success: true,
      groups: groups
    });
  } catch (error) {
    console.error("Error fetching timeframe groups:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create a new timeframe group
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, selections } = body;

    if (!name || !selections) {
      return NextResponse.json(
        { error: "name and selections are required" },
        { status: 400 }
      );
    }

    const group = timeframeStorage.create(name, selections);

    return NextResponse.json({
      success: true,
      group: group
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating timeframe group:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update an existing timeframe group
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, selections } = body;

    if (!id || !name || !selections) {
      return NextResponse.json(
        { error: "id, name, and selections are required" },
        { status: 400 }
      );
    }

    const group = timeframeStorage.update(id, name, selections);
    
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
    console.error("Error updating timeframe group:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a timeframe group
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: "id parameter is required" },
        { status: 400 }
      );
    }

    if (!timeframeStorage.getById(id)) {
      return NextResponse.json(
        { error: "Timeframe group not found" },
        { status: 404 }
      );
    }

    timeframeStorage.delete(id);

    return NextResponse.json({
      success: true,
      message: "Timeframe group deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting timeframe group:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";

// POST: Subscribe to ranking
export async function POST(request: NextRequest) {
  try {
    const { rankingId, playerId } = await request.json();

    if (!rankingId || !playerId) {
      return NextResponse.json(
        { error: "Missing rankingId or playerId" },
        { status: 400 }
      );
    }

    // TODO: Save to Cloudflare D1 via Workers
    // const response = await fetch(`${process.env.WORKERS_API_URL}/api/subscriptions`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ rankingId, playerId })
    // });

    // Mock response for now
    console.log("Subscribe:", { rankingId, playerId });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Subscribe API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE: Unsubscribe from ranking
export async function DELETE(request: NextRequest) {
  try {
    const { rankingId, playerId } = await request.json();

    if (!rankingId || !playerId) {
      return NextResponse.json(
        { error: "Missing rankingId or playerId" },
        { status: 400 }
      );
    }

    // TODO: Remove from Cloudflare D1 via Workers
    console.log("Unsubscribe:", { rankingId, playerId });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unsubscribe API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

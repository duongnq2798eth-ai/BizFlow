import { NextRequest, NextResponse } from "next/server";
import { getNanopayChannel } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get("walletAddress");

    if (!walletAddress) {
      return NextResponse.json(
        { error: "walletAddress query parameter is required" },
        { status: 400 }
      );
    }

    const channel = await getNanopayChannel(walletAddress);
    const balance = channel ? channel.balance : "0.000000";

    return NextResponse.json({
      success: true,
      walletAddress,
      balance
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to query nanopayment balance" },
      { status: 500 }
    );
  }
}

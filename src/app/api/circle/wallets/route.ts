import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * POST /api/circle/wallets
 * 
 * Creates an on-chain User-Controlled Wallet (UCW) session for an SME buyer or supplier.
 * Generates userToken and encryptionKey for secure client-side PIN entry via the web SDK.
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.CIRCLE_API_KEY;
    const appId = process.env.CIRCLE_APP_ID;

    // Fallback: If live credentials are not present, return simulated sandbox session
    if (!apiKey || !appId) {
      return NextResponse.json({
        success: true,
        mode: "simulation",
        userToken: "simulated_user_token_" + Math.random().toString(36).substring(2, 15),
        encryptionKey: "simulated_encryption_key_" + Math.random().toString(36).substring(2, 15),
        appId: appId || "mock-app-id-12345",
        userId,
        message: "Simulated User-Controlled Wallet Session established successfully.",
      });
    }

    // 1. Request user session token from Circle Developer Platform
    const sessionResponse = await fetch("https://api.circle.com/v1/w3s/users/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ userId }),
    });

    if (!sessionResponse.ok) {
      const errBody = await sessionResponse.text();
      throw new Error(`Circle User Token API Failed: ${errBody}`);
    }

    const { data } = await sessionResponse.json();

    return NextResponse.json({
      success: true,
      mode: "live",
      userToken: data.userToken,
      encryptionKey: data.encryptionKey,
      appId,
      userId,
      message: "Session token successfully established (Secured Web2.5 Access).",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to initialize wallet session" },
      { status: 500 }
    );
  }
}

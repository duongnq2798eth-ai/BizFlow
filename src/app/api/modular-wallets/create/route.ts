import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username } = body;

    if (!username) {
      return NextResponse.json(
        { error: "Username (email) is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.CIRCLE_API_KEY;
    const clientKey = process.env.CIRCLE_CLIENT_KEY || process.env.NEXT_PUBLIC_CIRCLE_CLIENT_KEY;

    console.log(`[Modular Wallets] Provisioning wallet for user: ${username}`);

    // If API key is available, attempt real Circle W3S backend initialization
    if (apiKey) {
      try {
        const response = await fetch("https://api.circle.com/v1/w3s/user/initialize", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            userId: username,
            accountType: "SCA", // Smart Contract Account for Modular Wallets
          }),
        });

        const data = await response.json();
        if (response.ok && data.data) {
          return NextResponse.json({
            success: true,
            mode: "live",
            walletAddress: data.data.walletAddress || "",
            challengeId: data.data.challengeId || "",
          });
        }
        console.warn("[Modular Wallets] Circle API initialization failed, falling back to simulation.", data);
      } catch (err) {
        console.error("[Modular Wallets] Error contacting Circle API, falling back to simulation:", err);
      }
    }

    // Simulation / Sandbox Mode fallback
    // Generate a deterministic or randomized mock wallet address and challenge ID
    const randomHex = Array.from({ length: 8 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("");
    const mockAddress = `0x2a19${randomHex}8dfd445ebdf04a11f224976a162233f2`;
    const mockChallengeId = `0190d18d-4517-7e6f-8dfd-${Array.from({ length: 12 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("")}`;

    return NextResponse.json({
      success: true,
      mode: "simulation",
      walletAddress: mockAddress,
      challengeId: mockChallengeId,
      message: "Simulation mode active. Mock passkey challenge initialized.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to initialize modular wallet challenge: " + err.message },
      { status: 500 }
    );
  }
}

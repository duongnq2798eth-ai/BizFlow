import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { chain, amount, recipientAddress } = body;

    if (!amount || !chain || !recipientAddress) {
      return NextResponse.json(
        { error: "amount, chain, and recipientAddress are required" },
        { status: 400 }
      );
    }

    const circleApiKey = process.env.CIRCLE_API_KEY;

    if (!circleApiKey) {
      // Simulate withdrawal
      const txHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
      return NextResponse.json({
        success: true,
        mode: "simulated",
        chain,
        amount,
        recipientAddress,
        txHash,
        message: `Successfully simulated Gateway withdrawal of ${amount} USDC to ${recipientAddress} on ${chain}.`
      });
    }

    const isSandbox = circleApiKey.includes("sandbox");
    const baseUrl = isSandbox ? "https://api-sandbox.circle.com" : "https://api.circle.com";

    const res = await fetch(`${baseUrl}/v1/gateway/withdrawals`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${circleApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        amount: { amount, currency: "USD" },
        chain: chain.includes("arc") ? "ARC" : "BASE",
        recipientAddress,
      })
    });

    if (!res.ok) {
      throw new Error(`Circle API returned status ${res.status}`);
    }

    const data = await res.json();

    return NextResponse.json({
      success: true,
      mode: "live",
      chain,
      amount,
      recipientAddress,
      txHash: data.txHash || data.id || "",
      data,
      message: `Successfully processed withdrawal of ${amount} USDC to ${recipientAddress} on ${chain} via Gateway API.`
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to process withdrawal" },
      { status: 500 }
    );
  }
}

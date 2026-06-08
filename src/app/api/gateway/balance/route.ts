import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const circleApiKey = process.env.CIRCLE_API_KEY;

    if (!circleApiKey) {
      // Simulate unified balance across chains
      const balances = [
        { chain: "Arc_Testnet", amount: "45.00", currency: "USDC" },
        { chain: "Base_Sepolia", amount: "120.50", currency: "USDC" }
      ];
      const totalBalance = balances.reduce((sum, b) => sum + parseFloat(b.amount), 0).toFixed(2);

      return NextResponse.json({
        success: true,
        mode: "simulated",
        balances,
        totalBalance,
        message: "Simulated unified Gateway balance across Arc and Base Sepolia."
      });
    }

    const isSandbox = circleApiKey.includes("sandbox");
    const baseUrl = isSandbox ? "https://api-sandbox.circle.com" : "https://api.circle.com";

    const res = await fetch(`${baseUrl}/v1/gateway/balances`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${circleApiKey}`,
        "Content-Type": "application/json"
      }
    });

    if (!res.ok) {
      throw new Error(`Circle API returned status ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json({
      success: true,
      mode: "live",
      balances: data.balances || [],
      totalBalance: data.totalBalance || "0.00",
      data,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch unified balance" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getNanopayChannel, saveNanopayChannel } from "@/lib/supabase";
import crypto from "crypto";

export const dynamic = "force-dynamic";

const RECIPIENT_TREASURY = "0x37648342410a82be0a8276f5713437e9081a3e51";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, amount, signature, challenge } = body;

    if (!walletAddress) {
      return NextResponse.json(
        { error: "walletAddress is required" },
        { status: 400 }
      );
    }

    const payAmountNum = parseFloat(amount || "0.000050");

    // 1. x402 Challenge verification
    // If signature or challenge is missing, trigger the standard HTTP 402 Payment Required response
    if (!signature || !challenge) {
      const nextChallenge = `challenge_${crypto.randomBytes(8).toString("hex")}`;
      
      const response = NextResponse.json(
        {
          error: "Payment Required",
          message: "Please authorize sub-cent payment channel deduction to access streaming data.",
          challenge: nextChallenge,
          amount: payAmountNum.toFixed(6),
          token: "USDC",
          destination: RECIPIENT_TREASURY
        },
        { status: 402 }
      );

      // Set standard headers for discovery & middleware
      response.headers.set("X-Payment-Required", "true");
      response.headers.set("X-Payment-Amount", payAmountNum.toFixed(6));
      response.headers.set("X-Payment-Token", "USDC");
      response.headers.set("X-Payment-Destination", RECIPIENT_TREASURY);
      response.headers.set("X-Payment-Challenge", nextChallenge);

      return response;
    }

    // 2. Fetch active payment channel balance
    const channel = await getNanopayChannel(walletAddress);
    const balance = channel ? parseFloat(channel.balance) : 0;

    if (balance < payAmountNum) {
      return NextResponse.json(
        {
          error: "Insufficient Channel Balance",
          message: `Your channel balance (${balance.toFixed(6)} USDC) is insufficient for this micropayment (${payAmountNum.toFixed(6)} USDC). Please deposit more USDC first.`,
          required: payAmountNum.toFixed(6),
          current: balance.toFixed(6)
        },
        { status: 402 }
      );
    }

    // 3. Deduct micro-payment and update channel balance
    const nextBalance = (balance - payAmountNum).toFixed(6);
    await saveNanopayChannel(walletAddress, nextBalance);

    // 4. Return the requested resource payload
    return NextResponse.json({
      success: true,
      settled: payAmountNum.toFixed(6),
      remainingBalance: nextBalance,
      transactionId: `nano_${crypto.randomBytes(12).toString("hex")}`,
      data: {
        packetId: Math.floor(Math.random() * 1000000),
        bandwidth: "1.2 Gbps",
        latency: "12ms",
        streamStatus: "ACTIVE",
        gasFee: "0.00 USDC (Sponsored via Arc)"
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to process micropayment" },
      { status: 500 }
    );
  }
}

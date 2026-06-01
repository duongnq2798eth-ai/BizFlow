import { NextRequest, NextResponse } from "next/server";
import { AppKit } from "@circle-fin/app-kit";
import { createViemAdapterFromPrivateKey } from "@circle-fin/adapter-viem-v2";

export const dynamic = "force-dynamic";

/**
 * POST /api/appkit/stablefx
 * 
 * Fetches dynamic multi-currency pricing and executes swaps via StableFX parameters.
 * Supports "Pay-in-EURC, Settle-in-USDC" procurement workflows.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, fromToken = "EURC", toToken = "USDC", execute = false } = body;

    if (!amount) {
      return NextResponse.json(
        { error: "amount is required" },
        { status: 400 }
      );
    }

    const privateKey = process.env.MERCHANT_PRIVATE_KEY;
    const apiKey = process.env.CIRCLE_API_KEY;

    // Fallback: Return simulated quote if live credentials are not present
    if (!privateKey || !apiKey || !privateKey.startsWith("0x") || privateKey.length !== 66) {
      const simulatedRate = fromToken === "EURC" ? 1.0925 : 0.9153;
      const resultAmount = parseFloat(amount) * simulatedRate;
      
      return NextResponse.json({
        success: true,
        mode: "simulation",
        quote: {
          rate: simulatedRate.toString(),
          input: amount,
          output: resultAmount.toFixed(4),
          slippage: "0.05%",
          fee: "0.00",
        },
        execute: false,
        message: "Simulated StableFX Quote fetched successfully (Sandbox).",
      });
    }

    // Live execution via StableFX / App Kit Swap routing
    const kit = new AppKit();
    const adapter = createViemAdapterFromPrivateKey({
      privateKey,
    });

    const swapParams = {
      adapter,
      chain: "Arc_Testnet" as const,
      amount,
      fromToken,
      toToken,
    };

    // 1. Fetch live StableFX pricing quote
    const estimate = await kit.estimateSwap(swapParams);
    const outputAmountStr = estimate?.outputAmount?.toString() || "0";
    const rateStr = (parseFloat(outputAmountStr) / parseFloat(amount)).toString();

    if (!execute) {
      return NextResponse.json({
        success: true,
        mode: "live",
        quote: {
          rate: rateStr,
          input: amount,
          output: outputAmountStr,
          priceImpact: estimate?.priceImpact?.toString() || "0",
          fee: estimate?.fee?.toString() || "0",
        },
        execute: false,
        message: "Live StableFX swap quote fetched successfully.",
      });
    }

    // 2. Perform swap trade
    const txReceipt = await kit.swap(swapParams);

    return NextResponse.json({
      success: true,
      mode: "live",
      quote: {
        rate: rateStr,
        input: amount,
        output: outputAmountStr,
        priceImpact: estimate?.priceImpact?.toString() || "0",
        fee: estimate?.fee?.toString() || "0",
      },
      execute: true,
      transaction: {
        txHash: txReceipt?.steps?.[0]?.txHash,
        explorerUrl: txReceipt?.steps?.[0]?.explorerUrl || txReceipt?.steps?.[0]?.data?.explorerUrl,
      },
      message: "StableFX dynamic payment swap executed successfully on Arc.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { 
        error: error.message || "Failed to execute StableFX swap routing",
        sdkUsed: "@circle-fin/app-kit",
      },
      { status: 500 }
    );
  }
}

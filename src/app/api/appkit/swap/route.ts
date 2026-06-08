import { NextRequest, NextResponse } from "next/server";
import { AppKit } from "@circle-fin/app-kit";
import { createViemAdapterFromPrivateKey } from "@circle-fin/adapter-viem-v2";

export const dynamic = "force-dynamic";

/**
 * POST /api/appkit/swap
 * 
 * Uses Circle App Kit SDK to swap tokens on the same chain.
 * This is a REAL integration with @circle-fin/app-kit — not a simulation.
 * 
 * Request body:
 *   - amount: string (e.g. "100.00")
 *   - fromToken: string (e.g. "USDC")
 *   - toToken: string (e.g. "EURC")
 *   - chain: string (default "Arc_Testnet")
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      amount,
      fromToken = "USDC",
      toToken = "EURC",
      chain = "Arc_Testnet",
    } = body;

    if (!amount) {
      return NextResponse.json(
        { error: "amount is required" },
        { status: 400 }
      );
    }

    const privateKey = process.env.MERCHANT_PRIVATE_KEY;

    if (!privateKey || !privateKey.startsWith("0x") || privateKey.length !== 66) {
      return NextResponse.json({
        success: false,
        mode: "estimate_only",
        message: "MERCHANT_PRIVATE_KEY not configured. Set it in .env.local to execute real App Kit Swap transactions.",
        swapParams: {
          amount,
          fromToken,
          toToken,
          chain,
        },
        sdkUsed: "@circle-fin/app-kit → kit.swap()",
        adapterUsed: "@circle-fin/adapter-viem-v2",
        arcTokens: {
          USDC: "0x3600000000000000000000000000000000000000",
          EURC: "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a",
        },
      });
    }

    // Real App Kit Swap execution
    const kit = new AppKit();
    const adapter = createViemAdapterFromPrivateKey({
      privateKey,
    });

    const swapParams = {
      from: {
        adapter,
        chain: chain as "Arc_Testnet",
      },
      tokenIn: fromToken as any,
      tokenOut: toToken as any,
      amountIn: amount,
    };

    // Estimate swap
    const estimate = await kit.estimateSwap(swapParams);

    // Execute the swap
    const result = await kit.swap(swapParams);

    return NextResponse.json({
      success: true,
      mode: "live",
      sdkUsed: "@circle-fin/app-kit → kit.swap()",
      adapterUsed: "@circle-fin/adapter-viem-v2 → createViemAdapterFromPrivateKey()",
      result: {
        txHash: result.txHash,
        explorerUrl: result.explorerUrl,
      },
      estimate: estimate ? {
        outputAmount: estimate.estimatedOutput?.amount,
        priceImpact: (estimate as any).priceImpact?.toString(),
        fee: (estimate as any).fee?.toString(),
      } : null,
      params: {
        amount,
        fromToken,
        toToken,
        chain,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message || "App Kit Swap failed",
        sdkUsed: "@circle-fin/app-kit",
        hint: "Ensure your wallet has sufficient tokens on the target chain. A Kit Key from Circle Console may be required for swaps."
      },
      { status: 500 }
    );
  }
}

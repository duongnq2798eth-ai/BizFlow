import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, amount, fromToken, toToken, sourceChain, targetChain } = body;

    if (action === "swap") {
      if (!amount || !fromToken || !toToken) {
        return NextResponse.json(
          { error: "amount, fromToken, and toToken are required" },
          { status: 400 }
        );
      }

      // Simulate App Kit Swap
      const txHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
      const outputAmount = parseFloat(amount) * 0.998; // Simulate minor slippage / exchange rate

      return NextResponse.json({
        success: true,
        type: "swap",
        inputAmount: parseFloat(amount).toFixed(2),
        inputToken: fromToken,
        outputAmount: outputAmount.toFixed(4),
        outputToken: toToken,
        txHash,
        network: "Arc Testnet",
        apyEstimate: toToken === "USYC" ? "5.45% APY (Tokenized US Treasuries)" : null,
        message: `Successfully swapped ${amount} ${fromToken} to ${outputAmount.toFixed(4)} ${toToken} on Arc.`
      });
    }

    if (action === "bridge") {
      if (!amount || !sourceChain || !targetChain) {
        return NextResponse.json(
          { error: "amount, sourceChain, and targetChain are required" },
          { status: 400 }
        );
      }

      // Simulate App Kit Bridge / CCTP
      const txHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
      const burnTxHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");

      return NextResponse.json({
        success: true,
        type: "bridge",
        amount: parseFloat(amount).toFixed(2),
        sourceChain,
        targetChain,
        burnTxHash,
        mintTxHash: txHash,
        status: "completed",
        gasFeeUSDC: "0.00 (USDC Gas Sponsor)",
        message: `Successfully bridged ${amount} USDC from ${sourceChain} to ${targetChain} via CCTP / App Kit Bridge.`
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to process treasury action" },
      { status: 500 }
    );
  }
}

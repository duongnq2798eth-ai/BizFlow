import { NextRequest, NextResponse } from "next/server";
import { AppKit } from "@circle-fin/app-kit";
import { createViemAdapterFromPrivateKey } from "@circle-fin/adapter-viem-v2";

export const dynamic = "force-dynamic";

function mapChainName(chain: string): string {
  const c = chain.toLowerCase();
  if (c.includes("arc")) return "Arc_Testnet";
  if (c.includes("base")) return "Base_Sepolia";
  if (c.includes("ethereum") || c.includes("sepolia")) return "Ethereum_Sepolia";
  return chain;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, amount, fromToken, toToken, sourceChain, targetChain } = body;

    const privateKey = process.env.MERCHANT_PRIVATE_KEY;
    const isKeyConfigured = privateKey && privateKey.startsWith("0x") && privateKey.length === 66;

    if (action === "swap") {
      if (!amount || !fromToken || !toToken) {
        return NextResponse.json(
          { error: "amount, fromToken, and toToken are required" },
          { status: 400 }
        );
      }

      if (!isKeyConfigured) {
        // Simulation fallback
        const txHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
        const outputAmount = parseFloat(amount) * 0.998;

        return NextResponse.json({
          success: true,
          type: "swap",
          mode: "simulated",
          inputAmount: parseFloat(amount).toFixed(2),
          inputToken: fromToken,
          outputAmount: outputAmount.toFixed(4),
          outputToken: toToken,
          txHash,
          network: "Arc Testnet",
          apyEstimate: toToken === "USYC" ? "5.45% APY (Tokenized US Treasuries)" : null,
          message: `Successfully swapped ${amount} ${fromToken} to ${outputAmount.toFixed(4)} ${toToken} on Arc (Simulated).`
        });
      }

      // Real App Kit Swap execution
      const kit = new AppKit();
      const adapter = createViemAdapterFromPrivateKey({ privateKey });

      const swapParams = {
        from: {
          adapter,
          chain: "Arc_Testnet" as const,
        },
        tokenIn: fromToken as any,
        tokenOut: toToken as any,
        amountIn: amount,
      };

      // Estimate swap
      const estimate = await kit.estimateSwap(swapParams);

      // Execute swap
      const result = await kit.swap(swapParams);

      const txHash = result.txHash || "";
      const outputAmount = estimate?.estimatedOutput?.amount ? parseFloat(estimate.estimatedOutput.amount) : parseFloat(amount) * 0.998;

      return NextResponse.json({
        success: true,
        type: "swap",
        mode: "live",
        inputAmount: parseFloat(amount).toFixed(2),
        inputToken: fromToken,
        outputAmount: outputAmount.toFixed(4),
        outputToken: toToken,
        txHash,
        steps: [],
        network: "Arc Testnet",
        apyEstimate: toToken === "USYC" ? "5.45% APY (Tokenized US Treasuries)" : null,
        message: `Successfully swapped ${amount} ${fromToken} to ${outputAmount.toFixed(4)} ${toToken} on Arc via App Kit.`
      });
    }

    if (action === "bridge") {
      if (!amount || !sourceChain || !targetChain) {
        return NextResponse.json(
          { error: "amount, sourceChain, and targetChain are required" },
          { status: 400 }
        );
      }

      if (!isKeyConfigured) {
        // Simulation fallback
        const txHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
        const burnTxHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");

        return NextResponse.json({
          success: true,
          type: "bridge",
          mode: "simulated",
          amount: parseFloat(amount).toFixed(2),
          sourceChain,
          targetChain,
          burnTxHash,
          mintTxHash: txHash,
          status: "completed",
          gasFeeUSDC: "0.00 (USDC Gas Sponsor)",
          message: `Successfully bridged ${amount} USDC from ${sourceChain} to ${targetChain} via CCTP / App Kit Bridge (Simulated).`
        });
      }

      // Real App Kit Bridge execution
      const kit = new AppKit();
      const adapter = createViemAdapterFromPrivateKey({ privateKey });

      const srcChainMapped = mapChainName(sourceChain);
      const dstChainMapped = mapChainName(targetChain);

      const bridgeParams = {
        from: { adapter, chain: srcChainMapped as any },
        to: { adapter, chain: dstChainMapped as any },
        amount,
      };

      // Estimate bridge
      const estimate = await kit.estimateBridge(bridgeParams);

      // Execute bridge
      const result = await kit.bridge(bridgeParams);

      const stepsMapped = result.steps?.map((step: any) => ({
        name: step.name,
        state: step.state,
        txHash: step.txHash,
        explorerUrl: step.explorerUrl || step.data?.explorerUrl,
      })) || [];

      const burnTxHash = stepsMapped.find((s: any) => s.name.toLowerCase().includes("burn") || s.name.toLowerCase().includes("deposit"))?.txHash || stepsMapped[0]?.txHash || "";
      const mintTxHash = stepsMapped.find((s: any) => s.name.toLowerCase().includes("mint") || s.name.toLowerCase().includes("claim") || s.name.toLowerCase().includes("withdraw"))?.txHash || stepsMapped[1]?.txHash || "";

      const gasFeeValue = (estimate as any)?.fee || (estimate as any)?.fees?.[0]?.amount || "0.00";

      return NextResponse.json({
        success: true,
        type: "bridge",
        mode: "live",
        amount: parseFloat(amount).toFixed(2),
        sourceChain,
        targetChain,
        burnTxHash,
        mintTxHash,
        steps: stepsMapped,
        status: "completed",
        gasFeeUSDC: `${gasFeeValue} USDC`,
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

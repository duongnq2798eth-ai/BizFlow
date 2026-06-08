import { NextRequest, NextResponse } from "next/server";
import { createWalletClient, createPublicClient, http, parseUnits } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { arcTestnet, baseSepolia } from "viem/chains";

export const dynamic = "force-dynamic";

const ERC20_ABI = [
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "recipient", type: "address" },
      { name: "amount", type: "uint256" }
    ],
    outputs: [{ name: "", type: "bool" }]
  }
] as const;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { chain, amount } = body;

    if (!amount || !chain) {
      return NextResponse.json(
        { error: "amount and chain are required" },
        { status: 400 }
      );
    }

    const privateKey = process.env.MERCHANT_PRIVATE_KEY;
    const gatewayDepositAddress = process.env.GATEWAY_DEPOSIT_ADDRESS || "0x4CEF52F8241eD327B665123d24263071295cbde0";
    const circleApiKey = process.env.CIRCLE_API_KEY;

    const isKeyConfigured = privateKey && privateKey.startsWith("0x") && privateKey.length === 66;

    let txHash = "";
    let isLiveTx = false;

    if (isKeyConfigured) {
      const isArc = chain.toLowerCase().includes("arc");
      const rpcUrl = isArc ? "https://rpc.testnet.arc.network" : "https://sepolia.base.org";
      const targetChain = isArc ? arcTestnet : baseSepolia;
      const usdcAddress = isArc 
        ? "0x3600000000000000000000000000000000000000" 
        : "0x036cbd53842c5426634e7929541ec2318f3dcf7e";

      const account = privateKeyToAccount(privateKey as `0x${string}`);
      
      const publicClient = createPublicClient({
        chain: targetChain,
        transport: http(rpcUrl),
      });

      const walletClient = createWalletClient({
        account,
        chain: targetChain,
        transport: http(rpcUrl),
      });

      // Transfer USDC to GATEWAY_DEPOSIT_ADDRESS
      const usdcDecimals = 6;
      const parsedAmount = parseUnits(amount, usdcDecimals);

      txHash = await walletClient.writeContract({
        address: usdcAddress,
        abi: ERC20_ABI,
        functionName: "transfer",
        args: [gatewayDepositAddress as `0x${string}`, parsedAmount],
      });
      isLiveTx = true;
    } else {
      // Simulate transaction
      txHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    }

    // Call Circle Gateway API if key is available
    let gatewayApiResponse = null;
    if (circleApiKey) {
      const isSandbox = circleApiKey.includes("sandbox");
      const baseUrl = isSandbox ? "https://api-sandbox.circle.com" : "https://api.circle.com";

      try {
        const res = await fetch(`${baseUrl}/v1/gateway/deposits`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${circleApiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            amount: { amount, currency: "USD" },
            chain: chain.includes("arc") ? "ARC" : "BASE",
            txHash,
          })
        });
        gatewayApiResponse = await res.json();
      } catch (err: any) {
        gatewayApiResponse = { error: err.message || "Failed to contact Circle Gateway API" };
      }
    }

    return NextResponse.json({
      success: true,
      mode: isLiveTx ? "live" : "simulated",
      chain,
      amount,
      depositAddress: gatewayDepositAddress,
      txHash,
      gatewayApiResponse,
      message: isLiveTx 
        ? `Successfully sent ${amount} USDC on-chain to Gateway deposit address ${gatewayDepositAddress}.` 
        : `Successfully simulated ${amount} USDC Gateway deposit.`
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to initiate gateway deposit" },
      { status: 500 }
    );
  }
}

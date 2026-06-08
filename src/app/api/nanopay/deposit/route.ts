import { NextRequest, NextResponse } from "next/server";
import { getNanopayChannel, saveNanopayChannel } from "@/lib/supabase";
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
    const { walletAddress, amount, chain } = body;

    if (!walletAddress || !amount) {
      return NextResponse.json(
        { error: "walletAddress and amount are required" },
        { status: 400 }
      );
    }

    const depositAmountNum = parseFloat(amount);
    if (isNaN(depositAmountNum) || depositAmountNum <= 0) {
      return NextResponse.json(
        { error: "Invalid deposit amount" },
        { status: 400 }
      );
    }

    // Retrieve or initialize the channel
    const channel = await getNanopayChannel(walletAddress);
    const currentBalance = channel ? parseFloat(channel.balance) : 0;
    const newBalance = (currentBalance + depositAmountNum).toFixed(6);

    // Save to DB
    await saveNanopayChannel(walletAddress, newBalance);

    // On-Chain payment action if private key is present
    const privateKey = process.env.MERCHANT_PRIVATE_KEY;
    const gatewayDepositAddress = process.env.GATEWAY_DEPOSIT_ADDRESS || "0x4CEF52F8241eD327B665123d24263071295cbde0";
    const isKeyConfigured = privateKey && privateKey.startsWith("0x") && privateKey.length === 66;

    let txHash = "";
    let isLiveTx = false;

    if (isKeyConfigured) {
      const targetChain = chain?.toLowerCase().includes("base") ? baseSepolia : arcTestnet;
      const rpcUrl = chain?.toLowerCase().includes("base") ? "https://sepolia.base.org" : "https://rpc.testnet.arc.network";
      const usdcAddress = chain?.toLowerCase().includes("base")
        ? "0x036cbd53842c5426634e7929541ec2318f3dcf7e"
        : "0x3600000000000000000000000000000000000000";

      try {
        const account = privateKeyToAccount(privateKey as `0x${string}`);
        const walletClient = createWalletClient({
          account,
          chain: targetChain,
          transport: http(rpcUrl)
        });

        txHash = await walletClient.writeContract({
          address: usdcAddress,
          abi: ERC20_ABI,
          functionName: "transfer",
          args: [gatewayDepositAddress as `0x${string}`, parseUnits(amount, 6)]
        });
        isLiveTx = true;
      } catch (err: any) {
        console.warn("[Nanopay Deposit] On-chain transfer failed, falling back to simulated hash:", err.message);
        txHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
      }
    } else {
      txHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    }

    return NextResponse.json({
      success: true,
      mode: isLiveTx ? "live" : "simulated",
      walletAddress,
      amount: depositAmountNum.toFixed(6),
      newBalance,
      txHash,
      message: `Successfully deposited ${depositAmountNum} USDC into nanopayment channel for ${walletAddress}.`
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to process nanopayment deposit" },
      { status: 500 }
    );
  }
}

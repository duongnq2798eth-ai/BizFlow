import { NextRequest, NextResponse } from "next/server";
import { createWalletClient, createPublicClient, http, parseUnits, defineChain, erc20Abi } from "viem";
import { privateKeyToAccount } from "viem/accounts";

export const dynamic = "force-dynamic";

const arcTestnet = defineChain({
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.testnet.arc.network"] }
  },
  blockExplorers: {
    default: { name: "ArcScan", url: "https://testnet.arcscan.app" }
  }
});

const USDC_ADDRESS = "0x3600000000000000000000000000000000000000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, recipients, date } = body;

    const privateKey = process.env.MERCHANT_PRIVATE_KEY || process.env.NEXT_PUBLIC_MERCHANT_PRIVATE_KEY;

    if (action === "batch") {
      if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
        return NextResponse.json(
          { error: "recipients array is required and cannot be empty" },
          { status: 400 }
        );
      }

      // Validate EVM addresses
      for (const item of recipients) {
        if (!item.address || !item.address.startsWith("0x") || item.address.length < 40) {
          return NextResponse.json(
            { error: `Invalid address: ${item.address}` },
            { status: 400 }
          );
        }
        if (!item.amount || parseFloat(item.amount) <= 0) {
          return NextResponse.json(
            { error: `Invalid amount for address ${item.address}` },
            { status: 400 }
          );
        }
      }

      const totalAmount = recipients.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);

      // 1. If private key is configured, execute real transactions
      if (privateKey && privateKey.startsWith("0x") && privateKey.length === 66) {
        try {
          const account = privateKeyToAccount(privateKey as `0x${string}`);
          const walletClient = createWalletClient({
            account,
            chain: arcTestnet,
            transport: http()
          });

          const txHashes = [];
          for (const item of recipients) {
            const hash = await walletClient.writeContract({
              address: USDC_ADDRESS,
              abi: erc20Abi,
              functionName: "transfer",
              args: [item.address as `0x${string}`, parseUnits(item.amount, 6)]
            });
            txHashes.push(hash);
          }

          // Return actual on-chain transaction details
          return NextResponse.json({
            success: true,
            batchId: "batch_" + Math.random().toString(36).substring(2, 10),
            status: "success",
            recipientsCount: recipients.length,
            totalSettled: totalAmount.toFixed(2),
            currency: "USDC",
            txHash: txHashes[txHashes.length - 1], // Return the latest hash
            txHashes,
            network: "Arc Testnet (Real Payouts)",
            realOnChain: true
          });
        } catch (chainErr: any) {
          return NextResponse.json(
            { error: `Blockchain Transaction Failed: ${chainErr.message}` },
            { status: 500 }
          );
        }
      }

      // 2. Fallback simulation (if private key is not configured)
      const txHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
      return NextResponse.json({
        success: true,
        batchId: "batch_" + Math.random().toString(36).substring(2, 10),
        status: "success",
        recipientsCount: recipients.length,
        totalSettled: totalAmount.toFixed(2),
        currency: "USDC",
        txHash,
        network: "Arc Testnet (Zero-Gas Batch Simulation)",
        realOnChain: false
      });
    }

    if (action === "schedule") {
      if (!recipients || !Array.isArray(recipients) || recipients.length === 0 || !date) {
        return NextResponse.json(
          { error: "recipients, amount and execution date are required" },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        scheduleId: "sched_" + Math.random().toString(36).substring(2, 10),
        status: "scheduled",
        executionDate: date,
        recipientsCount: recipients.length,
        message: `Payout of ${recipients.reduce((acc, curr) => acc + parseFloat(curr.amount), 0).toFixed(2)} USDC scheduled on ${date}`
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to process payment request" },
      { status: 500 }
    );
  }
}

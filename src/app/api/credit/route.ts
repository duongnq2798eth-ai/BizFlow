import { NextRequest, NextResponse } from "next/server";
import { createWalletClient, http, parseUnits, erc20Abi } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { arcTestnet } from "viem/chains";

export const dynamic = "force-dynamic";


const USDC_ADDRESS = "0x3600000000000000000000000000000000000000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, companyId, volume, amount, walletAddress } = body;

    const privateKey = process.env.MERCHANT_PRIVATE_KEY || process.env.NEXT_PUBLIC_MERCHANT_PRIVATE_KEY;

    if (action === "score") {
      if (!companyId || !volume) {
        return NextResponse.json(
          { error: "companyId and annualVolume are required" },
          { status: 400 }
        );
      }

      // Dynamic calculation of score based on inputs
      const monthlyVolume = parseFloat(volume);
      let limit = 0;
      let interestRate = 0;
      let score = "D";

      if (monthlyVolume > 100000) {
        limit = monthlyVolume * 0.5;
        interestRate = 4.5;
        score = "AAA";
      } else if (monthlyVolume > 20000) {
        limit = monthlyVolume * 0.3;
        interestRate = 6.2;
        score = "A";
      } else if (monthlyVolume > 5000) {
        limit = monthlyVolume * 0.15;
        interestRate = 8.5;
        score = "B";
      } else {
        limit = 500;
        interestRate = 12.0;
        score = "C";
      }

      return NextResponse.json({
        success: true,
        companyId,
        score,
        creditLimit: limit.toFixed(2),
        interestRate: `${interestRate}% APR`,
        status: "eligible"
      });
    }

    if (action === "drawdown") {
      if (!walletAddress || !amount) {
        return NextResponse.json(
          { error: "walletAddress and amount are required" },
          { status: 400 }
        );
      }

      if (!walletAddress.startsWith("0x") || walletAddress.length < 40) {
        return NextResponse.json(
          { error: "Invalid EVM wallet address" },
          { status: 400 }
        );
      }

      // 1. If private key is configured, execute real transactions
      if (privateKey && privateKey.startsWith("0x") && privateKey.length === 66) {
        try {
          const account = privateKeyToAccount(privateKey as `0x${string}`);
          const walletClient = createWalletClient({
            account,
            chain: arcTestnet,
            transport: http()
          });

          const hash = await walletClient.writeContract({
            address: USDC_ADDRESS,
            abi: erc20Abi,
            functionName: "transfer",
            args: [walletAddress as `0x${string}`, parseUnits(amount, 6)]
          });

          return NextResponse.json({
            success: true,
            amount: parseFloat(amount).toFixed(2),
            currency: "USDC",
            recipient: walletAddress,
            txHash: hash,
            status: "settled",
            network: "Arc Testnet",
            message: "Real on-chain drawdown settlement completed.",
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
        amount: parseFloat(amount).toFixed(2),
        currency: "USDC",
        recipient: walletAddress,
        txHash,
        status: "settled",
        network: "Arc Testnet (Simulation Mode)",
        message: "Drawdown processed with sub-second finality.",
        realOnChain: false
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to process credit request" },
      { status: 500 }
    );
  }
}

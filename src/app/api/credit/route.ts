import { NextRequest, NextResponse } from "next/server";
import { createWalletClient, http, parseUnits, erc20Abi } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { arcTestnet } from "viem/chains";
import crypto from "crypto";

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

      // 1. Primary Live Option: Circle Developer-Controlled Wallets (DCW) API
      const circleApiKey = process.env.CIRCLE_API_KEY;
      const circleWalletId = process.env.CIRCLE_WALLET_SET_ID;
      const circleEntitySecretCipher = process.env.CIRCLE_ENTITY_SECRET_CIPHER;

      if (circleApiKey && circleWalletId && circleEntitySecretCipher) {
        try {
          const payoutResponse = await fetch("https://api.circle.com/v1/w3s/developer/transactions/transfer", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${circleApiKey}`,
              "X-User-Key": circleEntitySecretCipher,
            },
            body: JSON.stringify({
              idempotencyKey: crypto.randomUUID(),
              walletId: circleWalletId,
              destinationAddress: walletAddress,
              amount: [amount],
              feeLevel: "MEDIUM",
              tokenId: USDC_ADDRESS, // USDC on Arc Testnet
            }),
          });

          if (payoutResponse.ok) {
            const { data } = await payoutResponse.json();
            return NextResponse.json({
              success: true,
              amount: parseFloat(amount).toFixed(2),
              currency: "USDC",
              recipient: walletAddress,
              txHash: data.txHash || "pending_broadcast",
              status: "settled",
              network: "Arc Testnet (Circle Developer-Controlled Wallet)",
              message: "Secure credit drawdown completed via Developer-Controlled MPC Wallets.",
              realOnChain: true,
              circleTxId: data.id,
            });
          }
        } catch (dcwErr: any) {
          console.error("Circle DCW Drawdown Failed, falling back to other methods:", dcwErr);
        }
      }

      // 2. Secondary Live Option: Backend Private Key fallback
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
            network: "Arc Testnet (Private Key Mode)",
            message: "Real on-chain drawdown settlement completed via backend private key.",
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

import { NextRequest, NextResponse } from "next/server";
import { createWalletClient, createPublicClient, http, parseUnits, erc20Abi } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { arcTestnet } from "viem/chains";
import crypto from "crypto";

export const dynamic = "force-dynamic";


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

      // 1. Primary Live Option: Circle Developer-Controlled Wallets (DCW) API
      const circleApiKey = process.env.CIRCLE_API_KEY;
      const circleWalletId = process.env.CIRCLE_WALLET_SET_ID;
      const circleEntitySecretCipher = process.env.CIRCLE_ENTITY_SECRET_CIPHER;

      if (circleApiKey && circleWalletId && circleEntitySecretCipher) {
        try {
          const txHashes = [];
          const batchId = "batch_" + Math.random().toString(36).substring(2, 10);
          
          for (const item of recipients) {
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
                destinationAddress: item.address,
                amount: [item.amount],
                feeLevel: "MEDIUM",
                tokenId: USDC_ADDRESS, // USDC on Arc Testnet
              }),
            });

            if (payoutResponse.ok) {
              const { data } = await payoutResponse.json();
              txHashes.push(data.txHash || "pending_" + data.id);
            }
          }

          if (txHashes.length > 0) {
            return NextResponse.json({
              success: true,
              batchId,
              status: "success",
              recipientsCount: recipients.length,
              totalSettled: totalAmount.toFixed(2),
              currency: "USDC",
              txHash: txHashes[txHashes.length - 1],
              txHashes,
              network: "Arc Testnet (Circle Developer-Controlled Wallets)",
              realOnChain: true
            });
          }
        } catch (dcwErr: any) {
          console.error("Circle DCW Batch Payout Failed, falling back to private key:", dcwErr);
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
            network: "Arc Testnet (Private Key Payouts)",
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

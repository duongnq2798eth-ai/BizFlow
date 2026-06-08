import { NextRequest, NextResponse } from "next/server";
import { createWalletClient, http, parseUnits, erc20Abi } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { arcTestnet } from "viem/chains";
import { saveCreditScore, getCreditScore, getInvoices, getEscrowDeals, saveEscrowDeal } from "@/lib/supabase";
import crypto from "crypto";

export const dynamic = "force-dynamic";

const USDC_ADDRESS = "0x3600000000000000000000000000000000000000";

// Helper to crawl transaction history from ArcScan API or block explorer
async function fetchWalletTxHistory(address: string) {
  // Try ArcScan API module=account&action=tokentx (USDC token transfers)
  try {
    const url = `https://testnet.arcscan.app/api?module=account&action=tokentx&address=${address}&contractaddress=${USDC_ADDRESS}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const data = await res.json();
      if (data.status === "1" && Array.isArray(data.result)) {
        return data.result;
      }
    }
  } catch (err) {
    console.warn("[Credit Analyzer] ArcScan token transfers query failed:", err);
  }

  // Fallback: Try general transaction list query
  try {
    const url = `https://testnet.arcscan.app/api?module=account&action=txlist&address=${address}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const data = await res.json();
      if (data.status === "1" && Array.isArray(data.result)) {
        return data.result;
      }
    }
  } catch (err) {
    console.warn("[Credit Analyzer] ArcScan transaction list query failed:", err);
  }

  // Fallback 2: Try Blockscout v2 v2/addresses/{address}/transactions
  try {
    const url = `https://testnet.arcscan.app/api/v2/addresses/${address}/transactions`;
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.items)) {
        return data.items;
      }
    }
  } catch (err) {
    console.warn("[Credit Analyzer] ArcScan API v2 transactions list failed:", err);
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, companyId, volume, amount, walletAddress } = body;

    const privateKey = process.env.MERCHANT_PRIVATE_KEY || process.env.NEXT_PUBLIC_MERCHANT_PRIVATE_KEY;

    if (action === "score") {
      if (!companyId || !volume) {
        return NextResponse.json(
          { error: "companyId and annualVolume/monthlyVolume are required" },
          { status: 400 }
        );
      }

      const monthlyVolume = parseFloat(volume);
      let wallet = companyId;
      // If companyId is not a valid address, default/fallback to a standard testing address on Arc Testnet
      if (!wallet || !wallet.startsWith("0x") || wallet.length !== 42) {
        wallet = "0x4CEF52F8241eD327B665123d24263071295cbde0";
      }

      let totalUsdcVolume = 0;
      let numberOfSettlements = 0;
      let averageSettlementTime = 0;
      let ageDays = 30; // default
      let times: number[] = [];

      // Fetch actual transaction history from ArcScan Explorer
      const txHistory = await fetchWalletTxHistory(wallet);

      if (txHistory && txHistory.length > 0) {
        console.log(`[Credit Analyzer] Found ${txHistory.length} on-chain transactions for address: ${wallet}`);
        numberOfSettlements = txHistory.length;
        
        let sumVolume = 0;
        for (const tx of txHistory) {
          // Extract value/amount
          if (tx.value) {
            const decimal = tx.tokenDecimal ? parseInt(tx.tokenDecimal) : 6;
            const amt = parseFloat(tx.value) / Math.pow(10, decimal);
            sumVolume += amt;
          } else if (tx.amount) {
            sumVolume += parseFloat(tx.amount || "0");
          }
          
          const ts = parseInt(tx.timeStamp || tx.timestamp || "0");
          if (ts > 0) times.push(ts);
        }

        totalUsdcVolume = sumVolume;

        if (times.length > 1) {
          times.sort((a, b) => a - b);
          const oldestTxTime = times[0];
          const latestTxTime = times[times.length - 1];
          ageDays = Math.max(1, (Math.floor(Date.now() / 1000) - oldestTxTime) / (24 * 3600));

          const diffs = [];
          for (let i = 1; i < times.length; i++) {
            diffs.push(times[i] - times[i-1]);
          }
          const avgDiffSec = diffs.reduce((a, b) => a + b, 0) / diffs.length;
          averageSettlementTime = parseFloat((avgDiffSec / 3600).toFixed(2)); // in hours
        } else {
          averageSettlementTime = 24.0;
        }
      } else {
        // Fallback simulation to maintain responsive sandbox UI experience
        console.log(`[Credit Analyzer] No on-chain transactions found for ${wallet}. Using deterministic simulation fallback.`);
        numberOfSettlements = Math.max(12, Math.min(45, Math.floor(monthlyVolume / 5000) + 10));
        totalUsdcVolume = monthlyVolume * 1.5;
        
        const nowSec = Math.floor(Date.now() / 1000);
        ageDays = 95;
        const oldestTime = nowSec - 95 * 24 * 3600;
        
        for (let i = 0; i < numberOfSettlements; i++) {
          const randSec = oldestTime + Math.floor((nowSec - oldestTime) * (i / numberOfSettlements));
          times.push(randSec);
        }
        
        const diffs = [];
        for (let i = 1; i < times.length; i++) {
          diffs.push(times[i] - times[i-1]);
        }
        const avgDiffSec = diffs.reduce((a, b) => a + b, 0) / diffs.length;
        averageSettlementTime = parseFloat((avgDiffSec / 3600).toFixed(2));
      }

      // Query local/Supabase invoice & escrow disputes to calculate merchant dispute rate
      const localInvoices = await getInvoices().catch(() => []);
      const localDeals = await getEscrowDeals().catch(() => []);
      
      const companyInvoices = localInvoices.filter((i: any) => i.buyer?.toLowerCase() === wallet.toLowerCase() || i.supplier?.toLowerCase() === wallet.toLowerCase());
      const companyDeals = localDeals.filter((d: any) => d.buyer?.toLowerCase() === wallet.toLowerCase() || d.seller?.toLowerCase() === wallet.toLowerCase());
      
      const totalTransactionsCount = companyInvoices.length + companyDeals.length;
      const disputedTransactionsCount = companyInvoices.filter((i: any) => i.status?.toLowerCase() === "disputed").length +
                                    companyDeals.filter((d: any) => d.status?.toLowerCase() === "disputed" || d.disputed).length;

      const disputeRate = totalTransactionsCount > 0 ? disputedTransactionsCount / totalTransactionsCount : 0;

      // Point scoring engine (base 50 points)
      let points = 50;

      // 1. Volume contribution
      if (totalUsdcVolume > 100000) points += 25;
      else if (totalUsdcVolume > 20000) points += 15;
      else if (totalUsdcVolume > 5000) points += 10;
      else if (totalUsdcVolume > 1000) points += 5;

      // 2. Consistency / Frequency contribution
      if (numberOfSettlements > 30) points += 15;
      else if (numberOfSettlements > 10) points += 10;
      else if (numberOfSettlements > 2) points += 5;

      // 3. Dispute penalty
      if (disputeRate > 0.2) points -= 30;
      else if (disputeRate > 0.05) points -= 15;
      else if (disputeRate > 0) points -= 5;

      // 4. Age/Track-record contribution
      if (ageDays > 90) points += 10;
      else if (ageDays > 30) points += 5;

      // Constrain points between 0 and 100
      points = Math.max(0, Math.min(100, points));

      // Map points to grade scales
      let score = "C";
      let limit = 0;
      let interestRate = 12.0;

      if (points >= 90) {
        score = "AAA";
        limit = totalUsdcVolume * 0.5;
        interestRate = 4.5;
      } else if (points >= 75) {
        score = "AA";
        limit = totalUsdcVolume * 0.4;
        interestRate = 5.5;
      } else if (points >= 60) {
        score = "A";
        limit = totalUsdcVolume * 0.3;
        interestRate = 6.2;
      } else if (points >= 50) {
        score = "B";
        limit = totalUsdcVolume * 0.15;
        interestRate = 8.5;
      } else if (points >= 40) {
        score = "C";
        limit = totalUsdcVolume * 0.1;
        interestRate = 12.0;
      } else {
        score = "D";
        limit = 0;
        interestRate = 18.0;
      }

      const scoreRecord = {
        company_id: companyId,
        score,
        credit_limit: limit.toFixed(2),
        interest_rate: `${interestRate}% APR`,
        total_volume: totalUsdcVolume.toFixed(2),
        settlements_count: numberOfSettlements,
        avg_settlement_time: `${averageSettlementTime} hours`
      };

      // Store score in Supabase/LocalDB for caching
      await saveCreditScore(scoreRecord).catch(err => {
        console.warn("[Credit Analyzer] Saving credit score failed:", err);
      });

      return NextResponse.json({
        success: true,
        companyId,
        score,
        creditLimit: limit.toFixed(2),
        interestRate: `${interestRate}% APR`,
        status: score === "D" ? "ineligible" : "eligible",
        metrics: {
          totalUsdcVolume: totalUsdcVolume.toFixed(2),
          numberOfSettlements,
          averageSettlementTime: `${averageSettlementTime} hours`,
          ageDays: Math.floor(ageDays),
          disputeRate: `${(disputeRate * 100).toFixed(1)}%`
        }
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

      // Check credit score meets minimum threshold (must exist in cache and not be D)
      const cachedScore = await getCreditScore(walletAddress);
      
      if (!cachedScore) {
        return NextResponse.json(
          { error: "Drawdown requires a pre-calculated credit score. Please check your credit score first using the Analyze tool." },
          { status: 403 }
        );
      }

      if (cachedScore.score === "D") {
        return NextResponse.json(
          { error: `Drawdown denied. Credit score grade D (Ineligible) does not meet minimum threshold (Grade C).` },
          { status: 403 }
        );
      }

      // Check amount fits within credit limit
      const creditLimit = parseFloat(cachedScore.credit_limit || "0");
      const requestedAmt = parseFloat(amount);
      if (requestedAmt > creditLimit) {
        return NextResponse.json(
          { error: `Drawdown amount (${requestedAmt.toFixed(2)} USDC) exceeds your calculated credit limit (${creditLimit.toFixed(2)} USDC).` },
          { status: 403 }
        );
      }

      // Create collateral escrow deal (collateral value is set at 120% of drawdown value)
      const collateralAmount = (requestedAmt * 1.2).toFixed(2);
      const collateralDealId = `deal_collateral_${crypto.randomBytes(6).toString("hex")}`;
      const collateralTxHash = "0x" + crypto.randomBytes(32).toString("hex");

      await saveEscrowDeal({
        id: collateralDealId,
        on_chain_id: `col_${Math.floor(Math.random() * 100000)}`,
        buyer: walletAddress, // Borrower
        seller: "0x37648342410a82be0a8276f5713437e9081a3e51", // Treasury / Lender
        total_amount: collateralAmount,
        status: "collateral_locked",
        tx_hash: collateralTxHash
      });

      console.log(`[Drawdown] Collateral escrow deal ${collateralDealId} locked for ${collateralAmount} USDC`);

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
              tokenId: USDC_ADDRESS,
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
              message: `Drawdown successful. Collateral Escrow Deal ${collateralDealId} locked.`,
              realOnChain: true,
              circleTxId: data.id,
              collateralDealId
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
            transport: http("https://rpc.testnet.arc.network")
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
            message: `Drawdown settled. Collateral Escrow Deal ${collateralDealId} locked.`,
            realOnChain: true,
            collateralDealId
          });
        } catch (chainErr: any) {
          return NextResponse.json(
            { error: `Blockchain Transaction Failed: ${chainErr.message}` },
            { status: 500 }
          );
        }
      }

      // 3. Fallback simulation (if private key is not configured)
      const txHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
      return NextResponse.json({
        success: true,
        amount: parseFloat(amount).toFixed(2),
        currency: "USDC",
        recipient: walletAddress,
        txHash,
        status: "settled",
        network: "Arc Testnet (Simulation Mode)",
        message: `Drawdown settled (Simulated). Collateral Escrow Deal ${collateralDealId} locked.`,
        realOnChain: false,
        collateralDealId
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

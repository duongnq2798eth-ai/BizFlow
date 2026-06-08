import { NextRequest, NextResponse } from "next/server";
import { createWalletClient, createPublicClient, http, parseUnits, formatUnits, keccak256, toBytes } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { arcTestnet } from "viem/chains";
import { saveInvoice, getInvoices } from "@/lib/supabase";


export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const list = await getInvoices();
    return NextResponse.json({ success: true, invoices: list });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


/**
 * BizFlowInvoice Contract ABI (deployed on Arc Testnet)
 * On-chain invoice management for B2B trade workflows
 */
const INVOICE_ABI = [
  {
    inputs: [
      { name: "buyer", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "dueDate", type: "uint256" },
      { name: "description", type: "string" },
      { name: "purchaseOrderRef", type: "bytes32" },
      { name: "earlyPayDiscount", type: "uint16" }
    ],
    name: "createInvoice",
    outputs: [{ name: "invoiceId", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { name: "invoiceId", type: "uint256" },
      { name: "goodsReceiptRef", type: "bytes32" }
    ],
    name: "approveInvoice",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { name: "invoiceId", type: "uint256" },
      { name: "reason", type: "string" }
    ],
    name: "rejectInvoice",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ name: "invoiceId", type: "uint256" }],
    name: "settleInvoice",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ name: "invoiceIds", type: "uint256[]" }],
    name: "batchSettle",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ name: "invoiceId", type: "uint256" }],
    name: "disputeInvoice",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ name: "invoiceId", type: "uint256" }],
    name: "getInvoice",
    outputs: [
      {
        components: [
          { name: "id", type: "uint256" },
          { name: "supplier", type: "address" },
          { name: "buyer", type: "address" },
          { name: "amount", type: "uint256" },
          { name: "dueDate", type: "uint256" },
          { name: "createdAt", type: "uint256" },
          { name: "settledAt", type: "uint256" },
          { name: "status", type: "uint8" },
          { name: "description", type: "string" },
          { name: "purchaseOrderRef", type: "bytes32" },
          { name: "goodsReceiptRef", type: "bytes32" },
          { name: "earlyPayDiscount", type: "uint16" }
        ],
        name: "",
        type: "tuple"
      }
    ],
    stateMutability: "view",
    type: "function"
  }
] as const;

const USDC_ADDRESS = "0x3600000000000000000000000000000000000000";
const INVOICE_CONTRACT_ADDRESS = process.env.INVOICE_CONTRACT_ADDRESS || "";

// Helper to convert arbitrary string ref into bytes32
function toBytes32(val: string | undefined | null): `0x${string}` {
  if (!val) {
    return ("0x" + "0".repeat(64)) as `0x${string}`;
  }
  if (val.startsWith("0x") && val.length === 66) {
    return val as `0x${string}`;
  }
  return keccak256(toBytes(val));
}

async function syncInvoiceStatus(invoiceId: any, status: string, txHash?: string) {
  try {
    const list = await getInvoices();
    const existing = list.find((i: any) => i.on_chain_id === invoiceId.toString() || i.id === invoiceId.toString() || i.id === `inv_sim_${invoiceId}` || (txHash && i.tx_hash === txHash));
    if (existing) {
      existing.status = status;
      if (txHash) existing.tx_hash = txHash;
      await saveInvoice(existing);
    } else {
      await saveInvoice({
        id: `inv_${invoiceId || Date.now()}`,
        on_chain_id: invoiceId?.toString() || "simulated",
        supplier: "0xF05065f4795d15AcEF0d3981CFc00460A937171C",
        buyer: "0x4CEF52F8241eD327B665123d24263071295cbde0",
        amount: "0.00",
        status: status,
        tx_hash: txHash
      });
    }
  } catch (err) {
    console.error("Failed to sync invoice status:", err);
  }
}

async function triggerInvoiceSettledWebhook(request: NextRequest, invoiceId: any, txHash: string) {
  try {
    const host = request.headers.get("host") || "localhost:3000";
    const protocol = request.headers.get("x-forwarded-proto") || (host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https");
    const webhookUrl = `${protocol}://${host}/api/webhooks`;

    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType: "invoice.settled",
        data: {
          invoiceId: invoiceId.toString(),
          txHash: txHash,
          status: "Settled"
        }
      })
    });
  } catch (err) {
    console.warn("[Webhook Trigger] Internal trigger failed:", err);
  }
}


/**
 * POST /api/invoice
 * 
 * Manages BizFlowInvoice operations
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    const publicClient = createPublicClient({
      chain: arcTestnet,
      transport: http("https://rpc.testnet.arc.network"),
    });

    const privateKey = process.env.MERCHANT_PRIVATE_KEY;

    // ============ CREATE INVOICE ============
    if (action === "create") {
      const { buyer, amount, dueDate, description, purchaseOrderRef, earlyPayDiscount } = body;

      if (!buyer || !amount || !dueDate || !description) {
        return NextResponse.json(
          { error: "buyer, amount, dueDate, and description are required" },
          { status: 400 }
        );
      }

      if (!buyer.startsWith("0x") || buyer.length < 42) {
        return NextResponse.json(
          { error: "Invalid buyer address" },
          { status: 400 }
        );
      }

      const parsedAmount = parseUnits(amount.toString(), 6);
      const parsedDueDate = BigInt(Math.floor(new Date(dueDate).getTime() / 1000));
      const poRefBytes32 = toBytes32(purchaseOrderRef);
      const parsedDiscount = earlyPayDiscount ? Number(earlyPayDiscount) : 0;

      // On-chain flow
      if (INVOICE_CONTRACT_ADDRESS && privateKey && privateKey.startsWith("0x") && privateKey.length === 66) {
        try {
          const account = privateKeyToAccount(privateKey as `0x${string}`);
          const walletClient = createWalletClient({
            account,
            chain: arcTestnet,
            transport: http("https://rpc.testnet.arc.network"),
          });

          const createHash = await walletClient.writeContract({
            address: INVOICE_CONTRACT_ADDRESS as `0x${string}`,
            abi: INVOICE_ABI,
            functionName: "createInvoice",
            args: [buyer as `0x${string}`, parsedAmount, parsedDueDate, description, poRefBytes32, parsedDiscount],
          });

          const receipt = await publicClient.waitForTransactionReceipt({ hash: createHash });

          await saveInvoice({
            id: `inv_${createHash}`,
            on_chain_id: "pending_on_chain",
            supplier: account.address,
            buyer,
            amount: parseFloat(amount).toFixed(2),
            status: "Created",
            tx_hash: createHash
          });

          return NextResponse.json({
            success: true,
            mode: "on-chain",
            action: "create",
            txHash: createHash,
            blockNumber: Number(receipt.blockNumber),
            invoice: {
              buyer,
              amount: parseFloat(amount).toFixed(2),
              dueDate,
              description,
              purchaseOrderRef: poRefBytes32,
              earlyPayDiscount: parsedDiscount,
              currency: "USDC"
            },
            contract: INVOICE_CONTRACT_ADDRESS,
            network: "Arc Testnet",
            explorerUrl: `https://testnet.arcscan.app/tx/${createHash}`
          });
        } catch (err: any) {
          return NextResponse.json(
            { error: `On-chain invoice creation failed: ${err.message}` },
            { status: 500 }
          );
        }
      }

      // Simulation fallback
      const invoiceId = Math.floor(Math.random() * 10000);
      const txHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");

      await saveInvoice({
        id: `inv_sim_${invoiceId}`,
        on_chain_id: invoiceId.toString(),
        supplier: "0xF05065f4795d15AcEF0d3981CFc00460A937171C",
        buyer,
        amount: parseFloat(amount).toFixed(2),
        status: "Created",
        tx_hash: txHash
      });

      return NextResponse.json({
        success: true,
        mode: "simulation",
        action: "create",
        invoiceId,
        txHash,
        invoice: {
          buyer,
          amount: parseFloat(amount).toFixed(2),
          dueDate,
          description,
          purchaseOrderRef: poRefBytes32,
          earlyPayDiscount: parsedDiscount,
          status: "Created"
        },
        message: INVOICE_CONTRACT_ADDRESS
          ? "Simulation mode - set MERCHANT_PRIVATE_KEY in .env.local for on-chain execution"
          : "Simulation mode - deploy BizFlowInvoice.sol and set INVOICE_CONTRACT_ADDRESS in .env.local",
        contract: "BizFlowInvoice.sol",
        network: "Arc Testnet (Simulated)"
      });
    }

    // ============ APPROVE INVOICE ============
    if (action === "approve") {
      const { invoiceId, goodsReceiptRef } = body;

      if (invoiceId === undefined) {
        return NextResponse.json({ error: "invoiceId is required" }, { status: 400 });
      }

      const receiptRefBytes32 = toBytes32(goodsReceiptRef);

      // On-chain flow
      if (INVOICE_CONTRACT_ADDRESS && privateKey && privateKey.startsWith("0x") && privateKey.length === 66) {
        try {
          const account = privateKeyToAccount(privateKey as `0x${string}`);
          const walletClient = createWalletClient({
            account,
            chain: arcTestnet,
            transport: http("https://rpc.testnet.arc.network"),
          });

          const approveHash = await walletClient.writeContract({
            address: INVOICE_CONTRACT_ADDRESS as `0x${string}`,
            abi: INVOICE_ABI,
            functionName: "approveInvoice",
            args: [BigInt(invoiceId), receiptRefBytes32],
          });

          const receipt = await publicClient.waitForTransactionReceipt({ hash: approveHash });

          await syncInvoiceStatus(invoiceId, "Approved", approveHash);

          return NextResponse.json({
            success: true,
            mode: "on-chain",
            action: "approve",
            invoiceId,
            goodsReceiptRef: receiptRefBytes32,
            txHash: approveHash,
            blockNumber: Number(receipt.blockNumber),
            status: "Approved",
            explorerUrl: `https://testnet.arcscan.app/tx/${approveHash}`
          });
        } catch (err: any) {
          return NextResponse.json(
            { error: `On-chain invoice approval failed: ${err.message}` },
            { status: 500 }
          );
        }
      }

      // Simulation fallback
      const simTxHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
      await syncInvoiceStatus(invoiceId, "Approved", simTxHash);

      return NextResponse.json({
        success: true,
        mode: "simulation",
        action: "approve",
        invoiceId,
        goodsReceiptRef: receiptRefBytes32,
        txHash: simTxHash,
        status: "Approved",
        message: "Invoice successfully approved (simulated)"
      });
    }

    // ============ SETTLE INVOICE ============
    if (action === "settle") {
      const { invoiceId } = body;

      if (invoiceId === undefined) {
        return NextResponse.json({ error: "invoiceId is required" }, { status: 400 });
      }

      // On-chain flow
      if (INVOICE_CONTRACT_ADDRESS && privateKey && privateKey.startsWith("0x") && privateKey.length === 66) {
        try {
          const account = privateKeyToAccount(privateKey as `0x${string}`);
          const walletClient = createWalletClient({
            account,
            chain: arcTestnet,
            transport: http("https://rpc.testnet.arc.network"),
          });

          // Retrieve invoice details to get amount for approval
          const invoiceDetails = await publicClient.readContract({
            address: INVOICE_CONTRACT_ADDRESS as `0x${string}`,
            abi: INVOICE_ABI,
            functionName: "getInvoice",
            args: [BigInt(invoiceId)]
          });

          const invoiceAmount = invoiceDetails.amount;

          // Step 1: Approve USDC spending
          const approveHash = await walletClient.writeContract({
            address: USDC_ADDRESS as `0x${string}`,
            abi: [
              {
                name: "approve",
                type: "function",
                stateMutability: "nonpayable",
                inputs: [
                  { name: "spender", type: "address" },
                  { name: "amount", type: "uint256" },
                ],
                outputs: [{ name: "", type: "bool" }],
              },
            ],
            functionName: "approve",
            args: [INVOICE_CONTRACT_ADDRESS as `0x${string}`, invoiceAmount]
          });

          await publicClient.waitForTransactionReceipt({ hash: approveHash });

          // Step 2: Settle invoice
          const settleHash = await walletClient.writeContract({
            address: INVOICE_CONTRACT_ADDRESS as `0x${string}`,
            abi: INVOICE_ABI,
            functionName: "settleInvoice",
            args: [BigInt(invoiceId)]
          });

          const receipt = await publicClient.waitForTransactionReceipt({ hash: settleHash });

          await syncInvoiceStatus(invoiceId, "Settled", settleHash);
          await triggerInvoiceSettledWebhook(request, invoiceId, settleHash);

          return NextResponse.json({
            success: true,
            mode: "on-chain",
            action: "settle",
            invoiceId,
            approvalTxHash: approveHash,
            txHash: settleHash,
            blockNumber: Number(receipt.blockNumber),
            status: "Settled",
            explorerUrl: `https://testnet.arcscan.app/tx/${settleHash}`
          });
        } catch (err: any) {
          return NextResponse.json(
            { error: `On-chain invoice settlement failed: ${err.message}` },
            { status: 500 }
          );
        }
      }

      // Simulation fallback
      const simTxHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
      await syncInvoiceStatus(invoiceId, "Settled", simTxHash);
      await triggerInvoiceSettledWebhook(request, invoiceId, simTxHash);

      return NextResponse.json({
        success: true,
        mode: "simulation",
        action: "settle",
        invoiceId,
        txHash: simTxHash,
        status: "Settled",
        message: "Invoice successfully settled (simulated)"
      });
    }

    // ============ BATCH SETTLE ============
    if (action === "batch") {
      const { invoiceIds } = body;

      if (!invoiceIds || !Array.isArray(invoiceIds) || invoiceIds.length === 0) {
        return NextResponse.json({ error: "invoiceIds array is required" }, { status: 400 });
      }

      // On-chain flow
      if (INVOICE_CONTRACT_ADDRESS && privateKey && privateKey.startsWith("0x") && privateKey.length === 66) {
        try {
          const account = privateKeyToAccount(privateKey as `0x${string}`);
          const walletClient = createWalletClient({
            account,
            chain: arcTestnet,
            transport: http("https://rpc.testnet.arc.network"),
          });

          // Retrieve all invoices to compute total amount
          let totalUsdcAmount = BigInt(0);
          for (const id of invoiceIds) {
            const details = await publicClient.readContract({
              address: INVOICE_CONTRACT_ADDRESS as `0x${string}`,
              abi: INVOICE_ABI,
              functionName: "getInvoice",
              args: [BigInt(id)]
            });
            totalUsdcAmount += details.amount;
          }

          // Step 1: Approve total USDC amount
          const approveHash = await walletClient.writeContract({
            address: USDC_ADDRESS as `0x${string}`,
            abi: [
              {
                name: "approve",
                type: "function",
                stateMutability: "nonpayable",
                inputs: [
                  { name: "spender", type: "address" },
                  { name: "amount", type: "uint256" },
                ],
                outputs: [{ name: "", type: "bool" }],
              },
            ],
            functionName: "approve",
            args: [INVOICE_CONTRACT_ADDRESS as `0x${string}`, totalUsdcAmount]
          });

          await publicClient.waitForTransactionReceipt({ hash: approveHash });

          // Step 2: Batch settle
          const batchHash = await walletClient.writeContract({
            address: INVOICE_CONTRACT_ADDRESS as `0x${string}`,
            abi: INVOICE_ABI,
            functionName: "batchSettle",
            args: [invoiceIds.map((id) => BigInt(id))]
          });

          const receipt = await publicClient.waitForTransactionReceipt({ hash: batchHash });

          for (const id of invoiceIds) {
            await syncInvoiceStatus(id, "Settled", batchHash);
          }

          return NextResponse.json({
            success: true,
            mode: "on-chain",
            action: "batch",
            invoiceIds,
            totalPaid: formatUnits(totalUsdcAmount, 6),
            approvalTxHash: approveHash,
            txHash: batchHash,
            blockNumber: Number(receipt.blockNumber),
            status: "Settled",
            explorerUrl: `https://testnet.arcscan.app/tx/${batchHash}`
          });
        } catch (err: any) {
          return NextResponse.json(
            { error: `On-chain batch settlement failed: ${err.message}` },
            { status: 500 }
          );
        }
      }

      // Simulation fallback
      const simBatchHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
      for (const id of invoiceIds) {
        await syncInvoiceStatus(id, "Settled", simBatchHash);
      }

      return NextResponse.json({
        success: true,
        mode: "simulation",
        action: "batch",
        invoiceIds,
        txHash: simBatchHash,
        status: "Settled",
        message: "Batch invoices successfully settled (simulated)"
      });
    }

    // ============ REJECT INVOICE ============
    if (action === "reject") {
      const { invoiceId, reason } = body;

      if (invoiceId === undefined || !reason) {
        return NextResponse.json({ error: "invoiceId and reason are required" }, { status: 400 });
      }

      // On-chain flow
      if (INVOICE_CONTRACT_ADDRESS && privateKey && privateKey.startsWith("0x") && privateKey.length === 66) {
        try {
          const account = privateKeyToAccount(privateKey as `0x${string}`);
          const walletClient = createWalletClient({
            account,
            chain: arcTestnet,
            transport: http("https://rpc.testnet.arc.network"),
          });

          const rejectHash = await walletClient.writeContract({
            address: INVOICE_CONTRACT_ADDRESS as `0x${string}`,
            abi: INVOICE_ABI,
            functionName: "rejectInvoice",
            args: [BigInt(invoiceId), reason],
          });

          const receipt = await publicClient.waitForTransactionReceipt({ hash: rejectHash });

          await syncInvoiceStatus(invoiceId, "Rejected", rejectHash);

          return NextResponse.json({
            success: true,
            mode: "on-chain",
            action: "reject",
            invoiceId,
            reason,
            txHash: rejectHash,
            blockNumber: Number(receipt.blockNumber),
            status: "Rejected",
            explorerUrl: `https://testnet.arcscan.app/tx/${rejectHash}`
          });
        } catch (err: any) {
          return NextResponse.json(
            { error: `On-chain invoice rejection failed: ${err.message}` },
            { status: 500 }
          );
        }
      }

      // Simulation fallback
      const simRejectHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
      await syncInvoiceStatus(invoiceId, "Rejected", simRejectHash);

      return NextResponse.json({
        success: true,
        mode: "simulation",
        action: "reject",
        invoiceId,
        reason,
        txHash: simRejectHash,
        status: "Rejected",
        message: "Invoice successfully rejected (simulated)"
      });
    }

    // ============ DISPUTE INVOICE ============
    if (action === "dispute") {
      const { invoiceId } = body;

      if (invoiceId === undefined) {
        return NextResponse.json({ error: "invoiceId is required" }, { status: 400 });
      }

      // On-chain flow
      if (INVOICE_CONTRACT_ADDRESS && privateKey && privateKey.startsWith("0x") && privateKey.length === 66) {
        try {
          const account = privateKeyToAccount(privateKey as `0x${string}`);
          const walletClient = createWalletClient({
            account,
            chain: arcTestnet,
            transport: http("https://rpc.testnet.arc.network"),
          });

          const disputeHash = await walletClient.writeContract({
            address: INVOICE_CONTRACT_ADDRESS as `0x${string}`,
            abi: INVOICE_ABI,
            functionName: "disputeInvoice",
            args: [BigInt(invoiceId)],
          });

          const receipt = await publicClient.waitForTransactionReceipt({ hash: disputeHash });

          await syncInvoiceStatus(invoiceId, "Disputed", disputeHash);

          return NextResponse.json({
            success: true,
            mode: "on-chain",
            action: "dispute",
            invoiceId,
            txHash: disputeHash,
            blockNumber: Number(receipt.blockNumber),
            status: "Disputed",
            explorerUrl: `https://testnet.arcscan.app/tx/${disputeHash}`
          });
        } catch (err: any) {
          return NextResponse.json(
            { error: `On-chain invoice dispute failed: ${err.message}` },
            { status: 500 }
          );
        }
      }

      // Simulation fallback
      const simDisputeHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
      await syncInvoiceStatus(invoiceId, "Disputed", simDisputeHash);

      return NextResponse.json({
        success: true,
        mode: "simulation",
        action: "dispute",
        invoiceId,
        txHash: simDisputeHash,
        status: "Disputed",
        message: "Invoice successfully disputed (simulated)"
      });
    }

    // ============ STATUS INVOICE ============
    if (action === "status") {
      const { invoiceId } = body;

      if (invoiceId === undefined) {
        return NextResponse.json({ error: "invoiceId is required" }, { status: 400 });
      }

      if (INVOICE_CONTRACT_ADDRESS) {
        try {
          const details = await publicClient.readContract({
            address: INVOICE_CONTRACT_ADDRESS as `0x${string}`,
            abi: INVOICE_ABI,
            functionName: "getInvoice",
            args: [BigInt(invoiceId)]
          });

          // Status enum: Created, Approved, Rejected, Settled, Disputed, Cancelled
          const statusMap = ["Created", "Approved", "Rejected", "Settled", "Disputed", "Cancelled"];

          return NextResponse.json({
            success: true,
            mode: "on-chain",
            action: "status",
            invoice: {
              id: Number(details.id),
              supplier: details.supplier,
              buyer: details.buyer,
              amount: formatUnits(details.amount, 6),
              dueDate: new Date(Number(details.dueDate) * 1000).toISOString(),
              createdAt: new Date(Number(details.createdAt) * 1000).toISOString(),
              settledAt: details.settledAt > BigInt(0) ? new Date(Number(details.settledAt) * 1000).toISOString() : null,
              status: statusMap[details.status] || "Unknown",
              description: details.description,
              purchaseOrderRef: details.purchaseOrderRef,
              goodsReceiptRef: details.goodsReceiptRef,
              earlyPayDiscount: Number(details.earlyPayDiscount)
            }
          });
        } catch (err) {
          // Fall through to simulation
        }
      }

      // Simulation fallback
      return NextResponse.json({
        success: true,
        mode: "simulation",
        action: "status",
        invoice: {
          id: Number(invoiceId),
          supplier: "0xF05065f4795d15AcEF0d3981CFc00460A937171C",
          buyer: "0x4CEF52F8241eD327B665123d24263071295cbde0",
          amount: "3500.00",
          dueDate: new Date(Date.now() + 86400 * 30 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
          settledAt: null,
          status: "Created",
          description: "Office Supplies and IT Accessories",
          purchaseOrderRef: "0x" + "0".repeat(64),
          goodsReceiptRef: "0x" + "0".repeat(64),
          earlyPayDiscount: 200
        }
      });
    }

    return NextResponse.json(
      { error: "Invalid action. Use: create, approve, settle, batch, reject, dispute, status" },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to process invoice request" },
      { status: 500 }
    );
  }
}

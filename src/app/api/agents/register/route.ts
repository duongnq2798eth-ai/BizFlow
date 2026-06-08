import { NextRequest, NextResponse } from "next/server";
import { saveAgent, getAgentRecord } from "@/lib/supabase";
import { createWalletClient, createPublicClient, http } from "viem";
import { privateKeyToAccount, generatePrivateKey } from "viem/accounts";
import { arcTestnet } from "viem/chains";
import path from "path";
import fs from "fs";

export const dynamic = "force-dynamic";

// Load registry ABI
let REGISTRY_ABI: any[] = [];
try {
  const artifactPath = path.join(process.cwd(), "BizFlowAgentRegistry.json");
  if (fs.existsSync(artifactPath)) {
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    REGISTRY_ABI = artifact.abi;
  }
} catch (err) {
  console.error("Failed to load BizFlowAgentRegistry ABI:", err);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, name, capabilities } = body;

    if (!agentId || !name || !capabilities) {
      return NextResponse.json(
        { error: "agentId, name, and capabilities are required" },
        { status: 400 }
      );
    }

    // 1. Check if agent already exists
    const existingAgent = await getAgentRecord(agentId);
    if (existingAgent) {
      return NextResponse.json({
        success: true,
        mode: existingAgent.registry_tx_hash?.startsWith("0xsim") ? "simulation" : "on-chain",
        agent: existingAgent,
        message: "Agent is already registered."
      });
    }

    // 2. Generate Circle Agent Wallet (Secure MPC keypair or simulated)
    const apiKey = process.env.CIRCLE_API_KEY;
    let agentWalletAddress = "";
    let agentPrivateKey = "";

    // Generate a secure keypair to serve as the agent's wallet
    const privateKey = generatePrivateKey();
    const account = privateKeyToAccount(privateKey);
    agentWalletAddress = account.address;
    agentPrivateKey = privateKey;

    // Contact Circle API to associate it if key is configured
    let circleResponse = null;
    if (apiKey) {
      try {
        const res = await fetch("https://api.circle.com/v1/w3s/user/initialize", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            userId: `agent_${agentId}`,
            accountType: "SCA",
          }),
        });
        circleResponse = await res.json();
      } catch (err: any) {
        console.warn("[Circle Agent Wallet] Failed to init wallet backend, using keypair:", err.message);
      }
    }

    // 3. Register on-chain on Arc Testnet
    const registryAddress = process.env.AGENT_REGISTRY_CONTRACT_ADDRESS || "0x16b081a28a3a0e8bc1a7b0f81d1a932082f1ed2b";
    const merchantPrivateKey = process.env.MERCHANT_PRIVATE_KEY;
    const isMerchantConfigured = merchantPrivateKey && merchantPrivateKey.startsWith("0x") && merchantPrivateKey.length === 66;

    let registryTxHash = "";
    let mode = "simulation";

    if (isMerchantConfigured && REGISTRY_ABI.length > 0) {
      try {
        const merchantAccount = privateKeyToAccount(merchantPrivateKey as `0x${string}`);
        const publicClient = createPublicClient({
          chain: arcTestnet,
          transport: http("https://rpc.testnet.arc.network")
        });

        const walletClient = createWalletClient({
          account: merchantAccount,
          chain: arcTestnet,
          transport: http("https://rpc.testnet.arc.network")
        });

        // Check native balance for gas
        const gasBalance = await publicClient.getBalance({ address: merchantAccount.address });
        if (gasBalance > BigInt(0)) {
          registryTxHash = await walletClient.writeContract({
            address: registryAddress as `0x${string}`,
            abi: REGISTRY_ABI,
            functionName: "register",
            args: [agentId, name, capabilities, agentWalletAddress as `0x${string}`]
          });
          
          await publicClient.waitForTransactionReceipt({ hash: registryTxHash as `0x${string}` });
          mode = "on-chain";
        } else {
          registryTxHash = "0xsim_" + Array.from({ length: 60 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
        }
      } catch (err: any) {
        console.warn("[Registry Contract] On-chain registration failed, falling back to simulation:", err.message);
        registryTxHash = "0xsim_" + Array.from({ length: 60 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
      }
    } else {
      registryTxHash = "0xsim_" + Array.from({ length: 60 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    }

    // 4. Save to Database
    const agentRecord = {
      agent_id: agentId,
      name,
      capabilities,
      wallet_address: agentWalletAddress,
      private_key: agentPrivateKey,
      reputation_score: 100, // starting reputation
      registry_tx_hash: registryTxHash
    };

    await saveAgent(agentRecord);

    return NextResponse.json({
      success: true,
      mode,
      agent: {
        agentId,
        name,
        capabilities,
        walletAddress: agentWalletAddress,
        reputationScore: 100,
        registryTxHash
      },
      circleResponse,
      message: mode === "on-chain"
        ? `Agent registered on-chain with registry contract ${registryAddress}`
        : `Agent registered in simulation mode. Wallet created: ${agentWalletAddress}`
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to register agent" },
      { status: 500 }
    );
  }
}

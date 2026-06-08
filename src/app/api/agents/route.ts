import { NextResponse } from "next/server";
import { getAllAgents } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const agents = await getAllAgents();
    
    // Default system agents if database list is empty, to ensure frontend loads correctly
    if (agents.length === 0) {
      const defaultAgents = [
        {
          agent_id: "taxauditbot",
          name: "TaxAuditBot",
          capabilities: "Reconcile Q1 corporate expense sheet against USDC invoices",
          wallet_address: "0x2a197ef4cd37e8c3384210d7a123f81e3a5042a9",
          reputation_score: 99,
          registry_tx_hash: "0xsim_taxaudit_init"
        },
        {
          agent_id: "treasurymaxbot",
          name: "TreasuryMaxBot",
          capabilities: "Optimize swap allocations & lock yield positions on Base Sepolia",
          wallet_address: "0x2a1906a28fd56bdf0449a11f224976a16223cf0a",
          reputation_score: 100,
          registry_tx_hash: "0xsim_treasurymax_init"
        },
        {
          agent_id: "marketinggenbot",
          name: "MarketingGenBot",
          capabilities: "Compose & distribute stablecoin adoption reports to partners",
          wallet_address: "0x2a19ff88d2345eb11029cba8c5efbc40938f712d",
          reputation_score: 96,
          registry_tx_hash: "0xsim_marketing_init"
        }
      ];
      return NextResponse.json({
        success: true,
        agents: defaultAgents
      });
    }

    // Map DB key fields back to camelCase or direct structure if needed
    const formattedAgents = agents.map(agent => ({
      agentId: agent.agent_id,
      name: agent.name,
      capabilities: agent.capabilities,
      walletAddress: agent.wallet_address,
      reputationScore: agent.reputation_score,
      registryTxHash: agent.registry_tx_hash
    }));

    return NextResponse.json({
      success: true,
      agents: formattedAgents
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch agents" },
      { status: 500 }
    );
  }
}

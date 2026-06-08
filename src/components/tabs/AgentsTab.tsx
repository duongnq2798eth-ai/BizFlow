import React from "react";
import { Info, Play, UserPlus, ShieldAlert, Award } from "lucide-react";
import styles from "./AgentsTab.module.css";

interface AgentsTabProps {
  selectedAgent: string;
  setSelectedAgent: (val: string) => void;
  agentJobAmount: string;
  setAgentJobAmount: (val: string) => void;
  agentJobDescription: string;
  setAgentJobDescription: (val: string) => void;
  isHiringAgent: boolean;
  agentJobStep: "idle" | "escrow" | "working" | "submitting" | "settled";
  agentJobTxHash: string;
  runAgentJob: () => void;
  
  // New props for ERC-8004 Registry & Agent Wallets
  agentsList: any[];
  isRegisteringAgent: boolean;
  newAgentId: string;
  setNewAgentId: (val: string) => void;
  newAgentName: string;
  setNewAgentName: (val: string) => void;
  newAgentCapabilities: string;
  setNewAgentCapabilities: (val: string) => void;
  handleRegisterAgent: () => void;
}

export const AgentsTab: React.FC<AgentsTabProps> = ({
  selectedAgent,
  setSelectedAgent,
  agentJobAmount,
  setAgentJobAmount,
  agentJobDescription,
  setAgentJobDescription,
  isHiringAgent,
  agentJobStep,
  agentJobTxHash,
  runAgentJob,
  
  agentsList,
  isRegisteringAgent,
  newAgentId,
  setNewAgentId,
  newAgentName,
  setNewAgentName,
  newAgentCapabilities,
  setNewAgentCapabilities,
  handleRegisterAgent
}) => {
  const [deals, setDeals] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  const fetchDeals = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/escrow");
      const data = await res.json();
      if (data.success) {
        setDeals(data.escrow_deals || []);
      }
    } catch (err) {
      console.error("Failed to fetch escrow deals:", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchDeals();
  }, []);

  React.useEffect(() => {
    if (!isHiringAgent) {
      fetchDeals();
    }
  }, [isHiringAgent]);

  React.useEffect(() => {
    if (agentJobStep === "settled" || agentJobStep === "idle") {
      fetchDeals();
    }
  }, [agentJobStep]);

  return (
    <>
      {/* Left docs column */}
      <div className="prose">
        <div className="badge-tag">AI Agent workforce</div>
        <h2>Escrowed AI Agent Payouts</h2>
        <p>
          Hire specialized AI agents to complete business operations automatically. To prevent fraud, payments are locked inside an <strong>ERC-8183 Job Escrow contract</strong> on the Arc Testnet. The agent&apos;s identity is verified via the <strong>ERC-8004 Agent Registry</strong>. Once the agent submits work deliverables and an evaluator oracle verifies them, funds are disbursed gaslessly.
        </p>

        <div className="alert-banner info">
          <Info size={16} className="text-tag" />
          <div>
            <strong>Evaluator Oracle:</strong> The evaluator oracle reads raw task deliverables and verifies signature proofs on-chain before authorizing escrow release.
          </div>
        </div>

        {/* ERC-8004 Registry Display */}
        <h3>ERC-8004 Registered Agent Identifiers</h3>
        <p className="text-muted" style={{ fontSize: "12px", marginTop: "-8px" }}>
          Active identity registries querying from Arc Testnet and localized caches.
        </p>
        
        <div className="table-container" style={{ marginBottom: "24px" }}>
          <table className="params-table">
            <thead>
              <tr>
                <th>Agent</th>
                <th>Capabilities</th>
                <th>Wallet Address</th>
                <th>Reputation</th>
              </tr>
            </thead>
            <tbody>
              {agentsList.map((agent) => (
                <tr key={agent.agentId}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Award size={14} className="text-tag" />
                      <strong style={{ color: "#ffffff" }}>{agent.name}</strong>
                    </div>
                    <code style={{ fontSize: "9px", color: "var(--steel)" }}>ID: {agent.agentId}</code>
                  </td>
                  <td style={{ fontSize: "11px", maxWidth: "160px", whiteSpace: "normal", wordBreak: "break-word" }}>
                    {agent.capabilities}
                  </td>
                  <td>
                    <a
                      href={`https://testnet.arcscan.app/address/${agent.walletAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: "10px", fontFamily: "monospace", color: "var(--accent)" }}
                    >
                      {agent.walletAddress.slice(0, 6)}...{agent.walletAddress.slice(-4)}
                    </a>
                  </td>
                  <td>
                    <span className="badge-tag" style={{
                      background: agent.reputationScore >= 95 ? "var(--brand-green-soft)" : "rgba(245, 158, 11, 0.1)",
                      color: agent.reputationScore >= 95 ? "var(--brand-green-deep)" : "#f59e0b",
                      fontSize: "10px",
                      padding: "2px 6px"
                    }}>
                      {agent.reputationScore}% score
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Register Agent Form */}
        <div className="control-group" style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px dashed var(--hairline-dark)", padding: "16px", borderRadius: "8px" }}>
          <div className="control-title" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <UserPlus size={16} className="text-tag" />
            <span>Register Custom AI Agent (ERC-8004)</span>
          </div>
          <p className="text-muted" style={{ fontSize: "11px", marginBottom: "12px" }}>
            Associate an autonomous capabilities agent with a secure Circle MPC Wallet and register their key on-chain.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="input-field">
              <label>Agent Identifier (lowercase)</label>
              <input
                type="text"
                placeholder="e.g. taxbot"
                value={newAgentId}
                onChange={(e) => setNewAgentId(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ""))}
              />
            </div>
            <div className="input-field">
              <label>Display Name</label>
              <input
                type="text"
                placeholder="e.g. TaxAuditBot"
                value={newAgentName}
                onChange={(e) => setNewAgentName(e.target.value)}
              />
            </div>
          </div>
          <div className="input-field" style={{ marginTop: "8px" }}>
            <label>Capabilities / Job Deliverable Spec</label>
            <input
              type="text"
              placeholder="e.g. Reconcile corporate spending and file tax compliance proofs"
              value={newAgentCapabilities}
              onChange={(e) => setNewAgentCapabilities(e.target.value)}
            />
          </div>

          <button
            className="btn-run"
            onClick={handleRegisterAgent}
            disabled={isRegisteringAgent || !newAgentId || !newAgentName || !newAgentCapabilities}
            style={{ width: "100%", marginTop: "12px", background: "linear-gradient(135deg, var(--accent) 0%, #6366f1 100%)" }}
          >
            <span>{isRegisteringAgent ? "Registering on Arc Testnet..." : "Register AI Agent Profile"}</span>
          </button>
        </div>

        <div className="divider" style={{ margin: "24px 0" }} />

        <h3>Escrow Deal History</h3>
        <p className="text-muted" style={{ fontSize: "12px", marginTop: "-8px" }}>
          Persisted records synced from Supabase DB on Arc transactions.
        </p>
        {loading && deals.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", margin: "12px 0" }}>
            <div style={{ height: "36px", width: "100%" }} className="skeleton-box" />
            <div style={{ height: "36px", width: "100%" }} className="skeleton-box" />
            <div style={{ height: "36px", width: "100%" }} className="skeleton-box" />
          </div>
        ) : deals.length === 0 ? (
          <p className="text-muted" style={{ fontSize: "12px" }}>No escrow deals found. Hire an agent to create one.</p>
        ) : (
          <div className="table-container">
            <table className="params-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Buyer/Seller</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {deals.map((deal) => (
                  <tr key={deal.id}>
                    <td>
                      <code style={{ fontSize: "10px" }}>{deal.on_chain_id === "pending_on_chain" ? "Pending" : deal.on_chain_id}</code>
                    </td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <span style={{ fontSize: "10px", color: "var(--muted)" }}>Buyer: {deal.buyer ? `${deal.buyer.slice(0, 6)}...${deal.buyer.slice(-4)}` : "N/A"}</span>
                        <span style={{ fontSize: "10px", color: "var(--muted)" }}>Seller: {deal.seller ? `${deal.seller.slice(0, 6)}...${deal.seller.slice(-4)}` : "N/A"}</span>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600, color: "var(--brand-green-deep)" }}>
                      {deal.total_amount} USDC
                    </td>
                    <td>
                      <span className="badge-tag" style={{
                        background: deal.status === "completed" || deal.status === "milestone_completed_and_funds_released" || deal.status === "funded" ? "var(--brand-green-soft)" : deal.status === "disputed" ? "#fef2f2" : "#eef2ff",
                        color: deal.status === "completed" || deal.status === "milestone_completed_and_funds_released" || deal.status === "funded" ? "var(--brand-green-deep)" : deal.status === "disputed" ? "var(--brand-error)" : "#4f46e5",
                        fontSize: "10px",
                        padding: "2px 6px",
                        borderRadius: "4px"
                      }}>
                        {deal.status === "milestone_completed_and_funds_released" ? "released" : deal.status}
                      </span>
                    </td>
                    <td style={{ fontSize: "10px", color: "var(--muted)" }}>
                      {new Date(deal.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Right sandbox column */}
      <div className="playground-panel-wrapper">
        <div className="control-group animate-fade-in">
          <div className="control-title">Hire AI Agent &amp; Lock Escrow</div>

          <div className="input-field">
            <label>Select AI Agent (ERC-8004 Verified)</label>
            <select
              value={selectedAgent}
              onChange={(e) => {
                setSelectedAgent(e.target.value);
                const selected = agentsList.find(a => a.agentId === e.target.value);
                if (selected) {
                  setAgentJobDescription(selected.capabilities || "");
                  if (selected.name.toLowerCase().includes("tax")) {
                    setAgentJobAmount("10.00");
                  } else if (selected.name.toLowerCase().includes("treasury")) {
                    setAgentJobAmount("25.00");
                  } else {
                    setAgentJobAmount("15.00");
                  }
                }
              }}
            >
              {agentsList.map((agent) => (
                <option key={agent.agentId} value={agent.agentId}>
                  {agent.name} (Reputation: {agent.reputationScore}% | Rate: {agent.name.toLowerCase().includes("tax") ? "10" : agent.name.toLowerCase().includes("treasury") ? "25" : "15"}.00 USDC)
                </option>
              ))}
            </select>
          </div>

          <div className="input-field">
            <label>Job Escrow Balance (USDC)</label>
            <input
              type="number"
              value={agentJobAmount}
              onChange={(e) => setAgentJobAmount(e.target.value)}
            />
          </div>

          <div className="input-field">
            <label>Task Deliverables Spec</label>
            <textarea
              value={agentJobDescription}
              onChange={(e) => setAgentJobDescription(e.target.value)}
              rows={2}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "6px",
                border: "1px solid var(--hairline-dark)",
                backgroundColor: "var(--input-bg)",
                color: "#ffffff",
                fontSize: "12px",
                fontFamily: "inherit",
                resize: "none"
              }}
            />
          </div>

          {agentJobStep !== "idle" && (
            <div className={styles.lifecycleCard}>
              <div className={styles.lifecycleTitle}>On-chain Job Lifecycle</div>
              <div className={styles.lifecycleList}>
                <div className={styles.lifecycleRow}>
                  <span>1. ERC-8183 Job Escrow Locked:</span>
                  <span className="text-green font-semibold">
                    {agentJobStep === "escrow" ? "PENDING..." : "CONFIRMED"}
                  </span>
                </div>
                <div className={styles.lifecycleRow}>
                  <span>2. AI Agent Processing Task:</span>
                  <span className={agentJobStep === "working" ? "text-yellow font-semibold animate-pulse" : (agentJobStep === "escrow" ? "text-muted" : "text-green font-semibold")}>
                    {agentJobStep === "escrow" ? "WAITING" : (agentJobStep === "working" ? "WORKING..." : "COMPLETED")}
                  </span>
                </div>
                <div className={styles.lifecycleRow}>
                  <span>3. Evaluator Oracle Verification:</span>
                  <span className={agentJobStep === "submitting" ? "text-yellow font-semibold animate-pulse" : (agentJobStep === "settled" ? "text-green font-semibold" : "text-muted")}>
                    {agentJobStep === "settled" ? "VERIFIED" : (agentJobStep === "submitting" ? "VERIFYING..." : "WAITING")}
                  </span>
                </div>
                <div className={styles.lifecycleRow}>
                  <span>4. Escrow Settled &amp; Disbursed:</span>
                  <span className={agentJobStep === "settled" ? "text-green font-semibold" : "text-muted"}>
                    {agentJobStep === "settled" ? "SETTLED" : "WAITING"}
                  </span>
                </div>
              </div>

              {agentJobTxHash && (
                <div className={styles.txLinkWrapper}>
                  <span className="text-muted">Job Tx Hash:</span>
                  <a
                    href={`https://testnet.arcscan.app/tx/${agentJobTxHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {agentJobTxHash.substring(0, 14)}...
                  </a>
                </div>
              )}
            </div>
          )}

          <button
            className="btn-run"
            onClick={runAgentJob}
            disabled={isHiringAgent}
            style={{ width: "100%", marginTop: "12px" }}
          >
            <Play size={14} />
            <span>{isHiringAgent ? "Executing AI Job Flow..." : "Hire AI Agent (On-Chain)"}</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default AgentsTab;

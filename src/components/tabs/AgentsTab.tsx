import React from "react";
import { Info, Play } from "lucide-react";
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
  runAgentJob
}) => {
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

        <h3>Agent Registry &amp; Identity</h3>
        <p>
          ERC-8004 provides metadata standards for autonomous agent wallets. This maps agent capability scores, past completion rates, and cryptographic public keys to allow corporate platforms to trust agent operations without custody risk.
        </p>
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
                if (e.target.value === "TaxAuditBot") {
                  setAgentJobAmount("10.00");
                  setAgentJobDescription("Reconcile Q1 corporate expense sheet against USDC invoices");
                } else if (e.target.value === "TreasuryMaxBot") {
                  setAgentJobAmount("25.00");
                  setAgentJobDescription("Optimize swap allocations & lock yield positions on Base Sepolia");
                } else {
                  setAgentJobAmount("15.00");
                  setAgentJobDescription("Compose & distribute stablecoin adoption reports to partners");
                }
              }}
            >
              <option value="TaxAuditBot">TaxAuditBot (Score: 99% | Rate: 10.00 USDC)</option>
              <option value="TreasuryMaxBot">TreasuryMaxBot (Score: 100% | Rate: 25.00 USDC)</option>
              <option value="MarketingGenBot">MarketingGenBot (Score: 96% | Rate: 15.00 USDC)</option>
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
                  <span className={agentJobStep !== "idle" ? "text-green font-semibold" : "text-muted"}>
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
            <span>{isHiringAgent ? "Broadcasting Escrow Deal..." : "Hire AI Agent (On-Chain)"}</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default AgentsTab;

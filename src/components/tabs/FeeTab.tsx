import React from "react";
import { Info, PieChart, Sliders } from "lucide-react";
import styles from "./FeeTab.module.css";

interface FeeTabProps {
  adminAddress: string;
  setAdminAddress: (val: string) => void;
  feePercent: string;
  setFeePercent: (val: string) => void;
  isSavingPolicy: boolean;
  saveFeePolicy: () => void;
}

export const FeeTab: React.FC<FeeTabProps> = ({
  adminAddress,
  setAdminAddress,
  feePercent,
  setFeePercent,
  isSavingPolicy,
  saveFeePolicy
}) => {
  return (
    <>
      {/* Left docs column */}
      <div className="prose">
        <div className="badge-tag">Platform Economics</div>
        <h2>Custom Fee Policy Configurator</h2>
        <p>
          Configure custom fee policies on-chain to generate revenue from payments processed through your platform. The SDK&apos;s <code>kit.unifiedBalance.setCustomFeePolicy()</code> enables a split-routing policy: <strong>90% of the custom fee</strong> is routed directly to the merchant platform admin wallet, and <strong>10% is routed to the Arc Network</strong> to fund gas abstraction paymasters.
        </p>

        <div className="alert-banner info">
          <Info size={16} className="text-tag" />
          <div>
            <strong>Eco-Sponsorship Split:</strong> The 10% contribution sent back to Arc is pooled to sponsor gasless checkout and payout transactions for smaller vendors, creating a self-sustaining stablecoin commerce system.
          </div>
        </div>

        <h3>Contract Interface Specification</h3>
        <p>
          The custom policy parameters are compiled and sent to the platform controller. Once approved, the smart account paymaster abstracts gas for all payments, but extracts the custom fee on settlement.
        </p>
      </div>

      {/* Right sandbox column */}
      <div className="playground-panel-wrapper">
        <div className="control-group animate-fade-in">
          <div className="control-title">Fee Policy Settings</div>

          <div className="input-field">
            <label>Platform Admin Payout Recipient Wallet</label>
            <input
              type="text"
              value={adminAddress}
              onChange={(e) => setAdminAddress(e.target.value)}
            />
          </div>

          <div className="input-field">
            <label>Platform Fee Policy (USDC per Payout)</label>
            <div className="range-wrapper">
              <input
                type="range"
                min="0.10"
                max="10.00"
                step="0.05"
                value={feePercent}
                onChange={(e) => setFeePercent(e.target.value)}
                style={{ width: "100%", accentColor: "var(--brand-green)" }}
              />
              <div className="flex-between text-xs mt-1">
                <span>0.10 USDC</span>
                <span className="font-semibold text-green">{feePercent} USDC</span>
                <span>10.00 USDC</span>
              </div>
            </div>
          </div>

          {/* Pie Chart Split visualization */}
          <div className={styles.splitVisualizer}>
            <div className={styles.visualizerHeader}>
              <PieChart size={14} />
              <span>On-Chain Payout Split</span>
            </div>

            <div className={styles.splitBarContainer}>
              <div
                className={styles.splitBarAdmin}
                style={{ width: "90%" }}
                title="Admin Payout"
              >
                Admin (90%): {(parseFloat(feePercent) * 0.9).toFixed(2)} USDC
              </div>
              <div
                className={styles.splitBarNetwork}
                style={{ width: "10%" }}
                title="Arc Gas Faucet Support"
              >
                Arc (10%): {(parseFloat(feePercent) * 0.1).toFixed(2)} USDC
              </div>
            </div>
          </div>

          <button
            className="btn-run"
            onClick={saveFeePolicy}
            disabled={isSavingPolicy || !adminAddress}
            style={{ width: "100%" }}
          >
            <Sliders size={14} />
            <span>{isSavingPolicy ? "Registering Policy..." : "Update Fee Policy"}</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default FeeTab;

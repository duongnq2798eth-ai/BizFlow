import React from "react";
import { Info, Play } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import styles from "./TemplatesTab.module.css";

interface TemplatesTabProps {
  tokenName: string;
  setTokenName: (val: string) => void;
  tokenSymbol: string;
  setTokenSymbol: (val: string) => void;
  useWalletExtension: boolean;
  setUseWalletExtension: (val: boolean) => void;
  isConnected: boolean;
  connectedAddress?: string;
  isDeployingContract: boolean;
  deploymentProgress: number;
  deployTemplate: () => void;
}

export const TemplatesTab: React.FC<TemplatesTabProps> = ({
  tokenName,
  setTokenName,
  tokenSymbol,
  setTokenSymbol,
  useWalletExtension,
  setUseWalletExtension,
  isConnected,
  connectedAddress,
  isDeployingContract,
  deploymentProgress,
  deployTemplate
}) => {
  return (
    <>
      {/* Left docs column */}
      <div className="prose">
        <div className="badge-tag">Developer Hub</div>
        <h2>Audited ERC-20 Token Templates</h2>
        <p>
          Need to deploy standard payment tokens or loyalty credits on Arc? BizFlow provides audited smart contract templates. These contracts deploy natively on the <strong>Arc Testnet</strong>, incorporating gas abstraction properties.
        </p>

        <div className="alert-banner info">
          <Info size={16} className="text-tag" />
          <div>
            <strong>Arc Chain Custom:</strong> Arc Network handles transaction fees directly in USDC. These templates support 18-decimal token structures compiled for EVM-equivalent speed.
          </div>
        </div>

        <h3>Contract Compilation</h3>
        <p>
          Deploying compilation schemas via the sandbox automatically packages the EVM bytecode of a standard ERC-20 token contract. You can choose to deploy either:
        </p>
        <ul className="step-list">
          <li><strong>Sandbox REST Agent:</strong> The backend API deploys using an ephemeral developer account on your behalf (gas sponsored).</li>
          <li><strong>Connected Web3 Wallet:</strong> Your browser wallet extension signs the transaction on Arc Testnet directly on-chain.</li>
        </ul>
      </div>

      {/* Right sandbox column */}
      <div className="playground-panel-wrapper">
        <div className="control-group animate-fade-in">
          <div className="control-title">ERC-20 Token Template Configuration</div>

          <div className="input-field">
            <label>Token Name</label>
            <input
              type="text"
              placeholder="e.g. BizFlow Stable"
              value={tokenName}
              onChange={(e) => setTokenName(e.target.value)}
            />
          </div>

          <div className="input-field">
            <label>Token Symbol</label>
            <input
              type="text"
              placeholder="e.g. BFUSDC"
              value={tokenSymbol}
              onChange={(e) => setTokenSymbol(e.target.value)}
            />
          </div>

          {/* Wallet Extension Toggle for on-chain deploy */}
          <div className="input-field" style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
            <input
              type="checkbox"
              id="deploy-wallet-toggle"
              checked={useWalletExtension}
              onChange={() => setUseWalletExtension(!useWalletExtension)}
              style={{ width: "16px", height: "16px" }}
            />
            <label htmlFor="deploy-wallet-toggle" style={{ cursor: "pointer", fontSize: "12px", marginBottom: 0 }}>
              Deploy via Connected Wallet (on-chain signing)
            </label>
          </div>

          {useWalletExtension && !isConnected && (
            <div style={{ margin: "8px 0" }}>
              <ConnectButton />
            </div>
          )}

          {useWalletExtension && isConnected && (
            <div className="alert-banner info" style={{ marginTop: "8px", fontSize: "11px" }}>
              <Info size={14} className="text-tag" />
              <div>
                Connected as <code>{connectedAddress?.slice(0, 6)}...{connectedAddress?.slice(-4)}</code> — 
                Your wallet will sign the contract deployment transaction on Arc Testnet.
              </div>
            </div>
          )}

          {isDeployingContract && (
            <div className={styles.progressContainer}>
              <div className="flex-between text-xs mb-1">
                <span>Deploying ERC-20 Contract...</span>
                <span>{deploymentProgress}%</span>
              </div>
              <div className={styles.progressTrack}>
                <div className={styles.progressFill} style={{ width: `${deploymentProgress}%` }} />
              </div>
            </div>
          )}

          <button
            className="btn-run"
            onClick={deployTemplate}
            disabled={isDeployingContract || !tokenName || !tokenSymbol || (useWalletExtension && !isConnected)}
            style={{ width: "100%", marginTop: "12px" }}
          >
            <Play size={14} />
            <span>
              {isDeployingContract
                ? "Broadcasting Deployment..."
                : useWalletExtension
                ? "Deploy via Wallet (Sign Tx)"
                : "Deploy Contract Template"}
            </span>
          </button>
        </div>
      </div>
    </>
  );
};

export default TemplatesTab;

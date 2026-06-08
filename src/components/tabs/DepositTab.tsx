import React from "react";
import { Info, Play, RefreshCw, Zap, AlertCircle, Check, Copy } from "lucide-react";
import styles from "./DepositTab.module.css";

interface DepositTabProps {
  depositAmount: string;
  setDepositAmount: (val: string) => void;
  depositChain: "arc_testnet" | "base_sepolia";
  setDepositChain: (val: "arc_testnet" | "base_sepolia") => void;
  privateKey: string;
  setPrivateKey: (val: string) => void;
  showKey: boolean;
  setShowKey: (val: boolean) => void;
  useWalletExtension: boolean;
  setUseWalletExtension: (val: boolean) => void;
  isDepositing: boolean;
  runDeposit: () => void;
  gatewayStreamedAmount: number;
  isStreamingGateway: boolean;
  toggleGatewayStream: () => void;
  withdrawChain: string;
  setWithdrawChain: (val: string) => void;
  withdrawAmount: string;
  setWithdrawAmount: (val: string) => void;
  withdrawRecipient: string;
  setWithdrawRecipient: (val: string) => void;
  isWithdrawingGateway: boolean;
  executeGatewayWithdraw: () => void;
  isConnected: boolean;
  queryOnChainUsdcBalance: (address: string) => void;
  isQueryingBalance: boolean;
  handleGenerateSandboxKey: () => void;
  isPrivateKeyValid: boolean;
  copyToClipboard: (text: string, id: string) => void;
  copiedText: string | null;
}

export const DepositTab: React.FC<DepositTabProps> = ({
  depositAmount,
  setDepositAmount,
  depositChain,
  setDepositChain,
  privateKey,
  setPrivateKey,
  showKey,
  setShowKey,
  useWalletExtension,
  setUseWalletExtension,
  isDepositing,
  runDeposit,
  gatewayStreamedAmount,
  isStreamingGateway,
  toggleGatewayStream,
  withdrawChain,
  setWithdrawChain,
  withdrawAmount,
  setWithdrawAmount,
  withdrawRecipient,
  setWithdrawRecipient,
  isWithdrawingGateway,
  executeGatewayWithdraw,
  isConnected,
  queryOnChainUsdcBalance,
  isQueryingBalance,
  handleGenerateSandboxKey,
  isPrivateKeyValid,
  copyToClipboard,
  copiedText
}) => {
  return (
    <>
      {/* Docs content */}
      <div className="prose">
        <div className="badge-tag">App Kit - Unified Balance</div>
        <h2>Interactive B2B Deposit Gateway</h2>
        <p>
          The Unified Balance deposit allows SMEs and enterprise platforms to funnel USDC from multiple source chains into a unified balance wallet on Arc Testnet. By invoking <code>kit.unifiedBalance.deposit()</code>, the SDK manages network switching, bridging allowances, and confirmations automatically.
        </p>

        <div className="alert-banner info">
          <Info size={16} className="text-tag" />
          <div>
            <strong>Dual Decimals Guard:</strong> Gas transaction fees on Arc use 18 decimals, while standard ERC-20 USDC amounts are formatted in 6 decimals.
          </div>
        </div>

        <h3>SDK Function Signature</h3>
        <div className="code-block-wrapper">
          <div className="code-header">
            <span>TypeScript</span>
            <button
              className="copy-btn"
              onClick={() =>
                copyToClipboard(
                  `import { UnifiedBalanceKit } from "@circle-fin/app-kit";\nimport { ViemAdapter } from "@circle-fin/adapter-viem-v2";\n\nconst adapter = new ViemAdapter({\n  privateKey: "0x...",\n  rpcUrl: "https://rpc.testnet.arc.network"\n});\n\nconst kit = new UnifiedBalanceKit({ adapter });\nconst txHash = await kit.unifiedBalance.deposit({\n  amount: "5.00",\n  chainId: 5042002 // Arc Testnet\n});`,
                  "f1_code"
                )
              }
            >
              {copiedText === "f1_code" ? <Check size={14} /> : <Copy size={14} />}
              <span>{copiedText === "f1_code" ? "Copied" : "Copy"}</span>
            </button>
          </div>
          <pre>
            <code>
{`import { UnifiedBalanceKit } from "@circle-fin/app-kit";
import { ViemAdapter } from "@circle-fin/adapter-viem-v2";

const adapter = new ViemAdapter({
  privateKey: "0x...",
  rpcUrl: "https://rpc.testnet.arc.network"
});

const kit = new UnifiedBalanceKit({ adapter });
const txHash = await kit.unifiedBalance.deposit({
  amount: "5.00",
  chainId: 5042002 // Arc Testnet
});`}
            </code>
          </pre>
        </div>

        <h3>Parameters</h3>
        <div className="table-container">
          <table className="params-table">
            <thead>
              <tr>
                <th>Property</th>
                <th>Type</th>
                <th>Requirement</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>amount</code></td>
                <td><code>string</code></td>
                <td><span className="badge-error">REQUIRED</span></td>
                <td>The amount of USDC to deposit, represented as a decimal string (e.g. <code>"5.00"</code>).</td>
              </tr>
              <tr>
                <td><code>chainId</code></td>
                <td><code>number</code></td>
                <td><span className="badge-error">REQUIRED</span></td>
                <td>Target Chain ID. Only supports <code>5042002</code> (Arc Testnet) or <code>84532</code> (Base Sepolia). Mainnet is blocked.</td>
              </tr>
              <tr>
                <td><code>adapter</code></td>
                <td><code>ViemAdapter</code></td>
                <td><span className="badge-error">REQUIRED</span></td>
                <td>Configured Viem account or wallet client adapter.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>Circle Gateway x402 Nanopayments</h3>
        <p>
          Circle&apos;s <strong>Gateway Nanopayments</strong> enables B2B micro-transactions down to <strong>$0.000001 USDC</strong>. Powered by the HTTP-native <strong>x402</strong> protocol, businesses can bill per API request, stream content, or finance real-time compute services gaslessly. Transactions are accumulated locally and settled on-chain in optimized batches.
        </p>
        <div className="alert-banner info">
          <Zap size={16} className="text-tag" style={{ minWidth: "16px" }} />
          <div>
            <strong>Arc Gas Abstraction:</strong> All micro-transactions on the x402 protocol are gas-free for the end-consumer, with fees absorbed by the provider using Arc smart accounts.
          </div>
        </div>
      </div>

      {/* Sandbox Controls Portal */}
      <div className="playground-panel-wrapper">
        <div className="control-group">
          <div className="control-title">Unified Balance Gateway Parameters</div>

          <div className="input-field">
            <label>Chain Configuration (Hardcoded Testnets)</label>
            <select
              value={depositChain}
              onChange={(e) => setDepositChain(e.target.value as any)}
            >
              <option value="arc_testnet">Arc Testnet (USDC Gas, ID: 5042002)</option>
              <option value="base_sepolia">Base Sepolia (L2 Faucet, ID: 84532)</option>
            </select>
            <div className="input-desc">Mainnet usage is strictly restricted in this sandbox.</div>
          </div>

          <div className="input-field">
            <label>Amount (USDC)</label>
            <div className="amount-input-wrapper">
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                min="0.01"
                step="0.01"
              />
              <span>USDC</span>
            </div>
          </div>

          <div className="input-field">
            <label>Wallet Connection Mode</label>
            <div className="checkbox-field">
              <input
                type="checkbox"
                id="wallet-ext"
                checked={useWalletExtension}
                onChange={(e) => setUseWalletExtension(e.target.checked)}
              />
              <label htmlFor="wallet-ext">Use Web3 Browser Extension (MetaMask)</label>
            </div>
          </div>

          {!useWalletExtension && (
            <div className="input-field">
              <div className="flex-between">
                <label>Developer Private Key</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    type="button"
                    className="text-btn"
                    onClick={handleGenerateSandboxKey}
                    style={{ color: "var(--brand-green)" }}
                  >
                    Generate Ephemeral Key
                  </button>
                  <span style={{ color: "var(--hairline-dark)" }}>|</span>
                  <button
                    type="button"
                    className="text-btn"
                    onClick={() => setShowKey(!showKey)}
                  >
                    {showKey ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className={styles.privateKeyWrapper}>
                <input
                  type={showKey ? "text" : "password"}
                  placeholder="e.g. 0x47ef92bc..."
                  value={privateKey}
                  onChange={(e) => setPrivateKey(e.target.value)}
                  className={!isPrivateKeyValid ? "input-error" : ""}
                />
              </div>

              {!isPrivateKeyValid && (
                <div className="error-alert">
                  <AlertCircle size={14} />
                  <span>Private key MUST start with 0x!</span>
                </div>
              )}
            </div>
          )}

          <button
            className="btn-run"
            onClick={runDeposit}
            disabled={isDepositing || (!useWalletExtension && !privateKey)}
            style={{ width: "100%", marginTop: "12px" }}
          >
            <Play size={14} />
            <span>{isDepositing ? "Running Blockchain Execution..." : "Run Snippet (On-Chain)"}</span>
          </button>

          <div className="ref-divider" style={{ borderTop: "1px dashed var(--hairline-dark)", margin: "16px 0" }} />

          <div className="control-title">Circle Gateway Unified Balance</div>

          <button
            className="btn-run"
            onClick={() => queryOnChainUsdcBalance("")}
            disabled={isQueryingBalance}
            style={{ width: "100%", background: "#1c1c1e", border: "1px solid var(--hairline-dark)", color: "#ffffff" }}
          >
            <RefreshCw size={14} className={isQueryingBalance ? "spinner" : ""} />
            <span>{isQueryingBalance ? "Querying Gateway..." : "Query Unified Gateway Balance"}</span>
          </button>

          <div className="ref-divider" style={{ borderTop: "1px dashed var(--hairline-dark)", margin: "16px 0" }} />

          <div className="control-title">Circle Gateway Withdrawal</div>

          <div className="input-field">
            <label>Destination Chain</label>
            <select
              value={withdrawChain}
              onChange={(e) => setWithdrawChain(e.target.value)}
              style={{ background: "var(--input-bg)", border: "1px solid var(--hairline-dark)", padding: "8px", borderRadius: "6px", width: "100%", color: "#ffffff" }}
            >
              <option value="arc_testnet">Arc Testnet</option>
              <option value="base_sepolia">Base Sepolia</option>
            </select>
          </div>

          <div className="input-field">
            <label>Withdrawal Amount (USDC)</label>
            <div className="amount-input-wrapper">
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
              />
              <span>USDC</span>
            </div>
          </div>

          <div className="input-field">
            <label>Recipient Address</label>
            <input
              type="text"
              placeholder="0x..."
              value={withdrawRecipient}
              onChange={(e) => setWithdrawRecipient(e.target.value)}
            />
          </div>

          <button
            className="btn-run"
            onClick={executeGatewayWithdraw}
            disabled={isWithdrawingGateway || !withdrawRecipient || !withdrawAmount}
            style={{ width: "100%", background: "#1c1c1e", border: "1px solid var(--hairline-dark)", color: "#ffffff", display: "flex", gap: "8px", alignItems: "center", justifyContent: "center" }}
          >
            <RefreshCw size={14} className={isWithdrawingGateway ? "spinner" : ""} />
            <span>{isWithdrawingGateway ? "Processing Withdrawal..." : "Withdraw via Gateway"}</span>
          </button>

          <div className="ref-divider" style={{ borderTop: "1px dashed var(--hairline-dark)", margin: "16px 0" }} />

          <div className="control-title">Gateway x402 Micropayment Streamer</div>

          <div style={{ background: "var(--surface)", border: "2px solid var(--hairline)", padding: "16px", borderRadius: "12px", marginBottom: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
            <div className="flex-between">
              <span className="text-xs font-semibold uppercase text-stone-500">Cumulative Streamed:</span>
              <span className="font-mono text-base font-extrabold text-green animate-pulse" style={{ letterSpacing: "0.02em" }}>
                {gatewayStreamedAmount.toFixed(6)} USDC
              </span>
            </div>
            <div className="flex-between text-2xs">
              <span>Active x402 Channel:</span>
              <span className={isStreamingGateway ? "text-green font-bold" : "text-stone-400"}>
                {isStreamingGateway ? "● STREAMING ACTIVE (300ms)" : "○ INACTIVE"}
              </span>
            </div>
            {isStreamingGateway && (
              <div className="progress-track" style={{ marginTop: "4px" }}>
                <div className="progress-bar streaming" style={{ width: "100%", height: "100%", background: "var(--brand-green)", animation: "pulse 1.5s infinite" }} />
              </div>
            )}
          </div>

          <button
            className={`btn-run ${isStreamingGateway ? "active" : ""}`}
            onClick={toggleGatewayStream}
            style={{ width: "100%", display: "flex", justifyContent: "center", textTransform: "uppercase", background: isStreamingGateway ? "var(--brand-error)" : "var(--brand-green)", color: isStreamingGateway ? "#ffffff" : "var(--primary)", border: "2px solid var(--hairline)" }}
          >
            <Zap size={14} className={isStreamingGateway ? "animate-bounce" : ""} />
            <span>{isStreamingGateway ? "Suspend Stream" : "Begin Live x402 Stream"}</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default DepositTab;

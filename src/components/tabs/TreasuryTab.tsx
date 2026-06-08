import React from "react";
import { Info, Play, Zap, Globe } from "lucide-react";
import styles from "./TreasuryTab.module.css";

interface TreasuryTabProps {
  treasuryAmount: string;
  setTreasuryAmount: (val: string) => void;
  treasuryFromToken: string;
  setTreasuryFromToken: (val: string) => void;
  treasuryToToken: string;
  setTreasuryToToken: (val: string) => void;
  treasurySourceChain: "base_sepolia" | "ethereum";
  setTreasurySourceChain: (val: "base_sepolia" | "ethereum") => void;
  treasuryTargetChain: "arc_testnet" | "base_sepolia";
  setTreasuryTargetChain: (val: "arc_testnet" | "base_sepolia") => void;
  isSwapping: boolean;
  executeSwap: () => void;
  isBridging: boolean;
  executeBridge: () => void;
}

export const TreasuryTab: React.FC<TreasuryTabProps> = ({
  treasuryAmount,
  setTreasuryAmount,
  treasuryFromToken,
  setTreasuryFromToken,
  treasuryToToken,
  setTreasuryToToken,
  treasurySourceChain,
  setTreasurySourceChain,
  treasuryTargetChain,
  setTreasuryTargetChain,
  isSwapping,
  executeSwap,
  isBridging,
  executeBridge
}) => {
  return (
    <>
      {/* Left docs column */}
      <div className="prose">
        <div className="badge-tag">Treasury Management</div>
        <h2>Treasury Swaps &amp; CCTP Routing</h2>
        <p>
          Idle USDC balances can be optimized dynamically. Through standard swapping protocols, platform administrators can swap idle USDC into tokenized yield products such as <strong>USYC</strong> (Tokenized U.S. Treasury Bills yielding 5.45% APY). Cross-chain liquidity routing is completed gaslessly via Circle&apos;s <strong>Cross-Chain Transfer Protocol (CCTP)</strong>.
        </p>

        <div className="alert-banner info">
          <Info size={16} className="text-tag" />
          <div>
            <strong>Zero Slippage CCTP:</strong> Circle CCTP burns USDC on the source chain and mints a 1:1 equivalent amount on the destination chain, ensuring no slippage or liquidity pooling risks.
          </div>
        </div>

        <h3>Cross-Chain Bridge Routing Architecture</h3>
        <p>
          Unlike traditional bridge wrapping models, CCTP operates natively. USDC is burned from the sender on base chain and minted directly to the recipient wallet on Arc Network, ensuring zero wrapped-asset risk and native compatibility with downstream apps.
        </p>
      </div>

      {/* Right sandbox column */}
      <div className="playground-panel-wrapper">
        <div className="control-group animate-fade-in">
          <div className="control-title">USDC Yield Optimizer</div>

          <div className="input-field">
            <label>Asset Pool Amount (USDC)</label>
            <div className="amount-input-wrapper">
              <input
                type="number"
                value={treasuryAmount}
                onChange={(e) => setTreasuryAmount(e.target.value)}
              />
              <span>USDC</span>
            </div>
          </div>

          <div className="input-field">
            <label>Target Yield Product</label>
            <select
              value={treasuryToToken}
              onChange={(e) => setTreasuryToToken(e.target.value)}
            >
              <option value="USYC">USYC (Tokenized US Treasuries - 5.45% APY)</option>
              <option value="EURC">EURC (Stable FX Hedging)</option>
            </select>
          </div>

          <button
            className="btn-run"
            onClick={executeSwap}
            disabled={isSwapping}
            style={{ width: "100%" }}
          >
            <Zap size={14} />
            <span>{isSwapping ? "Executing On-chain Swap..." : "Optimize Yield (Swap)"}</span>
          </button>

          <div className={styles.divider} />

          <div className="control-title">Cross-Chain Bridge Routing (CCTP)</div>

          <div className="input-field">
            <label>Source Liquidity Network</label>
            <select
              value={treasurySourceChain}
              onChange={(e) => setTreasurySourceChain(e.target.value as any)}
            >
              <option value="base_sepolia">Base Sepolia L2</option>
              <option value="ethereum">Ethereum Sepolia L1</option>
            </select>
          </div>

          <div className="input-field">
            <label>Destination Target Network</label>
            <select
              value={treasuryTargetChain}
              onChange={(e) => setTreasuryTargetChain(e.target.value as any)}
            >
              <option value="arc_testnet">Arc Testnet (Zero-Gas USDC Gas, ID: 5042002)</option>
              <option value="base_sepolia">Base Sepolia L2</option>
            </select>
          </div>

          <button
            className="btn-run"
            onClick={executeBridge}
            disabled={isBridging}
            style={{ width: "100%" }}
          >
            <Globe size={14} />
            <span>{isBridging ? "Initiating Cross-chain Bridge..." : "Bridge Assets (CCTP)"}</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default TreasuryTab;

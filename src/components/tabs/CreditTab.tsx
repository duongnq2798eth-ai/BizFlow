import React from "react";
import { TrendingUp, Play } from "lucide-react";
import styles from "./CreditTab.module.css";

interface CreditTabProps {
  creditCompanyId: string;
  setCreditCompanyId: (val: string) => void;
  creditVolume: string;
  setCreditVolume: (val: string) => void;
  creditScore: any;
  isCheckingCredit: boolean;
  checkCreditScore: () => void;
  drawdownWallet: string;
  setDrawdownWallet: (val: string) => void;
  drawdownAmount: string;
  setDrawdownAmount: (val: string) => void;
  isDrawingDown: boolean;
  executeDrawdown: () => void;
}

export const CreditTab: React.FC<CreditTabProps> = ({
  creditCompanyId,
  setCreditCompanyId,
  creditVolume,
  setCreditVolume,
  creditScore,
  isCheckingCredit,
  checkCreditScore,
  drawdownWallet,
  setDrawdownWallet,
  drawdownAmount,
  setDrawdownAmount,
  isDrawingDown,
  executeDrawdown
}) => {
  return (
    <>
      {/* Left docs column */}
      <div className="prose">
        <div className="badge-tag">B2B Trade Credit</div>
        <h2>Business Credit Line API</h2>
        <p>
          BizFlow enables platforms to offer immediate, underwritten trade credit. By calling the Credit scoring API with enterprise registration details and trade volume statistics, the scoring engine calculates credit limits and APY tiers dynamically. The business can then execute a drawdown directly to their registered wallet.
        </p>

        <h3>1. Querying Credit Score</h3>
        <div className="api-spec-card">
          <div className="api-endpoint-row">
            <span className="api-method post">POST</span>
            <span className="api-path">/api/credit</span>
          </div>
          <pre className="payload-code">
{`// Body payload
{
  "action": "score",
  "companyId": "${creditCompanyId}",
  "volume": "${creditVolume}"
}`}
          </pre>
        </div>

        <h3>2. Executing Drawdown</h3>
        <div className="api-spec-card">
          <div className="api-endpoint-row">
            <span className="api-method post">POST</span>
            <span className="api-path">/api/credit</span>
          </div>
          <pre className="payload-code">
{`// Body payload
{
  "action": "drawdown",
  "amount": "${drawdownAmount}",
  "walletAddress": "${drawdownWallet}"
}`}
          </pre>
        </div>
      </div>

      {/* Right sandbox column */}
      <div className="playground-panel-wrapper">
        <div className="control-group">
          <div className="control-title">Credit Underwriting Playground</div>

          <div className="input-field">
            <label>Company Identifier</label>
            <input
              type="text"
              value={creditCompanyId}
              onChange={(e) => setCreditCompanyId(e.target.value)}
            />
          </div>

          <div className="input-field">
            <label>Monthly Trade Volume (USDC Equivalent)</label>
            <select
              value={creditVolume}
              onChange={(e) => setCreditVolume(e.target.value)}
            >
              <option value="3000">Under 5,000 USDC / month</option>
              <option value="15000">5,000 - 20,000 USDC / month</option>
              <option value="50000">20,000 - 100,000 USDC / month</option>
              <option value="250000">Over 100,000 USDC / month</option>
            </select>
          </div>

          <button
            className="btn-run"
            onClick={checkCreditScore}
            disabled={isCheckingCredit}
            style={{ width: "100%" }}
          >
            <TrendingUp size={14} />
            <span>{isCheckingCredit ? "Analyzing Financials..." : "Assess Credit Rating"}</span>
          </button>

          {creditScore && (
            <div className={styles.creditScoreCard}>
              <div className={styles.scoreBadgeRow}>
                <span className={styles.scoreLabel}>Rating:</span>
                <span className={`${styles.scoreBadge} ${styles[creditScore.score] || ""}`}>
                  {creditScore.score}
                </span>
              </div>
              <div className={styles.scoreDetails}>
                <div className="flex-between text-xs py-1">
                  <span>Max Drawdown Limit:</span>
                  <span className="font-semibold text-green">{creditScore.creditLimit} USDC</span>
                </div>
                <div className="flex-between text-xs py-1">
                  <span>Interest Rate Tiers:</span>
                  <span className="font-semibold">{creditScore.interestRate}</span>
                </div>
              </div>
            </div>
          )}

          <div className={styles.divider} />

          <div className="control-title">USDC Credit Drawdown</div>

          <div className="input-field">
            <label>Recipient EVM Wallet Address</label>
            <input
              type="text"
              value={drawdownWallet}
              onChange={(e) => setDrawdownWallet(e.target.value)}
            />
          </div>

          <div className="input-field">
            <label>Drawdown Amount (USDC)</label>
            <div className="amount-input-wrapper">
              <input
                type="number"
                value={drawdownAmount}
                onChange={(e) => setDrawdownAmount(e.target.value)}
              />
              <span>USDC</span>
            </div>
          </div>

          <button
            className="btn-run"
            onClick={executeDrawdown}
            disabled={isDrawingDown || !drawdownWallet}
            style={{ width: "100%" }}
          >
            <Play size={14} />
            <span>{isDrawingDown ? "Broadcasting Drawdown..." : "Draw down funds"}</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default CreditTab;

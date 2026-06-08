import React from "react";
import { ShieldCheck, Check, Copy, RefreshCw } from "lucide-react";
import styles from "./CheckoutTab.module.css";

interface CheckoutTabProps {
  widgetMerchant: string;
  setWidgetMerchant: (val: string) => void;
  widgetAmount: string;
  setWidgetAmount: (val: string) => void;
  checkingSession: boolean;
  activeSession: any;
  clearSession: () => void;
  copyToClipboard: (text: string, id: string) => void;
  copiedText: string | null;
}

export const CheckoutTab: React.FC<CheckoutTabProps> = ({
  widgetMerchant,
  setWidgetMerchant,
  widgetAmount,
  setWidgetAmount,
  checkingSession,
  activeSession,
  clearSession,
  copyToClipboard,
  copiedText
}) => {
  const iframeOrigin =
    typeof window !== "undefined" ? window.location.origin : "";

  return (
    <>
      {/* Left docs column */}
      <div className="prose">
        <div className="badge-tag">Circle W3S SDK</div>
        <h2>Embeddable Checkout Widget</h2>
        <p>
          SME merchants can embed the BizFlow Checkout Widget directly on their web pages via standard HTML frames. Under the hood, the widget integrates both Circle&apos;s standard User-Controlled Wallet SDK (with legacy email PIN/Google login) and the new <strong>Circle Modular Wallets SDK (<code>@circle-fin/modular-wallets-core</code>)</strong> to offer biometrically authorized, gasless passkey transactions.
        </p>

        <div className="alert-banner warning">
          <ShieldCheck className="text-warn" size={16} />
          <div>
            <strong>Session Security:</strong> In production environments, the <code>userToken</code> acquired from Circle API must be stored inside a secure <strong>httpOnly Cookie</strong> rather than localStorage to mitigate Cross-Site Scripting (XSS) risks.
          </div>
        </div>

        <h3>Embedding Code</h3>
        <div className="code-block-wrapper">
          <div className="code-header">
            <span>HTML iFrame</span>
            <button
              className="copy-btn"
              onClick={() =>
                copyToClipboard(
                  `<iframe \n  src="https://bizflow.finance/widget/checkout?merchant=${encodeURIComponent(widgetMerchant)}&amount=${widgetAmount}" \n  width="400" \n  height="550" \n  style="border: none; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);"\n></iframe>`,
                  "f2_code"
                )
              }
            >
              {copiedText === "f2_code" ? <Check size={14} /> : <Copy size={14} />}
              <span>{copiedText === "f2_code" ? "Copied" : "Copy"}</span>
            </button>
          </div>
          <pre>
            <code>
{`<iframe 
  src="https://bizflow.finance/widget/checkout?merchant="${widgetMerchant}"&amount=${widgetAmount}" 
  width="400" 
  height="550" 
  style="border: none; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);"
></iframe>`}
            </code>
          </pre>
        </div>

        <h3>Implementation Guide</h3>
        <ol className="step-list">
          <li>Configure the merchant details and target USDC payment amount.</li>
          <li>The customer performs a Google OAuth login or registers a Passkey inside the sandboxed iframe.</li>
          <li>The server intercepts and saves the resulting <code>userToken</code> in an HttpOnly cookie to block client-side JavaScript access.</li>
          <li>A secure smart wallet is initialized on Arc Testnet, and the payment is signed with the user&apos;s PIN or biometric passkey (via ERC-4337 and Paymaster).</li>
        </ol>
      </div>

      {/* Right sandbox column */}
      <div className="playground-panel-wrapper">
        <div className="control-group">
          <div className="control-title">Checkout Widget Sandbox</div>

          <div className="input-field">
            <label>Merchant (SME Name)</label>
            <input
              type="text"
              value={widgetMerchant}
              onChange={(e) => setWidgetMerchant(e.target.value)}
            />
          </div>

          <div className="input-field">
            <label>Checkout Price (USDC)</label>
            <div className="amount-input-wrapper">
              <input
                type="number"
                value={widgetAmount}
                onChange={(e) => setWidgetAmount(e.target.value)}
              />
              <span>USDC</span>
            </div>
          </div>

          <div className={styles.iframePreviewArea}>
            <div className={styles.iframeLabel}>Live Iframe Sandbox Preview</div>
            <div className={styles.iframeWrapper}>
              <iframe
                src={`/widget/checkout?merchant=${encodeURIComponent(
                  widgetMerchant
                )}&amount=${widgetAmount}&origin=${encodeURIComponent(iframeOrigin)}`}
                title="BizFlow Checkout Widget"
              />
            </div>
          </div>

          <div className={styles.sessionCard}>
            <div className={styles.sessionHeader}>
              <ShieldCheck size={14} className="text-green" />
              <span>Secure Session Status (XSS Shield)</span>
            </div>

            {checkingSession ? (
              <div className="flex-center p-4">
                <RefreshCw size={16} className="spinner text-muted" />
              </div>
            ) : activeSession ? (
              <div className={styles.sessionBody}>
                <div className={styles.sessionRow}>
                  <span>Cookie Storage:</span>
                  <span className="badge-tag font-semibold">httpOnly Secure</span>
                </div>
                <div className={styles.sessionRow}>
                  <span>User Token:</span>
                  <span className="font-mono text-xs">{activeSession.userTokenMasked}</span>
                </div>
                <div className={styles.sessionRow}>
                  <span>Security Level:</span>
                  <span className="text-green font-semibold">XSS Blocked</span>
                </div>
                <button className={styles.btnLogout} onClick={clearSession}>
                  Clear Cookie Session
                </button>
              </div>
            ) : (
              <div className={styles.sessionEmpty}>
                <span>No active secure session cookie detected. Login via the Checkout Widget above to establish an HttpOnly session.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutTab;

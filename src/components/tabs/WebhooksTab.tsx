import React from "react";
import { Info, Bell, Check, Copy } from "lucide-react";
import styles from "./WebhooksTab.module.css";

interface WebhooksTabProps {
  webhookUrl: string;
  setWebhookUrl: (val: string) => void;
  webhookEvent: string;
  setWebhookEvent: (val: string) => void;
  isTestingWebhook: boolean;
  testWebhookDelivery: () => void;
  copyToClipboard: (text: string, id: string) => void;
  copiedText: string | null;
}

export const WebhooksTab: React.FC<WebhooksTabProps> = ({
  webhookUrl,
  setWebhookUrl,
  webhookEvent,
  setWebhookEvent,
  isTestingWebhook,
  testWebhookDelivery,
  copyToClipboard,
  copiedText
}) => {
  return (
    <>
      {/* Left docs column */}
      <div className="prose">
        <div className="badge-tag">Developer Infrastructure</div>
        <h2>Webhook Security &amp; Event Subscriptions</h2>
        <p>
          Subscribe to real-time events to update database states when payments, deposits, or trade credit underwriting events are executed on-chain. BizFlow dispatches cryptographically signed payloads containing detailed transaction schemas.
        </p>

        <div className="alert-banner info">
          <Info size={16} className="text-tag" />
          <div>
            <strong>HMAC SHA-256 Signatures:</strong> Every request headers contains a <code>X-BizFlow-Signature</code> computed using your shared endpoint secret key to verify data integrity.
          </div>
        </div>

        <h3>Event Types Reference</h3>
        <div className="table-container">
          <table className="params-table">
            <thead>
              <tr>
                <th>Event Title</th>
                <th>Trigger Moment</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>payment.succeeded</code></td>
                <td>A customer completes a checkout widget transaction and the block is confirmed.</td>
              </tr>
              <tr>
                <td><code>credit.approved</code></td>
                <td>A B2B enterprise credit application passes rating analysis and limits are set.</td>
              </tr>
              <tr>
                <td><code>deposit.confirmed</code></td>
                <td>Unified stablecoin deposit receipt is completed on Arc Testnet or Base.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>Signature Verification Example</h3>
        <div className="code-block-wrapper">
          <div className="code-header">
            <span>NodeJS / Express</span>
            <button
              className="copy-btn"
              onClick={() =>
                copyToClipboard(
                  `import crypto from "crypto";\n\napp.post("/webhooks", (req, res) => {\n  const sig = req.headers["x-bizflow-signature"];\n  const computed = crypto\n    .createHmac("sha256", process.env.WEBHOOK_SECRET)\n    .update(JSON.stringify(req.body))\n    .digest("hex");\n\n  if (sig !== computed) return res.status(400).send("Signature failure");\n  // Proceed with DB state updates...\n});`,
                  "f8_code"
                )
              }
            >
              {copiedText === "f8_code" ? <Check size={14} /> : <Copy size={14} />}
              <span>{copiedText === "f8_code" ? "Copied" : "Copy"}</span>
            </button>
          </div>
          <pre>
            <code>
{`import crypto from "crypto";

app.post("/webhooks", (req, res) => {
  const sig = req.headers["x-bizflow-signature"];
  const computed = crypto
    .createHmac("sha256", process.env.WEBHOOK_SECRET)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (sig !== computed) return res.status(400).send("Signature failure");
  // Proceed with DB state updates...
});`}
            </code>
          </pre>
        </div>
      </div>

      {/* Right sandbox column */}
      <div className="playground-panel-wrapper">
        <div className="control-group animate-fade-in">
          <div className="control-title">Webhook Endpoint Playground</div>

          <div className="input-field">
            <label>Webhook URL (Endpoint Server)</label>
            <input
              type="text"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
            />
          </div>

          <div className="input-field">
            <label>Event Type Trigger</label>
            <select
              value={webhookEvent}
              onChange={(e) => setWebhookEvent(e.target.value)}
            >
              <option value="payment.succeeded">payment.succeeded (Checkout success)</option>
              <option value="credit.approved">credit.approved (Credit Underwritten)</option>
              <option value="deposit.confirmed">deposit.confirmed (Gateway fund receipt)</option>
            </select>
          </div>

          <button
            className="btn-run"
            onClick={testWebhookDelivery}
            disabled={isTestingWebhook || !webhookUrl}
            style={{ width: "100%" }}
          >
            <Bell size={14} />
            <span>{isTestingWebhook ? "Sending Payload..." : "Send Test Webhook"}</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default WebhooksTab;

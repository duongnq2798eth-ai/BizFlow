import React from "react";
import { Info, Play, Zap, Send } from "lucide-react";
import styles from "./PaymentsTab.module.css";

interface PaymentsTabProps {
  payee1Address: string;
  setPayee1Address: (val: string) => void;
  payee1Amount: string;
  setPayee1Amount: (val: string) => void;
  payee2Address: string;
  setPayee2Address: (val: string) => void;
  payee2Amount: string;
  setPayee2Amount: (val: string) => void;
  scheduledDate: string;
  setScheduledDate: (val: string) => void;
  isProcessingBatch: boolean;
  executeBatchPayment: () => void;
  isScheduling: boolean;
  schedulePayment: () => void;
  copyToClipboard: (text: string, id: string) => void;
  copiedText: string | null;
}

export const PaymentsTab: React.FC<PaymentsTabProps> = ({
  payee1Address,
  setPayee1Address,
  payee1Amount,
  setPayee1Amount,
  payee2Address,
  setPayee2Address,
  payee2Amount,
  setPayee2Amount,
  scheduledDate,
  setScheduledDate,
  isProcessingBatch,
  executeBatchPayment,
  isScheduling,
  schedulePayment,
  copyToClipboard,
  copiedText
}) => {
  const [payments, setPayments] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/payments");
      const data = await res.json();
      if (data.success) {
        setPayments(data.payments || []);
      }
    } catch (err) {
      console.error("Failed to fetch payments:", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchPayments();
  }, []);

  React.useEffect(() => {
    if (!isProcessingBatch && !isScheduling) {
      fetchPayments();
    }
  }, [isProcessingBatch, isScheduling]);

  return (
    <>
      {/* Left docs column */}
      <div className="prose">
        <div className="badge-tag">Payments Engine</div>
        <h2>Supplier Batch &amp; Scheduled Payouts</h2>
        <p>
          Distribute funds to vendors globally in a single transaction. By grouping payouts, you reduce overhead and save up to <strong>90% on gas fees</strong> compared to executing individual transactions. BizFlow supports both immediate batch payouts and scheduled on-chain smart agreements.
        </p>

        <div className="alert-banner info">
          <Info size={16} className="text-tag" />
          <div>
            <strong>Paymaster Sponsorship:</strong> When dispatching payments through our platform API, transactions can be fully sponsored by our platform paymaster contract, enabling end-to-end gasless supplier payouts.
          </div>
        </div>

        <h3>API Snippet (Batch Payouts)</h3>
        <div className="code-block-wrapper">
          <div className="code-header">
            <span>TypeScript</span>
            <button
              className="copy-btn"
              onClick={() =>
                copyToClipboard(
                  `import { PaymentsKit } from "@circle-fin/app-kit";\n\nconst payments = new PaymentsKit({ apiKey: "YOUR_API_KEY" });\n\nconst batch = await payments.payouts.createBatch({\n  recipients: [\n    { address: "${payee1Address}", amount: "${payee1Amount}" },\n    { address: "${payee2Address}", amount: "${payee2Amount}" }\n  ]\n});`,
                  "f3_code"
                )
              }
            >
              {copiedText === "f3_code" ? (
                <span className="flex items-center gap-1"><Zap size={14} /> Copied</span>
              ) : (
                "Copy SDK Code"
              )}
            </button>
          </div>
          <pre>
            <code>
{`import { PaymentsKit } from "@circle-fin/app-kit";

const payments = new PaymentsKit({ apiKey: "YOUR_API_KEY" });

const batch = await payments.payouts.createBatch({
  recipients: [
    { address: "${payee1Address}", amount: "${payee1Amount}" },
    { address: "${payee2Address}", amount: "${payee2Amount}" }
  ]
});`}
            </code>
          </pre>
        </div>

        <div className="divider" style={{ margin: "24px 0" }} />

        <h3>Payout Settlement Logs</h3>
        <p className="text-muted" style={{ fontSize: "12px", marginTop: "-8px" }}>
          Persisted records synced from Supabase DB on Arc transactions.
        </p>
        {loading && payments.length === 0 ? (
          <p className="text-muted" style={{ fontSize: "12px" }}>Loading historical log...</p>
        ) : payments.length === 0 ? (
          <p className="text-muted" style={{ fontSize: "12px" }}>No payouts found. Execute a batch payment to begin.</p>
        ) : (
          <div className="table-container">
            <table className="params-table">
              <thead>
                <tr>
                  <th>Batch/Schedule ID</th>
                  <th>Type</th>
                  <th>Total Amount</th>
                  <th>Vendors</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((pmt) => (
                  <tr key={pmt.id}>
                    <td>
                      <code style={{ fontSize: "10px" }}>{pmt.batch_id}</code>
                    </td>
                    <td>
                      <span className="badge-tag" style={{
                        background: pmt.type === "batch" ? "var(--brand-green-soft)" : "#eef2ff",
                        color: pmt.type === "batch" ? "var(--brand-green-deep)" : "#4f46e5",
                        fontSize: "10px",
                        padding: "2px 6px",
                        borderRadius: "4px"
                      }}>
                        {pmt.type}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: "var(--brand-green-deep)" }}>
                      {pmt.total_amount} USDC
                    </td>
                    <td style={{ fontSize: "10px", color: "var(--muted)" }}>
                      {pmt.recipients && Array.isArray(pmt.recipients) ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          {pmt.recipients.map((rec: any, idx: number) => (
                            <div key={idx}>
                              {rec.address ? `${rec.address.slice(0, 6)}...${rec.address.slice(-4)}` : "N/A"} ({rec.amount} USDC)
                            </div>
                          ))}
                        </div>
                      ) : "N/A"}
                    </td>
                    <td style={{ fontSize: "10px", color: "var(--muted)" }}>
                      {new Date(pmt.created_at).toLocaleDateString()}
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
          <div className="control-title">Supplier Settlement Payouts</div>

          <div className={styles.payeeRow}>
            <div className={styles.payeeRowHeader}>Vendor Recipient 1</div>
            <div className="input-field" style={{ marginBottom: 0 }}>
              <input
                type="text"
                value={payee1Address}
                onChange={(e) => setPayee1Address(e.target.value)}
                placeholder="0x..."
              />
              <div className="amount-input-wrapper mt-1">
                <input
                  type="number"
                  value={payee1Amount}
                  onChange={(e) => setPayee1Amount(e.target.value)}
                />
                <span>USDC</span>
              </div>
            </div>
          </div>

          <div className={styles.payeeRow}>
            <div className={styles.payeeRowHeader}>Vendor Recipient 2</div>
            <div className="input-field" style={{ marginBottom: 0 }}>
              <input
                type="text"
                value={payee2Address}
                onChange={(e) => setPayee2Address(e.target.value)}
                placeholder="0x..."
              />
              <div className="amount-input-wrapper mt-1">
                <input
                  type="number"
                  value={payee2Amount}
                  onChange={(e) => setPayee2Amount(e.target.value)}
                />
                <span>USDC</span>
              </div>
            </div>
          </div>

          <button
            className="btn-run"
            onClick={executeBatchPayment}
            disabled={isProcessingBatch}
            style={{ width: "100%" }}
          >
            <Zap size={14} />
            <span>{isProcessingBatch ? "Processing Batch..." : "Execute Batch Payment"}</span>
          </button>

          <div className={styles.divider} />

          <div className="control-title">Schedule Scheduled Payout</div>

          <div className="input-field">
            <label>Target Payout Date</label>
            <input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
            />
          </div>

          <button
            className="btn-run btn-secondary"
            onClick={schedulePayment}
            disabled={isScheduling}
            style={{ width: "100%" }}
          >
            <Send size={14} />
            <span>{isScheduling ? "Scheduling Payout..." : "Schedule Payout"}</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default PaymentsTab;

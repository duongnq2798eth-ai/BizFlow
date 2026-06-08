import React from "react";
import { Info, Play, Zap, RefreshCw } from "lucide-react";
import styles from "./InvoiceTab.module.css";

interface InvoiceTabProps {
  invoiceBuyer: string;
  setInvoiceBuyer: (val: string) => void;
  invoiceAmount: string;
  setInvoiceAmount: (val: string) => void;
  invoiceDueDate: string;
  setInvoiceDueDate: (val: string) => void;
  invoiceDescription: string;
  setInvoiceDescription: (val: string) => void;
  invoicePoRef: string;
  setInvoicePoRef: (val: string) => void;
  invoiceEarlyDiscount: string;
  setInvoiceEarlyDiscount: (val: string) => void;
  actionInvoiceId: string;
  setActionInvoiceId: (val: string) => void;
  goodsReceiptRef: string;
  setGoodsReceiptRef: (val: string) => void;
  rejectReason: string;
  setRejectReason: (val: string) => void;
  batchInvoiceIds: string;
  setBatchInvoiceIds: (val: string) => void;
  statusInvoiceId: string;
  setStatusInvoiceId: (val: string) => void;
  viewedInvoice: any;
  isCreatingInvoice: boolean;
  handleCreateInvoice: () => void;
  isProcessingInvoiceAction: boolean;
  handleInvoiceAction: (action: "approve" | "settle" | "reject" | "dispute") => void;
  isBatchSettlingInvoices: boolean;
  handleBatchSettleInvoices: () => void;
  isFetchingInvoiceStatus: boolean;
  handleGetInvoiceStatus: () => void;
}

export const InvoiceTab: React.FC<InvoiceTabProps> = ({
  invoiceBuyer,
  setInvoiceBuyer,
  invoiceAmount,
  setInvoiceAmount,
  invoiceDueDate,
  setInvoiceDueDate,
  invoiceDescription,
  setInvoiceDescription,
  invoicePoRef,
  setInvoicePoRef,
  invoiceEarlyDiscount,
  setInvoiceEarlyDiscount,
  actionInvoiceId,
  setActionInvoiceId,
  goodsReceiptRef,
  setGoodsReceiptRef,
  rejectReason,
  setRejectReason,
  batchInvoiceIds,
  setBatchInvoiceIds,
  statusInvoiceId,
  setStatusInvoiceId,
  viewedInvoice,
  isCreatingInvoice,
  handleCreateInvoice,
  isProcessingInvoiceAction,
  handleInvoiceAction,
  isBatchSettlingInvoices,
  handleBatchSettleInvoices,
  isFetchingInvoiceStatus,
  handleGetInvoiceStatus
}) => {
  const [invoices, setInvoices] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/invoice");
      const data = await res.json();
      if (data.success) {
        setInvoices(data.invoices || []);
      }
    } catch (err) {
      console.error("Failed to fetch invoices:", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchInvoices();
  }, []);

  React.useEffect(() => {
    if (!isCreatingInvoice && !isProcessingInvoiceAction && !isBatchSettlingInvoices) {
      fetchInvoices();
    }
  }, [isCreatingInvoice, isProcessingInvoiceAction, isBatchSettlingInvoices]);

  return (
    <>
      {/* Docs content */}
      <div className="prose">
        <div className="badge-tag">B2B Trade Commerce</div>
        <h2>On-Chain B2B Invoices &amp; Settlement</h2>
        <p>
          Manage business invoice workflows directly on the Arc Testnet using <code>BizFlowInvoice.sol</code>. This system supports a complete lifecycle: invoice creation by suppliers, approval and goods receipt reference submission by buyers, dispute resolution, and on-chain settlement with optional early-payment discounts.
        </p>

        <div className="alert-banner info">
          <Info size={16} className="text-tag" />
          <div>
            <strong>Three-Way Matching:</strong> Before settlement, the buyer must invoke <code>approveInvoice(invoiceId, goodsReceiptRef)</code>. This binds the invoice to the physical goods receipt reference, enforcing auditing standards on-chain.
          </div>
        </div>

        <h3>Solidity Contract Interface</h3>
        <div className="code-block-wrapper">
          <div className="code-header">
            <span>BizFlowInvoice.sol</span>
          </div>
          <pre>
            <code>
{`// Create invoice with buyer details & PO reference
function createInvoice(
    address buyer,
    uint256 amount,
    uint256 dueDate,
    string calldata description,
    bytes32 purchaseOrderRef,
    uint16 earlyPayDiscount
) external returns (uint256);

// Approve with Goods Receipt reference
function approveInvoice(uint256 invoiceId, bytes32 goodsReceiptRef) external;

// Settle and transfer USDC from buyer to supplier (with early-pay discount calculation)
function settleInvoice(uint256 invoiceId) external;

// Batch settle multiple invoices in a single transaction
function batchSettle(uint256[] calldata invoiceIds) external;`}
            </code>
          </pre>
        </div>

        <h3>Early Payment Discounts</h3>
        <p>
          Suppliers can configure an <code>earlyPayDiscount</code> represented in basis points (e.g. <code>200</code> for 2.00%). If the buyer settles the invoice before the due date, the smart contract automatically deducts the discount amount, incentivizing early payment and optimizing the supplier's working capital.
        </p>

        <div className="divider" style={{ margin: "24px 0" }} />

        <h3>Historical Invoice Log</h3>
        <p className="text-muted" style={{ fontSize: "12px", marginTop: "-8px" }}>
          Persisted records synced from Supabase DB on Arc transactions.
        </p>
        {loading && invoices.length === 0 ? (
          <p className="text-muted" style={{ fontSize: "12px" }}>Loading historical log...</p>
        ) : invoices.length === 0 ? (
          <p className="text-muted" style={{ fontSize: "12px" }}>No invoices found. Create one in the playground to begin.</p>
        ) : (
          <div className="table-container">
            <table className="params-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Supplier/Buyer</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td>
                      <code style={{ fontSize: "10px" }}>{inv.on_chain_id === "pending_on_chain" ? "Pending" : inv.on_chain_id}</code>
                    </td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <span style={{ fontSize: "10px", color: "var(--muted)" }}>From: {inv.supplier ? `${inv.supplier.slice(0, 6)}...${inv.supplier.slice(-4)}` : "N/A"}</span>
                        <span style={{ fontSize: "10px", color: "var(--muted)" }}>To: {inv.buyer ? `${inv.buyer.slice(0, 6)}...${inv.buyer.slice(-4)}` : "N/A"}</span>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600, color: "var(--brand-green-deep)" }}>
                      {inv.amount} USDC
                    </td>
                    <td>
                      <span className="badge-tag" style={{
                        background: inv.status === "Settled" ? "var(--brand-green-soft)" : inv.status === "Approved" ? "#eef2ff" : inv.status === "Rejected" ? "#fef2f2" : "#fef3c7",
                        color: inv.status === "Settled" ? "var(--brand-green-deep)" : inv.status === "Approved" ? "#4f46e5" : inv.status === "Rejected" ? "var(--brand-error)" : "var(--brand-warn)",
                        fontSize: "10px",
                        padding: "2px 6px",
                        borderRadius: "4px"
                      }}>
                        {inv.status}
                      </span>
                    </td>
                    <td style={{ fontSize: "10px", color: "var(--muted)" }}>
                      {new Date(inv.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sandbox Controls Portal */}
      <div className="playground-panel-wrapper">
        <div className="control-group">
          <div className="control-title">Create B2B Invoice (Supplier)</div>

          <div className="input-field">
            <label>Buyer Wallet Address</label>
            <input
              type="text"
              placeholder="0x..."
              value={invoiceBuyer}
              onChange={(e) => setInvoiceBuyer(e.target.value)}
            />
          </div>

          <div className="input-field">
            <label>Invoice Amount (USDC)</label>
            <div className="amount-input-wrapper">
              <input
                type="number"
                placeholder="Amount"
                value={invoiceAmount}
                onChange={(e) => setInvoiceAmount(e.target.value)}
              />
              <span>USDC</span>
            </div>
          </div>

          <div className="input-field">
            <label>Due Date</label>
            <input
              type="date"
              value={invoiceDueDate}
              onChange={(e) => setInvoiceDueDate(e.target.value)}
            />
          </div>

          <div className="input-field">
            <label>Purchase Order PO Ref (Hex32 or Text)</label>
            <input
              type="text"
              placeholder="e.g. PO-99283"
              value={invoicePoRef}
              onChange={(e) => setInvoicePoRef(e.target.value)}
            />
          </div>

          <div className="input-field">
            <label>Early Pay Discount (%)</label>
            <select
              value={invoiceEarlyDiscount}
              onChange={(e) => setInvoiceEarlyDiscount(e.target.value)}
            >
              <option value="0">No early discount (0%)</option>
              <option value="100">1.00% early discount (100 bps)</option>
              <option value="200">2.00% early discount (200 bps)</option>
              <option value="500">5.00% early discount (500 bps)</option>
            </select>
          </div>

          <div className="input-field">
            <label>Description</label>
            <input
              type="text"
              placeholder="Goods description..."
              value={invoiceDescription}
              onChange={(e) => setInvoiceDescription(e.target.value)}
            />
          </div>

          <button
            className="btn-run"
            onClick={handleCreateInvoice}
            disabled={isCreatingInvoice}
            style={{ width: "100%" }}
          >
            <Play size={14} />
            <span>{isCreatingInvoice ? "Creating Invoice..." : "Create Invoice"}</span>
          </button>

          <div className={styles.divider} />

          <div className="control-title">Invoice Actions Console</div>

          <div className="input-field">
            <label>Target Invoice ID</label>
            <input
              type="number"
              placeholder="e.g. 1"
              value={actionInvoiceId}
              onChange={(e) => setActionInvoiceId(e.target.value)}
            />
          </div>

          <div className="input-field">
            <label>Goods Receipt Ref (for Approval)</label>
            <input
              type="text"
              placeholder="e.g. GR-9988"
              value={goodsReceiptRef}
              onChange={(e) => setGoodsReceiptRef(e.target.value)}
            />
          </div>

          <div className="input-field">
            <label>Rejection Reason</label>
            <input
              type="text"
              placeholder="e.g. Broken items"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>

          <div className={styles.invoiceActionsGrid}>
            <button
              className="btn-run"
              onClick={() => handleInvoiceAction("approve")}
              disabled={isProcessingInvoiceAction}
              style={{ background: "var(--brand-green)", color: "#ffffff" }}
            >
              <span>Approve (Match)</span>
            </button>
            <button
              className="btn-run"
              onClick={() => handleInvoiceAction("settle")}
              disabled={isProcessingInvoiceAction}
            >
              <span>Settle (USDC)</span>
            </button>
            <button
              className="btn-run"
              onClick={() => handleInvoiceAction("dispute")}
              disabled={isProcessingInvoiceAction}
              style={{ background: "var(--yellow)", color: "var(--primary)" }}
            >
              <span>Dispute</span>
            </button>
            <button
              className="btn-run"
              onClick={() => handleInvoiceAction("reject")}
              disabled={isProcessingInvoiceAction}
              style={{ background: "var(--brand-error)", color: "#ffffff" }}
            >
              <span>Reject</span>
            </button>
          </div>

          <div className={styles.divider} />

          <div className="control-title">Batch Invoice Payouts</div>

          <div className="input-field">
            <label>Invoice IDs (Comma-separated)</label>
            <input
              type="text"
              placeholder="e.g. 1, 2, 3"
              value={batchInvoiceIds}
              onChange={(e) => setBatchInvoiceIds(e.target.value)}
            />
          </div>

          <button
            className="btn-run"
            onClick={handleBatchSettleInvoices}
            disabled={isBatchSettlingInvoices}
            style={{ width: "100%" }}
          >
            <Zap size={14} />
            <span>{isBatchSettlingInvoices ? "Settling Batch..." : "Batch Settle Invoices"}</span>
          </button>

          <div className={styles.divider} />

          <div className="control-title">Invoice Audit &amp; Status</div>

          <div className="input-field">
            <label>Query Invoice ID</label>
            <input
              type="number"
              placeholder="e.g. 1"
              value={statusInvoiceId}
              onChange={(e) => setStatusInvoiceId(e.target.value)}
            />
          </div>

          <button
            className="btn-run"
            onClick={handleGetInvoiceStatus}
            disabled={isFetchingInvoiceStatus}
            style={{ width: "100%", background: "#1c1c1e", border: "1px solid var(--hairline-dark)", color: "#ffffff" }}
          >
            <RefreshCw size={14} className={isFetchingInvoiceStatus ? "spinner" : ""} />
            <span>{isFetchingInvoiceStatus ? "Fetching Audit..." : "Retrieve Invoice Info"}</span>
          </button>

          {viewedInvoice && (
            <div className={styles.auditCard}>
              <div className={styles.auditHeader}>
                <span>Status:</span>
                <span className="badge-tag">{viewedInvoice.status}</span>
              </div>
              <div className={styles.auditDetails}>
                <div className="flex-between py-1">
                  <span>Supplier:</span>
                  <span>{viewedInvoice.supplier.slice(0, 6)}...{viewedInvoice.supplier.slice(-4)}</span>
                </div>
                <div className="flex-between py-1">
                  <span>Buyer:</span>
                  <span>{viewedInvoice.buyer.slice(0, 6)}...{viewedInvoice.buyer.slice(-4)}</span>
                </div>
                <div className="flex-between py-1">
                  <span>Amount:</span>
                  <span className="text-green font-bold">{viewedInvoice.amount} USDC</span>
                </div>
                <div className="flex-between py-1">
                  <span>PO Ref:</span>
                  <span>{viewedInvoice.purchaseOrderRef || "N/A"}</span>
                </div>
                <div className="flex-between py-1">
                  <span>Goods Ref:</span>
                  <span>{viewedInvoice.goodsReceiptRef || "N/A"}</span>
                </div>
                <div className="flex-between py-1">
                  <span>Early Discount:</span>
                  <span>{(Number(viewedInvoice.earlyPayDiscount) / 100).toFixed(2)}%</span>
                </div>
                <div className="flex-between py-1">
                  <span>Due Date:</span>
                  <span>{new Date(Number(viewedInvoice.dueDate) * 1000).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default InvoiceTab;

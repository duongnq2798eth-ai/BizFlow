import React from "react";
import { Info, HelpCircle, Mail, ShieldAlert } from "lucide-react";

interface InfoTabsProps {
  activeTab: "about" | "faq" | "contact" | "legal";
}

export const InfoTabs: React.FC<InfoTabsProps> = ({ activeTab }) => {
  if (activeTab === "about") {
    return (
      <div className="prose animate-fade-in" style={{ width: "100%", maxWidth: "none" }}>
        <div className="badge-tag">Company &amp; Story</div>
        <h2>Our Story &amp; Mission</h2>
        <p>
          BizFlow was born out of the <strong>Stablecoins Commerce Stack Challenge</strong> with a singular mission: to democratize and automate financial workflows for small and medium-sized enterprises (SMEs) worldwide.
        </p>
        <p>
          Traditional business banking remains slow, expensive, and fragmented. By merging Circle&apos;s institutional-grade <strong>Programmable Wallets</strong> with <strong>Arc Testnet&apos;s sub-second transaction finality and native USDC gas rails</strong>, we have built a seamless finance stack that handles payments, payouts, custom fee routing, credit scoring, and automated AI workforce escrows under one unified grid.
        </p>

        <h3>Why BizFlow Matters</h3>
        <div className="alert-banner info">
          <Info size={16} className="text-tag" />
          <div>
            <strong>Human-First Engineering:</strong> We believe Web3 products should be as simple as legacy SaaS. BizFlow hides blockchain complexity—gas fees are handled natively in USDC, and wallets are provisioned securely via Circle social onboarding.
          </div>
        </div>

        <h3>Core Team Core Values</h3>
        <div className="table-container">
          <table className="params-table">
            <thead>
              <tr>
                <th>Value</th>
                <th>Operational Target</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Zero Onboarding Friction</strong></td>
                <td>Users can invoke smart contract escrows without holding secondary gas tokens like ETH or AVAX.</td>
              </tr>
              <tr>
                <td><strong>Programmable Security</strong></td>
                <td>Milestone-based escrows ensure that international suppliers are settled only upon verified deliveries.</td>
              </tr>
              <tr>
                <td><strong>Open-Source Transparency</strong></td>
                <td>Our Solidity escrow deals and credit scoring indexes are fully verifiable and auditable on-chain.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (activeTab === "faq") {
    return (
      <div className="prose animate-fade-in" style={{ width: "100%", maxWidth: "none" }}>
        <div className="badge-tag">Knowledge Base</div>
        <h2>Frequently Asked Questions</h2>
        <p>
          Find answers to common questions about the BizFlow Stablecoin Commerce Stack, integrated networks, and programmable security features.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "16px" }}>
          <details className="faq-details" style={{ border: "2px solid var(--hairline)", borderRadius: "8px", padding: "16px", background: "var(--surface)" }}>
            <summary style={{ fontWeight: 800, cursor: "pointer", fontFamily: "var(--font-syne)", textTransform: "uppercase", fontSize: "14px" }}>
              * What is BizFlow?
            </summary>
            <p style={{ marginTop: "12px", fontSize: "14px", color: "var(--charcoal)", lineHeight: 1.5 }}>
              BizFlow is an interactive developer playground and suite of B2B payment tools designed to simplify stablecoin business operations. We provide pre-built checkout widgets, customized fee policies, credit rating models, and multi-signature escrows powered by Circle W3S and Arc Testnet.
            </p>
          </details>

          <details className="faq-details" style={{ border: "2px solid var(--hairline)", borderRadius: "8px", padding: "16px", background: "var(--surface)" }}>
            <summary style={{ fontWeight: 800, cursor: "pointer", fontFamily: "var(--font-syne)", textTransform: "uppercase", fontSize: "14px" }}>
              * How are gas fees handled on the Arc network?
            </summary>
            <p style={{ marginTop: "12px", fontSize: "14px", color: "var(--charcoal)", lineHeight: 1.5 }}>
              Unlike traditional EVM networks where developers must acquire volatile native utility tokens (like ETH) to execute contract transactions, the Arc Testnet uses **USDC directly as its native gas token**. This means your gas fees are predictable and paid using the exact same asset being transacted.
            </p>
          </details>

          <details className="faq-details" style={{ border: "2px solid var(--hairline)", borderRadius: "8px", padding: "16px", background: "var(--surface)" }}>
            <summary style={{ fontWeight: 800, cursor: "pointer", fontFamily: "var(--font-syne)", textTransform: "uppercase", fontSize: "14px" }}>
              * Is my wallet private key secure in this sandbox?
            </summary>
            <p style={{ marginTop: "12px", fontSize: "14px", color: "var(--charcoal)", lineHeight: 1.5 }}>
              Yes. All sandbox private keys generated locally are kept strictly in your local browser memory and never uploaded to any external server. For enterprise-grade security, live payments leverage **Circle W3S Programmable Wallets**, which utilize Multi-Party Computation (MPC) to secure operations.
            </p>
          </details>

          <details className="faq-details" style={{ border: "2px solid var(--hairline)", borderRadius: "8px", padding: "16px", background: "var(--surface)" }}>
            <summary style={{ fontWeight: 800, cursor: "pointer", fontFamily: "var(--font-syne)", textTransform: "uppercase", fontSize: "14px" }}>
              * Who can use the B2B Credit Scoring API?
            </summary>
            <p style={{ marginTop: "12px", fontSize: "14px", color: "var(--charcoal)", lineHeight: 1.5 }}>
              Our Credit Scoring model analyzes historical contract fulfillments, escrow release speeds, and volume of successful stablecoin settlements on-chain to rank wallet addresses from AAA (Excellent) down to D (Default). This enables decentralized supplier credit assessment.
            </p>
          </details>
        </div>
      </div>
    );
  }

  if (activeTab === "contact") {
    return (
      <div className="prose animate-fade-in" style={{ width: "100%", maxWidth: "none" }}>
        <div className="badge-tag">Get in Touch</div>
        <h2>Support &amp; Feedback</h2>
        <p>
          Have questions or need technical support? We are committed to providing premium support for developers and enterprise clients alike.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            alert("Thank you! Your feedback has been received. Our team will get back to you shortly.");
          }}
          style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "16px", padding: "20px", border: "2px solid var(--hairline)", borderRadius: "12px", background: "var(--surface)" }}
        >
          <div className="input-field" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "12px", fontWeight: "bold" }}>Full Name</label>
            <input type="text" placeholder="e.g. John Doe" required style={{ border: "1px solid var(--hairline-dark)", background: "var(--input-bg)", color: "#fff", padding: "10px", borderRadius: "8px" }} />
          </div>
          <div className="input-field" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "12px", fontWeight: "bold" }}>Contact Email</label>
            <input type="email" placeholder="e.g. john@company.com" required style={{ border: "1px solid var(--hairline-dark)", background: "var(--input-bg)", color: "#fff", padding: "10px", borderRadius: "8px" }} />
          </div>
          <div className="input-field" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "12px", fontWeight: "bold" }}>Support Category</label>
            <select style={{ border: "1px solid var(--hairline-dark)", background: "var(--input-bg)", color: "#fff", padding: "10px", borderRadius: "8px" }}>
              <option>General Inquiry / Partner request</option>
              <option>Circle W3S Integration Help</option>
              <option>Arc Testnet Gas/RPC Issues</option>
              <option>Report a Bug</option>
            </select>
          </div>
          <div className="input-field" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "12px", fontWeight: "bold" }}>Your Message</label>
            <textarea
              rows={4}
              placeholder="Describe your issue or suggestions..."
              required
              style={{ border: "1px solid var(--hairline-dark)", padding: "12px", borderRadius: "8px", background: "var(--input-bg)", color: "#fff", width: "100%", outline: "none", fontSize: "14px" }}
            />
          </div>
          <button type="submit" className="btn-run" style={{ width: "100%", display: "flex", justifyContent: "center", textTransform: "uppercase" }}>
            Submit Inquiry
          </button>
        </form>

        <h3>Community Channels</h3>
        <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="badge-tag" style={{ textDecoration: "none" }}>GitHub</a>
          <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="badge-tag" style={{ textDecoration: "none" }}>Twitter / X</a>
          <a href="https://telegram.org" target="_blank" rel="noopener noreferrer" className="badge-tag" style={{ textDecoration: "none" }}>Telegram</a>
          <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="badge-tag" style={{ textDecoration: "none" }}>Discord</a>
        </div>
      </div>
    );
  }

  if (activeTab === "legal") {
    return (
      <div className="prose animate-fade-in" style={{ width: "100%", maxWidth: "none" }}>
        <div className="badge-tag">Compliance</div>
        <h2>Legal Agreement</h2>
        <p style={{ fontSize: "11px", color: "var(--stone)" }}>Last updated: June 1, 2026</p>

        <h3>1. Terms of Service</h3>
        <p>
          By accessing the BizFlow developer portal and stablecoin checkout gateway, you agree to comply with all applicable local, national, and international financial regulations. The services provided within this interactive portal are meant strictly for testing and validation on the **Arc Testnet** and **Circle Sandbox environments**.
        </p>
        <p>
          We accept no liability for any mainnet assets bridged or sent to testnet smart contract addresses by accident.
        </p>

        <h3>2. Privacy Policy</h3>
        <p>
          We do not collect, store, or sell any private wallet keys generated within this portal. All credentials and private keys generated during your session are kept completely within your local browser storage. We implement standard industry security patterns to protect cookies and access payloads during integration simulations.
        </p>

        <div className="alert-banner info">
          <Info size={16} className="text-tag" />
          <div>
            <strong>Regulatory Attestation:</strong> Under Sandbox terms, no real financial value is created, custodied, or transacted within this domain. All USDC transacted is mock testnet stablecoin.
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default InfoTabs;

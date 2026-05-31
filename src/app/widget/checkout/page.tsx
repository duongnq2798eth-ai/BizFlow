"use client";

import React, { useState, useEffect } from "react";
import { Loader2, ShieldCheck, Wallet, ArrowRight, CheckCircle2 } from "lucide-react";

export default function CheckoutWidget() {
  const [merchantName, setMerchantName] = useState("BizFlow SME");
  const [amount, setAmount] = useState("25.00");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"login" | "wallet" | "confirm" | "success">("login");
  const [email, setEmail] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [txHash, setTxHash] = useState("");
  const [error, setError] = useState("");

  const [targetOrigin, setTargetOrigin] = useState("*");

  useEffect(() => {
    // Parse query params if available
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const queryMerchant = searchParams.get("merchant");
      const queryAmount = searchParams.get("amount");
      const queryOrigin = searchParams.get("origin");
      if (queryMerchant) setMerchantName(queryMerchant);
      if (queryAmount) setAmount(queryAmount);
      if (queryOrigin) setTargetOrigin(queryOrigin);
    }
  }, []);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    // Simulate OAuth handshake
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setLoading(false);
    setStep("wallet");
  };

  const handleCreateWallet = async () => {
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }
    setLoading(true);
    setError("");

    try {
      // Simulate Circle Web3 Services SDK: @circle-fin/w3s-pw-web-sdk wallet creation
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      const mockAddress = "0x82f1" + Math.random().toString(16).substring(2, 10) + "..." + Math.random().toString(16).substring(2, 6);
      
      // Save userToken securely via our HttpOnly session API to protect from XSS
      const mockToken = "circle_ut_" + Math.random().toString(36).substring(2, 18);
      await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userToken: mockToken, userId: email })
      });

      setWalletAddress(mockAddress);
      setLoading(false);
      setStep("confirm");
    } catch (err: any) {
      setError("Failed to initialize wallet: " + err.message);
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    setError("");
    try {
      // Simulate transaction execution on Arc Testnet (USDC-native gas)
      await new Promise((resolve) => setTimeout(resolve, 1800));
      const hash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
      setTxHash(hash);
      setLoading(false);
      setStep("success");

      // Notify parent website through postMessage (standard for secure iframe integrations)
      if (typeof window !== "undefined" && window.parent) {
        window.parent.postMessage(
          {
            event: "bizflow_payment_success",
            amount,
            txHash: hash,
            walletAddress
          },
          targetOrigin
        );
      }
    } catch (err: any) {
      setError("Payment failed: " + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="checkout-widget-container">
      {/* Header */}
      <div className="header">
        <div className="header-logo">
          <Wallet size={16} className="logo-green" />
          <span>BizFlow <span className="logo-green">Pay</span></span>
        </div>
        <span className="network-badge">Arc Testnet</span>
      </div>

      {/* Content */}
      <div className="content">
        {step === "login" && (
          <div>
            <div className="summary">
              <span className="summary-label">Paying to</span>
              <div className="merchant-name">{merchantName}</div>
              <div className="amount-display">
                {amount} <span className="amount-unit">USDC</span>
              </div>
            </div>

            <div className="social-btn-container">
              <button 
                onClick={handleGoogleLogin} 
                className="btn-google"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 size={16} className="spinner" />
                ) : (
                  <svg className="g-logo" viewBox="0 0 24 24" width="16" height="16">
                    <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.525 0-6.39-2.865-6.39-6.39s2.865-6.39 6.39-6.39c1.616 0 3.097.606 4.237 1.6l3.15-3.15C19.14 2.19 15.93.9 12.24.9 5.866.9.7 6.066.7 12.45s5.166 11.55 11.54 11.55c6.68 0 11.1-4.69 11.1-11.27 0-.525-.045-1.05-.135-1.56H12.24z"/>
                  </svg>
                )}
                <span>Continue with Google</span>
              </button>

              <div className="divider">or use email</div>

              <div className="input-group">
                <label className="input-label">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com" 
                  className="text-input"
                  disabled={loading}
                />
              </div>

              <button 
                onClick={handleCreateWallet} 
                className="btn-primary"
                disabled={loading || !email}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="spinner" />
                    <span>Creating Wallet...</span>
                  </>
                ) : (
                  <>
                    <span>Next</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              {error && <div className="error-message">{error}</div>}
            </div>
          </div>
        )}

        {step === "wallet" && (
          <div style={{ textAlign: "center" }}>
            <div className="summary">
              <Loader2 size={36} className="spinner logo-green" style={{ margin: "0 auto 16px" }} />
              <div className="merchant-name" style={{ fontSize: "16px" }}>Creating User-Controlled Wallet</div>
              <p style={{ fontSize: "13px", color: "#5a5a5c", marginTop: "8px" }}>
                Initializing Circle W3S non-custodial wallet infrastructure on Arc Network...
              </p>
            </div>
          </div>
        )}

        {step === "confirm" && (
          <div>
            <div className="summary">
              <span className="summary-label">Pay from New Wallet</span>
              <div className="amount-display" style={{ margin: "6px 0 12px" }}>
                {amount} <span className="amount-unit">USDC</span>
              </div>
              
              <div style={{ background: "#f7f7f7", border: "1px solid #e5e5e5", borderRadius: "8px", padding: "12px", fontSize: "12px", textAlign: "left", display: "flex", flexDirection: "column", gap: "4px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#5a5a5c" }}>Wallet Address:</span>
                  <span className="tx-value" style={{ fontWeight: 600 }}>{walletAddress}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#5a5a5c" }}>Network:</span>
                  <span style={{ color: "#00d4a4", fontWeight: 600 }}>Arc Testnet</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#5a5a5c" }}>Gas Token:</span>
                  <span style={{ fontWeight: 600 }}>USDC (Sponsored/Native)</span>
                </div>
              </div>
            </div>

            <button 
              onClick={handlePayment} 
              className="btn-primary"
              disabled={loading}
              style={{ marginTop: "12px" }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="spinner" />
                  <span>Processing Payment...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={16} />
                  <span>Authorize & Pay {amount} USDC</span>
                </>
              )}
            </button>
            
            {error && <div className="error-message">{error}</div>}
          </div>
        )}

        {step === "success" && (
          <div className="success-box">
            <CheckCircle2 className="success-icon" />
            <h3 style={{ fontSize: "18px", fontWeight: 600 }}>Payment Complete!</h3>
            <p style={{ fontSize: "13px", color: "#5a5a5c", marginTop: "6px" }}>
              Successfully processed using Arc Testnet&apos;s sub-second finality.
            </p>

            <div className="tx-details">
              <div className="tx-row">
                <span style={{ color: "#5a5a5c" }}>Recipient:</span>
                <span style={{ fontWeight: 500 }}>{merchantName}</span>
              </div>
              <div className="tx-row">
                <span style={{ color: "#5a5a5c" }}>Amount Paid:</span>
                <span style={{ fontWeight: 600, color: "#00d4a4" }}>{amount} USDC</span>
              </div>
              <div className="tx-row" style={{ flexDirection: "column", marginTop: "6px" }}>
                <span style={{ color: "#5a5a5c", marginBottom: "2px" }}>Transaction Hash:</span>
                <span className="tx-value">{txHash}</span>
              </div>
            </div>

            <div style={{ marginTop: "20px", fontSize: "12px", color: "#888888", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
              <ShieldCheck size={14} className="logo-green" />
              <span>XSS Protected Secure Token Session</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="footer">
        <ShieldCheck size={12} className="logo-green" />
        <span>Secured by Circle Web3 Services</span>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Building2, 
  Key, 
  Settings, 
  Code, 
  History, 
  ArrowLeft, 
  ShieldCheck, 
  Copy, 
  Check, 
  RefreshCw, 
  Sparkles,
  ExternalLink,
  Coins
} from "lucide-react";

interface Merchant {
  id: string;
  name: string;
  wallet_address: string;
  api_key: string;
  fee_policy: string;
}

interface Payment {
  id: string;
  type: string;
  recipients: any[];
  total_amount: string;
  tx_hash: string;
  created_at: string;
}

export default function MerchantDashboard() {
  // Navigation & UI tabs
  const [activeSubTab, setActiveSubTab] = useState<"register" | "keys" | "fees" | "embed" | "history">("register");

  // Registration Form States
  const [businessName, setBusinessName] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [industry, setIndustry] = useState("E-Commerce");
  const [feeSplit, setFeeSplit] = useState("1.0");
  const [isRegistering, setIsRegistering] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);

  // Active Merchant Profile (persisted locally)
  const [currentMerchant, setCurrentMerchant] = useState<Merchant | null>(null);

  // API Key & Permission States
  const [isRegeneratingKey, setIsRegeneratingKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [scopes, setScopes] = useState([
    { id: "payments:write", label: "Execute Payments", active: true },
    { id: "payments:read", label: "Read Payment History", active: true },
    { id: "invoices:write", label: "Create Invoices", active: true },
    { id: "escrow:manage", label: "Lock & Release Escrow", active: false }
  ]);

  // Embed Widget Configuration
  const [widgetAmount, setWidgetAmount] = useState("50.00");
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  // Payment History State
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [copiedFieldId, setCopiedFieldId] = useState<string | null>(null);

  // Load merchant session on start
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("bizflow_current_merchant");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setCurrentMerchant(parsed);
          setActiveSubTab("keys"); // Jump directly to dashboard tabs
        } catch (e) {
          console.error("Failed to parse stored merchant session.");
        }
      }
    }
    fetchPaymentHistory();
  }, []);

  const fetchPaymentHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch("/api/payments");
      const data = await res.json();
      if (data.success && data.payments) {
        setPayments(data.payments);
      }
    } catch (err) {
      console.error("Failed to fetch payment history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName || !walletAddress) return;
    setIsRegistering(true);
    try {
      const res = await fetch("/api/merchant/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName,
          walletAddress,
          industry,
          feeSplitPercent: feeSplit
        })
      });
      const data = await res.json();
      if (data.success) {
        const merchantObj: Merchant = {
          id: data.merchantId,
          name: data.businessName,
          wallet_address: data.walletAddress,
          api_key: data.apiKey,
          fee_policy: JSON.stringify({
            adminSplitPercent: data.feeSplitPercent,
            industry
          })
        };
        setCurrentMerchant(merchantObj);
        localStorage.setItem("bizflow_current_merchant", JSON.stringify(merchantObj));
        setRegSuccess(true);
        setTimeout(() => {
          setRegSuccess(false);
          setActiveSubTab("keys");
        }, 1500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleRegenerateKey = async () => {
    if (!currentMerchant) return;
    setIsRegeneratingKey(true);
    try {
      const res = await fetch("/api/merchant/apikeys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ merchantId: currentMerchant.id })
      });
      const data = await res.json();
      if (data.success) {
        const updated = { ...currentMerchant, api_key: data.apiKey };
        setCurrentMerchant(updated);
        localStorage.setItem("bizflow_current_merchant", JSON.stringify(updated));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRegeneratingKey(false);
    }
  };

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFieldId(fieldId);
    setTimeout(() => setCopiedFieldId(null), 2000);
  };

  const getEmbedCode = () => {
    if (!currentMerchant) return "";
    const origin = typeof window !== "undefined" ? window.location.origin : "https://bizflow.finance";
    return `<iframe \n  src="${origin}/widget/checkout?merchant=${encodeURIComponent(currentMerchant.name)}&amount=${widgetAmount}" \n  width="400" \n  height="550" \n  style="border: none; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);"\n></iframe>`;
  };

  const handleLogout = () => {
    localStorage.removeItem("bizflow_current_merchant");
    setCurrentMerchant(null);
    setBusinessName("");
    setWalletAddress("");
    setActiveSubTab("register");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans" style={{ background: "#060814", fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-6 py-4" style={{ borderColor: "#111428" }}>
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-400 hover:text-slate-100 transition-all">
            <ArrowLeft size={16} />
          </Link>
          <div className="h-6 w-[1px] bg-slate-800"></div>
          <div className="flex items-center gap-2">
            <Coins className="text-emerald-400" style={{ color: "#00d4a4" }} size={24} />
            <span className="text-xl font-bold tracking-tight">BizFlow <span style={{ color: "#00d4a4" }}>Merchant</span></span>
          </div>
        </div>

        {currentMerchant && (
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold">{currentMerchant.name}</div>
              <div className="text-xs text-slate-500 font-mono">{currentMerchant.id}</div>
            </div>
            <button 
              onClick={handleLogout}
              className="text-xs px-3 py-1.5 bg-red-950/50 hover:bg-red-950 border border-red-900/50 text-red-400 rounded-md transition-all"
              style={{ background: "rgba(127, 29, 29, 0.2)", borderColor: "rgba(127, 29, 29, 0.4)", color: "#f87171" }}
            >
              Disconnect Business
            </button>
          </div>
        )}
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Navigation Sidebar */}
        <aside className="md:col-span-1 flex flex-col gap-2">
          {!currentMerchant ? (
            <button
              onClick={() => setActiveSubTab("register")}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeSubTab === "register"
                  ? "bg-slate-900 border border-slate-800 text-emerald-400 shadow-lg"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
              }`}
              style={activeSubTab === "register" ? { borderLeft: "3px solid #00d4a4", color: "#00d4a4", background: "#0e1124" } : {}}
            >
              <Building2 size={18} />
              <span>Merchant Register</span>
            </button>
          ) : (
            <>
              <button
                onClick={() => setActiveSubTab("keys")}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  activeSubTab === "keys"
                    ? "bg-slate-900 border border-slate-800 text-emerald-400 shadow-lg"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
                }`}
                style={activeSubTab === "keys" ? { borderLeft: "3px solid #00d4a4", color: "#00d4a4", background: "#0e1124" } : {}}
              >
                <Key size={18} />
                <span>API Key & Auth</span>
              </button>

              <button
                onClick={() => setActiveSubTab("fees")}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  activeSubTab === "fees"
                    ? "bg-slate-900 border border-slate-800 text-emerald-400 shadow-lg"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
                }`}
                style={activeSubTab === "fees" ? { borderLeft: "3px solid #00d4a4", color: "#00d4a4", background: "#0e1124" } : {}}
              >
                <Settings size={18} />
                <span>Fee Split Settings</span>
              </button>

              <button
                onClick={() => setActiveSubTab("embed")}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  activeSubTab === "embed"
                    ? "bg-slate-900 border border-slate-800 text-emerald-400 shadow-lg"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
                }`}
                style={activeSubTab === "embed" ? { borderLeft: "3px solid #00d4a4", color: "#00d4a4", background: "#0e1124" } : {}}
              >
                <Code size={18} />
                <span>Embed Code Generator</span>
              </button>

              <button
                onClick={() => setActiveSubTab("history")}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  activeSubTab === "history"
                    ? "bg-slate-900 border border-slate-800 text-emerald-400 shadow-lg"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
                }`}
                style={activeSubTab === "history" ? { borderLeft: "3px solid #00d4a4", color: "#00d4a4", background: "#0e1124" } : {}}
              >
                <History size={18} />
                <span>Payment History</span>
              </button>
            </>
          )}
        </aside>

        {/* Content Box */}
        <section className="md:col-span-3 bg-slate-950/40 border border-slate-900 rounded-2xl p-8 flex flex-col gap-6" style={{ background: "#090d22", borderColor: "#121736" }}>
          
          {/* TAB 1: Merchant Registration */}
          {activeSubTab === "register" && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              <div>
                <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                  <Building2 className="text-emerald-400" style={{ color: "#00d4a4" }} size={24} />
                  Self-Service Business Registration
                </h2>
                <p className="text-slate-400 mt-2 text-sm leading-relaxed">
                  Onboard your enterprise or SME to generate custom payment flows. Registered merchants receive secure programmatic API keys configured with customized fee policies.
                </p>
              </div>

              {regSuccess ? (
                <div className="flex flex-col items-center justify-center p-12 border border-emerald-900/30 bg-emerald-950/20 rounded-xl gap-3 text-center">
                  <Sparkles className="text-emerald-400 animate-pulse" size={48} style={{ color: "#00d4a4" }} />
                  <h3 className="text-lg font-semibold text-emerald-400" style={{ color: "#00d4a4" }}>Business Registered!</h3>
                  <p className="text-sm text-slate-300">Generating API credentials and routing profiles...</p>
                </div>
              ) : (
                <form onSubmit={handleRegister} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Business Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Acme Corporation" 
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all text-sm"
                      style={{ background: "#0b0e20", borderColor: "#181d3d" }}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Target Settlement Wallet (USDC/EVM)</label>
                    <input 
                      type="text" 
                      placeholder="0x82f1..." 
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all font-mono text-sm"
                      style={{ background: "#0b0e20", borderColor: "#181d3d" }}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Industry</label>
                      <select 
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500 transition-all text-sm cursor-pointer"
                        style={{ background: "#0b0e20", borderColor: "#181d3d" }}
                      >
                        <option value="E-Commerce">E-Commerce</option>
                        <option value="SaaS">SaaS & Subscriptions</option>
                        <option value="Retail">Retail & Payments</option>
                        <option value="B2B Procurement">B2B Procurement</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Admin split fee % (Partner commission)</label>
                      <select 
                        value={feeSplit}
                        onChange={(e) => setFeeSplit(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500 transition-all text-sm cursor-pointer"
                        style={{ background: "#0b0e20", borderColor: "#181d3d" }}
                      >
                        <option value="0.5">0.5% (Low Volume)</option>
                        <option value="1.0">1.0% (Standard Tier)</option>
                        <option value="2.0">2.0% (Enterprise Tier)</option>
                      </select>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isRegistering}
                    className="mt-4 w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold rounded-lg transition-all text-sm flex items-center justify-center gap-2"
                    style={{ background: "linear-gradient(135deg, #00d4a4 0%, #009b75 100%)", color: "#000000" }}
                  >
                    {isRegistering ? (
                      <>
                        <RefreshCw size={16} className="spinner" />
                        <span>Registering Business...</span>
                      </>
                    ) : (
                      <span>Create Merchant Account</span>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: API Keys Management */}
          {activeSubTab === "keys" && currentMerchant && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              <div>
                <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                  <Key className="text-emerald-400" style={{ color: "#00d4a4" }} size={24} />
                  Programmatic API Keys
                </h2>
                <p className="text-slate-400 mt-2 text-sm">
                  Use this key to authorize incoming payment or invoicing requests from external software. Include this key in the <code>x-api-key</code> header.
                </p>
              </div>

              <div className="p-5 border border-slate-800 rounded-xl flex flex-col gap-4" style={{ background: "#0b0e20", borderColor: "#181d3d" }}>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active API Key</label>
                  <div className="flex items-center gap-2 bg-slate-950/80 p-3 rounded-lg border border-slate-800" style={{ background: "#05060d", borderColor: "#121630" }}>
                    <span className="font-mono text-sm break-all text-emerald-400 select-all">{currentMerchant.api_key}</span>
                    <button 
                      onClick={() => copyToClipboard(currentMerchant.api_key, "apikey")}
                      className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-100 rounded-md transition-all ml-auto"
                      style={{ background: "#0b0e20" }}
                    >
                      {copiedFieldId === "apikey" ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-800/50 pt-4 mt-2">
                  <p className="text-xs text-slate-500">
                    Need a new credentials pair? Generating a new key invalidates the current token.
                  </p>
                  <button 
                    onClick={handleRegenerateKey}
                    disabled={isRegeneratingKey}
                    className="text-xs px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-md transition-all flex items-center gap-1.5"
                  >
                    {isRegeneratingKey ? <RefreshCw size={12} className="spinner" /> : <RefreshCw size={12} />}
                    <span>Regenerate Key</span>
                  </button>
                </div>
              </div>

              {/* Scopes Section */}
              <div className="flex flex-col gap-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Scoped Key Permissions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {scopes.map((scope) => (
                    <div 
                      key={scope.id} 
                      className={`p-3 border rounded-lg flex items-center justify-between transition-all ${
                        scope.active ? "border-slate-800/80 bg-slate-900/20" : "border-slate-900/30 opacity-60"
                      }`}
                      style={{ background: "#0b0e20", borderColor: "#181d3d" }}
                    >
                      <div>
                        <div className="text-sm font-semibold text-slate-200">{scope.label}</div>
                        <div className="text-xs font-mono text-slate-500">{scope.id}</div>
                      </div>
                      <div className="flex items-center">
                        <span className={`h-2 w-2 rounded-full mr-2 ${scope.active ? "bg-emerald-400" : "bg-slate-600"}`}></span>
                        <span className="text-xs text-slate-400">{scope.active ? "Allowed" : "Restricted"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Fee Split Settings */}
          {activeSubTab === "fees" && currentMerchant && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              <div>
                <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                  <Settings className="text-emerald-400" style={{ color: "#00d4a4" }} size={24} />
                  Fee Split Settings
                </h2>
                <p className="text-slate-400 mt-2 text-sm">
                  Configure programmatic commissions. The fees are calculated and distributed atomically to the target administration treasury on every settled payout.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Visual Fee Gauge Card */}
                <div className="p-6 border border-slate-800 rounded-xl flex flex-col gap-4 justify-between" style={{ background: "#0b0e20", borderColor: "#181d3d" }}>
                  <div>
                    <h3 className="text-sm font-bold text-slate-300">Atomic Revenue Split</h3>
                    <p className="text-xs text-slate-500 mt-1">Atomically processes settlement allocations.</p>
                  </div>

                  <div className="flex items-center justify-center py-6">
                    <div className="relative h-32 w-32 rounded-full border-4 border-slate-800 flex items-center justify-center" style={{ borderColor: "#181d3d" }}>
                      <div className="absolute inset-0 rounded-full border-4 border-emerald-400 border-r-transparent animate-spin-slow" style={{ borderColor: "#00d4a4 #00d4a4 transparent transparent" }}></div>
                      <div className="text-center">
                        <span className="text-3xl font-extrabold text-slate-100">
                          {JSON.parse(currentMerchant.fee_policy || "{}").adminSplitPercent || "1.0"}%
                        </span>
                        <div className="text-[10px] text-slate-500 uppercase font-semibold">Admin Cut</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs border-t border-slate-800/50 pt-3 text-slate-400">
                    <span>Merchant Share:</span>
                    <span className="text-emerald-400 font-bold" style={{ color: "#00d4a4" }}>
                      {(100 - parseFloat(JSON.parse(currentMerchant.fee_policy || "{}").adminSplitPercent || "1.0")).toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Settings Configuration Parameters */}
                <div className="p-6 border border-slate-800 rounded-xl flex flex-col gap-4" style={{ background: "#0b0e20", borderColor: "#181d3d" }}>
                  <h3 className="text-sm font-bold text-slate-300">Policy Properties</h3>

                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs text-slate-500 font-semibold uppercase">Revenue Payer</span>
                    <span className="text-sm text-slate-200 font-medium bg-slate-900/60 p-2.5 rounded-lg border border-slate-800" style={{ background: "#05060d", borderColor: "#121630" }}>
                      Deducted from Merchant Balance
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs text-slate-500 font-semibold uppercase">Business Wallet</span>
                    <span className="text-sm font-mono text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 select-all text-xs" style={{ background: "#05060d", borderColor: "#121630" }}>
                      {currentMerchant.wallet_address}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs text-slate-500 font-semibold uppercase">Target Network</span>
                    <span className="text-sm text-emerald-400 font-semibold bg-slate-900/60 p-2.5 rounded-lg border border-slate-800" style={{ background: "#05060d", borderColor: "#121630", color: "#00d4a4" }}>
                      Arc Testnet (Native USDC Gas)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Embed Widget Code Generator */}
          {activeSubTab === "embed" && currentMerchant && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              <div>
                <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                  <Code className="text-emerald-400" style={{ color: "#00d4a4" }} size={24} />
                  Embeddable Checkout Widget
                </h2>
                <p className="text-slate-400 mt-2 text-sm">
                  Add a secure checkout frame directly to your site. Users can pay in EURC or USDC using standard Web3 wallets or biometric passkeys.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Embed configurator */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-sm font-bold text-slate-300">Widget Parameters</h3>
                  
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-slate-400 font-semibold">Test Price (USDC)</label>
                    <input 
                      type="number" 
                      value={widgetAmount}
                      onChange={(e) => setWidgetAmount(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                      style={{ background: "#0b0e20", borderColor: "#181d3d" }}
                    />
                  </div>

                  <div className="flex flex-col gap-2 mt-2">
                    <label className="text-xs text-slate-400 font-semibold">Embed HTML Code</label>
                    <div className="relative">
                      <pre className="text-xs bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono overflow-x-auto text-slate-300 select-all" style={{ background: "#05060d", borderColor: "#121630" }}>
                        {getEmbedCode()}
                      </pre>
                      <button 
                        onClick={() => copyToClipboard(getEmbedCode(), "embedcode")}
                        className="absolute top-2 right-2 p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-100 rounded-md transition-all border border-slate-800"
                      >
                        {copiedFieldId === "embedcode" ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sandbox Frame Preview */}
                <div className="flex flex-col gap-3">
                  <h3 className="text-sm font-bold text-slate-300">Live Frame Preview</h3>
                  <div className="border border-slate-900 rounded-xl overflow-hidden shadow-2xl flex items-center justify-center p-4 bg-slate-950" style={{ borderColor: "#121630", minHeight: "400px" }}>
                    <iframe
                      src={`/widget/checkout?merchant=${encodeURIComponent(currentMerchant.name)}&amount=${widgetAmount}`}
                      title="BizFlow Checkout Preview"
                      width="100%"
                      height="380"
                      style={{ border: "none", borderRadius: "12px", background: "#060814" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Payment History Dashboard */}
          {activeSubTab === "history" && currentMerchant && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    <History className="text-emerald-400" style={{ color: "#00d4a4" }} size={24} />
                    On-Chain Payment History
                  </h2>
                  <p className="text-slate-400 mt-2 text-sm">
                    Verified ledger records fetched from Supabase. Live explorer links verify transaction sub-second finality.
                  </p>
                </div>
                <button 
                  onClick={fetchPaymentHistory}
                  disabled={loadingHistory}
                  className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-100 border border-slate-800 rounded-lg transition-all"
                  style={{ background: "#0b0e20" }}
                >
                  <RefreshCw size={16} className={loadingHistory ? "spinner" : ""} />
                </button>
              </div>

              {loadingHistory ? (
                <div className="flex items-center justify-center py-20">
                  <RefreshCw size={32} className="spinner text-slate-600" />
                </div>
              ) : payments.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-slate-800 rounded-xl text-slate-500 text-sm">
                  No registered payments recorded yet for this merchant session.
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-850 rounded-xl" style={{ borderColor: "#161b3f" }}>
                  <table className="w-full border-collapse text-left text-sm text-slate-300">
                    <thead className="bg-slate-900/80 text-xs font-semibold text-slate-400 uppercase tracking-wider" style={{ background: "#0e122b" }}>
                      <tr>
                        <th className="px-6 py-4">Payment ID</th>
                        <th className="px-6 py-4">Type</th>
                        <th className="px-6 py-4">Amount</th>
                        <th className="px-6 py-4">Tx Hash</th>
                        <th className="px-6 py-4">Settled At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900/60" style={{ borderColor: "#0e122b" }}>
                      {payments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-slate-900/20 transition-colors">
                          <td className="px-6 py-4 font-mono font-semibold text-slate-400">{payment.id}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium uppercase ${
                              payment.type === "batch" ? "bg-emerald-950 text-emerald-400" : "bg-cyan-950 text-cyan-400"
                            }`} style={payment.type === "batch" ? { background: "rgba(16, 185, 129, 0.15)", color: "#10b981" } : {}}>
                              {payment.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-bold text-slate-200">{payment.total_amount} USDC</td>
                          <td className="px-6 py-4 font-mono text-slate-400 text-xs">
                            <div className="flex items-center gap-1.5">
                              <span>{payment.tx_hash ? `${payment.tx_hash.substring(0, 8)}...${payment.tx_hash.substring(payment.tx_hash.length - 6)}` : "N/A"}</span>
                              {payment.tx_hash && (
                                <a 
                                  href={`https://testnet.arcscan.app/tx/${payment.tx_hash}`} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="text-emerald-400 hover:underline inline-flex items-center gap-0.5 ml-1"
                                >
                                  <ExternalLink size={12} />
                                </a>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-500 text-xs">
                            {new Date(payment.created_at).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-600 bg-slate-950/40 mt-auto" style={{ borderColor: "#111428" }}>
        <span>Securely Powered by Circle Dev-Controlled & Modular Wallets SDKs.</span>
      </footer>
    </div>
  );
}

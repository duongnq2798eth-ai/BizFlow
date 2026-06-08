"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Coins,
  ShieldCheck,
  FileText,
  ExternalLink,
  RefreshCw,
  ArrowLeft,
  Building2,
  Activity,
  Briefcase,
  Clock,
  Percent,
  Download,
  AlertTriangle
} from "lucide-react";

interface VolumeStats {
  daily: number;
  weekly: number;
  monthly: number;
  total: number;
}

interface EscrowStats {
  total: number;
  active: number;
  completed: number;
  completionRate: number;
}

interface InvoiceStats {
  settlementVelocityHours: number;
  settledCount: number;
}

interface CreditStats {
  limit: number;
  utilized: number;
  utilizationRate: number;
  defaultRate: number;
}

interface ChartItem {
  date: string;
  volume: number;
}

interface AuditTrailItem {
  type: string;
  amount: string;
  txHash: string;
  date: string;
  link: string;
}

interface TopMerchant {
  id: string;
  name: string;
  volume: number;
  txCount: number;
}

export default function AnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
    volume: VolumeStats;
    escrow: EscrowStats;
    invoice: InvoiceStats;
    credit: CreditStats;
    topMerchants: TopMerchant[];
    chartData: ChartItem[];
    auditTrail: AuditTrailItem[];
  } | null>(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/analytics");
      const data = await res.json();
      if (data.success) {
        setStats(data);
      }
    } catch (err) {
      console.error("Failed to load analytics metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  // Triggers print layout specifically formatted for compliance export
  const exportPDFReport = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center font-sans" style={{ background: "#060814" }}>
        <div className="flex flex-col items-center gap-3">
          <RefreshCw size={40} className="spinner text-emerald-400 animate-spin" style={{ color: "#00d4a4" }} />
          <span className="text-sm text-slate-400 font-semibold tracking-wider uppercase">Loading Business Intelligence Data...</span>
        </div>
      </div>
    );
  }

  const volume = stats?.volume || { daily: 0, weekly: 0, monthly: 0, total: 0 };
  const escrow = stats?.escrow || { total: 0, active: 0, completed: 0, completionRate: 0 };
  const invoice = stats?.invoice || { settlementVelocityHours: 0, settledCount: 0 };
  const credit = stats?.credit || { limit: 0, utilized: 0, utilizationRate: 0, defaultRate: 0 };
  const topMerchants = stats?.topMerchants || [];
  const chartData = stats?.chartData || [];
  const auditTrail = stats?.auditTrail || [];

  // Calculate highest volume in chart data for proper SVG scale mapping
  const maxChartVolume = chartData.length > 0 ? Math.max(...chartData.map(d => d.volume)) : 100;
  const heightMultiplier = maxChartVolume > 0 ? 120 / maxChartVolume : 1;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans" style={{ background: "#060814", fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-6 py-4 print:hidden" style={{ borderColor: "#111428" }}>
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-400 hover:text-slate-100 transition-all">
            <ArrowLeft size={16} />
          </Link>
          <div className="h-6 w-[1px] bg-slate-800"></div>
          <div className="flex items-center gap-2">
            <TrendingUp className="text-emerald-400" style={{ color: "#00d4a4" }} size={24} />
            <span className="text-xl font-bold tracking-tight">BizFlow <span style={{ color: "#00d4a4" }}>Intelligence</span></span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAnalyticsData}
            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-400 hover:text-slate-100 transition-all flex items-center gap-1.5 text-xs font-semibold"
            style={{ background: "#0b0e20", borderColor: "#181d3d" }}
          >
            <RefreshCw size={14} />
            <span>Reload</span>
          </button>

          <button
            onClick={exportPDFReport}
            className="py-2 px-4 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg transition-all text-xs flex items-center gap-2"
            style={{ background: "linear-gradient(135deg, #00d4a4 0%, #009b75 100%)", color: "#000000" }}
          >
            <Download size={14} />
            <span>Export PDF Report</span>
          </button>
        </div>
      </header>

      {/* Main Body (Dashboard view) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 flex flex-col gap-8 print:hidden">
        {/* KPI Scorecard Grid */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Card 1: USDC Volume */}
          <div className="p-6 border rounded-xl flex flex-col gap-4" style={{ background: "#090d22", borderColor: "#121736" }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">USDC Settlement Volume</span>
              <Coins className="text-emerald-400" style={{ color: "#00d4a4" }} size={20} />
            </div>
            <div>
              <span className="text-3xl font-extrabold text-slate-100">${volume.monthly.toLocaleString()}</span>
              <span className="text-xs text-slate-400 font-medium ml-1">USDC / mo</span>
            </div>
            <div className="grid grid-cols-2 gap-2 border-t border-slate-900/60 pt-3 text-[11px] text-slate-400">
              <div>
                <span className="text-slate-500 block uppercase font-semibold">Today</span>
                <span className="font-bold text-slate-300">${volume.daily.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-500 block uppercase font-semibold">Weekly</span>
                <span className="font-bold text-slate-300">${volume.weekly.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Escrow Completion */}
          <div className="p-6 border rounded-xl flex flex-col gap-4" style={{ background: "#090d22", borderColor: "#121736" }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Escrow Completion Rate</span>
              <ShieldCheck className="text-emerald-400" style={{ color: "#00d4a4" }} size={20} />
            </div>
            <div>
              <span className="text-3xl font-extrabold text-slate-100">{escrow.completionRate}%</span>
              <span className="text-xs text-slate-400 font-medium ml-1">Success</span>
            </div>
            <div className="grid grid-cols-2 gap-2 border-t border-slate-900/60 pt-3 text-[11px] text-slate-400">
              <div>
                <span className="text-slate-500 block uppercase font-semibold">Active Deals</span>
                <span className="font-bold text-slate-300">{escrow.active}</span>
              </div>
              <div>
                <span className="text-slate-500 block uppercase font-semibold">Completed</span>
                <span className="font-bold text-slate-300">{escrow.completed}</span>
              </div>
            </div>
          </div>

          {/* Card 3: Settlement Velocity */}
          <div className="p-6 border rounded-xl flex flex-col gap-4" style={{ background: "#090d22", borderColor: "#121736" }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Invoice Velocity</span>
              <Clock className="text-emerald-400" style={{ color: "#00d4a4" }} size={20} />
            </div>
            <div>
              <span className="text-3xl font-extrabold text-slate-100">{invoice.settlementVelocityHours}h</span>
              <span className="text-xs text-slate-400 font-medium ml-1">Avg Settlement</span>
            </div>
            <div className="grid grid-cols-2 gap-2 border-t border-slate-900/60 pt-3 text-[11px] text-slate-400">
              <div>
                <span className="text-slate-500 block uppercase font-semibold">Settled</span>
                <span className="font-bold text-slate-300">{invoice.settledCount} Invoices</span>
              </div>
              <div>
                <span className="text-slate-500 block uppercase font-semibold">Network Speed</span>
                <span className="font-bold text-emerald-400" style={{ color: "#00d4a4" }}>Sub-second</span>
              </div>
            </div>
          </div>

          {/* Card 4: Credit utilization */}
          <div className="p-6 border rounded-xl flex flex-col gap-4" style={{ background: "#090d22", borderColor: "#121736" }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Credit Risk & Utilization</span>
              <Percent className="text-emerald-400" style={{ color: "#00d4a4" }} size={20} />
            </div>
            <div>
              <span className="text-3xl font-extrabold text-slate-100">{credit.utilizationRate}%</span>
              <span className="text-xs text-slate-400 font-medium ml-1">Utilized</span>
            </div>
            <div className="grid grid-cols-2 gap-2 border-t border-slate-900/60 pt-3 text-[11px] text-slate-400">
              <div>
                <span className="text-slate-500 block uppercase font-semibold">Default Risk</span>
                <span className="font-bold text-slate-300">{credit.defaultRate}%</span>
              </div>
              <div>
                <span className="text-slate-500 block uppercase font-semibold">Available</span>
                <span className="font-bold text-slate-300">${(credit.limit - credit.utilized).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Charts & Metrics Breakdown */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart 1: SVG Daily Volume Bar Chart */}
          <div className="lg:col-span-2 p-6 border rounded-2xl flex flex-col gap-6" style={{ background: "#090d22", borderColor: "#121736" }}>
            <div>
              <h3 className="text-sm font-bold text-slate-200">Daily USDC Settlement Volume (Last 7 Days)</h3>
              <p className="text-xs text-slate-500 mt-1">Aggregated aggregate of on-chain operations & payments</p>
            </div>

            <div className="flex items-end justify-between h-48 px-4 border-b border-slate-800/50 pb-2 gap-2">
              {chartData.map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  {/* Tooltip on Hover */}
                  <div className="bg-slate-950 text-[10px] text-slate-300 px-2 py-1 rounded border border-slate-800 opacity-0 group-hover:opacity-100 transition-opacity absolute translate-y-[-140%] pointer-events-none font-bold">
                    ${item.volume.toLocaleString()}
                  </div>
                  
                  {/* Bar */}
                  <div
                    className="w-full bg-emerald-500/20 hover:bg-emerald-500 rounded-t-sm transition-all cursor-pointer relative"
                    style={{
                      height: `${Math.max(item.volume * heightMultiplier, 4)}px`,
                      background: "linear-gradient(to top, rgba(0, 212, 164, 0.1) 0%, rgba(0, 212, 164, 0.8) 100%)"
                    }}
                  />
                  
                  {/* Label */}
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(item.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Ranking: Top Merchants */}
          <div className="p-6 border rounded-2xl flex flex-col gap-6" style={{ background: "#090d22", borderColor: "#121736" }}>
            <div>
              <h3 className="text-sm font-bold text-slate-200">Top Merchants Ranking</h3>
              <p className="text-xs text-slate-500 mt-1">Classified by USDC payout throughput</p>
            </div>

            <div className="flex flex-col gap-4">
              {topMerchants.map((merchant, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-950/40 rounded-lg border border-slate-900/60" style={{ background: "#05060d", borderColor: "#121630" }}>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-500 font-mono w-4">#{idx + 1}</span>
                    <div>
                      <div className="text-xs font-bold text-slate-200">{merchant.name}</div>
                      <div className="text-[10px] text-slate-500">{merchant.txCount} txs processed</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-emerald-400" style={{ color: "#00d4a4" }}>${merchant.volume.toLocaleString()}</span>
                    <span className="text-[10px] text-slate-500 block uppercase font-medium">USDC</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* On-chain Ledger Trail */}
        <section className="p-6 border rounded-2xl flex flex-col gap-6" style={{ background: "#090d22", borderColor: "#121736" }}>
          <div>
            <h3 className="text-sm font-bold text-slate-200">On-Chain Audit Trail</h3>
            <p className="text-xs text-slate-500 mt-1">Real-time ledger events mapped to Arc Testnet explorer verified states</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/60 font-semibold text-slate-500 uppercase tracking-wider" style={{ background: "#080a1c" }}>
                <tr>
                  <th className="px-4 py-3">Event Type</th>
                  <th className="px-4 py-3">Settlement Amount</th>
                  <th className="px-4 py-3">Transaction Proof Hash</th>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3 text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/60" style={{ borderColor: "#0e122b" }}>
                {auditTrail.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/10 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-200">{item.type}</td>
                    <td className="px-4 py-3 font-bold text-slate-100">{item.amount}</td>
                    <td className="px-4 py-3 font-mono text-slate-400 select-all">{item.txHash}</td>
                    <td className="px-4 py-3 text-slate-500">{item.date}</td>
                    <td className="px-4 py-3 text-right">
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 font-bold"
                        style={{ color: "#00d4a4" }}
                      >
                        <span>Arcscan</span>
                        <ExternalLink size={12} />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Printable Compliance Report view (triggered only by print media styles) */}
      <div className="hidden print:block bg-white text-black p-8 font-sans w-full" style={{ color: "#000000" }}>
        {/* Compliance PDF Header */}
        <div className="border-b-2 border-black pb-4 mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">BIZFLOW FINTECH INC.</h1>
            <p className="text-sm font-semibold tracking-wide uppercase text-gray-600 mt-1">Audit Ledger & Settlement Compliance Report</p>
          </div>
          <div className="text-right text-xs text-gray-500">
            <div>Generated: {new Date().toLocaleString()}</div>
            <div>Network: Arc Testnet (Circle Infrastructure)</div>
          </div>
        </div>

        {/* Report Overview */}
        <div className="grid grid-cols-2 gap-6 mb-8 text-sm">
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="font-bold text-gray-800 uppercase text-xs mb-2">Platform Totals</h3>
            <div className="flex justify-between py-1"><span>Total Volume Processed:</span><span className="font-bold">${volume.total.toLocaleString()} USDC</span></div>
            <div className="flex justify-between py-1"><span>Monthly Volume (30d):</span><span className="font-bold">${volume.monthly.toLocaleString()} USDC</span></div>
            <div className="flex justify-between py-1"><span>Weekly Volume (7d):</span><span className="font-bold">${volume.weekly.toLocaleString()} USDC</span></div>
          </div>

          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="font-bold text-gray-800 uppercase text-xs mb-2">Escrow & Invoice Metrics</h3>
            <div className="flex justify-between py-1"><span>Escrow Completion Rate:</span><span className="font-bold">{escrow.completionRate}%</span></div>
            <div className="flex justify-between py-1"><span>Active Escrows:</span><span className="font-bold">{escrow.active}</span></div>
            <div className="flex justify-between py-1"><span>Average Invoice Settlement Velocity:</span><span className="font-bold">{invoice.settlementVelocityHours} hours</span></div>
          </div>
        </div>

        {/* Risk Registry overview */}
        <div className="mb-8 p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm">
          <h3 className="font-bold text-gray-800 uppercase text-xs mb-3 flex items-center gap-1.5">
            <AlertTriangle size={14} className="text-yellow-600" />
            Credit & Portfolio Risk Parameters
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <span className="text-xs text-gray-500 block">Total Credit Portfolio Limit</span>
              <span className="font-bold text-gray-900">${credit.limit.toLocaleString()} USDC</span>
            </div>
            <div>
              <span className="text-xs text-gray-500 block">Active Credit Utilization</span>
              <span className="font-bold text-gray-900">${credit.utilized.toLocaleString()} USDC ({credit.utilizationRate}%)</span>
            </div>
            <div>
              <span className="text-xs text-gray-500 block">Portfolio Default Rate</span>
              <span className="font-bold text-red-600">{credit.defaultRate}%</span>
            </div>
          </div>
        </div>

        {/* Top Merchants List */}
        <div className="mb-8">
          <h3 className="font-bold text-gray-800 uppercase text-xs mb-3">Top Merchant Rankings</h3>
          <table className="w-full text-left text-xs border border-gray-200">
            <thead className="bg-gray-100 text-gray-700 font-bold border-b border-gray-200">
              <tr>
                <th className="p-2">Rank</th>
                <th className="p-2">Merchant Name</th>
                <th className="p-2">Processed volume</th>
                <th className="p-2 text-right">Transactions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {topMerchants.map((merchant, idx) => (
                <tr key={idx}>
                  <td className="p-2">#{idx + 1}</td>
                  <td className="p-2 font-semibold">{merchant.name}</td>
                  <td className="p-2 font-bold">${merchant.volume.toLocaleString()} USDC</td>
                  <td className="p-2 text-right">{merchant.txCount} txs</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Proof of Settlement */}
        <div>
          <h3 className="font-bold text-gray-800 uppercase text-xs mb-3">Verified Transaction proof (On-Chain Audit Trail)</h3>
          <table className="w-full text-left text-[10px] border border-gray-200">
            <thead className="bg-gray-100 text-gray-700 font-bold border-b border-gray-200">
              <tr>
                <th className="p-2">Operation Type</th>
                <th className="p-2">Amount</th>
                <th className="p-2">EVM Transaction Hash</th>
                <th className="p-2">Settlement Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {auditTrail.map((item, idx) => (
                <tr key={idx}>
                  <td className="p-2 font-semibold">{item.type}</td>
                  <td className="p-2 font-bold">{item.amount}</td>
                  <td className="p-2 font-mono">{item.txHash}</td>
                  <td className="p-2 text-gray-500">{item.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-12 text-center text-[10px] text-gray-400 border-t border-gray-200 pt-4">
          All transactions are cryptographically signed and confirmed with sub-second finality on Arc Testnet.
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-600 bg-slate-950/40 mt-auto print:hidden" style={{ borderColor: "#111428" }}>
        <span>Securely Powered by Circle Dev-Controlled & Modular Wallets SDKs.</span>
      </footer>
    </div>
  );
}

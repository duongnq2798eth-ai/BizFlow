"use client";

export const dynamic = "force-dynamic";

import React, { useEffect } from "react";
import { useBizFlowApp } from "@/hooks/useBizFlowApp";

// Layout Components
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import Terminal from "@/components/layout/Terminal";
import PayloadInspector from "@/components/layout/PayloadInspector";
import SearchModal from "@/components/layout/SearchModal";

// Tab Components
import DepositTab from "@/components/tabs/DepositTab";
import CheckoutTab from "@/components/tabs/CheckoutTab";
import InvoiceTab from "@/components/tabs/InvoiceTab";
import CreditTab from "@/components/tabs/CreditTab";
import PaymentsTab from "@/components/tabs/PaymentsTab";
import TreasuryTab from "@/components/tabs/TreasuryTab";
import FeeTab from "@/components/tabs/FeeTab";
import WebhooksTab from "@/components/tabs/WebhooksTab";
import TemplatesTab from "@/components/tabs/TemplatesTab";
import SdkTab from "@/components/tabs/SdkTab";
import AgentsTab from "@/components/tabs/AgentsTab";
import InfoTabs from "@/components/tabs/InfoTabs";

// Icons for custom/informational panels
import { Play, Search, ShieldCheck } from "lucide-react";

/**
 * Helper to split a tab component's render output into standard docs & sandbox columns.
 * Tab components return a React fragment `<> <div className="prose">...</div> <div className="playground-panel-wrapper">...</div> </>`.
 */
function renderTabPanes(element: React.ReactElement | null | false) {
  if (!element) return { docs: null, sandbox: null };
  try {
    const rendered = typeof element.type === "function" 
      ? (element.type as any)(element.props) 
      : element;
    const children = React.Children.toArray(rendered.props.children);
    return {
      docs: children[0] || null,
      sandbox: children[1] || null
    };
  } catch (e) {
    console.error("Error rendering tab panes:", e);
    return { docs: element, sandbox: null };
  }
}

export default function Home() {
  const app = useBizFlowApp();

  const {
    connectedAddress,
    isConnected,
    activeTab,
    setActiveTab,
    logs,
    addLog,
    clearLogs,
    liveBlockNumber,
    liveGasPrice,
    rpcStatus,
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
    isProcessingInvoiceAction,
    isBatchSettlingInvoices,
    isFetchingInvoiceStatus,
    depositAmount,
    setDepositAmount,
    depositChain,
    setDepositChain,
    privateKey,
    setPrivateKey,
    showKey,
    setShowKey,
    useWalletExtension,
    setUseWalletExtension,
    isDepositing,
    runDeposit,
    isStreamingGateway,
    gatewayStreamedAmount,
    toggleGatewayStream,
    withdrawChain,
    setWithdrawChain,
    withdrawAmount,
    setWithdrawAmount,
    withdrawRecipient,
    setWithdrawRecipient,
    isWithdrawingGateway,
    executeGatewayWithdraw,
    widgetMerchant,
    setWidgetMerchant,
    widgetAmount,
    setWidgetAmount,
    activeSession,
    checkingSession,
    adminAddress,
    setAdminAddress,
    feePercent,
    setFeePercent,
    isSavingPolicy,
    saveFeePolicy,
    tokenName,
    setTokenName,
    tokenSymbol,
    setTokenSymbol,
    isDeployingContract,
    deployTemplate,
    deploymentProgress,
    creditCompanyId,
    setCreditCompanyId,
    creditVolume,
    setCreditVolume,
    creditScore,
    isCheckingCredit,
    checkCreditScore,
    drawdownAmount,
    setDrawdownAmount,
    drawdownWallet,
    setDrawdownWallet,
    isDrawingDown,
    executeDrawdown,
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
    executeBridge,
    webhookUrl,
    setWebhookUrl,
    webhookEvent,
    setWebhookEvent,
    isTestingWebhook,
    testWebhookDelivery,
    selectedAgent,
    setSelectedAgent,
    agentJobAmount,
    setAgentJobAmount,
    agentJobDescription,
    setAgentJobDescription,
    isHiringAgent,
    runAgentJob,
    agentJobStep,
    agentJobTxHash,
    selectedSdkLang,
    setSelectedSdkLang,
    copiedText,
    isSearchOpen,
    setIsSearchOpen,
    isQueryingBalance,
    queryOnChainUsdcBalance,
    activeRequestPayload,
    activeResponsePayload,
    isInspectorOpen,
    setIsInspectorOpen,
    handleCreateInvoice,
    handleInvoiceAction,
    handleBatchSettleInvoices,
    handleGetInvoiceStatus,
    clearSession,
    handleGenerateSandboxKey,
    isPrivateKeyValid,
    copyToClipboard,
  } = app;

  // Track global Ctrl+K command search palette hotkey listener
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen(!isSearchOpen);
      }
    };
    window.addEventListener("keydown", handleGlobalKey);
    return () => window.removeEventListener("keydown", handleGlobalKey);
  }, [isSearchOpen, setIsSearchOpen]);

  // Determine active dynamic component tree element
  let tabElement: React.ReactElement | null = null;
  if (activeTab === "deposit") {
    tabElement = (
      <DepositTab
        depositAmount={depositAmount}
        setDepositAmount={setDepositAmount}
        depositChain={depositChain}
        setDepositChain={setDepositChain}
        privateKey={privateKey}
        setPrivateKey={setPrivateKey}
        showKey={showKey}
        setShowKey={setShowKey}
        useWalletExtension={useWalletExtension}
        setUseWalletExtension={setUseWalletExtension}
        isDepositing={isDepositing}
        runDeposit={runDeposit}
        gatewayStreamedAmount={gatewayStreamedAmount}
        isStreamingGateway={isStreamingGateway}
        toggleGatewayStream={toggleGatewayStream}
        withdrawChain={withdrawChain}
        setWithdrawChain={setWithdrawChain}
        withdrawAmount={withdrawAmount}
        setWithdrawAmount={setWithdrawAmount}
        withdrawRecipient={withdrawRecipient}
        setWithdrawRecipient={setWithdrawRecipient}
        isWithdrawingGateway={isWithdrawingGateway}
        executeGatewayWithdraw={executeGatewayWithdraw}
        isConnected={isConnected}
        queryOnChainUsdcBalance={queryOnChainUsdcBalance}
        isQueryingBalance={isQueryingBalance}
        handleGenerateSandboxKey={handleGenerateSandboxKey}
        isPrivateKeyValid={isPrivateKeyValid}
        copyToClipboard={copyToClipboard}
        copiedText={copiedText}
      />
    );
  } else if (activeTab === "checkout") {
    tabElement = (
      <CheckoutTab
        widgetMerchant={widgetMerchant}
        setWidgetMerchant={setWidgetMerchant}
        widgetAmount={widgetAmount}
        setWidgetAmount={setWidgetAmount}
        checkingSession={checkingSession}
        activeSession={activeSession}
        clearSession={clearSession}
        copyToClipboard={copyToClipboard}
        copiedText={copiedText}
      />
    );
  } else if (activeTab === "invoices") {
    tabElement = (
      <InvoiceTab
        invoiceBuyer={invoiceBuyer}
        setInvoiceBuyer={setInvoiceBuyer}
        invoiceAmount={invoiceAmount}
        setInvoiceAmount={setInvoiceAmount}
        invoiceDueDate={invoiceDueDate}
        setInvoiceDueDate={setInvoiceDueDate}
        invoicePoRef={invoicePoRef}
        setInvoicePoRef={setInvoicePoRef}
        invoiceEarlyDiscount={invoiceEarlyDiscount}
        setInvoiceEarlyDiscount={setInvoiceEarlyDiscount}
        invoiceDescription={invoiceDescription}
        setInvoiceDescription={setInvoiceDescription}
        handleCreateInvoice={handleCreateInvoice}
        isCreatingInvoice={isCreatingInvoice}
        actionInvoiceId={actionInvoiceId}
        setActionInvoiceId={setActionInvoiceId}
        goodsReceiptRef={goodsReceiptRef}
        setGoodsReceiptRef={setGoodsReceiptRef}
        rejectReason={rejectReason}
        setRejectReason={setRejectReason}
        isProcessingInvoiceAction={isProcessingInvoiceAction}
        handleInvoiceAction={handleInvoiceAction}
        batchInvoiceIds={batchInvoiceIds}
        setBatchInvoiceIds={setBatchInvoiceIds}
        handleBatchSettleInvoices={handleBatchSettleInvoices}
        isBatchSettlingInvoices={isBatchSettlingInvoices}
        statusInvoiceId={statusInvoiceId}
        setStatusInvoiceId={setStatusInvoiceId}
        handleGetInvoiceStatus={handleGetInvoiceStatus}
        isFetchingInvoiceStatus={isFetchingInvoiceStatus}
        viewedInvoice={viewedInvoice}
      />
    );
  } else if (activeTab === "credit") {
    tabElement = (
      <CreditTab
        creditCompanyId={creditCompanyId}
        setCreditCompanyId={setCreditCompanyId}
        creditVolume={creditVolume}
        setCreditVolume={setCreditVolume}
        isCheckingCredit={isCheckingCredit}
        checkCreditScore={checkCreditScore}
        creditScore={creditScore}
        drawdownWallet={drawdownWallet}
        setDrawdownWallet={setDrawdownWallet}
        drawdownAmount={drawdownAmount}
        setDrawdownAmount={setDrawdownAmount}
        isDrawingDown={isDrawingDown}
        executeDrawdown={executeDrawdown}
      />
    );
  } else if (activeTab === "payments") {
    tabElement = (
      <PaymentsTab
        payee1Address={payee1Address}
        setPayee1Address={setPayee1Address}
        payee1Amount={payee1Amount}
        setPayee1Amount={setPayee1Amount}
        payee2Address={payee2Address}
        setPayee2Address={setPayee2Address}
        payee2Amount={payee2Amount}
        setPayee2Amount={setPayee2Amount}
        scheduledDate={scheduledDate}
        setScheduledDate={setScheduledDate}
        isProcessingBatch={isProcessingBatch}
        executeBatchPayment={executeBatchPayment}
        isScheduling={isScheduling}
        schedulePayment={schedulePayment}
        copyToClipboard={copyToClipboard}
        copiedText={copiedText}
      />
    );
  } else if (activeTab === "treasury") {
    tabElement = (
      <TreasuryTab
        treasuryAmount={treasuryAmount}
        setTreasuryAmount={setTreasuryAmount}
        treasuryFromToken={treasuryFromToken}
        setTreasuryFromToken={setTreasuryFromToken}
        treasuryToToken={treasuryToToken}
        setTreasuryToToken={setTreasuryToToken}
        treasurySourceChain={treasurySourceChain}
        setTreasurySourceChain={setTreasurySourceChain}
        treasuryTargetChain={treasuryTargetChain}
        setTreasuryTargetChain={setTreasuryTargetChain}
        isSwapping={isSwapping}
        executeSwap={executeSwap}
        isBridging={isBridging}
        executeBridge={executeBridge}
      />
    );
  } else if (activeTab === "fee") {
    tabElement = (
      <FeeTab
        adminAddress={adminAddress}
        setAdminAddress={setAdminAddress}
        feePercent={feePercent}
        setFeePercent={setFeePercent}
        isSavingPolicy={isSavingPolicy}
        saveFeePolicy={saveFeePolicy}
      />
    );
  } else if (activeTab === "webhooks") {
    tabElement = (
      <WebhooksTab
        webhookUrl={webhookUrl}
        setWebhookUrl={setWebhookUrl}
        webhookEvent={webhookEvent}
        setWebhookEvent={setWebhookEvent}
        isTestingWebhook={isTestingWebhook}
        testWebhookDelivery={testWebhookDelivery}
        copyToClipboard={copyToClipboard}
        copiedText={copiedText}
      />
    );
  } else if (activeTab === "templates") {
    tabElement = (
      <TemplatesTab
        tokenName={tokenName}
        setTokenName={setTokenName}
        tokenSymbol={tokenSymbol}
        setTokenSymbol={setTokenSymbol}
        useWalletExtension={useWalletExtension}
        setUseWalletExtension={setUseWalletExtension}
        isConnected={isConnected}
        connectedAddress={connectedAddress}
        isDeployingContract={isDeployingContract}
        deploymentProgress={deploymentProgress}
        deployTemplate={deployTemplate}
      />
    );
  } else if (activeTab === "sdk") {
    tabElement = (
      <SdkTab
        selectedSdkLang={selectedSdkLang}
        setSelectedSdkLang={setSelectedSdkLang}
        addLog={addLog}
        copyToClipboard={copyToClipboard}
        copiedText={copiedText}
      />
    );
  } else if (activeTab === "agents") {
    tabElement = (
      <AgentsTab
        selectedAgent={selectedAgent}
        setSelectedAgent={setSelectedAgent}
        agentJobAmount={agentJobAmount}
        setAgentJobAmount={setAgentJobAmount}
        agentJobDescription={agentJobDescription}
        setAgentJobDescription={setAgentJobDescription}
        isHiringAgent={isHiringAgent}
        agentJobStep={agentJobStep}
        agentJobTxHash={agentJobTxHash}
        runAgentJob={runAgentJob}
      />
    );
  }

  const isInfoTab = ["about", "faq", "contact", "legal"].includes(activeTab);
  const { docs, sandbox } = renderTabPanes(tabElement);

  return (
    <div className="portal-wrapper">
      {/* Top Promotion Header */}
      <div className="promo-banner-container">
        ⚡ Live Testnet Environment Powered by <span className="text-green">Circle Developer Platform</span> &amp; <span className="text-green">Arc Network</span>
      </div>

      {/* Global Header Top Bar Component */}
      <Navbar
        onSearchOpen={() => setIsSearchOpen(true)}
        liveBlockNumber={liveBlockNumber}
        liveGasPrice={liveGasPrice}
        rpcStatus={rpcStatus}
      />

      {/* Swiss grid layout header */}
      <header className="hero-header">
        <div className="hero-content">
          <h1>Stablecoins Commerce Stack</h1>
          <p>
            An all-in-one suite to accept, settle, hedge, audit, and automate B2B transactions using Circle Programmable Wallets, cross-chain smart contract escrow channels, and trade finance integrations.
          </p>
        </div>
      </header>

      {/* Main split screens section */}
      <main className="split-screen-container">
        {/* Left navigation sidebar component */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          feePercent={feePercent}
        />

        {/* Center documentation & code samples column */}
        <section className="docs-content">
          {isInfoTab ? <InfoTabs activeTab={activeTab as any} /> : docs}
        </section>

        {/* Right interaction sandbox console panel */}
        <section className="sandbox-panel">
          <div className="panel-header">
            <span>Playground Sandbox Simulator</span>
          </div>

          <div className="playground-controls">
            {!isInfoTab ? (
              sandbox
            ) : (
              <>
                {activeTab === "about" && (
                  <div className="control-group animate-fade-in">
                    <div className="control-title">Product Showcase Simulator</div>
                    <p className="text-xs text-muted" style={{ lineHeight: 1.5 }}>
                      BizFlow is powered by high-performance protocols. Run a health diagnostic to check your RPC latency and API nodes.
                    </p>
                    <button
                      className="btn-run"
                      onClick={() =>
                        addLog(
                          "success",
                          "System Diagnostic: Circle SDK: ACTIVE, Arc Node Latency: 22ms, Escrow Contract Status: ACTIVE"
                        )
                      }
                    >
                      <Play size={14} />
                      <span>Run Platform Diagnostic</span>
                    </button>
                  </div>
                )}

                {activeTab === "faq" && (
                  <div className="control-group animate-fade-in">
                    <div className="control-title">Interactive FAQ Search</div>
                    <div className="input-field">
                      <label>Search Knowledge Base</label>
                      <div style={{ position: "relative" }}>
                        <input
                          type="text"
                          placeholder="Type keywords (e.g. gas, wallet, credit)..."
                          onChange={(e) => {
                            const term = e.target.value.toLowerCase();
                            addLog("input", `Searching FAQ database for: "${term}"`);
                            if (term.includes("gas")) {
                              addLog("success", "FAQ Match: Arc uses native USDC for gas fees instead of ETH.");
                            } else if (term.includes("wallet")) {
                              addLog("success", "FAQ Match: We use Circle W3S Multi-Party Computation for wallets.");
                            } else if (term.includes("credit")) {
                              addLog("success", "FAQ Match: Credit scores analyze escrow and payment speeds dynamically.");
                            } else if (term) {
                              addLog("info", "Searching... try 'gas', 'wallet', or 'credit' for instant matching.");
                            }
                          }}
                          style={{
                            border: "2px solid var(--hairline)",
                            padding: "10px 12px 10px 32px",
                            borderRadius: "8px",
                            width: "100%",
                            outline: "none",
                            fontSize: "13px"
                          }}
                        />
                        <Search
                          size={14}
                          style={{ position: "absolute", left: "10px", top: "13px", color: "var(--muted)" }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "contact" && (
                  <div className="control-group animate-fade-in">
                    <div className="control-title">Active Support Ticket Status</div>
                    <div
                      style={{
                        background: "#ffffff",
                        border: "1px solid #e5e5e5",
                        padding: "12px",
                        borderRadius: "8px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px"
                      }}
                    >
                      <div className="flex-between text-xs">
                        <span>Active Tickets:</span>
                        <span className="text-muted">None</span>
                      </div>
                      <div className="flex-between text-xs">
                        <span>Urgent Security Alerts:</span>
                        <span className="text-green font-semibold">ALL SYSTEMS SECURE</span>
                      </div>
                    </div>
                    <button
                      className="btn-run"
                      onClick={() =>
                        addLog(
                          "info",
                          "System Notification: Feedback form sandbox initialized. Submitting form will log a ticket."
                        )
                      }
                    >
                      <span>Initialize Feedback Loop</span>
                    </button>
                  </div>
                )}

                {activeTab === "legal" && (
                  <div className="control-group animate-fade-in">
                    <div className="control-title">Compliance Attestation Status</div>
                    <div
                      style={{
                        padding: "12px",
                        borderRadius: "8px",
                        border: "2px solid #e2e8f0",
                        backgroundColor: "#f8fafc"
                      }}
                    >
                      <div
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          color: "#64748b",
                          marginBottom: "6px"
                        }}
                      >
                        Regulatory Sandbox
                      </div>
                      <p className="text-2xs text-muted" style={{ margin: 0, lineHeight: 1.4 }}>
                        BizFlow matches the requirements of a fully compliant, self-custodial developer platform. All interactions on this portal are fully mocked/sandboxed for the hackathon.
                      </p>
                    </div>
                    <button
                      className="btn-run"
                      onClick={() =>
                        addLog("success", "Compliance Attestation: Verified Safe Sandbox Env (June 1, 2026)")
                      }
                    >
                      <ShieldCheck size={14} />
                      <span>Verify Compliance Attestation</span>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>

      {/* Live HTTP JSON inspector pane */}
      <PayloadInspector
        isInspectorOpen={isInspectorOpen}
        setIsInspectorOpen={setIsInspectorOpen}
        activeRequestPayload={activeRequestPayload}
        activeResponsePayload={activeResponsePayload}
      />

      {/* Terminal log panel component */}
      <Terminal logs={logs} clearLogs={clearLogs} />

      {/* Global Footer component */}
      <footer className="footer-panel">
        <div className="footer-container">
          <div className="footer-brand">BizFlow Suite</div>
          <div>© 2026 Stablecoins Commerce Stack. All Rights Reserved.</div>
        </div>
      </footer>

      {/* Cmd+K Search overlay command palette component */}
      {isSearchOpen && (
        <SearchModal
          onClose={() => setIsSearchOpen(false)}
          onSelectTab={(tabId) => {
            setActiveTab(tabId);
            addLog("info", `Search selection: Navigated to tab "${tabId}"`);
          }}
        />
      )}
    </div>
  );
}

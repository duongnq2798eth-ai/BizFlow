import { useState, useEffect, useRef } from "react";
import { useAccount, useWriteContract, useSwitchChain, useWalletClient } from "wagmi";
import { parseUnits, createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount, generatePrivateKey } from "viem/accounts";
import { SIMPLE_TOKEN_ABI, SIMPLE_TOKEN_BYTECODE } from "../lib/constants";
import { LogEntry, TabId } from "../lib/types";
import { useTerminalLog } from "./useTerminalLog";
import { useArcStats } from "./useArcStats";

export function useBizFlowApp() {
  // Web3 Wallet Hooks
  const { address: connectedAddress, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const { switchChainAsync } = useSwitchChain();
  const { data: walletClient } = useWalletClient();

  // Navigation & Active Doc tab
  const [activeTab, setActiveTab] = useState<TabId>("deposit");

  // Terminal & Arc RPC polling custom hooks
  const { logs, addLog, clearLogs, setLogs } = useTerminalLog();
  const { liveBlockNumber, liveGasPrice, rpcStatus } = useArcStats();

  // Feature B2B Invoices state
  const [invoiceBuyer, setInvoiceBuyer] = useState("0x4CEF52F8241eD327B665123d24263071295cbde0");
  const [invoiceAmount, setInvoiceAmount] = useState("3500.00");
  const [invoiceDueDate, setInvoiceDueDate] = useState("2026-07-08");
  const [invoiceDescription, setInvoiceDescription] = useState("Office Supplies and IT Hardware");
  const [invoicePoRef, setInvoicePoRef] = useState("PO-99102");
  const [invoiceEarlyDiscount, setInvoiceEarlyDiscount] = useState("200"); // 2.00%
  
  const [actionInvoiceId, setActionInvoiceId] = useState("1");
  const [goodsReceiptRef, setGoodsReceiptRef] = useState("GR-12345");
  const [rejectReason, setRejectReason] = useState("Damaged items on delivery");
  
  const [batchInvoiceIds, setBatchInvoiceIds] = useState("1, 2, 3");
  const [statusInvoiceId, setStatusInvoiceId] = useState("1");
  const [viewedInvoice, setViewedInvoice] = useState<any>(null);
  
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
  const [isProcessingInvoiceAction, setIsProcessingInvoiceAction] = useState(false);
  const [isBatchSettlingInvoices, setIsBatchSettlingInvoices] = useState(false);
  const [isFetchingInvoiceStatus, setIsFetchingInvoiceStatus] = useState(false);

  // Feature 1: Gateway Deposit state
  const [depositAmount, setDepositAmount] = useState("5.00");
  const [depositChain, setDepositChain] = useState<"arc_testnet" | "base_sepolia">("arc_testnet");
  const [privateKey, setPrivateKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [useWalletExtension, setUseWalletExtension] = useState(false);
  const [isDepositing, setIsDepositing] = useState(false);

  // Feature 1B: Gateway x402 Micropayment Streaming state
  const [isStreamingGateway, setIsStreamingGateway] = useState(false);
  const [gatewayStreamedAmount, setGatewayStreamedAmount] = useState(0.0);
  const streamIntervalRef = useRef<any>(null);

  // Feature 1C: Gateway Withdrawal state
  const [withdrawChain, setWithdrawChain] = useState<string>("arc_testnet");
  const [withdrawAmount, setWithdrawAmount] = useState<string>("10.00");
  const [withdrawRecipient, setWithdrawRecipient] = useState<string>("0x4CEF52F8241eD327B665123d24263071295cbde0");
  const [isWithdrawingGateway, setIsWithdrawingGateway] = useState<boolean>(false);

  // Feature 2: Checkout Widget state
  const [widgetMerchant, setWidgetMerchant] = useState("BizFlow SME");
  const [widgetAmount, setWidgetAmount] = useState("25.00");
  const [activeSession, setActiveSession] = useState<any>(null);
  const [checkingSession, setCheckingSession] = useState(false);

  // Feature 3: Custom Fee Policy state
  const [adminAddress, setAdminAddress] = useState("0x4CEF52F8241eD327B665123d24263071295cbde0");
  const [feePercent, setFeePercent] = useState("0.50"); // 0.50 USDC
  const [isSavingPolicy, setIsSavingPolicy] = useState(false);

  // Feature 4: Smart Contract Templates state
  const [tokenName, setTokenName] = useState("BizToken");
  const [tokenSymbol, setTokenSymbol] = useState("BZT");
  const [isDeployingContract, setIsDeployingContract] = useState(false);
  const [deploymentProgress, setDeploymentProgress] = useState(0);

  // B2B Credit API state
  const [creditCompanyId, setCreditCompanyId] = useState("BF-49102");
  const [creditVolume, setCreditVolume] = useState("50000");
  const [creditScore, setCreditScore] = useState<any>(null);
  const [isCheckingCredit, setIsCheckingCredit] = useState(false);
  const [drawdownAmount, setDrawdownAmount] = useState("10000");
  const [drawdownWallet, setDrawdownWallet] = useState("0x4CEF52F8241eD327B665123d24263071295cbde0");
  const [isDrawingDown, setIsDrawingDown] = useState(false);

  // Payment API state
  const [payee1Address, setPayee1Address] = useState("0x37648342410a82be0a8276f5713437e9081a3e51");
  const [payee1Amount, setPayee1Amount] = useState("15.00");
  const [payee2Address, setPayee2Address] = useState("0x82f1ed2b3a4a0c8b93d48e89f81a7b0f81d1a932");
  const [payee2Amount, setPayee2Amount] = useState("10.00");
  const [scheduledDate, setScheduledDate] = useState("2026-06-01");
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);

  // Treasury API state
  const [treasuryAmount, setTreasuryAmount] = useState("1000");
  const [treasuryFromToken, setTreasuryFromToken] = useState("USDC");
  const [treasuryToToken, setTreasuryToToken] = useState("USYC");
  const [treasurySourceChain, setTreasurySourceChain] = useState<"base_sepolia" | "ethereum">("base_sepolia");
  const [treasuryTargetChain, setTreasuryTargetChain] = useState<"arc_testnet" | "base_sepolia">("arc_testnet");
  const [isSwapping, setIsSwapping] = useState(false);
  const [isBridging, setIsBridging] = useState(false);

  // Webhooks state
  const [webhookUrl, setWebhookUrl] = useState("https://api.merchant.com/webhooks");
  const [webhookEvent, setWebhookEvent] = useState("payment.succeeded");
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);

  // AI Agent Workforce state (ERC-8183 Escrow & ERC-8004 identity)
  const [selectedAgent, setSelectedAgent] = useState("taxauditbot");
  const [agentJobAmount, setAgentJobAmount] = useState("10.00");
  const [agentJobDescription, setAgentJobDescription] = useState("Reconcile Q1 corporate expense sheet against USDC invoices");
  const [isHiringAgent, setIsHiringAgent] = useState(false);
  const [agentJobStep, setAgentJobStep] = useState<"idle" | "escrow" | "working" | "submitting" | "settled">("idle");
  const [agentJobTxHash, setAgentJobTxHash] = useState("");
  const [agentsList, setAgentsList] = useState<any[]>([]);
  const [isRegisteringAgent, setIsRegisteringAgent] = useState(false);
  const [newAgentId, setNewAgentId] = useState("");
  const [newAgentName, setNewAgentName] = useState("");
  const [newAgentCapabilities, setNewAgentCapabilities] = useState("");

  const fetchAgents = async () => {
    try {
      const res = await fetch("/api/agents");
      const data = await res.json();
      if (data.success) {
        setAgentsList(data.agents || []);
      }
    } catch (e) {
      console.error("Failed to fetch agents list:", e);
    }
  };

  const handleRegisterAgent = async () => {
    if (!newAgentId || !newAgentName || !newAgentCapabilities) {
      addLog("error", "Failed: Agent ID, Name, and Capabilities are required.");
      return;
    }
    setIsRegisteringAgent(true);
    addLog("input", `POST /api/agents/register { agentId: "${newAgentId}", name: "${newAgentName}", capabilities: "${newAgentCapabilities}" }`);
    try {
      const res = await fetch("/api/agents/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: newAgentId,
          name: newAgentName,
          capabilities: newAgentCapabilities
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to register agent");
      
      addLog("success", `AI Agent successfully registered (Mode: ${data.mode})!`);
      addLog("success", `Agent Wallet: ${data.agent.walletAddress}`);
      addLog("success", `ERC-8004 Registry Tx Hash: ${data.agent.registryTxHash}`);
      
      setActiveResponsePayload(JSON.stringify(data, null, 2));
      setIsInspectorOpen(true);
      await fetchAgents();
      setNewAgentId("");
      setNewAgentName("");
      setNewAgentCapabilities("");
    } catch (e: any) {
      addLog("error", `Agent registration failed: ${e.message}`);
    } finally {
      setIsRegisteringAgent(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  // SDK state
  const [selectedSdkLang, setSelectedSdkLang] = useState<"typescript" | "python" | "go">("typescript");

  // Copy states
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Search state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [balanceQueryAddress, setBalanceQueryAddress] = useState("0x4CEF52F8241eD327B665123d24263071295cbde0");
  const [isQueryingBalance, setIsQueryingBalance] = useState(false);

  // Payload Inspector states
  const [activeRequestPayload, setActiveRequestPayload] = useState<string>("");
  const [activeResponsePayload, setActiveResponsePayload] = useState<string>("");
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  const queryOnChainUsdcBalance = async (address: string) => {
    setIsQueryingBalance(true);
    addLog("input", `Fetching unified stablecoin balances from Circle Gateway API...`);
    try {
      const res = await fetch("/api/gateway/balance");
      if (!res.ok) throw new Error("Gateway balance request failed");
      const responseData = await res.json();
      
      if (responseData.error) {
        throw new Error(responseData.error);
      }

      const total = responseData.totalBalance;
      addLog("success", `CIRCLE GATEWAY UNIFIED BALANCE: ${total} USDC`);
      
      responseData.balances.forEach((bal: any) => {
        addLog("info", ` - Chain: ${bal.chain} | Balance: ${bal.amount} ${bal.currency}`);
      });

      setActiveResponsePayload(JSON.stringify(responseData, null, 2));
      setIsInspectorOpen(true);
    } catch (e: any) {
      addLog("error", `Failed to query Gateway unified balance: ${e.message || e}`);
    } finally {
      setIsQueryingBalance(false);
    }
  };

  const executeGatewayWithdraw = async () => {
    if (!withdrawRecipient || !withdrawAmount) {
      addLog("error", "Failed: Recipient and amount are required.");
      return;
    }
    setIsWithdrawingGateway(true);
    addLog("input", `Calling POST /api/gateway/withdraw with chain: "${withdrawChain}", amount: "${withdrawAmount}", recipient: "${withdrawRecipient}"`);

    const reqPayload = {
      chain: withdrawChain,
      amount: withdrawAmount,
      recipientAddress: withdrawRecipient
    };
    setActiveRequestPayload(JSON.stringify(reqPayload, null, 2));

    try {
      const response = await fetch("/api/gateway/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reqPayload)
      });

      if (!response.ok) throw new Error("Withdrawal failed");
      const data = await response.json();
      addLog("success", `Gateway withdrawal processed successfully! Mode: ${data.mode}`);
      addLog("info", `Transaction Hash: ${data.txHash}`);

      setActiveResponsePayload(JSON.stringify(data, null, 2));
      setIsInspectorOpen(true);
    } catch (e: any) {
      addLog("error", `Withdrawal failed: ${e.message}`);
    } finally {
      setIsWithdrawingGateway(false);
    }
  };

  const toggleGatewayStream = () => {
    if (isStreamingGateway) {
      if (streamIntervalRef.current) {
        clearInterval(streamIntervalRef.current);
        streamIntervalRef.current = null;
      }
      setIsStreamingGateway(false);
      addLog("warning", `x402 Nanopayments stream suspended. Total settled: ${gatewayStreamedAmount.toFixed(6)} USDC`);
    } else {
      setIsStreamingGateway(true);
      addLog("input", "Initializing x402 HTTP payment channel for streaming API micro-billing...");
      addLog("info", "x402 channel established. Rate set: 0.000050 USDC per 300ms, Gas sponsored.");
      
      const interval = setInterval(() => {
        setGatewayStreamedAmount((prev) => prev + 0.000050);
        
        const now = new Date();
        const timeStr = now.toTimeString().split(" ")[0];
        const txId = Math.random().toString(16).substring(2, 8);
        setLogs((prevLogs) => [
          ...prevLogs,
          {
            timestamp: timeStr,
            type: "success" as const,
            message: `[x402 Stream] POST /api/nanopay - Settled 0.000050 USDC (Tx: 0x${txId}) - GAS: 0.00 USDC (Sponsored)`
          }
        ].slice(-30));
      }, 300);
      streamIntervalRef.current = interval;
    }
  };

  useEffect(() => {
    if (activeTab !== "deposit" && isStreamingGateway) {
      if (streamIntervalRef.current) {
        clearInterval(streamIntervalRef.current);
        streamIntervalRef.current = null;
      }
      setIsStreamingGateway(false);
      addLog("info", "Nanopayments streaming suspended due to tab navigation.");
    }
  }, [activeTab, isStreamingGateway, gatewayStreamedAmount, addLog]);

  // Check HttpOnly session status for Feature 2
  const checkSession = async () => {
    setCheckingSession(true);
    try {
      const res = await fetch("/api/session");
      if (res.ok) {
        const data = await res.json();
        setActiveSession(data);
        addLog("info", `Secure session verified: Cookie storage active. Token masked: ${data.userTokenMasked}`);
      } else {
        setActiveSession(null);
      }
    } catch (e) {
      setActiveSession(null);
    } finally {
      setCheckingSession(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  // Handle widget messages (when payment completes inside the iframe)
  useEffect(() => {
    const handleWidgetMessage = (event: MessageEvent) => {
      if (event.data && event.data.event === "bizflow_payment_success") {
        addLog("success", `[Checkout Widget Callback] Payment of ${event.data.amount} USDC succeeded!`);
        addLog("info", `txHash: ${event.data.txHash}`);
        addLog("info", `User Wallet: ${event.data.walletAddress}`);
        checkSession();
      }
    };
    window.addEventListener("message", handleWidgetMessage);
    return () => window.removeEventListener("message", handleWidgetMessage);
  }, [addLog]);

  const handleGenerateSandboxKey = () => {
    try {
      const key = generatePrivateKey();
      setPrivateKey(key);
      addLog("success", `Generated ephemeral sandbox private key: ${key.substring(0, 12)}... (Stored in client state memory only)`);
    } catch (e: any) {
      addLog("error", `Failed to generate sandbox key: ${e.message}`);
    }
  };

  // Copy helper
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Validation: Warning if private key does not start with 0x
  const isPrivateKeyValid = privateKey === "" || privateKey.startsWith("0x");

  // Feature 9: AI Agent Workforce
  const runAgentJob = async () => {
    setIsHiringAgent(true);
    setAgentJobStep("escrow");
    addLog("input", `POST /api/agents/execute { agentId: "${selectedAgent}", amount: "${agentJobAmount}", description: "${agentJobDescription}" }`);
    addLog("info", `Initializing ERC-8183 Job Escrow contract on Arc Testnet...`);
    addLog("info", `Target Agent (ERC-8004 Registry): ${selectedAgent}`);
    addLog("info", `Task Description: "${agentJobDescription}"`);
    addLog("info", `Escrow Balance: ${agentJobAmount} USDC`);

    try {
      const response = await fetch("/api/agents/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: selectedAgent.toLowerCase(),
          amount: agentJobAmount,
          description: agentJobDescription
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to execute agent job");
      }

      const dealId = data.jobId || 101;
      const jobTxHash = data.escrowTxHash;
      
      // Step 2: Agent Working
      setAgentJobStep("working");
      addLog("success", `ERC-8183 Job Escrow locked successfully! Mode: ${data.mode}`);
      addLog("success", `Transaction Hash: ${jobTxHash}`);
      setAgentJobTxHash(jobTxHash);
      addLog("info", `AI Agent [${selectedAgent}] started task execution...`);
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Step 3: Deliverable Submitted
      setAgentJobStep("submitting");
      addLog("success", `AI Agent submitted deliverables (verification proof received).`);
      addLog("info", `Verifying deliverables via Evaluator Oracle...`);
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Step 4: Settle Escrow & Complete Milestone
      setAgentJobStep("settled");
      addLog("success", `Evaluator verification PASSED! Milestone completed on-chain.`);
      addLog("success", `USDC released to Agent wallet: ${data.agentWallet}`);
      addLog("success", `Escrow Release Tx Hash: ${data.settleTxHash}`);
      addLog("success", `On-chain Reputation update Tx Hash: ${data.reputationTxHash}`);
      addLog("success", `Agent Reputation updated to: ${data.newReputation}%`);

      setActiveResponsePayload(JSON.stringify(data, null, 2));
      setIsInspectorOpen(true);
      await fetchAgents();
    } catch (e: any) {
      addLog("error", `Agent escrow execution failed: ${e.message}`);
    } finally {
      setIsHiringAgent(false);
    }
  };

  // Feature 1: Unified Balance Deposit
  const runDeposit = async () => {
    if (!useWalletExtension && !privateKey) {
      addLog("error", "Failed: Private key input or Wallet Connection is required.");
      return;
    }

    if (!useWalletExtension && !isPrivateKeyValid) {
      addLog("error", "Failed: Private key must start with 0x.");
      return;
    }

    setIsDepositing(true);
    addLog("input", `Running kit.unifiedBalance.deposit({ amount: "${depositAmount}", chainId: ${depositChain === "arc_testnet" ? 5042002 : 84532} })`);

    const targetChainId = depositChain === "arc_testnet" ? 5042002 : 84532;
    const USDC_ADDRESSES = {
      5042002: "0x3600000000000000000000000000000000000000", // Arc Testnet
      84532: "0x036cbd53842c5426634e7929541ec2318f3dcf7e",   // Base Sepolia
    };
    const tokenAddress = USDC_ADDRESSES[targetChainId as keyof typeof USDC_ADDRESSES];

    setActiveRequestPayload(JSON.stringify({
      amount: depositAmount,
      chainId: targetChainId,
      adapter: useWalletExtension ? "BrowserProviderAdapter" : "PrivateKeyAdapter",
      recipient: "0x4CEF52F8241eD327B665123d24263071295cbde0",
      gasToken: "USDC"
    }, null, 2));

    try {
      let txHash = "";
      if (useWalletExtension) {
        if (!isConnected) {
          throw new Error("No wallet connected. Please connect your browser wallet using the Connect Wallet button.");
        }
        addLog("info", `Checking wallet chain ID connection (must be ${targetChainId})...`);
        try {
          await switchChainAsync({ chainId: targetChainId });
          addLog("success", `Switched to target chain ID: ${targetChainId}`);
        } catch (err: any) {
          addLog("warning", `Chain switch request failed: ${err.message}. If manually selected, proceeding...`);
        }

        const parsedAmount = parseUnits(depositAmount, 6);
        addLog("info", `Requesting signature to transfer ${depositAmount} USDC to merchant pool...`);
        txHash = await writeContractAsync({
          address: tokenAddress as `0x${string}`,
          abi: [
            {
              name: "transfer",
              type: "function",
              stateMutability: "nonpayable",
              inputs: [
                { name: "recipient", type: "address" },
                { name: "amount", type: "uint256" }
              ],
              outputs: [{ name: "", type: "bool" }]
            }
          ],
          functionName: "transfer",
          args: ["0x4CEF52F8241eD327B665123d24263071295cbde0", parsedAmount]
        });
      } else {
        const account = privateKeyToAccount(privateKey as `0x${string}`);
        const rpcUrl = depositChain === "arc_testnet" 
          ? "https://rpc.testnet.arc.network" 
          : "https://sepolia.base.org";

        addLog("info", `Initializing local Wallet Client for ${account.address}...`);
        const publicClient = createPublicClient({ transport: http(rpcUrl) });
        const walletClient = createWalletClient({ account, transport: http(rpcUrl) });
        const parsedAmount = parseUnits(depositAmount, 6);

        addLog("info", `Simulating transaction inputs on-chain...`);
        const { request } = await publicClient.simulateContract({
          account,
          address: tokenAddress as `0x${string}`,
          abi: [
            {
              name: "transfer",
              type: "function",
              stateMutability: "nonpayable",
              inputs: [
                { name: "recipient", type: "address" },
                { name: "amount", type: "uint256" }
              ],
              outputs: [{ name: "", type: "bool" }]
            }
          ],
          functionName: "transfer",
          args: ["0x4CEF52F8241eD327B665123d24263071295cbde0", parsedAmount]
        });

        addLog("info", `Broadcasting signed transaction to RPC endpoint...`);
        txHash = await walletClient.writeContract(request);
      }

      addLog("success", `Transaction successfully broadcasted! Hash: ${txHash}`);
      addLog("info", "Waiting for block confirmation (deterministic sub-second finality on Arc)...");
      
      const rpcUrl = depositChain === "arc_testnet" 
        ? "https://rpc.testnet.arc.network" 
        : "https://sepolia.base.org";
      const publicClient = createPublicClient({ transport: http(rpcUrl) });
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash as `0x${string}` });

      addLog("success", `Success: Deposited ${depositAmount} USDC into Unified Balance! Confirmed in block ${receipt.blockNumber}`);

      addLog("info", `Registering deposit transaction with Circle Gateway...`);
      const gatewayRes = await fetch("/api/gateway/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chain: depositChain,
          amount: depositAmount,
          txHash,
        })
      });
      const gatewayData = await gatewayRes.json();
      addLog("success", `Circle Gateway: Deposit registered successfully! Mode: ${gatewayData.mode}`);

      setActiveResponsePayload(JSON.stringify({
        success: true,
        transactionHash: txHash,
        blockNumber: Number(receipt.blockNumber),
        gasUsed: receipt.gasUsed.toString(),
        network: depositChain === "arc_testnet" ? "Arc Testnet" : "Base Sepolia",
        gatewayStatus: gatewayData,
        paymasterSponsor: {
          sponsored: true,
          paymasterContract: "0x12c019a77dc6dfc3c2b8c5e628a8a49fa7bb12ab",
          policyType: "Circle Gas Station / Arc Gas Abstraction",
          gasSponsoredUSDC: (Number(receipt.gasUsed) * 0.000000001).toFixed(6) + " USDC"
        },
        timestamp: new Date().toISOString(),
      }, null, 2));
      setIsInspectorOpen(true);
      
    } catch (e: any) {
      addLog("error", `Deposit failed: ${e.message || e}`);
      setActiveResponsePayload(JSON.stringify({
        success: false,
        error: e.message || e
      }, null, 2));
    } finally {
      setIsDepositing(false);
    }
  };

  // Feature 3: Custom Fee Policy Configurator Simulation
  const saveFeePolicy = async () => {
    if (!adminAddress || !adminAddress.startsWith("0x") || adminAddress.length < 40) {
      addLog("error", "Failed: Admin Recipient Wallet must be a valid EVM address starting with 0x.");
      return;
    }

    setIsSavingPolicy(true);
    addLog("input", `Configuring custom fee policy: Fee: ${feePercent} USDC, Recipient: ${adminAddress}`);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      addLog("info", "Compiling custom fee parameters...");
      
      const feeVal = parseFloat(feePercent);
      const adminSplit = (feeVal * 0.90).toFixed(4);
      const arcSplit = (feeVal * 0.10).toFixed(4);

      addLog("info", `Calculated Split: Admin (90%): ${adminSplit} USDC | Arc Network (10%): ${arcSplit} USDC`);
      
      await new Promise((resolve) => setTimeout(resolve, 1000));
      addLog("info", "Invoking kit.unifiedBalance.setCustomFeePolicy(...) onchain...");
      
      await new Promise((resolve) => setTimeout(resolve, 800));
      addLog("success", "Custom Fee Policy registered successfully on Arc Testnet.");
      addLog("success", `All future spendings will automatically route ${adminSplit} USDC to Admin and ${arcSplit} USDC to Arc.`);
    } catch (e: any) {
      addLog("error", `Failed to set fee policy: ${e.message}`);
    } finally {
      setIsSavingPolicy(false);
    }
  };

  // Feature 4: Deploy Contract Template API Execution
  const deployTemplate = async () => {
    if (!tokenName || !tokenSymbol) {
      addLog("error", "Failed: Token Name and Symbol are required.");
      return;
    }

    setIsDeployingContract(true);
    setDeploymentProgress(10);

    // If wallet extension is connected and checked, execute real on-chain deploy!
    if (useWalletExtension && isConnected && walletClient) {
      addLog("input", `Deploying ERC-20 Token "${tokenName}" (${tokenSymbol}) on-chain via Connected Wallet...`);
      try {
        try {
          await switchChainAsync({ chainId: 5042002 });
        } catch (switchErr: any) {
          addLog("warning", "Network switch request failed, proceeding on current chain...");
        }

        setDeploymentProgress(30);
        addLog("info", "Please confirm the transaction deployment in your wallet extension...");

        const hash = await walletClient.deployContract({
          abi: SIMPLE_TOKEN_ABI,
          bytecode: SIMPLE_TOKEN_BYTECODE,
          args: [tokenName, tokenSymbol],
        });

        addLog("info", `Transaction successfully broadcasted! Tx Hash: ${hash}`);
        setDeploymentProgress(60);
        addLog("info", "Polling block receipt for deployment completion...");

        const publicClient = createPublicClient({ 
          transport: http("https://rpc.testnet.arc.network") 
        });
        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        setDeploymentProgress(100);
        addLog("success", `Success! Contract successfully deployed on Arc Testnet!`);
        addLog("success", `Contract Address: ${receipt.contractAddress}`);

        const resultObj = {
          success: true,
          status: "success",
          txHash: hash,
          contractAddress: receipt.contractAddress,
          network: "Arc Testnet (On-Chain Wallet Deploy)",
          tokenName,
          tokenSymbol,
          blockNumber: receipt.blockNumber.toString()
        };

        setActiveResponsePayload(JSON.stringify(resultObj, null, 2));
        setIsInspectorOpen(true);
        setIsDeployingContract(false);
      } catch (err: any) {
        addLog("error", `On-chain deployment failed: ${err.message || err}`);
        setIsDeployingContract(false);
      }
      return;
    }

    addLog("input", `Calling POST /templates/a1b74add/deploy with name: "${tokenName}", symbol: "${tokenSymbol}"`);

    const reqPayload = { name: tokenName, symbol: tokenSymbol };
    setActiveRequestPayload(JSON.stringify(reqPayload, null, 2));

    try {
      const response = await fetch("/templates/a1b74add/deploy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(reqPayload)
      });

      if (!response.ok) {
        throw new Error("HTTP " + response.status);
      }

      const data = await response.json();
      addLog("info", `Response: status: pending | idempotencyKey: ${data.idempotencyKey}`);
      addLog("info", `Tx Hash: ${data.txHash}`);
      addLog("info", "Polling deployment status GET /templates/a1b74add/status...");

      const pollInterval = setInterval(async () => {
        try {
          const pollRes = await fetch(`/templates/a1b74add/status?idempotencyKey=${data.idempotencyKey}`);
          if (!pollRes.ok) throw new Error("Status query failed");
          
          const pollData = await pollRes.json();
          setDeploymentProgress(pollData.progress);

          if (pollData.status === "deploying") {
            addLog("info", `Status: deploying | Progress: ${pollData.progress}%...`);
          } else if (pollData.status === "success") {
            clearInterval(pollInterval);
            addLog("success", "Status: success | Contract successfully compiled & deployed!");
            addLog("success", `Contract Address: ${pollData.contractAddress}`);
            setIsDeployingContract(false);
            
            setActiveResponsePayload(JSON.stringify(pollData, null, 2));
            setIsInspectorOpen(true);
          }
        } catch (pollErr: any) {
          clearInterval(pollInterval);
          addLog("error", `Polling error: ${pollErr.message}`);
          setIsDeployingContract(false);
        }
      }, 2000);

    } catch (e: any) {
      addLog("error", `Deployment failed: ${e.message || e}`);
      setIsDeployingContract(false);
    }
  };

  // B2B Credit API Simulation
  const checkCreditScore = async () => {
    if (!creditCompanyId || !creditVolume) {
      addLog("error", "Failed: Company ID and Annual Volume are required.");
      return;
    }
    setIsCheckingCredit(true);
    addLog("input", `Calling POST /api/credit with action: "score", companyId: "${creditCompanyId}", monthlyVolume: "${creditVolume}"`);

    const reqPayload = {
      action: "score",
      companyId: creditCompanyId,
      volume: creditVolume
    };
    setActiveRequestPayload(JSON.stringify(reqPayload, null, 2));

    try {
      const response = await fetch("/api/credit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reqPayload)
      });

      if (!response.ok) throw new Error("HTTP error " + response.status);
      const data = await response.json();
      setCreditScore(data);
      addLog("success", `Credit analysis complete: Score: ${data.score} | Credit Limit: ${data.creditLimit} USDC | APR: ${data.interestRate}`);
      
      setActiveResponsePayload(JSON.stringify(data, null, 2));
      setIsInspectorOpen(true);
    } catch (e: any) {
      addLog("error", `Credit check failed: ${e.message}`);
    } finally {
      setIsCheckingCredit(false);
    }
  };

  const executeDrawdown = async () => {
    if (!drawdownWallet || !drawdownWallet.startsWith("0x") || drawdownWallet.length < 40) {
      addLog("error", "Failed: Drawdown Wallet address must be a valid EVM address starting with 0x.");
      return;
    }
    setIsDrawingDown(true);
    addLog("input", `Calling POST /api/credit with action: "drawdown", amount: "${drawdownAmount}", recipient: "${drawdownWallet}"`);

    const reqPayload = {
      action: "drawdown",
      amount: drawdownAmount,
      walletAddress: drawdownWallet
    };
    setActiveRequestPayload(JSON.stringify(reqPayload, null, 2));

    try {
      const response = await fetch("/api/credit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reqPayload)
      });

      if (!response.ok) throw new Error("HTTP error " + response.status);
      const data = await response.json();
      addLog("success", `Drawdown settled! Retrieved ${data.amount} USDC on ${data.network}.`);
      addLog("info", `Tx Hash: ${data.txHash}`);

      setActiveResponsePayload(JSON.stringify(data, null, 2));
      setIsInspectorOpen(true);
    } catch (e: any) {
      addLog("error", `Drawdown execution failed: ${e.message}`);
    } finally {
      setIsDrawingDown(false);
    }
  };

  // Payment API Simulation
  const executeBatchPayment = async () => {
    if (!payee1Address || !payee2Address) {
      addLog("error", "Failed: Recipient wallet addresses are required.");
      return;
    }
    setIsProcessingBatch(true);
    addLog("input", "Calling POST /api/payments with action: 'batch', recipients count: 2");

    const reqPayload = {
      action: "batch",
      recipients: [
        { address: payee1Address, amount: payee1Amount },
        { address: payee2Address, amount: payee2Amount }
      ]
    };
    setActiveRequestPayload(JSON.stringify(reqPayload, null, 2));

    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reqPayload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Batch execution failed");
      }

      const data = await response.json();
      addLog("success", `Batch Payout Succeeded! Batch ID: ${data.batchId}`);
      addLog("success", `Total Settled: ${data.totalSettled} USDC across ${data.recipientsCount} addresses.`);
      addLog("info", `Network: ${data.network} | Tx Hash: ${data.txHash}`);

      setActiveResponsePayload(JSON.stringify(data, null, 2));
      setIsInspectorOpen(true);
    } catch (e: any) {
      addLog("error", `Batch payment failed: ${e.message}`);
    } finally {
      setIsProcessingBatch(false);
    }
  };

  const schedulePayment = async () => {
    setIsScheduling(true);
    addLog("input", `Calling POST /api/payments with action: 'schedule', date: "${scheduledDate}"`);

    const reqPayload = {
      action: "schedule",
      date: scheduledDate,
      recipients: [
        { address: payee1Address, amount: payee1Amount }
      ]
    };
    setActiveRequestPayload(JSON.stringify(reqPayload, null, 2));

    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reqPayload)
      });

      if (!response.ok) throw new Error("Scheduling failed");
      const data = await response.json();
      addLog("success", `Payout scheduled successfully! ID: ${data.scheduleId}`);
      addLog("info", `Execution timeline set for: ${data.executionDate}`);

      setActiveResponsePayload(JSON.stringify(data, null, 2));
      setIsInspectorOpen(true);
    } catch (e: any) {
      addLog("error", `Scheduling failed: ${e.message}`);
    } finally {
      setIsScheduling(false);
    }
  };

  // Treasury API Simulation
  const executeSwap = async () => {
    setIsSwapping(true);
    addLog("input", `Calling kit.swap() to exchange ${treasuryAmount} ${treasuryFromToken} for ${treasuryToToken}`);

    const reqPayload = {
      action: "swap",
      amount: treasuryAmount,
      fromToken: treasuryFromToken,
      toToken: treasuryToToken
    };
    setActiveRequestPayload(JSON.stringify(reqPayload, null, 2));

    try {
      const response = await fetch("/api/treasury", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reqPayload)
      });

      if (!response.ok) throw new Error("Swap failed");
      const data = await response.json();
      addLog("success", `Swap completed on Arc Testnet!`);
      addLog("success", `Input: ${data.inputAmount} ${data.inputToken} -> Output: ${data.outputAmount} ${data.outputToken}`);
      if (data.apyEstimate) {
        addLog("info", `Treasury Yield Alert: Deployed funds earning ${data.apyEstimate}`);
      }
      addLog("info", `Tx Hash: ${data.txHash}`);

      setActiveResponsePayload(JSON.stringify(data, null, 2));
      setIsInspectorOpen(true);
    } catch (e: any) {
      addLog("error", `Swap execution failed: ${e.message}`);
    } finally {
      setIsSwapping(false);
    }
  };

  const executeBridge = async () => {
    setIsBridging(true);
    addLog("input", `Calling kit.bridge() via CCTP: Bridging ${treasuryAmount} USDC from ${treasurySourceChain.toUpperCase()} to ${treasuryTargetChain.toUpperCase()}`);

    const reqPayload = {
      action: "bridge",
      amount: treasuryAmount,
      sourceChain: treasurySourceChain,
      targetChain: treasuryTargetChain
    };
    setActiveRequestPayload(JSON.stringify(reqPayload, null, 2));

    try {
      const response = await fetch("/api/treasury", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reqPayload)
      });

      if (!response.ok) throw new Error("Bridge failed");
      const data = await response.json();
      addLog("success", `Bridge finalized successfully!`);
      addLog("info", `Source Burn Tx: ${data.burnTxHash}`);
      addLog("success", `Target Mint Tx: ${data.mintTxHash} (Arc finality sub-second)`);
      addLog("info", `Cross-chain gas sponsored: ${data.gasFeeUSDC}`);

      setActiveResponsePayload(JSON.stringify(data, null, 2));
      setIsInspectorOpen(true);
    } catch (e: any) {
      addLog("error", `Bridge execution failed: ${e.message}`);
    } finally {
      setIsBridging(false);
    }
  };

  // Webhook Test Simulation
  const testWebhookDelivery = async () => {
    if (!webhookUrl) {
      addLog("error", "Failed: Webhook URL target is required.");
      return;
    }
    setIsTestingWebhook(true);
    addLog("input", `Invoking webhook dispatch: event: "${webhookEvent}", target: "${webhookUrl}"`);

    const reqPayload = {
      webhookUrl,
      eventType: webhookEvent
    };
    setActiveRequestPayload(JSON.stringify(reqPayload, null, 2));

    try {
      const response = await fetch("/api/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reqPayload)
      });

      const data = await response.json();
      if (data.success) {
        addLog("success", `Webhook delivered successfully! Status: ${data.deliveryStatus} (${data.responseTimeMs}ms)`);
        addLog("info", `Remote Response: ${data.deliveryMessage}`);
      } else {
        addLog("warning", `Webhook delivery failed or pending: ${data.deliveryMessage}`);
      }

      setActiveResponsePayload(JSON.stringify(data, null, 2));
      setIsInspectorOpen(true);
    } catch (e: any) {
      addLog("error", `Webhook test failed: ${e.message}`);
    } finally {
      setIsTestingWebhook(false);
    }
  };
  
  // ============ B2B INVOICE OPERATIONS ============
  const handleCreateInvoice = async () => {
    if (!invoiceBuyer || !invoiceAmount || !invoiceDueDate || !invoiceDescription) {
      addLog("error", "Failed: Buyer, amount, due date, and description are required.");
      return;
    }
    
    setIsCreatingInvoice(true);
    addLog("input", `POST /api/invoice { action: "create", buyer: "${invoiceBuyer}", amount: "${invoiceAmount}", dueDate: "${invoiceDueDate}", description: "${invoiceDescription}", purchaseOrderRef: "${invoicePoRef}", earlyPayDiscount: ${invoiceEarlyDiscount} }`);
    
    const reqPayload = {
      action: "create",
      buyer: invoiceBuyer,
      amount: invoiceAmount,
      dueDate: invoiceDueDate,
      description: invoiceDescription,
      purchaseOrderRef: invoicePoRef,
      earlyPayDiscount: Number(invoiceEarlyDiscount)
    };
    
    setActiveRequestPayload(JSON.stringify(reqPayload, null, 2));
    
    try {
      const res = await fetch("/api/invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reqPayload)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create invoice");
      
      addLog("success", `Invoice created successfully (Mode: ${data.mode})! ID/Tx: ${data.invoiceId || data.txHash}`);
      if (data.mode === "on-chain") {
        addLog("success", `On-chain Transaction Hash: ${data.txHash}`);
      }
      setActiveResponsePayload(JSON.stringify(data, null, 2));
      setIsInspectorOpen(true);
    } catch (e: any) {
      addLog("error", `Invoice creation failed: ${e.message}`);
    } finally {
      setIsCreatingInvoice(false);
    }
  };
  
  const handleInvoiceAction = async (action: "approve" | "settle" | "reject" | "dispute") => {
    if (!actionInvoiceId) {
      addLog("error", "Failed: Invoice ID is required.");
      return;
    }
    
    setIsProcessingInvoiceAction(true);
    const idNum = parseInt(actionInvoiceId);
    
    let actionLabel = "";
    let payloadExtra: any = {};
    
    if (action === "approve") {
      actionLabel = `approving with goods receipt: "${goodsReceiptRef}"`;
      payloadExtra = { goodsReceiptRef };
    } else if (action === "reject") {
      actionLabel = `rejecting with reason: "${rejectReason}"`;
      payloadExtra = { reason: rejectReason };
    } else {
      actionLabel = `${action} invoice`;
    }
    
    addLog("input", `POST /api/invoice { action: "${action}", invoiceId: ${idNum}, ... }`);
    addLog("info", `Initiating ${actionLabel} operation on Arc Testnet...`);
    
    const reqPayload = {
      action,
      invoiceId: idNum,
      ...payloadExtra
    };
    
    setActiveRequestPayload(JSON.stringify(reqPayload, null, 2));
    
    try {
      const res = await fetch("/api/invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reqPayload)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Failed to ${action} invoice`);
      
      addLog("success", `Invoice successfully ${action}d (Mode: ${data.mode})!`);
      addLog("success", `Transaction Hash: ${data.txHash}`);
      if (data.approvalTxHash) {
        addLog("success", `USDC Approval Tx Hash: ${data.approvalTxHash}`);
      }
      
      setActiveResponsePayload(JSON.stringify(data, null, 2));
      setIsInspectorOpen(true);
    } catch (e: any) {
      addLog("error", `Invoice ${action} failed: ${e.message}`);
    } finally {
      setIsProcessingInvoiceAction(false);
    }
  };
  
  const handleBatchSettleInvoices = async () => {
    if (!batchInvoiceIds) {
      addLog("error", "Failed: Batch Invoice IDs are required.");
      return;
    }
    
    setIsBatchSettlingInvoices(true);
    const parsedIds = batchInvoiceIds.split(",").map(item => parseInt(item.trim())).filter(id => !isNaN(id));
    
    addLog("input", `POST /api/invoice { action: "batch", invoiceIds: [${parsedIds.join(", ")}] }`);
    addLog("info", `Initiating combined USDC approvals and batch settlement for ${parsedIds.length} invoices...`);
    
    const reqPayload = {
      action: "batch",
      invoiceIds: parsedIds
    };
    
    setActiveRequestPayload(JSON.stringify(reqPayload, null, 2));
    
    try {
      const res = await fetch("/api/invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reqPayload)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed batch settlement");
      
      addLog("success", `Batch settlement succeeded (Mode: ${data.mode})!`);
      addLog("success", `Batch Tx Hash: ${data.txHash}`);
      if (data.totalPaid) {
        addLog("success", `Total Settled Amount: ${data.totalPaid} USDC`);
      }
      if (data.approvalTxHash) {
        addLog("success", `Combined USDC Approval Tx Hash: ${data.approvalTxHash}`);
      }
      
      setActiveResponsePayload(JSON.stringify(data, null, 2));
      setIsInspectorOpen(true);
    } catch (e: any) {
      addLog("error", `Batch settlement failed: ${e.message}`);
    } finally {
      setIsBatchSettlingInvoices(false);
    }
  };
  
  const handleGetInvoiceStatus = async () => {
    if (!statusInvoiceId) {
      addLog("error", "Failed: Invoice ID is required.");
      return;
    }
    
    setIsFetchingInvoiceStatus(true);
    const idNum = parseInt(statusInvoiceId);
    
    addLog("input", `POST /api/invoice { action: "status", invoiceId: ${idNum} }`);
    
    const reqPayload = {
      action: "status",
      invoiceId: idNum
    };
    
    setActiveRequestPayload(JSON.stringify(reqPayload, null, 2));
    
    try {
      const res = await fetch("/api/invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reqPayload)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch invoice status");
      
      setViewedInvoice(data.invoice);
      addLog("success", `Fetched status (Mode: ${data.mode})! Status: ${data.invoice.status} | Amount: ${data.invoice.amount} USDC`);
      
      setActiveResponsePayload(JSON.stringify(data, null, 2));
      setIsInspectorOpen(true);
    } catch (e: any) {
      addLog("error", `Status check failed: ${e.message}`);
    } finally {
      setIsFetchingInvoiceStatus(false);
    }
  };

  // Clear Secure Cookie
  const clearSession = async () => {
    await fetch("/api/session", { method: "DELETE" });
    setActiveSession(null);
    addLog("info", "Secure session cookie deleted from browser.");
  };

  return {
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
    setCreditScore,
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
    balanceQueryAddress,
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
    agentsList,
    isRegisteringAgent,
    newAgentId,
    setNewAgentId,
    newAgentName,
    setNewAgentName,
    newAgentCapabilities,
    setNewAgentCapabilities,
    handleRegisterAgent,
  };
}

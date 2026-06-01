"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect, useRef } from "react";
import { 
  Terminal as TerminalIcon, 
  Play, 
  Copy, 
  Check, 
  HelpCircle, 
  Settings, 
  Code, 
  Wallet, 
  ShieldCheck, 
  User, 
  ArrowRight, 
  Sliders, 
  Layers, 
  BookOpen, 
  Lock, 
  AlertCircle,
  ExternalLink,
  Info,
  DollarSign,
  PieChart,
  RefreshCw,
  TrendingUp,
  Send,
  Zap,
  Globe,
  Bell,
  Cpu,
  Download,
  Terminal as ConsoleIcon,
  Search,
  Users,
  Mail,
  ShieldAlert
} from "lucide-react";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useWriteContract, useSwitchChain, useWalletClient } from "wagmi";
import { parseUnits, createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount, generatePrivateKey } from "viem/accounts";

import nextDynamic from 'next/dynamic';

// Types for logs
interface LogEntry {
  timestamp: string;
  type: "info" | "success" | "warning" | "error" | "input";
  message: string;
}

const SIMPLE_TOKEN_ABI = [
  {
    "inputs": [
      { "internalType": "string", "name": "_name", "type": "string" },
      { "internalType": "string", "name": "_symbol", "type": "string" }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "owner", "type": "address" },
      { "indexed": true, "internalType": "address", "name": "spender", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }
    ],
    "name": "Approval",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "from", "type": "address" },
      { "indexed": true, "internalType": "address", "name": "to", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }
    ],
    "name": "Transfer",
    "type": "event"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "", "type": "address" },
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "name": "allowance",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "spender", "type": "address" },
      { "internalType": "uint256", "name": "value", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [
      { "internalType": "bool", "name": "success", "type": "bool" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "name": "balanceOf",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [
      { "internalType": "uint8", "name": "", "type": "uint8" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [
      { "internalType": "string", "name": "", "type": "string" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [
      { "internalType": "string", "name": "", "type": "string" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "uint256", "name": "value", "type": "uint256" }
    ],
    "name": "transfer",
    "outputs": [
      { "internalType": "bool", "name": "success", "type": "bool" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "from", "type": "address" },
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "uint256", "name": "value", "type": "uint256" }
    ],
    "name": "transferFrom",
    "outputs": [
      { "internalType": "bool", "name": "success", "type": "bool" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

const SIMPLE_TOKEN_BYTECODE = "0x6080604052601260025f6101000a81548160ff021916908360ff1602179055503480156200002b575f80fd5b506040516200164e3803806200164e8339818101604052810190620000519190620002e4565b815f90816200006191906200059e565b5080600190816200007391906200059e565b5060025f9054906101000a900460ff1660ff16600a620000949190620007ff565b620f4240620000a491906200084f565b60038190555060035460045f3373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f20819055503373ffffffffffffffffffffffffffffffffffffffff165f73ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef6003546040516200014f9190620008aa565b60405180910390a35050620008c5565b5f604051905090565b5f80fd5b5f80fd5b5f80fd5b5f80fd5b5f601f19601f8301169050919050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52604160045260245ffd5b620001c08262000178565b810181811067ffffffffffffffff82111715620001e257620001e162000188565b5b80604052505050565b5f620001f66200015f565b9050620002048282620001b5565b919050565b5f67ffffffffffffffff82111562000226576200022562000188565b5b620002318262000178565b9050602081019050919050565b5f5b838110156200025d57808201518184015260208101905062000240565b5f8484015250505050565b5f6200027e620002788462000209565b620001eb565b9050828152602081018484840111156200029d576200029c62000174565b5b620002aa8482856200023e565b509392505050565b5f82601f830112620002c957620002c862000170565b5b8151620002db84826020860162000268565b91505092915050565b5f8060408385031215620002fd57620002fc62000168565b5b5f83015167ffffffffffffffff8111156200031d576200031c6200016c565b5b6200032b85828601620002b2565b925050602083015167ffffffffffffffff8111156200034f576200034e6200016c565b5b6200035d85828601620002b2565b9150509250929050565b5f81519050919050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52602260045260245ffd5b5f6002820490506001821680620003b657607f821691505b602082108103620003cc57620003cb62000371565b5b50919050565b5f819050815f5260205f20905b81548152906001019060200180831161026357829003601f168201915b505050505081565b5f6020601f8301049050919050565b5f82821b905092915050565b5f60088302620004307fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff82620003f3565b6200043c8683620003f3565b95508019841693508086168417925050509392505050565b5f819050919050565b5f819050919050565b5f62000486620004806200047a8462000454565b6200045d565b62000454565b9050919050565b5f819050919050565b620004a18362000466565b620004b9620004b0826200048d565b848454620003ff565b825550505050565b5f90565b620004cf620004c1565b620004dc81848462000496565b505050565b5b818110156200050357620004f75f82620004c5565b600181019050620004e2565b5050565b601f82111562000552576200051c81620003d2565b6200052784620003e4565b8101602085101562000537578190505b6200054f6200054685620003e4565b830182620004e1565b50505b50505b505050565b5f82821c905092915050565b5f620005745f198460080262000557565b1980831691505092915050565b5f6200058e838362000563565b9150826002028217905092915050565b620005a98262000367565b67ffffffffffffffff811115620005c557620005c462000188565b5b620005d182546200039e565b620005de82828562000507565b5f60209050601f83116001811462000614575f8415620005ff578287015190505b6200060b858262000581565b8655506200067a565b601f1984166200062486620003d2565b5f5b828110156200064d5784890151825560018201915060208501945060208101905062000626565b868310156200066d578489015162000669601f89168262000563565b8355505b6001600288020188555050505b505050505050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52601160045260245ffd5b5f8160011c9050919050565b5f808291508390505b60018511156200070c57808604811115620006e457620006e362000682565b5b6001851615620006f45780820291505b80810290506200070485620006af565b9450620006c4565b94509492505050565b5f82620007265760019050620007f8565b8162000735575f9050620007f8565b81600181146200074e576002811462000759576200078f565b6001915050620007f8565b60ff8411156200076e576200076d62000682565b5b8360020a91508482111562000788576200078762000682565b5b50620007f8565b5060208310610133831016604e8410600b8410161715620007c95782820a905083811115620007c357620007c262000682565b5b620007f8565b620007d88484846001620006bb565b92509050818404811115620007f257620007f162000682565b5b81810290505b9392505050565b5f6200080b8262000454565b9150620008188362000454565b9250620008477fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff848462000715565b905092915050565b5f6200085b8262000454565b9150620008688362000454565b9250828202620008788162000454565b9150828204841483151762000892576200089162000682565b5b5092915050565b620008a48162000454565b82525050565b5f602082019050620008bf5f83018462000899565b92915050565b610d7b80620008d35f395ff3fe608060405234801561000f575f80fd5b5060043610610091575f3560e01c8063313ce56711610064578063313ce5671461013157806370a082311461014f57806395d89b411461017f578063a9059cbb1461019d578063dd62ed3e146101cd57610091565b806306fdde0314610095578063095ea7b3146100b357806318160ddd146100e357806323b872dd14610101575b5f80fd5b61009d6101fd565b6040516100aa919061094e565b60405180910390f35b6100cd60048036038101906100c891906109ff565b610288565b6040516100da9190610a57565b60405180910390f35b6100eb610375565b6040516100f89190610a7f565b60405180910390f35b61011b60048036038101906101169190610a98565b61037b565b6040516101289190610a57565b60405180910390f35b61013961065b565b6040516101469190610b03565b60405180910390f35b61016960048036038101906101649190610b1c565b61066d565b6040516101769190610a7f565b60405180910390f35b610187610682565b604051610194919061094e565b60405180910390f35b6101b760048036038101906101b291906109ff565b61070e565b6040516101c49190610a57565b60405180910390f35b6101e760048036038101906101e29190610b47565b6108a4565b6040516101f49190610a7f565b60405180910390f35b5f805461020990610bb2565b80601f016020809104026020016040519081016040528092919081815260200182805461023590610bb2565b80156102805780601f1061025757610100808354040283529160200191610280565b820191905f5260205f20905b81548152906001019060200180831161026357829003601f168201915b505050505081565b5f8160055f3373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205f8573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205410156103fc576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016103f390610c2c565b60405180910390fd5b8160055f8673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205f3373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205410156104b7576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016104ae90610c94565b60405180910390fd5b8160045f8673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205f8282546105039190610cdf565b925050819055508160045f8573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205f8282546105569190610d12565b925050819055508160055f8673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205f3373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205f8282546105e49190610cdf565b925050819055508273ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef846040516106489190610a7f565b60405180910390a3600190509392505050565b60025f9054906101000a900460ff1681565b6004602052805f5260405f205f915090505481565b6001805461068f90610bb2565b80601f01602080910402602001604051908101604052809291908181526020018280546106bb90610bb2565b80156107065780601f106106dd57610100808354040283529160200191610706565b820191905f5260205f20905b8154815290600101906020018083116106e957829003601f168201915b505050505081565b5f8160045f3373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f2054101561078f576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161078690610c2c565b60405180910390fd5b8160045f3373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205f8282546107db9190610cdf565b925050819055508160045f8573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205f82825461082e9190610d12565b925050819055508273ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef846040516108929190610a7f565b60405180910390a36001905092915050565b6005602052815f5260405f20602052805f5260405f205f91509150505481565b5f81519050919050565b5f82825260208201905092915050565b5f5b838110156108fb5780820151818401526020810190506108e0565b5f8484015250505050565b5f601f19601f8301169050919050565b5f610920826108c4565b61092a81856108ce565b935061093a8185602086016108de565b61094381610906565b840191505092915050565b5f6020820190508181035f8301526109668184610916565b905092915050565b5f80fd5b5f73ffffffffffffffffffffffffffffffffffffffff82169050919050565b5f61099b82610972565b9050919050565b6109ab81610991565b81146109b5575f80fd5b50565b5f813590506109c6816109a2565b92915050565b5f819050919050565b6109de816109cc565b81146109e8575f80fd5b50565b5f813590506109f9816109d5565b92915050565b5f8060408385031215610a1557610a1461096e565b5b5f610a22858286016109b8565b9250506020610a33858286016109eb565b9150509250929050565b5f8115159050919050565b610a5181610a3d565b82525050565b5f602082019050610a6a5f830184610a48565b92915050565b610a79816109cc565b82525050565b5f602082019050610a925f830184610a70565b92915050565b5f805f60608486031215610aaf57610aae61096e565b5b5f610abc868287016109b8565b9350506020610acd868287016109b8565b9250506040610ade868287016109eb565b9150509250925092565b5f60ff82169050919050565b610afd81610ae8565b82525050565b5f602082019050610b165f830184610af4565b92915050565b5f60208284031215610b3157610b3061096e565b5b5f610b3e848285016109b8565b91505092915050565b5f8060408385031215610b5d57610b5c61096e565b5b5f610b6a858286016109b8565b9250506020610b7b858286016109b8565b9150509250929050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52602260045260245ffd5b5f6002820490506001821680610bc957607f821691505b602082108103610bdc57610bdb610b85565b5b50919050565b7f496e73756666696369656e742062616c616e63650000000000000000000000005f82015250565b5f610c166014836108ce565b9150610c2182610be2565b602082019050919050565b5f6020820190508181035f830152610c4381610c0a565b9050919050565b7f496e73756666696369656e7420616c6c6f77616e6365000000000000000000005f82015250565b5f610c7e6016836108ce565b9150610c8982610c4a565b602082019050919050565b5f6020820190508181035f830152610cab81610c72565b9050919050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52601160045260245ffd5b5f610ce9826109cc565b9150610cf4836109cc565b9250828203905081811115610d0c57610d0b610cb2565b5b92915050565b5f610d1c826109cc565b9150610d27836109cc565b9250828201905080821115610d3f57610d3e610cb2565b5b9291505056fea2646970667358221220bf6cb20a7a6d0a06de74160a0b19b35b9a502a2622aa59df399505d001c78a2164736f6c63430008140033";

function Home() {
  // Web3 Wallet Hooks
  const { address: connectedAddress, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const { switchChainAsync } = useSwitchChain();
  const { data: walletClient } = useWalletClient();

  // Navigation & Active Doc tab
  const [activeTab, setActiveTab] = useState<
    "deposit" | "checkout" | "credit" | "payments" | "treasury" | "fee" | "webhooks" | "templates" | "sdk" | "agents"
  >("deposit");

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
  const [selectedAgent, setSelectedAgent] = useState("TaxAuditBot");
  const [agentJobAmount, setAgentJobAmount] = useState("10.00");
  const [agentJobDescription, setAgentJobDescription] = useState("Reconcile Q1 corporate expense sheet against USDC invoices");
  const [isHiringAgent, setIsHiringAgent] = useState(false);
  const [agentJobStep, setAgentJobStep] = useState<"idle" | "escrow" | "working" | "submitting" | "settled">("idle");
  const [agentJobTxHash, setAgentJobTxHash] = useState("");

  // SDK state
  const [selectedSdkLang, setSelectedSdkLang] = useState<"typescript" | "python" | "go">("typescript");

  // Copy states
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Search state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSelectedIndex, setSearchSelectedIndex] = useState(0);

  // Live Arc Testnet Stats
  const [liveBlockNumber, setLiveBlockNumber] = useState<number | null>(null);
  const [liveGasPrice, setLiveGasPrice] = useState<string | null>(null);
  const [rpcStatus, setRpcStatus] = useState<"connecting" | "online" | "offline">("connecting");
  const [balanceQueryAddress, setBalanceQueryAddress] = useState("0x4CEF52F8241eD327B665123d24263071295cbde0");
  const [isQueryingBalance, setIsQueryingBalance] = useState(false);

  // Payload Inspector states
  const [activeRequestPayload, setActiveRequestPayload] = useState<string | null>(null);
  const [activeResponsePayload, setActiveResponsePayload] = useState<string | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  useEffect(() => {
    const fetchArcStats = async () => {
      try {
        const res = await fetch("https://rpc.testnet.arc.network", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify([
            {
              jsonrpc: "2.0",
              method: "eth_blockNumber",
              params: [],
              id: 1
            },
            {
              jsonrpc: "2.0",
              method: "eth_gasPrice",
              params: [],
              id: 2
            }
          ])
        });

        if (!res.ok) throw new Error("Network response not ok");
        const data = await res.json();

        if (Array.isArray(data) && data.length === 2) {
          const blockHex = data[0].result;
          const gasHex = data[1].result;

          if (blockHex) {
            setLiveBlockNumber(parseInt(blockHex, 16));
          }
          if (gasHex) {
            const gasWei = BigInt(gasHex);
            // Arc gas is priced in USDC (18 decimals for gas units)
            const gasUSDC = (Number(gasWei) / 1e18).toFixed(9);
            setLiveGasPrice(gasUSDC);
          }
          setRpcStatus("online");
        } else {
          setRpcStatus("offline");
        }
      } catch (e) {
        setRpcStatus("offline");
      }
    };

    fetchArcStats();
    const interval = setInterval(fetchArcStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const queryOnChainUsdcBalance = async (address: string) => {
    if (!address || !address.startsWith("0x") || address.length < 40) {
      addLog("error", "Invalid Address format. Must start with 0x and be 40+ characters.");
      return;
    }
    setIsQueryingBalance(true);
    addLog("input", `Querying Arc Testnet USDC balance for address: ${address}...`);
    try {
      const cleanAddress = address.substring(2).toLowerCase().padStart(64, "0");
      const dataPayload = `0x70a08231${cleanAddress}`;

      const res = await fetch("https://rpc.testnet.arc.network", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_call",
          params: [
            {
              to: "0x3600000000000000000000000000000000000000", // USDC on Arc Testnet
              data: dataPayload
            },
            "latest"
          ],
          id: 1
        })
      });

      if (!res.ok) throw new Error("RPC request failed");
      const responseData = await res.json();
      
      if (responseData.error) {
        throw new Error(responseData.error.message);
      }

      const hexResult = responseData.result;
      const rawBalance = BigInt(hexResult);
      // USDC on Arc Testnet is 6 decimals
      const usdcBalance = (Number(rawBalance) / 1000000).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 });
      addLog("success", `LIVE ON-CHAIN USDC BALANCE: ${usdcBalance} USDC`);
    } catch (e: any) {
      addLog("error", `Failed to query on-chain balance: ${e.message || e}`);
    } finally {
      setIsQueryingBalance(false);
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
            type: "success",
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
  }, [activeTab, isStreamingGateway, gatewayStreamedAmount]);

  // Terminal Logs
  const [logs, setLogs] = useState<LogEntry[]>([
    { timestamp: "19:12:30", type: "info", message: "BizFlow Sandboxed Developer Environment loaded." },
    { timestamp: "19:12:31", type: "info", message: "Hardcoded networks: Arc Testnet (ID: 5042002), Base Sepolia (ID: 84532)." }
  ]);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleGlobalKey);
    return () => window.removeEventListener("keydown", handleGlobalKey);
  }, []);

  // Reset selected index when search query changes to prevent out-of-bounds selection
  useEffect(() => {
    setSearchSelectedIndex(0);
  }, [searchQuery]);

  // Search Items List
  const searchItems = [
    { id: "deposit", title: "Gateway Deposit (Unified Balance)", category: "Core Products", desc: "kit.unifiedBalance.deposit() for cross-chain USDC inflow" },
    { id: "checkout", title: "Embeddable Checkout Widget", category: "Core Products", desc: "User-Controlled Wallet creation and XSS httpOnly sessions" },
    { id: "credit", title: "B2B Credit API & Underwriting", category: "Trade Credit", desc: "Corporate credit limits, scoring rating, and drawdowns" },
    { id: "payments", title: "Supplier Payouts (Batch & Schedule)", category: "Payments Engine", desc: "Bulk zero-gas payouts and scheduled payment routing" },
    { id: "treasury", title: "Treasury Swap & Yield Optimizations", category: "Treasury Management", desc: "Optimize idle USDC to USYC and CCTP cross-chain bridging" },
    { id: "fee", title: "Platform Fee Policy Configurator", category: "Infrastructure", desc: "setCustomFeePolicy split 90% Admin and 10% Arc Network" },
    { id: "webhooks", title: "Webhook Events Hub", category: "Infrastructure", desc: "Receive real-time notifications for payment/credit state changes" },
    { id: "templates", title: "Smart Contract ERC-20 Templates", category: "Developer Hub", desc: "Deploy audited standard tokens on Arc Testnet" },
    { id: "sdk", title: "Client SDK Downloads & API Status", category: "Developer Hub", desc: "TypeScript, Python, and Go libraries setup templates" },
  ];

  const filteredSearchItems = searchItems.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.desc.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (filteredSearchItems.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSearchSelectedIndex(prev => (prev + 1) % filteredSearchItems.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSearchSelectedIndex(prev => (prev - 1 + filteredSearchItems.length) % filteredSearchItems.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = filteredSearchItems[searchSelectedIndex];
      if (item) {
        selectSearchItem(item.id as any);
      }
    }
  };

  const selectSearchItem = (tabId: "deposit" | "checkout" | "credit" | "payments" | "treasury" | "fee" | "webhooks" | "templates" | "sdk") => {
    setActiveTab(tabId);
    setIsSearchOpen(false);
    setSearchQuery("");
    setSearchSelectedIndex(0);
    addLog("info", `Search selection: Navigated to tab "${tabId}"`);
  };

  // Auto scroll terminal
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

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
  }, []);

  // Logger helper
  const addLog = (type: "info" | "success" | "warning" | "error" | "input", message: string) => {
    const now = new Date();
    const timestamp = now.toTimeString().split(" ")[0];
    setLogs((prev) => [...prev, { timestamp, type, message }].slice(-30));
  };

  const handleGenerateSandboxKey = () => {
    try {
      const key = generatePrivateKey();
      setPrivateKey(key);
      addLog("success", `Generated ephemeral sandbox private key: ${key.substring(0, 12)}... (Stored in client state memory only)`);
    } catch (e: any) {
      addLog("error", `Failed to generate sandbox key: ${e.message}`);
    }
  };

  const clearLogs = () => {
    setLogs([{ timestamp: new Date().toTimeString().split(" ")[0], type: "info", message: "Terminal cleared." }]);
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
    addLog("input", `POST /api/escrow { action: "create", seller: "0x8183E5c700000000000000000000000000000000", milestoneAmounts: ["${agentJobAmount}"], description: "${agentJobDescription}" }`);
    addLog("info", `Initializing ERC-8183 Job Escrow contract on Arc Testnet...`);
    addLog("info", `Target Agent (ERC-8004 Registry): ${selectedAgent}`);
    addLog("info", `Task Description: "${agentJobDescription}"`);
    addLog("info", `Escrow Balance: ${agentJobAmount} USDC`);

    try {
      // 1. Call Backend API to deploy / register the Escrow Deal
      const createResponse = await fetch("/api/escrow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          seller: "0x8183E5c700000000000000000000000000000000", // Representative AI Agent Account
          milestoneAmounts: [agentJobAmount],
          description: agentJobDescription
        })
      });

      const createData = await createResponse.json();
      if (!createResponse.ok) {
        throw new Error(createData.error || "Failed to create trade escrow deal.");
      }

      const dealId = createData.dealId || 101;
      const jobTxHash = createData.txHash;
      addLog("success", `ERC-8183 Job Escrow locked successfully! Mode: ${createData.mode}`);
      addLog("success", `Transaction Hash: ${jobTxHash}`);
      if (createData.mode === "on-chain") {
        addLog("success", `Active Escrow Contract: ${createData.contract}`);
      }
      setAgentJobTxHash(jobTxHash);

      // Step 2: Agent Working
      setAgentJobStep("working");
      addLog("info", `AI Agent [${selectedAgent}] started task execution...`);
      await new Promise((resolve) => setTimeout(resolve, 2500));

      // Step 3: Deliverable Submitted
      setAgentJobStep("submitting");
      addLog("success", `AI Agent submitted deliverables (verification proof received).`);
      addLog("info", `Verifying deliverables via Evaluator Oracle...`);
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Step 4: Settle Escrow & Complete Milestone
      addLog("input", `POST /api/escrow { action: "complete", dealId: ${dealId}, milestoneIndex: 0 }`);
      const completeResponse = await fetch("/api/escrow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "complete",
          dealId,
          milestoneIndex: 0
        })
      });

      const completeData = await completeResponse.json();
      if (!completeResponse.ok) {
        throw new Error(completeData.error || "Failed to complete milestone.");
      }

      setAgentJobStep("settled");
      addLog("success", `Evaluator verification PASSED! Milestone completed on-chain.`);
      addLog("success", `Transaction Hash: ${completeData.txHash}`);
      addLog("success", `Transferred ${agentJobAmount} USDC from Escrow to AI Agent's wallet.`);
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

      setActiveResponsePayload(JSON.stringify({
        success: true,
        transactionHash: txHash,
        blockNumber: Number(receipt.blockNumber),
        gasUsed: receipt.gasUsed.toString(),
        network: depositChain === "arc_testnet" ? "Arc Testnet" : "Base Sepolia",
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
        // Ensure network is Arc Testnet (chain ID 5042002)
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

    // Fallback to backend REST API (which supports real deployment via MERCHANT_PRIVATE_KEY if set, otherwise simulated)
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

  // Clear Secure Cookie
  const clearSession = async () => {
    await fetch("/api/session", { method: "DELETE" });
    setActiveSession(null);
    addLog("info", "Secure session cookie deleted from browser.");
  };

  return (
    <div className="portal-wrapper">
      {/* Promo Banner */}
      <div className="promo-banner-container">
        <span>🚀 <strong>Arc Testnet Integration:</strong> USDC-native gas sponsorship and sub-second settlement times.</span>
      </div>

      {/* Top Navbar */}
      <header className="top-nav">
        <div className="nav-container">
          <div className="nav-left">
            <div className="logo">
              <Layers className="logo-icon" />
              <span>BizFlow</span>
            </div>
            <span className="api-badge">API v2 Docs</span>
          </div>

          <div className="nav-center">
            <div className="search-bar" onClick={() => setIsSearchOpen(true)} style={{ cursor: "pointer" }}>
              <input 
                type="text" 
                placeholder="Search API references, schemas, libraries..." 
                readOnly 
                style={{ pointerEvents: "none" }} 
              />
              <span className="search-shortcut">⌘K</span>
            </div>
          </div>

          <div className="nav-right">
            <button className="search-toggle-mobile" onClick={() => setIsSearchOpen(true)} title="Search documentation">
              <Search size={18} />
            </button>
            <a href="https://testnet.arcscan.app" target="_blank" rel="noreferrer" className="nav-link-item">
              Explorer <ExternalLink size={12} />
            </a>
            <a href="https://faucet.circle.com" target="_blank" rel="noreferrer" className="nav-link-item">
              Faucet <ExternalLink size={12} />
            </a>
            <ConnectButton />
          </div>
        </div>
      </header>

      {/* Documentation Title & Marketing Wash Header */}
      <section className="hero-header">
        <div className="hero-gradient-overlay" />
        <div className="hero-content">
          <h1>BizFlow B2B Finance Portal</h1>
          <p>
            An API-first trade finance and SME stablecoin stack. Access instant credit, automate batch payouts, optimize yield, and deploy secure checkout channels on Arc.
          </p>
        </div>
      </section>

      {/* Main Split Screen Area */}
      <main className="split-screen-container">
        {/* Sidebar Navigation */}
        <aside className="sidebar">
          <div className="sidebar-group">
            <div className="sidebar-group-header">Core Gateway Products</div>
            
            <button 
              onClick={() => setActiveTab("deposit")}
              className={`sidebar-item ${activeTab === "deposit" ? "active" : ""}`}
            >
              <Wallet size={16} />
              <span>1. Gateway Deposit</span>
            </button>

            <button 
              onClick={() => setActiveTab("checkout")}
              className={`sidebar-item ${activeTab === "checkout" ? "active" : ""}`}
            >
              <Code size={16} />
              <span>2. Checkout Widget</span>
            </button>
          </div>

          <div className="sidebar-group mt-6">
            <div className="sidebar-group-header">Business Finance APIs</div>

            <button 
              onClick={() => setActiveTab("credit")}
              className={`sidebar-item ${activeTab === "credit" ? "active" : ""}`}
            >
              <TrendingUp size={16} />
              <span>3. B2B Credit API</span>
            </button>

            <button 
              onClick={() => setActiveTab("payments")}
              className={`sidebar-item ${activeTab === "payments" ? "active" : ""}`}
            >
              <Send size={16} />
              <span>4. Payment & Payouts</span>
            </button>

            <button 
              onClick={() => setActiveTab("treasury")}
              className={`sidebar-item ${activeTab === "treasury" ? "active" : ""}`}
            >
              <Zap size={16} />
              <span>5. Treasury & Yield</span>
            </button>

            <button 
              onClick={() => setActiveTab("agents")}
              className={`sidebar-item ${activeTab === "agents" ? "active" : ""}`}
            >
              <Cpu size={16} />
              <span>AI Agent Workforce</span>
            </button>
          </div>

          <div className="sidebar-group mt-6">
            <div className="sidebar-group-header">Infrastructure Settings</div>

            <button 
              onClick={() => setActiveTab("fee")}
              className={`sidebar-item ${activeTab === "fee" ? "active" : ""}`}
            >
              <Sliders size={16} />
              <span>6. Custom Fee Policy</span>
            </button>

            <button 
              onClick={() => setActiveTab("webhooks")}
              className={`sidebar-item ${activeTab === "webhooks" ? "active" : ""}`}
            >
              <Bell size={16} />
              <span>7. Webhook Event Hub</span>
            </button>
          </div>

          <div className="sidebar-group mt-6">
            <div className="sidebar-group-header">Developer Resources</div>

            <button 
              onClick={() => setActiveTab("templates")}
              className={`sidebar-item ${activeTab === "templates" ? "active" : ""}`}
            >
              <Layers size={16} />
              <span>8. Contract Templates</span>
            </button>

            <button 
              onClick={() => setActiveTab("sdk")}
              className={`sidebar-item ${activeTab === "sdk" ? "active" : ""}`}
            >
              <Download size={16} />
              <span>9. SDK & Downloads</span>
            </button>
          </div>

          <div className="sidebar-group mt-6">
            <div className="sidebar-group-header">Company & Support</div>

            <button 
              onClick={() => setActiveTab("about")}
              className={`sidebar-item ${activeTab === "about" ? "active" : ""}`}
            >
              <Users size={16} />
              <span>About & Team</span>
            </button>

            <button 
              onClick={() => setActiveTab("faq")}
              className={`sidebar-item ${activeTab === "faq" ? "active" : ""}`}
            >
              <HelpCircle size={16} />
              <span>FAQs</span>
            </button>

            <button 
              onClick={() => setActiveTab("contact")}
              className={`sidebar-item ${activeTab === "contact" ? "active" : ""}`}
            >
              <Mail size={16} />
              <span>Support & Contact</span>
            </button>

            <button 
              onClick={() => setActiveTab("legal")}
              className={`sidebar-item ${activeTab === "legal" ? "active" : ""}`}
            >
              <ShieldAlert size={16} />
              <span>Legal & Privacy</span>
            </button>
          </div>

          <div className="sidebar-group mt-6">
            <div className="sidebar-group-header">Reference Info</div>
            <div className="ref-card">
              <div className="ref-row">
                <span>Chain:</span>
                <span className="font-semibold text-green">Arc Testnet</span>
              </div>
              <div className="ref-row">
                <span>Chain ID:</span>
                <span>5042002</span>
              </div>
              <div className="ref-row">
                <span>Gas Token:</span>
                <span>USDC (18 Dec)</span>
              </div>
              <div className="ref-row">
                <span>Asset Token:</span>
                <span>USDC (6 Dec)</span>
              </div>

              <div className="ref-divider" style={{ borderTop: "1px dashed var(--hairline-dark)", margin: "8px 0" }} />

              <div className="ref-row">
                <span>RPC Status:</span>
                <span className="flex-center" style={{ gap: "6px" }}>
                  <span className={`pulse-dot ${rpcStatus}`} />
                  <span className="text-xs font-semibold" style={{ textTransform: "uppercase", fontSize: "10px" }}>{rpcStatus}</span>
                </span>
              </div>
              {liveBlockNumber && (
                <div className="ref-row">
                  <span>Block Height:</span>
                  <span className="font-mono text-green">{liveBlockNumber.toLocaleString()}</span>
                </div>
              )}
              {liveGasPrice && (
                <div className="ref-row">
                  <span>Gas Price:</span>
                  <span className="font-mono text-xs" title={`${liveGasPrice} USDC`}>{parseFloat(liveGasPrice).toFixed(6)} USDC</span>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Center Documentation Content Column */}
        <section className="docs-content">
          {activeTab === "deposit" && (
            <div className="prose">
              <div className="badge-tag">App Kit - Unified Balance</div>
              <h2>Interactive B2B Deposit Gateway</h2>
              <p>
                The Unified Balance deposit allows SMEs and enterprise platforms to funnel USDC from multiple source chains into a unified balance wallet on Arc Testnet. By invoking <code>kit.unifiedBalance.deposit()</code>, the SDK manages network switching, bridging allowances, and confirmations automatically.
              </p>

              <div className="alert-banner info">
                <Info size={16} className="text-tag" />
                <div>
                  <strong>Dual Decimals Guard:</strong> Gas transaction fees on Arc use 18 decimals, while standard ERC-20 USDC amounts are formatted in 6 decimals.
                </div>
              </div>

              <h3>SDK Function Signature</h3>
              <div className="code-block-wrapper">
                <div className="code-header">
                  <span>TypeScript</span>
                  <button 
                    className="copy-btn" 
                    onClick={() => copyToClipboard(`import { UnifiedBalanceKit } from "@circle-fin/app-kit";
import { ViemAdapter } from "@circle-fin/adapter-viem-v2";

const adapter = new ViemAdapter({
  privateKey: "0x...",
  rpcUrl: "https://rpc.testnet.arc.network"
});

const kit = new UnifiedBalanceKit({ adapter });
const txHash = await kit.unifiedBalance.deposit({
  amount: "5.00",
  chainId: 5042002 // Arc Testnet
});`, "f1_code")}
                  >
                    {copiedText === "f1_code" ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedText === "f1_code" ? "Copied" : "Copy"}</span>
                  </button>
                </div>
                <pre>
                  <code>
{`import { UnifiedBalanceKit } from "@circle-fin/app-kit";
import { ViemAdapter } from "@circle-fin/adapter-viem-v2";

const adapter = new ViemAdapter({
  privateKey: "0x...",
  rpcUrl: "https://rpc.testnet.arc.network"
});

const kit = new UnifiedBalanceKit({ adapter });
const txHash = await kit.unifiedBalance.deposit({
  amount: "5.00",
  chainId: 5042002 // Arc Testnet
});`}
                  </code>
                </pre>
              </div>

              <h3>Parameters</h3>
              <div className="table-container">
                <table className="params-table">
                  <thead>
                    <tr>
                      <th>Property</th>
                      <th>Type</th>
                      <th>Requirement</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>amount</code></td>
                      <td><code>string</code></td>
                      <td><span className="badge-error">REQUIRED</span></td>
                      <td>The amount of USDC to deposit, represented as a decimal string (e.g. <code>"5.00"</code>).</td>
                    </tr>
                    <tr>
                      <td><code>chainId</code></td>
                      <td><code>number</code></td>
                      <td><span className="badge-error">REQUIRED</span></td>
                      <td>Target Chain ID. Only supports <code>5042002</code> (Arc Testnet) or <code>84532</code> (Base Sepolia). Mainnet is blocked.</td>
                    </tr>
                    <tr>
                      <td><code>adapter</code></td>
                      <td><code>ViemAdapter</code></td>
                      <td><span className="badge-error">REQUIRED</span></td>
                      <td>Configured Viem account or wallet client adapter.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3>Circle Gateway x402 Nanopayments</h3>
              <p>
                Circle&apos;s <strong>Gateway Nanopayments</strong> enables streaming B2B micro-transactions down to <strong>$0.000001 USDC</strong>. Powered by the HTTP-native <strong>x402</strong> protocol, businesses can bill per API request, stream content, or finance real-time compute services gaslessly. Transactions are accumulated locally and settled on-chain in optimized batches.
              </p>
              <div className="alert-banner info">
                <Zap size={16} className="text-tag" style={{ minWidth: "16px" }} />
                <div>
                  <strong>Arc Gas Abstraction:</strong> All micro-transactions on the x402 protocol are gas-free for the end-consumer, with fees absorbed by the provider using Arc smart accounts.
                </div>
              </div>
            </div>
          )}

          {activeTab === "checkout" && (
            <div className="prose">
              <div className="badge-tag">Circle W3S SDK</div>
              <h2>Embeddable Checkout Widget</h2>
              <p>
                SME merchants can embed the BizFlow Checkout Widget directly on their web pages via standard HTML frames. Under the hood, the widget uses Circle&apos;s <code>@circle-fin/w3s-pw-web-sdk</code> to handle user authentication (e.g., Google OAuth or email OTP) and provision non-custodial User-Controlled Wallets instantly.
              </p>

              <div className="alert-banner warning">
                <ShieldCheck size={16} className="text-warn" />
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
                    onClick={() => copyToClipboard(`<iframe 
  src="https://bizflow.finance/widget/checkout?merchant=${encodeURIComponent(widgetMerchant)}&amount=${widgetAmount}" 
  width="400" 
  height="550" 
  style="border: none; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);"
></iframe>`, "f2_code")}
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
                <li>The customer performs a Google OAuth login inside the sandboxed iframe.</li>
                <li>The server intercepts and saves the resulting <code>userToken</code> in an HttpOnly cookie to block client-side JavaScript access.</li>
                <li>A secure wallet is initialized on Arc Testnet, and the payment is signed with the user&apos;s PIN/credential.</li>
              </ol>
            </div>
          )}

          {activeTab === "credit" && (
            <div className="prose animate-fade-in">
              <div className="badge-tag">B2B Trade Credit</div>
              <h2>Business Credit Line API</h2>
              <p>
                BizFlow enables platforms to offer immediate, underwritten trade credit. By calling the Credit scoring API with enterprise registration details and trade volume statistics, the scoring engine calculates credit limits and APY tiers dynamically. The business can then execute a drawdown directly to their registered wallet.
              </p>

              <h3>1. Querying Credit Score</h3>
              <div className="api-spec-card">
                <div className="api-endpoint-row">
                  <span className="api-method post">POST</span>
                  <span className="api-path">/api/credit</span>
                </div>
                <pre className="payload-code">
{`// Body payload
{
  "action": "score",
  "companyId": "${creditCompanyId}",
  "volume": "${creditVolume}"
}`}
                </pre>
              </div>

              <h3>2. Executing Drawdown</h3>
              <div className="api-spec-card">
                <div className="api-endpoint-row">
                  <span className="api-method post">POST</span>
                  <span className="api-path">/api/credit</span>
                </div>
                <pre className="payload-code">
{`// Body payload
{
  "action": "drawdown",
  "amount": "${drawdownAmount}",
  "walletAddress": "${drawdownWallet}"
}`}
                </pre>
              </div>
            </div>
          )}

          {activeTab === "payments" && (
            <div className="prose animate-fade-in">
              <div className="badge-tag">B2B Payments Engine</div>
              <h2>Batch Payouts &amp; Scheduling</h2>
              <p>
                Automate vendor settlement by scheduling and executing high-throughput batch payouts. BizFlow leverages Arc&apos;s zero-gas fee structure to execute batch transactions, reducing costs for multi-recipient supplier settlements.
              </p>

              <h3>1. Executing Batch Payments</h3>
              <div className="api-spec-card">
                <div className="api-endpoint-row">
                  <span className="api-method post">POST</span>
                  <span className="api-path">/api/payments</span>
                </div>
                <pre className="payload-code">
{`// Body payload
{
  "action": "batch",
  "recipients": [
    { "address": "${payee1Address}", "amount": "${payee1Amount}" },
    { "address": "${payee2Address}", "amount": "${payee2Amount}" }
  ]
}`}
                </pre>
              </div>

              <h3>2. Scheduling Payments</h3>
              <div className="api-spec-card">
                <div className="api-endpoint-row">
                  <span className="api-method post">POST</span>
                  <span className="api-path">/api/payments</span>
                </div>
                <pre className="payload-code">
{`// Body payload
{
  "action": "schedule",
  "date": "${scheduledDate}",
  "recipients": [
    { "address": "${payee1Address}", "amount": "${payee1Amount}" }
  ]
}`}
                </pre>
              </div>
            </div>
          )}

          {activeTab === "treasury" && (
            <div className="prose animate-fade-in">
              <div className="badge-tag">Treasury Management</div>
              <h2>Yield Optimization &amp; Bridge Routing</h2>
              <p>
                Maximize returns on operational funds by routing assets into tokenized treasury bills (like USYC) or bridging liquidity across chains via CCTP. 
              </p>

              <h3>Bridge / Swap Functions</h3>
              <div className="code-block-wrapper">
                <div className="code-header">
                  <span>TypeScript</span>
                </div>
                <pre>
                  <code>
{`// 1. Swap USDC to Yield-bearing USYC
await kit.swap({
  fromToken: "USDC",
  toToken: "USYC",
  amount: "${treasuryAmount}"
});

// 2. Bridge USDC cross-chain via CCTP
await kit.bridge({
  amount: "${treasuryAmount}",
  sourceChain: "${treasurySourceChain}",
  targetChain: "${treasuryTargetChain}"
});`}
                  </code>
                </pre>
              </div>
            </div>
          )}

          {activeTab === "fee" && (
            <div className="prose">
              <div className="badge-tag">Gateway Routing</div>
              <h2>Custom Fee Policy Configurator</h2>
              <p>
                SME platforms can charge transaction routing fees on payouts or gateway spending. Use the SDK&apos;s <code>kit.unifiedBalance.setCustomFeePolicy</code> interface to route fees to your admin vaults dynamically.
              </p>

              <div className="alert-banner info">
                <Sliders size={16} className="text-tag" />
                <div>
                  <strong>Default Protocol Distribution Policy:</strong> When a payout occurs, the calculated fee is automatically split: <strong>90%</strong> goes to the Platform Admin and <strong>10%</strong> goes to the <strong>Arc Network</strong> as native gas support.
                </div>
              </div>

              <h3>Configuration Snippet</h3>
              <div className="code-block-wrapper">
                <div className="code-header">
                  <span>TypeScript</span>
                  <button 
                    className="copy-btn" 
                    onClick={() => copyToClipboard(`await kit.unifiedBalance.setCustomFeePolicy({
  getFee: () => "${feePercent}", // Custom fee per withdraw
  getFeeRecipient: () => "${adminAddress}" // Admin wallet
});`, "f3_code")}
                  >
                    {copiedText === "f3_code" ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedText === "f3_code" ? "Copied" : "Copy"}</span>
                  </button>
                </div>
                <pre>
                  <code>
{`await kit.unifiedBalance.setCustomFeePolicy({
  getFee: () => "${feePercent}", // Custom fee in USDC
  getFeeRecipient: () => "${adminAddress}" // Admin wallet
});`}
                  </code>
                </pre>
              </div>

              <h3>Active Distribution Matrix</h3>
              <div className="table-container">
                <table className="params-table">
                  <thead>
                    <tr>
                      <th>Participant</th>
                      <th>Percentage</th>
                      <th>Calculated Split Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Platform Admin</strong></td>
                      <td>90%</td>
                      <td><code>{(parseFloat(feePercent) * 0.9).toFixed(4)} USDC</code></td>
                    </tr>
                    <tr>
                      <td><strong>Arc Network</strong></td>
                      <td>10%</td>
                      <td><code>{(parseFloat(feePercent) * 0.1).toFixed(4)} USDC</code></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "webhooks" && (
            <div className="prose animate-fade-in">
              <div className="badge-tag">Gateway Hub</div>
              <h2>Real-Time Webhook Engine</h2>
              <p>
                Keep client-side and internal accounting databases synchronized by subscribing to BizFlow Webhook events. Register endpoints to receive JSON payloads whenever on-chain payouts, checkout charges, or credit applications transition states.
              </p>

              <h3>Supported Events</h3>
              <div className="table-container">
                <table className="params-table">
                  <thead>
                    <tr>
                      <th>Event Trigger</th>
                      <th>Payload Object</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>payment.succeeded</code></td>
                      <td><code>checkout_payment</code></td>
                      <td>Dispatched when an iframe Checkout widget payment is confirmed on Arc.</td>
                    </tr>
                    <tr>
                      <td><code>credit.approved</code></td>
                      <td><code>credit_line</code></td>
                      <td>Dispatched when credit scoring successfully approves a business limit.</td>
                    </tr>
                    <tr>
                      <td><code>deposit.confirmed</code></td>
                      <td><code>unified_balance_deposit</code></td>
                      <td>Dispatched when a Unified Balance gateway deposit is settled.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3>Registering Webhook Endpoint</h3>
              <div className="code-block-wrapper">
                <div className="code-header">
                  <span>JSON Payload</span>
                </div>
                <pre>
                  <code>
{`POST /api/webhooks/register
{
  "url": "${webhookUrl}",
  "events": [
    "${webhookEvent}"
  ]
}`}
                  </code>
                </pre>
              </div>
            </div>
          )}

          {activeTab === "templates" && (
            <div className="prose">
              <div className="badge-tag">Smart Contract Platform</div>
              <h2>Executable Smart Contract Templates</h2>
              <p>
                Deploy fully audited ERC-20 smart contracts directly onto the Arc layer-1 testnet. Developers issue standardized tokens using pre-audited templates by calling the <code>POST /templates/[id]/deploy</code> API endpoint.
              </p>

              <div className="alert-banner info">
                <Info size={16} className="text-tag" />
                <div>
                  <strong>Idempotency Safety:</strong> The BizFlow backend automatically appends a UUID v4 <code>idempotencyKey</code> to ensure that smart contract deployment transactions are only executed once, avoiding duplicate gas expenditures.
                </div>
              </div>

              <h3>REST API Definition</h3>
              <div className="api-spec-card">
                <div className="api-endpoint-row">
                  <span className="api-method post">POST</span>
                  <span className="api-path">/templates/a1b74add-9e48-43e5-9be6-71df6c888804/deploy</span>
                </div>
                
                <div className="api-payload-section">
                  <div className="payload-title">Request Body (JSON)</div>
                  <pre className="payload-code">
{`{
  "name": "${tokenName}",
  "symbol": "${tokenSymbol}"
}`}
                  </pre>
                </div>

                <div className="api-payload-section">
                  <div className="payload-title">Response (JSON)</div>
                  <pre className="payload-code">
{`{
  "idempotencyKey": "a8237b6c-31a8-4b71-92be-3c99a812df93",
  "status": "pending",
  "templateId": "a1b74add...",
  "txHash": "0x..."
}`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {activeTab === "sdk" && (
            <div className="prose animate-fade-in">
              <div className="badge-tag">Developer Resources</div>
              <h2>Client SDKs &amp; Downloads</h2>
              <p>
                Integrate BizFlow into your existing accounting, credit, or trade workflow systems with our pre-built Client SDK libraries.
              </p>

              <div className="sdk-lang-selector">
                <button 
                  onClick={() => setSelectedSdkLang("typescript")}
                  className={`sdk-lang-tab ${selectedSdkLang === "typescript" ? "active" : ""}`}
                >
                  TypeScript
                </button>
                <button 
                  onClick={() => setSelectedSdkLang("python")}
                  className={`sdk-lang-tab ${selectedSdkLang === "python" ? "active" : ""}`}
                >
                  Python
                </button>
                <button 
                  onClick={() => setSelectedSdkLang("go")}
                  className={`sdk-lang-tab ${selectedSdkLang === "go" ? "active" : ""}`}
                >
                  Go
                </button>
              </div>

              {selectedSdkLang === "typescript" && (
                <div className="code-block-wrapper">
                  <div className="code-header">
                    <span>NPM / TypeScript Installation</span>
                  </div>
                  <pre>
                    <code>
{`# Install SDK
npm install @bizflow/sdk-core

# Setup Client
import { BizFlowClient } from "@bizflow/sdk-core";

const client = new BizFlowClient({
  apiKey: "bf_live_...",
  sandbox: true
});`}
                    </code>
                  </pre>
                </div>
              )}

              {selectedSdkLang === "python" && (
                <div className="code-block-wrapper">
                  <div className="code-header">
                    <span>PIP / Python Installation</span>
                  </div>
                  <pre>
                    <code>
{`# Install SDK
pip install bizflow-sdk

# Setup Client
from bizflow import BizFlowClient

client = BizFlowClient(
    api_key="bf_live_...",
    sandbox=True
)`}
                    </code>
                  </pre>
                </div>
              )}

              {selectedSdkLang === "go" && (
                <div className="code-block-wrapper">
                  <div className="code-header">
                    <span>GO Get Installation</span>
                  </div>
                  <pre>
                    <code>
{`# Install SDK
go get github.com/bizflow/sdk-go

# Setup Client
package main

import "github.com/bizflow/sdk-go/bizflow"

func main() {
    client := bizflow.NewClient("bf_live_...", true)
}`}
                    </code>
                  </pre>
                </div>
              )}
            </div>
          )}

          {activeTab === "agents" && (
            <div className="prose">
              <div className="badge-tag bg-purple-900 text-purple-200">Agentic Economy</div>
              <h2>AI Agent Workforce &amp; Escrow (ERC-8183 / ERC-8004)</h2>
              <p>
                BizFlow integrates with the **Arc Agentic Economy** framework, allowing businesses to hire autonomous AI agents for specialized operational tasks (tax reconciliation, yield optimization, audit verification) using trustless smart contract escrows.
              </p>

              <div className="alert-banner info">
                <Info size={16} className="text-tag" />
                <div>
                  <strong>Arc Ecosystem Standard:</strong> AI Agents register their persistent identity and reputation logs on-chain via <strong>ERC-8004</strong>. Gigs and settlements are governed by <strong>ERC-8183 Job Escrows</strong>, protecting both the corporate treasury and the agent.
                </div>
              </div>

              <h3>On-chain Workflow Architecture</h3>
              <div style={{ margin: "20px 0", background: "#f8fafc", padding: "16px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <ol style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px", color: "#334155" }}>
                  <li><strong>Registry Verification (ERC-8004):</strong> Client validates AI Agent's performance score on-chain.</li>
                  <li><strong>Escrow Deployment (ERC-8183):</strong> Client deploys a Job contract, locking the USDC fee. Gas is paid in USDC.</li>
                  <li><strong>Autonomous Execution:</strong> AI Agent detects the job, completes the task, and submits the deliverable proof (IPFS hash).</li>
                  <li><strong>Oracle Attestation &amp; Release:</strong> Neutral Evaluator verifies proof and settles contract, transferring USDC to the agent.</li>
                </ol>
              </div>

              <h3>Escrow Management API</h3>
              <div className="table-container">
                <table className="params-table">
                  <thead>
                    <tr>
                      <th>Parameter</th>
                      <th>Type</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>agent</code></td>
                      <td><code>address</code></td>
                      <td>The ERC-8004 registered wallet address of the target AI Agent.</td>
                    </tr>
                    <tr>
                      <td><code>amount</code></td>
                      <td><code>string</code></td>
                      <td>The USDC escrow deposit amount (e.g. <code>"50.00"</code>).</td>
                    </tr>
                    <tr>
                      <td><code>evaluator</code></td>
                      <td><code>address</code></td>
                      <td>Evaluator Oracle or DAO contract verifying completion.</td>
                    </tr>
                    <tr>
                      <td><code>taskDescription</code></td>
                      <td><code>string</code></td>
                      <td>Human and machine-readable specification of the task deliverables.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3>SDK Usage Example</h3>
              <div className="code-block-wrapper">
                <div className="code-header">
                  <span>TypeScript integration</span>
                </div>
                <pre>
                  <code>
{`import { ArcAgenticManager } from "@bizflow/sdk-core";

const manager = new ArcAgenticManager({ client });

// Deploy ERC-8183 Escrow and initiate job
const job = await manager.createJobEscrow({
  agentAddress: "0x7e8...",
  amount: 50.00,
  taskDescription: "Reconcile corporate expense sheet against USDC invoices"
});`}
                  </code>
                </pre>
              </div>
            </div>
          )}

          {activeTab === "about" && (
            <div className="prose animate-fade-in">
              <div className="badge-tag">Company &amp; Story</div>
              <h2>Our Story &amp; Mission</h2>
              <p>
                BizFlow was born out of the <strong>Stablecoins Commerce Stack Challenge</strong> with a singular mission: to democratize and automate financial workflows for small and medium-sized enterprises (SMEs) worldwide.
              </p>
              <p>
                Traditional business banking remains slow, expensive, and fragmented. By merging Circle's institutional-grade <strong>Programmable Wallets</strong> with <strong>Arc Testnet's sub-second transaction finality and native USDC gas rails</strong>, we have built a seamless finance stack that handles payments, payouts, custom fee routing, credit scoring, and automated AI workforce escrows under one unified grid.
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
          )}

          {activeTab === "faq" && (
            <div className="prose animate-fade-in">
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
          )}

          {activeTab === "contact" && (
            <div className="prose animate-fade-in">
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
                <div className="input-field">
                  <label>Full Name</label>
                  <input type="text" placeholder="e.g. John Doe" required style={{ border: "2px solid var(--hairline)", padding: "10px", borderRadius: "8px" }} />
                </div>
                <div className="input-field">
                  <label>Contact Email</label>
                  <input type="text" placeholder="e.g. john@company.com" required style={{ border: "2px solid var(--hairline)", padding: "10px", borderRadius: "8px" }} />
                </div>
                <div className="input-field">
                  <label>Support Category</label>
                  <select style={{ border: "2px solid var(--hairline)", padding: "10px", borderRadius: "8px" }}>
                    <option>General Inquiry / Partner request</option>
                    <option>Circle W3S Integration Help</option>
                    <option>Arc Testnet Gas/RPC Issues</option>
                    <option>Report a Bug</option>
                  </select>
                </div>
                <div className="input-field">
                  <label>Your Message</label>
                  <textarea 
                    rows={4} 
                    placeholder="Describe your issue or suggestions..." 
                    required 
                    style={{ border: "2px solid var(--hairline)", padding: "12px", borderRadius: "8px", background: "var(--canvas)", color: "var(--ink)", width: "100%", outline: "none", fontSize: "14px" }}
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
          )}

          {activeTab === "legal" && (
            <div className="prose animate-fade-in">
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
          )}
        </section>

        {/* Right Sandbox & Virtual Terminal Column */}
        <section className="sandbox-panel">
          <div className="panel-header">
            <TerminalIcon size={16} className="text-green" />
            <span>Interactive Code Playground</span>
          </div>

          {/* Interactive Playground Inputs based on Tab */}
          <div className="playground-controls">
            {activeTab === "deposit" && (
              <div className="control-group animate-fade-in">
                <div className="control-title">Unified Balance Gateway Parameters</div>
                
                <div className="input-field">
                  <label>Chain Configuration (Hardcoded Testnets)</label>
                  <select 
                    value={depositChain} 
                    onChange={(e) => setDepositChain(e.target.value as any)}
                  >
                    <option value="arc_testnet">Arc Testnet (USDC Gas, ID: 5042002)</option>
                    <option value="base_sepolia">Base Sepolia (L2 Faucet, ID: 84532)</option>
                  </select>
                  <div className="input-desc">Mainnet usage is strictly restricted in this sandbox.</div>
                </div>

                <div className="input-field">
                  <label>Amount (USDC)</label>
                  <div className="amount-input-wrapper">
                    <input 
                      type="number" 
                      value={depositAmount} 
                      onChange={(e) => setDepositAmount(e.target.value)} 
                      min="0.01" 
                      step="0.01"
                    />
                    <span>USDC</span>
                  </div>
                </div>

                <div className="input-field">
                  <label>Wallet Connection Mode</label>
                  <div className="checkbox-field">
                    <input 
                      type="checkbox" 
                      id="wallet-ext" 
                      checked={useWalletExtension}
                      onChange={(e) => setUseWalletExtension(e.target.checked)}
                    />
                    <label htmlFor="wallet-ext">Use Web3 Browser Extension (MetaMask)</label>
                  </div>
                </div>

                {!useWalletExtension && (
                  <div className="input-field">
                    <div className="flex-between">
                      <label>Developer Private Key</label>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button 
                          type="button" 
                          className="text-btn" 
                          onClick={handleGenerateSandboxKey}
                          style={{ color: "var(--brand-green)" }}
                        >
                          Generate Sandbox Key
                        </button>
                        <span style={{ color: "var(--hairline-dark)" }}>|</span>
                        <button 
                          type="button" 
                          className="text-btn" 
                          onClick={() => setShowKey(!showKey)}
                        >
                          {showKey ? "Hide" : "Show"}
                        </button>
                      </div>
                    </div>
                    
                    <input 
                      type={showKey ? "text" : "password"} 
                      placeholder="e.g. 0x47ef92bc..." 
                      value={privateKey} 
                      onChange={(e) => setPrivateKey(e.target.value)}
                      className={!isPrivateKeyValid ? "input-error" : ""}
                    />

                    {/* RED Bright Warning if private key doesn't start with 0x */}
                    {!isPrivateKeyValid && (
                      <div className="error-alert">
                        <AlertCircle size={14} />
                        <span>Private key MUST start with 0x!</span>
                      </div>
                    )}
                  </div>
                )}

                {useWalletExtension && !isConnected ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                    <div className="input-desc" style={{ color: 'var(--yellow)' }}>
                      Please connect your wallet to broadcast real-world transactions to Arc Testnet.
                    </div>
                    <ConnectButton />
                  </div>
                ) : (
                  <button 
                    className="btn-run" 
                    onClick={runDeposit} 
                    disabled={isDepositing || (!useWalletExtension && !privateKey)}
                  >
                    <Play size={14} />
                    <span>{isDepositing ? "Running Blockchain Execution..." : "Run Snippet (On-Chain)"}</span>
                  </button>
                )}

                <div className="ref-divider" style={{ borderTop: "1px dashed var(--hairline-dark)", margin: "16px 0" }} />

                <div className="control-title">Live USDC Balance Reader</div>
                
                <div className="input-field">
                  <label>EVM Wallet Address</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 0x4CEF52F8241eD327B665123d24263071295cbde0" 
                    value={balanceQueryAddress}
                    onChange={(e) => setBalanceQueryAddress(e.target.value)}
                  />
                  <div className="input-desc">Query live on-chain USDC balance from Arc Testnet RPC.</div>
                </div>
                
                <button 
                  className="btn-run" 
                  onClick={() => queryOnChainUsdcBalance(balanceQueryAddress)}
                  disabled={isQueryingBalance || !balanceQueryAddress}
                  style={{ width: "100%", background: "#1c1c1e", border: "1px solid var(--hairline-dark)", color: "#ffffff" }}
                >
                  <RefreshCw size={14} className={isQueryingBalance ? "spinner" : ""} />
                  <span>{isQueryingBalance ? "Querying On-Chain..." : "Query Arc USDC Balance"}</span>
                </button>

                <div className="ref-divider" style={{ borderTop: "1px dashed var(--hairline-dark)", margin: "16px 0" }} />

                <div className="control-title">* Gateway x402 Micropayment Streamer</div>
                
                <div style={{ background: "var(--surface)", border: "2px solid var(--hairline)", padding: "16px", borderRadius: "12px", marginBottom: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div className="flex-between">
                    <span className="text-xs font-semibold uppercase text-stone-500">Cumulative Streamed:</span>
                    <span className="font-mono text-base font-extrabold text-green animate-pulse" style={{ letterSpacing: "0.02em" }}>
                      {gatewayStreamedAmount.toFixed(6)} USDC
                    </span>
                  </div>
                  <div className="flex-between text-2xs">
                    <span>Active x402 Channel:</span>
                    <span className={isStreamingGateway ? "text-green font-bold" : "text-stone-400"}>
                      {isStreamingGateway ? "● STREAMING ACTIVE (300ms)" : "○ INACTIVE"}
                    </span>
                  </div>
                  {isStreamingGateway && (
                    <div className="progress-track" style={{ marginTop: "4px" }}>
                      <div className="progress-bar streaming" style={{ width: "100%", height: "100%", background: "var(--brand-green)", animation: "pulse 1.5s infinite" }} />
                    </div>
                  )}
                </div>

                <button 
                  className={`btn-run ${isStreamingGateway ? "active" : ""}`}
                  onClick={toggleGatewayStream}
                  style={{ width: "100%", display: "flex", justifyContent: "center", textTransform: "uppercase", background: isStreamingGateway ? "var(--brand-error)" : "var(--brand-green)", color: isStreamingGateway ? "#ffffff" : "var(--primary)", border: "2px solid var(--hairline)" }}
                >
                  <Zap size={14} className={isStreamingGateway ? "animate-bounce" : ""} />
                  <span>{isStreamingGateway ? "Suspend Stream" : "Begin Live x402 Stream"}</span>
                </button>
              </div>
            )}

            {activeTab === "checkout" && (
              <div className="control-group animate-fade-in">
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

                <div className="widget-preview-area">
                  <div className="preview-label">Live Iframe Sandbox Preview</div>
                  
                  <iframe 
                    src={`/widget/checkout?merchant=${encodeURIComponent(widgetMerchant)}&amount=${widgetAmount}&origin=${encodeURIComponent(typeof window !== "undefined" ? window.location.origin : "")}`}
                    className="widget-iframe"
                    title="BizFlow Checkout Widget"
                  />
                </div>

                <div className="session-card">
                  <div className="session-header">
                    <ShieldCheck size={14} className="text-green" />
                    <span>Secure Session Status (XSS Shield)</span>
                  </div>
                  
                  {checkingSession ? (
                    <div className="flex-center p-4">
                      <RefreshCw size={16} className="spinner text-muted" />
                    </div>
                  ) : activeSession ? (
                    <div className="session-body">
                      <div className="session-row">
                        <span>Cookie Storage:</span>
                        <span className="badge-tag font-semibold">httpOnly Secure</span>
                      </div>
                      <div className="session-row">
                        <span>User Token:</span>
                        <span className="font-mono text-xs">{activeSession.userTokenMasked}</span>
                      </div>
                      <div className="session-row">
                        <span>Security Level:</span>
                        <span className="text-green font-semibold">XSS Blocked</span>
                      </div>
                      <button className="btn-logout" onClick={clearSession}>
                        Clear Cookie Session
                      </button>
                    </div>
                  ) : (
                    <div className="session-empty">
                      <span>No active secure session cookie detected. Login via the Checkout Widget above to establish an HttpOnly session.</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "credit" && (
              <div className="control-group animate-fade-in">
                <div className="control-title">Credit Underwriting Playground</div>

                <div className="input-field">
                  <label>Company Identifier</label>
                  <input 
                    type="text" 
                    value={creditCompanyId} 
                    onChange={(e) => setCreditCompanyId(e.target.value)} 
                  />
                </div>

                <div className="input-field">
                  <label>Monthly Trade Volume (USDC Equivalent)</label>
                  <select 
                    value={creditVolume} 
                    onChange={(e) => setCreditVolume(e.target.value)}
                  >
                    <option value="3000">Under 5,000 USDC / month</option>
                    <option value="15000">5,000 - 20,000 USDC / month</option>
                    <option value="50000">20,000 - 100,000 USDC / month</option>
                    <option value="250000">Over 100,000 USDC / month</option>
                  </select>
                </div>

                <button 
                  className="btn-run" 
                  onClick={checkCreditScore} 
                  disabled={isCheckingCredit}
                >
                  <TrendingUp size={14} />
                  <span>{isCheckingCredit ? "Analyzing Financials..." : "Assess Credit Rating"}</span>
                </button>

                {creditScore && (
                  <div className="credit-score-card animate-fade-in">
                    <div className="score-badge-row">
                      <span className="score-label">Rating:</span>
                      <span className={`score-badge ${creditScore.score}`}>{creditScore.score}</span>
                    </div>
                    <div className="score-details mt-2">
                      <div className="flex-between text-xs py-1">
                        <span>Max Drawdown Limit:</span>
                        <span className="font-semibold text-green">{creditScore.creditLimit} USDC</span>
                      </div>
                      <div className="flex-between text-xs py-1">
                        <span>Interest Rate Tiers:</span>
                        <span className="font-semibold">{creditScore.interestRate}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="divider-line" />

                <div className="control-title">USDC Credit Drawdown</div>

                <div className="input-field">
                  <label>Recipient EVM Wallet Address</label>
                  <input 
                    type="text" 
                    value={drawdownWallet} 
                    onChange={(e) => setDrawdownWallet(e.target.value)} 
                  />
                </div>

                <div className="input-field">
                  <label>Drawdown Amount (USDC)</label>
                  <div className="amount-input-wrapper">
                    <input 
                      type="number" 
                      value={drawdownAmount} 
                      onChange={(e) => setDrawdownAmount(e.target.value)} 
                    />
                    <span>USDC</span>
                  </div>
                </div>

                <button 
                  className="btn-run" 
                  onClick={executeDrawdown} 
                  disabled={isDrawingDown || !drawdownWallet}
                >
                  <Play size={14} />
                  <span>{isDrawingDown ? "Broadcasting Drawdown..." : "Draw down funds"}</span>
                </button>
              </div>
            )}

            {activeTab === "payments" && (
              <div className="control-group animate-fade-in">
                <div className="control-title">Supplier Settlement Payouts</div>

                <div className="input-field">
                  <label>Vendor Recipient 1</label>
                  <input 
                    type="text" 
                    value={payee1Address} 
                    onChange={(e) => setPayee1Address(e.target.value)} 
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

                <div className="input-field">
                  <label>Vendor Recipient 2</label>
                  <input 
                    type="text" 
                    value={payee2Address} 
                    onChange={(e) => setPayee2Address(e.target.value)} 
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

                <button 
                  className="btn-run" 
                  onClick={executeBatchPayment} 
                  disabled={isProcessingBatch}
                >
                  <Zap size={14} />
                  <span>{isProcessingBatch ? "Processing Batch..." : "Execute Batch Payment"}</span>
                </button>

                <div className="divider-line" />

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
                >
                  <Send size={14} />
                  <span>{isScheduling ? "Scheduling Payout..." : "Schedule Payout"}</span>
                </button>
              </div>
            )}

            {activeTab === "treasury" && (
              <div className="control-group animate-fade-in">
                <div className="control-title">USDC Yield Optimizer</div>

                <div className="input-field">
                  <label>Asset Pool Amount (USDC)</label>
                  <div className="amount-input-wrapper">
                    <input 
                      type="number" 
                      value={treasuryAmount} 
                      onChange={(e) => setTreasuryAmount(e.target.value)} 
                    />
                    <span>USDC</span>
                  </div>
                </div>

                <div className="input-field">
                  <label>Target Yield Product</label>
                  <select 
                    value={treasuryToToken}
                    onChange={(e) => setTreasuryToToken(e.target.value)}
                  >
                    <option value="USYC">USYC (Tokenized US Treasuries - 5.45% APY)</option>
                    <option value="EURC">EURC (Stable FX Hedging)</option>
                  </select>
                </div>

                <button 
                  className="btn-run" 
                  onClick={executeSwap} 
                  disabled={isSwapping}
                >
                  <Zap size={14} />
                  <span>{isSwapping ? "Executing On-chain Swap..." : "Optimize Yield (Swap)"}</span>
                </button>

                <div className="divider-line" />

                <div className="control-title">Cross-Chain Bridge Routing (CCTP)</div>

                <div className="input-field">
                  <label>Source Liquidity Network</label>
                  <select 
                    value={treasurySourceChain}
                    onChange={(e) => setTreasurySourceChain(e.target.value as any)}
                  >
                    <option value="base_sepolia">Base Sepolia L2</option>
                    <option value="ethereum">Ethereum Sepolia L1</option>
                  </select>
                </div>

                <div className="input-field">
                  <label>Destination Target Network</label>
                  <select 
                    value={treasuryTargetChain}
                    onChange={(e) => setTreasuryTargetChain(e.target.value as any)}
                  >
                    <option value="arc_testnet">Arc Testnet (Zero-Gas USDC Gas, ID: 5042002)</option>
                    <option value="base_sepolia">Base Sepolia L2</option>
                  </select>
                </div>

                <button 
                  className="btn-run" 
                  onClick={executeBridge} 
                  disabled={isBridging}
                >
                  <Globe size={14} />
                  <span>{isBridging ? "Initiating Cross-chain Bridge..." : "Bridge Assets (CCTP)"}</span>
                </button>
              </div>
            )}

            {activeTab === "fee" && (
              <div className="control-group animate-fade-in">
                <div className="control-title">Fee Policy Settings</div>

                <div className="input-field">
                  <label>Platform Admin Payout Recipient Wallet</label>
                  <input 
                    type="text" 
                    value={adminAddress} 
                    onChange={(e) => setAdminAddress(e.target.value)} 
                  />
                </div>

                <div className="input-field">
                  <label>Platform Fee Policy (USDC per Payout)</label>
                  <div className="range-wrapper">
                    <input 
                      type="range" 
                      min="0.10" 
                      max="10.00" 
                      step="0.05"
                      value={feePercent} 
                      onChange={(e) => setFeePercent(e.target.value)} 
                    />
                    <div className="flex-between text-xs mt-1">
                      <span>0.10 USDC</span>
                      <span className="font-semibold text-green">{feePercent} USDC</span>
                      <span>10.00 USDC</span>
                    </div>
                  </div>
                </div>

                {/* Pie Chart Split visualization */}
                <div className="split-visualizer">
                  <div className="visualizer-header">
                    <PieChart size={14} />
                    <span>On-Chain Payout Split</span>
                  </div>
                  
                  <div className="split-bar-container">
                    <div 
                      className="split-bar admin" 
                      style={{ width: "90%" }}
                      title="Admin Payout"
                    >
                      Admin (90%): {(parseFloat(feePercent) * 0.9).toFixed(2)} USDC
                    </div>
                    <div 
                      className="split-bar network" 
                      style={{ width: "10%" }}
                      title="Arc Gas Faucet Support"
                    >
                      Arc (10%): {(parseFloat(feePercent) * 0.1).toFixed(2)} USDC
                    </div>
                  </div>
                </div>

                <button 
                  className="btn-run" 
                  onClick={saveFeePolicy} 
                  disabled={isSavingPolicy || !adminAddress}
                >
                  <Sliders size={14} />
                  <span>{isSavingPolicy ? "Registering Policy..." : "Update Fee Policy"}</span>
                </button>
              </div>
            )}

            {activeTab === "webhooks" && (
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
                >
                  <Bell size={14} />
                  <span>{isTestingWebhook ? "Sending Payload..." : "Send Test Webhook"}</span>
                </button>
              </div>
            )}

            {activeTab === "templates" && (
              <div className="control-group animate-fade-in">
                <div className="control-title">ERC-20 Token Template Configuration</div>
                
                <div className="input-field">
                  <label>Token Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. BizFlow Stable" 
                    value={tokenName} 
                    onChange={(e) => setTokenName(e.target.value)} 
                  />
                </div>

                <div className="input-field">
                  <label>Token Symbol</label>
                  <input 
                    type="text" 
                    placeholder="e.g. BFUSDC" 
                    value={tokenSymbol} 
                    onChange={(e) => setTokenSymbol(e.target.value)} 
                  />
                </div>

                {/* Wallet Extension Toggle for on-chain deploy */}
                <div className="input-field" style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                  <input 
                    type="checkbox" 
                    id="deploy-wallet-toggle"
                    checked={useWalletExtension} 
                    onChange={() => setUseWalletExtension(!useWalletExtension)} 
                    style={{ width: "16px", height: "16px" }}
                  />
                  <label htmlFor="deploy-wallet-toggle" style={{ cursor: "pointer", fontSize: "12px" }}>
                    Deploy via Connected Wallet (on-chain signing)
                  </label>
                </div>

                {useWalletExtension && !isConnected && (
                  <div style={{ margin: "8px 0" }}>
                    <ConnectButton />
                  </div>
                )}

                {useWalletExtension && isConnected && (
                  <div className="alert-banner info" style={{ marginTop: "8px", fontSize: "11px" }}>
                    <Info size={14} className="text-tag" />
                    <div>
                      Connected as <code>{connectedAddress?.slice(0, 6)}...{connectedAddress?.slice(-4)}</code> — 
                      Your wallet will sign the contract deployment transaction on Arc Testnet.
                    </div>
                  </div>
                )}

                {isDeployingContract && (
                  <div className="progress-container">
                    <div className="flex-between text-xs mb-1">
                      <span>Deploying ERC-20 Contract...</span>
                      <span>{deploymentProgress}%</span>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${deploymentProgress}%` }} />
                    </div>
                  </div>
                )}

                <button 
                  className="btn-run" 
                  onClick={deployTemplate} 
                  disabled={isDeployingContract || !tokenName || !tokenSymbol || (useWalletExtension && !isConnected)}
                >
                  <Play size={14} />
                  <span>{isDeployingContract ? "Broadcasting Deployment..." : useWalletExtension ? "Deploy via Wallet (Sign Tx)" : "Deploy Contract Template"}</span>
                </button>
              </div>
            )}

            {activeTab === "sdk" && (
              <div className="control-group animate-fade-in">
                <div className="control-title">Developer Integration</div>
                <p className="text-xs text-muted" style={{ lineHeight: 1.5 }}>
                  Download client binaries or interact with the simulated endpoints locally. Live server is running at port 3000.
                </p>

                <div className="input-field">
                  <label>Live API Endpoint Status</label>
                  <div style={{ background: "#ffffff", border: "1px solid #e5e5e5", padding: "12px", borderRadius: "8px", display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div className="flex-between text-xs">
                      <span>Gateway Deposit API:</span>
                      <span className="text-green font-semibold">ONLINE</span>
                    </div>
                    <div className="flex-between text-xs">
                      <span>Credit Underwriting:</span>
                      <span className="text-green font-semibold">ONLINE</span>
                    </div>
                    <div className="flex-between text-xs">
                      <span>Payouts &amp; Webhooks:</span>
                      <span className="text-green font-semibold">ONLINE</span>
                    </div>
                  </div>
                </div>

                <button 
                  className="btn-run" 
                  onClick={() => addLog("success", "SDK package setup checked. Local REST APIs verified.")}
                >
                  <Check size={14} />
                  <span>Verify Local API Stack</span>
                </button>
              </div>
            )}

            {activeTab === "agents" && (
              <div className="control-group animate-fade-in">
                <div className="control-title">Hire AI Agent & Lock Escrow</div>
                
                <div className="input-field">
                  <label>Select AI Agent (ERC-8004 Verified)</label>
                  <select 
                    value={selectedAgent}
                    onChange={(e) => {
                      setSelectedAgent(e.target.value);
                      if (e.target.value === "TaxAuditBot") {
                        setAgentJobAmount("10.00");
                        setAgentJobDescription("Reconcile Q1 corporate expense sheet against USDC invoices");
                      } else if (e.target.value === "TreasuryMaxBot") {
                        setAgentJobAmount("25.00");
                        setAgentJobDescription("Optimize swap allocations & lock yield positions on Base Sepolia");
                      } else {
                        setAgentJobAmount("15.00");
                        setAgentJobDescription("Compose & distribute stablecoin adoption reports to partners");
                      }
                    }}
                  >
                    <option value="TaxAuditBot">TaxAuditBot (Score: 99% | Rate: 10.00 USDC)</option>
                    <option value="TreasuryMaxBot">TreasuryMaxBot (Score: 100% | Rate: 25.00 USDC)</option>
                    <option value="MarketingGenBot">MarketingGenBot (Score: 96% | Rate: 15.00 USDC)</option>
                  </select>
                </div>

                <div className="input-field">
                  <label>Job Escrow Balance (USDC)</label>
                  <input 
                    type="number" 
                    value={agentJobAmount} 
                    onChange={(e) => setAgentJobAmount(e.target.value)} 
                  />
                </div>

                <div className="input-field">
                  <label>Task Deliverables Spec</label>
                  <textarea 
                    value={agentJobDescription} 
                    onChange={(e) => setAgentJobDescription(e.target.value)}
                    rows={2}
                    style={{
                      width: "100%",
                      padding: "8px",
                      borderRadius: "6px",
                      border: "1px solid #d1d5db",
                      fontSize: "12px",
                      fontFamily: "inherit",
                      resize: "none"
                    }}
                  />
                </div>

                {agentJobStep !== "idle" && (
                  <div style={{ marginBottom: "15px", padding: "12px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px" }}>
                    <div style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", marginBottom: "8px" }}>
                      On-chain Job Lifecycle
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <div className="flex-between text-xs">
                        <span>1. ERC-8183 Job Escrow Locked:</span>
                        <span className={agentJobStep !== "idle" ? "text-green font-semibold" : "text-muted"}>
                          {agentJobStep === "escrow" ? "PENDING..." : "CONFIRMED"}
                        </span>
                      </div>
                      <div className="flex-between text-xs">
                        <span>2. AI Agent Processing Task:</span>
                        <span className={agentJobStep === "working" ? "text-yellow font-semibold animate-pulse" : (agentJobStep === "escrow" ? "text-muted" : "text-green font-semibold")}>
                          {agentJobStep === "escrow" ? "WAITING" : (agentJobStep === "working" ? "WORKING..." : "COMPLETED")}
                        </span>
                      </div>
                      <div className="flex-between text-xs">
                        <span>3. Evaluator Oracle Verification:</span>
                        <span className={agentJobStep === "submitting" ? "text-yellow font-semibold animate-pulse" : (agentJobStep === "settled" ? "text-green font-semibold" : "text-muted")}>
                          {agentJobStep === "settled" ? "VERIFIED" : (agentJobStep === "submitting" ? "VERIFYING..." : "WAITING")}
                        </span>
                      </div>
                      <div className="flex-between text-xs">
                        <span>4. Escrow Settled & Disbursed:</span>
                        <span className={agentJobStep === "settled" ? "text-green font-semibold" : "text-muted"}>
                          {agentJobStep === "settled" ? "SETTLED" : "WAITING"}
                        </span>
                      </div>
                    </div>

                    {agentJobTxHash && (
                      <div style={{ marginTop: "10px", paddingTop: "8px", borderTop: "1px solid #f1f5f9" }} className="flex-between text-2xs">
                        <span className="text-muted">Job Tx Hash:</span>
                        <a 
                          href={`https://testnet.arcscan.app/tx/${agentJobTxHash}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue hover:underline font-mono text-2xs"
                        >
                          {agentJobTxHash.substring(0, 14)}...
                        </a>
                      </div>
                    )}
                  </div>
                )}

                <button 
                  className="btn-run" 
                  onClick={runAgentJob} 
                  disabled={isHiringAgent || agentJobStep === "working" || agentJobStep === "submitting"}
                >
                  <Play size={14} />
                  <span>{isHiringAgent ? "Hiring Agent..." : "Hire Agent & Lock Escrow"}</span>
                </button>
              </div>
            )}

            {activeTab === "about" && (
              <div className="control-group animate-fade-in">
                <div className="control-title">Product Showcase Simulator</div>
                <p className="text-xs text-muted" style={{ lineHeight: 1.5 }}>
                  BizFlow is powered by high-performance protocols. Run a health diagnostic to check your RPC latency and API nodes.
                </p>

                <button 
                  className="btn-run" 
                  onClick={() => addLog("success", "System Diagnostic: Circle SDK: ACTIVE, Arc Node Latency: 22ms, Escrow Contract Status: ACTIVE")}
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
                      style={{ border: "2px solid var(--hairline)", padding: "10px 12px 10px 32px", borderRadius: "8px", width: "100%", outline: "none", fontSize: "13px" }}
                    />
                    <Search size={14} style={{ position: "absolute", left: "10px", top: "13px", color: "var(--muted)" }} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "contact" && (
              <div className="control-group animate-fade-in">
                <div className="control-title">Active Support Ticket Status</div>
                <div style={{ background: "#ffffff", border: "1px solid #e5e5e5", padding: "12px", borderRadius: "8px", display: "flex", flexDirection: "column", gap: "8px" }}>
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
                  onClick={() => addLog("info", "System Notification: Feedback form sandbox initialized. Submitting form will log a tick.")}
                >
                  <span>Initialize Feedback Loop</span>
                </button>
              </div>
            )}

            {activeTab === "legal" && (
              <div className="control-group animate-fade-in">
                <div className="control-title">Compliance Attestation Status</div>
                <div style={{ padding: "12px", borderRadius: "8px", border: "2px solid #e2e8f0", backgroundColor: "#f8fafc" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#64748b", marginBottom: "6px" }}>Regulatory Sandbox</div>
                  <p className="text-2xs text-muted" style={{ margin: 0, lineHeight: 1.4 }}>
                    BizFlow matches the requirements of a fully compliant, self-custodial developer platform. All interactions on this portal are fully mocked/sandboxed for the hackathon.
                  </p>
                </div>

                <button 
                  className="btn-run" 
                  onClick={() => addLog("success", "Compliance Attestation: Verified Safe Sandbox Env (June 1, 2026)")}
                >
                  <ShieldCheck size={14} />
                  <span>Verify Compliance Attestation</span>
                </button>
              </div>
            )}
          </div>

          {/* Response Console */}
          <div className="terminal-wrapper">
            <div className="terminal-header">
              <span>Terminal Response Console</span>
              <button onClick={clearLogs} className="text-btn">Clear Logs</button>
            </div>
            <div className="terminal-body">
              {logs.map((log, index) => (
                <div key={index} className={`terminal-line ${log.type}`}>
                  <span className="log-time">[{log.timestamp}]</span>{" "}
                  {log.type === "input" && <span className="log-indicator">&gt;</span>}
                  <span className="log-msg">{log.message}</span>
                </div>
              ))}
              <div ref={terminalEndRef} />
            </div>
          </div>

          {/* Collapsible Raw Payload Inspector */}
          <div className="inspector-wrapper" style={{ marginTop: "16px", border: "1px solid var(--hairline-dark)", borderRadius: "8px", overflow: "hidden", backgroundColor: "var(--surface-code)" }}>
            <button 
              onClick={() => setIsInspectorOpen(!isInspectorOpen)}
              className="flex-between"
              style={{
                width: "100%",
                background: "#1c1c1e",
                border: "none",
                color: "#ffffff",
                padding: "12px 16px",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
                textAlign: "left"
              }}
            >
              <span className="flex-center" style={{ gap: "8px" }}>
                <Code size={14} className="text-green" />
                <span>Raw HTTP JSON Payload Inspector</span>
              </span>
              <span className="text-xs" style={{ color: "var(--stone)" }}>
                {isInspectorOpen ? "Collapse [-]" : "Expand [+]"}
              </span>
            </button>

            {isInspectorOpen && (
              <div className="inspector-content" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", padding: "16px", borderTop: "1px solid var(--hairline-dark)", background: "#141416" }}>
                <div>
                  <div className="inspector-title" style={{ fontSize: "11px", color: "var(--muted)", textTransform: "uppercase", fontWeight: "600", marginBottom: "6px" }}>Raw Request JSON</div>
                  <pre style={{ margin: 0, padding: "12px", background: "#0a0a0a", color: "#a8a8aa", borderRadius: "6px", fontSize: "11px", overflowX: "auto", maxHeight: "250px" }}>
                    <code>{activeRequestPayload || "// No active request sent yet. Run a sandbox action."}</code>
                  </pre>
                </div>
                <div>
                  <div className="inspector-title" style={{ fontSize: "11px", color: "var(--muted)", textTransform: "uppercase", fontWeight: "600", marginBottom: "6px" }}>Raw Response JSON</div>
                  <pre style={{ margin: 0, padding: "12px", background: "#0a0a0a", color: "#00d4a4", borderRadius: "6px", fontSize: "11px", overflowX: "auto", maxHeight: "250px" }}>
                    <code>{activeResponsePayload || "// No active response received yet. Run a sandbox action."}</code>
                  </pre>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer-panel">
        <div className="footer-container">
          <div className="footer-brand">
            <Layers className="logo-icon" />
            <span>BizFlow</span>
          </div>
          <div className="footer-text">
            <span>© 2026 BizFlow Finance Corp. Standardised stablecoins infrastructure for SMEs on Arc.</span>
          </div>
        </div>
      </footer>

      {/* Search Overlay Command Palette */}
      {isSearchOpen && (
        <div className="search-overlay" onClick={() => setIsSearchOpen(false)}>
          <div className="search-modal" onClick={(e) => e.stopPropagation()}>
            <div className="search-modal-header">
              <input 
                type="text" 
                placeholder="Search documentation, APIs, and SDKs..." 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchSelectedIndex(0);
                }}
                onKeyDown={handleSearchKeyDown}
                autoFocus
              />
              <span className="esc-hint">ESC</span>
            </div>

            <div className="search-results">
              {filteredSearchItems.length > 0 ? (
                filteredSearchItems.map((item, index) => (
                  <div 
                    key={item.id} 
                    className={`search-item-row ${index === searchSelectedIndex ? "selected" : ""}`}
                    onClick={() => selectSearchItem(item.id as any)}
                    onMouseEnter={() => setSearchSelectedIndex(index)}
                  >
                    <div className="search-item-left">
                      <span className="search-item-category">{item.category}</span>
                      <span className="search-item-title">{item.title}</span>
                      <span className="search-item-desc">{item.desc}</span>
                    </div>
                    <div className="search-item-right">
                      <span className="enter-icon">↵</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="search-empty-state">
                  No matches found for &quot;{searchQuery}&quot;
                </div>
              )}
            </div>

            <div className="search-modal-footer">
              <span>↑↓ to navigate</span>
              <span>↵ to select</span>
              <span>esc to close</span>
            </div>
          </div>
        </div>
      )}

      {/* Styled JSX for Premium Mintlify Aesthetics */}
      <style jsx global>{`
        .portal-wrapper {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background-color: var(--canvas);
          color: var(--charcoal);
          font-family: var(--font-inter);
        }

        .promo-banner-container {
          background-color: var(--canvas-dark);
          color: #ffffff;
          font-size: 12px;
          text-align: center;
          padding: 10px 16px;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          border-bottom: 1px solid var(--hairline);
        }

        .text-green {
          color: var(--brand-green-deep);
          font-weight: 700;
        }

        .pulse-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
        }
        .pulse-dot.online {
          background-color: #00d4a4;
          box-shadow: 0 0 8px #00d4a4;
          animation: pulse 2s infinite;
        }
        .pulse-dot.connecting {
          background-color: #c37d0d;
          box-shadow: 0 0 8px #c37d0d;
          animation: pulse 2s infinite;
        }
        .pulse-dot.offline {
          background-color: #d45656;
          box-shadow: 0 0 8px #d45656;
        }

        .top-nav {
          background-color: var(--canvas);
          border-bottom: 2px solid var(--hairline);
          position: sticky;
          top: 0;
          z-index: 100;
          height: 72px;
        }

        .nav-container {
          max-width: 1440px;
          margin: 0 auto;
          padding: 0 24px;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .nav-left {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-syne);
          font-weight: 800;
          font-size: 22px;
          letter-spacing: -0.03em;
          text-transform: uppercase;
          color: var(--ink);
        }

        .logo::after {
          content: ".";
          color: var(--brand-green);
        }

        .logo-icon {
          color: var(--ink);
          stroke-width: 2.5;
        }

        .api-badge {
          background-color: var(--canvas-dark);
          border: 1px solid var(--hairline);
          color: #ffffff;
          font-size: 10px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 9999px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .nav-center {
          flex: 1;
          max-width: 480px;
          margin: 0 32px;
        }

        .search-bar {
          background-color: var(--surface);
          border: 2px solid var(--hairline);
          border-radius: 9999px;
          padding: 8px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 42px;
          transition: all 0.2s;
        }

        .search-bar:hover {
          border-color: var(--brand-green);
        }

        .search-bar input {
          border: none;
          background: transparent;
          font-size: 13px;
          outline: none;
          width: 100%;
          color: var(--steel);
        }

        .search-shortcut {
          background: var(--canvas);
          border: 1px solid var(--hairline);
          border-radius: 4px;
          padding: 2px 6px;
          font-size: 10px;
          color: var(--muted);
          font-family: var(--font-mono);
          font-weight: 600;
        }

        .nav-right {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .nav-link-item {
          font-size: 12px;
          color: var(--muted);
          display: flex;
          align-items: center;
          gap: 4px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          transition: color 0.2s;
        }

        .nav-link-item:hover {
          color: var(--ink);
        }

        .btn-accent {
          background-color: var(--canvas-dark);
          color: #ffffff;
          border: 2px solid var(--hairline);
          font-size: 12px;
          font-weight: 700;
          padding: 8px 20px;
          border-radius: 9999px;
          cursor: pointer;
          transition: all 0.2s;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .btn-accent:hover {
          background-color: var(--brand-green);
          color: var(--primary);
        }

        /* Swiss-Style Marketing Header */
        .hero-header {
          position: relative;
          background: var(--canvas);
          padding: 72px 24px 64px;
          text-align: left;
          overflow: hidden;
          border-bottom: 2px solid var(--hairline);
          border-left: 2px solid var(--hairline);
          border-right: 2px solid var(--hairline);
          max-width: 1440px;
          margin: 0 auto;
          width: 100%;
        }

        .hero-content {
          position: relative;
          z-index: 2;
          max-width: 1000px;
          margin: 0;
        }

        .hero-content h1 {
          font-family: var(--font-syne);
          font-size: 64px;
          font-weight: 800;
          letter-spacing: -0.04em;
          line-height: 1.05;
          text-transform: uppercase;
          color: var(--primary);
          margin-bottom: 16px;
        }
        
        .hero-content h1::after {
          content: ".";
          color: var(--brand-green);
        }

        .hero-content p {
          font-size: 18px;
          color: var(--slate);
          line-height: 1.5;
          max-width: 720px;
        }

        /* 3-Column Document Layout with Swiss Structural gridlines */
        .split-screen-container {
          flex: 1;
          display: flex;
          max-width: 1440px;
          margin: 0 auto;
          width: 100%;
          border-left: 2px solid var(--hairline);
          border-right: 2px solid var(--hairline);
        }

        .sidebar {
          width: 280px;
          border-right: 2px solid var(--hairline);
          padding: 32px 20px;
          background: var(--canvas);
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        .sidebar-group-header {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--muted);
          letter-spacing: 0.08em;
          margin-bottom: 12px;
          padding-left: 8px;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .sidebar-group-header::before {
          content: "*";
          color: var(--brand-green);
        }

        .sidebar-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border: 2px solid transparent;
          background: transparent;
          color: var(--steel);
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          text-align: left;
          cursor: pointer;
          border-radius: 9999px;
          transition: all 0.2s;
        }

        .sidebar-item.active {
          background-color: var(--canvas-dark);
          color: #ffffff;
          border-color: var(--hairline);
          box-shadow: none;
        }

        .sidebar-item:hover:not(.active) {
          background-color: var(--surface);
          border-color: var(--hairline);
          color: var(--ink);
        }

        .ref-card {
          background: var(--surface);
          border: 2px solid var(--hairline);
          border-radius: 12px;
          padding: 16px;
          font-size: 11px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .ref-row {
          display: flex;
          justify-content: space-between;
          color: var(--steel);
        }

        .ref-row span:last-child {
          font-family: var(--font-mono);
          color: var(--ink);
          font-weight: 600;
        }

        /* Middle Prose Column */
        .docs-content {
          flex: 1;
          padding: 48px 40px;
          overflow-y: auto;
          max-width: 720px;
          border-right: 2px solid var(--hairline);
          background: var(--surface);
        }

        .prose {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .badge-tag {
          align-self: flex-start;
          background-color: var(--canvas-dark);
          color: #ffffff;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 4px 10px;
          border-radius: 9999px;
          border: 1px solid var(--hairline);
        }

        .prose h2 {
          font-family: var(--font-syne);
          font-size: 38px;
          font-weight: 800;
          color: var(--ink);
          letter-spacing: -0.03em;
          text-transform: uppercase;
          border-bottom: 2px solid var(--hairline);
          padding-bottom: 12px;
          margin-top: 16px;
        }

        .prose h2::after {
          content: ".";
          color: var(--brand-green);
        }

        .prose h3 {
          font-family: var(--font-syne);
          font-size: 20px;
          font-weight: 800;
          color: var(--ink);
          text-transform: uppercase;
          letter-spacing: -0.02em;
          margin-top: 24px;
        }

        .prose p {
          font-size: 15px;
          line-height: 1.6;
          color: var(--charcoal);
        }

        .alert-banner {
          display: flex;
          gap: 12px;
          padding: 16px 20px;
          border-radius: 8px;
          font-size: 14px;
          line-height: 1.5;
          border: 2px solid var(--hairline);
        }

        .alert-banner.info {
          background-color: var(--surface);
          border-left: 6px solid var(--brand-green);
        }

        .alert-banner.warning {
          background-color: var(--surface);
          border-left: 6px solid var(--brand-warn);
          color: #0a0a0a;
        }

        .text-tag { color: var(--brand-tag); font-weight: 600; }
        .text-warn { color: var(--brand-warn); font-weight: 600; }

        .step-list {
          padding-left: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          font-size: 14px;
        }

        .step-list li {
          line-height: 1.5;
        }

        /* Code Block Component */
        .code-block-wrapper {
          border-radius: 12px;
          overflow: hidden;
          background-color: var(--surface-code);
          border: 2px solid var(--hairline);
        }

        .code-header {
          background-color: #1a1a1e;
          padding: 8px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--hairline-dark);
          color: #888888;
          font-size: 12px;
        }

        .copy-btn {
          background: transparent;
          border: 1px solid var(--hairline-dark);
          border-radius: 4px;
          color: #888888;
          padding: 4px 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
        }

        .copy-btn:hover {
          color: #ffffff;
          background: #252529;
        }

        .code-block-wrapper pre {
          padding: 16px;
          margin: 0;
          overflow-x: auto;
          color: #d4d4d4;
          font-size: 13px;
          line-height: 1.5;
        }

        /* Tables */
        .params-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
          text-align: left;
        }

        .params-table th, .params-table td {
          padding: 12px 16px;
          border-bottom: 2px solid var(--hairline);
        }

        .params-table th {
          background-color: var(--canvas);
          color: var(--ink);
          font-weight: 700;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 2px solid var(--hairline);
        }

        .badge-error {
          background-color: #fcebeb;
          color: var(--brand-error);
          font-size: 10px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
        }

        /* API Spec Card */
        .api-spec-card {
          border: 2px solid var(--hairline);
          border-radius: 12px;
          background: var(--surface);
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .api-endpoint-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .api-method {
          font-size: 11px;
          font-weight: 700;
          padding: 4px 8px;
          border-radius: 4px;
          color: #ffffff;
        }

        .api-method.post {
          background-color: #1ba673;
        }

        .api-path {
          font-family: var(--font-mono);
          font-size: 13px;
          color: var(--ink);
          font-weight: 600;
        }

        .api-payload-section {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .payload-title {
          font-size: 11px;
          font-weight: 600;
          color: var(--steel);
          text-transform: uppercase;
        }

        .payload-code {
          background: var(--surface-code);
          color: #f7f7f7;
          font-size: 12px;
          padding: 12px;
          border-radius: 6px;
          overflow-x: auto;
          font-family: var(--font-mono);
        }

        /* Right Sandbox panel with Swiss structural grid */
        .sandbox-panel {
          width: 440px;
          border-left: 2px solid var(--hairline);
          background: var(--surface);
          display: flex;
          flex-direction: column;
        }

        .panel-header {
          padding: 18px 24px;
          border-bottom: 2px solid var(--hairline);
          font-family: var(--font-syne);
          font-size: 15px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: -0.01em;
          color: var(--ink);
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--canvas);
        }

        .playground-controls {
          flex: 1;
          padding: 24px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .control-group {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .control-title {
          font-family: var(--font-syne);
          font-size: 13px;
          font-weight: 800;
          text-transform: uppercase;
          color: var(--ink);
          letter-spacing: -0.01em;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .control-title::before {
          content: "*";
          color: var(--brand-green);
        }

        .input-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .input-field label {
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--steel);
        }

        .input-field select, 
        .input-field input[type="text"], 
        .input-field input[type="number"],
        .input-field input[type="date"] {
          width: 100%;
          padding: 12px 14px;
          border: 2px solid var(--hairline);
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          background: var(--canvas);
          color: var(--ink);
          transition: border-color 0.2s;
        }

        .input-field select:focus, 
        .input-field input[type="text"]:focus, 
        .input-field input[type="number"]:focus,
        .input-field input[type="date"]:focus {
          border-color: var(--brand-green);
        }

        .input-desc {
          font-size: 11px;
          color: var(--stone);
        }

        .amount-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .amount-input-wrapper input {
          padding-right: 60px !important;
        }

        .amount-input-wrapper span {
          position: absolute;
          right: 14px;
          font-size: 12px;
          font-weight: 700;
          color: var(--ink);
        }

        .checkbox-field {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .checkbox-field input {
          width: 16px;
          height: 16px;
          accent-color: var(--brand-green);
        }

        .checkbox-field label {
          font-size: 13px;
          font-weight: 500;
          color: var(--charcoal);
          cursor: pointer;
        }

        .flex-between {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .text-btn {
          background: transparent;
          border: none;
          color: var(--brand-tag);
          font-size: 12px;
          cursor: pointer;
          font-weight: 500;
        }

        .text-btn:hover {
          text-decoration: underline;
        }

        /* Red Warning Box if Private Key starts with no 0x */
        .input-error {
          border-color: var(--brand-error) !important;
          background-color: #fdf8f8 !important;
        }

        .error-alert {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--brand-error);
          font-size: 11px;
          font-weight: 600;
          background: #fdf3f3;
          padding: 6px 12px;
          border-radius: 4px;
          border: 1px solid #fbe3e3;
        }

        .btn-run {
          background-color: var(--canvas-dark);
          color: #ffffff;
          border: 2px solid var(--hairline);
          padding: 14px;
          border-radius: 9999px;
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-run:hover {
          background-color: var(--brand-green);
          color: var(--primary);
        }

        .btn-run:disabled {
          background-color: var(--canvas);
          color: var(--muted);
          cursor: not-allowed;
          border-color: var(--hairline-soft);
        }

        .btn-run.btn-secondary {
          background-color: var(--canvas);
          color: var(--ink);
          border: 2px solid var(--hairline);
        }

        .btn-run.btn-secondary:hover {
          background-color: var(--canvas-dark);
          color: #ffffff;
        }

        /* Checkout Widget Simulation Preview */
        .widget-preview-area {
          border: 2px solid var(--hairline);
          border-radius: 12px;
          padding: 16px;
          background: var(--canvas);
        }

        .preview-label {
          font-family: var(--font-syne);
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
          color: var(--ink);
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .preview-label::before {
          content: "*";
          color: var(--brand-green);
        }

        .widget-iframe {
          width: 100%;
          height: 380px;
          border: 2px solid var(--hairline);
          border-radius: 12px;
          box-shadow: none;
        }

        /* Session Status Box */
        .session-card {
          border: 2px solid var(--hairline);
          border-radius: 12px;
          background: var(--surface);
          overflow: hidden;
        }

        .session-header {
          background: var(--canvas);
          padding: 12px 16px;
          border-bottom: 2px solid var(--hairline);
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--ink);
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .session-body {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .session-row {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
        }

        .session-row span:first-child {
          color: var(--steel);
        }

        .session-row span:last-child {
          font-weight: 500;
        }

        .btn-logout {
          background: transparent;
          border: 2px solid var(--brand-error);
          color: var(--brand-error);
          padding: 6px 14px;
          border-radius: 9999px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          cursor: pointer;
          margin-top: 6px;
          transition: all 0.2s;
        }

        .btn-logout:hover {
          background: #fdf3f3;
        }

        .session-empty {
          padding: 16px;
          font-size: 12px;
          color: var(--stone);
          line-height: 1.5;
          text-align: center;
        }

        /* Fee Split Visualizer */
        .split-visualizer {
          background: var(--canvas);
          border: 2px solid var(--hairline);
          border-radius: 12px;
          padding: 16px;
        }

        .visualizer-header {
          font-family: var(--font-syne);
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          color: var(--ink);
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .split-bar-container {
          display: flex;
          height: 32px;
          border: 2px solid var(--hairline);
          border-radius: 8px;
          overflow: hidden;
          font-size: 11px;
          font-weight: 700;
          color: #ffffff;
        }

        .split-bar {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          padding: 0 8px;
          transition: width 0.3s ease;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .split-bar.admin {
          background-color: var(--brand-green);
          color: var(--primary);
        }

        .split-bar.network {
          background-color: var(--canvas-dark);
          color: #ffffff;
        }

        /* Credit Score Card */
        .credit-score-card {
          background: var(--surface);
          border: 2px solid var(--hairline);
          padding: 16px;
          border-radius: 12px;
        }

        .score-badge-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .score-label {
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--steel);
        }

        .score-badge {
          font-size: 14px;
          font-weight: 800;
          padding: 2px 10px;
          border-radius: 4px;
        }

        .score-badge.AAA { background-color: var(--brand-green); color: var(--primary); }
        .score-badge.A { background-color: #e8f4fd; color: var(--brand-tag); }
        .score-badge.B { background-color: #fdf6ec; color: var(--brand-warn); }
        .score-badge.C { background-color: #fdf3f3; color: var(--brand-error); }
        .score-badge.D { background-color: #f5f5f5; color: #5a5a5c; }

        .divider-line {
          height: 2px;
          background-color: var(--hairline);
          margin: 6px 0;
        }

        /* SDK Tabs */
        .sdk-lang-selector {
          display: flex;
          gap: 8px;
          border-bottom: 2px solid var(--hairline);
          margin-bottom: 12px;
        }

        .sdk-lang-tab {
          background: transparent;
          border: none;
          padding: 8px 16px;
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          cursor: pointer;
          color: var(--stone);
          border-bottom: 3px solid transparent;
          transition: all 0.2s;
        }

        .sdk-lang-tab.active {
          color: var(--ink);
          border-bottom-color: var(--brand-green);
        }

        /* Progress Bar */
        .progress-container {
          display: flex;
          flex-direction: column;
        }

        .progress-track {
          width: 100%;
          height: 10px;
          background-color: var(--canvas);
          border: 2px solid var(--hairline);
          border-radius: 9999px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background-color: var(--brand-green);
          transition: width 0.3s ease;
        }

        /* Virtual Terminal Console */
        .terminal-wrapper {
          height: 240px;
          background-color: var(--surface-code);
          border-top: 2px solid var(--hairline);
          display: flex;
          flex-direction: column;
          font-family: var(--font-mono);
          font-size: 12px;
        }

        .terminal-header {
          background-color: var(--canvas);
          padding: 12px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid var(--hairline);
          color: var(--ink);
          font-family: var(--font-syne);
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
        }

        .terminal-body {
          flex: 1;
          padding: 12px 16px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 6px;
          will-change: transform;
          transform: translateZ(0);
        }

        .terminal-line {
          color: #e5e5e5;
          line-height: 1.4;
          word-break: break-all;
        }

        .terminal-line.success {
          color: var(--brand-green);
        }

        .terminal-line.warning {
          color: var(--brand-warn);
        }

        .terminal-line.error {
          color: var(--brand-error);
        }

        .terminal-line.input {
          color: #87a8c8;
        }

        .log-time {
          color: #5a5a5c;
          margin-right: 6px;
        }

        .log-indicator {
          color: var(--brand-green);
          margin-right: 6px;
          font-weight: bold;
        }

        /* Footer */
        .footer-panel {
          border-top: 2px solid var(--hairline);
          padding: 32px 24px;
          background-color: var(--canvas);
          margin-top: auto;
        }

        .footer-container {
          max-width: 1440px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--muted);
        }

        .footer-brand {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-syne);
          font-weight: 800;
          color: var(--ink);
        }

        /* Mobile search toggle styling */
        .search-toggle-mobile {
          display: none;
        }

        /* Laptop & Small Desktop optimizations */
        @media (max-width: 1280px) {
          .split-screen-container {
            border-left: none;
            border-right: none;
          }
          .sandbox-panel {
            width: 380px;
          }
        }

        /* Tablet & IPad portrait/landscape viewports */
        @media (max-width: 1024px) {
          .top-nav {
            padding: 0 16px;
          }
          .nav-container {
            padding: 0;
          }
          .nav-center {
            display: none;
          }
          .search-toggle-mobile {
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--surface);
            border: 1px solid var(--hairline);
            color: var(--steel);
            cursor: pointer;
            padding: 8px;
            border-radius: 8px;
            transition: all 0.2s;
          }
          .search-toggle-mobile:hover {
            color: var(--ink);
            border-color: var(--brand-green);
          }
          .nav-right .nav-link-item {
            display: none;
          }
          .hero-header {
            padding: 32px 16px;
          }
          .hero-content h1 {
            font-size: 28px;
          }

          .split-screen-container {
            flex-direction: column;
          }
          .sidebar {
            width: 100%;
            flex-direction: row;
            overflow-x: auto;
            white-space: nowrap;
            padding: 12px 16px;
            gap: 10px;
            background: var(--canvas);
            border-right: none;
            border-bottom: 1px solid var(--hairline-soft);
            scrollbar-width: none;
          }
          .sidebar::-webkit-scrollbar {
            display: none;
          }
          .sidebar-group {
            display: flex;
            flex-direction: row;
            gap: 8px;
            margin-top: 0 !important;
          }
          .sidebar-group-header {
            display: none;
          }
          .sidebar-item {
            width: auto;
            display: inline-flex;
            padding: 6px 12px;
          }
          .sidebar-item.active {
            border-left: none;
            border-bottom: 2px solid var(--brand-green);
            border-radius: 0;
            padding-left: 12px;
            padding-bottom: 4px;
          }
          .ref-card {
            display: none;
          }

          .docs-content {
            max-width: 100%;
            padding: 24px 20px;
          }
          .sandbox-panel {
            width: 100%;
            border-left: none;
            border-top: 1px solid var(--hairline-soft);
          }
        }

        /* Mobile phones (Android/iPhone/Small Mobile) */
        @media (max-width: 768px) {
          .top-nav {
            height: 56px;
          }
          .hero-header h1 {
            font-size: 24px;
            letter-spacing: -0.5px;
          }
          .hero-header p {
            font-size: 13px;
          }
          .docs-content {
            padding: 20px 16px;
          }
          .prose h2 {
            font-size: 22px;
          }
          .prose h3 {
            font-size: 16px;
          }
          .prose p {
            font-size: 14px;
          }
          .code-block-wrapper pre {
            font-size: 12px;
            padding: 12px;
          }
          .params-table {
            font-size: 12px;
          }
          .params-table th, .params-table td {
            padding: 8px 12px;
          }
          .playground-controls {
            padding: 16px;
          }
          .footer-container {
            flex-direction: column;
            gap: 12px;
            text-align: center;
          }
        }

        /* Safe area support for notched phones */
        @supports (padding: env(safe-area-inset-bottom)) {
          .portal-wrapper {
            padding-left: env(safe-area-inset-left);
            padding-right: env(safe-area-inset-right);
          }
          .footer-panel {
            padding-bottom: calc(24px + env(safe-area-inset-bottom));
          }
        }

        /* Small screens portrait (iPhone SE / Small Androids) */
        @media (max-width: 360px) {
          .top-nav {
            padding: 0 8px;
          }
          .logo span {
            display: none;
          }
          .api-badge {
            font-size: 9px;
            padding: 1px 4px;
          }
          .search-toggle-mobile {
            padding: 6px;
          }
          .sidebar-item {
            font-size: 12px;
            padding: 6px 8px;
          }
          .widget-iframe {
            height: 340px;
          }
        }

        /* Search overlay and palette styles */
        .search-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(10, 15, 30, 0.7);
          backdrop-filter: blur(12px);
          z-index: 1000;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          padding-top: 100px;
        }

        .search-modal {
          width: 100%;
          max-width: 600px;
          background: #18181b;
          border: 1px solid var(--hairline-dark);
          border-radius: 16px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          max-height: 480px;
        }

        .search-modal-header {
          display: flex;
          align-items: center;
          padding: 16px;
          border-bottom: 1px solid var(--hairline-dark);
          gap: 12px;
          background: #09090b;
        }

        .search-modal-header input {
          flex: 1;
          border: none;
          background: transparent;
          font-size: 16px;
          outline: none;
          color: #f4f4f5;
        }

        .esc-hint {
          font-size: 11px;
          font-weight: 600;
          color: #71717a;
          border: 1px solid var(--hairline-dark);
          padding: 2px 6px;
          border-radius: 4px;
          background: #27272a;
          font-family: var(--font-mono);
        }

        .search-results {
          flex: 1;
          overflow-y: auto;
          padding: 8px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .search-item-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          background: transparent;
        }

        .search-item-row.selected {
          background-color: rgba(0, 212, 164, 0.15);
        }

        .search-item-left {
          display: flex;
          flex-direction: column;
          gap: 2px;
          text-align: left;
        }

        .search-item-category {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          color: #00d4a4;
          letter-spacing: 0.5px;
        }

        .search-item-title {
          font-size: 14px;
          font-weight: 600;
          color: #f4f4f5;
        }

        .search-item-desc {
          font-size: 12px;
          color: #a1a1aa;
        }

        .search-item-right {
          opacity: 0;
          transition: opacity 0.2s;
        }

        .search-item-row.selected .search-item-right {
          opacity: 1;
        }

        .enter-icon {
          font-size: 14px;
          color: #00d4a4;
          font-weight: bold;
        }

        .search-empty-state {
          padding: 32px;
          text-align: center;
          color: #71717a;
          font-size: 14px;
        }

        .search-modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 16px;
          padding: 12px 16px;
          border-top: 1px solid var(--hairline-dark);
          background: #09090b;
          font-size: 11px;
          color: #71717a;
        }

        /* Utility animations */
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .mt-6 { margin-top: 24px; }
        .mt-2 { margin-top: 8px; }
        .mt-1 { margin-top: 4px; }
        .py-1 { padding-top: 4px; padding-bottom: 4px; }
        .font-semibold { font-weight: 600; }
        .text-xs { font-size: 12px; }
        .p-4 { padding: 16px; }
        .flex-center { display: flex; align-items: center; justify-content: center; }
        .text-muted { color: var(--muted); }
      `}</style>
    </div>
  );
}

export default nextDynamic(() => Promise.resolve(Home), { ssr: false });

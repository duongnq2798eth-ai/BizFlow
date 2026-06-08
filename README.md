# 🚀 BizFlow: The Stablecoins Commerce Stack for SMEs

BizFlow is a production-grade, investor-ready stablecoin commerce gateway and developer platform designed to empower Small and Medium Enterprises (SMEs) with fast, friction-free payment flows. Built specifically to target the **Arc Testnet** (incorporating its sub-second finality and native USDC gas fee structure), BizFlow unifies checkout widgets, credit underwriting, scheduled payouts, treasury swaps, and custom smart contract deployment templates into a single high-performance portal.

---

## 🏗️ Architecture & System Design

BizFlow is architected with a hybrid static-serverless paradigm using the **Next.js App Router**. This design delivers an ultra-fast developer documentation site while providing robust, secure serverless endpoints to communicate with blockchain adapters, manage sandbox states, and securely issue sessions.

### 1. High-Level System Architecture & Circle Integrations
This diagram outlines the major blocks of the BizFlow ecosystem, mapping the frontend client tiers, Next.js API endpoints, and smart contracts to Circle platform products and the Arc Testnet ledger.

```mermaid
flowchart TD
    subgraph Clients["Client Tier (User Interfaces)"]
        Portal["B2B SME Portal (Docs & Playground)"]
        Widget["Embeddable Checkout Widget"]
        Analytics["Analytics BI Dashboard"]
    end

    subgraph CirclePlatform["Circle Product Suite (Integration Points)"]
        AppKit["@circle-fin/app-kit (Send, Bridge, Swap)"]
        Gateway["Circle Gateway Nanopayments"]
        Wallets["Circle Developer-Controlled & Agent Wallets"]
        StableFX["StableFX API (EURC <-> USDC Swaps)"]
    end

    subgraph API_Gateway["Application Server (Next.js Serverless Routes)"]
        PaymentsAPI["/api/payments (Batch & Scheduled Payouts)"]
        InvoiceAPI["/api/invoice (Milestones & PO Matching)"]
        EscrowAPI["/api/credit (Collateral & Drawdowns)"]
        NanopayAPI["/api/nanopay (Micropayments billing)"]
        AgentsAPI["/api/agents (ERC-8004 Registry & Escrows)"]
        TreasuryAPI["/api/treasury (CCTP & Yield Swaps)"]
    end

    subgraph Contracts["Smart Contracts Tier"]
        InvoiceContract["BizFlowInvoice.sol (PO Match)"]
        EscrowContract["BizFlowEscrow.sol (Milestones)"]
        AgentRegistry["BizFlowAgentRegistry.sol (ERC-8004)"]
    end

    subgraph Network["Blockchain Tier (Arc Testnet)"]
        ArcRPC["Arc RPC Node (rpc.testnet.arc.network)"]
        USDC_Contract["Native Gas USDC Token (0x36000...)"]
        CCTPNative["CCTP Mint/Burn Contract (Circle)"]
    end

    Portal -->|App Kit API| AppKit
    Widget -->|x402 Micropayments| Gateway
    PaymentsAPI -->|DCW Payouts| Wallets
    InvoiceAPI -->|EURC Swap| StableFX

    AppKit --> API_Gateway
    Gateway --> NanopayAPI
    Wallets --> API_Gateway
    StableFX --> InvoiceAPI

    API_Gateway -->|JSON-RPC Requests| ArcRPC
    ArcRPC -->|interact| Contracts
    Contracts -->|Gas Paid In| USDC_Contract
    API_Gateway -->|CCTP mint/burn| CCTPNative
```

* **Client Tier:** Contains the primary interactive developer platform, the secure embeddable Checkout Widget, and the BI Analytics dashboard.
* **Circle Product Suite:** Direct developer integration points utilizing Circle APIs and SDKs to manage transactions, wallets, swap rates, and micropayments.
* **Application Server (Next.js API Routes):** Acts as a secure middleware layer. It holds server-side simulation rules, formats raw payloads, and shields private keys from being exposed to client browsers.
* **Blockchain Tier:** The live integration layer that queries the Arc Testnet JSON-RPC node for block numbers, gas pricing, and ERC-20 token balances.

---

### 2. Frontend ↔ Backend Interactive Request Lifecycle & Web3 Wallet Flow
The sequence diagram below describes the security boundary and step-by-step lifecycles of a client rendering a checkout page, authenticating a session, and broadcasting a transaction.

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Retail Customer
    participant Frame as Checkout Widget (Iframe)
    participant Server as Next.js API Middleware
    participant Arc as Arc Testnet RPC

    Customer->>Frame: Enters Email / Clicks Google Login
    Frame->>Server: POST /api/session (Create session context)
    Note over Server: Generates mock user wallet & key pair.<br/>Encrypts session token.
    Server-->>Frame: Set-Cookie: token (HttpOnly, Secure, SameSite=Strict)
    Frame-->>Customer: Renders Secure Checkout UI (Pay Balance)
    
    Customer->>Frame: Approves payment of 25.00 USDC
    Frame->>Server: POST /api/payments (Request transaction broadcast)
    Note over Server: Authorizes via HttpOnly Cookie.<br/>Signs tx payload using encrypted credentials.
    Server->>Arc: eth_sendRawTransaction (Broadcasting signed transaction)
    Arc-->>Server: Transaction Hash (Hex)
    Server-->>Frame: Return Payment Success Payload
    Frame-->>Customer: Display Success Confirmation Checkmark
```

* **Architectural Decisions & Tradeoffs:**
  * **HttpOnly Session Cookies:** By storing session tokens in HttpOnly cookies, we mitigate cross-site scripting (XSS) risks. The frontend client code cannot read the credentials, protecting developer assets.
  * **Unified Balance Sandbox Runtime:** Rather than forcing users to hook up external MetaMask accounts for simple documentation experiments, BizFlow uses sandboxed backend credentials while enabling standard web3 extension overrides when requested.

---

### 3. CCTP Yield Swap & Gas Sponsorship Topology
The following workflow details how funds flow across chains via Circle's Cross-Chain Transfer Protocol (CCTP) and get deployed into institutional yield assets (USYC) on Arc.

```mermaid
flowchart LR
    subgraph Source["Source L2 (Base Sepolia)"]
        BurnUSDC["USDC Token (Base)"] -->|1. CCTP Burn| Messenger["Circle Transceiver"]
    end

    subgraph ArcChain["Arc Testnet L1"]
        MintUSDC["USDC Token (Arc)"]
        GasTank["Native Gas Pool"]
        YieldSwap["USD Yield Token Swap (USYC)"]
    end

    Messenger -->|2. Relayer Mint| MintUSDC
    MintUSDC -->|3a. Swap for Yield| YieldSwap
    GasTank -.->|3b. Gas Sponsorship| MintUSDC
```

* **What it Represents:** This diagram shows the cross-chain treasury pipeline.
* **Important Details:**
  * **USDC as Gas:** On Arc Testnet, the native gas token is USDC (represented in 18 decimals for gas units, while ERC-20 USDC uses 6 decimals).
  * **Gas Sponsorship:** The infrastructure automatically sponsors the L2 cross-chain burn/mint gas fee, providing sub-second confirmation times to end merchants.

---

### 4. B2B Merchant DevEx Onboarding Journey
This journey map details the stages a developer goes through to integrate the Checkout Widget and customize fee schedules.

```mermaid
journey
    title B2B Merchant DevEx Onboarding & Sandbox Simulation Journey
    section Setup & Discovery
      Open Interactive Portal: 5: Developer
      Explore Contract Templates: 4: Developer
      Inspect Gas split & fees: 4: Developer
    section Development
      Configure Custom Fee splits: 5: Developer
      Instantiate Checkout widget parameters: 4: Developer
      Query On-Chain USDC balance: 5: Developer
    section Verification
      Verify secure HTTPOnly cookie auth: 5: Developer
      Run sandbox deposit test: 5: Developer
      Inspect Raw HTTP JSON payload: 5: Developer
```

* **What it Represents:** This journey map visualizes the developer experience (DevEx) flow, showing the developer's actions and satisfaction ratings at different integration steps.
* **Key Components:** Covers Setup & Discovery, Development, and Verification stages.
* **Architectural Tradeoffs:** Providing sandboxed execution consoles alongside real-time on-chain blockchain balance checks ensures a low-friction integration phase without compromising on live network feedback.

---

### 5. Smart Contract Idempotent Deployment State Machine
This state diagram illustrates the backend execution phases when compiling, deploying, and tracking smart contract deployments with unique idempotency keys.

```mermaid
stateDiagram-v2
    [*] --> Idle: Init Deploy Request
    Idle --> Pending: POST /templates/:id/deploy (Generates Idempotency Key)
    Pending --> Compiling: Compiling Solidity Source Code
    Compiling --> Broadcasting: Broadcasting Transaction to Arc
    Broadcasting --> Success: Confirm Block Broadcast
    Broadcasting --> Failed: Execution Timeout or Reversion
    Success --> [*]
    Failed --> [*]
```

* **What it Represents:** This state diagram shows the lifecycle of a smart contract template deployment.
* **Key Components:** State transitions from Idle to Pending, Compiling, Broadcasting, and final Success/Failed status.
* **Architectural Decisions:** The server uses the client's generated idempotency key to prevent duplicate deployments during network glitches or page refreshes.

---

## 📂 Repository Layout & Module Responsibilities

```bash
duongnq2798.eth/track-2-BizFlow/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── credit/route.ts       # Underwriting logic & credit drawdown simulations
│   │   │   ├── payments/route.ts     # Scheduled payout automation & batch execution
│   │   │   ├── session/route.ts      # HttpOnly session manager for sandbox checkout
│   │   │   ├── treasury/route.ts      # CCTP bridging & yield swap simulation engines
│   │   │   └── webhooks/route.ts      # Webhook payload builder & delivery verification
│   │   ├── templates/
│   │   │   └── [templateId]/
│   │   │       ├── deploy/route.ts   # Contract template deployer (Idempotent tracking)
│   │   │       └── status/route.ts   # Status polling with simulated compilation steps
│   │   ├── widget/
│   │   │   └── checkout/
│   │   │       └── page.tsx          # Secure iframe Checkout Widget
│   │   ├── globals.css               # Global theme tokens, typography, & animation classes
│   │   ├── layout.tsx                # Base HTML Shell & viewport metadata
│   │   └── page.tsx                  # Main Interactive Developer Documentation Portal
├── next.config.mjs                   # Next.js configurations
└── package.json                      # Build scripts, project dependencies, & metadata
```

---

## 🛡️ Security Architecture & Threat Modeling

BizFlow addresses several Web3 and B2B specific security risks:

| Threat Vector | Attack Scenario | BizFlow Mitigation Strategy |
| :--- | :--- | :--- |
| **Private Key Theft** | Malicious extensions or scripts scanning memory for variables. | **Sandboxed Contexts & Red warnings:** Key imports require explicit user approval and are locked to sandbox environment chains (`0x4CEF52` ID only). Bright warning flags force prefix validations (`0x`). |
| **Cross-Site Scripting (XSS)** | Hijacking user sessions on the checkout widget page. | **HttpOnly Cookies:** Checkout sessions are secured via HttpOnly, SameSite=Strict cookies to deny JavaScript reading privileges. |
| **Double Spending** | Submitting identical payout requests twice due to RPC latency. | **Idempotent Keys:** Deployments and payments use unique idempotency tokens tracked on server states to verify transaction uniqueness. |
| **Swapping Slippage** | Frontrunning tokenized yield swaps (USDC -> USYC). | **Slippage Bounds:** Hardcoded price feeds verify minimum yield outputs on treasury swap routes. |

---

## 📈 Performance Optimizations & Production Scaling

* **RPC Node Caching:** The live Block Height and Gas Price are cached for 10 seconds. This prevents rate-limiting issues on the Arc Testnet RPC endpoints under heavy B2B portal loads.
* **Serverless Cold-Start Reduction:** Next.js API routes use modular imports (Viem adapters are initialized lazily inside handler invocations) to keep the initial serverless bundle size minimal.
* **Global Styles Separation:** By refactoring all styled components to utilize class rules in `globals.css`, we bypassed the SSR hydration overhead of dynamic styled-jsx inside Next.js App Router sub-routes.

---

## 📋 Pre-Configured Smart Contract Templates

BizFlow supports modular Solidity template blueprints, allowing SMEs to deploy contracts instantly without writing code:
1. **Standard SME Commerce Token:** A gas-optimized ERC-20 token supporting adjustable gas fee sponsorship rules.
2. **Yield Compounder Vault:** A contract that accepts USDC, routes it through CCTP, and swaps it into tokenized institutional treasuries (e.g. USYC) to compound yield.
3. **Split Revenue Distributor:** Automatically routes incoming payments into preset proportions (e.g., 90% Admin operations, 10% Arc Gas pool).

---

## 🤖 AI Agent Workforce (Arc Agentic Economy)

BizFlow integrates with the **Arc Agentic Economy** specifications, enabling businesses to delegate operations to autonomous AI agents through secure, on-chain job escrows:

*   **Identity & Reputation (ERC-8004):** AI Agents are verified against persistent registry contracts to inspect performance scores, success rates, and active history logs.
*   **Job Escrow & Settlement (ERC-8183):** Governs gig agreements where USDC fees are locked securely in an escrow contract and disbursed automatically once a neutral Evaluator Oracle confirms completion of the deliverables (IPFS proof hash).

### On-Chain Transaction Hook:
When using a connected web3 browser wallet (e.g. MetaMask, Rainbow) in the dashboard, initiating an agent job requests a real USDC signature to transfer funds to the escrow target address:
*   **Escrow Contract Address:** `0x8183E5c700000000000000000000000000000000` (on Arc Testnet)
*   **Asset:** USDC (6 decimals, address `0x3600000000000000000000000000000000000000`)

---

## 📖 REST API Endpoints Reference

### 1. Smart Contract Deployment
* **POST `/templates/:templateId/deploy`** - Deploys a selected smart contract template.
  * *Request Body:* `{ "name": "SME Token", "symbol": "SMET" }`
  * *Response Body:*
    ```json
    {
      "success": true,
      "idempotencyKey": "idem-941a87b2",
      "status": "pending",
      "txHash": "0x51c7..."
    }
    ```
* **GET `/templates/:templateId/status`** - Polls deployment compilation and broadcasting status.

### 2. Payments & Payouts
* **POST `/api/payments`** - Executes scheduled or batch payouts.
  * *Request Body (Batch):* 
    ```json
    { 
      "action": "batch", 
      "recipients": [
        { "address": "0x37648342410a82be0a8276f5713437e9081a3e51", "amount": "15.00" },
        { "address": "0x82f1ed2b3a4a0c8b93d48e89f81a7b0f81d1a932", "amount": "10.00" }
      ] 
    }
    ```

### 3. Treasury Yield Swap
* **POST `/api/treasury`** - Converts idle stablecoins into interest-bearing yield tokens.
  * *Request Body:* `{ "action": "swap", "amount": "1000", "fromToken": "USDC", "toToken": "USYC" }`

### 4. AI Agent Escrow
* **POST `/api/agents/escrow`** - Locks USDC in an ERC-8183 Job Escrow contract.
  * *Request Body:* `{ "agent": "0x7e8...", "amount": "10.00", "taskDescription": "Reconcile Q1 corporate expense sheet" }`
  * *Response Body:*
    ```json
    {
      "success": true,
      "txHash": "0x8183...",
      "status": "settled"
    }
    ```

---

## 📡 Webhook Event Specifications

BizFlow supports cryptographically signed webhook notifications to keep B2B ERP and accounting databases in sync:

### Event: `payment.succeeded`
Dispatched when a retail customer successfully completes a payment through the checkout widget.
```json
{
  "event": "payment.succeeded",
  "id": "evt_91b72a4d",
  "timestamp": "2026-05-20T13:22:31Z",
  "data": {
    "merchant": "BizFlow SME",
    "amount": "25.00",
    "currency": "USDC",
    "transactionHash": "0x36b7cf918a28...",
    "network": "Arc Testnet"
  }
}
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js** (v18.0.0 or higher)
* **npm** or **yarn**

### Installation & Run

1. Clone the repository and navigate to the directory:
   ```bash
   cd track-2-BizFlow
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local and add your MERCHANT_PRIVATE_KEY (optional, enables real on-chain execution)
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser. Use `Ctrl+K` to search the API portal, or trigger sandbox deposits in real-time.

---

## ⛓️ Trade Finance Smart Contracts

BizFlow includes purpose-built Solidity smart contracts for B2B trade finance operations on Arc Testnet:

### BizFlowEscrow.sol — Milestone-Based USDC Escrow

A production-grade escrow contract enabling milestone-based fund release for procurement workflows:

```solidity
// Core functions
function createDeal(address seller, uint256[] milestoneAmounts, string description) → dealId
function completeMilestone(uint256 dealId, uint256 milestoneIndex, bytes32 proofHash)
function raiseDispute(uint256 dealId)
function cancelDeal(uint256 dealId)

// Events: DealCreated, DealFunded, MilestoneCompleted, FundsReleased, DisputeRaised
```

**Key Design Decisions:**
- **Milestone-based release** prevents all-or-nothing risk — funds unlock progressively as deliverables are verified
- **Proof hashes** (IPFS/document hashes) stored on-chain for audit trails
- **Dispute mechanism** freezes releases pending admin resolution
- **Max 10 milestones** per deal to bound gas costs

### BizFlowInvoice.sol — Three-Way Matching Invoice System

An on-chain invoice management system with procurement three-way matching:

```solidity
// Core functions
function createInvoice(buyer, amount, dueDate, description, purchaseOrderRef, earlyPayDiscount) → invoiceId
function approveInvoice(invoiceId, goodsReceiptRef)  // Three-way match: PO + Receipt + Invoice
function settleInvoice(invoiceId)                      // USDC settlement with early-pay discount
function batchSettle(invoiceIds[])                      // Gas-optimized batch settlement

// Events: InvoiceCreated, InvoiceApproved, InvoiceSettled, BatchSettled, ThreeWayMatchVerified
```

**Key Design Decisions:**
- **Three-way matching** (Purchase Order → Goods Receipt → Invoice) verifies trade authenticity
- **Early payment discounts** (up to 10% in basis points) incentivize faster settlement
- **Batch settlement** processes up to 20 invoices in a single transaction

---

## 🔗 Circle SDK Deep Integration

BizFlow uses Circle's developer infrastructure at every layer of the stack:

### @circle-fin/app-kit — Send, Bridge, Swap

```typescript
// Real App Kit Send (POST /api/appkit/send)
import { AppKit } from "@circle-fin/app-kit";
import { createViemAdapterFromPrivateKey } from "@circle-fin/adapter-viem-v2";

const kit = new AppKit();
const adapter = createViemAdapterFromPrivateKey({ privateKey });
await kit.send({
  from: { adapter, chain: "Arc_Testnet" },
  to: recipientAddress,
  amount: "100.00",
  token: "USDC",
});

// Real App Kit Bridge via CCTP V2 (POST /api/appkit/bridge)
await kit.bridge({
  from: { adapter, chain: "Ethereum_Sepolia" },
  to: { adapter, chain: "Arc_Testnet" },
  amount: "50.00",
});

// Real App Kit Swap (POST /api/appkit/swap)
await kit.swap({
  from: { adapter, chain: "Arc_Testnet" },
  tokenIn: "USDC",
  tokenOut: "EURC",
  amountIn: "500.00",
});
```

### @circle-fin/adapter-viem-v2 — Wallet Adapter

The Viem adapter bridges Circle's App Kit with the viem ecosystem, supporting both private key and browser wallet configurations:

```typescript
// Server-side: Private key adapter
const adapter = createViemAdapterFromPrivateKey({
  privateKey: process.env.MERCHANT_PRIVATE_KEY,
});

// Client-side: Browser wallet adapter
const adapter = await createViemAdapterFromProvider({
  provider: window.ethereum,
});
```

### viem/chains — Arc Testnet Chain Definition

```typescript
// Standard import — no custom chain definition needed
import { arcTestnet } from "viem/chains";
// Chain ID: 5042002, Native Currency: USDC (18 decimals for gas)
```

---

## 💬 Circle Product Feedback

BizFlow utilizes the comprehensive Circle Developer Platform to deliver professional, automated trade treasury products. Below is our developer experience feedback for each product integrated:

### 1. USDC
* **What Worked Well:** The stability, high liquidity, and widespread adoption of USDC make it the ideal settlement currency for SME commerce. Integrating USDC on Arc Testnet allows developers to enjoy native gas transactions, removing the need for a volatile gas token and simplifying accounting.
* **What Could Be Improved:** No native issues. Maintaining 6 decimals for ERC-20 transfers but 18 decimals for Arc Gas parameters can occasionally cause integration friction during unit translations. A uniform helper library for decimal conversion across chains would improve DevEx.

### 2. App Kit (`@circle-fin/app-kit`)
* **What Worked Well:** The unified API format for sending, swapping, and bridging is a major improvement over manually managing separate libraries. Reusing a single wallet adapter via `createViemAdapterFromPrivateKey` accelerates backend integrations.
* **What Could Be Improved:** Type schemas evolved across major versions (e.g. swap parameters structure changing to nested adapters). Keep documentation inline with the latest NPM releases, particularly detail parameters like `estimatedOutput`.

### 3. CCTP (Cross-Chain Transfer Protocol)
* **What Worked Well:** Providing native, non-custodial bridging of USDC across EVM chains (e.g. Base to Arc) without utilizing third-party wrapped liquidity bridges. This ensures security of treasury allocations.
* **What Could Be Improved:** Transaction propagation times across networks can be unpredictable during high congestion. An SDK event stream for tracking the exact CCTP state machine phases (burn -> attest -> mint) would help construct better frontend progress indicators.

### 4. Developer-Controlled & User-Controlled Wallets
* **What Worked Well:** Exceptional security for API key signatures, and seamless wallet creation on the server side using the `@circle-fin/modular-wallets-core` framework. Zero-gas user transactions and biometric passkeys streamline checkout flows.
* **What Could Be Improved:** Initial setup of webhook notifications and challenge handshakes for programmatic wallets has a steep learning curve. Clearer end-to-end sandbox walkthrough code snippets would reduce onboarding time.

### 5. Gateway (Gateway API & Nanopayments)
* **What Worked Well:** Sub-cent payment channels allow micro-billing capabilities. Implementing the `x402` HTTP payment protocol allows automated agent tools to authorize payouts dynamically per call without signing manual metamask popups.
* **What Could Be Improved:** Gateway sandbox rates and balance sync delays can occur. Direct documentation of local simulation tools for offline testing would speed up channel development.

### 6. StableFX API
* **What Worked Well:** Providing institutional rate quotes and executing seamless EURC <-> USDC on-chain swaps. This facilitates frictionless multi-currency B2B trade pipelines.
* **What Could Be Improved:** Access to the live StableFX API is gated behind enterprise KYC checks. Providing a standard testnet endpoint with a sandbox rate feed open to public developers would enhance hackathon and prototype flows.

### 7. Nanopayments
* **What Worked Well:** Settled high-frequency micro-payments ($0.00005 USDC) on-chain instantly, enabling live API billing.
* **What Could Be Improved:** The process of depositing and withdrawing from a nanopayment channel is heavily dependent on specific precompiles. Prebuilt client hooks in the Web SDK to manage channel state variables would be useful.

---

## 📦 Dependency Matrix

| Package | Version | Purpose |
|---------|---------|---------|
| `@circle-fin/app-kit` | latest | Send, Bridge, Swap, Unified Balance SDK |
| `@circle-fin/adapter-viem-v2` | latest | Viem wallet adapter for App Kit |
| `@circle-fin/w3s-pw-web-sdk` | latest | User-Controlled Wallets (checkout widget) |
| `viem` | 2.50.4 | EVM client library (includes `arcTestnet` chain) |
| `wagmi` | latest | React hooks for Ethereum |
| `@rainbow-me/rainbowkit` | latest | Wallet connection UI |
| `@tanstack/react-query` | latest | Async state management |
| `next` | 14.x | App Router framework |

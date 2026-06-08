# Circle StableFX Integration & Access Status

This document explains the integration flow for the StableFX currency-conversion procurement pipeline ("Pay-in-EURC, Settle-in-USDC") and documents the status of the StableFX enterprise access request.

## Access Status
*   **Access Tier**: Requested / Gated (Enterprise Access Pending Approval)
*   **Requested Date**: 2026-06-08
*   **Status Description**: StableFX is a gated institutional product requiring KYB verification from Circle. To maintain application execution flow in the sandbox/testnet environment, a fallback architecture has been implemented. If the Circle App Kit (`kit.estimateSwap` or `kit.swap`) fails or credentials are not present, the system activates a simulated proxy modeling with an accurate EURC/USDC exchange rate (1.0925).

---

## Technical Integration Details

The flow uses the **Circle App Kit** (`@circle-fin/app-kit`) for executing stablecoin swaps.

### 1. API Route (`src/app/api/appkit/stablefx/route.ts`)
- **Estimating Price Quotes**:
  ```typescript
  const estimate = await kit.estimateSwap({
    adapter,
    chain: "Arc_Testnet",
    amount,
    fromToken: "EURC",
    toToken: "USDC",
  });
  ```
- **Executing Trades**:
  ```typescript
  const txReceipt = await kit.swap({
    adapter,
    chain: "Arc_Testnet",
    amount,
    fromToken: "EURC",
    toToken: "USDC",
  });
  ```

### 2. Multi-Currency Checkout Widget (`src/app/widget/checkout/page.tsx`)
- Supports dynamic selector options for EURC and USDC.
- Instantly estimates converted settlement amount from the backend StableFX quote endpoint.
- Routes payments denominated in EURC through the backend swap route with `execute: true` to trigger the App Kit trade execution on-chain.

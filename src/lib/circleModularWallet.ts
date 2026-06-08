import { createPublicClient, http, defineChain } from "viem";
import { createBundlerClient, toWebAuthnAccount } from "viem/account-abstraction";
import {
  toCircleSmartAccount,
  toModularTransport,
  toPasskeyTransport,
  toWebAuthnCredential,
  WebAuthnMode,
} from "@circle-fin/modular-wallets-core";

// Define Arc Testnet custom chain config
export const arcTestnet = defineChain({
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 6 },
  rpcUrls: {
    default: { http: ["https://rpc.testnet.arc.network"] },
  },
  blockExplorers: {
    default: { name: "ArcScan", url: "https://testnet.arcscan.app" },
  },
});

export class CircleModularWalletClient {
  private clientKey: string;
  private clientUrl: string;

  constructor() {
    this.clientKey =
      process.env.NEXT_PUBLIC_CIRCLE_CLIENT_KEY ||
      process.env.CIRCLE_CLIENT_KEY ||
      "mock_client_key_for_sandbox_bizflow";
    this.clientUrl =
      process.env.NEXT_PUBLIC_CIRCLE_CLIENT_URL ||
      process.env.CIRCLE_CLIENT_URL ||
      "https://modular-sdk.circle.com/v1/rpc/w3s/buidl";
  }

  /**
   * Register a new passkey credential and construct the smart contract account
   */
  async createPasskeyWallet(username: string, options?: { mode?: WebAuthnMode }) {
    if (typeof window === "undefined") {
      throw new Error("createPasskeyWallet can only be called in the browser context.");
    }

    const mode = options?.mode || WebAuthnMode.Register;

    // 1. Configure Passkey Transport
    const passkeyTransport = toPasskeyTransport(this.clientUrl, this.clientKey);

    // 2. Perform WebAuthn browser challenge
    const credential = await toWebAuthnCredential({
      transport: passkeyTransport,
      mode,
      username,
    });

    // 3. Configure Modular Transport for Arc Testnet
    const modularTransport = toModularTransport(
      `${this.clientUrl}/arcTestnet`,
      this.clientKey
    );

    // 4. Initialize clients
    const publicClient = createPublicClient({
      chain: arcTestnet,
      transport: modularTransport,
    });

    // 5. Initialize the smart contract account
    const smartAccount = await toCircleSmartAccount({
      client: publicClient,
      owner: toWebAuthnAccount({ credential }),
      name: username,
    });

    return {
      smartAccount,
      credential,
      address: smartAccount.address,
    };
  }

  /**
   * Submit a sponsored UserOperation through the Bundler with paymaster enabled
   */
  async sendGaslessTransaction(
    smartAccount: any,
    calls: Array<{ to: `0x${string}`; value?: bigint; data?: `0x${string}` }>
  ) {
    // 1. Configure Modular Transport for Arc Testnet
    const modularTransport = toModularTransport(
      `${this.clientUrl}/arcTestnet`,
      this.clientKey
    );

    // 2. Initialize Bundler Client
    const bundlerClient = createBundlerClient({
      chain: arcTestnet,
      transport: modularTransport,
    });

    // 3. Submit sponsored transaction via Paymaster
    const userOpHash = await bundlerClient.sendUserOperation({
      account: smartAccount,
      calls,
      paymaster: true, // Sponsors gas using Circle's Gas Station / Paymaster
    });

    return userOpHash;
  }
}

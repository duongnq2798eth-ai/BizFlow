import { NextRequest, NextResponse } from "next/server";
import { saveMerchant } from "@/lib/supabase";
import { generatePrivateKey } from "viem/accounts";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessName, walletAddress, industry, feeSplitPercent } = body;

    if (!businessName || !walletAddress || !industry) {
      return NextResponse.json(
        { error: "businessName, walletAddress, and industry are required" },
        { status: 400 }
      );
    }

    const merchantId = "merch_" + Math.random().toString(36).substring(2, 12);
    // Generate a secure API Key prefixed for BizFlow
    const apiKey = "bf_live_" + Array.from({ length: 32 }, () => Math.floor(Math.random() * 36).toString(36)).join("");
    
    // Default fee policy or custom splitting config
    const feePolicy = JSON.stringify({
      adminSplitPercent: feeSplitPercent || "1.0",
      industry,
      feePayer: "merchant"
    });

    const merchant = {
      id: merchantId,
      name: businessName,
      wallet_address: walletAddress.toLowerCase(),
      api_key: apiKey,
      fee_policy: feePolicy
    };

    await saveMerchant(merchant);

    return NextResponse.json({
      success: true,
      merchantId,
      businessName,
      walletAddress: walletAddress.toLowerCase(),
      apiKey,
      feeSplitPercent: feeSplitPercent || "1.0",
      message: "Merchant registered successfully with customized fee split policies."
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to register merchant" },
      { status: 500 }
    );
  }
}

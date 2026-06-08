import { NextRequest, NextResponse } from "next/server";
import { getMerchants, saveMerchant } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const merchants = await getMerchants();
    return NextResponse.json({
      success: true,
      merchants
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch merchants list" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { merchantId } = body;

    if (!merchantId) {
      return NextResponse.json(
        { error: "merchantId is required" },
        { status: 400 }
      );
    }

    const merchants = await getMerchants();
    const targetMerchant = merchants.find((m) => m.id === merchantId);

    if (!targetMerchant) {
      return NextResponse.json(
        { error: "Merchant not found" },
        { status: 404 }
      );
    }

    // Generate a fresh key
    const newApiKey = "bf_live_" + Array.from({ length: 32 }, () => Math.floor(Math.random() * 36).toString(36)).join("");
    
    const updatedMerchant = {
      ...targetMerchant,
      api_key: newApiKey
    };

    await saveMerchant(updatedMerchant);

    return NextResponse.json({
      success: true,
      merchantId,
      apiKey: newApiKey,
      message: "API key regenerated successfully. Revoked all previous sessions."
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to regenerate API key" },
      { status: 500 }
    );
  }
}

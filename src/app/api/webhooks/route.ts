import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { webhookUrl, eventType } = body;

    if (!webhookUrl) {
      return NextResponse.json(
        { error: "webhookUrl is required" },
        { status: 400 }
      );
    }

    const payload = {
      id: "evt_" + Math.random().toString(36).substring(2, 12),
      object: "event",
      type: eventType || "payment.succeeded",
      created: Math.floor(Date.now() / 1000),
      data: {
        id: "tx_" + Math.random().toString(36).substring(2, 10),
        amount: eventType === "payment.succeeded" ? "25.00" : eventType === "credit.approved" ? "15000.00" : "5.00",
        currency: "USDC",
        status: "succeeded",
        recipient: "0x" + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
        network: "Arc Testnet"
      }
    };

    let deliveryStatus = "failed";
    let deliveryMessage = "";
    const startTime = Date.now();

    try {
      // Send a real request in background if it's a valid URL, otherwise fake it
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "BizFlow-Webhook-Agent/2.0"
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(3000) // 3 seconds timeout
      });

      deliveryStatus = response.status >= 200 && response.status < 300 ? "success" : "failed";
      deliveryMessage = `Server returned HTTP status ${response.status}`;
    } catch (e: any) {
      deliveryStatus = "failed";
      deliveryMessage = `Network error: ${e.message || "Timeout"}`;
    }

    return NextResponse.json({
      success: deliveryStatus === "success",
      deliveryStatus,
      deliveryMessage,
      responseTimeMs: Date.now() - startTime,
      sentPayload: payload
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to process webhook test" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { saveWebhookSubscription, getWebhookSubscriptions, saveDeliveryAttempt } from "@/lib/supabase";
import crypto from "crypto";

export const dynamic = "force-dynamic";

// Programmatic Event Monitor Subscription helper via Circle API
async function subscribeToCircleEventMonitoring() {
  const apiKey = process.env.CIRCLE_API_KEY;
  if (!apiKey) {
    console.log("[Circle Event Monitoring] No CIRCLE_API_KEY set, skipping on-chain subscriptions.");
    return;
  }

  const invoiceContract = process.env.INVOICE_CONTRACT_ADDRESS;
  const escrowContract = process.env.ESCROW_CONTRACT_ADDRESS;

  if (!invoiceContract && !escrowContract) {
    console.log("[Circle Event Monitoring] No contract addresses configured for monitoring.");
    return;
  }

  console.log("[Circle Event Monitoring] Subscribing to contract events via Circle API...");

  const contractsToMonitor = [
    { address: invoiceContract, name: "BizFlowInvoice", events: ["InvoiceSettled"] },
    { address: escrowContract, name: "BizFlowEscrow", events: ["DealCreated", "MilestoneCompleted"] }
  ].filter(c => c.address);

  for (const item of contractsToMonitor) {
    try {
      // 1. Import contract to Circle Smart Contract Platform
      console.log(`[Circle Event Monitoring] Importing contract ${item.name} at ${item.address}`);
      const importRes = await fetch("https://api.circle.com/v1/contracts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          address: item.address,
          blockchain: "arc-testnet",
          name: item.name
        })
      });
      const importData = await importRes.json();
      console.log(`[Circle Event Monitoring] Import response:`, importData);

      // 2. Create monitors for each event
      for (const ev of item.events) {
        console.log(`[Circle Event Monitoring] Subscribing monitor for: ${ev}`);
        const monitorRes = await fetch("https://api.circle.com/v1/event-monitoring/subscriptions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            contractAddress: item.address,
            blockchain: "arc-testnet",
            eventName: ev
          })
        });
        const monitorData = await monitorRes.json();
        console.log(`[Circle Event Monitoring] Subscription result for ${ev}:`, monitorData);
      }
    } catch (err: any) {
      console.error(`[Circle Event Monitoring] Error processing subscription for ${item.name}:`, err.message);
    }
  }
}

// Deliver Webhook with HMAC Signature & 3 Retries (Exponential Backoff)
async function deliverWebhookWithRetry(webhookUrl: string, secret: string, payload: any) {
  const payloadStr = JSON.stringify(payload);
  // Sign payload
  const signature = crypto.createHmac("sha256", secret).update(payloadStr).digest("hex");

  const maxAttempts = 4; // 1 initial + 3 retries
  let attempt = 0;
  let success = false;
  let responseCode = 0;
  let status = "failed";
  let responseMessage = "";

  while (attempt < maxAttempts) {
    attempt++;
    const attemptId = "att_" + crypto.randomBytes(6).toString("hex");

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "BizFlow-Webhook-Agent/2.0",
          "X-BizFlow-Signature": signature
        },
        body: payloadStr,
        signal: AbortSignal.timeout(3000) // 3 seconds timeout
      });

      responseCode = response.status;
      success = response.status >= 200 && response.status < 300;
      status = success ? "success" : "failed";
      responseMessage = `Server returned HTTP status ${response.status}`;
    } catch (e: any) {
      responseCode = 500;
      status = "failed";
      responseMessage = `Network error: ${e.message || "Timeout"}`;
    }

    // Persist delivery attempt in database
    await saveDeliveryAttempt({
      id: attemptId,
      webhook_id: payload.id,
      status: status,
      response_code: responseCode
    });

    if (success) {
      break;
    }

    // Exponential Backoff retry delay (e.g. 1s, 2s, 4s)
    if (attempt < maxAttempts) {
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  return { success, lastStatus: status, lastCode: responseCode, lastMessage: responseMessage };
}

export async function GET(request: NextRequest) {
  try {
    const list = await getWebhookSubscriptions();
    return NextResponse.json({ success: true, subscriptions: list });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 1. Check if it is a Circle Event Monitoring notification or a simulated webhook trigger
    const isCircleNotification = body.notificationType === "contracts.eventLog" || body.type === "contracts.eventLog";
    
    // 2. Check if it is an internal route trigger
    const isInternalTrigger = body.eventType && !body.webhookUrl;

    if (isCircleNotification) {
      const notification = body.notification || {};
      const eventName = notification.eventName; // DealCreated, MilestoneCompleted, InvoiceSettled

      if (!eventName) {
        return NextResponse.json({ error: "Missing eventName in notification" }, { status: 400 });
      }

      console.log(`[Webhook Receiver] Received Circle Event Monitoring Notification: ${eventName}`);

      // Map eventName to our subscription events
      let mappedEvent = "";
      if (eventName === "DealCreated") mappedEvent = "escrow.deal.created";
      else if (eventName === "MilestoneCompleted") mappedEvent = "escrow.milestone.completed";
      else if (eventName === "InvoiceSettled") mappedEvent = "invoice.settled";
      else mappedEvent = eventName.toLowerCase();

      // Retrieve active merchant subscriptions
      const subscriptions = await getWebhookSubscriptions();
      const matchedSubs = subscriptions.filter((sub: any) => {
        const events = Array.isArray(sub.events) ? sub.events : [];
        return events.includes(mappedEvent) || events.includes(eventName);
      });

      console.log(`[Webhook Receiver] Forwarding to ${matchedSubs.length} matching merchant subscription(s).`);

      for (const sub of matchedSubs) {
        const payload = {
          id: "evt_" + crypto.randomBytes(6).toString("hex"),
          object: "event",
          type: mappedEvent,
          created: Math.floor(Date.now() / 1000),
          data: {
            contractAddress: notification.contractAddress || "",
            txHash: notification.txHash || "",
            blockchain: notification.blockchain || "arc-testnet",
            eventName: eventName,
            details: notification.eventDetails || notification.data || {}
          }
        };

        const secret = sub.secret || "whsec_" + crypto.randomBytes(8).toString("hex");
        // Forward asynchronously to avoid blocking the receiver
        deliverWebhookWithRetry(sub.url, secret, payload).catch(err => {
          console.error(`[Webhook Forwarder] Forward failed for ${sub.url}:`, err);
        });
      }

      return NextResponse.json({ success: true, message: "Notification processed and forwarded" });
    }

    if (isInternalTrigger) {
      const { eventType, data } = body;
      console.log(`[Webhook Receiver] Received internal event trigger: ${eventType}`);

      const subscriptions = await getWebhookSubscriptions();
      const matchedSubs = subscriptions.filter((sub: any) => {
        const events = Array.isArray(sub.events) ? sub.events : [];
        return events.includes(eventType);
      });

      for (const sub of matchedSubs) {
        const payload = {
          id: "evt_" + crypto.randomBytes(6).toString("hex"),
          object: "event",
          type: eventType,
          created: Math.floor(Date.now() / 1000),
          data: data
        };

        const secret = sub.secret || "whsec_" + crypto.randomBytes(8).toString("hex");
        deliverWebhookWithRetry(sub.url, secret, payload).catch(err => {
          console.error(`[Webhook Forwarder] Internal forward failed:`, err);
        });
      }

      return NextResponse.json({ success: true, message: "Internal event dispatched to subscriptions" });
    }

    // 3. Otherwise: Developer Playground manual test webhook delivery
    const { webhookUrl, eventType } = body;

    if (!webhookUrl) {
      return NextResponse.json(
        { error: "webhookUrl is required for test webhook delivery" },
        { status: 400 }
      );
    }

    // Look up existing subscription url to reuse secret or create a new secret
    const subscriptions = await getWebhookSubscriptions();
    const existingSub = subscriptions.find((s: any) => s.url === webhookUrl);
    const secret = existingSub?.secret || "whsec_" + crypto.randomBytes(8).toString("hex");

    const payload = {
      id: "evt_" + crypto.randomBytes(6).toString("hex"),
      object: "event",
      type: eventType || "payment.succeeded",
      created: Math.floor(Date.now() / 1000),
      data: {
        id: "tx_" + crypto.randomBytes(5).toString("hex"),
        amount: eventType === "payment.succeeded" ? "25.00" : eventType === "credit.approved" ? "15000.00" : "5.00",
        currency: "USDC",
        status: "succeeded",
        recipient: "0x" + crypto.randomBytes(20).toString("hex"),
        network: "Arc Testnet"
      }
    };

    const startTime = Date.now();
    const result = await deliverWebhookWithRetry(webhookUrl, secret, payload);

    // Persist/update the webhook subscription with the secret key generated
    await saveWebhookSubscription({
      id: payload.id,
      merchant_id: "merchant_1",
      url: webhookUrl,
      events: [payload.type],
      secret: secret
    });

    // Attempt Circle event monitor subscription in the background
    subscribeToCircleEventMonitoring().catch(err => {
      console.warn("[Circle Event Monitoring] Background subscription error:", err);
    });

    return NextResponse.json({
      success: result.success,
      deliveryStatus: result.lastStatus,
      deliveryMessage: result.lastMessage,
      responseTimeMs: Date.now() - startTime,
      sentPayload: payload
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to process webhook" },
      { status: 500 }
    );
  }
}

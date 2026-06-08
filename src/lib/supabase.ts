import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Server-only Local Storage Fallback for Sandbox / Simulation Mode
export interface LocalDbSchema {
  merchants: any[];
  invoices: any[];
  escrow_deals: any[];
  payments: any[];
  webhook_subscriptions: any[];
  delivery_attempts: any[];
}

const defaultDb: LocalDbSchema = {
  merchants: [],
  invoices: [],
  escrow_deals: [],
  payments: [],
  webhook_subscriptions: [],
  delivery_attempts: []
};

const getLocalDbPath = () => {
  if (typeof window !== "undefined") return "";
  try {
    const fs = require("fs");
    const path = require("path");
    const projectRoot = process.cwd();
    const dbDir = path.join(projectRoot, ".gemini-mock-db");
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    return path.join(dbDir, "db.json");
  } catch (err) {
    console.error("Failed to resolve local DB path:", err);
    return "";
  }
};

export function readLocalDb(): LocalDbSchema {
  if (typeof window !== "undefined") return defaultDb;
  try {
    const fs = require("fs");
    const dbPath = getLocalDbPath();
    if (!dbPath) return defaultDb;
    if (!fs.existsSync(dbPath)) {
      fs.writeFileSync(dbPath, JSON.stringify(defaultDb, null, 2), "utf8");
      return defaultDb;
    }
    const data = fs.readFileSync(dbPath, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Failed to read local mock DB:", err);
    return defaultDb;
  }
}

export function writeLocalDb(data: LocalDbSchema) {
  if (typeof window !== "undefined") return;
  try {
    const fs = require("fs");
    const dbPath = getLocalDbPath();
    if (!dbPath) return;
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to write to local mock DB:", err);
  }
}

// ==================== DATABASE HELPERS (SUPABASE / FALLBACK) ====================

// 1. MERCHANTS
export async function saveMerchant(merchant: { id: string; name: string; wallet_address?: string; api_key?: string; fee_policy?: string }) {
  const payload = {
    ...merchant,
    created_at: new Date().toISOString()
  };

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from("merchants").upsert(payload);
    if (!error) return payload;
    console.warn("Supabase upsert merchant failed, using local DB:", error);
  }

  const db = readLocalDb();
  const index = db.merchants.findIndex((m) => m.id === merchant.id);
  if (index >= 0) {
    db.merchants[index] = { ...db.merchants[index], ...payload };
  } else {
    db.merchants.push(payload);
  }
  writeLocalDb(db);
  return payload;
}

export async function getMerchants() {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from("merchants").select("*").order("created_at", { ascending: false });
    if (!error && data) return data;
    console.warn("Supabase fetch merchants failed, using local DB:", error);
  }
  return readLocalDb().merchants;
}

// 2. INVOICES
export async function saveInvoice(invoice: { id: string; on_chain_id?: string; supplier: string; buyer: string; amount: string; status: string; tx_hash?: string }) {
  const payload = {
    ...invoice,
    created_at: new Date().toISOString()
  };

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from("invoices").upsert(payload);
    if (!error) return payload;
    console.warn("Supabase upsert invoice failed, using local DB:", error);
  }

  const db = readLocalDb();
  const index = db.invoices.findIndex((i) => i.id === invoice.id || (invoice.on_chain_id && i.on_chain_id === invoice.on_chain_id));
  if (index >= 0) {
    db.invoices[index] = { ...db.invoices[index], ...payload };
  } else {
    db.invoices.push(payload);
  }
  writeLocalDb(db);
  return payload;
}

export async function getInvoices() {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from("invoices").select("*").order("created_at", { ascending: false });
    if (!error && data) return data;
    console.warn("Supabase fetch invoices failed, using local DB:", error);
  }
  return readLocalDb().invoices;
}

// 3. ESCROW DEALS
export async function saveEscrowDeal(deal: { id: string; on_chain_id?: string; buyer: string; seller: string; total_amount: string; status: string; tx_hash?: string }) {
  const payload = {
    ...deal,
    created_at: new Date().toISOString()
  };

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from("escrow_deals").upsert(payload);
    if (!error) return payload;
    console.warn("Supabase upsert escrow failed, using local DB:", error);
  }

  const db = readLocalDb();
  const index = db.escrow_deals.findIndex((e) => e.id === deal.id || (deal.on_chain_id && e.on_chain_id === deal.on_chain_id));
  if (index >= 0) {
    db.escrow_deals[index] = { ...db.escrow_deals[index], ...payload };
  } else {
    db.escrow_deals.push(payload);
  }
  writeLocalDb(db);
  return payload;
}

export async function getEscrowDeals() {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from("escrow_deals").select("*").order("created_at", { ascending: false });
    if (!error && data) return data;
    console.warn("Supabase fetch escrow failed, using local DB:", error);
  }
  return readLocalDb().escrow_deals;
}

// 4. PAYMENTS / PAYOUTS
export async function savePayment(payment: { id: string; type: string; recipients: any; total_amount: string; tx_hash?: string; batch_id?: string }) {
  const payload = {
    ...payment,
    created_at: new Date().toISOString()
  };

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from("payments").upsert(payload);
    if (!error) return payload;
    console.warn("Supabase upsert payment failed, using local DB:", error);
  }

  const db = readLocalDb();
  const index = db.payments.findIndex((p) => p.id === payment.id);
  if (index >= 0) {
    db.payments[index] = { ...db.payments[index], ...payload };
  } else {
    db.payments.push(payload);
  }
  writeLocalDb(db);
  return payload;
}

export async function getPayments() {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from("payments").select("*").order("created_at", { ascending: false });
    if (!error && data) return data;
    console.warn("Supabase fetch payments failed, using local DB:", error);
  }
  return readLocalDb().payments;
}

// 5. WEBHOOK SUBSCRIPTIONS
export async function saveWebhookSubscription(sub: { id: string; merchant_id: string; url: string; events: any; secret?: string }) {
  const payload = {
    ...sub,
    created_at: new Date().toISOString()
  };

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from("webhook_subscriptions").upsert(payload);
    if (!error) return payload;
    console.warn("Supabase upsert webhook failed, using local DB:", error);
  }

  const db = readLocalDb();
  const index = db.webhook_subscriptions.findIndex((w) => w.id === sub.id);
  if (index >= 0) {
    db.webhook_subscriptions[index] = { ...db.webhook_subscriptions[index], ...payload };
  } else {
    db.webhook_subscriptions.push(payload);
  }
  writeLocalDb(db);
  return payload;
}

export async function getWebhookSubscriptions() {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from("webhook_subscriptions").select("*").order("created_at", { ascending: false });
    if (!error && data) return data;
    console.warn("Supabase fetch webhooks failed, using local DB:", error);
  }
  return readLocalDb().webhook_subscriptions;
}

// 6. DELIVERY ATTEMPTS
export async function saveDeliveryAttempt(attempt: { id: string; webhook_id: string; status: string; response_code?: number }) {
  const payload = {
    ...attempt,
    attempted_at: new Date().toISOString()
  };

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from("delivery_attempts").upsert(payload);
    if (!error) return payload;
    console.warn("Supabase upsert delivery attempt failed, using local DB:", error);
  }

  const db = readLocalDb();
  if (!db.delivery_attempts) {
    db.delivery_attempts = [];
  }
  const index = db.delivery_attempts.findIndex((d) => d.id === attempt.id);
  if (index >= 0) {
    db.delivery_attempts[index] = { ...db.delivery_attempts[index], ...payload };
  } else {
    db.delivery_attempts.push(payload);
  }
  writeLocalDb(db);
  return payload;
}

export async function getDeliveryAttempts() {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from("delivery_attempts").select("*").order("attempted_at", { ascending: false });
    if (!error && data) return data;
    console.warn("Supabase fetch delivery attempts failed, using local DB:", error);
  }
  const db = readLocalDb();
  return db.delivery_attempts || [];
}


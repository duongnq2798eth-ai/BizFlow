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
  credit_scores: any[];
  nanopay_channels: any[];
  agents: any[];
  agent_jobs: any[];
}

const defaultDb: LocalDbSchema = {
  merchants: [],
  invoices: [],
  escrow_deals: [],
  payments: [],
  webhook_subscriptions: [],
  delivery_attempts: [],
  credit_scores: [],
  nanopay_channels: [],
  agents: [],
  agent_jobs: []
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

export async function getMerchantByApiKey(apiKey: string) {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from("merchants").select("*").eq("api_key", apiKey).single();
    if (!error && data) return data;
    console.warn("Supabase fetch merchant by api key failed, using local DB:", error);
  }
  const db = readLocalDb();
  return db.merchants.find((m) => m.api_key === apiKey) || null;
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
export async function savePayment(payment: {
  id: string;
  type: string;
  recipients: any;
  total_amount: string;
  tx_hash?: string;
  batch_id?: string;
  admin_fee?: string;
  net_amount?: string;
  merchant_id?: string;
}) {
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

// 7. CREDIT SCORES
export async function saveCreditScore(scoreRecord: {
  company_id: string;
  score: string;
  credit_limit: string;
  interest_rate: string;
  total_volume: string;
  settlements_count: number;
  avg_settlement_time: string;
}) {
  const payload = {
    ...scoreRecord,
    updated_at: new Date().toISOString()
  };

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from("credit_scores").upsert(payload);
    if (!error) return payload;
    console.warn("Supabase upsert credit score failed, using local DB:", error);
  }

  const db = readLocalDb();
  if (!db.credit_scores) {
    db.credit_scores = [];
  }
  const index = db.credit_scores.findIndex((c) => c.company_id === scoreRecord.company_id);
  if (index >= 0) {
    db.credit_scores[index] = { ...db.credit_scores[index], ...payload };
  } else {
    db.credit_scores.push(payload);
  }
  writeLocalDb(db);
  return payload;
}

export async function getCreditScore(companyId: string) {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from("credit_scores").select("*").eq("company_id", companyId).single();
    if (!error && data) return data;
    console.warn("Supabase fetch credit score failed or not found, using local DB:", error);
  }
  
  const db = readLocalDb();
  if (!db.credit_scores) {
    db.credit_scores = [];
  }
  return db.credit_scores.find((c) => c.company_id === companyId) || null;
}

export async function getAllCreditScores() {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from("credit_scores").select("*");
    if (!error && data) return data;
    console.warn("Supabase fetch all credit scores failed, using local DB:", error);
  }
  const db = readLocalDb();
  return db.credit_scores || [];
}

// 8. NANOPAYMENT CHANNELS
export async function saveNanopayChannel(walletAddress: string, balance: string) {
  const payload = {
    wallet_address: walletAddress.toLowerCase(),
    balance,
    updated_at: new Date().toISOString()
  };

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from("nanopay_channels").upsert(payload);
    if (!error) return payload;
    console.warn("Supabase upsert nanopay channel failed, using local DB:", error);
  }

  const db = readLocalDb();
  if (!db.nanopay_channels) {
    db.nanopay_channels = [];
  }
  const index = db.nanopay_channels.findIndex((c) => c.wallet_address === walletAddress.toLowerCase());
  if (index >= 0) {
    db.nanopay_channels[index] = { ...db.nanopay_channels[index], ...payload };
  } else {
    db.nanopay_channels.push({
      ...payload,
      created_at: new Date().toISOString()
    });
  }
  writeLocalDb(db);
  return payload;
}

export async function getNanopayChannel(walletAddress: string) {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from("nanopay_channels").select("*").eq("wallet_address", walletAddress.toLowerCase()).single();
    if (!error && data) return data;
    console.warn("Supabase fetch nanopay channel failed or not found, using local DB:", error);
  }

  const db = readLocalDb();
  if (!db.nanopay_channels) {
    db.nanopay_channels = [];
  }
  return db.nanopay_channels.find((c) => c.wallet_address === walletAddress.toLowerCase()) || null;
}

// 9. AGENT REGISTRY & IDENTITY
export async function saveAgent(agent: { agent_id: string; name: string; capabilities: string; wallet_address: string; private_key?: string; reputation_score: number; registry_tx_hash?: string }) {
  const payload = {
    ...agent,
    agent_id: agent.agent_id.toLowerCase(),
    updated_at: new Date().toISOString()
  };

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from("agents").upsert(payload);
    if (!error) return payload;
    console.warn("Supabase upsert agent failed, using local DB:", error);
  }

  const db = readLocalDb();
  if (!db.agents) {
    db.agents = [];
  }
  const index = db.agents.findIndex((c) => c.agent_id === agent.agent_id.toLowerCase());
  if (index >= 0) {
    db.agents[index] = { ...db.agents[index], ...payload };
  } else {
    db.agents.push({
      ...payload,
      created_at: new Date().toISOString()
    });
  }
  writeLocalDb(db);
  return payload;
}

export async function getAgentRecord(agentId: string) {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from("agents").select("*").eq("agent_id", agentId.toLowerCase()).single();
    if (!error && data) return data;
    console.warn("Supabase fetch agent failed, using local DB:", error);
  }

  const db = readLocalDb();
  if (!db.agents) {
    db.agents = [];
  }
  return db.agents.find((c) => c.agent_id === agentId.toLowerCase()) || null;
}

export async function getAllAgents() {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from("agents").select("*");
    if (!error && data) return data;
    console.warn("Supabase fetch all agents failed, using local DB:", error);
  }

  const db = readLocalDb();
  if (!db.agents) {
    db.agents = [];
  }
  return db.agents;
}

export async function saveAgentJob(job: { id: string; agent_id: string; amount: string; description: string; status: string; escrow_tx_hash?: string; settle_tx_hash?: string; reputation_tx_hash?: string; score?: number }) {
  const payload = {
    ...job,
    updated_at: new Date().toISOString()
  };

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from("agent_jobs").upsert(payload);
    if (!error) return payload;
    console.warn("Supabase upsert agent job failed, using local DB:", error);
  }

  const db = readLocalDb();
  if (!db.agent_jobs) {
    db.agent_jobs = [];
  }
  const index = db.agent_jobs.findIndex((c) => c.id === job.id);
  if (index >= 0) {
    db.agent_jobs[index] = { ...db.agent_jobs[index], ...payload };
  } else {
    db.agent_jobs.push({
      ...payload,
      created_at: new Date().toISOString()
    });
  }
  writeLocalDb(db);
  return payload;
}



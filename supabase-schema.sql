-- BizFlow Database Schema for Supabase

-- Merchants Table
CREATE TABLE IF NOT EXISTS merchants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  wallet_address TEXT,
  api_key TEXT,
  fee_policy TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  on_chain_id TEXT,
  supplier TEXT NOT NULL,
  buyer TEXT NOT NULL,
  amount TEXT NOT NULL,
  status TEXT NOT NULL,
  tx_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Escrow Deals Table
CREATE TABLE IF NOT EXISTS escrow_deals (
  id TEXT PRIMARY KEY,
  on_chain_id TEXT,
  buyer TEXT NOT NULL,
  seller TEXT NOT NULL,
  total_amount TEXT NOT NULL,
  status TEXT NOT NULL,
  tx_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Payouts / Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  recipients JSONB,
  total_amount TEXT NOT NULL,
  tx_hash TEXT,
  batch_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Webhook Subscriptions Table
CREATE TABLE IF NOT EXISTS webhook_subscriptions (
  id TEXT PRIMARY KEY,
  merchant_id TEXT NOT NULL,
  url TEXT NOT NULL,
  events JSONB,
  secret TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Webhook Delivery Attempts Table
CREATE TABLE IF NOT EXISTS delivery_attempts (
  id TEXT PRIMARY KEY,
  webhook_id TEXT NOT NULL,
  status TEXT NOT NULL,
  response_code INTEGER,
  attempted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Credit Scores Cache Table
CREATE TABLE IF NOT EXISTS credit_scores (
  company_id TEXT PRIMARY KEY,
  score TEXT NOT NULL,
  credit_limit TEXT NOT NULL,
  interest_rate TEXT NOT NULL,
  total_volume TEXT NOT NULL,
  settlements_count INTEGER NOT NULL,
  avg_settlement_time TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


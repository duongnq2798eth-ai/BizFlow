export interface LogEntry {
  timestamp: string;
  type: "info" | "success" | "warning" | "error" | "input";
  message: string;
}

export type TabId =
  | "deposit"
  | "checkout"
  | "credit"
  | "payments"
  | "treasury"
  | "fee"
  | "webhooks"
  | "templates"
  | "sdk"
  | "agents"
  | "invoices"
  | "about"
  | "faq"
  | "contact"
  | "legal";

export interface SearchItem {
  id: string;
  title: string;
  category: string;
  desc: string;
}

export interface CreditScoreResponse {
  score: "AAA" | "A" | "B" | "C" | "D";
  creditLimit: string;
  interestRate: string;
  [key: string]: any;
}

export interface Invoice {
  id?: number;
  invoiceId?: number;
  status: string;
  supplier: string;
  buyer: string;
  amount: string;
  purchaseOrderRef?: string;
  goodsReceiptRef?: string;
  earlyPayDiscount: string | number;
  dueDate: string | number;
  description?: string;
}

import React from "react";
import {
  Download,
  CreditCard,
  FileText,
  TrendingUp,
  Send,
  Globe,
  Sliders,
  Bell,
  Code,
  Cpu,
  Bot,
  Layers,
  HelpCircle,
  Mail,
  ShieldCheck
} from "lucide-react";
import { TabId } from "../../lib/types";
import { USDC_ADDRESSES } from "../../lib/constants";
import styles from "./Sidebar.module.css";

interface SidebarProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  feePercent: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  feePercent
}) => {
  return (
    <aside className={styles["sidebar"]}>
      {/* Group 1: Core Products */}
      <div className={styles["sidebar-group"]}>
        <div className={styles["sidebar-group-header"]}>Core Products</div>
        <button
          className={`${styles["sidebar-item"]} ${
            activeTab === "deposit" ? styles["active"] : ""
          }`}
          onClick={() => setActiveTab("deposit")}
        >
          <Download size={14} />
          <span>Deposit &amp; Flows</span>
        </button>
        <button
          className={`${styles["sidebar-item"]} ${
            activeTab === "checkout" ? styles["active"] : ""
          }`}
          onClick={() => setActiveTab("checkout")}
        >
          <CreditCard size={14} />
          <span>Checkout Widget</span>
        </button>
        <button
          className={`${styles["sidebar-item"]} ${
            activeTab === "invoices" ? styles["active"] : ""
          }`}
          onClick={() => setActiveTab("invoices")}
        >
          <FileText size={14} />
          <span>B2B Invoices</span>
        </button>
      </div>

      {/* Group 2: Biz Extensions */}
      <div className={styles["sidebar-group"]}>
        <div className={styles["sidebar-group-header"]}>Biz Extensions</div>
        <button
          className={`${styles["sidebar-item"]} ${
            activeTab === "credit" ? styles["active"] : ""
          }`}
          onClick={() => setActiveTab("credit")}
        >
          <TrendingUp size={14} />
          <span>Credit Score</span>
        </button>
        <button
          className={`${styles["sidebar-item"]} ${
            activeTab === "payments" ? styles["active"] : ""
          }`}
          onClick={() => setActiveTab("payments")}
        >
          <Send size={14} />
          <span>Batch Payouts</span>
        </button>
        <button
          className={`${styles["sidebar-item"]} ${
            activeTab === "treasury" ? styles["active"] : ""
          }`}
          onClick={() => setActiveTab("treasury")}
        >
          <Globe size={14} />
          <span>Yield &amp; Bridge</span>
        </button>
      </div>

      {/* Group 3: Infrastructure */}
      <div className={styles["sidebar-group"]}>
        <div className={styles["sidebar-group-header"]}>Infrastructure</div>
        <button
          className={`${styles["sidebar-item"]} ${
            activeTab === "fee" ? styles["active"] : ""
          }`}
          onClick={() => setActiveTab("fee")}
        >
          <Sliders size={14} />
          <span>Fee Policy</span>
        </button>
        <button
          className={`${styles["sidebar-item"]} ${
            activeTab === "webhooks" ? styles["active"] : ""
          }`}
          onClick={() => setActiveTab("webhooks")}
        >
          <Bell size={14} />
          <span>Webhooks Tester</span>
        </button>
      </div>

      {/* Group 4: Developer Hub */}
      <div className={styles["sidebar-group"]}>
        <div className={styles["sidebar-group-header"]}>Developer Hub</div>
        <button
          className={`${styles["sidebar-item"]} ${
            activeTab === "templates" ? styles["active"] : ""
          }`}
          onClick={() => setActiveTab("templates")}
        >
          <Code size={14} />
          <span>Deploy ERC-20</span>
        </button>
        <button
          className={`${styles["sidebar-item"]} ${
            activeTab === "sdk" ? styles["active"] : ""
          }`}
          onClick={() => setActiveTab("sdk")}
        >
          <Cpu size={14} />
          <span>Client SDK Setup</span>
        </button>
        <button
          className={`${styles["sidebar-item"]} ${
            activeTab === "agents" ? styles["active"] : ""
          }`}
          onClick={() => setActiveTab("agents")}
        >
          <Bot size={14} />
          <span>AI Escrow Agent</span>
        </button>
      </div>

      {/* Group 5: Info & Support */}
      <div className={styles["sidebar-group"]}>
        <div className={styles["sidebar-group-header"]}>Info &amp; Support</div>
        <button
          className={`${styles["sidebar-item"]} ${
            activeTab === "about" ? styles["active"] : ""
          }`}
          onClick={() => setActiveTab("about")}
        >
          <Layers size={14} />
          <span>About Platform</span>
        </button>
        <button
          className={`${styles["sidebar-item"]} ${
            activeTab === "faq" ? styles["active"] : ""
          }`}
          onClick={() => setActiveTab("faq")}
        >
          <HelpCircle size={14} />
          <span>FAQ Database</span>
        </button>
        <button
          className={`${styles["sidebar-item"]} ${
            activeTab === "contact" ? styles["active"] : ""
          }`}
          onClick={() => setActiveTab("contact")}
        >
          <Mail size={14} />
          <span>Contact Support</span>
        </button>
        <button
          className={`${styles["sidebar-item"]} ${
            activeTab === "legal" ? styles["active"] : ""
          }`}
          onClick={() => setActiveTab("legal")}
        >
          <ShieldCheck size={14} />
          <span>Compliance</span>
        </button>
      </div>

      {/* Sidebar Reference addresses */}
      <div className={`${styles["sidebar-group"]} mt-6`}>
        <div className={styles["ref-card"]}>
          <div className={styles["ref-row"]}>
            <span>Target Chain:</span>
            <span>Arc Testnet</span>
          </div>
          <div className={styles["ref-row"]}>
            <span>USDC Contract:</span>
            <span title={USDC_ADDRESSES[5042002]}>0x3600...0000</span>
          </div>
          <div className={styles["ref-row"]}>
            <span>Platform Fee:</span>
            <span>{feePercent} USDC</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
export default Sidebar;

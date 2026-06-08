import React from "react";
import { Check, Copy, Download } from "lucide-react";
import styles from "./SdkTab.module.css";

interface SdkTabProps {
  selectedSdkLang: "typescript" | "python" | "go";
  setSelectedSdkLang: (val: "typescript" | "python" | "go") => void;
  addLog: (type: "info" | "success" | "warning" | "error" | "input", message: string) => void;
  copyToClipboard: (text: string, id: string) => void;
  copiedText: string | null;
}

export const SdkTab: React.FC<SdkTabProps> = ({
  selectedSdkLang,
  setSelectedSdkLang,
  addLog,
  copyToClipboard,
  copiedText
}) => {
  return (
    <>
      {/* Left docs column */}
      <div className="prose">
        <div className="badge-tag">Developer Hub</div>
        <h2>Client Integration Libraries</h2>
        <p>
          Integrate BizFlow stablecoin commerce stack into your backend or client-side application. We provide official open-source SDKs for <strong>TypeScript / JavaScript</strong>, <strong>Python</strong>, and <strong>Go</strong>.
        </p>

        <h3>Installation Snippets</h3>
        <div className={styles.langSelector}>
          <button
            className={`${styles.langBtn} ${selectedSdkLang === "typescript" ? styles.active : ""}`}
            onClick={() => setSelectedSdkLang("typescript")}
          >
            TypeScript
          </button>
          <button
            className={`${styles.langBtn} ${selectedSdkLang === "python" ? styles.active : ""}`}
            onClick={() => setSelectedSdkLang("python")}
          >
            Python
          </button>
          <button
            className={`${styles.langBtn} ${selectedSdkLang === "go" ? styles.active : ""}`}
            onClick={() => setSelectedSdkLang("go")}
          >
            Go
          </button>
        </div>

        {selectedSdkLang === "typescript" && (
          <div className="code-block-wrapper">
            <div className="code-header">
              <span>Terminal (NPM)</span>
              <button
                className="copy-btn"
                onClick={() => copyToClipboard("npm install @circle-fin/bizflow-sdk", "npm_ts")}
              >
                {copiedText === "npm_ts" ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedText === "npm_ts" ? "Copied" : "Copy"}</span>
              </button>
            </div>
            <pre>
              <code>npm install @circle-fin/bizflow-sdk</code>
            </pre>
          </div>
        )}

        {selectedSdkLang === "python" && (
          <div className="code-block-wrapper">
            <div className="code-header">
              <span>Terminal (PIP)</span>
              <button
                className="copy-btn"
                onClick={() => copyToClipboard("pip install circle-bizflow-sdk", "pip_py")}
              >
                {copiedText === "pip_py" ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedText === "pip_py" ? "Copied" : "Copy"}</span>
              </button>
            </div>
            <pre>
              <code>pip install circle-bizflow-sdk</code>
            </pre>
          </div>
        )}

        {selectedSdkLang === "go" && (
          <div className="code-block-wrapper">
            <div className="code-header">
              <span>Terminal (Go Get)</span>
              <button
                className="copy-btn"
                onClick={() => copyToClipboard("go get github.com/circle-fin/bizflow-sdk-go", "go_get")}
              >
                {copiedText === "go_get" ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedText === "go_get" ? "Copied" : "Copy"}</span>
              </button>
            </div>
            <pre>
              <code>go get github.com/circle-fin/bizflow-sdk-go</code>
            </pre>
          </div>
        )}
      </div>

      {/* Right sandbox column */}
      <div className="playground-panel-wrapper">
        <div className="control-group animate-fade-in">
          <div className="control-title">Developer Integration</div>
          <p className="text-xs text-muted" style={{ lineHeight: 1.5 }}>
            Download client binaries or interact with the simulated endpoints locally. Live server is running at port 3000.
          </p>

          <div className="input-field">
            <label>Live API Endpoint Status</label>
            <div style={{ background: "#ffffff", border: "1px solid #e5e5e5", padding: "12px", borderRadius: "8px", display: "flex", flexDirection: "column", gap: "6px" }}>
              <div className="flex-between text-xs">
                <span>Gateway Deposit API:</span>
                <span className="text-green font-semibold" style={{ color: "var(--brand-green)" }}>ONLINE</span>
              </div>
              <div className="flex-between text-xs">
                <span>Credit Underwriting:</span>
                <span className="text-green font-semibold" style={{ color: "var(--brand-green)" }}>ONLINE</span>
              </div>
              <div className="flex-between text-xs">
                <span>Payouts &amp; Webhooks:</span>
                <span className="text-green font-semibold" style={{ color: "var(--brand-green)" }}>ONLINE</span>
              </div>
            </div>
          </div>

          <button
            className="btn-run"
            onClick={() => addLog("success", "SDK package setup checked. Local REST APIs verified.")}
            style={{ width: "100%" }}
          >
            <Check size={14} />
            <span>Verify Local API Stack</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default SdkTab;

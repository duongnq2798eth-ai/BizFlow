import React from "react";
import { Code } from "lucide-react";
import styles from "./PayloadInspector.module.css";

interface PayloadInspectorProps {
  isInspectorOpen: boolean;
  setIsInspectorOpen: (open: boolean) => void;
  activeRequestPayload: string;
  activeResponsePayload: string;
}

export const PayloadInspector: React.FC<PayloadInspectorProps> = ({
  isInspectorOpen,
  setIsInspectorOpen,
  activeRequestPayload,
  activeResponsePayload
}) => {
  return (
    <div className={styles["inspector-wrapper"]}>
      <button
        onClick={() => setIsInspectorOpen(!isInspectorOpen)}
        className={styles["inspector-toggle"]}
      >
        <span className={styles["toggle-left"]}>
          <Code size={14} className={styles["text-green"]} />
          <span>Raw HTTP JSON Payload Inspector</span>
        </span>
        <span className={styles["toggle-right"]}>
          {isInspectorOpen ? "Collapse [-]" : "Expand [+]"}
        </span>
      </button>

      {isInspectorOpen && (
        <div className={styles["inspector-content"]}>
          <div className={styles["inspector-pane"]}>
            <div className={styles["inspector-title"]}>Raw Request JSON</div>
            <pre className={styles["inspector-code"]}>
              <code>
                {activeRequestPayload ||
                  "// No active request sent yet. Run a sandbox action."}
              </code>
            </pre>
          </div>
          <div className={styles["inspector-pane"]}>
            <div className={styles["inspector-title"]}>Raw Response JSON</div>
            <pre className={`${styles["inspector-code"]} ${styles["response"]}`}>
              <code>
                {activeResponsePayload ||
                  "// No active response received yet. Run a sandbox action."}
              </code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayloadInspector;

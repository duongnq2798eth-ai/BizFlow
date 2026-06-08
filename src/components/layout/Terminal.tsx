import React, { useEffect, useRef } from "react";
import { LogEntry } from "../../lib/types";
import styles from "./Terminal.module.css";

interface TerminalProps {
  logs: LogEntry[];
  clearLogs: () => void;
}

export const Terminal: React.FC<TerminalProps> = ({ logs, clearLogs }) => {
  const terminalEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  return (
    <div className={styles["terminal-wrapper"]}>
      <div className={styles["terminal-header"]}>
        <span>Terminal Response Console</span>
        <button onClick={clearLogs} className={styles["text-btn"]}>
          Clear Logs
        </button>
      </div>
      <div className={styles["terminal-body"]}>
        {logs.map((log, index) => (
          <div
            key={index}
            className={`${styles["terminal-line"]} ${styles[log.type] || ""}`}
          >
            <span className={styles["log-time"]}>[{log.timestamp}]</span>{" "}
            {log.type === "input" && (
              <span className={styles["log-indicator"]}>&gt;</span>
            )}
            <span>{log.message}</span>
          </div>
        ))}
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
};

export default Terminal;

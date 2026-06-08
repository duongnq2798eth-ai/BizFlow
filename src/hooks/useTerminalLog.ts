import { useState, useCallback } from "react";
import { LogEntry } from "../lib/types";

export function useTerminalLog() {
  const [logs, setLogs] = useState<LogEntry[]>([
    { timestamp: "19:12:30", type: "info", message: "BizFlow Sandboxed Developer Environment loaded." },
    { timestamp: "19:12:31", type: "info", message: "Hardcoded networks: Arc Testnet (ID: 5042002), Base Sepolia (ID: 84532)." }
  ]);

  const addLog = useCallback((type: LogEntry["type"], message: string) => {
    const now = new Date();
    const timestamp = now.toTimeString().split(" ")[0];
    setLogs((prev) => [...prev, { timestamp, type, message }].slice(-30));
  }, []);

  const clearLogs = useCallback(() => {
    const now = new Date();
    const timestamp = now.toTimeString().split(" ")[0];
    setLogs([{ timestamp, type: "info", message: "Terminal cleared." }]);
  }, []);

  return {
    logs,
    addLog,
    clearLogs,
    setLogs
  };
}

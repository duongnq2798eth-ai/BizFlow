import React from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Layers, Search, Terminal, ArrowUpRight } from "lucide-react";
import styles from "./Navbar.module.css";

interface NavbarProps {
  onSearchOpen: () => void;
  liveBlockNumber: number | null;
  liveGasPrice: string | null;
  rpcStatus: "connecting" | "online" | "offline";
}

export const Navbar: React.FC<NavbarProps> = ({
  onSearchOpen,
  liveBlockNumber,
  liveGasPrice,
  rpcStatus
}) => {
  return (
    <nav className={styles["top-nav"]}>
      <div className={styles["nav-container"]}>
        <div className={styles["nav-left"]}>
          <div className={styles["logo"]}>
            <Layers className={styles["logo-icon"]} size={28} />
            <span>BizFlow</span>
          </div>
          <span className={styles["api-badge"]}>Arc Testnet Stack</span>
        </div>

        {/* Global Ctrl+K Search Bar */}
        <div className={styles["nav-center"]}>
          <div className={styles["search-bar"]} onClick={onSearchOpen}>
            <Search size={14} className="text-muted" />
            <input
              type="text"
              placeholder="Search API reference... (Ctrl+K)"
              readOnly
            />
            <span className={styles["search-shortcut"]}>⌘K</span>
          </div>
        </div>

        <div className={styles["nav-right"]}>
          {/* Mobile Search Toggle */}
          <button className={styles["search-toggle-mobile"]} onClick={onSearchOpen}>
            <Search size={18} />
          </button>

          {/* Network Poller Node Stats */}
          <div className={styles["nav-link-item"]}>
            <span
              className={`pulse-dot ${
                rpcStatus === "online"
                  ? "online"
                  : rpcStatus === "connecting"
                  ? "connecting"
                  : "offline"
              }`}
            />
            <span style={{ fontSize: "11px", textTransform: "none" }}>
              {rpcStatus === "online" ? (
                liveBlockNumber ? (
                  <a
                    href={`https://testnet.arcscan.app/block/${liveBlockNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: "underline", color: "inherit" }}
                  >
                    Node Online (#{liveBlockNumber})
                  </a>
                ) : (
                  "Node Online (#...)"
                )
              ) : rpcStatus === "connecting" ? (
                "Connecting RPC..."
              ) : (
                "RPC Offline"
              )}
            </span>
          </div>

          <div className={styles["nav-link-item"]}>
            <Terminal size={14} />
            <span>Gas: {liveGasPrice ? `${liveGasPrice} USDC` : "0.00 USDC"}</span>
          </div>

          <a
            href="/merchant"
            className={styles["nav-link-item"]}
            style={{ color: "#00d4a4", fontWeight: "bold" }}
          >
            <span>Merchant Portal</span>
            <ArrowUpRight size={12} />
          </a>

          <a
            href="/analytics"
            className={styles["nav-link-item"]}
            style={{ color: "#38bdf8", fontWeight: "bold" }}
          >
            <span>Analytics</span>
            <ArrowUpRight size={12} />
          </a>

          <a
            href="https://testnet.arcscan.app/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles["nav-link-item"]}
          >
            <span>Explorer</span>
            <ArrowUpRight size={12} />
          </a>

          {/* Wallet Connection */}
          <ConnectButton />
        </div>
      </div>
    </nav>
  );
};
export default Navbar;

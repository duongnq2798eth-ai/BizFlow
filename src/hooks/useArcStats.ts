import { useState, useEffect } from "react";

export function useArcStats() {
  const [liveBlockNumber, setLiveBlockNumber] = useState<number | null>(null);
  const [liveGasPrice, setLiveGasPrice] = useState<string | null>(null);
  const [rpcStatus, setRpcStatus] = useState<"connecting" | "online" | "offline">("connecting");

  useEffect(() => {
    const fetchArcStats = async () => {
      try {
        const res = await fetch("https://rpc.testnet.arc.network", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify([
            {
              jsonrpc: "2.0",
              method: "eth_blockNumber",
              params: [],
              id: 1
            },
            {
              jsonrpc: "2.0",
              method: "eth_gasPrice",
              params: [],
              id: 2
            }
          ])
        });

        if (!res.ok) throw new Error("Network response not ok");
        const data = await res.json();

        if (Array.isArray(data) && data.length === 2) {
          const blockHex = data[0].result;
          const gasHex = data[1].result;

          if (blockHex) {
            setLiveBlockNumber(parseInt(blockHex, 16));
          }
          if (gasHex) {
            const gasWei = BigInt(gasHex);
            // Arc gas is priced in USDC (18 decimals for gas units)
            const gasUSDC = (Number(gasWei) / 1e18).toFixed(9);
            setLiveGasPrice(gasUSDC);
          }
          setRpcStatus("online");
        } else {
          setRpcStatus("offline");
        }
      } catch (e) {
        setRpcStatus("offline");
      }
    };

    fetchArcStats();
    const interval = setInterval(fetchArcStats, 10000);
    return () => clearInterval(interval);
  }, []);

  return {
    liveBlockNumber,
    liveGasPrice,
    rpcStatus
  };
}

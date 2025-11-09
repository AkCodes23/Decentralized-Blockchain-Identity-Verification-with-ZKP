// frontend/src/hooks/useWeb3.js
import { useEffect, useState, useCallback } from "react";

const HARDHAT_CHAIN_ID_HEX = "0x7a69"; // 31337
const HARDHAT_RPC = "http://127.0.0.1:8545";

export default function useWeb3() {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  const ensureChain = useCallback(async (eth) => {
    const cid = await eth.request({ method: "eth_chainId" });
    setChainId(cid);
    if (cid !== HARDHAT_CHAIN_ID_HEX) {
      try {
        await eth.request({
          method: "wallet_addEthereumChain",
          params: [{
            chainId: HARDHAT_CHAIN_ID_HEX,
            chainName: "Hardhat Local",
            rpcUrls: [HARDHAT_RPC],
            nativeCurrency: { name: "Ethereum", symbol: "ETH", decimals: 18 },
            blockExplorerUrls: []
          }]
        });
      } catch (e) {
        throw new Error("Please switch MetaMask to Hardhat Local (31337).");
      }
    }
  }, []);

  const connect = useCallback(async () => {
    setError("");
    try {
      if (!window.ethereum) throw new Error("MetaMask not found in this tab.");
      await ensureChain(window.ethereum);

      // request accounts
      const accs = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accs[0] ?? null);

      // lazy-load ethers v6 from CDN (keeps bundle small)
      const mod = await import("https://cdn.jsdelivr.net/npm/ethers@6.13.2/dist/ethers.min.js");
      const { ethers } = mod;

      const prov = new ethers.BrowserProvider(window.ethereum);
      const s = await prov.getSigner();

      setProvider(prov);
      setSigner(s);
      setReady(true);
    } catch (e) {
      console.error(e);
      setError(e.message || "Failed to connect wallet");
      setReady(false);
    }
  }, [ensureChain]);

  // react to chain/account changes
  useEffect(() => {
    if (!window.ethereum) return;
    const onAccounts = (accs) => setAccount(accs[0] ?? null);
    const onChain = (cid) => setChainId(cid);

    window.ethereum.on?.("accountsChanged", onAccounts);
    window.ethereum.on?.("chainChanged", onChain);
    return () => {
      window.ethereum.removeListener?.("accountsChanged", onAccounts);
      window.ethereum.removeListener?.("chainChanged", onChain);
    };
  }, []);

  return { connect, account, provider, signer, chainId, ready, error };
}

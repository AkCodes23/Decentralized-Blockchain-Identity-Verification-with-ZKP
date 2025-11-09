// frontend/src/components/DIDPanel.jsx
import { useState, useEffect } from "react";
import { loadAddresses } from "../lib/addresses";
import useWeb3 from "../hooks/useWeb3";

const ABI = [
  {
    "inputs": [
      { "name": "did", "type": "string" },
      { "name": "documentHash", "type": "string" },
      { "name": "publicKeys", "type": "string[]" },
      { "name": "services", "type": "string[]" }
    ],
    "name": "createDID",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalDIDs",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "addr", "type": "address" }],
    "name": "getDIDByAddress",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  }
];

export default function DIDPanel() {
  const { connect, account, signer, ready, error } = useWeb3();
  const [did, setDid] = useState("did:example:aryan123");
  const [docHash, setDocHash] = useState("QmDummyHash12345");
  const [pubKeys, setPubKeys] = useState("publicKey1,publicKey2");
  const [services, setServices] = useState("service1");
  const [status, setStatus] = useState("");
  const [total, setTotal] = useState("");
  const [identityAddr, setIdentityAddr] = useState(null);

  const withEthers = async () => {
    const mod = await import("https://cdn.jsdelivr.net/npm/ethers@6.13.2/dist/ethers.min.js");
    return mod.ethers;
  };

  // 🔹 Load contract address from backend
  useEffect(() => {
    (async () => {
      try {
        const a = await loadAddresses();
        setIdentityAddr(a.IdentityRegistry);
        console.log("✅ Loaded contract address:", a.IdentityRegistry);
      } catch {
        setStatus("❌ Failed to load contract addresses from backend");
      }
    })();
  }, []);

  const verifyDeployed = async (ethers, addr) => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const code = await provider.getCode(addr);
    if (!code || code === "0x") {
      throw new Error(`No contract code at ${addr}. Redeploy or update contract-addresses.json.`);
    }
  };

    const createDID = async () => {
    try {
      if (!identityAddr) {
        setStatus("❌ Contract not loaded yet");
        return;
      }
      if (identityAddr.toLowerCase() === "0x0000000000000000000000000000000000000000") {
        setStatus("❌ Contract address is zero — update contract-addresses.json to the latest deploy");
        return;
      }
      if (!account) {
        setStatus("❌ Wallet not connected");
        return;
      }

      const ethers = await withEthers();

      // ✅ sanity check: ensure there is code at this address
      await verifyDeployed(ethers, identityAddr);

      const contract = new ethers.Contract(identityAddr, ABI, signer);

      // ✅ safer precheck: only test the DID string existence (this ABI never fails)
      // (we skip getDIDByAddress because your node returned decoding errors)
      // If you want to check address ownership in UI, we’ll add it later via backend.
      // For now, let the contract enforce it.
      // const exists = await contract.doesDIDExist?.(did); // only if you add it to ABI
      // if (exists) { setStatus(`⚠️ DID "${did}" already exists`); return; }

      const pk = pubKeys.split(",").map(s => s.trim()).filter(Boolean);
      const svc = services.split(",").map(s => s.trim()).filter(Boolean);

      // ✅ dry-run first to get exact revert reason (e.g., "Address already has a DID")
      setStatus("🔍 Simulating transaction (static call)...");
      await contract.createDID.staticCall(did, docHash, pk, svc);

      // ✅ then send the real transaction with a safe gas limit
      setStatus("🚀 Sending transaction...");
      const tx = await contract.createDID(did, docHash, pk, svc, { gasLimit: 500_000 });
      setStatus(`⏳ Pending: ${tx.hash}`);
      await tx.wait();

      setStatus(`✅ Mined successfully: ${tx.hash}`);
    } catch (e) {
      console.error(e);
      // Show a helpful reason if available
      const msg =
        e?.info?.error?.message ||
        e?.shortMessage ||
        e?.reason ||
        e?.message ||
        "Transaction failed";
      setStatus(`❌ ${msg}`);
    }
  };

  const readTotal = async () => {
    try {
      if (!identityAddr) {
        setStatus("❌ Contract not loaded yet");
        return;
      }
      const ethers = await withEthers();
      const contract = new ethers.Contract(identityAddr, ABI, signer);
      const v = await contract.getTotalDIDs();
      setTotal(v.toString());
      setStatus("");
    } catch (e) {
      console.error(e);
      setStatus(`❌ ${e.message || "Read failed"}`);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: "40px auto", padding: 16, border: "1px solid #e5e5e5", borderRadius: 12 }}>
      <h2>Identity Registry (Local Hardhat)</h2>

      {!ready ? (
        <>
          <p>Connect your wallet (MetaMask on <b>Hardhat Local</b> 31337).</p>
          <button onClick={connect} style={{ padding: "10px 16px", borderRadius: 8 }}>Connect Wallet</button>
          {error && <p style={{ color: "crimson" }}>{error}</p>}
        </>
      ) : (
        <>
          <p><strong>Connected:</strong> <code>{account}</code></p>
          <p><strong>Contract:</strong> <code>{identityAddr || "(loading...)"}</code></p>

          <div style={{ display: "grid", gap: 8 }}>
            <label>DID
              <input value={did} onChange={e => setDid(e.target.value)} style={{ width: "100%" }}/>
            </label>
            <label>Document Hash (IPFS)
              <input value={docHash} onChange={e => setDocHash(e.target.value)} style={{ width: "100%" }}/>
            </label>
            <label>Public Keys (comma-separated)
              <input value={pubKeys} onChange={e => setPubKeys(e.target.value)} style={{ width: "100%" }}/>
            </label>
            <label>Services (comma-separated)
              <input value={services} onChange={e => setServices(e.target.value)} style={{ width: "100%" }}/>
            </label>
          </div>

          <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
            <button onClick={createDID} style={{ padding: "10px 16px", borderRadius: 8 }}>Create DID</button>
            <button onClick={readTotal} style={{ padding: "10px 16px", borderRadius: 8 }}>Get Total DIDs</button>
          </div>

          {status && <p style={{ marginTop: 12 }}>{status}</p>}
          {total !== "" && <p style={{ marginTop: 4 }}>Total DIDs: <b>{total}</b></p>}
        </>
      )}
    </div>
  );
}
// frontend/src/components/DIDPanel.jsx
import { useState } from "react";
import useWeb3 from "../hooks/useWeb3";

const IDENTITY_REGISTRY = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
// Extended ABI
const ABI = [
  {
    "inputs":[
      {"name":"did","type":"string"},
      {"name":"documentHash","type":"string"},
      {"name":"publicKeys","type":"string[]"},
      {"name":"services","type":"string[]"}
    ],
    "name":"createDID","outputs":[],"stateMutability":"nonpayable","type":"function"
  },
  {
    "inputs":[],"name":"getTotalDIDs",
    "outputs":[{"internalType":"uint256","name":"","type":"uint256"}],
    "stateMutability":"view","type":"function"
  },
  {
    "inputs":[{"name":"did","type":"string"}],
    "name":"doesDIDExist",
    "outputs":[{"internalType":"bool","name":"","type":"bool"}],
    "stateMutability":"view","type":"function"
  }
];

export default function DIDPanel() {
  const { connect, account, signer, ready, error } = useWeb3();
  const [did, setDid] = useState("did:example:aryan124");
  const [docHash, setDocHash] = useState("QmDummyHash12345");
  const [pubKeys, setPubKeys] = useState("publicKey1,publicKey2");
  const [services, setServices] = useState("service1");
  const [status, setStatus] = useState("");
  const [total, setTotal] = useState("");

  const withEthers = async () => {
    const mod = await import("https://cdn.jsdelivr.net/npm/ethers@6.13.2/dist/ethers.min.js");
    return mod.ethers;
  };

  const createDID = async () => {
    try {
      setStatus("⏳ Sending transaction...");
      const ethers = await withEthers();
      const contract = new ethers.Contract(IDENTITY_REGISTRY, ABI, signer);

      const didStr = did.trim();
      const pkArray = pubKeys.split(",").map(s => s.trim()).filter(Boolean);
      const svcArray = services.split(",").map(s => s.trim()).filter(Boolean);

      // 1️⃣ Check if DID already exists
      const exists = await contract.doesDIDExist(didStr);
      if (exists) {
        setStatus("❌ DID already exists! Try a different DID name.");
        return;
      }

      // 2️⃣ Dry-run to detect reverts early
      await contract.createDID.staticCall(didStr, docHash, pkArray, svcArray);

      // 3️⃣ Send transaction (with manual gas limit)
      const tx = await contract.createDID(
        didStr,
        docHash,
        pkArray,
        svcArray,
        { gasLimit: 500_000 } // ✅ fixes low gas revert
      );

      setStatus(`⏳ Pending: ${tx.hash}`);
      await tx.wait();
      setStatus(`✅ Mined successfully! Tx: ${tx.hash}`);

      // 4️⃣ Refresh total count
      const v = await contract.getTotalDIDs();
      setTotal(v.toString());
    } catch (e) {
      console.error(e);
      const msg =
        e?.info?.error?.message ||
        e?.shortMessage ||
        e?.message ||
        "Create DID failed";
      setStatus(`❌ ${msg}`);
    }
  };

  const readTotal = async () => {
    try {
      const ethers = await withEthers();
      const contract = new ethers.Contract(IDENTITY_REGISTRY, ABI, signer);
      const v = await contract.getTotalDIDs();
      setTotal(v.toString());
      setStatus(`✅ Total DIDs fetched.`);
    } catch (e) {
      console.error(e);
      setStatus(`❌ ${e.message || "Failed to read total DIDs."}`);
    }
  };

  return (
    <div style={{
      maxWidth: 720,
      margin: "40px auto",
      padding: 16,
      border: "1px solid #e5e5e5",
      borderRadius: 12
    }}>
      <h2>Identity Registry (local)</h2>

      {!ready ? (
        <>
          <p>Connect your wallet (MetaMask on <b>Hardhat Local</b> 31337).</p>
          <button onClick={connect} style={{ padding: "10px 16px", borderRadius: 8 }}>
            Connect Wallet
          </button>
          {error && <p style={{ color: "crimson" }}>{error}</p>}
        </>
      ) : (
        <>
          <p>Connected: <code>{account}</code></p>

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

          <p style={{ marginTop: 16, color: "#555" }}>
            Using contract: <code>{IDENTITY_REGISTRY}</code>
          </p>
        </>
      )}
    </div>
  );
}
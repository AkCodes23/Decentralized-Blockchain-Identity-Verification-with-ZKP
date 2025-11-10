import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { loadAddresses } from "../lib/addresses";

const VERIF_ABI = [
  // Admin
  {
    inputs: [
      { name: "circuitType", type: "string" },
      { name: "verifierContract", type: "address" },
    ],
    name: "registerZKPVerifier",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "circuitType", type: "string" }],
    name: "deactivateZKPVerifier",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },

  // User
  {
    inputs: [
      { name: "requestId", type: "string" },
      { name: "credentialId", type: "string" },
      { name: "circuitType", type: "string" },
      { name: "proofData", type: "bytes" },
      { name: "publicInputs", type: "uint256[]" },
      { name: "verifierDID", type: "string" },
    ],
    name: "submitVerificationRequest",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },

  // Reads
  {
    inputs: [{ name: "requestId", type: "string" }],
    name: "getVerificationRequest",
    outputs: [
      {
        components: [
          { name: "requestId", type: "string" },
          { name: "credentialId", type: "string" },
          { name: "verifierDID", type: "string" },
          { name: "proofHash", type: "bytes32" },
          { name: "requestedAt", type: "uint256" },
          { name: "isVerified", type: "bool" },
          { name: "verificationResult", type: "string" },
          { name: "verifiedAt", type: "uint256" },
        ],
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTotalVerificationRequests",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "index", type: "uint256" }],
    name: "getVerificationRequestAtIndex",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "requestId", type: "string" }],
    name: "isVerificationVerified",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "requestId", type: "string" }],
    name: "getVerificationResult",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
];

// Minimal ABI for Verifier.verifyProof to preflight (optional)
const VERIFIER_ABI = [
  {
    inputs: [
      { name: "proof", type: "bytes" },
      { name: "input", type: "uint256[]" },
    ],
    name: "verifyProof",
    outputs: [
      { name: "", type: "bool" },
      { name: "", type: "string" },
    ],
    stateMutability: "view",
    type: "function",
  },
];

export default function VerificationPortal({ account, provider, signer }) {
  const [addr, setAddr] = useState({ VerificationContract: "", Verifier: "" });
  const [status, setStatus] = useState("");

  // Admin (owner)
  const [circuitType, setCircuitType] = useState("age");
  const [verifierAddress, setVerifierAddress] = useState("");

  // Submit
  const [requestId, setRequestId] = useState(`req-${Math.floor(Math.random() * 1e6)}`);
  const [credentialId, setCredentialId] = useState("cred-12345");
  const [submitCircuitType, setSubmitCircuitType] = useState("age");
  const [verifierDID, setVerifierDID] = useState("did:example:verifier1");
  const [proofData, setProofData] = useState("0x1234"); // demo; any non-empty bytes
  const [publicInputs, setPublicInputs] = useState("42"); // CSV of uint256, e.g. "42,7"

  // Viewer
  const [lookupId, setLookupId] = useState("");
  const [view, setView] = useState(null);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const addrs = await loadAddresses();
        const vAddr = addrs?.VerificationContract || "";
        const verifier = addrs?.Verifier || "";
        setAddr({ VerificationContract: vAddr, Verifier: verifier });
        if (!verifierAddress) setVerifierAddress(verifier || "");
        console.log("✅ VerificationContract:", vAddr);
        console.log("✅ Verifier:", verifier);
      } catch (e) {
        setStatus(`❌ Failed to load contract addresses: ${e.message}`);
      }
    })();
  }, []); // eslint-disable-line

  const requireReady = () => {
    if (!provider || !signer || !account) {
      setStatus("❌ Connect your wallet first");
      return false;
    }
    if (!addr.VerificationContract) {
      setStatus("❌ VerificationContract address missing");
      return false;
    }
    return true;
  };

  const prettyTime = (sec) => {
    if (!sec || sec.toString() === "0") return "-";
    const ms = Number(sec) * 1000;
    if (Number.isNaN(ms)) return sec?.toString?.() || String(sec);
    return new Date(ms).toLocaleString();
    };

  const parseBytes = (s) => {
    // Accept "0x..." or UTF-8 string
    try {
      if (s?.startsWith?.("0x")) return s;
      return ethers.hexlify(ethers.toUtf8Bytes(s || ""));
    } catch {
      return "0x";
    }
  };

  const parseUintCsv = (s) => {
    if (!s?.trim()) return [];
    return s
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean)
      .map((x) => window.BigInt(x)); // ✅ fixes "BigInt not defined"
  };

  // --- Admin: register verifier (owner only)
  const onRegisterVerifier = async () => {
    try {
      if (!requireReady()) return;
      const c = new ethers.Contract(addr.VerificationContract, VERIF_ABI, signer);

      // Preflight: optional call verifier directly
      if (verifierAddress) {
        try {
          const v = new ethers.Contract(verifierAddress, VERIFIER_ABI, provider);
          const [ok] = await v.verifyProof(parseBytes("0x1234"), [1n]); // dummy
          console.log("Verifier verifyProof preflight ok:", ok);
        } catch (_) {
          // it's fine; just informational
        }
      }

      setStatus("Submitting registerZKPVerifier…");
      const tx = await c.registerZKPVerifier(circuitType.trim(), verifierAddress.trim());
      setStatus(`⏳ Pending: ${tx.hash}`);
      await tx.wait();
      setStatus(`✅ Registered verifier for circuit "${circuitType}"`);
    } catch (e) {
      const msg =
        e?.info?.error?.message || e?.error?.message || e?.shortMessage || e?.reason || e?.message || String(e);
      setStatus(`❌ ${msg}`);
      console.error(e);
    }
  };

  // --- User: submit verification request
  const onSubmitVerification = async () => {
    try {
      if (!requireReady()) return;
      const c = new ethers.Contract(addr.VerificationContract, VERIF_ABI, signer);

      const proof = parseBytes(proofData);
      const inputs = parseUintCsv(publicInputs);

      // optimistic preflight via callStatic-like behavior: not available directly since
      // submitVerificationRequest writes state; skip and let on-chain verifier decide
      setStatus("Submitting verification request…");
      const tx = await c.submitVerificationRequest(
        requestId.trim(),
        credentialId.trim(),
        submitCircuitType.trim(),
        proof,
        inputs,
        verifierDID.trim()
      );
      setStatus(`⏳ Pending: ${tx.hash}`);
      const rc = await tx.wait();
      console.log("submitVerification receipt:", rc);
      setStatus(`✅ Submitted "${requestId}" (circuit ${submitCircuitType})`);

      // auto-load result
      setLookupId(requestId);
      await onLookupRequest(requestId);
    } catch (e) {
      const msg =
        e?.info?.error?.message || e?.error?.message || e?.shortMessage || e?.reason || e?.message || String(e);
      setStatus(`❌ ${msg}`);
      console.error(e);
    }
  };

  // --- Viewer: lookup request by ID
  const onLookupRequest = async (idOverride) => {
    try {
      const id = (idOverride ?? lookupId).trim();
      if (!id) return setStatus("❌ Provide a requestId");
      const c = new ethers.Contract(addr.VerificationContract, VERIF_ABI, provider);
      const req = await c.getVerificationRequest(id);
      setView(req);
      setStatus(`✅ Loaded request "${id}"`);
    } catch (e) {
      const msg =
        e?.info?.error?.message || e?.error?.message || e?.shortMessage || e?.reason || e?.message || String(e);
      setStatus(`❌ ${msg}`);
      console.error(e);
    }
  };

  // --- Viewer: list latest N
  const onLoadRecent = async () => {
    try {
      const c = new ethers.Contract(addr.VerificationContract, VERIF_ABI, provider);
      const total = await c.getTotalVerificationRequests();
      const n = Number(total);
      const take = Math.min(n, 10);
      const ids = [];
      for (let i = n - take; i < n; i++) {
        const id = await c.getVerificationRequestAtIndex(i);
        ids.push(id);
      }
      const items = await Promise.all(ids.map((id) => c.getVerificationRequest(id)));
      setRecent(items.map((item, idx) => ({ id: ids[idx], ...item })));
      setStatus(`✅ Loaded ${take} recent request(s)`);
    } catch (e) {
      const msg =
        e?.info?.error?.message || e?.error?.message || e?.shortMessage || e?.reason || e?.message || String(e);
      setStatus(`❌ ${msg}`);
      console.error(e);
    }
  };

  return (
    <section className="cm-wrap">
      <header className="cm-header">
        <div>
          <h2 className="cm-title">Verification Portal</h2>
          <p className="cm-subtitle">Register ZKP verifiers and verify credentials with proofs</p>
        </div>
        <div className="cm-conn">
          <div className="cm-conn-line">
            <span className="cm-dot" />
            <span className="cm-conn-label">{account ? "Connected" : "Disconnected"}</span>
          </div>
          <code className="cm-addr">{account || "-"}</code>
        </div>
      </header>

      <div className="cm-card cm-card-muted">
        <div className="cm-meta">
          <span>VerificationContract</span>
          <code>{addr.VerificationContract || "-"}</code>
        </div>
        <div className="cm-meta" style={{ marginTop: 6 }}>
          <span>Verifier (ZKP)</span>
          <code>{addr.Verifier || "-"}</code>
        </div>
      </div>

      {/* Admin */}
      <div className="cm-card">
        <div className="cm-card-head">
          <h3>1) Admin — Register ZKP Verifier (onlyOwner)</h3>
          <p className="cm-help">
            Use the owner (deployer) account to map a <code>circuitType</code> to a Verifier contract.
          </p>
        </div>

        <div className="cm-grid">
          <div className="cm-field">
            <label>Circuit Type</label>
            <input value={circuitType} onChange={(e) => setCircuitType(e.target.value)} />
          </div>
          <div className="cm-field">
            <label>Verifier Address</label>
            <input value={verifierAddress} onChange={(e) => setVerifierAddress(e.target.value)} />
          </div>
        </div>

        <div className="cm-actions">
          <button className="cm-btn cm-btn-primary" onClick={onRegisterVerifier}>
            Register Verifier
          </button>
        </div>

        <p className="cm-help" style={{ marginTop: 8 }}>
          Tip: Switch MetaMask to the deployer account (Hardhat Account #0) before running admin actions.
        </p>
      </div>

      {/* Submit */}
      <div className="cm-card">
        <div className="cm-card-head">
          <h3>2) Submit Verification Request</h3>
          <p className="cm-help">
            The contract will call the ZKP Verifier’s <code>verifyProof(bytes,uint256[])</code> and record the result.
          </p>
        </div>

        <div className="cm-grid">
          <div className="cm-field">
            <label>Request ID</label>
            <input value={requestId} onChange={(e) => setRequestId(e.target.value)} />
          </div>
          <div className="cm-field">
            <label>Credential ID</label>
            <input value={credentialId} onChange={(e) => setCredentialId(e.target.value)} />
          </div>
          <div className="cm-field">
            <label>Circuit Type</label>
            <input value={submitCircuitType} onChange={(e) => setSubmitCircuitType(e.target.value)} />
          </div>
          <div className="cm-field">
            <label>Verifier DID</label>
            <input value={verifierDID} onChange={(e) => setVerifierDID(e.target.value)} />
          </div>
          <div className="cm-field cm-field-col2">
            <label>Proof Data (bytes or text)</label>
            <input value={proofData} onChange={(e) => setProofData(e.target.value)} placeholder="0x-prefixed or text" />
          </div>
          <div className="cm-field cm-field-col2">
            <label>Public Inputs (CSV of uint256)</label>
            <input value={publicInputs} onChange={(e) => setPublicInputs(e.target.value)} placeholder="e.g. 42,7" />
          </div>
        </div>

        <div className="cm-actions">
          <button className="cm-btn cm-btn-primary" onClick={onSubmitVerification}>
            Submit Verification
          </button>
        </div>
      </div>

      {/* Viewer */}
      <div className="cm-card">
        <div className="cm-card-head">
          <h3>3) View Verification</h3>
          <p className="cm-help">Lookup by request ID or list recent entries.</p>
        </div>

        <div className="cm-grid">
          <div className="cm-field cm-field-col2">
            <label>Request ID</label>
            <input value={lookupId} onChange={(e) => setLookupId(e.target.value)} />
          </div>
          <div className="cm-actions">
            <button className="cm-btn" onClick={() => onLookupRequest()}>Lookup</button>
            <button className="cm-btn" onClick={onLoadRecent}>Load Recent</button>
          </div>
        </div>

        {/* Single view */}
        {view && (
          <div className="cm-cred" style={{ marginTop: 12 }}>
            <div className="cm-cred-top">
              <div>
                <div className="cm-cred-title">Request — {view.requestId}</div>
                <div className="cm-cred-line"><span>Credential</span><code>{view.credentialId}</code></div>
                <div className="cm-cred-line"><span>Verifier DID</span><code>{view.verifierDID}</code></div>
              </div>
              <span className={`cm-badge ${view.isVerified ? "is-good" : "is-bad"}`}>
                {view.isVerified ? "Verified" : "Not Verified"}
              </span>
            </div>
            <div className="cm-cred-body">
              <div className="cm-cred-kv"><span>Requested At</span><code>{prettyTime(view.requestedAt)}</code></div>
              <div className="cm-cred-kv"><span>Verified At</span><code>{prettyTime(view.verifiedAt)}</code></div>
              <div className="cm-cred-section">
                <div className="cm-cred-subtitle">Result</div>
                <pre className="cm-pre">{view.verificationResult || "-"}</pre>
              </div>
            </div>
          </div>
        )}

        {/* Recent list */}
        {recent?.length > 0 && (
          <div className="cm-grid-list" style={{ marginTop: 12 }}>
            {recent.map((r, i) => (
              <div className="cm-cred" key={`${r.id}-${i}`}>
                <div className="cm-cred-top">
                  <div>
                    <div className="cm-cred-title">Request — {r.requestId}</div>
                    <div className="cm-cred-line"><span>Credential</span><code>{r.credentialId}</code></div>
                    <div className="cm-cred-line"><span>Verifier DID</span><code>{r.verifierDID}</code></div>
                  </div>
                  <span className={`cm-badge ${r.isVerified ? "is-good" : "is-bad"}`}>
                    {r.isVerified ? "Verified" : "Not Verified"}
                  </span>
                </div>
                <div className="cm-cred-body">
                  <div className="cm-cred-kv"><span>Requested At</span><code>{prettyTime(r.requestedAt)}</code></div>
                  <div className="cm-cred-kv"><span>Verified At</span><code>{prettyTime(r.verifiedAt)}</code></div>
                  <div className="cm-cred-section">
                    <div className="cm-cred-subtitle">Result</div>
                    <pre className="cm-pre">{r.verificationResult || "-"}</pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {status && (
        <div className={`cm-toast ${status.startsWith("✅") ? "ok" : status.startsWith("⏳") ? "info" : "err"}`}>
          {status}
        </div>
      )}
    </section>
  );
}
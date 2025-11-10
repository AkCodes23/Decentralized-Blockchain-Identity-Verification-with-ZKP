import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { loadAddresses } from "../lib/addresses";

const ISSUE_ABI = [{
  inputs: [
    { name: "credentialId",   type: "string"   },
    { name: "holderDID",      type: "string"   },
    { name: "credentialType", type: "string"   },
    { name: "credentialHash", type: "string"   },
    { name: "expiresAt",      type: "uint256"  },
    { name: "attributes",     type: "string[]" },
    { name: "metadata",       type: "string"   },
    { name: "issuerDID",      type: "string"   }
  ],
  name: "issueCredential",
  outputs: [],
  stateMutability: "nonpayable",
  type: "function",
}];

// replace your READ_ABI with this:
const READ_ABI = [
  // returns array of credential IDs (strings)
  {
    inputs: [{ name: "holderDID", type: "string" }],
    name: "getCredentialsByHolder",
    outputs: [{ name: "", type: "string[]" }],
    stateMutability: "view",
    type: "function",
  },
  // returns a full Credential struct for a given credentialId
  {
    inputs: [{ name: "credentialId", type: "string" }],
    name: "getCredential",
    outputs: [{
      components: [
        { name: "credentialId",   type: "string"   },
        { name: "issuerDID",      type: "string"   },
        { name: "holderDID",      type: "string"   },
        { name: "credentialType", type: "string"   },
        { name: "credentialHash", type: "string"   },
        { name: "issuedAt",       type: "uint256"  },
        { name: "expiresAt",      type: "uint256"  },
        { name: "isRevoked",      type: "bool"     },
        { name: "attributes",     type: "string[]" },
        { name: "metadata",       type: "string"   },
      ],
      type: "tuple"
    }],
    stateMutability: "view",
    type: "function",
  },
];

export default function CredentialManager({ account, provider, signer }) {
  const [credAddr, setCredAddr] = useState("");
  const [status, setStatus] = useState("");
  const [activeTab, setActiveTab] = useState("issue");

  // form fields
  const [credId, setCredId] = useState(`cred-${Math.floor(Math.random()*1e6)}`);
  const [holderDid, setHolderDid] = useState("did:example:aryan123");
  const [issuerDid, setIssuerDid] = useState("did:example:issuer1");
  const [credType, setCredType] = useState("degree");
  const [credHash, setCredHash] = useState("QmDummyCredentialHash12345");
  const [expiresAt, setExpiresAt] = useState("");
  const [attributes, setAttributes] = useState("year:2025,grade:A+");
  const [metadataText, setMetadataText] = useState("issuedBy=Demo University; program=B.Tech");

  // viewer
  const [lookupDid, setLookupDid] = useState("did:example:aryan123");
  const [list, setList] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const addrs = await loadAddresses();
        if (!addrs?.CredentialRegistry) throw new Error("CredentialRegistry address not found");
        setCredAddr(addrs.CredentialRegistry);
        console.log("✅ Using CredentialRegistry:", addrs.CredentialRegistry);
      } catch (e) {
        setStatus(`❌ Failed to load contract addresses: ${e.message}`);
      }
    })();
  }, []);

  const requireReady = () => {
    if (!provider || !signer || !account) {
      setStatus("❌ Connect your wallet first");
      return false;
    }
    if (!credAddr) {
      setStatus("❌ CredentialRegistry address missing");
      return false;
    }
    return true;
  };

  const onIssueCredential = async () => {
    try {
      if (!requireReady()) return;

      await provider.send("eth_requestAccounts", []);

      const c = new ethers.Contract(credAddr, ISSUE_ABI, signer);
      const attrs = attributes.split(",").map(s => s.trim()).filter(Boolean);
      const expiry = expiresAt ? parseInt(expiresAt) : 0;

      // Preflight
      try {
        await c.issueCredential.staticCall(
          credId, holderDid, credType, credHash, expiry, attrs, metadataText, issuerDid
        );
      } catch (pre) {
        const msg =
          pre?.info?.error?.message ||
          pre?.error?.message ||
          pre?.shortMessage ||
          pre?.reason ||
          pre?.message ||
          "Preflight reverted";
        setStatus(`❌ ${msg}`);
        return;
      }

      setStatus("Submitting issueCredential…");
      const tx = await c.issueCredential(
        credId, holderDid, credType, credHash, expiry, attrs, metadataText, issuerDid
      );
      setStatus(`⏳ Pending: ${tx.hash}`);
      await tx.wait();
      setStatus(`✅ Credential issued: ${credId}`);
    } catch (e) {
      const msg =
        e?.info?.error?.message ||
        e?.error?.message ||
        e?.shortMessage ||
        e?.reason ||
        e?.message ||
        String(e);
      setStatus(`❌ ${msg}`);
      console.error(e);
    }
  };
  const onLoadHolderCredentials = async () => {
    try {
      if (!provider || !credAddr) {
        setStatus("❌ Provider or contract address missing");
        return;
      }
      const c = new ethers.Contract(credAddr, READ_ABI, provider);
      const did = (lookupDid || holderDid).trim();
      if (!did) return setStatus("❌ Provide a Holder DID");
  
      // 1) get IDs
      const ids = await c.getCredentialsByHolder(did);
  
      // 2) fetch each credential detail
      const details = await Promise.all(ids.map(id => c.getCredential(id)));
  
      setList(details);
      setStatus(`✅ Loaded ${details.length} credential(s) for ${did}`);
    } catch (e) {
      const msg =
        e?.info?.error?.message ||
        e?.error?.message ||
        e?.shortMessage ||
        e?.reason ||
        e?.message ||
        String(e);
      setStatus(`❌ ${msg}`);
      console.error(e);
    }
  };

  return (
    <section className="cm-wrap">
      <header className="cm-header">
        <div>
          <h2 className="cm-title">Credential Manager</h2>
          <p className="cm-subtitle">Issue and view verifiable credentials on-chain</p>
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
          <span>CredentialRegistry</span>
          <code>{credAddr || "-"}</code>
        </div>
      </div>

      <div className="cm-tabs">
        <button
          className={`cm-tab ${activeTab === "issue" ? "is-active" : ""}`}
          onClick={() => setActiveTab("issue")}
        >
          Issue
        </button>
        <button
          className={`cm-tab ${activeTab === "view" ? "is-active" : ""}`}
          onClick={() => setActiveTab("view")}
        >
          View
        </button>
      </div>

      {activeTab === "issue" && (
        <div className="cm-card">
          <div className="cm-card-head">
            <h3>Issue Credential</h3>
            <p className="cm-help">Issuer DID must be authorized in the registry.</p>
          </div>

          <div className="cm-grid">
            <div className="cm-field">
              <label>Issuer DID</label>
              <input value={issuerDid} onChange={e => setIssuerDid(e.target.value)} />
            </div>
            <div className="cm-field">
              <label>Credential ID</label>
              <input value={credId} onChange={e => setCredId(e.target.value)} />
            </div>
            <div className="cm-field">
              <label>Holder DID</label>
              <input value={holderDid} onChange={e => setHolderDid(e.target.value)} />
            </div>
            <div className="cm-field">
              <label>Credential Type</label>
              <input value={credType} onChange={e => setCredType(e.target.value)} />
            </div>
            <div className="cm-field">
              <label>Credential Hash (IPFS)</label>
              <input value={credHash} onChange={e => setCredHash(e.target.value)} />
            </div>
            <div className="cm-field">
              <label>Expires At (Unix timestamp)</label>
              <input value={expiresAt} onChange={e => setExpiresAt(e.target.value)} placeholder="0 for none" />
            </div>
            <div className="cm-field cm-field-col2">
              <label>Attributes (comma-separated)</label>
              <input value={attributes} onChange={e => setAttributes(e.target.value)} />
            </div>
            <div className="cm-field cm-field-col2">
              <label>Metadata (single string)</label>
              <input value={metadataText} onChange={e => setMetadataText(e.target.value)} />
            </div>
          </div>

          <div className="cm-actions">
            <button className="cm-btn cm-btn-primary" onClick={onIssueCredential}>
              Issue Credential
            </button>
          </div>
        </div>
      )}

      {activeTab === "view" && (
        <div className="cm-card">
          <div className="cm-card-head">
            <h3>View Credentials</h3>
            <p className="cm-help">Lookup all credentials for a Holder DID.</p>
          </div>

          <div className="cm-grid">
            <div className="cm-field cm-field-col2">
              <label>Holder DID</label>
              <input value={lookupDid} onChange={e => setLookupDid(e.target.value)} />
            </div>
            <div className="cm-actions">
              <button className="cm-btn" onClick={onLoadHolderCredentials}>Load</button>
            </div>
          </div>

          {list.length === 0 ? (
            <div className="cm-empty">No credentials loaded.</div>
          ) : (
            <div className="cm-grid-list">
              {list.map((cr, i) => (
                <div className="cm-cred" key={`${cr.credentialId}-${i}`}>
                  <div className="cm-cred-top">
                    <div>
                      <div className="cm-cred-title">{cr.credentialType} — {cr.credentialId}</div>
                      <div className="cm-cred-line"><span>Issuer</span><code>{cr.issuerDID}</code></div>
                    </div>
                    <span className={`cm-badge ${cr.isRevoked ? "is-bad" : "is-good"}`}>
                      {cr.isRevoked ? "Revoked" : "Valid"}
                    </span>
                  </div>

                  <div className="cm-cred-body">
                    <div className="cm-cred-kv"><span>Hash</span><code>{cr.credentialHash}</code></div>
                    <div className="cm-cred-kv"><span>Issued</span><code>{cr.issuedAt?.toString?.()}</code></div>
                    {cr.expiresAt && cr.expiresAt.toString?.() !== "0" && (
                      <div className="cm-cred-kv"><span>Expires</span><code>{cr.expiresAt.toString?.()}</code></div>
                    )}

                    {cr.attributes?.length > 0 && (
                      <div className="cm-cred-section">
                        <div className="cm-cred-subtitle">Attributes</div>
                        <ul className="cm-list">
                          {cr.attributes.map((a, idx) => <li key={idx}>{a}</li>)}
                        </ul>
                      </div>
                    )}

                    {cr.metadata && (
                      <div className="cm-cred-section">
                        <div className="cm-cred-subtitle">Metadata</div>
                        <pre className="cm-pre">{cr.metadata}</pre>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {status && (
        <div className={`cm-toast ${status.startsWith("✅") ? "ok" : status.startsWith("⏳") ? "info" : "err"}`}>
          {status}
        </div>
      )}
    </section>
  );
}
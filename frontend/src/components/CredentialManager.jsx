// frontend/src/components/CredentialManager.jsx
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { loadAddresses } from "../lib/addresses";

export default function CredentialManager({ account, provider, signer }) {
  const [credAddr, setCredAddr] = useState("");
  const [credContract, setCredContract] = useState(null);
  const [statusMsg, setStatusMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Admin / issuer inputs
  const [issuer, setIssuer] = useState({
    did: "did:example:issuer1",
    name: "Demo University",
    type: "university",
  });
  const [issuerStatus, setIssuerStatus] = useState(null);

  // Issue form
  const [credential, setCredential] = useState({
    id: "",
    holderDID: "did:example:aryan123",
    credentialType: "degree",
    credentialHash: "QmDummyCredentialHash12345",
    expiresAt: "", // unix ts, empty => 0
    attributes: "year:2025,grade:A+",
    metadata: "issuedBy=Demo University; program=B.Tech",
  });

  // View section
  const [holderLookup, setHolderLookup] = useState("did:example:aryan123");
  const [holderCreds, setHolderCreds] = useState([]);

  // ABI (only the functions we call)
  const ABI = [
    // ---- Admin / issuer ----
    {
      inputs: [
        { name: "issuerDID", type: "string" },
        { name: "issuerName", type: "string" },
        { name: "issuerType", type: "string" },
      ],
      name: "registerIssuer",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { name: "issuerDID", type: "string" },
        { name: "authorized", type: "bool" },
      ],
      name: "setIssuerAuthorization",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [{ name: "issuerDID", type: "string" }],
      name: "issuers",
      outputs: [
        { name: "did", type: "string" },
        { name: "name", type: "string" },
        { name: "issuerType", type: "string" },
        { name: "isAuthorized", type: "bool" },
        { name: "registeredAt", type: "uint256" },
      ],
      stateMutability: "view",
      type: "function",
    },

    // ---- Issue credential ----
    {
      inputs: [
        { name: "credentialId", type: "string" },
        { name: "holderDID", type: "string" },
        { name: "credentialType", type: "string" },
        { name: "credentialHash", type: "string" },
        { name: "expiresAt", type: "uint256" },
        { name: "attributes", type: "string[]" },
        { name: "metadata", type: "string" },
        { name: "issuerDID", type: "string" },
      ],
      name: "issueCredential",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },

    // ---- View ----
    {
      inputs: [{ name: "holderDID", type: "string" }],
      name: "getCredentialsByHolder",
      outputs: [{ type: "string[]" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ name: "credentialId", type: "string" }],
      name: "getCredential",
      outputs: [
        {
          components: [
            { name: "credentialId", type: "string" },
            { name: "issuerDID", type: "string" },
            { name: "holderDID", type: "string" },
            { name: "credentialType", type: "string" },
            { name: "credentialHash", type: "string" },
            { name: "issuedAt", type: "uint256" },
            { name: "expiresAt", type: "uint256" },
            { name: "isRevoked", type: "bool" },
            { name: "attributes", type: "string[]" },
            { name: "metadata", type: "string" },
          ],
          name: "",
          type: "tuple",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ name: "credentialId", type: "string" }],
      name: "isCredentialValid",
      outputs: [{ type: "bool" }],
      stateMutability: "view",
      type: "function",
    },
  ];

  // 1) Load addresses once (from backend/public/src fallback)
  useEffect(() => {
    (async () => {
      try {
        const addrs = await loadAddresses();
        setCredAddr(addrs.CredentialRegistry || "");
      } catch (err) {
        console.error("Failed to load addresses:", err);
        setStatusMsg("❌ Failed to load contract addresses");
      }
    })();
  }, []);

  // 2) Build contract only when BOTH signer and credAddr are ready
  useEffect(() => {
    if (!signer || !credAddr) return;
    try {
      const c = new ethers.Contract(credAddr, ABI, signer);
      setCredContract(c);
    } catch (err) {
      console.error("Failed to create contract instance:", err);
      setStatusMsg("❌ Failed to init CredentialRegistry");
    }
  }, [signer, credAddr]);

  // Reusable guard: verify code exists at address
  const requireDeployed = async () => {
    if (!credContract) throw new Error("Contract not ready");
    const onChainProvider = credContract.runner?.provider;
    const code = await onChainProvider.getCode(credAddr);
    if (code === "0x") {
      throw new Error(
        `CredentialRegistry not deployed at ${credAddr}. Check /contract-addresses.json and your Hardhat network (31337).`
      );
    }
  };

  // ---- Admin actions ----
  const registerIssuer = async () => {
    try {
      await requireDeployed();
      setLoading(true);
      setStatusMsg("⏳ Registering issuer...");
      const tx = await credContract.registerIssuer(
        issuer.did,
        issuer.name,
        issuer.type
      );
      await tx.wait();
      setStatusMsg("✅ Issuer registered");
      await fetchIssuerStatus();
    } catch (err) {
      console.error(err);
      setStatusMsg("❌ " + (err.reason || err.message));
    } finally {
      setLoading(false);
    }
  };

  const authorizeIssuer = async () => {
    try {
      await requireDeployed();
      setLoading(true);
      setStatusMsg("⏳ Authorizing issuer...");
      const tx = await credContract.setIssuerAuthorization(issuer.did, true);
      await tx.wait();
      setStatusMsg("✅ Issuer authorized");
      await fetchIssuerStatus();
    } catch (err) {
      console.error(err);
      setStatusMsg("❌ " + (err.reason || err.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchIssuerStatus = async () => {
    try {
      await requireDeployed();
      const info = await credContract.issuers(issuer.did);
      setIssuerStatus(info);
    } catch (err) {
      console.error(err);
      setIssuerStatus(null);
    }
  };

  // ---- Issue credential ----
  const issueCredential = async () => {
    try {
      await requireDeployed();
      setLoading(true);
      setStatusMsg("⏳ Issuing credential...");

      const expires =
        credential.expiresAt && String(credential.expiresAt).trim() !== ""
          ? BigInt(credential.expiresAt)
          : 0n;

      const attrs = credential.attributes
        ? credential.attributes.split(",").map((a) => a.trim()).filter(Boolean)
        : [];

      const tx = await credContract.issueCredential(
        credential.id || `cred-${Date.now()}`,
        credential.holderDID,
        credential.credentialType,
        credential.credentialHash,
        expires,
        attrs,
        credential.metadata || "",
        issuer.did
      );
      await tx.wait();
      setStatusMsg("✅ Credential issued");
      // Auto refresh the holder list with the same DID
      await loadHolderCredentials();
    } catch (err) {
      console.error(err);
      setStatusMsg("❌ " + (err.reason || err.message));
    } finally {
      setLoading(false);
    }
  };

  // ---- View credentials for a holder ----
  const loadHolderCredentials = async () => {
    try {
      await requireDeployed();
      setLoading(true);
      setStatusMsg("⏳ Loading holder credentials...");

      const ids = await credContract.getCredentialsByHolder(holderLookup);

      // If no credentials yet, clear & exit gracefully
      if (!ids || ids.length === 0) {
        setHolderCreds([]);
        setStatusMsg("ℹ️ No credentials for this holder DID yet.");
        return;
      }

      const rows = [];
      for (const id of ids) {
        try {
          const c = await credContract.getCredential(id);
          const valid = await credContract.isCredentialValid(id);
          rows.push({
            id: c.credentialId,
            type: c.credentialType,
            issuer: c.issuerDID,
            holder: c.holderDID,
            hash: c.credentialHash,
            issuedAt: c.issuedAt?.toString?.() ?? String(c.issuedAt),
            expiresAt: c.expiresAt?.toString?.() ?? String(c.expiresAt),
            isRevoked: Boolean(c.isRevoked),
            attributes: Array.isArray(c.attributes) ? c.attributes : [],
            metadata: c.metadata || "",
            isValid: Boolean(valid),
          });
        } catch (inner) {
          console.warn("Skipped bad credential id:", id, inner?.reason || inner?.message);
        }
      }

      setHolderCreds(rows);
      setStatusMsg(`✅ Loaded ${rows.length} credential(s).`);
    } catch (err) {
      console.error(err);
      setStatusMsg("❌ Failed to load credentials: " + (err.reason || err.message));
      setHolderCreds([]); // ensure render doesn't try to decode empty
    } finally {
      setLoading(false);
    }
  };

  // ---- UI ----
  const field = (label, value, onChange, placeholder = "", type = "text") => (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ fontWeight: 600 }}>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          padding: "10px 12px",
          borderRadius: 10,
          border: "1px solid #e5e7eb",
          outline: "none",
        }}
      />
    </label>
  );

  const Section = ({ title, hint, children }) => (
    <div
      style={{
        padding: 16,
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        background: "#fff",
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h3 style={{ margin: 0 }}>{title}</h3>
        {hint && (
          <small style={{ opacity: 0.7 }}>
            {hint}
          </small>
        )}
      </div>
      <div style={{ display: "grid", gap: 12, marginTop: 10 }}>{children}</div>
    </div>
  );

  return (
    <div className="card" style={{ padding: 20 }}>
      <h2>🎓 Credential Manager</h2>
      <p style={{ marginTop: 0 }}>
        <b>Connected:</b> {account}
        <br />
        <b>CredentialRegistry:</b> {credAddr || "(loading...)"} <br />
        <small style={{ opacity: 0.7 }}>
          Make sure MetaMask is on <code>Hardhat (31337)</code> and the address above has code.
        </small>
      </p>

      <div style={{ display: "grid", gap: 16 }}>
        {/* Admin */}
        <Section
          title="1) Admin — Register & Authorize Issuer"
          hint="Run as deployer (Hardhat Account #0). Then anyone can issue using this issuer DID."
        >
          {field("Issuer DID", issuer.did, (v) => setIssuer({ ...issuer, did: v }))}
          {field("Issuer Name", issuer.name, (v) => setIssuer({ ...issuer, name: v }))}
          {field("Issuer Type", issuer.type, (v) => setIssuer({ ...issuer, type: v }))}

          <div style={{ display: "flex", gap: 10 }}>
            <button disabled={loading || !credContract} onClick={registerIssuer}>
              Register Issuer (onlyOwner)
            </button>
            <button disabled={loading || !credContract} onClick={authorizeIssuer}>
              Authorize Issuer (onlyOwner)
            </button>
            <button disabled={loading || !credContract} onClick={fetchIssuerStatus}>
              Refresh Status
            </button>
          </div>

          {issuerStatus && (
            <div style={{ fontSize: 14 }}>
              Authorized: {issuerStatus.isAuthorized ? "✅ true" : "❌ false"} <br />
              Registered At:{" "}
              {issuerStatus.registeredAt?.toString() !== "0"
                ? new Date(Number(issuerStatus.registeredAt) * 1000).toLocaleString()
                : "-"}
            </div>
          )}
        </Section>

        {/* Issue */}
        <Section title="2) Issue Credential">
          {field("Holder DID", credential.holderDID, (v) => setCredential({ ...credential, holderDID: v }))}
          {field("Credential Type", credential.credentialType, (v) => setCredential({ ...credential, credentialType: v }))}
          {field("Credential Hash (IPFS)", credential.credentialHash, (v) => setCredential({ ...credential, credentialHash: v }))}
          {field("Expires At (Unix timestamp)", credential.expiresAt, (v) => setCredential({ ...credential, expiresAt: v }), "0 or empty = no expiry")}
          {field("Attributes (comma separated)", credential.attributes, (v) => setCredential({ ...credential, attributes: v }), "year:2025,grade:A+")}
          {field("Metadata", credential.metadata, (v) => setCredential({ ...credential, metadata: v }), "issuedBy=..., program=...")}
          <button disabled={loading || !credContract} onClick={issueCredential}>
            Issue Credential
          </button>
        </Section>

        {/* View */}
        <Section title="3) View Credentials">
          {field("Holder DID (lookup)", holderLookup, setHolderLookup)}
          <button disabled={loading || !credContract || !credAddr} onClick={loadHolderCredentials}>
            Load Holder Credentials
          </button>

          <div style={{ display: "grid", gap: 12 }}>
            {holderCreds.length === 0 ? (
              <p style={{ margin: 0, opacity: 0.8 }}>No credentials found.</p>
            ) : (
              holderCreds.map((c) => (
                <div
                  key={c.id}
                  style={{
                    padding: 14,
                    borderRadius: 10,
                    border: "1px solid #e5e7eb",
                    background: "#fff",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 6,
                    }}
                  >
                    <b>{c.type}</b>
                    <span
                      style={{
                        background: c.isRevoked ? "#ffe6e6" : "#e6ffed",
                        color: c.isRevoked ? "#a00" : "#0a0",
                        padding: "3px 8px",
                        borderRadius: 6,
                        fontSize: 12,
                      }}
                    >
                      {c.isRevoked ? "Revoked" : c.isValid ? "Valid" : "Invalid"}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, margin: 0 }}>
                    <b>ID:</b> {c.id} <br />
                    <b>Issuer:</b> {c.issuer} <br />
                    <b>Holder:</b> {c.holder} <br />
                    <b>Issued:</b>{" "}
                    {c.issuedAt !== "0"
                      ? new Date(Number(c.issuedAt) * 1000).toLocaleString()
                      : "-"}
                    <br />
                    <b>Expires:</b>{" "}
                    {c.expiresAt !== "0"
                      ? new Date(Number(c.expiresAt) * 1000).toLocaleString()
                      : "No expiry"}
                  </p>
                  <p style={{ fontSize: 13, marginTop: 6, whiteSpace: "pre-wrap" }}>
                    <b>Attributes:</b> {c.attributes.join(", ")}
                    <br />
                    <b>Metadata:</b> {c.metadata}
                  </p>
                </div>
              ))
            )}
          </div>
        </Section>
      </div>

      <div style={{ marginTop: 16 }}>
        <h3>Status</h3>
        <pre
          style={{
            background: "#f8f9fa",
            padding: 10,
            borderRadius: 6,
            fontSize: 13,
            whiteSpace: "pre-wrap",
          }}
        >
          {statusMsg || "Idle"}
        </pre>
      </div>
    </div>
  );
}
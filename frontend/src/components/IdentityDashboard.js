// frontend/src/components/IdentityDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/client';

const IdentityDashboard = ({ account }) => {
  const [did, setDid] = useState(null);
  const [didDocument, setDidDocument] = useState(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false); // for deactivate/reactivate buttons
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const loadDIDDocument = useCallback(async (didValue) => {
    try {
      const response = await api.get(`/api/identity/${didValue}`);
      if (response.data?.success) {
        setDidDocument(response.data);
      } else {
        setDidDocument(null);
      }
    } catch (err) {
      console.error('Error loading DID document:', err);
      setDidDocument(null);
    }
  }, []);

  const loadIdentity = useCallback(async () => {
    if (!account) return;
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await api.get(`/api/identity/address/${account}`);
      if (response.data?.success && response.data.did) {
        setDid(response.data.did);
        await loadDIDDocument(response.data.did);
      } else {
        // No DID for this account
        setDid(null);
        setDidDocument(null);
      }
    } catch (err) {
      console.error('Error loading identity:', err);
      setDid(null);
      setDidDocument(null);
    } finally {
      setLoading(false);
    }
  }, [account, loadDIDDocument]);

  useEffect(() => {
    loadIdentity();
  }, [loadIdentity]);

  const handleDeactivateDID = async () => {
    if (!did) return;
    if (!window.confirm('Are you sure you want to deactivate this DID?')) return;

    try {
      setBusy(true);
      setError(null);
      setSuccess(null);

      const response = await api.post(`/api/identity/${did}/deactivate`);
      if (response.data?.success) {
        setSuccess('DID deactivated successfully!');
        await loadDIDDocument(did);
      } else {
        setError(response.data?.error || 'Failed to deactivate DID');
      }
    } catch (err) {
      console.error('Error deactivating DID:', err);
      setError(err.response?.data?.error || 'Failed to deactivate DID');
    } finally {
      setBusy(false);
    }
  };

  const handleReactivateDID = async () => {
    if (!did) return;

    try {
      setBusy(true);
      setError(null);
      setSuccess(null);

      const response = await api.post(`/api/identity/${did}/reactivate`);
      if (response.data?.success) {
        setSuccess('DID reactivated successfully!');
        await loadDIDDocument(did);
      } else {
        setError(response.data?.error || 'Failed to reactivate DID');
      }
    } catch (err) {
      console.error('Error reactivating DID:', err);
      setError(err.response?.data?.error || 'Failed to reactivate DID');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="loading"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div>
      {error && <div className="error" style={{ marginBottom: 12 }}>{error}</div>}
      {success && <div className="success" style={{ marginBottom: 12 }}>{success}</div>}

      {!did ? (
        <div className="card">
          <h2>Identity Overview</h2>
          <p>No DID found for this account.</p>
          <p style={{ marginTop: 8 }}>
            Use the <strong>DID Panel</strong> below to create a new DID.
          </p>
        </div>
      ) : (
        <div className="grid">
          <div className="card">
            <h2>Your Identity</h2>
            <div style={{ marginBottom: 10 }}>
              <strong>DID:</strong> {did}
            </div>
            <div style={{ marginBottom: 10 }}>
              <strong>Status:</strong>{' '}
              <span className={`status-badge ${didDocument?.isActive ? 'status-active' : 'status-inactive'}`}>
                {didDocument?.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div style={{ marginBottom: 10 }}>
              <strong>Owner:</strong> {account}
            </div>
            {didDocument?.createdAt && (
              <div style={{ marginBottom: 10 }}>
                <strong>Created:</strong>{' '}
                {new Date(didDocument.createdAt).toLocaleString()}
              </div>
            )}

            <div style={{ marginTop: 16 }}>
              {didDocument?.isActive ? (
                <button
                  className="btn btn-danger"
                  onClick={handleDeactivateDID}
                  disabled={busy}
                >
                  {busy ? 'Working…' : 'Deactivate DID'}
                </button>
              ) : (
                <button
                  className="btn btn-success"
                  onClick={handleReactivateDID}
                  disabled={busy}
                >
                  {busy ? 'Working…' : 'Reactivate DID'}
                </button>
              )}
            </div>
          </div>

          <div className="card">
            <h3>DID Document</h3>
            {didDocument ? (
              <div>
                {Array.isArray(didDocument.didDocument?.publicKey) && (
                  <>
                    <h4>Public Keys:</h4>
                    <ul>
                      {didDocument.didDocument.publicKey.map((key, idx) => (
                        <li key={idx}>
                          <strong>{key.id}:</strong> {key.publicKeyHex}
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                {Array.isArray(didDocument.didDocument?.service) && (
                  <>
                    <h4>Services:</h4>
                    <ul>
                      {didDocument.didDocument.service.map((svc, idx) => (
                        <li key={idx}>
                          <strong>{svc.type}:</strong> {svc.serviceEndpoint}
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                <h4>Raw Document:</h4>
                <pre style={{
                  backgroundColor: '#f8f9fa',
                  padding: 10,
                  borderRadius: 4,
                  fontSize: 12,
                  overflow: 'auto',
                  maxHeight: 220
                }}>
                  {JSON.stringify(didDocument.didDocument, null, 2)}
                </pre>
              </div>
            ) : (
              <p>Loading DID document...</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default IdentityDashboard;
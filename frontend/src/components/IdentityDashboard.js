import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/client';

const IdentityDashboard = ({ account, provider, signer }) => {
  const [did, setDid] = useState(null);
  const [didDocument, setDidDocument] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    did: '',
    publicKeys: [''],
    services: ['']
  });

  const loadIdentity = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/identity/address/${account}`);
      if (response.data.success) {
        setDid(response.data.did);
        loadDIDDocument(response.data.did);
      }
    } catch (error) {
      console.error('Error loading identity:', error);
      // Identity doesn't exist yet
    } finally {
      setLoading(false);
    }
  }, [account]);

  useEffect(() => {
    if (account) {
      loadIdentity();
    }
  }, [account, loadIdentity]);

  const loadDIDDocument = async (did) => {
    try {
      const response = await api.get(`/api/identity/${did}`);
      if (response.data.success) {
        setDidDocument(response.data);
      }
    } catch (error) {
      console.error('Error loading DID document:', error);
    }
  };

  const generateDID = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `did:example:${timestamp}${random}`;
  };

  const handleCreateDID = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const didToCreate = formData.did || generateDID();
      
      const response = await api.post(`/api/identity/create`, {
        did: didToCreate,
        publicKeys: formData.publicKeys.filter(key => key.trim() !== ''),
        services: formData.services.filter(service => service.trim() !== ''),
        metadata: {
          createdBy: account,
          createdAt: new Date().toISOString()
        }
      });

      if (response.data.success) {
        setDid(response.data.did);
        setDidDocument(response.data.didDocument);
        setSuccess('DID created successfully!');
        setShowCreateForm(false);
        setFormData({ did: '', publicKeys: [''], services: [''] });
      }
    } catch (error) {
      console.error('Error creating DID:', error);
      setError(error.response?.data?.error || 'Failed to create DID');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateDID = async () => {
    if (!window.confirm('Are you sure you want to deactivate this DID?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await api.post(`/api/identity/${did}/deactivate`);
      if (response.data.success) {
        setSuccess('DID deactivated successfully!');
        loadDIDDocument(did);
      }
    } catch (error) {
      console.error('Error deactivating DID:', error);
      setError(error.response?.data?.error || 'Failed to deactivate DID');
    } finally {
      setLoading(false);
    }
  };

  const handleReactivateDID = async () => {
    try {
      setLoading(true);
      const response = await api.post(`/api/identity/${did}/reactivate`);
      if (response.data.success) {
        setSuccess('DID reactivated successfully!');
        loadDIDDocument(did);
      }
    } catch (error) {
      console.error('Error reactivating DID:', error);
      setError(error.response?.data?.error || 'Failed to reactivate DID');
    } finally {
      setLoading(false);
    }
  };

  const addPublicKey = () => {
    setFormData({
      ...formData,
      publicKeys: [...formData.publicKeys, '']
    });
  };

  const removePublicKey = (index) => {
    setFormData({
      ...formData,
      publicKeys: formData.publicKeys.filter((_, i) => i !== index)
    });
  };

  const updatePublicKey = (index, value) => {
    const newPublicKeys = [...formData.publicKeys];
    newPublicKeys[index] = value;
    setFormData({ ...formData, publicKeys: newPublicKeys });
  };

  const addService = () => {
    setFormData({
      ...formData,
      services: [...formData.services, '']
    });
  };

  const removeService = (index) => {
    setFormData({
      ...formData,
      services: formData.services.filter((_, i) => i !== index)
    });
  };

  const updateService = (index, value) => {
    const newServices = [...formData.services];
    newServices[index] = value;
    setFormData({ ...formData, services: newServices });
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
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      {!did ? (
        <div className="card">
          <h2>Create Your Decentralized Identity</h2>
          <p>You don't have a DID yet. Create one to start using the system.</p>
          
          {!showCreateForm ? (
            <button className="btn" onClick={() => setShowCreateForm(true)}>
              Create DID
            </button>
          ) : (
            <form onSubmit={handleCreateDID}>
              <div className="form-group">
                <label>DID (leave empty for auto-generation):</label>
                <input
                  type="text"
                  value={formData.did}
                  onChange={(e) => setFormData({ ...formData, did: e.target.value })}
                  placeholder="did:example:your-identifier"
                />
              </div>

              <div className="form-group">
                <label>Public Keys:</label>
                {formData.publicKeys.map((key, index) => (
                  <div key={index} style={{ display: 'flex', marginBottom: '10px' }}>
                    <input
                      type="text"
                      value={key}
                      onChange={(e) => updatePublicKey(index, e.target.value)}
                      placeholder="Enter public key"
                      style={{ flex: 1, marginRight: '10px' }}
                    />
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => removePublicKey(index)}
                      disabled={formData.publicKeys.length === 1}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button type="button" className="btn" onClick={addPublicKey}>
                  Add Public Key
                </button>
              </div>

              <div className="form-group">
                <label>Services:</label>
                {formData.services.map((service, index) => (
                  <div key={index} style={{ display: 'flex', marginBottom: '10px' }}>
                    <input
                      type="text"
                      value={service}
                      onChange={(e) => updateService(index, e.target.value)}
                      placeholder="Enter service endpoint"
                      style={{ flex: 1, marginRight: '10px' }}
                    />
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => removeService(index)}
                      disabled={formData.services.length === 1}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button type="button" className="btn" onClick={addService}>
                  Add Service
                </button>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-success" disabled={loading}>
                  {loading ? 'Creating...' : 'Create DID'}
                </button>
                <button type="button" className="btn" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        <div className="grid">
          <div className="card">
            <h2>Your Identity</h2>
            <div style={{ marginBottom: '15px' }}>
              <strong>DID:</strong> {did}
            </div>
            <div style={{ marginBottom: '15px' }}>
              <strong>Status:</strong> 
              <span className={`status-badge ${didDocument?.isActive ? 'status-active' : 'status-inactive'}`}>
                {didDocument?.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <strong>Owner:</strong> {account}
            </div>
            {didDocument?.createdAt && (
              <div style={{ marginBottom: '15px' }}>
                <strong>Created:</strong> {new Date(didDocument.createdAt).toLocaleString()}
              </div>
            )}

            <div style={{ marginTop: '20px' }}>
              {didDocument?.isActive ? (
                <button className="btn btn-danger" onClick={handleDeactivateDID} disabled={loading}>
                  Deactivate DID
                </button>
              ) : (
                <button className="btn btn-success" onClick={handleReactivateDID} disabled={loading}>
                  Reactivate DID
                </button>
              )}
            </div>
          </div>

          <div className="card">
            <h3>DID Document</h3>
            {didDocument ? (
              <div>
                <h4>Public Keys:</h4>
                <ul>
                  {didDocument.didDocument?.publicKey?.map((key, index) => (
                    <li key={index}>
                      <strong>{key.id}:</strong> {key.publicKeyHex}
                    </li>
                  ))}
                </ul>

                <h4>Services:</h4>
                <ul>
                  {didDocument.didDocument?.service?.map((service, index) => (
                    <li key={index}>
                      <strong>{service.type}:</strong> {service.serviceEndpoint}
                    </li>
                  ))}
                </ul>

                <h4>Raw Document:</h4>
                <pre style={{ 
                  backgroundColor: '#f8f9fa', 
                  padding: '10px', 
                  borderRadius: '4px',
                  fontSize: '12px',
                  overflow: 'auto',
                  maxHeight: '200px'
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

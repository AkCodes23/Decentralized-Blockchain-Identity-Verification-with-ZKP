import React, { useState, useEffect } from 'react';
import api from '../api/client';

const CredentialManager = ({ account, provider, signer }) => {
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('view');
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [formData, setFormData] = useState({
    credentialId: '',
    holderDID: '',
    credentialType: 'EducationalCredential',
    credentialData: {},
    expiresAt: '',
    attributes: [''],
    metadata: {}
  });

  const loadCredentials = async () => {
    try {
      setLoading(true);
      // First get the DID for this account
      const didResponse = await api.get(`/api/identity/address/${account}`);
      if (didResponse.data.success) {
        const did = didResponse.data.did;
        const response = await api.get(`/api/credentials/holder/${did}`);
        if (response.data.success) {
          setCredentials(response.data.credentials);
        }
      }
    } catch (error) {
      console.error('Error loading credentials:', error);
      setError('Failed to load credentials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (account) {
      loadCredentials();
    }
  }, [account]);

  const handleIssueCredential = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const response = await api.post(`/api/credentials/issue`, {
        credentialId: formData.credentialId || `cred_${Date.now()}`,
        holderDID: formData.holderDID,
        credentialType: formData.credentialType,
        credentialData: formData.credentialData,
        expiresAt: formData.expiresAt || null,
        attributes: formData.attributes.filter(attr => attr.trim() !== ''),
        metadata: formData.metadata
      });

      if (response.data.success) {
        setSuccess('Credential issued successfully!');
        setShowIssueForm(false);
        setFormData({
          credentialId: '',
          holderDID: '',
          credentialType: 'EducationalCredential',
          credentialData: {},
          expiresAt: '',
          attributes: [''],
          metadata: {}
        });
        loadCredentials();
      }
    } catch (error) {
      console.error('Error issuing credential:', error);
      setError(error.response?.data?.error || 'Failed to issue credential');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeCredential = async (credentialId) => {
    if (!window.confirm('Are you sure you want to revoke this credential?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await api.post(`/api/credentials/${credentialId}/revoke`);
      if (response.data.success) {
        setSuccess('Credential revoked successfully!');
        loadCredentials();
      }
    } catch (error) {
      console.error('Error revoking credential:', error);
      setError(error.response?.data?.error || 'Failed to revoke credential');
    } finally {
      setLoading(false);
    }
  };

  const addAttribute = () => {
    setFormData({
      ...formData,
      attributes: [...formData.attributes, '']
    });
  };

  const removeAttribute = (index) => {
    setFormData({
      ...formData,
      attributes: formData.attributes.filter((_, i) => i !== index)
    });
  };

  const updateAttribute = (index, value) => {
    const newAttributes = [...formData.attributes];
    newAttributes[index] = value;
    setFormData({ ...formData, attributes: newAttributes });
  };

  const updateCredentialData = (key, value) => {
    setFormData({
      ...formData,
      credentialData: {
        ...formData.credentialData,
        [key]: value
      }
    });
  };

  const renderCredentialCard = (credential) => (
    <div key={credential.credentialId} className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3>{credential.credentialType}</h3>
          <p><strong>ID:</strong> {credential.credentialId}</p>
          <p><strong>Issuer:</strong> {credential.issuerDID}</p>
          <p><strong>Issued:</strong> {new Date(parseInt(credential.issuedAt) * 1000).toLocaleString()}</p>
          {credential.expiresAt !== '0' && (
            <p><strong>Expires:</strong> {new Date(parseInt(credential.expiresAt) * 1000).toLocaleString()}</p>
          )}
        </div>
        <div>
          <span className={`status-badge ${credential.isValid ? 'status-verified' : 'status-revoked'}`}>
            {credential.isValid ? 'Valid' : 'Revoked'}
          </span>
        </div>
      </div>

      {credential.attributes && credential.attributes.length > 0 && (
        <div style={{ marginTop: '15px' }}>
          <h4>Attributes:</h4>
          <ul>
            {credential.attributes.map((attr, index) => (
              <li key={index}>{attr}</li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
        <button 
          className="btn" 
          onClick={() => window.open(`/api/credentials/${credential.credentialId}`, '_blank')}
        >
          View Details
        </button>
        {credential.isValid && (
          <button 
            className="btn btn-danger" 
            onClick={() => handleRevokeCredential(credential.credentialId)}
            disabled={loading}
          >
            Revoke
          </button>
        )}
      </div>
    </div>
  );

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

      <div className="tab-container">
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'view' ? 'active' : ''}`}
            onClick={() => setActiveTab('view')}
          >
            My Credentials
          </button>
          <button 
            className={`tab ${activeTab === 'issue' ? 'active' : ''}`}
            onClick={() => setActiveTab('issue')}
          >
            Issue Credential
          </button>
        </div>
      </div>

      <div className="tab-content">
        {activeTab === 'view' && (
          <div>
            <h2>My Credentials</h2>
            {credentials.length === 0 ? (
              <div className="card">
                <p>You don't have any credentials yet.</p>
                <p>Ask an issuer to issue you a credential, or switch to the "Issue Credential" tab to issue one yourself.</p>
              </div>
            ) : (
              <div className="grid">
                {credentials.map(renderCredentialCard)}
              </div>
            )}
          </div>
        )}

        {activeTab === 'issue' && (
          <div>
            <h2>Issue New Credential</h2>
            {!showIssueForm ? (
              <div className="card">
                <p>Issue a new credential to someone.</p>
                <button className="btn" onClick={() => setShowIssueForm(true)}>
                  Issue Credential
                </button>
              </div>
            ) : (
              <div className="card">
                <form onSubmit={handleIssueCredential}>
                  <div className="form-group">
                    <label>Credential ID (leave empty for auto-generation):</label>
                    <input
                      type="text"
                      value={formData.credentialId}
                      onChange={(e) => setFormData({ ...formData, credentialId: e.target.value })}
                      placeholder="cred_12345"
                    />
                  </div>

                  <div className="form-group">
                    <label>Holder DID:</label>
                    <input
                      type="text"
                      value={formData.holderDID}
                      onChange={(e) => setFormData({ ...formData, holderDID: e.target.value })}
                      placeholder="did:example:holder123"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Credential Type:</label>
                    <select
                      value={formData.credentialType}
                      onChange={(e) => setFormData({ ...formData, credentialType: e.target.value })}
                    >
                      <option value="EducationalCredential">Educational Credential</option>
                      <option value="ProfessionalCredential">Professional Credential</option>
                      <option value="IdentityCredential">Identity Credential</option>
                      <option value="AgeCredential">Age Credential</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Credential Data:</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <input
                        type="text"
                        placeholder="Field name (e.g., degree)"
                        onChange={(e) => setFormData({ ...formData, tempFieldName: e.target.value })}
                      />
                      <input
                        type="text"
                        placeholder="Field value (e.g., Computer Science)"
                        onChange={(e) => {
                          if (formData.tempFieldName) {
                            updateCredentialData(formData.tempFieldName, e.target.value);
                          }
                        }}
                      />
                    </div>
                    <div style={{ marginTop: '10px' }}>
                      <strong>Current data:</strong>
                      <pre style={{ 
                        backgroundColor: '#f8f9fa', 
                        padding: '10px', 
                        borderRadius: '4px',
                        fontSize: '12px',
                        marginTop: '5px'
                      }}>
                        {JSON.stringify(formData.credentialData, null, 2)}
                      </pre>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Expiration Date (optional):</label>
                    <input
                      type="datetime-local"
                      value={formData.expiresAt}
                      onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Attributes:</label>
                    {formData.attributes.map((attr, index) => (
                      <div key={index} style={{ display: 'flex', marginBottom: '10px' }}>
                        <input
                          type="text"
                          value={attr}
                          onChange={(e) => updateAttribute(index, e.target.value)}
                          placeholder="Enter attribute"
                          style={{ flex: 1, marginRight: '10px' }}
                        />
                        <button
                          type="button"
                          className="btn btn-danger"
                          onClick={() => removeAttribute(index)}
                          disabled={formData.attributes.length === 1}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button type="button" className="btn" onClick={addAttribute}>
                      Add Attribute
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" className="btn btn-success" disabled={loading}>
                      {loading ? 'Issuing...' : 'Issue Credential'}
                    </button>
                    <button type="button" className="btn" onClick={() => setShowIssueForm(false)}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CredentialManager;

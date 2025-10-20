import React, { useState, useEffect } from 'react';
import api from '../api/client';

const VerificationPortal = ({ account, provider, signer }) => {
  const [verificationRequests, setVerificationRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('verify');
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const [showCredentialVerification, setShowCredentialVerification] = useState(false);
  const [formData, setFormData] = useState({
    age: '',
    minAge: '',
    credentialId: '',
    credentialHash: '',
    holderPublicKey: '',
    expectedHash: ''
  });

  useEffect(() => {
    loadVerificationRequests();
  }, []);

  const loadVerificationRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/verification/requests/all`);
      if (response.data.success) {
        setVerificationRequests(response.data.requests);
      }
    } catch (error) {
      console.error('Error loading verification requests:', error);
      setError('Failed to load verification requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAgeVerification = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const response = await api.post(`/api/verification/age`, {
        age: parseInt(formData.age),
        minAge: parseInt(formData.minAge)
      });

      if (response.data.success) {
        setSuccess('Age verification proof generated successfully!');
        setShowAgeVerification(false);
        setFormData({ ...formData, age: '', minAge: '' });
        
        // Submit verification request
        await submitVerificationRequest('age_verification', response.data.proof, [formData.minAge]);
      }
    } catch (error) {
      console.error('Error generating age verification proof:', error);
      setError(error.response?.data?.error || 'Failed to generate age verification proof');
    } finally {
      setLoading(false);
    }
  };

  const handleCredentialVerification = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const response = await api.post(`/api/verification/credential-ownership`, {
        credentialHash: formData.credentialHash,
        holderPublicKey: formData.holderPublicKey,
        expectedHash: formData.expectedHash
      });

      if (response.data.success) {
        setSuccess('Credential ownership proof generated successfully!');
        setShowCredentialVerification(false);
        setFormData({ 
          ...formData, 
          credentialHash: '', 
          holderPublicKey: '', 
          expectedHash: '' 
        });
        
        // Submit verification request
        await submitVerificationRequest('credential_ownership', response.data.proof, [formData.expectedHash]);
      }
    } catch (error) {
      console.error('Error generating credential ownership proof:', error);
      setError(error.response?.data?.error || 'Failed to generate credential ownership proof');
    } finally {
      setLoading(false);
    }
  };

  const submitVerificationRequest = async (circuitType, proof, publicInputs) => {
    try {
      const credentialId = formData.credentialId || `cred_${Date.now()}`;
      
      const response = await api.post(`/api/verification/request`, {
        credentialId,
        circuitType,
        proofData: proof,
        publicInputs
      });

      if (response.data.success) {
        setSuccess('Verification request submitted successfully!');
        loadVerificationRequests();
      }
    } catch (error) {
      console.error('Error submitting verification request:', error);
      setError(error.response?.data?.error || 'Failed to submit verification request');
    }
  };

  const renderVerificationRequest = (request) => (
    <div key={request.requestId} className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3>Verification Request</h3>
          <p><strong>Request ID:</strong> {request.requestId}</p>
          <p><strong>Credential ID:</strong> {request.credentialId}</p>
          <p><strong>Verifier:</strong> {request.verifierDID}</p>
          <p><strong>Requested:</strong> {new Date(parseInt(request.requestedAt) * 1000).toLocaleString()}</p>
          {request.verifiedAt !== '0' && (
            <p><strong>Verified:</strong> {new Date(parseInt(request.verifiedAt) * 1000).toLocaleString()}</p>
          )}
        </div>
        <div>
          <span className={`status-badge ${request.isVerified ? 'status-verified' : 'status-inactive'}`}>
            {request.isVerified ? 'Verified' : 'Pending'}
          </span>
        </div>
      </div>

      {request.verificationResult && (
        <div style={{ marginTop: '15px' }}>
          <h4>Verification Result:</h4>
          <p>{request.verificationResult}</p>
        </div>
      )}

      <div style={{ marginTop: '15px' }}>
        <button 
          className="btn" 
          onClick={() => window.open(`/api/verification/${request.requestId}`, '_blank')}
        >
          View Details
        </button>
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
            className={`tab ${activeTab === 'verify' ? 'active' : ''}`}
            onClick={() => setActiveTab('verify')}
          >
            Verify Credentials
          </button>
          <button 
            className={`tab ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            Verification Requests
          </button>
        </div>
      </div>

      <div className="tab-content">
        {activeTab === 'verify' && (
          <div>
            <h2>Zero-Knowledge Proof Verification</h2>
            
            <div className="grid">
              <div className="card">
                <h3>Age Verification</h3>
                <p>Prove you are above a certain age without revealing your exact age.</p>
                
                {!showAgeVerification ? (
                  <button className="btn" onClick={() => setShowAgeVerification(true)}>
                    Start Age Verification
                  </button>
                ) : (
                  <form onSubmit={handleAgeVerification}>
                    <div className="form-group">
                      <label>Your Age (private):</label>
                      <input
                        type="number"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                        placeholder="25"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Minimum Required Age (public):</label>
                      <input
                        type="number"
                        value={formData.minAge}
                        onChange={(e) => setFormData({ ...formData, minAge: e.target.value })}
                        placeholder="18"
                        required
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button type="submit" className="btn btn-success" disabled={loading}>
                        {loading ? 'Generating Proof...' : 'Generate Proof'}
                      </button>
                      <button type="button" className="btn" onClick={() => setShowAgeVerification(false)}>
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>

              <div className="card">
                <h3>Credential Ownership</h3>
                <p>Prove you own a specific credential without revealing the credential details.</p>
                
                {!showCredentialVerification ? (
                  <button className="btn" onClick={() => setShowCredentialVerification(true)}>
                    Start Credential Verification
                  </button>
                ) : (
                  <form onSubmit={handleCredentialVerification}>
                    <div className="form-group">
                      <label>Credential Hash (private):</label>
                      <input
                        type="text"
                        value={formData.credentialHash}
                        onChange={(e) => setFormData({ ...formData, credentialHash: e.target.value })}
                        placeholder="0x1234..."
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Your Public Key (private):</label>
                      <input
                        type="text"
                        value={formData.holderPublicKey}
                        onChange={(e) => setFormData({ ...formData, holderPublicKey: e.target.value })}
                        placeholder="0x5678..."
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Expected Hash (public):</label>
                      <input
                        type="text"
                        value={formData.expectedHash}
                        onChange={(e) => setFormData({ ...formData, expectedHash: e.target.value })}
                        placeholder="0x1234..."
                        required
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button type="submit" className="btn btn-success" disabled={loading}>
                        {loading ? 'Generating Proof...' : 'Generate Proof'}
                      </button>
                      <button type="button" className="btn" onClick={() => setShowCredentialVerification(false)}>
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            <div className="card" style={{ marginTop: '20px' }}>
              <h3>How Zero-Knowledge Proofs Work</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                <div>
                  <h4>🔒 Privacy</h4>
                  <p>Your sensitive data remains private. Only the proof is shared, not the actual data.</p>
                </div>
                <div>
                  <h4>✅ Verification</h4>
                  <p>The verifier can confirm the proof is valid without seeing your private information.</p>
                </div>
                <div>
                  <h4>🎯 Selective Disclosure</h4>
                  <p>You can prove specific attributes without revealing other information.</p>
                </div>
                <div>
                  <h4>🔐 Cryptographic Security</h4>
                  <p>Proofs are mathematically secure and cannot be forged or tampered with.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'requests' && (
          <div>
            <h2>Verification Requests</h2>
            {verificationRequests.length === 0 ? (
              <div className="card">
                <p>No verification requests found.</p>
                <p>Submit a verification request using the "Verify Credentials" tab.</p>
              </div>
            ) : (
              <div className="grid">
                {verificationRequests.map(renderVerificationRequest)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificationPortal;

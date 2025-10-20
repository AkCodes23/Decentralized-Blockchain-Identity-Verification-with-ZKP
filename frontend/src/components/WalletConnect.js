import React from 'react';

const WalletConnect = ({ onConnect }) => {
  return (
    <div className="card">
      <h2>Connect Your Wallet</h2>
      <p>To use the Blockchain Identity System, you need to connect your MetaMask wallet.</p>
      
      <div style={{ marginTop: '20px' }}>
        <button className="btn" onClick={onConnect}>
          Connect MetaMask
        </button>
      </div>

      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h3>Features:</h3>
        <ul>
          <li>Create and manage your decentralized identity (DID)</li>
          <li>Issue and receive digital credentials</li>
          <li>Verify credentials using zero-knowledge proofs</li>
          <li>Selective disclosure of personal information</li>
          <li>Age verification without revealing exact age</li>
        </ul>
      </div>

      <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#fff3cd', borderRadius: '8px' }}>
        <h4>⚠️ Important:</h4>
        <p>This is a demonstration system for academic purposes. Make sure you're connected to the local development network.</p>
      </div>
    </div>
  );
};

export default WalletConnect;

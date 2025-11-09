// src/App.jsx
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './index.css';

import WalletConnect from './components/WalletConnect';
import IdentityDashboard from './components/IdentityDashboard';
import CredentialManager from './components/CredentialManager';
import VerificationPortal from './components/VerificationPortal';
import SystemStatus from './components/SystemStatus';
import DIDPanel from './components/DIDPanel'; // ✅ Added your DID UI

function App() {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [activeTab, setActiveTab] = useState('identity');

  // Check MetaMask connection on load
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum
        .request({ method: 'eth_accounts' })
        .then(accounts => {
          if (accounts.length > 0) connectWallet();
        })
        .catch(console.error);
    }
  }, []);

  // Connect to MetaMask
  const connectWallet = async () => {
    try {
      if (typeof window.ethereum === 'undefined') {
        alert('Please install MetaMask to use this application');
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();

      setProvider(provider);
      setSigner(signer);
      setAccount(accounts[0]);

      console.log('✅ Connected to MetaMask:', accounts[0]);
    } catch (error) {
      console.error('Error connecting to wallet:', error);
      alert('Failed to connect to MetaMask');
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
  };

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'identity':
        return (
          <div>
            <IdentityDashboard account={account} provider={provider} signer={signer} />
            <hr style={{ margin: '30px 0' }} />
            <DIDPanel signer={signer} /> {/* ✅ Add DID Panel inside Identity tab */}
          </div>
        );
      case 'credentials':
        return <CredentialManager account={account} provider={provider} signer={signer} />;
      case 'verification':
        return <VerificationPortal account={account} provider={provider} signer={signer} />;
      default:
        return <IdentityDashboard account={account} provider={provider} signer={signer} />;
    }
  };

  return (
    <div className="App">
      {/* Top Navigation Bar */}
      <nav className="navbar">
        <div className="container">
          <h1>Blockchain Identity System</h1>
          <div className="wallet-info">
            {account ? (
              <>
                <span className="wallet-address">
                  {account.slice(0, 6)}...{account.slice(-4)}
                </span>
                <button className="btn btn-danger" onClick={disconnectWallet}>
                  Disconnect
                </button>
              </>
            ) : (
              <button className="btn" onClick={connectWallet}>
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Page */}
      <div className="container">
        <SystemStatus />
        {!account ? (
          <WalletConnect onConnect={connectWallet} />
        ) : (
          <>
            {/* Tabs */}
            <div className="tab-container">
              <div className="tabs">
                <button
                  className={`tab ${activeTab === 'identity' ? 'active' : ''}`}
                  onClick={() => setActiveTab('identity')}
                >
                  Identity
                </button>
                <button
                  className={`tab ${activeTab === 'credentials' ? 'active' : ''}`}
                  onClick={() => setActiveTab('credentials')}
                >
                  Credentials
                </button>
                <button
                  className={`tab ${activeTab === 'verification' ? 'active' : ''}`}
                  onClick={() => setActiveTab('verification')}
                >
                  Verification
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="tab-content">{renderTabContent()}</div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
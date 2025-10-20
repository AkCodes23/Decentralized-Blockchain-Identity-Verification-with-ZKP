import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './index.css';
import WalletConnect from './components/WalletConnect';
import IdentityDashboard from './components/IdentityDashboard';
import CredentialManager from './components/CredentialManager';
import VerificationPortal from './components/VerificationPortal';
import SystemStatus from './components/SystemStatus';

function App() {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [activeTab, setActiveTab] = useState('identity');

  useEffect(() => {
    // Check if MetaMask is installed
    if (typeof window.ethereum !== 'undefined') {
      // Check if user is already connected
      window.ethereum.request({ method: 'eth_accounts' })
        .then(accounts => {
          if (accounts.length > 0) {
            connectWallet();
          }
        })
        .catch(console.error);
    }
  }, []);

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum === 'undefined') {
        alert('Please install MetaMask to use this application');
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      
      setProvider(provider);
      setSigner(signer);
      setAccount(accounts[0]);
      
      console.log('Connected to MetaMask:', accounts[0]);
    } catch (error) {
      console.error('Error connecting to wallet:', error);
      alert('Failed to connect to MetaMask');
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'identity':
        return <IdentityDashboard account={account} provider={provider} signer={signer} />;
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

      <div className="container">
        <SystemStatus />
        {!account ? (
          <WalletConnect onConnect={connectWallet} />
        ) : (
          <>
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

            <div className="tab-content">
              {renderTabContent()}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;

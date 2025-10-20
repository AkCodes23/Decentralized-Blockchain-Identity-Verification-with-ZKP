# Blockchain Identity System
## Quick Start (One Command)

Use one of the following from the project root to start EVERYTHING (blockchain, backend, frontend):

- Windows (recommended):
  - Double-click `start-everything.bat`, or run:
    - `start-everything.bat`
- PowerShell directly:
  - Full system (contracts + real backend):
    - `./start-everything.ps1`
  - Fast demo (mock backend with seeded data):
    - `./start-everything.ps1 -Demo`

The script will:
- Check/install dependencies (root, `contracts`, `backend`, `frontend`)
- Start a local Hardhat node on port 8545
- Deploy contracts (skipped in Demo mode)
- Start the backend on port 5000
- Start the frontend on port 3000
- Print URLs, mode, and a ready-to-use MetaMask account

Access points:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`
- Blockchain (Hardhat): `http://localhost:8545`

MetaMask test account (Hardhat default):
- Address: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
- Private Key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`

Stop everything: press Ctrl+C in the PowerShell window.

## Modes

- Full mode (default):
  - Runs full API backend (`backend/server.js`) using deployed contracts
  - For realistic flows with blockchain interactions

- Demo mode (`-Demo`):
  - Uses `backend/working-server.js` (mock backend with seeded data)
  - Skips contract deployment; starts instantly for deterministic demos

## Environment

Backend supports `.env` (see `backend/.env.example`):
- `PORT=5000`
- `NODE_ENV=development`
- `FRONTEND_URL=http://localhost:3000`
- `ETHEREUM_RPC_URL=http://localhost:8545`
- `ENCRYPTION_KEY=demo-encryption-key`
- `LOG_LEVEL=info`

Frontend (optional) `.env`:
- `REACT_APP_API_URL=http://localhost:5000`

Note: The start script sets sensible defaults at runtime.

### Contracts: Addresses Loading and Fallback

- After deploying contracts, addresses are written to `backend/contract-addresses.json`.
- The backend loads addresses per contract when first needed. If the file is missing or an address is absent:
  - Backend logs a warning: addresses not found.
  - Calls depending on those contracts will fail in Full mode until you deploy.
  - Use Demo mode (`./start-everything.ps1 -Demo`) to run without real contracts (mock backend with seeded data).
- If you redeploy, ensure the `contract-addresses.json` reflects the latest deployment before using the Full API.


## What the System Does (High-Level)

- Backend (Express):
  - Health/status endpoints: `/api/health`, `/api/status`
  - Identity: create/update/deactivate/reactivate DIDs, resolve DID docs
  - Credentials: issue/update/revoke, list by holder/issuer, verify
  - Verification: generate/submit ZK proofs (age, ownership, selective disclosure)
  - Security: Helmet, CORS, rate limiting, Joi validation, request-id, structured logging
  - Storage: IPFS client with AES-256-CBC encryption (IV) + mock fallback

- Frontend (React):
  - Connect MetaMask, manage identity and credentials, run verifications
  - Centralized API client with base URL & interceptors
  - System status card showing health and stats

- Contracts (Hardhat):
  - Deploy on local node; addresses loaded by backend from `backend/contract-addresses.json`
  - If missing addresses, backend warns; use Demo mode or deploy via the script

## Expected Outcomes After Start

- Frontend loads with System Status showing Backend: OK
- You can connect MetaMask to `localhost:8545` and use the provided account
- Identity: create a DID; Credentials: issue/list; Verification: generate/submit proofs

## Troubleshooting (Brief)

- Ports busy (3000/5000/8545): the script attempts to stop conflicts; rerun if needed
- MetaMask not connected to local network: add `http://localhost:8545` and import the test key
- Missing contract addresses in Full mode: ensure deployment step succeeded (script logs)
- IPFS not configured: backend uses secure mock storage; features still work for demo

# Blockchain-Based Decentralized Identity & Credential Verification System

A comprehensive system that leverages blockchain technology and zero-knowledge proofs to provide secure, privacy-preserving identity and credential verification.

## 🎯 Project Overview

This system implements a decentralized identity management solution that allows users to:
- Create and manage self-sovereign digital identities (DIDs)
- Issue and receive digital credentials
- Verify credentials using zero-knowledge proofs
- Perform selective disclosure of personal information
- Maintain privacy while proving specific attributes

## 🏗️ Architecture

### Tech Stack
- **Blockchain**: Ethereum (Hardhat for local development)
- **Smart Contracts**: Solidity with OpenZeppelin
- **Zero-Knowledge Proofs**: ZoKrates
- **Backend**: Node.js/Express.js with Web3.js
- **Frontend**: React.js with ethers.js
- **Storage**: IPFS for decentralized storage
- **Authentication**: MetaMask wallet integration

### System Components

1. **Smart Contracts**
   - `IdentityRegistry.sol`: Manages DID creation and resolution
   - `CredentialRegistry.sol`: Handles credential issuance and revocation
   - `VerificationContract.sol`: Processes ZKP verification requests
   - `Verifier.sol`: Verifies zero-knowledge proofs

2. **Zero-Knowledge Proof Circuits**
   - Age verification (prove age > threshold without revealing exact age)
   - Credential ownership (prove ownership without revealing details)
   - Selective disclosure (prove specific attributes)

3. **Backend API**
   - RESTful API for identity operations
   - IPFS integration for decentralized storage
   - ZKP proof generation and verification
   - Blockchain interaction services

4. **Frontend Application**
   - React-based user interface
   - MetaMask wallet integration
   - Identity dashboard
   - Credential management
   - Verification portal

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MetaMask browser extension
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd blockchain-identity-system
   ```

2. **Install dependencies**
   ```bash
   npm run setup
   ```

3. **Configure environment**
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with your configuration
   ```

4. **Start the development environment**
   ```bash
   npm run dev
   ```

This will start:
- Local Ethereum blockchain (Hardhat Network)
- Backend API server (port 5000)
- Frontend application (port 3000)

### Manual Setup

If you prefer to set up components individually:

1. **Start local blockchain**
   ```bash
   cd contracts
   npx hardhat node
   ```

2. **Deploy contracts**
   ```bash
   cd contracts
   npx hardhat run scripts/deploy.js --network localhost
   ```

3. **Start backend**
   ```bash
   cd backend
   npm run dev
   ```

4. **Start frontend**
   ```bash
   cd frontend
   npm start
   ```

## 📖 Usage Guide

### 1. Connect Wallet
- Open the application in your browser
- Click "Connect MetaMask"
- Approve the connection in MetaMask
- Ensure you're connected to the local network (Chain ID: 1337)

### 2. Create Identity
- Navigate to the "Identity" tab
- Click "Create DID"
- Fill in the required information:
  - DID (optional, auto-generated if empty)
  - Public keys
  - Service endpoints
- Click "Create DID"

### 3. Issue Credentials
- Switch to the "Credentials" tab
- Click "Issue Credential"
- Fill in credential details:
  - Credential ID
  - Holder DID
  - Credential type
  - Credential data
  - Attributes
- Click "Issue Credential"

### 4. Verify Credentials
- Go to the "Verification" tab
- Choose verification type:
  - **Age Verification**: Prove you're above a certain age
  - **Credential Ownership**: Prove you own a specific credential
- Fill in the required information
- Click "Generate Proof"
- The system will create a zero-knowledge proof and submit a verification request

## 🔧 API Documentation

### Identity Endpoints

#### Create DID
```http
POST /api/identity/create
Content-Type: application/json

{
  "did": "did:example:123",
  "publicKeys": ["0x1234..."],
  "services": ["https://example.com/service"],
  "metadata": {}
}
```

#### Get DID Document
```http
GET /api/identity/{did}
```

#### Update DID
```http
PUT /api/identity/{did}
Content-Type: application/json

{
  "publicKeys": ["0x1234..."],
  "services": ["https://example.com/service"],
  "metadata": {}
}
```

### Credential Endpoints

#### Issue Credential
```http
POST /api/credentials/issue
Content-Type: application/json

{
  "credentialId": "cred_123",
  "holderDID": "did:example:holder",
  "credentialType": "EducationalCredential",
  "credentialData": {
    "degree": "Bachelor of Computer Science",
    "institution": "Tech University"
  },
  "attributes": ["Computer Science", "Bachelor"],
  "metadata": {}
}
```

#### Get Credential
```http
GET /api/credentials/{credentialId}
```

#### Verify Credential
```http
GET /api/credentials/{credentialId}/verify
```

### Verification Endpoints

#### Generate Age Verification Proof
```http
POST /api/verification/age
Content-Type: application/json

{
  "age": 25,
  "minAge": 18
}
```

#### Submit Verification Request
```http
POST /api/verification/request
Content-Type: application/json

{
  "credentialId": "cred_123",
  "circuitType": "age_verification",
  "proofData": {...},
  "publicInputs": [18]
}
```

## 🧪 Testing

### Run Smart Contract Tests
```bash
cd contracts
npx hardhat test
```

### Run Demo Scenarios
```bash
node scripts/demo-scenarios.js
```

### Manual Testing
1. Start the development environment
2. Open the frontend application
3. Connect your MetaMask wallet
4. Follow the usage guide to test all features

## 🔒 Security Features

### Zero-Knowledge Proofs
- **Age Verification**: Prove age without revealing exact age
- **Credential Ownership**: Prove ownership without revealing credential details
- **Selective Disclosure**: Prove specific attributes while keeping others private

### Blockchain Security
- Immutable credential records
- Decentralized identity management
- Cryptographic verification
- Tamper-proof audit trail

### Privacy Protection
- End-to-end encryption for sensitive data
- IPFS for decentralized storage
- No central authority control
- User-controlled data sharing

## 📁 Project Structure

```
blockchain-identity-system/
├── contracts/                 # Smart contracts
│   ├── contracts/            # Solidity contracts
│   ├── scripts/              # Deployment scripts
│   └── test/                 # Contract tests
├── backend/                  # Backend API
│   ├── routes/               # API routes
│   ├── services/             # Business logic
│   └── models/               # Data models
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/       # React components
│   │   └── utils/            # Utility functions
│   └── public/               # Static assets
├── zkp/                      # Zero-knowledge proof circuits
│   ├── *.zok                 # ZoKrates circuits
│   └── generate_proof.js     # Proof generation utilities
├── threat-modeling/          # Microsoft Threat Modeling
│   ├── system-architecture.drawio  # System architecture diagram
│   ├── threat-analysis.md    # STRIDE threat analysis
│   ├── security-controls.md  # Security controls implementation
│   ├── risk-assessment.md    # Risk assessment and prioritization
│   ├── microsoft-threat-modeling-tool-setup.md  # TMT setup guide
│   └── tmt-template.xml      # TMT template file
├── scripts/                  # Setup and demo scripts
└── README.md                 # This file
```

## 🎓 Academic Context

This project demonstrates:
- **Decentralized Identity**: Self-sovereign identity management
- **Zero-Knowledge Proofs**: Privacy-preserving verification
- **Blockchain Integration**: Smart contract development
- **Cryptographic Security**: Advanced encryption techniques
- **Web3 Development**: Full-stack blockchain applications

### Learning Outcomes
- Understanding of decentralized identity systems
- Implementation of zero-knowledge proof protocols
- Smart contract development with Solidity
- Web3 application architecture
- Privacy-preserving verification mechanisms

## 🤝 Contributing

This is an academic project. For educational purposes:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠️ Disclaimer

This is a demonstration system for academic purposes. It should not be used in production environments without proper security audits and additional testing.

## 🔒 Security & Threat Modeling

### Microsoft Threat Modeling Integration

This project includes comprehensive Microsoft Threat Modeling analysis:

- **Threat Model**: `threat-modeling/system-architecture.drawio`
- **Threat Analysis**: `threat-modeling/threat-analysis.md`
- **Security Controls**: `threat-modeling/security-controls.md`
- **Risk Assessment**: `threat-modeling/risk-assessment.md`
- **TMT Setup Guide**: `threat-modeling/microsoft-threat-modeling-tool-setup.md`

### Security Features

- **STRIDE Threat Analysis**: Comprehensive threat identification using Microsoft's STRIDE methodology
- **Risk Assessment**: OWASP Risk Rating Methodology implementation
- **Security Controls**: Multi-layered security implementation
- **Threat Modeling Tool**: Microsoft TMT integration for ongoing security analysis

### Academic Security Value

- Demonstrates security-by-design principles
- Shows industry-standard threat modeling practices
- Provides comprehensive risk assessment methodology
- Integrates security throughout the development lifecycle

## 🔗 Resources

- [W3C Decentralized Identifiers](https://www.w3.org/TR/did-core/)
- [W3C Verifiable Credentials](https://www.w3.org/TR/vc-data-model/)
- [ZoKrates Documentation](https://zokrates.github.io/)
- [Ethereum Documentation](https://ethereum.org/developers/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Microsoft Threat Modeling Tool](https://docs.microsoft.com/en-us/azure/security/develop/threat-modeling-tool)
- [OWASP Risk Rating Methodology](https://owasp.org/www-community/OWASP_Risk_Rating_Methodology)

## 📞 Support

For questions or issues related to this academic project, please refer to the project documentation or contact the development team.

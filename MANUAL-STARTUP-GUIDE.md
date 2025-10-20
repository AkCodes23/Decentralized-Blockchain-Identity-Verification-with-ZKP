# Manual Startup Guide - Blockchain Identity System

## 🚀 **Quick Start (Recommended)**

The `start-dev.bat` script should have started all services automatically. If it's running, you should see:

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000  
- **Blockchain**: http://localhost:8545

## 🔧 **Manual Startup (If Needed)**

If you need to start services manually, follow these steps:

### Step 1: Start Local Blockchain
```bash
# Open a new terminal/command prompt
cd contracts
npx hardhat node
```
Keep this terminal open - it runs the local Ethereum blockchain.

### Step 2: Deploy Smart Contracts
```bash
# Open another terminal/command prompt
cd contracts
npx hardhat run scripts/deploy.js --network localhost
```
This will deploy all smart contracts and show their addresses.

### Step 3: Update Contract Addresses
After deployment, copy the contract addresses and update `backend/contract-addresses.json`:
```json
{
  "IdentityRegistry": "0x...",
  "CredentialRegistry": "0x...",
  "VerificationContract": "0x...",
  "Verifier": "0x..."
}
```

### Step 4: Start Backend Server
```bash
# Open another terminal/command prompt
cd backend
npm run dev
```
The backend API will be available at http://localhost:5000

### Step 5: Start Frontend Application
```bash
# Open another terminal/command prompt
cd frontend
npm start
```
The React app will open at http://localhost:3000

## 🔍 **Verification Steps**

### 1. Check Blockchain Node
- Visit http://localhost:8545
- You should see JSON-RPC responses

### 2. Check Backend API
- Visit http://localhost:5000/api/identity/network/info
- Should return network information

### 3. Check Frontend
- Visit http://localhost:3000
- Should show the Blockchain Identity System interface

## 🛠️ **Troubleshooting**

### Common Issues:

1. **Port Already in Use**
   - Kill existing processes: `taskkill /f /im node.exe`
   - Or change ports in configuration files

2. **Contract Deployment Fails**
   - Ensure blockchain node is running
   - Check if ports 8545 is available

3. **Backend Connection Issues**
   - Verify contract addresses are correct
   - Check if blockchain node is running

4. **Frontend Not Loading**
   - Check if backend is running on port 5000
   - Verify API calls in browser developer tools

### Environment Variables

Make sure you have the following environment variables set:

**Backend (.env)**:
```
PORT=5000
ETHEREUM_RPC_URL=http://localhost:8545
PRIVATE_KEY=your_private_key_here
MONGODB_URI=mongodb://localhost:27017/blockchain-identity
```

**Frontend (.env)**:
```
REACT_APP_API_URL=http://localhost:5000
```

## 📱 **Using the Application**

1. **Connect MetaMask**:
   - Install MetaMask browser extension
   - Connect to local network (localhost:8545)
   - Import test accounts from Hardhat

2. **Create Identity**:
   - Click "Connect Wallet" in the frontend
   - Create a new DID (Decentralized Identifier)
   - Add public keys and services

3. **Issue Credentials**:
   - Switch to "Credentials" tab
   - Issue educational or professional credentials
   - View credential details

4. **Verify Credentials**:
   - Switch to "Verification" tab
   - Generate zero-knowledge proofs
   - Submit verification requests

## 🎯 **Demo Scenarios**

### Scenario 1: University Degree Verification
1. Create a university issuer DID
2. Issue a degree credential to a student
3. Student generates age verification proof
4. Verifier checks credential without seeing personal details

### Scenario 2: Employment Certificate
1. Create an employer issuer DID
2. Issue employment certificate
3. Employee proves credential ownership
4. Selective disclosure of specific attributes

## 📊 **System Status Check**

Run this command to check if all services are running:
```bash
# Check if ports are in use
netstat -an | findstr "3000 5000 8545"
```

## 🆘 **Getting Help**

If you encounter issues:
1. Check the console logs in each terminal
2. Verify all dependencies are installed
3. Ensure all required services are running
4. Check the troubleshooting section above

The system is now ready for academic demonstration! 🎉

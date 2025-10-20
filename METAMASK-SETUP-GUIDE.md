# 🔗 MetaMask Setup Guide for Blockchain Identity System

## 📱 **Step 1: Install MetaMask**

### Option A: Browser Extension (Recommended)
1. **Chrome/Edge**: Go to [Chrome Web Store](https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn)
2. **Firefox**: Go to [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/ether-metamask/)
3. **Brave**: Go to [Brave Store](https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn)

### Option B: Mobile App
1. **iOS**: Download from [App Store](https://apps.apple.com/app/metamask/id1438144202)
2. **Android**: Download from [Google Play](https://play.google.com/store/apps/details?id=io.metamask)

## 🔧 **Step 2: Set Up MetaMask**

### Initial Setup:
1. **Create Account** or **Import Existing Wallet**
2. **Write down your seed phrase** (keep it safe!)
3. **Set a strong password**
4. **Complete the setup process**

## 🌐 **Step 3: Add Local Network**

### Add Hardhat Local Network:
1. **Open MetaMask** and click the network dropdown (top of extension)
2. **Click "Add Network"** or "Custom RPC"
3. **Enter these details**:
   ```
   Network Name: Hardhat Local
   RPC URL: http://localhost:8545
   Chain ID: 31337
   Currency Symbol: ETH
   Block Explorer URL: (leave empty)
   ```
4. **Click "Save"**

## 🔑 **Step 4: Import Test Account**

### Use the Test Account from the System:
1. **Click MetaMask extension** → **Account menu** (top right)
2. **Click "Import Account"**
3. **Select "Private Key"**
4. **Enter this private key**:
   ```
   0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   ```
5. **Click "Import"**

### Account Details:
- **Address**: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
- **Balance**: 10,000 ETH (test tokens)
- **Network**: Hardhat Local (localhost:8545)

## ✅ **Step 5: Verify Setup**

### Check Your Setup:
1. **MetaMask should show**:
   - ✅ Connected to "Hardhat Local" network
   - ✅ Account with 10,000 ETH balance
   - ✅ Network ID: 31337

2. **In the Blockchain Identity System**:
   - ✅ Click "Connect Wallet" button
   - ✅ MetaMask should prompt for connection
   - ✅ Click "Connect" to authorize

## 🚨 **Troubleshooting**

### Common Issues:

#### 1. **"Please install MetaMask" Error**
- ✅ Ensure MetaMask extension is installed and enabled
- ✅ Refresh the page after installing MetaMask
- ✅ Check if MetaMask is blocked by browser

#### 2. **"Wrong Network" Error**
- ✅ Switch to "Hardhat Local" network in MetaMask
- ✅ Ensure RPC URL is `http://localhost:8545`
- ✅ Check Chain ID is `31337`

#### 3. **"No Accounts Found" Error**
- ✅ Import the test account using the private key
- ✅ Ensure you're on the correct network
- ✅ Check if account is unlocked

#### 4. **"Transaction Failed" Error**
- ✅ Ensure blockchain node is running
- ✅ Check if you have enough ETH (should have 10,000)
- ✅ Verify network connection

### Quick Fixes:

#### Reset MetaMask (if needed):
1. **Settings** → **Advanced** → **Reset Account**
2. **Re-import the test account**
3. **Re-add the local network**

#### Clear Browser Cache:
1. **Hard refresh**: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. **Clear site data** in browser settings
3. **Restart browser**

## 🎯 **Step 6: Start Using the System**

### Once MetaMask is Connected:
1. **Create Identity**: Generate your first DID
2. **Issue Credentials**: Create educational/professional credentials
3. **Verify Credentials**: Use zero-knowledge proofs
4. **Selective Disclosure**: Prove specific attributes

## 🔒 **Security Notes**

### Important Reminders:
- ⚠️ **Test Account Only**: This private key is for testing only
- ⚠️ **Never Use on Mainnet**: This is a development account
- ⚠️ **Keep Private**: Don't share your real wallet private keys
- ⚠️ **Backup Seed Phrase**: Always backup your real wallet seed phrase

### For Production Use:
- 🔐 **Create New Wallet**: Don't use test accounts for real applications
- 🔐 **Secure Storage**: Use hardware wallets for large amounts
- 🔐 **Regular Backups**: Keep multiple secure backups of seed phrases

## 📱 **Mobile Setup (Alternative)**

### If Using Mobile MetaMask:
1. **Install MetaMask mobile app**
2. **Create/import wallet**
3. **Add custom network** with same details as above
4. **Import test account** using private key
5. **Connect via QR code** or wallet connect

## 🎉 **Ready to Go!**

Once MetaMask is properly set up:
- ✅ You can connect to the Blockchain Identity System
- ✅ Create and manage decentralized identities
- ✅ Issue and verify credentials
- ✅ Use zero-knowledge proofs for privacy

**The system is now ready for your academic demonstration!** 🚀

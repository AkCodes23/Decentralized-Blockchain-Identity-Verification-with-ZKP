const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

class BlockchainService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contracts = {};
    this.initializeProvider();
  }

  initializeProvider() {
    try {
      // Initialize provider
      this.provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL || 'http://localhost:8545');
      
      // Initialize signer if private key is provided
      if (process.env.PRIVATE_KEY) {
        this.signer = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
      }

      // Load contract addresses
      this.loadContractAddresses();
      
      console.log('Blockchain service initialized successfully');
    } catch (error) {
      console.error('Error initializing blockchain service:', error);
      throw error;
    }
  }

  loadContractAddresses() {
    try {
      const addressesPath = path.join(__dirname, '..', 'contract-addresses.json');
      if (fs.existsSync(addressesPath)) {
        const addresses = JSON.parse(fs.readFileSync(addressesPath, 'utf8'));
        this.contractAddresses = addresses;
        console.log('Contract addresses loaded:', addresses);
      } else {
        console.warn('Contract addresses file not found. Please deploy contracts first.');
        this.contractAddresses = {};
      }
    } catch (error) {
      console.error('Error loading contract addresses:', error);
      this.contractAddresses = {};
    }
  }

  async getContract(contractName) {
    if (!this.contractAddresses[contractName]) {
      throw new Error(`Contract address not found for ${contractName}`);
    }

    if (this.contracts[contractName]) {
      return this.contracts[contractName];
    }

    try {
      // Load contract ABI
      const abiPath = path.join(__dirname, '..', '..', 'contracts', 'artifacts', 'contracts', `${contractName}.sol`, `${contractName}.json`);
      const contractArtifact = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
      
      // Create contract instance
      const contract = new ethers.Contract(
        this.contractAddresses[contractName],
        contractArtifact.abi,
        this.signer || this.provider
      );

      this.contracts[contractName] = contract;
      return contract;
    } catch (error) {
      console.error(`Error loading contract ${contractName}:`, error);
      throw error;
    }
  }

  async createDID(did, documentHash, publicKeys, services) {
    try {
      const identityRegistry = await this.getContract('IdentityRegistry');
      const tx = await identityRegistry.createDID(did, documentHash, publicKeys, services);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Error creating DID:', error);
      throw error;
    }
  }

  async getDIDDocument(did) {
    try {
      const identityRegistry = await this.getContract('IdentityRegistry');
      const didDocument = await identityRegistry.getDIDDocument(did);
      return {
        did: didDocument.did,
        owner: didDocument.owner,
        documentHash: didDocument.documentHash,
        createdAt: didDocument.createdAt.toString(),
        isActive: didDocument.isActive,
        publicKeys: didDocument.publicKeys,
        services: didDocument.services
      };
    } catch (error) {
      console.error('Error getting DID document:', error);
      throw error;
    }
  }

  async issueCredential(credentialId, holderDID, credentialType, credentialHash, expiresAt, attributes, metadata, issuerDID) {
    try {
      const credentialRegistry = await this.getContract('CredentialRegistry');
      const tx = await credentialRegistry.issueCredential(
        credentialId,
        holderDID,
        credentialType,
        credentialHash,
        expiresAt,
        attributes,
        metadata,
        issuerDID
      );
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Error issuing credential:', error);
      throw error;
    }
  }

  async getCredential(credentialId) {
    try {
      const credentialRegistry = await this.getContract('CredentialRegistry');
      const credential = await credentialRegistry.getCredential(credentialId);
      return {
        credentialId: credential.credentialId,
        issuerDID: credential.issuerDID,
        holderDID: credential.holderDID,
        credentialType: credential.credentialType,
        credentialHash: credential.credentialHash,
        issuedAt: credential.issuedAt.toString(),
        expiresAt: credential.expiresAt.toString(),
        isRevoked: credential.isRevoked,
        attributes: credential.attributes,
        metadata: credential.metadata
      };
    } catch (error) {
      console.error('Error getting credential:', error);
      throw error;
    }
  }

  async verifyCredential(credentialId) {
    try {
      const credentialRegistry = await this.getContract('CredentialRegistry');
      const isValid = await credentialRegistry.isCredentialValid(credentialId);
      return isValid;
    } catch (error) {
      console.error('Error verifying credential:', error);
      throw error;
    }
  }

  async submitVerificationRequest(requestId, credentialId, circuitType, proofData, publicInputs, verifierDID) {
    try {
      const verificationContract = await this.getContract('VerificationContract');
      const tx = await verificationContract.submitVerificationRequest(
        requestId,
        credentialId,
        circuitType,
        proofData,
        publicInputs,
        verifierDID
      );
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Error submitting verification request:', error);
      throw error;
    }
  }

  async getVerificationRequest(requestId) {
    try {
      const verificationContract = await this.getContract('VerificationContract');
      const request = await verificationContract.getVerificationRequest(requestId);
      return {
        requestId: request.requestId,
        credentialId: request.credentialId,
        verifierDID: request.verifierDID,
        proofHash: request.proofHash,
        requestedAt: request.requestedAt.toString(),
        isVerified: request.isVerified,
        verificationResult: request.verificationResult,
        verifiedAt: request.verifiedAt.toString()
      };
    } catch (error) {
      console.error('Error getting verification request:', error);
      throw error;
    }
  }

  async deactivateDID(did) {
    try {
      const identityRegistry = await this.getContract('IdentityRegistry');
      const tx = await identityRegistry.deactivateDID(did);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Error deactivating DID:', error);
      throw error;
    }
  }

  async reactivateDID(did) {
    try {
      const identityRegistry = await this.getContract('IdentityRegistry');
      const tx = await identityRegistry.reactivateDID(did);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Error reactivating DID:', error);
      throw error;
    }
  }

  async updateDID(did, documentHash, publicKeys, services) {
    try {
      const identityRegistry = await this.getContract('IdentityRegistry');
      const tx = await identityRegistry.updateDID(did, documentHash, publicKeys, services);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Error updating DID:', error);
      throw error;
    }
  }

  async revokeCredential(credentialId) {
    try {
      const credentialRegistry = await this.getContract('CredentialRegistry');
      const tx = await credentialRegistry.revokeCredential(credentialId);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Error revoking credential:', error);
      throw error;
    }
  }

  async updateCredential(credentialId, credentialHash, attributes, metadata) {
    try {
      const credentialRegistry = await this.getContract('CredentialRegistry');
      const tx = await credentialRegistry.updateCredential(credentialId, credentialHash, attributes, metadata);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Error updating credential:', error);
      throw error;
    }
  }

  async getTotalVerificationRequests() {
    try {
      const verificationContract = await this.getContract('VerificationContract');
      const total = await verificationContract.getTotalVerificationRequests();
      return total.toString();
    } catch (error) {
      console.error('Error getting total verification requests:', error);
      throw error;
    }
  }

  async getVerificationRequestAtIndex(index) {
    try {
      const verificationContract = await this.getContract('VerificationContract');
      const requestId = await verificationContract.getVerificationRequestAtIndex(index);
      return requestId;
    } catch (error) {
      console.error('Error getting verification request at index:', error);
      throw error;
    }
  }

  async getNetworkInfo() {
    try {
      const network = await this.provider.getNetwork();
      const blockNumber = await this.provider.getBlockNumber();
      const gasPrice = await this.provider.getGasPrice();
      
      return {
        chainId: network.chainId.toString(),
        name: network.name,
        blockNumber: blockNumber.toString(),
        gasPrice: gasPrice.toString()
      };
    } catch (error) {
      console.error('Error getting network info:', error);
      throw error;
    }
  }
}

module.exports = new BlockchainService();

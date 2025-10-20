let create;
try {
  const ipfsClient = require('ipfs-http-client');
  create = ipfsClient.create || ipfsClient.default?.create || ipfsClient;
} catch (error) {
  console.warn('IPFS client not available, using mock implementation');
  create = null;
}
const crypto = require('crypto');
const fs = require('fs');

class IPFSService {
  constructor() {
    this.client = null;
    this.initializeClient();
  }

  initializeClient() {
    try {
      if (!create) {
        console.warn('IPFS client not available, using mock implementation');
        this.client = null;
        return;
      }
      
      // Initialize IPFS client
      if (process.env.IPFS_API_URL) {
        this.client = create({ url: process.env.IPFS_API_URL });
        console.log('IPFS client initialized with custom URL:', process.env.IPFS_API_URL);
      } else {
        // Use default local IPFS node
        this.client = create({ url: 'http://localhost:5001' });
        console.log('IPFS client initialized with default URL');
      }
    } catch (error) {
      console.error('Error initializing IPFS client:', error);
      console.warn('Using mock IPFS implementation');
      this.client = null;
    }
  }

  initializePinata() {
    try {
      if (process.env.PINATA_API_KEY && process.env.PINATA_SECRET_KEY) {
        console.log('Using Pinata as IPFS fallback');
        // Pinata integration would go here
        // For now, we'll use a mock implementation
        this.client = {
          add: this.pinataAdd.bind(this),
          get: this.pinataGet.bind(this)
        };
      } else {
        console.warn('No IPFS client available. Please configure IPFS or Pinata.');
      }
    } catch (error) {
      console.error('Error initializing Pinata:', error);
    }
  }

  async pinataAdd(data) {
    // Mock Pinata implementation
    // In a real implementation, you would use the Pinata SDK
    const hash = crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
    return { path: hash };
  }

  async pinataGet(hash) {
    // Mock Pinata implementation
    // In a real implementation, you would fetch from Pinata
    throw new Error('Pinata get not implemented in mock');
  }

  async addData(data) {
    try {
      if (!this.client) {
        // Use mock implementation when IPFS is not available
        const hash = crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
        return hash;
      }

      const result = await this.client.add(JSON.stringify(data));
      const path = result.path || result.cid?.toString?.() || result.toString?.() || '';
      console.log('Data added to IPFS:', path);
      return path;
    } catch (error) {
      console.error('Error adding data to IPFS:', error);
      throw error;
    }
  }

  async getData(hash) {
    try {
      if (!this.client) {
        // Mock implementation - cannot retrieve by hash; indicate not available
        throw new Error('IPFS not available in this environment');
      }

      const chunks = [];
      for await (const chunk of this.client.get(hash)) {
        chunks.push(chunk);
      }

      const data = Buffer.concat(chunks).toString();
      return JSON.parse(data);
    } catch (error) {
      console.error('Error getting data from IPFS:', error);
      throw error;
    }
  }

  async addCredential(credentialData) {
    try {
      // Encrypt sensitive data before storing
      const encryptedData = this.encryptData(credentialData);
      const hash = await this.addData(encryptedData);
      return hash;
    } catch (error) {
      console.error('Error adding credential to IPFS:', error);
      throw error;
    }
  }

  async getCredential(hash) {
    try {
      const encryptedData = await this.getData(hash);
      const decryptedData = this.decryptData(encryptedData);
      return decryptedData;
    } catch (error) {
      console.error('Error getting credential from IPFS:', error);
      throw error;
    }
  }

  async addDIDDocument(didDocument) {
    try {
      const hash = await this.addData(didDocument);
      return hash;
    } catch (error) {
      console.error('Error adding DID document to IPFS:', error);
      throw error;
    }
  }

  async getDIDDocument(hash) {
    try {
      const didDocument = await this.getData(hash);
      return didDocument;
    } catch (error) {
      console.error('Error getting DID document from IPFS:', error);
      throw error;
    }
  }

  encryptData(data) {
    try {
      const algorithm = 'aes-256-cbc';
      const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'default-key', 'salt', 32);
      const iv = crypto.randomBytes(16);

      const cipher = crypto.createCipheriv(algorithm, key, iv);
      const encryptedBuffer = Buffer.concat([
        cipher.update(Buffer.from(JSON.stringify(data), 'utf8')),
        cipher.final()
      ]);

      return {
        encrypted: encryptedBuffer.toString('hex'),
        iv: iv.toString('hex')
      };
    } catch (error) {
      console.error('Error encrypting data:', error);
      throw error;
    }
  }

  decryptData(encryptedData) {
    try {
      const algorithm = 'aes-256-cbc';
      const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'default-key', 'salt', 32);
      const iv = Buffer.from(encryptedData.iv, 'hex');

      const decipher = crypto.createDecipheriv(algorithm, key, iv);
      const decryptedBuffer = Buffer.concat([
        decipher.update(Buffer.from(encryptedData.encrypted, 'hex')),
        decipher.final()
      ]);

      return JSON.parse(decryptedBuffer.toString('utf8'));
    } catch (error) {
      console.error('Error decrypting data:', error);
      throw error;
    }
  }

  async pinData(hash) {
    try {
      if (!this.client) {
        throw new Error('IPFS client not initialized');
      }

      // Pin the data to ensure it's not garbage collected
      await this.client.pin.add(hash);
      console.log('Data pinned to IPFS:', hash);
      return true;
    } catch (error) {
      console.error('Error pinning data to IPFS:', error);
      throw error;
    }
  }

  async unpinData(hash) {
    try {
      if (!this.client) {
        throw new Error('IPFS client not initialized');
      }

      // Unpin the data
      await this.client.pin.rm(hash);
      console.log('Data unpinned from IPFS:', hash);
      return true;
    } catch (error) {
      console.error('Error unpinning data from IPFS:', error);
      throw error;
    }
  }
}

module.exports = new IPFSService();

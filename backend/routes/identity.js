const express = require('express');
const router = express.Router();
const blockchainService = require('../services/blockchain');
const ipfsService = require('../services/ipfs');
const { v4: uuidv4 } = require('uuid');
const { validate, Joi } = require('../middleware/validate');

/**
 * @route POST /api/identity/create
 * @desc Create a new decentralized identity
 * @access Public
 */
router.post('/create', validate({
  body: Joi.object({
    did: Joi.string().min(8).required(),
    publicKeys: Joi.array().items(Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/)).min(1).required(),
    services: Joi.array().items(Joi.string()).default([]),
    metadata: Joi.object().default({})
  })
}), async (req, res) => {
  try {
    const { did, publicKeys, services, metadata } = req.body;

    // Validate input
    if (!did || !publicKeys || !Array.isArray(publicKeys)) {
      return res.status(400).json({ error: 'Invalid input data' });
    }

    // Create DID document
    const didDocument = {
      '@context': ['https://www.w3.org/ns/did/v1'],
      id: did,
      created: new Date().toISOString(),
      publicKey: publicKeys.map((key, index) => ({
        id: `${did}#key-${index}`,
        type: 'Secp256k1VerificationKey2018',
        controller: did,
        publicKeyHex: key
      })),
      service: services || [],
      metadata: metadata || {}
    };

    // Store DID document on IPFS
    const documentHash = await ipfsService.addDIDDocument(didDocument);

    // Create DID on blockchain
    const txHash = await blockchainService.createDID(
      did,
      documentHash,
      publicKeys,
      services || []
    );

    res.json({
      success: true,
      did,
      documentHash,
      txHash,
      didDocument
    });
  } catch (error) {
    console.error('Error creating identity:', error);
    res.status(500).json({ error: 'Failed to create identity' });
  }
});

/**
 * @route GET /api/identity/:did
 * @desc Get DID document by DID
 * @access Public
 */
router.get('/:did', validate({
  params: Joi.object({ did: Joi.string().required() })
}), async (req, res) => {
  try {
    const { did } = req.params;

    // Get DID document from blockchain
    const didData = await blockchainService.getDIDDocument(did);
    
    if (!didData.did) {
      return res.status(404).json({ error: 'DID not found' });
    }

    // Get full DID document from IPFS (optional)
    let didDocument = null;
    try {
      didDocument = await ipfsService.getDIDDocument(didData.documentHash);
    } catch (e) {
      console.warn(`IPFS unavailable or DID document not retrievable for ${did}:`, e.message || e);
    }

    res.json({
      success: true,
      did: didData.did,
      owner: didData.owner,
      createdAt: didData.createdAt,
      isActive: didData.isActive,
      didDocument
    });
  } catch (error) {
    console.error('Error getting identity:', error);
    res.status(500).json({ error: 'Failed to get identity' });
  }
});

/**
 * @route PUT /api/identity/:did
 * @desc Update DID document
 * @access Public
 */
router.put('/:did', validate({
  params: Joi.object({ did: Joi.string().required() }),
  body: Joi.object({
    publicKeys: Joi.array().items(Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/)).min(1).required(),
    services: Joi.array().items(Joi.string()).default([]),
    metadata: Joi.object().default({})
  })
}), async (req, res) => {
  try {
    const { did } = req.params;
    const { publicKeys, services, metadata } = req.body;

    // Get current DID document
    const currentDidData = await blockchainService.getDIDDocument(did);
    
    if (!currentDidData.did) {
      return res.status(404).json({ error: 'DID not found' });
    }

    // Create updated DID document
    const updatedDidDocument = {
      '@context': ['https://www.w3.org/ns/did/v1'],
      id: did,
      created: currentDidData.createdAt,
      updated: new Date().toISOString(),
      publicKey: publicKeys.map((key, index) => ({
        id: `${did}#key-${index}`,
        type: 'Secp256k1VerificationKey2018',
        controller: did,
        publicKeyHex: key
      })),
      service: services || [],
      metadata: metadata || {}
    };

    // Store updated DID document on IPFS
    const newDocumentHash = await ipfsService.addDIDDocument(updatedDidDocument);

    // Update DID on blockchain
    const txHash = await blockchainService.updateDID(
      did,
      newDocumentHash,
      publicKeys,
      services || []
    );

    res.json({
      success: true,
      did,
      documentHash: newDocumentHash,
      txHash,
      didDocument: updatedDidDocument
    });
  } catch (error) {
    console.error('Error updating identity:', error);
    res.status(500).json({ error: 'Failed to update identity' });
  }
});

/**
 * @route POST /api/identity/:did/deactivate
 * @desc Deactivate a DID
 * @access Public
 */
router.post('/:did/deactivate', validate({
  params: Joi.object({ did: Joi.string().required() })
}), async (req, res) => {
  try {
    const { did } = req.params;

    // Deactivate DID on blockchain
    const txHash = await blockchainService.deactivateDID(did);

    res.json({
      success: true,
      did,
      txHash,
      message: 'DID deactivated successfully'
    });
  } catch (error) {
    console.error('Error deactivating identity:', error);
    res.status(500).json({ error: 'Failed to deactivate identity' });
  }
});

/**
 * @route POST /api/identity/:did/reactivate
 * @desc Reactivate a DID
 * @access Public
 */
router.post('/:did/reactivate', validate({
  params: Joi.object({ did: Joi.string().required() })
}), async (req, res) => {
  try {
    const { did } = req.params;

    // Reactivate DID on blockchain
    const txHash = await blockchainService.reactivateDID(did);

    res.json({
      success: true,
      did,
      txHash,
      message: 'DID reactivated successfully'
    });
  } catch (error) {
    console.error('Error reactivating identity:', error);
    res.status(500).json({ error: 'Failed to reactivate identity' });
  }
});

/**
 * @route GET /api/identity/address/:address
 * @desc Get DID by Ethereum address
 * @access Public
 */
router.get('/address/:address', validate({
  params: Joi.object({ address: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required() })
}), async (req, res) => {
  try {
    const { address } = req.params;

    // Get DID by address
    const did = await blockchainService.getDIDByAddress(address);

    if (!did) {
      return res.status(404).json({ error: 'No DID found for this address' });
    }

    res.json({
      success: true,
      address,
      did
    });
  } catch (error) {
    console.error('Error getting DID by address:', error);
    res.status(500).json({ error: 'Failed to get DID by address' });
  }
});

/**
 * @route GET /api/identity/network/info
 * @desc Get blockchain network information
 * @access Public
 */
router.get('/network/info', async (req, res) => {
  try {
    const networkInfo = await blockchainService.getNetworkInfo();

    res.json({
      success: true,
      network: networkInfo
    });
  } catch (error) {
    console.error('Error getting network info:', error);
    res.status(500).json({ error: 'Failed to get network info' });
  }
});

module.exports = router;

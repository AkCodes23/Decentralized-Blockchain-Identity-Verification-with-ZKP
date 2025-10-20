const express = require('express');
const router = express.Router();
const blockchainService = require('../services/blockchain');
const ipfsService = require('../services/ipfs');
const { v4: uuidv4 } = require('uuid');
const { validate, Joi } = require('../middleware/validate');

/**
 * @route POST /api/credentials/issue
 * @desc Issue a new credential
 * @access Public
 */
router.post('/issue', validate({
  body: Joi.object({
    credentialId: Joi.string().min(4).required(),
    holderDID: Joi.string().required(),
    credentialType: Joi.string().required(),
    credentialData: Joi.object().required(),
    expiresAt: Joi.alternatives().try(Joi.date().iso(), Joi.string().allow(null), Joi.number()).optional(),
    attributes: Joi.array().items(Joi.string()).default([]),
    metadata: Joi.object().default({}),
    issuerDID: Joi.string().optional()
  })
}), async (req, res) => {
  try {
    const {
      credentialId,
      holderDID,
      credentialType,
      credentialData,
      expiresAt,
      attributes,
      metadata
    } = req.body;

    // Validate input
    if (!credentialId || !holderDID || !credentialType || !credentialData) {
      return res.status(400).json({ error: 'Invalid input data' });
    }

    // Create credential document
    const credentialDocument = {
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        'https://www.w3.org/2018/credentials/examples/v1'
      ],
      type: ['VerifiableCredential', credentialType],
      id: credentialId,
      issuer: req.body.issuerDID || 'did:example:issuer',
      issuanceDate: new Date().toISOString(),
      expirationDate: expiresAt ? new Date(expiresAt).toISOString() : null,
      credentialSubject: {
        id: holderDID,
        ...credentialData
      },
      attributes: attributes || [],
      metadata: metadata || {}
    };

    // Store credential document on IPFS
    const credentialHash = await ipfsService.addCredential(credentialDocument);

    // Issue credential on blockchain
    const txHash = await blockchainService.issueCredential(
      credentialId,
      holderDID,
      credentialType,
      credentialHash,
      expiresAt ? Math.floor(new Date(expiresAt).getTime() / 1000) : 0,
      attributes || [],
      JSON.stringify(metadata || {}),
      req.body.issuerDID || 'did:example:issuer'
    );

    res.json({
      success: true,
      credentialId,
      holderDID,
      credentialType,
      credentialHash,
      txHash,
      credentialDocument
    });
  } catch (error) {
    console.error('Error issuing credential:', error);
    res.status(500).json({ error: 'Failed to issue credential' });
  }
});

/**
 * @route GET /api/credentials/:credentialId
 * @desc Get credential by ID
 * @access Public
 */
router.get('/:credentialId', validate({
  params: Joi.object({ credentialId: Joi.string().required() })
}), async (req, res) => {
  try {
    const { credentialId } = req.params;

    // Get credential from blockchain
    const credential = await blockchainService.getCredential(credentialId);
    
    if (!credential.credentialId) {
      return res.status(404).json({ error: 'Credential not found' });
    }

    // Get full credential document from IPFS (optional)
    let credentialDocument = null;
    try {
      credentialDocument = await ipfsService.getCredential(credential.credentialHash);
    } catch (e) {
      console.warn(`IPFS unavailable or credential document not retrievable for ${credentialId}:`, e.message || e);
    }

    // Check if credential is valid
    const isValid = await blockchainService.verifyCredential(credentialId);

    res.json({
      success: true,
      credential: {
        ...credential,
        isValid,
        credentialDocument
      }
    });
  } catch (error) {
    console.error('Error getting credential:', error);
    res.status(500).json({ error: 'Failed to get credential' });
  }
});

/**
 * @route GET /api/credentials/holder/:holderDID
 * @desc Get all credentials for a holder
 * @access Public
 */
router.get('/holder/:holderDID', validate({
  params: Joi.object({ holderDID: Joi.string().required() })
}), async (req, res) => {
  try {
    const { holderDID } = req.params;

    // Get credentials by holder from blockchain
    const credentialIds = await blockchainService.getCredentialsByHolder(holderDID);
    
    const credentials = [];
    for (const credentialId of credentialIds) {
      try {
        const credential = await blockchainService.getCredential(credentialId);
        const isValid = await blockchainService.verifyCredential(credentialId);
        
        credentials.push({
          ...credential,
          isValid
        });
      } catch (error) {
        console.error(`Error getting credential ${credentialId}:`, error);
      }
    }

    res.json({
      success: true,
      holderDID,
      credentials,
      count: credentials.length
    });
  } catch (error) {
    console.error('Error getting credentials by holder:', error);
    res.status(500).json({ error: 'Failed to get credentials by holder' });
  }
});

/**
 * @route GET /api/credentials/issuer/:issuerDID
 * @desc Get all credentials issued by an issuer
 * @access Public
 */
router.get('/issuer/:issuerDID', validate({
  params: Joi.object({ issuerDID: Joi.string().required() })
}), async (req, res) => {
  try {
    const { issuerDID } = req.params;

    // Get credentials by issuer from blockchain
    const credentialIds = await blockchainService.getCredentialsByIssuer(issuerDID);
    
    const credentials = [];
    for (const credentialId of credentialIds) {
      try {
        const credential = await blockchainService.getCredential(credentialId);
        const isValid = await blockchainService.verifyCredential(credentialId);
        
        credentials.push({
          ...credential,
          isValid
        });
      } catch (error) {
        console.error(`Error getting credential ${credentialId}:`, error);
      }
    }

    res.json({
      success: true,
      issuerDID,
      credentials,
      count: credentials.length
    });
  } catch (error) {
    console.error('Error getting credentials by issuer:', error);
    res.status(500).json({ error: 'Failed to get credentials by issuer' });
  }
});

/**
 * @route POST /api/credentials/:credentialId/revoke
 * @desc Revoke a credential
 * @access Public
 */
router.post('/:credentialId/revoke', validate({
  params: Joi.object({ credentialId: Joi.string().required() })
}), async (req, res) => {
  try {
    const { credentialId } = req.params;

    // Revoke credential on blockchain
    const txHash = await blockchainService.revokeCredential(credentialId);

    res.json({
      success: true,
      credentialId,
      txHash,
      message: 'Credential revoked successfully'
    });
  } catch (error) {
    console.error('Error revoking credential:', error);
    res.status(500).json({ error: 'Failed to revoke credential' });
  }
});

/**
 * @route PUT /api/credentials/:credentialId
 * @desc Update a credential
 * @access Public
 */
router.put('/:credentialId', validate({
  params: Joi.object({ credentialId: Joi.string().required() }),
  body: Joi.object({
    credentialData: Joi.object().required(),
    attributes: Joi.array().items(Joi.string()).default([]),
    metadata: Joi.object().default({})
  })
}), async (req, res) => {
  try {
    const { credentialId } = req.params;
    const { credentialData, attributes, metadata } = req.body;

    // Get current credential
    const currentCredential = await blockchainService.getCredential(credentialId);
    
    if (!currentCredential.credentialId) {
      return res.status(404).json({ error: 'Credential not found' });
    }

    // Create updated credential document
    const updatedCredentialDocument = {
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        'https://www.w3.org/2018/credentials/examples/v1'
      ],
      type: ['VerifiableCredential', currentCredential.credentialType],
      id: credentialId,
      issuer: currentCredential.issuerDID,
      issuanceDate: currentCredential.issuedAt,
      expirationDate: currentCredential.expiresAt !== '0' ? new Date(parseInt(currentCredential.expiresAt) * 1000).toISOString() : null,
      credentialSubject: {
        id: currentCredential.holderDID,
        ...credentialData
      },
      attributes: attributes || [],
      metadata: metadata || {}
    };

    // Store updated credential document on IPFS
    const newCredentialHash = await ipfsService.addCredential(updatedCredentialDocument);

    // Update credential on blockchain
    const txHash = await blockchainService.updateCredential(
      credentialId,
      newCredentialHash,
      attributes || [],
      JSON.stringify(metadata || {})
    );

    res.json({
      success: true,
      credentialId,
      credentialHash: newCredentialHash,
      txHash,
      credentialDocument: updatedCredentialDocument
    });
  } catch (error) {
    console.error('Error updating credential:', error);
    res.status(500).json({ error: 'Failed to update credential' });
  }
});

/**
 * @route GET /api/credentials/:credentialId/verify
 * @desc Verify a credential
 * @access Public
 */
router.get('/:credentialId/verify', validate({
  params: Joi.object({ credentialId: Joi.string().required() })
}), async (req, res) => {
  try {
    const { credentialId } = req.params;

    // Verify credential on blockchain
    const isValid = await blockchainService.verifyCredential(credentialId);

    res.json({
      success: true,
      credentialId,
      isValid,
      verifiedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error verifying credential:', error);
    res.status(500).json({ error: 'Failed to verify credential' });
  }
});

module.exports = router;

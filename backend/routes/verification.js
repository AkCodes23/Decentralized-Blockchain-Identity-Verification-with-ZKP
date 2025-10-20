const express = require('express');
const router = express.Router();
const blockchainService = require('../services/blockchain');
const zkpService = require('../services/zkp');
const { v4: uuidv4 } = require('uuid');
const { validate, Joi } = require('../middleware/validate');

/**
 * @route POST /api/verification/request
 * @desc Submit a verification request with zero-knowledge proof
 * @access Public
 */
router.post('/request', validate({
  body: Joi.object({
    credentialId: Joi.string().required(),
    circuitType: Joi.string().valid('age_verification', 'credential_ownership', 'selective_disclosure').required(),
    proofData: Joi.object().required(),
    publicInputs: Joi.array().required(),
    verificationParams: Joi.any().optional(),
    verifierDID: Joi.string().optional()
  })
}), async (req, res) => {
  try {
    const {
      credentialId,
      circuitType,
      proofData,
      publicInputs,
      verificationParams
    } = req.body;

    // Validate input
    if (!credentialId || !circuitType || !proofData || !publicInputs) {
      return res.status(400).json({ error: 'Invalid input data' });
    }

    // Generate request ID
    const requestId = uuidv4();

    // Get verifier DID from request or use a default
    const verifierDID = req.body.verifierDID || 'did:example:verifier';

    // Submit verification request to blockchain
    const txHash = await blockchainService.submitVerificationRequest(
      requestId,
      credentialId,
      circuitType,
      JSON.stringify(proofData),
      publicInputs,
      verifierDID
    );

    res.json({
      success: true,
      requestId,
      credentialId,
      circuitType,
      txHash,
      status: 'submitted'
    });
  } catch (error) {
    console.error('Error submitting verification request:', error);
    res.status(500).json({ error: 'Failed to submit verification request' });
  }
});

/**
 * @route GET /api/verification/:requestId
 * @desc Get verification request status
 * @access Public
 */
router.get('/:requestId', validate({
  params: Joi.object({ requestId: Joi.string().uuid({ version: 'uuidv4' }).required() })
}), async (req, res) => {
  try {
    const { requestId } = req.params;

    // Get verification request from blockchain
    const verificationRequest = await blockchainService.getVerificationRequest(requestId);
    
    if (!verificationRequest.requestId) {
      return res.status(404).json({ error: 'Verification request not found' });
    }

    res.json({
      success: true,
      verificationRequest
    });
  } catch (error) {
    console.error('Error getting verification request:', error);
    res.status(500).json({ error: 'Failed to get verification request' });
  }
});

/**
 * @route POST /api/verification/generate-proof
 * @desc Generate zero-knowledge proof for credential verification
 * @access Public
 */
router.post('/generate-proof', validate({
  body: Joi.object({
    credentialType: Joi.string().valid('age_verification', 'credential_ownership', 'selective_disclosure').required(),
    credentialData: Joi.object().required(),
    verificationParams: Joi.object().required()
  })
}), async (req, res) => {
  try {
    const {
      credentialType,
      credentialData,
      verificationParams
    } = req.body;

    // Validate input
    if (!credentialType || !credentialData || !verificationParams) {
      return res.status(400).json({ error: 'Invalid input data' });
    }

    // Generate proof based on credential type
    const proof = await zkpService.generateCredentialProof(
      credentialType,
      credentialData,
      verificationParams
    );

    res.json({
      success: true,
      proof,
      credentialType,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating proof:', error);
    res.status(500).json({ error: 'Failed to generate proof' });
  }
});

/**
 * @route POST /api/verification/age
 * @desc Generate age verification proof
 * @access Public
 */
router.post('/age', validate({
  body: Joi.object({
    age: Joi.number().integer().min(0).required(),
    minAge: Joi.number().integer().min(0).required()
  })
}), async (req, res) => {
  try {
    const { age, minAge } = req.body;

    // Validate input
    if (age === undefined || minAge === undefined) {
      return res.status(400).json({ error: 'Age and minAge are required' });
    }

    // Generate age verification proof
    const proof = await zkpService.generateAgeVerificationProof(age, minAge);

    res.json({
      success: true,
      proof,
      verificationType: 'age_verification',
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating age verification proof:', error);
    res.status(500).json({ error: 'Failed to generate age verification proof' });
  }
});

/**
 * @route POST /api/verification/credential-ownership
 * @desc Generate credential ownership proof
 * @access Public
 */
router.post('/credential-ownership', validate({
  body: Joi.object({
    credentialHash: Joi.string().required(),
    holderPublicKey: Joi.string().required(),
    expectedHash: Joi.string().required()
  })
}), async (req, res) => {
  try {
    const { credentialHash, holderPublicKey, expectedHash } = req.body;

    // Validate input
    if (!credentialHash || !holderPublicKey || !expectedHash) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Generate credential ownership proof
    const proof = await zkpService.generateCredentialOwnershipProof(
      credentialHash,
      holderPublicKey,
      expectedHash
    );

    res.json({
      success: true,
      proof,
      verificationType: 'credential_ownership',
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating credential ownership proof:', error);
    res.status(500).json({ error: 'Failed to generate credential ownership proof' });
  }
});

/**
 * @route POST /api/verification/selective-disclosure
 * @desc Generate selective disclosure proof
 * @access Public
 */
router.post('/selective-disclosure', validate({
  body: Joi.object({
    credentialAttributes: Joi.array().required(),
    attributeIndex: Joi.number().integer().min(0).required(),
    expectedValue: Joi.any().required(),
    threshold: Joi.number().required()
  })
}), async (req, res) => {
  try {
    const { credentialAttributes, attributeIndex, expectedValue, threshold } = req.body;

    // Validate input
    if (!credentialAttributes || !Array.isArray(credentialAttributes) || 
        attributeIndex === undefined || expectedValue === undefined || threshold === undefined) {
      return res.status(400).json({ error: 'Invalid input data' });
    }

    // Generate selective disclosure proof
    const proof = await zkpService.generateSelectiveDisclosureProof(
      credentialAttributes,
      attributeIndex,
      expectedValue,
      threshold
    );

    res.json({
      success: true,
      proof,
      verificationType: 'selective_disclosure',
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating selective disclosure proof:', error);
    res.status(500).json({ error: 'Failed to generate selective disclosure proof' });
  }
});

/**
 * @route POST /api/verification/verify-proof
 * @desc Verify a zero-knowledge proof locally
 * @access Public
 */
router.post('/verify-proof', validate({
  body: Joi.object({
    proof: Joi.object().required(),
    publicInputs: Joi.array().required()
  })
}), async (req, res) => {
  try {
    const { proof, publicInputs } = req.body;

    // Validate input
    if (!proof || !publicInputs) {
      return res.status(400).json({ error: 'Proof and public inputs are required' });
    }

    // Verify proof
    const isValid = await zkpService.verifyProof(proof, publicInputs);

    res.json({
      success: true,
      isValid,
      verifiedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error verifying proof:', error);
    res.status(500).json({ error: 'Failed to verify proof' });
  }
});

/**
 * @route GET /api/verification/requests/all
 * @desc Get all verification requests
 * @access Public
 */
router.get('/requests/all', validate({
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10)
  })
}), async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    // Get total number of verification requests
    const totalRequests = await blockchainService.getTotalVerificationRequests();
    
    // Get verification requests (simplified - in practice you'd paginate)
    const requests = [];
    const startIndex = (page - 1) * limit;
    const endIndex = Math.min(startIndex + limit, totalRequests);
    
    for (let i = startIndex; i < endIndex; i++) {
      try {
        const requestId = await blockchainService.getVerificationRequestAtIndex(i);
        const request = await blockchainService.getVerificationRequest(requestId);
        requests.push(request);
      } catch (error) {
        console.error(`Error getting verification request at index ${i}:`, error);
      }
    }

    res.json({
      success: true,
      requests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalRequests,
        pages: Math.ceil(totalRequests / limit)
      }
    });
  } catch (error) {
    console.error('Error getting all verification requests:', error);
    res.status(500).json({ error: 'Failed to get verification requests' });
  }
});

/**
 * @route GET /api/verification/stats
 * @desc Get verification statistics
 * @access Public
 */
router.get('/stats', async (req, res) => {
  try {
    // Get ZKP service cache stats
    const cacheStats = zkpService.getCacheStats();
    
    // Get total verification requests
    const totalRequests = await blockchainService.getTotalVerificationRequests();

    res.json({
      success: true,
      stats: {
        totalVerificationRequests: totalRequests,
        zkpCacheSize: cacheStats.size,
        zkpCacheKeys: cacheStats.keys.length
      }
    });
  } catch (error) {
    console.error('Error getting verification stats:', error);
    res.status(500).json({ error: 'Failed to get verification stats' });
  }
});

module.exports = router;

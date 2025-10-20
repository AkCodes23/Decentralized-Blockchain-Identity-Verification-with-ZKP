const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000 // limit each IP to 1000 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Mock data storage
let identities = new Map();
let credentials = new Map();
let verificationRequests = new Map();

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    message: 'Blockchain Identity System Backend is running'
  });
});

// ========================================
// IDENTITY ENDPOINTS
// ========================================

// Create new identity
app.post('/api/identity/create', (req, res) => {
  try {
    const { did, publicKeys, services, metadata } = req.body;
    
    console.log('Creating identity:', { did, publicKeys, services });
    
    if (!did || !publicKeys || !Array.isArray(publicKeys)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid input data. DID and publicKeys are required.' 
      });
    }

    // Check if DID already exists
    if (identities.has(did)) {
      return res.status(409).json({ 
        success: false,
        error: 'DID already exists' 
      });
    }

    // Create identity record
    const identity = {
      did: did,
      publicKeys: publicKeys,
      services: services || ['https://identity.example.com'],
      metadata: metadata || {},
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Store identity
    identities.set(did, identity);
    
    // Also store by address (first public key)
    if (publicKeys.length > 0) {
      identities.set(publicKeys[0], identity);
    }

    console.log('Identity created successfully:', did);

    res.json({
      success: true,
      message: 'Identity created successfully',
      data: {
        did: did,
        transactionHash: '0x' + Math.random().toString(16).substr(2, 64),
        status: 'active'
      }
    });
  } catch (error) {
    console.error('Error creating identity:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Get identity by address
app.get('/api/identity/address/:address', (req, res) => {
  try {
    const { address } = req.params;
    
    console.log('Getting identity for address:', address);
    
    const identity = identities.get(address);
    
    if (identity) {
      res.json({
        success: true,
        did: identity.did,
        address: address,
        status: identity.status,
        publicKeys: identity.publicKeys,
        services: identity.services,
        createdAt: identity.createdAt
      });
    } else {
      res.json({
        success: false,
        message: 'Identity not found for this address'
      });
    }
  } catch (error) {
    console.error('Error getting identity:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
});

// Get DID document
app.get('/api/identity/:did', (req, res) => {
  try {
    const { did } = req.params;
    
    console.log('Getting DID document:', did);
    
    const identity = identities.get(did);
    
    if (identity) {
      res.json({
        success: true,
        did: identity.did,
        publicKeys: identity.publicKeys,
        services: identity.services,
        status: identity.status,
        createdAt: identity.createdAt,
        updatedAt: identity.updatedAt
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'DID not found'
      });
    }
  } catch (error) {
    console.error('Error getting DID document:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
});

// ========================================
// CREDENTIAL ENDPOINTS
// ========================================

// Issue credential
app.post('/api/credentials/issue', (req, res) => {
  try {
    const { 
      credentialId, 
      holderDID, 
      credentialType, 
      attributes, 
      metadata,
      expiresAt 
    } = req.body;
    
    console.log('Issuing credential:', { credentialId, holderDID, credentialType });
    
    if (!credentialId || !holderDID || !credentialType) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid input data. credentialId, holderDID, and credentialType are required.' 
      });
    }

    // Check if credential already exists
    if (credentials.has(credentialId)) {
      return res.status(409).json({ 
        success: false,
        error: 'Credential ID already exists' 
      });
    }

    // Create credential record
    const credential = {
      credentialId: credentialId,
      holderDID: holderDID,
      credentialType: credentialType,
      attributes: attributes || [],
      metadata: metadata || {},
      issuerDID: 'did:example:issuer',
      status: 'active',
      issuedAt: new Date().toISOString(),
      expiresAt: expiresAt || null
    };

    // Store credential
    credentials.set(credentialId, credential);

    console.log('Credential issued successfully:', credentialId);

    res.json({
      success: true,
      message: 'Credential issued successfully',
      data: {
        credentialId: credentialId,
        transactionHash: '0x' + Math.random().toString(16).substr(2, 64),
        status: 'active'
      }
    });
  } catch (error) {
    console.error('Error issuing credential:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Get credentials for holder
app.get('/api/credentials/holder/:did', (req, res) => {
  try {
    const { did } = req.params;
    
    console.log('Getting credentials for holder:', did);
    
    const holderCredentials = [];
    
    for (const [credentialId, credential] of credentials) {
      if (credential.holderDID === did) {
        holderCredentials.push(credential);
      }
    }

    res.json({
      success: true,
      credentials: holderCredentials,
      count: holderCredentials.length
    });
  } catch (error) {
    console.error('Error getting credentials:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
});

// Get all credentials
app.get('/api/credentials', (req, res) => {
  try {
    const allCredentials = Array.from(credentials.values());
    
    res.json({
      success: true,
      credentials: allCredentials,
      count: allCredentials.length
    });
  } catch (error) {
    console.error('Error getting all credentials:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
});

// Update credential
app.put('/api/credentials/:credentialId', (req, res) => {
  try {
    const { credentialId } = req.params;
    const { 
      holderDID, 
      credentialType, 
      attributes, 
      metadata,
      expiresAt 
    } = req.body;
    
    console.log('Updating credential:', credentialId);
    
    // Check if credential exists
    if (!credentials.has(credentialId)) {
      return res.status(404).json({ 
        success: false,
        error: 'Credential not found' 
      });
    }

    // Get existing credential
    const credential = credentials.get(credentialId);
    
    // Update credential fields if provided
    if (holderDID !== undefined) credential.holderDID = holderDID;
    if (credentialType !== undefined) credential.credentialType = credentialType;
    if (attributes !== undefined) credential.attributes = attributes;
    if (metadata !== undefined) credential.metadata = metadata;
    if (expiresAt !== undefined) credential.expiresAt = expiresAt;
    
    // Update timestamp
    credential.updatedAt = new Date().toISOString();
    
    // Store updated credential
    credentials.set(credentialId, credential);

    console.log('Credential updated successfully:', credentialId);

    res.json({
      success: true,
      message: 'Credential updated successfully',
      data: {
        credentialId: credentialId,
        status: 'active'
      }
    });
  } catch (error) {
    console.error('Error updating credential:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// ========================================
// VERIFICATION ENDPOINTS
// ========================================

// Generate age verification proof
app.post('/api/verification/age', (req, res) => {
  try {
    const { age, minAge } = req.body;
    
    console.log('Generating age verification proof:', { age, minAge });
    
    if (!age || !minAge) {
      return res.status(400).json({ 
        success: false,
        error: 'Age and minimum age are required' 
      });
    }

    if (parseInt(age) < parseInt(minAge)) {
      return res.status(400).json({ 
        success: false,
        error: 'Age verification failed: age is below minimum required' 
      });
    }

    // Mock proof generation
    const mockProof = {
      proof: {
        a: ["0x1234567890abcdef", "0xabcdef1234567890"],
        b: [["0x9876543210fedcba", "0xfedcba9876543210"], ["0x1111222233334444", "0x5555666677778888"]],
        c: ["0x9999aaaabbbbcccc", "0xddddeeeeffff0000"]
      },
      inputs: [minAge],
      circuitType: 'age_verification'
    };

    res.json({
      success: true,
      message: 'Age verification proof generated successfully',
      proof: mockProof,
      verified: true
    });
  } catch (error) {
    console.error('Error generating age verification proof:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
});

// Generate credential ownership proof
app.post('/api/verification/credential-ownership', (req, res) => {
  try {
    const { credentialHash, holderPublicKey, expectedHash } = req.body;
    
    console.log('Generating credential ownership proof:', { credentialHash, holderPublicKey, expectedHash });
    
    if (!credentialHash || !holderPublicKey || !expectedHash) {
      return res.status(400).json({ 
        success: false,
        error: 'Credential hash, holder public key, and expected hash are required' 
      });
    }

    // Mock proof generation
    const mockProof = {
      proof: {
        a: ["0xabcdef1234567890", "0x1234567890abcdef"],
        b: [["0x5555666677778888", "0x1111222233334444"], ["0x9999aaaabbbbcccc", "0xddddeeeeffff0000"]],
        c: ["0xfedcba9876543210", "0x9876543210fedcba"]
      },
      inputs: [expectedHash],
      circuitType: 'credential_ownership'
    };

    res.json({
      success: true,
      message: 'Credential ownership proof generated successfully',
      proof: mockProof,
      verified: true
    });
  } catch (error) {
    console.error('Error generating credential ownership proof:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
});

// Submit verification request (alternative endpoint for frontend)
app.post('/api/verification/request', (req, res) => {
  try {
    const { 
      credentialId, 
      circuitType,
      proofData, 
      publicInputs,
      verifierDID 
    } = req.body;
    
    console.log('Submitting verification request:', { credentialId, circuitType });
    
    if (!credentialId || !circuitType || !proofData) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid input data. credentialId, circuitType, and proofData are required.' 
      });
    }

    // Check if credential exists (but don't fail if it doesn't for demo purposes)
    const credential = credentials.get(credentialId);
    if (!credential) {
      console.log('Warning: Credential not found, but continuing for demo purposes');
    }

    // Generate request ID
    const requestId = 'req_' + Math.random().toString(16).substr(2, 8);
    
    // Create verification request
    const verificationRequest = {
      requestId: requestId,
      credentialId: credentialId,
      verifierDID: verifierDID || 'did:example:verifier',
      circuitType: circuitType,
      proofData: proofData,
      publicInputs: publicInputs || [],
      status: 'pending',
      submittedAt: new Date().toISOString(),
      verifiedAt: null,
      result: null,
      isVerified: false,
      verificationResult: null
    };

    // Store verification request
    verificationRequests.set(requestId, verificationRequest);

    // Simulate verification process (in real system, this would be async)
    setTimeout(() => {
      const request = verificationRequests.get(requestId);
      if (request) {
        request.status = 'verified';
        request.verifiedAt = new Date().toISOString();
        request.isVerified = true;
        request.result = {
          verified: true,
          message: 'Verification successful',
          proofValid: true
        };
        request.verificationResult = 'Proof verified successfully';
        verificationRequests.set(requestId, request);
        console.log('Verification completed for request:', requestId);
      }
    }, 2000);

    console.log('Verification request submitted:', requestId);

    res.json({
      success: true,
      message: 'Verification request submitted successfully',
      data: {
        requestId: requestId,
        status: 'pending',
        estimatedCompletion: '2 seconds'
      }
    });
  } catch (error) {
    console.error('Error submitting verification:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Submit verification request
app.post('/api/verification/submit', (req, res) => {
  try {
    const { 
      credentialId, 
      proofData, 
      verifierDID,
      verificationType 
    } = req.body;
    
    console.log('Submitting verification request:', { credentialId, verifierDID });
    
    if (!credentialId || !proofData) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid input data. credentialId and proofData are required.' 
      });
    }

    // Check if credential exists (but don't fail if it doesn't for demo purposes)
    const credential = credentials.get(credentialId);
    if (!credential) {
      console.log('Warning: Credential not found, but continuing for demo purposes');
    }

    // Generate request ID
    const requestId = 'req_' + Math.random().toString(16).substr(2, 8);
    
    // Create verification request
    const verificationRequest = {
      requestId: requestId,
      credentialId: credentialId,
      verifierDID: verifierDID || 'did:example:verifier',
      proofData: proofData,
      verificationType: verificationType || 'credential_ownership',
      status: 'pending',
      submittedAt: new Date().toISOString(),
      verifiedAt: null,
      result: null
    };

    // Store verification request
    verificationRequests.set(requestId, verificationRequest);

    // Simulate verification process (in real system, this would be async)
    setTimeout(() => {
      const request = verificationRequests.get(requestId);
      if (request) {
        request.status = 'verified';
        request.verifiedAt = new Date().toISOString();
        request.result = {
          verified: true,
          message: 'Verification successful',
          proofValid: true
        };
        verificationRequests.set(requestId, request);
        console.log('Verification completed for request:', requestId);
      }
    }, 2000);

    console.log('Verification request submitted:', requestId);

    res.json({
      success: true,
      message: 'Verification request submitted successfully',
      data: {
        requestId: requestId,
        status: 'pending',
        estimatedCompletion: '2 seconds'
      }
    });
  } catch (error) {
    console.error('Error submitting verification:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Get verification requests
app.get('/api/verification/requests', (req, res) => {
  try {
    const allRequests = Array.from(verificationRequests.values());
    
    res.json({
      success: true,
      requests: allRequests,
      count: allRequests.length
    });
  } catch (error) {
    console.error('Error getting verification requests:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
});

// Get verification requests (alternative endpoint for frontend)
app.get('/api/verification/requests/all', (req, res) => {
  try {
    const allRequests = Array.from(verificationRequests.values());
    
    res.json({
      success: true,
      requests: allRequests,
      count: allRequests.length
    });
  } catch (error) {
    console.error('Error getting verification requests:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
});

// Get specific verification request
app.get('/api/verification/request/:requestId', (req, res) => {
  try {
    const { requestId } = req.params;
    
    const request = verificationRequests.get(requestId);
    
    if (request) {
      res.json({
        success: true,
        request: request
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Verification request not found'
      });
    }
  } catch (error) {
    console.error('Error getting verification request:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
});

// ========================================
// UTILITY ENDPOINTS
// ========================================

// Get system status
app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    status: 'operational',
    timestamp: new Date().toISOString(),
    statistics: {
      identities: identities.size,
      credentials: credentials.size,
      verificationRequests: verificationRequests.size
    }
  });
});

// Clear all data (for testing)
app.post('/api/clear', (req, res) => {
  identities.clear();
  credentials.clear();
  verificationRequests.clear();
  
  res.json({
    success: true,
    message: 'All data cleared'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Route not found',
    path: req.originalUrl 
  });
});

// Initialize with dummy data for testing
function initializeDummyData() {
  console.log('📊 Initializing dummy data for testing...');
  
  // Add dummy identities
  const dummyIdentities = [
    {
      did: "did:example:alice123",
      publicKeys: ["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"],
      services: ["https://identity.example.com"],
      metadata: { name: "Alice Johnson", email: "alice@example.com" },
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      did: "did:example:bob456",
      publicKeys: ["0x70997970C51812dc3A010C7d01b50e0d17dc79C8"],
      services: ["https://identity.example.com"],
      metadata: { name: "Bob Smith", email: "bob@example.com" },
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  dummyIdentities.forEach(identity => {
    identities.set(identity.did, identity);
    if (identity.publicKeys.length > 0) {
      identities.set(identity.publicKeys[0], identity);
    }
  });

  // Add dummy credentials
  const dummyCredentials = [
    {
      credentialId: "cred_001",
      holderDID: "did:example:alice123",
      credentialType: "Educational",
      attributes: ["Bachelor of Computer Science", "GPA: 3.8", "Graduation Year: 2023"],
      metadata: { institution: "Example University", degree: "BSc Computer Science" },
      issuerDID: "did:example:university",
      status: "active",
      issuedAt: new Date().toISOString(),
      expiresAt: null
    },
    {
      credentialId: "cred_002",
      holderDID: "did:example:alice123",
      credentialType: "Professional",
      attributes: ["Software Engineer", "5 years experience", "Full Stack Developer"],
      metadata: { company: "Tech Corp", position: "Senior Developer" },
      issuerDID: "did:example:employer",
      status: "active",
      issuedAt: new Date().toISOString(),
      expiresAt: null
    },
    {
      credentialId: "cred_003",
      holderDID: "did:example:bob456",
      credentialType: "Educational",
      attributes: ["Master of Business Administration", "GPA: 3.9", "Graduation Year: 2022"],
      metadata: { institution: "Business School", degree: "MBA" },
      issuerDID: "did:example:university",
      status: "active",
      issuedAt: new Date().toISOString(),
      expiresAt: null
    }
  ];

  dummyCredentials.forEach(credential => {
    credentials.set(credential.credentialId, credential);
  });

  // Add dummy verification requests
  const dummyVerificationRequests = [
    {
      requestId: "req_001",
      credentialId: "cred_001",
      verifierDID: "did:example:verifier",
      circuitType: "age_verification",
      proofData: "mock_proof_data_12345",
      publicInputs: [18],
      status: "verified",
      submittedAt: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
      verifiedAt: new Date(Date.now() - 240000).toISOString(), // 4 minutes ago
      isVerified: true,
      verificationResult: "Age verification successful: User is above 18 years old",
      result: {
        verified: true,
        message: "Verification successful",
        proofValid: true
      }
    },
    {
      requestId: "req_002",
      credentialId: "cred_002",
      verifierDID: "did:example:verifier",
      circuitType: "credential_ownership",
      proofData: "mock_proof_data_67890",
      publicInputs: ["0x1234567890abcdef"],
      status: "verified",
      submittedAt: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
      verifiedAt: new Date(Date.now() - 540000).toISOString(), // 9 minutes ago
      isVerified: true,
      verificationResult: "Credential ownership verified: User owns the specified credential",
      result: {
        verified: true,
        message: "Verification successful",
        proofValid: true
      }
    },
    {
      requestId: "req_003",
      credentialId: "cred_003",
      verifierDID: "did:example:verifier",
      circuitType: "selective_disclosure",
      proofData: "mock_proof_data_abcdef",
      publicInputs: [3.9, 0],
      status: "pending",
      submittedAt: new Date(Date.now() - 120000).toISOString(), // 2 minutes ago
      verifiedAt: null,
      isVerified: false,
      verificationResult: null,
      result: null
    }
  ];

  dummyVerificationRequests.forEach(request => {
    verificationRequests.set(request.requestId, request);
  });

  console.log(`✅ Dummy data initialized:`);
  console.log(`   - ${identities.size} identities`);
  console.log(`   - ${credentials.size} credentials`);
  console.log(`   - ${verificationRequests.size} verification requests`);
}

app.listen(PORT, () => {
  console.log('🚀 Blockchain Identity System Backend Started!');
  console.log('===============================================');
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('');
  
  // Initialize dummy data
  initializeDummyData();
  
  console.log('');
  console.log('📋 Available Endpoints:');
  console.log('  GET  /api/health - Health check');
  console.log('  GET  /api/status - System status');
  console.log('');
  console.log('🔑 Identity Endpoints:');
  console.log('  POST /api/identity/create - Create new DID');
  console.log('  GET  /api/identity/address/:address - Get identity by address');
  console.log('  GET  /api/identity/:did - Get DID document');
  console.log('');
  console.log('📜 Credential Endpoints:');
  console.log('  POST /api/credentials/issue - Issue new credential');
  console.log('  GET  /api/credentials/holder/:did - Get credentials for holder');
  console.log('  GET  /api/credentials - Get all credentials');
  console.log('  PUT  /api/credentials/:credentialId - Update credential');
  console.log('');
  console.log('🔍 Verification Endpoints:');
  console.log('  POST /api/verification/age - Generate age verification proof');
  console.log('  POST /api/verification/credential-ownership - Generate ownership proof');
  console.log('  POST /api/verification/request - Submit verification request');
  console.log('  POST /api/verification/submit - Submit verification request (alt)');
  console.log('  GET  /api/verification/requests - Get all verification requests');
  console.log('  GET  /api/verification/requests/all - Get all verification requests (alt)');
  console.log('  GET  /api/verification/request/:requestId - Get specific request');
  console.log('');
  console.log('🛠️  Utility Endpoints:');
  console.log('  POST /api/clear - Clear all data (testing)');
  console.log('');
  console.log('✅ Backend is ready to serve requests!');
  console.log('');
  console.log('🧪 Test Data Available:');
  console.log('   - Alice (did:example:alice123) - 2 credentials');
  console.log('   - Bob (did:example:bob456) - 1 credential');
  console.log('   - 3 verification requests (2 verified, 1 pending)');
});
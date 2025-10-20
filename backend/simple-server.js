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
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Mock identity endpoints
app.post('/api/identity/create', (req, res) => {
  try {
    const { did, publicKeys, services, metadata } = req.body;
    
    if (!did || !publicKeys || !Array.isArray(publicKeys)) {
      return res.status(400).json({ error: 'Invalid input data' });
    }

    // Mock response
    res.json({
      success: true,
      message: 'Identity created successfully',
      did: did,
      transactionHash: '0x' + Math.random().toString(16).substr(2, 64)
    });
  } catch (error) {
    console.error('Error creating identity:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/identity/address/:address', (req, res) => {
  try {
    const { address } = req.params;
    
    // Mock response - return a sample DID
    res.json({
      success: true,
      did: 'did:example:alice123',
      address: address,
      status: 'active'
    });
  } catch (error) {
    console.error('Error getting identity:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/identity/:did', (req, res) => {
  try {
    const { did } = req.params;
    
    // Mock DID document
    res.json({
      success: true,
      did: did,
      publicKeys: ['0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'],
      services: ['https://identity.example.com'],
      status: 'active',
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting DID document:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mock credential endpoints
app.post('/api/credentials/issue', (req, res) => {
  try {
    const { credentialId, holderDID, credentialType, attributes, metadata } = req.body;
    
    if (!credentialId || !holderDID || !credentialType) {
      return res.status(400).json({ error: 'Invalid input data' });
    }

    // Mock response
    res.json({
      success: true,
      message: 'Credential issued successfully',
      credentialId: credentialId,
      transactionHash: '0x' + Math.random().toString(16).substr(2, 64)
    });
  } catch (error) {
    console.error('Error issuing credential:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/credentials/holder/:did', (req, res) => {
  try {
    const { did } = req.params;
    
    // Mock credentials
    res.json({
      success: true,
      credentials: [
        {
          credentialId: 'cred_001',
          credentialType: 'Educational',
          holderDID: did,
          issuerDID: 'did:example:university',
          attributes: ['Bachelor of Computer Science', 'GPA: 3.8'],
          status: 'active',
          issuedAt: new Date().toISOString()
        }
      ]
    });
  } catch (error) {
    console.error('Error getting credentials:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mock verification endpoints
app.post('/api/verification/submit', (req, res) => {
  try {
    const { credentialId, proofData, verifierDID } = req.body;
    
    if (!credentialId || !proofData) {
      return res.status(400).json({ error: 'Invalid input data' });
    }

    // Mock response
    res.json({
      success: true,
      message: 'Verification request submitted successfully',
      requestId: 'req_' + Math.random().toString(16).substr(2, 8),
      status: 'pending'
    });
  } catch (error) {
    console.error('Error submitting verification:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/verification/requests', (req, res) => {
  try {
    // Mock verification requests
    res.json({
      success: true,
      requests: [
        {
          requestId: 'req_001',
          credentialId: 'cred_001',
          status: 'verified',
          verifiedAt: new Date().toISOString()
        }
      ]
    });
  } catch (error) {
    console.error('Error getting verification requests:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Simple server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('Mock API endpoints available:');
  console.log('- POST /api/identity/create');
  console.log('- GET /api/identity/address/:address');
  console.log('- GET /api/identity/:did');
  console.log('- POST /api/credentials/issue');
  console.log('- GET /api/credentials/holder/:did');
  console.log('- POST /api/verification/submit');
  console.log('- GET /api/verification/requests');
});

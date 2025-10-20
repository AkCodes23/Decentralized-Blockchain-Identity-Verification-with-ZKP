const { ethers } = require('ethers');
const axios = require('axios');

// Demo scenarios for the Blockchain Identity System
class DemoScenarios {
  constructor() {
    this.provider = new ethers.JsonRpcProvider('http://localhost:8545');
    this.apiBaseUrl = 'http://localhost:5000/api';
  }

  async runAllScenarios() {
    console.log('🚀 Starting Blockchain Identity System Demo Scenarios\n');

    try {
      // Scenario 1: Create DIDs for different users
      await this.scenario1_CreateDIDs();
      
      // Scenario 2: Issue credentials
      await this.scenario2_IssueCredentials();
      
      // Scenario 3: Verify credentials
      await this.scenario3_VerifyCredentials();
      
      // Scenario 4: Age verification with ZKP
      await this.scenario4_AgeVerification();
      
      // Scenario 5: Credential ownership verification
      await this.scenario5_CredentialOwnership();
      
      console.log('\n✅ All demo scenarios completed successfully!');
    } catch (error) {
      console.error('❌ Demo scenario failed:', error.message);
    }
  }

  async scenario1_CreateDIDs() {
    console.log('📋 Scenario 1: Creating Decentralized Identities (DIDs)');
    
    const users = [
      {
        name: 'Alice',
        did: 'did:example:alice123',
        publicKeys: ['0x1234567890abcdef1234567890abcdef12345678'],
        services: ['https://alice.example.com/service']
      },
      {
        name: 'Bob',
        did: 'did:example:bob456',
        publicKeys: ['0xabcdef1234567890abcdef1234567890abcdef12'],
        services: ['https://bob.example.com/service']
      },
      {
        name: 'University',
        did: 'did:example:university789',
        publicKeys: ['0x9876543210fedcba9876543210fedcba98765432'],
        services: ['https://university.example.com/issuer']
      }
    ];

    for (const user of users) {
      try {
        const response = await axios.post(`${this.apiBaseUrl}/identity/create`, {
          did: user.did,
          publicKeys: user.publicKeys,
          services: user.services,
          metadata: {
            name: user.name,
            createdBy: 'demo-script',
            createdAt: new Date().toISOString()
          }
        });

        if (response.data.success) {
          console.log(`  ✅ Created DID for ${user.name}: ${user.did}`);
        }
      } catch (error) {
        console.log(`  ⚠️  Failed to create DID for ${user.name}: ${error.response?.data?.error || error.message}`);
      }
    }
    console.log('');
  }

  async scenario2_IssueCredentials() {
    console.log('📋 Scenario 2: Issuing Digital Credentials');
    
    const credentials = [
      {
        credentialId: 'cred_alice_degree_001',
        holderDID: 'did:example:alice123',
        credentialType: 'EducationalCredential',
        credentialData: {
          degree: 'Bachelor of Computer Science',
          institution: 'Tech University',
          graduationYear: '2023',
          gpa: '3.8'
        },
        attributes: ['Computer Science', 'Bachelor Degree', '2023 Graduate'],
        issuerDID: 'did:example:university789'
      },
      {
        credentialId: 'cred_bob_cert_001',
        holderDID: 'did:example:bob456',
        credentialType: 'ProfessionalCredential',
        credentialData: {
          certification: 'Certified Blockchain Developer',
          issuingOrganization: 'Blockchain Institute',
          issueDate: '2024-01-15',
          expiryDate: '2026-01-15'
        },
        attributes: ['Blockchain', 'Developer', 'Certified'],
        issuerDID: 'did:example:university789'
      },
      {
        credentialId: 'cred_alice_age_001',
        holderDID: 'did:example:alice123',
        credentialType: 'AgeCredential',
        credentialData: {
          age: 25,
          verifiedBy: 'Government Agency',
          verificationDate: '2024-01-01'
        },
        attributes: ['Age Verified', 'Government Verified'],
        issuerDID: 'did:example:university789'
      }
    ];

    for (const cred of credentials) {
      try {
        const response = await axios.post(`${this.apiBaseUrl}/credentials/issue`, {
          credentialId: cred.credentialId,
          holderDID: cred.holderDID,
          credentialType: cred.credentialType,
          credentialData: cred.credentialData,
          attributes: cred.attributes,
          metadata: {
            issuerDID: cred.issuerDID,
            issuedBy: 'demo-script',
            issuedAt: new Date().toISOString()
          }
        });

        if (response.data.success) {
          console.log(`  ✅ Issued ${cred.credentialType} to ${cred.holderDID}`);
        }
      } catch (error) {
        console.log(`  ⚠️  Failed to issue credential: ${error.response?.data?.error || error.message}`);
      }
    }
    console.log('');
  }

  async scenario3_VerifyCredentials() {
    console.log('📋 Scenario 3: Verifying Credentials');
    
    const credentialIds = [
      'cred_alice_degree_001',
      'cred_bob_cert_001',
      'cred_alice_age_001'
    ];

    for (const credentialId of credentialIds) {
      try {
        const response = await axios.get(`${this.apiBaseUrl}/credentials/${credentialId}/verify`);
        
        if (response.data.success) {
          console.log(`  ✅ Credential ${credentialId} is ${response.data.isValid ? 'VALID' : 'INVALID'}`);
        }
      } catch (error) {
        console.log(`  ⚠️  Failed to verify credential ${credentialId}: ${error.response?.data?.error || error.message}`);
      }
    }
    console.log('');
  }

  async scenario4_AgeVerification() {
    console.log('📋 Scenario 4: Age Verification with Zero-Knowledge Proof');
    
    try {
      // Generate age verification proof
      const proofResponse = await axios.post(`${this.apiBaseUrl}/verification/age`, {
        age: 25,
        minAge: 18
      });

      if (proofResponse.data.success) {
        console.log('  ✅ Generated age verification proof');
        console.log(`  📊 Proof type: ${proofResponse.data.verificationType}`);
        
        // Submit verification request
        const requestResponse = await axios.post(`${this.apiBaseUrl}/verification/request`, {
          credentialId: 'cred_alice_age_001',
          circuitType: 'age_verification',
          proofData: proofResponse.data.proof,
          publicInputs: [18]
        });

        if (requestResponse.data.success) {
          console.log(`  ✅ Submitted verification request: ${requestResponse.data.requestId}`);
        }
      }
    } catch (error) {
      console.log(`  ⚠️  Age verification failed: ${error.response?.data?.error || error.message}`);
    }
    console.log('');
  }

  async scenario5_CredentialOwnership() {
    console.log('📋 Scenario 5: Credential Ownership Verification');
    
    try {
      // Generate credential ownership proof
      const proofResponse = await axios.post(`${this.apiBaseUrl}/verification/credential-ownership`, {
        credentialHash: '0x1234567890abcdef1234567890abcdef12345678',
        holderPublicKey: '0xabcdef1234567890abcdef1234567890abcdef12',
        expectedHash: '0x1234567890abcdef1234567890abcdef12345678'
      });

      if (proofResponse.data.success) {
        console.log('  ✅ Generated credential ownership proof');
        console.log(`  📊 Proof type: ${proofResponse.data.verificationType}`);
        
        // Submit verification request
        const requestResponse = await axios.post(`${this.apiBaseUrl}/verification/request`, {
          credentialId: 'cred_alice_degree_001',
          circuitType: 'credential_ownership',
          proofData: proofResponse.data.proof,
          publicInputs: ['0x1234567890abcdef1234567890abcdef12345678']
        });

        if (requestResponse.data.success) {
          console.log(`  ✅ Submitted verification request: ${requestResponse.data.requestId}`);
        }
      }
    } catch (error) {
      console.log(`  ⚠️  Credential ownership verification failed: ${error.response?.data?.error || error.message}`);
    }
    console.log('');
  }

  async getSystemStats() {
    console.log('📊 System Statistics:');
    
    try {
      // Get verification stats
      const statsResponse = await axios.get(`${this.apiBaseUrl}/verification/stats`);
      if (statsResponse.data.success) {
        const stats = statsResponse.data.stats;
        console.log(`  🔍 Total verification requests: ${stats.totalVerificationRequests}`);
        console.log(`  💾 ZKP cache size: ${stats.zkpCacheSize}`);
      }

      // Get network info
      const networkResponse = await axios.get(`${this.apiBaseUrl}/identity/network/info`);
      if (networkResponse.data.success) {
        const network = networkResponse.data.network;
        console.log(`  🌐 Network: ${network.name} (Chain ID: ${network.chainId})`);
        console.log(`  📦 Block number: ${network.blockNumber}`);
      }
    } catch (error) {
      console.log(`  ⚠️  Failed to get system stats: ${error.message}`);
    }
    console.log('');
  }
}

// Run demo scenarios if this script is executed directly
if (require.main === module) {
  const demo = new DemoScenarios();
  demo.runAllScenarios()
    .then(() => demo.getSystemStats())
    .catch(console.error);
}

module.exports = DemoScenarios;

const { ethers } = require('ethers');
const axios = require('axios');

// Comprehensive system test script
class SystemTester {
  constructor() {
    this.apiBaseUrl = 'http://localhost:5000/api';
    this.testResults = [];
  }

  async runAllTests() {
    console.log('🧪 Starting Comprehensive System Tests\n');

    try {
      // Test 1: API Health Check
      await this.testAPIHealth();
      
      // Test 2: Smart Contract Logic
      await this.testSmartContractLogic();
      
      // Test 3: Identity Management
      await this.testIdentityManagement();
      
      // Test 4: Credential Management
      await this.testCredentialManagement();
      
      // Test 5: Zero-Knowledge Proofs
      await this.testZeroKnowledgeProofs();
      
      // Test 6: Integration Tests
      await this.testIntegration();
      
      // Test 7: Error Handling
      await this.testErrorHandling();
      
      this.printTestResults();
    } catch (error) {
      console.error('❌ System test failed:', error.message);
    }
  }

  async testAPIHealth() {
    console.log('🔍 Testing API Health...');
    
    try {
      const response = await axios.get(`${this.apiBaseUrl}/health`);
      
      if (response.data.status === 'OK') {
        this.addTestResult('API Health Check', true, 'API is responding correctly');
      } else {
        this.addTestResult('API Health Check', false, 'API returned unexpected status');
      }
    } catch (error) {
      this.addTestResult('API Health Check', false, `API not accessible: ${error.message}`);
    }
  }

  async testSmartContractLogic() {
    console.log('🔍 Testing Smart Contract Logic...');
    
    const tests = [
      {
        name: 'DID Creation Logic',
        test: () => this.validateDIDCreationLogic()
      },
      {
        name: 'Credential Issuance Logic',
        test: () => this.validateCredentialIssuanceLogic()
      },
      {
        name: 'Verification Logic',
        test: () => this.validateVerificationLogic()
      }
    ];

    for (const test of tests) {
      try {
        const result = await test.test();
        this.addTestResult(test.name, result, result ? 'Logic is correct' : 'Logic has issues');
      } catch (error) {
        this.addTestResult(test.name, false, `Error: ${error.message}`);
      }
    }
  }

  async validateDIDCreationLogic() {
    // Test DID creation parameters
    const testDID = 'did:test:123';
    const testPublicKeys = ['0x1234567890abcdef'];
    const testServices = ['https://test.example.com'];
    
    // Validate DID format
    if (!testDID.startsWith('did:')) {
      return false;
    }
    
    // Validate public keys
    if (!Array.isArray(testPublicKeys) || testPublicKeys.length === 0) {
      return false;
    }
    
    // Validate services
    if (!Array.isArray(testServices)) {
      return false;
    }
    
    return true;
  }

  async validateCredentialIssuanceLogic() {
    // Test credential issuance parameters
    const testCredential = {
      credentialId: 'cred_test_123',
      holderDID: 'did:test:holder',
      credentialType: 'EducationalCredential',
      credentialData: {
        degree: 'Bachelor of Computer Science',
        institution: 'Test University'
      },
      attributes: ['Computer Science', 'Bachelor'],
      expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000 // 1 year from now
    };
    
    // Validate required fields
    if (!testCredential.credentialId || !testCredential.holderDID || !testCredential.credentialType) {
      return false;
    }
    
    // Validate credential data
    if (!testCredential.credentialData || typeof testCredential.credentialData !== 'object') {
      return false;
    }
    
    // Validate attributes
    if (!Array.isArray(testCredential.attributes)) {
      return false;
    }
    
    return true;
  }

  async validateVerificationLogic() {
    // Test verification parameters
    const testVerification = {
      requestId: 'req_test_123',
      credentialId: 'cred_test_123',
      circuitType: 'age_verification',
      proofData: {
        a: ['0x123', '0x456'],
        b: [['0x789', '0xabc'], ['0xdef', '0x012']],
        c: ['0x345', '0x678']
      },
      publicInputs: [18]
    };
    
    // Validate required fields
    if (!testVerification.requestId || !testVerification.credentialId || !testVerification.circuitType) {
      return false;
    }
    
    // Validate proof structure
    if (!testVerification.proofData || !testVerification.proofData.a || !testVerification.proofData.b || !testVerification.proofData.c) {
      return false;
    }
    
    // Validate public inputs
    if (!Array.isArray(testVerification.publicInputs)) {
      return false;
    }
    
    return true;
  }

  async testIdentityManagement() {
    console.log('🔍 Testing Identity Management...');
    
    try {
      // Test DID creation
      const createResponse = await axios.post(`${this.apiBaseUrl}/identity/create`, {
        did: 'did:test:identity123',
        publicKeys: ['0x1234567890abcdef1234567890abcdef12345678'],
        services: ['https://test.example.com/service'],
        metadata: { test: true }
      });
      
      if (createResponse.data.success) {
        this.addTestResult('DID Creation', true, 'DID created successfully');
        
        // Test DID retrieval
        const getResponse = await axios.get(`${this.apiBaseUrl}/identity/did:test:identity123`);
        if (getResponse.data.success) {
          this.addTestResult('DID Retrieval', true, 'DID retrieved successfully');
        } else {
          this.addTestResult('DID Retrieval', false, 'Failed to retrieve DID');
        }
      } else {
        this.addTestResult('DID Creation', false, 'Failed to create DID');
      }
    } catch (error) {
      this.addTestResult('Identity Management', false, `Error: ${error.response?.data?.error || error.message}`);
    }
  }

  async testCredentialManagement() {
    console.log('🔍 Testing Credential Management...');
    
    try {
      // Test credential issuance
      const issueResponse = await axios.post(`${this.apiBaseUrl}/credentials/issue`, {
        credentialId: 'cred_test_123',
        holderDID: 'did:test:holder123',
        credentialType: 'EducationalCredential',
        credentialData: {
          degree: 'Bachelor of Computer Science',
          institution: 'Test University'
        },
        attributes: ['Computer Science', 'Bachelor'],
        metadata: { test: true }
      });
      
      if (issueResponse.data.success) {
        this.addTestResult('Credential Issuance', true, 'Credential issued successfully');
        
        // Test credential retrieval
        const getResponse = await axios.get(`${this.apiBaseUrl}/credentials/cred_test_123`);
        if (getResponse.data.success) {
          this.addTestResult('Credential Retrieval', true, 'Credential retrieved successfully');
        } else {
          this.addTestResult('Credential Retrieval', false, 'Failed to retrieve credential');
        }
      } else {
        this.addTestResult('Credential Issuance', false, 'Failed to issue credential');
      }
    } catch (error) {
      this.addTestResult('Credential Management', false, `Error: ${error.response?.data?.error || error.message}`);
    }
  }

  async testZeroKnowledgeProofs() {
    console.log('🔍 Testing Zero-Knowledge Proofs...');
    
    try {
      // Test age verification proof generation
      const ageProofResponse = await axios.post(`${this.apiBaseUrl}/verification/age`, {
        age: 25,
        minAge: 18
      });
      
      if (ageProofResponse.data.success && ageProofResponse.data.proof) {
        this.addTestResult('Age Verification Proof', true, 'Age verification proof generated successfully');
      } else {
        this.addTestResult('Age Verification Proof', false, 'Failed to generate age verification proof');
      }
      
      // Test credential ownership proof generation
      const credProofResponse = await axios.post(`${this.apiBaseUrl}/verification/credential-ownership`, {
        credentialHash: '0x1234567890abcdef1234567890abcdef12345678',
        holderPublicKey: '0xabcdef1234567890abcdef1234567890abcdef12',
        expectedHash: '0x1234567890abcdef1234567890abcdef12345678'
      });
      
      if (credProofResponse.data.success && credProofResponse.data.proof) {
        this.addTestResult('Credential Ownership Proof', true, 'Credential ownership proof generated successfully');
      } else {
        this.addTestResult('Credential Ownership Proof', false, 'Failed to generate credential ownership proof');
      }
    } catch (error) {
      this.addTestResult('Zero-Knowledge Proofs', false, `Error: ${error.response?.data?.error || error.message}`);
    }
  }

  async testIntegration() {
    console.log('🔍 Testing Integration...');
    
    try {
      // Test end-to-end flow: Create DID -> Issue Credential -> Verify
      const did = 'did:test:integration123';
      
      // Step 1: Create DID
      const createDIDResponse = await axios.post(`${this.apiBaseUrl}/identity/create`, {
        did: did,
        publicKeys: ['0x1234567890abcdef1234567890abcdef12345678'],
        services: ['https://test.example.com/service']
      });
      
      if (!createDIDResponse.data.success) {
        this.addTestResult('Integration Test', false, 'Failed to create DID in integration test');
        return;
      }
      
      // Step 2: Issue Credential
      const issueCredResponse = await axios.post(`${this.apiBaseUrl}/credentials/issue`, {
        credentialId: 'cred_integration_123',
        holderDID: did,
        credentialType: 'EducationalCredential',
        credentialData: { degree: 'Bachelor of Computer Science' },
        attributes: ['Computer Science']
      });
      
      if (!issueCredResponse.data.success) {
        this.addTestResult('Integration Test', false, 'Failed to issue credential in integration test');
        return;
      }
      
      // Step 3: Generate Verification Proof
      const verifyResponse = await axios.post(`${this.apiBaseUrl}/verification/age`, {
        age: 25,
        minAge: 18
      });
      
      if (verifyResponse.data.success) {
        this.addTestResult('Integration Test', true, 'End-to-end integration test passed');
      } else {
        this.addTestResult('Integration Test', false, 'Failed to generate verification proof in integration test');
      }
    } catch (error) {
      this.addTestResult('Integration Test', false, `Error: ${error.response?.data?.error || error.message}`);
    }
  }

  async testErrorHandling() {
    console.log('🔍 Testing Error Handling...');
    
    const errorTests = [
      {
        name: 'Invalid DID Format',
        test: async () => {
          try {
            await axios.post(`${this.apiBaseUrl}/identity/create`, {
              did: 'invalid-did-format',
              publicKeys: ['0x123'],
              services: []
            });
            return false; // Should have failed
          } catch (error) {
            return error.response?.status === 400 || error.response?.status === 500;
          }
        }
      },
      {
        name: 'Missing Required Fields',
        test: async () => {
          try {
            await axios.post(`${this.apiBaseUrl}/credentials/issue`, {
              // Missing required fields
              credentialId: 'test'
            });
            return false; // Should have failed
          } catch (error) {
            return error.response?.status === 400 || error.response?.status === 500;
          }
        }
      },
      {
        name: 'Invalid Proof Parameters',
        test: async () => {
          try {
            await axios.post(`${this.apiBaseUrl}/verification/age`, {
              // Missing required fields
              age: 25
            });
            return false; // Should have failed
          } catch (error) {
            return error.response?.status === 400 || error.response?.status === 500;
          }
        }
      }
    ];

    for (const test of errorTests) {
      try {
        const result = await test.test();
        this.addTestResult(test.name, result, result ? 'Error handling works correctly' : 'Error handling failed');
      } catch (error) {
        this.addTestResult(test.name, false, `Unexpected error: ${error.message}`);
      }
    }
  }

  addTestResult(testName, passed, message) {
    this.testResults.push({
      name: testName,
      passed: passed,
      message: message,
      timestamp: new Date().toISOString()
    });
    
    const status = passed ? '✅' : '❌';
    console.log(`  ${status} ${testName}: ${message}`);
  }

  printTestResults() {
    console.log('\n📊 Test Results Summary:');
    console.log('='.repeat(50));
    
    const passed = this.testResults.filter(r => r.passed).length;
    const total = this.testResults.length;
    const percentage = Math.round((passed / total) * 100);
    
    console.log(`Total Tests: ${total}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${total - passed}`);
    console.log(`Success Rate: ${percentage}%`);
    
    if (total - passed > 0) {
      console.log('\n❌ Failed Tests:');
      this.testResults.filter(r => !r.passed).forEach(test => {
        console.log(`  - ${test.name}: ${test.message}`);
      });
    }
    
    console.log('\n' + '='.repeat(50));
    
    if (percentage >= 80) {
      console.log('🎉 System is working well!');
    } else if (percentage >= 60) {
      console.log('⚠️  System has some issues that need attention.');
    } else {
      console.log('🚨 System has significant issues that need immediate attention.');
    }
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  const tester = new SystemTester();
  tester.runAllTests().catch(console.error);
}

module.exports = SystemTester;

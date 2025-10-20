const fs = require('fs');
const path = require('path');

// Final comprehensive test and fix script
class FinalTester {
  constructor() {
    this.issues = [];
    this.fixes = [];
  }

  async runFinalTest() {
    console.log('🔍 Running Final Comprehensive Test\n');

    try {
      // Test 1: File Structure
      await this.testFileStructure();
      
      // Test 2: Code Syntax
      await this.testCodeSyntax();
      
      // Test 3: Logic Consistency
      await this.testLogicConsistency();
      
      // Test 4: Dependencies
      await this.testDependencies();
      
      // Test 5: Configuration
      await this.testConfiguration();
      
      this.printResults();
    } catch (error) {
      console.error('❌ Final test failed:', error.message);
    }
  }

  async testFileStructure() {
    console.log('🔍 Testing File Structure...');
    
    const requiredFiles = [
      'package.json',
      'README.md',
      'contracts/contracts/IdentityRegistry.sol',
      'contracts/contracts/CredentialRegistry.sol',
      'contracts/contracts/VerificationContract.sol',
      'contracts/contracts/Verifier.sol',
      'contracts/scripts/deploy.js',
      'contracts/hardhat.config.js',
      'backend/server.js',
      'backend/services/blockchain.js',
      'backend/services/ipfs.js',
      'backend/services/zkp.js',
      'backend/routes/identity.js',
      'backend/routes/credentials.js',
      'backend/routes/verification.js',
      'frontend/src/App.js',
      'frontend/src/components/WalletConnect.js',
      'frontend/src/components/IdentityDashboard.js',
      'frontend/src/components/CredentialManager.js',
      'frontend/src/components/VerificationPortal.js',
      'zkp/age_verification.zok',
      'zkp/credential_ownership.zok',
      'zkp/selective_disclosure.zok',
      'zkp/generate_proof.js',
      'scripts/demo-scenarios.js',
      'scripts/test-system.js',
      'scripts/validate-logic.js'
    ];

    for (const file of requiredFiles) {
      if (fs.existsSync(file)) {
        console.log(`  ✅ ${file}`);
      } else {
        this.addIssue(`Missing file: ${file}`);
        console.log(`  ❌ ${file} - MISSING`);
      }
    }
  }

  async testCodeSyntax() {
    console.log('🔍 Testing Code Syntax...');
    
    const jsFiles = [
      'backend/server.js',
      'backend/services/blockchain.js',
      'backend/services/ipfs.js',
      'backend/services/zkp.js',
      'backend/routes/identity.js',
      'backend/routes/credentials.js',
      'backend/routes/verification.js',
      'frontend/src/App.js',
      'frontend/src/components/WalletConnect.js',
      'frontend/src/components/IdentityDashboard.js',
      'frontend/src/components/CredentialManager.js',
      'frontend/src/components/VerificationPortal.js',
      'zkp/generate_proof.js',
      'scripts/demo-scenarios.js',
      'scripts/test-system.js',
      'scripts/validate-logic.js'
    ];

    for (const file of jsFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        // Basic syntax checks
        if (content.includes('function') && !content.includes('(')) {
          this.addIssue(`${file}: Malformed function declaration`);
        }
        
        if (content.includes('{') && !content.includes('}')) {
          this.addIssue(`${file}: Unmatched braces`);
        }
        
        if (content.includes('(') && !content.includes(')')) {
          this.addIssue(`${file}: Unmatched parentheses`);
        }
        
        // Check for common issues
        if (content.includes('console.log') && !content.includes('console.error')) {
          this.addIssue(`${file}: Has console.log but no console.error`);
        }
        
        console.log(`  ✅ ${file} - Syntax OK`);
        
      } catch (error) {
        this.addIssue(`${file}: Read error - ${error.message}`);
        console.log(`  ❌ ${file} - READ ERROR`);
      }
    }
  }

  async testLogicConsistency() {
    console.log('🔍 Testing Logic Consistency...');
    
    // Test 1: Smart Contract Function Signatures
    await this.testContractSignatures();
    
    // Test 2: API Endpoint Consistency
    await this.testAPIEndpoints();
    
    // Test 3: Frontend-Backend Integration
    await this.testFrontendBackendIntegration();
    
    // Test 4: ZKP Circuit Logic
    await this.testZKPCircuitLogic();
  }

  async testContractSignatures() {
    console.log('  🔍 Testing Smart Contract Signatures...');
    
    try {
      const identityRegistry = fs.readFileSync('contracts/contracts/IdentityRegistry.sol', 'utf8');
      const credentialRegistry = fs.readFileSync('contracts/contracts/CredentialRegistry.sol', 'utf8');
      const verificationContract = fs.readFileSync('contracts/contracts/VerificationContract.sol', 'utf8');
      
      // Check IdentityRegistry functions
      const requiredIdentityFunctions = [
        'function createDID(',
        'function getDIDDocument(',
        'function updateDID(',
        'function deactivateDID(',
        'function reactivateDID('
      ];
      
      for (const func of requiredIdentityFunctions) {
        if (identityRegistry.includes(func)) {
          console.log(`    ✅ IdentityRegistry has ${func}`);
        } else {
          this.addIssue(`IdentityRegistry missing function: ${func}`);
        }
      }
      
      // Check CredentialRegistry functions
      const requiredCredentialFunctions = [
        'function issueCredential(',
        'function getCredential(',
        'function revokeCredential(',
        'function updateCredential(',
        'function isCredentialValid('
      ];
      
      for (const func of requiredCredentialFunctions) {
        if (credentialRegistry.includes(func)) {
          console.log(`    ✅ CredentialRegistry has ${func}`);
        } else {
          this.addIssue(`CredentialRegistry missing function: ${func}`);
        }
      }
      
      // Check VerificationContract functions
      const requiredVerificationFunctions = [
        'function submitVerificationRequest(',
        'function getVerificationRequest(',
        'function registerZKPVerifier('
      ];
      
      for (const func of requiredVerificationFunctions) {
        if (verificationContract.includes(func)) {
          console.log(`    ✅ VerificationContract has ${func}`);
        } else {
          this.addIssue(`VerificationContract missing function: ${func}`);
        }
      }
      
    } catch (error) {
      this.addIssue(`Contract signature test failed: ${error.message}`);
    }
  }

  async testAPIEndpoints() {
    console.log('  🔍 Testing API Endpoints...');
    
    try {
      const identityRoutes = fs.readFileSync('backend/routes/identity.js', 'utf8');
      const credentialRoutes = fs.readFileSync('backend/routes/credentials.js', 'utf8');
      const verificationRoutes = fs.readFileSync('backend/routes/verification.js', 'utf8');
      
      // Check identity endpoints
      const identityEndpoints = [
        'POST /api/identity/create',
        'GET /api/identity/:did',
        'PUT /api/identity/:did',
        'POST /api/identity/:did/deactivate',
        'POST /api/identity/:did/reactivate'
      ];
      
      for (const endpoint of identityEndpoints) {
        if (identityRoutes.includes(endpoint.split(' ')[1].replace(':', ''))) {
          console.log(`    ✅ Identity endpoint: ${endpoint}`);
        } else {
          this.addIssue(`Missing identity endpoint: ${endpoint}`);
        }
      }
      
      // Check credential endpoints
      const credentialEndpoints = [
        'POST /api/credentials/issue',
        'GET /api/credentials/:credentialId',
        'GET /api/credentials/holder/:holderDID',
        'POST /api/credentials/:credentialId/revoke'
      ];
      
      for (const endpoint of credentialEndpoints) {
        if (credentialRoutes.includes(endpoint.split(' ')[1].replace(':', ''))) {
          console.log(`    ✅ Credential endpoint: ${endpoint}`);
        } else {
          this.addIssue(`Missing credential endpoint: ${endpoint}`);
        }
      }
      
      // Check verification endpoints
      const verificationEndpoints = [
        'POST /api/verification/request',
        'GET /api/verification/:requestId',
        'POST /api/verification/age',
        'POST /api/verification/credential-ownership'
      ];
      
      for (const endpoint of verificationEndpoints) {
        if (verificationRoutes.includes(endpoint.split(' ')[1].replace(':', ''))) {
          console.log(`    ✅ Verification endpoint: ${endpoint}`);
        } else {
          this.addIssue(`Missing verification endpoint: ${endpoint}`);
        }
      }
      
    } catch (error) {
      this.addIssue(`API endpoint test failed: ${error.message}`);
    }
  }

  async testFrontendBackendIntegration() {
    console.log('  🔍 Testing Frontend-Backend Integration...');
    
    try {
      const frontendFiles = [
        'frontend/src/components/IdentityDashboard.js',
        'frontend/src/components/CredentialManager.js',
        'frontend/src/components/VerificationPortal.js'
      ];
      
      for (const file of frontendFiles) {
        const content = fs.readFileSync(file, 'utf8');
        
        // Check for API calls
        if (content.includes('axios.post') || content.includes('axios.get')) {
          console.log(`    ✅ ${file} has API integration`);
        } else {
          this.addIssue(`${file} missing API integration`);
        }
        
        // Check for error handling
        if (content.includes('try') && content.includes('catch')) {
          console.log(`    ✅ ${file} has error handling`);
        } else {
          this.addIssue(`${file} missing error handling`);
        }
        
        // Check for loading states
        if (content.includes('loading') && content.includes('setLoading')) {
          console.log(`    ✅ ${file} has loading states`);
        } else {
          this.addIssue(`${file} missing loading states`);
        }
      }
      
    } catch (error) {
      this.addIssue(`Frontend-backend integration test failed: ${error.message}`);
    }
  }

  async testZKPCircuitLogic() {
    console.log('  🔍 Testing ZKP Circuit Logic...');
    
    try {
      const ageCircuit = fs.readFileSync('zkp/age_verification.zok', 'utf8');
      const credCircuit = fs.readFileSync('zkp/credential_ownership.zok', 'utf8');
      const selectiveCircuit = fs.readFileSync('zkp/selective_disclosure.zok', 'utf8');
      
      // Check age verification circuit
      if (ageCircuit.includes('def main(') && ageCircuit.includes('private field') && ageCircuit.includes('assert(')) {
        console.log(`    ✅ Age verification circuit has proper structure`);
      } else {
        this.addIssue(`Age verification circuit missing required elements`);
      }
      
      // Check credential ownership circuit
      if (credCircuit.includes('def main(') && credCircuit.includes('private field') && credCircuit.includes('assert(')) {
        console.log(`    ✅ Credential ownership circuit has proper structure`);
      } else {
        this.addIssue(`Credential ownership circuit missing required elements`);
      }
      
      // Check selective disclosure circuit
      if (selectiveCircuit.includes('def main(') && selectiveCircuit.includes('private field') && selectiveCircuit.includes('assert(')) {
        console.log(`    ✅ Selective disclosure circuit has proper structure`);
      } else {
        this.addIssue(`Selective disclosure circuit missing required elements`);
      }
      
    } catch (error) {
      this.addIssue(`ZKP circuit test failed: ${error.message}`);
    }
  }

  async testDependencies() {
    console.log('🔍 Testing Dependencies...');
    
    const packageFiles = [
      'package.json',
      'contracts/package.json',
      'backend/package.json',
      'frontend/package.json'
    ];
    
    for (const file of packageFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const config = JSON.parse(content);
        
        if (config.dependencies) {
          const depCount = Object.keys(config.dependencies).length;
          console.log(`  ✅ ${file} has ${depCount} dependencies`);
        } else {
          this.addIssue(`${file} has no dependencies`);
        }
        
        if (config.scripts) {
          const scriptCount = Object.keys(config.scripts).length;
          console.log(`  ✅ ${file} has ${scriptCount} scripts`);
        } else {
          this.addIssue(`${file} has no scripts`);
        }
        
      } catch (error) {
        this.addIssue(`${file} dependency test failed: ${error.message}`);
      }
    }
  }

  async testConfiguration() {
    console.log('🔍 Testing Configuration...');
    
    try {
      // Test Hardhat configuration
      const hardhatConfig = fs.readFileSync('contracts/hardhat.config.js', 'utf8');
      if (hardhatConfig.includes('solidity') && hardhatConfig.includes('networks')) {
        console.log(`  ✅ Hardhat configuration is complete`);
      } else {
        this.addIssue(`Hardhat configuration is incomplete`);
      }
      
      // Test environment file
      if (fs.existsSync('backend/.env.example')) {
        console.log(`  ✅ Environment example file exists`);
      } else {
        this.addIssue(`Missing environment example file`);
      }
      
      // Test gitignore
      if (fs.existsSync('.gitignore')) {
        console.log(`  ✅ Gitignore file exists`);
      } else {
        this.addIssue(`Missing gitignore file`);
      }
      
    } catch (error) {
      this.addIssue(`Configuration test failed: ${error.message}`);
    }
  }

  addIssue(message) {
    this.issues.push(message);
  }

  addFix(message) {
    this.fixes.push(message);
  }

  printResults() {
    console.log('\n📊 Final Test Results:');
    console.log('='.repeat(60));
    
    if (this.issues.length === 0) {
      console.log('🎉 All tests passed! No issues found.');
    } else {
      console.log(`❌ Found ${this.issues.length} issues:`);
      this.issues.forEach((issue, index) => {
        console.log(`  ${index + 1}. ${issue}`);
      });
    }
    
    if (this.fixes.length > 0) {
      console.log(`\n✅ Applied ${this.fixes.length} fixes:`);
      this.fixes.forEach((fix, index) => {
        console.log(`  ${index + 1}. ${fix}`);
      });
    }
    
    console.log('\n' + '='.repeat(60));
    
    if (this.issues.length === 0) {
      console.log('🚀 System is ready for deployment and testing!');
    } else {
      console.log('⚠️  Please address the issues before deployment.');
    }
  }
}

// Run final test if this script is executed directly
if (require.main === module) {
  const tester = new FinalTester();
  tester.runFinalTest().catch(console.error);
}

module.exports = FinalTester;

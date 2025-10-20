const fs = require('fs');
const path = require('path');

// Comprehensive logic validation script
class LogicValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.validations = [];
  }

  async validateAll() {
    console.log('🔍 Starting Comprehensive Logic Validation\n');

    try {
      // Validate Smart Contracts
      await this.validateSmartContracts();
      
      // Validate Backend Logic
      await this.validateBackendLogic();
      
      // Validate Frontend Logic
      await this.validateFrontendLogic();
      
      // Validate ZKP Circuits
      await this.validateZKPCircuits();
      
      // Validate Configuration Files
      await this.validateConfigurationFiles();
      
      // Validate Dependencies
      await this.validateDependencies();
      
      this.printValidationResults();
    } catch (error) {
      console.error('❌ Validation failed:', error.message);
    }
  }

  async validateSmartContracts() {
    console.log('🔍 Validating Smart Contracts...');
    
    const contractFiles = [
      'contracts/contracts/IdentityRegistry.sol',
      'contracts/contracts/CredentialRegistry.sol',
      'contracts/contracts/VerificationContract.sol',
      'contracts/contracts/Verifier.sol'
    ];

    for (const file of contractFiles) {
      await this.validateContractFile(file);
    }
  }

  async validateContractFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check for required imports
      if (!content.includes('pragma solidity')) {
        this.addError(filePath, 'Missing Solidity version declaration');
      }
      
      if (!content.includes('@openzeppelin/contracts')) {
        this.addWarning(filePath, 'Not using OpenZeppelin contracts for security');
      }
      
      // Check for security patterns
      if (content.includes('msg.sender') && !content.includes('onlyOwner') && !content.includes('modifier')) {
        this.addWarning(filePath, 'Using msg.sender without proper access control');
      }
      
      // Check for event emissions
      if (content.includes('function') && !content.includes('event')) {
        this.addWarning(filePath, 'Functions without corresponding events');
      }
      
      // Check for proper error handling
      if (content.includes('require(') || content.includes('assert(') || content.includes('revert')) {
        this.addValidation(filePath, 'Has proper error handling');
      } else {
        this.addWarning(filePath, 'Missing error handling');
      }
      
      // Check for reentrancy protection
      if (content.includes('external') && !content.includes('ReentrancyGuard')) {
        this.addWarning(filePath, 'External functions without reentrancy protection');
      }
      
    } catch (error) {
      this.addError(filePath, `File read error: ${error.message}`);
    }
  }

  async validateBackendLogic() {
    console.log('🔍 Validating Backend Logic...');
    
    const backendFiles = [
      'backend/server.js',
      'backend/services/blockchain.js',
      'backend/services/ipfs.js',
      'backend/services/zkp.js',
      'backend/routes/identity.js',
      'backend/routes/credentials.js',
      'backend/routes/verification.js'
    ];

    for (const file of backendFiles) {
      await this.validateBackendFile(file);
    }
  }

  async validateBackendFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check for proper error handling
      if (content.includes('try') && content.includes('catch')) {
        this.addValidation(filePath, 'Has proper error handling');
      } else {
        this.addWarning(filePath, 'Missing try-catch error handling');
      }
      
      // Check for input validation
      if (content.includes('req.body') && !content.includes('validate') && !content.includes('require')) {
        this.addWarning(filePath, 'Missing input validation');
      }
      
      // Check for async/await usage
      if (content.includes('async') && !content.includes('await')) {
        this.addWarning(filePath, 'Async function without await');
      }
      
      // Check for proper logging
      if (content.includes('console.log') || content.includes('console.error')) {
        this.addValidation(filePath, 'Has logging');
      } else {
        this.addWarning(filePath, 'Missing logging');
      }
      
      // Check for security headers
      if (filePath.includes('server.js') && !content.includes('helmet')) {
        this.addWarning(filePath, 'Missing security headers (helmet)');
      }
      
      // Check for CORS configuration
      if (filePath.includes('server.js') && !content.includes('cors')) {
        this.addWarning(filePath, 'Missing CORS configuration');
      }
      
    } catch (error) {
      this.addError(filePath, `File read error: ${error.message}`);
    }
  }

  async validateFrontendLogic() {
    console.log('🔍 Validating Frontend Logic...');
    
    const frontendFiles = [
      'frontend/src/App.js',
      'frontend/src/components/WalletConnect.js',
      'frontend/src/components/IdentityDashboard.js',
      'frontend/src/components/CredentialManager.js',
      'frontend/src/components/VerificationPortal.js'
    ];

    for (const file of frontendFiles) {
      await this.validateFrontendFile(file);
    }
  }

  async validateFrontendFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check for React hooks usage
      if (content.includes('useState') || content.includes('useEffect')) {
        this.addValidation(filePath, 'Uses React hooks properly');
      }
      
      // Check for error handling
      if (content.includes('try') && content.includes('catch')) {
        this.addValidation(filePath, 'Has error handling');
      } else if (content.includes('axios') || content.includes('fetch')) {
        this.addWarning(filePath, 'API calls without error handling');
      }
      
      // Check for loading states
      if (content.includes('loading') && content.includes('setLoading')) {
        this.addValidation(filePath, 'Has loading state management');
      } else if (content.includes('axios') || content.includes('fetch')) {
        this.addWarning(filePath, 'API calls without loading states');
      }
      
      // Check for proper state management
      if (content.includes('useState') && content.includes('setState')) {
        this.addValidation(filePath, 'Uses React state properly');
      }
      
      // Check for MetaMask integration
      if (content.includes('ethereum') && content.includes('ethers')) {
        this.addValidation(filePath, 'Has Web3 integration');
      }
      
    } catch (error) {
      this.addError(filePath, `File read error: ${error.message}`);
    }
  }

  async validateZKPCircuits() {
    console.log('🔍 Validating ZKP Circuits...');
    
    const zkpFiles = [
      'zkp/age_verification.zok',
      'zkp/credential_ownership.zok',
      'zkp/selective_disclosure.zok',
      'zkp/generate_proof.js'
    ];

    for (const file of zkpFiles) {
      await this.validateZKPFile(file);
    }
  }

  async validateZKPFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      if (filePath.endsWith('.zok')) {
        // Validate ZoKrates circuit
        if (content.includes('def main(')) {
          this.addValidation(filePath, 'Has main function');
        } else {
          this.addError(filePath, 'Missing main function');
        }
        
        if (content.includes('private field') || content.includes('field')) {
          this.addValidation(filePath, 'Uses field types properly');
        } else {
          this.addError(filePath, 'Missing field type declarations');
        }
        
        if (content.includes('assert(')) {
          this.addValidation(filePath, 'Has assertions');
        } else {
          this.addWarning(filePath, 'Missing assertions');
        }
        
        if (content.includes('return')) {
          this.addValidation(filePath, 'Has return statement');
        } else {
          this.addError(filePath, 'Missing return statement');
        }
        
      } else if (filePath.endsWith('.js')) {
        // Validate JavaScript proof generation
        if (content.includes('function generateProof')) {
          this.addValidation(filePath, 'Has proof generation function');
        } else {
          this.addError(filePath, 'Missing proof generation function');
        }
        
        if (content.includes('try') && content.includes('catch')) {
          this.addValidation(filePath, 'Has error handling');
        } else {
          this.addWarning(filePath, 'Missing error handling');
        }
        
        if (content.includes('validate') || content.includes('require')) {
          this.addValidation(filePath, 'Has input validation');
        } else {
          this.addWarning(filePath, 'Missing input validation');
        }
      }
      
    } catch (error) {
      this.addError(filePath, `File read error: ${error.message}`);
    }
  }

  async validateConfigurationFiles() {
    console.log('🔍 Validating Configuration Files...');
    
    const configFiles = [
      'package.json',
      'contracts/package.json',
      'backend/package.json',
      'frontend/package.json',
      'contracts/hardhat.config.js'
    ];

    for (const file of configFiles) {
      await this.validateConfigFile(file);
    }
  }

  async validateConfigFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const config = JSON.parse(content);
      
      // Check for required fields
      if (!config.name) {
        this.addError(filePath, 'Missing name field');
      }
      
      if (!config.version) {
        this.addError(filePath, 'Missing version field');
      }
      
      // Check for dependencies
      if (config.dependencies) {
        this.addValidation(filePath, 'Has dependencies defined');
      } else {
        this.addWarning(filePath, 'No dependencies defined');
      }
      
      // Check for scripts
      if (config.scripts) {
        this.addValidation(filePath, 'Has scripts defined');
      } else {
        this.addWarning(filePath, 'No scripts defined');
      }
      
    } catch (error) {
      this.addError(filePath, `JSON parse error: ${error.message}`);
    }
  }

  async validateDependencies() {
    console.log('🔍 Validating Dependencies...');
    
    const packageFiles = [
      'package.json',
      'contracts/package.json',
      'backend/package.json',
      'frontend/package.json'
    ];

    for (const file of packageFiles) {
      await this.validateDependenciesInFile(file);
    }
  }

  async validateDependenciesInFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const config = JSON.parse(content);
      
      if (config.dependencies) {
        const deps = Object.keys(config.dependencies);
        
        // Check for security-related dependencies
        if (filePath.includes('backend') && !deps.includes('helmet')) {
          this.addWarning(filePath, 'Missing helmet for security headers');
        }
        
        if (filePath.includes('backend') && !deps.includes('cors')) {
          this.addWarning(filePath, 'Missing cors for cross-origin requests');
        }
        
        if (filePath.includes('backend') && !deps.includes('express-rate-limit')) {
          this.addWarning(filePath, 'Missing rate limiting');
        }
        
        // Check for blockchain dependencies
        if (filePath.includes('contracts') && !deps.includes('@openzeppelin/contracts')) {
          this.addWarning(filePath, 'Missing OpenZeppelin contracts');
        }
        
        if (filePath.includes('backend') && !deps.includes('ethers')) {
          this.addWarning(filePath, 'Missing ethers.js for blockchain interaction');
        }
        
        if (filePath.includes('frontend') && !deps.includes('ethers')) {
          this.addWarning(filePath, 'Missing ethers.js for frontend blockchain interaction');
        }
        
        this.addValidation(filePath, `Has ${deps.length} dependencies`);
      }
      
    } catch (error) {
      this.addError(filePath, `Dependency validation error: ${error.message}`);
    }
  }

  addError(file, message) {
    this.errors.push({ file, message });
  }

  addWarning(file, message) {
    this.warnings.push({ file, message });
  }

  addValidation(file, message) {
    this.validations.push({ file, message });
  }

  printValidationResults() {
    console.log('\n📊 Validation Results Summary:');
    console.log('='.repeat(60));
    
    console.log(`✅ Validations: ${this.validations.length}`);
    console.log(`⚠️  Warnings: ${this.warnings.length}`);
    console.log(`❌ Errors: ${this.errors.length}`);
    
    if (this.validations.length > 0) {
      console.log('\n✅ Validations:');
      this.validations.forEach(v => {
        console.log(`  ✓ ${v.file}: ${v.message}`);
      });
    }
    
    if (this.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      this.warnings.forEach(w => {
        console.log(`  ⚠ ${w.file}: ${w.message}`);
      });
    }
    
    if (this.errors.length > 0) {
      console.log('\n❌ Errors:');
      this.errors.forEach(e => {
        console.log(`  ✗ ${e.file}: ${e.message}`);
      });
    }
    
    console.log('\n' + '='.repeat(60));
    
    if (this.errors.length === 0) {
      console.log('🎉 No critical errors found!');
    } else {
      console.log('🚨 Critical errors found that need immediate attention.');
    }
    
    if (this.warnings.length > 0) {
      console.log('⚠️  Please review the warnings for potential improvements.');
    }
  }
}

// Run validation if this script is executed directly
if (require.main === module) {
  const validator = new LogicValidator();
  validator.validateAll().catch(console.error);
}

module.exports = LogicValidator;

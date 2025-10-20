const { generateAgeVerificationProof, generateCredentialOwnershipProof, generateSelectiveDisclosureProof } = require('../../zkp/generate_proof');
const crypto = require('crypto');

class ZKPService {
  constructor() {
    this.proofCache = new Map();
  }

  /**
   * Generate age verification proof
   * @param {number} age - Person's age
   * @param {number} minAge - Minimum required age
   * @returns {Object} Proof data
   */
  async generateAgeVerificationProof(age, minAge) {
    try {
      const cacheKey = `age_${age}_${minAge}`;
      
      if (this.proofCache.has(cacheKey)) {
        return this.proofCache.get(cacheKey);
      }

      const proof = generateAgeVerificationProof(age, minAge);
      this.proofCache.set(cacheKey, proof);
      
      return proof;
    } catch (error) {
      console.error('Error generating age verification proof:', error);
      throw error;
    }
  }

  /**
   * Generate credential ownership proof
   * @param {string} credentialHash - Hash of the credential
   * @param {string} holderPublicKey - Holder's public key
   * @param {string} expectedHash - Expected credential hash
   * @returns {Object} Proof data
   */
  async generateCredentialOwnershipProof(credentialHash, holderPublicKey, expectedHash) {
    try {
      const cacheKey = `cred_${credentialHash}_${holderPublicKey}_${expectedHash}`;
      
      if (this.proofCache.has(cacheKey)) {
        return this.proofCache.get(cacheKey);
      }

      const proof = generateCredentialOwnershipProof(credentialHash, holderPublicKey, expectedHash);
      this.proofCache.set(cacheKey, proof);
      
      return proof;
    } catch (error) {
      console.error('Error generating credential ownership proof:', error);
      throw error;
    }
  }

  /**
   * Generate selective disclosure proof
   * @param {Array} credentialAttributes - Array of credential attributes
   * @param {number} attributeIndex - Index of attribute to disclose
   * @param {number} expectedValue - Expected value of the attribute
   * @param {number} threshold - Minimum threshold value
   * @returns {Object} Proof data
   */
  async generateSelectiveDisclosureProof(credentialAttributes, attributeIndex, expectedValue, threshold) {
    try {
      const cacheKey = `selective_${JSON.stringify(credentialAttributes)}_${attributeIndex}_${expectedValue}_${threshold}`;
      
      if (this.proofCache.has(cacheKey)) {
        return this.proofCache.get(cacheKey);
      }

      const proof = generateSelectiveDisclosureProof(credentialAttributes, attributeIndex, expectedValue, threshold);
      this.proofCache.set(cacheKey, proof);
      
      return proof;
    } catch (error) {
      console.error('Error generating selective disclosure proof:', error);
      throw error;
    }
  }

  /**
   * Verify proof locally (for testing purposes)
   * @param {Object} proof - Proof data
   * @param {Array} publicInputs - Public inputs
   * @returns {boolean} True if proof is valid
   */
  async verifyProof(proof, publicInputs) {
    try {
      // This is a simplified verification for demo purposes
      // In a real implementation, you would use the actual ZKP verification logic
      
      if (!proof || !proof.proof) {
        return false;
      }

      // Check if proof has required structure
      const requiredFields = ['a', 'b', 'c'];
      for (const field of requiredFields) {
        if (!proof.proof[field]) {
          return false;
        }
      }

      // Check if public inputs are valid
      if (!publicInputs || publicInputs.length === 0) {
        return false;
      }

      // For demo purposes, accept all proofs that pass basic structure checks
      return true;
    } catch (error) {
      console.error('Error verifying proof:', error);
      return false;
    }
  }

  /**
   * Generate proof for credential verification
   * @param {string} credentialType - Type of credential
   * @param {Object} credentialData - Credential data
   * @param {Object} verificationParams - Verification parameters
   * @returns {Object} Proof data
   */
  async generateCredentialProof(credentialType, credentialData, verificationParams) {
    try {
      switch (credentialType) {
        case 'age_verification':
          return await this.generateAgeVerificationProof(
            credentialData.age,
            verificationParams.minAge
          );
        
        case 'credential_ownership':
          return await this.generateCredentialOwnershipProof(
            credentialData.credentialHash,
            credentialData.holderPublicKey,
            verificationParams.expectedHash
          );
        
        case 'selective_disclosure':
          return await this.generateSelectiveDisclosureProof(
            credentialData.attributes,
            verificationParams.attributeIndex,
            verificationParams.expectedValue,
            verificationParams.threshold
          );
        
        default:
          throw new Error(`Unsupported credential type: ${credentialType}`);
      }
    } catch (error) {
      console.error('Error generating credential proof:', error);
      throw error;
    }
  }

  /**
   * Create a verification request
   * @param {string} credentialId - Credential ID
   * @param {string} circuitType - Type of ZKP circuit
   * @param {Object} proofData - Proof data
   * @param {Array} publicInputs - Public inputs
   * @returns {Object} Verification request data
   */
  async createVerificationRequest(credentialId, circuitType, proofData, publicInputs) {
    try {
      const requestId = crypto.randomUUID();
      
      const verificationRequest = {
        requestId,
        credentialId,
        circuitType,
        proofData,
        publicInputs,
        createdAt: new Date().toISOString(),
        status: 'pending'
      };

      return verificationRequest;
    } catch (error) {
      console.error('Error creating verification request:', error);
      throw error;
    }
  }

  /**
   * Clear proof cache
   */
  clearCache() {
    this.proofCache.clear();
    console.log('ZKP proof cache cleared');
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getCacheStats() {
    return {
      size: this.proofCache.size,
      keys: Array.from(this.proofCache.keys())
    };
  }
}

module.exports = new ZKPService();

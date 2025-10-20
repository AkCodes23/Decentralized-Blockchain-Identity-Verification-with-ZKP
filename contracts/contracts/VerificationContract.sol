// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title VerificationContract
 * @dev Handles zero-knowledge proof verification for credentials
 */
contract VerificationContract is Ownable, ReentrancyGuard {
    
    constructor() Ownable(msg.sender) {}
    
    struct VerificationRequest {
        string requestId;              // Unique verification request ID
        string credentialId;           // ID of the credential being verified
        string verifierDID;            // DID of the entity requesting verification
        bytes32 proofHash;             // Hash of the zero-knowledge proof
        uint256 requestedAt;           // Timestamp of verification request
        bool isVerified;               // Whether the verification was successful
        string verificationResult;     // Result of the verification
        uint256 verifiedAt;            // Timestamp of verification completion
    }
    
    struct ZKPVerifier {
        string circuitType;            // Type of ZKP circuit (age, credential, etc.)
        address verifierContract;      // Address of the verifier contract
        bool isActive;                 // Whether the verifier is active
    }
    
    // Mapping from request ID to VerificationRequest
    mapping(string => VerificationRequest) public verificationRequests;
    
    // Mapping from circuit type to ZKPVerifier
    mapping(string => ZKPVerifier) public zkpVerifiers;
    
    // Array of all verification request IDs
    string[] public allVerificationRequests;
    
    // Events
    event VerificationRequested(string indexed requestId, string indexed credentialId, string indexed verifierDID);
    event VerificationCompleted(string indexed requestId, bool isVerified, string result);
    event ZKPVerifierRegistered(string indexed circuitType, address verifierContract);
    event ZKPVerifierDeactivated(string indexed circuitType);
    
    // Modifiers
    modifier validVerificationRequest(string memory requestId) {
        require(bytes(verificationRequests[requestId].requestId).length > 0, "Verification request does not exist");
        _;
    }
    
    modifier onlyActiveVerifier(string memory circuitType) {
        require(zkpVerifiers[circuitType].isActive, "ZKP verifier not active");
        _;
    }
    
    /**
     * @dev Register a new ZKP verifier contract
     * @param circuitType Type of ZKP circuit
     * @param verifierContract Address of the verifier contract
     */
    function registerZKPVerifier(string memory circuitType, address verifierContract) external onlyOwner {
        require(bytes(circuitType).length > 0, "Circuit type cannot be empty");
        require(verifierContract != address(0), "Invalid verifier contract address");
        
        zkpVerifiers[circuitType] = ZKPVerifier({
            circuitType: circuitType,
            verifierContract: verifierContract,
            isActive: true
        });
        
        emit ZKPVerifierRegistered(circuitType, verifierContract);
    }
    
    /**
     * @dev Deactivate a ZKP verifier
     * @param circuitType Type of ZKP circuit
     */
    function deactivateZKPVerifier(string memory circuitType) external onlyOwner {
        require(zkpVerifiers[circuitType].isActive, "ZKP verifier not active");
        
        zkpVerifiers[circuitType].isActive = false;
        
        emit ZKPVerifierDeactivated(circuitType);
    }
    
    /**
     * @dev Submit a verification request
     * @param requestId Unique identifier for the verification request
     * @param credentialId ID of the credential being verified
     * @param circuitType Type of ZKP circuit to use
     * @param proofData Encoded proof data
     * @param publicInputs Public inputs for the proof
     * @param verifierDID DID of the verifier
     */
    function submitVerificationRequest(
        string memory requestId,
        string memory credentialId,
        string memory circuitType,
        bytes memory proofData,
        uint256[] memory publicInputs,
        string memory verifierDID
    ) external onlyActiveVerifier(circuitType) nonReentrant {
        require(bytes(requestId).length > 0, "Request ID cannot be empty");
        require(bytes(verificationRequests[requestId].requestId).length == 0, "Request ID already exists");
        require(bytes(credentialId).length > 0, "Credential ID cannot be empty");
        require(bytes(verifierDID).length > 0, "Verifier DID cannot be empty");
        
        verificationRequests[requestId] = VerificationRequest({
            requestId: requestId,
            credentialId: credentialId,
            verifierDID: verifierDID,
            proofHash: keccak256(proofData),
            requestedAt: block.timestamp,
            isVerified: false,
            verificationResult: "",
            verifiedAt: 0
        });
        
        allVerificationRequests.push(requestId);
        
        emit VerificationRequested(requestId, credentialId, verifierDID);
        
        // Automatically verify the proof
        _verifyProof(requestId, circuitType, proofData, publicInputs);
    }
    
    /**
     * @dev Internal function to verify a zero-knowledge proof
     * @param requestId The verification request ID
     * @param circuitType Type of ZKP circuit
     * @param proofData Encoded proof data
     * @param publicInputs Public inputs for the proof
     */
    function _verifyProof(
        string memory requestId,
        string memory circuitType,
        bytes memory proofData,
        uint256[] memory publicInputs
    ) internal {
        ZKPVerifier memory verifier = zkpVerifiers[circuitType];
        
        // Call the verifier contract
        (bool success, bytes memory result) = verifier.verifierContract.call(
            abi.encodeWithSignature("verifyProof(bytes,uint256[])", proofData, publicInputs)
        );
        
        bool isVerified = false;
        string memory verificationResult = "Verification failed";
        
        if (success) {
            // Decode the result
            (bool proofValid, string memory resultMessage) = abi.decode(result, (bool, string));
            isVerified = proofValid;
            verificationResult = resultMessage;
        }
        
        // Update the verification request
        verificationRequests[requestId].isVerified = isVerified;
        verificationRequests[requestId].verificationResult = verificationResult;
        verificationRequests[requestId].verifiedAt = block.timestamp;
        
        emit VerificationCompleted(requestId, isVerified, verificationResult);
    }
    
    /**
     * @dev Get verification request by ID
     * @param requestId The verification request ID
     * @return The verification request data
     */
    function getVerificationRequest(string memory requestId) 
        external 
        view 
        validVerificationRequest(requestId) 
        returns (VerificationRequest memory) 
    {
        return verificationRequests[requestId];
    }
    
    /**
     * @dev Check if a verification request is verified
     * @param requestId The verification request ID
     * @return True if the verification was successful
     */
    function isVerificationVerified(string memory requestId) 
        external 
        view 
        validVerificationRequest(requestId) 
        returns (bool) 
    {
        return verificationRequests[requestId].isVerified;
    }
    
    /**
     * @dev Get verification result
     * @param requestId The verification request ID
     * @return The verification result message
     */
    function getVerificationResult(string memory requestId) 
        external 
        view 
        validVerificationRequest(requestId) 
        returns (string memory) 
    {
        return verificationRequests[requestId].verificationResult;
    }
    
    /**
     * @dev Get total number of verification requests
     * @return The total count of verification requests
     */
    function getTotalVerificationRequests() external view returns (uint256) {
        return allVerificationRequests.length;
    }
    
    /**
     * @dev Get verification request at index
     * @param index The index in the array
     * @return The verification request ID at the given index
     */
    function getVerificationRequestAtIndex(uint256 index) external view returns (string memory) {
        require(index < allVerificationRequests.length, "Index out of bounds");
        return allVerificationRequests[index];
    }
}

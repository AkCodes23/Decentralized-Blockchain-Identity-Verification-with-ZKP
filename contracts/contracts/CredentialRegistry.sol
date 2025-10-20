// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title CredentialRegistry
 * @dev Manages digital credentials issuance, storage, and revocation
 */
contract CredentialRegistry is Ownable, ReentrancyGuard {
    
    constructor() Ownable(msg.sender) {}
    
    struct Credential {
        string credentialId;           // Unique credential identifier
        string issuerDID;              // DID of the issuer
        string holderDID;              // DID of the credential holder
        string credentialType;         // Type of credential (degree, certificate, etc.)
        string credentialHash;         // IPFS hash of the credential data
        uint256 issuedAt;              // Timestamp of issuance
        uint256 expiresAt;             // Expiration timestamp (0 for no expiration)
        bool isRevoked;                // Whether the credential is revoked
        string[] attributes;           // Array of credential attributes
        string metadata;               // Additional metadata
    }
    
    struct Issuer {
        string did;                    // Issuer's DID
        string name;                   // Issuer's name
        string issuerType;             // Type of issuer (university, employer, etc.)
        bool isAuthorized;             // Whether the issuer is authorized
        uint256 registeredAt;          // Registration timestamp
    }
    
    // Mapping from credential ID to Credential
    mapping(string => Credential) public credentials;
    
    // Mapping from issuer DID to Issuer
    mapping(string => Issuer) public issuers;
    
    // Mapping from holder DID to array of credential IDs
    mapping(string => string[]) public holderCredentials;
    
    // Mapping from issuer DID to array of issued credential IDs
    mapping(string => string[]) public issuerCredentials;
    
    // Array of all credential IDs for enumeration
    string[] public allCredentials;
    
    // Array of all issuer DIDs
    string[] public allIssuers;
    
    // Events
    event IssuerRegistered(string indexed issuerDID, string name, string issuerType);
    event IssuerAuthorized(string indexed issuerDID, bool authorized);
    event CredentialIssued(string indexed credentialId, string indexed issuerDID, string indexed holderDID);
    event CredentialRevoked(string indexed credentialId, string indexed issuerDID);
    event CredentialUpdated(string indexed credentialId, string newCredentialHash);
    
    // Modifiers
    modifier onlyAuthorizedIssuer(string memory issuerDID) {
        require(bytes(issuers[issuerDID].did).length > 0, "Issuer does not exist");
        require(issuers[issuerDID].isAuthorized, "Issuer not authorized");
        _;
    }
    
    modifier onlyIssuerOwner(string memory issuerDID) {
        require(bytes(issuers[issuerDID].did).length > 0, "Issuer does not exist");
        _;
    }
    
    modifier validCredential(string memory credentialId) {
        require(bytes(credentials[credentialId].credentialId).length > 0, "Credential does not exist");
        _;
    }
    
    /**
     * @dev Register a new issuer
     * @param issuerDID The issuer's DID
     * @param name The issuer's name
     * @param issuerType The type of issuer
     */
    function registerIssuer(
        string memory issuerDID,
        string memory name,
        string memory issuerType
    ) external onlyOwner {
        require(bytes(issuerDID).length > 0, "Issuer DID cannot be empty");
        require(bytes(issuers[issuerDID].did).length == 0, "Issuer already registered");
        
        issuers[issuerDID] = Issuer({
            did: issuerDID,
            name: name,
            issuerType: issuerType,
            isAuthorized: false,
            registeredAt: block.timestamp
        });
        
        allIssuers.push(issuerDID);
        
        emit IssuerRegistered(issuerDID, name, issuerType);
    }
    
    /**
     * @dev Authorize or deauthorize an issuer
     * @param issuerDID The issuer's DID
     * @param authorized Whether to authorize the issuer
     */
    function setIssuerAuthorization(string memory issuerDID, bool authorized) 
        external 
        onlyOwner 
        onlyIssuerOwner(issuerDID) 
    {
        issuers[issuerDID].isAuthorized = authorized;
        
        emit IssuerAuthorized(issuerDID, authorized);
    }
    
    /**
     * @dev Issue a new credential
     * @param credentialId Unique identifier for the credential
     * @param holderDID DID of the credential holder
     * @param credentialType Type of credential
     * @param credentialHash IPFS hash of the credential data
     * @param expiresAt Expiration timestamp (0 for no expiration)
     * @param attributes Array of credential attributes
     * @param metadata Additional metadata
     * @param issuerDID DID of the issuer
     */
    function issueCredential(
        string memory credentialId,
        string memory holderDID,
        string memory credentialType,
        string memory credentialHash,
        uint256 expiresAt,
        string[] memory attributes,
        string memory metadata,
        string memory issuerDID
    ) external onlyAuthorizedIssuer(issuerDID) nonReentrant {
        require(bytes(credentialId).length > 0, "Credential ID cannot be empty");
        require(bytes(credentials[credentialId].credentialId).length == 0, "Credential ID already exists");
        require(bytes(holderDID).length > 0, "Holder DID cannot be empty");
        require(bytes(credentialType).length > 0, "Credential type cannot be empty");
        
        credentials[credentialId] = Credential({
            credentialId: credentialId,
            issuerDID: issuerDID,
            holderDID: holderDID,
            credentialType: credentialType,
            credentialHash: credentialHash,
            issuedAt: block.timestamp,
            expiresAt: expiresAt,
            isRevoked: false,
            attributes: attributes,
            metadata: metadata
        });
        
        holderCredentials[holderDID].push(credentialId);
        issuerCredentials[issuerDID].push(credentialId);
        allCredentials.push(credentialId);
        
        emit CredentialIssued(credentialId, issuerDID, holderDID);
    }
    
    /**
     * @dev Revoke a credential
     * @param credentialId The credential ID to revoke
     */
    function revokeCredential(string memory credentialId) 
        external 
        validCredential(credentialId) 
    {
        Credential storage credential = credentials[credentialId];
        require(keccak256(bytes(credential.issuerDID)) == keccak256(bytes(abi.encodePacked(msg.sender))), "Only issuer can revoke");
        require(!credential.isRevoked, "Credential already revoked");
        
        credential.isRevoked = true;
        
        emit CredentialRevoked(credentialId, credential.issuerDID);
    }
    
    /**
     * @dev Update credential data
     * @param credentialId The credential ID to update
     * @param newCredentialHash New IPFS hash of the credential data
     * @param newAttributes Updated attributes
     * @param newMetadata Updated metadata
     */
    function updateCredential(
        string memory credentialId,
        string memory newCredentialHash,
        string[] memory newAttributes,
        string memory newMetadata
    ) external validCredential(credentialId) {
        Credential storage credential = credentials[credentialId];
        require(keccak256(bytes(credential.issuerDID)) == keccak256(bytes(abi.encodePacked(msg.sender))), "Only issuer can update");
        require(!credential.isRevoked, "Cannot update revoked credential");
        
        credential.credentialHash = newCredentialHash;
        credential.attributes = newAttributes;
        credential.metadata = newMetadata;
        
        emit CredentialUpdated(credentialId, newCredentialHash);
    }
    
    /**
     * @dev Get credential by ID
     * @param credentialId The credential ID
     * @return The credential data
     */
    function getCredential(string memory credentialId) 
        external 
        view 
        validCredential(credentialId) 
        returns (Credential memory) 
    {
        return credentials[credentialId];
    }
    
    /**
     * @dev Get credentials by holder DID
     * @param holderDID The holder's DID
     * @return Array of credential IDs
     */
    function getCredentialsByHolder(string memory holderDID) 
        external 
        view 
        returns (string[] memory) 
    {
        return holderCredentials[holderDID];
    }
    
    /**
     * @dev Get credentials by issuer DID
     * @param issuerDID The issuer's DID
     * @return Array of credential IDs
     */
    function getCredentialsByIssuer(string memory issuerDID) 
        external 
        view 
        returns (string[] memory) 
    {
        return issuerCredentials[issuerDID];
    }
    
    /**
     * @dev Check if credential is valid (not revoked and not expired)
     * @param credentialId The credential ID
     * @return True if the credential is valid
     */
    function isCredentialValid(string memory credentialId) 
        external 
        view 
        validCredential(credentialId) 
        returns (bool) 
    {
        Credential memory credential = credentials[credentialId];
        
        if (credential.isRevoked) {
            return false;
        }
        
        if (credential.expiresAt > 0 && block.timestamp > credential.expiresAt) {
            return false;
        }
        
        return true;
    }
    
    /**
     * @dev Get total number of credentials
     * @return The total count of credentials
     */
    function getTotalCredentials() external view returns (uint256) {
        return allCredentials.length;
    }
    
    /**
     * @dev Get total number of issuers
     * @return The total count of issuers
     */
    function getTotalIssuers() external view returns (uint256) {
        return allIssuers.length;
    }
}

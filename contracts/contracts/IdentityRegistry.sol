// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title IdentityRegistry
 * @dev Manages decentralized identity (DID) creation and resolution
 */
contract IdentityRegistry is Ownable, ReentrancyGuard {
    
    constructor() Ownable(msg.sender) {}
    
    struct DIDDocument {
        string did;                    // Decentralized Identifier
        address owner;                 // Ethereum address of the identity owner
        string documentHash;           // IPFS hash of the DID document
        uint256 createdAt;             // Timestamp of creation
        bool isActive;                 // Whether the identity is active
        string[] publicKeys;           // Array of public keys
        string[] services;             // Array of service endpoints
    }
    
    // Mapping from DID to DIDDocument
    mapping(string => DIDDocument) public identities;
    
    // Mapping from address to DID
    mapping(address => string) public addressToDID;
    
    // Array of all DIDs for enumeration
    string[] public allDIDs;
    
    // Events
    event DIDCreated(string indexed did, address indexed owner, string documentHash);
    event DIDUpdated(string indexed did, string newDocumentHash);
    event DIDDeactivated(string indexed did);
    event DIDReactivated(string indexed did);
    
    // Modifiers
    modifier onlyDIDOwner(string memory did) {
        require(identities[did].owner == msg.sender, "Not the owner of this DID");
        _;
    }
    
    modifier validDID(string memory did) {
        require(bytes(identities[did].did).length > 0, "DID does not exist");
        _;
    }
    
    /**
     * @dev Create a new decentralized identity
     * @param did The decentralized identifier
     * @param documentHash IPFS hash of the DID document
     * @param publicKeys Array of public keys
     * @param services Array of service endpoints
     */
    function createDID(
        string memory did,
        string memory documentHash,
        string[] memory publicKeys,
        string[] memory services
    ) external nonReentrant {
        require(bytes(did).length > 0, "DID cannot be empty");
        require(bytes(identities[did].did).length == 0, "DID already exists");
        require(bytes(addressToDID[msg.sender]).length == 0, "Address already has a DID");
        
        identities[did] = DIDDocument({
            did: did,
            owner: msg.sender,
            documentHash: documentHash,
            createdAt: block.timestamp,
            isActive: true,
            publicKeys: publicKeys,
            services: services
        });
        
        addressToDID[msg.sender] = did;
        allDIDs.push(did);
        
        emit DIDCreated(did, msg.sender, documentHash);
    }
    
    /**
     * @dev Update DID document
     * @param did The decentralized identifier
     * @param newDocumentHash New IPFS hash of the DID document
     * @param publicKeys Updated array of public keys
     * @param services Updated array of service endpoints
     */
    function updateDID(
        string memory did,
        string memory newDocumentHash,
        string[] memory publicKeys,
        string[] memory services
    ) external validDID(did) onlyDIDOwner(did) {
        require(identities[did].isActive, "DID is not active");
        
        identities[did].documentHash = newDocumentHash;
        identities[did].publicKeys = publicKeys;
        identities[did].services = services;
        
        emit DIDUpdated(did, newDocumentHash);
    }
    
    /**
     * @dev Deactivate a DID
     * @param did The decentralized identifier to deactivate
     */
    function deactivateDID(string memory did) external validDID(did) onlyDIDOwner(did) {
        require(identities[did].isActive, "DID is already deactivated");
        
        identities[did].isActive = false;
        
        emit DIDDeactivated(did);
    }
    
    /**
     * @dev Reactivate a DID
     * @param did The decentralized identifier to reactivate
     */
    function reactivateDID(string memory did) external validDID(did) onlyDIDOwner(did) {
        require(!identities[did].isActive, "DID is already active");
        
        identities[did].isActive = true;
        
        emit DIDReactivated(did);
    }
    
    /**
     * @dev Get DID document by DID
     * @param did The decentralized identifier
     * @return The DID document
     */
    function getDIDDocument(string memory did) external view validDID(did) returns (DIDDocument memory) {
        return identities[did];
    }
    
    /**
     * @dev Get DID by address
     * @param addr The Ethereum address
     * @return The DID associated with the address
     */
    function getDIDByAddress(address addr) external view returns (string memory) {
        return addressToDID[addr];
    }
    
    /**
     * @dev Check if a DID exists
     * @param did The decentralized identifier
     * @return True if the DID exists
     */
    function doesDIDExist(string memory did) external view returns (bool) {
        return bytes(identities[did].did).length > 0;
    }
    
    /**
     * @dev Get total number of DIDs
     * @return The total count of DIDs
     */
    function getTotalDIDs() external view returns (uint256) {
        return allDIDs.length;
    }
    
    /**
     * @dev Get DID at index
     * @param index The index in the array
     * @return The DID at the given index
     */
    function getDIDAtIndex(uint256 index) external view returns (string memory) {
        require(index < allDIDs.length, "Index out of bounds");
        return allDIDs[index];
    }
}

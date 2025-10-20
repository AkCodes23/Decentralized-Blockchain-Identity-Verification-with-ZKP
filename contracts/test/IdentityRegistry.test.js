const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("IdentityRegistry", function () {
  let identityRegistry;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    
    const IdentityRegistry = await ethers.getContractFactory("IdentityRegistry");
    identityRegistry = await IdentityRegistry.deploy();
    await identityRegistry.waitForDeployment();
  });

  describe("DID Creation", function () {
    it("Should create a new DID", async function () {
      const did = "did:example:123";
      const documentHash = "QmHash123";
      const publicKeys = ["key1", "key2"];
      const services = ["service1"];

      await identityRegistry.connect(addr1).createDID(
        did,
        documentHash,
        publicKeys,
        services
      );

      const didDocument = await identityRegistry.getDIDDocument(did);
      expect(didDocument.did).to.equal(did);
      expect(didDocument.owner).to.equal(addr1.address);
      expect(didDocument.documentHash).to.equal(documentHash);
      expect(didDocument.isActive).to.be.true;
    });

    it("Should not allow duplicate DIDs", async function () {
      const did = "did:example:123";
      const documentHash = "QmHash123";
      const publicKeys = ["key1"];
      const services = [];

      await identityRegistry.connect(addr1).createDID(
        did,
        documentHash,
        publicKeys,
        services
      );

      await expect(
        identityRegistry.connect(addr2).createDID(
          did,
          documentHash,
          publicKeys,
          services
        )
      ).to.be.revertedWith("DID already exists");
    });

    it("Should not allow address to have multiple DIDs", async function () {
      const did1 = "did:example:123";
      const did2 = "did:example:456";
      const documentHash = "QmHash123";
      const publicKeys = ["key1"];
      const services = [];

      await identityRegistry.connect(addr1).createDID(
        did1,
        documentHash,
        publicKeys,
        services
      );

      await expect(
        identityRegistry.connect(addr1).createDID(
          did2,
          documentHash,
          publicKeys,
          services
        )
      ).to.be.revertedWith("Address already has a DID");
    });
  });

  describe("DID Management", function () {
    beforeEach(async function () {
      const did = "did:example:123";
      const documentHash = "QmHash123";
      const publicKeys = ["key1"];
      const services = [];

      await identityRegistry.connect(addr1).createDID(
        did,
        documentHash,
        publicKeys,
        services
      );
    });

    it("Should update DID document", async function () {
      const did = "did:example:123";
      const newDocumentHash = "QmNewHash456";
      const newPublicKeys = ["key1", "key2", "key3"];
      const newServices = ["service1", "service2"];

      await identityRegistry.connect(addr1).updateDID(
        did,
        newDocumentHash,
        newPublicKeys,
        newServices
      );

      const didDocument = await identityRegistry.getDIDDocument(did);
      expect(didDocument.documentHash).to.equal(newDocumentHash);
    });

    it("Should deactivate and reactivate DID", async function () {
      const did = "did:example:123";

      await identityRegistry.connect(addr1).deactivateDID(did);
      let didDocument = await identityRegistry.getDIDDocument(did);
      expect(didDocument.isActive).to.be.false;

      await identityRegistry.connect(addr1).reactivateDID(did);
      didDocument = await identityRegistry.getDIDDocument(did);
      expect(didDocument.isActive).to.be.true;
    });

    it("Should not allow non-owner to update DID", async function () {
      const did = "did:example:123";
      const newDocumentHash = "QmNewHash456";
      const newPublicKeys = ["key1"];
      const newServices = [];

      await expect(
        identityRegistry.connect(addr2).updateDID(
          did,
          newDocumentHash,
          newPublicKeys,
          newServices
        )
      ).to.be.revertedWith("Not the owner of this DID");
    });
  });

  describe("DID Resolution", function () {
    it("Should resolve DID by address", async function () {
      const did = "did:example:123";
      const documentHash = "QmHash123";
      const publicKeys = ["key1"];
      const services = [];

      await identityRegistry.connect(addr1).createDID(
        did,
        documentHash,
        publicKeys,
        services
      );

      const resolvedDID = await identityRegistry.getDIDByAddress(addr1.address);
      expect(resolvedDID).to.equal(did);
    });

    it("Should check if DID exists", async function () {
      const did = "did:example:123";
      const documentHash = "QmHash123";
      const publicKeys = ["key1"];
      const services = [];

      expect(await identityRegistry.doesDIDExist(did)).to.be.false;

      await identityRegistry.connect(addr1).createDID(
        did,
        documentHash,
        publicKeys,
        services
      );

      expect(await identityRegistry.doesDIDExist(did)).to.be.true;
    });
  });
});

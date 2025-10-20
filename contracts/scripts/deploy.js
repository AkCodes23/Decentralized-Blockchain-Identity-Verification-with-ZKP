const { ethers } = require("hardhat");

async function main() {
  console.log("Starting deployment...");

  // Get the contract factories
  const IdentityRegistry = await ethers.getContractFactory("IdentityRegistry");
  const CredentialRegistry = await ethers.getContractFactory("CredentialRegistry");
  const VerificationContract = await ethers.getContractFactory("VerificationContract");
  const Verifier = await ethers.getContractFactory("Verifier");

  // Deploy contracts
  console.log("Deploying IdentityRegistry...");
  const identityRegistry = await IdentityRegistry.deploy();
  await identityRegistry.waitForDeployment();
  const identityRegistryAddress = await identityRegistry.getAddress();
  console.log("IdentityRegistry deployed to:", identityRegistryAddress);

  console.log("Deploying CredentialRegistry...");
  const credentialRegistry = await CredentialRegistry.deploy();
  await credentialRegistry.waitForDeployment();
  const credentialRegistryAddress = await credentialRegistry.getAddress();
  console.log("CredentialRegistry deployed to:", credentialRegistryAddress);

  console.log("Deploying Verifier...");
  const verifier = await Verifier.deploy();
  await verifier.waitForDeployment();
  const verifierAddress = await verifier.getAddress();
  console.log("Verifier deployed to:", verifierAddress);

  console.log("Deploying VerificationContract...");
  const verificationContract = await VerificationContract.deploy();
  await verificationContract.waitForDeployment();
  const verificationContractAddress = await verificationContract.getAddress();
  console.log("VerificationContract deployed to:", verificationContractAddress);

  // Register the verifier with the verification contract
  console.log("Registering ZKP verifier...");
  await verificationContract.registerZKPVerifier("age_verification", verifierAddress);
  await verificationContract.registerZKPVerifier("credential_ownership", verifierAddress);
  await verificationContract.registerZKPVerifier("selective_disclosure", verifierAddress);

  // Save contract addresses
  const contractAddresses = {
    IdentityRegistry: identityRegistryAddress,
    CredentialRegistry: credentialRegistryAddress,
    VerificationContract: verificationContractAddress,
    Verifier: verifierAddress
  };

  console.log("\n=== DEPLOYMENT COMPLETE ===");
  console.log("Contract Addresses:");
  console.log(JSON.stringify(contractAddresses, null, 2));

  // Save to file for backend use
  const fs = require('fs');
  const path = require('path');
  const addressesPath = path.join(__dirname, '..', '..', 'backend', 'contract-addresses.json');
  fs.writeFileSync(addressesPath, JSON.stringify(contractAddresses, null, 2));
  console.log("\nContract addresses saved to:", addressesPath);

  console.log("\nNext steps:");
  console.log("1. Start the backend server: npm run backend:dev");
  console.log("2. Start the frontend: npm run frontend:dev");
  console.log("3. Open http://localhost:3000 in your browser");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
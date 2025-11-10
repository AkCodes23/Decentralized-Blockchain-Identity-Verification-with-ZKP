const fs = require("fs");
const path = require("path");
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("🚀 Deploying contracts with:", deployer.address);

  // Deploy IdentityRegistry
  const IdentityRegistry = await hre.ethers.getContractFactory("IdentityRegistry");
  const identityRegistry = await IdentityRegistry.deploy();
  await identityRegistry.waitForDeployment();

  // Deploy CredentialRegistry
  const CredentialRegistry = await hre.ethers.getContractFactory("CredentialRegistry");
  const credentialRegistry = await CredentialRegistry.deploy();
  await credentialRegistry.waitForDeployment();

  // Deploy Verifier
  const Verifier = await hre.ethers.getContractFactory("Verifier");
  const verifier = await Verifier.deploy();
  await verifier.waitForDeployment();

  // Deploy VerificationContract
  const VerificationContract = await hre.ethers.getContractFactory("VerificationContract");
  const verificationContract = await VerificationContract.deploy();
  await verificationContract.waitForDeployment();

  // Collect addresses
  const addresses = {
    IdentityRegistry: await identityRegistry.getAddress(),
    CredentialRegistry: await credentialRegistry.getAddress(),
    Verifier: await verifier.getAddress(),
    VerificationContract: await verificationContract.getAddress(),
  };

  console.log("\n✅ Contracts deployed successfully:");
  console.log(addresses);

  // Save to frontend/public/contract-addresses.json
  const frontendPath = path.resolve(__dirname, "../../frontend/public/contract-addresses.json");
  fs.writeFileSync(frontendPath, JSON.stringify(addresses, null, 2));
  console.log(`\n📦 Addresses saved to: ${frontendPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

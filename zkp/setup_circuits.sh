#!/bin/bash

# Setup script for ZoKrates circuits
# This script compiles the circuits and generates verification keys

echo "Setting up ZoKrates circuits..."

# Check if ZoKrates is installed
if ! command -v zokrates &> /dev/null; then
    echo "ZoKrates is not installed. Please install it first."
    echo "Visit: https://zokrates.github.io/gettingstarted.html"
    exit 1
fi

# Create output directory
mkdir -p out

# Compile age verification circuit
echo "Compiling age verification circuit..."
zokrates compile -i age_verification.zok -o out/age_verification

# Setup age verification circuit
echo "Setting up age verification circuit..."
zokrates setup -i out/age_verification -p out/age_verification_proving.key -v out/age_verification_verification.key

# Generate verifier contract for age verification
echo "Generating verifier contract for age verification..."
zokrates export-verifier -i out/age_verification_verification.key -o out/age_verification_verifier.sol

# Compile credential ownership circuit
echo "Compiling credential ownership circuit..."
zokrates compile -i credential_ownership.zok -o out/credential_ownership

# Setup credential ownership circuit
echo "Setting up credential ownership circuit..."
zokrates setup -i out/credential_ownership -p out/credential_ownership_proving.key -v out/credential_ownership_verification.key

# Generate verifier contract for credential ownership
echo "Generating verifier contract for credential ownership..."
zokrates export-verifier -i out/credential_ownership_verification.key -o out/credential_ownership_verifier.sol

# Compile selective disclosure circuit
echo "Compiling selective disclosure circuit..."
zokrates compile -i selective_disclosure.zok -o out/selective_disclosure

# Setup selective disclosure circuit
echo "Setting up selective disclosure circuit..."
zokrates setup -i out/selective_disclosure -p out/selective_disclosure_proving.key -v out/selective_disclosure_verification.key

# Generate verifier contract for selective disclosure
echo "Generating verifier contract for selective disclosure..."
zokrates export-verifier -i out/selective_disclosure_verification.key -o out/selective_disclosure_verifier.sol

echo "Circuit setup completed!"
echo "Generated files:"
echo "- Proving keys: out/*_proving.key"
echo "- Verification keys: out/*_verification.key"
echo "- Verifier contracts: out/*_verifier.sol"

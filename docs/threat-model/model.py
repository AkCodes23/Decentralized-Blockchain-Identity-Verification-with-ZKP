# model.py — PyTM threat model for “Decentralized Blockchain Identity Verification with ZKP”
# Run:
#   python model.py
#   python -m pytm.pytm --dfd model.py | dot -Tpng -o dfd.png

from pytm import TM, Actor, Datastore, Process, Boundary, Dataflow

tm = TM("Decentralized Blockchain Identity Verification with ZKP")
tm.description = "DID + Credential + ZKP verification system (Hardhat, MetaMask, IPFS)."
tm.isOrdered = True

# ---- Boundaries (trust zones)
user_boundary      = Boundary("User Browser / MetaMask")
frontend_boundary  = Boundary("Frontend App (React)")
chain_boundary     = Boundary("Blockchain (Hardhat / Ethereum)")
ipfs_boundary      = Boundary("IPFS Network")
verifier_boundary  = Boundary("ZKP Verifier Contract")

# ---- External actors
holder  = Actor("Holder (Wallet)")
issuer  = Actor("Issuer (Wallet)")
verifier_actor = Actor("Verifier (Wallet/Org)")

# ---- Processes / Contracts
identity = Process("IdentityRegistry", implementsAuthentication=False)
identity.inBoundary = chain_boundary

cred = Process("CredentialRegistry", implementsAuthentication=False)
cred.inBoundary = chain_boundary

verify = Process("VerificationContract", implementsAuthentication=False)
verify.inBoundary = chain_boundary

zkp = Process("Verifier.sol", implementsAuthentication=False)
zkp.inBoundary = verifier_boundary

# ---- Data stores
chain = Datastore("Ethereum Node / State", isEncrypted=False, isFullDiskEncrypted=False)
chain.inBoundary = chain_boundary

ipfs = Datastore("IPFS (Credential Docs / CIDs)", isEncrypted=False)
ipfs.inBoundary = ipfs_boundary

# ---- Frontend app (for DFD clarity)
frontend = Process("React DApp (Browser)", implementsAuthentication=True)
frontend.inBoundary = frontend_boundary

# ---- Dataflows

# Wallet connects to DApp
Dataflow(holder, frontend, "Connect / Sign via MetaMask", protocol="ethereum", dstPort=8545)
Dataflow(issuer, frontend, "Connect / Admin/Issue via MetaMask", protocol="ethereum")
Dataflow(verifier_actor, frontend, "Verification UI Actions", protocol="https")

# DID ops
Dataflow(frontend, identity, "createDID(did, docHash, pubKeys, services)", protocol="eth_sendTransaction")
Dataflow(identity, chain, "Persist DID mapping", protocol="ethereum")

# Credential ops (admin + issuance)
Dataflow(frontend, cred, "registerIssuer(issuerDID,name,type) [onlyOwner]", protocol="eth_sendTransaction")
Dataflow(frontend, cred, "setIssuerAuthorization(issuerDID,bool) [onlyOwner]", protocol="eth_sendTransaction")
Dataflow(frontend, cred, "issueCredential(id,holderDID,type,cid,exp,attrs,meta,issuerDID)", protocol="eth_sendTransaction")
Dataflow(cred, chain, "Persist credential state", protocol="ethereum")

# Read flows
Dataflow(frontend, cred, "getCredentialsByHolder(holderDID)", protocol="eth_call")
Dataflow(frontend, ipfs, "Fetch credential doc by CID", protocol="ipfs")

# ZKP verification flows
Dataflow(frontend, verify, "registerZKPVerifier(circuitType, verifierAddr) [onlyOwner]", protocol="eth_sendTransaction")
Dataflow(frontend, verify, "submitVerificationRequest(reqId,credId,circuit,proof,inputs,verifierDID)", protocol="eth_sendTransaction")
Dataflow(verify, zkp, "verifyProof(bytes,uint256[])", protocol="eth_call")
Dataflow(verify, chain, "Store verification result", protocol="ethereum")

# Threat modeling flags (for auto STRIDE checks)
for df in tm.dataflows:
    # All state-changing flows are signed txs (authN via MetaMask), but not encrypted beyond transport.
    df.authenticated = True
    df.isReplayable = False

# Mark stores as integrity-critical
chain.isEncrypted = False
chain.isIntegrityProtected = True
ipfs.isIntegrityProtected = True  # via CIDs (content-hash)

# Describe assets
identity.storesCredentials = False
cred.storesCredentials = True
verify.usesZKP = True

if __name__ == "__main__":
    tm.process()
    tm.report()

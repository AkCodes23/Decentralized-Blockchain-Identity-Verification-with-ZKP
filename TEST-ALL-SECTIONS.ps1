# Test script to verify all 3 sections work
Write-Host "🧪 Testing All 3 Sections..." -ForegroundColor Cyan

# Test 1: Identity Section
Write-Host "`n🔑 Testing Identity Section..." -ForegroundColor Yellow
try {
    $identityData = @{
        did = "did:example:alice123"
        publicKeys = @("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266")
        services = @("https://identity.example.com")
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/identity/create" -Method POST -Body $identityData -ContentType "application/json"
    Write-Host "✅ Identity Creation: $($response.message)" -ForegroundColor Green
    
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/identity/address/0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" -Method GET
    Write-Host "✅ Identity Retrieval: Found DID $($response.did)" -ForegroundColor Green
} catch {
    Write-Host "❌ Identity Section Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Credentials Section
Write-Host "`n📜 Testing Credentials Section..." -ForegroundColor Yellow
try {
    $credentialData = @{
        credentialId = "cred_001"
        holderDID = "did:example:alice123"
        credentialType = "Educational"
        attributes = @("Bachelor of Computer Science", "GPA: 3.8")
        metadata = @{ institution = "Example University" }
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/credentials/issue" -Method POST -Body $credentialData -ContentType "application/json"
    Write-Host "✅ Credential Issuance: $($response.message)" -ForegroundColor Green
    
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/credentials/holder/did:example:alice123" -Method GET
    Write-Host "✅ Credential Retrieval: Found $($response.count) credentials" -ForegroundColor Green
} catch {
    Write-Host "❌ Credentials Section Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Verification Section
Write-Host "`n🔍 Testing Verification Section..." -ForegroundColor Yellow
try {
    $verificationData = @{
        credentialId = "cred_001"
        proofData = "mock_proof_data_12345"
        verifierDID = "did:example:verifier"
        verificationType = "credential_ownership"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/verification/submit" -Method POST -Body $verificationData -ContentType "application/json"
    Write-Host "✅ Verification Submission: $($response.message)" -ForegroundColor Green
    
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/verification/requests" -Method GET
    Write-Host "✅ Verification Retrieval: Found $($response.count) requests" -ForegroundColor Green
} catch {
    Write-Host "❌ Verification Section Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 All Tests Completed!" -ForegroundColor Green
Write-Host "Open http://localhost:3000 to test the frontend interface" -ForegroundColor Cyan



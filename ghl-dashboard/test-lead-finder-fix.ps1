# Test Lead Finder After NULL Fix
Write-Host "🔍 Testing Lead Finder API After NULL Fix..." -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000"

# Test 1: Search for contacts
Write-Host "Test 1: Testing Lead Search..." -ForegroundColor Yellow
$searchUrl = "$baseUrl/api/lead-finder/search?q=test"

try {
    $searchResponse = Invoke-RestMethod -Uri $searchUrl -Method Get -ErrorAction Stop
    
    if ($searchResponse.contacts) {
        Write-Host "✅ Search API working! Found $($searchResponse.contacts.Length) contacts" -ForegroundColor Green
        
        # Check if contacts have proper firstName/lastName handling
        $nullNameContacts = $searchResponse.contacts | Where-Object { 
            [string]::IsNullOrEmpty($_.firstName) -or 
            $_.firstName -eq $null 
        }
        
        if ($nullNameContacts.Count -gt 0) {
            Write-Host "⚠️  Found $($nullNameContacts.Count) contacts with null/empty firstName" -ForegroundColor Yellow
            Write-Host "   But this should be handled by the UI now!" -ForegroundColor Gray
        }
        
        # Test 2: Get details for first contact
        if ($searchResponse.contacts.Length -gt 0) {
            Write-Host ""
            Write-Host "Test 2: Testing Contact Details..." -ForegroundColor Yellow
            
            $firstContact = $searchResponse.contacts[0]
            $detailsUrl = "$baseUrl/api/lead-finder/details?id=$($firstContact.id)"
            
            try {
                $detailsResponse = Invoke-RestMethod -Uri $detailsUrl -Method Get -ErrorAction Stop
                
                Write-Host "✅ Details API working!" -ForegroundColor Green
                Write-Host "   Contact: $($detailsResponse.firstName || 'Unknown') $($detailsResponse.lastName || '')" -ForegroundColor Gray
                Write-Host "   Email: $($detailsResponse.email || 'No email')" -ForegroundColor Gray
                
                # Check if the response has safe values
                if ([string]::IsNullOrEmpty($detailsResponse.firstName)) {
                    Write-Host "   ℹ️  firstName is empty but UI should handle this" -ForegroundColor Cyan
                }
                
            } catch {
                Write-Host "❌ Details API Error: $_" -ForegroundColor Red
            }
        }
    } else {
        Write-Host "⚠️  No contacts found, but API is working" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "❌ Search API Error: $_" -ForegroundColor Red
    
    # Check for specific null reference error
    if ($_ -like "*Cannot read properties of null*") {
        Write-Host ""
        Write-Host "⚠️  NULL REFERENCE ERROR DETECTED!" -ForegroundColor Yellow
        Write-Host "   The fix may not have been applied correctly." -ForegroundColor Yellow
        Write-Host "   Please run: fix-lead-finder-null-final.bat" -ForegroundColor Cyan
    }
}

Write-Host ""
Write-Host "Test 3: Checking UI Rendering..." -ForegroundColor Yellow
Write-Host "Please manually test the following:" -ForegroundColor Cyan
Write-Host "1. Go to http://localhost:3000/lead-finder" -ForegroundColor White
Write-Host "2. Search for 'george' or 'robert' or 'test'" -ForegroundColor White
Write-Host "3. Click on any result to view details" -ForegroundColor White
Write-Host "4. Check browser console (F12) for any errors" -ForegroundColor White
Write-Host ""
Write-Host "If you see 'Unknown' instead of empty names, the fix is working!" -ForegroundColor Green

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

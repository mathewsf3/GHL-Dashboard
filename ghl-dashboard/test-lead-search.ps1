# Test Lead Finder Search API
Write-Host "🔍 Testing Lead Finder Search API..." -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000/api/lead-finder/search"
$testQueries = @("george", "robert", "john", "test", "smith")

foreach ($query in $testQueries) {
    Write-Host "Testing search for: '$query'" -ForegroundColor Yellow
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl`?q=$query" -Method Get -ErrorAction Stop
        
        if ($response.contacts) {
            Write-Host "✅ Success! Found $($response.contacts.Length) contacts" -ForegroundColor Green
            
            if ($response.contacts.Length -gt 0) {
                Write-Host "  First result: $($response.contacts[0].firstName) $($response.contacts[0].lastName)" -ForegroundColor Gray
            }
        } else {
            Write-Host "✅ No contacts found (but API is working)" -ForegroundColor Green
        }
    }
    catch {
        Write-Host "❌ Error: $_" -ForegroundColor Red
        
        # Try to get more details
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "Response: $responseBody" -ForegroundColor Red
        }
    }
    
    Write-Host ""
}

Write-Host "Test complete!" -ForegroundColor Green
Write-Host ""
Write-Host "If all tests show '✅ Success', the type errors have been fixed." -ForegroundColor Cyan
Write-Host "If you see '❌ Error' with '.includes is not a function', rebuild is needed." -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

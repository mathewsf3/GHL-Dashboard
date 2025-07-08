# Test Dashboard API after null reference fix
Write-Host "🔍 Testing Dashboard API..." -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000/api/dashboard"

# Test with different date ranges
$testCases = @(
    @{
        Name = "Last 30 days (default)"
        Params = ""
    },
    @{
        Name = "Today"
        Params = "?startDate=$(Get-Date -Format 'yyyy-MM-dd')&endDate=$(Get-Date -Format 'yyyy-MM-dd')"
    },
    @{
        Name = "Last 7 days"
        Params = "?startDate=$((Get-Date).AddDays(-7).ToString('yyyy-MM-dd'))&endDate=$(Get-Date -Format 'yyyy-MM-dd')"
    }
)

$allPassed = $true

foreach ($test in $testCases) {
    Write-Host "Testing: $($test.Name)" -ForegroundColor Yellow
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl$($test.Params)" -Method Get -ErrorAction Stop
        
        if ($response.data) {
            Write-Host "✅ Success! Dashboard data retrieved" -ForegroundColor Green
            Write-Host "  - Ad Spend: $$($response.data.adSpend)" -ForegroundColor Gray
            Write-Host "  - Applications: $($response.data.totalApplications)" -ForegroundColor Gray
            Write-Host "  - MQLs: $($response.data.totalMQLs)" -ForegroundColor Gray
            Write-Host "  - Calls Booked: $($response.data.callsBooked)" -ForegroundColor Gray
            Write-Host "  - Deals Won: $($response.data.dealsWon)" -ForegroundColor Gray
        } else {
            Write-Host "⚠️  No data returned (but API is working)" -ForegroundColor Yellow
            $allPassed = $false
        }
    }
    catch {
        Write-Host "❌ Error: $_" -ForegroundColor Red
        $allPassed = $false
        
        # Try to get more details
        if ($_.Exception.Response) {
            try {
                $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
                $responseBody = $reader.ReadToEnd()
                Write-Host "Response: $responseBody" -ForegroundColor Red
                
                # Check for specific error patterns
                if ($responseBody -like "*Cannot read properties of null*") {
                    Write-Host "⚠️  Null reference error still present - rebuild needed!" -ForegroundColor Yellow
                }
            } catch {}
        }
    }
    
    Write-Host ""
}

if ($allPassed) {
    Write-Host "✅ All tests passed! The null reference error has been fixed." -ForegroundColor Green
} else {
    Write-Host "⚠️  Some tests failed. Please check the errors above." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "If you see null reference errors, run:" -ForegroundColor Cyan
    Write-Host "  ./fix-dashboard-null.bat" -ForegroundColor White
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

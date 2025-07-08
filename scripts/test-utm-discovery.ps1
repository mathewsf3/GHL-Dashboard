# Test UTM Discovery API
Write-Host "🧪 Testing UTM Field Discovery..." -ForegroundColor Cyan
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/debug-utm-fields" -Method Get -ErrorAction Stop
    
    Write-Host "✅ API call successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Summary:" -ForegroundColor Yellow
    Write-Host "- Total contacts checked: $($response.summary.totalContactsChecked)"
    Write-Host "- Total tracking fields found: $($response.summary.totalTrackingFieldsFound)"
    Write-Host "- UTM fields count: $($response.summary.utmFieldsCount)"
    Write-Host "- Campaign fields count: $($response.summary.campaignFieldsCount)"
    
    if ($response.categorized.utmFields.Length -gt 0) {
        Write-Host ""
        Write-Host "🎯 UTM Fields Found:" -ForegroundColor Yellow
        foreach ($field in $response.categorized.utmFields) {
            Write-Host ""
            Write-Host "  Field: $($field.name)" -ForegroundColor Cyan
            Write-Host "  ID: $($field.id)"
            Write-Host "  Count: $($field.count)"
            if ($field.sampleValues.Length -gt 0) {
                $sample = $field.sampleValues[0]
                if ($sample.Length -gt 100) {
                    $sample = $sample.Substring(0, 100) + "..."
                }
                Write-Host "  Sample: $sample"
            }
        }
    }
    
    Write-Host ""
    Write-Host "✨ Test completed successfully!" -ForegroundColor Green
}
catch {
    Write-Host "❌ Test failed: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Make sure the development server is running on http://localhost:3000" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

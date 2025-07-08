#!/bin/bash

# GHL API Complete Endpoint Testing with cURL
# This script tests ALL known and potential GHL API endpoints

# Configuration
API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6IjZLVEM2S0pNZUNhT25CVkhzdGlzIiwidmVyc2lvbiI6MSwiaWF0IjoxNzUxNDcwNTY1OTA1LCJzdWIiOiJJblFHTUM1MXFLbUkwQzMzVFRZMCJ9.-XT16wR4MwRi7brSOW105H5bezCImedheTbwOPj19HI"
LOCATION_ID="6KTC6KJMeCaOnBVHstis"
BASE_URL_V1="https://rest.gohighlevel.com/v1"
BASE_URL_V2="https://rest.gohighlevel.com/v2"
SERVICES_URL="https://services.leadconnectorhq.com"

# Output file
OUTPUT_FILE="api_discovery_results_$(date +%Y%m%d_%H%M%S).md"

# Function to test endpoint
test_endpoint() {
    local method=$1
    local url=$2
    local description=$3
    local data=$4
    
    echo "Testing: $method $url - $description"
    echo "## $method $url - $description" >> $OUTPUT_FILE
    echo "" >> $OUTPUT_FILE
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
            -H "Authorization: Bearer $API_KEY" \
            -H "Content-Type: application/json" \
            "$url")
    elif [ "$method" = "POST" ] && [ -n "$data" ]; then
        response=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
            -X POST \
            -H "Authorization: Bearer $API_KEY" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$url")
    elif [ "$method" = "PUT" ] && [ -n "$data" ]; then
        response=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
            -X PUT \
            -H "Authorization: Bearer $API_KEY" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$url")
    elif [ "$method" = "DELETE" ]; then
        response=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
            -X DELETE \
            -H "Authorization: Bearer $API_KEY" \
            -H "Content-Type: application/json" \
            "$url")
    fi
    
    # Extract HTTP code
    http_code=$(echo "$response" | grep "HTTP_CODE:" | cut -d: -f2)
    response_body=$(echo "$response" | sed '/HTTP_CODE:/d')
    
    echo "HTTP Status: $http_code"
    echo "**HTTP Status:** $http_code" >> $OUTPUT_FILE
    echo "" >> $OUTPUT_FILE
    
    if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
        echo "✅ SUCCESS"
        echo "**Status:** ✅ SUCCESS" >> $OUTPUT_FILE
        echo "" >> $OUTPUT_FILE
        echo "\`\`\`json" >> $OUTPUT_FILE
        echo "$response_body" | jq . 2>/dev/null || echo "$response_body" >> $OUTPUT_FILE
        echo "\`\`\`" >> $OUTPUT_FILE
    elif [ "$http_code" = "404" ]; then
        echo "❌ NOT FOUND"
        echo "**Status:** ❌ NOT FOUND" >> $OUTPUT_FILE
    elif [ "$http_code" = "401" ]; then
        echo "🔐 UNAUTHORIZED"
        echo "**Status:** 🔐 UNAUTHORIZED" >> $OUTPUT_FILE
    elif [ "$http_code" = "403" ]; then
        echo "🚫 FORBIDDEN"
        echo "**Status:** 🚫 FORBIDDEN" >> $OUTPUT_FILE
    elif [ "$http_code" = "429" ]; then
        echo "⏰ RATE LIMITED"
        echo "**Status:** ⏰ RATE LIMITED" >> $OUTPUT_FILE
        sleep 12  # Wait for rate limit reset
    else
        echo "⚠️  OTHER: $http_code"
        echo "**Status:** ⚠️ OTHER: $http_code" >> $OUTPUT_FILE
        echo "" >> $OUTPUT_FILE
        echo "\`\`\`" >> $OUTPUT_FILE
        echo "$response_body" >> $OUTPUT_FILE
        echo "\`\`\`" >> $OUTPUT_FILE
    fi
    
    echo "" >> $OUTPUT_FILE
    echo "---" >> $OUTPUT_FILE
    echo ""
    sleep 1  # Rate limiting prevention
}

# Initialize output file
echo "# GHL API Complete Endpoint Discovery" > $OUTPUT_FILE
echo "Generated: $(date)" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE

echo "🔍 Starting comprehensive GHL API endpoint discovery..."
echo "📄 Results will be saved to: $OUTPUT_FILE"
echo ""

# =============================================================================
# CONTACTS API - V1 & V2
# =============================================================================
echo "=== TESTING CONTACTS API ==="

# Basic contacts endpoints
test_endpoint "GET" "$BASE_URL_V1/contacts" "List all contacts (V1)"
test_endpoint "GET" "$BASE_URL_V1/contacts?limit=5" "List contacts with limit (V1)"
test_endpoint "GET" "$BASE_URL_V1/contacts?includeCustomFields=true" "List contacts with custom fields (V1)"
test_endpoint "GET" "$BASE_URL_V1/contacts?includeCustomFields=true&limit=5" "List contacts with custom fields and limit (V1)"

# V2 contacts
test_endpoint "GET" "$BASE_URL_V2/contacts" "List all contacts (V2)"
test_endpoint "GET" "$BASE_URL_V2/contacts?limit=5" "List contacts with limit (V2)"

# =============================================================================
# CUSTOM FIELDS API
# =============================================================================
echo "=== TESTING CUSTOM FIELDS API ==="

test_endpoint "GET" "$BASE_URL_V1/locations/$LOCATION_ID/custom-fields" "List custom fields (V1)"
test_endpoint "GET" "$BASE_URL_V2/locations/$LOCATION_ID/custom-fields" "List custom fields (V2)"
test_endpoint "GET" "$BASE_URL_V1/custom-fields" "List custom fields global (V1)"
test_endpoint "GET" "$BASE_URL_V2/custom-fields" "List custom fields global (V2)"

# =============================================================================
# OPPORTUNITIES API
# =============================================================================
echo "=== TESTING OPPORTUNITIES API ==="

test_endpoint "GET" "$BASE_URL_V1/opportunities" "List opportunities (V1)"
test_endpoint "GET" "$BASE_URL_V2/opportunities" "List opportunities (V2)"
test_endpoint "GET" "$BASE_URL_V1/locations/$LOCATION_ID/opportunities" "List location opportunities (V1)"
test_endpoint "GET" "$BASE_URL_V2/locations/$LOCATION_ID/opportunities" "List location opportunities (V2)"

# =============================================================================
# PIPELINES API
# =============================================================================
echo "=== TESTING PIPELINES API ==="

test_endpoint "GET" "$BASE_URL_V1/pipelines" "List pipelines (V1)"
test_endpoint "GET" "$BASE_URL_V2/pipelines" "List pipelines (V2)"
test_endpoint "GET" "$BASE_URL_V1/locations/$LOCATION_ID/pipelines" "List location pipelines (V1)"
test_endpoint "GET" "$BASE_URL_V2/locations/$LOCATION_ID/pipelines" "List location pipelines (V2)"

# =============================================================================
# APPOINTMENTS/CALENDAR API
# =============================================================================
echo "=== TESTING APPOINTMENTS/CALENDAR API ==="

test_endpoint "GET" "$BASE_URL_V1/calendars" "List calendars (V1)"
test_endpoint "GET" "$BASE_URL_V2/calendars" "List calendars (V2)"
test_endpoint "GET" "$BASE_URL_V1/appointments" "List appointments (V1)"
test_endpoint "GET" "$BASE_URL_V2/appointments" "List appointments (V2)"
test_endpoint "GET" "$BASE_URL_V1/locations/$LOCATION_ID/calendars" "List location calendars (V1)"
test_endpoint "GET" "$BASE_URL_V2/locations/$LOCATION_ID/calendars" "List location calendars (V2)"

# =============================================================================
# TAGS API
# =============================================================================
echo "=== TESTING TAGS API ==="

test_endpoint "GET" "$BASE_URL_V1/tags" "List tags (V1)"
test_endpoint "GET" "$BASE_URL_V2/tags" "List tags (V2)"
test_endpoint "GET" "$BASE_URL_V1/locations/$LOCATION_ID/tags" "List location tags (V1)"
test_endpoint "GET" "$BASE_URL_V2/locations/$LOCATION_ID/tags" "List location tags (V2)"

# =============================================================================
# CONVERSATIONS API
# =============================================================================
echo "=== TESTING CONVERSATIONS API ==="

test_endpoint "GET" "$BASE_URL_V1/conversations" "List conversations (V1)"
test_endpoint "GET" "$BASE_URL_V2/conversations" "List conversations (V2)"
test_endpoint "GET" "$BASE_URL_V1/locations/$LOCATION_ID/conversations" "List location conversations (V1)"
test_endpoint "GET" "$BASE_URL_V2/locations/$LOCATION_ID/conversations" "List location conversations (V2)"

# =============================================================================
# CAMPAIGNS API
# =============================================================================
echo "=== TESTING CAMPAIGNS API ==="

test_endpoint "GET" "$BASE_URL_V1/campaigns" "List campaigns (V1)"
test_endpoint "GET" "$BASE_URL_V2/campaigns" "List campaigns (V2)"
test_endpoint "GET" "$BASE_URL_V1/locations/$LOCATION_ID/campaigns" "List location campaigns (V1)"
test_endpoint "GET" "$BASE_URL_V2/locations/$LOCATION_ID/campaigns" "List location campaigns (V2)"

# =============================================================================
# WORKFLOWS API
# =============================================================================
echo "=== TESTING WORKFLOWS API ==="

test_endpoint "GET" "$BASE_URL_V1/workflows" "List workflows (V1)"
test_endpoint "GET" "$BASE_URL_V2/workflows" "List workflows (V2)"
test_endpoint "GET" "$BASE_URL_V1/locations/$LOCATION_ID/workflows" "List location workflows (V1)"
test_endpoint "GET" "$BASE_URL_V2/locations/$LOCATION_ID/workflows" "List location workflows (V2)"

# =============================================================================
# FORMS API
# =============================================================================
echo "=== TESTING FORMS API ==="

test_endpoint "GET" "$BASE_URL_V1/forms" "List forms (V1)"
test_endpoint "GET" "$BASE_URL_V2/forms" "List forms (V2)"
test_endpoint "GET" "$BASE_URL_V1/locations/$LOCATION_ID/forms" "List location forms (V1)"
test_endpoint "GET" "$BASE_URL_V2/locations/$LOCATION_ID/forms" "List location forms (V2)"

# =============================================================================
# USERS API
# =============================================================================
echo "=== TESTING USERS API ==="

test_endpoint "GET" "$BASE_URL_V1/users" "List users (V1)"
test_endpoint "GET" "$BASE_URL_V2/users" "List users (V2)"
test_endpoint "GET" "$BASE_URL_V1/locations/$LOCATION_ID/users" "List location users (V1)"
test_endpoint "GET" "$BASE_URL_V2/locations/$LOCATION_ID/users" "List location users (V2)"

# =============================================================================
# LOCATIONS API
# =============================================================================
echo "=== TESTING LOCATIONS API ==="

test_endpoint "GET" "$BASE_URL_V1/locations" "List locations (V1)"
test_endpoint "GET" "$BASE_URL_V2/locations" "List locations (V2)"
test_endpoint "GET" "$BASE_URL_V1/locations/$LOCATION_ID" "Get specific location (V1)"
test_endpoint "GET" "$BASE_URL_V2/locations/$LOCATION_ID" "Get specific location (V2)"

# =============================================================================
# COMPANIES API
# =============================================================================
echo "=== TESTING COMPANIES API ==="

test_endpoint "GET" "$BASE_URL_V1/companies" "List companies (V1)"
test_endpoint "GET" "$BASE_URL_V2/companies" "List companies (V2)"
test_endpoint "GET" "$BASE_URL_V1/agency/companies" "List agency companies (V1)"
test_endpoint "GET" "$BASE_URL_V2/agency/companies" "List agency companies (V2)"

# =============================================================================
# MEDIA/FILES API
# =============================================================================
echo "=== TESTING MEDIA/FILES API ==="

test_endpoint "GET" "$BASE_URL_V1/media" "List media (V1)"
test_endpoint "GET" "$BASE_URL_V2/media" "List media (V2)"
test_endpoint "GET" "$BASE_URL_V1/locations/$LOCATION_ID/media" "List location media (V1)"
test_endpoint "GET" "$BASE_URL_V2/locations/$LOCATION_ID/media" "List location media (V2)"

# =============================================================================
# PRODUCTS API
# =============================================================================
echo "=== TESTING PRODUCTS API ==="

test_endpoint "GET" "$BASE_URL_V1/products" "List products (V1)"
test_endpoint "GET" "$BASE_URL_V2/products" "List products (V2)"
test_endpoint "GET" "$BASE_URL_V1/locations/$LOCATION_ID/products" "List location products (V1)"
test_endpoint "GET" "$BASE_URL_V2/locations/$LOCATION_ID/products" "List location products (V2)"

# =============================================================================
# ORDERS API
# =============================================================================
echo "=== TESTING ORDERS API ==="

test_endpoint "GET" "$BASE_URL_V1/orders" "List orders (V1)"
test_endpoint "GET" "$BASE_URL_V2/orders" "List orders (V2)"
test_endpoint "GET" "$BASE_URL_V1/locations/$LOCATION_ID/orders" "List location orders (V1)"
test_endpoint "GET" "$BASE_URL_V2/locations/$LOCATION_ID/orders" "List location orders (V2)"

# =============================================================================
# SURVEYS API
# =============================================================================
echo "=== TESTING SURVEYS API ==="

test_endpoint "GET" "$BASE_URL_V1/surveys" "List surveys (V1)"
test_endpoint "GET" "$BASE_URL_V2/surveys" "List surveys (V2)"
test_endpoint "GET" "$BASE_URL_V1/locations/$LOCATION_ID/surveys" "List location surveys (V1)"
test_endpoint "GET" "$BASE_URL_V2/locations/$LOCATION_ID/surveys" "List location surveys (V2)"

# =============================================================================
# SNAPSHOTS API
# =============================================================================
echo "=== TESTING SNAPSHOTS API ==="

test_endpoint "GET" "$BASE_URL_V1/snapshots" "List snapshots (V1)"
test_endpoint "GET" "$BASE_URL_V2/snapshots" "List snapshots (V2)"
test_endpoint "GET" "$BASE_URL_V1/locations/$LOCATION_ID/snapshots" "List location snapshots (V1)"
test_endpoint "GET" "$BASE_URL_V2/locations/$LOCATION_ID/snapshots" "List location snapshots (V2)"

# =============================================================================
# WEBHOOKS API
# =============================================================================
echo "=== TESTING WEBHOOKS API ==="

test_endpoint "GET" "$BASE_URL_V1/webhooks" "List webhooks (V1)"
test_endpoint "GET" "$BASE_URL_V2/webhooks" "List webhooks (V2)"
test_endpoint "GET" "$BASE_URL_V1/locations/$LOCATION_ID/webhooks" "List location webhooks (V1)"
test_endpoint "GET" "$BASE_URL_V2/locations/$LOCATION_ID/webhooks" "List location webhooks (V2)"

# =============================================================================
# OAUTH API
# =============================================================================
echo "=== TESTING OAUTH API ==="

test_endpoint "GET" "$BASE_URL_V2/oauth/installedLocations" "OAuth installed locations (V2)"
test_endpoint "GET" "$BASE_URL_V2/oauth/locations" "OAuth locations (V2)"

# =============================================================================
# BUSINESS API
# =============================================================================
echo "=== TESTING BUSINESS API ==="

test_endpoint "GET" "$BASE_URL_V1/business" "Business info (V1)"
test_endpoint "GET" "$BASE_URL_V2/business" "Business info (V2)"
test_endpoint "GET" "$BASE_URL_V1/locations/$LOCATION_ID/business" "Location business info (V1)"
test_endpoint "GET" "$BASE_URL_V2/locations/$LOCATION_ID/business" "Location business info (V2)"

echo ""
echo "🎉 API Discovery Complete!"
echo "📄 Results saved to: $OUTPUT_FILE"
echo ""
echo "Summary of what was tested:"
echo "- Contacts API (V1 & V2)"
echo "- Custom Fields API"
echo "- Opportunities API"
echo "- Pipelines API"
echo "- Appointments/Calendar API"
echo "- Tags API"
echo "- Conversations API"
echo "- Campaigns API"
echo "- Workflows API"
echo "- Forms API"
echo "- Users API"
echo "- Locations API"
echo "- Companies API"
echo "- Media/Files API"
echo "- Products API"
echo "- Orders API"
echo "- Surveys API"
echo "- Snapshots API"
echo "- Webhooks API"
echo "- OAuth API"
echo "- Business API"
echo ""
echo "Check the output file for detailed results and response structures!"
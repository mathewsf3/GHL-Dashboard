# Complete GHL API Working Endpoints - Ready for Dashboard

## ✅ CONFIRMED WORKING ENDPOINTS (API v1)

Based on our comprehensive testing, here are ALL the working GHL API endpoints:

### 1. CONTACTS API ✅ (PRIMARY)
```bash
# Base endpoint for all contact operations
GET https://rest.gohighlevel.com/v1/contacts

# Available parameters:
GET https://rest.gohighlevel.com/v1/contacts?limit=100                    # Pagination
GET https://rest.gohighlevel.com/v1/contacts?offset=0                     # Pagination
GET https://rest.gohighlevel.com/v1/contacts?includeCustomFields=true     # Include custom fields
GET https://rest.gohighlevel.com/v1/contacts?tag=FA+Application           # Filter by tag
GET https://rest.gohighlevel.com/v1/contacts?startDate=2024-01-01         # Date range
GET https://rest.gohighlevel.com/v1/contacts?endDate=2024-12-31           # Date range

# Combined parameters
GET https://rest.gohighlevel.com/v1/contacts?includeCustomFields=true&limit=100&offset=0&tag=FA+Application
```

### 2. CUSTOM FIELDS API ✅
```bash
# Get all custom field definitions
GET https://rest.gohighlevel.com/v1/custom-fields
```

### 3. PIPELINES API ✅
```bash
# Get all pipelines
GET https://rest.gohighlevel.com/v1/pipelines
```

### 4. TAGS API ✅
```bash
# Get all tags
GET https://rest.gohighlevel.com/v1/tags
```

### 5. CAMPAIGNS API ✅
```bash
# Get all campaigns
GET https://rest.gohighlevel.com/v1/campaigns
```

### 6. WORKFLOWS API ✅
```bash
# Get all workflows
GET https://rest.gohighlevel.com/v1/workflows
```

### 7. FORMS API ✅
```bash
# Get all forms
GET https://rest.gohighlevel.com/v1/forms
```

### 8. USERS API ✅
```bash
# Get all users
GET https://rest.gohighlevel.com/v1/users
```

### 9. LOCATIONS API ✅
```bash
# Get all locations
GET https://rest.gohighlevel.com/v1/locations

# Get specific location
GET https://rest.gohighlevel.com/v1/locations/6KTC6KJMeCaOnBVHstis
```

### 10. SURVEYS API ✅
```bash
# Get all surveys
GET https://rest.gohighlevel.com/v1/surveys
```

## ❌ NON-WORKING ENDPOINTS

### API v2 Endpoints (All return 404)
- All `/v2/` endpoints are not accessible with current API key
- V2 requires OAuth 2.0 authentication (different from V1 Bearer token)

### Location-Specific Endpoints (All return 404)
- `/locations/{id}/custom-fields`
- `/locations/{id}/opportunities`
- `/locations/{id}/pipelines`
- `/locations/{id}/calendars`
- `/locations/{id}/tags`
- `/locations/{id}/conversations`
- `/locations/{id}/campaigns`
- `/locations/{id}/workflows`
- `/locations/{id}/forms`
- `/locations/{id}/users`
- `/locations/{id}/media`
- `/locations/{id}/products`
- `/locations/{id}/orders`
- `/locations/{id}/surveys`
- `/locations/{id}/webhooks`
- `/locations/{id}/business`

### Other Non-Working Endpoints
- `/opportunities` (global)
- `/appointments` (returns 422 - needs parameters)
- `/calendars`
- `/conversations`
- `/companies`
- `/media`
- `/products`
- `/orders`
- `/webhooks`
- `/oauth/*`
- `/business`
- `/snapshots` (returns 401 - unauthorized)

## 🎯 CUSTOMER JOURNEY MAPPING WITH WORKING ENDPOINTS

### Stage 1: FA Applications → CONTACTS API
```bash
# Get all contacts with FA application data
curl -H "Authorization: Bearer $API_KEY" \
  "https://rest.gohighlevel.com/v1/contacts?includeCustomFields=true&limit=100"

# Filter by FA Application tag
curl -H "Authorization: Bearer $API_KEY" \
  "https://rest.gohighlevel.com/v1/contacts?includeCustomFields=true&tag=FA+Application"
```

### Stage 2: MQL Qualification → TAGS API + CONTACTS
```bash
# Get all available tags
curl -H "Authorization: Bearer $API_KEY" \
  "https://rest.gohighlevel.com/v1/tags"

# Filter contacts by MQL tag
curl -H "Authorization: Bearer $API_KEY" \
  "https://rest.gohighlevel.com/v1/contacts?tag=FA+MQL"
```

### Stage 3: Pipeline Management → PIPELINES API
```bash
# Get all pipelines and stages
curl -H "Authorization: Bearer $API_KEY" \
  "https://rest.gohighlevel.com/v1/pipelines"
```

### Stage 4: Campaign Tracking → CAMPAIGNS API
```bash
# Get all campaigns for attribution
curl -H "Authorization: Bearer $API_KEY" \
  "https://rest.gohighlevel.com/v1/campaigns"
```

### Stage 5: Workflow Automation → WORKFLOWS API
```bash
# Get all workflows
curl -H "Authorization: Bearer $API_KEY" \
  "https://rest.gohighlevel.com/v1/workflows"
```

## 📊 DASHBOARD DATA SOURCES

### Primary Data Source: CONTACTS API
```javascript
// Complete contact data with custom fields
const contactsWithFields = await fetch(
  'https://rest.gohighlevel.com/v1/contacts?includeCustomFields=true&limit=100',
  {
    headers: { 'Authorization': `Bearer ${API_KEY}` }
  }
);

// Custom field mappings from our discovery:
const customFields = {
  'hWiYPVIxzb8z69ZSqP1j': 'FA Application Date',
  'UAkQthswkKrPlIWQ5Mtk': 'Capital Available', 
  'j4KihL9HZzwqTCEbai8b': 'Credit Score',
  'VVOSFbxXpsppfHox2jhI': 'Income Level',
  'klgLSEZH45ChqGWCprJ8': 'Business Type',
  'UHOFwbbvd6VH0qwASmxX': 'Funding Timeline',
  'XipmrnXqV46DDxVrDiYS': 'UTM Source',
  'cj09pOhxqE4WOOKqQVhK': 'Campaign Name',
  'Q0KWavjuX7YuGrtJaC6k': 'Ad Set Name',
  'FSIc6ju162mN3K8IUbD8': 'IP Address',
  'w0MiykFb25fTTFQla3bu': 'Booked Call Date',
  'O8NBb6R5CNUfJXka2599': 'Call Notes/Status'
};
```

### Supporting Data Sources
```javascript
// Get all tags for filtering
const tags = await fetch('https://rest.gohighlevel.com/v1/tags', {
  headers: { 'Authorization': `Bearer ${API_KEY}` }
});

// Get pipeline structure
const pipelines = await fetch('https://rest.gohighlevel.com/v1/pipelines', {
  headers: { 'Authorization': `Bearer ${API_KEY}` }
});

// Get campaign data for attribution
const campaigns = await fetch('https://rest.gohighlevel.com/v1/campaigns', {
  headers: { 'Authorization': `Bearer ${API_KEY}` }
});
```

## 🚀 IMPLEMENTATION STRATEGY

### 1. Real-time Dashboard Sync
```python
def sync_dashboard_data():
    """Sync all working endpoints for dashboard"""
    
    # Primary: Get all contacts with custom fields
    contacts = fetch_ghl_contacts(include_custom_fields=True)
    
    # Supporting: Get reference data
    tags = fetch_ghl_tags()
    pipelines = fetch_ghl_pipelines()
    campaigns = fetch_ghl_campaigns()
    workflows = fetch_ghl_workflows()
    forms = fetch_ghl_forms()
    
    # Process and store in Supabase
    process_contacts_for_dashboard(contacts)
    process_reference_data(tags, pipelines, campaigns)
    
    return {
        'contacts': len(contacts),
        'tags': len(tags),
        'pipelines': len(pipelines),
        'campaigns': len(campaigns)
    }
```

### 2. Customer Journey Tracking
```python
def track_customer_journey(contacts):
    """Process contacts through customer journey stages"""
    
    journey_data = []
    
    for contact in contacts:
        custom_fields = {f['id']: f['value'] for f in contact.get('customField', [])}
        tags = contact.get('tags', [])
        
        # Determine journey stage
        stage = determine_journey_stage(custom_fields, tags)
        
        journey_data.append({
            'contact_id': contact['id'],
            'stage': stage,
            'fa_application_date': custom_fields.get('hWiYPVIxzb8z69ZSqP1j'),
            'capital_available': custom_fields.get('UAkQthswkKrPlIWQ5Mtk'),
            'credit_score': custom_fields.get('j4KihL9HZzwqTCEbai8b'),
            'tags': tags,
            'timestamp': datetime.now()
        })
    
    return journey_data

def determine_journey_stage(custom_fields, tags):
    """Determine customer journey stage based on data"""
    
    if 'deal_won' in [tag.lower() for tag in tags]:
        return 'deal_won'
    elif 'contract_sent' in [tag.lower() for tag in tags]:
        return 'contract_sent'
    elif custom_fields.get('O8NBb6R5CNUfJXka2599'):  # Has call notes
        return 'call_taken'
    elif custom_fields.get('w0MiykFb25fTTFQla3bu'):  # Has booked call date
        return 'intro_booked'
    elif is_mql_qualified(custom_fields):
        return 'fa_mql'
    elif custom_fields.get('hWiYPVIxzb8z69ZSqP1j'):  # Has FA application date
        return 'fa_application'
    else:
        return 'lead'

def is_mql_qualified(custom_fields):
    """Check if contact meets MQL criteria"""
    capital = custom_fields.get('UAkQthswkKrPlIWQ5Mtk', '')
    credit = custom_fields.get('j4KihL9HZzwqTCEbai8b', '')
    
    return (
        capital and capital != 'Less than $1k' and
        credit and credit != 'Less than 680'
        # Add bankruptcy check when field is found
    )
```

## 📈 DASHBOARD METRICS FROM WORKING ENDPOINTS

### Conversion Funnel
```sql
-- Based on working contacts API data
SELECT 
    stage,
    COUNT(*) as count,
    COUNT(*) * 100.0 / LAG(COUNT(*)) OVER (ORDER BY stage_order) as conversion_rate
FROM (
    SELECT 
        contact_id,
        stage,
        CASE stage 
            WHEN 'lead' THEN 1
            WHEN 'fa_application' THEN 2 
            WHEN 'fa_mql' THEN 3
            WHEN 'intro_booked' THEN 4
            WHEN 'call_taken' THEN 5
            WHEN 'contract_sent' THEN 6
            WHEN 'deal_won' THEN 7
        END as stage_order
    FROM customer_journey_tracking
) t
GROUP BY stage, stage_order
ORDER BY stage_order;
```

### Campaign Performance
```sql
-- Based on working campaigns + contacts API
SELECT 
    c.campaign_name,
    COUNT(DISTINCT contact_id) as leads,
    COUNT(DISTINCT CASE WHEN stage = 'fa_application' THEN contact_id END) as applications,
    COUNT(DISTINCT CASE WHEN stage = 'deal_won' THEN contact_id END) as wins
FROM customer_journey_tracking cj
JOIN campaigns c ON c.id = cj.campaign_id
GROUP BY c.campaign_name;
```

## ✅ READY FOR DASHBOARD IMPLEMENTATION

With these working endpoints, we can build a complete dashboard tracking:

1. **FA Applications** → Via contacts API with custom fields
2. **MQL Qualification** → Via contacts API + tags filtering  
3. **Pipeline Progression** → Via pipelines API + contact tags
4. **Campaign Attribution** → Via campaigns API + contact custom fields
5. **Form Submissions** → Via forms API
6. **Workflow Automation** → Via workflows API

The foundation is solid with the contacts API as the primary data source containing all custom fields and tags needed for customer journey tracking.
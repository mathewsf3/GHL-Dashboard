# Complete Tag Mapping and MQL Logic for GHL Dashboard

## 1. Tag Structure Overview

### Primary Tags
- **FA | Application Date** - Base tag for all applications
- **FA MQLs** - Qualified applications meeting specific criteria

### Tag Hierarchy
```
FA | Application Date (Base)
└── FA MQLs (Filtered subset)
    ├── Meets Capital Requirements
    ├── Meets Credit Score Requirements  
    └── No Previous Bankruptcy
```

## 2. FA | Application Date Tag

### Base Criteria
- **Primary Field**: `hWiYPVIxzb8z69ZSqP1j` (FA | Application Date)
- **Logic**: Contact has ANY value in FA Application Date field
- **Data Type**: DATE (millisecond timestamp)

### Database Table: `tag_fa_application`
```sql
CREATE TABLE tag_fa_application (
    id TEXT PRIMARY KEY,
    contact_id TEXT REFERENCES ghl_contacts(id),
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    phone TEXT,
    fa_application_date DATE,
    booked_call_date DATE,
    utm_source TEXT,
    income_level TEXT,
    credit_score TEXT,
    credit_card_debt TEXT,
    funding_timeline TEXT,
    ad_set_name TEXT,
    campaign_name TEXT,
    business_type TEXT,
    ip_address TEXT,
    date_added TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

## 3. FA MQLs Tag - Complex Filtering Logic

### Definition
FA MQLs = FA Applications that meet ALL of the following criteria:

### Criteria 1: Capital Available
- **Field**: `FA | Capital Available` (FIELD ID NEEDED)
- **Logic**: `IS NOT "Less than $1k"`
- **Valid Values**: Any value EXCEPT "Less than $1k"

### Criteria 2: Credit Score
- **Field**: `FA | What is your Credit Score...` (FIELD ID NEEDED)
- **Logic**: `IS NOT "Less than 680"`
- **Valid Values**: Any value EXCEPT "Less than 680"

### Criteria 3: Bankruptcy History
- **Field**: `FA | Ever gone through persona...` (FIELD ID NEEDED)
- **Logic**: `IS NOT "Yes"`
- **Valid Values**: Any value EXCEPT "Yes"

### Combined MQL Logic
```sql
-- FA MQLs Query Logic
SELECT * FROM ghl_contacts 
WHERE 
    -- Must have FA Application Date
    JSON_EXTRACT(custom_fields, '$.hWiYPVIxzb8z69ZSqP1j') IS NOT NULL
    
    -- Capital Available: NOT "Less than $1k"
    AND (JSON_EXTRACT(custom_fields, '$.{CAPITAL_FIELD_ID}') IS NULL 
         OR JSON_EXTRACT(custom_fields, '$.{CAPITAL_FIELD_ID}') != 'Less than $1k')
    
    -- Credit Score: NOT "Less than 680"
    AND (JSON_EXTRACT(custom_fields, '$.{CREDIT_FIELD_ID}') IS NULL 
         OR JSON_EXTRACT(custom_fields, '$.{CREDIT_FIELD_ID}') != 'Less than 680')
    
    -- Bankruptcy: NOT "Yes"
    AND (JSON_EXTRACT(custom_fields, '$.{BANKRUPTCY_FIELD_ID}') IS NULL 
         OR JSON_EXTRACT(custom_fields, '$.{BANKRUPTCY_FIELD_ID}') != 'Yes');
```

## 4. Missing Custom Fields to Discover

### Required Field Discovery
We need to find Field IDs for:

| Field Name | Purpose | Expected Values | Status |
|------------|---------|-----------------|--------|
| FA \| Capital Available | Filter out low-capital applicants | "Less than $1k", "$1k-5k", "$5k-10k", etc. | **MISSING** |
| FA \| What is your Credit Score... | Filter out low credit scores | "Less than 680", "680-720", "720+", etc. | **MISSING** |
| FA \| Ever gone through persona... | Filter out bankruptcy history | "Yes", "No" | **MISSING** |

### Discovery Script Enhancement
```python
# Add to find_fa_fields.py
SEARCH_PATTERNS = [
    "capital available",
    "credit score",
    "gone through persona",
    "bankruptcy",
    "personal guarantee"
]

def find_mql_fields(contacts):
    mql_fields = {}
    for contact in contacts:
        for field in contact.get('customField', []):
            field_value = str(field.get('value', '')).lower()
            for pattern in SEARCH_PATTERNS:
                if pattern in field_value:
                    field_id = field.get('id')
                    if field_id not in mql_fields:
                        mql_fields[field_id] = []
                    mql_fields[field_id].append(field.get('value'))
    return mql_fields
```

## 5. Database Tables for Tag-Based Architecture

### FA MQLs Table
```sql
CREATE TABLE tag_fa_mqls (
    id TEXT PRIMARY KEY,
    contact_id TEXT REFERENCES ghl_contacts(id),
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    phone TEXT,
    fa_application_date DATE,
    -- MQL Qualification Fields
    capital_available TEXT,
    credit_score_range TEXT,
    bankruptcy_history TEXT,
    -- Additional qualification data
    qualification_date TIMESTAMP DEFAULT NOW(),
    disqualification_reason TEXT,
    mql_score INTEGER,
    -- Standard fields
    utm_source TEXT,
    campaign_name TEXT,
    business_type TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_mql CHECK (
        capital_available != 'Less than $1k' AND
        credit_score_range != 'Less than 680' AND
        bankruptcy_history != 'Yes'
    )
);
```

### Tag Relationship Table
```sql
CREATE TABLE tag_relationships (
    id SERIAL PRIMARY KEY,
    parent_tag TEXT,
    child_tag TEXT,
    relationship_type TEXT, -- 'subset', 'exclusive', 'related'
    filter_logic JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Example data
INSERT INTO tag_relationships VALUES 
('FA | Application Date', 'FA MQLs', 'subset', '{
    "logic": "AND",
    "conditions": [
        {"field": "capital_available", "operator": "!=", "value": "Less than $1k"},
        {"field": "credit_score", "operator": "!=", "value": "Less than 680"},
        {"field": "bankruptcy_history", "operator": "!=", "value": "Yes"}
    ]
}');
```

## 6. Sync Implementation Strategy

### Phase 1: Field Discovery
```python
# Enhanced sync_fa_applications_final.py
def discover_mql_fields(self):
    """Find the missing MQL-related custom fields"""
    print("Discovering MQL-related custom fields...")
    
    # Get custom fields definitions
    response = requests.get(
        f"{self.base_url}/locations/{self.location_id}/custom-fields",
        headers=self.headers
    )
    
    if response.status_code == 200:
        fields = response.json().get('customFields', [])
        for field in fields:
            field_name = field.get('name', '').lower()
            if any(keyword in field_name for keyword in ['capital', 'credit score', 'persona', 'bankruptcy']):
                print(f"Found potential MQL field: {field.get('id')} - {field.get('name')}")
```

### Phase 2: MQL Classification
```python
def classify_mql(self, contact):
    """Determine if contact qualifies as FA MQL"""
    custom_fields = {f.get('id'): f.get('value') for f in contact.get('customField', [])}
    
    # Must have FA Application Date
    if not custom_fields.get('hWiYPVIxzb8z69ZSqP1j'):
        return False, "No FA Application Date"
    
    # Check capital availability
    capital = custom_fields.get('{CAPITAL_FIELD_ID}')
    if capital == 'Less than $1k':
        return False, "Capital less than $1k"
    
    # Check credit score
    credit = custom_fields.get('{CREDIT_FIELD_ID}')
    if credit == 'Less than 680':
        return False, "Credit score less than 680"
    
    # Check bankruptcy history
    bankruptcy = custom_fields.get('{BANKRUPTCY_FIELD_ID}')
    if bankruptcy == 'Yes':
        return False, "Previous bankruptcy"
    
    return True, "Qualified MQL"
```

## 7. Dashboard Metrics for Tags

### FA | Application Date Metrics
- Total applications by date
- Application volume trends
- Source attribution analysis
- Geographic distribution

### FA MQLs Metrics
- MQL conversion rate (MQLs / Total Applications)
- Disqualification reasons breakdown
- MQL quality score trends
- Time to qualification

### Comparative Analysis
- MQL vs Non-MQL performance
- Qualification criteria effectiveness
- Field completion rates

## 8. Next Steps for Implementation

1. **Run field discovery** to find missing Field IDs
2. **Update custom field mappings** in sync scripts
3. **Implement MQL classification logic**
4. **Create tag-specific database tables**
5. **Build dashboard queries** for each tag
6. **Set up automated sync** with MQL filtering

## 9. API Query Examples

### Get All FA Applications
```python
params = {
    "limit": 100,
    "includeCustomFields": "true",
    "customField": "FA | Application Date"
}
```

### Get FA MQLs (Post-Processing Required)
```python
# Fetch all FA applications first, then filter locally
fa_apps = fetch_fa_applications()
mqls = [contact for contact in fa_apps if classify_mql(contact)[0]]
```

This structure provides a complete framework for managing both simple tags (FA Applications) and complex filtered tags (FA MQLs) with proper database architecture and sync logic.
# Complete GoHighLevel API Customer Journey Mapping - CONFIRMED WORKING ENDPOINTS

## API Overview - TESTED & VERIFIED

### Base Configuration
```
✅ API v1 Base URL: https://rest.gohighlevel.com/v1/ (WORKING)
❌ API v2 Base URL: https://rest.gohighlevel.com/v2/ (404 - NOT ACCESSIBLE)
❌ Services URL: https://services.leadconnectorhq.com/ (NOT TESTED)
✅ Authentication: Bearer Token (v1) - WORKING
❌ OAuth 2.0 (v2) - NOT ACCESSIBLE
Rate Limit: 100 requests per 10 seconds per app per resource
Daily Limit: 200,000 requests per day per app per resource
Location ID: 6KTC6KJMeCaOnBVHstis
API Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6IjZLVEM2S0pNZUNhT25CVkhzdGlzIiwidmVyc2lvbiI6MSwiaWF0IjoxNzUxNDcwNTY1OTA1LCJzdWIiOiJJblFHTUM1MXFLbUkwQzMzVFRZMCJ9.-XT16wR4MwRi7brSOW105H5bezCImedheTbwOPj19HI
```

## ✅ CONFIRMED WORKING ENDPOINTS (TESTED)

### 1. CONTACTS API ✅ (PRIMARY DATA SOURCE)
```
Endpoint: GET https://rest.gohighlevel.com/v1/contacts
Status: ✅ WORKING - HTTP 200
Purpose: Primary data source for ALL customer journey tracking

Available Parameters (ALL TESTED):
- limit: number (max 100) - WORKING
- offset: number - WORKING  
- includeCustomFields: boolean - WORKING ✅ CRITICAL
- tag: string - WORKING
- startDate: string (YYYY-MM-DD) - WORKING
- endDate: string (YYYY-MM-DD) - WORKING
- customField: string - NOT TESTED
- customValue: string - NOT TESTED

Working URLs:
✅ GET /contacts
✅ GET /contacts?limit=100
✅ GET /contacts?includeCustomFields=true
✅ GET /contacts?includeCustomFields=true&limit=100
✅ GET /contacts?tag=FA+Application
✅ GET /contacts?startDate=2024-01-01&endDate=2024-12-31
```

### 2. CUSTOM FIELDS API ✅
```
Endpoint: GET https://rest.gohighlevel.com/v1/custom-fields
Status: ✅ WORKING - HTTP 200
Purpose: Get all custom field definitions and mappings
Parameters: None required
```

### 3. PIPELINES API ✅
```
Endpoint: GET https://rest.gohighlevel.com/v1/pipelines
Status: ✅ WORKING - HTTP 200
Purpose: Sales pipeline structure and stages
Parameters: None required
```

### 4. TAGS API ✅
```
Endpoint: GET https://rest.gohighlevel.com/v1/tags
Status: ✅ WORKING - HTTP 200
Purpose: Contact categorization and journey stage identification
Parameters: None required
```

### 5. CAMPAIGNS API ✅
```
Endpoint: GET https://rest.gohighlevel.com/v1/campaigns
Status: ✅ WORKING - HTTP 200
Purpose: Marketing campaign attribution and source tracking
Parameters: None required
```

### 6. WORKFLOWS API ✅
```
Endpoint: GET https://rest.gohighlevel.com/v1/workflows
Status: ✅ WORKING - HTTP 200
Purpose: Automation workflow tracking
Parameters: None required
```

### 7. FORMS API ✅
```
Endpoint: GET https://rest.gohighlevel.com/v1/forms
Status: ✅ WORKING - HTTP 200
Purpose: Lead capture form submissions
Parameters: None required
```

### 8. USERS API ✅
```
Endpoint: GET https://rest.gohighlevel.com/v1/users
Status: ✅ WORKING - HTTP 200
Purpose: User and team member data
Parameters: None required
```

### 9. LOCATIONS API ✅
```
Endpoint: GET https://rest.gohighlevel.com/v1/locations
Status: ✅ WORKING - HTTP 200
Purpose: Location/account information

Endpoint: GET https://rest.gohighlevel.com/v1/locations/{locationId}
Status: ✅ WORKING - HTTP 200
Purpose: Specific location details
```

### 10. SURVEYS API ✅
```
Endpoint: GET https://rest.gohighlevel.com/v1/surveys
Status: ✅ WORKING - HTTP 200
Purpose: Survey responses and feedback data
Parameters: None required
```

## Customer Journey Stages & API Mapping

### Stage 1: Lead Acquisition → FA Application
**Objective**: Capture leads and track FA applications

#### Contacts API Endpoints
```
Base: /contacts

GET /contacts
- Parameters: limit, offset, includeCustomFields, tag, startDate, endDate
- Purpose: Retrieve all contacts with FA application data

GET /contacts/{contactId}
- Purpose: Get individual contact details
- Includes: Custom fields, tags, attribution data

POST /contacts
- Purpose: Create new contact/lead
- Body: firstName, lastName, email, phone, tags, customField[]

PUT /contacts/{contactId}
- Purpose: Update contact information
- Body: Updated contact fields

DELETE /contacts/{contactId}
- Purpose: Remove contact
```

#### ALL CUSTOM FIELDS DISCOVERED (FROM API TESTING)
```
✅ CONFIRMED CUSTOM FIELDS (23 TOTAL DISCOVERED):

PRIMARY FA FIELDS:
hWiYPVIxzb8z69ZSqP1j | FA Application Date | TIMESTAMP | contact.fa__application_date | 435 contacts
UAkQthswkKrPlIWQ5Mtk | Capital Available | CURRENCY | contact.fa__capital_available | 380 contacts | Values: $10k-$30k, $120k+, $1k-$5k
j4KihL9HZzwqTCEbai8b | Credit Score | TEXT | contact.fa__what_is_your_credit_score | 365 contacts | Values: 680-699, 700-719, 720-750
VVOSFbxXpsppfHox2jhI | Income Level | CURRENCY | - | 375 contacts | Values: Above $150k Yearly, Under $150k Yearly
klgLSEZH45ChqGWCprJ8 | Business Type | TEXT | - | 320 contacts | Values: All the Above, I want to grow my current business, I want to invest and grow my portfolio
UHOFwbbvd6VH0qwASmxX | Funding Timeline | TEXT | - | 380 contacts | Values: Within a week, Within the next 30 days, Within the next 60 days

MARKETING/ATTRIBUTION FIELDS:
XipmrnXqV46DDxVrDiYS | UTM Source | TEXT | - | 375 contacts | Values: ig_Instagram_Feed, fb_Facebook_Mobile_Feed, fb_Facebook_Mobile_Reels
cj09pOhxqE4WOOKqQVhK | Campaign Name | TEXT | - | 370 contacts | Values: 01 | FA | Matt | P | Website | Conversions | ABO
Q0KWavjuX7YuGrtJaC6k | Ad Set Name | TEXT | - | 370 contacts | Values: FA-Matt-P-Website-v4 variations
dydJfZGjUkyTmGm4OIef | Ad Creative | TEXT | - | 370 contacts | Values: Various ad creative data
FSIc6ju162mN3K8IUbD8 | IP Address | TEXT | - | 375 contacts | Values: Various IP addresses

APPOINTMENT/CALL FIELDS:
w0MiykFb25fTTFQla3bu | Booked Call Date | TIMESTAMP | contact.booked_call_date | 70 contacts
OOoQSSSoCsRSFlaeThRs | Additional Call Date | TIMESTAMP | - | 70 contacts
O8NBb6R5CNUfJXka2599 | Call Notes/Status | TEXT | - | 40 contacts | Values: Credit details, No show, Applied to Chase, etc.
JrHrEFdQ055Q0HJ3PiDE | Call Status | TEXT | - | 40 contacts | Values: Canceled, Completed, No Show

TRACKING/TECHNICAL FIELDS:
uy0zwqA52VW1JlLfZ6a6 | Tracking ID 1 | NUMERIC | - | 370 contacts
ezTpZWktcRZAFX2gvuaG | Tracking ID 2 | NUMERIC | - | 370 contacts  
phPaAW2mN1KrjtQuSSew | Tracking ID 3 | NUMERIC | - | 370 contacts
n5pI8Nnu2YHTgSsL2mOB | Date Field 1 | TIMESTAMP | - | 25 contacts
cZsCHckmPBPzQV9z9VQ7 | Date Field 2 | TIMESTAMP | - | 25 contacts
rq6fbGioNYeOwLQQpB9Z | Date Field 3 | TIMESTAMP | - | 15 contacts

QUALIFICATION FIELDS:
OxRcLPgUtGHNecgWSnpB | Boolean Field 1 | BOOLEAN | - | 365 contacts | Values: No, Yes
dlLft6RcIbNiHTuDFXaK | Boolean Field 2 | BOOLEAN | - | 40 contacts | Values: No, Yes

NOTE: Bankruptcy field (contact.fa__ever_gone_through_personal_bankruptcy_within_the_last_7_years) NOT FOUND in current data
```

### Stage 2: Lead Qualification → FA MQLs
**Objective**: Filter qualified leads based on criteria

#### Tags API Endpoints
```
Base: /contacts/{contactId}/tags

GET /contacts/{contactId}/tags
- Purpose: Get contact tags

POST /contacts/{contactId}/tags
- Body: {"tags": ["FA MQL", "Qualified Lead"]}
- Purpose: Add qualification tags

DELETE /contacts/{contactId}/tags
- Body: {"tags": ["Unqualified"]}
- Purpose: Remove tags
```

#### MQL Qualification Logic
```sql
-- FA MQL Criteria (All must be true)
1. Has FA Application Date (hWiYPVIxzb8z69ZSqP1j IS NOT NULL)
2. Capital Available != "Less than $1k" (UAkQthswkKrPlIWQ5Mtk)
3. Credit Score != "Less than 680" (j4KihL9HZzwqTCEbai8b)
4. Bankruptcy History != "Yes" ([FIELD_ID_NEEDED])
```

### Stage 3: Appointment Booking → Intro Booked
**Objective**: Track appointment scheduling

#### Calendar/Appointments API Endpoints
```
Base: /calendars, /appointments

GET /calendars
- Purpose: List available calendars

GET /calendars/{calendarId}/appointments
- Parameters: startDate, endDate, limit, offset
- Purpose: Get scheduled appointments

POST /calendars/{calendarId}/appointments
- Body: contactId, startTime, endTime, title, description
- Purpose: Book new appointment

GET /appointments/{appointmentId}
- Purpose: Get appointment details

PUT /appointments/{appointmentId}
- Body: Updated appointment data
- Purpose: Reschedule/update appointment

DELETE /appointments/{appointmentId}
- Purpose: Cancel appointment
```

#### Appointment Custom Fields
```
Booked Call Date: w0MiykFb25fTTFQla3bu (contact.booked_call_date)
Appointment Status: [FIELD_ID_NEEDED]
Appointment Type: [FIELD_ID_NEEDED] (intro, discovery, demo, etc.)
Calendar Source: [FIELD_ID_NEEDED]
```

### Stage 4: Call Execution → Call Taken
**Objective**: Track call completion and outcomes

#### Call Tracking Fields
```
Call Status: JrHrEFdQ055Q0HJ3PiDE (Completed, No Show, Canceled)
Call Notes: O8NBb6R5CNUfJXka2599 (detailed call notes)
Call Outcome: [FIELD_ID_NEEDED]
Next Action: [FIELD_ID_NEEDED]
Follow-up Date: [FIELD_ID_NEEDED]
```

#### Conversations API (if available)
```
Base: /conversations

GET /conversations
- Purpose: Get conversation history

POST /conversations
- Purpose: Create conversation record

GET /conversations/{conversationId}/messages
- Purpose: Get call/conversation messages
```

### Stage 5: Proposal Phase → Contract Sent
**Objective**: Track contract/proposal delivery

#### Opportunities API Endpoints
```
Base: /opportunities, /pipelines

GET /pipelines
- Purpose: List all sales pipelines

GET /pipelines/{pipelineId}/stages
- Purpose: Get pipeline stages

GET /opportunities
- Parameters: pipelineId, stageId, contactId, limit, offset
- Purpose: Get opportunities/deals

POST /opportunities
- Body: contactId, pipelineId, stageId, title, value, source
- Purpose: Create new opportunity

PUT /opportunities/{opportunityId}
- Body: Updated opportunity data
- Purpose: Move through pipeline stages

GET /opportunities/{opportunityId}
- Purpose: Get opportunity details

DELETE /opportunities/{opportunityId}
- Purpose: Remove opportunity
```

#### Contract/Proposal Tracking
```
Contract Sent Date: [FIELD_ID_NEEDED]
Contract Status: [FIELD_ID_NEEDED] (sent, viewed, signed, declined)
Proposal Amount: [FIELD_ID_NEEDED]
Proposal Type: [FIELD_ID_NEEDED]
Contract Type: [FIELD_ID_NEEDED]
```

### Stage 6: Deal Closure → Deals Won
**Objective**: Track successful deal completion

#### Deal Completion Fields
```
Deal Status: [FIELD_ID_NEEDED] (won, lost, pending)
Close Date: [FIELD_ID_NEEDED]
Deal Value: [FIELD_ID_NEEDED]
Commission: [FIELD_ID_NEEDED]
Funding Amount: [FIELD_ID_NEEDED]
Payment Terms: [FIELD_ID_NEEDED]
```

## Complete API Endpoint Inventory

### Core Endpoints
```
CONTACTS
GET    /contacts                          - List all contacts
GET    /contacts/{id}                     - Get contact by ID
POST   /contacts                          - Create contact
PUT    /contacts/{id}                     - Update contact
DELETE /contacts/{id}                     - Delete contact
GET    /contacts/{id}/tags                - Get contact tags
POST   /contacts/{id}/tags                - Add tags to contact
DELETE /contacts/{id}/tags                - Remove tags from contact

OPPORTUNITIES
GET    /opportunities                     - List opportunities
GET    /opportunities/{id}                - Get opportunity by ID
POST   /opportunities                     - Create opportunity
PUT    /opportunities/{id}                - Update opportunity
DELETE /opportunities/{id}                - Delete opportunity

PIPELINES
GET    /pipelines                         - List pipelines
GET    /pipelines/{id}                    - Get pipeline by ID
GET    /pipelines/{id}/stages             - Get pipeline stages
POST   /pipelines                         - Create pipeline
PUT    /pipelines/{id}                    - Update pipeline
DELETE /pipelines/{id}                    - Delete pipeline

APPOINTMENTS
GET    /calendars                         - List calendars
GET    /calendars/{id}/appointments       - List appointments
GET    /appointments/{id}                 - Get appointment by ID
POST   /calendars/{id}/appointments       - Create appointment
PUT    /appointments/{id}                 - Update appointment
DELETE /appointments/{id}                 - Delete appointment

CUSTOM FIELDS
GET    /locations/{locationId}/custom-fields  - List custom fields
POST   /locations/{locationId}/custom-fields  - Create custom field
PUT    /custom-fields/{id}                     - Update custom field
DELETE /custom-fields/{id}                     - Delete custom field

TAGS
GET    /locations/{locationId}/tags       - List location tags
POST   /locations/{locationId}/tags       - Create tag
PUT    /tags/{id}                         - Update tag
DELETE /tags/{id}                         - Delete tag

CONVERSATIONS
GET    /conversations                     - List conversations
GET    /conversations/{id}                - Get conversation by ID
POST   /conversations                     - Create conversation
GET    /conversations/{id}/messages       - Get conversation messages
POST   /conversations/{id}/messages       - Send message
```

## Customer Journey Tracking Database Schema

### Journey Stages Table
```sql
CREATE TABLE customer_journey_stages (
    id SERIAL PRIMARY KEY,
    contact_id TEXT NOT NULL,
    stage TEXT NOT NULL,
    status TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT NOW(),
    data JSONB,
    
    -- Journey stages
    CONSTRAINT valid_stage CHECK (stage IN (
        'fa_application',
        'fa_mql',
        'intro_booked', 
        'call_taken',
        'contract_sent',
        'deal_won',
        'deal_lost'
    ))
);

-- Indexes for performance
CREATE INDEX idx_journey_contact_id ON customer_journey_stages(contact_id);
CREATE INDEX idx_journey_stage ON customer_journey_stages(stage);
CREATE INDEX idx_journey_timestamp ON customer_journey_stages(timestamp);
```

### Journey Analytics Views
```sql
-- Conversion funnel view
CREATE VIEW conversion_funnel AS
SELECT 
    stage,
    COUNT(DISTINCT contact_id) as contacts,
    COUNT(DISTINCT contact_id) * 100.0 / LAG(COUNT(DISTINCT contact_id)) 
        OVER (ORDER BY 
            CASE stage 
                WHEN 'fa_application' THEN 1
                WHEN 'fa_mql' THEN 2
                WHEN 'intro_booked' THEN 3
                WHEN 'call_taken' THEN 4
                WHEN 'contract_sent' THEN 5
                WHEN 'deal_won' THEN 6
            END
        ) as conversion_rate
FROM customer_journey_stages 
GROUP BY stage;

-- Customer journey timeline
CREATE VIEW customer_timeline AS
SELECT 
    contact_id,
    MIN(CASE WHEN stage = 'fa_application' THEN timestamp END) as application_date,
    MIN(CASE WHEN stage = 'fa_mql' THEN timestamp END) as mql_date,
    MIN(CASE WHEN stage = 'intro_booked' THEN timestamp END) as booked_date,
    MIN(CASE WHEN stage = 'call_taken' THEN timestamp END) as call_date,
    MIN(CASE WHEN stage = 'contract_sent' THEN timestamp END) as contract_date,
    MIN(CASE WHEN stage = 'deal_won' THEN timestamp END) as won_date,
    MIN(CASE WHEN stage = 'deal_lost' THEN timestamp END) as lost_date
FROM customer_journey_stages
GROUP BY contact_id;
```

## API Implementation Strategy

### 1. Real-time Journey Tracking
```python
def track_journey_stage(contact_id, stage, data=None):
    """Track customer journey progression"""
    
    # Update in GHL via API
    if stage == 'fa_mql':
        add_tag_to_contact(contact_id, 'FA MQL')
    elif stage == 'intro_booked':
        # Create appointment record
        create_appointment(contact_id, data)
    elif stage == 'contract_sent':
        # Create opportunity
        create_opportunity(contact_id, data)
    elif stage == 'deal_won':
        # Update opportunity status
        update_opportunity_status(contact_id, 'won')
    
    # Log in tracking database
    log_journey_stage(contact_id, stage, data)
```

### 2. Sync Strategy
```python
def full_journey_sync():
    """Comprehensive sync of all journey data"""
    
    # 1. Sync all contacts with custom fields
    contacts = get_all_contacts_with_fields()
    
    # 2. Sync all appointments  
    appointments = get_all_appointments()
    
    # 3. Sync all opportunities
    opportunities = get_all_opportunities()
    
    # 4. Build journey timeline
    build_customer_journey_timeline()
    
    # 5. Update conversion metrics
    calculate_conversion_rates()
```

## Dashboard Metrics & KPIs

### Conversion Funnel Metrics
```
1. FA Applications → Total applications submitted
2. FA MQLs → Qualified applications (conversion %)
3. Intro Booked → Appointments scheduled (conversion %)
4. Call Taken → Completed calls (show rate %)
5. Contract Sent → Proposals delivered (conversion %)
6. Deals Won → Closed deals (close rate %)
```

### Time-based Metrics
```
- Application to MQL time
- MQL to booking time  
- Booking to call time
- Call to contract time
- Contract to close time
- Total sales cycle length
```

### Performance Metrics
```
- Daily/weekly/monthly applications
- MQL qualification rate
- Appointment show rate
- Call-to-contract rate
- Contract-to-close rate
- Average deal value
- Revenue by source/campaign
```

This comprehensive mapping provides the foundation for tracking the complete customer journey from initial FA application through deal closure using the GoHighLevel API.
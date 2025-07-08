# GHL Complete API Mapping for Dashboard

## API Base Configuration

```
Base URL: https://rest.gohighlevel.com/v1
Authentication: Bearer Token
Rate Limit: 100 requests per 10 seconds per location
Location ID: 6KTC6KJMeCaOnBVHstis
```

## 1. Contact Endpoints

### GET /contacts
Fetch all contacts with complete data

**Query Parameters:**
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| limit | number | Max records per page (max 100) | 100 |
| offset | number | Pagination offset | 0 |
| includeCustomFields | boolean | Include custom field data | true |
| includeDetails | boolean | Include additional contact details | true |
| tag | string | Filter by specific tag | "FA Application" |
| startDate | string | Filter by date range start | "2024-01-01" |
| endDate | string | Filter by date range end | "2024-12-31" |
| customField | string | Filter by custom field name | "FA Application Date" |
| customValue | string | Filter by custom field value | "2024-01-15" |

### GET /contacts/{contactId}
Get single contact details

### POST /contacts
Create new contact

### PUT /contacts/{contactId}
Update existing contact

### DELETE /contacts/{contactId}
Delete contact

## 2. Custom Fields Endpoint

### GET /locations/{locationId}/custom-fields
Get all custom field definitions

## 3. Complete Contact Data Structure

```json
{
  "id": "string",
  "locationId": "string",
  "contactName": "string",
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "phone": "string",
  "type": "lead|customer",
  "source": "string",
  "dateAdded": "ISO 8601 timestamp",
  "dateUpdated": "ISO 8601 timestamp",
  "dateOfBirth": "YYYY-MM-DD",
  "address1": "string",
  "city": "string",
  "state": "string",
  "country": "string",
  "postalCode": "string",
  "website": "string",
  "timezone": "string",
  "dnd": boolean,
  "dndSettings": {
    "Call": {
      "status": "active|inactive",
      "message": "string"
    },
    "Email": {
      "status": "active|inactive",
      "message": "string"
    },
    "SMS": {
      "status": "active|inactive",
      "message": "string"
    },
    "WhatsApp": {
      "status": "active|inactive",
      "message": "string"
    }
  },
  "tags": ["string"],
  "customField": [
    {
      "id": "string",
      "value": "string"
    }
  ],
  "assignedTo": "string",
  "attributions": [
    {
      "source": "string",
      "medium": "string",
      "campaign": "string",
      "term": "string",
      "content": "string",
      "date": "ISO 8601 timestamp"
    }
  ]
}
```

## 4. Complete Custom Fields Mapping

| Field ID | Field Name | Field Key | Data Type | Description |
|----------|------------|-----------|-----------|-------------|
| hWiYPVIxzb8z69ZSqP1j | FA \| Application Date | contact.fa__application_date | DATE | Funding application submission date |
| w0MiykFb25fTTFQla3bu | Booked Call Date | contact.booked_call_date | DATE | When call was booked |
| XipmrnXqV46DDxVrDiYS | UTM Source | - | TEXT | Traffic source |
| VVOSFbxXpsppfHox2jhI | Income Level | - | TEXT | Income bracket |
| j4KihL9HZzwqTCEbai8b | Credit Score | - | TEXT | Credit score range |
| UAkQthswkKrPlIWQ5Mtk | Credit Card Debt | - | TEXT | CC debt amount |
| UHOFwbbvd6VH0qwASmxX | Funding Timeline | - | TEXT | When funding needed |
| Q0KWavjuX7YuGrtJaC6k | Ad Set Name | - | TEXT | Facebook ad set |
| cj09pOhxqE4WOOKqQVhK | Campaign Name | - | TEXT | Marketing campaign |
| klgLSEZH45ChqGWCprJ8 | Business Type | - | TEXT | Type of business |
| FSIc6ju162mN3K8IUbD8 | IP Address | - | TEXT | Contact IP address |

## 5. Common Tags in System

Based on the codebase analysis, here are typical tags used:
- FA Application
- Booked Call
- Lead
- Customer
- Qualified
- Not Qualified
- Follow Up
- Hot Lead
- Cold Lead
- Funding Approved
- Funding Denied

## 6. Proposed Database Schema for Dashboard

### Master Contact Table
```sql
CREATE TABLE ghl_contacts (
    id TEXT PRIMARY KEY,
    location_id TEXT,
    contact_name TEXT,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    phone TEXT,
    type TEXT,
    source TEXT,
    date_added TIMESTAMP,
    date_updated TIMESTAMP,
    date_of_birth DATE,
    address1 TEXT,
    city TEXT,
    state TEXT,
    country TEXT,
    postal_code TEXT,
    website TEXT,
    timezone TEXT,
    dnd BOOLEAN,
    dnd_settings JSONB,
    tags TEXT[],
    assigned_to TEXT,
    attributions JSONB,
    custom_fields JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Tag-Specific Tables (One per tag)
```sql
-- Example: FA Application Tag Table
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

-- Similar tables for each tag:
-- tag_booked_call
-- tag_lead
-- tag_customer
-- tag_qualified
-- tag_not_qualified
-- tag_follow_up
-- tag_hot_lead
-- tag_cold_lead
-- tag_funding_approved
-- tag_funding_denied
```

### Custom Fields Lookup Table
```sql
CREATE TABLE ghl_custom_fields (
    field_id TEXT PRIMARY KEY,
    field_name TEXT,
    field_key TEXT,
    data_type TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## 7. Sync Strategy

### Full Sync Process
1. Fetch all contacts with `includeCustomFields=true`
2. Process in batches of 100 (pagination)
3. For each contact:
   - Insert/update master contact table
   - For each tag the contact has:
     - Insert/update corresponding tag table
   - Store complete custom fields JSON

### Incremental Sync
1. Use `startDate` and `endDate` parameters
2. Sync only contacts modified since last sync
3. Track last sync timestamp

### Real-time Sync (Future)
- Implement webhooks when available
- Currently must poll API at intervals

## 8. API Response Handling

### Success Response
```json
{
  "contacts": [...],
  "total": 1234,
  "page": 1,
  "pageSize": 100
}
```

### Error Handling
- 401: Invalid API key
- 404: Resource not found
- 429: Rate limit exceeded
- 500: Server error

## 9. Implementation Notes

1. **No SmartList API**: Must fetch all contacts and filter locally
2. **Rate Limiting**: Implement exponential backoff
3. **Date Fields**: Stored as millisecond timestamps, convert to readable dates
4. **Pagination**: Required for large datasets
5. **Custom Fields**: Must match by ID, not name

## 10. Dashboard Requirements

### Data Points to Track
- Total contacts by tag
- Applications by date
- Conversion rates (lead to customer)
- Campaign performance
- Geographic distribution
- Time-based trends

### Refresh Strategy
- Full sync: Daily at 2 AM
- Incremental sync: Every 30 minutes
- On-demand sync: Via dashboard button
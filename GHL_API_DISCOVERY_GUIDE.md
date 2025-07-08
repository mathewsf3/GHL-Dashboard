# GoHighLevel API Discovery Guide

## Overview
This document outlines the process of discovering and accessing GoHighLevel (GHL) data through their API, specifically for syncing SmartList-like data when direct SmartList API endpoints are not available.

## Discovery Process

### 1. Initial Investigation
**Goal**: Determine if GHL exposes SmartList/Views through their API

**What we tried**:
- Tested multiple endpoint variations for smart lists:
  - `/smart_lists/{id}`
  - `/smart-lists/{id}`
  - `/smartlists/{id}`
  - `/locations/{locationId}/smart_lists/{id}`
  - `/contacts/smart_list/{id}`

**Result**: No direct SmartList API endpoints found (all returned 404)

### 2. API Structure Discovery
**Goal**: Understand GHL's API structure and available endpoints

**Key findings**:
- Base URL: `https://rest.gohighlevel.com/v1`
- Authentication: Bearer token in Authorization header
- Main endpoints available:
  - `/contacts` - Contact management
  - `/custom-fields` - Custom field definitions
  - `/locations` - Location information

### 3. Custom Fields Discovery
**Goal**: Find how SmartList criteria are stored

**Process**:
1. Fetched custom field definitions using `/custom-fields` endpoint
2. Discovered custom fields are defined with:
   - `id`: Unique identifier (e.g., `hWiYPVIxzb8z69ZSqP1j`)
   - `name`: Human-readable name (e.g., "FA | Application Date")
   - `fieldKey`: System key (e.g., `contact.fa__application_date`)
   - `dataType`: Field type (DATE, TEXT, etc.)

**Key discovery for FA Applications**:
```json
{
  "id": "hWiYPVIxzb8z69ZSqP1j",
  "name": "FA | Application Date",
  "fieldKey": "contact.fa__application_date",
  "dataType": "DATE"
}
```

### 4. Contact Data Structure
**Goal**: Understand how custom fields are stored in contacts

**Findings**:
- Custom fields are stored in the `customField` array within each contact
- Each custom field entry contains:
  - `id`: The field ID
  - `value`: The field value (dates stored as timestamps)

**Example**:
```json
{
  "id": "contact-id",
  "email": "example@email.com",
  "customField": [
    {
      "id": "hWiYPVIxzb8z69ZSqP1j",
      "value": "1751328000000"  // Timestamp for date
    }
  ]
}
```

## Solution Approach

### Recreating SmartList Functionality
Since SmartLists aren't directly accessible via API, we recreate their functionality by:

1. **Fetch all contacts** with custom fields included:
   ```python
   params = {
       "includeCustomFields": "true",
       "limit": 100,
       "offset": 0
   }
   ```

2. **Filter locally** based on SmartList criteria:
   - For FA Applications: Filter contacts where `customField` contains the FA Application Date field with a value

3. **Process and export** the filtered data

## Implementation Steps

### Step 1: Identify Custom Field IDs
```python
# Get custom field definitions
response = requests.get(
    "https://rest.gohighlevel.com/v1/custom-fields",
    headers={"Authorization": f"Bearer {API_KEY}"}
)
```

### Step 2: Fetch Contacts with Custom Fields
```python
# Fetch contacts with custom fields
params = {
    "limit": 100,
    "offset": 0,
    "includeCustomFields": "true"
}
response = requests.get(
    "https://rest.gohighlevel.com/v1/contacts",
    headers=headers,
    params=params
)
```

### Step 3: Filter Based on Custom Field
```python
# Filter for specific custom field
fa_applications = []
for contact in contacts:
    for field in contact.get('customField', []):
        if field.get('id') == 'hWiYPVIxzb8z69ZSqP1j' and field.get('value'):
            fa_applications.append(contact)
            break
```

## Discovered Custom Fields

| Field ID | Field Name | Description |
|----------|------------|-------------|
| hWiYPVIxzb8z69ZSqP1j | FA \| Application Date | Date when FA application was submitted |
| w0MiykFb25fTTFQla3bu | Booked Call Date | Date when call was booked |
| XipmrnXqV46DDxVrDiYS | UTM Source | Traffic source (ig, fb, etc.) |
| VVOSFbxXpsppfHox2jhI | Income Level | Annual income range |
| j4KihL9HZzwqTCEbai8b | Credit Score | Credit score range |
| UAkQthswkKrPlIWQ5Mtk | Credit Card Debt | Debt amount range |
| UHOFwbbvd6VH0qwASmxX | Funding Timeline | When funding is needed |

## Replicating Other SmartLists

To replicate other SmartLists/tags:

1. **Identify the criteria**:
   - Custom field values
   - Tags
   - Contact properties (type, date added, etc.)

2. **Find the field IDs**:
   ```python
   # List all custom fields
   GET /custom-fields
   ```

3. **Create filter logic**:
   - For tags: Check `contact.tags` array
   - For custom fields: Check `contact.customField` array for specific IDs and values
   - For dates: Convert timestamps (milliseconds) to dates

4. **Implement the sync**:
   - Copy the pattern from `sync_fa_applications_final.py`
   - Update the field ID and filter logic
   - Adjust export fields as needed

## API Limitations & Workarounds

### Limitations:
- No direct SmartList API access
- Must fetch all contacts and filter locally
- Rate limit: 100 requests per 10 seconds
- Pagination required for large datasets

### Workarounds:
- Batch processing with pagination
- Local filtering to simulate SmartLists
- Cache results to reduce API calls
- Use webhooks for real-time updates (if available)

## Next Steps for New SmartLists

1. **Identify SmartList criteria** in GHL UI
2. **Find corresponding field IDs** using the discovery process
3. **Update filter logic** in the sync script
4. **Test with small batches** first
5. **Export to desired format** (CSV, JSON, database)

## Tools Created

1. **ghl_api_test.py** - Initial API connection testing
2. **find_fa_fields.py** - Custom field discovery tool
3. **sync_fa_applications_final.py** - Production sync script for FA Applications

Use these as templates for syncing other SmartLists by updating the field IDs and filter criteria.
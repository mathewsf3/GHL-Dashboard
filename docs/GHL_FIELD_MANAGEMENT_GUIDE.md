# GoHighLevel Field Management Guide

## Overview

This guide explains how to manage and map GoHighLevel (GHL) custom fields in the dashboard. The system now uses a centralized field mapping configuration that makes it easy to update field mappings and add new metrics.

## Field Mapping System

### Configuration File
All field mappings are defined in: `/src/config/ghl-field-mappings.ts`

### Field Structure
Each field mapping contains:
- `id`: The GHL field ID (e.g., 'hWiYPVIxzb8z69ZSqP1j')
- `name`: Human-readable name (e.g., 'FA Application Date')
- `description`: What the field represents
- `type`: Data type ('date', 'text', 'number', 'url', 'select', 'array')
- `category`: Business category ('application', 'qualification', 'booking', 'contract', 'deal', 'tracking', 'other')

## Current Field Mappings

### Application Fields
- **FA Application Date** (`hWiYPVIxzb8z69ZSqP1j`) - Date when FA application was submitted

### Qualification Fields (MQL)
- **Capital Available** (`UAkQthswkKrPlIWQ5Mtk`) - Amount of capital available
- **Credit Score** (`j4KihL9HZzwqTCEbai8b`) - Credit score range
- **Ever Gone Through Persona** (`OxRcLPgUtGHNecgWSnpB`) - Yes/No field
- **Annual Income** (`VVOSFbxXpsppfHox2jhI`) - Income range
- **Funding Timeline** (`UHOFwbbvd6VH0qwASmxX`) - When funding is needed

### Booking/Call Fields
- **Booked Call Date** (`w0MiykFb25fTTFQla3bu`) - Date when call was booked
- **Schedule Call Date** (`OOoQSSSoCsRSFlaeThRs`) - Scheduled date for call
- **Intro Taken Date** (`rq6fbGioNYeOwLQQpB9Z`) - Date when intro call was completed

### Contract/Deal Fields
- **Contract Sent** (`J27nUfp0TcaaxaB0PFKJ`) - PandaDoc contract URL
- **Deal Value** (`8XL7uSWZ1Q4YiKZ0IbvT`) - Deal/program value text
- **Deal Won Date** (`S8vks1fHlmNBwjKKcQFV`) - Date when deal was won

### Tracking Fields
- **UTM Content** (`dydJfZGjUkyTmGm4OIef`) - Full UTM content string
- **UTM Source** (`XipmrnXqV46DDxVrDiYS`) - Traffic source
- Various Facebook ad IDs for attribution

## How to Discover New Fields

### 1. Use the Field Discovery Endpoint

```bash
# Basic discovery (analyzes 100 contacts)
curl http://localhost:3000/api/ghl/discover-fields

# Comprehensive discovery (analyzes 500+ contacts)
curl http://localhost:3000/api/ghl/discover-fields?all=true
```

This endpoint will return:
- All unique fields found
- Field usage statistics (fill rate, unique values)
- Data pattern analysis (is it a date, URL, select field, etc.)
- Recommended field types for unmapped fields

### 2. Analyze the Results

Look for:
- **High fill rate unmapped fields** - These are likely important
- **Date pattern fields** - Fields containing timestamps
- **Select pattern fields** - Fields with limited unique values
- **URL pattern fields** - Fields containing links

### 3. Add New Field Mappings

1. Open `/src/config/ghl-field-mappings.ts`
2. Add the new field to the `GHL_FIELD_MAPPINGS` array:

```typescript
{
  id: 'NEW_FIELD_ID',
  name: 'Descriptive Field Name',
  description: 'What this field represents',
  type: 'date', // or 'text', 'number', 'url', 'select', 'array'
  category: 'appropriate_category'
}
```

3. If it's a key metric field, add it to `FIELD_IDS` constant:

```typescript
export const FIELD_IDS = {
  // ... existing fields
  NEW_METRIC_NAME: 'NEW_FIELD_ID'
} as const;
```

## Business Logic for Metrics

### Applications
- Count contacts with FA Application Date in the reporting period

### MQLs (Marketing Qualified Leads)
Formula: Application + ALL of the following:
- Capital Available ≠ "Less than $1k"
- Credit Score ≠ "Less than 680"
- Ever Gone Through Persona ≠ "Yes"

### Calls Booked
Uses two approaches:
1. **Tag-based**: Looks for booking-related tags (primary method)
2. **Field-based**: Checks Booked Call Date or Schedule Call Date fields

### Contracts Sent
- Count contacts with Contract Sent field populated

### Deals Won
- Count contacts with BOTH:
  - Deal Value field populated
  - Deal Won Date in the reporting period

**Important**: Only deals with explicit Deal Won Date are counted

### Intros Taken
- Count contacts with Intro Taken Date in the reporting period

## Troubleshooting

### Field Shows as "Unknown"
- The field ID is not in the mapping configuration
- Run the field discovery endpoint to identify the field
- Add it to the configuration file

### Metric Counts Seem Wrong
1. Check field mappings are correct
2. Verify the business logic matches expectations
3. Use debug logging to see which contacts are being counted
4. Check date ranges and filtering logic

### Deal Won Count Issues
- Ensure Deal Won Date field (S8vks1fHlmNBwjKKcQFV) is populated
- Only contacts with both Deal Value AND Deal Won Date are counted
- Check the date is within the reporting period

## Best Practices

1. **Regular Field Discovery**: Run the discovery endpoint monthly to identify new fields
2. **Document Changes**: Update this guide when adding new field mappings
3. **Test Thoroughly**: After adding new fields, verify metrics are calculated correctly
4. **Use Constants**: Always use FIELD_IDS constants instead of hard-coding field IDs
5. **Maintain Categories**: Keep fields organized by business function

## API Integration Notes

- GHL API v1 returns custom fields as an array with only IDs (no names)
- Field names must be maintained in our mapping configuration
- The system gracefully handles unknown fields
- Date fields typically contain millisecond timestamps

## Future Enhancements

1. **Auto-discovery**: Scheduled job to discover new fields automatically
2. **Field Validation**: Validate field values match expected types
3. **Historical Tracking**: Track field changes over time
4. **API v2 Migration**: Update to use GHL API v2 when custom fields are supported
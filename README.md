# GoHighLevel Data Sync Tool

This tool allows you to sync contact data from GoHighLevel (GHL) with filtering capabilities similar to SmartLists/Views.

## Current Status

**SmartList API Status**: After testing, GHL does not currently expose direct API endpoints for SmartLists or Views. However, you can achieve similar functionality by:

1. **Fetching all contacts** via the `/contacts` endpoint
2. **Applying filters** locally to recreate SmartList-like views
3. **Exporting filtered data** to CSV, JSON, or SQLite database

## Features

- Fetch all contacts from your GHL account
- Filter contacts by:
  - Tags
  - Contact type (lead, customer, etc.)
  - Date added (last N days)
  - Has email/phone
- Export to multiple formats:
  - CSV (for spreadsheets)
  - JSON (for developers)
  - SQLite database (for local queries)

## Usage Examples

### Basic sync (fetch all contacts):
```bash
python ghl_data_sync.py
```

### Filter by tags and export to CSV:
```bash
python ghl_data_sync.py --filter-tags "lead" "hot" --export-csv leads.csv
```

### Get contacts added in last 7 days with email:
```bash
python ghl_data_sync.py --filter-days 7 --has-email --export-json recent_contacts.json
```

### Sync to local database for advanced queries:
```bash
python ghl_data_sync.py --sync-db
```

### Combine multiple filters:
```bash
python ghl_data_sync.py --filter-type lead --has-email --has-phone --export-csv qualified_leads.csv
```

## API Limitations

1. **No direct SmartList API**: GHL doesn't expose SmartLists via API
2. **Rate limits**: 100 requests per 10 seconds per location
3. **Pagination**: Contacts are fetched in batches of 100

## Alternative Solutions

1. **Webhooks**: Set up webhooks in GHL to receive real-time updates when contacts change
2. **Zapier/Make**: Use integration platforms that may have access to additional GHL features
3. **GHL Workflows**: Create workflows that tag contacts, then filter by tags via API

## Next Steps

1. **Schedule regular syncs** using cron or task scheduler
2. **Build custom views** by querying the SQLite database
3. **Create a web dashboard** to visualize your contact data
4. **Set up incremental sync** by tracking lastModified dates

## Support

- GHL API Docs: https://highlevel.stoplight.io/docs/integrations/
- Developer Community: https://www.gohighlevel.com/dev-slack
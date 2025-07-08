# GHL Field Quick Reference Card

## 🎯 Key Business Metrics Fields

### Applications & MQLs
```javascript
FIELD_IDS.FA_APPLICATION_DATE    // hWiYPVIxzb8z69ZSqP1j - 97.4% fill
FIELD_IDS.CAPITAL_AVAILABLE      // UAkQthswkKrPlIWQ5Mtk - 95.2% fill
FIELD_IDS.CREDIT_SCORE          // j4KihL9HZzwqTCEbai8b - 91.0% fill
FIELD_IDS.EVER_GONE_THROUGH_PERSONA // OxRcLPgUtGHNecgWSnpB - 91.0% fill
```

### Calls & Bookings
```javascript
FIELD_IDS.BOOKED_CALL_DATE      // w0MiykFb25fTTFQla3bu - 2.8% fill
FIELD_IDS.SCHEDULE_CALL_DATE    // OOoQSSSoCsRSFlaeThRs - 2.8% fill
FIELD_IDS.INTRO_TAKEN_DATE      // rq6fbGioNYeOwLQQpB9Z - 0.6% fill
```

### Deals & Contracts
```javascript
FIELD_IDS.CONTRACT_SENT         // J27nUfp0TcaaxaB0PFKJ - URL field
FIELD_IDS.DEAL_VALUE           // 8XL7uSWZ1Q4YiKZ0IbvT - Text field
FIELD_IDS.DEAL_WON_DATE        // S8vks1fHlmNBwjKKcQFV - Date field
```

### Attribution & Tracking
```javascript
FIELD_IDS.UTM_CONTENT          // dydJfZGjUkyTmGm4OIef - 86.8% fill
FIELD_IDS.UTM_SOURCE           // XipmrnXqV46DDxVrDiYS - 87.8% fill
```

## 📊 Business Logic Formulas

### MQL Qualification
```
MQL = Application Date EXISTS
  AND Capital Available ≠ "Less than $1k"
  AND Credit Score ≠ "Less than 680"  
  AND Ever Gone Through Persona ≠ "Yes"
```

### Calls Booked
```
Calls Booked = Has Booking Tags
  OR (
    (Booked Call Date IN PERIOD OR Schedule Call Date NOT EMPTY)
    AND UTM Content EXISTS
  )
```

### Deals Won
```
Deals Won = Deal Value EXISTS
  AND Deal Won Date IN PERIOD
```

## 🔍 Field Discovery Commands

```bash
# Basic field discovery (100 contacts)
curl http://localhost:3000/api/ghl/discover-fields

# Comprehensive discovery (500+ contacts)
curl http://localhost:3000/api/ghl/discover-fields?all=true

# Test dashboard metrics
curl http://localhost:3000/api/dashboard
```

## 📝 Common Field Values

### Capital Available Options
- ❌ "Less than $1k" (MQL disqualifier)
- ✅ "$1k-$5k", "$5k-$10k", "$10k-$30k", "$30k-$50k", "$50k-$80k", "$80k-$120k", "$120k+"

### Credit Score Options
- ❌ "Less than 680" (MQL disqualifier)
- ✅ "680-699", "700-719", "720-750", "751-779", "780+", "780"

### Funding Timeline Options
- "Yesterday", "Within a week", "Within the next 30 days", "Within the next 60 days"

### UTM Sources (Top)
- "ig_Instagram_Feed", "fb_Facebook_Mobile_Reels", "ig_Instagram_Reels"
- "fb_Facebook_Mobile_Feed", "ig_Instagram_Stories", "ig_Instagram_Explore"

## 🚀 Adding New Metrics

1. **Find the field**: Run discovery endpoint
2. **Map the field**: Add to `/src/config/ghl-field-mappings.ts`
3. **Use the field**: Reference via `FIELD_IDS.YOUR_FIELD_NAME`
4. **Parse values**: Use `parseFieldValue(fieldId, value)`

## ⚠️ Important Notes

- **Contract/Deal fields** have low fill rates - ensure data entry
- **Booking fields** primarily use tags, fields are secondary
- **Date fields** are millisecond timestamps
- **All field names** show as "Unknown" in GHL API responses

## 📅 Field Fill Rates

| High (>80%) | Medium (10-80%) | Low (<10%) |
|-------------|-----------------|------------|
| Application Date | Business Goals | Booking Dates |
| Qualification Fields | | Contract/Deal Fields |
| Tracking/UTM Fields | | Intro Taken Date |
| IP Address | | Notes/Status |
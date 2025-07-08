# GoHighLevel Complete Field Mapping Reference

Last Updated: January 3, 2025
Total Fields: 24 (23 mapped, 1 unmapped)

## Quick Reference Table

| Field ID | Field Name | Category | Type | Fill Rate | Purpose |
|----------|------------|----------|------|-----------|---------|
| hWiYPVIxzb8z69ZSqP1j | FA Application Date | application | date | 97.4% | Date when FA application was submitted |
| UAkQthswkKrPlIWQ5Mtk | Capital Available | qualification | select | 95.2% | Amount of capital available |
| j4KihL9HZzwqTCEbai8b | Credit Score | qualification | select | 91.0% | Credit score range |
| OxRcLPgUtGHNecgWSnpB | Ever Gone Through Persona | qualification | select | 91.0% | Has gone through persona (Yes/No) |
| VVOSFbxXpsppfHox2jhI | Annual Income | qualification | select | 95.0% | Income range |
| UHOFwbbvd6VH0qwASmxX | Funding Timeline | qualification | select | 95.2% | When funding is needed |
| w0MiykFb25fTTFQla3bu | Booked Call Date | booking | date | 2.8% | Date when call was booked |
| OOoQSSSoCsRSFlaeThRs | Schedule Call Date | booking | date | 2.8% | Scheduled date for call |
| rq6fbGioNYeOwLQQpB9Z | Intro Taken Date | booking | date | 0.6% | Date when intro call completed |
| J27nUfp0TcaaxaB0PFKJ | Contract Sent | contract | url | Low | PandaDoc contract URL |
| 8XL7uSWZ1Q4YiKZ0IbvT | Deal Value | deal | text | Low | Deal/program value |
| S8vks1fHlmNBwjKKcQFV | Deal Won Date | deal | date | Low | Date when deal was won |
| dydJfZGjUkyTmGm4OIef | UTM Content | tracking | text | 86.8% | Full UTM content string |
| XipmrnXqV46DDxVrDiYS | UTM Source | tracking | text | 87.8% | Traffic source |
| FSIc6ju162mN3K8IUbD8 | IP Address | tracking | text | 95.0% | Contact IP address |
| Q0KWavjuX7YuGrtJaC6k | Campaign Info | tracking | text | 86.8% | Campaign tracking info |
| cj09pOhxqE4WOOKqQVhK | Campaign Type | tracking | text | 86.8% | Type of campaign |
| uy0zwqA52VW1JlLfZ6a6 | Ad Account ID | tracking | text | 82.8% | Facebook ad account ID |
| ezTpZWktcRZAFX2gvuaG | Campaign ID | tracking | text | 82.0% | Facebook campaign ID |
| phPaAW2mN1KrjtQuSSew | Ad Set ID | tracking | text | 82.0% | Facebook ad set ID |
| klgLSEZH45ChqGWCprJ8 | Business Goals | other | array | 13.2% | What they want to achieve |
| dlLft6RcIbNiHTuDFXaK | Some Yes/No Field | other | select | 1.6% | Unknown Yes/No field |
| O8NBb6R5CNUfJXka2599 | Notes | other | text | 1.6% | General notes field |
| JrHrEFdQ055Q0HJ3PiDE | Status | other | text | 1.6% | Status (Completed, No Show, etc) |
| n5pI8Nnu2YHTgSsL2mOB | Date Field 1 | other | date | 1.2% | Unknown date field |
| cZsCHckmPBPzQV9z9VQ7 | Date Field 2 | other | date | 1.2% | Unknown date field |
| drXWY942Y0tIsTHG9iKb | *UNMAPPED* | - | select | 3.4% | Source/channel field |

## Field Categories Breakdown

### 1. Application Fields
Fields related to initial application submission.

#### FA Application Date (hWiYPVIxzb8z69ZSqP1j)
- **Type**: Date (timestamp)
- **Fill Rate**: 97.4% (487/500 contacts)
- **Description**: The exact date and time when a contact submitted their FA application
- **Sample Values**: Timestamps like 1751328000000 (dates in 2025)
- **Usage**: Primary metric for counting total applications

### 2. Qualification Fields (MQL Criteria)
Fields used to determine if an application becomes a Marketing Qualified Lead (MQL).

#### Capital Available (UAkQthswkKrPlIWQ5Mtk)
- **Type**: Select/Dropdown
- **Fill Rate**: 95.2% (476/500 contacts)
- **Possible Values**: 
  - "Less than $1k" (disqualifies for MQL)
  - "$1k-$5k"
  - "$5k-$10k"
  - "$10k-$30k"
  - "$30k-$50k"
  - "$50k-$80k"
  - "$80k-$120k"
  - "$120k+"
  - "Less than $15k"
- **MQL Logic**: Must NOT be "Less than $1k"

#### Credit Score (j4KihL9HZzwqTCEbai8b)
- **Type**: Select/Dropdown
- **Fill Rate**: 91.0% (455/500 contacts)
- **Possible Values**:
  - "Less than 680" (disqualifies for MQL)
  - "680-699"
  - "700-719"
  - "720-750"
  - "751-779"
  - "780+"
  - "780"
- **MQL Logic**: Must NOT be "Less than 680"

#### Ever Gone Through Persona (OxRcLPgUtGHNecgWSnpB)
- **Type**: Select (Yes/No)
- **Fill Rate**: 91.0% (455/500 contacts)
- **Possible Values**: "Yes", "No"
- **MQL Logic**: Must NOT be "Yes"

#### Annual Income (VVOSFbxXpsppfHox2jhI)
- **Type**: Select/Dropdown
- **Fill Rate**: 95.0% (475/500 contacts)
- **Possible Values**:
  - "Under $150k Yearly"
  - "Above $150k Yearly"
- **Usage**: Qualification criteria (not used in current MQL logic)

#### Funding Timeline (UHOFwbbvd6VH0qwASmxX)
- **Type**: Select/Dropdown
- **Fill Rate**: 95.2% (476/500 contacts)
- **Possible Values**:
  - "Yesterday"
  - "Within a week"
  - "Within the next 30 days"
  - "Within the next 60 days"
- **Usage**: Urgency indicator

### 3. Booking/Call Fields
Fields tracking call scheduling and completion.

#### Booked Call Date (w0MiykFb25fTTFQla3bu)
- **Type**: Date (timestamp)
- **Fill Rate**: 2.8% (14/500 contacts)
- **Description**: Date when a call was booked
- **Usage**: Part of "Calls Booked" metric calculation

#### Schedule Call Date (OOoQSSSoCsRSFlaeThRs)
- **Type**: Date (timestamp)
- **Fill Rate**: 2.8% (14/500 contacts)
- **Description**: Scheduled date for the call
- **Usage**: Part of "Calls Booked" metric (if not empty + UTM content exists)

#### Intro Taken Date (rq6fbGioNYeOwLQQpB9Z)
- **Type**: Date (timestamp)
- **Fill Rate**: 0.6% (3/500 contacts)
- **Description**: Date when intro call was completed
- **Usage**: "Intros Taken" metric

### 4. Contract/Deal Fields
Fields tracking sales pipeline progression.

#### Contract Sent (J27nUfp0TcaaxaB0PFKJ)
- **Type**: URL
- **Fill Rate**: Low (not shown in 500 sample)
- **Description**: PandaDoc contract URL
- **Sample Value**: "https://app.pandadoc.com/document/v2?token=..."
- **Usage**: "Contracts Sent" metric

#### Deal Value (8XL7uSWZ1Q4YiKZ0IbvT)
- **Type**: Text
- **Fill Rate**: Low (not shown in 500 sample)
- **Description**: Deal/program value description
- **Sample Values**: 
  - "FA $500 Deposit - $8500 Program"
  - "FA $1000 Deposit - $8500 Program"
  - "FA $5000 PIF"
- **Usage**: Identifies contacts with deals

#### Deal Won Date (S8vks1fHlmNBwjKKcQFV)
- **Type**: Date (timestamp)
- **Fill Rate**: Low (not shown in 500 sample)
- **Description**: Date when deal was won/closed
- **Usage**: "Deals Won" metric (must have both Deal Value AND Deal Won Date)

### 5. Tracking/Attribution Fields
Fields for campaign attribution and analytics.

#### UTM Content (dydJfZGjUkyTmGm4OIef)
- **Type**: Text
- **Fill Rate**: 86.8% (434/500 contacts)
- **Description**: Full UTM content string for attribution
- **Sample Format**: "Campaign | AdSet | Ad | Website | Creative | Targeting | ID"
- **Usage**: Required for call booking validation

#### UTM Source (XipmrnXqV46DDxVrDiYS)
- **Type**: Text
- **Fill Rate**: 87.8% (439/500 contacts)
- **Possible Values**:
  - "ig_Instagram_Feed"
  - "fb_Facebook_Mobile_Reels"
  - "ig_Instagram_Reels"
  - "fb_Facebook_Mobile_Feed"
  - "ig_Instagram_Stories"
  - "ig_Instagram_Explore"
  - "fa_youtube"
  - etc.

#### Campaign Info (Q0KWavjuX7YuGrtJaC6k)
- **Type**: Text
- **Fill Rate**: 86.8% (434/500 contacts)
- **Description**: Detailed campaign tracking information
- **Sample Format**: "01 | 145 | FA-Matt-P-Website-v4 | LC | Auto | Return On Investment | US | MF | 25-55 | Image Ads"

#### Campaign Type (cj09pOhxqE4WOOKqQVhK)
- **Type**: Text
- **Fill Rate**: 86.8% (434/500 contacts)
- **Description**: Type/category of campaign
- **Sample Values**: 
  - "01 | FA | Matt | P | Website | Conversions | ABO"
  - "B0 | FA | Matt | R1/R2/R3/R4 | Website-v4 | Conversions | ABO |"

#### IP Address (FSIc6ju162mN3K8IUbD8)
- **Type**: Text
- **Fill Rate**: 95.0% (475/500 contacts)
- **Description**: Contact's IP address (IPv4 and IPv6)

#### Ad Account ID (uy0zwqA52VW1JlLfZ6a6)
- **Type**: Text
- **Fill Rate**: 82.8% (414/500 contacts)
- **Value**: "586708888754645" (single value across all contacts)

#### Campaign ID (ezTpZWktcRZAFX2gvuaG)
- **Type**: Text (numeric)
- **Fill Rate**: 82.0% (410/500 contacts)
- **Description**: Facebook campaign ID
- **Unique Values**: 7 different campaigns

#### Ad Set ID (phPaAW2mN1KrjtQuSSew)
- **Type**: Text (numeric)
- **Fill Rate**: 82.0% (410/500 contacts)
- **Description**: Facebook ad set ID
- **Unique Values**: 100 different ad sets

### 6. Other Fields
Miscellaneous fields with various uses.

#### Business Goals (klgLSEZH45ChqGWCprJ8)
- **Type**: Array
- **Fill Rate**: 13.2% (66/500 contacts)
- **Possible Values**:
  - ["I want to grow my current business"]
  - ["I want to start a new business"]
  - ["All the Above"]
  - Multiple selections possible

#### Notes (O8NBb6R5CNUfJXka2599)
- **Type**: Text (long)
- **Fill Rate**: 1.6% (8/500 contacts)
- **Description**: Free-form notes about the contact
- **Usage**: Sales team notes, disqualification reasons

#### Status (JrHrEFdQ055Q0HJ3PiDE)
- **Type**: Text
- **Fill Rate**: 1.6% (8/500 contacts)
- **Possible Values**: "Completed", "No Show", "Canceled"
- **Usage**: Call/appointment status tracking

#### Unknown Date Fields
- **Date Field 1** (n5pI8Nnu2YHTgSsL2mOB) - 1.2% fill rate
- **Date Field 2** (cZsCHckmPBPzQV9z9VQ7) - 1.2% fill rate
- Purpose unclear, possibly related to follow-ups or secondary dates

### 7. Unmapped Fields
Fields discovered but not yet mapped in the configuration.

#### Unknown Source Field (drXWY942Y0tIsTHG9iKb)
- **Type**: Select
- **Fill Rate**: 3.4% (17/500 contacts)
- **Possible Values**: "fa_inm_dd", "fa_business_funding", "META"
- **Recommendation**: Map as "Lead Source" or "Channel"

## Business Metrics Calculation

### 1. Total Applications
- **Field**: FA Application Date (hWiYPVIxzb8z69ZSqP1j)
- **Logic**: Count contacts where field exists and date is in reporting period

### 2. Marketing Qualified Leads (MQLs)
- **Requirements**: Must have ALL of the following:
  1. FA Application Date in reporting period
  2. Capital Available ≠ "Less than $1k"
  3. Credit Score ≠ "Less than 680"
  4. Ever Gone Through Persona ≠ "Yes"

### 3. Calls Booked
- **Primary Method**: Tags containing booking-related keywords
- **Secondary Method**: Field-based with filter:
  - (Booked Call Date in period OR Schedule Call Date not empty) 
  - AND UTM Content exists

### 4. Intros Taken
- **Field**: Intro Taken Date (rq6fbGioNYeOwLQQpB9Z)
- **Logic**: Count contacts where date is in reporting period

### 5. Contracts Sent
- **Field**: Contract Sent (J27nUfp0TcaaxaB0PFKJ)
- **Logic**: Count contacts where field has value (URL)

### 6. Deals Won
- **Requirements**: Must have BOTH:
  1. Deal Value (8XL7uSWZ1Q4YiKZ0IbvT) field populated
  2. Deal Won Date (S8vks1fHlmNBwjKKcQFV) in reporting period

## Implementation Notes

### Adding New Fields
1. Run field discovery: `GET /api/ghl/discover-fields?all=true`
2. Identify unmapped fields with high fill rates
3. Add to `/src/config/ghl-field-mappings.ts`
4. Update FIELD_IDS constant if needed
5. Implement business logic using the mapped field

### Field Type Detection Patterns
- **Date Fields**: Values are 13-digit timestamps (milliseconds since epoch)
- **Select Fields**: Limited unique values (<20) with high usage (>10 contacts)
- **URL Fields**: Values start with "https://" or "http://"
- **Currency Fields**: Contains "$" or "k" patterns

### Data Quality Insights
- **High Fill Rate Fields** (>80%): Application, qualification, and tracking fields
- **Low Fill Rate Fields** (<5%): Booking, contract, and deal fields
- **Critical Business Fields**: FA Application Date (97.4%), Capital Available (95.2%), Credit Score (91%)

## Maintenance Schedule
- **Monthly**: Run field discovery to identify new fields
- **Quarterly**: Review field usage patterns and update mappings
- **As Needed**: Add new fields when business requirements change

## Version History
- v1.0 (Jan 3, 2025): Initial comprehensive mapping of 24 fields
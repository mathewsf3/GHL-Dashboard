#!/usr/bin/env python3
"""
Test script to verify MQL logic with the updated Liquidity Available field
"""
import requests
import json
from datetime import datetime, timedelta

GHL_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6IjZLVEM2S0pNZUNhT25CVkhzdGlzIiwidmVyc2lvbiI6MSwiaWF0IjoxNzUxNDcwNTY1OTA1LCJzdWIiOiJJblFHTUM1MXFLbUkwQzMzVFRZMCJ9.-XT16wR4MwRi7brSOW105H5bezCImedheTbwOPj19HI"

# Field IDs
FIELD_IDS = {
    'FA_APPLICATION_DATE': 'hWiYPVIxzb8z69ZSqP1j',
    'CAPITAL_AVAILABLE': 'UAkQthswkKrPlIWQ5Mtk',
    'CREDIT_SCORE': 'j4KihL9HZzwqTCEbai8b',
    'LIQUIDITY_AVAILABLE': 'PNm4pD77pFMz6JUkwbf0'
}

def fetch_contacts():
    """Fetch all contacts from GHL API using page-based pagination"""
    headers = {'Authorization': f'Bearer {GHL_API_KEY}'}
    all_contacts = []
    page = 1
    max_pages = 50  # Safety limit
    
    while page <= max_pages:
        response = requests.get(
            f'https://rest.gohighlevel.com/v1/contacts?limit=100&page={page}', 
            headers=headers,
            timeout=30
        )
        
        if response.status_code != 200:
            print(f"Error fetching contacts: {response.status_code}")
            break
            
        data = response.json()
        contacts = data.get('contacts', [])
        
        if not contacts:
            break
            
        all_contacts.extend(contacts)
        print(f"  Fetched page {page}: {len(contacts)} contacts")
        
        # If we got less than 100, we're on the last page
        if len(contacts) < 100:
            break
            
        page += 1
        
    print(f"Fetched {len(all_contacts)} total contacts")
    return all_contacts

def analyze_mqls():
    """Analyze MQL counts with the updated logic"""
    contacts = fetch_contacts()
    
    # Date range (this month - January 2025)
    end_date = datetime.now()
    start_date = datetime(end_date.year, end_date.month, 1)  # First day of current month
    
    total_contacts = len(contacts)
    total_applications = 0
    applications_in_range = 0
    mqls = 0
    
    # Tracking disqualifications
    disqualified_by_capital = 0
    disqualified_by_credit = 0
    disqualified_by_liquidity = 0
    
    # Sample MQL and disqualified contacts
    mql_examples = []
    disqualified_examples = []
    
    for contact in contacts:
        custom_fields = contact.get('customField', [])
        if not custom_fields:
            continue
            
        # Check for application
        app_field = next((f for f in custom_fields if f.get('id') == FIELD_IDS['FA_APPLICATION_DATE']), None)
        
        if app_field and app_field.get('value'):
            total_applications += 1
            app_date = datetime.fromtimestamp(int(app_field['value']) / 1000)
            
            if start_date <= app_date <= end_date:
                applications_in_range += 1
                
                # Get qualification fields
                capital_field = next((f for f in custom_fields if f.get('id') == FIELD_IDS['CAPITAL_AVAILABLE']), None)
                credit_field = next((f for f in custom_fields if f.get('id') == FIELD_IDS['CREDIT_SCORE']), None)
                liquidity_field = next((f for f in custom_fields if f.get('id') == FIELD_IDS['LIQUIDITY_AVAILABLE']), None)
                
                # Check qualifications - treat missing as qualifying
                # Only disqualify if field exists AND has disqualifying value
                has_qualifying_capital = not capital_field or capital_field.get('value') != 'Less than $1k'
                has_qualifying_credit = not credit_field or credit_field.get('value') != 'Less than 680'
                # If liquidity field is missing, treat as qualifying. Only disqualify if explicitly "Low 4 - $1,000 - $3,999"
                has_qualifying_liquidity = not liquidity_field or liquidity_field.get('value') != 'Low 4 - $1,000 - $3,999'
                
                # Track disqualifications
                if not has_qualifying_capital:
                    disqualified_by_capital += 1
                if not has_qualifying_credit:
                    disqualified_by_credit += 1
                if not has_qualifying_liquidity:
                    disqualified_by_liquidity += 1
                
                # Check if MQL
                if has_qualifying_capital and has_qualifying_credit and has_qualifying_liquidity:
                    mqls += 1
                    if len(mql_examples) < 3:
                        mql_examples.append({
                            'name': f"{contact.get('firstName', '')} {contact.get('lastName', '')}",
                            'capital': capital_field.get('value', 'N/A') if capital_field else 'Missing',
                            'credit': credit_field.get('value', 'N/A') if credit_field else 'Missing',
                            'liquidity': liquidity_field.get('value', 'N/A') if liquidity_field else 'Missing'
                        })
                else:
                    if len(disqualified_examples) < 3:
                        reasons = []
                        if not has_qualifying_capital:
                            reasons.append(f"Capital: {capital_field.get('value', 'Missing') if capital_field else 'Missing'}")
                        if not has_qualifying_credit:
                            reasons.append(f"Credit: {credit_field.get('value', 'Missing') if credit_field else 'Missing'}")
                        if not has_qualifying_liquidity:
                            reasons.append(f"Liquidity: {liquidity_field.get('value', 'Missing') if liquidity_field else 'Missing'}")
                        
                        disqualified_examples.append({
                            'name': f"{contact.get('firstName', '')} {contact.get('lastName', '')}",
                            'reasons': reasons
                        })
    
    # Print results
    print("=" * 60)
    print("MQL ANALYSIS RESULTS")
    print("=" * 60)
    print(f"Date Range: {start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')}")
    print(f"Total Contacts Analyzed: {total_contacts}")
    print(f"Total Applications: {total_applications}")
    print(f"Applications in Date Range: {applications_in_range}")
    print(f"\nMQLs Found: {mqls}")
    print(f"Expected MQLs: 21")
    print(f"Difference: {mqls - 21}")
    
    print("\n" + "-" * 40)
    print("DISQUALIFICATION BREAKDOWN")
    print("-" * 40)
    print(f"Disqualified by Capital (<$1k): {disqualified_by_capital}")
    print(f"Disqualified by Credit (<680): {disqualified_by_credit}")
    print(f"Disqualified by Liquidity (Low 4): {disqualified_by_liquidity}")
    
    print("\n" + "-" * 40)
    print("MQL EXAMPLES")
    print("-" * 40)
    for mql in mql_examples:
        print(f"Name: {mql['name']}")
        print(f"  Capital: {mql['capital']}")
        print(f"  Credit: {mql['credit']}")
        print(f"  Liquidity: {mql['liquidity']}")
        print()
    
    print("-" * 40)
    print("DISQUALIFIED EXAMPLES")
    print("-" * 40)
    for dq in disqualified_examples:
        print(f"Name: {dq['name']}")
        print(f"  Reasons: {', '.join(dq['reasons'])}")
        print()

if __name__ == "__main__":
    analyze_mqls()
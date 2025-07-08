#!/usr/bin/env python3
"""
Analyze field completeness for MQL qualification fields
"""
import requests
from datetime import datetime

GHL_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6IjZLVEM2S0pNZUNhT25CVkhzdGlzIiwidmVyc2lvbiI6MSwiaWF0IjoxNzUxNDcwNTY1OTA1LCJzdWIiOiJJblFHTUM1MXFLbUkwQzMzVFRZMCJ9.-XT16wR4MwRi7brSOW105H5bezCImedheTbwOPj19HI"

# Field IDs
FIELD_IDS = {
    'FA_APPLICATION_DATE': 'hWiYPVIxzb8z69ZSqP1j',
    'CAPITAL_AVAILABLE': 'UAkQthswkKrPlIWQ5Mtk',
    'CREDIT_SCORE': 'j4KihL9HZzwqTCEbai8b',
    'LIQUIDITY_AVAILABLE': 'PNm4pD77pFMz6JUkwbf0'
}

def analyze_completeness():
    # Fetch first 100 contacts for analysis
    headers = {'Authorization': f'Bearer {GHL_API_KEY}'}
    response = requests.get('https://rest.gohighlevel.com/v1/contacts?limit=100&page=1', headers=headers)
    
    if response.status_code != 200:
        print(f"Error: {response.status_code}")
        return
        
    contacts = response.json().get('contacts', [])
    
    # Stats
    total = len(contacts)
    has_app_date = 0
    has_capital = 0
    has_credit = 0
    has_liquidity = 0
    has_all_three = 0
    has_app_and_all = 0
    
    # Applications in this month
    start_date = datetime(2025, 1, 1)
    end_date = datetime.now()
    apps_this_month = 0
    
    for contact in contacts:
        fields = contact.get('customField', [])
        if not fields:
            continue
            
        # Check each field
        app_field = next((f for f in fields if f.get('id') == FIELD_IDS['FA_APPLICATION_DATE']), None)
        capital_field = next((f for f in fields if f.get('id') == FIELD_IDS['CAPITAL_AVAILABLE']), None)
        credit_field = next((f for f in fields if f.get('id') == FIELD_IDS['CREDIT_SCORE']), None)
        liquidity_field = next((f for f in fields if f.get('id') == FIELD_IDS['LIQUIDITY_AVAILABLE']), None)
        
        if app_field and app_field.get('value'):
            has_app_date += 1
            app_date = datetime.fromtimestamp(int(app_field['value']) / 1000)
            if start_date <= app_date <= end_date:
                apps_this_month += 1
                
        if capital_field and capital_field.get('value'):
            has_capital += 1
            
        if credit_field and credit_field.get('value'):
            has_credit += 1
            
        if liquidity_field and liquidity_field.get('value'):
            has_liquidity += 1
            
        # Check if has all three qualification fields
        if (capital_field and capital_field.get('value') and 
            credit_field and credit_field.get('value') and 
            liquidity_field and liquidity_field.get('value')):
            has_all_three += 1
            
        # Check if has application and all three
        if (app_field and app_field.get('value') and
            capital_field and capital_field.get('value') and 
            credit_field and credit_field.get('value') and 
            liquidity_field and liquidity_field.get('value')):
            has_app_and_all += 1
    
    print("FIELD COMPLETENESS ANALYSIS")
    print("=" * 50)
    print(f"Total contacts analyzed: {total}")
    print(f"\nField Population:")
    print(f"  Has Application Date: {has_app_date} ({has_app_date/total*100:.1f}%)")
    print(f"  Has Capital Available: {has_capital} ({has_capital/total*100:.1f}%)")
    print(f"  Has Credit Score: {has_credit} ({has_credit/total*100:.1f}%)")
    print(f"  Has Liquidity Available: {has_liquidity} ({has_liquidity/total*100:.1f}%)")
    print(f"\nCompleteness:")
    print(f"  Has all 3 qualification fields: {has_all_three} ({has_all_three/total*100:.1f}%)")
    print(f"  Has app date + all 3 fields: {has_app_and_all} ({has_app_and_all/total*100:.1f}%)")
    print(f"\nApplications this month: {apps_this_month}")
    
    print("\nIMPLICATION:")
    print(f"Only {has_app_and_all} contacts have complete data for MQL qualification.")
    print("Most contacts are missing Capital or Credit fields, which is why MQL count is low.")

if __name__ == "__main__":
    analyze_completeness()
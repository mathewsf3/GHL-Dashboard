#!/usr/bin/env python3
"""
Meta Marketing API to GHL Customer Journey Sync
Syncs Meta ads data with GHL customer journey tracking in Supabase
"""

import requests
import json
import os
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MetaGHLSync:
    def __init__(self):
        self.meta_access_token = "EAA5tn96zDjABO5HtIZBVpN5aMNgfq9KKjF6JCJfjRKZAxic6H9jmZASNHgNuCb8uTcuv1rjXbtBUCQOQwVwGPBVJouR3ar2C56KxY3Ul69GbQEUECQyxO9BFeXuZAlL0ZBZC6CZBTk3UH5EKYlfG4oMiodr7lbLmFv2WWUd521yTvZBGZB0hottGG3Wnx4ZCnTv4b4aOg7"
        self.meta_account_id = "act_586708888754645"
        self.ghl_api_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6IjZLVEM2S0pNZUNhT25CVkhzdGlzIiwidmVyc2lvbiI6MSwiaWF0IjoxNzUxNDcwNTY1OTA1LCJzdWIiOiJJblFHTUM1MXFLbUkwQzMzVFRZMCJ9.-XT16wR4MwRi7brSOW105H5bezCImedheTbwOPj19HI"
        self.meta_base_url = "https://graph.facebook.com/v18.0"
        self.ghl_base_url = "https://rest.gohighlevel.com/v1"
        
    def fetch_meta_campaigns(self) -> List[Dict]:
        """Fetch all Meta campaigns"""
        params = {
            'fields': 'id,name,status,objective,created_time,updated_time,start_time,stop_time,daily_budget,lifetime_budget,budget_remaining,account_id',
            'limit': 100,
            'access_token': self.meta_access_token
        }
        
        try:
            response = requests.get(f"{self.meta_base_url}/{self.meta_account_id}/campaigns", params=params)
            if response.status_code == 200:
                data = response.json()
                logger.info(f"✅ Fetched {len(data.get('data', []))} Meta campaigns")
                return data.get('data', [])
            else:
                logger.error(f"❌ Meta campaigns error: {response.text}")
                return []
        except Exception as e:
            logger.error(f"❌ Meta campaigns exception: {e}")
            return []
    
    def fetch_meta_adsets(self, campaign_ids: List[str] = None) -> List[Dict]:
        """Fetch Meta ad sets for specific campaigns or all"""
        adsets = []
        
        if campaign_ids:
            # Fetch ad sets for specific campaigns
            for campaign_id in campaign_ids:
                params = {
                    'fields': 'id,name,status,created_time,updated_time,start_time,end_time,daily_budget,lifetime_budget,targeting,campaign_id',
                    'limit': 100,
                    'access_token': self.meta_access_token
                }
                
                try:
                    response = requests.get(f"{self.meta_base_url}/{campaign_id}/adsets", params=params)
                    if response.status_code == 200:
                        data = response.json()
                        adsets.extend(data.get('data', []))
                except Exception as e:
                    logger.error(f"❌ Error fetching adsets for campaign {campaign_id}: {e}")
        else:
            # Fetch all ad sets from account
            params = {
                'fields': 'id,name,status,created_time,updated_time,start_time,end_time,daily_budget,lifetime_budget,targeting,campaign_id',
                'limit': 100,
                'access_token': self.meta_access_token
            }
            
            try:
                response = requests.get(f"{self.meta_base_url}/{self.meta_account_id}/adsets", params=params)
                if response.status_code == 200:
                    data = response.json()
                    adsets = data.get('data', [])
            except Exception as e:
                logger.error(f"❌ Error fetching all adsets: {e}")
        
        logger.info(f"✅ Fetched {len(adsets)} Meta ad sets")
        return adsets
    
    def fetch_meta_ads(self) -> List[Dict]:
        """Fetch all Meta ads"""
        params = {
            'fields': 'id,name,status,created_time,updated_time,campaign_id,adset_id,creative',
            'limit': 100,
            'access_token': self.meta_access_token
        }
        
        try:
            response = requests.get(f"{self.meta_base_url}/{self.meta_account_id}/ads", params=params)
            if response.status_code == 200:
                data = response.json()
                logger.info(f"✅ Fetched {len(data.get('data', []))} Meta ads")
                return data.get('data', [])
            else:
                logger.error(f"❌ Meta ads error: {response.text}")
                return []
        except Exception as e:
            logger.error(f"❌ Meta ads exception: {e}")
            return []
    
    def fetch_meta_insights(self, days_back: int = 30) -> List[Dict]:
        """Fetch Meta insights/performance data"""
        
        # Core performance fields that work
        fields = [
            'campaign_id', 'campaign_name', 'adset_id', 'adset_name', 
            'ad_id', 'ad_name', 'impressions', 'clicks', 'spend', 
            'reach', 'frequency', 'cpm', 'cpc', 'ctr', 'cpp',
            'date_start', 'date_stop'
        ]
        
        params = {
            'fields': ','.join(fields),
            'time_range': json.dumps({
                'since': (datetime.now() - timedelta(days=days_back)).strftime('%Y-%m-%d'),
                'until': datetime.now().strftime('%Y-%m-%d')
            }),
            'level': 'ad',
            'limit': 100,
            'access_token': self.meta_access_token
        }
        
        try:
            response = requests.get(f"{self.meta_base_url}/{self.meta_account_id}/insights", params=params)
            if response.status_code == 200:
                data = response.json()
                logger.info(f"✅ Fetched {len(data.get('data', []))} Meta insight records")
                return data.get('data', [])
            else:
                logger.error(f"❌ Meta insights error: {response.text}")
                return []
        except Exception as e:
            logger.error(f"❌ Meta insights exception: {e}")
            return []
    
    def fetch_ghl_contacts(self, include_custom_fields: bool = True) -> List[Dict]:
        """Fetch GHL contacts with custom fields"""
        params = {
            'limit': 100,
            'includeCustomFields': 'true' if include_custom_fields else 'false'
        }
        
        contacts = []
        offset = 0
        
        while True:
            params['offset'] = offset
            
            try:
                response = requests.get(
                    f"{self.ghl_base_url}/contacts",
                    params=params,
                    headers={'Authorization': f'Bearer {self.ghl_api_key}'}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    batch = data.get('contacts', [])
                    
                    if not batch:
                        break
                        
                    contacts.extend(batch)
                    offset += len(batch)
                    
                    logger.info(f"✅ Fetched {len(contacts)} GHL contacts so far...")
                    
                    # Stop if we got less than the limit (last page)
                    if len(batch) < params['limit']:
                        break
                else:
                    logger.error(f"❌ GHL contacts error: {response.text}")
                    break
                    
            except Exception as e:
                logger.error(f"❌ GHL contacts exception: {e}")
                break
        
        logger.info(f"✅ Total GHL contacts fetched: {len(contacts)}")
        return contacts
    
    def create_attribution_mapping(self, ghl_contacts: List[Dict], meta_ads: List[Dict]) -> List[Dict]:
        """Create attribution mapping between Meta ads and GHL contacts"""
        
        # Custom field mappings from our discovery
        utm_source_field = 'XipmrnXqV46DDxVrDiYS'
        campaign_name_field = 'cj09pOhxqE4WOOKqQVhK'
        adset_name_field = 'Q0KWavjuX7YuGrtJaC6k'
        utm_content_field = 'dydJfZGjUkyTmGm4OIef'  # Ad Creative/UTM Content
        
        attribution_records = []
        
        for contact in ghl_contacts:
            custom_fields = {f['id']: f['value'] for f in contact.get('customField', [])}
            
            # Extract UTM/attribution data
            utm_source = custom_fields.get(utm_source_field)
            campaign_name = custom_fields.get(campaign_name_field)
            adset_name = custom_fields.get(adset_name_field)
            utm_content = custom_fields.get(utm_content_field)
            
            if campaign_name or adset_name:
                # Try to match with Meta ads
                matched_ad = None
                
                for ad in meta_ads:
                    ad_campaign_name = ad.get('name', '')
                    ad_adset_name = ad.get('adset', {}).get('name', '') if isinstance(ad.get('adset'), dict) else ''
                    
                    # Simple name matching (can be improved with fuzzy matching)
                    if (campaign_name and campaign_name.lower() in ad_campaign_name.lower()) or \
                       (adset_name and adset_name.lower() in ad_adset_name.lower()):
                        matched_ad = ad
                        break
                
                attribution_records.append({
                    'ghl_contact_id': contact['id'],
                    'meta_campaign_id': matched_ad.get('campaign_id') if matched_ad else None,
                    'meta_adset_id': matched_ad.get('adset_id') if matched_ad else None,
                    'meta_ad_id': matched_ad.get('id') if matched_ad else None,
                    'utm_source': utm_source,
                    'utm_campaign': campaign_name,
                    'utm_content': utm_content,
                    'attribution_confidence': 'high' if matched_ad else 'low',
                    'created_at': datetime.now().isoformat()
                })
        
        logger.info(f"✅ Created {len(attribution_records)} attribution records")
        return attribution_records
    
    def calculate_customer_journey_metrics(self, ghl_contacts: List[Dict], attribution_data: List[Dict]) -> Dict:
        """Calculate customer journey metrics with Meta attribution"""
        
        # Custom field mappings
        fa_application_date_field = 'hWiYPVIxzb8z69ZSqP1j'
        capital_available_field = 'UAkQthswkKrPlIWQ5Mtk'
        credit_score_field = 'j4KihL9HZzwqTCEbai8b'
        booked_call_date_field = 'w0MiykFb25fTTFQla3bu'
        call_notes_field = 'O8NBb6R5CNUfJXka2599'
        
        metrics = {
            'total_contacts': len(ghl_contacts),
            'fa_applications': 0,
            'fa_mqls': 0,
            'intro_booked': 0,
            'calls_taken': 0,
            'by_utm_source': {},
            'by_campaign': {},
            'conversion_funnel': []
        }
        
        for contact in ghl_contacts:
            custom_fields = {f['id']: f['value'] for f in contact.get('customField', [])}
            
            # Get attribution data for this contact
            contact_attribution = next(
                (attr for attr in attribution_data if attr['ghl_contact_id'] == contact['id']), 
                None
            )
            
            utm_source = contact_attribution.get('utm_source') if contact_attribution else 'unknown'
            utm_campaign = contact_attribution.get('utm_campaign') if contact_attribution else 'unknown'
            
            # Count journey stages
            has_fa_application = bool(custom_fields.get(fa_application_date_field))
            is_mql_qualified = self._is_mql_qualified(custom_fields)
            has_booked_call = bool(custom_fields.get(booked_call_date_field))
            has_call_notes = bool(custom_fields.get(call_notes_field))
            
            if has_fa_application:
                metrics['fa_applications'] += 1
                
                # Track by UTM source
                if utm_source not in metrics['by_utm_source']:
                    metrics['by_utm_source'][utm_source] = {'applications': 0, 'mqls': 0}
                metrics['by_utm_source'][utm_source]['applications'] += 1
                
                # Track by campaign
                if utm_campaign not in metrics['by_campaign']:
                    metrics['by_campaign'][utm_campaign] = {'applications': 0, 'mqls': 0}
                metrics['by_campaign'][utm_campaign]['applications'] += 1
            
            if is_mql_qualified:
                metrics['fa_mqls'] += 1
                if utm_source in metrics['by_utm_source']:
                    metrics['by_utm_source'][utm_source]['mqls'] += 1
                if utm_campaign in metrics['by_campaign']:
                    metrics['by_campaign'][utm_campaign]['mqls'] += 1
            
            if has_booked_call:
                metrics['intro_booked'] += 1
            
            if has_call_notes:
                metrics['calls_taken'] += 1
        
        # Calculate conversion rates
        if metrics['fa_applications'] > 0:
            mql_rate = (metrics['fa_mqls'] / metrics['fa_applications']) * 100
            booking_rate = (metrics['intro_booked'] / metrics['fa_applications']) * 100
            call_rate = (metrics['calls_taken'] / metrics['fa_applications']) * 100
            
            metrics['conversion_funnel'] = [
                {'stage': 'FA Applications', 'count': metrics['fa_applications'], 'rate': 100.0},
                {'stage': 'FA MQLs', 'count': metrics['fa_mqls'], 'rate': mql_rate},
                {'stage': 'Intro Booked', 'count': metrics['intro_booked'], 'rate': booking_rate},
                {'stage': 'Calls Taken', 'count': metrics['calls_taken'], 'rate': call_rate}
            ]
        
        logger.info(f"✅ Calculated customer journey metrics: {metrics['fa_applications']} applications, {metrics['fa_mqls']} MQLs")
        return metrics
    
    def _is_mql_qualified(self, custom_fields: Dict) -> bool:
        """Check if contact meets MQL qualification criteria"""
        capital_available_field = 'UAkQthswkKrPlIWQ5Mtk'
        credit_score_field = 'j4KihL9HZzwqTCEbai8b'
        
        capital = custom_fields.get(capital_available_field, '')
        credit = custom_fields.get(credit_score_field, '')
        
        return (
            capital and capital != 'Less than $1k' and
            credit and credit != 'Less than 680'
            # Note: Bankruptcy field not found in current data
        )
    
    def full_sync(self) -> Dict:
        """Perform complete Meta-GHL sync and analysis"""
        logger.info("🔄 Starting full Meta-GHL sync...")
        
        # 1. Fetch Meta data
        logger.info("📊 Fetching Meta advertising data...")
        meta_campaigns = self.fetch_meta_campaigns()
        meta_adsets = self.fetch_meta_adsets()
        meta_ads = self.fetch_meta_ads()
        meta_insights = self.fetch_meta_insights()
        
        # 2. Fetch GHL data
        logger.info("👥 Fetching GHL contacts data...")
        ghl_contacts = self.fetch_ghl_contacts()
        
        # 3. Create attribution mapping
        logger.info("🔗 Creating attribution mapping...")
        attribution_data = self.create_attribution_mapping(ghl_contacts, meta_ads)
        
        # 4. Calculate metrics
        logger.info("📈 Calculating customer journey metrics...")
        journey_metrics = self.calculate_customer_journey_metrics(ghl_contacts, attribution_data)
        
        # 5. Prepare sync results
        sync_results = {
            'sync_timestamp': datetime.now().isoformat(),
            'meta_data': {
                'campaigns': len(meta_campaigns),
                'adsets': len(meta_adsets),
                'ads': len(meta_ads),
                'insights_records': len(meta_insights)
            },
            'ghl_data': {
                'contacts': len(ghl_contacts)
            },
            'attribution': {
                'mappings_created': len(attribution_data)
            },
            'journey_metrics': journey_metrics,
            'raw_data': {
                'meta_campaigns': meta_campaigns,
                'meta_adsets': meta_adsets,
                'meta_ads': meta_ads,
                'meta_insights': meta_insights,
                'ghl_contacts': ghl_contacts,
                'attribution_data': attribution_data
            }
        }
        
        # 6. Save results
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'meta_ghl_sync_{timestamp}.json'
        
        with open(filename, 'w') as f:
            json.dump(sync_results, f, indent=2, default=str)
        
        logger.info(f"✅ Full sync complete! Results saved to {filename}")
        
        # 7. Print summary
        print("\n" + "="*80)
        print("META-GHL SYNC SUMMARY")
        print("="*80)
        print(f"📊 Meta Data:")
        print(f"   - Campaigns: {len(meta_campaigns)}")
        print(f"   - Ad Sets: {len(meta_adsets)}")
        print(f"   - Ads: {len(meta_ads)}")
        print(f"   - Insight Records: {len(meta_insights)}")
        print(f"\n👥 GHL Data:")
        print(f"   - Contacts: {len(ghl_contacts)}")
        print(f"\n🔗 Attribution:")
        print(f"   - Mappings Created: {len(attribution_data)}")
        print(f"\n📈 Customer Journey:")
        print(f"   - FA Applications: {journey_metrics['fa_applications']}")
        print(f"   - FA MQLs: {journey_metrics['fa_mqls']}")
        print(f"   - Intro Booked: {journey_metrics['intro_booked']}")
        print(f"   - Calls Taken: {journey_metrics['calls_taken']}")
        
        if journey_metrics['by_utm_source']:
            print(f"\n🎯 Top UTM Sources:")
            for source, data in list(journey_metrics['by_utm_source'].items())[:5]:
                print(f"   - {source}: {data['applications']} apps, {data['mqls']} MQLs")
        
        return sync_results

def main():
    """Main execution function"""
    syncer = MetaGHLSync()
    results = syncer.full_sync()
    return results

if __name__ == "__main__":
    main()
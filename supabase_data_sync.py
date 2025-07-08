#!/usr/bin/env python3
"""
Supabase Data Sync - Push Meta and GHL data to Supabase
Syncs Meta advertising data and GHL customer journey data to Supabase database
"""

import json
import logging
from datetime import datetime
from typing import Dict, List, Any, Optional
from meta_ghl_sync import MetaGHLSync

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SupabaseDataSync:
    def __init__(self):
        self.meta_ghl_syncer = MetaGHLSync()
        
    def prepare_meta_campaigns_data(self, campaigns: List[Dict]) -> List[Dict]:
        """Prepare Meta campaigns data for Supabase insertion"""
        prepared_data = []
        
        for campaign in campaigns:
            record = {
                'id': campaign.get('id'),
                'account_id': campaign.get('account_id'),
                'name': campaign.get('name'),
                'status': campaign.get('status'),
                'objective': campaign.get('objective'),
                'created_time': self._parse_datetime(campaign.get('created_time')),
                'updated_time': self._parse_datetime(campaign.get('updated_time')),
                'start_time': self._parse_datetime(campaign.get('start_time')),
                'stop_time': self._parse_datetime(campaign.get('stop_time')),
                'daily_budget': self._parse_decimal(campaign.get('daily_budget')),
                'lifetime_budget': self._parse_decimal(campaign.get('lifetime_budget')),
                'budget_remaining': self._parse_decimal(campaign.get('budget_remaining')),
                'synced_at': datetime.now().isoformat()
            }
            prepared_data.append(record)
        
        logger.info(f"✅ Prepared {len(prepared_data)} Meta campaigns for Supabase")
        return prepared_data
    
    def prepare_meta_adsets_data(self, adsets: List[Dict]) -> List[Dict]:
        """Prepare Meta ad sets data for Supabase insertion"""
        prepared_data = []
        
        for adset in adsets:
            record = {
                'id': adset.get('id'),
                'campaign_id': adset.get('campaign_id'),
                'name': adset.get('name'),
                'status': adset.get('status'),
                'created_time': self._parse_datetime(adset.get('created_time')),
                'updated_time': self._parse_datetime(adset.get('updated_time')),
                'start_time': self._parse_datetime(adset.get('start_time')),
                'end_time': self._parse_datetime(adset.get('end_time')),
                'daily_budget': self._parse_decimal(adset.get('daily_budget')),
                'lifetime_budget': self._parse_decimal(adset.get('lifetime_budget')),
                'targeting': adset.get('targeting') if isinstance(adset.get('targeting'), dict) else {},
                'synced_at': datetime.now().isoformat()
            }
            prepared_data.append(record)
        
        logger.info(f"✅ Prepared {len(prepared_data)} Meta ad sets for Supabase")
        return prepared_data
    
    def prepare_meta_ads_data(self, ads: List[Dict]) -> List[Dict]:
        """Prepare Meta ads data for Supabase insertion"""
        prepared_data = []
        
        for ad in ads:
            record = {
                'id': ad.get('id'),
                'campaign_id': ad.get('campaign_id'),
                'adset_id': ad.get('adset_id'),
                'name': ad.get('name'),
                'status': ad.get('status'),
                'created_time': self._parse_datetime(ad.get('created_time')),
                'updated_time': self._parse_datetime(ad.get('updated_time')),
                'creative': ad.get('creative') if isinstance(ad.get('creative'), dict) else {},
                'synced_at': datetime.now().isoformat()
            }
            prepared_data.append(record)
        
        logger.info(f"✅ Prepared {len(prepared_data)} Meta ads for Supabase")
        return prepared_data
    
    def prepare_meta_insights_data(self, insights: List[Dict]) -> List[Dict]:
        """Prepare Meta insights data for Supabase insertion"""
        prepared_data = []
        
        for insight in insights:
            record = {
                'account_id': self.meta_ghl_syncer.meta_account_id,
                'campaign_id': insight.get('campaign_id'),
                'campaign_name': insight.get('campaign_name'),
                'adset_id': insight.get('adset_id'),
                'adset_name': insight.get('adset_name'),
                'ad_id': insight.get('ad_id'),
                'ad_name': insight.get('ad_name'),
                'date_start': self._parse_date(insight.get('date_start')),
                'date_stop': self._parse_date(insight.get('date_stop')),
                'impressions': self._parse_int(insight.get('impressions')),
                'clicks': self._parse_int(insight.get('clicks')),
                'spend': self._parse_decimal(insight.get('spend')),
                'reach': self._parse_int(insight.get('reach')),
                'frequency': self._parse_decimal(insight.get('frequency')),
                'cpm': self._parse_decimal(insight.get('cpm')),
                'cpc': self._parse_decimal(insight.get('cpc')),
                'ctr': self._parse_decimal(insight.get('ctr')),
                'cpp': self._parse_decimal(insight.get('cpp')),
                'conversions': self._parse_decimal(insight.get('conversions')),
                'conversion_rate': self._parse_decimal(insight.get('conversion_rate')),
                'cost_per_conversion': self._parse_decimal(insight.get('cost_per_conversion')),
                'video_views': self._parse_int(insight.get('video_views')),
                'video_view_rate': self._parse_decimal(insight.get('video_view_rate')),
                'link_clicks': self._parse_int(insight.get('link_clicks')),
                'post_engagement': self._parse_int(insight.get('post_engagement')),
                'synced_at': datetime.now().isoformat()
            }
            prepared_data.append(record)
        
        logger.info(f"✅ Prepared {len(prepared_data)} Meta insights for Supabase")
        return prepared_data
    
    def prepare_ghl_contacts_data(self, contacts: List[Dict]) -> List[Dict]:
        """Prepare GHL contacts data for Supabase insertion"""
        prepared_data = []
        
        # Custom field mappings from discovery
        field_mappings = {
            'hWiYPVIxzb8z69ZSqP1j': 'fa_application_date',
            'UAkQthswkKrPlIWQ5Mtk': 'fa_capital_available',
            'j4KihL9HZzwqTCEbai8b': 'fa_credit_score',
            'VVOSFbxXpsppfHox2jhI': 'fa_income_level',
            'klgLSEZH45ChqGWCprJ8': 'fa_business_type',
            'UHOFwbbvd6VH0qwASmxX': 'fa_funding_timeline',
            'XipmrnXqV46DDxVrDiYS': 'utm_source',
            'cj09pOhxqE4WOOKqQVhK': 'utm_campaign',
            'Q0KWavjuX7YuGrtJaC6k': 'utm_adset',
            'dydJfZGjUkyTmGm4OIef': 'utm_content',
            'FSIc6ju162mN3K8IUbD8': 'ip_address',
            'w0MiykFb25fTTFQla3bu': 'booked_call_date',
            'OOoQSSSoCsRSFlaeThRs': 'additional_call_date',
            'O8NBb6R5CNUfJXka2599': 'call_notes',
            'JrHrEFdQ055Q0HJ3PiDE': 'call_status',
            'uy0zwqA52VW1JlLfZ6a6': 'tracking_id_1',
            'ezTpZWktcRZAFX2gvuaG': 'tracking_id_2',
            'phPaAW2mN1KrjtQuSSew': 'tracking_id_3',
            'n5pI8Nnu2YHTgSsL2mOB': 'date_field_1',
            'cZsCHckmPBPzQV9z9VQ7': 'date_field_2',
            'rq6fbGioNYeOwLQQpB9Z': 'date_field_3',
            'OxRcLPgUtGHNecgWSnpB': 'boolean_field_1',
            'dlLft6RcIbNiHTuDFXaK': 'boolean_field_2'
        }
        
        for contact in contacts:
            # Extract custom fields
            custom_fields = {f['id']: f['value'] for f in contact.get('customField', [])}
            
            # Map custom fields to named columns
            mapped_fields = {}
            for field_id, field_name in field_mappings.items():
                value = custom_fields.get(field_id)
                if value is not None:
                    # Parse different field types
                    if 'date' in field_name:
                        mapped_fields[field_name] = self._parse_datetime(value)
                    elif field_name in ['tracking_id_1', 'tracking_id_2', 'tracking_id_3']:
                        mapped_fields[field_name] = self._parse_int(value)
                    elif field_name in ['boolean_field_1', 'boolean_field_2']:
                        mapped_fields[field_name] = value.lower() == 'yes' if isinstance(value, str) else bool(value)
                    else:
                        mapped_fields[field_name] = str(value) if value else None
            
            # Create contact record
            record = {
                'id': contact.get('id'),
                'first_name': contact.get('firstName'),
                'last_name': contact.get('lastName'),
                'email': contact.get('email'),
                'phone': contact.get('phone'),
                'tags': contact.get('tags', []),
                'created_at': self._parse_datetime(contact.get('dateAdded')),
                'updated_at': self._parse_datetime(contact.get('dateUpdated')),
                'synced_at': datetime.now().isoformat(),
                **mapped_fields  # Add all mapped custom fields
            }
            
            # Calculate computed fields
            record['is_mql'] = self._calculate_is_mql(mapped_fields)
            
            prepared_data.append(record)
        
        logger.info(f"✅ Prepared {len(prepared_data)} GHL contacts for Supabase")
        return prepared_data
    
    def prepare_attribution_data(self, attribution_data: List[Dict]) -> List[Dict]:
        """Prepare attribution data for Supabase insertion"""
        prepared_data = []
        
        for attribution in attribution_data:
            record = {
                'ghl_contact_id': attribution.get('ghl_contact_id'),
                'meta_campaign_id': attribution.get('meta_campaign_id'),
                'meta_adset_id': attribution.get('meta_adset_id'),
                'meta_ad_id': attribution.get('meta_ad_id'),
                'utm_source': attribution.get('utm_source'),
                'utm_campaign': attribution.get('utm_campaign'),
                'utm_content': attribution.get('utm_content'),
                'attribution_confidence': attribution.get('attribution_confidence'),
                'created_at': self._parse_datetime(attribution.get('created_at')),
                'synced_at': datetime.now().isoformat()
            }
            prepared_data.append(record)
        
        logger.info(f"✅ Prepared {len(prepared_data)} attribution records for Supabase")
        return prepared_data
    
    def prepare_customer_journey_data(self, contacts: List[Dict]) -> List[Dict]:
        """Prepare customer journey stage data for Supabase insertion"""
        prepared_data = []
        
        for contact in contacts:
            contact_id = contact.get('id')
            custom_fields = {f['id']: f['value'] for f in contact.get('customField', [])}
            tags = [tag.lower() for tag in contact.get('tags', [])]
            
            # Determine current journey stage
            stage = self._determine_journey_stage(custom_fields, tags)
            
            if stage:
                record = {
                    'contact_id': contact_id,
                    'stage': stage,
                    'status': 'active',
                    'timestamp': datetime.now().isoformat(),
                    'data': {
                        'tags': contact.get('tags', []),
                        'custom_fields_summary': {
                            'fa_application_date': custom_fields.get('hWiYPVIxzb8z69ZSqP1j'),
                            'capital_available': custom_fields.get('UAkQthswkKrPlIWQ5Mtk'),
                            'credit_score': custom_fields.get('j4KihL9HZzwqTCEbai8b'),
                            'booked_call_date': custom_fields.get('w0MiykFb25fTTFQla3bu'),
                            'call_notes': custom_fields.get('O8NBb6R5CNUfJXka2599')
                        }
                    }
                }
                prepared_data.append(record)
        
        logger.info(f"✅ Prepared {len(prepared_data)} customer journey records for Supabase")
        return prepared_data
    
    def generate_supabase_insert_sql(self, sync_data: Dict) -> Dict[str, str]:
        """Generate SQL INSERT statements for Supabase"""
        
        sql_statements = {}
        
        # Meta Campaigns
        if sync_data.get('meta_campaigns'):
            campaigns = self.prepare_meta_campaigns_data(sync_data['meta_campaigns'])
            sql_statements['meta_campaigns'] = self._generate_insert_sql('meta_campaigns', campaigns)
        
        # Meta Ad Sets
        if sync_data.get('meta_adsets'):
            adsets = self.prepare_meta_adsets_data(sync_data['meta_adsets'])
            sql_statements['meta_adsets'] = self._generate_insert_sql('meta_adsets', adsets)
        
        # Meta Ads
        if sync_data.get('meta_ads'):
            ads = self.prepare_meta_ads_data(sync_data['meta_ads'])
            sql_statements['meta_ads'] = self._generate_insert_sql('meta_ads', ads)
        
        # Meta Insights
        if sync_data.get('meta_insights'):
            insights = self.prepare_meta_insights_data(sync_data['meta_insights'])
            sql_statements['meta_insights'] = self._generate_insert_sql('meta_insights', insights)
        
        # GHL Contacts
        if sync_data.get('ghl_contacts'):
            contacts = self.prepare_ghl_contacts_data(sync_data['ghl_contacts'])
            sql_statements['ghl_contacts'] = self._generate_insert_sql('ghl_contacts', contacts)
        
        # Attribution Data
        if sync_data.get('attribution_data'):
            attribution = self.prepare_attribution_data(sync_data['attribution_data'])
            sql_statements['meta_lead_attribution'] = self._generate_insert_sql('meta_lead_attribution', attribution)
        
        # Customer Journey Data
        if sync_data.get('ghl_contacts'):
            journey = self.prepare_customer_journey_data(sync_data['ghl_contacts'])
            sql_statements['customer_journey_stages'] = self._generate_insert_sql('customer_journey_stages', journey)
        
        logger.info(f"✅ Generated SQL statements for {len(sql_statements)} tables")
        return sql_statements
    
    def _generate_insert_sql(self, table_name: str, data: List[Dict]) -> str:
        """Generate INSERT SQL statement for a table"""
        if not data:
            return f"-- No data to insert into {table_name}"
        
        # Get all unique columns
        all_columns = set()
        for record in data:
            all_columns.update(record.keys())
        
        columns = sorted(list(all_columns))
        
        # Build INSERT statement
        sql = f"INSERT INTO {table_name} ({', '.join(columns)}) VALUES\n"
        
        values_parts = []
        for record in data:
            values = []
            for col in columns:
                value = record.get(col)
                if value is None:
                    values.append('NULL')
                elif isinstance(value, str):
                    # Escape single quotes
                    escaped_value = value.replace("'", "''")
                    values.append(f"'{escaped_value}'")
                elif isinstance(value, (dict, list)):
                    # JSON data
                    json_str = json.dumps(value).replace("'", "''")
                    values.append(f"'{json_str}'")
                elif isinstance(value, bool):
                    values.append('TRUE' if value else 'FALSE')
                else:
                    values.append(str(value))
            
            values_parts.append(f"({', '.join(values)})")
        
        sql += ',\n'.join(values_parts)
        sql += "\nON CONFLICT (id) DO UPDATE SET\n"
        
        # Add update clause for upsert
        update_parts = []
        for col in columns:
            if col not in ['id', 'created_at']:
                update_parts.append(f"{col} = EXCLUDED.{col}")
        
        if update_parts:
            sql += ',\n'.join(update_parts)
            sql += ";"
        else:
            sql = sql.replace("\nON CONFLICT (id) DO UPDATE SET\n", ";")
        
        return sql
    
    def _parse_datetime(self, value: Any) -> Optional[str]:
        """Parse datetime value"""
        if not value:
            return None
        
        # If already a datetime string, return as is
        if isinstance(value, str):
            try:
                # Try parsing different formats
                datetime.fromisoformat(value.replace('Z', '+00:00'))
                return value
            except:
                return None
        
        return str(value)
    
    def _parse_date(self, value: Any) -> Optional[str]:
        """Parse date value"""
        if not value:
            return None
        
        if isinstance(value, str):
            try:
                # Parse date string
                return datetime.strptime(value, '%Y-%m-%d').date().isoformat()
            except:
                return value
        
        return str(value)
    
    def _parse_decimal(self, value: Any) -> Optional[float]:
        """Parse decimal value"""
        if not value:
            return None
        
        try:
            return float(value)
        except:
            return None
    
    def _parse_int(self, value: Any) -> Optional[int]:
        """Parse integer value"""
        if not value:
            return None
        
        try:
            return int(float(value))
        except:
            return None
    
    def _calculate_is_mql(self, custom_fields: Dict) -> bool:
        """Calculate if contact is MQL qualified"""
        capital = custom_fields.get('fa_capital_available', '')
        credit = custom_fields.get('fa_credit_score', '')
        
        return (
            bool(custom_fields.get('fa_application_date')) and
            capital and capital != 'Less than $1k' and
            credit and credit != 'Less than 680'
        )
    
    def _determine_journey_stage(self, custom_fields: Dict, tags: List[str]) -> Optional[str]:
        """Determine customer journey stage"""
        if 'deal won' in tags or 'deal_won' in tags:
            return 'deal_won'
        elif 'contract sent' in tags or 'contract_sent' in tags:
            return 'contract_sent'
        elif custom_fields.get('O8NBb6R5CNUfJXka2599'):  # Has call notes
            return 'call_taken'
        elif custom_fields.get('w0MiykFb25fTTFQla3bu'):  # Has booked call date
            return 'intro_booked'
        elif self._calculate_is_mql({'fa_application_date': custom_fields.get('hWiYPVIxzb8z69ZSqP1j'), 'fa_capital_available': custom_fields.get('UAkQthswkKrPlIWQ5Mtk'), 'fa_credit_score': custom_fields.get('j4KihL9HZzwqTCEbai8b')}):
            return 'fa_mql'
        elif custom_fields.get('hWiYPVIxzb8z69ZSqP1j'):  # Has FA application date
            return 'fa_application'
        else:
            return None
    
    def full_supabase_sync(self) -> Dict:
        """Perform complete sync to Supabase"""
        logger.info("🔄 Starting full Supabase sync...")
        
        # 1. Get Meta-GHL sync data
        logger.info("📊 Performing Meta-GHL sync...")
        sync_results = self.meta_ghl_syncer.full_sync()
        
        # 2. Generate SQL statements
        logger.info("🔧 Generating SQL statements...")
        sql_statements = self.generate_supabase_insert_sql(sync_results['raw_data'])
        
        # 3. Save SQL statements to files
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        
        for table_name, sql in sql_statements.items():
            filename = f'supabase_sync_{table_name}_{timestamp}.sql'
            with open(filename, 'w') as f:
                f.write(sql)
            logger.info(f"✅ SQL saved: {filename}")
        
        # 4. Create master sync file
        master_filename = f'supabase_sync_complete_{timestamp}.sql'
        with open(master_filename, 'w') as f:
            f.write("-- Complete Supabase Sync SQL\n")
            f.write(f"-- Generated: {datetime.now().isoformat()}\n\n")
            
            for table_name, sql in sql_statements.items():
                f.write(f"-- {table_name.upper()} DATA\n")
                f.write(sql)
                f.write("\n\n")
        
        logger.info(f"✅ Master SQL file created: {master_filename}")
        
        # 5. Prepare summary
        summary = {
            'sync_timestamp': datetime.now().isoformat(),
            'tables_synced': list(sql_statements.keys()),
            'sql_files_created': len(sql_statements) + 1,  # +1 for master file
            'data_summary': sync_results['meta_data'],
            'journey_metrics': sync_results['journey_metrics']
        }
        
        # 6. Save summary
        summary_filename = f'supabase_sync_summary_{timestamp}.json'
        with open(summary_filename, 'w') as f:
            json.dump(summary, f, indent=2, default=str)
        
        logger.info(f"✅ Sync summary saved: {summary_filename}")
        
        # 7. Print summary
        print("\n" + "="*80)
        print("SUPABASE SYNC COMPLETE")
        print("="*80)
        print(f"📊 Tables synced: {len(sql_statements)}")
        for table_name in sql_statements.keys():
            print(f"   - {table_name}")
        print(f"\n📁 Files created:")
        print(f"   - Master SQL: {master_filename}")
        print(f"   - Summary: {summary_filename}")
        print(f"   - Individual SQL files: {len(sql_statements)}")
        
        return summary

def main():
    """Main execution function"""
    syncer = SupabaseDataSync()
    results = syncer.full_supabase_sync()
    return results

if __name__ == "__main__":
    main()
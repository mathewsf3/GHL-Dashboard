-- Create Analytics Views for Meta Ads and GHL Customer Journey Integration
-- This creates comprehensive views for dashboard analytics combining Meta ads with GHL customer journey data

-- 1. Customer Journey Funnel Analytics View
CREATE OR REPLACE VIEW customer_journey_funnel AS
WITH journey_stages AS (
    -- Get the latest stage for each contact
    SELECT DISTINCT
        contact_id,
        FIRST_VALUE(stage) OVER (
            PARTITION BY contact_id 
            ORDER BY timestamp DESC
        ) as current_stage,
        MIN(timestamp) FILTER (WHERE stage = 'fa_application') as application_date,
        MIN(timestamp) FILTER (WHERE stage = 'fa_mql') as mql_date,
        MIN(timestamp) FILTER (WHERE stage = 'intro_booked') as booked_date,
        MIN(timestamp) FILTER (WHERE stage = 'call_taken') as call_date,
        MIN(timestamp) FILTER (WHERE stage = 'contract_sent') as contract_date,
        MIN(timestamp) FILTER (WHERE stage = 'deal_won') as won_date
    FROM customer_journey_stages
    GROUP BY contact_id
),
stage_counts AS (
    SELECT 
        'fa_application' as stage,
        1 as stage_order,
        COUNT(*) as contact_count
    FROM journey_stages 
    WHERE application_date IS NOT NULL
    
    UNION ALL
    
    SELECT 
        'fa_mql' as stage,
        2 as stage_order,
        COUNT(*) as contact_count
    FROM journey_stages 
    WHERE mql_date IS NOT NULL
    
    UNION ALL
    
    SELECT 
        'intro_booked' as stage,
        3 as stage_order,
        COUNT(*) as contact_count
    FROM journey_stages 
    WHERE booked_date IS NOT NULL
    
    UNION ALL
    
    SELECT 
        'call_taken' as stage,
        4 as stage_order,
        COUNT(*) as contact_count
    FROM journey_stages 
    WHERE call_date IS NOT NULL
    
    UNION ALL
    
    SELECT 
        'contract_sent' as stage,
        5 as stage_order,
        COUNT(*) as contact_count
    FROM journey_stages 
    WHERE contract_date IS NOT NULL
    
    UNION ALL
    
    SELECT 
        'deal_won' as stage,
        6 as stage_order,
        COUNT(*) as contact_count
    FROM journey_stages 
    WHERE won_date IS NOT NULL
)
SELECT 
    stage,
    stage_order,
    contact_count,
    ROUND(
        contact_count * 100.0 / LAG(contact_count) OVER (ORDER BY stage_order),
        2
    ) as conversion_rate_percent,
    ROUND(
        contact_count * 100.0 / FIRST_VALUE(contact_count) OVER (ORDER BY stage_order),
        2
    ) as overall_conversion_percent
FROM stage_counts
ORDER BY stage_order;

-- 2. Meta Campaign Performance with GHL Attribution
CREATE OR REPLACE VIEW meta_campaign_performance AS
WITH campaign_attribution AS (
    SELECT 
        mla.meta_campaign_id,
        mla.utm_campaign,
        COUNT(DISTINCT mla.ghl_contact_id) as total_leads,
        COUNT(DISTINCT CASE WHEN gc.is_mql THEN mla.ghl_contact_id END) as mqls,
        COUNT(DISTINCT CASE WHEN cjs.stage = 'deal_won' THEN mla.ghl_contact_id END) as deals_won
    FROM meta_lead_attribution mla
    LEFT JOIN ghl_contacts gc ON gc.id = mla.ghl_contact_id
    LEFT JOIN customer_journey_stages cjs ON cjs.contact_id = mla.ghl_contact_id 
        AND cjs.stage = 'deal_won'
    GROUP BY mla.meta_campaign_id, mla.utm_campaign
),
campaign_spend AS (
    SELECT 
        campaign_id,
        campaign_name,
        SUM(spend) as total_spend,
        SUM(impressions) as total_impressions,
        SUM(clicks) as total_clicks,
        AVG(cpm) as avg_cpm,
        AVG(cpc) as avg_cpc,
        AVG(ctr) as avg_ctr
    FROM meta_insights
    WHERE date_start >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY campaign_id, campaign_name
)
SELECT 
    mc.id as campaign_id,
    mc.name as campaign_name,
    mc.status,
    mc.objective,
    cs.total_spend,
    cs.total_impressions,
    cs.total_clicks,
    cs.avg_cpm,
    cs.avg_cpc,
    cs.avg_ctr,
    COALESCE(ca.total_leads, 0) as attributed_leads,
    COALESCE(ca.mqls, 0) as attributed_mqls,
    COALESCE(ca.deals_won, 0) as attributed_deals,
    CASE 
        WHEN cs.total_spend > 0 THEN ROUND(cs.total_spend / NULLIF(ca.total_leads, 0), 2)
        ELSE NULL 
    END as cost_per_lead,
    CASE 
        WHEN cs.total_spend > 0 THEN ROUND(cs.total_spend / NULLIF(ca.mqls, 0), 2)
        ELSE NULL 
    END as cost_per_mql,
    CASE 
        WHEN cs.total_spend > 0 THEN ROUND(cs.total_spend / NULLIF(ca.deals_won, 0), 2)
        ELSE NULL 
    END as cost_per_deal,
    CASE 
        WHEN ca.total_leads > 0 THEN ROUND(ca.mqls * 100.0 / ca.total_leads, 2)
        ELSE NULL 
    END as lead_to_mql_rate,
    CASE 
        WHEN ca.mqls > 0 THEN ROUND(ca.deals_won * 100.0 / ca.mqls, 2)
        ELSE NULL 
    END as mql_to_deal_rate
FROM meta_campaigns mc
LEFT JOIN campaign_spend cs ON cs.campaign_id = mc.id
LEFT JOIN campaign_attribution ca ON ca.meta_campaign_id = mc.id
ORDER BY cs.total_spend DESC NULLS LAST;

-- 3. Daily Performance Dashboard View
CREATE OR REPLACE VIEW daily_performance_dashboard AS
WITH daily_metrics AS (
    SELECT 
        date_start as report_date,
        SUM(spend) as total_spend,
        SUM(impressions) as total_impressions,
        SUM(clicks) as total_clicks,
        COUNT(DISTINCT campaign_id) as active_campaigns,
        AVG(cpm) as avg_cpm,
        AVG(cpc) as avg_cpc,
        AVG(ctr) as avg_ctr
    FROM meta_insights
    WHERE date_start >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY date_start
),
daily_leads AS (
    SELECT 
        DATE(created_at) as report_date,
        COUNT(*) as new_contacts,
        COUNT(CASE WHEN is_mql THEN 1 END) as new_mqls
    FROM ghl_contacts
    WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY DATE(created_at)
),
daily_journey AS (
    SELECT 
        DATE(timestamp) as report_date,
        COUNT(CASE WHEN stage = 'fa_application' THEN 1 END) as applications,
        COUNT(CASE WHEN stage = 'intro_booked' THEN 1 END) as bookings,
        COUNT(CASE WHEN stage = 'call_taken' THEN 1 END) as calls,
        COUNT(CASE WHEN stage = 'deal_won' THEN 1 END) as deals
    FROM customer_journey_stages
    WHERE timestamp >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY DATE(timestamp)
)
SELECT 
    COALESCE(dm.report_date, dl.report_date, dj.report_date) as report_date,
    COALESCE(dm.total_spend, 0) as ad_spend,
    COALESCE(dm.total_impressions, 0) as impressions,
    COALESCE(dm.total_clicks, 0) as clicks,
    COALESCE(dm.active_campaigns, 0) as active_campaigns,
    dm.avg_cpm,
    dm.avg_cpc,
    dm.avg_ctr,
    COALESCE(dl.new_contacts, 0) as new_contacts,
    COALESCE(dl.new_mqls, 0) as new_mqls,
    COALESCE(dj.applications, 0) as applications,
    COALESCE(dj.bookings, 0) as bookings,
    COALESCE(dj.calls, 0) as calls,
    COALESCE(dj.deals, 0) as deals,
    CASE 
        WHEN dm.total_spend > 0 THEN ROUND(dm.total_spend / NULLIF(dl.new_contacts, 0), 2)
        ELSE NULL 
    END as cost_per_contact,
    CASE 
        WHEN dm.total_spend > 0 THEN ROUND(dm.total_spend / NULLIF(dl.new_mqls, 0), 2)
        ELSE NULL 
    END as cost_per_mql_daily
FROM daily_metrics dm
FULL OUTER JOIN daily_leads dl ON dm.report_date = dl.report_date
FULL OUTER JOIN daily_journey dj ON COALESCE(dm.report_date, dl.report_date) = dj.report_date
WHERE COALESCE(dm.report_date, dl.report_date, dj.report_date) >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY report_date DESC;

-- 4. UTM Source Performance Analysis
CREATE OR REPLACE VIEW utm_source_performance AS
WITH utm_attribution AS (
    SELECT 
        mla.utm_source,
        COUNT(DISTINCT mla.ghl_contact_id) as total_attributed_leads,
        COUNT(DISTINCT CASE WHEN gc.is_mql THEN mla.ghl_contact_id END) as attributed_mqls,
        COUNT(DISTINCT CASE WHEN cjs.stage = 'deal_won' THEN mla.ghl_contact_id END) as attributed_deals
    FROM meta_lead_attribution mla
    LEFT JOIN ghl_contacts gc ON gc.id = mla.ghl_contact_id
    LEFT JOIN customer_journey_stages cjs ON cjs.contact_id = mla.ghl_contact_id 
        AND cjs.stage = 'deal_won'
    WHERE mla.utm_source IS NOT NULL
    GROUP BY mla.utm_source
),
utm_spend AS (
    SELECT 
        mla.utm_source,
        SUM(mi.spend) as total_spend
    FROM meta_lead_attribution mla
    JOIN meta_insights mi ON mi.campaign_id = mla.meta_campaign_id
    WHERE mla.utm_source IS NOT NULL
        AND mi.date_start >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY mla.utm_source
)
SELECT 
    ua.utm_source,
    ua.total_attributed_leads,
    ua.attributed_mqls,
    ua.attributed_deals,
    COALESCE(us.total_spend, 0) as total_spend,
    CASE 
        WHEN ua.total_attributed_leads > 0 THEN ROUND(ua.attributed_mqls * 100.0 / ua.total_attributed_leads, 2)
        ELSE NULL 
    END as lead_to_mql_rate,
    CASE 
        WHEN ua.attributed_mqls > 0 THEN ROUND(ua.attributed_deals * 100.0 / ua.attributed_mqls, 2)
        ELSE NULL 
    END as mql_to_deal_rate,
    CASE 
        WHEN us.total_spend > 0 THEN ROUND(us.total_spend / NULLIF(ua.total_attributed_leads, 0), 2)
        ELSE NULL 
    END as cost_per_lead,
    CASE 
        WHEN us.total_spend > 0 THEN ROUND(us.total_spend / NULLIF(ua.attributed_mqls, 0), 2)
        ELSE NULL 
    END as cost_per_mql,
    CASE 
        WHEN us.total_spend > 0 THEN ROUND(us.total_spend / NULLIF(ua.attributed_deals, 0), 2)
        ELSE NULL 
    END as cost_per_deal
FROM utm_attribution ua
LEFT JOIN utm_spend us ON us.utm_source = ua.utm_source
ORDER BY ua.total_attributed_leads DESC;

-- 5. Contact Journey Timeline View
CREATE OR REPLACE VIEW contact_journey_timeline AS
SELECT 
    gc.id as contact_id,
    gc.first_name,
    gc.last_name,
    gc.email,
    gc.phone,
    gc.created_at as contact_created,
    gc.is_mql,
    gc.fa_application_date,
    gc.fa_capital_available,
    gc.fa_credit_score,
    gc.utm_source,
    gc.utm_campaign,
    gc.utm_content,
    mla.meta_campaign_id,
    mla.meta_ad_id,
    mc.name as meta_campaign_name,
    
    -- Journey stage timestamps
    MIN(CASE WHEN cjs.stage = 'fa_application' THEN cjs.timestamp END) as application_timestamp,
    MIN(CASE WHEN cjs.stage = 'fa_mql' THEN cjs.timestamp END) as mql_timestamp,
    MIN(CASE WHEN cjs.stage = 'intro_booked' THEN cjs.timestamp END) as booking_timestamp,
    MIN(CASE WHEN cjs.stage = 'call_taken' THEN cjs.timestamp END) as call_timestamp,
    MIN(CASE WHEN cjs.stage = 'contract_sent' THEN cjs.timestamp END) as contract_timestamp,
    MIN(CASE WHEN cjs.stage = 'deal_won' THEN cjs.timestamp END) as deal_timestamp,
    
    -- Calculate time between stages (in days)
    EXTRACT(EPOCH FROM (MIN(CASE WHEN cjs.stage = 'fa_mql' THEN cjs.timestamp END) - 
                       MIN(CASE WHEN cjs.stage = 'fa_application' THEN cjs.timestamp END))) / 86400 as days_application_to_mql,
    EXTRACT(EPOCH FROM (MIN(CASE WHEN cjs.stage = 'intro_booked' THEN cjs.timestamp END) - 
                       MIN(CASE WHEN cjs.stage = 'fa_mql' THEN cjs.timestamp END))) / 86400 as days_mql_to_booking,
    EXTRACT(EPOCH FROM (MIN(CASE WHEN cjs.stage = 'call_taken' THEN cjs.timestamp END) - 
                       MIN(CASE WHEN cjs.stage = 'intro_booked' THEN cjs.timestamp END))) / 86400 as days_booking_to_call,
    EXTRACT(EPOCH FROM (MIN(CASE WHEN cjs.stage = 'deal_won' THEN cjs.timestamp END) - 
                       MIN(CASE WHEN cjs.stage = 'fa_application' THEN cjs.timestamp END))) / 86400 as total_sales_cycle_days,
    
    -- Current stage
    FIRST_VALUE(cjs.stage) OVER (
        PARTITION BY gc.id 
        ORDER BY cjs.timestamp DESC
    ) as current_stage

FROM ghl_contacts gc
LEFT JOIN customer_journey_stages cjs ON cjs.contact_id = gc.id
LEFT JOIN meta_lead_attribution mla ON mla.ghl_contact_id = gc.id
LEFT JOIN meta_campaigns mc ON mc.id = mla.meta_campaign_id
GROUP BY 
    gc.id, gc.first_name, gc.last_name, gc.email, gc.phone, gc.created_at,
    gc.is_mql, gc.fa_application_date, gc.fa_capital_available, gc.fa_credit_score,
    gc.utm_source, gc.utm_campaign, gc.utm_content,
    mla.meta_campaign_id, mla.meta_ad_id, mc.name;

-- 6. Real-time Dashboard Summary View
CREATE OR REPLACE VIEW dashboard_summary AS
WITH summary_stats AS (
    SELECT 
        COUNT(DISTINCT id) as total_contacts,
        COUNT(DISTINCT CASE WHEN is_mql THEN id END) as total_mqls,
        COUNT(DISTINCT CASE WHEN fa_application_date IS NOT NULL THEN id END) as total_applications
    FROM ghl_contacts
),
journey_stats AS (
    SELECT 
        COUNT(DISTINCT CASE WHEN stage = 'intro_booked' THEN contact_id END) as total_bookings,
        COUNT(DISTINCT CASE WHEN stage = 'call_taken' THEN contact_id END) as total_calls,
        COUNT(DISTINCT CASE WHEN stage = 'deal_won' THEN contact_id END) as total_deals
    FROM customer_journey_stages
),
spend_stats AS (
    SELECT 
        SUM(spend) as total_spend_30d,
        AVG(cpc) as avg_cpc_30d,
        SUM(clicks) as total_clicks_30d,
        SUM(impressions) as total_impressions_30d
    FROM meta_insights
    WHERE date_start >= CURRENT_DATE - INTERVAL '30 days'
),
attribution_stats AS (
    SELECT 
        COUNT(DISTINCT ghl_contact_id) as attributed_contacts,
        COUNT(DISTINCT meta_campaign_id) as active_campaigns_with_attribution
    FROM meta_lead_attribution
)
SELECT 
    -- Contact & Journey Metrics
    ss.total_contacts,
    ss.total_applications,
    ss.total_mqls,
    js.total_bookings,
    js.total_calls,
    js.total_deals,
    
    -- Conversion Rates
    ROUND(ss.total_applications * 100.0 / NULLIF(ss.total_contacts, 0), 2) as application_rate,
    ROUND(ss.total_mqls * 100.0 / NULLIF(ss.total_applications, 0), 2) as mql_rate,
    ROUND(js.total_bookings * 100.0 / NULLIF(ss.total_mqls, 0), 2) as booking_rate,
    ROUND(js.total_calls * 100.0 / NULLIF(js.total_bookings, 0), 2) as show_rate,
    ROUND(js.total_deals * 100.0 / NULLIF(js.total_calls, 0), 2) as close_rate,
    
    -- Ad Performance (30 days)
    sps.total_spend_30d,
    sps.total_clicks_30d,
    sps.total_impressions_30d,
    sps.avg_cpc_30d,
    ROUND(sps.total_clicks_30d * 100.0 / NULLIF(sps.total_impressions_30d, 0), 2) as avg_ctr_30d,
    
    -- Attribution
    ats.attributed_contacts,
    ats.active_campaigns_with_attribution,
    ROUND(ats.attributed_contacts * 100.0 / NULLIF(ss.total_contacts, 0), 2) as attribution_rate,
    
    -- Cost Metrics
    ROUND(sps.total_spend_30d / NULLIF(ats.attributed_contacts, 0), 2) as cost_per_attributed_contact,
    ROUND(sps.total_spend_30d / NULLIF(ss.total_mqls, 0), 2) as cost_per_mql_30d,
    ROUND(sps.total_spend_30d / NULLIF(js.total_deals, 0), 2) as cost_per_deal_30d,
    
    -- Update timestamp
    NOW() as last_updated

FROM summary_stats ss
CROSS JOIN journey_stats js
CROSS JOIN spend_stats sps
CROSS JOIN attribution_stats ats;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_customer_journey_stages_contact_stage ON customer_journey_stages(contact_id, stage);
CREATE INDEX IF NOT EXISTS idx_customer_journey_stages_timestamp ON customer_journey_stages(timestamp);
CREATE INDEX IF NOT EXISTS idx_meta_insights_date_campaign ON meta_insights(date_start, campaign_id);
CREATE INDEX IF NOT EXISTS idx_meta_lead_attribution_contact ON meta_lead_attribution(ghl_contact_id);
CREATE INDEX IF NOT EXISTS idx_meta_lead_attribution_campaign ON meta_lead_attribution(meta_campaign_id);
CREATE INDEX IF NOT EXISTS idx_ghl_contacts_mql ON ghl_contacts(is_mql);
CREATE INDEX IF NOT EXISTS idx_ghl_contacts_created_at ON ghl_contacts(created_at);

-- Grant access to views (adjust role names as needed)
-- GRANT SELECT ON customer_journey_funnel TO dashboard_user;
-- GRANT SELECT ON meta_campaign_performance TO dashboard_user;
-- GRANT SELECT ON daily_performance_dashboard TO dashboard_user;
-- GRANT SELECT ON utm_source_performance TO dashboard_user;
-- GRANT SELECT ON contact_journey_timeline TO dashboard_user;
-- GRANT SELECT ON dashboard_summary TO dashboard_user;
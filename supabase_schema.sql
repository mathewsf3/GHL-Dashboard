-- Supabase Schema for GHL Sync Project
-- Run this in Supabase SQL Editor to set up your database

-- Create fa_applications table
CREATE TABLE IF NOT EXISTS fa_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ghl_contact_id TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    phone TEXT,
    application_date DATE,
    date_added TIMESTAMP,
    tags TEXT[],
    custom_fields JSONB,
    raw_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_fa_applications_ghl_contact_id ON fa_applications(ghl_contact_id);
CREATE INDEX IF NOT EXISTS idx_fa_applications_email ON fa_applications(email);
CREATE INDEX IF NOT EXISTS idx_fa_applications_application_date ON fa_applications(application_date);
CREATE INDEX IF NOT EXISTS idx_fa_applications_created_at ON fa_applications(created_at);

-- Create a view for easy querying of recent applications
CREATE OR REPLACE VIEW recent_fa_applications AS
SELECT 
    id,
    ghl_contact_id,
    first_name,
    last_name,
    email,
    phone,
    application_date,
    tags,
    created_at,
    updated_at
FROM fa_applications
WHERE application_date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY application_date DESC;

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_fa_applications_updated_at BEFORE UPDATE
    ON fa_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create table for sync logs
CREATE TABLE IF NOT EXISTS sync_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sync_type TEXT NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    records_processed INTEGER DEFAULT 0,
    records_synced INTEGER DEFAULT 0,
    records_failed INTEGER DEFAULT 0,
    error_details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on sync logs
CREATE INDEX IF NOT EXISTS idx_sync_logs_created_at ON sync_logs(created_at);

-- Create table for custom field definitions (for reference)
CREATE TABLE IF NOT EXISTS ghl_custom_fields (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    field_key TEXT,
    data_type TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert known custom fields
INSERT INTO ghl_custom_fields (id, name, field_key, data_type, description) VALUES
    ('hWiYPVIxzb8z69ZSqP1j', 'FA | Application Date', 'contact.fa__application_date', 'DATE', 'Date when FA application was submitted'),
    ('w0MiykFb25fTTFQla3bu', 'Booked Call Date', 'contact.booked_call_date', 'DATE', 'Date when call was booked'),
    ('XipmrnXqV46DDxVrDiYS', 'UTM Source', NULL, 'TEXT', 'Traffic source (ig, fb, etc.)'),
    ('VVOSFbxXpsppfHox2jhI', 'Income Level', NULL, 'TEXT', 'Annual income range'),
    ('j4KihL9HZzwqTCEbai8b', 'Credit Score', NULL, 'TEXT', 'Credit score range'),
    ('UAkQthswkKrPlIWQ5Mtk', 'Credit Card Debt', NULL, 'TEXT', 'Debt amount range'),
    ('UHOFwbbvd6VH0qwASmxX', 'Funding Timeline', NULL, 'TEXT', 'When funding is needed')
ON CONFLICT (id) DO NOTHING;

-- Create RLS (Row Level Security) policies if needed
-- Enable RLS
ALTER TABLE fa_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ghl_custom_fields ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your authentication needs)
-- For now, allowing public read access (adjust as needed)
CREATE POLICY "Allow public read access" ON fa_applications
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access" ON sync_logs
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access" ON ghl_custom_fields
    FOR SELECT USING (true);

-- Create function to get application statistics
CREATE OR REPLACE FUNCTION get_fa_application_stats()
RETURNS TABLE (
    total_applications BIGINT,
    applications_today BIGINT,
    applications_this_week BIGINT,
    applications_this_month BIGINT,
    unique_emails BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_applications,
        COUNT(*) FILTER (WHERE application_date = CURRENT_DATE)::BIGINT as applications_today,
        COUNT(*) FILTER (WHERE application_date >= CURRENT_DATE - INTERVAL '7 days')::BIGINT as applications_this_week,
        COUNT(*) FILTER (WHERE application_date >= CURRENT_DATE - INTERVAL '30 days')::BIGINT as applications_this_month,
        COUNT(DISTINCT email)::BIGINT as unique_emails
    FROM fa_applications;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions (adjust based on your needs)
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT EXECUTE ON FUNCTION get_fa_application_stats() TO anon;
-- ==========================================
-- ASSETFLOW ENTERPRISE - PHASE 9 MAINTENANCE
-- ==========================================

-- Alter maintenance_status enum
-- Note: In Postgres, adding values to an ENUM type must be done outside a transaction block if using ALTER TYPE.
-- Alternatively, we can just create a new TEXT column if enum causes issues, but we'll try ALTER TYPE first.
ALTER TYPE maintenance_status ADD VALUE IF NOT EXISTS 'pending_approval';
ALTER TYPE maintenance_status ADD VALUE IF NOT EXISTS 'approved';
ALTER TYPE maintenance_status ADD VALUE IF NOT EXISTS 'rejected';
ALTER TYPE maintenance_status ADD VALUE IF NOT EXISTS 'tech_assigned';
ALTER TYPE maintenance_status ADD VALUE IF NOT EXISTS 'waiting_parts';
ALTER TYPE maintenance_status ADD VALUE IF NOT EXISTS 'quality_check';
ALTER TYPE maintenance_status ADD VALUE IF NOT EXISTS 'cancelled';

-- Alter maintenance_requests table
ALTER TABLE maintenance_requests
ADD COLUMN issue_category TEXT,
ADD COLUMN severity TEXT,
ADD COLUMN technician_id UUID REFERENCES employees(id),
ADD COLUMN parts_used JSONB DEFAULT '[]'::jsonb,
ADD COLUMN labor_hours DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN labor_cost DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN total_cost DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN expected_downtime_days INTEGER DEFAULT 0,
ADD COLUMN images JSONB DEFAULT '[]'::jsonb;

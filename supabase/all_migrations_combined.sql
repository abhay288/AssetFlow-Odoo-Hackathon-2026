-- File: 00001_enterprise_schema.sql
-- ==========================================
-- ASSETFLOW ENTERPRISE DATABASE SCHEMA
-- ==========================================

-- Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- ==========================================
-- ENUMS
-- ==========================================
CREATE TYPE role_type AS ENUM ('admin', 'manager', 'dept_head', 'employee');
CREATE TYPE asset_status AS ENUM ('available', 'allocated', 'reserved', 'under_maintenance', 'lost', 'retired', 'disposed');
CREATE TYPE allocation_status AS ENUM ('active', 'returned', 'revoked');
CREATE TYPE transfer_status AS ENUM ('pending', 'approved', 'rejected', 'completed');
CREATE TYPE booking_status AS ENUM ('pending', 'approved', 'active', 'completed', 'cancelled');
CREATE TYPE maintenance_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE maintenance_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
CREATE TYPE audit_status AS ENUM ('planned', 'in_progress', 'completed');
CREATE TYPE audit_item_status AS ENUM ('pending', 'verified', 'missing', 'damaged');

-- ==========================================
-- TRIGGER FUNCTIONS (Shared)
-- ==========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ==========================================
-- CORE TABLES
-- ==========================================

-- ROLES
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name role_type UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- PROFILES (Extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    avatar_url TEXT,
    role_id UUID REFERENCES roles(id) ON DELETE RESTRICT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- DEPARTMENTS
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    code TEXT UNIQUE NOT NULL,
    head_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Will link to Employee later but profile is safer for auth
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id)
);

CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- EMPLOYEES
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    department_id UUID REFERENCES departments(id) ON DELETE RESTRICT,
    employee_code TEXT UNIQUE NOT NULL,
    position TEXT,
    phone TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ASSET CATEGORIES
CREATE TABLE asset_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    prefix TEXT UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TRIGGER update_asset_categories_updated_at BEFORE UPDATE ON asset_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ASSETS
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tag_number TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category_id UUID REFERENCES asset_categories(id) ON DELETE RESTRICT,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    status asset_status DEFAULT 'available'::asset_status NOT NULL,
    purchase_cost DECIMAL(12, 2),
    purchase_date DATE,
    serial_number TEXT,
    location TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id)
);

CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ASSET DOCUMENTS
CREATE TABLE asset_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    document_url TEXT NOT NULL,
    document_type TEXT NOT NULL, -- e.g. receipt, warranty, manual
    uploaded_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- WORKFLOW TABLES
-- ==========================================

-- ASSET ALLOCATIONS
CREATE TABLE asset_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES assets(id) ON DELETE RESTRICT,
    employee_id UUID REFERENCES employees(id) ON DELETE RESTRICT,
    status allocation_status DEFAULT 'active'::allocation_status NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    allocated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TRIGGER update_asset_allocations_updated_at BEFORE UPDATE ON asset_allocations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- UNIQUE CONSTRAINT: Prevent double active allocation
CREATE UNIQUE INDEX idx_unique_active_allocation ON asset_allocations(asset_id) WHERE status = 'active';

-- BOOKINGS
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES assets(id) ON DELETE RESTRICT,
    employee_id UUID REFERENCES employees(id) ON DELETE RESTRICT,
    status booking_status DEFAULT 'pending'::booking_status NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    purpose TEXT,
    approved_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT valid_booking_time CHECK (end_time > start_time)
);

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- EXCLUSION CONSTRAINT: Prevent overlapping approved/active bookings for the same asset
ALTER TABLE bookings
ADD CONSTRAINT no_overlapping_bookings
EXCLUDE USING gist (
    asset_id WITH =,
    tstzrange(start_time, end_time) WITH &&
)
WHERE (status IN ('approved', 'active'));

-- TRANSFER REQUESTS
CREATE TABLE transfer_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES assets(id) ON DELETE RESTRICT,
    from_employee_id UUID REFERENCES employees(id) ON DELETE RESTRICT,
    to_employee_id UUID REFERENCES employees(id) ON DELETE RESTRICT,
    status transfer_status DEFAULT 'pending'::transfer_status NOT NULL,
    reason TEXT,
    approved_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TRIGGER update_transfer_requests_updated_at BEFORE UPDATE ON transfer_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- MAINTENANCE REQUESTS
CREATE TABLE maintenance_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES assets(id) ON DELETE RESTRICT,
    reported_by UUID REFERENCES employees(id) ON DELETE RESTRICT,
    priority maintenance_priority DEFAULT 'medium'::maintenance_priority NOT NULL,
    status maintenance_status DEFAULT 'open'::maintenance_status NOT NULL,
    issue_description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TRIGGER update_maintenance_requests_updated_at BEFORE UPDATE ON maintenance_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- MAINTENANCE LOGS
CREATE TABLE maintenance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES maintenance_requests(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES assets(id) ON DELETE RESTRICT,
    performed_by TEXT, -- Internal or external vendor name
    cost DECIMAL(10, 2),
    notes TEXT,
    completion_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES profiles(id)
);

-- ==========================================
-- AUDITING & LOGGING
-- ==========================================

-- AUDIT CYCLES
CREATE TABLE audit_cycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    status audit_status DEFAULT 'planned'::audit_status NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES profiles(id)
);

-- AUDIT ITEMS
CREATE TABLE audit_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audit_cycle_id UUID REFERENCES audit_cycles(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES assets(id) ON DELETE RESTRICT,
    expected_employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    status audit_item_status DEFAULT 'pending'::audit_item_status NOT NULL,
    verified_by UUID REFERENCES profiles(id),
    notes TEXT,
    verified_at TIMESTAMP WITH TIME ZONE
);

-- UNIQUE CONSTRAINT: Prevent duplicate assets in the same audit cycle
CREATE UNIQUE INDEX idx_unique_audit_asset ON audit_items(audit_cycle_id, asset_id);

-- ACTIVITY LOGS
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID NOT NULL,
    entity_type TEXT NOT NULL,
    action TEXT NOT NULL,
    performed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- NOTIFICATIONS
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false NOT NULL,
    link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Helper function for RLS
CREATE OR REPLACE FUNCTION auth_user_role() RETURNS role_type AS $$
  SELECT name FROM roles 
  INNER JOIN profiles ON profiles.role_id = roles.id 
  WHERE profiles.id = auth.uid() 
  LIMIT 1;
$$ LANGUAGE sql STABLE;

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Departments
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read departments" ON departments FOR SELECT USING (true);
CREATE POLICY "Admins manage departments" ON departments FOR ALL USING (auth_user_role() = 'admin');

-- Employees
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read employees" ON employees FOR SELECT USING (true);
CREATE POLICY "Admins and Managers manage employees" ON employees FOR ALL USING (auth_user_role() IN ('admin', 'manager'));

-- Assets
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read assets" ON assets FOR SELECT USING (true);
CREATE POLICY "Admins and Managers manage assets" ON assets FOR ALL USING (auth_user_role() IN ('admin', 'manager'));

-- Allocations
ALTER TABLE asset_allocations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Employees see their allocations" ON asset_allocations FOR SELECT USING (
    employee_id IN (SELECT id FROM employees WHERE profile_id = auth.uid()) OR auth_user_role() IN ('admin', 'manager', 'dept_head')
);
CREATE POLICY "Managers manage allocations" ON asset_allocations FOR ALL USING (auth_user_role() IN ('admin', 'manager'));

-- Bookings
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read bookings" ON bookings FOR SELECT USING (true);
CREATE POLICY "Employees create bookings" ON bookings FOR INSERT WITH CHECK (
    employee_id IN (SELECT id FROM employees WHERE profile_id = auth.uid())
);
CREATE POLICY "Managers approve bookings" ON bookings FOR UPDATE USING (auth_user_role() IN ('admin', 'manager', 'dept_head'));

-- Notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own notifications" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users update own notifications" ON notifications FOR UPDATE USING (user_id = auth.uid());


-- ==========================================
-- STORAGE BUCKETS SETUP
-- ==========================================
INSERT INTO storage.buckets (id, name, public) VALUES ('asset_images', 'asset_images', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('asset_documents', 'asset_documents', false) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('audit_evidence', 'audit_evidence', false) ON CONFLICT DO NOTHING;


-- File: 00002_add_master_data_fields.sql
-- ==========================================
-- ASSETFLOW ENTERPRISE - PHASE 5 ADDITIONS
-- ==========================================

-- 1. DEPARTMENTS: Add Hierarchy
ALTER TABLE departments
ADD COLUMN parent_id UUID REFERENCES departments(id) ON DELETE SET NULL;

-- 2. ASSET CATEGORIES: Add Visual and Metadata fields
ALTER TABLE asset_categories
ADD COLUMN icon TEXT,
ADD COLUMN color TEXT,
ADD COLUMN warranty_period_months INTEGER,
ADD COLUMN maintenance_cycle_days INTEGER,
ADD COLUMN custom_fields JSONB DEFAULT '[]'::jsonb;

-- Prevent circular dependency in departments (simplified check via trigger could be added, but handled via application logic primarily)


-- File: 00003_add_asset_fields.sql
-- ==========================================
-- ASSETFLOW ENTERPRISE - PHASE 6 ADDITIONS
-- ==========================================

-- Create new ENUM for Asset Condition
CREATE TYPE asset_condition AS ENUM ('new', 'good', 'fair', 'poor', 'broken');

-- Alter existing Assets Table to add premium master data fields
ALTER TABLE assets
ADD COLUMN owner_id UUID REFERENCES employees(id) ON DELETE SET NULL,
ADD COLUMN vendor TEXT,
ADD COLUMN warranty_start DATE,
ADD COLUMN warranty_end DATE,
ADD COLUMN current_value DECIMAL(12, 2),
ADD COLUMN condition asset_condition DEFAULT 'new'::asset_condition NOT NULL,
ADD COLUMN is_shared_resource BOOLEAN DEFAULT false NOT NULL,
ADD COLUMN is_bookable BOOLEAN DEFAULT false NOT NULL,
ADD COLUMN notes TEXT,
ADD COLUMN image_url TEXT;

-- Validation check: Warranty end cannot be before warranty start
ALTER TABLE assets
ADD CONSTRAINT valid_warranty_dates CHECK (warranty_end >= warranty_start);


-- File: 00004_add_workflow_fields.sql
-- ==========================================
-- ASSETFLOW ENTERPRISE - PHASE 7 WORKFLOW
-- ==========================================

-- Alter asset_allocations to add return and workflow details
ALTER TABLE asset_allocations
ADD COLUMN expected_return_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN purpose TEXT,
ADD COLUMN priority TEXT DEFAULT 'normal',
ADD COLUMN return_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN return_condition TEXT,
ADD COLUMN damage_notes TEXT,
ADD COLUMN accessories_returned BOOLEAN DEFAULT true;

-- Update transfer_requests to hold condition metadata
ALTER TABLE transfer_requests
ADD COLUMN transfer_notes TEXT,
ADD COLUMN condition_at_transfer TEXT;


-- File: 00005_add_booking_fields.sql
-- ==========================================
-- ASSETFLOW ENTERPRISE - PHASE 8 BOOKINGS
-- ==========================================

-- Alter bookings table
ALTER TABLE bookings
ADD COLUMN attendees JSONB DEFAULT '[]'::jsonb,
ADD COLUMN priority TEXT DEFAULT 'normal',
ADD COLUMN remarks TEXT;


-- File: 00006_add_maintenance_workflow.sql
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



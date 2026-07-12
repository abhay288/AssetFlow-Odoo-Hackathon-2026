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

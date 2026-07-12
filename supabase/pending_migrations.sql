-- File: 00007_add_audit_workflow.sql
-- ==========================================
-- ASSETFLOW ENTERPRISE - PHASE 10 AUDIT
-- ==========================================

-- Alter audit_status enum
ALTER TYPE audit_status ADD VALUE IF NOT EXISTS 'draft';
ALTER TYPE audit_status ADD VALUE IF NOT EXISTS 'scheduled';
ALTER TYPE audit_status ADD VALUE IF NOT EXISTS 'paused';
ALTER TYPE audit_status ADD VALUE IF NOT EXISTS 'closed';
ALTER TYPE audit_status ADD VALUE IF NOT EXISTS 'archived';

-- Alter audit_item_status enum
ALTER TYPE audit_item_status ADD VALUE IF NOT EXISTS 'not_accessible';
ALTER TYPE audit_item_status ADD VALUE IF NOT EXISTS 'disposed';
ALTER TYPE audit_item_status ADD VALUE IF NOT EXISTS 'lost';

-- Alter audit_cycles table
ALTER TABLE audit_cycles
ADD COLUMN department_id UUID REFERENCES departments(id),
ADD COLUMN location TEXT,
ADD COLUMN scope TEXT,
ADD COLUMN auditors JSONB DEFAULT '[]'::jsonb,
ADD COLUMN priority TEXT DEFAULT 'normal',
ADD COLUMN description TEXT;

-- Alter audit_items table
ALTER TABLE audit_items
ADD COLUMN evidence_images JSONB DEFAULT '[]'::jsonb;



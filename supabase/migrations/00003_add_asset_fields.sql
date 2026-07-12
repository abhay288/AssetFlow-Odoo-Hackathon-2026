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

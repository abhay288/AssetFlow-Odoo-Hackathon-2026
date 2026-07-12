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

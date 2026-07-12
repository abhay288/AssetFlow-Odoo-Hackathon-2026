-- ==========================================
-- ASSETFLOW ENTERPRISE - PHASE 8 BOOKINGS
-- ==========================================

-- Alter bookings table
ALTER TABLE bookings
ADD COLUMN attendees JSONB DEFAULT '[]'::jsonb,
ADD COLUMN priority TEXT DEFAULT 'normal',
ADD COLUMN remarks TEXT;

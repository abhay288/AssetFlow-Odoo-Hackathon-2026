-- ==============================================================
-- ASSETFLOW ENTERPRISE - COMPREHENSIVE RLS POLICIES
-- ==============================================================

-- 1. ASSET CATEGORIES
ALTER TABLE asset_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read asset categories" ON asset_categories;
CREATE POLICY "Anyone can read asset categories" ON asset_categories 
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins and Managers manage asset categories" ON asset_categories;
CREATE POLICY "Admins and Managers manage asset categories" ON asset_categories 
    FOR ALL USING (auth_user_role() IN ('admin', 'manager'));

-- 2. MAINTENANCE REQUESTS
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read maintenance requests" ON maintenance_requests;
CREATE POLICY "Anyone can read maintenance requests" ON maintenance_requests 
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can report maintenance requests" ON maintenance_requests;
CREATE POLICY "Users can report maintenance requests" ON maintenance_requests 
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admins, Managers and Dept Heads manage maintenance requests" ON maintenance_requests;
CREATE POLICY "Admins, Managers and Dept Heads manage maintenance requests" ON maintenance_requests 
    FOR UPDATE USING (auth_user_role() IN ('admin', 'manager', 'dept_head'));

-- 3. MAINTENANCE LOGS
ALTER TABLE maintenance_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read maintenance logs" ON maintenance_logs;
CREATE POLICY "Anyone can read maintenance logs" ON maintenance_logs 
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins and Managers manage maintenance logs" ON maintenance_logs;
CREATE POLICY "Admins and Managers manage maintenance logs" ON maintenance_logs 
    FOR ALL USING (auth_user_role() IN ('admin', 'manager'));

-- 4. TRANSFER REQUESTS
ALTER TABLE transfer_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read relevant transfer requests" ON transfer_requests;
CREATE POLICY "Users can read relevant transfer requests" ON transfer_requests 
    FOR SELECT USING (
        from_employee_id IN (SELECT id FROM employees WHERE profile_id = auth.uid()) OR 
        to_employee_id IN (SELECT id FROM employees WHERE profile_id = auth.uid()) OR 
        auth_user_role() IN ('admin', 'manager', 'dept_head')
    );

DROP POLICY IF EXISTS "Users can create transfer requests" ON transfer_requests;
CREATE POLICY "Users can create transfer requests" ON transfer_requests 
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Relevant users can update transfer requests" ON transfer_requests;
CREATE POLICY "Relevant users can update transfer requests" ON transfer_requests 
    FOR UPDATE USING (
        from_employee_id IN (SELECT id FROM employees WHERE profile_id = auth.uid()) OR 
        to_employee_id IN (SELECT id FROM employees WHERE profile_id = auth.uid()) OR 
        auth_user_role() IN ('admin', 'manager', 'dept_head')
    );

-- 5. AUDIT CYCLES
ALTER TABLE audit_cycles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read audit cycles" ON audit_cycles;
CREATE POLICY "Anyone can read audit cycles" ON audit_cycles 
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins and Managers manage audit cycles" ON audit_cycles;
CREATE POLICY "Admins and Managers manage audit cycles" ON audit_cycles 
    FOR ALL USING (auth_user_role() IN ('admin', 'manager'));

-- 6. AUDIT ITEMS
ALTER TABLE audit_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read audit items" ON audit_items;
CREATE POLICY "Anyone can read audit items" ON audit_items 
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins and Managers manage audit items" ON audit_items;
CREATE POLICY "Admins and Managers manage audit items" ON audit_items 
    FOR ALL USING (auth_user_role() IN ('admin', 'manager'));

-- 7. ACTIVITY LOGS
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins and Managers can read activity logs" ON activity_logs;
CREATE POLICY "Admins and Managers can read activity logs" ON activity_logs 
    FOR SELECT USING (auth_user_role() IN ('admin', 'manager'));

DROP POLICY IF EXISTS "Any logged in user can write activity logs" ON activity_logs;
CREATE POLICY "Any logged in user can write activity logs" ON activity_logs 
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

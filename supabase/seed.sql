-- ==========================================
-- ASSETFLOW SEED DATA
-- ==========================================

-- 1. Insert Roles
INSERT INTO roles (id, name, description) VALUES 
('11111111-1111-1111-1111-111111111111', 'admin', 'System Administrator with full access'),
('22222222-2222-2222-2222-222222222222', 'manager', 'Asset Manager who manages inventory'),
('33333333-3333-3333-3333-333333333333', 'dept_head', 'Department Head who oversees department assets'),
('44444444-4444-4444-4444-444444444444', 'employee', 'Standard employee user')
ON CONFLICT (name) DO NOTHING;

-- 2. Mock Users in auth.users (Normally handled by Supabase Auth, but we simulate it for the seed)
-- Note: In a real Supabase environment, you would use auth.users API. We assume these IDs match auth.users for local dev.
-- We will just insert directly into profiles assuming RLS is off for seed or auth.users is populated separately if needed.
-- We'll just insert into profiles (might fail foreign key to auth.users in strict Supabase, but standard for local testing)
-- If it fails, you must create the users via Supabase UI first. For now, we will insert them into auth.users.
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES 
('00000000-0000-0000-0000-000000000000', 'a0000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'admin@assetflow.app', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''),
('00000000-0000-0000-0000-000000000000', 'a0000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'manager@assetflow.app', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''),
('00000000-0000-0000-0000-000000000000', 'a0000000-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'depthead@assetflow.app', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''),
('00000000-0000-0000-0000-000000000000', 'a0000000-0000-0000-0000-000000000004', 'authenticated', 'authenticated', 'employee@assetflow.app', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '')
ON CONFLICT DO NOTHING;

-- 3. Insert Profiles
INSERT INTO profiles (id, email, first_name, last_name, role_id) VALUES
('a0000000-0000-0000-0000-000000000001', 'admin@assetflow.app', 'Alice', 'Admin', '11111111-1111-1111-1111-111111111111'),
('a0000000-0000-0000-0000-000000000002', 'manager@assetflow.app', 'Bob', 'Manager', '22222222-2222-2222-2222-222222222222'),
('a0000000-0000-0000-0000-000000000003', 'depthead@assetflow.app', 'Carol', 'Head', '33333333-3333-3333-3333-333333333333'),
('a0000000-0000-0000-0000-000000000004', 'employee@assetflow.app', 'Dave', 'Employee', '44444444-4444-4444-4444-444444444444')
ON CONFLICT (id) DO NOTHING;

-- 4. Insert Departments
INSERT INTO departments (id, name, code, head_profile_id) VALUES
('d1111111-1111-1111-1111-111111111111', 'Engineering', 'ENG', 'a0000000-0000-0000-0000-000000000003'),
('d2222222-2222-2222-2222-222222222222', 'Design', 'DES', NULL),
('d3333333-3333-3333-3333-333333333333', 'Marketing', 'MKT', NULL)
ON CONFLICT (name) DO NOTHING;

-- 5. Insert Employees
INSERT INTO employees (id, profile_id, department_id, employee_code, position) VALUES
('e1111111-1111-1111-1111-111111111111', 'a0000000-0000-0000-0000-000000000003', 'd1111111-1111-1111-1111-111111111111', 'EMP-001', 'VP of Engineering'),
('e2222222-2222-2222-2222-222222222222', 'a0000000-0000-0000-0000-000000000004', 'd1111111-1111-1111-1111-111111111111', 'EMP-002', 'Software Engineer')
ON CONFLICT (employee_code) DO NOTHING;

-- 6. Insert Asset Categories
INSERT INTO asset_categories (id, name, prefix, description) VALUES
('c1111111-1111-1111-1111-111111111111', 'Laptops', 'LAP', 'MacBooks, ThinkPads, etc.'),
('c2222222-2222-2222-2222-222222222222', 'Monitors', 'MON', 'External displays'),
('c3333333-3333-3333-3333-333333333333', 'Furniture', 'FUR', 'Desks, Chairs')
ON CONFLICT (name) DO NOTHING;

-- 7. Insert Assets
INSERT INTO assets (id, tag_number, name, description, category_id, department_id, status, purchase_cost, purchase_date) VALUES
('b1111111-1111-1111-1111-111111111111', 'LAP-001', 'MacBook Pro 16" M3 Max', 'Space Gray, 64GB RAM, 2TB SSD', 'c1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 'allocated', 3499.00, '2025-01-15'),
('b2222222-2222-2222-2222-222222222222', 'MON-001', 'Dell UltraSharp 27"', '4K USB-C Monitor', 'c2222222-2222-2222-2222-222222222222', 'd1111111-1111-1111-1111-111111111111', 'available', 600.00, '2025-02-01'),
('b3333333-3333-3333-3333-333333333333', 'FUR-001', 'Herman Miller Aeron', 'Size B, Graphite', 'c3333333-3333-3333-3333-333333333333', NULL, 'available', 1200.00, '2024-11-20'),
('b4444444-4444-4444-4444-444444444444', 'LAP-002', 'Lenovo ThinkPad X1 Carbon', 'Gen 11, Core i7', 'c1111111-1111-1111-1111-111111111111', 'd3333333-3333-3333-3333-333333333333', 'under_maintenance', 1800.00, '2023-05-10')
ON CONFLICT (tag_number) DO NOTHING;

-- 8. Insert Allocations (Active allocation for LAP-001)
INSERT INTO asset_allocations (asset_id, employee_id, status, start_date) VALUES
('b1111111-1111-1111-1111-111111111111', 'e2222222-2222-2222-2222-222222222222', 'active', '2025-01-20')
ON CONFLICT DO NOTHING;

-- 9. Insert Maintenance Requests (For LAP-002)
INSERT INTO maintenance_requests (id, asset_id, reported_by, priority, status, issue_description) VALUES
('f1111111-1111-1111-1111-111111111111', 'b4444444-4444-4444-4444-444444444444', 'e1111111-1111-1111-1111-111111111111', 'high', 'in_progress', 'Battery fails to hold charge beyond 30 minutes.')
ON CONFLICT DO NOTHING;

-- 10. Insert Maintenance Logs
INSERT INTO maintenance_logs (request_id, asset_id, performed_by, cost, notes) VALUES
('f1111111-1111-1111-1111-111111111111', 'b4444444-4444-4444-4444-444444444444', 'Apple Store', 129.00, 'Replaced internal battery module.')
ON CONFLICT DO NOTHING;

-- 11. Insert Bookings (Booking for MON-001)
INSERT INTO bookings (asset_id, employee_id, status, start_time, end_time, purpose) VALUES
('b2222222-2222-2222-2222-222222222222', 'e1111111-1111-1111-1111-111111111111', 'approved', '2026-08-01 09:00:00+00', '2026-08-01 17:00:00+00', 'Quarterly All-Hands Presentation')
ON CONFLICT DO NOTHING;

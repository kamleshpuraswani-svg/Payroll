-- Dummy Data for Expense Management (Targeted to MindInventory BU)
-- Uses ON CONFLICT to avoid duplicate key errors

INSERT INTO public.expense_categories (name, status, applicable_to, target_id, target_type, created_by, last_updated_by)
VALUES 
(
    'Travel Reimbursement', 
    'Active', 
    '[
        {"id": "Engineering", "name": "Engineering", "type": "dept", "max_limit": 10000, "receipt_threshold": 500},
        {"id": "Sales", "name": "Sales", "type": "dept", "max_limit": 15000, "receipt_threshold": 200}
    ]'::jsonb, 
    'MindInventory', 
    'bu', 
    'HR Manager', 
    'HR Manager'
),
(
    'Meals & Entertainment', 
    'Active', 
    '[
        {"id": "Marketing", "name": "Marketing", "type": "dept", "max_limit": 8000, "receipt_threshold": 100},
        {"id": "Director", "name": "Director", "type": "desig", "max_limit": 20000, "receipt_threshold": 0}
    ]'::jsonb, 
    'MindInventory', 
    'bu', 
    'HR Manager', 
    'HR Manager'
),
(
    'Internet Allowance', 
    'Active', 
    '[
        {"id": "Engineering", "name": "Engineering", "type": "dept", "max_limit": 2000, "receipt_threshold": 0}
    ]'::jsonb, 
    'MindInventory', 
    'bu', 
    'HR Manager', 
    'HR Manager'
),
(
    'Office Supplies', 
    'Active', 
    '[
        {"id": "Admin", "name": "Admin", "type": "dept", "max_limit": 5000, "receipt_threshold": 50}
    ]'::jsonb, 
    'MindInventory', 
    'bu', 
    'HR Manager', 
    'HR Manager'
),
(
    'Relocation Expenses', 
    'Inactive', 
    '[]'::jsonb, 
    'MindInventory', 
    'bu', 
    'HR Manager', 
    'HR Manager'
)
ON CONFLICT (name, target_id, target_type) 
DO UPDATE SET 
    applicable_to = EXCLUDED.applicable_to,
    status = EXCLUDED.status,
    last_updated_by = EXCLUDED.last_updated_by,
    updated_at = now();

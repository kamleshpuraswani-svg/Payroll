-- SQL to add business_unit column and update employee data
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS business_unit text;

-- Update Designations based on Departments
UPDATE public.employees 
SET designation = CASE 
    WHEN department IN ('Software Engineering', 'Engineering', 'DevOps') THEN 'Senior Engineer'
    WHEN department = 'QA' THEN 'QA Lead'
    WHEN department = 'Marketing' THEN 'Creative Designer'
    WHEN department = 'Product' THEN 'Product Manager'
    WHEN department = 'Sales' THEN 'Sales Manager'
    WHEN department = 'Finance' THEN 'Finance Controller'
    ELSE 'Business Associate'
END
WHERE designation IS NULL OR designation = 'N/A';

-- Update Business Units with requested names
-- We use a modulo on the row's ID or creation time to distribute names
UPDATE public.employees
SET business_unit = CASE 
    WHEN (ascii(substr(id::text, 1, 1)) % 3) = 0 THEN 'MindInventory'
    WHEN (ascii(substr(id::text, 1, 1)) % 3) = 1 THEN '300 Minds'
    ELSE 'CollabCRM'
END;

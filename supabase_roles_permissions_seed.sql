-- Seeding Default Roles and Permissions in operational_config

-- Insert Roles Array
INSERT INTO public.operational_config (config_key, config_value)
VALUES (
    'roles_permissions_roles',
    '[
      {
        "id": "1",
        "name": "Employee",
        "status": "Active",
        "employeesCount": 15,
        "remarks": "Standard employee access for self-service portal",
        "lastModifiedBy": "",
        "lastModifiedAt": "",
        "createdBy": "System",
        "createdAt": "01-Jan-2025, 09:00 AM"
      },
      {
        "id": "2",
        "name": "HR Manager",
        "status": "Active",
        "employeesCount": 4,
        "remarks": "Handles human resources operations and payroll configurations",
        "lastModifiedBy": "",
        "lastModifiedAt": "",
        "createdBy": "Prashant Kumar",
        "createdAt": "15-Jun-2025, 10:00 AM"
      }
    ]'::jsonb
)
ON CONFLICT (config_key) DO UPDATE
SET config_value = EXCLUDED.config_value;

-- Insert Permissions Matrix
INSERT INTO public.operational_config (config_key, config_value)
VALUES (
    'roles_permissions_matrix',
    '{
      "1": {
        "people": {"add": false, "edit": false, "status": true, "delete": false, "viewScope": "Default"},
        "feed-mod": {"add": false, "edit": false, "status": false, "delete": false, "viewScope": null},
        "employees": {"add": false, "edit": false, "status": false, "delete": false, "viewScope": null},
        "exit-mgmt": {"add": false, "edit": false, "status": false, "delete": false, "viewScope": null},
        "emp-detail": {"add": false, "edit": false, "status": true, "delete": false, "viewScope": "Default"},
        "personal-info": {"add": false, "edit": false, "status": true, "delete": false, "viewScope": "Default"},
        "role-info": {"add": false, "edit": false, "status": false, "delete": false, "viewScope": null},
        "contact-info": {"add": false, "edit": false, "status": true, "delete": false, "viewScope": "Default"},
        "family-details": {"add": false, "edit": false, "status": false, "delete": false, "viewScope": null},
        "payroll-corner": {"add": false, "edit": false, "status": true, "delete": false, "viewScope": "Default"},
        "emp-overview": {"add": false, "edit": false, "status": true, "delete": false, "viewScope": "Default"},
        "emp-tax-planning": {"add": false, "edit": false, "status": true, "delete": false, "viewScope": "Default"},
        "emp-payslips": {"add": false, "edit": false, "status": true, "delete": false, "viewScope": "Default"},
        "emp-reimbursements": {"add": false, "edit": false, "status": true, "delete": false, "viewScope": "Default"},
        "emp-tax-documents": {"add": false, "edit": false, "status": true, "delete": false, "viewScope": "Default"},
        "emp-loans-advances": {"add": false, "edit": false, "status": true, "delete": false, "viewScope": "Default"},
        "payroll": {"add": false, "edit": false, "status": false, "delete": false, "viewScope": null},
        "pay-schedule": {"add": false, "edit": false, "status": false, "delete": false, "viewScope": null},
        "salary-structures": {"add": false, "edit": false, "status": false, "delete": false, "viewScope": null},
        "payroll-config": {"add": false, "edit": false, "status": false, "delete": false, "viewScope": null}
      },
      "2": {
        "people": {"add": false, "edit": false, "status": true, "delete": false, "viewScope": "Global"},
        "feed-mod": {"add": false, "edit": false, "status": true, "delete": false, "viewScope": "Global"},
        "employees": {"add": true, "edit": true, "status": true, "delete": true, "viewScope": "Global"},
        "exit-mgmt": {"add": true, "edit": true, "status": true, "delete": true, "viewScope": "Global"},
        "emp-detail": {"add": false, "edit": false, "status": true, "delete": false, "viewScope": "Global"},
        "personal-info": {"add": false, "edit": false, "status": true, "delete": false, "viewScope": "Global"},
        "role-info": {"add": false, "edit": false, "status": true, "delete": false, "viewScope": "Global"},
        "contact-info": {"add": false, "edit": false, "status": true, "delete": false, "viewScope": "Global"},
        "family-details": {"add": false, "edit": false, "status": true, "delete": false, "viewScope": "Global"},
        "payroll-corner": {"add": false, "edit": false, "status": true, "delete": false, "viewScope": "Global"},
        "emp-overview": {"add": false, "edit": false, "status": true, "delete": false, "viewScope": "Global"},
        "emp-tax-planning": {"add": true, "edit": true, "status": true, "delete": true, "viewScope": "Global"},
        "emp-payslips": {"add": false, "edit": false, "status": true, "delete": false, "viewScope": "Global"},
        "emp-reimbursements": {"add": true, "edit": true, "status": true, "delete": true, "viewScope": "Global"},
        "emp-tax-documents": {"add": true, "edit": true, "status": true, "delete": true, "viewScope": "Global"},
        "emp-loans-advances": {"add": true, "edit": true, "status": true, "delete": true, "viewScope": "Global"},
        "payroll": {"add": false, "edit": false, "status": true, "delete": false, "viewScope": "Global"},
        "pay-schedule": {"add": true, "edit": true, "status": true, "delete": true, "viewScope": "Global"},
        "salary-structures": {"add": true, "edit": true, "status": true, "delete": true, "viewScope": "Global"},
        "payroll-config": {"add": false, "edit": false, "status": true, "delete": false, "viewScope": "Global"}
      }
    }'::jsonb
)
ON CONFLICT (config_key) DO UPDATE
SET config_value = EXCLUDED.config_value;

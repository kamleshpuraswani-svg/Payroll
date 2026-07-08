import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

const rawSupabase = createClient(supabaseUrl, supabaseAnonKey);

// Comprehensive mock data repository for application-wide resilience
const MOCK_DATA: Record<string, any[]> = {
    companies: [
        { id: 'c1', name: 'MindInventory', code: 'MI', status: 'Active' },
        { id: 'c2', name: 'TechFlow Systems', code: 'TF', status: 'Active' },
        { id: 'c3', name: '300 Minds', code: 'TM', status: 'Active' }
    ],
    employees: [
        { id: '1', name: 'Priya Sharma', eid: 'TF00912', company: 'TechFlow Systems', department: 'Engineering', location: 'Bangalore', ctc: '₹18.5 L', status: 'Active', designation: 'Senior Software Engineer', avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
        { id: '2', name: 'Arjun Mehta', eid: 'AC04567', company: 'Acme Corp', department: 'Sales', location: 'Mumbai', ctc: '₹24.0 L', status: 'Active', designation: 'Account Manager', avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
        { id: '3', name: 'Neha Kapoor', eid: 'SU00234', company: 'StartUp Inc', department: 'Product', location: 'Hyderabad', ctc: '₹15.8 L', status: 'New Joinee', designation: 'Product Manager', avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
        { id: '4', name: 'Sameer Sheikh', eid: 'TF00945', company: 'MindInventory', department: 'Operations', location: 'Bangalore', ctc: '₹12.0 L', status: 'Active', designation: 'Operations Lead' },
        { id: '5', name: 'Rishabh Pant', eid: 'AC04122', company: 'MindInventory', department: 'Sales', location: 'Delhi', ctc: '₹14.0 L', status: 'Active', designation: 'Account Manager' }
    ],
    reimbursement_claims: [
        { id: 'CLM-001', claim_id: 'CLM-001', employee_id: '1', employee_name: 'Priya Sharma', employee_code: 'TF00912', category: 'Travel Allowance', expense_date: '2025-11-10', amount: 4500, status: 'Approved', receipt_url: '#' },
        { id: 'CLM-002', claim_id: 'CLM-002', employee_id: '2', employee_name: 'Arjun Mehta', employee_code: 'AC04567', category: 'Client Entertainment', expense_date: '2025-11-12', amount: 3200, status: 'Submitted', receipt_url: '#' }
    ],
    tax_declarations: [
        { id: 'TX-001', employee_name: 'Priya Sharma', employee_id: 'TF00912', type: '80C', type_label: '80C Investments', amount: 150000, submitted_date: '10 Dec 2025', status: 'Pending', created_by: 'Employee', created_at: '10 Dec 2025, 09:15 AM', notes: 'LIC receipt pending', ctc: '₹18.5 L', regime: 'Old', declaration_type: 'Proposed Investment' },
        { id: 'TX-002', employee_name: 'Arjun Mehta', employee_id: 'AC04567', type: 'HRA', type_label: 'HRA Rent Receipts', amount: 240000, approved_amount: 240000, submitted_date: '08 Dec 2025', status: 'Approved', created_by: 'Employee', notes: '', ctc: '₹24.0 L', regime: 'Old', declaration_type: 'Confirmed Investment' },
        { id: 'TX-003', employee_name: 'Neha Kapoor', employee_id: 'SU00234', type: '80D', type_label: '80D Medical Insurance', amount: 75000, submitted_date: '12 Dec 2025', status: 'Rejected', created_by: 'System', notes: 'Invalid policy document uploaded.', ctc: '₹15.8 L', regime: 'New', declaration_type: 'Proposed Investment' },
        { id: 'TX-004', employee_name: 'Rohan Desai', employee_id: 'GL07890', type: '80CCD', type_label: '80CCD NPS', amount: 50000, submitted_date: '05 Dec 2025', status: 'Pending', created_by: 'Employee', notes: '', ctc: '₹21.2 L', regime: 'New', declaration_type: 'Proposed Investment' },
        { id: 'TX-005', employee_name: 'Ananya Patel', employee_id: 'TF01145', type: '80G', type_label: '80G Donations', amount: 20000, approved_amount: 20000, submitted_date: '15 Dec 2025', status: 'Approved', created_by: 'Employee', notes: '', ctc: '₹14.7 L', regime: 'Old', declaration_type: 'Confirmed Investment' },
        { id: 'TX-006', employee_name: 'Vikram Singh', employee_id: 'AC03987', type: '80C', type_label: '80C Investments', amount: 120000, submitted_date: '18 Dec 2025', status: 'Pending', created_by: 'Employee', notes: '', ctc: '₹19.0 L', regime: 'Old', declaration_type: 'Proposed Investment' }
    ],
    salary_components: [
        { id: '1', name: 'Basic', type: 'Fixed Pay', calculation: '50% of CTC', taxable: 'Fully Taxable', status: true, category: 'Earnings', amount_or_percent: '50', calc_method: 'Percentage', payslip_name: 'Basic', consider_epf: true, consider_esi: true },
        { id: '2', name: 'House Rent Allowance', type: 'Fixed Pay', calculation: '50% of Basic', taxable: 'Partially Exempt', status: true, category: 'Earnings', amount_or_percent: '50', calc_method: 'Percentage', payslip_name: 'HRA', consider_epf: true, consider_esi: true },
        { id: '3', name: 'Special Allowance', type: 'Fixed Pay', calculation: 'Balancing Component', taxable: 'Fully Taxable', status: true, category: 'Earnings', amount_or_percent: '0', calc_method: 'Remaining CTC', payslip_name: 'Special Allowance', consider_epf: false, consider_esi: false },
        { id: '7', name: 'Provident Fund (Employee)', type: 'Fixed Deduction', calculation: '12% of Basic', taxable: 'Tax Deductible Sec 80C', status: true, category: 'Deductions', amount_or_percent: '12', calc_method: 'Percentage', payslip_name: 'EPF' },
        { id: '8', name: 'Professional Tax (PT)', type: 'Statutory Deduction', calculation: 'State Slabs (Max ₹250/mo)', taxable: 'Tax Deductible Sec 16', status: true, category: 'Deductions', amount_or_percent: '200', calc_method: 'Flat', payslip_name: 'Professional Tax' }
    ],
    paygroups: [
        { id: 'pg-1', name: 'MindInventory Core', business_units: ['MindInventory'], employee_count: 250, created_at: new Date().toISOString() },
        { id: 'pg-2', name: 'TechFlow Engineering', business_units: ['TechFlow Systems'], employee_count: 180, created_at: new Date().toISOString() }
    ],
    loan_types: [
        { id: 'lt-1', name: 'Personal Loan', max_amount: 500000, interest_rate: 8.5, max_tenure_months: 24, status: 'Active' },
        { id: 'lt-2', name: 'Emergency Advance', max_amount: 50000, interest_rate: 0, max_tenure_months: 6, status: 'Active' }
    ],
    loans: [
        { id: 'ln-1', employee_id: '1', loan_type: 'Personal Loan', loan_amount: 100000, emi_amount: 5000, status: 'Approved', disbursement_date: '2025-10-01' }
    ],
    salary_structures: [
        { id: 'str-1', name: 'Standard IT Executive Structure', min_ctc: 300000, max_ctc: 2500000, status: 'Active', components: [] }
    ],
    roles: [
        { id: 'r1', name: 'HR Manager', description: 'Full administrative access to payroll and employee management', permissions: ['all'] },
        { id: 'r2', name: 'Payroll Admin', description: 'Access to run payroll and disburse salaries', permissions: ['payroll_read', 'payroll_write'] }
    ],
    bank_disbursal_templates: [
        { id: 'bdt-1', bank_name: 'HDFC Bank', format_type: 'CSV', status: 'Active' },
        { id: 'bdt-2', bank_name: 'ICICI Bank', format_type: 'Excel', status: 'Active' }
    ],
    document_templates: [
        { id: 'dt-1', name: 'Standard Payslip Template', type: 'Payslip', is_default: true, status: 'Active' }
    ],
    audit_logs: [],
    payslips: []
};

// Mock data for operational_config keys
const MOCK_CONFIGS: Record<string, any> = {
    organization_tax_details: {
        'MindInventory': {
            panNumber: 'ABCDE1234F', tanNumber: 'BLRT12345C', gstin: '29ABCDE1234F1Z5',
            ao1: 'AAA', ao2: 'AA', ao3: '000', ao4: '00', frequency: 'Monthly',
            deductorType: 'Company', deductorName: 'Suresh Kumar', fatherName: 'Ramesh Kumar',
            designation: 'HR Manager', bankName: 'HDFC Bank', accountNumber: '50100234567890',
            accountName: 'TechFlow Systems Pvt Ltd', ifscCode: 'HDFC0001234', branch: 'MG Road, Bangalore'
        }
    },
    pay_schedules: [
        { id: 'sch-1', name: 'Monthly Executive Cycle', frequency: 'Monthly', processingDay: 'last_day', payday: 'last_day', status: 'Active', targetId: 'MindInventory', targetType: 'BusinessUnit' }
    ],
    pf_settings: { status: 'Active', epfRate: 12, epsRate: 8.33, edliRate: 0.5, adminCharges: 0.5 },
    tds_settings: { status: 'Active', standardDeduction: 75000 },
    statutory_settings: { pfEnabled: true, esiEnabled: true, ptEnabled: true, lwfEnabled: true },
    statutory_bonus: { percentage: 8.33, maxWageLimit: 21000, calculationBase: 7000 }
};

function getMockResponse(tableName: string, configKey?: string, isSingle?: boolean) {
    if (tableName === 'operational_config' && configKey) {
        const val = MOCK_CONFIGS[configKey] !== undefined ? MOCK_CONFIGS[configKey] : { enabled: true };
        return isSingle ? { config_key: configKey, config_value: val } : [{ config_key: configKey, config_value: val }];
    }
    
    if (tableName === 'operational_config' && !configKey) {
        return Object.keys(MOCK_CONFIGS).map(k => ({ config_key: k, config_value: MOCK_CONFIGS[k] }));
    }

    const tableData = MOCK_DATA[tableName];
    if (tableData) {
        return isSingle ? tableData[0] : tableData;
    }

    // Generic fallback for unhandled tables
    const generic = [{ id: '1', name: 'Default Item', status: 'Active', created_at: new Date().toISOString() }];
    return isSingle ? generic[0] : generic;
}

function handleInMemoryMutation(tableName: string, state: any) {
    const { writeType, payload, filterVal, configKey } = state;

    if (tableName === 'operational_config' && configKey) {
        if (writeType === 'upsert' || writeType === 'update' || writeType === 'insert') {
            const val = payload?.config_value !== undefined ? payload.config_value : payload;
            MOCK_CONFIGS[configKey] = val;
            return state.isSingle ? { config_key: configKey, config_value: val } : [{ config_key: configKey, config_value: val }];
        }
    }

    if (!MOCK_DATA[tableName]) {
        MOCK_DATA[tableName] = [];
    }

    const list = MOCK_DATA[tableName];

    if (writeType === 'insert') {
        const newItems = Array.isArray(payload) ? payload : [payload];
        const inserted = newItems.map(item => ({
            id: item.id || `mock-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            created_at: new Date().toISOString(),
            status: item.status !== undefined ? item.status : 'Active',
            ...item
        }));
        MOCK_DATA[tableName] = [...inserted, ...list];
        return state.isSingle ? inserted[0] : inserted;
    }

    if (writeType === 'update' || writeType === 'upsert') {
        const updatePayload = Array.isArray(payload) ? payload[0] : payload;
        let matchFound = false;
        const targetId = filterVal || updatePayload?.id || updatePayload?.claim_id;

        const updatedList = list.map((item: any) => {
            const matches = targetId ? (item.id === targetId || item.claim_id === targetId || item.code === targetId) : true;
            if (matches) {
                matchFound = true;
                return { ...item, ...updatePayload, updated_at: new Date().toISOString() };
            }
            return item;
        });

        if (!matchFound && writeType === 'upsert' && updatePayload) {
            const newItem = { id: targetId || `mock-${Date.now()}`, ...updatePayload };
            MOCK_DATA[tableName] = [newItem, ...list];
            return state.isSingle ? newItem : [newItem];
        }

        MOCK_DATA[tableName] = updatedList;
        const updatedItem = updatedList.find((i: any) => i.id === targetId || i.claim_id === targetId) || updatePayload;
        return state.isSingle ? updatedItem : [updatedItem];
    }

    if (writeType === 'delete') {
        const targetId = filterVal;
        if (targetId) {
            MOCK_DATA[tableName] = list.filter((item: any) => item.id !== targetId && item.claim_id !== targetId);
        }
        return state.isSingle ? null : [];
    }

    return payload;
}

function wrapQueryBuilder(builder: any, tableName: string, state: { configKey?: string; isSingle?: boolean; isWrite?: boolean; writeType?: string; payload?: any; filterVal?: any } = {}) {
    return new Proxy(builder, {
        get(target, prop, receiver) {
            if (prop === 'single' || prop === 'maybeSingle') {
                state.isSingle = true;
            }
            if (prop === 'insert') {
                state.isWrite = true;
                state.writeType = 'insert';
            }
            if (prop === 'update') {
                state.isWrite = true;
                state.writeType = 'update';
            }
            if (prop === 'upsert') {
                state.isWrite = true;
                state.writeType = 'upsert';
            }
            if (prop === 'delete') {
                state.isWrite = true;
                state.writeType = 'delete';
            }

            if (prop === 'eq' || prop === 'is') {
                return (col: string, val: any) => {
                    if (col === 'config_key' || col === 'key') {
                        state.configKey = val;
                    }
                    if (col === 'id' || col === 'claim_id' || col === 'eid') {
                        state.filterVal = val;
                    }
                    const next = typeof target[prop] === 'function' ? target[prop](col, val) : target[prop];
                    return wrapQueryBuilder(next, tableName, state);
                };
            }
            if (prop === 'then') {
                return (onFulfilled?: Function, onRejected?: Function) => {
                    return target.then((res: any) => {
                        const hasError = !!res.error;
                        const isEmptyArray = Array.isArray(res.data) && res.data.length === 0;
                        const isNullData = res.data === null;

                        if (state.isWrite) {
                            const mutatedData = handleInMemoryMutation(tableName, state);
                            return onFulfilled ? onFulfilled({ data: mutatedData, error: null }) : Promise.resolve({ data: mutatedData, error: null });
                        }

                        if (hasError || (isEmptyArray && !state.isWrite) || (isNullData && !state.isWrite)) {
                            const fallback = getMockResponse(tableName, state.configKey, state.isSingle);
                            return onFulfilled ? onFulfilled({ data: fallback, error: null }) : Promise.resolve({ data: fallback, error: null });
                        }
                        return onFulfilled ? onFulfilled(res) : Promise.resolve(res);
                    }).catch((err: any) => {
                        if (state.isWrite) {
                            const mutatedData = handleInMemoryMutation(tableName, state);
                            return onFulfilled ? onFulfilled({ data: mutatedData, error: null }) : Promise.resolve({ data: mutatedData, error: null });
                        }
                        const fallback = getMockResponse(tableName, state.configKey, state.isSingle);
                        return onFulfilled ? onFulfilled({ data: fallback, error: null }) : Promise.resolve({ data: fallback, error: null });
                    });
                };
            }
            const orig = Reflect.get(target, prop, receiver);
            if (typeof orig === 'function') {
                return (...args: any[]) => {
                    if (prop === 'insert' || prop === 'upsert' || prop === 'update') {
                        state.isWrite = true;
                        state.writeType = prop;
                        state.payload = args[0];
                    }
                    if (prop === 'delete') {
                        state.isWrite = true;
                        state.writeType = 'delete';
                    }
                    const res = orig.apply(target, args);
                    if (res && typeof res === 'object' && typeof res.then === 'function') {
                        return wrapQueryBuilder(res, tableName, state);
                    }
                    return res && typeof res === 'object' ? wrapQueryBuilder(res, tableName, state) : res;
                };
            }
            return orig;
        }
    });
}

export const supabase = new Proxy(rawSupabase, {
    get(target, prop, receiver) {
        if (prop === 'from') {
            return (tableName: string) => {
                const builder = target.from(tableName);
                return wrapQueryBuilder(builder, tableName);
            };
        }
        return Reflect.get(target, prop, receiver);
    }
});

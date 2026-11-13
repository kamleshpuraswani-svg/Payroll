import React, { useEffect, useMemo, useState } from 'react';
import { X, Send, Search, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { MOCK_PAYROLL_EMPLOYEES } from './CompanyActionModals';

interface SendPayslipsModalProps {
    payroll: { id: string; month: string; businessUnit: string };
    /** Employees already released in this session (e.g. from Run Payroll → Step 6) */
    previouslySentIds: string[];
    onClose: () => void;
    onSent: (employeeIds: string[]) => void;
}

interface EmployeeRow {
    id: string;
    employeeCode: string;
    name: string;
    department: string;
    /** Backed by a real payroll_adjustments row (can be written to payslips) */
    adjustment?: any;
}

const netPayFromAdjustment = (a: any) =>
    (a.gross || 0) + (a.bonus || 0) + (a.arrears || 0) + (a.expense_reimbursement || 0) + (a.lop_reversal || 0) + (a.other || 0)
    - (a.loan_recovery || 0) - (a.salary_advance_recovery || 0) - (a.actual_tds || 0);

const SendPayslipsModal: React.FC<SendPayslipsModalProps> = ({ payroll, previouslySentIds, onClose, onSent }) => {
    const [rows, setRows] = useState<EmployeeRow[]>([]);
    const [sentIds, setSentIds] = useState<Set<string>>(new Set());
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [runId, setRunId] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [sentCount, setSentCount] = useState<number | null>(null);
    const [error, setError] = useState('');

    const [monthName, yearStr] = payroll.month.split(' ');

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            setIsLoading(true);
            const alreadySent = new Set(previouslySentIds);
            let loadedRows: EmployeeRow[] = [];
            let foundRunId: string | null = null;

            try {
                const { data: runs } = await supabase
                    .from('payroll_runs')
                    .select('id')
                    .eq('month', monthName)
                    .eq('year', parseInt(yearStr, 10))
                    .limit(1);

                const run = runs?.[0];
                if (run) {
                    foundRunId = run.id;
                    const [{ data: adjustments }, { data: payslips }] = await Promise.all([
                        supabase.from('payroll_adjustments').select('*, employees(*)').eq('payroll_run_id', run.id),
                        supabase.from('payslips').select('employee_id').eq('payroll_run_id', run.id),
                    ]);

                    (payslips || []).forEach(p => alreadySent.add(p.employee_id));

                    loadedRows = (adjustments || []).map(a => {
                        const emp = a.employees || {};
                        const fullName = emp.name || [emp.first_name, emp.last_name].filter(Boolean).join(' ');
                        return {
                            id: a.employee_id,
                            employeeCode: emp.eid || emp.employee_id || '',
                            name: fullName || a.employee_id,
                            department: emp.department || '—',
                            adjustment: a,
                        };
                    });
                }
            } catch (err) {
                console.error('Error loading payroll employees:', err);
            }

            // No persisted run for this month — fall back to the same demo employees the Run Payroll wizard uses
            if (loadedRows.length === 0) {
                const units = payroll.businessUnit.split(',').map(u => u.trim().toLowerCase()).filter(Boolean);
                loadedRows = MOCK_PAYROLL_EMPLOYEES
                    .filter(e => e.payrollStatus !== 'On Hold')
                    .filter(e => units.length === 0 || units.includes((e.business_unit || '').toLowerCase()))
                    .map(e => ({
                        id: e.id,
                        employeeCode: e.employee_id,
                        name: `${e.first_name} ${e.last_name}`,
                        department: e.department || '—',
                    }));
            }

            if (cancelled) return;
            setRunId(foundRunId);
            setRows(loadedRows);
            setSentIds(alreadySent);
            // Employees who already received payslips start selected
            setSelectedIds(loadedRows.filter(r => alreadySent.has(r.id)).map(r => r.id));
            setIsLoading(false);
        };

        load();
        return () => { cancelled = true; };
        // Load once per opened payroll; later session updates don't reset the user's selection
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [payroll.id]);

    const visibleRows = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return rows;
        return rows.filter(r =>
            r.name.toLowerCase().includes(q) ||
            r.employeeCode.toLowerCase().includes(q) ||
            r.department.toLowerCase().includes(q)
        );
    }, [rows, search]);

    const visibleIds = visibleRows.map(r => r.id);
    const visibleSelectedCount = visibleIds.filter(id => selectedIds.includes(id)).length;
    const allVisibleSelected = visibleIds.length > 0 && visibleSelectedCount === visibleIds.length;

    const toggleOne = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const toggleAllVisible = () => {
        setSelectedIds(prev => allVisibleSelected
            ? prev.filter(id => !visibleIds.includes(id))
            : [...new Set([...prev, ...visibleIds])]
        );
    };

    const handleSend = async () => {
        if (selectedIds.length === 0) return;
        setIsSending(true);
        setError('');
        try {
            if (runId) {
                const records = rows
                    .filter(r => r.adjustment && selectedIds.includes(r.id))
                    .map(r => ({
                        employee_id: r.id,
                        payroll_run_id: runId,
                        month: monthName,
                        year: yearStr,
                        net_pay: netPayFromAdjustment(r.adjustment),
                    }));
                if (records.length > 0) {
                    const { error: upsertError } = await supabase
                        .from('payslips')
                        .upsert(records, { onConflict: 'employee_id,month,year' });
                    if (upsertError) throw upsertError;
                }
            }

            const resentCount = selectedIds.filter(id => sentIds.has(id)).length;
            await supabase.from('audit_logs').insert({
                id: crypto.randomUUID(),
                action: `Payslips & taxslips sent for ${payroll.month} to ${selectedIds.length} employee(s)` +
                    (resentCount > 0 ? ` (${resentCount} resent)` : ''),
                user_name: 'HR Manager',
                severity: 'High',
                timestamp_label: new Date().toLocaleString(),
            });

            onSent(selectedIds);
            setSentCount(selectedIds.length);
        } catch (err) {
            console.error('Error sending payslips:', err);
            setError('Could not send payslips. Please try again.');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-start gap-4">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">Send Payslips & Taxslips: {payroll.month}</h3>
                        <p className="text-xs text-slate-500 mt-1">
                            Employees who already received payslips are pre-selected. Keep them selected to resend, or deselect them to skip.
                        </p>
                    </div>
                    <button onClick={onClose} aria-label="Close" className="p-1 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                        <X size={22} />
                    </button>
                </div>

                {sentCount !== null ? (
                    <div className="px-6 py-12 flex flex-col items-center text-center">
                        <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                            <CheckCircle size={28} className="text-emerald-500" />
                        </div>
                        <p className="text-base font-semibold text-slate-800">Payslips & taxslips sent</p>
                        <p className="text-sm text-slate-500 mt-1">{sentCount} employee(s) for {payroll.month}.</p>
                    </div>
                ) : (
                    <>
                        <div className="px-6 py-3 flex items-center gap-3 border-b border-slate-100">
                            <div className="relative flex-1">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Search by name, ID or department"
                                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                                />
                            </div>
                            <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full border border-indigo-100 whitespace-nowrap">
                                {selectedIds.length} of {rows.length} selected
                            </span>
                        </div>

                        <div className="flex-1 overflow-y-auto min-h-[200px]">
                            {isLoading ? (
                                <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
                                    <Loader2 size={18} className="animate-spin" /> Loading employees...
                                </div>
                            ) : visibleRows.length === 0 ? (
                                <p className="py-16 text-center text-sm text-slate-400">
                                    {rows.length === 0 ? 'No employees found for this payroll.' : 'No employees match your search.'}
                                </p>
                            ) : (
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 sticky top-0 z-10">
                                        <tr className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                            <th className="px-6 py-3 w-12">
                                                <input
                                                    type="checkbox"
                                                    aria-label="Select all employees"
                                                    checked={allVisibleSelected}
                                                    ref={el => { if (el) el.indeterminate = visibleSelectedCount > 0 && !allVisibleSelected; }}
                                                    onChange={toggleAllVisible}
                                                    disabled={isSending}
                                                    className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer disabled:opacity-50 border-slate-300"
                                                />
                                            </th>
                                            <th className="px-3 py-3">Employee Name</th>
                                            <th className="px-3 py-3">Department</th>
                                            <th className="px-6 py-3 text-right">Payslip Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {visibleRows.map(row => {
                                            const isSelected = selectedIds.includes(row.id);
                                            const alreadySent = sentIds.has(row.id);
                                            return (
                                                <tr
                                                    key={row.id}
                                                    onClick={() => !isSending && toggleOne(row.id)}
                                                    className={`cursor-pointer ${isSelected ? 'bg-indigo-50/40' : 'hover:bg-slate-50'}`}
                                                >
                                                    <td className="px-6 py-3">
                                                        <input
                                                            type="checkbox"
                                                            aria-label={`Select ${row.name}`}
                                                            checked={isSelected}
                                                            onChange={() => toggleOne(row.id)}
                                                            onClick={e => e.stopPropagation()}
                                                            disabled={isSending}
                                                            className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer disabled:opacity-50 border-slate-300"
                                                        />
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        <p className="font-medium text-slate-800">{row.name}</p>
                                                        {row.employeeCode && <p className="text-xs text-slate-400">{row.employeeCode}</p>}
                                                    </td>
                                                    <td className="px-3 py-3 text-slate-600">{row.department}</td>
                                                    <td className="px-6 py-3 text-right">
                                                        {alreadySent ? (
                                                            <span className="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-100">
                                                                <CheckCircle size={12} /> Sent
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs font-semibold bg-slate-50 text-slate-500 px-2 py-0.5 rounded-full border border-slate-200">Not sent</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </>
                )}

                <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3">
                    {error && <p className="flex-1 text-sm text-rose-600">{error}</p>}
                    {sentCount !== null ? (
                        <button onClick={onClose} className="px-5 py-2.5 border border-slate-300 text-slate-700 font-semibold text-sm rounded-lg hover:bg-slate-50 transition-colors">Close</button>
                    ) : (
                        <>
                            <button onClick={onClose} disabled={isSending} className="px-5 py-2.5 border border-slate-300 text-slate-700 font-semibold text-sm rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50">Cancel</button>
                            <button
                                onClick={handleSend}
                                disabled={isLoading || isSending || selectedIds.length === 0}
                                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                {isSending ? 'Sending...' : `Send (${selectedIds.length})`}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SendPayslipsModal;

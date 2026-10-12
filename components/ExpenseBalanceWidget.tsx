import React, { useEffect, useMemo, useState } from 'react';
import {
  Wallet,
  Heart,
  Fuel,
  BookOpen,
  Plane,
  Smartphone,
  Wifi,
  Utensils,
  Receipt,
  RotateCw,
  Lock,
  Info,
  ArrowRight,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '../services/supabaseClient';

// Hardcoded for prototype, same as Reimbursements.tsx
const EMPLOYEE_ID = '1';

type Frequency = 'Monthly' | 'Yearly' | 'Once per tenure';

interface Cycle {
  start: Date;
  end: Date | null; // null = never resets (Once per tenure)
  resetsOn: Date | null;
}

interface CategoryBalance {
  id: string;
  name: string;
  frequency: Frequency;
  resetCycle: string;
  limit: number; // 0 = no limit
  fullLimit: number; // limit before pro-rata
  used: number;
  inReview: number;
  cycle: Cycle;
}

const USED_STATUSES = ['approved', 'settled'];
const IN_REVIEW_STATUSES = ['pending', 'action_required'];

// Higher number = more specific rule; the most specific matching rule wins
const RULE_PRIORITY: Record<string, number> = {
  'Employee': 5,
  'Designation': 4,
  'Department': 3,
  'Employee Status': 2,
  'Business Unit': 1
};

const formatINR = (val: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

const formatDate = (d: Date) =>
  d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

// Accepts YYYY-MM-DD, ISO timestamps, DD/MM/YYYY and DD-MM-YYYY
const parseDate = (value?: string | null): Date | null => {
  if (!value) return null;
  const s = String(value).trim();
  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  m = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (m) return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : startOfDay(d);
};

// Joining anniversary in a given year; 29 Feb falls back to 28 Feb in non-leap years
const anniversaryIn = (year: number, join: Date) =>
  new Date(year, join.getMonth(), Math.min(join.getDate(), daysInMonth(year, join.getMonth())));

export const getCurrentCycle = (
  frequency: Frequency,
  resetCycle: string,
  joinDate: Date | null,
  today: Date
): Cycle => {
  const y = today.getFullYear();
  const mo = today.getMonth();

  if (frequency === 'Monthly') {
    const start = new Date(y, mo, 1);
    const resetsOn = new Date(y, mo + 1, 1);
    return { start, end: addDays(resetsOn, -1), resetsOn };
  }

  if (frequency === 'Once per tenure') {
    const start = joinDate || new Date(y, 0, 1);
    return { start, end: null, resetsOn: null };
  }

  // Yearly: reset_cycle is only meaningful for Yearly rules
  if (resetCycle === 'Financial Year') {
    const fyStartYear = mo >= 3 ? y : y - 1;
    const start = new Date(fyStartYear, 3, 1);
    const resetsOn = new Date(fyStartYear + 1, 3, 1);
    return { start, end: addDays(resetsOn, -1), resetsOn };
  }

  if (resetCycle === "Employee's Joining Date" && joinDate) {
    let start = anniversaryIn(y, joinDate);
    if (start > today) start = anniversaryIn(y - 1, joinDate);
    if (start < joinDate) start = joinDate;
    const resetsOn = anniversaryIn(start.getFullYear() + 1, joinDate);
    return { start, end: addDays(resetsOn, -1), resetsOn };
  }

  // Calendar Year (Jan-Dec), also the fallback when joining date is missing
  const start = new Date(y, 0, 1);
  const resetsOn = new Date(y + 1, 0, 1);
  return { start, end: addDays(resetsOn, -1), resetsOn };
};

// Reduces the limit when the employee joined in the middle of the cycle
const applyProRata = (limit: number, frequency: Frequency, resetCycle: string, cycle: Cycle, joinDate: Date | null) => {
  if (!joinDate || !cycle.end || joinDate <= cycle.start || joinDate > cycle.end) return limit;
  if (frequency === 'Monthly') {
    const total = daysInMonth(cycle.start.getFullYear(), cycle.start.getMonth());
    return Math.round((limit * (total - joinDate.getDate() + 1)) / total);
  }
  if (frequency === 'Yearly' && resetCycle !== "Employee's Joining Date") {
    const monthsLeft =
      (cycle.end.getFullYear() - joinDate.getFullYear()) * 12 + (cycle.end.getMonth() - joinDate.getMonth()) + 1;
    return Math.round((limit * monthsLeft) / 12);
  }
  return limit;
};

const ruleMatches = (rule: any, emp: any) => {
  const value = String(rule.id || rule.name || '').toLowerCase();
  const empName = (emp.name || `${emp.first_name || ''} ${emp.last_name || ''}`).trim();
  const fieldByType: Record<string, string | undefined> = {
    'Business Unit': emp.business_unit || emp.company || emp.company_id,
    'bu': emp.business_unit || emp.company || emp.company_id,
    'Department': emp.department,
    'dept': emp.department,
    'Designation': emp.designation,
    'desig': emp.designation,
    'Employee Status': emp.status,
    'Employee': empName
  };
  const field = fieldByType[rule.type];
  return !!field && String(field).toLowerCase() === value;
};

const getCategoryIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('medic') || n.includes('health')) return Heart;
  if (n.includes('fuel') || n.includes('convey') || n.includes('cab')) return Fuel;
  if (n.includes('lta') || n.includes('travel') || n.includes('flight')) return Plane;
  if (n.includes('book') || n.includes('learn') || n.includes('course')) return BookOpen;
  if (n.includes('mobile') || n.includes('phone') || n.includes('communication')) return Smartphone;
  if (n.includes('internet') || n.includes('broadband') || n.includes('wifi')) return Wifi;
  if (n.includes('meal') || n.includes('food')) return Utensils;
  return Receipt;
};

const getFrequencyChip = (frequency: Frequency, resetCycle?: string): string => {
  if (frequency === 'Monthly') return 'Monthly';
  if (frequency === 'Once per tenure') return 'Once Per Tenure';
  return 'Yearly';
};

// Sample data, shown only when categories cannot be loaded, so the design can still be reviewed
const buildSampleBalances = (today: Date): CategoryBalance[] => {
  const join = new Date(2025, 6, 14);
  const make = (id: string, name: string, frequency: Frequency, resetCycle: string, limit: number, used: number, inReview: number): CategoryBalance => ({
    id, name, frequency, resetCycle, limit, fullLimit: limit, used, inReview,
    cycle: getCurrentCycle(frequency, resetCycle, join, today)
  });
  return [
    make('s-med', 'Medical', 'Yearly', 'Financial Year', 15000, 1250, 500),
    make('s-fuel', 'Fuel and conveyance', 'Monthly', '', 24000, 2000, 0),
    make('s-net', 'Internet', 'Monthly', '', 2000, 500, 0),
    make('s-books', 'Books and periodicals', 'Monthly', 'Calendar Year (Jan-Dec)', 6000, 5000, 0),
    make('s-learn', 'Learning & certification', 'Yearly', "Employee's Joining Date", 20000, 4500, 0),
    make('s-lta', 'LTA (travel)', 'Once per tenure', '', 45000, 0, 0)
  ];
};

interface ExpenseBalanceWidgetProps {
  onNavigateToReimbursements?: () => void;
}

const ExpenseBalanceWidget: React.FC<ExpenseBalanceWidgetProps> = ({ onNavigateToReimbursements }) => {
  const [balances, setBalances] = useState<CategoryBalance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSample, setIsSample] = useState(false);
  const today = useMemo(() => startOfDay(new Date()), []);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setIsLoading(true);
      try {
        const [empRes, catRes, claimRes] = await Promise.all([
          Promise.resolve(supabase.from('employees').select('*').eq('id', EMPLOYEE_ID).maybeSingle()).catch(() => ({ data: null, error: null })),
          Promise.resolve(supabase.from('expense_categories').select('*').eq('status', 'Active')).catch(() => ({ data: null, error: null })),
          Promise.resolve(supabase.from('reimbursement_claims').select('*').eq('employee_id', EMPLOYEE_ID)).catch(() => ({ data: null, error: null }))
        ]);

        if (!isMounted) return;

        if (!catRes?.data || catRes.data.length === 0) {
          setBalances(buildSampleBalances(today));
          setIsSample(true);
          setIsLoading(false);
          return;
        }

        const emp = empRes?.data || {};
        const joinDate = parseDate(emp.join_date || emp.created_at);
        const claims = claimRes?.data || [];

        const calculatedBalances: CategoryBalance[] = catRes.data.map((cat: any) => {
          const frequency: Frequency = (cat.frequency as Frequency) || 'Monthly';
          const resetCycle = cat.reset_cycle || 'Calendar Year (Jan-Dec)';
          const cycle = getCurrentCycle(frequency, resetCycle, joinDate, today);

          let limit = Number(cat.max_limit || 0);
          if (Array.isArray(cat.applicable_to) && cat.applicable_to.length > 0) {
            const matchingRules = cat.applicable_to.filter((r: any) => ruleMatches(r, emp));
            if (matchingRules.length > 0) {
              const bestRule = matchingRules.sort((a: any, b: any) => (RULE_PRIORITY[b.type] || 0) - (RULE_PRIORITY[a.type] || 0))[0];
              limit = Number(bestRule.max_limit ?? limit);
            }
          }

          const fullLimit = limit;
          if (cat.pro_rata) {
            limit = applyProRata(limit, frequency, resetCycle, cycle, joinDate);
          }

          const catClaims = claims.filter((c: any) => {
            const matchesCat = String(c.category || '').toLowerCase() === String(cat.name || '').toLowerCase() || c.category_id === cat.id;
            if (!matchesCat) return false;
            const claimDate = parseDate(c.expense_date || c.created_at);
            if (!claimDate) return true;
            if (cycle.end) {
              return claimDate >= cycle.start && claimDate <= cycle.end;
            }
            return claimDate >= cycle.start;
          });

          const used = catClaims
            .filter((c: any) => USED_STATUSES.includes(String(c.status || '').toLowerCase()))
            .reduce((sum: number, c: any) => sum + Number(c.amount || 0), 0);

          const inReview = catClaims
            .filter((c: any) => IN_REVIEW_STATUSES.includes(String(c.status || '').toLowerCase()))
            .reduce((sum: number, c: any) => sum + Number(c.amount || 0), 0);

          return {
            id: cat.id,
            name: cat.name,
            frequency,
            resetCycle,
            limit,
            fullLimit,
            used,
            inReview,
            cycle
          };
        });

        setBalances(calculatedBalances.length > 0 ? calculatedBalances : buildSampleBalances(today));
      } catch (err) {
        if (isMounted) {
          setBalances(buildSampleBalances(today));
          setIsSample(true);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [today]);

  return (
    <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Wallet size={18} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Expense & Reimbursement Balance</h3>
            <p className="text-xs text-slate-400">Live category-wise spending limits and reset cycles</p>
          </div>
        </div>
        {onNavigateToReimbursements && (
          <button
            type="button"
            onClick={onNavigateToReimbursements}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
          >
            View all claims <ArrowRight size={13} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {balances.map((item) => {
          const Icon = getCategoryIcon(item.name);
          const hasLimit = item.limit > 0;
          const percentage = hasLimit ? Math.min(100, (item.used / item.limit) * 100) : 0;
          const available = hasLimit ? Math.max(0, item.limit - item.used) : 0;

          return (
            <div
              key={item.id}
              className="p-4 rounded-xl border border-slate-200/90 bg-white hover:border-blue-300 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header: Icon + Name + Frequency Pill Badge matching reference image */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Icon size={16} />
                    </div>
                    <span className="text-sm font-semibold text-slate-800 truncate">{item.name}</span>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-0.5 bg-sky-50 text-sky-600 rounded-full shrink-0">
                    {getFrequencyChip(item.frequency, item.resetCycle)}
                  </span>
                </div>

                {/* Amount Used */}
                <div className="mb-1">
                  <div className="text-lg font-bold text-slate-900 leading-tight">
                    {formatINR(item.used)} <span className="text-xs font-normal text-slate-500">used</span>
                  </div>
                </div>

                {/* Limit or Available */}
                <div className="text-xs text-slate-500 font-medium mb-2.5">
                  {hasLimit ? (
                    <div className="flex items-center justify-between">
                      <span>{formatINR(available)} available</span>
                      <span className="text-slate-400">Limit: {formatINR(item.limit)}</span>
                    </div>
                  ) : (
                    <span>No limit</span>
                  )}
                </div>

                {/* Progress bar if has limit */}
                {hasLimit && (
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mb-2">
                    <div
                      className={`h-1.5 rounded-full ${
                        percentage >= 100 ? 'bg-rose-500' : percentage >= 80 ? 'bg-amber-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${percentage.toFixed(1)}%` }}
                    />
                  </div>
                )}

                {item.inReview > 0 && (
                  <div className="text-[11px] font-medium text-amber-600 mb-2">
                    + {formatINR(item.inReview)} in review
                  </div>
                )}
              </div>

              {/* Bottom Footer: Resets date & Raise claim link */}
              <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <div
                  className="flex items-center gap-1.5 text-slate-400 text-[11px] truncate"
                  title={item.cycle.resetsOn ? `Resets ${formatDate(item.cycle.resetsOn)} · unused lapses` : 'Never resets'}
                >
                  <RotateCw size={11} className="shrink-0" />
                  <span className="truncate">
                    {item.frequency === 'Once per tenure'
                      ? 'Never resets · unused carries forward'
                      : item.cycle.resetsOn
                      ? `Resets ${formatDate(item.cycle.resetsOn)} · unused lapses`
                      : 'Resets annually'}
                  </span>
                </div>

                {onNavigateToReimbursements && (
                  <button
                    type="button"
                    onClick={onNavigateToReimbursements}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 shrink-0 ml-2 cursor-pointer"
                  >
                    Raise claim <ArrowRight size={12} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExpenseBalanceWidget;

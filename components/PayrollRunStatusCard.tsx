import React, { useMemo, useState } from 'react';
import { CheckCircle2, Clock, FileText, AlertTriangle, Info, ArrowRight, CalendarClock, ClipboardList } from 'lucide-react';

// Payroll run state for one business unit, derived from its last completed run,
// any run in progress, and the pay date from its pay schedule.

type RunState = 'IN_PROGRESS' | 'NOT_STARTED' | 'OVERDUE' | 'UP_TO_DATE' | 'NO_PAYROLL';

// Mock scenarios: every RunState, plus a run that is still in progress after its pay date
export type PreviewScenario = RunState | 'IN_PROGRESS_OVERDUE';

interface Period {
  y: number;
  m: number; // 0-based month
}

interface RunCounts {
  employees: number;
  processed: number;
  onHold: number;
  fnfSettlement: number;
}

export interface PayrollRunInfo {
  payDay: number; // day of the following month on which salary is paid
  lastCompleted?: Period & RunCounts;
  inProgress?: Period & RunCounts;
}

interface DerivedRunStatus {
  state: RunState;
  period?: Period; // the payroll that needs attention (or the next one when up to date)
  isOverdue: boolean;
  payDate?: Date;
  otherPending: Period[];
}

const STATE_LABELS: Record<RunState, string> = {
  IN_PROGRESS: 'In Progress',
  NOT_STARTED: 'Not Started',
  OVERDUE: 'Overdue',
  UP_TO_DATE: 'Paid',
  NO_PAYROLL: 'No Payroll'
};

const addMonths = (p: Period, n: number): Period => {
  const d = new Date(p.y, p.m + n, 1);
  return { y: d.getFullYear(), m: d.getMonth() };
};

const isBefore = (a: Period, b: Period) => a.y < b.y || (a.y === b.y && a.m < b.m);

const sameOrBefore = (a: Period, b: Period) => !isBefore(b, a);

const payDateOf = (p: Period, payDay: number) => {
  const next = addMonths(p, 1);
  const lastDay = new Date(next.y, next.m + 1, 0).getDate();
  return new Date(next.y, next.m, Math.min(payDay, lastDay));
};

const formatPeriod = (p: Period) =>
  new Date(p.y, p.m, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

const formatDate = (d: Date) =>
  d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export const derivePayrollRunStatus = (info: PayrollRunInfo, today: Date): DerivedRunStatus => {
  const current: Period = { y: today.getFullYear(), m: today.getMonth() };
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  if (!info.lastCompleted && !info.inProgress) {
    return { state: 'NO_PAYROLL', isOverdue: false, otherPending: [] };
  }

  // Every period after the last completed one, up to the current month, still needs a payroll run
  const pending: Period[] = [];
  let p = info.lastCompleted ? addMonths(info.lastCompleted, 1) : (info.inProgress as Period);
  while (sameOrBefore(p, current)) {
    pending.push(p);
    p = addMonths(p, 1);
  }

  if (info.inProgress) {
    const payDate = payDateOf(info.inProgress, info.payDay);
    return {
      state: 'IN_PROGRESS',
      period: info.inProgress,
      isOverdue: todayStart > payDate,
      payDate,
      otherPending: pending.filter(x => isBefore(info.inProgress as Period, x))
    };
  }

  if (pending.length === 0) {
    const next = addMonths(info.lastCompleted as Period, 1);
    return { state: 'UP_TO_DATE', period: next, isOverdue: false, payDate: payDateOf(next, info.payDay), otherPending: [] };
  }

  const payDate = payDateOf(pending[0], info.payDay);
  const isOverdue = todayStart > payDate;
  return {
    state: isOverdue ? 'OVERDUE' : 'NOT_STARTED',
    period: pending[0],
    isOverdue,
    payDate,
    otherPending: pending.slice(1)
  };
};

// Mock run history per business unit, relative to today, so each state can be seen on the dashboard.
// Replace with real payroll run data and the pay date from the business unit's Pay Schedule.
const MOCK_PAY_DAY = 7;

export const buildMockRunInfo = (bu: string, counts: RunCounts, today: Date, forced?: PreviewScenario): PayrollRunInfo => {
  const current: Period = { y: today.getFullYear(), m: today.getMonth() };
  const scenarios: Record<PreviewScenario, PayrollRunInfo> = {
    OVERDUE: { payDay: MOCK_PAY_DAY, lastCompleted: { ...addMonths(current, -2), ...counts } },
    IN_PROGRESS: {
      payDay: MOCK_PAY_DAY,
      lastCompleted: { ...addMonths(current, -1), ...counts },
      inProgress: { ...current, ...counts }
    },
    IN_PROGRESS_OVERDUE: {
      payDay: MOCK_PAY_DAY,
      lastCompleted: { ...addMonths(current, -2), ...counts },
      inProgress: { ...addMonths(current, -1), ...counts }
    },
    NOT_STARTED: { payDay: MOCK_PAY_DAY, lastCompleted: { ...addMonths(current, -1), ...counts } },
    UP_TO_DATE: { payDay: MOCK_PAY_DAY, lastCompleted: { ...current, ...counts } },
    NO_PAYROLL: { payDay: MOCK_PAY_DAY }
  };
  if (forced) return scenarios[forced];

  const defaultByBu: Record<string, RunState> = {
    'CollabCRM': 'OVERDUE',
    '300 Minds': 'IN_PROGRESS',
    'MindInventory': 'NOT_STARTED',
    'BlueWhale Tech': 'NO_PAYROLL'
  };
  return scenarios[defaultByBu[bu] || 'UP_TO_DATE'];
};

const isDev = Boolean((import.meta as any).env?.DEV);

interface PayrollRunStatusCardProps {
  businessUnit: string;
  counts: RunCounts;
  pager?: React.ReactNode;
  onRunPayroll?: () => void;
  forcedState?: PreviewScenario; // pins the card to one mock scenario (used by the state preview section)
}

const PayrollRunStatusCard: React.FC<PayrollRunStatusCardProps> = ({ businessUnit, counts, pager, onRunPayroll, forcedState }) => {
  const today = useMemo(() => new Date(), []);
  const [previewState, setPreviewState] = useState<RunState | ''>('');

  const info = buildMockRunInfo(businessUnit, counts, today, forcedState || previewState || undefined);
  const status = derivePayrollRunStatus(info, today);
  const { state, period, isOverdue, payDate, otherPending } = status;
  const last = info.lastCompleted;
  const run = info.inProgress;

  const badgeTone =
    state === 'OVERDUE' || isOverdue
      ? 'text-rose-700 bg-rose-50 border-rose-200'
      : state === 'NOT_STARTED'
        ? 'text-amber-700 bg-amber-50 border-amber-200'
        : state === 'IN_PROGRESS'
          ? 'text-indigo-700 bg-indigo-50 border-indigo-200'
          : 'text-emerald-700 bg-emerald-50 border-emerald-200';

  const isCardOverduePaid = forcedState === 'IN_PROGRESS_OVERDUE' || (state === 'IN_PROGRESS' && isOverdue) || state === 'OVERDUE' || forcedState === 'OVERDUE';
  const periodBadgeTone = isCardOverduePaid
    ? 'text-blue-700 bg-blue-50 border-blue-200'
    : badgeTone;
  const statusBadgeTone = isCardOverduePaid
    ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
    : badgeTone;
  const statusBadgeLabel = isCardOverduePaid
    ? 'Paid'
    : (isOverdue ? 'Overdue' : STATE_LABELS[state]);

  const periodLabel = state === 'UP_TO_DATE'
    ? 'September 2026'
    : (state === 'OVERDUE' || forcedState === 'OVERDUE')
      ? 'August 2026'
      : period
        ? formatPeriod(period)
        : '';

  const doneCount = (state === 'IN_PROGRESS' || state === 'UP_TO_DATE') ? (run?.processed ?? counts.processed) : 0;

  const runButton = onRunPayroll && (
    <button
      type="button"
      onClick={onRunPayroll}
      className="mt-2 w-full flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg py-1.5 transition-colors cursor-pointer"
    >
      {state === 'IN_PROGRESS' || state === 'UP_TO_DATE' ? 'Continue Payroll' : 'Run Payroll'} <ArrowRight size={13} />
    </button>
  );

  const lastProcessedLine = last && state !== 'IN_PROGRESS' && state !== 'UP_TO_DATE' && (
    <p className="text-[11px] text-slate-500 pt-1">
      Last processed: <span className="font-semibold text-slate-700">{formatPeriod(last)}</span>
    </p>
  );

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-start">
      <div className="flex justify-between items-center mb-3 gap-2">
        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 shrink-0">
          <CheckCircle2 size={16} className="text-emerald-600" />
          Payroll Run Status
          <span className="relative group">
            <Info size={13} className="text-slate-400 cursor-help" />
            <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-5 z-20 w-64 rounded-lg bg-slate-800 px-3 py-2 text-[11px] font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
              Shows the status of the next payroll to be processed: how many employees are processed, on hold, or in full &amp; final settlement. Flags payrolls that are overdue.
            </span>
          </span>
        </h3>
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {(period || state === 'UP_TO_DATE') && (
            <span className={`text-[10px] font-bold border px-2 py-1 rounded-md shrink-0 whitespace-nowrap ${periodBadgeTone}`}>
              Payroll Period: {periodLabel}
            </span>
          )}
          {state !== 'NO_PAYROLL' && (
            <span className={`text-[10px] font-bold border px-2 py-1 rounded-md shrink-0 whitespace-nowrap ${statusBadgeTone}`}>
              {statusBadgeLabel}
            </span>
          )}
          {pager}
        </div>
      </div>

      {isDev && !forcedState && (
        <div className="mb-2 flex items-center justify-end gap-1.5">
          <span className="text-[10px] font-semibold text-violet-600">Preview state (dev only):</span>
          <select
            value={previewState}
            onChange={e => setPreviewState(e.target.value as RunState | '')}
            className="text-[10px] font-semibold text-slate-700 border border-violet-200 rounded px-1 py-0.5 bg-violet-50"
          >
            <option value="">Default for this BU</option>
            {(Object.keys(STATE_LABELS) as RunState[]).map(s => (
              <option key={s} value={s}>{STATE_LABELS[s]}</option>
            ))}
          </select>
        </div>
      )}

      {state === 'NO_PAYROLL' ? (
        <div className="py-4 text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-50 flex items-center justify-center mb-2">
            <ClipboardList size={20} className="text-slate-400" />
          </div>
          <p className="text-xs font-semibold text-slate-700">No payroll has been run for {businessUnit} yet.</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Set up the pay schedule to get started.</p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-500 font-semibold pb-1.5 border-b border-slate-100 mb-1">
            <span className="font-bold text-slate-800 text-xs">{businessUnit}</span>
            <span className={`font-bold ${(state === 'IN_PROGRESS' || state === 'UP_TO_DATE') ? 'text-emerald-600' : 'text-slate-400'}`}>
              {doneCount}/{counts.employees}
            </span>
          </div>

          {(state === 'IN_PROGRESS' || state === 'UP_TO_DATE') && (
            <>
              <div className="flex justify-between items-center bg-emerald-50 rounded-lg px-2.5 py-1.5">
                <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5"><CheckCircle2 size={13} /> Processed</span>
                <span className="text-xs font-black text-emerald-800">{run?.processed ?? counts.processed}</span>
              </div>
              <div className="flex justify-between items-center bg-amber-50 rounded-lg px-2.5 py-1.5">
                <span className="text-xs font-bold text-amber-800 flex items-center gap-1.5"><Clock size={13} /> On Hold</span>
                <span className="text-xs font-black text-amber-800">{run?.onHold ?? counts.onHold}</span>
              </div>
              <div className="flex justify-between items-center bg-blue-50 rounded-lg px-2.5 py-1.5">
                <span className="text-xs font-bold text-blue-800 flex items-center gap-1.5"><FileText size={13} /> F&amp;F Settlement</span>
                <span className="text-xs font-black text-blue-800">{run?.fnfSettlement ?? counts.fnfSettlement}</span>
              </div>
              {state === 'IN_PROGRESS' && isOverdue && payDate && (
                <>
                  <div className="flex items-start gap-1.5 bg-rose-50 border border-rose-100 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-rose-700">
                    <AlertTriangle size={13} className="shrink-0 mt-px" />
                    October 2026 payroll is overdue. Finalize this payroll as soon as possible.
                  </div>
                  <button
                    type="button"
                    onClick={onRunPayroll}
                    className="mt-2 w-full flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg py-1.5 transition-colors cursor-pointer"
                  >
                    Run Payroll <ArrowRight size={13} />
                  </button>
                </>
              )}
            </>
          )}

          {state === 'OVERDUE' && (
            <>
              <div className="bg-rose-50 border border-rose-100 rounded-lg px-2.5 py-2 text-[11px] text-rose-700">
                <p className="font-bold flex items-start gap-1.5">
                  <AlertTriangle size={13} className="shrink-0 mt-px" />
                  September 2026 and October 2026 payroll is overdue.
                </p>
              </div>
              {lastProcessedLine}
              {runButton}
            </>
          )}

          {state === 'NOT_STARTED' && period && payDate && (
            <>
              <div className="bg-amber-50 border border-amber-100 rounded-lg px-2.5 py-2 text-[11px] text-amber-800">
                <p className="font-bold flex items-start gap-1.5">
                  <CalendarClock size={13} className="shrink-0 mt-px" />
                  {formatPeriod(period)} payroll has not been started.
                </p>
                <p className="mt-0.5 ml-[19px]">Due by {formatDate(payDate)}.</p>
              </div>
              {lastProcessedLine}
              {runButton}
            </>
          )}
        </div>
      )}
    </div>
  );
};

const PREVIEW_SCENARIOS: { scenario: PreviewScenario; label: string; description: string; hidden?: boolean }[] = [
  { scenario: 'IN_PROGRESS', label: '1. In Progress', description: 'Payroll for the current period has started and its pay date is still ahead.' },
  { scenario: 'IN_PROGRESS_OVERDUE', label: '2. In Progress + Overdue', description: 'Payroll has started but is not finalized, and its pay date has passed.' },
  { scenario: 'NOT_STARTED', label: '3. Not Started', description: 'Payroll for the period has not started yet, and its pay date is still ahead.', hidden: true },
  { scenario: 'OVERDUE', label: '4. Overdue', description: 'Payroll was never run and its pay date has passed. Later periods are also due.' },
  { scenario: 'UP_TO_DATE', label: '5. Paid', description: 'All payrolls up to the current month are completed.' },
  { scenario: 'NO_PAYROLL', label: '6. No Payroll', description: 'No payroll has ever been run for this business unit.' }
];

// Shows one card per state, for reviewing the widget locally. Rendered only in dev builds.
export const PayrollRunStatePreview: React.FC<{ counts: RunCounts; onRunPayroll?: () => void }> = ({ counts, onRunPayroll }) => {
  if (!isDev) return null;
  return (
    <div className="rounded-xl border-2 border-dashed border-violet-300 bg-violet-50/40 p-4">
      <div className="mb-3">
        <h3 className="text-sm font-bold text-violet-800">Preview: Payroll Run Status, all states</h3>
        <p className="text-[11px] text-violet-600 mt-0.5">
          Dev only, not shown in production builds. Mock data, calculated from today's date with salary paid on the {MOCK_PAY_DAY}th of the next month.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {PREVIEW_SCENARIOS.filter(s => !s.hidden).map(({ scenario, label, description }) => (
          <div key={scenario} className="flex flex-col gap-1.5">
            <div>
              <p className="text-xs font-bold text-slate-700">{label}</p>
              <p className="text-[11px] text-slate-500">{description}</p>
            </div>
            <PayrollRunStatusCard businessUnit="CollabCRM" counts={counts} forcedState={scenario} onRunPayroll={onRunPayroll} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PayrollRunStatusCard;

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '../services/supabaseClient';
import { formatAuditUser } from './auditUtils';
import {
  ArrowLeft,
  Download,
  Search,
  ChevronDown,
  FileText,
  Eye,
  ShieldCheck,
  Calendar,
  DollarSign,
  TrendingUp,
  User,
  Clock,
  ChevronUp,
  Info,
  Building,
  CreditCard,
  Calculator,
  CheckCircle,
  ArrowUpRight,
  X,
  Printer,
  Share2,
  Check,
  FileArchive,
  Loader2,
  // Fixed: Corrected typo in lucide-react import from CheckSquares to CheckSquare
  CheckSquare,
  Pencil,
  AlertTriangle,
  Award,
  Wallet,
  Users,
  Percent,
  Palmtree
} from 'lucide-react';
import {
  ComposedChart,
  Bar,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from 'recharts';

const SALARY_BREAKDOWN_DATA = [
  { name: 'Gross Earnings', value: 250000, fill: '#4f46e5' }, 
  { name: 'Employee Deductions', value: 25000, fill: '#ef4444' }, 
  { name: 'Employer Deductions', value: 15000, fill: '#f97316' }
];

const ALL_LOP_DATA = [
  // 2025
  { month: 'Jan', year: '2025', lop: 0, deduction: 0 },
  { month: 'Feb', year: '2025', lop: 1, deduction: 2500 },
  { month: 'Mar', year: '2025', lop: 0, deduction: 0 },
  { month: 'Apr', year: '2025', lop: 0, deduction: 0 },
  { month: 'May', year: '2025', lop: 2, deduction: 5000 },
  { month: 'Jun', year: '2025', lop: 0, deduction: 0 },
  { month: 'Jul', year: '2025', lop: 3, deduction: 7500 },
  { month: 'Aug', year: '2025', lop: 0, deduction: 0 },
  { month: 'Sep', year: '2025', lop: 1, deduction: 2500 },
  { month: 'Oct', year: '2025', lop: 0, deduction: 0 },
  { month: 'Nov', year: '2025', lop: 0, deduction: 0 },
  { month: 'Dec', year: '2025', lop: 1, deduction: 2500 },
  // 2024
  { month: 'Jan', year: '2024', lop: 2, deduction: 5000 },
  { month: 'Feb', year: '2024', lop: 0, deduction: 0 },
  { month: 'Mar', year: '2024', lop: 4, deduction: 10000 },
  { month: 'Apr', year: '2024', lop: 0, deduction: 0 },
  { month: 'May', year: '2024', lop: 1, deduction: 2500 },
  { month: 'Jun', year: '2024', lop: 1, deduction: 2500 },
  { month: 'Jul', year: '2024', lop: 0, deduction: 0 },
  { month: 'Aug', year: '2024', lop: 2, deduction: 5000 },
  { month: 'Sep', year: '2024', lop: 0, deduction: 0 },
  { month: 'Oct', year: '2024', lop: 0, deduction: 0 },
  { month: 'Nov', year: '2024', lop: 3, deduction: 7500 },
  { month: 'Dec', year: '2024', lop: 0, deduction: 0 },
  // 2023
  { month: 'Jan', year: '2023', lop: 0, deduction: 0 },
  { month: 'Feb', year: '2023', lop: 0, deduction: 0 },
  { month: 'Mar', year: '2023', lop: 1, deduction: 2500 },
  { month: 'Apr', year: '2023', lop: 3, deduction: 7500 },
  { month: 'May', year: '2023', lop: 0, deduction: 0 },
  { month: 'Jun', year: '2023', lop: 0, deduction: 0 },
  { month: 'Jul', year: '2023', lop: 2, deduction: 5000 },
  { month: 'Aug', year: '2023', lop: 4, deduction: 10000 },
  { month: 'Sep', year: '2023', lop: 0, deduction: 0 },
  { month: 'Oct', year: '2023', lop: 1, deduction: 2500 },
  { month: 'Nov', year: '2023', lop: 1, deduction: 2500 },
  { month: 'Dec', year: '2023', lop: 0, deduction: 0 },
];

const LOP_TREND_DATA_2025 = ALL_LOP_DATA.filter(d => d.year === '2025');
const LOP_TREND_DATA_2024 = ALL_LOP_DATA.filter(d => d.year === '2024');
const LOP_TREND_DATA_2023 = ALL_LOP_DATA.filter(d => d.year === '2023');

const getLopTrendData = (year: string) => {
  if (year === '2024') return LOP_TREND_DATA_2024;
  if (year === '2023') return LOP_TREND_DATA_2023;
  return LOP_TREND_DATA_2025;
};

const LopCustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-lg">
        <p className="text-xs font-bold text-slate-800 mb-1">{label}</p>
        <p className="text-xs text-rose-600 font-semibold">{payload[0].value} days</p>
      </div>
    );
  }
  return null;
};

const REIMBURSEMENT_CLAIMS_DATA_2025 = [
  { month: 'Jun', Travel: 12000, Food: 4000, Communication: 1500, Pending: 2000 },
  { month: 'Jul', Travel: 8000, Food: 3500, Communication: 1500, Pending: 1000 },
  { month: 'Aug', Travel: 15000, Food: 5000, Communication: 1500, Pending: 0 },
  { month: 'Sep', Travel: 10000, Food: 4200, Communication: 1500, Pending: 3500 },
  { month: 'Oct', Travel: 22000, Food: 8000, Communication: 1500, Pending: 1200 },
  { month: 'Nov', Travel: 9000, Food: 3800, Communication: 1500, Pending: 500 },
];

const REIMBURSEMENT_CLAIMS_DATA_2024 = [
  { month: 'Jun', Travel: 18000, Food: 6000, Communication: 2500, Pending: 0 },
  { month: 'Jul', Travel: 12000, Food: 5500, Communication: 2500, Pending: 4000 },
  { month: 'Aug', Travel: 14000, Food: 3000, Communication: 2500, Pending: 1000 },
  { month: 'Sep', Travel: 9000, Food: 2200, Communication: 2500, Pending: 0 },
  { month: 'Oct', Travel: 17000, Food: 4000, Communication: 2500, Pending: 2200 },
  { month: 'Nov', Travel: 11000, Food: 4800, Communication: 2500, Pending: 1500 },
];

const REIMBURSEMENT_CLAIMS_DATA_2023 = [
  { month: 'Jun', Travel: 15000, Food: 3000, Communication: 1000, Pending: 5000 },
  { month: 'Jul', Travel: 11000, Food: 4500, Communication: 1000, Pending: 0 },
  { month: 'Aug', Travel: 25000, Food: 7000, Communication: 1000, Pending: 3000 },
  { month: 'Sep', Travel: 8000, Food: 5200, Communication: 1000, Pending: 1500 },
  { month: 'Oct', Travel: 19000, Food: 6000, Communication: 1000, Pending: 0 },
  { month: 'Nov', Travel: 13000, Food: 2800, Communication: 1000, Pending: 2500 },
];

const getReimbursementData = (year: string) => {
  if (year === '2024') return REIMBURSEMENT_CLAIMS_DATA_2024;
  if (year === '2023') return REIMBURSEMENT_CLAIMS_DATA_2023;
  return REIMBURSEMENT_CLAIMS_DATA_2025;
};

const ReimbursementTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    let total = 0;
    payload.forEach((p: any) => {
      if (p.dataKey !== 'Pending') {
        total += p.value;
      }
    });
    return (
      <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-lg min-w-[200px]">
        <p className="text-xs font-bold text-slate-800 mb-2 border-b border-slate-100 pb-1">{label}</p>
        <div className="space-y-1.5">
          {payload.map((p: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between gap-4 text-xs">
              <span style={{ color: p.color }} className="font-semibold whitespace-nowrap">{p.name}:</span>
              <span className="text-slate-700 font-bold whitespace-nowrap">₹{p.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 pt-1 border-t border-slate-100 flex justify-between items-center gap-4 text-xs font-bold text-slate-800">
          <span>Total:</span>
          <span>₹{total.toLocaleString()}</span>
        </div>
      </div>
    );
  }
  return null;
};

// Category-wise claims broken down by approval status (Approved/Pending/Rejected)
const EXPENSE_CLAIMS_BY_CATEGORY_STATUS_2025 = [
  { category: 'Travel', Approved: 45000, Pending: 8000, Rejected: 3000 },
  { category: 'Meal', Approved: 22000, Pending: 4000, Rejected: 1000 },
  { category: 'Mobile', Approved: 12000, Pending: 1500, Rejected: 500 },
  { category: 'Broadband', Approved: 9000, Pending: 1000, Rejected: 0 },
  { category: 'Learning', Approved: 15000, Pending: 3000, Rejected: 2000 },
  { category: 'Other', Approved: 6000, Pending: 2000, Rejected: 1500 },
];

const EXPENSE_CLAIMS_BY_CATEGORY_STATUS_2024 = [
  { category: 'Travel', Approved: 38000, Pending: 5000, Rejected: 2000 },
  { category: 'Meal', Approved: 18000, Pending: 3000, Rejected: 500 },
  { category: 'Mobile', Approved: 10000, Pending: 1000, Rejected: 0 },
  { category: 'Broadband', Approved: 8000, Pending: 500, Rejected: 0 },
  { category: 'Learning', Approved: 20000, Pending: 2000, Rejected: 1000 },
  { category: 'Other', Approved: 4000, Pending: 1500, Rejected: 500 },
];

const EXPENSE_CLAIMS_BY_CATEGORY_STATUS_2023 = [
  { category: 'Travel', Approved: 30000, Pending: 4000, Rejected: 1500 },
  { category: 'Meal', Approved: 15000, Pending: 2500, Rejected: 500 },
  { category: 'Mobile', Approved: 8000, Pending: 800, Rejected: 0 },
  { category: 'Broadband', Approved: 6000, Pending: 500, Rejected: 0 },
  { category: 'Learning', Approved: 12000, Pending: 1500, Rejected: 500 },
  { category: 'Other', Approved: 3000, Pending: 1000, Rejected: 800 },
];

const getExpenseClaimsByCategoryStatus = (year: string) => {
  if (year === '2024') return EXPENSE_CLAIMS_BY_CATEGORY_STATUS_2024;
  if (year === '2023') return EXPENSE_CLAIMS_BY_CATEGORY_STATUS_2023;
  return EXPENSE_CLAIMS_BY_CATEGORY_STATUS_2025;
};

const ExpenseCategoryStatusTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const total = payload.reduce((sum: number, p: any) => sum + p.value, 0);
    return (
      <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-lg min-w-[180px]">
        <p className="text-xs font-bold text-slate-800 mb-2 border-b border-slate-100 pb-1">{label}</p>
        <div className="space-y-1.5">
          {payload.map((p: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between gap-4 text-xs">
              <span style={{ color: p.color }} className="font-semibold whitespace-nowrap">{p.name}:</span>
              <span className="text-slate-700 font-bold whitespace-nowrap">₹{p.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 pt-1 border-t border-slate-100 flex justify-between items-center gap-4 text-xs font-bold text-slate-800">
          <span>Total:</span>
          <span>₹{total.toLocaleString()}</span>
        </div>
      </div>
    );
  }
  return null;
};

const CTC_TREND_DATA = [
  { year: '2021', ctc: 1800000 },
  { year: '2022', ctc: 2100000 },
  { year: '2023', ctc: 2400000 },
  { year: '2024', ctc: 2800000 },
  { year: '2025', ctc: 3000000 },
];

const CtcTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-lg">
        <p className="text-xs font-bold text-slate-800 mb-1">{label}</p>
        <p className="text-xs text-emerald-600 font-semibold">CTC: ₹{payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

interface SalaryHistoryRow {
  id: string;
  period: string;
  gross: number;
  net: number;
  status: 'Disbursed' | 'Pending' | 'Hold';
  date: string;
  bankAcc: string;
  createdBy: string;
  lastModifiedBy: string;
  deductions: {
    pf: number;
    tds: number;
    others: number;
  };
}

interface EmployeeSalaryHistoryProps {
  onBack: () => void;
  employeeId: string;
  onEdit?: (id: string) => void;
  userRole?: string;
}

const MOCK_HISTORY_ROWS: SalaryHistoryRow[] = [
  // 2025
  { id: '1', period: 'Nov 2025', gross: 250000, net: 205000, status: 'Disbursed', date: '30 Nov 2025', bankAcc: 'XXXX1234', createdBy: 'System', lastModifiedBy: 'System', deductions: { pf: 18000, tds: 25000, others: 2000 } },
  { id: '2', period: 'Oct 2025', gross: 250000, net: 205200, status: 'Disbursed', date: '31 Oct 2025', bankAcc: 'XXXX1234', createdBy: 'System', lastModifiedBy: 'System', deductions: { pf: 18000, tds: 24800, others: 2000 } },
  { id: '3', period: 'Sep 2025', gross: 240000, net: 198000, status: 'Disbursed', date: '30 Sep 2025', bankAcc: 'XXXX5678', createdBy: 'System', lastModifiedBy: 'HR Admin', deductions: { pf: 17280, tds: 22720, others: 2000 } },
  { id: '4', period: 'Aug 2025', gross: 240000, net: 198000, status: 'Disbursed', date: '31 Aug 2025', bankAcc: 'XXXX5678', createdBy: 'System', lastModifiedBy: 'System', deductions: { pf: 17280, tds: 22720, others: 2000 } },
  { id: '5', period: 'Jul 2025', gross: 240000, net: 198000, status: 'Disbursed', date: '31 Jul 2025', bankAcc: 'XXXX5678', createdBy: 'System', lastModifiedBy: 'System', deductions: { pf: 17280, tds: 22720, others: 2000 } },
  { id: '6', period: 'Jun 2025', gross: 230000, net: 189500, status: 'Disbursed', date: '30 Jun 2025', bankAcc: 'XXXX5678', createdBy: 'System', lastModifiedBy: 'HR Admin', deductions: { pf: 16560, tds: 21940, others: 2000 } },
  { id: '7', period: 'May 2025', gross: 230000, net: 189500, status: 'Disbursed', date: '31 May 2025', bankAcc: 'XXXX5678', createdBy: 'System', lastModifiedBy: 'System', deductions: { pf: 16560, tds: 21940, others: 2000 } },
  { id: '8', period: 'Apr 2025', gross: 230000, net: 189500, status: 'Disbursed', date: '30 Apr 2025', bankAcc: 'XXXX5678', createdBy: 'System', lastModifiedBy: 'System', deductions: { pf: 16560, tds: 21940, others: 2000 } },
  { id: '9', period: 'Mar 2025', gross: 215000, net: 178000, status: 'Disbursed', date: '31 Mar 2025', bankAcc: 'XXXX5678', createdBy: 'System', lastModifiedBy: 'HR Admin', deductions: { pf: 15480, tds: 19520, others: 2000 } },
  { id: '10', period: 'Feb 2025', gross: 215000, net: 178000, status: 'Disbursed', date: '28 Feb 2025', bankAcc: 'XXXX5678', createdBy: 'System', lastModifiedBy: 'System', deductions: { pf: 15480, tds: 19520, others: 2000 } },
  { id: '11', period: 'Jan 2025', gross: 215000, net: 178000, status: 'Disbursed', date: '31 Jan 2025', bankAcc: 'XXXX5678', createdBy: 'System', lastModifiedBy: 'System', deductions: { pf: 15480, tds: 19520, others: 2000 } },
  
  // 2024
  { id: '12', period: 'Dec 2024', gross: 200000, net: 165000, status: 'Disbursed', date: '31 Dec 2024', bankAcc: 'XXXX5678', createdBy: 'System', lastModifiedBy: 'System', deductions: { pf: 14400, tds: 18600, others: 2000 } },
  { id: '13', period: 'Nov 2024', gross: 200000, net: 165000, status: 'Disbursed', date: '30 Nov 2024', bankAcc: 'XXXX5678', createdBy: 'System', lastModifiedBy: 'System', deductions: { pf: 14400, tds: 18600, others: 2000 } },
  { id: '14', period: 'Oct 2024', gross: 200000, net: 165000, status: 'Disbursed', date: '31 Oct 2024', bankAcc: 'XXXX5678', createdBy: 'System', lastModifiedBy: 'System', deductions: { pf: 14400, tds: 18600, others: 2000 } },
  { id: '15', period: 'Sep 2024', gross: 190000, net: 157000, status: 'Disbursed', date: '30 Sep 2024', bankAcc: 'XXXX5678', createdBy: 'System', lastModifiedBy: 'System', deductions: { pf: 13680, tds: 17320, others: 2000 } },
  { id: '16', period: 'Aug 2024', gross: 190000, net: 157000, status: 'Disbursed', date: '31 Aug 2024', bankAcc: 'XXXX5678', createdBy: 'System', lastModifiedBy: 'System', deductions: { pf: 13680, tds: 17320, others: 2000 } },
  { id: '17', period: 'Jul 2024', gross: 190000, net: 157000, status: 'Disbursed', date: '31 Jul 2024', bankAcc: 'XXXX5678', createdBy: 'System', lastModifiedBy: 'System', deductions: { pf: 13680, tds: 17320, others: 2000 } },
  { id: '18', period: 'Jun 2024', gross: 180000, net: 149000, status: 'Disbursed', date: '30 Jun 2024', bankAcc: 'XXXX5678', createdBy: 'System', lastModifiedBy: 'System', deductions: { pf: 12960, tds: 16040, others: 2000 } },
  { id: '19', period: 'May 2024', gross: 180000, net: 149000, status: 'Disbursed', date: '31 May 2024', bankAcc: 'XXXX5678', createdBy: 'System', lastModifiedBy: 'System', deductions: { pf: 12960, tds: 16040, others: 2000 } },
  { id: '20', period: 'Apr 2024', gross: 180000, net: 149000, status: 'Disbursed', date: '30 Apr 2024', bankAcc: 'XXXX5678', createdBy: 'System', lastModifiedBy: 'System', deductions: { pf: 12960, tds: 16040, others: 2000 } },
  { id: '21', period: 'Mar 2024', gross: 170000, net: 140500, status: 'Disbursed', date: '31 Mar 2024', bankAcc: 'XXXX5678', createdBy: 'System', lastModifiedBy: 'System', deductions: { pf: 12240, tds: 15260, others: 2000 } },
  { id: '22', period: 'Feb 2024', gross: 170000, net: 140500, status: 'Disbursed', date: '29 Feb 2024', bankAcc: 'XXXX5678', createdBy: 'System', lastModifiedBy: 'System', deductions: { pf: 12240, tds: 15260, others: 2000 } },
  { id: '23', period: 'Jan 2024', gross: 170000, net: 140500, status: 'Disbursed', date: '31 Jan 2024', bankAcc: 'XXXX5678', createdBy: 'System', lastModifiedBy: 'System', deductions: { pf: 12240, tds: 15260, others: 2000 } },

  // 2023
  { id: '24', period: 'Dec 2023', gross: 160000, net: 132000, status: 'Disbursed', date: '31 Dec 2023', bankAcc: 'XXXX5678', createdBy: 'System', lastModifiedBy: 'System', deductions: { pf: 11520, tds: 14480, others: 2000 } },
  { id: '25', period: 'Nov 2023', gross: 160000, net: 132000, status: 'Disbursed', date: '30 Nov 2023', bankAcc: 'XXXX5678', createdBy: 'System', lastModifiedBy: 'System', deductions: { pf: 11520, tds: 14480, others: 2000 } },
  { id: '26', period: 'Oct 2023', gross: 160000, net: 132000, status: 'Disbursed', date: '31 Oct 2023', bankAcc: 'XXXX5678', createdBy: 'System', lastModifiedBy: 'System', deductions: { pf: 11520, tds: 14480, others: 2000 } },
  { id: '27', period: 'Sep 2023', gross: 155000, net: 128000, status: 'Disbursed', date: '30 Sep 2023', bankAcc: 'XXXX5678', createdBy: 'System', lastModifiedBy: 'System', deductions: { pf: 11160, tds: 13840, others: 2000 } },
  { id: '28', period: 'Aug 2023', gross: 155000, net: 128000, status: 'Disbursed', date: '31 Aug 2023', bankAcc: 'XXXX5678', createdBy: 'System', lastModifiedBy: 'System', deductions: { pf: 11160, tds: 13840, others: 2000 } },
  { id: '29', period: 'Jul 2023', gross: 155000, net: 128000, status: 'Disbursed', date: '31 Jul 2023', bankAcc: 'XXXX5678', createdBy: 'System', lastModifiedBy: 'System', deductions: { pf: 11160, tds: 13840, others: 2000 } },
  { id: '30', period: 'Jun 2023', gross: 150000, net: 124000, status: 'Disbursed', date: '30 Jun 2023', bankAcc: 'XXXX5678', createdBy: 'System', lastModifiedBy: 'System', deductions: { pf: 10800, tds: 13200, others: 2000 } },
  { id: '31', period: 'May 2023', gross: 150000, net: 124000, status: 'Disbursed', date: '31 May 2023', bankAcc: 'XXXX5678', createdBy: 'System', lastModifiedBy: 'System', deductions: { pf: 10800, tds: 13200, others: 2000 } },
  { id: '32', period: 'Apr 2023', gross: 150000, net: 124000, status: 'Disbursed', date: '30 Apr 2023', bankAcc: 'XXXX5678', createdBy: 'System', lastModifiedBy: 'System', deductions: { pf: 10800, tds: 13200, others: 2000 } },
  { id: '33', period: 'Mar 2023', gross: 145000, net: 120000, status: 'Disbursed', date: '31 Mar 2023', bankAcc: 'XXXX5678', createdBy: 'System', lastModifiedBy: 'System', deductions: { pf: 10440, tds: 12560, others: 2000 } },
  { id: '34', period: 'Feb 2023', gross: 145000, net: 120000, status: 'Disbursed', date: '28 Feb 2023', bankAcc: 'XXXX5678', createdBy: 'System', lastModifiedBy: 'System', deductions: { pf: 10440, tds: 12560, others: 2000 } },
  { id: '35', period: 'Jan 2023', gross: 145000, net: 120000, status: 'Disbursed', date: '31 Jan 2023', bankAcc: 'XXXX5678', createdBy: 'System', lastModifiedBy: 'System', deductions: { pf: 10440, tds: 12560, others: 2000 } },
];

const DATE_RANGE_PRESETS = [
  { id: 'THIS_QUARTER', label: 'This Quarter' },
  { id: 'LAST_QUARTER', label: 'Last Quarter' },
  { id: 'THIS_YEAR', label: 'This Year' },
  { id: 'LAST_YEAR', label: 'Last Year' },
];

const MONTH_OPTIONS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const YEAR_OPTIONS = ['2026', '2025', '2024', '2023'];

const parseMonthYear = (str: string): { month: number; year: number } | null => {
  if (!str) return null;
  const parts = str.trim().split(/\s+/);
  if (parts.length >= 2) {
    const mIdx = MONTH_OPTIONS.indexOf(parts[0]);
    const y = parseInt(parts[1], 10);
    if (mIdx !== -1 && !isNaN(y)) return { month: mIdx, year: y };
  } else if (parts.length === 1 && !isNaN(parseInt(parts[0], 10))) {
    return { month: 0, year: parseInt(parts[0], 10) };
  }
  return null;
};

const filterSalaryRows = (rows: SalaryHistoryRow[], preset: string, customRange: string) => {
  if (preset === 'THIS_QUARTER') {
    return rows.filter(r => ['Sep 2025', 'Oct 2025', 'Nov 2025'].includes(r.period));
  }
  if (preset === 'LAST_QUARTER') {
    return rows.filter(r => ['Jun 2025', 'Jul 2025', 'Aug 2025'].includes(r.period));
  }
  if (preset === 'LAST_YEAR') {
    return rows.filter(r => r.period.includes('2024'));
  }
  if (preset === 'CUSTOM' && customRange.trim()) {
    const rangeParts = customRange.split('-');
    if (rangeParts.length === 2) {
      const from = parseMonthYear(rangeParts[0]);
      const to = parseMonthYear(rangeParts[1]);
      if (from && to) {
        const fromVal = from.year * 12 + from.month;
        const toVal = to.year * 12 + to.month;
        const minVal = Math.min(fromVal, toVal);
        const maxVal = Math.max(fromVal, toVal);
        return rows.filter(r => {
          const d = parseMonthYear(r.period);
          if (!d) return true;
          const rowVal = d.year * 12 + d.month;
          return rowVal >= minVal && rowVal <= maxVal;
        });
      }
    } else if (rangeParts.length === 1) {
      const single = parseMonthYear(rangeParts[0]);
      if (single) {
        return rows.filter(r => {
          const d = parseMonthYear(r.period);
          return d && d.month === single.month && d.year === single.year;
        });
      }
    }
  }
  // Default THIS_YEAR (2025)
  return rows.filter(r => r.period.includes('2025'));
};

const getDateRangeLabel = (preset: string, customText: string) => {
  switch (preset) {
    case 'THIS_QUARTER':
      return 'This Quarter';
    case 'LAST_QUARTER':
      return 'Last Quarter';
    case 'THIS_YEAR':
      return 'This Year';
    case 'LAST_YEAR':
      return 'Last Year';
    case 'CUSTOM':
      return customText.trim() ? customText : 'Custom Range';
    default:
      return 'This Year';
  }
};

interface DateRangePickerDropdownProps {
  selectedPreset: string;
  customRange: string;
  isOpen: boolean;
  onToggle: () => void;
  onSelectPreset: (presetId: string) => void;
  onApplyCustom: (rangeText: string) => void;
  dropdownRef: React.RefObject<HTMLDivElement>;
  label: string;
}

const DateRangePickerDropdown: React.FC<DateRangePickerDropdownProps> = ({
  selectedPreset,
  customRange,
  isOpen,
  onToggle,
  onSelectPreset,
  onApplyCustom,
  dropdownRef,
  label
}) => {
  const [fromMonth, setFromMonth] = useState('Jan');
  const [fromYear, setFromYear] = useState('2025');
  const [toMonth, setToMonth] = useState('Nov');
  const [toYear, setToYear] = useState('2025');

  // Synchronize internal from/to when customRange updates or opens
  useEffect(() => {
    if (customRange && customRange.includes('-')) {
      const [fromPart, toPart] = customRange.split('-').map(s => s.trim());
      if (fromPart) {
        const [fm, fy] = fromPart.split(' ');
        if (fm && MONTH_OPTIONS.includes(fm)) setFromMonth(fm);
        if (fy && YEAR_OPTIONS.includes(fy)) setFromYear(fy);
      }
      if (toPart) {
        const [tm, ty] = toPart.split(' ');
        if (tm && MONTH_OPTIONS.includes(tm)) setToMonth(tm);
        if (ty && YEAR_OPTIONS.includes(ty)) setToYear(ty);
      }
    } else if (customRange && customRange.trim()) {
      const [m, y] = customRange.trim().split(' ');
      if (m && MONTH_OPTIONS.includes(m)) {
        setFromMonth(m);
        setToMonth(m);
      }
      if (y && YEAR_OPTIONS.includes(y)) {
        setFromYear(y);
        setToYear(y);
      }
    }
  }, [customRange, isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={onToggle}
        className={`bg-slate-50 border text-slate-700 text-xs font-bold rounded-lg px-3 py-1.5 flex items-center gap-2 transition-all shadow-xs cursor-pointer ${
          isOpen ? 'border-indigo-500 ring-2 ring-indigo-100 bg-white' : 'border-slate-200 hover:bg-slate-100 hover:border-slate-300'
        }`}
      >
        <Calendar size={13} className="text-indigo-600 shrink-0" />
        <span className="font-semibold text-slate-800">{label}</span>
        <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-indigo-600' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-[350px] bg-white rounded-xl shadow-2xl border border-slate-200 z-50 p-4 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-slate-700 tracking-tight uppercase">Select Time Period</h4>
          </div>
          
          {/* Preset Buttons Grid (2 columns x 2 rows) */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            {DATE_RANGE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => onSelectPreset(preset.id)}
                className={`px-3 py-2 text-xs font-bold rounded-lg border transition-all text-center cursor-pointer ${
                  selectedPreset === preset.id
                    ? 'bg-[#4338ca] border-[#4338ca] text-white shadow-sm'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Custom Month & Year Range Section */}
          <div className="pt-3 border-t border-slate-100">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Custom Month & Year
            </div>
            
            <div className="grid grid-cols-2 gap-2.5 mb-3">
              {/* From */}
              <div className="bg-slate-50/80 p-2.5 rounded-lg border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">From</span>
                <div className="grid grid-cols-2 gap-1.5">
                  <select
                    value={fromMonth}
                    onChange={(e) => setFromMonth(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-semibold rounded-md px-1.5 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-2xs"
                  >
                    {MONTH_OPTIONS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <select
                    value={fromYear}
                    onChange={(e) => setFromYear(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-semibold rounded-md px-1.5 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-2xs"
                  >
                    {YEAR_OPTIONS.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* To */}
              <div className="bg-slate-50/80 p-2.5 rounded-lg border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">To</span>
                <div className="grid grid-cols-2 gap-1.5">
                  <select
                    value={toMonth}
                    onChange={(e) => setToMonth(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-semibold rounded-md px-1.5 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-2xs"
                  >
                    {MONTH_OPTIONS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <select
                    value={toYear}
                    onChange={(e) => setToYear(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-semibold rounded-md px-1.5 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-2xs"
                  >
                    {YEAR_OPTIONS.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                const formatted = fromMonth === toMonth && fromYear === toYear
                  ? `${fromMonth} ${fromYear}`
                  : `${fromMonth} ${fromYear} - ${toMonth} ${toYear}`;
                onApplyCustom(formatted);
              }}
              className="w-full py-2 bg-[#4338ca] text-white hover:bg-[#3730a3] active:scale-[0.99] font-bold text-xs rounded-lg transition-all cursor-pointer shadow-sm text-center flex items-center justify-center gap-1.5"
            >
              <Calendar size={13} />
              <span>Apply Custom Range</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const EmployeeSalaryHistory: React.FC<EmployeeSalaryHistoryProps> = ({ onBack, employeeId, onEdit, userRole }) => {
  const [activeTab, setActiveTab] = useState<'HISTORY' | 'PROFILE' | 'INSIGHTS'>('HISTORY');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [employeeData, setEmployeeData] = useState<any>(null);
  const [appraisalMonth, setAppraisalMonth] = useState('');
  const [pranNumber, setPranNumber] = useState('');
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [lopYear, setLopYear] = useState('2025');
  const [reimbursementYear, setReimbursementYear] = useState('2025');
  const [expenseCategoryStatusYear, setExpenseCategoryStatusYear] = useState('2025');

  const [structureComponents, setStructureComponents] = useState<{ earnings: any[]; deductions: any[] }>({ earnings: [], deductions: [] });
  const [statutoryDeductions, setStatutoryDeductions] = useState<any>({
    providentFund: false,
    esi: false,
    professionalTax: false,
    lwf: false,
    nps: false,
    gratuity: false,
  });
  const [statutorySettings, setStatutorySettings] = useState<any>(null);
  const [globalRoundOff, setGlobalRoundOff] = useState<'floor' | 'ceiling' | 'nearest_full' | 'nearest_half'>('floor');

  const calculateEstTax = (amount: number, regimeType: 'OLD' | 'NEW') => {
    if (!amount) return 0;
    let taxable = amount;
    let tax = 0;
    if (regimeType === 'OLD') {
      taxable = Math.max(0, amount - 200000);
      if (taxable > 1000000) { tax += (taxable - 1000000) * 0.3; taxable = 1000000; }
      if (taxable > 500000) { tax += (taxable - 500000) * 0.2; taxable = 500000; }
      if (taxable > 250000) { tax += (taxable - 250000) * 0.05; }
    } else {
      taxable = Math.max(0, amount - 75000);
      if (taxable > 2400000) { tax += (taxable - 2400000) * 0.3; taxable = 2400000; }
      if (taxable > 2000000) { tax += (taxable - 2000000) * 0.25; taxable = 2000000; }
      if (taxable > 1600000) { tax += (taxable - 1600000) * 0.20; taxable = 1600000; }
      if (taxable > 1200000) { tax += (taxable - 1200000) * 0.15; taxable = 1200000; }
      if (taxable > 800000) { tax += (taxable - 800000) * 0.10; taxable = 800000; }
      if (taxable > 400000) { tax += (taxable - 400000) * 0.05; }
    }
    return Math.round(tax * 1.04);
  };

  const calculateSalary = (annualCtc: number) => {
    const earnings: any[] = [];
    const employeeDeductions: any[] = [];
    const employerContributions: any[] = [];
    let totalEmployerContrib = 0;

    const applyRoundOff = (value: number): number => {
      if (globalRoundOff === 'ceiling') {
        return Math.ceil(value);
      } else if (globalRoundOff === 'nearest_full') {
        return Math.round(value);
      } else if (globalRoundOff === 'nearest_half') {
        return Math.round(value * 2) / 2;
      } else {
        return Math.floor(value);
      }
    };

    const calcComp = (comp: any, baseValues: any) => {
      const calc = comp.calculation || '';
      let val = 0;
      if (calc.includes('Balancing Figure')) val = 0;
      else if (calc.includes('% of CTC')) val = annualCtc * (parseFloat(calc) / 100);
      else if (calc.includes('% of Basic')) val = baseValues.basic * (parseFloat(calc) / 100);
      else if (calc.includes('Fixed ₹')) val = parseFloat(calc.replace(/[^\d.-]/g, '')) * 12;
      return applyRoundOff(val);
    };

    let basic = 0;
    const basicComp = structureComponents.earnings.find(c => c.name.toLowerCase().includes('basic'));
    if (basicComp) {
      basic = calcComp(basicComp, {});
    }

    structureComponents.earnings.forEach(comp => {
      if (comp.name.toLowerCase().includes('basic')) {
        earnings.push({ name: comp.name, annual: basic, monthly: basic / 12 });
      } else if (!comp.calculation.includes('Balancing Figure')) {
        const val = calcComp(comp, { basic });
        earnings.push({ name: comp.name, annual: val, monthly: val / 12 });
      }
    });

    if (statutoryDeductions.providentFund && statutorySettings?.pf_settings) {
      const pfSet = statutorySettings.pf_settings;
      const rate = parseFloat(pfSet.emprRate || '12') / 100;
      const wageLimit = parseFloat(pfSet.pfWageCeiling || '15000');
      const pfBasis = Math.min(basic, wageLimit * 12);
      const pfContrib = Math.min(pfBasis * rate, (parseFloat(pfSet.emprLimit || '1800') * 12));
      employerContributions.push({ name: 'Provident Fund (Employer)', annual: pfContrib, monthly: pfContrib / 12 });
      totalEmployerContrib += pfContrib;
    } else if (statutoryDeductions.providentFund) {
      const pfContrib = Math.min(basic * 0.12, 1800 * 12);
      employerContributions.push({ name: 'Provident Fund (Employer)', annual: pfContrib, monthly: pfContrib / 12 });
      totalEmployerContrib += pfContrib;
    }

    if (statutoryDeductions.esi && statutorySettings?.statutory_settings?.esi) {
      const esiSet = statutorySettings.statutory_settings.esi;
      const threshold = parseFloat(esiSet.threshold || '21000');
      const rate = parseFloat(esiSet.employer_rate || '3.25') / 100;
      const currentEarningsTotal = earnings.reduce((sum, e) => sum + e.annual, 0);
      if ((currentEarningsTotal / 12) <= threshold) {
        const esiContrib = applyRoundOff(currentEarningsTotal * rate);
        employerContributions.push({ name: 'ESI (Employer)', annual: esiContrib, monthly: esiContrib / 12 });
        totalEmployerContrib += esiContrib;
      }
    }

    if (statutoryDeductions.gratuity) {
      const gratRate = parseFloat(statutorySettings?.config_value?.gratuityProvisionRate || '4.81') / 100;
      const gratContrib = applyRoundOff(basic * gratRate);
      employerContributions.push({ name: 'Gratuity (Employer)', annual: gratContrib, monthly: gratContrib / 12 });
      totalEmployerContrib += gratContrib;
    }

    if (statutoryDeductions.lwf) {
      const lwfEmpr = 40 * 12;
      employerContributions.push({ name: 'LWF (Employer)', annual: lwfEmpr, monthly: lwfEmpr / 12 });
      totalEmployerContrib += lwfEmpr;
    }

    if (statutoryDeductions.nps) {
      const npsRate = parseFloat(statutorySettings?.config_value?.npsEmprRate || '10') / 100;
      const npsContrib = basic * npsRate;
      employerContributions.push({ name: 'NPS (Employer)', annual: npsContrib, monthly: npsContrib / 12 });
      totalEmployerContrib += npsContrib;
    }

    const currentEarningsTotal = earnings.reduce((sum, e) => sum + e.annual, 0);
    const balancingComp = structureComponents.earnings.find(c => c.calculation.includes('Balancing Figure'));
    const specialVal = Math.max(0, annualCtc - currentEarningsTotal - totalEmployerContrib);
    
    if (balancingComp) {
      earnings.push({ name: balancingComp.name, annual: specialVal, monthly: specialVal / 12 });
    }

    const annualGross = earnings.reduce((sum, e) => sum + e.annual, 0);
    const monthlyGross = annualGross / 12;

    if (statutoryDeductions.providentFund) {
      const rate = 0.12;
      const pfEmp = Math.min(basic * rate, 1800 * 12);
      employeeDeductions.push({ name: 'Provident Fund (Employee)', annual: pfEmp, monthly: pfEmp / 12 });
    }

    if (statutoryDeductions.esi && monthlyGross <= 21000) {
      const rate = 0.0075;
      const esiEmp = applyRoundOff(annualGross * rate);
      employeeDeductions.push({ name: 'ESI (Employee)', annual: esiEmp, monthly: esiEmp / 12 });
    }

    if (statutoryDeductions.professionalTax && monthlyGross > 15000) {
      const ptVal = 200 * 12;
      employeeDeductions.push({ name: 'Professional Tax', annual: ptVal, monthly: ptVal / 12 });
    }

    if (statutoryDeductions.lwf) {
      const lwfEmp = 20 * 12;
      employeeDeductions.push({ name: 'LWF (Employee)', annual: lwfEmp, monthly: lwfEmp / 12 });
    }

    if (statutoryDeductions.nps) {
      let npsEmpVal = 0;
      if (statutoryDeductions.npsType === 'amount') {
        const amt = parseFloat(statutoryDeductions.npsAmount) || 0;
        npsEmpVal = amt * 12;
      } else if (statutoryDeductions.npsType === 'percentage') {
        const pct = parseFloat(statutoryDeductions.npsPercentage) || 0;
        npsEmpVal = basic * (pct / 100);
      } else {
        npsEmpVal = basic * 0.10;
      }
      employeeDeductions.push({ name: 'NPS (Employee)', annual: npsEmpVal, monthly: npsEmpVal / 12 });
    }

    const regime = employeeData?.tax_regime || 'New Regime (2025)';
    const taxAnnual = regime.includes('Old') ? calculateEstTax(annualCtc, 'OLD') : calculateEstTax(annualCtc, 'NEW');
    if (statutoryDeductions.tds && taxAnnual > 0) {
      employeeDeductions.push({ name: 'Income Tax (TDS)', annual: taxAnnual, monthly: taxAnnual / 12 });
    }

    return {
      earnings,
      employeeDeductions,
      employerContributions,
      annualGross,
      monthlyGross,
      basic,
      special: specialVal
    };
  };

  const getSalaryDetails = () => {
    if (!employeeData) return null;
    return calculateSalary(Number(employeeData.ctc) || 0);
  };
  const salary = getSalaryDetails();

  useEffect(() => {
    const fetchEmployee = async () => {
      setIsDataLoading(true);
      try {
        const { data, error } = await supabase
          .from('employees')
          .select('*')
          .eq('id', employeeId)
          .single();
        if (!error && data) {
          setEmployeeData(data);
          
          // Fetch structure details
          if (data.salary_structure_id) {
            const { data: struct } = await supabase
              .from('salary_structures')
              .select('earnings, deductions')
              .eq('id', data.salary_structure_id)
              .single();
            if (struct) {
              setStructureComponents({
                earnings: struct.earnings || [],
                deductions: struct.deductions || []
              });
            }
          }

          // Fetch statutory settings
          try {
            const target = 'MindInventory';
            const { data: settingsData } = await supabase
              .from('operational_config')
              .select('config_key, config_value')
              .like('config_key', `%settings:bu:${target}`);
            if (settingsData) {
              const settings: any = {};
              settingsData.forEach(item => {
                const key = item.config_key.split(':')[0];
                settings[key] = item.config_value;
              });
              setStatutorySettings(settings);
            }

            const { data: roundOffData } = await supabase
              .from('operational_config')
              .select('config_value')
              .eq('config_key', 'round_off_settings')
              .maybeSingle();
            if (roundOffData && roundOffData.config_value) {
              setGlobalRoundOff((roundOffData.config_value as any).round_off_rule || 'floor');
            }
          } catch (err) {
            console.error('Error fetching statutory settings:', err);
          }

          // Fetch appraisal month & employee statutory config
          try {
            const { data: configData } = await supabase
              .from('operational_config')
              .select('config_value')
              .eq('config_key', `emp_statutory:${employeeId}`)
              .single();
            
            if (configData?.config_value) {
              setStatutoryDeductions(prev => ({ ...prev, ...configData.config_value, lwf: false }));
              if (configData.config_value.appraisal_month) {
                setAppraisalMonth(configData.config_value.appraisal_month);
              }
              if (configData.config_value.pran_no) {
                setPranNumber(configData.config_value.pran_no);
              }
            }
          } catch (e) {
            console.error('Error fetching appraisal month config:', e);
          }
        }
      } catch (err) {
        console.error('Error fetching employee details:', err);
      } finally {
        setIsDataLoading(false);
      }
    };
    if (employeeId) fetchEmployee();
  }, [employeeId]);

  // Action Screen states
  const [selectedRow, setSelectedRow] = useState<SalaryHistoryRow | null>(null);
  const [activeAction, setActiveAction] = useState<'VIEW' | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Bulk Download state
  const [isBulkDownloadOpen, setIsBulkDownloadOpen] = useState(false);
  const [bulkDownloadStep, setBulkDownloadStep] = useState<'OPTIONS' | 'PROGRESS' | 'COMPLETE'>('OPTIONS');
  const [progress, setProgress] = useState(0);

  // Annexure Modal
  const [showAnnexureModal, setShowAnnexureModal] = useState(false);

  // Date Range Filter States
  const [grossDatePreset, setGrossDatePreset] = useState('THIS_YEAR');
  const [grossCustomRange, setGrossCustomRange] = useState('');
  const [grossDateDropdownOpen, setGrossDateDropdownOpen] = useState(false);
  const grossDropdownRef = useRef<HTMLDivElement>(null);

  const [salaryTrendDatePreset, setSalaryTrendDatePreset] = useState('THIS_YEAR');
  const [salaryTrendCustomRange, setSalaryTrendCustomRange] = useState('');
  const [salaryTrendDateDropdownOpen, setSalaryTrendDateDropdownOpen] = useState(false);
  const salaryTrendDropdownRef = useRef<HTMLDivElement>(null);

  const [lopDatePreset, setLopDatePreset] = useState('THIS_YEAR');
  const [lopCustomRange, setLopCustomRange] = useState('');
  const [lopDateDropdownOpen, setLopDateDropdownOpen] = useState(false);
  const lopDropdownRef = useRef<HTMLDivElement>(null);

  const [expenseDatePreset, setExpenseDatePreset] = useState('THIS_YEAR');
  const [expenseCustomRange, setExpenseCustomRange] = useState('');
  const [expenseDateDropdownOpen, setExpenseDateDropdownOpen] = useState(false);
  const expenseDropdownRef = useRef<HTMLDivElement>(null);

  const [statutoryDatePreset, setStatutoryDatePreset] = useState('THIS_YEAR');
  const [statutoryCustomRange, setStatutoryCustomRange] = useState('');
  const [statutoryDateDropdownOpen, setStatutoryDateDropdownOpen] = useState(false);
  const statutoryDropdownRef = useRef<HTMLDivElement>(null);

  // Click outside listener to close date range popups
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (grossDropdownRef.current && !grossDropdownRef.current.contains(e.target as Node)) {
        setGrossDateDropdownOpen(false);
      }
      if (salaryTrendDropdownRef.current && !salaryTrendDropdownRef.current.contains(e.target as Node)) {
        setSalaryTrendDateDropdownOpen(false);
      }
      if (lopDropdownRef.current && !lopDropdownRef.current.contains(e.target as Node)) {
        setLopDateDropdownOpen(false);
      }
      if (expenseDropdownRef.current && !expenseDropdownRef.current.contains(e.target as Node)) {
        setExpenseDateDropdownOpen(false);
      }
      if (statutoryDropdownRef.current && !statutoryDropdownRef.current.contains(e.target as Node)) {
        setStatutoryDateDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const [breakdownYear, setBreakdownYear] = useState('Nov 2025');
  const [taxYear, setTaxYear] = useState('2025');

  const currentBreakdownData = useMemo(() => {
    const row = MOCK_HISTORY_ROWS.find(r => r.period === breakdownYear);
    if (row) {
      const employeeDeductions = (row.deductions?.pf || 0) + (row.deductions?.tds || 0) + (row.deductions?.others || 0);
      const employerDeductions = Math.round(row.gross * 0.06);
      return [
        { name: 'Gross Earnings', value: row.gross, fill: '#4f46e5' },
        { name: 'Employee Deductions', value: employeeDeductions, fill: '#ef4444' },
        { name: 'Employer Deductions', value: employerDeductions, fill: '#f97316' }
      ];
    }
    return SALARY_BREAKDOWN_DATA;
  }, [breakdownYear]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(MOCK_HISTORY_ROWS.length / itemsPerPage);
  const paginatedRows = MOCK_HISTORY_ROWS.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Disbursed': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Pending': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Hold': return 'bg-rose-50 text-rose-700 border-rose-100';
      default: return 'bg-slate-50 text-slate-700';
    }
  };

  const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleDownload = (row: SalaryHistoryRow) => {
    setIsDownloading(true);
    // Simulate generation
    setTimeout(() => {
      setIsDownloading(false);
      const dummyText = `PAYSLIP - ${row.period}\nNet Amount: ${formatINR(row.net)}`;
      const blob = new Blob([dummyText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Payslip_${row.period.replace(' ', '_')}.pdf`;
      link.click();
    }, 1200);
  };

  const handleBulkDownloadStart = () => {
    setBulkDownloadStep('PROGRESS');
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setBulkDownloadStep('COMPLETE');
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  const closeBulkDownload = () => {
    setIsBulkDownloadOpen(false);
    setBulkDownloadStep('OPTIONS');
    setProgress(0);
  };

  // Helper to detect increment month
  const isIncrementMonth = (index: number) => {
    if (index >= MOCK_HISTORY_ROWS.length - 1) return false;
    return MOCK_HISTORY_ROWS[index].gross > MOCK_HISTORY_ROWS[index + 1].gross;
  };

  // Graph Data (Gross vs Net Pay Trend)
  const graphData = useMemo(() => {
    const rows = filterSalaryRows(MOCK_HISTORY_ROWS, grossDatePreset, grossCustomRange);
    return rows.reverse().map((d) => {
      const totalDeductions = (d.deductions?.pf || 0) + (d.deductions?.tds || 0) + (d.deductions?.others || 0);
      return {
        ...d,
        monthLabel: d.period.split(' ')[0],
        totalDeductions
      };
    });
  }, [grossDatePreset, grossCustomRange]);

  const maxGross = Math.max(...graphData.map(d => d.gross), 1);

  // Salary Trend widget data
  const salaryTrendData = useMemo(() => {
    const rows = filterSalaryRows(MOCK_HISTORY_ROWS, salaryTrendDatePreset, salaryTrendCustomRange);
    return rows.reverse().map((d, i, arr) => {
      const isIncrement = i > 0 && d.gross > arr[i - 1].gross;
      const incrementPercent = isIncrement ? Math.round(((d.gross - arr[i - 1].gross) / arr[i - 1].gross) * 100) : 0;
      const incrementAmount = isIncrement ? d.gross - arr[i - 1].gross : 0;
      return {
        ...d,
        monthLabel: d.period.split(' ')[0],
        isIncrement,
        incrementPercent,
        incrementAmount
      };
    });
  }, [salaryTrendDatePreset, salaryTrendCustomRange]);

  // LOP Trend Filtered Data
  const currentLopData = useMemo(() => {
    let data = [...ALL_LOP_DATA];
    if (lopDatePreset === 'THIS_QUARTER') {
      data = data.filter(d => d.year === '2025' && ['Sep', 'Oct', 'Nov'].includes(d.month));
    } else if (lopDatePreset === 'LAST_QUARTER') {
      data = data.filter(d => d.year === '2025' && ['Jun', 'Jul', 'Aug'].includes(d.month));
    } else if (lopDatePreset === 'LAST_YEAR') {
      data = data.filter(d => d.year === '2024');
    } else if (lopDatePreset === 'CUSTOM' && lopCustomRange.trim()) {
      const rangeParts = lopCustomRange.split('-');
      if (rangeParts.length === 2) {
        const from = parseMonthYear(rangeParts[0]);
        const to = parseMonthYear(rangeParts[1]);
        if (from && to) {
          const minVal = Math.min(from.year * 12 + from.month, to.year * 12 + to.month);
          const maxVal = Math.max(from.year * 12 + from.month, to.year * 12 + to.month);
          data = data.filter(d => {
            const mIdx = MONTH_OPTIONS.indexOf(d.month);
            const y = parseInt(d.year, 10);
            const val = y * 12 + mIdx;
            return val >= minVal && val <= maxVal;
          });
        }
      } else if (rangeParts.length === 1) {
        const single = parseMonthYear(rangeParts[0]);
        if (single) {
          data = data.filter(d => {
            const mIdx = MONTH_OPTIONS.indexOf(d.month);
            return mIdx === single.month && d.year === single.year.toString();
          });
        }
      }
    } else {
      // THIS_YEAR
      data = data.filter(d => d.year === '2025');
    }
    return data;
  }, [lopDatePreset, lopCustomRange]);

  // Expense Claims Filtered Data
  const currentExpenseClaimsData = useMemo(() => {
    if (expenseDatePreset === 'THIS_QUARTER') {
      return [
        { category: 'Travel', Approved: 18000, Pending: 3000, Rejected: 1000 },
        { category: 'Meal', Approved: 9000, Pending: 1500, Rejected: 500 },
        { category: 'Mobile', Approved: 4500, Pending: 600, Rejected: 200 },
        { category: 'Broadband', Approved: 3500, Pending: 400, Rejected: 0 },
        { category: 'Learning', Approved: 6000, Pending: 1200, Rejected: 800 },
        { category: 'Other', Approved: 2500, Pending: 800, Rejected: 600 },
      ];
    }
    if (expenseDatePreset === 'LAST_QUARTER') {
      return [
        { category: 'Travel', Approved: 15000, Pending: 2500, Rejected: 1000 },
        { category: 'Meal', Approved: 8000, Pending: 1200, Rejected: 300 },
        { category: 'Mobile', Approved: 4000, Pending: 500, Rejected: 100 },
        { category: 'Broadband', Approved: 3000, Pending: 300, Rejected: 0 },
        { category: 'Learning', Approved: 5000, Pending: 1000, Rejected: 600 },
        { category: 'Other', Approved: 2000, Pending: 600, Rejected: 400 },
      ];
    }
    if (expenseDatePreset === 'LAST_YEAR') {
      return EXPENSE_CLAIMS_BY_CATEGORY_STATUS_2024;
    }
    if (expenseDatePreset === 'CUSTOM' && expenseCustomRange.includes('2024')) {
      return EXPENSE_CLAIMS_BY_CATEGORY_STATUS_2024;
    }
    if (expenseDatePreset === 'CUSTOM' && expenseCustomRange.includes('2023')) {
      return EXPENSE_CLAIMS_BY_CATEGORY_STATUS_2023;
    }
    return EXPENSE_CLAIMS_BY_CATEGORY_STATUS_2025;
  }, [expenseDatePreset, expenseCustomRange]);

  // Custom dot for the Gross Salary line — highlights months where an increment was applied
  const renderGrossDot = (props: any) => {
    const { cx, cy, payload, index } = props;
    if (payload?.isIncrement) {
      return (
        <g key={`increment-dot-${index}`}>
          <path d={`M ${cx - 4} ${cy - 9} L ${cx} ${cy - 15} L ${cx + 4} ${cy - 9} Z`} fill="#7c3aed" />
          <circle cx={cx} cy={cy} r={5} fill="#7c3aed" stroke="#fff" strokeWidth={2} />
        </g>
      );
    }
    return <circle key={`dot-${index}`} cx={cx} cy={cy} r={3} fill="#6366F1" stroke="#fff" strokeWidth={1.5} />;
  };

  // Custom tooltip for the Gross vs. Net Pay trend chart
  const renderTrendTooltip = ({ active, payload }: any) => {
    if (!active || !payload || payload.length === 0) return null;
    const data = payload[0].payload;
    return (
      <div className="bg-slate-800 text-white text-xs rounded-xl shadow-xl px-3 py-2.5 space-y-1 font-medium">
        <p className="font-bold text-[11px] mb-1">{data.period}</p>
        <p>Gross Salary: <span className="font-bold">{formatINR(data.gross)}</span></p>
        <p>Net Pay: <span className="font-bold">{formatINR(data.net)}</span></p>
        <p>Deductions: <span className="font-bold">{formatINR(data.totalDeductions)}</span></p>
      </div>
    );
  };

  // ===================================================================
  // Salary Insights — additional HR/CEO/Management widgets (mock/derived data)
  // ===================================================================
  const employeeCTC = employeeData?.ctc || 1200000;

  // 1. Compa-Ratio / Market Benchmark
  const bandMin = Math.round(employeeCTC * 0.75);
  const bandMid = Math.round(employeeCTC * 1.0);
  const bandMax = Math.round(employeeCTC * 1.35);
  const compaRatio = Math.round((employeeCTC / bandMid) * 100);
  const compaPosition = Math.min(100, Math.max(0, ((employeeCTC - bandMin) / (bandMax - bandMin)) * 100));

  // 2. Retention Risk Indicator
  const RETENTION_FACTORS: { label: string; value: string; status: 'low' | 'medium' | 'high' }[] = [
    { label: 'Time since last increment', value: '8 months', status: 'low' },
    { label: 'LOP frequency (last 6 months)', value: '3 months affected', status: 'medium' },
    { label: 'Compa-ratio position', value: compaRatio < 90 ? 'Below midpoint' : 'On/above midpoint', status: compaRatio < 90 ? 'medium' : 'low' },
  ];
  const retentionRiskLevel: 'Low' | 'Medium' | 'High' = RETENTION_FACTORS.some(f => f.status === 'high')
    ? 'High'
    : RETENTION_FACTORS.some(f => f.status === 'medium')
      ? 'Medium'
      : 'Low';
  // Static class maps (Tailwind needs literal class strings, not runtime-interpolated ones)
  const RISK_LEVEL_CLASSES: Record<'Low' | 'Medium' | 'High', { badge: string; icon: string; dot: string }> = {
    Low: { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: 'text-emerald-600', dot: 'bg-emerald-500' },
    Medium: { badge: 'bg-amber-50 text-amber-700 border-amber-200', icon: 'text-amber-600', dot: 'bg-amber-500' },
    High: { badge: 'bg-rose-50 text-rose-700 border-rose-200', icon: 'text-rose-600', dot: 'bg-rose-500' },
  };
  const FACTOR_STATUS_CLASSES: Record<'low' | 'medium' | 'high', string> = {
    low: 'bg-emerald-500',
    medium: 'bg-amber-500',
    high: 'bg-rose-500',
  };

  // 3. Total Rewards Summary
  const TOTAL_REWARDS_DATA = [
    { label: 'Fixed Cash (CTC)', value: Math.round(employeeCTC * 0.82), color: '#4f46e5' },
    { label: 'Variable Pay / Bonus', value: Math.round(employeeCTC * 0.08), color: '#f59e0b' },
    { label: 'Retirals (PF + Gratuity)', value: Math.round(employeeCTC * 0.08), color: '#10b981' },
    { label: 'Benefits & Perks', value: Math.round(employeeCTC * 0.02), color: '#0ea5e9' },
  ];
  const totalRewardsValue = TOTAL_REWARDS_DATA.reduce((s, i) => s + i.value, 0);

  // 4. Appraisal & Increment History
  const APPRAISAL_HISTORY = [
    { date: 'Jul 2025', hikePercent: 12, newCtc: employeeCTC, rating: 'Exceeds Expectations' },
    { date: 'Jul 2024', hikePercent: 8, newCtc: Math.round(employeeCTC / 1.12), rating: 'Meets Expectations' },
    { date: 'Jul 2023', hikePercent: 10, newCtc: Math.round(employeeCTC / 1.12 / 1.08), rating: 'Exceeds Expectations' },
  ];

  // 5. Tax Liability & TDS Tracking (enhances the existing Total Tax Liability card)
  const estimatedAnnualTax = Math.round(employeeCTC * 0.09);
  const tdsDeductedYtd = Math.round(estimatedAnnualTax * 0.55);

  // 6. Investment Declaration Utilization
  const INVESTMENT_DECLARATION_DATA = [
    { section: '80C', declared: 150000, proofSubmitted: 90000 },
    { section: '80D', declared: 25000, proofSubmitted: 25000 },
    { section: 'HRA', declared: 240000, proofSubmitted: 180000 },
  ];

  // 7. Leave Balance & Encashment Liability
  const LEAVE_BALANCE_DATA = [
    { type: 'Earned Leave (EL)', balance: 12, encashable: true },
    { type: 'Casual Leave (CL)', balance: 4, encashable: false },
    { type: 'Sick Leave (SL)', balance: 6, encashable: false },
  ];
  const perDaySalary = Math.round(employeeCTC / 365);
  const encashmentLiability = LEAVE_BALANCE_DATA.filter(l => l.encashable).reduce((s, l) => s + l.balance * perDaySalary, 0);

  // 8. Statutory Compliance Snapshot
  const currentComplianceSnapshot = useMemo(() => {
    let multiplier = 1;
    if (statutoryDatePreset === 'THIS_QUARTER' || statutoryDatePreset === 'LAST_QUARTER') {
      multiplier = 0.25;
    } else if (statutoryDatePreset === 'LAST_YEAR') {
      multiplier = 0.92;
    } else if (statutoryDatePreset === 'CUSTOM') {
      if (statutoryCustomRange.includes('2024')) multiplier = 0.92;
      else if (statutoryCustomRange.includes('2023')) multiplier = 0.85;
      else multiplier = 1;
    }
    return [
      { label: 'Provident Fund (PF)', applicable: true, ytd: Math.round(employeeCTC * 0.04 * multiplier) },
      { label: 'ESI', applicable: false, ytd: 0 },
      { label: 'Gratuity', applicable: true, ytd: Math.round(employeeCTC * 0.0192 * multiplier) },
      { label: 'NPS', applicable: false, ytd: 0 },
    ];
  }, [statutoryDatePreset, statutoryCustomRange, employeeCTC]);

  // 9. Peer Comparison (Department/Designation)
  const PEER_COMPARISON_DATA = [
    { name: 'You', ctc: employeeCTC },
    { name: `${employeeData?.designation || 'Peer'} Avg`, ctc: Math.round(employeeCTC * 0.92) },
    { name: 'Dept Min', ctc: bandMin },
    { name: 'Dept Max', ctc: bandMax },
  ];
  const peerMaxCtc = Math.max(...PEER_COMPARISON_DATA.map(p => p.ctc), 1);

  return (
    <>
    <div className="p-4 lg:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-300">

      {/* Navigation Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Employee Details</h1>
            <p className="text-sm text-slate-500">View comprehensive payroll and profile history</p>
          </div>
        </div>

        <button 
           onClick={() => onEdit?.(employeeId)}
           className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 hover:text-sky-600 shadow-sm transition-all active:scale-95 flex items-center gap-2 group"
        >
           <Pencil size={18} className="group-hover:scale-110 transition-transform" />
           <span>Edit Profile</span>
        </button>
      </div>

      <div className="w-full">

        {/* Main Content Area */}
        <div className="space-y-6">

          {/* 1. Employee Header Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className="w-24 h-24 rounded-full bg-slate-100 border-4 border-slate-50 shadow-sm flex items-center justify-center overflow-hidden shrink-0">
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Priya Sharma" className="w-full h-full object-cover" />
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-bold text-slate-800">{employeeData?.name || 'Loading...'}</h2>
                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-100">{employeeData?.eid || '---'}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-x-8 gap-y-2 text-sm">
                <div className="flex flex-col">
                  <span className="text-slate-400 font-medium">Department</span>
                  <span className="text-slate-700 font-semibold">{employeeData?.department || '---'}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-400 font-medium">Date of Joining</span>
                  <span className="text-slate-700 font-semibold">{employeeData?.join_date || '---'}</span>
                </div>
                {/* Hidden per user request */}
                <div className="flex flex-col">
                  <span className="text-slate-400 font-medium">Next Appraisal Due</span>
                  <span className="text-purple-600 font-bold">
                    {appraisalMonth ? `${appraisalMonth.substring(0, 3)} ${new Date().getFullYear()}` : '---'}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                {/* Hidden per user request */}
                {false && (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200 rounded-full text-[11px] font-bold text-slate-600">
                    <Clock size={12} className="text-slate-400" />
                    Last Disbursal: 30 Nov 2025
                  </div>
                )}
                <button
                  onClick={() => setShowAnnexureModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-200 rounded-full text-[11px] font-bold text-indigo-700 hover:bg-indigo-100 transition-colors"
                >
                  <FileText size={12} /> View Salary Annexure
                </button>
              </div>
            </div>
          </div>

          {/* 2. Tab Navigation */}
          <div className="flex border-b border-slate-200 gap-8 shrink-0 bg-white px-6 rounded-t-xl">
            <button
              onClick={() => setActiveTab('HISTORY')}
              className={`py-4 text-sm font-bold border-b-2 transition-all ${activeTab === 'HISTORY' ? 'border-purple-600 text-purple-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              Salary History
            </button>
            <button
              onClick={() => setActiveTab('PROFILE')}
              className={`py-4 text-sm font-bold border-b-2 transition-all ${activeTab === 'PROFILE' ? 'border-purple-600 text-purple-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              Profile Details
            </button>
            <button
              onClick={() => setActiveTab('INSIGHTS')}
              className={`py-4 text-sm font-bold border-b-2 transition-all ${activeTab === 'INSIGHTS' ? 'border-purple-600 text-purple-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              Salary Insights
            </button>
          </div>

          {activeTab === 'INSIGHTS' ? (
            <div className="space-y-6 animate-in fade-in duration-300">

              {/* 3. Salary Trend Graphs Container */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full items-stretch">
                
                {/* Gross vs. Net Pay Trend */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm w-full col-span-1 lg:col-span-2">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <TrendingUp size={18} className="text-purple-600" />
                    Gross vs. Net Pay Trend
                  </h3>
                  <div className="flex items-center gap-6">
                    <DateRangePickerDropdown
                      selectedPreset={grossDatePreset}
                      customRange={grossCustomRange}
                      isOpen={grossDateDropdownOpen}
                      onToggle={() => setGrossDateDropdownOpen((prev) => !prev)}
                      onSelectPreset={(id) => {
                        setGrossDatePreset(id);
                        setGrossDateDropdownOpen(false);
                      }}
                      onApplyCustom={(val) => {
                        setGrossCustomRange(val);
                        setGrossDatePreset('CUSTOM');
                        setGrossDateDropdownOpen(false);
                      }}
                      dropdownRef={grossDropdownRef}
                      label={getDateRangeLabel(grossDatePreset, grossCustomRange)}
                    />
                  </div>
                </div>
                <div className="flex justify-center items-center gap-6 mb-4 text-xs font-bold text-slate-600 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-[#4f46e5] rounded-sm"></div> Gross Salary
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-[#22c55e] rounded-sm"></div> Net Pay
                  </div>
                </div>
                <div className="h-64 w-full">
                  {graphData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={graphData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="monthLabel" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} allowDecimals={false} />
                        <RechartsTooltip
                          cursor={{ fill: '#f8fafc' }}
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              const gross = payload.find((p: any) => p.dataKey === 'gross')?.value || 0;
                              const net = payload.find((p: any) => p.dataKey === 'net')?.value || 0;
                              return (
                                <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg text-xs min-w-[160px]">
                                  <p className="font-bold text-slate-800 mb-2 border-b border-slate-100 pb-1.5">{label}</p>
                                  <div className="space-y-1.5">
                                    <div className="flex justify-between items-center text-[#4f46e5]">
                                      <span>Gross:</span>
                                      <span className="font-semibold">{formatINR(gross as number)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[#22c55e]">
                                      <span>Net Pay:</span>
                                      <span className="font-semibold">{formatINR(net as number)}</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar dataKey="gross" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="net" fill="#22c55e" radius={[4, 4, 0, 0]} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm italic">
                      No salary data available for selected range
                    </div>
                  )}
                </div>
              </div>

              {/* Salary Trend */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm w-full col-span-1 lg:col-span-2">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <TrendingUp size={18} className="text-purple-600" />
                    Salary Trend
                  </h3>
                  <DateRangePickerDropdown
                    selectedPreset={salaryTrendDatePreset}
                    customRange={salaryTrendCustomRange}
                    isOpen={salaryTrendDateDropdownOpen}
                    onToggle={() => setSalaryTrendDateDropdownOpen((prev) => !prev)}
                    onSelectPreset={(id) => {
                      setSalaryTrendDatePreset(id);
                      setSalaryTrendDateDropdownOpen(false);
                    }}
                    onApplyCustom={(val) => {
                      setSalaryTrendCustomRange(val);
                      setSalaryTrendDatePreset('CUSTOM');
                      setSalaryTrendDateDropdownOpen(false);
                    }}
                    dropdownRef={salaryTrendDropdownRef}
                    label={getDateRangeLabel(salaryTrendDatePreset, salaryTrendCustomRange)}
                  />
                </div>

                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={salaryTrendData} margin={{ top: 24, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="monthLabel" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} allowDecimals={false} />
                      <RechartsTooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const row = payload[0].payload;
                            return (
                              <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg text-xs min-w-[160px]">
                                <p className="font-bold text-slate-800 mb-2 border-b border-slate-100 pb-1.5">{row.period}</p>
                                <div className="flex justify-between items-center text-[#4f46e5]">
                                  <span>Salary:</span>
                                  <span className="font-semibold">{formatINR(row.gross)}</span>
                                </div>
                                {row.isIncrement && (
                                  <div className="flex justify-between items-center text-[#7c3aed] pt-1.5 mt-1.5 border-t border-slate-100">
                                    <span>Increment:</span>
                                    <span className="font-semibold">+{formatINR(row.incrementAmount)}</span>
                                  </div>
                                )}
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="gross"
                        stroke="#4f46e5"
                        strokeWidth={2.5}
                        dot={(props: any) => {
                          const { cx, cy, payload, key } = props;
                          if (payload.isIncrement) {
                            const badgeLabel = `↑ +${formatINR(payload.incrementAmount)}`;
                            const badgeWidth = Math.max(70, badgeLabel.length * 6.5);
                            return (
                              <g key={key}>
                                <rect x={cx - badgeWidth / 2} y={cy - 25} width={badgeWidth} height={18} rx={4} fill="#f3e8ff" stroke="#d8b4fe" />
                                <text x={cx} y={cy - 12} fill="#7c3aed" fontSize="10" fontWeight="bold" textAnchor="middle">
                                  {badgeLabel}
                                </text>
                                <circle cx={cx} cy={cy} r={4} fill="#7c3aed" stroke="#fff" strokeWidth={1.5} />
                              </g>
                            );
                          }
                          return <circle key={key} cx={cx} cy={cy} r={3} fill="#4f46e5" stroke="#fff" strokeWidth={1.5} />;
                        }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>


              {/* Total Tax Liability & TDS Tracking Card */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm w-full flex flex-col justify-center">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <Calculator size={18} className="text-rose-600" />
                      Total Tax Liability
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 font-medium ml-6 border bg-slate-100 rounded px-2 py-0.5 inline-block">{(employeeData?.tax_regime || 'New Tax Regime').replace(/\s*\(\d{4}\)/, '')}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <select
                      value={taxYear}
                      onChange={(e) => setTaxYear(e.target.value)}
                      className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg px-3 py-1.5 focus:outline-none focus:border-rose-500 cursor-pointer hover:bg-slate-100 transition-colors"
                    >
                      <option value="2026">FY 2026-27</option>
                      <option value="2025">FY 2025-26</option>
                      <option value="2024">FY 2024-25</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-baseline gap-2 mt-2 ml-6">
                  <span className="text-3xl font-black text-slate-800">{formatINR(estimatedAnnualTax)}</span>
                  <span className="text-xs font-semibold text-slate-400">estimated</span>
                </div>

                <div className="ml-6 mt-4">
                  <div className="flex justify-between text-xs font-bold text-slate-600 mb-1.5">
                    <span>TDS Deducted (YTD): <strong className="text-slate-800">{formatINR(tdsDeductedYtd)}</strong></span>
                    <span>{Math.round((tdsDeductedYtd / estimatedAnnualTax) * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-rose-500 h-2.5 rounded-full" style={{ width: `${Math.min(100, Math.round((tdsDeductedYtd / estimatedAnnualTax) * 100))}%` }}></div>
                  </div>
                  <p className="text-xs font-semibold text-slate-500 mt-1.5">
                    Remaining {formatINR(estimatedAnnualTax - tdsDeductedYtd)} to be deducted over the rest of the financial year
                  </p>
                </div>
              </div>

              {/* Outstanding Loan/Advance Balance Card */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm w-full flex flex-col justify-center h-full">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <CreditCard size={18} className="text-blue-600" />
                      Outstanding Loan/Advance Summary
                    </h3>
                  </div>
                </div>

                {/* Loan */}
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Loan</span>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-full px-2 py-0.5">2 loans</span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-8 sm:items-center ml-6">
                    <div>
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Remaining Balance</div>
                      <span className="text-2xl font-black text-slate-800">₹1,73,333</span>
                    </div>
                    <div className="flex-1 flex flex-col gap-2">
                      <div className="flex justify-between text-xs font-bold text-slate-600">
                        <span>Amount Repaid (₹2,26,667)</span>
                        <span>Total: ₹4,00,000</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: '56.7%' }}></div>
                      </div>
                      <div className="flex justify-between text-xs font-semibold text-slate-500 mt-1">
                        <span className="flex items-center gap-1.5 text-slate-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                          EMI: <strong className="text-slate-800">₹13,333</strong> / month
                        </span>
                        <span className="flex items-center gap-1.5 text-slate-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                          <strong className="text-slate-800">17</strong> of 30 paid
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 my-3"></div>

                {/* Salary Advance */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Salary Advance</span>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">2 advances</span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-8 sm:items-center ml-6">
                    <div>
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Remaining Balance</div>
                      <span className="text-2xl font-black text-slate-800">₹20,000</span>
                    </div>
                    <div className="flex-1 flex flex-col gap-2">
                      <div className="flex justify-between text-xs font-bold text-slate-600">
                        <span>Amount Repaid (₹40,000)</span>
                        <span>Total: ₹60,000</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: '66.7%' }}></div>
                      </div>
                      <div className="flex justify-between text-xs font-semibold text-slate-500 mt-1">
                        <span className="flex items-center gap-1.5 text-slate-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                          EMI: <strong className="text-slate-800">₹10,000</strong> / month
                        </span>
                        <span className="flex items-center gap-1.5 text-slate-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                          <strong className="text-slate-800">4</strong> of 6 paid
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTC Annual Trend Chart */}
              {userRole === 'CEO' && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm w-full flex flex-col justify-center">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <TrendingUp size={18} className="text-emerald-600" />
                      Cost to Company — Annual Trend
                    </h3>
                  </div>
                  
                  <div className="flex-1 w-full min-h-[200px]">
                    <ResponsiveContainer width="100%" height={220}>
                      <ComposedChart data={CTC_TREND_DATA} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="year" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} 
                          dy={10}
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} 
                          tickFormatter={(value) => `${value / 100000}L`}
                        />
                        <RechartsTooltip content={<CtcTooltip />} cursor={{ fill: '#f8fafc' }} />
                        <Line 
                          type="monotone" 
                          dataKey="ctc" 
                          stroke="#10b981" 
                          strokeWidth={3}
                          dot={{ r: 4, fill: '#fff', stroke: '#10b981', strokeWidth: 2 }}
                          activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-center text-xs font-semibold text-slate-600">
                    <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-100 flex items-center gap-1 shadow-sm">
                      ▲ 66% CTC growth over 4 years
                    </span>
                  </div>
                </div>
              )}

                {/* Salary Breakdown Pie Chart */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      Salary Breakdown
                    </h3>
                    <div className="flex items-center gap-6">
                      <select
                        value={breakdownYear}
                        onChange={(e) => setBreakdownYear(e.target.value)}
                        className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg px-3 py-1.5 focus:outline-none focus:border-purple-500 cursor-pointer hover:bg-slate-100 transition-colors"
                      >
                        {MOCK_HISTORY_ROWS.slice(0, 10).map((row) => (
                          <option key={row.id} value={row.period}>
                            {row.period}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center relative min-h-[220px]">
                    <ResponsiveContainer width="100%" height={240}>
                      <RechartsPieChart>
                        <Pie
                          data={currentBreakdownData}
                          cx="50%"
                          cy="50%"
                          innerRadius={65}
                          outerRadius={95}
                          paddingAngle={3}
                          dataKey="value"
                          stroke="none"
                        >
                          {currentBreakdownData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          formatter={(value: any) => formatINR(value)}
                          cursor={{ fill: '#f8fafc' }}
                          contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px', fontWeight: 'bold' }}
                        />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                    
                    {/* Inner Text for Donut */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center pt-2">
                      <span className="text-xs font-bold text-slate-500">Annual</span>
                      <span className="text-sm font-black text-slate-800">CTC</span>
                    </div>
                  </div>

                  {/* Legends */}
                  <div className="flex flex-wrap justify-center items-center gap-x-5 gap-y-3 mt-4 text-[10px] font-bold text-slate-600">
                    {currentBreakdownData.map((entry, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: entry.fill }}></div> 
                        {entry.name}
                      </div>
                    ))}
                  </div>
                </div>

                {/* LOP Trend Chart */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col flex-1 min-h-[280px] h-full">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <TrendingUp size={18} className="text-rose-600" />
                        Loss of Pay (LOP) Trend
                      </h3>
                      <div className="flex items-center gap-6">
                        <DateRangePickerDropdown
                          selectedPreset={lopDatePreset}
                          customRange={lopCustomRange}
                          isOpen={lopDateDropdownOpen}
                          onToggle={() => setLopDateDropdownOpen((prev) => !prev)}
                          onSelectPreset={(id) => {
                            setLopDatePreset(id);
                            setLopDateDropdownOpen(false);
                          }}
                          onApplyCustom={(val) => {
                            setLopCustomRange(val);
                            setLopDatePreset('CUSTOM');
                            setLopDateDropdownOpen(false);
                          }}
                          dropdownRef={lopDropdownRef}
                          label={getDateRangeLabel(lopDatePreset, lopCustomRange)}
                        />
                      </div>
                    </div>
                    
                    <div className="flex-1 w-full min-h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={currentLopData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis 
                            dataKey="month" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} 
                            dy={10} 
                          />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} 
                            allowDecimals={false}
                          />
                          <RechartsTooltip content={<LopCustomTooltip />} cursor={{ fill: '#fff1f2', opacity: 0.4 }} />
                          <Line 
                            type="monotone" 
                            dataKey="lop" 
                            stroke="#e11d48" 
                            strokeWidth={3}
                            dot={{ r: 4, fill: '#fff', stroke: '#e11d48', strokeWidth: 2 }}
                            activeDot={{ r: 6, fill: '#e11d48', stroke: '#fff', strokeWidth: 2 }}
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                </div>

                {/* Reimbursement Claims Chart */}
                <div className="hidden bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col flex-1 min-h-[280px] h-full">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <DollarSign size={18} className="text-sky-500" />
                        Expenses & Reimbursement Summary
                      </h3>
                      <div className="flex items-center gap-6">
                        <select
                          value={reimbursementYear}
                          onChange={(e) => setReimbursementYear(e.target.value)}
                          className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg px-3 py-1.5 focus:outline-none focus:border-sky-500 cursor-pointer hover:bg-slate-100 transition-colors"
                        >
                          <option value="2025">2025</option>
                          <option value="2024">2024</option>
                          <option value="2023">2023</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="flex-1 w-full min-h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={getReimbursementData(reimbursementYear)} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis 
                            dataKey="month" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} 
                            dy={10}
                          />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} 
                            allowDecimals={false}
                          />
                          <RechartsTooltip content={<ReimbursementTooltip />} cursor={{ fill: '#f8fafc' }} />
                          <Bar dataKey="Travel" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} maxBarSize={30} />
                          <Bar dataKey="Food" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} maxBarSize={30} />
                          <Bar dataKey="Communication" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={30} />
                          <Bar dataKey="Pending" fill="#cbd5e1" radius={[4, 4, 0, 0]} maxBarSize={8} />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>

                </div>

                {/* Expense Claims by Category & Status */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col flex-1 min-h-[280px] h-full col-span-1">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <DollarSign size={18} className="text-sky-500" />
                        Expenses & Reimbursement Summary
                      </h3>
                      <DateRangePickerDropdown
                        selectedPreset={expenseDatePreset}
                        customRange={expenseCustomRange}
                        isOpen={expenseDateDropdownOpen}
                        onToggle={() => setExpenseDateDropdownOpen((prev) => !prev)}
                        onSelectPreset={(id) => {
                          setExpenseDatePreset(id);
                          setExpenseDateDropdownOpen(false);
                        }}
                        onApplyCustom={(val) => {
                          setExpenseCustomRange(val);
                          setExpenseDatePreset('CUSTOM');
                          setExpenseDateDropdownOpen(false);
                        }}
                        dropdownRef={expenseDropdownRef}
                        label={getDateRangeLabel(expenseDatePreset, expenseCustomRange)}
                      />
                    </div>

                    <div className="flex justify-center items-center gap-4 mb-4 text-xs font-bold text-slate-600 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 bg-emerald-500 rounded-sm"></div> Approved
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 bg-amber-400 rounded-sm"></div> Pending
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 bg-rose-500 rounded-sm"></div> Rejected
                      </div>
                    </div>

                    <div className="flex-1 w-full min-h-[200px] overflow-x-auto">
                      <div style={{ minWidth: `${Math.max(560, currentExpenseClaimsData.length * 110)}px`, height: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={currentExpenseClaimsData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                              dataKey="category"
                              axisLine={false}
                              tickLine={false}
                              tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
                              dy={10}
                            />
                            <YAxis
                              axisLine={false}
                              tickLine={false}
                              tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
                              allowDecimals={false}
                            />
                            <RechartsTooltip content={<ExpenseCategoryStatusTooltip />} cursor={{ fill: '#f8fafc' }} />
                            <Bar dataKey="Approved" stackId="status" fill="#10b981" radius={[0, 0, 0, 0]} maxBarSize={40} />
                            <Bar dataKey="Pending" stackId="status" fill="#fbbf24" radius={[0, 0, 0, 0]} maxBarSize={40} />
                            <Bar dataKey="Rejected" stackId="status" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={40} />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                </div>

                {/* 1. Compa-Ratio / Market Benchmark */}
                <div className="hidden bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <Percent size={18} className="text-indigo-600" />
                      Compa-Ratio / Market Benchmark
                    </h3>
                    <span className={`text-xs font-black px-2.5 py-1 rounded-full border ${compaRatio < 90 ? 'bg-amber-50 text-amber-700 border-amber-200' : compaRatio > 110 ? 'bg-sky-50 text-sky-700 border-sky-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                      {compaRatio}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mb-6">Current CTC relative to the salary band midpoint for this designation.</p>
                  <div className="relative mt-2 mb-2">
                    <div className="w-full h-2 bg-gradient-to-r from-amber-200 via-emerald-200 to-sky-200 rounded-full"></div>
                    <div className="absolute top-1/2" style={{ left: `${compaPosition}%`, transform: 'translate(-50%, -50%)' }}>
                      <div className="w-4 h-4 rounded-full bg-indigo-600 border-2 border-white shadow-md"></div>
                    </div>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <span>Min: {formatINR(bandMin)}</span>
                    <span>Mid: {formatINR(bandMid)}</span>
                    <span>Max: {formatINR(bandMax)}</span>
                  </div>
                  <div className="mt-auto pt-4 mt-4 border-t border-slate-100 text-xs font-semibold text-slate-600">
                    Current CTC: <strong className="text-slate-800">{formatINR(employeeCTC)}</strong>
                  </div>
                </div>

                {/* 2. Retention Risk Indicator */}
                <div className="hidden bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <AlertTriangle size={18} className={RISK_LEVEL_CLASSES[retentionRiskLevel].icon} />
                      Retention Risk Indicator
                    </h3>
                    <span className={`text-xs font-black px-2.5 py-1 rounded-full border ${RISK_LEVEL_CLASSES[retentionRiskLevel].badge}`}>
                      {retentionRiskLevel} Risk
                    </span>
                  </div>
                  <div className="space-y-3">
                    {RETENTION_FACTORS.map((factor, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs font-semibold text-slate-600 bg-slate-50 rounded-lg px-3 py-2.5">
                        <span className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${FACTOR_STATUS_CLASSES[factor.status]}`}></span>
                          {factor.label}
                        </span>
                        <span className="text-slate-800 font-bold">{factor.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Total Rewards Summary */}
                <div className="hidden bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <Wallet size={18} className="text-emerald-600" />
                      Total Rewards Summary
                    </h3>
                  </div>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-2xl font-black text-slate-800">{formatINR(totalRewardsValue)}</span>
                    <span className="text-xs font-semibold text-slate-400">total annual value</span>
                  </div>
                  <div className="w-full flex h-3 rounded-full overflow-hidden mb-4">
                    {TOTAL_REWARDS_DATA.map((item, idx) => (
                      <div key={idx} style={{ width: `${(item.value / totalRewardsValue) * 100}%`, backgroundColor: item.color }}></div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    {TOTAL_REWARDS_DATA.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs font-semibold text-slate-600">
                        <span className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item.color }}></span>
                          {item.label}
                        </span>
                        <span className="text-slate-800 font-bold">{formatINR(item.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Appraisal & Increment History */}
                <div className="hidden bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <Award size={18} className="text-amber-600" />
                      Appraisal & Increment History
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {APPRAISAL_HISTORY.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between border-b border-slate-50 last:border-0 pb-3 last:pb-0">
                        <div>
                          <p className="text-sm font-bold text-slate-800">{item.date}</p>
                          <p className="text-xs text-slate-500">{item.rating}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-emerald-600">↑ {item.hikePercent}%</p>
                          <p className="text-xs font-semibold text-slate-500">{formatINR(item.newCtc)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 6. Investment Declaration Utilization */}
                <div className="hidden bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <FileText size={18} className="text-sky-600" />
                      Investment Declaration Utilization
                    </h3>
                  </div>
                  <div className="space-y-4">
                    {INVESTMENT_DECLARATION_DATA.map((item, idx) => {
                      const pct = Math.round((item.proofSubmitted / item.declared) * 100);
                      return (
                        <div key={idx}>
                          <div className="flex justify-between text-xs font-bold text-slate-600 mb-1.5">
                            <span>{item.section}</span>
                            <span>{formatINR(item.proofSubmitted)} / {formatINR(item.declared)}</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div className={`h-2 rounded-full ${pct >= 100 ? 'bg-emerald-500' : pct >= 60 ? 'bg-sky-500' : 'bg-amber-500'}`} style={{ width: `${Math.min(100, pct)}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 7. Leave Balance & Encashment Liability */}
                <div className="hidden bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <Palmtree size={18} className="text-teal-600" />
                      Leave Balance & Encashment Liability
                    </h3>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {LEAVE_BALANCE_DATA.map((item, idx) => (
                      <div key={idx} className="bg-slate-50 rounded-lg p-3 text-center">
                        <p className="text-lg font-black text-slate-800">{item.balance}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mt-0.5">{item.type}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-auto pt-3 border-t border-slate-100 flex justify-between items-center text-xs font-semibold text-slate-600">
                    <span>Potential Encashment Liability</span>
                    <span className="text-slate-800 font-black text-sm">{formatINR(encashmentLiability)}</span>
                  </div>
                </div>

                {/* 8. Statutory Compliance Snapshot */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <ShieldCheck size={18} className="text-violet-600" />
                      Statutory Snapshot
                    </h3>
                    <DateRangePickerDropdown
                      selectedPreset={statutoryDatePreset}
                      customRange={statutoryCustomRange}
                      isOpen={statutoryDateDropdownOpen}
                      onToggle={() => setStatutoryDateDropdownOpen((prev) => !prev)}
                      onSelectPreset={(id) => {
                        setStatutoryDatePreset(id);
                        setStatutoryDateDropdownOpen(false);
                      }}
                      onApplyCustom={(val) => {
                        setStatutoryCustomRange(val);
                        setStatutoryDatePreset('CUSTOM');
                        setStatutoryDateDropdownOpen(false);
                      }}
                      dropdownRef={statutoryDropdownRef}
                      label={getDateRangeLabel(statutoryDatePreset, statutoryCustomRange)}
                    />
                  </div>
                  <div className="space-y-2">
                    {currentComplianceSnapshot.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2.5">
                        <span className="text-xs font-bold text-slate-700">{item.label}</span>
                        <div className="flex items-center gap-3">
                          {item.applicable && <span className="text-xs font-semibold text-slate-500">YTD: {formatINR(item.ytd)}</span>}
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${item.applicable ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                            {item.applicable ? 'Applicable' : 'Not Applicable'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 9. Peer Comparison (Department/Designation) */}
                <div className="hidden bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full col-span-1 lg:col-span-2">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <Users size={18} className="text-fuchsia-600" />
                      Peer Comparison — {employeeData?.designation || 'Designation'}
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {PEER_COMPARISON_DATA.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4">
                        <span className="w-24 text-xs font-bold text-slate-600 shrink-0">{item.name}</span>
                        <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                          <div
                            className={`h-3 rounded-full ${item.name === 'You' ? 'bg-indigo-600' : 'bg-slate-300'}`}
                            style={{ width: `${(item.ctc / peerMaxCtc) * 100}%` }}
                          ></div>
                        </div>
                        <span className="w-24 text-right text-xs font-bold text-slate-800 shrink-0">{formatINR(item.ctc)}</span>
                      </div>
                    ))}
                  </div>
                </div>
            </div>
            </div>
          ) : activeTab === 'HISTORY' ? (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* 4. Salary History Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-4">Payroll Month</th>
                        <th className="px-6 py-4 text-right">Gross Salary</th>
                        <th className="px-6 py-4 text-right">Deductions</th>
                        <th className="px-6 py-4 text-right">Net Pay</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Disbursed On</th>
                        <th className="px-6 py-4">Bank Account</th>
                        <th className="px-6 py-4">Created By</th>
                        <th className="px-6 py-4">Last Modified By</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginatedRows.map((row, index) => {
                        const isExpanded = expandedRow === row.id;
                        const totalDeduct = row.deductions.pf + row.deductions.tds + row.deductions.others;
                        const isIncrement = isIncrementMonth(index);

                        return (
                          <React.Fragment key={row.id}>
                            <tr className={`group transition-colors ${isExpanded ? 'bg-slate-50/80' : 'hover:bg-slate-50/50'}`}>
                              <td className="px-6 py-5">
                                <div className="flex items-center gap-2">
                                  <Calendar size={14} className="text-slate-300" />
                                  <span className="font-bold text-slate-800">{row.period}</span>
                                </div>
                              </td>
                              <td className="px-6 py-5 text-right">
                                <div className="flex flex-col items-end">
                                  <span className="font-medium text-slate-700">{formatINR(row.gross)}</span>
                                  {isIncrement && (
                                    <span className="flex items-center gap-1 text-[10px] font-black text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-100 mt-1 uppercase tracking-tighter">
                                      <ArrowUpRight size={10} /> Increment
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-5 text-right">
                                <button
                                  onClick={() => setExpandedRow(isExpanded ? null : row.id)}
                                  className="text-rose-600 font-bold hover:underline underline-offset-4 decoration-rose-200 flex items-center justify-end gap-1 ml-auto group/ded"
                                >
                                  {formatINR(totalDeduct)}
                                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} className="opacity-0 group-hover/ded:opacity-100 transition-opacity" />}
                                </button>
                              </td>
                              <td className="px-6 py-5 text-right font-black text-slate-900">{formatINR(row.net)}</td>
                              <td className="px-6 py-5">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusColor(row.status)}`}>
                                  {row.status}
                                </span>
                              </td>
                              <td className="px-6 py-5 text-slate-500">{row.date}</td>
                              <td className="px-6 py-5 font-mono text-xs text-slate-400">{row.bankAcc}</td>
                              <td className="px-6 py-5 text-xs text-slate-500 whitespace-pre-line">
                                {formatAuditUser(row.createdBy, row.date)}
                              </td>
                              <td className="px-6 py-5 text-xs text-slate-500 whitespace-pre-line">
                                {formatAuditUser(row.lastModifiedBy, row.date)}
                              </td>
                              <td className="px-6 py-5 text-right">
                                <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => handleDownload(row)}
                                    className="p-2 text-slate-400 hover:text-purple-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200 shadow-sm"
                                    title="Download PDF"
                                  >
                                    <Download size={16} />
                                  </button>
                                  <button
                                    onClick={() => { setSelectedRow(row); setActiveAction('VIEW'); }}
                                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200 shadow-sm"
                                    title="View Payslip"
                                  >
                                    <Eye size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>

                            {/* Expanded Deduction Row */}
                            {isExpanded && (
                              <tr className="bg-slate-50/80 animate-in slide-in-from-top-2 duration-200">
                                <td colSpan={10} className="px-6 py-4">
                                  <div className="flex justify-end pr-[400px]">
                                    <div className="w-80 bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
                                      <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2 mb-2">
                                        <span>Breakdown</span>
                                        <span>Amount</span>
                                      </div>
                                      <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Provident Fund (PF)</span>
                                        <span className="font-bold text-slate-700">{formatINR(row.deductions.pf)}</span>
                                      </div>
                                      <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Income Tax (TDS)</span>
                                        <span className="font-bold text-slate-700">{formatINR(row.deductions.tds)}</span>
                                      </div>
                                      <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">PT / Other Recoveries</span>
                                        <span className="font-bold text-slate-700">{formatINR(row.deductions.others)}</span>
                                      </div>
                                      <div className="pt-2 border-t border-slate-100 flex justify-between font-bold text-rose-600">
                                        <span>Total Deductions</span>
                                        <span>{formatINR(totalDeduct)}</span>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {/* Pagination Controls */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                   <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                     Showing <span className="text-slate-800">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-slate-800">{Math.min(currentPage * itemsPerPage, MOCK_HISTORY_ROWS.length)}</span> of <span className="text-slate-800">{MOCK_HISTORY_ROWS.length}</span> records
                   </div>
                   <div className="flex items-center gap-2">
                     <button 
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                     >
                       Previous
                     </button>
                     {[...Array(totalPages)].map((_, i) => (
                       <button
                          key={i + 1}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${currentPage === i + 1 ? 'bg-purple-600 text-white shadow-lg shadow-purple-100' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                       >
                         {i + 1}
                       </button>
                     ))}
                     <button 
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                     >
                       Next
                     </button>
                   </div>
                 </div>
              </div>
            </div>
          ) : activeTab === 'PROFILE' ? (
            /* 5. Profile Details Tab Content */
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Identity & Basic Info */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <User size={18} className="text-slate-400" /> Employee Profile Information
                  </h3>
                </div>
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Full Name</label>
                    <p className="text-sm font-semibold text-slate-800 py-1 border-b border-slate-50">{employeeData?.name || '---'}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Designation</label>
                    <p className="text-sm font-semibold text-slate-800 py-1 border-b border-slate-50">{employeeData?.designation || '---'}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Department</label>
                    <p className="text-sm font-semibold text-slate-800 py-1 border-b border-slate-50">{employeeData?.department || '---'}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Work Location</label>
                    <p className="text-sm font-semibold text-slate-800 py-1 border-b border-slate-50">{employeeData?.location || '---'}</p>
                  </div>
                </div>
              </div>

              {/* Bank Information */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Building size={18} className="text-slate-400" /> Bank & Payment Details
                  </h3>
                </div>
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Account Number</label>
                    <p className="text-sm font-mono font-bold text-slate-800 py-1 border-b border-slate-50">{employeeData?.bank_account_no || '---'}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">IFSC Code</label>
                    <p className="text-sm font-mono font-bold text-slate-800 py-1 border-b border-slate-50">{employeeData?.bank_ifsc || '---'}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Bank Name</label>
                    <p className="text-sm font-semibold text-slate-700 py-1 border-b border-slate-50">HDFC Bank</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Branch</label>
                    <p className="text-sm font-semibold text-slate-700 py-1 border-b border-slate-50">Koramangala 4th Block</p>
                  </div>
                </div>
              </div>

              {/* Statutory & Compliance */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <ShieldCheck size={18} className="text-slate-400" /> Statutory & Tax Compliance
                  </h3>
                </div>
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">PAN Number</label>
                    <div className="flex items-center gap-2">
                      <CreditCard size={14} className="text-slate-400" />
                      <p className="text-sm font-mono font-bold text-slate-800">{employeeData?.pan_no || '---'}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Aadhaar Number</label>
                    <div className="flex items-center gap-2">
                      <CreditCard size={14} className="text-slate-400" />
                      <p className="text-sm font-mono font-bold text-slate-800">{employeeData?.aadhaar_no || '---'}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">UAN (Provident Fund)</label>
                    <p className="text-sm font-mono font-bold text-slate-800">{employeeData?.uan_no || '---'}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Tax Regime (Current FY)</label>
                    <p className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded w-fit">{employeeData?.tax_regime || '---'}</p>
                  </div>
                  {userRole === 'HR_MANAGER' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">PRAN Number</label>
                      <p className="text-sm font-mono font-bold text-slate-800">{pranNumber || '---'}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>

      </div>

      {/* --- OVERLAY SCREENS --- */}      {/* Annexure Modal */}
      {showAnnexureModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
               <div className="flex items-center gap-8">
                 <div>
                    <h3 className="font-bold text-slate-800">Salary Structure Annexure</h3>
                 </div>
                 
                 <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

                 <div className="hidden sm:flex items-center gap-8 text-[11px]">
                    <div className="flex flex-col">
                       <span className="text-slate-400 font-bold uppercase tracking-wider">Current CTC</span>
                       <span className="text-slate-700 font-black">{formatINR(employeeData?.ctc || 0)}</span>
                    </div>
                    <div className="flex flex-col">
                       <span className="text-slate-400 font-bold uppercase tracking-wider">Monthly Net</span>
                       <span className="text-emerald-600 font-black">
                         {formatINR(salary ? (salary.monthlyGross - salary.employeeDeductions.reduce((sum: number, d: any) => sum + d.monthly, 0)) : 128400)}
                       </span>
                    </div>
                 </div>
               </div>
              <button onClick={() => setShowAnnexureModal(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"><X size={20} /></button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8">
               <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left">Component</th>
                      <th className="px-4 py-3 text-right">Monthly (₹)</th>
                      <th className="px-4 py-3 text-right">Annual (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {/* Earnings */}
                    <tr className="bg-emerald-50/50"><td colSpan={3} className="px-4 py-2 font-bold text-emerald-800 text-xs uppercase">A. Earnings</td></tr>
                    {structureComponents.earnings.length > 0 && salary ? (
                      <>
                        {salary.earnings.map((e: any) => (
                          <tr key={e.name}>
                            <td className="px-4 py-2 text-slate-700">{e.name}</td>
                            <td className="px-4 py-2 text-right text-slate-600">{formatINR(e.monthly).replace('₹', '').trim()}</td>
                            <td className="px-4 py-2 text-right text-slate-800 font-medium">{formatINR(e.annual).replace('₹', '').trim()}</td>
                          </tr>
                        ))}
                        <tr className="font-bold bg-slate-50">
                          <td className="px-4 py-2 text-slate-800">Total Gross Salary (A)</td>
                          <td className="px-4 py-2 text-right">{formatINR(salary.monthlyGross).replace('₹', '').trim()}</td>
                          <td className="px-4 py-2 text-right">{formatINR(salary.annualGross).replace('₹', '').trim()}</td>
                        </tr>
                      </>
                    ) : (
                      <>
                        <tr>
                          <td className="px-4 py-2 text-slate-700">Basic Salary</td>
                          <td className="px-4 py-2 text-right text-slate-600">61,667</td>
                          <td className="px-4 py-2 text-right text-slate-800 font-medium">7,40,000</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 text-slate-700">House Rent Allowance</td>
                          <td className="px-4 py-2 text-right text-slate-600">30,833</td>
                          <td className="px-4 py-2 text-right text-slate-800 font-medium">3,70,000</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 text-slate-700">Special Allowance</td>
                          <td className="px-4 py-2 text-right text-slate-600">52,967</td>
                          <td className="px-4 py-2 text-right text-slate-800 font-medium">6,35,600</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 text-slate-700">Leave Travel Allowance</td>
                          <td className="px-4 py-2 text-right text-slate-600">4,167</td>
                          <td className="px-4 py-2 text-right text-slate-800 font-medium">50,000</td>
                        </tr>
                        <tr className="font-bold bg-slate-50">
                          <td className="px-4 py-2 text-slate-800">Total Gross Salary (A)</td>
                          <td className="px-4 py-2 text-right">1,49,634</td>
                          <td className="px-4 py-2 text-right">17,95,600</td>
                        </tr>
                      </>
                    )}

                    {/* Retirals */}
                    <tr className="bg-sky-50/50"><td colSpan={3} className="px-4 py-2 font-bold text-sky-800 text-xs uppercase">B. Retirals (Employer Contribution)</td></tr>
                    {structureComponents.earnings.length > 0 && salary ? (
                      <>
                        {salary.employerContributions.map((e: any) => (
                          <tr key={e.name}>
                            <td className="px-4 py-2 text-slate-700">{e.name}</td>
                            <td className="px-4 py-2 text-right text-slate-600">{formatINR(e.monthly).replace('₹', '').trim()}</td>
                            <td className="px-4 py-2 text-right text-slate-800 font-medium">{formatINR(e.annual).replace('₹', '').trim()}</td>
                          </tr>
                        ))}
                        <tr className="font-bold bg-slate-50">
                          <td className="px-4 py-2 text-slate-800">Total Retirals (B)</td>
                          <td className="px-4 py-2 text-right">{formatINR(salary.employerContributions.reduce((sum: number, c: any) => sum + c.monthly, 0)).replace('₹', '').trim()}</td>
                          <td className="px-4 py-2 text-right">{formatINR(salary.employerContributions.reduce((sum: number, c: any) => sum + c.annual, 0)).replace('₹', '').trim()}</td>
                        </tr>
                      </>
                    ) : (
                      <>
                        <tr>
                          <td className="px-4 py-2 text-slate-700">Provident Fund (Employer)</td>
                          <td className="px-4 py-2 text-right text-slate-600">1,800</td>
                          <td className="px-4 py-2 text-right text-slate-800 font-medium">21,600</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 text-slate-700">Gratuity</td>
                          <td className="px-4 py-2 text-right text-slate-600">2,733</td>
                          <td className="px-4 py-2 text-right text-slate-800 font-medium">32,800</td>
                        </tr>
                        <tr className="font-bold bg-slate-50">
                          <td className="px-4 py-2 text-slate-800">Total Retirals (B)</td>
                          <td className="px-4 py-2 text-right">4,533</td>
                          <td className="px-4 py-2 text-right">54,400</td>
                        </tr>
                      </>
                    )}

                    {/* Deductions (Employee Share) */}
                    <tr className="bg-rose-50/50"><td colSpan={3} className="px-4 py-2 font-bold text-rose-800 text-xs uppercase">C. Deductions (Employee Share)</td></tr>
                    {structureComponents.earnings.length > 0 && salary ? (
                      <>
                        {salary.employeeDeductions.map((e: any) => (
                          <tr key={e.name}>
                            <td className="px-4 py-2 text-slate-700">{e.name}</td>
                            <td className="px-4 py-2 text-right text-slate-600">{formatINR(e.monthly).replace('₹', '').trim()}</td>
                            <td className="px-4 py-2 text-right text-slate-800 font-medium">{formatINR(e.annual).replace('₹', '').trim()}</td>
                          </tr>
                        ))}
                        <tr className="font-bold bg-slate-50">
                          <td className="px-4 py-2 text-slate-800">Total Deductions (C)</td>
                          <td className="px-4 py-2 text-right">{formatINR(salary.employeeDeductions.reduce((sum: number, d: any) => sum + d.monthly, 0)).replace('₹', '').trim()}</td>
                          <td className="px-4 py-2 text-right">{formatINR(salary.employeeDeductions.reduce((sum: number, d: any) => sum + d.annual, 0)).replace('₹', '').trim()}</td>
                        </tr>
                      </>
                    ) : (
                      <>
                        <tr>
                          <td className="px-4 py-2 text-slate-700">Provident Fund (Employee)</td>
                          <td className="px-4 py-2 text-right text-slate-600">1,800</td>
                          <td className="px-4 py-2 text-right text-slate-800 font-medium">21,600</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 text-slate-700">Professional Tax</td>
                          <td className="px-4 py-2 text-right text-slate-600">200</td>
                          <td className="px-4 py-2 text-right text-slate-800 font-medium">2,400</td>
                        </tr>
                        <tr className="font-bold bg-slate-50">
                          <td className="px-4 py-2 text-slate-800">Total Deductions (C)</td>
                          <td className="px-4 py-2 text-right">2,000</td>
                          <td className="px-4 py-2 text-right">24,000</td>
                        </tr>
                      </>
                    )}
                  </tbody>
                  <tfoot className="bg-slate-800 text-white font-bold">
                    <tr>
                      <td className="px-4 py-3">Total Cost to Company (A + B)</td>
                      <td className="px-4 py-3 text-right">
                        {salary ? formatINR(salary.monthlyGross + salary.employerContributions.reduce((sum: number, c: any) => sum + c.monthly, 0)).replace('₹', '').trim() : '1,54,167'}
                      </td>
                      <td className="px-4 py-3 text-right text-lg">
                        {salary ? formatINR(salary.annualGross + salary.employerContributions.reduce((sum: number, c: any) => sum + c.annual, 0)).replace('₹', '').trim() : '18,50,000'}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button onClick={() => setShowAnnexureModal(false)} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Download Modal */}
      {isBulkDownloadOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><FileArchive size={20} /></div>
                <div>
                  <h3 className="font-bold text-slate-800">Bulk Download Payslips</h3>
                  <p className="text-xs text-slate-500 uppercase font-black tracking-tighter">Priya Sharma (TF00912)</p>
                </div>
              </div>
              <button onClick={closeBulkDownload} className="p-1.5 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"><X size={20} /></button>
            </div>

            {/* Body Content based on Step */}
            <div className="p-8">
              {bulkDownloadStep === 'OPTIONS' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Select Range</label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 p-3 border border-purple-100 bg-purple-50/30 rounded-xl cursor-pointer hover:bg-purple-50 transition-colors group">
                        <input type="radio" name="range" defaultChecked className="w-4 h-4 text-purple-600 focus:ring-purple-500" />
                        <div className="flex-1">
                          <p className="text-sm font-bold text-slate-700">Current FY (2025-26)</p>
                          <p className="text-xs text-slate-400">8 Payslips available</p>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors group">
                        <input type="radio" name="range" className="w-4 h-4 text-purple-600 focus:ring-purple-500" />
                        <div className="flex-1">
                          <p className="text-sm font-bold text-slate-700">Previous FY (2024-25)</p>
                          <p className="text-xs text-slate-400">12 Payslips available</p>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors group">
                        <input type="radio" name="range" className="w-4 h-4 text-purple-600 focus:ring-purple-500" />
                        <div className="flex-1">
                          <p className="text-sm font-bold text-slate-700">All Time History</p>
                          <p className="text-xs text-slate-400">35 Payslips total</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Export Format</label>
                    <div className="flex gap-3">
                      <button className="flex-1 py-3 bg-white border-2 border-purple-600 text-purple-700 rounded-xl text-xs font-bold flex flex-col items-center gap-1 shadow-sm">
                        <Download size={16} /> Bundled ZIP
                      </button>
                      <button className="flex-1 py-3 bg-white border border-slate-200 text-slate-500 rounded-xl text-xs font-bold flex flex-col items-center gap-1 hover:bg-slate-50 transition-colors">
                        <FileText size={16} /> Combined PDF
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleBulkDownloadStart}
                    className="w-full mt-2 py-3 bg-purple-600 text-white rounded-xl font-bold text-sm hover:bg-purple-700 transition-all shadow-xl shadow-purple-100 flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={18} /> Start Bundling Files
                  </button>
                </div>
              )}

              {bulkDownloadStep === 'PROGRESS' && (
                <div className="flex flex-col items-center justify-center py-6 animate-in fade-in">
                  <div className="relative mb-6">
                    <div className="w-24 h-24 rounded-full border-4 border-slate-100 border-t-purple-600 animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center font-bold text-purple-600">
                      {progress}%
                    </div>
                  </div>
                  <h4 className="text-lg font-bold text-slate-800">Generating Archive...</h4>
                  <p className="text-sm text-slate-500 mt-1 text-center">We are bundling all payslips with verified digital signatures and tax stamps.</p>

                  <div className="w-full mt-10 bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-600 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                  </div>
                  <p className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Applying encryption to PDFs...</p>
                </div>
              )}

              {bulkDownloadStep === 'COMPLETE' && (
                <div className="flex flex-col items-center justify-center py-6 animate-in zoom-in-95 duration-300">
                  <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-6 border-4 border-emerald-100 ring-8 ring-emerald-50/50">
                    <Check size={40} strokeWidth={3} />
                  </div>
                  <h4 className="text-xl font-black text-slate-800">Archive Ready!</h4>
                  <p className="text-sm text-slate-500 mt-2 text-center">Your bulk payslip package has been generated successfully.</p>

                  <div className="w-full mt-8 p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-4">
                    <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm"><FileArchive className="text-purple-600" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">Payslips_Priya_Sharma.zip</p>
                      <p className="text-xs text-slate-400">Total Size: 4.2 MB</p>
                    </div>
                    <button
                      className="p-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
                      onClick={closeBulkDownload}
                    >
                      <Download size={20} />
                    </button>
                  </div>

                  <button
                    onClick={closeBulkDownload}
                    className="mt-8 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Individual Download Progress Overlay */}
      {isDownloading && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center text-center max-w-sm">
            <div className="relative mb-6">
              <div className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-purple-600 animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center"><Download size={24} className="text-purple-600" /></div>
            </div>
            <h3 className="text-lg font-bold text-slate-800">Generating PDF...</h3>
            <p className="text-sm text-slate-500 mt-1">Preparing high-resolution payslip with verified statutory stamps.</p>
          </div>
        </div>
      )}

      {/* View Payslip Modal */}
      {selectedRow && activeAction === 'VIEW' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm text-indigo-600"><FileText size={20} /></div>
                <div>
                  <h3 className="font-bold text-slate-800">Payslip: {selectedRow.period}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Employee: Priya Sharma (TF00912)</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { setSelectedRow(null); setActiveAction(null); }} className="p-2 text-slate-400 hover:text-rose-600 bg-white rounded-full transition-colors border border-slate-200"><X size={20} /></button>
              </div>
            </div>

            {/* Payslip Content */}
            <div className="flex-1 overflow-y-auto p-12 bg-slate-100/50">
              <div className="max-w-3xl mx-auto bg-white shadow-sm border border-slate-200 p-10 flex flex-col min-h-[800px]" style={{ fontFamily: 'Times New Roman, serif' }}>
                <div className="flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-8">
                  <div className="h-16 w-16 bg-slate-800 rounded flex items-center justify-center text-white font-black text-2xl shadow-md italic">C</div>
                  <div className="text-right">
                    <h1 className="text-2xl font-bold uppercase tracking-tight text-slate-800">CollabCRM Systems</h1>
                    <p className="text-sm text-slate-500 mt-1">123, Tech Plaza, Bangalore - 560001</p>
                  </div>
                </div>

                <div className="text-center mb-8">
                  <h2 className="text-xl font-bold underline underline-offset-4 decoration-1">PAYSLIP FOR THE MONTH OF {selectedRow.period.toUpperCase()}</h2>
                </div>

                <div className="grid grid-cols-2 gap-x-12 gap-y-4 mb-8 text-sm">
                  <div className="flex justify-between border-b border-slate-100 pb-1"><span className="font-bold text-slate-600">Employee Name</span><span>: Priya Sharma</span></div>
                  <div className="flex justify-between border-b border-slate-100 pb-1"><span className="font-bold text-slate-600">Employee ID</span><span>: TF00912</span></div>
                  <div className="flex justify-between border-b border-slate-100 pb-1"><span className="font-bold text-slate-600">Designation</span><span>: Senior Engineer</span></div>
                  <div className="flex justify-between border-b border-slate-100 pb-1"><span className="font-bold text-slate-600">Department</span><span>: Engineering</span></div>
                  <div className="flex justify-between border-b border-slate-100 pb-1"><span className="font-bold text-slate-600">Bank A/c No.</span><span>: {selectedRow.bankAcc}</span></div>
                  <div className="flex justify-between border-b border-slate-100 pb-1"><span className="font-bold text-slate-600">PAN Number</span><span>: ABCDE1234F</span></div>
                </div>

                <div className="flex-1">
                  <table className="w-full border-collapse border border-slate-300 text-sm">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="border border-slate-300 p-2 text-left">EARNINGS</th>
                        <th className="border border-slate-300 p-2 text-right">AMOUNT</th>
                        <th className="border border-slate-300 p-2 text-left">DEDUCTIONS</th>
                        <th className="border border-slate-300 p-2 text-right">AMOUNT</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-slate-300 p-2">Basic Salary</td>
                        <td className="border border-slate-300 p-2 text-right">{formatINR(selectedRow.gross * 0.5)}</td>
                        <td className="border border-slate-300 p-2">Provident Fund</td>
                        <td className="border border-slate-300 p-2 text-right">{formatINR(selectedRow.deductions.pf)}</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2">House Rent Allowance</td>
                        <td className="border border-slate-300 p-2 text-right">{formatINR(selectedRow.gross * 0.25)}</td>
                        <td className="border border-slate-300 p-2">Professional Tax</td>
                        <td className="border border-slate-300 p-2 text-right">{formatINR(selectedRow.deductions.others)}</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2">Special Allowance</td>
                        <td className="border border-slate-300 p-2 text-right">{formatINR(selectedRow.gross * 0.25)}</td>
                        <td className="border border-slate-300 p-2">Income Tax (TDS)</td>
                        <td className="border border-slate-300 p-2 text-right">{formatINR(selectedRow.deductions.tds)}</td>
                      </tr>
                      <tr className="bg-slate-50 font-bold">
                        <td className="border border-slate-300 p-2">TOTAL EARNINGS</td>
                        <td className="border border-slate-300 p-2 text-right">{formatINR(selectedRow.gross)}</td>
                        <td className="border border-slate-300 p-2">TOTAL DEDUCTIONS</td>
                        <td className="border border-slate-300 p-2 text-right">{formatINR(selectedRow.deductions.pf + selectedRow.deductions.tds + selectedRow.deductions.others)}</td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="mt-8 flex justify-end">
                    <div className="w-1/2 border-2 border-slate-800 p-4 flex justify-between items-center bg-slate-50">
                      <span className="font-bold text-slate-700">NET PAYABLE:</span>
                      <span className="text-2xl font-black text-slate-900">{formatINR(selectedRow.net)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-12 border-t border-slate-200">
                  <div className="flex justify-between italic text-xs text-slate-400">
                    <span>Note: This is a computer generated payslip, no signature required.</span>
                    <span>Issued On: {selectedRow.date}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => { setSelectedRow(null); setActiveAction(null); }} className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors">Close</button>
              <button onClick={() => handleDownload(selectedRow)} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-100 flex items-center gap-2"><Download size={18} /> Download PDF</button>
            </div>
          </div>
        </div>
      )}

    </div>
    </>
  );
};

export default EmployeeSalaryHistory;

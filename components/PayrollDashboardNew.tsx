import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Users,
  Wallet,
  ShieldCheck,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Building2,
  FileWarning,
  UserPlus,
  UserMinus,
  Landmark,
  CalendarClock,
  Activity,
  PieChart as PieChartIcon,
  Calendar,
  ChevronDown,
  Filter,
  DollarSign,
  FileText,
  Download,
  X
} from 'lucide-react';
import {
  ComposedChart,
  BarChart,
  LineChart,
  AreaChart,
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

const formatINR = (v: number) => `₹${v.toLocaleString('en-IN')}`;
const formatCr = (v: number) => formatINR(v);
const formatL = (v: number) => formatINR(v);
// Chart values are stored in lakh units (e.g. 178 = ₹1,78,00,000); convert to full rupees for display.
const formatLakhValueAsINR = (v: number) => formatINR(Math.round(v * 100000));

// ===================== Mock Data =====================

const PAYROLL_COST_TREND = [
  { month: 'Dec', gross: 138, net: 108, employeeDeductions: 30, employerDeductions: 11.5, statutory: 24 },
  { month: 'Jan', gross: 150, net: 118, employeeDeductions: 32, employerDeductions: 12.2, statutory: 26 },
  { month: 'Feb', gross: 145, net: 114, employeeDeductions: 31, employerDeductions: 11.8, statutory: 25 },
  { month: 'Mar', gross: 162, net: 128, employeeDeductions: 34, employerDeductions: 13.0, statutory: 28 },
  { month: 'Apr', gross: 155, net: 122, employeeDeductions: 33, employerDeductions: 12.5, statutory: 27 },
  { month: 'May', gross: 168, net: 132, employeeDeductions: 36, employerDeductions: 13.5, statutory: 29 },
  { month: 'Jun', gross: 162, net: 127, employeeDeductions: 35, employerDeductions: 13.2, statutory: 28 },
  { month: 'Jul', gross: 188, net: 148, employeeDeductions: 40, employerDeductions: 15.2, statutory: 33 },
  { month: 'Aug', gross: 177, net: 139, employeeDeductions: 38, employerDeductions: 14.5, statutory: 31 },
  { month: 'Sep', gross: 196, net: 154, employeeDeductions: 42, employerDeductions: 16.0, statutory: 35 },
  { month: 'Oct', gross: 176, net: 136, employeeDeductions: 40, employerDeductions: 14.8, statutory: 32 },
  { month: 'Nov', gross: 185, net: 142, employeeDeductions: 43, employerDeductions: 15.2, statutory: 32.6 },
];

const COST_BY_BU = [
  {
    bu: 'CollabCRM',
    cost: 62,
    gross: 4800000,
    employeeDeductions: 950000,
    employerContributions: 450000,
    totalCost: 6200000,
  },
  {
    bu: '300 Minds',
    cost: 48,
    gross: 3700000,
    employeeDeductions: 750000,
    employerContributions: 350000,
    totalCost: 4800000,
  },
  {
    bu: 'MindInventory',
    cost: 41,
    gross: 3200000,
    employeeDeductions: 600000,
    employerContributions: 300000,
    totalCost: 4100000,
  },
  {
    bu: 'BlueWhale Tech',
    cost: 34,
    gross: 2650000,
    employeeDeductions: 500000,
    employerContributions: 250000,
    totalCost: 3400000,
  },
];

const COST_BY_DEPARTMENT = [
  { name: 'Engineering', value: 83.25, amount: '₹83.25 L', percentage: 45, fill: '#6366f1' },
  { name: 'Sales & Mktg', value: 46.25, amount: '₹46.25 L', percentage: 25, fill: '#ec4899' },
  { name: 'Operations', value: 37.00, amount: '₹37.00 L', percentage: 20, fill: '#10b981' },
  { name: 'Others', value: 18.50, amount: '₹18.50 L', percentage: 10, fill: '#f59e0b' },
];

const COST_BY_BU_MAP: Record<string, typeof COST_BY_BU> = {
  'This Month': COST_BY_BU,
  'Last Month': [
    { bu: 'CollabCRM', cost: 58, gross: 4500000, employeeDeductions: 900000, employerContributions: 400000, totalCost: 5800000 },
    { bu: '300 Minds', cost: 45, gross: 3500000, employeeDeductions: 700000, employerContributions: 300000, totalCost: 4500000 },
    { bu: 'MindInventory', cost: 38, gross: 2950000, employeeDeductions: 550000, employerContributions: 300000, totalCost: 3800000 },
    { bu: 'BlueWhale Tech', cost: 31, gross: 2450000, employeeDeductions: 450000, employerContributions: 200000, totalCost: 3100000 },
  ],
  'This Quarter': [
    { bu: 'CollabCRM', cost: 180, gross: 14000000, employeeDeductions: 2800000, employerContributions: 1200000, totalCost: 18000000 },
    { bu: '300 Minds', cost: 140, gross: 10800000, employeeDeductions: 2200000, employerContributions: 1000000, totalCost: 14000000 },
    { bu: 'MindInventory', cost: 119, gross: 9200000, employeeDeductions: 1750000, employerContributions: 950000, totalCost: 11900000 },
    { bu: 'BlueWhale Tech', cost: 98, gross: 7600000, employeeDeductions: 1450000, employerContributions: 750000, totalCost: 9800000 },
  ],
  'Last Quarter': [
    { bu: 'CollabCRM', cost: 170, gross: 13200000, employeeDeductions: 2650000, employerContributions: 1150000, totalCost: 17000000 },
    { bu: '300 Minds', cost: 132, gross: 10200000, employeeDeductions: 2050000, employerContributions: 950000, totalCost: 13200000 },
    { bu: 'MindInventory', cost: 112, gross: 8700000, employeeDeductions: 1650000, employerContributions: 850000, totalCost: 11200000 },
    { bu: 'BlueWhale Tech', cost: 92, gross: 7100000, employeeDeductions: 1380000, employerContributions: 720000, totalCost: 9200000 },
  ],
  'This Year': [
    { bu: 'CollabCRM', cost: 710, gross: 55000000, employeeDeductions: 11000000, employerContributions: 5000000, totalCost: 71000000 },
    { bu: '300 Minds', cost: 550, gross: 42500000, employeeDeductions: 8500000, employerContributions: 4000000, totalCost: 55000000 },
    { bu: 'MindInventory', cost: 470, gross: 36500000, employeeDeductions: 7000000, employerContributions: 3500000, totalCost: 47000000 },
    { bu: 'BlueWhale Tech', cost: 390, gross: 30000000, employeeDeductions: 6000000, employerContributions: 3000000, totalCost: 39000000 },
  ],
  'Last Year': [
    { bu: 'CollabCRM', cost: 620, gross: 48000000, employeeDeductions: 9600000, employerContributions: 4400000, totalCost: 62000000 },
    { bu: '300 Minds', cost: 480, gross: 37000000, employeeDeductions: 7500000, employerContributions: 3500000, totalCost: 48000000 },
    { bu: 'MindInventory', cost: 410, gross: 31800000, employeeDeductions: 6200000, employerContributions: 3000000, totalCost: 41000000 },
    { bu: 'BlueWhale Tech', cost: 340, gross: 26200000, employeeDeductions: 5200000, employerContributions: 2600000, totalCost: 34000000 },
  ],
};

const COST_BY_DEPT_MAP: Record<string, { totalLabel: string; data: typeof COST_BY_DEPARTMENT }> = {
  'This Month': {
    totalLabel: '₹1.85 Cr',
    data: COST_BY_DEPARTMENT,
  },
  'Last Month': {
    totalLabel: '₹1.76 Cr',
    data: [
      { name: 'Engineering', value: 79.20, amount: '₹79.20 L', percentage: 45, fill: '#6366f1' },
      { name: 'Sales & Mktg', value: 44.00, amount: '₹44.00 L', percentage: 25, fill: '#ec4899' },
      { name: 'Operations', value: 35.20, amount: '₹35.20 L', percentage: 20, fill: '#10b981' },
      { name: 'Others', value: 17.60, amount: '₹17.60 L', percentage: 10, fill: '#f59e0b' },
    ],
  },
  'This Quarter': {
    totalLabel: '₹5.42 Cr',
    data: [
      { name: 'Engineering', value: 243.90, amount: '₹2.44 Cr', percentage: 45, fill: '#6366f1' },
      { name: 'Sales & Mktg', value: 135.50, amount: '₹1.36 Cr', percentage: 25, fill: '#ec4899' },
      { name: 'Operations', value: 108.40, amount: '₹1.08 Cr', percentage: 20, fill: '#10b981' },
      { name: 'Others', value: 54.20, amount: '₹54.20 L', percentage: 10, fill: '#f59e0b' },
    ],
  },
  'Last Quarter': {
    totalLabel: '₹5.08 Cr',
    data: [
      { name: 'Engineering', value: 228.60, amount: '₹2.29 Cr', percentage: 45, fill: '#6366f1' },
      { name: 'Sales & Mktg', value: 127.00, amount: '₹1.27 Cr', percentage: 25, fill: '#ec4899' },
      { name: 'Operations', value: 101.60, amount: '₹1.02 Cr', percentage: 20, fill: '#10b981' },
      { name: 'Others', value: 50.80, amount: '₹50.80 L', percentage: 10, fill: '#f59e0b' },
    ],
  },
  'This Year': {
    totalLabel: '₹21.40 Cr',
    data: [
      { name: 'Engineering', value: 963.00, amount: '₹9.63 Cr', percentage: 45, fill: '#6366f1' },
      { name: 'Sales & Mktg', value: 535.00, amount: '₹5.35 Cr', percentage: 25, fill: '#ec4899' },
      { name: 'Operations', value: 428.00, amount: '₹4.28 Cr', percentage: 20, fill: '#10b981' },
      { name: 'Others', value: 214.00, amount: '₹2.14 Cr', percentage: 10, fill: '#f59e0b' },
    ],
  },
  'Last Year': {
    totalLabel: '₹19.00 Cr',
    data: [
      { name: 'Engineering', value: 855.00, amount: '₹8.55 Cr', percentage: 45, fill: '#6366f1' },
      { name: 'Sales & Mktg', value: 475.00, amount: '₹4.75 Cr', percentage: 25, fill: '#ec4899' },
      { name: 'Operations', value: 380.00, amount: '₹3.80 Cr', percentage: 20, fill: '#10b981' },
      { name: 'Others', value: 190.00, amount: '₹1.90 Cr', percentage: 10, fill: '#f59e0b' },
    ],
  },
};

const MONTHLY_VARIABLE_PAY = [
  { month: 'Dec', variable: 18.5, formatted: '₹18,50,000' },
  { month: 'Jan', variable: 12.0, formatted: '₹12,00,000' },
  { month: 'Feb', variable: 8.5, formatted: '₹8,50,000' },
  { month: 'Mar', variable: 24.0, formatted: '₹24,00,000' },
  { month: 'Apr', variable: 9.0, formatted: '₹9,00,000' },
  { month: 'May', variable: 11.5, formatted: '₹11,50,000' },
  { month: 'Jun', variable: 15.0, formatted: '₹15,00,000' },
  { month: 'Jul', variable: 22.5, formatted: '₹22,50,000' },
  { month: 'Aug', variable: 10.5, formatted: '₹10,50,000' },
  { month: 'Sep', variable: 19.0, formatted: '₹19,00,000' },
  { month: 'Oct', variable: 28.0, formatted: '₹28,00,000' },
  { month: 'Nov', variable: 14.2, formatted: '₹14,20,000' },
];

const getVariablePayData = (range: string) => {
  if (range === 'This Month') return MONTHLY_VARIABLE_PAY.slice(-3);
  if (range === 'Last Month') return MONTHLY_VARIABLE_PAY.slice(-4, -1);
  if (range === 'This Quarter' || range === 'Last Quarter') return MONTHLY_VARIABLE_PAY.slice(-6);
  return MONTHLY_VARIABLE_PAY;
};

const YOY_GROWTH = [
  { year: '2023', payrollGrowth: 12, headcountGrowth: 8 },
  { year: '2024', payrollGrowth: 15, headcountGrowth: 10 },
  { year: '2025', payrollGrowth: 18, headcountGrowth: 11 },
];

const BUDGET_VS_ACTUAL = [
  { month: 'Aug', budget: 190, actual: 185 },
  { month: 'Sep', budget: 190, actual: 187 },
  { month: 'Oct', budget: 188, actual: 184 },
  { month: 'Nov', budget: 188, actual: 185 },
];

const LOCATION_COST = [
  { location: 'Bengaluru', cost: 68 },
  { location: 'Pune', cost: 45 },
  { location: 'Ahmedabad', cost: 38 },
  { location: 'Remote', cost: 34 },
];

const COMPLIANCE_CALENDAR = [
  { item: 'PF Payment', due: '15 Dec 2025', status: 'Pending' as const },
  { item: 'ESI Payment', due: '15 Dec 2025', status: 'Pending' as const },
  { item: 'Professional Tax', due: '20 Dec 2025', status: 'Filed' as const },
  { item: 'TDS Deposit (Sec 192)', due: '07 Jan 2026', status: 'Pending' as const },
  { item: 'PF Return (ECR)', due: '25 Dec 2025', status: 'Overdue' as const },
];

const EXCEPTIONS = [
  { label: 'Failed bank transfers', count: 3, tone: 'red' as const },
  { label: 'Missing PAN / bank details', count: 5, tone: 'amber' as const },
  { label: 'Negative net pay cases', count: 1, tone: 'red' as const },
  { label: 'Employees on hold', count: 50, tone: 'amber' as const },
];

const STATUTORY_BREAKDOWN = [
  { name: 'Provident Fund (PF)', code: 'PF', employer: 5.2, employee: 5.2, tag: 'Mandatory', fill: '#4f46e5' },
  { name: 'National Pension System (NPS)', code: 'NPS', employer: 1.8, employee: 1.8, tag: 'Tier 1 / Corporate', fill: '#0ea5e9' },
  { name: 'Employee State Insurance (ESI)', code: 'ESI', employer: 0.9, employee: 0.3, tag: 'Statutory', fill: '#06b6d4' },
  { name: 'Professional Tax (PT)', code: 'PT', employer: 0, employee: 0.4, tag: 'State Levy', fill: '#f59e0b' },
  { name: 'Tax Deducted at Source (TDS)', code: 'TDS', employer: 0, employee: 17.9, tag: 'Income Tax', fill: '#10b981' },
  { name: 'Gratuity Provision', code: 'Gratuity', employer: 2.1, employee: 0, tag: 'Retiral', fill: '#8b5cf6' },
  { name: 'Labour Welfare Fund (LWF)', code: 'LWF', employer: 0.05, employee: 0.05, tag: 'Welfare', fill: '#ec4899' },
];

const AUDIT_TRAIL = [
  { action: 'Net pay override approved for TF00912', by: 'HR Admin', time: '2 hours ago' },
  { action: 'Bulk salary structure updated for QA dept', by: 'HR Admin', time: 'Yesterday' },
  { action: 'PF challan generated for Nov 2025', by: 'System', time: '2 days ago' },
  { action: 'Loan request approved for AC94567', by: 'HR Manager', time: '3 days ago' },
];

const RISK_ALERTS = [
  { text: '2 employees crossed ESI wage threshold mid-year — review applicability', level: 'amber' as const },
  { text: '1 employee missing UAN despite PF being applicable', level: 'red' as const },
  { text: 'PT not configured for 1 employee in Karnataka BU', level: 'amber' as const },
];

const CTC_BAND_DISTRIBUTION = [
  { band: '<5L', count: 42 },
  { band: '5-10L', count: 128 },
  { band: '10-15L', count: 156 },
  { band: '15-25L', count: 89 },
  { band: '25-40L', count: 31 },
  { band: '40L+', count: 6 },
];

const CTC_BAND_MAP: Record<string, typeof CTC_BAND_DISTRIBUTION> = {
  'This Month': [
    { band: '<5L', count: 42 },
    { band: '5-10L', count: 128 },
    { band: '10-15L', count: 156 },
    { band: '15-25L', count: 89 },
    { band: '25-40L', count: 31 },
    { band: '40L+', count: 6 },
  ],
  'Last Month': [
    { band: '<5L', count: 44 },
    { band: '5-10L', count: 126 },
    { band: '10-15L', count: 154 },
    { band: '15-25L', count: 88 },
    { band: '25-40L', count: 30 },
    { band: '40L+', count: 6 },
  ],
  'Last Quarter': [
    { band: '<5L', count: 46 },
    { band: '5-10L', count: 124 },
    { band: '10-15L', count: 150 },
    { band: '15-25L', count: 85 },
    { band: '25-40L', count: 28 },
    { band: '40L+', count: 5 },
  ],
  'FY 2025-26': [
    { band: '<5L', count: 42 },
    { band: '5-10L', count: 128 },
    { band: '10-15L', count: 156 },
    { band: '15-25L', count: 89 },
    { band: '25-40L', count: 31 },
    { band: '40L+', count: 6 },
  ],
};

const DEPT_HEADCOUNT_COST = [
  { dept: 'Engineering', headcount: 180, cost: 92 },
  { dept: 'QA', headcount: 64, cost: 28 },
  { dept: 'Sales', headcount: 58, cost: 24 },
  { dept: 'Marketing', headcount: 34, cost: 16 },
  { dept: 'Finance', headcount: 22, cost: 12 },
  { dept: 'HR', headcount: 18, cost: 9 },
];

const DEPT_HEADCOUNT_COST_MAP: Record<string, typeof DEPT_HEADCOUNT_COST> = {
  'This Month': [
    { dept: 'Engineering', headcount: 180, cost: 92 },
    { dept: 'QA', headcount: 64, cost: 28 },
    { dept: 'Sales', headcount: 58, cost: 24 },
    { dept: 'Marketing', headcount: 34, cost: 16 },
    { dept: 'Finance', headcount: 22, cost: 12 },
    { dept: 'HR', headcount: 18, cost: 9 },
  ],
  'Last Month': [
    { dept: 'Engineering', headcount: 177, cost: 89.5 },
    { dept: 'QA', headcount: 63, cost: 27.2 },
    { dept: 'Sales', headcount: 56, cost: 23.1 },
    { dept: 'Marketing', headcount: 33, cost: 15.4 },
    { dept: 'Finance', headcount: 22, cost: 11.8 },
    { dept: 'HR', headcount: 17, cost: 8.6 },
  ],
  'Last Quarter': [
    { dept: 'Engineering', headcount: 172, cost: 86 },
    { dept: 'QA', headcount: 60, cost: 25.5 },
    { dept: 'Sales', headcount: 54, cost: 22 },
    { dept: 'Marketing', headcount: 32, cost: 14.8 },
    { dept: 'Finance', headcount: 21, cost: 11.2 },
    { dept: 'HR', headcount: 17, cost: 8.2 },
  ],
  'FY 2025-26': [
    { dept: 'Engineering', headcount: 180, cost: 92 },
    { dept: 'QA', headcount: 64, cost: 28 },
    { dept: 'Sales', headcount: 58, cost: 24 },
    { dept: 'Marketing', headcount: 34, cost: 16 },
    { dept: 'Finance', headcount: 22, cost: 12 },
    { dept: 'HR', headcount: 18, cost: 9 },
  ],
};

const TAX_REGIME_SPLIT = [
  { name: 'Old Regime', value: 140, count: 140, percentage: '31.4%', fill: '#f97316' },
  { name: 'New Regime', value: 312, count: 312, percentage: '68.6%', fill: '#5b6cf9' },
];

const TAX_DECLARATION_DATA = [
  { name: 'Approved', value: 78, count: 352, fill: '#10b981' },
  { name: 'Proof Verification Pending', value: 15, count: 68, fill: '#f59e0b' },
  { name: 'Not Yet Submitted', value: 7, count: 32, fill: '#f43f5e' },
];

const SALARY_COMPOSITION = [
  { name: 'Fixed Cash', value: 68, fill: '#4f46e5' },
  { name: 'Variable Pay', value: 12, fill: '#f59e0b' },
  { name: 'Retirals', value: 14, fill: '#10b981' },
  { name: 'Benefits & Perks', value: 6, fill: '#0ea5e9' },
];

const COST_FORECAST = [
  { month: 'Dec', actual: 185, forecast: null as number | null },
  { month: 'Jan', actual: null, forecast: 187 },
  { month: 'Feb', actual: null, forecast: 189 },
  { month: 'Mar', actual: null, forecast: 196 },
];

const TDS_TREND = [
  { month: 'Jun', tds: 16.2 },
  { month: 'Jul', tds: 16.8 },
  { month: 'Aug', tds: 17.1 },
  { month: 'Sep', tds: 17.5 },
  { month: 'Oct', tds: 17.9 },
  { month: 'Nov', tds: 17.93 },
];

const BONUS_SEASONALITY = [
  { month: 'Jan', bonus: 8 },
  { month: 'Feb', bonus: 2 },
  { month: 'Mar', bonus: 3 },
  { month: 'Apr', bonus: 4 },
  { month: 'May', bonus: 2 },
  { month: 'Jun', bonus: 3 },
  { month: 'Jul', bonus: 12 },
  { month: 'Aug', bonus: 3 },
  { month: 'Sep', bonus: 2 },
  { month: 'Oct', bonus: 4 },
  { month: 'Nov', bonus: 3 },
  { month: 'Dec', bonus: 15 },
];

const EXPENSE_TREND_DATA_MAP: Record<string, { month: string; amount: number; count: number }[]> = {
  'This Year': [
    { month: 'May 2025', amount: 16500, count: 3 },
    { month: 'Jun 2025', amount: 32000, count: 5 },
    { month: 'Jul 2025', amount: 18500, count: 3 },
    { month: 'Aug 2025', amount: 22000, count: 4 },
    { month: 'Sep 2025', amount: 19000, count: 3 },
    { month: 'Oct 2025', amount: 26500, count: 4 },
    { month: 'Nov 2025', amount: 21000, count: 3 },
    { month: 'Dec 2025', amount: 29000, count: 5 },
    { month: 'Jan 2026', amount: 14500, count: 2 },
    { month: 'Feb 2026', amount: 24000, count: 4 },
    { month: 'Mar 2026', amount: 22500, count: 3 },
    { month: 'Apr 2026', amount: 15000, count: 2 },
  ],
  'This Month': [
    { month: 'Nov 2025', amount: 21000, count: 3 },
  ],
  'Last Month': [
    { month: 'Oct 2025', amount: 26500, count: 4 },
  ],
  'This Quarter': [
    { month: 'Oct 2025', amount: 26500, count: 4 },
    { month: 'Nov 2025', amount: 21000, count: 3 },
    { month: 'Dec 2025', amount: 29000, count: 5 },
  ],
  'Last Quarter': [
    { month: 'Jul 2025', amount: 18500, count: 3 },
    { month: 'Aug 2025', amount: 22000, count: 4 },
    { month: 'Sep 2025', amount: 19000, count: 3 },
  ],
  'Last Year': [
    { month: 'May 2024', amount: 15000, count: 2 },
    { month: 'Jun 2024', amount: 28000, count: 4 },
    { month: 'Jul 2024', amount: 17500, count: 3 },
    { month: 'Aug 2024', amount: 21000, count: 3 },
    { month: 'Sep 2024', amount: 18000, count: 3 },
    { month: 'Oct 2024', amount: 24500, count: 4 },
    { month: 'Nov 2024', amount: 20000, count: 3 },
    { month: 'Dec 2024', amount: 27000, count: 5 },
    { month: 'Jan 2025', amount: 13500, count: 2 },
    { month: 'Feb 2025', amount: 22000, count: 3 },
    { month: 'Mar 2025', amount: 25000, count: 4 },
    { month: 'Apr 2025', amount: 16000, count: 2 },
  ],
  'Custom': [
    { month: 'Period 1', amount: 18500, count: 3 },
    { month: 'Period 2', amount: 24000, count: 4 },
    { month: 'Period 3', amount: 19500, count: 3 },
  ],
};

const EXPENSE_TREND_DATA = EXPENSE_TREND_DATA_MAP['This Year'];

const TdsFullReportModal: React.FC<{ onClose: () => void; data: any[] }> = ({ onClose, data }) => {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <FileText className="text-purple-600" size={20} /> TDS Detailed Report
            </h3>
            <p className="text-xs text-slate-500">Comprehensive breakdown of tax deductions</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors">
              <Download size={14} /> Export CSV
            </button>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"><X size={20} /></button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
              <p className="text-xs font-bold text-purple-600 uppercase mb-1">Total TDS</p>
              <p className="text-xl font-bold text-purple-900">₹ {(data || []).reduce((acc, curr) => acc + (curr?.tds || 0), 0).toFixed(2)} L</p>
            </div>
            <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
              <p className="text-xs font-bold text-indigo-600 uppercase mb-1">Salary TDS</p>
              <p className="text-xl font-bold text-indigo-900">₹ {(data || []).reduce((acc, curr) => acc + (curr?.salaryTds || 0), 0).toFixed(2)} L</p>
            </div>
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
              <p className="text-xs font-bold text-amber-600 uppercase mb-1">Perquisite Tax</p>
              <p className="text-xl font-bold text-amber-900">₹ {(data || []).reduce((acc, curr) => acc + (curr?.perqTds || 0), 0).toFixed(2)} L</p>
            </div>
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <p className="text-xs font-bold text-emerald-600 uppercase mb-1">Avg Employees</p>
              <p className="text-xl font-bold text-emerald-900">{Math.round((data || []).reduce((acc, curr) => acc + (curr?.employees || 0), 0) / (data?.length || 1))}</p>
            </div>
          </div>

          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 border-b border-slate-200">Period</th>
                <th className="px-4 py-3 border-b border-slate-200 text-right">Gross Salary</th>
                <th className="px-4 py-3 border-b border-slate-200 text-right">TDS from Salary</th>
                <th className="px-4 py-3 border-b border-slate-200 text-right">TDS on Perquisites</th>
                <th className="px-4 py-3 border-b border-slate-200 text-right">Total TDS</th>
                <th className="px-4 py-3 border-b border-slate-200 text-right">Employee Count</th>
                <th className="px-4 py-3 border-b border-slate-200 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[...(data || [])].reverse().map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-800">{row?.period || 'N/A'}</td>
                  <td className="px-4 py-3 text-right text-slate-600">{row?.gross || 'N/A'}</td>
                  <td className="px-4 py-3 text-right text-slate-600">₹ {(row?.salaryTds || 0).toFixed(2)} L</td>
                  <td className="px-4 py-3 text-right text-slate-600">₹ {(row?.perqTds || 0).toFixed(2)} L</td>
                  <td className="px-4 py-3 text-right font-bold text-purple-700">₹ {(row?.tds || 0).toFixed(2)} L</td>
                  <td className="px-4 py-3 text-right text-slate-600">{row?.employees || 0}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 uppercase tracking-wide">
                      Deposited
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ===================== Small Reusable Bits =====================

const SectionHeader: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <div className="mb-4 mt-2">
    <h2 className="text-lg font-bold text-slate-800">{title}</h2>
    {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
  </div>
);

const Card: React.FC<{
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}> = ({ title, subtitle, icon, children, className, action }) => (
  <div className={`bg-white p-5 rounded-xl border border-slate-200 shadow-sm ${className || ''}`}>
    {title && (
      <div className={`flex justify-between ${subtitle ? 'items-start' : 'items-center'} mb-4`}>
        <div>
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            {icon}
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-slate-400 font-medium mt-0.5 ml-6">{subtitle}</p>
          )}
        </div>
        {action}
      </div>
    )}
    {children}
  </div>
);

const MonthlyPayrollCostTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-slate-200 rounded-xl shadow-xl min-w-[190px] text-xs">
        <p className="font-bold text-slate-800 mb-2 border-b border-slate-100 pb-1.5 flex items-center justify-between">
          <span className="font-extrabold text-sm text-slate-900">{label}</span>
          <span className="text-[10px] font-semibold text-slate-400">Monthly</span>
        </p>
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-slate-700">
            <span className="flex items-center gap-1.5 font-medium text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4f46e5]"></span>
              Gross:
            </span>
            <span className="font-bold text-[#4f46e5]">{formatLakhValueAsINR(data.gross)}</span>
          </div>
          <div className="flex justify-between items-center text-slate-700 pt-1 border-t border-slate-50">
            <span className="flex items-center gap-1.5 font-bold text-slate-800">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#22c55e]"></span>
              Net Pay:
            </span>
            <span className="font-black text-emerald-600">{formatLakhValueAsINR(data.net)}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const CostByBuTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const totalAmount = data.totalCost || Math.round(data.cost * 100000);
    return (
      <div className="bg-white p-3.5 border border-slate-200 rounded-xl shadow-xl min-w-[260px] text-xs">
        <p className="font-black text-sm text-slate-900 mb-2.5 border-b border-slate-100 pb-1.5 flex items-center justify-between">
          <span>{label}</span>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Business Unit</span>
        </p>
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-slate-600">
            <span className="font-medium">Gross Pay:</span>
            <span className="font-semibold text-slate-800">{formatINR(data.gross)}</span>
          </div>
          <div className="flex justify-between items-center text-slate-600">
            <span className="font-medium">Employee Deductions:</span>
            <span className="font-semibold text-rose-600">+{formatINR(data.employeeDeductions)}</span>
          </div>
          <div className="flex justify-between items-center text-slate-600">
            <span className="font-medium">Employer Contributions:</span>
            <span className="font-semibold text-amber-600">+{formatINR(data.employerContributions)}</span>
          </div>
          <div className="pt-2 mt-1 border-t border-slate-100 flex justify-between items-center font-bold">
            <span className="text-slate-800 font-bold">Total Cost:</span>
            <span className="text-indigo-600 font-black text-sm">{formatINR(totalAmount)}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const CostByDeptTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="relative z-50 bg-white p-3.5 border border-slate-200 rounded-xl shadow-2xl min-w-[210px] text-xs">
        <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-slate-100">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: data.fill }}></span>
          <span className="font-extrabold text-sm text-slate-900">{data.name}</span>
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-slate-600">
            <span className="font-medium">Payroll Cost:</span>
            <span className="font-bold text-slate-900 ml-4">{data.amount}</span>
          </div>
          <div className="flex justify-between items-center text-slate-600">
            <span className="font-medium">Department Share:</span>
            <span className="font-black text-indigo-600 ml-4">{data.percentage}%</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const VariablePayTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="relative z-50 bg-white p-3.5 border border-slate-200 rounded-xl shadow-2xl min-w-[220px] text-xs">
        <p className="font-bold text-slate-800 mb-2 border-b border-slate-100 pb-1.5 flex items-center justify-between">
          <span className="font-extrabold text-sm text-slate-900">{label}</span>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Monthly</span>
        </p>
        <div className="flex justify-between items-center gap-4 text-slate-700">
          <span className="flex items-center gap-2 font-medium text-slate-600 whitespace-nowrap">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#f59e0b] shrink-0"></span>
            Variable Pay:
          </span>
          <span className="font-black text-amber-600 text-sm whitespace-nowrap ml-2">
            {data.formatted || formatLakhValueAsINR(data.variable)}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

const TaxDeclarationTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="relative z-50 bg-white p-3 border border-slate-200 rounded-xl shadow-2xl min-w-[200px] text-xs">
        <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-slate-100">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: data.fill }}></span>
          <span className="font-extrabold text-sm text-slate-900">{data.name}</span>
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-slate-600">
            <span className="font-medium">Employees:</span>
            <span className="font-bold text-slate-900 ml-4">{data.count} / 452</span>
          </div>
          <div className="flex justify-between items-center text-slate-600">
            <span className="font-medium">Percentage:</span>
            <span className="font-black ml-4" style={{ color: data.fill }}>{data.value}%</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const CompensationRangeTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="relative z-50 bg-white p-3 border border-slate-200 rounded-xl shadow-2xl min-w-[180px] text-xs">
        <p className="font-extrabold text-sm text-slate-900 mb-2 pb-1.5 border-b border-slate-100 flex items-center justify-between">
          <span>{label}</span>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">CTC Band</span>
        </p>
        <div className="flex justify-between items-center text-slate-700">
          <span className="font-medium text-slate-600">Employees:</span>
          <span className="font-black text-indigo-600 text-sm">{data.count}</span>
        </div>
      </div>
    );
  }
  return null;
};

const DeptHeadcountCostTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="relative z-50 bg-white p-3.5 border border-slate-200 rounded-xl shadow-2xl min-w-[210px] text-xs">
        <p className="font-extrabold text-sm text-slate-900 mb-2 pb-1.5 border-b border-slate-100 flex items-center justify-between">
          <span>{label}</span>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Department</span>
        </p>
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-slate-700">
            <span className="flex items-center gap-1.5 font-medium text-slate-600">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#4f46e5]"></span>
              Total Cost:
            </span>
            <span className="font-black text-[#4f46e5] text-sm">{formatLakhValueAsINR(data.cost)}</span>
          </div>
          <div className="flex justify-between items-center text-slate-700 pt-1 border-t border-slate-50">
            <span className="flex items-center gap-1.5 font-medium text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-[#818cf8]"></span>
              Headcount:
            </span>
            <span className="font-bold text-slate-900">{data.headcount} employees</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const TaxRegimeDonutChart: React.FC = () => {
  const [hovered, setHovered] = useState<'old' | 'new' | null>(null);

  const size = 260;
  const center = size / 2; // 130
  const outerR = 114;
  const innerR = 64;
  const labelR = (outerR + innerR) / 2; // 89

  const polarToXY = (cx: number, cy: number, r: number, angleDeg: number) => {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    };
  };

  // Slice 1: Old Regime (140 / 452 = 30.97% -> 111.5 deg)
  const oldStart = 0;
  const oldEnd = 111.5;
  const oldOuterStart = polarToXY(center, center, outerR, oldStart);
  const oldOuterEnd = polarToXY(center, center, outerR, oldEnd);
  const oldInnerStart = polarToXY(center, center, innerR, oldStart);
  const oldInnerEnd = polarToXY(center, center, innerR, oldEnd);
  const oldPath = `M ${oldOuterStart.x} ${oldOuterStart.y} A ${outerR} ${outerR} 0 0 1 ${oldOuterEnd.x} ${oldOuterEnd.y} L ${oldInnerEnd.x} ${oldInnerEnd.y} A ${innerR} ${innerR} 0 0 0 ${oldInnerStart.x} ${oldInnerStart.y} Z`;

  // Label for Old Regime: midpoint is 55.75 deg
  const oldLabelPos = polarToXY(center, center, labelR, (oldStart + oldEnd) / 2);

  // Slice 2: New Regime (312 / 452 = 69.03% -> 248.5 deg)
  const newStart = 111.5;
  const newEnd = 360;
  const newOuterStart = polarToXY(center, center, outerR, newStart);
  const newOuterEnd = polarToXY(center, center, outerR, newEnd);
  const newInnerStart = polarToXY(center, center, innerR, newStart);
  const newInnerEnd = polarToXY(center, center, innerR, newEnd);
  const newPath = `M ${newOuterStart.x} ${newOuterStart.y} A ${outerR} ${outerR} 0 1 1 ${newOuterEnd.x} ${newOuterEnd.y} L ${newInnerEnd.x} ${newInnerEnd.y} A ${innerR} ${innerR} 0 1 0 ${newInnerStart.x} ${newInnerStart.y} Z`;

  // Label for New Regime: lower left (228 deg / ~7:35 o'clock)
  const newLabelPos = polarToXY(center, center, labelR, 228);

  return (
    <div className="relative flex items-center justify-center">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-[230px] h-[230px] sm:w-[245px] sm:h-[245px] drop-shadow-xs"
      >
        {/* Slice 1: Old Regime (Orange) */}
        <path
          d={oldPath}
          fill="#f97316"
          stroke="#ffffff"
          strokeWidth="3.5"
          className="cursor-pointer transition-all duration-200"
          style={{
            opacity: hovered === 'new' ? 0.65 : 1,
            filter: hovered === 'old' ? 'brightness(1.08)' : 'none',
          }}
          onMouseEnter={() => setHovered('old')}
          onMouseLeave={() => setHovered(null)}
        />

        {/* Slice 2: New Regime (Blue) */}
        <path
          d={newPath}
          fill="#5b6cf9"
          stroke="#ffffff"
          strokeWidth="3.5"
          className="cursor-pointer transition-all duration-200"
          style={{
            opacity: hovered === 'old' ? 0.65 : 1,
            filter: hovered === 'new' ? 'brightness(1.08)' : 'none',
          }}
          onMouseEnter={() => setHovered('new')}
          onMouseLeave={() => setHovered(null)}
        />

        {/* Old Regime Percentage Pill */}
        <g className="select-none pointer-events-none">
          <rect x={oldLabelPos.x - 24} y={oldLabelPos.y - 11} width={48} height={22} rx={11} fill="#ffffff" stroke="#f97316" strokeWidth={1.5} />
          <text
            x={oldLabelPos.x}
            y={oldLabelPos.y}
            textAnchor="middle"
            dominantBaseline="central"
            style={{ fontWeight: 800, fontSize: '13px', fill: '#c2410c' }}
          >
            31.4%
          </text>
        </g>

        {/* New Regime Percentage Pill */}
        <g className="select-none pointer-events-none">
          <rect x={newLabelPos.x - 24} y={newLabelPos.y - 11} width={48} height={22} rx={11} fill="#ffffff" stroke="#5b6cf9" strokeWidth={1.5} />
          <text
            x={newLabelPos.x}
            y={newLabelPos.y}
            textAnchor="middle"
            dominantBaseline="central"
            style={{ fontWeight: 800, fontSize: '13px', fill: '#4338ca' }}
          >
            68.6%
          </text>
        </g>

        {/* Center: Total Employees */}
        <text
          x={center}
          y={center - 7}
          fill="#0f172a"
          textAnchor="middle"
          dominantBaseline="central"
          className="select-none font-black"
          style={{ fontWeight: 900, fontSize: '32px' }}
        >
          452
        </text>
        <text
          x={center}
          y={center + 18}
          fill="#64748b"
          textAnchor="middle"
          dominantBaseline="central"
          className="select-none font-semibold uppercase tracking-wider"
          style={{ fontWeight: 600, fontSize: '11px', fill: '#64748b' }}
        >
          Total Employees
        </text>
      </svg>

      {/* Hover tooltip */}
      {hovered && (
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-3 py-1.5 rounded-lg shadow-xl text-xs font-bold pointer-events-none z-30 flex items-center gap-2 animate-in fade-in zoom-in-95 duration-150"
        >
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: hovered === 'new' ? '#5b6cf9' : '#f97316' }}
          />
          <span className="whitespace-nowrap">
            {hovered === 'new' ? 'New Regime: 312 employees' : 'Old Regime: 140 employees'}
          </span>
        </div>
      )}
    </div>
  );
};

const DateRangeFilterDropdown: React.FC<{
  value: string;
  onChange: (val: string) => void;
}> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(value);
  const [customRangeText, setCustomRangeText] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handlePresetSelect = (preset: string) => {
    setSelectedPreset(preset);
    onChange(preset);
    setCustomRangeText('');
    setIsOpen(false);
  };

  const handleApply = () => {
    if (customRangeText.trim()) {
      onChange(customRangeText.trim());
      setSelectedPreset('Custom');
    } else {
      onChange(selectedPreset);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className={`bg-white border text-slate-700 text-xs font-bold rounded-xl px-3 py-1.5 flex items-center gap-2 transition-all shadow-2xs cursor-pointer ${
          isOpen ? 'border-indigo-500 ring-2 ring-indigo-100 bg-slate-50/50' : 'border-slate-200 hover:bg-slate-50 hover:border-slate-300'
        }`}
      >
        <Calendar size={13} className="text-indigo-600 shrink-0" />
        <span className="font-semibold text-slate-800 text-xs">{value}</span>
        <ChevronDown size={13} className={`text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-indigo-600' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[320px] bg-white rounded-2xl border border-slate-200 shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
          <p className="text-sm font-bold text-slate-800 mb-3">Date Range</p>

          <div className="grid grid-cols-3 gap-2 mb-3">
            {['This Month', 'Last Month', 'This Quarter', 'Last Quarter', 'This Year', 'Last Year'].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handlePresetSelect(preset)}
                className={`py-2 px-2 text-xs font-semibold rounded-lg border transition-all text-center cursor-pointer ${
                  selectedPreset === preset && !customRangeText.trim()
                    ? 'bg-[#3e49e2] border-[#3e49e2] text-white shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                {preset}
              </button>
            ))}

            <div className="col-span-2 relative">
              <input
                type="text"
                value={customRangeText}
                onChange={(e) => {
                  setCustomRangeText(e.target.value);
                  setSelectedPreset('Custom');
                }}
                placeholder="Select custom range"
                className="w-full pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-2xs"
              />
              <Calendar size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            <button
              type="button"
              onClick={handleApply}
              className="col-span-1 py-2 px-3 bg-[#bfdbfe] hover:bg-[#3e49e2] text-white font-bold text-xs rounded-lg transition-all text-center cursor-pointer shadow-2xs flex items-center justify-center active:scale-95"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const KpiCard: React.FC<{
  label: string;
  value: string;
  sub?: string;
  trend?: 'up' | 'down';
  trendLabel?: string;
  icon: React.ReactNode;
  iconBg: string;
  helperText?: string;
}> = ({ label, value, sub, trend, trendLabel, icon, iconBg, helperText }) => (
  <div className="bg-slate-50/70 hover:bg-slate-50 p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-start justify-between transition-colors">
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="text-2xl font-black text-slate-900 mt-1">{value}</p>
      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
        {sub && (
          <p className={`text-[11px] font-semibold flex items-center gap-1 ${trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-rose-600' : 'text-slate-400'}`}>
            {trend === 'up' && <TrendingUp size={11} />}
            {trend === 'down' && <TrendingDown size={11} />}
            <span>{sub}</span>
          </p>
        )}
        {helperText && (
          <span className="text-[11px] font-medium text-slate-400">
            {sub ? `• ${helperText}` : helperText}
          </span>
        )}
      </div>
    </div>
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>{icon}</div>
  </div>
);

const KPI_METRICS_MAP: Record<string, {
  totalCost: string;
  totalCostSub: string;
  totalCostTrend: 'up' | 'down';
  netPayable: string;
  activeEmployees: string;
  activeEmployeesSub: string;
  statutory: string;
  processingStatus: string;
  processingSub: string;
  processingTrend: 'up' | 'down';
  avgCost: string;
  avgCostSub: string;
}> = {
  'This Month': {
    totalCost: formatCr(18500000),
    totalCostSub: '+5.2% MoM',
    totalCostTrend: 'up',
    netPayable: formatCr(14200000),
    activeEmployees: '452',
    activeEmployeesSub: '+8 joined / -3 hold',
    statutory: formatL(3260000),
    processingStatus: '400 / 452',
    processingSub: '50 On Hold, 2 Failed',
    processingTrend: 'down',
    avgCost: formatINR(40929),
    avgCostSub: '+2.1% MoM',
  },
  'Last Month': {
    totalCost: formatCr(17600000),
    totalCostSub: '+4.1% MoM',
    totalCostTrend: 'up',
    netPayable: formatCr(13600000),
    activeEmployees: '447',
    activeEmployeesSub: '+5 joined / -2 hold',
    statutory: formatL(3120000),
    processingStatus: '447 / 447',
    processingSub: 'All Disbursed',
    processingTrend: 'up',
    avgCost: formatINR(39373),
    avgCostSub: '+1.8% MoM',
  },
  'This Quarter': {
    totalCost: formatCr(54200000),
    totalCostSub: '+6.8% QoQ',
    totalCostTrend: 'up',
    netPayable: formatCr(41800000),
    activeEmployees: '452',
    activeEmployeesSub: '+18 joined / -7 hold',
    statutory: formatL(9640000),
    processingStatus: '1,320 / 1,350',
    processingSub: '50 On Hold, 2 Failed',
    processingTrend: 'down',
    avgCost: formatINR(40250),
    avgCostSub: '+2.5% QoQ',
  },
  'Last Quarter': {
    totalCost: formatCr(50800000),
    totalCostSub: '+5.5% QoQ',
    totalCostTrend: 'up',
    netPayable: formatCr(39200000),
    activeEmployees: '441',
    activeEmployeesSub: '+14 joined / -6 hold',
    statutory: formatL(9080000),
    processingStatus: '1,323 / 1,323',
    processingSub: 'All Disbursed',
    processingTrend: 'up',
    avgCost: formatINR(38426),
    avgCostSub: '+1.9% QoQ',
  },
  'This Year': {
    totalCost: formatCr(214000000),
    totalCostSub: '+12.4% YoY',
    totalCostTrend: 'up',
    netPayable: formatCr(165000000),
    activeEmployees: '452',
    activeEmployeesSub: '+62 joined / -28 hold',
    statutory: formatCr(38200000),
    processingStatus: '5,280 / 5,340',
    processingSub: '50 On Hold, 2 Failed',
    processingTrend: 'down',
    avgCost: formatINR(39500),
    avgCostSub: '+4.2% YoY',
  },
  'Last Year': {
    totalCost: formatCr(191000000),
    totalCostSub: '+9.8% YoY',
    totalCostTrend: 'up',
    netPayable: formatCr(147000000),
    activeEmployees: '418',
    activeEmployeesSub: '+45 joined / -19 hold',
    statutory: formatCr(34000000),
    processingStatus: '4,980 / 4,980',
    processingSub: 'All Disbursed',
    processingTrend: 'up',
    avgCost: formatINR(38038),
    avgCostSub: '+3.1% YoY',
  },
};

const RAGBadge: React.FC<{ status: 'Filed' | 'Pending' | 'Overdue' }> = ({ status }) => {
  const map = {
    Filed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Pending: 'bg-amber-50 text-amber-700 border-amber-200',
    Overdue: 'bg-rose-50 text-rose-700 border-rose-200',
  };
  return <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${map[status]}`}>{status}</span>;
};

const CHART_TICK = { fontSize: 10, fill: '#64748b', fontWeight: 600 };

const PayrollDashboardNew: React.FC = () => {
  const [timeRange, setTimeRange] = useState('This Month');
  const [selectedPreset, setSelectedPreset] = useState('This Month');
  const [customRangeText, setCustomRangeText] = useState('');
  const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false);
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(e.target as Node)) {
        setIsFilterPopoverOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handlePresetSelect = (preset: string) => {
    setSelectedPreset(preset);
    setTimeRange(preset);
    setCustomRangeText('');
    setIsFilterPopoverOpen(false);
  };

  const handleApply = () => {
    if (customRangeText.trim()) {
      setTimeRange(customRangeText.trim());
      setSelectedPreset('Custom');
    } else {
      setTimeRange(selectedPreset);
    }
    setIsFilterPopoverOpen(false);
  };

  const currentKpi = KPI_METRICS_MAP[timeRange] || KPI_METRICS_MAP['This Month'];

  const [buTimeRange, setBuTimeRange] = useState('This Month');
  const [deptTimeRange, setDeptTimeRange] = useState('This Month');
  const [varPayTimeRange, setVarPayTimeRange] = useState('This Year');
  const [compRangeFilter, setCompRangeFilter] = useState('This Month');
  const [deptCostFilter, setDeptCostFilter] = useState('This Month');

  const currentBuData = COST_BY_BU_MAP[buTimeRange] || COST_BY_BU_MAP['This Month'];
  const currentDept = COST_BY_DEPT_MAP[deptTimeRange] || COST_BY_DEPT_MAP['This Month'];
  const currentVarPayData = getVariablePayData(varPayTimeRange);
  const currentCompData = CTC_BAND_MAP[compRangeFilter] || CTC_BAND_MAP['This Month'] || CTC_BAND_DISTRIBUTION;
  const currentDeptHeadcountCost = DEPT_HEADCOUNT_COST_MAP[deptCostFilter] || DEPT_HEADCOUNT_COST_MAP['This Month'] || DEPT_HEADCOUNT_COST;

  // TDS Dashboard State
  const [tdsTimeRange, setTdsTimeRange] = useState('This Year');
  const [isTdsFilterPopoverOpen, setIsTdsFilterPopoverOpen] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const [isTdsReportOpen, setIsTdsReportOpen] = useState(false);

  // Expense & Reimbursement Trend State
  const [expenseTimeRange, setExpenseTimeRange] = useState('This Year');
  const [isExpenseFilterPopoverOpen, setIsExpenseFilterPopoverOpen] = useState(false);
  const [hoveredExpenseIndex, setHoveredExpenseIndex] = useState<number | null>(null);

  const getGraphData = useMemo(() => {
    switch (tdsTimeRange) {
      case 'This Month':
        return [
          { period: 'Week 1', tds: 5.2, employees: 1840, salaryTds: 4.8, perqTds: 0.4, gross: '₹ 45 L' },
          { period: 'Week 2', tds: 5.5, employees: 1842, salaryTds: 5.0, perqTds: 0.5, gross: '₹ 48 L' },
          { period: 'Week 3', tds: 5.1, employees: 1839, salaryTds: 4.6, perqTds: 0.5, gross: '₹ 44 L' },
          { period: 'Week 4', tds: 6.6, employees: 1845, salaryTds: 5.9, perqTds: 0.7, gross: '₹ 52 L' },
        ];
      case 'Last Month':
        return [
          { period: 'Week 1', tds: 4.8, employees: 1835, salaryTds: 4.2, perqTds: 0.6, gross: '₹ 42 L' },
          { period: 'Week 2', tds: 5.0, employees: 1836, salaryTds: 4.5, perqTds: 0.5, gross: '₹ 45 L' },
          { period: 'Week 3', tds: 4.9, employees: 1838, salaryTds: 4.4, perqTds: 0.5, gross: '₹ 43 L' },
          { period: 'Week 4', tds: 5.1, employees: 1838, salaryTds: 4.6, perqTds: 0.5, gross: '₹ 46 L' },
        ];
      case 'This Quarter':
        return [
          { period: 'Oct 2025', tds: 19.8, employees: 1838, salaryTds: 18.0, perqTds: 1.8, gross: '₹ 1.81 Cr' },
          { period: 'Nov 2025', tds: 22.4, employees: 1842, salaryTds: 20.1, perqTds: 2.3, gross: '₹ 1.85 Cr' },
          { period: 'Dec 2025', tds: 21.5, employees: 1845, salaryTds: 19.5, perqTds: 2.0, gross: '₹ 1.83 Cr' },
        ];
      case 'Last Quarter':
        return [
          { period: 'Jul 2025', tds: 17.2, employees: 1825, salaryTds: 15.8, perqTds: 1.4, gross: '₹ 1.75 Cr' },
          { period: 'Aug 2025', tds: 18.0, employees: 1830, salaryTds: 16.5, perqTds: 1.5, gross: '₹ 1.78 Cr' },
          { period: 'Sep 2025', tds: 18.5, employees: 1835, salaryTds: 17.0, perqTds: 1.5, gross: '₹ 1.80 Cr' },
        ];
      case 'This Year':
        return [
          { period: 'Apr 2025', tds: 15.2, employees: 1810, salaryTds: 14.0, perqTds: 1.2, gross: '₹ 1.65 Cr' },
          { period: 'May 2025', tds: 15.8, employees: 1815, salaryTds: 14.5, perqTds: 1.3, gross: '₹ 1.68 Cr' },
          { period: 'Jun 2025', tds: 16.5, employees: 1820, salaryTds: 15.0, perqTds: 1.5, gross: '₹ 1.72 Cr' },
          { period: 'Jul 2025', tds: 17.2, employees: 1825, salaryTds: 15.8, perqTds: 1.4, gross: '₹ 1.75 Cr' },
          { period: 'Aug 2025', tds: 18.0, employees: 1830, salaryTds: 16.5, perqTds: 1.5, gross: '₹ 1.78 Cr' },
          { period: 'Sep 2025', tds: 18.5, employees: 1835, salaryTds: 17.0, perqTds: 1.5, gross: '₹ 1.80 Cr' },
          { period: 'Oct 2025', tds: 19.8, employees: 1838, salaryTds: 18.0, perqTds: 1.8, gross: '₹ 1.81 Cr' },
          { period: 'Nov 2025', tds: 22.4, employees: 1842, salaryTds: 20.1, perqTds: 2.3, gross: '₹ 1.85 Cr' },
        ];
      case 'Last Year':
        return [
          { period: 'Apr 2024', tds: 14.0, employees: 1750, salaryTds: 13.0, perqTds: 1.0, gross: '₹ 1.50 Cr' },
          { period: 'Mar 2025', tds: 16.0, employees: 1800, salaryTds: 14.5, perqTds: 1.5, gross: '₹ 1.60 Cr' },
        ];
      case 'Custom':
        return [
          { period: 'Custom 1', tds: 10.0, employees: 1800, salaryTds: 9.0, perqTds: 1.0, gross: '₹ 1.0 Cr' },
          { period: 'Custom 2', tds: 12.0, employees: 1810, salaryTds: 11.0, perqTds: 1.0, gross: '₹ 1.2 Cr' }
        ];
      default: return [];
    }
  }, [tdsTimeRange]);

  const tdsGraphData = getGraphData;
  const maxTdsValue = Math.max(...tdsGraphData.map(d => d.tds), 1);
  const yAxisMax = Math.ceil(maxTdsValue * 1.1);

  const getGraphPath = () => {
    if (tdsGraphData.length === 0) return '';
    const points = tdsGraphData.map((d, i) => {
      const x = (i / (tdsGraphData.length - 1)) * 1000;
      const y = 300 - ((d.tds / yAxisMax) * 300);
      return `${x},${y}`;
    });
    return `M ${points.join(' L ')}`;
  };

  const getAreaPath = () => {
    const linePath = getGraphPath();
    if (!linePath) return '';
    return `${linePath} L 1000,300 L 0,300 Z`;
  };

  const getPointCoords = (index: number) => {
    const x = (index / (tdsGraphData.length - 1)) * 1000;
    const y = 300 - ((tdsGraphData[index].tds / yAxisMax) * 300);
    return { x, y };
  };

  const currentExpenseData = useMemo(() => {
    return EXPENSE_TREND_DATA_MAP[expenseTimeRange] || EXPENSE_TREND_DATA_MAP['This Year'];
  }, [expenseTimeRange]);

  const maxExpenseAmount = 35000;

  const mostExpensiveMonth = useMemo(() => {
    if (!currentExpenseData || currentExpenseData.length === 0) return { month: '-', amount: 0 };
    return [...currentExpenseData].sort((a, b) => b.amount - a.amount)[0];
  }, [currentExpenseData]);

  const leastExpensiveMonth = useMemo(() => {
    if (!currentExpenseData || currentExpenseData.length === 0) return { month: '-', amount: 0 };
    return [...currentExpenseData].sort((a, b) => a.amount - b.amount)[0];
  }, [currentExpenseData]);

  return (
    <div className="p-4 lg:p-8 w-full space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Payroll Dashboard</h1>
        <p className="text-sm text-slate-500">Company-wide payroll health, compliance, and cost insights</p>
      </div>

      {/* ===================== SECTION A: Executive Summary KPI Cards ===================== */}
      <div className="bg-white p-5 lg:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        {/* Section Header with Title & Corner Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-800">Payroll Overview</h2>
            <p className="text-xs text-slate-500">Summary of payroll metrics and workforce costs</p>
          </div>

          {/* Filter Popover in the Corner */}
          <div className="relative" ref={filterDropdownRef}>
            <button
              type="button"
              onClick={() => setIsFilterPopoverOpen(prev => !prev)}
              className={`bg-white border text-slate-700 text-xs font-bold rounded-xl px-3.5 py-2 flex items-center gap-2 transition-all shadow-xs cursor-pointer ${
                isFilterPopoverOpen ? 'border-indigo-500 ring-2 ring-indigo-100 bg-slate-50/50' : 'border-slate-200 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <Calendar size={14} className="text-indigo-600 shrink-0" />
              <span className="font-semibold text-slate-800">{timeRange}</span>
              <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 shrink-0 ${isFilterPopoverOpen ? 'rotate-180 text-indigo-600' : ''}`} />
            </button>

            {isFilterPopoverOpen && (
              <div className="absolute right-0 top-full mt-2 w-[340px] bg-white rounded-2xl border border-slate-200 shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                <p className="text-sm font-bold text-slate-800 mb-3">Date Range</p>

                <div className="grid grid-cols-3 gap-2 mb-3">
                  {['This Month', 'Last Month', 'This Quarter', 'Last Quarter', 'This Year', 'Last Year'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handlePresetSelect(preset)}
                      className={`py-2 px-2.5 text-xs font-semibold rounded-lg border transition-all text-center cursor-pointer ${
                        selectedPreset === preset && !customRangeText.trim()
                          ? 'bg-[#3e49e2] border-[#3e49e2] text-white shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}

                  {/* Row 3: Select custom range input (col-span-2) + Apply button (col-span-1) */}
                  <div className="col-span-2 relative">
                    <input
                      type="text"
                      value={customRangeText}
                      onChange={(e) => {
                        setCustomRangeText(e.target.value);
                        setSelectedPreset('Custom');
                      }}
                      placeholder="Select custom range"
                      className="w-full pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-2xs"
                    />
                    <Calendar size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>

                  <button
                    type="button"
                    onClick={handleApply}
                    className="col-span-1 py-2 px-3 bg-[#bfdbfe] hover:bg-[#3e49e2] text-white font-bold text-xs rounded-lg transition-all text-center cursor-pointer shadow-2xs flex items-center justify-center active:scale-95"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 5 KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <KpiCard
            label="Total Payroll Cost"
            value={currentKpi.totalCost}
            icon={<Wallet size={18} className="text-indigo-600" />}
            iconBg="bg-indigo-50"
          />
          <KpiCard
            label="Net Payable"
            value={currentKpi.netPayable}
            icon={<Landmark size={18} className="text-emerald-600" />}
            iconBg="bg-emerald-50"
          />
          <KpiCard
            label="Eligible Employees"
            value={currentKpi.activeEmployees}
            sub={currentKpi.activeEmployeesSub}
            trend="up"
            icon={<Users size={18} className="text-blue-600" />}
            iconBg="bg-blue-50"
          />
          <KpiCard
            label="Statutory Liability"
            value={currentKpi.statutory}
            icon={<ShieldCheck size={18} className="text-purple-600" />}
            iconBg="bg-purple-50"
          />
          <KpiCard
            label="Avg Cost / Employee"
            value={currentKpi.avgCost}
            icon={<Activity size={18} className="text-rose-600" />}
            iconBg="bg-rose-50"
          />
        </div>
      </div>

      {/* ===================== SECTION B: CEO / Top Management Strategic Widgets ===================== */}
      <SectionHeader title="Strategic Overview" subtitle="For CEO & Top Management — cost trends, growth, and budget health" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card
          title="Monthly Payroll Cost"
          icon={<TrendingUp size={16} className="text-indigo-600" />}
          className="lg:col-span-2"
          action={
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <span className="w-3 h-3 rounded-sm bg-[#22c55e]"></span>
              <span>Net Pay</span>
            </div>
          }
        >
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={PAYROLL_COST_TREND} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={CHART_TICK} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={CHART_TICK} tickFormatter={(v: any) => formatLakhValueAsINR(v)} width={90} />
                <RechartsTooltip content={<MonthlyPayrollCostTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="net" fill="#22c55e" radius={[4, 4, 0, 0]} name="Net Pay" maxBarSize={36} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <p className="text-center text-xs font-semibold text-slate-400 mt-2">12 Months</p>
        </Card>

        <Card
          title="Cost by Business Unit"
          icon={<Building2 size={16} className="text-indigo-600" />}
          action={<DateRangeFilterDropdown value={buTimeRange} onChange={setBuTimeRange} />}
        >
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={currentBuData} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={CHART_TICK} tickFormatter={(v: any) => formatLakhValueAsINR(v)} />
                <YAxis type="category" dataKey="bu" axisLine={false} tickLine={false} tick={CHART_TICK} width={100} />
                <RechartsTooltip content={<CostByBuTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="cost" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card
          title="Cost by Department"
          icon={<PieChartIcon size={16} className="text-indigo-600" />}
          action={<DateRangeFilterDropdown value={deptTimeRange} onChange={setDeptTimeRange} />}
        >
          <div className="h-56 w-full flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Left: Interactive Donut Chart with Center Total */}
            <div className="relative w-full sm:w-[46%] h-full flex items-center justify-center">
              {/* Center label placed BEFORE chart with z-0 so tooltip is always on top */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total</span>
                <span className="text-sm font-black text-slate-800">{currentDept.totalLabel}</span>
              </div>
              <ResponsiveContainer width="100%" height="100%" className="relative z-10">
                <RechartsPieChart>
                  <Pie
                    data={currentDept.data}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {currentDept.data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} stroke="#ffffff" strokeWidth={2} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CostByDeptTooltip />} wrapperStyle={{ zIndex: 1000, pointerEvents: 'none' }} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>

            {/* Right: Department breakdown legend with progress bars & values */}
            <div className="w-full sm:w-[54%] flex flex-col justify-center space-y-2.5 sm:pr-2">
              {currentDept.data.map((dept) => (
                <div key={dept.name} className="group">
                  <div className="flex justify-between items-center text-xs mb-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: dept.fill }}></span>
                      <span className="font-semibold text-slate-700">{dept.name}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="font-bold text-slate-800">{dept.amount}</span>
                      <span className="text-[11px] font-semibold text-slate-400 w-8 text-right">{dept.percentage}%</span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${dept.percentage}%`, backgroundColor: dept.fill }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card
          title="Variable Pay Summary"
          icon={<TrendingUp size={16} className="text-amber-500" />}
          action={<DateRangeFilterDropdown value={varPayTimeRange} onChange={setVarPayTimeRange} />}
        >
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={currentVarPayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={CHART_TICK} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={CHART_TICK} tickFormatter={(v: any) => formatLakhValueAsINR(v)} width={90} />
                <RechartsTooltip content={<VariablePayTooltip />} wrapperStyle={{ zIndex: 1000, pointerEvents: 'none' }} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="variable" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Variable Pay" maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Payroll Growth vs Headcount Growth" icon={<TrendingUp size={16} className="text-indigo-600" />}>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={YOY_GROWTH} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={CHART_TICK} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={CHART_TICK} unit="%" />
                <RechartsTooltip formatter={(v: any) => `${v}%`} />
                <Bar dataKey="payrollGrowth" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Payroll Growth %" />
                <Bar dataKey="headcountGrowth" fill="#a5b4fc" radius={[4, 4, 0, 0]} name="Headcount Growth %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* ===================== SECTION C: HR Operational Widgets ===================== */}
      <SectionHeader title="HR Operations" subtitle="Actionable items for day-to-day payroll and compliance management" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card
          title="Payroll Run Status"
          icon={<CheckCircle2 size={16} className="text-emerald-600" />}
          action={
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md">
              Current Cycle
            </span>
          }
        >
          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-xs text-slate-500 font-semibold pb-1.5 border-b border-slate-100 mb-1">
              <span>Cycle: <strong className="text-slate-800">Nov 2025</strong></span>
              <span className="text-emerald-600 font-bold">400/452 Done</span>
            </div>
            <div className="flex justify-between items-center bg-emerald-50 rounded-lg px-3 py-2.5">
              <span className="text-xs font-bold text-emerald-800 flex items-center gap-2"><CheckCircle2 size={14} /> Processed</span>
              <span className="text-sm font-black text-emerald-800">400</span>
            </div>
            <div className="flex justify-between items-center bg-amber-50 rounded-lg px-3 py-2.5">
              <span className="text-xs font-bold text-amber-800 flex items-center gap-2"><Clock size={14} /> On Hold</span>
              <span className="text-sm font-black text-amber-800">52</span>
            </div>
          </div>
        </Card>

        <Card
          title="Tax Declaration Submission Funnel"
          subtitle="(FY 2026-27)"
          icon={<ShieldCheck size={16} className="text-indigo-600" />}
        >
          <div className="flex flex-col xl:flex-row items-center gap-3">
            {/* Donut Chart with Center Metric */}
            <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
                <span className="text-sm font-black text-slate-800 leading-none">78%</span>
                <span className="text-[8px] font-bold text-emerald-600 uppercase tracking-tight mt-0.5">Approved</span>
              </div>
              <ResponsiveContainer width="100%" height="100%" className="relative z-10">
                <RechartsPieChart>
                  <Pie
                    data={TAX_DECLARATION_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={28}
                    outerRadius={40}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {TAX_DECLARATION_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} stroke="#ffffff" strokeWidth={2} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<TaxDeclarationTooltip />} wrapperStyle={{ zIndex: 1000, pointerEvents: 'none' }} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>

            {/* Status Breakdown */}
            <div className="flex-1 w-full space-y-1.5">
              <div className="flex items-center justify-between p-1.5 px-2 rounded-lg bg-emerald-50/70 border border-emerald-100">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                  <span className="text-xs font-semibold text-slate-700 truncate">Approved</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-emerald-700">352</span>
                  <span className="text-[10px] text-emerald-600 ml-1 font-medium">(78%)</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-1.5 px-2 rounded-lg bg-amber-50/70 border border-amber-100">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
                  <span className="text-xs font-semibold text-slate-700 truncate" title="Proof Verification Pending">Pending</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-amber-700">68</span>
                  <span className="text-[10px] text-amber-600 ml-1 font-medium">(15%)</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-1.5 px-2 rounded-lg bg-rose-50/70 border border-rose-100">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
                  <span className="text-xs font-semibold text-slate-700 truncate">Not Submitted</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-rose-700">32</span>
                  <span className="text-[10px] text-rose-600 ml-1 font-medium">(7%)</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card
          title="Loans & Advances Summary"
          subtitle="Till Date"
          icon={<Landmark size={16} className="text-blue-600" />}
        >
          <div className="space-y-3">
            <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3 flex justify-between items-center">
              <div>
                <p className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider">Total Outstanding</p>
                <p className="text-base font-black text-blue-950 mt-0.5">{formatL(4820000)}</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <Landmark size={18} />
              </div>
            </div>

            <div className="bg-amber-50/70 border border-amber-100 rounded-xl p-3 flex justify-between items-center">
              <div>
                <p className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">Pending Approval</p>
                <p className="text-base font-black text-amber-950 mt-0.5">6 requests</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <Clock size={18} />
              </div>
            </div>
          </div>
        </Card>

        <Card
          title="Expense & Reimbursement Claims"
          subtitle="Till Date"
          icon={<Wallet size={16} className="text-sky-600" />}
        >
          <div className="space-y-3">
            <div className="bg-amber-50/70 border border-amber-100 rounded-xl p-3 flex justify-between items-center">
              <div>
                <p className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">Pending</p>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-base font-black text-amber-950">23 claims</span>
                  <span className="text-xs font-semibold text-amber-700">({formatL(186000)})</span>
                </div>
              </div>
              <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <Clock size={18} />
              </div>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-3 flex justify-between items-center">
              <div>
                <p className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">Approved</p>
                <p className="text-base font-black text-emerald-950 mt-0.5">{formatL(412000)}</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <CheckCircle2 size={18} />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Statutory Contribution Breakdown - matching Compensation Range Distribution width (50% on lg) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
        <Card
          title="Statutory Contribution Breakdown"
          subtitle="Employer and employee statutory compliance liabilities for the period"
          icon={<ShieldCheck size={16} className="text-purple-600" />}
          className="w-full"
        >
          {/* KPI Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-4">
            <div className="bg-purple-50/70 border border-purple-100 rounded-xl p-3 min-w-0">
              <span className="text-[10px] xl:text-[11px] font-bold text-purple-700 uppercase tracking-tight block truncate" title="Total Statutory Compliance">Total Statutory Compliance</span>
              <p className="text-base xl:text-lg font-black text-purple-950 mt-0.5">{formatL(3570000)}</p>
            </div>
            <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3 min-w-0">
              <span className="text-[10px] xl:text-[11px] font-bold text-indigo-700 uppercase tracking-tight block truncate" title="Employer Contribution">Employer Contribution</span>
              <p className="text-base xl:text-lg font-black text-indigo-950 mt-0.5">{formatL(1005000)}</p>
            </div>
            <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-3 min-w-0">
              <span className="text-[10px] xl:text-[11px] font-bold text-emerald-700 uppercase tracking-tight block truncate" title="Employee Contribution">Employee Contribution</span>
              <p className="text-base xl:text-lg font-black text-emerald-950 mt-0.5">{formatL(2565000)}</p>
            </div>
          </div>

          {/* Modern styled table without Total Outflow column */}
          <div className="overflow-x-auto rounded-xl border border-slate-100 shadow-2xs">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50/80 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200/80">
                  <th className="py-2.5 px-3 sm:px-4">Statutory Component</th>
                  <th className="py-2.5 px-3 sm:px-4 text-right">Employer Contribution</th>
                  <th className="py-2.5 px-3 sm:px-4 text-right">Employee Contribution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {STATUTORY_BREAKDOWN.map(s => (
                  <tr key={s.name} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5 px-3 sm:px-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.fill }}></span>
                        <span className="font-bold text-slate-800">{s.name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 sm:px-4 text-right font-semibold text-slate-700">
                      {formatL(s.employer * 100000)}
                    </td>
                    <td className="py-2.5 px-3 sm:px-4 text-right font-semibold text-slate-700">
                      {formatL(s.employee * 100000)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* ===================== SECTION E: Distribution & Composition ===================== */}
      <SectionHeader title="Distribution & Composition" subtitle="How headcount, cost, and compensation are structured across the org" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        <Card
          title="Compensation Range Distribution"
          icon={<Users size={16} className="text-indigo-600" />}
          action={<DateRangeFilterDropdown value={compRangeFilter} onChange={setCompRangeFilter} />}
        >
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={currentCompData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="band" axisLine={false} tickLine={false} tick={CHART_TICK} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={CHART_TICK} allowDecimals={false} />
                <RechartsTooltip content={<CompensationRangeTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Employees" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card
          title="Department-wise Headcount & Cost"
          icon={<Building2 size={16} className="text-indigo-600" />}
          action={<DateRangeFilterDropdown value={deptCostFilter} onChange={setDeptCostFilter} />}
        >
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={currentDeptHeadcountCost} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="dept" axisLine={false} tickLine={false} tick={CHART_TICK} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={CHART_TICK} tickFormatter={(v: any) => formatLakhValueAsINR(v)} width={90} />
                <RechartsTooltip content={<DeptHeadcountCostTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="cost" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Total Cost" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Tax Regime Split */}
        <Card
          title="Tax Regime Split"
          subtitle="(FY 2026-27)"
          icon={<PieChartIcon size={16} className="text-indigo-600" />}
        >
          <div className="py-2 w-full flex flex-col sm:flex-row items-center justify-around gap-6 sm:gap-8">
            {/* Left: Pixel-perfect Donut Chart strictly matching Screenshot 4 */}
            <TaxRegimeDonutChart />

            {/* Right: Clean Legend matching Screenshot 4 */}
            <div className="w-full sm:w-auto flex flex-col justify-center space-y-4 sm:pl-2">
              <div className="flex items-center gap-3.5">
                <span className="w-4 h-4 rounded-full bg-[#5b6cf9] shrink-0 shadow-xs" />
                <div>
                  <h4 className="font-extrabold text-slate-800 text-base leading-tight">New Regime</h4>
                  <p className="text-sm font-medium text-slate-500 mt-0.5">312 employees</p>
                </div>
              </div>

              <div className="w-full border-t border-slate-100" />

              <div className="flex items-center gap-3.5">
                <span className="w-4 h-4 rounded-full bg-[#f97316] shrink-0 shadow-xs" />
                <div>
                  <h4 className="font-extrabold text-slate-800 text-base leading-tight">Old Regime</h4>
                  <p className="text-sm font-medium text-slate-500 mt-0.5">140 employees</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Upcoming Payroll Cost Forecast (Right side of Tax Regime Split) */}
        <Card title="Upcoming Payroll Cost Forecast" icon={<TrendingUp size={16} className="text-indigo-600" />}>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={COST_FORECAST} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={CHART_TICK} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={CHART_TICK} tickFormatter={(v: any) => formatLakhValueAsINR(v)} domain={[170, 200]} width={95} />
                <RechartsTooltip formatter={(v: any) => v != null ? formatLakhValueAsINR(v) : '-'} />
                <Line type="monotone" dataKey="actual" stroke="#4f46e5" strokeWidth={2.5} dot={{ r: 4 }} connectNulls name="Actual" />
                <Line type="monotone" dataKey="forecast" stroke="#a5b4fc" strokeWidth={2.5} strokeDasharray="5 4" dot={{ r: 4 }} connectNulls name="Forecast" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-slate-400 mt-3 text-center">Based on confirmed increments, new joiners, and exits</p>
        </Card>
      </div>

      {/* 2-Column Grid: TDS Deductions & Expense Reimbursement Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        {/* Left Column: TDS Deductions Over Time */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          {/* Header & Filters */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-purple-100 text-purple-600 rounded-lg shrink-0">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base leading-tight">TDS Deductions Over Time</h3>
              </div>
            </div>

            <div className="relative shrink-0">
              {/* Filter Popover */}
              <button
                onClick={() => setIsTdsFilterPopoverOpen(!isTdsFilterPopoverOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <Filter size={13} className="text-purple-600" />
                  <span>{tdsTimeRange}</span>
                </div>
                <ChevronDown size={13} className={`text-slate-400 transition-transform ${isTdsFilterPopoverOpen ? 'rotate-180' : ''}`} />
              </button>

              {isTdsFilterPopoverOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsTdsFilterPopoverOpen(false)}
                  />

                  <div className="absolute right-0 mt-2 p-3.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 w-[290px] animate-in fade-in slide-in-from-top-2 origin-top-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2.5 tracking-wider">Date Range</p>

                    <div className="grid grid-cols-3 gap-1.5 mb-3">
                      {['This Month', 'Last Month', 'This Quarter', 'Last Quarter', 'This Year', 'Last Year'].map(label => (
                        <button
                          key={label}
                          onClick={() => {
                            setTdsTimeRange(label);
                            setIsTdsFilterPopoverOpen(false);
                          }}
                          className={`px-2 py-1.5 text-[10px] font-bold rounded-lg transition-all border ${
                            tdsTimeRange === label
                              ? 'bg-purple-600 border-purple-600 text-white shadow-xs'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>

                    <div className="pt-2.5 border-t border-slate-100">
                      <div className="relative">
                        <Calendar size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="month"
                          className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-600 focus:outline-none focus:border-purple-500 focus:bg-white transition-all cursor-pointer"
                          onChange={(e) => {
                            if (e.target.value) {
                              setTdsTimeRange('Custom');
                              setIsTdsFilterPopoverOpen(false);
                            }
                          }}
                        />
                        <p className="absolute left-8 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-slate-400 pointer-events-none">
                          {tdsTimeRange === 'Custom' ? 'Selected' : 'Custom Month'}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between">
              <div className="min-w-0 pr-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight truncate">Average Monthly TDS</p>
                <p className="text-sm xl:text-base font-bold text-slate-800 mt-0.5 truncate">
                  ₹ {Math.round(Number((tdsGraphData.reduce((acc, curr) => acc + curr.tds, 0) / (tdsGraphData.length || 1)).toFixed(2)) * 100000).toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between">
              <div className="min-w-0 pr-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight truncate">Employees with TDS</p>
                <p className="text-sm xl:text-base font-bold text-slate-800 mt-0.5">1,842</p>
              </div>
              <div className="h-8 w-8 shrink-0 rounded-full bg-white border border-slate-200 flex items-center justify-center text-indigo-600 shadow-xs">
                <Users size={15} />
              </div>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between">
              <div className="min-w-0 pr-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight truncate">Highest TDS Month</p>
                <p className="text-sm xl:text-base font-bold text-slate-800 mt-0.5 flex flex-wrap items-baseline gap-1">
                  <span>Nov '25</span>
                  <span className="text-[11px] xl:text-xs font-semibold text-emerald-600">₹ {(22.4 * 100000).toLocaleString('en-IN')}</span>
                </p>
              </div>
              <div className="h-8 w-8 shrink-0 rounded-full bg-white border border-slate-200 flex items-center justify-center text-emerald-600 shadow-xs">
                <TrendingUp size={15} />
              </div>
            </div>
          </div>

          {/* Main Graph (fills the 50% card) */}
          <div className="w-full bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between h-[310px]">
            {/* Chart Area with Y-axis */}
            <div className="flex-1 min-h-0 flex gap-2">
              {/* Y-Axis Labels */}
              <div className="w-20 shrink-0 flex flex-col justify-between text-[10px] font-semibold text-slate-400 text-right pr-2 select-none">
                <span>₹{Math.round(yAxisMax * 100000).toLocaleString('en-IN')}</span>
                <span>₹{Math.round(yAxisMax * 0.75 * 100000).toLocaleString('en-IN')}</span>
                <span>₹{Math.round(yAxisMax * 0.5 * 100000).toLocaleString('en-IN')}</span>
                <span>₹{Math.round(yAxisMax * 0.25 * 100000).toLocaleString('en-IN')}</span>
                <span>₹0</span>
              </div>

              {/* SVG Area */}
              <div className="flex-1 min-h-0 relative">
                <svg viewBox="0 0 1000 300" className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
                  {[0, 1, 2, 3, 4].map(i => (
                    <line key={i} x1="0" y1={300 - (i * 75)} x2="1000" y2={300 - (i * 75)} stroke="#f1f5f9" strokeWidth="1" />
                  ))}

                  <defs>
                    <linearGradient id="purpleGradientNew" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#9333ea" stopOpacity="0.12" />
                      <stop offset="100%" stopColor="#9333ea" stopOpacity="0.01" />
                    </linearGradient>
                  </defs>
                  <path d={getAreaPath()} fill="url(#purpleGradientNew)" />
                  <path d={getGraphPath()} fill="none" stroke="#9333ea" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

                  {tdsGraphData.map((d, i) => {
                    const { x, y } = getPointCoords(i);
                    return (
                      <g key={i} onMouseEnter={() => setHoveredPoint(i)} onMouseLeave={() => setHoveredPoint(null)} style={{ cursor: 'pointer' }}>
                        <circle cx={x} cy={y} r="4.5" fill="white" stroke="#9333ea" strokeWidth="2.5" className="transition-all hover:r-6" />
                        <rect x={Math.max(0, x - 25)} y={0} width="50" height="300" fill="transparent" />
                      </g>
                    );
                  })}
                </svg>

                {/* Tooltip */}
                {hoveredPoint !== null && (
                  <div
                    className="absolute bg-slate-900 text-white text-xs rounded-xl p-3 shadow-2xl z-30 pointer-events-none min-w-[200px]"
                    style={{
                      left: `${getPointCoords(hoveredPoint).x / 10}%`,
                      top: `${(getPointCoords(hoveredPoint).y / 300) * 100}%`,
                      transform: 'translate(-50%, -120%)'
                    }}
                  >
                    <div className="font-bold border-b border-slate-700 pb-1.5 mb-1.5">
                      <span className="text-slate-200 font-extrabold">{tdsGraphData[hoveredPoint].period}</span>
                    </div>
                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex justify-between text-slate-300 gap-3">
                        <span>Total Taxable Salary:</span>
                        <span className="font-semibold text-white">{tdsGraphData[hoveredPoint].gross}</span>
                      </div>
                      <div className="flex justify-between text-slate-300 gap-3">
                        <span>Total TDS:</span>
                        <span className="font-semibold text-purple-300">₹{Math.round(tdsGraphData[hoveredPoint].tds * 100000).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-slate-400 pt-1.5 border-t border-slate-700/80 gap-3">
                        <span>Employees:</span>
                        <span className="font-semibold text-slate-200">{tdsGraphData[hoveredPoint].employees}</span>
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-4 border-transparent border-t-slate-900" />
                  </div>
                )}
              </div>
            </div>

            {/* X-Axis Labels aligned with the SVG */}
            <div className="flex items-center pl-[88px] pr-2 pt-2.5 mt-2 border-t border-slate-100">
              <div className="flex-1 flex justify-between text-[11px] font-semibold text-slate-500">
                {tdsGraphData.map((d, i) => (
                  <span key={i} className="text-center w-8 truncate">{d.period.split(' ')[0]}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Expense & Reimbursement Trend */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          {/* Header & Filters */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg shrink-0">
                <Wallet size={18} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base leading-tight">Expense & Reimbursement Trend</h3>
              </div>
            </div>

            <div className="relative shrink-0">
              <button
                onClick={() => setIsExpenseFilterPopoverOpen(!isExpenseFilterPopoverOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <Filter size={13} className="text-blue-600" />
                  <span>{expenseTimeRange}</span>
                </div>
                <ChevronDown size={13} className={`text-slate-400 transition-transform ${isExpenseFilterPopoverOpen ? 'rotate-180' : ''}`} />
              </button>

              {isExpenseFilterPopoverOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsExpenseFilterPopoverOpen(false)}
                  />

                  <div className="absolute right-0 mt-2 p-3.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 w-[290px] animate-in fade-in slide-in-from-top-2 origin-top-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2.5 tracking-wider">Date Range</p>
                    <div className="grid grid-cols-3 gap-1.5">
                      {['This Month', 'Last Month', 'This Quarter', 'Last Quarter', 'This Year', 'Last Year'].map(label => (
                        <button
                          key={label}
                          onClick={() => {
                            setExpenseTimeRange(label);
                            setIsExpenseFilterPopoverOpen(false);
                          }}
                          className={`px-2 py-1.5 text-[10px] font-bold rounded-lg transition-all border ${
                            expenseTimeRange === label
                              ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Summary KPI Cards (Moved Above Graph) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between">
              <div className="min-w-0 pr-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight truncate">Most Expensive Month</p>
                <p className="text-sm xl:text-base font-bold text-slate-800 mt-0.5 truncate">
                  {mostExpensiveMonth.month}
                </p>
              </div>
              <div className="h-8 w-8 shrink-0 rounded-full bg-white border border-slate-200 flex items-center justify-center text-blue-600 shadow-xs">
                <TrendingUp size={15} />
              </div>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between">
              <div className="min-w-0 pr-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight truncate">Least Expensive Month</p>
                <p className="text-sm xl:text-base font-bold text-slate-800 mt-0.5 truncate">
                  {leastExpensiveMonth.month}
                </p>
              </div>
              <div className="h-8 w-8 shrink-0 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-xs">
                <TrendingDown size={15} />
              </div>
            </div>
          </div>

          {/* Main Graph (fills the 50% card) */}
          <div className="w-full bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between h-[310px]">
            {/* Chart Area with Y-axis */}
            <div className="flex-1 min-h-0 flex gap-2">
              {/* Y-Axis Left (INR) */}
              <div className="w-10 shrink-0 flex flex-col justify-between text-[10px] font-semibold text-slate-400 text-right pr-2 select-none">
                <span>35K</span>
                <span>28K</span>
                <span>21K</span>
                <span>14K</span>
                <span>7K</span>
                <span>0</span>
              </div>

              {/* Chart Grid & Bars */}
              <div className="flex-1 min-h-0 relative border-l border-b border-slate-100">
                {/* Horizontal Grid Lines */}
                {[0, 1, 2, 3, 4, 5].map(i => (
                  <div
                    key={i}
                    className="absolute w-full border-t border-slate-50"
                    style={{ bottom: `${(i / 5) * 100}%` }}
                  />
                ))}

                {/* Bars Columns */}
                <div className="absolute inset-0 flex items-end">
                  {currentExpenseData.map((d, i) => (
                    <div
                      key={i}
                      onMouseEnter={() => setHoveredExpenseIndex(i)}
                      onMouseLeave={() => setHoveredExpenseIndex(null)}
                      className="flex-1 flex flex-col items-center justify-end h-full relative group cursor-pointer transition-colors hover:bg-slate-50/70"
                    >
                      {/* Bar (badges removed as requested) */}
                      {d.amount > 0 ? (
                        <div
                          className={`${currentExpenseData.length === 1 ? 'w-12 sm:w-16' : currentExpenseData.length <= 4 ? 'w-8 sm:w-10' : 'w-4 sm:w-5'} bg-blue-500/85 rounded-t-sm relative transition-all ${hoveredExpenseIndex === i ? 'bg-blue-600 shadow-md shadow-blue-200' : 'hover:bg-blue-600'}`}
                          style={{ height: `${(d.amount / maxExpenseAmount) * 100}%` }}
                        />
                      ) : (
                        <div className="w-3 sm:w-4 h-0.5 bg-slate-200 rounded-full mb-0.5" />
                      )}
                    </div>
                  ))}
                </div>

                {/* Tooltip */}
                {hoveredExpenseIndex !== null && currentExpenseData[hoveredExpenseIndex] && (
                  <div
                    className="absolute bg-slate-900 text-white text-xs rounded-xl p-2.5 shadow-2xl z-30 pointer-events-none min-w-[190px] transition-all duration-75"
                    style={{
                      left: `${((hoveredExpenseIndex + 0.5) / currentExpenseData.length) * 100}%`,
                      top: '10px',
                      transform: currentExpenseData.length === 1
                        ? 'translateX(-50%)'
                        : hoveredExpenseIndex <= 1
                          ? 'translateX(-10%)'
                          : hoveredExpenseIndex >= currentExpenseData.length - 2
                            ? 'translateX(-90%)'
                            : 'translateX(-50%)'
                    }}
                  >
                    <div className="font-bold border-b border-slate-700 pb-1 mb-1 flex justify-between items-center">
                      <span className="text-slate-200 font-bold">{currentExpenseData[hoveredExpenseIndex].month}</span>
                    </div>
                    <div className="space-y-1 text-[11px]">
                      <div className="flex justify-between text-slate-300 gap-3">
                        <span>Total Expense:</span>
                        <span className="font-bold text-blue-300">
                          ₹ {currentExpenseData[hoveredExpenseIndex].amount.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-300 gap-3">
                        <span>Employees:</span>
                        <span className="font-semibold text-white">
                          {currentExpenseData[hoveredExpenseIndex].count}
                        </span>
                      </div>
                    </div>
                    <div
                      className="absolute -bottom-1 border-4 border-transparent border-t-slate-900"
                      style={{
                        left: currentExpenseData.length === 1
                          ? '50%'
                          : hoveredExpenseIndex <= 1
                            ? '15%'
                            : hoveredExpenseIndex >= currentExpenseData.length - 2
                              ? '85%'
                              : '50%',
                        transform: 'translateX(-50%)'
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* X-Axis Labels aligned with the Bars */}
            <div className="flex items-center pl-[48px] pr-0 pt-2.5 mt-2 border-t border-slate-100">
              <div className="flex-1 flex justify-between text-[10px] font-semibold text-slate-500">
                {currentExpenseData.map((d, i) => (
                  <span key={i} className={`text-center flex-1 truncate transition-colors ${hoveredExpenseIndex === i ? 'text-blue-600 font-bold' : 'text-slate-500'}`}>
                    {currentExpenseData.length === 1 ? d.month : d.month.split(' ')[0]}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex justify-center items-center gap-2 pt-1">
            <div className="w-3 h-3 bg-blue-500/80 rounded-xs" />
            <span className="text-xs font-semibold text-slate-500">Expense Amount (INR)</span>
          </div>
        </div>
      </div>

      {/* TDS Full Report Modal */}
      {isTdsReportOpen && (
        <TdsFullReportModal onClose={() => setIsTdsReportOpen(false)} data={tdsGraphData} />
      )}
    </div>
  );
};

export default PayrollDashboardNew;

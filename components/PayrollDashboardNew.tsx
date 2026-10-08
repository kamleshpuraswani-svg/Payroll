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
  X,
  ChevronRight,
  AlertCircle,
  ArrowUpRight,
  Check
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
  Cell,
  Legend,
  ReferenceLine
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

const MONTHLY_PAYROLL_GROWTH = [
  { month: 'Dec', payrollGrowth: 11.5, headcountGrowth: 7.2, payrollCost: 13800000, headcount: 395 },
  { month: 'Jan', payrollGrowth: 12.0, headcountGrowth: 7.8, payrollCost: 15000000, headcount: 402 },
  { month: 'Feb', payrollGrowth: 12.8, headcountGrowth: 8.0, payrollCost: 14500000, headcount: 405 },
  { month: 'Mar', payrollGrowth: 14.5, headcountGrowth: 9.0, payrollCost: 16200000, headcount: 415 },
  { month: 'Apr', payrollGrowth: 13.8, headcountGrowth: 8.5, payrollCost: 15500000, headcount: 418 },
  { month: 'May', payrollGrowth: 15.2, headcountGrowth: 9.4, payrollCost: 16800000, headcount: 425 },
  { month: 'Jun', payrollGrowth: 14.6, headcountGrowth: 8.9, payrollCost: 16200000, headcount: 428 },
  { month: 'Jul', payrollGrowth: 16.8, headcountGrowth: 10.2, payrollCost: 18800000, headcount: 436 },
  { month: 'Aug', payrollGrowth: 15.9, headcountGrowth: 9.7, payrollCost: 17700000, headcount: 440 },
  { month: 'Sep', payrollGrowth: 17.5, headcountGrowth: 10.8, payrollCost: 19600000, headcount: 446 },
  { month: 'Oct', payrollGrowth: 16.2, headcountGrowth: 10.1, payrollCost: 17600000, headcount: 450 },
  { month: 'Nov', payrollGrowth: 18.0, headcountGrowth: 11.0, payrollCost: 18500000, headcount: 452 },
];

const getPayrollGrowthData = (range: string) => {
  if (range === 'This Month') return MONTHLY_PAYROLL_GROWTH.slice(-3);
  if (range === 'Last Month') return MONTHLY_PAYROLL_GROWTH.slice(-4, -1);
  if (range === 'This Quarter' || range === 'Last Quarter') return MONTHLY_PAYROLL_GROWTH.slice(-6);
  return MONTHLY_PAYROLL_GROWTH;
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
  { name: 'Gratuity', code: 'Gratuity', employer: 2.1, employee: 0, tag: 'Retiral', fill: '#8b5cf6' },
  { name: 'Labour Welfare Fund (LWF)', code: 'LWF', employer: 0.05, employee: 0.05, tag: 'Welfare', fill: '#ec4899' },
];

const STATUTORY_DATA_MAP: Record<string, { totalCompliance: number; employerContrib: number; employeeContrib: number; multiplier: number }> = {
  'This Month': { totalCompliance: 3570000, employerContrib: 1005000, employeeContrib: 2565000, multiplier: 1 },
  'Last Month': { totalCompliance: 3420000, employerContrib: 965000, employeeContrib: 2455000, multiplier: 0.96 },
  'This Quarter': { totalCompliance: 10710000, employerContrib: 3015000, employeeContrib: 7695000, multiplier: 3 },
  'Last Quarter': { totalCompliance: 10170000, employerContrib: 2865000, employeeContrib: 7305000, multiplier: 2.85 },
  'This Year': { totalCompliance: 42840000, employerContrib: 12060000, employeeContrib: 30780000, multiplier: 12 },
  'Last Year': { totalCompliance: 39270000, employerContrib: 11055000, employeeContrib: 28215000, multiplier: 11 },
};

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

// Each entry shows N months of actual (historical) payroll cost leading up to "today" (Nov),
// then continues as a forecast for the next 3 months. The last actual month also carries the
// same value under `forecast` so the dashed projection visually connects to the solid trend line.
const COST_FORECAST_MAP: Record<string, Array<{ month: string; actual: number | null; forecast: number | null }>> = {
  'Last 6 Months': [
    { month: 'Jun', actual: 174, forecast: null },
    { month: 'Jul', actual: 177, forecast: null },
    { month: 'Aug', actual: 179, forecast: null },
    { month: 'Sep', actual: 181, forecast: null },
    { month: 'Oct', actual: 184, forecast: null },
    { month: 'Nov', actual: 185, forecast: 185 },
    { month: 'Dec', actual: null, forecast: 187 },
    { month: 'Jan', actual: null, forecast: 189 },
    { month: 'Feb', actual: null, forecast: 196 },
  ],
  'Last 12 Months': [
    { month: 'Dec', actual: 160, forecast: null },
    { month: 'Jan', actual: 163, forecast: null },
    { month: 'Feb', actual: 165, forecast: null },
    { month: 'Mar', actual: 168, forecast: null },
    { month: 'Apr', actual: 170, forecast: null },
    { month: 'May', actual: 172, forecast: null },
    { month: 'Jun', actual: 174, forecast: null },
    { month: 'Jul', actual: 177, forecast: null },
    { month: 'Aug', actual: 179, forecast: null },
    { month: 'Sep', actual: 181, forecast: null },
    { month: 'Oct', actual: 184, forecast: null },
    { month: 'Nov', actual: 185, forecast: 185 },
    { month: 'Dec ', actual: null, forecast: 187 },
    { month: 'Jan ', actual: null, forecast: 189 },
    { month: 'Feb ', actual: null, forecast: 196 },
  ],
  'This Year': [
    { month: 'Jan', actual: 163, forecast: null },
    { month: 'Feb', actual: 165, forecast: null },
    { month: 'Mar', actual: 168, forecast: null },
    { month: 'Apr', actual: 170, forecast: null },
    { month: 'May', actual: 172, forecast: null },
    { month: 'Jun', actual: 174, forecast: null },
    { month: 'Jul', actual: 177, forecast: null },
    { month: 'Aug', actual: 179, forecast: null },
    { month: 'Sep', actual: 181, forecast: null },
    { month: 'Oct', actual: 184, forecast: null },
    { month: 'Nov', actual: 185, forecast: 185 },
    { month: 'Dec', actual: null, forecast: 187 },
    { month: 'Jan ', actual: null, forecast: 189 },
    { month: 'Feb ', actual: null, forecast: 196 },
  ],
  // Last Year is a fully closed period, so it's shown as pure historical trend with no forecast segment.
  'Last Year': [
    { month: 'Jan', actual: 140, forecast: null },
    { month: 'Feb', actual: 142, forecast: null },
    { month: 'Mar', actual: 144, forecast: null },
    { month: 'Apr', actual: 146, forecast: null },
    { month: 'May', actual: 148, forecast: null },
    { month: 'Jun', actual: 150, forecast: null },
    { month: 'Jul', actual: 152, forecast: null },
    { month: 'Aug', actual: 154, forecast: null },
    { month: 'Sep', actual: 156, forecast: null },
    { month: 'Oct', actual: 158, forecast: null },
    { month: 'Nov', actual: 159, forecast: null },
    { month: 'Dec', actual: 160, forecast: null },
  ],
};

const getCostForecastData = (range: string) => {
  return COST_FORECAST_MAP[range] || COST_FORECAST_MAP['Last 6 Months'];
};

const COST_FORECAST = COST_FORECAST_MAP['Last 6 Months'];

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

const EXPENSE_TREND_DATA_MAP: Record<string, { month: string; amount: number; count: number; approved: number; pending: number; settled: number }[]> = {
  'This Year': [
    { month: 'May 2025', amount: 16500, count: 3, approved: 13500, pending: 3000, settled: 11500 },
    { month: 'Jun 2025', amount: 32000, count: 5, approved: 27000, pending: 5000, settled: 24000 },
    { month: 'Jul 2025', amount: 18500, count: 3, approved: 15500, pending: 3000, settled: 13500 },
    { month: 'Aug 2025', amount: 22000, count: 4, approved: 18000, pending: 4000, settled: 15500 },
    { month: 'Sep 2025', amount: 19000, count: 3, approved: 16000, pending: 3000, settled: 14000 },
    { month: 'Oct 2025', amount: 26500, count: 4, approved: 22500, pending: 4000, settled: 19000 },
    { month: 'Nov 2025', amount: 21000, count: 3, approved: 17500, pending: 3500, settled: 14500 },
    { month: 'Dec 2025', amount: 29000, count: 5, approved: 24500, pending: 4500, settled: 20500 },
    { month: 'Jan 2026', amount: 14500, count: 2, approved: 12000, pending: 2500, settled: 9500 },
    { month: 'Feb 2026', amount: 24000, count: 4, approved: 20000, pending: 4000, settled: 16500 },
    { month: 'Mar 2026', amount: 22500, count: 3, approved: 19000, pending: 3500, settled: 15500 },
    { month: 'Apr 2026', amount: 15000, count: 2, approved: 12500, pending: 2500, settled: 10000 },
  ],
  'This Month': [
    { month: 'Nov 2025', amount: 21000, count: 3, approved: 17500, pending: 3500, settled: 14500 },
  ],
  'Last Month': [
    { month: 'Oct 2025', amount: 26500, count: 4, approved: 22500, pending: 4000, settled: 19000 },
  ],
  'This Quarter': [
    { month: 'Oct 2025', amount: 26500, count: 4, approved: 22500, pending: 4000, settled: 19000 },
    { month: 'Nov 2025', amount: 21000, count: 3, approved: 17500, pending: 3500, settled: 14500 },
    { month: 'Dec 2025', amount: 29000, count: 5, approved: 24500, pending: 4500, settled: 20500 },
  ],
  'Last Quarter': [
    { month: 'Jul 2025', amount: 18500, count: 3, approved: 15500, pending: 3000, settled: 13500 },
    { month: 'Aug 2025', amount: 22000, count: 4, approved: 18000, pending: 4000, settled: 15500 },
    { month: 'Sep 2025', amount: 19000, count: 3, approved: 16000, pending: 3000, settled: 14000 },
  ],
  'Last Year': [
    { month: 'May 2024', amount: 15000, count: 2, approved: 12500, pending: 2500, settled: 10500 },
    { month: 'Jun 2024', amount: 28000, count: 4, approved: 23500, pending: 4500, settled: 20000 },
    { month: 'Jul 2024', amount: 17500, count: 3, approved: 14500, pending: 3000, settled: 12000 },
    { month: 'Aug 2024', amount: 21000, count: 3, approved: 17500, pending: 3500, settled: 15000 },
    { month: 'Sep 2024', amount: 18000, count: 3, approved: 15000, pending: 3000, settled: 13000 },
    { month: 'Oct 2024', amount: 24500, count: 4, approved: 20500, pending: 4000, settled: 17500 },
    { month: 'Nov 2024', amount: 20000, count: 3, approved: 16500, pending: 3500, settled: 14000 },
    { month: 'Dec 2024', amount: 27000, count: 5, approved: 22500, pending: 4500, settled: 19000 },
    { month: 'Jan 2025', amount: 13500, count: 2, approved: 11000, pending: 2500, settled: 9000 },
    { month: 'Feb 2025', amount: 22000, count: 3, approved: 18500, pending: 3500, settled: 15500 },
    { month: 'Mar 2025', amount: 25000, count: 4, approved: 21000, pending: 4000, settled: 18000 },
    { month: 'Apr 2025', amount: 16000, count: 2, approved: 13500, pending: 2500, settled: 11000 },
  ],
  'Custom': [
    { month: 'Period 1', amount: 18500, count: 3, approved: 15500, pending: 3000, settled: 13500 },
    { month: 'Period 2', amount: 24000, count: 4, approved: 20000, pending: 4000, settled: 17000 },
    { month: 'Period 3', amount: 19500, count: 3, approved: 16500, pending: 3000, settled: 14000 },
  ],
};

const EXPENSE_TREND_DATA = EXPENSE_TREND_DATA_MAP['This Year'];

const LOANS_ADVANCES_TREND_MAP: Record<string, Array<{
  month: string;
  disbursed: number;
  recovered: number;
  pending: number;
  pendingRequests: number;
  employees: number;
}>> = {
  'This Year': [
    { month: 'Apr 2025', disbursed: 450000, recovered: 360000, pending: 80000, pendingRequests: 2, employees: 11 },
    { month: 'May 2025', disbursed: 300000, recovered: 375000, pending: 65000, pendingRequests: 1, employees: 9 },
    { month: 'Jun 2025', disbursed: 520000, recovered: 380000, pending: 95000, pendingRequests: 2, employees: 14 },
    { month: 'Jul 2025', disbursed: 280000, recovered: 390000, pending: 50000, pendingRequests: 1, employees: 8 },
    { month: 'Aug 2025', disbursed: 650000, recovered: 370000, pending: 110000, pendingRequests: 3, employees: 16 },
    { month: 'Sep 2025', disbursed: 320000, recovered: 410000, pending: 70000, pendingRequests: 2, employees: 10 },
    { month: 'Oct 2025', disbursed: 480000, recovered: 395000, pending: 85000, pendingRequests: 1, employees: 12 },
    { month: 'Nov 2025', disbursed: 400000, recovered: 385000, pending: 205000, pendingRequests: 3, employees: 11 },
  ],
  'This Quarter': [
    { month: 'Oct 2025', disbursed: 480000, recovered: 395000, pending: 85000, pendingRequests: 1, employees: 12 },
    { month: 'Nov 2025', disbursed: 400000, recovered: 385000, pending: 205000, pendingRequests: 3, employees: 11 },
    { month: 'Dec 2025', disbursed: 350000, recovered: 390000, pending: 120000, pendingRequests: 2, employees: 9 },
  ],
  'Last Quarter': [
    { month: 'Jul 2025', disbursed: 280000, recovered: 390000, pending: 50000, pendingRequests: 1, employees: 8 },
    { month: 'Aug 2025', disbursed: 650000, recovered: 370000, pending: 110000, pendingRequests: 3, employees: 16 },
    { month: 'Sep 2025', disbursed: 320000, recovered: 410000, pending: 70000, pendingRequests: 2, employees: 10 },
  ],
  'This Month': [
    { month: 'Nov 2025', disbursed: 400000, recovered: 385000, pending: 205000, pendingRequests: 6, employees: 11 },
  ],
  'Last Month': [
    { month: 'Oct 2025', disbursed: 480000, recovered: 395000, pending: 85000, pendingRequests: 4, employees: 12 },
  ],
  'Last Year': [
    { month: 'Q1 2024', disbursed: 1200000, recovered: 1050000, pending: 240000, pendingRequests: 5, employees: 28 },
    { month: 'Q2 2024', disbursed: 1450000, recovered: 1120000, pending: 280000, pendingRequests: 7, employees: 34 },
    { month: 'Q3 2024', disbursed: 1100000, recovered: 1180000, pending: 210000, pendingRequests: 4, employees: 26 },
    { month: 'Q4 2024', disbursed: 1350000, recovered: 1220000, pending: 260000, pendingRequests: 6, employees: 30 },
  ],
};

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

// ===================== Mock Data & Modals for LOAN And Advance & Exp. AND Reimb. =====================

const MOCK_LOAN_ADVANCE_RECORDS = [
  { id: 'LA-101', empId: 'MKR101', name: 'Priya Sharma', role: 'Senior Engineer', dept: 'Engineering', type: 'Personal Loan', originalAmt: 200000, outstanding: 120000, emi: 10000, nextDeduction: 'Nov 2025', status: 'Active' },
  { id: 'LA-102', empId: 'MKR102', name: 'Arjun Mehta', role: 'Sales Manager', dept: 'Sales', type: 'Salary Advance', originalAmt: 50000, outstanding: 25000, emi: 12500, nextDeduction: 'Nov 2025', status: 'Active' },
  { id: 'LA-103', empId: 'MKR103', name: 'Neha Kapoor', role: 'Product Analyst', dept: 'Product', type: 'Personal Loan', originalAmt: 300000, outstanding: 210000, emi: 15000, nextDeduction: 'Nov 2025', status: 'Active' },
  { id: 'LA-104', empId: 'MKR104', name: 'Rohan Desai', role: 'DevOps Engineer', dept: 'Engineering', type: 'Personal Loan', originalAmt: 150000, outstanding: 95000, emi: 9500, nextDeduction: 'Nov 2025', status: 'Active' },
  { id: 'LA-105', empId: 'MKR105', name: 'Vikram Singh', role: 'Finance Assoc.', dept: 'Finance', type: 'Salary Advance', originalAmt: 40000, outstanding: 20000, emi: 20000, nextDeduction: 'Nov 2025', status: 'Active' },
  { id: 'LA-106', empId: 'MKR106', name: 'Kavita Rao', role: 'HR Specialist', dept: 'HR', type: 'Personal Loan', originalAmt: 250000, outstanding: 180000, emi: 12000, nextDeduction: 'Nov 2025', status: 'Active' },
  { id: 'LA-107', empId: 'MKR107', name: 'Sanjay Patel', role: 'Tech Lead', dept: 'Engineering', type: 'Personal Loan', originalAmt: 500000, outstanding: 450000, emi: 25000, nextDeduction: 'Nov 2025', status: 'Active' },
  { id: 'LA-108', empId: 'MKR108', name: 'Amit Mishra', role: 'QA Engineer', dept: 'Engineering', type: 'Salary Advance', originalAmt: 30000, outstanding: 15000, emi: 15000, nextDeduction: 'Overdue', status: 'Overdue' },
  { id: 'LA-109', empId: 'MKR109', name: 'Sneha Reddy', role: 'UX Designer', dept: 'Design', type: 'Personal Loan', originalAmt: 180000, outstanding: 180000, emi: 10000, nextDeduction: 'Pending Approval', status: 'Pending Approval' },
  { id: 'LA-110', empId: 'MKR110', name: 'Rahul Verma', role: 'Analyst', dept: 'Operations', type: 'Salary Advance', originalAmt: 25000, outstanding: 25000, emi: 12500, nextDeduction: 'Pending Approval', status: 'Pending Approval' },
];

const LoanAdvanceDetailsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [filterType, setFilterType] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = useMemo(() => {
    return MOCK_LOAN_ADVANCE_RECORDS.filter(r => {
      const matchType = filterType === 'All' || r.type === filterType || r.status === filterType;
      const matchSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) || r.empId.toLowerCase().includes(searchTerm.toLowerCase());
      return matchType && matchSearch;
    });
  }, [filterType, searchTerm]);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <Landmark className="text-blue-600" size={20} /> LOAN And Advance - Detailed Overview
            </h3>
            <p className="text-xs text-slate-500">Employee loan balances, salary advance recovery, and pending requests</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors shadow-2xs">
              <Download size={14} /> Export CSV
            </button>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-700 transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* Top 4 KPI Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-100">
              <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wider mb-1">Total Outstanding</p>
              <p className="text-xl font-black text-blue-950">₹48,20,000</p>
              <p className="text-[11px] text-blue-600 mt-0.5">37 active employees</p>
            </div>
            <div className="p-3.5 bg-indigo-50/70 rounded-xl border border-indigo-100">
              <p className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider mb-1">Active Loans</p>
              <p className="text-xl font-black text-indigo-950">₹38,70,000</p>
              <p className="text-[11px] text-indigo-600 mt-0.5">24 employees</p>
            </div>
            <div className="p-3.5 bg-sky-50/70 rounded-xl border border-sky-100">
              <p className="text-[10px] font-bold text-sky-700 uppercase tracking-wider mb-1">Salary Advances</p>
              <p className="text-xl font-black text-sky-950">₹9,50,000</p>
              <p className="text-[11px] text-sky-600 mt-0.5">13 employees</p>
            </div>
            <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-100">
              <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-1">Next Payroll Recovery</p>
              <p className="text-xl font-black text-emerald-950">₹3,85,000</p>
              <p className="text-[11px] text-emerald-600 mt-0.5">Scheduled Nov 2025</p>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {['All', 'Personal Loan', 'Salary Advance', 'Pending Approval', 'Overdue'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilterType(f)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all border ${
                    filterType === f
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Search by employee name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-blue-500 w-full sm:w-64"
            />
          </div>

          {/* Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3 text-right">Original Amount</th>
                  <th className="px-4 py-3 text-right">Outstanding</th>
                  <th className="px-4 py-3 text-right">Monthly Recovery</th>
                  <th className="px-4 py-3">Cycle</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filtered.map(row => (
                  <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-800">{row.name}</p>
                      <p className="text-[10px] text-slate-400">{row.empId} • {row.dept}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                        row.type === 'Personal Loan'
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          : 'bg-sky-50 text-sky-700 border-sky-200'
                      }`}>
                        {row.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-600">₹{row.originalAmt.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900">₹{row.outstanding.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-right font-bold text-blue-700">₹{row.emi.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-slate-600">{row.nextDeduction}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        row.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : row.status === 'Pending Approval'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const MOCK_EXPENSE_REIMB_RECORDS = [
  { id: 'CLM-201', empId: 'MKR102', name: 'Arjun Mehta', dept: 'Sales', category: 'Client Dinner & Travel', claimDate: '12 Nov 2025', amount: 34500, status: 'Approved & Unpaid', payoutCycle: 'Nov 2025 Payroll' },
  { id: 'CLM-202', empId: 'MKR107', name: 'Sanjay Patel', dept: 'Engineering', category: 'Conference & Flight', claimDate: '10 Nov 2025', amount: 58000, status: 'Approved & Unpaid', payoutCycle: 'Nov 2025 Payroll' },
  { id: 'CLM-203', empId: 'MKR104', name: 'Rohan Desai', dept: 'Engineering', category: 'AWS Cloud Certification', claimDate: '14 Nov 2025', amount: 22000, status: 'Approved & Unpaid', payoutCycle: 'Nov 2025 Payroll' },
  { id: 'CLM-204', empId: 'MKR101', name: 'Priya Sharma', dept: 'Engineering', category: 'Team Lunch / Offsite', claimDate: '15 Nov 2025', amount: 16500, status: 'Approved & Unpaid', payoutCycle: 'Nov 2025 Payroll' },
  { id: 'CLM-205', empId: 'MKR105', name: 'Vikram Singh', dept: 'Finance', category: 'Software Subscription', claimDate: '18 Nov 2025', amount: 48000, status: 'Pending Approval', payoutCycle: 'Pending' },
  { id: 'CLM-206', empId: 'MKR106', name: 'Kavita Rao', dept: 'HR', category: 'Campus Recruitment Travel', claimDate: '17 Nov 2025', amount: 32000, status: 'Pending Approval', payoutCycle: 'Pending' },
  { id: 'CLM-207', empId: 'MKR109', name: 'Sneha Reddy', dept: 'Design', category: 'Design Software Assets', claimDate: '16 Nov 2025', amount: 18500, status: 'Pending Approval', payoutCycle: 'Pending' },
  { id: 'CLM-208', empId: 'MKR103', name: 'Neha Kapoor', dept: 'Product', category: 'User Testing Incentive', claimDate: '01 Nov 2025', amount: 45000, status: 'Paid/Settled', payoutCycle: 'Oct 2025 Payroll' },
  { id: 'CLM-209', empId: 'MKR108', name: 'Amit Mishra', dept: 'Engineering', category: 'Internet & Work From Home', claimDate: '02 Nov 2025', amount: 3000, status: 'Paid/Settled', payoutCycle: 'Oct 2025 Payroll' },
];

const ExpenseReimbDetailsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = useMemo(() => {
    return MOCK_EXPENSE_REIMB_RECORDS.filter(r => {
      const matchStatus = filterStatus === 'All' || r.status === filterStatus;
      const matchSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) || r.category.toLowerCase().includes(searchTerm.toLowerCase()) || r.id.toLowerCase().includes(searchTerm.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [filterStatus, searchTerm]);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <Wallet className="text-emerald-600" size={20} /> Exp. AND Reimb. - Detailed Claims
            </h3>
            <p className="text-xs text-slate-500">Employee expense claims, verification status, and scheduled payroll reimbursements</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors shadow-2xs">
              <Download size={14} /> Export CSV
            </button>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-700 transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* Top 4 KPI Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total Outstanding</p>
              <p className="text-xl font-black text-slate-900">₹5,86,000</p>
              <p className="text-[11px] text-slate-500 mt-0.5">31 affected employees</p>
            </div>
            <div className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-100">
              <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-1">Pending Approval</p>
              <p className="text-xl font-black text-amber-950">₹1,86,000</p>
              <p className="text-[11px] text-amber-700 mt-0.5">23 claims under review</p>
            </div>
            <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-100">
              <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wider mb-1">Approved & Unpaid</p>
              <p className="text-xl font-black text-blue-950">₹4,12,000</p>
              <p className="text-[11px] text-blue-700 mt-0.5">14 claims awaiting payout</p>
            </div>
            <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-100">
              <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-1">Next Payroll Payout</p>
              <p className="text-xl font-black text-emerald-950">₹2,75,000</p>
              <p className="text-[11px] text-emerald-600 mt-0.5">Scheduled Nov 2025</p>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {['All', 'Pending Approval', 'Approved & Unpaid', 'Paid/Settled'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilterStatus(f)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all border ${
                    filterStatus === f
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Search by employee, category or claim ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-emerald-500 w-full sm:w-64"
            />
          </div>

          {/* Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Claim ID</th>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3">Payout Cycle</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filtered.map(row => (
                  <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-700">{row.id}</td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-800">{row.name}</p>
                      <p className="text-[10px] text-slate-400">{row.empId} • {row.dept}</p>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700">{row.category}</td>
                    <td className="px-4 py-3 text-slate-500">{row.claimDate}</td>
                    <td className="px-4 py-3 text-right font-black text-slate-900">₹{row.amount.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-slate-600">{row.payoutCycle}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        row.status === 'Approved & Unpaid'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : row.status === 'Pending Approval'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
      <div className={`flex justify-between ${subtitle ? 'items-start' : 'items-center'} mb-3`}>
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

// Shows "Total Cost" for actual data points and "Forecast" for projected ones — kept separate
// from the chart legend (which still reads "Actual") since only the tooltip label changes here.
const CostForecastTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const point = payload.find((p: any) => p.value != null);
    if (!point) return null;
    const isActual = point.dataKey === 'actual';
    return (
      <div className="bg-white p-3 border border-slate-200 rounded-xl shadow-xl min-w-[170px] text-xs">
        <p className="font-bold text-slate-800 mb-2 border-b border-slate-100 pb-1.5">{label}</p>
        <div className="flex justify-between items-center gap-4" style={{ color: isActual ? '#4f46e5' : '#818cf8' }}>
          <span className="font-semibold">{isActual ? 'Total Cost' : 'Forecast'}:</span>
          <span className="font-bold">{formatLakhValueAsINR(point.value)}</span>
        </div>
      </div>
    );
  }
  return null;
};

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

const PayrollGrowthTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="relative z-50 bg-white p-3.5 border border-slate-200 rounded-xl shadow-2xl min-w-[240px] text-xs">
        <p className="font-bold text-slate-800 mb-2 border-b border-slate-100 pb-1.5 flex items-center justify-between">
          <span className="font-extrabold text-sm text-slate-900">{data.month ? `${data.month} 2025` : (label || data.year || 'Period')}</span>
        </p>
        <div className="space-y-2">
          {/* Details already shown */}
          <div className="flex justify-between items-center text-slate-700">
            <span className="flex items-center gap-1.5 font-medium text-slate-600">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#4f46e5] shrink-0"></span>
              Payroll Growth %:
            </span>
            <span className="font-bold text-slate-900">{data.payrollGrowth}%</span>
          </div>
          <div className="flex justify-between items-center text-slate-700">
            <span className="flex items-center gap-1.5 font-medium text-slate-600">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#a5b4fc] shrink-0"></span>
              Headcount Growth %:
            </span>
            <span className="font-bold text-slate-900">{data.headcountGrowth}%</span>
          </div>

          {/* New details requested */}
          <div className="border-t border-slate-100 pt-2 space-y-1.5">
            <div className="flex justify-between items-center text-slate-700">
              <span className="font-medium text-slate-600">Payroll Cost:</span>
              <span className="font-black text-indigo-950">{formatINR(data.payrollCost)}</span>
            </div>
            <div className="flex justify-between items-center text-slate-700">
              <span className="font-medium text-slate-600">Headcount:</span>
              <span className="font-bold text-slate-900">{data.headcount}</span>
            </div>
          </div>
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

const LoansAdvancesTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="relative z-50 bg-white p-3.5 border border-slate-200 rounded-xl shadow-2xl min-w-[210px] text-xs">
        <p className="font-extrabold text-sm text-slate-900 mb-2 pb-1.5 border-b border-slate-100 flex items-center justify-between">
          <span>{label || data.month}</span>
        </p>
        <div className="space-y-2">
          <div className="flex justify-between items-center text-slate-700">
            <span className="flex items-center gap-1.5 font-medium text-slate-600">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#4f46e5] shrink-0"></span>
              Total Disbursed:
            </span>
            <span className="font-bold text-[#4f46e5]">{formatINR(data.disbursed)}</span>
          </div>
          <div className="flex justify-between items-center text-slate-700">
            <span className="flex items-center gap-1.5 font-medium text-slate-600">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#10b981] shrink-0"></span>
              Total Recovered:
            </span>
            <span className="font-bold text-[#10b981]">{formatINR(data.recovered)}</span>
          </div>
          {data.pending != null && (
            <div className="flex justify-between items-center text-slate-700">
              <span className="flex items-center gap-1.5 font-medium text-slate-600">
                <span className="w-2.5 h-2.5 rounded-xs bg-amber-500 shrink-0"></span>
                Pending Approval:
              </span>
              <span className="font-bold text-amber-600">{formatINR(data.pending)}</span>
            </div>
          )}
          <div className="flex justify-between items-center text-slate-700 pt-1.5 border-t border-slate-100">
            <span className="flex items-center gap-1.5 font-medium text-slate-600">
              <Users size={13} className="text-slate-400 shrink-0" />
              Employees:
            </span>
            <span className="font-bold text-slate-900">{data.employees}</span>
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
  presets?: string[];
}> = ({
  value,
  onChange,
  presets = ['This Month', 'Last Month', 'This Quarter', 'Last Quarter', 'This Year', 'Last Year'],
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(value);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedPreset(value);
  }, [value]);

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
    setStartDate('');
    setEndDate('');
    onChange(preset);
    setIsOpen(false);
  };

  const formatMonthYearStr = (ym: string) => {
    if (!ym) return '';
    const [y, m] = ym.split('-');
    if (!y || !m) return ym;
    const date = new Date(parseInt(y, 10), parseInt(m, 10) - 1, 1);
    return date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
  };

  const handleCustomApply = () => {
    if (startDate && endDate) {
      const formatted = startDate === endDate
        ? formatMonthYearStr(startDate)
        : `${formatMonthYearStr(startDate)} - ${formatMonthYearStr(endDate)}`;
      setSelectedPreset(formatted);
      onChange(formatted);
    } else if (startDate) {
      const formatted = formatMonthYearStr(startDate);
      setSelectedPreset(formatted);
      onChange(formatted);
    } else if (endDate) {
      const formatted = `Up to ${formatMonthYearStr(endDate)}`;
      setSelectedPreset(formatted);
      onChange(formatted);
    } else {
      setSelectedPreset('Custom Range');
      onChange('Custom Range');
    }
    setIsOpen(false);
  };

  const isCustomActive = !presets.includes(selectedPreset);

  return (
    <div className="relative shrink-0" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className={`bg-white border text-slate-700 text-xs font-bold rounded-xl px-3 py-1.5 flex items-center gap-2 transition-all shadow-2xs cursor-pointer ${
          isOpen ? 'border-indigo-500 ring-2 ring-indigo-100 bg-slate-50/50' : 'border-slate-200 hover:bg-slate-50 hover:border-slate-300'
        }`}
      >
        <Calendar size={13} className="text-indigo-600 shrink-0" />
        <span className="font-semibold text-slate-800 text-xs truncate max-w-[150px] sm:max-w-none">{value}</span>
        <ChevronDown size={13} className={`text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-indigo-600' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[310px] bg-white rounded-2xl border border-slate-200 shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150 origin-top-right">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Date Range</p>

          <div className={`grid ${presets.length <= 4 ? 'grid-cols-2' : 'grid-cols-3'} gap-1.5 mb-3`}>
            {presets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handlePresetSelect(preset)}
                className={`py-1.5 px-2 text-xs font-semibold rounded-lg border transition-all text-center cursor-pointer ${
                  selectedPreset === preset && !isCustomActive
                    ? 'bg-[#3e49e2] border-[#3e49e2] text-white shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>

          {/* Custom Date Range Picker */}
          <div className="pt-3 border-t border-slate-100 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isCustomActive ? 'text-indigo-600' : 'text-slate-400'}`}>
                Custom Date Range
              </span>
              {(startDate || endDate) && (
                <button
                  type="button"
                  onClick={() => { setStartDate(''); setEndDate(''); }}
                  className="text-[10px] font-bold text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-semibold text-slate-500 block mb-1">From</label>
                <input
                  type="month"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all cursor-pointer"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-500 block mb-1">To</label>
                <input
                  type="month"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all cursor-pointer"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleCustomApply}
              className="w-full py-2 px-3 bg-[#3e49e2] hover:bg-[#323bc0] text-white font-bold text-xs rounded-lg transition-all text-center cursor-pointer shadow-xs active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Check size={13} />
              <span>Apply</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const BUSINESS_UNITS_LIST = [
  'CollabCRM',
  '300 Minds',
  'MindInventory',
  'BlueWhale Tech',
];

const BU_PROFILES: Record<string, {
  name: string;
  ratio: number;
  employees: number;
  processed: number;
  onHold: number;
  approvedTax: number;
  pendingTax: number;
  notSubmittedTax: number;
  taxApprovedPct: number;
  taxPendingPct: number;
  taxNotSubmittedPct: number;
  growthPayroll: number;
  growthHeadcount: number;
}> = {
  'All Business Units': {
    name: 'All Business Units',
    ratio: 1.0,
    employees: 452,
    processed: 400,
    onHold: 52,
    approvedTax: 352,
    pendingTax: 68,
    notSubmittedTax: 32,
    taxApprovedPct: 78,
    taxPendingPct: 15,
    taxNotSubmittedPct: 7,
    growthPayroll: 18,
    growthHeadcount: 11,
  },
  'CollabCRM': {
    name: 'CollabCRM',
    ratio: 0.335,
    employees: 152,
    processed: 136,
    onHold: 16,
    approvedTax: 122,
    pendingTax: 20,
    notSubmittedTax: 10,
    taxApprovedPct: 80,
    taxPendingPct: 13,
    taxNotSubmittedPct: 7,
    growthPayroll: 20,
    growthHeadcount: 13,
  },
  '300 Minds': {
    name: '300 Minds',
    ratio: 0.259,
    employees: 118,
    processed: 104,
    onHold: 14,
    approvedTax: 91,
    pendingTax: 18,
    notSubmittedTax: 9,
    taxApprovedPct: 77,
    taxPendingPct: 15,
    taxNotSubmittedPct: 8,
    growthPayroll: 16,
    growthHeadcount: 9,
  },
  'MindInventory': {
    name: 'MindInventory',
    ratio: 0.222,
    employees: 100,
    processed: 88,
    onHold: 12,
    approvedTax: 76,
    pendingTax: 17,
    notSubmittedTax: 7,
    taxApprovedPct: 76,
    taxPendingPct: 17,
    taxNotSubmittedPct: 7,
    growthPayroll: 19,
    growthHeadcount: 12,
  },
  'BlueWhale Tech': {
    name: 'BlueWhale Tech',
    ratio: 0.184,
    employees: 82,
    processed: 72,
    onHold: 10,
    approvedTax: 63,
    pendingTax: 13,
    notSubmittedTax: 6,
    taxApprovedPct: 77,
    taxPendingPct: 16,
    taxNotSubmittedPct: 7,
    growthPayroll: 15,
    growthHeadcount: 8,
  },
};

const getCombinedBuProfile = (selectedBus: string[]) => {
  const activeBus = selectedBus.length > 0 ? selectedBus : BUSINESS_UNITS_LIST;

  if (activeBus.length === BUSINESS_UNITS_LIST.length) {
    return BU_PROFILES['All Business Units'];
  }

  if (activeBus.length === 1 && BU_PROFILES[activeBus[0]]) {
    return BU_PROFILES[activeBus[0]];
  }

  let totalRatio = 0;
  let totalEmployees = 0;
  let totalProcessed = 0;
  let totalOnHold = 0;
  let totalApprovedTax = 0;
  let totalPendingTax = 0;
  let totalNotSubmittedTax = 0;
  let weightedGrowthPayroll = 0;
  let weightedGrowthHeadcount = 0;

  activeBus.forEach(bu => {
    const prof = BU_PROFILES[bu];
    if (!prof) return;
    totalRatio += prof.ratio;
    totalEmployees += prof.employees;
    totalProcessed += prof.processed;
    totalOnHold += prof.onHold;
    totalApprovedTax += prof.approvedTax;
    totalPendingTax += prof.pendingTax;
    totalNotSubmittedTax += prof.notSubmittedTax;
    weightedGrowthPayroll += prof.growthPayroll * prof.employees;
    weightedGrowthHeadcount += prof.growthHeadcount * prof.employees;
  });

  const totalTax = totalApprovedTax + totalPendingTax + totalNotSubmittedTax;
  const taxApprovedPct = totalTax > 0 ? Math.round((totalApprovedTax / totalTax) * 100) : 0;
  const taxPendingPct = totalTax > 0 ? Math.round((totalPendingTax / totalTax) * 100) : 0;
  const taxNotSubmittedPct = totalTax > 0 ? Math.max(0, 100 - taxApprovedPct - taxPendingPct) : 0;

  const growthPayroll = totalEmployees > 0 ? Math.round(weightedGrowthPayroll / totalEmployees) : 18;
  const growthHeadcount = totalEmployees > 0 ? Math.round(weightedGrowthHeadcount / totalEmployees) : 11;

  return {
    name: activeBus.join(', '),
    ratio: Math.min(1.0, Math.round(totalRatio * 1000) / 1000),
    employees: totalEmployees,
    processed: totalProcessed,
    onHold: totalOnHold,
    approvedTax: totalApprovedTax,
    pendingTax: totalPendingTax,
    notSubmittedTax: totalNotSubmittedTax,
    taxApprovedPct,
    taxPendingPct,
    taxNotSubmittedPct,
    growthPayroll,
    growthHeadcount,
  };
};

const BusinessUnitDropdown: React.FC<{
  value: string[];
  onChange: (bus: string[]) => void;
}> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
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

  const handleToggle = (bu: string) => {
    if (value.includes(bu)) {
      if (value.length > 1) {
        onChange(value.filter(item => item !== bu));
      }
    } else {
      onChange([...value, bu]);
    }
  };

  const getButtonLabel = () => {
    if (value.length === 0) return 'Select Business Unit';
    if (value.length === BUSINESS_UNITS_LIST.length) return 'All Business Units';
    if (value.length === 1) return value[0];
    if (value.length === 2) return `${value[0]}, ${value[1]}`;
    return `${value[0]} +${value.length - 1} more`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className={`bg-white border text-slate-700 text-xs font-bold rounded-xl px-3.5 py-2 flex items-center gap-2 transition-all shadow-2xs cursor-pointer ${
          isOpen ? 'border-indigo-500 ring-2 ring-indigo-100 bg-slate-50/50' : 'border-slate-200 hover:bg-slate-50 hover:border-slate-300'
        }`}
      >
        <Building2 size={15} className="text-indigo-600 shrink-0" />
        <span className="font-semibold text-slate-800 text-xs max-w-[200px] truncate">{getButtonLabel()}</span>
        {value.length > 0 && (
          <span className="inline-flex items-center justify-center min-w-4 h-4 px-1.5 text-[10px] font-black rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
            {value.length}
          </span>
        )}
        <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-indigo-600' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[240px] bg-white rounded-xl border border-slate-200 shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-slate-100 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Business Unit ({value.length}/{BUSINESS_UNITS_LIST.length})
            </span>
            {value.length < BUSINESS_UNITS_LIST.length ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange([...BUSINESS_UNITS_LIST]);
                }}
                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
              >
                Select All
              </button>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange([BUSINESS_UNITS_LIST[0]]);
                }}
                className="text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>

          <div className="space-y-0.5">
            {BUSINESS_UNITS_LIST.map((bu) => {
              const isSelected = value.includes(bu);
              return (
                <div
                  key={bu}
                  onClick={() => handleToggle(bu)}
                  className={`w-full text-left px-2.5 py-2 text-xs font-semibold rounded-lg flex items-center justify-between transition-colors cursor-pointer group select-none ${
                    isSelected ? 'bg-indigo-50/80 text-indigo-900 font-bold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-all shrink-0 ${
                        isSelected
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xs'
                          : 'border-slate-300 bg-white group-hover:border-slate-400'
                      }`}
                    >
                      {isSelected && <Check size={11} strokeWidth={3} />}
                    </div>
                    <span className="truncate">{bu}</span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange([bu]);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-[10px] font-bold text-slate-400 hover:text-indigo-600 px-1.5 py-0.5 rounded hover:bg-white transition-all shrink-0 cursor-pointer"
                    title={`Select only ${bu}`}
                  >
                    Only
                  </button>
                </div>
              );
            })}
          </div>

          <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex items-center justify-between px-2">
            <span className="text-[10px] text-slate-400 font-semibold">
              {value.length} of {BUSINESS_UNITS_LIST.length} selected
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-2 py-0.5 text-[11px] font-bold text-indigo-600 hover:bg-indigo-50 rounded transition-colors cursor-pointer"
            >
              Done
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
  totalCostNum: number;
  totalCostSub: string;
  totalCostTrend: 'up' | 'down';
  netPayable: string;
  netPayableNum: number;
  activeEmployees: string;
  activeEmployeesNum: number;
  activeEmployeesSub: string;
  statutory: string;
  statutoryNum: number;
  processingStatus: string;
  processingSub: string;
  processingTrend: 'up' | 'down';
  avgCost: string;
  avgCostSub: string;
}> = {
  'This Month': {
    totalCost: formatCr(18500000),
    totalCostNum: 18500000,
    totalCostSub: '+5.2% MoM',
    totalCostTrend: 'up',
    netPayable: formatCr(14200000),
    netPayableNum: 14200000,
    activeEmployees: '452',
    activeEmployeesNum: 452,
    activeEmployeesSub: '+8 joined / -3 hold',
    statutory: formatL(3260000),
    statutoryNum: 3260000,
    processingStatus: '400 / 452',
    processingSub: '50 On Hold, 2 Failed',
    processingTrend: 'down',
    avgCost: formatINR(40929),
    avgCostSub: '+2.1% MoM',
  },
  'Last Month': {
    totalCost: formatCr(17600000),
    totalCostNum: 17600000,
    totalCostSub: '+4.1% MoM',
    totalCostTrend: 'up',
    netPayable: formatCr(13600000),
    netPayableNum: 13600000,
    activeEmployees: '447',
    activeEmployeesNum: 447,
    activeEmployeesSub: '+5 joined / -2 hold',
    statutory: formatL(3120000),
    statutoryNum: 3120000,
    processingStatus: '447 / 447',
    processingSub: 'All Disbursed',
    processingTrend: 'up',
    avgCost: formatINR(39373),
    avgCostSub: '+1.8% MoM',
  },
  'This Quarter': {
    totalCost: formatCr(54200000),
    totalCostNum: 54200000,
    totalCostSub: '+6.8% QoQ',
    totalCostTrend: 'up',
    netPayable: formatCr(41800000),
    netPayableNum: 41800000,
    activeEmployees: '452',
    activeEmployeesNum: 452,
    activeEmployeesSub: '+18 joined / -7 hold',
    statutory: formatL(9640000),
    statutoryNum: 9640000,
    processingStatus: '1,320 / 1,350',
    processingSub: '50 On Hold, 2 Failed',
    processingTrend: 'down',
    avgCost: formatINR(40250),
    avgCostSub: '+2.5% QoQ',
  },
  'Last Quarter': {
    totalCost: formatCr(50800000),
    totalCostNum: 50800000,
    totalCostSub: '+5.5% QoQ',
    totalCostTrend: 'up',
    netPayable: formatCr(39200000),
    netPayableNum: 39200000,
    activeEmployees: '441',
    activeEmployeesNum: 441,
    activeEmployeesSub: '+14 joined / -6 hold',
    statutory: formatL(9080000),
    statutoryNum: 9080000,
    processingStatus: '1,323 / 1,323',
    processingSub: 'All Disbursed',
    processingTrend: 'up',
    avgCost: formatINR(38426),
    avgCostSub: '+1.9% QoQ',
  },
  'This Year': {
    totalCost: formatCr(214000000),
    totalCostNum: 214000000,
    totalCostSub: '+12.4% YoY',
    totalCostTrend: 'up',
    netPayable: formatCr(165000000),
    netPayableNum: 165000000,
    activeEmployees: '452',
    activeEmployeesNum: 452,
    activeEmployeesSub: '+62 joined / -28 hold',
    statutory: formatCr(38200000),
    statutoryNum: 38200000,
    processingStatus: '5,280 / 5,340',
    processingSub: '50 On Hold, 2 Failed',
    processingTrend: 'down',
    avgCost: formatINR(39500),
    avgCostSub: '+4.2% YoY',
  },
  'Last Year': {
    totalCost: formatCr(191000000),
    totalCostNum: 191000000,
    totalCostSub: '+9.8% YoY',
    totalCostTrend: 'up',
    netPayable: formatCr(147000000),
    netPayableNum: 147000000,
    activeEmployees: '418',
    activeEmployeesNum: 418,
    activeEmployeesSub: '+45 joined / -19 hold',
    statutory: formatCr(34000000),
    statutoryNum: 34000000,
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

  const currentKpiBase = KPI_METRICS_MAP[timeRange] || KPI_METRICS_MAP['This Month'];

  const [selectedBus, setSelectedBus] = useState<string[]>(BUSINESS_UNITS_LIST);
  const currentBuProfile = useMemo(() => getCombinedBuProfile(selectedBus), [selectedBus]);

  const displayKpi = useMemo(() => {
    const base = currentKpiBase;
    if (currentBuProfile.ratio === 1) return base;
    return {
      ...base,
      totalCost: formatCr(Math.round(base.totalCostNum * currentBuProfile.ratio)),
      netPayable: formatCr(Math.round(base.netPayableNum * currentBuProfile.ratio)),
      activeEmployees: `${Math.round(base.activeEmployeesNum * currentBuProfile.ratio)}`,
      statutory: formatL(Math.round(base.statutoryNum * currentBuProfile.ratio)),
    };
  }, [currentKpiBase, currentBuProfile]);

  const currentPayrollCostData = useMemo(() => {
    if (currentBuProfile.ratio === 1) return PAYROLL_COST_TREND;
    return PAYROLL_COST_TREND.map(d => ({
      ...d,
      gross: Math.round(d.gross * currentBuProfile.ratio),
      net: Math.round(d.net * currentBuProfile.ratio),
      employeeDeductions: Math.round(d.employeeDeductions * currentBuProfile.ratio * 10) / 10,
      employerDeductions: Math.round(d.employerDeductions * currentBuProfile.ratio * 10) / 10,
      statutory: Math.round(d.statutory * currentBuProfile.ratio * 10) / 10,
    }));
  }, [currentBuProfile]);

  const [statutoryTimeRange, setStatutoryTimeRange] = useState('This Month');
  const currentStatutoryInfo = STATUTORY_DATA_MAP[statutoryTimeRange] || STATUTORY_DATA_MAP['This Month'];
  const currentStatutoryList = useMemo(() => {
    return STATUTORY_BREAKDOWN.map(s => ({
      ...s,
      employer: s.employer > 0 ? s.employer * currentStatutoryInfo.multiplier * currentBuProfile.ratio : 0,
      employee: s.employee > 0 ? s.employee * currentStatutoryInfo.multiplier * currentBuProfile.ratio : 0,
    }));
  }, [currentStatutoryInfo, currentBuProfile]);

  const [buTimeRange, setBuTimeRange] = useState('This Month');
  const [varPayTimeRange, setVarPayTimeRange] = useState('This Year');
  const [growthTimeRange, setGrowthTimeRange] = useState('This Quarter');
  const [compRangeFilter, setCompRangeFilter] = useState('This Month');
  const [deptCostFilter, setDeptCostFilter] = useState('This Month');
  const [forecastTimeRange, setForecastTimeRange] = useState('Last 6 Months');

  const currentBuData = COST_BY_BU_MAP[buTimeRange] || COST_BY_BU_MAP['This Month'];

  const currentVarPayData = useMemo(() => {
    const raw = getVariablePayData(varPayTimeRange);
    if (currentBuProfile.ratio === 1) return raw;
    return raw.map(d => ({
      ...d,
      variable: Math.round(d.variable * currentBuProfile.ratio * 10) / 10,
    }));
  }, [varPayTimeRange, currentBuProfile]);

  const currentGrowthData = useMemo(() => {
    const raw = getPayrollGrowthData(growthTimeRange);
    if (currentBuProfile.ratio === 1) return raw;
    const pFactor = currentBuProfile.growthPayroll / 18;
    const hFactor = currentBuProfile.growthHeadcount / 11;
    return raw.map(d => ({
      ...d,
      payrollGrowth: Math.round(d.payrollGrowth * pFactor),
      headcountGrowth: Math.round(d.headcountGrowth * hFactor),
    }));
  }, [growthTimeRange, currentBuProfile]);

  const currentTaxDeclarationData = useMemo(() => [
    { name: 'Approved', value: currentBuProfile.taxApprovedPct, count: currentBuProfile.approvedTax, fill: '#10b981' },
    { name: 'Proof Verification Pending', value: currentBuProfile.taxPendingPct, count: currentBuProfile.pendingTax, fill: '#f59e0b' },
    { name: 'Not Yet Submitted', value: currentBuProfile.taxNotSubmittedPct, count: currentBuProfile.notSubmittedTax, fill: '#f43f5e' },
  ], [currentBuProfile]);

  const currentCompData = useMemo(() => {
    const base = CTC_BAND_MAP[compRangeFilter] || CTC_BAND_MAP['This Month'] || CTC_BAND_DISTRIBUTION;
    if (currentBuProfile.ratio === 1) return base;
    return base.map(d => ({
      ...d,
      count: Math.max(1, Math.round(d.count * currentBuProfile.ratio)),
    }));
  }, [compRangeFilter, currentBuProfile]);

  const totalCompEmployees = useMemo(() => {
    return currentCompData.reduce((acc, d) => acc + (d.count || 0), 0);
  }, [currentCompData]);

  const currentDeptHeadcountCost = useMemo(() => {
    const base = DEPT_HEADCOUNT_COST_MAP[deptCostFilter] || DEPT_HEADCOUNT_COST_MAP['This Month'] || DEPT_HEADCOUNT_COST;
    if (currentBuProfile.ratio === 1) return base;
    return base.map(d => ({
      ...d,
      headcount: Math.max(1, Math.round(d.headcount * currentBuProfile.ratio)),
      cost: Math.round(d.cost * currentBuProfile.ratio * 10) / 10,
    }));
  }, [deptCostFilter, currentBuProfile]);

  const currentCostForecastData = useMemo(() => {
    const raw = getCostForecastData(forecastTimeRange);
    if (currentBuProfile.ratio === 1) return raw;
    return raw.map(d => ({
      ...d,
      actual: d.actual != null ? Math.round(d.actual * currentBuProfile.ratio * 10) / 10 : null,
      forecast: d.forecast != null ? Math.round(d.forecast * currentBuProfile.ratio * 10) / 10 : null,
    }));
  }, [forecastTimeRange, currentBuProfile]);

  // TDS Dashboard State
  const [tdsTimeRange, setTdsTimeRange] = useState('This Year');
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const [isTdsReportOpen, setIsTdsReportOpen] = useState(false);

  // Loan & Advance and Expense & Reimb Modals State
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  // Loans & Advances Trend State
  const [loanTimeRange, setLoanTimeRange] = useState('This Year');

  // Expense & Reimbursement Trend State
  const [expenseTimeRange, setExpenseTimeRange] = useState('This Year');
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
      default:
        return [
          { period: 'Period 1', tds: 18.5, employees: 1830, salaryTds: 16.5, perqTds: 2.0, gross: '₹ 1.78 Cr' },
          { period: 'Period 2', tds: 20.2, employees: 1838, salaryTds: 18.2, perqTds: 2.0, gross: '₹ 1.82 Cr' },
          { period: 'Period 3', tds: 22.4, employees: 1842, salaryTds: 20.1, perqTds: 2.3, gross: '₹ 1.85 Cr' },
        ];
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
    const base = EXPENSE_TREND_DATA_MAP[expenseTimeRange] || EXPENSE_TREND_DATA_MAP['This Year'];
    if (currentBuProfile.ratio === 1) return base;
    return base.map(d => ({
      ...d,
      amount: Math.round(d.amount * currentBuProfile.ratio),
      approved: Math.round(d.approved * currentBuProfile.ratio),
      pending: Math.round(d.pending * currentBuProfile.ratio),
      settled: Math.round((d.settled ?? Math.round(d.approved * 0.85)) * currentBuProfile.ratio),
      count: Math.max(1, Math.round(d.count * currentBuProfile.ratio)),
    }));
  }, [expenseTimeRange, currentBuProfile]);

  const maxExpenseAmount = 35000;

  const mostExpensiveMonth = useMemo(() => {
    if (!currentExpenseData || currentExpenseData.length === 0) return { month: '-', amount: 0 };
    return [...currentExpenseData].sort((a, b) => b.amount - a.amount)[0];
  }, [currentExpenseData]);

  const leastExpensiveMonth = useMemo(() => {
    if (!currentExpenseData || currentExpenseData.length === 0) return { month: '-', amount: 0 };
    return [...currentExpenseData].sort((a, b) => a.amount - b.amount)[0];
  }, [currentExpenseData]);

  const currentLoanTrendData = useMemo(() => {
    const base = LOANS_ADVANCES_TREND_MAP[loanTimeRange] || LOANS_ADVANCES_TREND_MAP['This Year'];
    if (currentBuProfile.ratio === 1) return base;
    return base.map(d => ({
      ...d,
      disbursed: Math.round(d.disbursed * currentBuProfile.ratio),
      recovered: Math.round(d.recovered * currentBuProfile.ratio),
      pending: Math.round((d.pending || 0) * currentBuProfile.ratio),
      pendingRequests: Math.max(1, Math.round((d.pendingRequests || 1) * currentBuProfile.ratio)),
      employees: Math.max(1, Math.round(d.employees * currentBuProfile.ratio)),
    }));
  }, [loanTimeRange, currentBuProfile]);

  const totalLoanDisbursed = useMemo(() => {
    return currentLoanTrendData.reduce((acc, d) => acc + d.disbursed, 0);
  }, [currentLoanTrendData]);

  const totalLoanRecovered = useMemo(() => {
    return currentLoanTrendData.reduce((acc, d) => acc + d.recovered, 0);
  }, [currentLoanTrendData]);

  const totalLoanPending = useMemo(() => {
    return currentLoanTrendData.reduce((acc, d) => acc + (d.pending || 0), 0);
  }, [currentLoanTrendData]);

  const totalLoanPendingRequests = useMemo(() => {
    return currentLoanTrendData.reduce((acc, d) => acc + (d.pendingRequests || 0), 0);
  }, [currentLoanTrendData]);

  return (
    <div className="p-4 lg:p-8 w-full space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Payroll Dashboard</h1>
          <p className="text-sm text-slate-500">Company-wide payroll health, compliance, and cost insights</p>
        </div>
        <BusinessUnitDropdown value={selectedBus} onChange={setSelectedBus} />
      </div>

      {/* ===================== SECTION A: Executive Summary KPI Cards ===================== */}
      <div className="bg-white p-5 lg:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        {/* Section Header with Title & Corner Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-800">Payroll Overview</h2>
            <p className="text-xs text-slate-500">Summary of payroll metrics and workforce costs</p>
          </div>

          <DateRangeFilterDropdown value={timeRange} onChange={setTimeRange} />
        </div>

        {/* 4 KPI Cards Grid (Avg Cost / Employee removed) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Total Payroll Cost"
            value={displayKpi.totalCost}
            icon={<Wallet size={18} className="text-indigo-600" />}
            iconBg="bg-indigo-50"
          />
          <KpiCard
            label="Net Payable"
            value={displayKpi.netPayable}
            icon={<Landmark size={18} className="text-emerald-600" />}
            iconBg="bg-emerald-50"
          />
          <KpiCard
            label="Eligible Employees"
            value={displayKpi.activeEmployees}
            sub={currentKpiBase.activeEmployeesSub}
            trend="up"
            icon={<Users size={18} className="text-blue-600" />}
            iconBg="bg-blue-50"
          />
          <KpiCard
            label="Statutory Liability"
            value={displayKpi.statutory}
            icon={<ShieldCheck size={18} className="text-purple-600" />}
            iconBg="bg-purple-50"
          />
        </div>
      </div>

      {/* ===================== SECTION B: CEO / Top Management Strategic Widgets ===================== */}
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
              <ComposedChart data={currentPayrollCostData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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

        <Card
          title="Payroll Growth vs Headcount Growth"
          icon={<TrendingUp size={16} className="text-indigo-600" />}
          action={
            <DateRangeFilterDropdown
              value={growthTimeRange}
              onChange={setGrowthTimeRange}
              presets={['This Quarter', 'Last Quarter', 'This Year', 'Last Year']}
            />
          }
        >
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={currentGrowthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={CHART_TICK} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={CHART_TICK} unit="%" />
                <RechartsTooltip content={<PayrollGrowthTooltip />} wrapperStyle={{ zIndex: 1000, pointerEvents: 'none' }} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="payrollGrowth" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Payroll Growth %" maxBarSize={32} />
                <Bar dataKey="headcountGrowth" fill="#a5b4fc" radius={[4, 4, 0, 0]} name="Headcount Growth %" maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Side-by-Side under Variable Pay Summary: Payroll Run Status & Tax Declaration Submission Funnel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 self-start">
          <Card
            title="Payroll Run Status"
            icon={<CheckCircle2 size={16} className="text-emerald-600" />}
            action={
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                Current Cycle
              </span>
            }
            className="flex flex-col justify-start"
          >
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs text-slate-500 font-semibold pb-1.5 border-b border-slate-100 mb-1">
                <span>Cycle: <strong className="text-slate-800">Nov 2025</strong></span>
                <span className="text-emerald-600 font-bold">{currentBuProfile.processed}/{currentBuProfile.employees} Done</span>
              </div>
              <div className="flex justify-between items-center bg-emerald-50 rounded-lg px-2.5 py-1.5">
                <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5"><CheckCircle2 size={13} /> Processed</span>
                <span className="text-xs font-black text-emerald-800">{currentBuProfile.processed}</span>
              </div>
              <div className="flex justify-between items-center bg-amber-50 rounded-lg px-2.5 py-1.5">
                <span className="text-xs font-bold text-amber-800 flex items-center gap-1.5"><Clock size={13} /> On Hold</span>
                <span className="text-xs font-black text-amber-800">{currentBuProfile.onHold}</span>
              </div>
            </div>
          </Card>

          <Card
            title="Tax Proof Submission Funnel"
            subtitle="(FY 2026-27)"
            icon={<ShieldCheck size={16} className="text-indigo-600" />}
            className="flex flex-col justify-start"
          >
            <div className="flex items-center gap-3 sm:gap-4 my-auto">
              {/* Donut Chart with Center Metric (Left) */}
              <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
                  <span className="text-xs font-black text-slate-800 leading-none">{currentBuProfile.taxApprovedPct}%</span>
                  <span className="text-[7px] font-bold text-emerald-600 uppercase tracking-tight mt-0.5">Approved</span>
                </div>
                <ResponsiveContainer width="100%" height="100%" className="relative z-10">
                  <RechartsPieChart>
                    <Pie
                      data={currentTaxDeclarationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={24}
                      outerRadius={34}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {currentTaxDeclarationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} stroke="#ffffff" strokeWidth={2} />
                      ))}
                    </Pie>
                    <RechartsTooltip content={<TaxDeclarationTooltip />} wrapperStyle={{ zIndex: 1000, pointerEvents: 'none' }} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>

              {/* Status Breakdown (Right) */}
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center justify-between p-1.5 px-2 rounded-lg bg-emerald-50/70 border border-emerald-100">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                    <span className="text-[10px] font-semibold text-slate-700 truncate">Approved</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-bold text-emerald-700">{currentBuProfile.approvedTax}</span>
                    <span className="text-[9px] text-emerald-600 ml-1 font-medium">({currentBuProfile.taxApprovedPct}%)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-1.5 px-2 rounded-lg bg-amber-50/70 border border-amber-100">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                    <span className="text-[10px] font-semibold text-slate-700 truncate" title="Proof Verification Pending">Pending</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-bold text-amber-700">{currentBuProfile.pendingTax}</span>
                    <span className="text-[9px] text-amber-600 ml-1 font-medium">({currentBuProfile.taxPendingPct}%)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-1.5 px-2 rounded-lg bg-rose-50/70 border border-rose-100">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                    <span className="text-[10px] font-semibold text-slate-700 truncate">Not Submitted</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-bold text-rose-700">{currentBuProfile.notSubmittedTax}</span>
                    <span className="text-[9px] text-rose-600 ml-1 font-medium">({currentBuProfile.taxNotSubmittedPct}%)</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right side under Payroll Growth: Statutory Contribution Breakdown */}
        <Card
          title="Statutory Contribution Breakdown"
          icon={<ShieldCheck size={16} className="text-purple-600" />}
          action={<DateRangeFilterDropdown value={statutoryTimeRange} onChange={setStatutoryTimeRange} />}
          className="w-full"
        >
          {/* KPI Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-4">
            <div className="bg-purple-50/70 border border-purple-100 rounded-xl p-3 min-w-0">
              <span className="text-[10px] xl:text-[11px] font-bold text-purple-700 uppercase tracking-tight block truncate" title="Total Statutory Compliance">Total Statutory Compliance</span>
              <p className="text-base xl:text-lg font-black text-purple-950 mt-0.5">{formatL(Math.round(currentStatutoryInfo.totalCompliance * currentBuProfile.ratio))}</p>
            </div>
            <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3 min-w-0">
              <span className="text-[10px] xl:text-[11px] font-bold text-indigo-700 uppercase tracking-tight block truncate" title="Employer Contribution">Employer Contribution</span>
              <p className="text-base xl:text-lg font-black text-indigo-950 mt-0.5">{formatL(Math.round(currentStatutoryInfo.employerContrib * currentBuProfile.ratio))}</p>
            </div>
            <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-3 min-w-0">
              <span className="text-[10px] xl:text-[11px] font-bold text-emerald-700 uppercase tracking-tight block truncate" title="Employee Contribution">Employee Contribution</span>
              <p className="text-base xl:text-lg font-black text-emerald-950 mt-0.5">{formatL(Math.round(currentStatutoryInfo.employeeContrib * currentBuProfile.ratio))}</p>
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
                {currentStatutoryList.map(s => (
                  <tr key={s.name} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5 px-3 sm:px-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.fill }}></span>
                        <span className="font-bold text-slate-800">{s.name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 sm:px-4 text-right font-semibold text-slate-700">
                      {s.employer > 0 ? formatL(s.employer * 100000) : '-'}
                    </td>
                    <td className="py-2.5 px-3 sm:px-4 text-right font-semibold text-slate-700">
                      {s.employee > 0 ? formatL(s.employee * 100000) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* ===================== SECTION E: Distribution & Composition ===================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        <Card
          title="Compensation Range Distribution"
          icon={<Users size={16} className="text-indigo-600" />}
          action={
            <div className="flex items-center gap-2 flex-wrap justify-end">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-50/80 border border-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold whitespace-nowrap shadow-2xs">
                <Users size={12} className="text-indigo-600 shrink-0" />
                <span>Total Employees: <strong className="font-extrabold text-indigo-950">{totalCompEmployees}</strong></span>
              </span>
              <DateRangeFilterDropdown value={compRangeFilter} onChange={setCompRangeFilter} />
            </div>
          }
        >
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={currentCompData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="band" axisLine={false} tickLine={false} tick={CHART_TICK} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={CHART_TICK} allowDecimals={false} />
                <RechartsTooltip content={<CompensationRangeTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Employees" maxBarSize={40} />
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
                <Bar dataKey="cost" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Total Cost" maxBarSize={40} />
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
        <Card
          title="Payroll Cost Projection"
          icon={<TrendingUp size={16} className="text-indigo-600" />}
          action={
            <DateRangeFilterDropdown
              value={forecastTimeRange}
              onChange={setForecastTimeRange}
              presets={['Last 6 Months', 'Last 12 Months', 'This Year', 'Last Year']}
            />
          }
        >
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={currentCostForecastData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={CHART_TICK} dy={10} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={CHART_TICK}
                  tickFormatter={(v: any) => formatLakhValueAsINR(v)}
                  domain={['auto', 'auto']}
                  width={95}
                />
                <RechartsTooltip content={<CostForecastTooltip />} />
                <Legend
                  verticalAlign="top"
                  height={28}
                  formatter={(value: string) => <span style={{ color: '#475569', fontSize: 12, fontWeight: 600 }}>{value}</span>}
                />
                {(() => {
                  const bridgeMonth = currentCostForecastData.find((d: any) => d.actual != null && d.forecast != null)?.month;
                  return bridgeMonth ? (
                    <ReferenceLine
                      x={bridgeMonth}
                      stroke="#cbd5e1"
                      strokeDasharray="4 4"
                      label={{ value: 'Today', position: 'insideTopRight', fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                    />
                  ) : null;
                })()}
                <Line type="monotone" dataKey="actual" stroke="#4f46e5" strokeWidth={2.5} dot={{ r: 4 }} connectNulls name="Actual" />
                <Line type="monotone" dataKey="forecast" stroke="#a5b4fc" strokeWidth={2.5} strokeDasharray="5 4" dot={{ r: 4 }} connectNulls name="Forecast" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-slate-400 mt-3 text-center">Based on confirmed increments, new joiners, and exits</p>
        </Card>
      </div>

      {/* 2-Column Grid: TDS Deductions & Expense Reimbursement Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6 items-start">
        {/* Left Column: TDS Deductions Over Time */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 self-start">
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

            <DateRangeFilterDropdown
              value={tdsTimeRange}
              onChange={setTdsTimeRange}
              presets={['This Quarter', 'Last Quarter', 'This Year', 'Last Year']}
            />
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between">
              <div className="min-w-0 pr-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight truncate">Total TDS</p>
                <p className="text-sm xl:text-base font-bold text-slate-800 mt-0.5 truncate">
                  ₹ {Math.round(tdsGraphData.reduce((acc, curr) => acc + curr.tds, 0) * 100000).toLocaleString('en-IN')}
                </p>
              </div>
            </div>

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

            <DateRangeFilterDropdown value={expenseTimeRange} onChange={setExpenseTimeRange} />
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

          {/* Claim Lifecycle Pipeline (Added above graph and below 2 KPI cards) */}
          <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-slate-600">Claim Lifecycle Pipeline</span>
            </div>

            {/* Multi-segment progress bar visually distinguishing stages */}
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden flex">
              {/* Pending Approval: ~12% */}
              <div className="bg-amber-400 h-full" style={{ width: '12%' }} title="Pending Approval: ₹1,86,000 (23 claims)" />
              {/* Approved & Unpaid: ~18% */}
              <div className="bg-blue-500 h-full" style={{ width: '18%' }} title="Approved & Unpaid: ₹4,12,000 (14 claims)" />
              {/* Settled: ~70% */}
              <div className="bg-emerald-500 h-full" style={{ width: '70%' }} title="Settled: ₹18,40,000 (112 claims)" />
            </div>

            {/* Stage indicators */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span className="text-slate-600">Pending Approval:</span>
                <span className="font-bold text-amber-800">₹1,86,000</span>
                <span className="text-slate-400 text-[10px]">(23)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span className="text-slate-600">Approved & Unpaid:</span>
                <span className="font-bold text-blue-800">₹4,12,000</span>
                <span className="text-slate-400 text-[10px]">(14)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="text-slate-600">Settled:</span>
                <span className="font-bold text-emerald-700">₹18,40,000</span>
                <span className="text-slate-400 text-[10px]">(112)</span>
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
                    {(() => {
                      const item = currentExpenseData[hoveredExpenseIndex];
                      const approvedVal = item.approved ?? Math.round(item.amount * 0.8);
                      const pendingVal = item.pending ?? Math.round(item.amount * 0.2);
                      const settledVal = item.settled ?? Math.round(approvedVal * 0.85);
                      const totalStatusVal = approvedVal + pendingVal + settledVal;

                      return (
                        <div className="space-y-1.5 text-[11px]">
                          <div className="flex justify-between text-slate-300 gap-3">
                            <span className="flex items-center gap-1.5 text-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                              Approved:
                            </span>
                            <span className="font-semibold text-emerald-400">
                              ₹ {approvedVal.toLocaleString('en-IN')}
                            </span>
                          </div>
                          <div className="flex justify-between text-slate-300 gap-3">
                            <span className="flex items-center gap-1.5 text-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                              Pending:
                            </span>
                            <span className="font-semibold text-amber-300">
                              ₹ {pendingVal.toLocaleString('en-IN')}
                            </span>
                          </div>
                          <div className="flex justify-between text-slate-300 gap-3">
                            <span className="flex items-center gap-1.5 text-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                              Settled:
                            </span>
                            <span className="font-semibold text-teal-300">
                              ₹ {settledVal.toLocaleString('en-IN')}
                            </span>
                          </div>
                          <div className="flex justify-between text-slate-200 pt-1.5 border-t border-slate-700/80 gap-3 font-semibold">
                            <span className="flex items-center gap-1.5 text-slate-200 font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                              Total:
                            </span>
                            <span className="font-extrabold text-white">
                              ₹ {totalStatusVal.toLocaleString('en-IN')}
                            </span>
                          </div>
                          <div className="flex justify-between text-slate-400 pt-1.5 border-t border-slate-700/80 gap-3">
                            <span>Employees:</span>
                            <span className="font-semibold text-slate-200">
                              {item.count}
                            </span>
                          </div>
                        </div>
                      );
                    })()}
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

      {/* ===================== Loans & Advances Summary (Comprehensive KPI Card) ===================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        {/* Section: Loans & Advances Summary */}
        <div className="bg-white p-5 lg:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between">
          {/* Card Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl border border-blue-100 shadow-2xs">
                <Landmark size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base leading-tight">Loans & Advances Summary</h3>
              </div>
            </div>

            <DateRangeFilterDropdown value={loanTimeRange} onChange={setLoanTimeRange} />
          </div>

          {/* Primary Hero Section: Total Outstanding & Upcoming Payroll Deduction */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-stretch">
            {/* Left: Total Outstanding (Col 7) */}
            <div className="sm:col-span-7 bg-gradient-to-br from-slate-50 to-blue-50/30 border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Outstanding</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded-md shadow-2xs">
                    <Users size={12} className="text-slate-500" />
                    37 employees
                  </span>
                </div>
                <p className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">₹48,20,000</p>
              </div>

              {/* Secondary breakdown embedded inside */}
              <div className="pt-3 mt-3 border-t border-slate-200/60 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] font-medium text-slate-400 block truncate">Active Loans</span>
                  <span className="font-bold text-slate-800 text-xs sm:text-sm">₹38,70,000</span>
                  <span className="text-[10px] text-slate-400 ml-1">(24 emp)</span>
                </div>
                <div className="border-l border-slate-200/60 pl-2.5">
                  <span className="text-[10px] font-medium text-slate-400 block truncate">Salary Advances</span>
                  <span className="font-bold text-slate-800 text-xs sm:text-sm">₹9,50,000</span>
                  <span className="text-[10px] text-slate-400 ml-1">(13 emp)</span>
                </div>
              </div>
            </div>

            {/* Right: Upcoming Payroll Deduction (Col 5) */}
            <div className="sm:col-span-5 bg-blue-50/60 border border-blue-100 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Upcoming Payroll Deduction</span>
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                </div>
                <p className="text-xl lg:text-2xl font-black text-blue-950 tracking-tight">₹3,85,000</p>
                <p className="text-xs font-bold text-blue-600 mt-1">Nov 2025</p>
              </div>
            </div>
          </div>


          {/* Summary KPI Cards: Total Disbursed, Total Recovered, Net Change */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between">
              <div className="min-w-0 pr-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight truncate">Total Disbursed</p>
                <p className="text-sm xl:text-base font-bold text-slate-800 mt-0.5 truncate">
                  {formatINR(totalLoanDisbursed)}
                </p>
              </div>
              <div className="h-8 w-8 shrink-0 rounded-full bg-white border border-slate-200 flex items-center justify-center text-indigo-600 shadow-xs">
                <ArrowUpRight size={15} />
              </div>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between">
              <div className="min-w-0 pr-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight truncate">Total Recovered</p>
                <p className="text-sm xl:text-base font-bold text-slate-800 mt-0.5 truncate">
                  {formatINR(totalLoanRecovered)}
                </p>
              </div>
              <div className="h-8 w-8 shrink-0 rounded-full bg-white border border-slate-200 flex items-center justify-center text-emerald-600 shadow-xs">
                <CheckCircle2 size={15} />
              </div>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between">
              <div className="min-w-0 pr-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight truncate">Pending Approval</p>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <p className="text-sm xl:text-base font-bold text-amber-600 truncate">
                    {formatINR(totalLoanPending)}
                  </p>
                </div>
                <p className="text-[10px] font-medium text-slate-500 mt-0.5 truncate">
                  ({totalLoanPendingRequests} {totalLoanPendingRequests === 1 ? 'request' : 'requests'})
                </p>
              </div>
              <div className="h-8 w-8 shrink-0 rounded-full bg-white border border-slate-200 flex items-center justify-center text-amber-600 shadow-xs">
                <Clock size={15} />
              </div>
            </div>
          </div>

          {/* Stacked Bar Chart: Disbursed & Recovered Trend */}
          <div className="w-full bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <span className="text-xs font-bold text-slate-700">Disbursed vs Recovered Trend</span>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#4f46e5]"></span>
                  Disbursed
                </span>
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#10b981]"></span>
                  Recovered
                </span>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={currentLoanTrendData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={CHART_TICK} dy={10} />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={CHART_TICK}
                    tickFormatter={(v: any) => v >= 100000 ? `₹${(v / 100000).toFixed(v % 100000 === 0 ? 0 : 1)}L` : `₹${v}`}
                    width={70}
                  />
                  <RechartsTooltip content={<LoansAdvancesTooltip />} cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="recovered" stackId="loans" fill="#10b981" name="Total Recovered" maxBarSize={32} />
                  <Bar dataKey="disbursed" stackId="loans" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Total Disbursed" maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* TDS Full Report Modal */}
      {isTdsReportOpen && (
        <TdsFullReportModal onClose={() => setIsTdsReportOpen(false)} data={tdsGraphData} />
      )}

      {/* Loan & Advance Details Modal */}
      {isLoanModalOpen && (
        <LoanAdvanceDetailsModal onClose={() => setIsLoanModalOpen(false)} />
      )}

      {/* Expense & Reimbursement Details Modal */}
      {isExpenseModalOpen && (
        <ExpenseReimbDetailsModal onClose={() => setIsExpenseModalOpen(false)} />
      )}
    </div>
  );
};

export default PayrollDashboardNew;

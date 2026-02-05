
import React from 'react';

export type UserRole = 'SUPER_ADMIN' | 'HR_MANAGER' | 'EMPLOYEE';

export interface Company {
  id: string;
  name: string;
  plan: 'Basic' | 'Pro' | 'Enterprise';
  employees: number;
  status: 'Active' | 'Pending' | 'Suspended';
  lastAudit: string;
  location?: string;
  lastPayrollRun?: string;
  industry?: string;
  logoUrl?: string;
}

export interface StatAction {
  label: string;
  onClick: () => void;
}

export interface StatMetric {
  title: string;
  value: string;
  trend: string;
  trendUp: boolean;
  icon: React.ReactNode;
  colorClass: string;
  onClick?: () => void;
  onInfoClick?: () => void;
  actions?: StatAction[];
  extraDetails?: { label: string; value: string; color?: string }[];
}

export interface AuditLog {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  severity: 'Low' | 'Medium' | 'High';
}

export enum ViewState {
  // Super Admin Views
  DASHBOARD = 'DASHBOARD',
  PAYROLL = 'PAYROLL',
  TAX = 'TAX',
  SALARY = 'SALARY',
  SALARY_STRUCTURE = 'SALARY_STRUCTURE',
  TEMPLATE_SETUP = 'TEMPLATE_SETUP',
  CLIENTS = 'CLIENTS',
  SETTINGS = 'SETTINGS',

  // HR Manager Views
  HR_DASHBOARD = 'HR_DASHBOARD',
  HR_EMPLOYEES = 'HR_EMPLOYEES',
  HR_ATTENDANCE = 'HR_ATTENDANCE',
  HR_LEAVES = 'HR_LEAVES',
  HR_PAYROLL_RUN = 'HR_PAYROLL_RUN',
  PAYROLL_APPROVAL = 'PAYROLL_APPROVAL',
  HR_DOCUMENTS = 'HR_DOCUMENTS',
  TAX_DECLARATIONS = 'TAX_DECLARATIONS',
  HR_EXPENSES = 'HR_EXPENSES',
  LOANS_ADVANCES = 'LOANS_ADVANCES',
  HR_SALARY_COMPONENTS = 'HR_SALARY_COMPONENTS',

  // Employee Views
  EMP_OVERVIEW = 'EMP_OVERVIEW',
  EMP_PAYROLL_CORNER = 'EMP_PAYROLL_CORNER', // Retained for backward compatibility/default
  EMP_PAYSLIPS = 'EMP_PAYSLIPS',
  EMP_TAX_PLANNING = 'EMP_TAX_PLANNING',
  EMP_SALARY_BREAKDOWN = 'EMP_SALARY_BREAKDOWN',
  EMP_REIMBURSEMENTS = 'EMP_REIMBURSEMENTS',
  EMP_TAX_DOCUMENTS = 'EMP_TAX_DOCUMENTS',
}

export interface ApprovalItem {
  id: string;
  employeeName: string;
  companyName: string;
  type: 'Investment Declaration' | 'Reimbursement Claim' | 'Tax Regime Change' | 'Bank Details Update';
  submittedTime: string;
  amount?: string;
  details: string;
  avatarUrl?: string;
}

export interface Employee {
  id: string;
  name: string;
  eid: string;
  company: string;
  department: string;
  location: string;
  ctc: string;
  joinDate: string;
  status: 'Active' | 'New Joinee' | 'On Notice' | 'Relieved';
  avatarUrl: string;
}

export interface StatutoryReport {
  id: string;
  companyName: string;
  reportType: string;
  dueDate: string;
  daysRemaining: number;
  status: 'Critical' | 'Due Soon' | 'Upcoming' | 'Safe';
  category: 'TDS' | 'PF' | 'ESI' | 'PT';
  logoUrl?: string;
}

export interface DeclarationProof {
  id: string;
  fileName: string;
  fileType: 'pdf' | 'jpg' | 'png';
  size: string;
}

export interface TaxDeclaration {
  id: string;
  employeeName: string;
  employeeId: string;
  avatarUrl: string;
  type: '80C' | '80D' | 'HRA' | '80CCD' | '80G' | 'Others';
  typeLabel: string;
  amount: number;
  submittedDate: string;
  proofs: DeclarationProof[];
  status: 'Pending' | 'Approved' | 'Rejected';
  notes: string;
  ctc: string;
  regime: 'Old' | 'New';
  breakdown: { label: string; amount: number }[];
}

export enum AppStep {
  DASHBOARD = 'DASHBOARD',
  SECTION_HRA = 'SECTION_HRA',
  SUCCESS = 'SUCCESS'
}

export enum TaxRegime {
  OLD = 'Old',
  NEW = 'New'
}

export enum ReimbursementCategory {
  TRAVEL = 'Travel',
  MEAL = 'Meal',
  MOBILE = 'Mobile',
  BROADBAND = 'Broadband',
  LEARNING = 'Learning',
  OTHER = 'Other'
}

export type ClaimStatus = 'pending' | 'approved' | 'rejected' | 'settled' | 'action_required' | 'draft';

export interface WalletMetric {
  entitlement: number;
  utilized: number;
  pending: number;
  lapse: number;
}

export interface BudgetCategory {
  category: ReimbursementCategory;
  limit: number;
  utilized: number;
}

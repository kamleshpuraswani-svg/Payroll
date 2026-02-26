
import React from 'react';

export type UserRole = 'SUPER_ADMIN' | 'HR_MANAGER' | 'EMPLOYEE';

export interface Company {
  id: string;
  name: string;
  plan: 'Basic' | 'Pro' | 'Enterprise';
  employees: number;
  status: 'Active' | 'Pending' | 'Suspended';
  last_audit: string;
  location?: string;
  business_unit?: string;
  last_payroll_run?: string;
  industry?: string;
  logo_url?: string;
}

export interface StatAction {
  label: string;
  onClick: () => void;
}

export interface StatMetric {
  title: string;
  value: string;
  trend: string;
  trend_up: boolean;
  icon: React.ReactNode;
  color_class: string;
  onClick?: () => void;
  on_info_click?: () => void;
  actions?: StatAction[];
  extra_details?: { label: string; value: string; color?: string }[];
  details_at_top?: boolean;
}

export interface AuditLog {
  id: string;
  action: string;
  user_name: string;
  timestamp: string;
  severity: 'Low' | 'Medium' | 'High';
}

export enum ViewState {
  // Super Admin Views
  DASHBOARD = 'DASHBOARD',
  CUSTOMERS = 'CUSTOMERS',
  SUPPORT_TICKETS = 'SUPPORT_TICKETS',
  SCHEDULERS = 'SCHEDULERS',
  PORTAL_DATA = 'PORTAL_DATA',
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
  HR_OPERATIONAL_CONFIG = 'HR_OPERATIONAL_CONFIG',

  // Employee Views
  EMP_OVERVIEW = 'EMP_OVERVIEW',
  EMP_PAYROLL_CORNER = 'EMP_PAYROLL_CORNER', // Retained for backward compatibility/default
  EMP_PAYSLIPS = 'EMP_PAYSLIPS',
  EMP_TAX_PLANNING = 'EMP_TAX_PLANNING',
  EMP_SALARY_BREAKDOWN = 'EMP_SALARY_BREAKDOWN',
  EMP_REIMBURSEMENTS = 'EMP_REIMBURSEMENTS',
  EMP_TAX_DOCUMENTS = 'EMP_TAX_DOCUMENTS',
  EMP_LOANS_ADVANCES = 'EMP_LOANS_ADVANCES',
}

export interface ApprovalItem {
  id: string;
  employee_name: string;
  company_name: string;
  type: 'Investment Declaration' | 'Reimbursement Claim' | 'Tax Regime Change' | 'Bank Details Update';
  submitted_time: string;
  amount?: string;
  details: string;
  avatar_url?: string;
}

export interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  employee_id: string;
  company_id: string;
  department: string;
  designation?: string;
  location?: string;
  business_unit?: string;
  ctc: string | number;
  date_of_joining: string;
  status: 'Active' | 'New Joinee' | 'On Notice' | 'Relieved';
  avatar_url?: string;
  email: string;
}

export interface StatutoryReport {
  id: string;
  company_name: string;
  report_type: string;
  due_date: string;
  days_remaining: number;
  status: 'Critical' | 'Due Soon' | 'Upcoming' | 'Safe';
  category: 'TDS' | 'PF' | 'ESI' | 'PT';
  logo_url?: string;
}

export interface DeclarationProof {
  id: string;
  file_name: string;
  file_type: 'pdf' | 'jpg' | 'png';
  size: string;
}

export interface TaxDeclaration {
  id: string;
  employee_name: string;
  employee_id: string;
  avatar_url: string;
  type: '80C' | '80D' | 'HRA' | '80CCD' | '80G' | 'Others';
  type_label: string;
  amount: number;
  submitted_date: string;
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

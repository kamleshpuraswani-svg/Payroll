
import React, { useState } from 'react';
import { Dashboard } from './reimbursements/Dashboard';
import { ClaimWizard } from './reimbursements/ClaimWizard';
import { ReimbursementCategory, ClaimStatus, WalletMetric, BudgetCategory } from '../types';

interface ApprovalLog {
    date: string;
    actor: string;
    action: string;
    comment?: string;
}

interface ClaimReport {
  id: string;
  name: string;
  otherType?: string;
  category: ReimbursementCategory;
  status: ClaimStatus;
  items: any[];
  submittedAt: string;
  createdAt?: string;
  settledDate?: string;
  approvalHistory?: ApprovalLog[];
  actionNote?: string;
}

export const ReimbursementModule: React.FC = () => {
  const [view, setView] = useState<'DASHBOARD' | 'WIZARD'>('DASHBOARD');
  const [editingClaim, setEditingClaim] = useState<ClaimReport | null>(null);
  const [isReadOnly, setIsReadOnly] = useState(false);
  
  const [claims, setClaims] = useState<ClaimReport[]>([
    {
      id: 'CLM-01',
      name: 'Strategy Offsite - Bangalore',
      category: ReimbursementCategory.TRAVEL,
      status: 'action_required',
      submittedAt: '2025-11-15',
      createdAt: '2025-11-15 09:30 AM',
      actionNote: 'The receipt for the Indigo flight (Item #1) appears to be blurred. Please upload a clear PDF or image of the original tax invoice to proceed with approval.',
      items: [
        { id: '1', merchant: 'Indigo', amount: 8500, date: '2025-11-10', hasReceipt: true },
        { id: '2', merchant: 'Marriott', amount: 15400, date: '2025-11-12', hasReceipt: false }
      ],
      approvalHistory: [
        { date: '2025-11-15 09:30 AM', actor: 'You', action: 'Submitted', comment: '' },
        { date: '2025-11-16 10:00 AM', actor: 'System', action: 'Flagged', comment: 'Missing receipt for item #2' }
      ]
    },
    {
      id: 'CLM-02',
      name: 'Monthly Meal Allowance',
      category: ReimbursementCategory.MEAL,
      status: 'pending',
      submittedAt: '2025-12-05',
      createdAt: '2025-12-05 06:15 PM',
      items: [{ id: '3', merchant: 'Zomato/Company', amount: 2500, date: '2025-12-01', hasReceipt: true }],
      approvalHistory: [
         { date: '2025-12-05 06:15 PM', actor: 'You', action: 'Submitted', comment: '' },
         { date: '2025-12-06 09:00 AM', actor: 'Manager (Amit Verma)', action: 'Forwarded for Review', comment: '' }
      ]
    },
    {
      id: 'CLM-03',
      name: 'Office Broadband - Q3',
      category: ReimbursementCategory.BROADBAND,
      status: 'settled',
      submittedAt: '2025-10-10',
      createdAt: '2025-10-10 10:00 AM',
      settledDate: 'Oct 2025 Payroll',
      items: [{ id: '4', merchant: 'Airtel Fiber', amount: 4500, date: '2025-10-01', hasReceipt: true }],
      approvalHistory: [
         { date: '2025-10-10 10:00 AM', actor: 'You', action: 'Submitted', comment: '' },
         { date: '2025-10-12 02:30 PM', actor: 'Manager (Amit)', action: 'Approved', comment: 'Within limits' },
         { date: '2025-10-25 11:00 AM', actor: 'Finance', action: 'Settled', comment: 'Processed in Oct Payroll' }
      ]
    },
    {
      id: 'CLM-04',
      name: 'Client Visit - Mumbai',
      category: ReimbursementCategory.TRAVEL,
      status: 'settled',
      submittedAt: '2025-09-20',
      createdAt: '2025-09-20 08:45 AM',
      settledDate: 'Sep 2025 Payroll',
      items: [
        { id: '5', merchant: 'Uber', amount: 1200, date: '2025-09-18', hasReceipt: true },
        { id: '6', merchant: 'Taj Lands End', amount: 18000, date: '2025-09-19', hasReceipt: true }
      ],
      approvalHistory: [
         { date: '2025-09-20 08:45 AM', actor: 'You', action: 'Submitted', comment: '' },
         { date: '2025-09-21 10:00 AM', actor: 'Manager (Amit)', action: 'Approved', comment: '' },
         { date: '2025-09-28 04:00 PM', actor: 'Finance', action: 'Settled', comment: '' }
      ]
    },
    {
      id: 'CLM-05',
      name: 'Learning Course - React Advanced',
      category: ReimbursementCategory.LEARNING,
      status: 'settled',
      submittedAt: '2025-08-15',
      createdAt: '2025-08-15 02:00 PM',
      settledDate: 'Aug 2025 Payroll',
      items: [{ id: '7', merchant: 'Udemy', amount: 3500, date: '2025-08-10', hasReceipt: true }],
      approvalHistory: [
          { date: '2025-08-15 02:00 PM', actor: 'You', action: 'Submitted', comment: '' },
          { date: '2025-08-16 11:30 AM', actor: 'Manager (Amit)', action: 'Approved', comment: 'Good initiative' },
          { date: '2025-08-25 10:00 AM', actor: 'Finance', action: 'Settled', comment: '' }
      ]
    },
    {
      id: 'CLM-06',
      name: 'Team Lunch - Q2',
      category: ReimbursementCategory.MEAL,
      status: 'settled',
      submittedAt: '2025-07-05',
      createdAt: '2025-07-05 01:30 PM',
      settledDate: 'Jul 2025 Payroll',
      items: [{ id: '8', merchant: 'Barbeque Nation', amount: 8400, date: '2025-07-01', hasReceipt: true }],
      approvalHistory: [
          { date: '2025-07-05 01:30 PM', actor: 'You', action: 'Submitted', comment: '' },
          { date: '2025-07-06 09:15 AM', actor: 'Manager (Amit)', action: 'Approved', comment: '' },
          { date: '2025-07-25 03:00 PM', actor: 'Finance', action: 'Settled', comment: '' }
      ]
    },
    {
      id: 'CLM-07',
      name: 'Mobile Bill Reimbursement',
      category: ReimbursementCategory.MOBILE,
      status: 'settled',
      submittedAt: '2025-06-10',
      createdAt: '2025-06-10 11:00 AM',
      settledDate: 'Jun 2025 Payroll',
      items: [{ id: '9', merchant: 'Jio Postpaid', amount: 1200, date: '2025-06-01', hasReceipt: true }],
      approvalHistory: [
          { date: '2025-06-10 11:00 AM', actor: 'You', action: 'Submitted', comment: '' },
          { date: '2025-06-25 10:00 AM', actor: 'Finance', action: 'Settled', comment: '' }
      ]
    }
  ]);

  const wallet: WalletMetric = {
    entitlement: 250000,
    utilized: 45000,
    pending: 12500,
    lapse: 0,
  };

  const budgets: BudgetCategory[] = [
    { category: ReimbursementCategory.TRAVEL, limit: 120000, utilized: 35000 },
    { category: ReimbursementCategory.MEAL, limit: 36000, utilized: 12000 },
    { category: ReimbursementCategory.MOBILE, limit: 12000, utilized: 4500 },
    { category: ReimbursementCategory.BROADBAND, limit: 12000, utilized: 3000 },
    { category: ReimbursementCategory.LEARNING, limit: 45000, utilized: 15000 },
    { category: ReimbursementCategory.OTHER, limit: 25000, utilized: 0 },
  ];

  const handleUpsertClaim = (claim: any) => {
    setClaims(prev => {
      const exists = prev.find(c => c.id === claim.id);
      if (exists) return prev.map(c => c.id === claim.id ? claim : c);
      return [claim, ...prev];
    });
    setView('DASHBOARD');
    setEditingClaim(null);
  };

  return (
    <div className="h-full">
      {view === 'DASHBOARD' ? (
        <Dashboard 
          wallet={wallet} 
          budgets={budgets}
          claims={claims}
          onNewClaim={() => { setEditingClaim(null); setIsReadOnly(false); setView('WIZARD'); }}
          onEditClaim={(c: any) => { setEditingClaim(c); setIsReadOnly(false); setView('WIZARD'); }}
          onViewClaim={(c: any) => { setEditingClaim(c); setIsReadOnly(true); setView('WIZARD'); }}
        />
      ) : (
        <ClaimWizard 
          initialData={editingClaim}
          readOnly={isReadOnly}
          onCancel={() => { setView('DASHBOARD'); setEditingClaim(null); }}
          onSubmit={handleUpsertClaim}
          onEdit={() => setIsReadOnly(false)}
        />
      )}
    </div>
  );
};

export default ReimbursementModule;

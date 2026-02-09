
import React, { useState, useMemo } from 'react';
import { Users, MessageSquare, Calendar, Database } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import HRDashboard from './components/HRDashboard';
import Workforce from './components/Workforce';
import DocumentsManager from './components/DocumentsManager';
import TaxDeclarationsManagement from './components/TaxDeclarationsManagement';
import PayrollManager from './components/PayrollManager';
import PayrollApprovalRequests from './components/PayrollApprovalRequests';
import ExpenseManagement from './components/ExpenseManagement';
import LoansAdvances from './components/LoansAdvances';
import AiAssistant from './components/AiAssistant';
import PayrollSettings from './components/PayrollSettings';
import TaxConfiguration from './components/TaxConfiguration';
import SalaryComponents from './components/SalaryComponents';
import TemplateSetup from './components/TemplateSetup';
import GlobalSettings from './components/GlobalSettings';
import PayrollCorner from './components/PayrollCorner';
import Overview from './components/Overview';

// New Component Imports
import TaxPlanning from './components/TaxPlanning';
import Reimbursements from './components/Reimbursements';
import Payslips from './components/Payslips';
import SalaryBreakdown from './components/SalaryBreakdown';
import TaxDocuments from './components/TaxDocuments';

import { ViewState, UserRole } from './types';
import { MOCK_COMPANIES, MOCK_AUDIT_LOGS } from './constants';

const App: React.FC = () => {
  const [userRole, setUserRole] = useState<UserRole>('SUPER_ADMIN');
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleRoleSwitch = (role: UserRole) => {
    setUserRole(role);
    // Reset view to appropriate dashboard when switching roles
    if (role === 'SUPER_ADMIN') setCurrentView(ViewState.DASHBOARD);
    else if (role === 'HR_MANAGER') setCurrentView(ViewState.HR_DASHBOARD);
    else setCurrentView(ViewState.EMP_OVERVIEW);
  };

  // Serialize current state for AI Context
  const contextData = useMemo(() => {
    return JSON.stringify({
      userRole,
      activeView: currentView,
      companiesSummary: MOCK_COMPANIES.map(c => `${c.name} (${c.status})`),
      recentLogs: MOCK_AUDIT_LOGS.map(l => `${l.action} by ${l.user}`)
    });
  }, [currentView, userRole]);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar
        currentView={currentView}
        onChangeView={setCurrentView}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        userRole={userRole}
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <Header
          toggleSidebar={toggleSidebar}
          onAiClick={() => setIsAiModalOpen(true)}
          userRole={userRole}
          onRoleSwitch={handleRoleSwitch}
        />

        <div className="flex-1 overflow-y-auto scroll-smooth">

          {/* SUPER ADMIN ROUTES */}
          {userRole === 'SUPER_ADMIN' && (
            <>
              {currentView === ViewState.DASHBOARD && <Dashboard companies={MOCK_COMPANIES} auditLogs={MOCK_AUDIT_LOGS} />}
              {currentView === ViewState.PAYROLL && <PayrollSettings />}
              {currentView === ViewState.TAX && <TaxConfiguration />}
              {currentView === ViewState.SALARY && <SalaryComponents />}
              {currentView === ViewState.TEMPLATE_SETUP && <TemplateSetup />}
              {currentView === ViewState.CUSTOMERS && (
                <div className="p-10 flex flex-col items-center justify-center h-full text-slate-400">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <Users size={32} />
                  </div>
                  <h2 className="text-xl font-bold text-slate-600">Customers Management</h2>
                  <p>This module is under development.</p>
                </div>
              )}
              {currentView === ViewState.SUPPORT_TICKETS && (
                <div className="p-10 flex flex-col items-center justify-center h-full text-slate-400">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <MessageSquare size={32} />
                  </div>
                  <h2 className="text-xl font-bold text-slate-600">Support Tickets</h2>
                  <p>This module is under development.</p>
                </div>
              )}
              {currentView === ViewState.SCHEDULERS && (
                <div className="p-10 flex flex-col items-center justify-center h-full text-slate-400">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <Calendar size={32} />
                  </div>
                  <h2 className="text-xl font-bold text-slate-600">Schedulers</h2>
                  <p>This module is under development.</p>
                </div>
              )}
              {currentView === ViewState.PORTAL_DATA && (
                <div className="p-10 flex flex-col items-center justify-center h-full text-slate-400">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <Database size={32} />
                  </div>
                  <h2 className="text-xl font-bold text-slate-600">Portal Data</h2>
                  <p>This module is under development.</p>
                </div>
              )}
            </>
          )}

          {/* HR MANAGER ROUTES */}
          {userRole === 'HR_MANAGER' && (
            <>
              {currentView === ViewState.HR_DASHBOARD && <HRDashboard />}
              {currentView === ViewState.HR_EMPLOYEES && <Workforce />}
              {currentView === ViewState.TAX_DECLARATIONS && <TaxDeclarationsManagement />}
              {currentView === ViewState.HR_PAYROLL_RUN && <PayrollManager />}
              {currentView === ViewState.PAYROLL_APPROVAL && <PayrollApprovalRequests />}
              {currentView === ViewState.HR_DOCUMENTS && <DocumentsManager />}
              {currentView === ViewState.HR_EXPENSES && <ExpenseManagement />}
              {currentView === ViewState.LOANS_ADVANCES && <LoansAdvances />}
              {currentView === ViewState.HR_SALARY_COMPONENTS && <SalaryComponents />}
              {currentView === ViewState.SETTINGS && <GlobalSettings />}
            </>
          )}

          {/* EMPLOYEE ROUTES */}
          {userRole === 'EMPLOYEE' && (
            <div className="p-6 h-full">
              {currentView === ViewState.EMP_OVERVIEW && (
                <Overview
                  onNavigateToTaxPlanning={() => setCurrentView(ViewState.EMP_TAX_PLANNING)}
                  onNavigateToReimbursements={() => setCurrentView(ViewState.EMP_REIMBURSEMENTS)}
                />
              )}
              {currentView === ViewState.EMP_PAYROLL_CORNER && (
                // Default or Fallback view if user lands on parent
                <Overview
                  onNavigateToTaxPlanning={() => setCurrentView(ViewState.EMP_TAX_PLANNING)}
                  onNavigateToReimbursements={() => setCurrentView(ViewState.EMP_REIMBURSEMENTS)}
                />
              )}
              {currentView === ViewState.EMP_PAYSLIPS && <Payslips />}
              {currentView === ViewState.EMP_TAX_PLANNING && <TaxPlanning />}
              {currentView === ViewState.EMP_SALARY_BREAKDOWN && <SalaryBreakdown />}
              {currentView === ViewState.EMP_REIMBURSEMENTS && <Reimbursements />}
              {currentView === ViewState.EMP_TAX_DOCUMENTS && <TaxDocuments onNavigateToPlanning={() => setCurrentView(ViewState.EMP_TAX_PLANNING)} />}
            </div>
          )}

          {/* Fallback for Work In Progress Views */}
          {((userRole === 'SUPER_ADMIN' && ![ViewState.DASHBOARD, ViewState.PAYROLL, ViewState.TAX, ViewState.SALARY, ViewState.TEMPLATE_SETUP].includes(currentView)) ||
            (userRole === 'HR_MANAGER' && ![ViewState.HR_DASHBOARD, ViewState.HR_EMPLOYEES, ViewState.TAX_DECLARATIONS, ViewState.HR_PAYROLL_RUN, ViewState.PAYROLL_APPROVAL, ViewState.HR_DOCUMENTS, ViewState.HR_EXPENSES, ViewState.LOANS_ADVANCES, ViewState.HR_SALARY_COMPONENTS, ViewState.SETTINGS].includes(currentView)) ||
            (userRole === 'EMPLOYEE' && ![ViewState.EMP_OVERVIEW, ViewState.EMP_PAYROLL_CORNER, ViewState.EMP_TAX_PLANNING, ViewState.EMP_REIMBURSEMENTS, ViewState.EMP_PAYSLIPS, ViewState.EMP_SALARY_BREAKDOWN, ViewState.EMP_TAX_DOCUMENTS].includes(currentView))) && (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <div className="p-6 rounded-full bg-slate-100 mb-4">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-slate-600">Work in Progress</h2>
                <p className="mt-2 text-sm">The {currentView.toLowerCase().replace(/_/g, ' ')} module is currently under development.</p>
              </div>
            )}
        </div>
      </div>

      <AiAssistant
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        contextData={contextData}
      />
    </div>
  );
};

export default App;

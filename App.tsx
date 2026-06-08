
import React, { useState, useMemo, useEffect } from 'react';
// auth-verified: 25 Feb 2026
import { Users, MessageSquare, Calendar, Database, AlertTriangle, PieChart } from 'lucide-react';
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
import { AddExpenseScreen } from './components/AddExpenseScreen';
import LoansAdvances from './components/LoansAdvances';
import AiAssistant from './components/AiAssistant';
import PayrollSettings from './components/PayrollSettings';
import TaxConfiguration from './components/HRTaxConfiguration';
import SalaryComponents from './components/SalaryComponents';
import TemplateSetup from './components/TemplateSetup';
import GlobalSettings from './components/GlobalSettings';
import PayrollCorner from './components/PayrollCorner';
import Overview from './components/Overview';
import OperationalConfig from './components/OperationalConfig';
import ExpenseSettings from './components/ExpenseSettings';
import PayrollReports from './components/PayrollReports';

// New Component Imports
import TaxPlanning from './components/TaxPlanning';
import Reimbursements from './components/Reimbursements';
import SalarySlips from './components/SalarySlips';
import SalaryBreakdown from './components/SalaryBreakdown';
import TaxDocuments from './components/TaxDocuments';
import { supabase } from './services/supabaseClient';

import { ViewState, UserRole, Company, AuditLog, Employee } from './types';
import { MOCK_COMPANIES, MOCK_AUDIT_LOGS } from './constants';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

// Basic Error Boundary
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    public props: ErrorBoundaryProps;
    public state: ErrorBoundaryState = {
        hasError: false
    };

    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.props = props;
    }

    static getDerivedStateFromError(_: Error): ErrorBoundaryState {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('React Error Boundary caught:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-10 flex flex-col items-center justify-center h-full text-slate-400 bg-white">
                    <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-4 text-rose-500">
                        <AlertTriangle size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">Something went wrong</h2>
                    <p className="mt-2">An error occurred while rendering this view. We've used fallback data where possible.</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-6 px-6 py-2 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-900 transition-all"
                    >
                        Reload Application
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

const App: React.FC = () => {
  // Super Admin role temporarily hidden - defaulting to HR_MANAGER
  const [userRole, setUserRole] = useState<UserRole>('HR_MANAGER');
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.HR_DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingClaimId, setEditingClaimId] = useState<string | undefined>(undefined);
  const [isNewClaimRedirect, setIsNewClaimRedirect] = useState<boolean>(false);

  // URL <-> ViewState mapping
  const URL_TO_VIEW: Record<string, { view: ViewState; role: UserRole }> = {
    '/hr/dashboard':           { view: ViewState.HR_DASHBOARD,          role: 'HR_MANAGER' },
    '/hr/employees':           { view: ViewState.HR_EMPLOYEES,          role: 'HR_MANAGER' },
    '/hr/tax-declarations':    { view: ViewState.TAX_DECLARATIONS,      role: 'HR_MANAGER' },
    '/hr/payroll-runs':        { view: ViewState.HR_PAYROLL_RUN,        role: 'HR_MANAGER' },
    '/hr/payroll-approval':    { view: ViewState.PAYROLL_APPROVAL,      role: 'HR_MANAGER' },
    '/hr/documents':           { view: ViewState.HR_DOCUMENTS,          role: 'HR_MANAGER' },
    '/hr/expenses':            { view: ViewState.HR_EXPENSES,           role: 'HR_MANAGER' },
    '/hr/expenses/add':        { view: ViewState.HR_ADD_EXPENSE,        role: 'HR_MANAGER' },
    '/hr/expenses/settings':   { view: ViewState.HR_EXPENSES_CONFIG,    role: 'HR_MANAGER' },
    '/hr/loans':               { view: ViewState.LOANS_ADVANCES,        role: 'HR_MANAGER' },
    '/hr/settings/statutory':  { view: ViewState.SETTINGS,             role: 'HR_MANAGER' },
    '/hr/settings/operational':{ view: ViewState.HR_OPERATIONAL_CONFIG, role: 'HR_MANAGER' },
    '/hr/payroll-reports':     { view: ViewState.HR_PAYROLL_REPORTS,    role: 'HR_MANAGER' },
    '/hr/salary-components':   { view: ViewState.HR_SALARY_COMPONENTS,  role: 'HR_MANAGER' },
    '/employee/overview':      { view: ViewState.EMP_OVERVIEW,          role: 'EMPLOYEE' },
    '/employee/tax-planning':  { view: ViewState.EMP_TAX_PLANNING,      role: 'EMPLOYEE' },
    '/employee/salary-slips':  { view: ViewState.EMP_SALARY_BREAKDOWN,  role: 'EMPLOYEE' },
    '/employee/reimbursements':{ view: ViewState.EMP_REIMBURSEMENTS,    role: 'EMPLOYEE' },
    '/employee/tax-documents': { view: ViewState.EMP_TAX_DOCUMENTS,     role: 'EMPLOYEE' },
    '/employee/loans':         { view: ViewState.EMP_LOANS_ADVANCES,    role: 'EMPLOYEE' },
    '/employee/payslips':      { view: ViewState.EMP_PAYSLIPS,          role: 'EMPLOYEE' },
    '/admin/dashboard':        { view: ViewState.DASHBOARD,             role: 'SUPER_ADMIN' },
    '/admin/payroll':          { view: ViewState.PAYROLL,               role: 'SUPER_ADMIN' },
    '/admin/tax':              { view: ViewState.TAX,                   role: 'SUPER_ADMIN' },
    '/admin/salary':           { view: ViewState.SALARY,                role: 'SUPER_ADMIN' },
    '/admin/template-setup':   { view: ViewState.TEMPLATE_SETUP,        role: 'SUPER_ADMIN' },
    '/admin/customers':        { view: ViewState.CUSTOMERS,             role: 'SUPER_ADMIN' },
    '/admin/support':          { view: ViewState.SUPPORT_TICKETS,       role: 'SUPER_ADMIN' },
    '/admin/schedulers':       { view: ViewState.SCHEDULERS,            role: 'SUPER_ADMIN' },
    '/admin/portal-data':      { view: ViewState.PORTAL_DATA,          role: 'SUPER_ADMIN' },
  };

  const VIEW_TO_URL: Partial<Record<ViewState, string>> = {
    [ViewState.HR_DASHBOARD]:          '/hr/dashboard',
    [ViewState.HR_EMPLOYEES]:          '/hr/employees',
    [ViewState.TAX_DECLARATIONS]:      '/hr/tax-declarations',
    [ViewState.HR_PAYROLL_RUN]:        '/hr/payroll-runs',
    [ViewState.PAYROLL_APPROVAL]:      '/hr/payroll-approval',
    [ViewState.HR_DOCUMENTS]:          '/hr/documents',
    [ViewState.HR_EXPENSES]:           '/hr/expenses',
    [ViewState.HR_ADD_EXPENSE]:        '/hr/expenses/add',
    [ViewState.HR_EXPENSES_CONFIG]:    '/hr/expenses/settings',
    [ViewState.LOANS_ADVANCES]:        '/hr/loans',
    [ViewState.SETTINGS]:              '/hr/settings/statutory',
    [ViewState.HR_OPERATIONAL_CONFIG]: '/hr/settings/operational',
    [ViewState.HR_PAYROLL_REPORTS]:    '/hr/payroll-reports',
    [ViewState.HR_SALARY_COMPONENTS]:  '/hr/salary-components',
    [ViewState.EMP_OVERVIEW]:          '/employee/overview',
    [ViewState.EMP_PAYROLL_CORNER]:    '/employee/overview',
    [ViewState.EMP_TAX_PLANNING]:      '/employee/tax-planning',
    [ViewState.EMP_SALARY_BREAKDOWN]:  '/employee/salary-slips',
    [ViewState.EMP_REIMBURSEMENTS]:    '/employee/reimbursements',
    [ViewState.EMP_TAX_DOCUMENTS]:     '/employee/tax-documents',
    [ViewState.EMP_LOANS_ADVANCES]:    '/employee/loans',
    [ViewState.EMP_PAYSLIPS]:          '/employee/payslips',
    [ViewState.DASHBOARD]:             '/admin/dashboard',
    [ViewState.PAYROLL]:               '/admin/payroll',
    [ViewState.TAX]:                   '/admin/tax',
    [ViewState.SALARY]:                '/admin/salary',
    [ViewState.TEMPLATE_SETUP]:        '/admin/template-setup',
    [ViewState.CUSTOMERS]:             '/admin/customers',
    [ViewState.SUPPORT_TICKETS]:       '/admin/support',
    [ViewState.SCHEDULERS]:            '/admin/schedulers',
    [ViewState.PORTAL_DATA]:           '/admin/portal-data',
  };

  // Sync currentView from URL on first load
  useEffect(() => {
    const path = window.location.pathname;
    const match = URL_TO_VIEW[path];
    if (match) {
      setUserRole(match.role);
      setCurrentView(match.view);
    }
  }, []);

  // Update URL when view changes
  useEffect(() => {
    const url = VIEW_TO_URL[currentView];
    if (url && window.location.pathname !== url) {
      window.history.pushState({}, '', url);
    }
  }, [currentView, userRole]);

  // Fetch initial data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch companies
        const { data: companiesData, error: companiesError } = await supabase
          .from('companies')
          .select('*')
          .order('name');

        if (companiesError) throw companiesError;
        setCompanies(companiesData || MOCK_COMPANIES);

        // Fetch employees
        const { data: employeesData, error: employeesError } = await supabase
          .from('employees')
          .select('*');

        if (employeesError) throw employeesError;
        setEmployees(employeesData || []);

        // Fetch audit logs
        const { data: logsData, error: logsError } = await supabase
          .from('audit_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);

        if (logsError) throw logsError;
        setAuditLogs(logsData || MOCK_AUDIT_LOGS);

      } catch (error) {
        console.error('Error fetching data from Supabase:', error);
        // Fallback to mocks if there's an error
        setCompanies(MOCK_COMPANIES);
        setEmployees([]); // Mocks are used directly in components for employees currently
        setAuditLogs(MOCK_AUDIT_LOGS);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

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
    try {
      return JSON.stringify({
        userRole,
        activeView: currentView,
        companiesSummary: (companies || []).map(c => `${c?.name || 'Unknown'} (${c?.status || 'N/A'})`),
        employeesCount: (employees || []).length,
        recentLogs: (auditLogs || []).map(l => `${l?.action || 'Unknown Action'} by ${l?.user_name || 'System'}`)
      });
    } catch (e) {
      console.error('Error serializing context for AI:', e);
      return JSON.stringify({ userRole, activeView: currentView });
    }
  }, [currentView, userRole, companies, auditLogs, employees]);

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
          <ErrorBoundary>

            {/* SUPER ADMIN ROUTES */}
            {userRole === 'SUPER_ADMIN' && (
              <>
                {currentView === ViewState.DASHBOARD && <Dashboard companies={companies} auditLogs={auditLogs} />}
                {currentView === ViewState.PAYROLL && <PayrollSettings />}
                {currentView === ViewState.TAX && <TaxConfiguration />}
                {currentView === ViewState.SALARY && <SalaryComponents />}
                {currentView === ViewState.TEMPLATE_SETUP && <TemplateSetup userRole={userRole} />}
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
                {currentView === ViewState.HR_EMPLOYEES && <Workforce userRole={userRole} />}
                {currentView === ViewState.TAX_DECLARATIONS && <TaxDeclarationsManagement />}
                {currentView === ViewState.HR_PAYROLL_RUN && <PayrollManager userRole={userRole} />}
                {currentView === ViewState.PAYROLL_APPROVAL && <PayrollApprovalRequests />}
                {currentView === ViewState.HR_DOCUMENTS && <DocumentsManager />}
                {currentView === ViewState.HR_EXPENSES && (
                  <ExpenseManagement 
                    userRole={userRole}
                    onChangeView={setCurrentView} 
                    onEditClaim={(id, isRedirect) => {
                      setEditingClaimId(id);
                      setIsNewClaimRedirect(!!isRedirect);
                      setCurrentView(ViewState.HR_ADD_EXPENSE);
                    }}
                  />
                )}
                {currentView === ViewState.HR_ADD_EXPENSE && (
                  <AddExpenseScreen
                    editId={editingClaimId}
                    isNewClaimRedirect={isNewClaimRedirect}
                    hideDateRange={true}
                    onClose={() => {
                      setEditingClaimId(undefined);
                      setIsNewClaimRedirect(false);
                      setCurrentView(ViewState.HR_EXPENSES);
                    }}
                    employees={employees
                      .filter(e => e.status === 'Active')
                      .map(e => ({ 
                        ...e, 
                        name: e.name || `${e.first_name || ''} ${e.last_name || ''}`.trim() || 'No Name', 
                        eid: e.eid || e.employee_id || 'N/A' 
                      }))}
                    categories={[
                      { id: '1', name: 'Travel' },
                      { id: '2', name: 'Meal' },
                      { id: '3', name: 'Mobile' },
                      { id: '4', name: 'Broadband' },
                      { id: '5', name: 'Learning' },
                      { id: '6', name: 'Other' }
                    ]}
                    onSuccess={(msg) => {
                      setEditingClaimId(undefined);
                      setIsNewClaimRedirect(false);
                      setCurrentView(ViewState.HR_EXPENSES);
                    }}
                  />
                )}
                {currentView === ViewState.HR_EXPENSES_CONFIG && <ExpenseSettings />}
                {currentView === ViewState.LOANS_ADVANCES && <LoansAdvances userRole={userRole} />}
                {currentView === ViewState.SETTINGS && <GlobalSettings userRole={userRole} />}
                {currentView === ViewState.HR_OPERATIONAL_CONFIG && <OperationalConfig />}
                {currentView === ViewState.HR_PAYROLL_REPORTS && <PayrollReports />}
              </>
            )}

            {/* EMPLOYEE ROUTES */}
            {userRole === 'EMPLOYEE' && (
              <div className="px-2 py-6 h-full">
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
                {currentView === ViewState.EMP_PAYSLIPS && <SalarySlips />}
                {currentView === ViewState.EMP_TAX_PLANNING && <TaxPlanning />}
                {currentView === ViewState.EMP_SALARY_BREAKDOWN && <SalaryBreakdown />}
                {currentView === ViewState.EMP_REIMBURSEMENTS && <Reimbursements />}
                {currentView === ViewState.EMP_TAX_DOCUMENTS && <TaxDocuments onNavigateToPlanning={() => setCurrentView(ViewState.EMP_TAX_PLANNING)} />}
                {currentView === ViewState.EMP_LOANS_ADVANCES && <LoansAdvances userRole={userRole} currentEmployeeId="TF00912" />}
              </div>
            )}

            {/* Fallback for Work In Progress Views */}
            {((userRole === 'SUPER_ADMIN' && ![ViewState.DASHBOARD, ViewState.PAYROLL, ViewState.TAX, ViewState.SALARY, ViewState.TEMPLATE_SETUP].includes(currentView)) ||
              (userRole === 'HR_MANAGER' && ![ViewState.HR_DASHBOARD, ViewState.HR_EMPLOYEES, ViewState.TAX_DECLARATIONS, ViewState.HR_PAYROLL_RUN, ViewState.PAYROLL_APPROVAL, ViewState.HR_DOCUMENTS, ViewState.HR_EXPENSES, ViewState.HR_ADD_EXPENSE, ViewState.LOANS_ADVANCES, ViewState.HR_SALARY_COMPONENTS, ViewState.SETTINGS, ViewState.HR_OPERATIONAL_CONFIG, ViewState.HR_PAYROLL_REPORTS].includes(currentView)) ||
              (userRole === 'EMPLOYEE' && ![ViewState.EMP_OVERVIEW, ViewState.EMP_PAYROLL_CORNER, ViewState.EMP_TAX_PLANNING, ViewState.EMP_REIMBURSEMENTS, ViewState.EMP_PAYSLIPS, ViewState.EMP_SALARY_BREAKDOWN, ViewState.EMP_TAX_DOCUMENTS, ViewState.EMP_LOANS_ADVANCES].includes(currentView))) && (
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
          </ErrorBoundary>
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

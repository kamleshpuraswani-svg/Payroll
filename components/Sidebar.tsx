
import React, { useState } from 'react';
import {
  LayoutDashboard,
  Settings,
  ChevronDown,
  ChevronRight,
  Circle,
  Users,
  Calendar,
  FileText,
  Briefcase,
  ClipboardList,
  Sliders,
  ShieldAlert,
  Wallet,
  ClipboardCheck,
  Calculator,
  Banknote,
  PieChart,
  Receipt,
  FileCheck,
  MessageSquare,
  Database
} from 'lucide-react';
import { ViewState, UserRole } from '../types';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  userRole: UserRole;
}

type MenuItem = {
  id: string;
  label: string;
  icon?: React.ReactNode;
  viewState?: ViewState;
  subItems?: MenuItem[];
};

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, isOpen, setIsOpen, userRole }) => {
  // State to manage expanded groups. Default 'payroll-config' to open for better UX.
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['payroll-config', 'configuration', 'payroll-corner']);

  const toggleGroup = (id: string) => {
    setExpandedGroups(prev =>
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  };

  // Define Menus for Super Admin
  const adminMenuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard size={20} />,
      viewState: ViewState.DASHBOARD
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: <Users size={20} />,
      viewState: ViewState.CUSTOMERS
    },
    {
      id: 'support-tickets',
      label: 'Support Tickets',
      icon: <MessageSquare size={20} />,
      viewState: ViewState.SUPPORT_TICKETS
    },
    {
      id: 'schedulers',
      label: 'Schedulers',
      icon: <Calendar size={20} />,
      viewState: ViewState.SCHEDULERS
    },
    {
      id: 'portal-data',
      label: 'Portal Data',
      icon: <Database size={20} />,
      subItems: []
    },
    {
      id: 'payroll-config',
      label: 'Payroll Config',
      icon: <Settings size={20} />,
      subItems: [
        { id: 'payroll-settings', label: 'Pay Schedule', viewState: ViewState.PAYROLL },
        { id: 'tax-config', label: 'Tax Regime Configuration', viewState: ViewState.TAX },
        { id: 'salary-components', label: 'Salary Components', viewState: ViewState.SALARY },
        { id: 'template-setup', label: 'Template Setup', viewState: ViewState.TEMPLATE_SETUP },
      ]
    },
  ];

  // Define Menus for HR Manager
  const hrMenuItems: MenuItem[] = [
    {
      id: 'hr-dash',
      label: 'Dashboard',
      icon: <LayoutDashboard size={20} />,
      viewState: ViewState.HR_DASHBOARD
    },
    {
      id: 'hr-employees',
      label: 'Employees Payroll',
      icon: <Users size={20} />,
      viewState: ViewState.HR_EMPLOYEES
    },
    {
      id: 'hr-tax',
      label: 'Tax Declarations',
      icon: <ShieldAlert size={20} />,
      viewState: ViewState.TAX_DECLARATIONS
    },
    {
      id: 'hr-expenses',
      label: 'Expense Management',
      icon: <Wallet size={20} />,
      viewState: ViewState.HR_EXPENSES
    },
    {
      id: 'hr-loans',
      label: 'Loans & Advances',
      icon: <Banknote size={20} />,
      viewState: ViewState.LOANS_ADVANCES
    },
    {
      id: 'hr-payroll',
      label: 'Run Payroll',
      icon: <FileText size={20} />,
      viewState: ViewState.HR_PAYROLL_RUN
    },
    {
      id: 'hr-approvals',
      label: 'Payroll Approval Requests',
      icon: <ClipboardCheck size={20} />,
      viewState: ViewState.PAYROLL_APPROVAL
    },
    {
      id: 'hr-docs',
      label: 'Documents',
      icon: <Briefcase size={20} />,
      viewState: ViewState.HR_DOCUMENTS
    },
    {
      id: 'configuration',
      label: 'Configuration',
      icon: <Sliders size={20} />,
      subItems: [
        { id: 'hr-statutory', label: 'Statutory Settings', viewState: ViewState.SETTINGS },
        { id: 'hr-operational', label: 'Operational Config', viewState: ViewState.HR_OPERATIONAL_CONFIG },
      ]
    }
  ];

  // Define Menus for Employee
  const employeeMenuItems: MenuItem[] = [
    {
      id: 'payroll-corner',
      label: 'Payroll Corner',
      icon: <Banknote size={20} />,
      subItems: [
        {
          id: 'emp-overview',
          label: 'Overview',
          viewState: ViewState.EMP_OVERVIEW
        },
        {
          id: 'emp-payslips',
          label: 'Payslips',
          viewState: ViewState.EMP_PAYSLIPS
        },
        {
          id: 'emp-tax-planning',
          label: 'Tax Planning',
          viewState: ViewState.EMP_TAX_PLANNING
        },
        {
          id: 'emp-salary-breakdown',
          label: 'Salary Breakdown',
          viewState: ViewState.EMP_SALARY_BREAKDOWN
        },
        {
          id: 'emp-reimbursements',
          label: 'Reimbursements',
          viewState: ViewState.EMP_REIMBURSEMENTS
        },
        {
          id: 'emp-tax-documents',
          label: 'Tax Documents',
          viewState: ViewState.EMP_TAX_DOCUMENTS
        },
        {
          id: 'emp-loans-advances',
          label: 'Loans & Advances',
          viewState: ViewState.EMP_LOANS_ADVANCES
        }
      ]
    }
  ];

  const menuItems = userRole === 'SUPER_ADMIN' ? adminMenuItems : userRole === 'HR_MANAGER' ? hrMenuItems : employeeMenuItems;

  const handleItemClick = (item: MenuItem) => {
    if (item.subItems) {
      toggleGroup(item.id);
    } else if (item.viewState) {
      onChangeView(item.viewState);
      if (window.innerWidth < 1024) setIsOpen(false);
    }
  };

  const isGroupActive = (item: MenuItem): boolean => {
    if (item.subItems) {
      return item.subItems.some(sub => sub.viewState === currentView);
    }
    return false;
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-20 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed top-0 left-0 z-30 h-full w-64 bg-white border-r border-slate-200 shadow-sm transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:h-screen lg:shrink-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">
            {userRole === 'SUPER_ADMIN' ? 'Super Admin Panel' : userRole === 'HR_MANAGER' ? 'HR Portal' : 'Employee Portal'}
          </span>
        </div>

        <div className="p-4 space-y-6 overflow-y-auto h-[calc(100vh-4rem)] flex flex-col justify-between">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const isActive = item.viewState === currentView;
              const isExpanded = expandedGroups.includes(item.id);
              const groupActive = isGroupActive(item);

              return (
                <div key={item.id}>
                  <button
                    onClick={() => handleItemClick(item)}
                    className={`
                      w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap
                      ${isActive || (groupActive && !isExpanded)
                        ? 'bg-sky-50 text-sky-700'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                    `}
                  >
                    <div className="flex items-center space-x-3">
                      <span className={(isActive || groupActive) ? 'text-sky-600' : 'text-slate-400'}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>
                    {item.subItems && (
                      <span className="text-slate-400">
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </span>
                    )}
                  </button>

                  {/* Sub-menu Items */}
                  {item.subItems && isExpanded && (
                    <div className="mt-1 ml-4 pl-4 border-l-2 border-slate-100 space-y-1">
                      {item.subItems.map((subItem) => {
                        const isSubActive = subItem.viewState === currentView;
                        const subGroupActive = isGroupActive(subItem);
                        const isSubExpanded = expandedGroups.includes(subItem.id);

                        return (
                          <div key={subItem.id}>
                            <button
                              onClick={() => handleItemClick(subItem)}
                              className={`
                                w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap
                                ${isSubActive || (subGroupActive && !isSubExpanded)
                                  ? 'bg-sky-50 text-sky-700'
                                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
                              `}
                            >
                              <div className="flex items-center space-x-3">
                                {isSubActive && <Circle size={6} fill="currentColor" className="text-sky-600" />}
                                <span className={isSubActive ? '' : 'pl-4'}>{subItem.label}</span>
                              </div>
                              {subItem.subItems && (
                                <span className="text-slate-400">
                                  {isSubExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                </span>
                              )}
                            </button>

                            {/* Nested Sub-menu */}
                            {subItem.subItems && isSubExpanded && (
                              <div className="mt-1 ml-4 space-y-1">
                                {subItem.subItems.map((nestedItem) => (
                                  <button
                                    key={nestedItem.id}
                                    onClick={() => handleItemClick(nestedItem)}
                                    className={`
                                      w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                                      ${nestedItem.viewState === currentView
                                        ? 'bg-sky-50 text-sky-700'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
                                    `}
                                  >
                                    {nestedItem.viewState === currentView && <Circle size={6} fill="currentColor" className="text-sky-600" />}
                                    <span className={nestedItem.viewState === currentView ? '' : 'pl-8'}>{nestedItem.label}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;


import React, { useState } from 'react';
import { 
  Building2, 
  Users
} from 'lucide-react';
import StatCard from './StatCard';
import EmployeePanel from './EmployeePanel';
import CompaniesPanel from './CompaniesPanel';
import { Company, StatMetric, AuditLog } from '../types';
import { MOCK_EMPLOYEES } from '../constants';

interface DashboardProps {
  companies: Company[];
  auditLogs: AuditLog[];
}

type PanelType = 'COMPANIES' | 'EMPLOYEES';

const Dashboard: React.FC<DashboardProps> = ({ companies, auditLogs }) => {
  // Use array to support stacked panels
  const [activePanels, setActivePanels] = useState<PanelType[]>([]);

  const togglePanel = (panel: PanelType) => {
    setActivePanels(prev => {
      if (prev.includes(panel)) {
        return prev.filter(p => p !== panel);
      } else {
        return [...prev, panel];
      }
    });
  };

  const closePanel = (panel: PanelType) => {
    setActivePanels(prev => prev.filter(p => p !== panel));
  };

  const isPanelOpen = (panel: PanelType) => activePanels.includes(panel);

  const stats: StatMetric[] = [
    {
      title: 'Total Active Companies',
      value: '1,284',
      trend: '+7.2% vs last month',
      trendUp: true,
      icon: <Building2 />,
      colorClass: 'text-emerald-600 bg-emerald-100',
      onClick: () => togglePanel('COMPANIES'),
    },
    {
      title: 'Total Employees Managed',
      value: '45,237',
      trend: '+8.1% vs last month',
      trendUp: true,
      icon: <Users />,
      colorClass: 'text-sky-600 bg-sky-100',
      // onClick removed as requested
    },
  ];

  return (
    <main className="p-4 lg:p-8 max-w-7xl mx-auto space-y-8 relative h-full">
      {/* Quick Actions & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} stat={stat} />
        ))}
      </div>

      {/* Main Content Area - Currently Empty/Reserved */}
      <div className="min-h-[400px] flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
        <p className="font-medium">Dashboard Widgets Hidden</p>
        <p className="text-sm">Select a card above to view details</p>
      </div>

      {/* Slide-in Panels - Rendered conditionally but stacked via standard DOM order */}
      <EmployeePanel
        isOpen={isPanelOpen('EMPLOYEES')}
        onClose={() => closePanel('EMPLOYEES')}
        employees={MOCK_EMPLOYEES}
      />

      <CompaniesPanel 
        isOpen={isPanelOpen('COMPANIES')}
        onClose={() => closePanel('COMPANIES')}
        companies={companies}
      />
    </main>
  );
};

export default Dashboard;

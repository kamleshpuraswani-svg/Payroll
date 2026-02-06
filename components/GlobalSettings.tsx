
import React, { useState } from 'react';
import {
   Building2,
   Calendar,
   FileText,
   CreditCard,
   ShieldCheck,
   Briefcase,
   Receipt,
   ChevronsLeft,
   ChevronRight,
   Settings,
   Layers,
   Calculator,
   Landmark,
   Shield,
   Banknote,
   Award
} from 'lucide-react';

import OrganizationTaxDetails from './OrganizationTaxDetails';
import PayrollSettings from './PayrollSettings';
import HRSalaryComponents from './HRSalaryComponents';
import HRSalaryStructure from './HRSalaryStructure';
import HRTaxConfiguration from './HRTaxConfiguration';
import HRSalarySlipTemplate from './HRSalarySlipTemplate';
import HRBankDisbursalTemplate from './HRBankDisbursalTemplate';
import PFSettings from './PFSettings';
import StatutorySettings from './StatutorySettings';
import StatutoryBonusSettings from './StatutoryBonusSettings';
import IncomeTaxDeclarationSettings from './IncomeTaxDeclarationSettings';
import TDSSettings from './TDSSettings';
import LoanAdvancesTypes from './LoanAdvancesTypes';
import FnFSettlementTemplate from './FnFSettlementTemplate';

const GlobalSettings: React.FC = () => {
   const [activeModule, setActiveModule] = useState('organization');

   const menuItems = [
      { id: 'organization', label: 'Organization Tax Details', icon: Building2 },
      { id: 'schedule', label: 'Pay Schedule', icon: Calendar },
      { id: 'components', label: 'Salary Components', icon: Layers },
      { id: 'structure', label: 'Salary Structures', icon: Briefcase },
      { id: 'tax-config', label: 'Tax Configuration', icon: Calculator },
      { id: 'loan-types', label: 'Loan & Advances Types', icon: Banknote },
      { id: 'fnf-settlement', label: 'F&F Settlement Payslip', icon: FileText },
      { id: 'payslip', label: 'Salary Slip', icon: FileText },
      { id: 'bank', label: 'Bank Disbursal Format', icon: CreditCard },
      { id: 'pf-settings', label: 'PF Settings', icon: Shield },
      { id: 'statutory', label: 'Statutory Settings', icon: ShieldCheck },
      { id: 'statutory-bonus', label: 'Statutory Bonus', icon: Award },
      { id: 'it-declaration', label: 'Income Tax Declaration', icon: Receipt },
      { id: 'tds-settings', label: 'TDS Settings', icon: Landmark },
   ];

   const renderContent = () => {
      switch (activeModule) {
         case 'organization': return <OrganizationTaxDetails />;
         case 'schedule': return <PayrollSettings />;
         case 'components': return <HRSalaryComponents />;
         case 'structure': return <HRSalaryStructure embedded={true} />;
         case 'tax-config': return <HRTaxConfiguration />;
         case 'loan-types': return <LoanAdvancesTypes />;
         case 'fnf-settlement': return <FnFSettlementTemplate />;
         case 'payslip': return <HRSalarySlipTemplate />;
         case 'bank': return <HRBankDisbursalTemplate />;
         case 'pf-settings': return <PFSettings />;
         case 'statutory': return <StatutorySettings />;
         case 'statutory-bonus': return <StatutoryBonusSettings />;
         case 'it-declaration': return <IncomeTaxDeclarationSettings />;
         case 'tds-settings': return <TDSSettings />;
         default: return <div className="p-8">Select a module</div>;
      }
   };

   return (
      <div className="flex h-[calc(100vh-64px)] bg-white overflow-hidden">
         {/* Left Sidebar */}
         <div className="w-64 border-r border-slate-200 h-full flex flex-col bg-white shrink-0">
            <div className="px-4 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
               <span className="font-bold text-slate-800 text-sm uppercase tracking-wide">Configuration</span>
               <button className="text-slate-400 hover:text-slate-600 transition-colors"><ChevronsLeft size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto py-3 space-y-0.5">
               {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeModule === item.id;
                  return (
                     <button
                        key={item.id}
                        onClick={() => setActiveModule(item.id)}
                        className={`w-full flex items-center justify-between px-6 py-3 text-sm font-medium transition-colors border-l-4 ${isActive ? 'border-sky-600 bg-sky-50 text-sky-700' : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                     >
                        <div className="flex items-center gap-3">
                           <Icon size={18} className={isActive ? 'text-sky-600' : 'text-slate-400'} />
                           <span>{item.label}</span>
                        </div>
                        {isActive && <ChevronRight size={14} className="text-sky-400" />}
                     </button>
                  );
               })}
            </div>
         </div>

         {/* Right Content */}
         <div className="flex-1 h-full overflow-hidden flex flex-col bg-white relative">
            {renderContent()}
         </div>
      </div>
   );
};

export default GlobalSettings;

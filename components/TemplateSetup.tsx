
import React, { useState } from 'react';
import SalaryStructure from './SalaryStructure';
import SalarySlipTemplate from './SalarySlipTemplate';
import FnFSettlementTemplate from './FnFSettlementTemplate';
import SalaryAnnexureTemplate from './SalaryAnnexureTemplate';
import BankDisbursalTemplate from './BankDisbursalTemplate';

const TemplateSetup: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Salary Structure');

  const tabs = [
    'Salary Structure',
    'Salary Slip',
    'F&F Settlement Payslip',
    'Salary Annexure',
    'Bank Disbursal Format'
  ];

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
             Template Setup
          </h1>
          <p className="text-slate-500 mt-1">Configure and customize document templates.</p>
        </div>
      </div>
      
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden min-h-[500px] flex flex-col">
         {/* Tabs Navigation */}
         <div className="flex border-b border-slate-100 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
               <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                     activeTab === tab
                        ? 'border-purple-600 text-purple-700 bg-purple-50/50'
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
               >
                  {tab}
               </button>
            ))}
         </div>

         {/* Content Area */}
         <div className="flex-1 bg-slate-50/30">
            {activeTab === 'Salary Structure' ? (
              <div className="p-6">
                <SalaryStructure embedded={true} />
              </div>
            ) : activeTab === 'Salary Slip' ? (
              <div className="p-6">
                <SalarySlipTemplate />
              </div>
            ) : activeTab === 'F&F Settlement Payslip' ? (
              <div className="p-6">
                <FnFSettlementTemplate />
              </div>
            ) : activeTab === 'Salary Annexure' ? (
              <div className="p-6">
                <SalaryAnnexureTemplate />
              </div>
            ) : activeTab === 'Bank Disbursal Format' ? (
              <div className="p-6">
                <BankDisbursalTemplate />
              </div>
            ) : (
              <div className="p-12 flex flex-col items-center justify-center text-center h-full">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">{activeTab} Template</h3>
                <p className="text-slate-500 max-w-md mx-auto">
                   You are currently viewing the configuration for the <strong>{activeTab}</strong>. The editor and settings for this template will be implemented here.
                </p>
                <button className="mt-8 px-6 py-2.5 bg-purple-600 text-white rounded-lg font-medium shadow-sm hover:bg-purple-700 transition-colors">
                   Configure Template
                </button>
              </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default TemplateSetup;

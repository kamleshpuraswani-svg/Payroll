
import React, { useState } from 'react';
import { X, Search, Building, Eye, MapPin, Calendar, Sigma, ChevronDown, Download } from 'lucide-react';
import { Company } from '../types';
import { ViewCompanyModal, ExportAllDataModal } from './CompanyActionModals';

interface CompaniesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  companies: Company[];
}

type ActionType = 'VIEW' | null;

const CompaniesPanel: React.FC<CompaniesPanelProps> = ({ isOpen, onClose, companies }) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // State for Modals
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [activeAction, setActiveAction] = useState<ActionType>(null);
  const [isExportAllOpen, setIsExportAllOpen] = useState(false);

  const handleAction = (company: Company, action: ActionType) => {
    setSelectedCompany(company);
    setActiveAction(action);
  };

  const closeActionModal = () => {
    setActiveAction(null);
    setSelectedCompany(null);
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/10 backdrop-blur-[2px] z-30 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Slide-in Panel */}
      <div
        className={`
          fixed inset-y-0 right-0 z-40 w-full max-w-[1000px] bg-white shadow-2xl transform transition-transform duration-300 ease-out flex flex-col border-l border-slate-100
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
              <Building size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Active Companies</h2>
              <p className="text-sm text-slate-500">1,284 total records</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Lookup Filter Bar */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2">

            {/* Lookup Field Selector */}
            <div className="relative">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-sky-600 transition-colors shadow-sm"
              >
                <Sigma size={18} className="text-indigo-600" />
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              {isFilterOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 z-50 py-2 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-50 mb-1">
                    Select Filter Field
                  </div>
                  <button className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-sky-600 flex items-center gap-3 transition-colors">
                    <MapPin size={16} className="text-slate-400" />
                    Location
                  </button>
                  <button className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-sky-600 flex items-center gap-3 transition-colors">
                    <Calendar size={16} className="text-slate-400" />
                    Last Payroll Run Date
                  </button>
                </div>
              )}
            </div>

            {/* Search Input */}
            <div className="flex-1 relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
              <input
                type="text"
                placeholder="Filter Results..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all placeholder:text-slate-400 shadow-sm"
              />
            </div>

            {/* Filter Button */}
            <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
              Filter
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 sticky top-0 z-10 text-xs uppercase font-semibold text-slate-500">
              <tr>
                <th className="px-6 py-4 border-b border-slate-200">Logo</th>
                <th className="px-6 py-4 border-b border-slate-200">Company Name</th>
                <th className="px-6 py-4 border-b border-slate-200">Company ID</th>
                <th className="px-6 py-4 border-b border-slate-200">Employees</th>
                <th className="px-6 py-4 border-b border-slate-200">Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {companies.map((company) => (
                <tr key={company?.id || Math.random()} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="h-9 w-9 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                      {company?.name ? company.name.substring(0, 2).toUpperCase() : 'CO'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-800 text-sm">{company?.name || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded w-fit">{company?.id || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-slate-700">{typeof company?.employees === 'number' ? company.employees.toLocaleString() : '0'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-sm text-slate-600">
                      <MapPin size={14} className="text-slate-400" />
                      {company?.location || 'N/A'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex justify-end">
          <button
            onClick={() => setIsExportAllOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-900 transition-colors shadow-sm"
          >
            <Download size={16} />
            Export All Data
          </button>
        </div>
      </div>

      {/* Action Modals */}
      <ViewCompanyModal
        isOpen={activeAction === 'VIEW'}
        onClose={closeActionModal}
        company={selectedCompany}
      />

      <ExportAllDataModal
        isOpen={isExportAllOpen}
        onClose={() => setIsExportAllOpen(false)}
      />
    </>
  );
};

export default CompaniesPanel;

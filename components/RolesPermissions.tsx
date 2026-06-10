import React, { useState, useMemo, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { 
  Home, 
  Search, 
  Eye, 
  Pencil, 
  Trash2, 
  MoreVertical, 
  ChevronsUpDown, 
  X, 
  ChevronRight,
  ChevronDown,
  Shield,
  AlertTriangle,
  ArrowLeft,
  Check,
  CheckSquare,
  Info
} from 'lucide-react';

interface RoleItem {
  id: string;
  name: string;
  status: 'Active' | 'Inactive';
  employeesCount: number;
  remarks: string;
  lastModifiedBy: string;
  lastModifiedAt: string;
  createdBy: string;
  createdAt: string;
}

const INITIAL_ROLES: RoleItem[] = [
  {
    id: '1',
    name: 'Employee',
    status: 'Active',
    employeesCount: 15,
    remarks: 'Standard employee access for self-service portal',
    lastModifiedBy: '',
    lastModifiedAt: '',
    createdBy: 'System',
    createdAt: '01-Jan-2025, 09:00 AM'
  },
  {
    id: '2',
    name: 'HR Manager',
    status: 'Active',
    employeesCount: 4,
    remarks: 'Handles human resources operations and payroll configurations',
    lastModifiedBy: 'Isha Patel',
    lastModifiedAt: '08-Apr-2026, 09:30 AM',
    createdBy: 'Prashant Kumar',
    createdAt: '15-Jun-2025, 10:00 AM'
  }
];

// Tree structure matching the screenshot: People -> Feed Moderation, Employees -> Exit Management, Employee Detail -> Personal Info etc.
interface PermissionRowSettings {
  status: boolean;
  viewScope: 'Default' | 'Global' | null;
  add: boolean;
  edit: boolean;
  delete: boolean;
}

interface ModuleRow {
  id: string;
  name: string;
  isParent: boolean;
  parentId?: string;
  hasAddEdit: boolean; // some rows show "-" under Add and Edit columns
}

const MODULES_TREE: ModuleRow[] = [
  { id: 'people', name: 'People', isParent: true, hasAddEdit: false },
  { id: 'feed-mod', name: 'Feed Moderation', isParent: false, parentId: 'people', hasAddEdit: false },
  
  { id: 'employees', name: 'Employees', isParent: true, parentId: 'people', hasAddEdit: true },
  { id: 'exit-mgmt', name: 'Exit Management', isParent: false, parentId: 'employees', hasAddEdit: true },
  
  { id: 'emp-detail', name: 'Employee Detail', isParent: true, parentId: 'people', hasAddEdit: false },
  { id: 'personal-info', name: 'Personal Information', isParent: false, parentId: 'emp-detail', hasAddEdit: false },
  { id: 'role-info', name: 'Employee Role Information', isParent: false, parentId: 'emp-detail', hasAddEdit: false },
  { id: 'contact-info', name: 'Personal Contact Information', isParent: false, parentId: 'emp-detail', hasAddEdit: false },
  { id: 'family-details', name: 'Family Details', isParent: false, parentId: 'emp-detail', hasAddEdit: false },

  { id: 'payroll-corner', name: 'Payroll Corner', isParent: true, parentId: 'people', hasAddEdit: false },
  { id: 'emp-overview', name: 'Overview', isParent: false, parentId: 'payroll-corner', hasAddEdit: false },
  { id: 'emp-tax-planning', name: 'Tax Planning', isParent: false, parentId: 'payroll-corner', hasAddEdit: true },
  { id: 'emp-payslips', name: 'Salary Slips', isParent: false, parentId: 'payroll-corner', hasAddEdit: false },
  { id: 'emp-reimbursements', name: 'Reimbursements', isParent: false, parentId: 'payroll-corner', hasAddEdit: true },
  { id: 'emp-tax-documents', name: 'Tax Documents', isParent: false, parentId: 'payroll-corner', hasAddEdit: true },
  { id: 'emp-loans-advances', name: 'Loans & Advances', isParent: false, parentId: 'payroll-corner', hasAddEdit: true },

  { id: 'payroll', name: 'Payroll', isParent: true, hasAddEdit: false },
  { id: 'payroll-runs-parent', name: 'Payroll Runs', isParent: true, parentId: 'payroll', hasAddEdit: false },
  { id: 'payroll-dash', name: 'Dashboard', isParent: false, parentId: 'payroll-runs-parent', hasAddEdit: false },
  { id: 'payroll-emp-comp', name: 'Employees Compensation', isParent: false, parentId: 'payroll-runs-parent', hasAddEdit: true },
  { id: 'payroll-tax-decl', name: 'Tax Declarations', isParent: false, parentId: 'payroll-runs-parent', hasAddEdit: true },
  { id: 'payroll-runs-child', name: 'Payroll Runs', isParent: false, parentId: 'payroll-runs-parent', hasAddEdit: true },
  { id: 'salary-structures', name: 'Salary Structures', isParent: false, parentId: 'payroll', hasAddEdit: true },
  { id: 'payroll-config', name: 'Operational Config', isParent: false, parentId: 'payroll', hasAddEdit: false }
];

type SortField = 'name' | 'status' | 'employeesCount' | 'lastModifiedBy' | 'createdBy';
type SortOrder = 'asc' | 'desc' | null;

const RolesPermissions: React.FC = () => {
  const [roles, setRoles] = useState<RoleItem[]>(INITIAL_ROLES);
  const [isDbLoading, setIsDbLoading] = useState(true);
  const [isDbSaving, setIsDbSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedQuery, setAppliedQuery] = useState('');

  // Sorting State
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);

  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleItem | null>(null);

  // Toast State
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Edit Permissions View State
  const [selectedRoleForPermissions, setSelectedRoleForPermissions] = useState<RoleItem | null>(null);
  const [activeTab, setActiveTab] = useState<'permissions' | 'employees'>('permissions');
  
  // Accordion Expand/Collapse
  const [expandedParents, setExpandedParents] = useState<string[]>(['people', 'payroll-corner', 'payroll-runs-parent', 'payroll']);

  // Role Switching Dropdown State
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  // Search by Parent Module Dropdown State
  const [selectedParentFilter, setSelectedParentFilter] = useState<string>('Payroll');
  const [isParentFilterDropdownOpen, setIsParentFilterDropdownOpen] = useState(false);

  // Dynamic Dropdown Options based on Selected Role
  const dropdownOptions = useMemo(() => {
    if (!selectedRoleForPermissions) return ['All Modules'];
    if (selectedRoleForPermissions.name === 'Employee') {
      return ['People'];
    }
    return ['Payroll'];
  }, [selectedRoleForPermissions]);

  // Sync selected parent filter when role changes
  useEffect(() => {
    if (selectedRoleForPermissions) {
      if (selectedRoleForPermissions.name === 'Employee') {
        setSelectedParentFilter('People');
      } else {
        setSelectedParentFilter('Payroll');
      }
    }
  }, [selectedRoleForPermissions]);

  // Permissions Mapping state
  const [rolePermissions, setRolePermissions] = useState<Record<string, Record<string, PermissionRowSettings>>>(() => {
    const initial: Record<string, Record<string, PermissionRowSettings>> = {};
    
    // HR Manager permissions (Initialized mostly true/global)
    const hrPerms: Record<string, PermissionRowSettings> = {};
    MODULES_TREE.forEach(mod => {
      hrPerms[mod.id] = {
        status: true,
        viewScope: 'Global',
        add: true,
        edit: true,
        delete: true
      };
    });
    // Adjust parent rows to not have default Add/Edit selected values if they show "-"
    MODULES_TREE.forEach(mod => {
      if (!mod.hasAddEdit) {
        hrPerms[mod.id].add = false;
        hrPerms[mod.id].edit = false;
        hrPerms[mod.id].delete = false;
      }
    });
    initial['2'] = hrPerms; // HR Manager
    
    // Employee permissions (Initialized mostly status false or default view scope)
    const empPerms: Record<string, PermissionRowSettings> = {};
    MODULES_TREE.forEach(mod => {
      const isPayrollCorner = mod.id === 'payroll-corner' || mod.parentId === 'payroll-corner';
      const isDefaultActive = mod.id === 'personal-info' || mod.id === 'contact-info' || isPayrollCorner;
      empPerms[mod.id] = {
        status: isDefaultActive,
        viewScope: isDefaultActive ? 'Default' : null,
        add: false,
        edit: false,
        delete: false
      };
    });
    initial['1'] = empPerms; // Employee
    
    return initial;
  });

  // Fetch from Supabase on mount
  useEffect(() => {
    const fetchPermissionsFromDb = async () => {
      try {
        setIsDbLoading(true);
        
        // Fetch roles
        const { data: rolesData, error: rolesError } = await supabase
          .from('operational_config')
          .select('config_value')
          .eq('config_key', 'roles_permissions_roles')
          .single();
          
        // Fetch permissions matrix
        const { data: matrixData, error: matrixError } = await supabase
          .from('operational_config')
          .select('config_value')
          .eq('config_key', 'roles_permissions_matrix')
          .single();

        if (rolesData && rolesData.config_value) {
          setRoles(rolesData.config_value as RoleItem[]);
        } else {
          // If not found in DB, seed defaults to DB
          await supabase.from('operational_config').upsert({
            config_key: 'roles_permissions_roles',
            config_value: INITIAL_ROLES
          }, { onConflict: 'config_key' });
        }

        if (matrixData && matrixData.config_value) {
          setRolePermissions(matrixData.config_value as Record<string, Record<string, PermissionRowSettings>>);
        } else {
          // If not found in DB, seed default permissions map to DB
          const initialMap: Record<string, Record<string, PermissionRowSettings>> = {};
          
          // HR Manager default map
          const hrPerms: Record<string, PermissionRowSettings> = {};
          MODULES_TREE.forEach(mod => {
            hrPerms[mod.id] = {
              status: true,
              viewScope: 'Global',
              add: mod.hasAddEdit,
              edit: mod.hasAddEdit,
              delete: mod.hasAddEdit
            };
          });
          initialMap['2'] = hrPerms;

          // Employee default map
          const empPerms: Record<string, PermissionRowSettings> = {};
          MODULES_TREE.forEach(mod => {
            const isPayrollCorner = mod.id === 'payroll-corner' || mod.parentId === 'payroll-corner';
            const isDefaultActive = mod.id === 'personal-info' || mod.id === 'contact-info' || isPayrollCorner;
            empPerms[mod.id] = {
              status: isDefaultActive,
              viewScope: isDefaultActive ? 'Default' : null,
              add: false,
              edit: false,
              delete: false
            };
          });
          initialMap['1'] = empPerms;

          setRolePermissions(initialMap);
          await supabase.from('operational_config').upsert({
            config_key: 'roles_permissions_matrix',
            config_value: initialMap
          }, { onConflict: 'config_key' });
        }
      } catch (err) {
        console.error('Error loading roles/permissions from Supabase:', err);
      } finally {
        setIsDbLoading(false);
      }
    };

    fetchPermissionsFromDb();
  }, []);

  // Toggle Parent Accordion Row
  const toggleExpand = (parentId: string) => {
    setExpandedParents(prev =>
      prev.includes(parentId) ? prev.filter(p => p !== parentId) : [...prev, parentId]
    );
  };

  const triggerToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  // Change View Status
  const handleToggleStatus = (moduleId: string) => {
    if (!selectedRoleForPermissions) return;
    const roleId = selectedRoleForPermissions.id;

    setRolePermissions(prev => {
      const currentRolePerms = { ...prev[roleId] };
      const currentModPerm = { ...currentRolePerms[moduleId] };

      const newStatus = !currentModPerm.status;
      currentModPerm.status = newStatus;

      if (newStatus) {
        currentModPerm.viewScope = 'Default';
      } else {
        currentModPerm.viewScope = null;
        currentModPerm.add = false;
        currentModPerm.edit = false;
        currentModPerm.delete = false;
      }

      currentRolePerms[moduleId] = currentModPerm;

      // Cascade logically to submodules if parent row
      const modRow = MODULES_TREE.find(m => m.id === moduleId);
      if (modRow && modRow.isParent) {
        MODULES_TREE.forEach(child => {
          if (child.parentId === moduleId) {
            const childPerm = { ...currentRolePerms[child.id] };
            childPerm.status = newStatus;
            childPerm.viewScope = newStatus ? 'Default' : null;
            if (!newStatus) {
              childPerm.add = false;
              childPerm.edit = false;
              childPerm.delete = false;
            }
            currentRolePerms[child.id] = childPerm;

            // Handle nested submodules (e.g. Exit Management under Employees)
            if (child.isParent) {
              MODULES_TREE.forEach(grandchild => {
                if (grandchild.parentId === child.id) {
                  const grandchildPerm = { ...currentRolePerms[grandchild.id] };
                  grandchildPerm.status = newStatus;
                  grandchildPerm.viewScope = newStatus ? 'Default' : null;
                  if (!newStatus) {
                    grandchildPerm.add = false;
                    grandchildPerm.edit = false;
                    grandchildPerm.delete = false;
                  }
                  currentRolePerms[grandchild.id] = grandchildPerm;
                }
              });
            }
          }
        });
      }

      return {
        ...prev,
        [roleId]: currentRolePerms
      };
    });
  };

  // Change View Scope (Default or Global radio)
  const handleViewScopeChange = (moduleId: string, scope: 'Default' | 'Global') => {
    if (!selectedRoleForPermissions) return;
    const roleId = selectedRoleForPermissions.id;

    setRolePermissions(prev => {
      const currentRolePerms = { ...prev[roleId] };
      const currentModPerm = { ...currentRolePerms[moduleId] };

      if (currentModPerm.status) {
        currentModPerm.viewScope = scope;
      }

      currentRolePerms[moduleId] = currentModPerm;
      return {
        ...prev,
        [roleId]: currentRolePerms
      };
    });
  };

  // Change Add/Edit/Delete checkbox states
  const handleCheckboxChange = (moduleId: string, field: 'add' | 'edit' | 'delete') => {
    if (!selectedRoleForPermissions) return;
    const roleId = selectedRoleForPermissions.id;

    setRolePermissions(prev => {
      const currentRolePerms = { ...prev[roleId] };
      const currentModPerm = { ...currentRolePerms[moduleId] };

      if (currentModPerm.status) {
        currentModPerm[field] = !currentModPerm[field];
      }

      currentRolePerms[moduleId] = currentModPerm;
      return {
        ...prev,
        [roleId]: currentRolePerms
      };
    });
  };

  // Save Settings handler
  const handleSavePermissions = async () => {
    if (!selectedRoleForPermissions) return;
    
    // Update local roles state
    const updatedRoles = roles.map(r => 
      r.id === selectedRoleForPermissions.id 
        ? {
            ...r,
            lastModifiedBy: 'HR Manager',
            lastModifiedAt: new Date().toLocaleString('en-US', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            })
          }
        : r
    );

    setRoles(updatedRoles);
    setSelectedRoleForPermissions(null);

    // Save both updatedRoles and current rolePermissions to Supabase
    try {
      setIsDbSaving(true);
      
      const { error: rolesError } = await supabase
        .from('operational_config')
        .upsert({
          config_key: 'roles_permissions_roles',
          config_value: updatedRoles
        }, { onConflict: 'config_key' });

      const { error: matrixError } = await supabase
        .from('operational_config')
        .upsert({
          config_key: 'roles_permissions_matrix',
          config_value: rolePermissions
        }, { onConflict: 'config_key' });

      if (rolesError || matrixError) {
        throw rolesError || matrixError;
      }
      
      triggerToast(`Permissions for "${selectedRoleForPermissions.name}" saved successfully and synced with database!`);
    } catch (err) {
      console.error('Error saving roles/permissions to Supabase:', err);
      triggerToast('Error syncing changes with database, but settings saved locally.');
    } finally {
      setIsDbSaving(false);
    }
  };

  // Filter list of modules based on Search by Parent Module
  const filteredModules = useMemo(() => {
    if (selectedParentFilter === 'All Modules') {
      return MODULES_TREE;
    }

    // Map selection label to parent ids
    let selectedParentId = '';
    if (selectedParentFilter === 'People') selectedParentId = 'people';
    if (selectedParentFilter === 'Employees') selectedParentId = 'employees';
    if (selectedParentFilter === 'Employee Detail') selectedParentId = 'emp-detail';
    if (selectedParentFilter === 'Payroll') selectedParentId = 'payroll';

    if (!selectedParentId) return MODULES_TREE;

    // Filter to show parent module and all its children/descendants
    return MODULES_TREE.filter(mod => {
      if (mod.id === selectedParentId) return true;
      if (mod.parentId === selectedParentId) return true;
      if (selectedParentId === 'people') {
        // Return true for everything EXCEPT payroll and its children
        return mod.id !== 'payroll' && mod.parentId !== 'payroll';
      }
      if (selectedParentId === 'employees' && mod.parentId === 'employees') return true;
      if (selectedParentId === 'emp-detail' && mod.parentId === 'emp-detail') return true;
      if (selectedParentId === 'payroll' && mod.parentId === 'payroll') return true;
      return false;
    });
  }, [selectedParentFilter]);

  // Handle Header Sort Click
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortOrder === 'asc') {
        setSortOrder('desc');
      } else if (sortOrder === 'desc') {
        setSortField(null);
        setSortOrder(null);
      } else {
        setSortOrder('asc');
      }
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const renderSortIcon = (field: SortField) => {
    const isActive = sortField === field;
    return (
      <ChevronsUpDown 
        size={14} 
        className={`inline-block ml-1 cursor-pointer transition-colors ${
          isActive ? 'text-sky-600' : 'text-slate-400 group-hover:text-slate-600'
        }`}
      />
    );
  };

  const handleSortClick = (field: SortField) => {
    handleSort(field);
  };

  // Processed roles list for filter / search query
  const processedRoles = useMemo(() => {
    let result = [...roles];

    if (appliedQuery.trim() !== '') {
      const q = appliedQuery.toLowerCase().trim();
      result = result.filter(
        role =>
          role.name.toLowerCase().includes(q) ||
          role.remarks.toLowerCase().includes(q) ||
          role.createdBy.toLowerCase().includes(q) ||
          role.lastModifiedBy.toLowerCase().includes(q) ||
          role.status.toLowerCase().includes(q)
      );
    }

    if (sortField && sortOrder) {
      result.sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        if (sortField === 'lastModifiedBy') {
          valA = a.lastModifiedBy || a.lastModifiedAt || '';
          valB = b.lastModifiedBy || b.lastModifiedAt || '';
        }

        if (typeof valA === 'string' && typeof valB === 'string') {
          return sortOrder === 'asc' 
            ? valA.localeCompare(valB) 
            : valB.localeCompare(valA);
        } else if (typeof valA === 'number' && typeof valB === 'number') {
          return sortOrder === 'asc' ? valA - valB : valB - valA;
        }
        return 0;
      });
    }

    return result;
  }, [roles, appliedQuery, sortField, sortOrder]);

  const handleFilterClick = () => {
    setAppliedQuery(searchQuery);
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setAppliedQuery(searchQuery);
    }
  };

  // Toggle iOS switch
  const renderToggleSwitch = (moduleId: string, isChecked: boolean, isDisabled = false) => {
    return (
      <button
        type="button"
        disabled={isDisabled}
        onClick={() => handleToggleStatus(moduleId)}
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
          isChecked ? 'bg-blue-600' : 'bg-slate-200'
        } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span
          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            isChecked ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </button>
    );
  };

  // Toggle radio button
  const renderRadioButton = (moduleId: string, scope: 'Default' | 'Global', isSelected: boolean, isDisabled = false) => {
    return (
      <button
        type="button"
        disabled={isDisabled}
        onClick={() => handleViewScopeChange(moduleId, scope)}
        className={`h-4 w-4 rounded-full border border-slate-350 flex items-center justify-center focus:outline-none transition-colors ${
          isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
        } ${isSelected ? 'border-blue-600 bg-white' : 'border-slate-300'}`}
      >
        {isSelected && <div className="h-2 w-2 rounded-full bg-blue-600" />}
      </button>
    );
  };

  // Toggle checkbox
  const renderCheckbox = (moduleId: string, field: 'add' | 'edit' | 'delete', isChecked: boolean, isDisabled = false) => {
    return (
      <input
        type="checkbox"
        disabled={isDisabled}
        checked={isChecked}
        onChange={() => handleCheckboxChange(moduleId, field)}
        className={`rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer transition-colors ${
          isDisabled ? 'opacity-40 cursor-not-allowed' : ''
        }`}
      />
    );
  };

  // Render Loading spinner
  if (isDbLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-sm font-medium text-slate-500">Loading roles and permissions configuration...</p>
      </div>
    );
  }

  // Render Permissions Matrix view
  if (selectedRoleForPermissions) {
    const currentPerms = rolePermissions[selectedRoleForPermissions.id] || {};

    return (
      <div className="bg-slate-50 min-h-[calc(100vh-4rem)] flex flex-col md:flex-row animate-fade-in relative overflow-hidden">
        
        {/* Toast Notification */}
        {showToast && (
          <div className="fixed top-6 right-6 z-50 flex items-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg font-semibold animate-slide-in">
            <CheckSquare size={18} />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* LEFT COLUMN: Role Details */}
        <div className="w-full md:w-80 bg-white border-b md:border-b-0 md:border-r border-slate-200 flex flex-col shrink-0 p-6 space-y-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-800">{selectedRoleForPermissions.name}</h2>
              <span className="inline-block bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-xs font-semibold rounded-full">
                {selectedRoleForPermissions.status}
              </span>
            </div>
          </div>
          
          <div className="border-t border-slate-100 pt-5 space-y-4 text-sm">
            <div className="flex flex-col">
              <span className="text-slate-400 font-semibold text-xs uppercase tracking-wider mb-1">Assigned Employees</span>
              <span className="text-slate-800 font-semibold text-base">{selectedRoleForPermissions.employeesCount}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-slate-400 font-semibold text-xs uppercase tracking-wider mb-1">Remarks</span>
              <span className="text-slate-600 font-medium leading-relaxed">{selectedRoleForPermissions.remarks}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-slate-400 font-semibold text-xs uppercase tracking-wider mb-1">Created by</span>
              <span className="text-slate-700 font-semibold">{selectedRoleForPermissions.createdBy}</span>
              <span className="text-xs text-slate-400">{selectedRoleForPermissions.createdAt}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-slate-400 font-semibold text-xs uppercase tracking-wider mb-1">Last Modified by</span>
              {selectedRoleForPermissions.lastModifiedBy ? (
                <>
                  <span className="text-slate-700 font-semibold">{selectedRoleForPermissions.lastModifiedBy}</span>
                  <span className="text-xs text-slate-400">{selectedRoleForPermissions.lastModifiedAt}</span>
                </>
              ) : (
                <span className="text-slate-400 font-semibold">-</span>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Permissions configuration matrix */}
        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* Breadcrumbs and Close Button */}
          <div className="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between shadow-sm shrink-0">
            
            {/* Custom role switching breadcrumbs */}
            <div className="flex items-center space-x-2 text-sm text-slate-500">
              <div 
                onClick={() => setSelectedRoleForPermissions(null)}
                className="p-1 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
              >
                <Home size={16} />
              </div>
              <ChevronRight size={14} className="text-slate-300" />
              <span 
                onClick={() => setSelectedRoleForPermissions(null)}
                className="hover:text-slate-700 transition-colors cursor-pointer"
              >
                Roles
              </span>
              <ChevronRight size={14} className="text-slate-300" />
              <span className="hover:text-slate-700 transition-colors cursor-pointer">Permissions</span>
              <ChevronRight size={14} className="text-slate-300" />
              
              {/* Dropdown Role Selector Pill */}
              <div className="relative inline-block">
                <button
                  onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                  className="flex items-center gap-1 bg-sky-50 text-sky-700 hover:bg-sky-100 px-3 py-1 rounded-md font-semibold text-xs transition-colors focus:outline-none"
                >
                  <span>{selectedRoleForPermissions.name}</span>
                  <ChevronDown size={12} className="text-sky-500" />
                </button>
                {isRoleDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsRoleDropdownOpen(false)} />
                    <div className="absolute left-0 mt-1.5 w-40 bg-white rounded-lg shadow-lg border border-slate-200 z-20 py-1">
                      {roles.map(r => (
                        <button
                          key={r.id}
                          onClick={() => {
                            setSelectedRoleForPermissions(r);
                            setIsRoleDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-slate-50 ${
                            r.id === selectedRoleForPermissions.id ? 'text-sky-600 bg-sky-50/50' : 'text-slate-700'
                          }`}
                        >
                          {r.name}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Close cross icon button */}
            <button
              onClick={() => setSelectedRoleForPermissions(null)}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors focus:outline-none"
              title="Close Panel"
            >
              <X size={20} />
            </button>
          </div>

          {/* Configuration Tabs Bar */}
          <div className="px-6 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
            <div className="flex space-x-6 text-sm font-semibold">
              <button
                onClick={() => setActiveTab('permissions')}
                className={`py-3 border-b-2 transition-colors focus:outline-none ${
                  activeTab === 'permissions' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                Permissions
              </button>
              <button
                onClick={() => setActiveTab('employees')}
                className={`py-3 border-b-2 transition-colors focus:outline-none ${
                  activeTab === 'employees' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                Employees
              </button>
            </div>
          </div>

          {/* FILTER ROW: Parent Module Dropdown and Save Button */}
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-4 shrink-0">
            
            {/* Search by parent module Dropdown */}
            <div className="relative w-full max-w-xs md:max-w-md">
              <button
                onClick={() => setIsParentFilterDropdownOpen(!isParentFilterDropdownOpen)}
                className="w-full flex items-center justify-between px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors shadow-sm focus:outline-none"
              >
                <span className="text-sm font-medium">{selectedParentFilter}</span>
                <ChevronDown size={16} className="text-slate-400" />
              </button>
              
              {isParentFilterDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsParentFilterDropdownOpen(false)} />
                  <div className="absolute left-0 mt-1.5 w-full bg-white rounded-lg shadow-lg border border-slate-200 z-20 py-1.5 max-h-60 overflow-y-auto">
                    {dropdownOptions.map(parentName => (
                      <button
                        key={parentName}
                        onClick={() => {
                          setSelectedParentFilter(parentName);
                          setIsParentFilterDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-slate-50 ${
                          parentName === selectedParentFilter ? 'text-blue-600 bg-blue-50/30 font-semibold' : 'text-slate-700'
                        }`}
                      >
                        {parentName}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Save Button */}
            <button
              onClick={handleSavePermissions}
              disabled={isDbSaving}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm hover:shadow transition-all whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDbSaving ? 'Saving...' : 'Save'}
            </button>
          </div>

          {/* PERMISSIONS MATRIX TABLE */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'permissions' ? (
              <table className="w-full text-left border-collapse min-w-[650px] border border-slate-200">
                <thead className="bg-slate-50 sticky top-0 z-10 text-slate-500 border-b border-slate-200">
                  <tr className="text-xs uppercase font-bold text-slate-500 border-b border-slate-200">
                    <th rowSpan={2} className="px-6 py-4 font-semibold text-left align-middle w-5/12 border-r border-slate-200/60">Module</th>
                    <th colSpan={3} className="px-4 py-2 font-semibold text-center border-b border-slate-200/60 border-r border-slate-200/60">View</th>
                    <th rowSpan={2} className="px-4 py-4 font-semibold text-center align-middle w-1/12 border-r border-slate-200/60">Add</th>
                    <th rowSpan={2} className="px-4 py-4 font-semibold text-center align-middle w-1/12 border-r border-slate-200/60">Edit</th>
                    <th rowSpan={2} className="px-4 py-4 font-semibold text-center align-middle w-1/12">Delete</th>
                  </tr>
                  <tr className="text-xs uppercase font-bold text-slate-500 border-b border-slate-200/60">
                    <th className="px-4 py-2 font-semibold text-center w-1/12 border-r border-slate-200/60">Status</th>
                    <th className="px-4 py-2 font-semibold text-center w-1/12 border-r border-slate-200/60">Default</th>
                    <th className="px-4 py-2 font-semibold text-center w-1/12 border-r border-slate-200/60">Global</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredModules.map((mod) => {
                    const isExpanded = expandedParents.includes(mod.parentId || '');
                    
                    // Hide submodules if parent is collapsed
                    if (!mod.isParent && mod.parentId && !expandedParents.includes(mod.parentId)) return null;

                    const mPerm = currentPerms[mod.id] || { status: false, viewScope: null, add: false, edit: false, delete: false };
                    
                    // Determine if child is disabled because parent is toggled off
                    let isParentOff = false;
                    if (mod.parentId && mod.parentId !== 'people') {
                      const parentPerm = currentPerms[mod.parentId];
                      if (parentPerm && !parentPerm.status) {
                        isParentOff = true;
                      }
                    }

                    // Tree branch depth styles
                    let depthClass = '';
                    if (
                      mod.id === 'personal-info' || 
                      mod.id === 'role-info' || 
                      mod.id === 'contact-info' || 
                      mod.id === 'family-details' ||
                      mod.parentId === 'payroll-corner' ||
                      mod.parentId === 'payroll-runs-parent'
                    ) {
                      depthClass = 'pl-16'; // grandchild depth
                    } else if (!mod.isParent) {
                      depthClass = 'pl-10'; // child depth
                    } else if (mod.parentId) {
                      depthClass = 'pl-6'; // nested parent submodule (e.g. Employees / Employee Detail)
                    }

                    return (
                      <tr 
                        key={mod.id} 
                        className={`transition-colors hover:bg-slate-50/30 ${
                          mod.isParent ? 'bg-slate-50/20 font-semibold text-slate-800' : 'bg-white text-slate-600 font-medium'
                        }`}
                      >
                        {/* Module Name / Branch column */}
                        <td className="px-6 py-3.5 align-middle border-r border-slate-100 border-b border-slate-100">
                          <div className={`flex items-center ${depthClass}`}>
                            {mod.isParent ? (
                              <button
                                type="button"
                                onClick={() => toggleExpand(mod.id)}
                                className="mr-2.5 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                              >
                                <span className="inline-block p-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-500 font-bold leading-none select-none text-[10px]">
                                  {expandedParents.includes(mod.id) ? '－' : '＋'}
                                </span>
                              </button>
                            ) : (
                              <div className="relative mr-2 w-3.5 h-3 flex items-center">
                                {/* Tree structure connectors */}
                                <div className="absolute left-[-12px] top-[-14px] bottom-1/2 w-4 border-l-2 border-b-2 border-slate-200 rounded-bl-sm" />
                              </div>
                            )}
                            <span className="text-sm select-none">{mod.name}</span>
                            <Info size={14} className="ml-1.5 text-slate-350 cursor-help" />
                          </div>
                        </td>

                        {/* Status Toggle Switch */}
                        <td className="px-4 py-3.5 text-center align-middle border-r border-slate-100 border-b border-slate-100">
                          {renderToggleSwitch(mod.id, mPerm.status, isParentOff)}
                        </td>

                        {/* Default Radio */}
                        <td className="px-4 py-3.5 text-center align-middle border-r border-slate-100 border-b border-slate-100">
                          {renderRadioButton(mod.id, 'Default', mPerm.viewScope === 'Default', !mPerm.status || isParentOff)}
                        </td>

                        {/* Global Radio */}
                        <td className="px-4 py-3.5 text-center align-middle border-r border-slate-100 border-b border-slate-100">
                          {renderRadioButton(mod.id, 'Global', mPerm.viewScope === 'Global', !mPerm.status || isParentOff)}
                        </td>

                        {/* Add Checkbox */}
                        <td className="px-4 py-3.5 text-center align-middle border-r border-slate-100 border-b border-slate-100">
                          {mod.hasAddEdit ? (
                            renderCheckbox(mod.id, 'add', mPerm.add, !mPerm.status || isParentOff)
                          ) : (
                            <span className="text-slate-350 select-none">-</span>
                          )}
                        </td>

                        {/* Edit Checkbox */}
                        <td className="px-4 py-3.5 text-center align-middle border-r border-slate-100 border-b border-slate-100">
                          {mod.hasAddEdit ? (
                            renderCheckbox(mod.id, 'edit', mPerm.edit, !mPerm.status || isParentOff)
                          ) : (
                            <span className="text-slate-350 select-none">-</span>
                          )}
                        </td>

                        {/* Delete Checkbox */}
                        <td className="px-4 py-3.5 text-center align-middle border-b border-slate-100">
                          {mod.hasAddEdit ? (
                            renderCheckbox(mod.id, 'delete', mPerm.delete, !mPerm.status || isParentOff)
                          ) : (
                            <span className="text-slate-350 select-none">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-slate-400 font-medium">
                Employees assigned to this role display here.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Main Roles Listing view
  return (
    <div className="p-6 bg-slate-50 min-h-screen space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center space-x-2 text-sm text-slate-500">
        <div className="p-1 hover:bg-slate-100 rounded-md transition-colors cursor-pointer">
          <Home size={16} />
        </div>
        <ChevronRight size={14} className="text-slate-300" />
        <span className="text-sky-600 font-medium cursor-pointer">Roles</span>
      </div>

      {/* Header Block */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600 shadow-sm border border-sky-100">
            <Shield size={20} />
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-800">Roles</h1>
            <span className="bg-sky-50 text-sky-600 border border-sky-100 px-2.5 py-0.5 text-xs font-semibold rounded-full">
              {roles.length} Roles
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end md:self-auto relative">
          <button
            onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
            className="p-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-lg transition-colors"
          >
            <MoreVertical size={18} />
          </button>

          {isMoreMenuOpen && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setIsMoreMenuOpen(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 z-20 py-1.5">
                <button 
                  onClick={() => { 
                    setIsMoreMenuOpen(false); 
                    setRoles(INITIAL_ROLES); 
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Reset to Mock Data
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="flex-1 relative w-full group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyPress}
              placeholder="Filter Results..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all placeholder:text-slate-400"
            />
          </div>
          <button
            onClick={handleFilterClick}
            className="w-full md:w-auto px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer whitespace-nowrap"
          >
            Filter
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 sticky top-0 text-slate-500 border-b border-slate-100">
              <tr className="text-xs uppercase font-semibold">
                <th className="px-6 py-4">No.</th>
                <th 
                  className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors group"
                  onClick={() => handleSortClick('name')}
                >
                  <div className="flex items-center">
                    Role {renderSortIcon('name')}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors group"
                  onClick={() => handleSortClick('status')}
                >
                  <div className="flex items-center">
                    Status {renderSortIcon('status')}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors group"
                  onClick={() => handleSortClick('employeesCount')}
                >
                  <div className="flex items-center">
                    Employees {renderSortIcon('employeesCount')}
                  </div>
                </th>
                <th className="px-6 py-4">Remarks</th>
                <th 
                  className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors group"
                  onClick={() => handleSortClick('lastModifiedBy')}
                >
                  <div className="flex items-center">
                    Last Modified by {renderSortIcon('lastModifiedBy')}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors group"
                  onClick={() => handleSortClick('createdBy')}
                >
                  <div className="flex items-center">
                    Created by {renderSortIcon('createdBy')}
                  </div>
                </th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {processedRoles.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                    No roles found matching the search criteria.
                  </td>
                </tr>
              ) : (
                processedRoles.map((role, index) => (
                  <tr key={role.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 text-slate-500 font-medium">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      {role.name}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        role.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-50 text-slate-500 border-slate-200'
                      }`}>
                        {role.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-medium">
                      {role.employeesCount}
                    </td>
                    <td className="px-6 py-4 text-slate-500 max-w-[200px] truncate" title={role.remarks}>
                      {role.remarks}
                    </td>
                    <td className="px-6 py-4">
                      {role.lastModifiedBy ? (
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-700">{role.lastModifiedBy}</span>
                          <span className="text-xs text-slate-400">{role.lastModifiedAt}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-700">{role.createdBy}</span>
                        <span className="text-xs text-slate-400">{role.createdAt}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedRoleForPermissions(role)}
                          className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-md transition-colors cursor-pointer"
                          title="Configure Permissions"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Role Details Modal */}
      {isViewModalOpen && selectedRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px] animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-slate-200 flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">Role Details</h3>
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  setSelectedRole(null);
                }}
                className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-3 gap-2 border-b border-slate-100 pb-3">
                <span className="text-slate-400 font-medium">Role Name:</span>
                <span className="col-span-2 text-slate-800 font-semibold">{selectedRole.name}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 border-b border-slate-100 pb-3">
                <span className="text-slate-400 font-medium">Status:</span>
                <span className="col-span-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                    selectedRole.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-50 text-slate-500 border-slate-200'
                  }`}>
                    {selectedRole.status}
                  </span>
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 border-b border-slate-100 pb-3">
                <span className="text-slate-400 font-medium">Active Employees:</span>
                <span className="col-span-2 text-slate-800 font-semibold">{selectedRole.employeesCount}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 border-b border-slate-100 pb-3">
                <span className="text-slate-400 font-medium">Remarks/Description:</span>
                <span className="col-span-2 text-slate-600">{selectedRole.remarks}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 border-b border-slate-100 pb-3">
                <span className="text-slate-400 font-medium">Created by:</span>
                <span className="col-span-2 text-slate-600">
                  {selectedRole.createdBy} <span className="text-xs text-slate-400">({selectedRole.createdAt})</span>
                </span>
              </div>
              {selectedRole.lastModifiedBy && (
                <div className="grid grid-cols-3 gap-2 pb-1">
                  <span className="text-slate-400 font-medium">Last Modified by:</span>
                  <span className="col-span-2 text-slate-600">
                    {selectedRole.lastModifiedBy} <span className="text-xs text-slate-400">({selectedRole.lastModifiedAt})</span>
                  </span>
                </div>
              )}
              
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => {
                    setIsViewModalOpen(false);
                    setSelectedRole(null);
                  }}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolesPermissions;

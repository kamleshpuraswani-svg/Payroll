
import React, { useState, useEffect } from 'react';
import EmployeeList from './EmployeeList';
import EditEmployeeProfile from './EditEmployeeProfile';
import EmployeeSalaryHistory from './EmployeeSalaryHistory';

interface WorkforceProps {
  userRole?: string;
}

const Workforce: React.FC<WorkforceProps> = ({ userRole }) => {
  const [view, setView] = useState<'LIST' | 'EDIT' | 'VIEW_HISTORY'>('LIST');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  // On mount: restore view from URL
  useEffect(() => {
    const path = window.location.pathname;
    const editMatch = path.match(/^\/hr\/employees\/([^/]+)\/edit$/);
    const historyMatch = path.match(/^\/hr\/employees\/([^/]+)\/salary-history$/);
    if (editMatch) {
      setSelectedEmployeeId(editMatch[1]);
      setView('EDIT');
    } else if (historyMatch) {
      setSelectedEmployeeId(historyMatch[1]);
      setView('VIEW_HISTORY');
    }
  }, []);

  // Sync URL when view or selectedEmployeeId changes
  useEffect(() => {
    if (view === 'LIST') {
      if (window.location.pathname !== '/hr/employees') {
        window.history.pushState({}, '', '/hr/employees');
      }
    } else if (view === 'EDIT' && selectedEmployeeId) {
      const url = `/hr/employees/${selectedEmployeeId}/edit`;
      if (window.location.pathname !== url) {
        window.history.pushState({}, '', url);
      }
    } else if (view === 'VIEW_HISTORY' && selectedEmployeeId) {
      const url = `/hr/employees/${selectedEmployeeId}/salary-history`;
      if (window.location.pathname !== url) {
        window.history.pushState({}, '', url);
      }
    }
  }, [view, selectedEmployeeId]);

  const handleEdit = (id: string) => {
    setSelectedEmployeeId(id);
    setView('EDIT');
  };

  const handleView = (id: string) => {
    setSelectedEmployeeId(id);
    setView('VIEW_HISTORY');
  };

  const handleBack = () => {
    setSelectedEmployeeId(null);
    setView('LIST');
  };

  return (
    <>
      {view === 'LIST' && <EmployeeList onEdit={handleEdit} onView={handleView} userRole={userRole} />}
      {view === 'EDIT' && selectedEmployeeId && (
        <EditEmployeeProfile
          employeeId={selectedEmployeeId}
          onBack={() => setView('VIEW_HISTORY')}
          onViewHistory={() => setView('VIEW_HISTORY')}
          isReadOnly={false}
          userRole={userRole}
        />
      )}
      {view === 'VIEW_HISTORY' && selectedEmployeeId && (
        <EmployeeSalaryHistory
          employeeId={selectedEmployeeId}
          onBack={handleBack}
          onEdit={handleEdit}
          userRole={userRole}
        />
      )}
    </>
  );
};

export default Workforce;

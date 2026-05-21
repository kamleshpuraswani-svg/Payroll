
import React, { useState } from 'react';
import EmployeeList from './EmployeeList';
import EditEmployeeProfile from './EditEmployeeProfile';
import EmployeeSalaryHistory from './EmployeeSalaryHistory';

interface WorkforceProps {
  userRole?: string;
}

const Workforce: React.FC<WorkforceProps> = ({ userRole }) => {
  const [view, setView] = useState<'LIST' | 'EDIT' | 'VIEW_HISTORY'>('LIST');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

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

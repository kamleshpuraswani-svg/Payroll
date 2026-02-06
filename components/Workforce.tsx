
import React, { useState } from 'react';
import EmployeeList from './EmployeeList';
import EditEmployeeProfile from './EditEmployeeProfile';
import EmployeeSalaryHistory from './EmployeeSalaryHistory';

const Workforce: React.FC = () => {
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
      {view === 'LIST' && <EmployeeList onEdit={handleEdit} onView={handleView} />}
      {view === 'EDIT' && (
        <EditEmployeeProfile 
          onBack={handleBack} 
          onViewHistory={() => setView('VIEW_HISTORY')}
          isReadOnly={false} 
        />
      )}
      {view === 'VIEW_HISTORY' && selectedEmployeeId && (
        <EmployeeSalaryHistory 
          employeeId={selectedEmployeeId}
          onBack={handleBack}
        />
      )}
    </>
  );
};

export default Workforce;

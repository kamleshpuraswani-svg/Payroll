const fs = require('fs');
const file = 'd:/Payroll/Payroll/components/EmployeeSalaryHistory.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Change the main container to CSS Grid and remove Left Column wrapper
content = content.replace(
  '<div className="flex flex-col lg:flex-row gap-6 w-full">',
  '<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full items-start">'
);

content = content.replace(
  '{/* Left Column: Trend Graph, Tax Liability, Loan Balance */}\n                <div className="flex flex-col gap-6 w-full lg:w-7/12">',
  ''
);

// 2. Add col-span-2 to Gross vs. Net Pay Trend
content = content.replace(
  '<div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm w-full">',
  '<div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm w-full col-span-1 lg:col-span-2">'
);

// 3. Remove closing div for Left Column and opening div for Right Column Wrapper
content = content.replace(
  '</div>\n            </div>\n\n              {/* Right Column Wrapper */}\n              <div className="flex flex-col gap-6 w-full lg:w-5/12">',
  ''
);

// 4. Remove closing div for Right Column Wrapper (before Salary History Table)
content = content.replace(
  '                </div>\n              </div>\n            </div>\n\n              {/* 4. Salary History Table */}',
  '                </div>\n            </div>\n\n              {/* 4. Salary History Table */}'
);

fs.writeFileSync(file, content, 'utf8');

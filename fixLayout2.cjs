const fs = require('fs');
const file = 'd:/Payroll/Payroll/components/EmployeeSalaryHistory.tsx';
let content = fs.readFileSync(file, 'utf8');

// 2. Add col-span-2 to Gross vs. Net Pay Trend
content = content.replace(
  '{/* Left Column: Trend Graph, Tax Liability, Loan Balance */}\r\n                <div className="flex flex-col gap-6 w-full lg:w-7/12">',
  ''
);

content = content.replace(
  '{/* Left Column: Trend Graph, Tax Liability, Loan Balance */}\n                <div className="flex flex-col gap-6 w-full lg:w-7/12">',
  ''
);

fs.writeFileSync(file, content, 'utf8');

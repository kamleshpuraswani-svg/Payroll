
const fs = require("fs");
const file = "d:/Payroll/Payroll/components/IncomeTaxDeclarationSettings.tsx";
let code = fs.readFileSync(file, "utf8");

// The exact new limits array string to replace the old ones
const newLimitsStr = `
        { id: \x27new-pe\x27, section: \x27Previous Employment Income\x27, limit: \x27-\x27, description: \x27Income and TDS details from previous employer(s) in the current financial year\x27, regime: \x27Old\x27 },
        { id: \x2720\x27, section: \x27House Rent Allowance (HRA)\x27, limit: \x27Least of: actual HRA, 50%/40% of basic (metro/non-metro), or rent minus 10% of basic\x27, description: \x27Deduction for rent paid, including HRA exemption based on actual rent paid, basic salary, and city of residence, or deduction for rent paid when HRA is not received from the employer\x27, regime: \x27Old\x27 },
        { id: \x2714\x27, section: \x2780GG - Rent Paid Without HRA\x27, limit: \x27Least of: ?5,000/month, 25% of income, or rent minus 10% of income\x27, description: \x27Deduction for rent paid where HRA is not received from employer\x27, regime: \x27Old\x27 },
        { id: \x2719\x27, section: \x27Home Loan Interest (Section 24B)\x27, limit: \x272,00,000\x27, description: \x27Deduction on interest paid on home loan. ?2,00,000 for self-occupied; no limit for let-out property\x27, regime: \x27Old\x27 },
        { id: \x27new-lo\x27, section: \x27Income from Let Out Property\x27, limit: \x27-\x27, description: \x27Net annual income from rented property after property tax, 30% standard deduction and home loan interest\x27, regime: \x27Old\x27 },
        { id: \x27new-os\x27, section: \x27Other Sources of Income\x27, limit: \x27-\x27, description: \x27Taxable income from interest, dividends, family pension and other sources\x27, regime: \x27Old\x27 },
        { id: \x271\x27, section: \x2780C Investments\x27, limit: \x271,50,000\x27, description: \x27Deduction on investments in specified instruments. Combined limit ?1,50,000\x27, regime: \x27Old\x27 },
        { id: \x271a\x27, section: \x2780C Investments\x27, displaySection: \x27Life insurance\x27, limit: \x27--\x27, description: \x27Life insurance premium\x27, regime: \x27Old\x27, isSubSection: true },
        { id: \x271b\x27, section: \x2780C Investments\x27, displaySection: \x27PPF\x27, limit: \x27--\x27, description: \x27Public Provident Fund (PPF)\x27, regime: \x27Old\x27, isSubSection: true },
        { id: \x271c\x27, section: \x2780C Investments\x27, displaySection: \x27EPF\x27, limit: \x27--\x27, description: \x27Employee Provident Fund (EPF) contributions\x27, regime: \x27Old\x27, isSubSection: true },
        { id: \x271d\x27, section: \x2780C Investments\x27, displaySection: \x27ELSS\x27, limit: \x27--\x27, description: \x27Equity Linked Savings Scheme (ELSS) mutual funds\x27, regime: \x27Old\x27, isSubSection: true },
        { id: \x271e\x27, section: \x2780C Investments\x27, displaySection: \x27NSC\x27, limit: \x27--\x27, description: \x27National Savings Certificate (NSC)\x27, regime: \x27Old\x27, isSubSection: true },
        { id: \x271f\x27, section: \x2780C Investments\x27, displaySection: \x27SSY\x27, limit: \x27--\x27, description: \x27Sukanya Samriddhi Yojana (SSY)\x27, regime: \x27Old\x27, isSubSection: true },
        { id: \x271g\x27, section: \x2780C Investments\x27, displaySection: \x27Tax-saving FD\x27, limit: \x27--\x27, description: \x275 year tax-saving fixed deposits\x27, regime: \x27Old\x27, isSubSection: true },
        { id: \x271h\x27, section: \x2780C Investments\x27, displaySection: \x27SCSS\x27, limit: \x27--\x27, description: \x27Senior Citizen Savings Scheme (SCSS)\x27, regime: \x27Old\x27, isSubSection: true },
        { id: \x271i\x27, section: \x2780C Investments\x27, displaySection: \x27Home loan principal\x27, limit: \x27--\x27, description: \x27Home loan principal repayment\x27, regime: \x27Old\x27, isSubSection: true },
        { id: \x271j\x27, section: \x2780C Investments\x27, displaySection: \x27Stamp duty\x27, limit: \x27--\x27, description: \x27Stamp duty and registration charges on property purchase\x27, regime: \x27Old\x27, isSubSection: true },
        { id: \x271k\x27, section: \x2780C Investments\x27, displaySection: \x27Tuition fees\x27, limit: \x27--\x27, description: \x27Tuition fees paid for up to two children\x27, regime: \x27Old\x27, isSubSection: true },
        { id: \x271l\x27, section: \x2780C Investments\x27, displaySection: \x2780CCC\x27, limit: \x27--\x27, description: \x27Pension Fund Contribution\x27, regime: \x27Old\x27, isSubSection: true },
        { id: \x271m\x27, section: \x2780C Investments\x27, displaySection: \x2780CCD (1)\x27, limit: \x2710% of salary\x27, description: \x27Employee NPS Contribution (Up to 10% of basic + DA)\x27, regime: \x27Old\x27, isSubSection: true },
        { id: \x276\x27, section: \x2780D Medical Insurance\x27, limit: \x2725,000\x27, description: \x27Self, Spouse, Children (below 60 years)\x27, regime: \x27Old\x27 },
        { id: \x276a\x27, section: \x2780D Medical Insurance\x27, displaySection: \x27Parents (<60)\x27, limit: \x2750,000\x27, description: \x27Self, Spouse, Children & Parents (below 60 years)\x27, regime: \x27Old\x27, isSubSection: true },
        { id: \x276b\x27, section: \x2780D Medical Insurance\x27, displaySection: \x27Parents (>60)\x27, limit: \x2775,000\x27, description: \x27Self, Spouse, Children (below 60 years) & Parents (Above 60 years)\x27, regime: \x27Old\x27, isSubSection: true },
        { id: \x276c\x27, section: \x2780D Medical Insurance\x27, displaySection: \x27All (>60)\x27, limit: \x271,00,000\x27, description: \x27Self, Spouse, Children & Parents (Above 60 years)\x27, regime: \x27Old\x27, isSubSection: true },
        { id: \x276d\x27, section: \x2780D Medical Insurance\x27, displaySection: \x27HUF (<60)\x27, limit: \x2725,000\x27, description: \x27Members of HUF (below 60 years)\x27, regime: \x27Old\x27, isSubSection: true },
        { id: \x276e\x27, section: \x2780D Medical Insurance\x27, displaySection: \x27HUF (>60)\x27, limit: \x2750,000\x27, description: \x27Members of HUF (Above 60 years)\x27, regime: \x27Old\x27, isSubSection: true },
        { id: \x276f\x27, section: \x2780D Medical Insurance\x27, displaySection: \x27Preventive checkup\x27, limit: \x275,000\x27, description: \x27Preventive health checkup\x27, regime: \x27Old\x27, isSubSection: true },
        { id: \x274\x27, section: \x2780CCD(1B) - Additional NPS Contribution\x27, limit: \x2750,000\x27, description: \x2780CCD(1B) extra ?50,000 above 80C ?1,50,000 limit\x27, regime: \x27Old\x27 },
        { id: \x275\x27, section: \x2780CCD(2) - Employer NPS Contribution\x27, limit: \x2714% of salary (Govt.) / 10% (Others)\x27, description: \x27Employer NPS contribution\x27, regime: \x27Old\x27 },
        { id: \x279\x27, section: \x2780DDB - Medical Treatment\x27, limit: \x2740,000 / (?1,00,000 for senior citizens)\x27, description: \x27Treatment of specified diseases\x27, regime: \x27Old\x27 },
        { id: \x27new-oie\x27, section: \x27Other Investments & Exemptions\x27, limit: \x27-\x27, description: \x27Disability deductions and other specific investment instruments\x27, regime: \x27Old\x27 },
        { id: \x278\x27, section: \x27Other Investments & Exemptions\x27, displaySection: \x2780DD\x27, limit: \x2775,000 / 1,25,000 (severe)\x27, description: \x27Disabled dependent medical expenses\x27, regime: \x27Old\x27, isSubSection: true },
        { id: \x2710\x27, section: \x27Other Investments & Exemptions\x27, displaySection: \x2780E\x27, limit: \x27Actual\x27, description: \x27Interest on education loan\x27, regime: \x27Old\x27, isSubSection: true },
        { id: \x2712\x27, section: \x27Other Investments & Exemptions\x27, displaySection: \x2780EEA\x27, limit: \x271,50,000\x27, description: \x27Interest on affordable housing home loan\x27, regime: \x27Old\x27, isSubSection: true },
        { id: \x2713\x27, section: \x27Other Investments & Exemptions\x27, displaySection: \x2780G\x27, limit: \x27--\x27, description: \x27Donations\x27, regime: \x27Old\x27, isSubSection: true },
        { id: \x2713a\x27, section: \x27Other Investments & Exemptions\x27, displaySection: \x27PM Relief\x27, limit: \x27100%\x27, description: \x27PM Relief Fund\x27, regime: \x27Old\x27, isSubSection: true },
        { id: \x2715\x27, section: \x27Other Investments & Exemptions\x27, displaySection: \x2780GGB/GGC\x27, limit: \x27Actual amount\x27, description: \x27Political party donations\x27, regime: \x27Old\x27, isSubSection: true },
        { id: \x2716\x27, section: \x27Other Investments & Exemptions\x27, displaySection: \x2780TTA\x27, limit: \x2710,000\x27, description: \x27Interest on savings account\x27, regime: \x27Old\x27, isSubSection: true },
        { id: \x2718\x27, section: \x27Other Investments & Exemptions\x27, displaySection: \x2780U\x27, limit: \x2775,000 / 1,25,000 (severe)\x27, description: \x27Self disability deduction\x27, regime: \x27Old\x27, isSubSection: true },
        { id: \x2721\x27, section: \x27Other Investments & Exemptions\x27, displaySection: \x2710(14)\x27, limit: \x27--\x27, description: \x27Special Allowances\x27, regime: \x27Old\x27, isSubSection: true },
        { id: \x2721a\x27, section: \x27Other Investments & Exemptions\x27, displaySection: \x27LTA\x27, limit: \x27Actual\x27, description: \x27Leave travel allowance\x27, regime: \x27Old\x27, isSubSection: true },
        { id: \x2722\x27, section: \x27Other Investments & Exemptions\x27, displaySection: \x2716(ia)\x27, limit: \x2775,000\x27, description: \x27Standard Deduction (salaried)\x27, regime: \x27Old\x27, isSubSection: true },
        { id: \x27new-pt\x27, section: \x27Professional Tax\x27, limit: \x27-\x27, description: \x27Professional tax paid during the financial year\x27, regime: \x27Old\x27 }
`;

// Extract old individual limits (from index 0 to before New Regime limits)
let startIndex1 = code.indexOf("const defaultLimits = [") + "const defaultLimits = [".length;
let endIndex1 = code.indexOf("{ id: \x2723\x27", startIndex1);

code = code.substring(0, startIndex1) + newLimitsStr + code.substring(endIndex1);

// Now for the useState initialization
let startIndex2 = code.indexOf("const [limits, setLimits] = useState([") + "const [limits, setLimits] = useState([".length;
let endIndex2 = code.indexOf("{ id: \x2723\x27", startIndex2);

code = code.substring(0, startIndex2) + newLimitsStr + code.substring(endIndex2);

// Now update UI expansion logic
// line 2095: if (l.section === \x2780C\x27 && l.isSubSection) {
code = code.replace(/if \(l\.section === \x2780C\x27 && l\.isSubSection\) \{/g, "if (l.section === \x2780C Investments\x27 && l.isSubSection) {");
// line 2098: if (l.section === \x2780D\x27 && l.isSubSection) {
code = code.replace(/if \(l\.section === \x2780D\x27 && l\.isSubSection\) \{/g, "if (l.section === \x2780D Medical Insurance\x27 && l.isSubSection) {");
// line 2101: if (l.section === \x2780G\x27 && l.isSubSection) {
code = code.replace(/if \(l\.section === \x2780G\x27 && l\.isSubSection\) \{/g, "if (l.section === \x2780DDB - Medical Treatment\x27 && l.isSubSection) {");
// line 2104: if (l.section === \x2710\(14\)\x27 && l.isSubSection) {
code = code.replace(/if \(l\.section === \x2710\\(14\\)\x27 && l\.isSubSection\) \{/g, "if (l.section === \x27Other Investments & Exemptions\x27 && l.isSubSection) {");

// line 2109: const hasSubsections = (limit.section === \x2780C\x27 || limit.section === \x2780D\x27 || limit.section === \x2780G\x27 || limit.section === \x2710(14)\x27)
code = code.replace(/limit\.section === \x2780C\x27 \|\| limit\.section === \x2780D\x27 \|\| limit\.section === \x2780G\x27 \|\| limit\.section === \x2710\(14\)\x27/g, 
"limit.section === \x2780C Investments\x27 || limit.section === \x2780D Medical Insurance\x27 || limit.section === \x2780DDB - Medical Treatment\x27 || limit.section === \x27Other Investments & Exemptions\x27 || limit.section === \x27Other Sources of Income\x27");

// line 2121: if (limit.section === \x2780C\x27) {
code = code.replace(/if \(limit\.section === \x2780C\x27\) \{/g, "if (limit.section === \x2780C Investments\x27 || limit.section === \x27Other Sources of Income\x27) {");
// line 2123: } else if (limit.section === \x2780D\x27) {
code = code.replace(/\} else if \(limit\.section === \x2780D\x27\) \{/g, "} else if (limit.section === \x2780D Medical Insurance\x27) {");
// line 2125: } else if (limit.section === \x2780G\x27) {
code = code.replace(/\} else if \(limit\.section === \x2780G\x27\) \{/g, "} else if (limit.section === \x2780DDB - Medical Treatment\x27) {");
// line 2127: } else if (limit.section === \x2710(14)\x27) {
code = code.replace(/\} else if \(limit\.section === \x2710\\(14\\)\x27\) \{/g, "} else if (limit.section === \x27Other Investments & Exemptions\x27) {");

// fetchConfig map legacy:
code = code.replace(/if \(l\.regime === \x27New\x27\) \{/g, "if (l.regime === \x27New\x27 || (l.regime === \x27Old\x27 && !l.ageGroup)) {");
code = code.replace(/const newDef = defaultLimits\.find\(d => d\.id === l\.id && d\.regime === \x27New\x27\);/g, "const newDef = defaultLimits.find(d => d.id === l.id && d.regime === l.regime);");

fs.writeFileSync(file, code);
console.log("Done structural replacements");


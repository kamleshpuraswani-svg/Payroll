
const fs = require("fs");
const file = "d:/Payroll/Payroll/components/IncomeTaxDeclarationSettings.tsx";
let code = fs.readFileSync(file, "utf8");

// We need to do the following string replacements for section names to map them:
const replacements = [
    { old: "10(13A)", new: "House Rent Allowance (HRA)" },
    { old: "80GG", new: "80GG - Rent Paid Without HRA" },
    { old: "24(b)", new: "Home Loan Interest (Section 24B)" },
    { old: "80C", new: "80C Investments" },
    { old: "80D", new: "80D Medical Insurance" },
    { old: "80CCD(1B)", new: "80CCD(1B) - Additional NPS Contribution" },
    { old: "80CCD(2)", new: "80CCD(2) - Employer NPS Contribution" },
    { old: "80DDB", new: "80DDB - Medical Treatment" }
];

replacements.forEach(r => {
    // Replace section name in limits arrays safely
    code = code.replace(new RegExp(`section: .${r.old}.`, "g"), `section: \x27${r.new}\x27`);
    
    // Replace hardcoded checks in the UI
    code = code.replace(new RegExp(`l\\.section === .${r.old}.`, "g"), `l.section === \x27${r.new}\x27`);
    code = code.replace(new RegExp(`limit\\.section === .${r.old}.`, "g"), `limit.section === \x27${r.new}\x27`);
});

fs.writeFileSync(file, code);
console.log("Done initial replacements");



const fs = require("fs");
let code = fs.readFileSync("components/IncomeTaxDeclarationSettings.tsx", "utf8");

const startStr = "                let mergedLimits = [";
const endStr = "                setLimits(mergedLimits);";
const startIndex = code.indexOf(startStr);
const endIndex = code.indexOf(endStr);

if (startIndex === -1 || endIndex === -1) {
    console.error("Could not find fetchConfig block");
    process.exit(1);
}

const newFetchBlock = `                let mergedLimits = [
                    ...baseLoaded,
                    ...defaultLimits.filter(def => !baseLoaded.some((l: any) => l.id === def.id))
                ].map(l => {
                    if (l.regime === "New" || (l.regime === "Old" && (!l.ageGroup || l.ageGroup === "individual"))) {
                        const newDef = defaultLimits.find(d => d.id === l.id && d.regime === l.regime);
                        if (newDef) {
                            return { ...l, section: newDef.section, limit: newDef.limit, description: newDef.description, isSubSection: newDef.isSubSection, displaySection: newDef.displaySection };
                        }
                    }
                    return l;
                });

                // Enforce exactly the order defined in defaultLimits for Old Regime Individuals
                const oldIndividualOrder = defaultLimits.filter(d => d.regime === "Old" && (!d.ageGroup || d.ageGroup === "individual")).map(d => d.id);
                mergedLimits.sort((a, b) => {
                    if (a.regime === "Old" && (!a.ageGroup || a.ageGroup === "individual") && b.regime === "Old" && (!b.ageGroup || b.ageGroup === "individual")) {
                        return oldIndividualOrder.indexOf(a.id) - oldIndividualOrder.indexOf(b.id);
                    }
                    return 0; // retain original order for others
                });

                // Group subsections (even though sort above handles it, this ensures strictly nested grouping just in case)
                const main80CIndex = mergedLimits.findIndex(l => l.id === "1");
                if (main80CIndex !== -1) {
                    const subSections = mergedLimits.filter(l => l.section === "80C Investments" && l.id !== "1" && l.regime === "Old" && (l as any).isSubSection);
                    mergedLimits = mergedLimits.filter(l => !(l.section === "80C Investments" && l.id !== "1" && l.regime === "Old" && (l as any).isSubSection));
                    const newMain80CIndex = mergedLimits.findIndex(l => l.id === "1");
                    mergedLimits.splice(newMain80CIndex + 1, 0, ...subSections);
                }

                const main80DIndex = mergedLimits.findIndex(l => l.id === "6");
                if (main80DIndex !== -1) {
                    const subSections = mergedLimits.filter(l => l.section === "80D Medical Insurance" && l.id !== "6" && l.regime === "Old" && (l as any).isSubSection);
                    mergedLimits = mergedLimits.filter(l => !(l.section === "80D Medical Insurance" && l.id !== "6" && l.regime === "Old" && (l as any).isSubSection));
                    const newMain80DIndex = mergedLimits.findIndex(l => l.id === "6");
                    mergedLimits.splice(newMain80DIndex + 1, 0, ...subSections);
                }

                const mainOieIndex = mergedLimits.findIndex(l => l.id === "new-oie");
                if (mainOieIndex !== -1) {
                    const subSections = mergedLimits.filter(l => l.section === "Other Investments & Exemptions" && l.id !== "new-oie" && l.regime === "Old" && (l as any).isSubSection);
                    mergedLimits = mergedLimits.filter(l => !(l.section === "Other Investments & Exemptions" && l.id !== "new-oie" && l.regime === "Old" && (l as any).isSubSection));
                    const newMainOieIndex = mergedLimits.findIndex(l => l.id === "new-oie");
                    mergedLimits.splice(newMainOieIndex + 1, 0, ...subSections);
                }
`;

code = code.substring(0, startIndex) + newFetchBlock + "\n" + code.substring(endIndex);
fs.writeFileSync("components/IncomeTaxDeclarationSettings.tsx", code);
console.log("Done");


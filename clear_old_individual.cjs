
const fs = require("fs");
let code = fs.readFileSync("components/IncomeTaxDeclarationSettings.tsx", "utf8");

// We need to filter out Old Regime Individual items from `defaultLimits` array.
// But doing string manipulation for arrays is tricky. Let us use a regex to match the objects.
// Wait, the objects we added are clearly delimited or identifiable.

const oldCode = code;

// A simpler way: we can just modify the state initialization and defaultLimits definition directly by filtering them if possible, but they are hardcoded.
// Since we used a block of text earlier, we can just replace that block with nothing.

// Let us find the first `{ id: \x27sc-1\x27, section: \x2780C\x27` in defaultLimits and remove everything before it that belongs to Old regime individual.
// No, the new limits we added start at `{ id: \x27new-pe\x27` and end before `{ id: \x2723\x27`.
// Wait, we also had `{ id: \x271\x27`, `{ id: \x271a\x27`, etc.

// Let us parse the file and dynamically filter the array using JS, then write it back? No, it is TSX code, not JSON.

// Let us use regex to remove objects where `regime: \x27Old\x27` and NO `ageGroup`.
// Actually, an easier way is to just add a filter in `useEffect` or `fetchConfig` to completely drop them, AND clear the initial state so it mounts empty.

code = code.replace(/\{ id: \x27new-pe\x27[\s\S]*?(?=\{ id: \x2723\x27)/g, "");

// Also in the fetchConfig block where we did `mergedLimits.sort`:
// If we want to drop legacy items entirely for now:
code = code.replace(/let mergedLimits = \[[\s\S]*?\]\.map/g, `let mergedLimits = [
                    ...baseLoaded,
                    ...defaultLimits.filter(def => !baseLoaded.some((l: any) => l.id === def.id))
                ].filter(l => !(l.regime === "Old" && (!l.ageGroup || l.ageGroup === "individual"))).map`);

fs.writeFileSync("components/IncomeTaxDeclarationSettings.tsx", code);
console.log("Cleared old individual limits");


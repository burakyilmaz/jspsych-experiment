/**
 * Rename visual stimulus assets to a standardized format.
 *
 * Expected input example:
 *  "7. pouring milk indirect2 m 2.jpeg"
 *
 * Output format:
 *  "07_pouring-milk_indirect_2_m.jpg"
 */

const fs = require("fs");
const path = require("path");

// Project-root relative path
const TARGET_DIR = path.resolve(
    __dirname,
    "../assets/visual/img"
);

if (!fs.existsSync(TARGET_DIR)) {
    console.error("Target directory not found:", TARGET_DIR);
    process.exit(1);
}

const files = fs.readdirSync(TARGET_DIR);

files.forEach((file) => {
    const fullPath = path.join(TARGET_DIR, file);

    if (!fs.statSync(fullPath).isFile()) return;

    const originalName = file;

    // Normalize extension
    let normalized = originalName
        .replace(/\.jpeg$/i, ".jpg");

    const base = path.basename(normalized, ".jpg");

    // Match leading number: "7. something"
    const matchId = base.match(/^(\d+)\.\s+(.*)$/);
    if (!matchId) {
        console.log("Skipping (unexpected format):", originalName);
        return;
    }

    const id = Number(matchId[1]);
    let rest = matchId[2];

    // Normalize whitespace
    rest = rest.replace(/\s+/g, " ").trim();

    // Extract tense + variant (direct1, indirect2)
    const matchTense = rest.match(/\b(direct|indirect)(\d)\b/i);
    if (!matchTense) {
        console.log("Skipping (no tense info):", originalName);
        return;
    }

    const tense = matchTense[1].toLowerCase();
    const variant = matchTense[2];

    rest = rest.replace(matchTense[0], "").trim();

    // Extract gender
    const matchGender = rest.match(/\b([fm])\b/i);
    if (!matchGender) {
        console.log("Skipping (no gender info):", originalName);
        return;
    }

    const gender = matchGender[1].toLowerCase();

    rest = rest.replace(matchGender[0], "").trim();

    // Remove stray numbers (e.g. "m 2")
    rest = rest.replace(/\b\d+\b/g, "").trim();

    // Action → kebab-case
    const action = rest.toLowerCase().replace(/\s+/g, "-");

    const idFormatted = String(id).padStart(2, "0");

    const newName = `${idFormatted}_${action}_${tense}_${variant}_${gender}.jpg`;
    const newPath = path.join(TARGET_DIR, newName);

    if (originalName !== newName) {
        fs.renameSync(fullPath, newPath);
        console.log(`Renamed: ${originalName} → ${newName}`);
    }
});

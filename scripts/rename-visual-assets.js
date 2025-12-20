const fs = require("fs");
const path = require("path");

const TARGET_DIR = path.resolve(__dirname, "../assets/visual/img");

if (!fs.existsSync(TARGET_DIR)) {
    console.error("Target directory not found:", TARGET_DIR);
    process.exit(1);
}

const files = fs.readdirSync(TARGET_DIR);

files.forEach((file) => {
    const fullPath = path.join(TARGET_DIR, file);
    if (!fs.statSync(fullPath).isFile()) return;

    const originalName = file;
    const ext = path.extname(originalName);

    // Get clean name without extension for processing
    const baseName = originalName.slice(0, originalName.length - ext.length).trim();

    // Support only .jpg and .jpeg extensions (case-insensitive)
    if (![".jpg", ".jpeg", ".JPEG"].includes(ext.toLowerCase())) return;

    /**
     * Improved Regex Strategy:
     * 1. ID and dot (\d+\.)
     * 2. Action name (.+)
     * 3. Tense within word boundaries (\b(direct|indirect)\b)
     * 4. Gender within word boundaries (\b([fm])\b)
     */
    const match = baseName.match(/^(\d+)\.\s+(.+)\s+\b(direct|indirect)\b\s+\b([fm])\b$/i);

    if (!match) {
        console.log("Skipping (Format mismatch):", originalName);
        return;
    }

    // Format ID to 2 digits (e.g., 1 -> 01)
    const idFormatted = String(match[1]).padStart(2, "0");

    // Convert action to kebab-case
    const actionKebab = match[2].toLowerCase().trim().replace(/\s+/g, "-");

    const tense = match[3].toLowerCase();
    const gender = match[4].toLowerCase();

    // Construct the new standardized filename
    const newName = `${idFormatted}_${actionKebab}_${tense}_${gender}.jpg`;
    const newPath = path.join(TARGET_DIR, newName);

    // Perform rename if the name has changed
    if (originalName !== newName) {
        try {
            fs.renameSync(fullPath, newPath);
            console.log(`Success: ${originalName} -> ${newName}`);
        } catch (err) {
            console.error(`Error renaming ${originalName}:`, err.message);
        }
    }
});

console.log("File renaming process completed.");
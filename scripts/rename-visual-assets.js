const fs = require("fs");
const path = require("path");

const TARGET_DIR = path.resolve(__dirname, "../assets/visual/img");

const files = fs.readdirSync(TARGET_DIR);

files.forEach((file) => {
    const fullPath = path.join(TARGET_DIR, file);
    if (!fs.statSync(fullPath).isFile()) return;

    const originalName = file;
    const ext = path.extname(originalName);
    // Uzantıdan bağımsız temiz isim al
    const baseName = originalName.slice(0, originalName.length - ext.length).trim();

    if (![".jpg", ".jpeg", ".JPEG"].includes(ext.toLowerCase())) return;

    // Geliştirilmiş Regex: Kelime sınırlarına (\b) odaklanır
    const match = baseName.match(/^(\d+)\.\s+(.+)\s+\b(direct|indirect)\b\s+\b([fm])\b$/i);

    if (!match) {
        console.log("Atlanıyor (Format eşleşmedi):", originalName);
        return;
    }

    const idFormatted = String(match[1]).padStart(2, "0");
    const actionKebab = match[2].toLowerCase().trim().replace(/\s+/g, "-");
    const tense = match[3].toLowerCase();
    const gender = match[4].toLowerCase();

    const newName = `${idFormatted}_${actionKebab}_${tense}_${gender}.jpg`;
    const newPath = path.join(TARGET_DIR, newName);

    if (originalName !== newName) {
        fs.renameSync(fullPath, newPath);
        console.log(`Başarılı: ${originalName} -> ${newName}`);
    }
});
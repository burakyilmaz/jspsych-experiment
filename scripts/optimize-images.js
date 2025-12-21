const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const TARGET_DIR = path.resolve(__dirname, "../assets/visual/img");
const SIZE_THRESHOLD = 200 * 1024; // 200 KB

async function optimizeImages() {
    if (!fs.existsSync(TARGET_DIR)) {
        console.error("Target directory not found:", TARGET_DIR);
        return;
    }

    const files = fs.readdirSync(TARGET_DIR).filter(file =>
        [".jpg", ".jpeg"].includes(path.extname(file).toLowerCase())
    );

    console.log(`Starting smart optimization for ${files.length} files...`);

    for (const file of files) {
        const filePath = path.join(TARGET_DIR, file);
        const stats = fs.statSync(filePath);

        if (stats.size > SIZE_THRESHOLD) {
            const originalSizeKB = stats.size / 1024;

            try {
                const image = sharp(filePath);
                const metadata = await image.metadata();
                const tempPath = path.join(TARGET_DIR, `temp_${file}`);


                let targetQuality = 80;
                if (originalSizeKB < 500) {
                    targetQuality = 92;
                } else if (originalSizeKB < 1000) {
                    targetQuality = 85;
                }

                let pipeline = image;

                if (metadata.width > 1280) {
                    pipeline = pipeline.resize(1280, null, { withoutEnlargement: true });
                }

                await pipeline
                    .jpeg({
                        quality: targetQuality,
                        mozjpeg: true,
                        progressive: true
                    })
                    .toFile(tempPath);

                fs.unlinkSync(filePath);
                fs.renameSync(tempPath, filePath);

                const newStats = fs.statSync(filePath);
                console.log(`Optimized: ${file} | ${originalSizeKB.toFixed(0)}KB -> ${(newStats.size / 1024).toFixed(0)}KB (Q:${targetQuality})`);
            } catch (err) {
                console.error(`Error processing ${file}:`, err.message);
            }
        }
    }
    console.log("Smart image optimization completed.");
}

optimizeImages();
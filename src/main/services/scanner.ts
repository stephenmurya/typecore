import * as fs from 'fs';
import * as path from 'path';
import * as opentype from 'opentype.js';
import { FontDatabase } from '../database/FontDatabase';

export interface FontMetadata {
    path: string;
    family: string;
    subfamily: string;
    fullName: string;
    postscriptName: string;
}

export class FontScanner {
    private db: FontDatabase;

    constructor(db: FontDatabase) {
        this.db = db;
    }

    async scanDirectory(dirPath: string): Promise<number> {
        console.log('[Scanner] Scanning directory:', dirPath);
        const fontFiles = this.findFontFiles(dirPath);
        console.log(`[Scanner] Found ${fontFiles.length} font files`);

        let successCount = 0;

        for (const filePath of fontFiles) {
            try {
                const metadata = await this.extractMetadata(filePath);
                if (metadata) {
                    this.db.addFont({
                        ...metadata,
                        source: 'local',
                        remoteUrl: null,
                    });
                    successCount++;
                }
            } catch (error) {
                console.error(`[Scanner] Error processing ${filePath}:`, error);
                // Continue with next file - don't let one corrupt font stop the scan
            }
        }

        console.log(`[Scanner] Successfully scanned ${successCount} fonts`);
        return successCount;
    }

    private findFontFiles(dirPath: string): string[] {
        const fontFiles: string[] = [];
        const extensions = ['.ttf', '.otf', '.TTF', '.OTF'];

        const scanDir = (dir: string) => {
            try {
                const entries = fs.readdirSync(dir, { withFileTypes: true });

                for (const entry of entries) {
                    const fullPath = path.join(dir, entry.name);

                    if (entry.isDirectory()) {
                        scanDir(fullPath); // Recursive scan
                    } else if (entry.isFile()) {
                        const ext = path.extname(entry.name);
                        if (extensions.includes(ext)) {
                            fontFiles.push(fullPath);
                        }
                    }
                }
            } catch (error) {
                console.error(`[Scanner] Error reading directory ${dir}:`, error);
            }
        };

        scanDir(dirPath);
        return fontFiles;
    }

    private async extractMetadata(filePath: string): Promise<FontMetadata | null> {
        return new Promise((resolve) => {
            try {
                opentype.load(filePath, (err, font) => {
                    if (err || !font) {
                        console.error(`[Scanner] Failed to load ${filePath}:`, err);
                        resolve(null);
                        return;
                    }

                    const names = font.names;

                    const metadata: FontMetadata = {
                        path: filePath,
                        family: names.fontFamily?.en || names.fontFamily?.['en-US'] || 'Unknown',
                        subfamily: names.fontSubfamily?.en || names.fontSubfamily?.['en-US'] || 'Regular',
                        fullName: names.fullName?.en || names.fullName?.['en-US'] || '',
                        postscriptName: names.postScriptName?.en || names.postScriptName?.['en-US'] || '',
                    };

                    console.log(`[Scanner] Extracted: ${metadata.family} ${metadata.subfamily}`);
                    resolve(metadata);
                });
            } catch (error) {
                console.error(`[Scanner] Exception loading ${filePath}:`, error);
                resolve(null);
            }
        });
    }
}

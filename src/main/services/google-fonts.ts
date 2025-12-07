import { FontDatabase } from '../database/FontDatabase';

interface GoogleFont {
    family: string;
    variants: string[];
    subsets: string[];
    version: string;
    lastModified: string;
    files: Record<string, string>;
    category: string;
    kind: string;
}

interface GoogleFontsResponse {
    kind: string;
    items: GoogleFont[];
}

export class GoogleFontsService {
    private db: FontDatabase;

    constructor(db: FontDatabase) {
        this.db = db;
    }

    async syncGoogleFonts(apiKey: string, limit: number = 100): Promise<number> {
        console.log('[Google Fonts] Starting sync...');

        try {
            const url = `https://www.googleapis.com/webfonts/v1/webfonts?key=${apiKey}&sort=popularity`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Google Fonts API error: ${response.statusText}`);
            }

            const data: GoogleFontsResponse = await response.json();
            console.log(`[Google Fonts] Fetched ${data.items.length} fonts`);

            let addedCount = 0;
            const fontsToAdd = data.items.slice(0, limit);

            for (const font of fontsToAdd) {
                // Prefer regular/400 variant, fallback to first available
                const regularUrl = font.files['regular'] ||
                    font.files['400'] ||
                    Object.values(font.files)[0];

                if (!regularUrl) {
                    console.warn(`[Google Fonts] No file URL for ${font.family}`);
                    continue;
                }

                // Use family name as unique identifier for Google fonts
                const fontRecord = {
                    path: `google://${font.family}`, // Virtual path
                    family: font.family,
                    subfamily: 'Regular',
                    fullName: font.family,
                    postscriptName: font.family.replace(/\s+/g, ''),
                    source: 'google',
                    remoteUrl: regularUrl,
                };

                this.db.addFont(fontRecord);
                addedCount++;
            }

            console.log(`[Google Fonts] Added ${addedCount} fonts to database`);
            return addedCount;
        } catch (error) {
            console.error('[Google Fonts] Sync failed:', error);
            throw error;
        }
    }
}

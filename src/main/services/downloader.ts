import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';

export class FontDownloader {
    private cacheDir: string;

    constructor() {
        this.cacheDir = path.join(app.getPath('userData'), 'google-cache');
        this.ensureCacheDir();
    }

    private ensureCacheDir(): void {
        if (!fs.existsSync(this.cacheDir)) {
            fs.mkdirSync(this.cacheDir, { recursive: true });
            console.log('[Downloader] Created cache directory:', this.cacheDir);
        }
    }

    async ensureFontCached(url: string, family: string): Promise<string> {
        // Generate safe filename
        const sanitizedFamily = family.replace(/[^a-z0-9]/gi, '_');
        const filename = `${sanitizedFamily}-Regular.ttf`;
        const localPath = path.join(this.cacheDir, filename);

        // Check if already cached
        if (fs.existsSync(localPath)) {
            console.log('[Downloader] Font already cached:', localPath);
            return localPath;
        }

        console.log('[Downloader] Downloading font:', family);
        console.log('[Downloader] URL:', url);

        try {
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Download failed: ${response.statusText}`);
            }

            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            fs.writeFileSync(localPath, buffer);
            console.log('[Downloader] Font cached successfully:', localPath);

            return localPath;
        } catch (error) {
            console.error('[Downloader] Download failed:', error);
            throw error;
        }
    }

    getCacheDir(): string {
        return this.cacheDir;
    }

    clearCache(): void {
        if (fs.existsSync(this.cacheDir)) {
            fs.rmSync(this.cacheDir, { recursive: true, force: true });
            this.ensureCacheDir();
            console.log('[Downloader] Cache cleared');
        }
    }
}

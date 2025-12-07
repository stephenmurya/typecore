import Database from 'better-sqlite3';
import { join } from 'path';
import { app } from 'electron';

export interface FontRecord {
    path: string;
    family: string;
    subfamily: string;
    fullName: string;
    postscriptName: string;
    activated: number; // 0 or 1 (SQLite boolean)
    source: string; // 'local' or 'google'
    remoteUrl: string | null; // Download URL for Google Fonts
}

export class FontDatabase {
    private db: Database.Database;

    constructor() {
        const dbPath = join(app.getPath('userData'), 'fonts.db');
        console.log('[Database] Initializing at:', dbPath);

        this.db = new Database(dbPath);
        this.initializeSchema();
    }

    private initializeSchema(): void {
        const schema = `
      CREATE TABLE IF NOT EXISTS fonts (
        path TEXT PRIMARY KEY,
        family TEXT NOT NULL,
        subfamily TEXT,
        fullName TEXT,
        postscriptName TEXT,
        activated INTEGER DEFAULT 0,
        source TEXT DEFAULT 'local',
        remoteUrl TEXT
      );
      
      CREATE INDEX IF NOT EXISTS idx_family ON fonts(family);
      CREATE INDEX IF NOT EXISTS idx_activated ON fonts(activated);
      CREATE INDEX IF NOT EXISTS idx_source ON fonts(source);
    `;

        this.db.exec(schema);

        // Check if columns exist and add them if needed
        const tableInfo = this.db.prepare("PRAGMA table_info(fonts)").all() as Array<{ name: string }>;
        const columnNames = tableInfo.map(col => col.name);

        if (!columnNames.includes('source')) {
            console.log('[Database] Adding source column...');
            this.db.exec(`ALTER TABLE fonts ADD COLUMN source TEXT DEFAULT 'local'`);
            this.db.exec(`UPDATE fonts SET source = 'local' WHERE source IS NULL`);
        }

        if (!columnNames.includes('remoteUrl')) {
            console.log('[Database] Adding remoteUrl column...');
            this.db.exec(`ALTER TABLE fonts ADD COLUMN remoteUrl TEXT`);
        }

        console.log('[Database] Schema initialized');
    }

    addFont(metadata: Omit<FontRecord, 'activated'>): void {
        const stmt = this.db.prepare(`
      INSERT OR IGNORE INTO fonts (path, family, subfamily, fullName, postscriptName, activated, source, remoteUrl)
      VALUES (?, ?, ?, ?, ?, 0, ?, ?)
    `);

        stmt.run(
            metadata.path,
            metadata.family,
            metadata.subfamily || '',
            metadata.fullName || '',
            metadata.postscriptName || '',
            metadata.source || 'local',
            metadata.remoteUrl || null
        );
    }

    getFonts(): FontRecord[] {
        const stmt = this.db.prepare('SELECT * FROM fonts ORDER BY family, subfamily');
        return stmt.all() as FontRecord[];
    }

    getFontByPath(path: string): FontRecord | undefined {
        const stmt = this.db.prepare('SELECT * FROM fonts WHERE path = ?');
        return stmt.get(path) as FontRecord | undefined;
    }

    setActivation(path: string, activated: boolean): void {
        const stmt = this.db.prepare('UPDATE fonts SET activated = ? WHERE path = ?');
        stmt.run(activated ? 1 : 0, path);
        console.log(`[Database] Set activation for ${path}: ${activated}`);
    }

    clearAll(): void {
        this.db.exec('DELETE FROM fonts');
        console.log('[Database] Cleared all fonts');
    }

    close(): void {
        this.db.close();
        console.log('[Database] Closed');
    }
}

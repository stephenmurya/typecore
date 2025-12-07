// TypeScript definitions for the Electron API exposed via contextBridge

export interface FontRecord {
    path: string;
    family: string;
    subfamily: string;
    fullName: string;
    postscriptName: string;
    activated: number;
    source: string;
    remoteUrl: string | null;
}

export interface FontActionResult {
    success: boolean;
    message: string;
    count?: number;
}

export interface TypeCoreAPI {
    activateFont: (font: FontRecord) => Promise<FontActionResult>;
    deactivateFont: (font: FontRecord) => Promise<FontActionResult>;
    selectAndScanDirectory: () => Promise<FontActionResult>;
    getAllFonts: () => Promise<FontRecord[]>;
    syncGoogleFonts: (apiKey: string, limit?: number) => Promise<FontActionResult>;
}

declare global {
    interface Window {
        typecoreAPI: TypeCoreAPI;
    }
}

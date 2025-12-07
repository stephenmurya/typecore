import { contextBridge, ipcRenderer } from 'electron';

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

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('typecoreAPI', {
    // Font management - now accepts full font object
    activateFont: (font: FontRecord): Promise<FontActionResult> =>
        ipcRenderer.invoke('font:activate', font),

    deactivateFont: (font: FontRecord): Promise<FontActionResult> =>
        ipcRenderer.invoke('font:deactivate', font),

    // Scanning
    selectAndScanDirectory: (): Promise<FontActionResult> =>
        ipcRenderer.invoke('font:selectAndScan'),

    // Data retrieval
    getAllFonts: (): Promise<FontRecord[]> =>
        ipcRenderer.invoke('font:getAll'),

    // Google Fonts
    syncGoogleFonts: (apiKey: string, limit?: number): Promise<FontActionResult> =>
        ipcRenderer.invoke('google:sync', apiKey, limit),
});

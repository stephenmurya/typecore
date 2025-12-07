import koffi from 'koffi';

// Load Windows DLLs
const gdi32 = koffi.load('gdi32.dll');
const user32 = koffi.load('user32.dll');

// Define Windows API functions
const AddFontResourceA = gdi32.func('int AddFontResourceA(const char *lpszFilename)');
const RemoveFontResourceA = gdi32.func('int RemoveFontResourceA(const char *lpszFilename)');
const SendMessageA = user32.func('long SendMessageA(void *hWnd, uint Msg, void *wParam, void *lParam)');

// Windows constants
const HWND_BROADCAST = 0xFFFF;
const WM_FONTCHANGE = 0x001D;

export function activateFont(fontPath: string): boolean {
    try {
        console.log('[OS Bridge] Activating font:', fontPath);
        const result = AddFontResourceA(fontPath);

        if (result > 0) {
            // Broadcast font change message
            SendMessageA(HWND_BROADCAST as any, WM_FONTCHANGE, null, null);
            console.log('[OS Bridge] Font activated successfully:', fontPath);
            return true;
        }

        console.error('[OS Bridge] Failed to activate font:', fontPath);
        return false;
    } catch (error) {
        console.error('[OS Bridge] Error activating font:', error);
        return false;
    }
}

export function deactivateFont(fontPath: string): boolean {
    try {
        console.log('[OS Bridge] Deactivating font:', fontPath);
        const result = RemoveFontResourceA(fontPath);

        if (result > 0) {
            // Broadcast font change message
            SendMessageA(HWND_BROADCAST as any, WM_FONTCHANGE, null, null);
            console.log('[OS Bridge] Font deactivated successfully:', fontPath);
            return true;
        }

        console.error('[OS Bridge] Failed to deactivate font:', fontPath);
        return false;
    } catch (error) {
        console.error('[OS Bridge] Error deactivating font:', error);
        return false;
    }
}

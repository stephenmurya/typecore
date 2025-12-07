// Cross-platform font activation bridge
// Currently Windows-only, macOS support to be added

import * as windows from './windows';

const platform = process.platform;

export const activateFont = platform === 'win32' ? windows.activateFont : () => {
    console.warn('Font activation not supported on this platform');
    return false;
};

export const deactivateFont = platform === 'win32' ? windows.deactivateFont : () => {
    console.warn('Font deactivation not supported on this platform');
    return false;
};

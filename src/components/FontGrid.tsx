import React, { useRef, useState, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import FontPreview from './FontPreview';

interface FontData {
    path: string;
    family: string;
    subfamily: string;
    fullName: string;
    postscriptName: string;
    activated: number; // 0 or 1
    source: string;
    remoteUrl: string | null;
}

const FontGrid = () => {
    const parentRef = useRef<HTMLDivElement>(null);
    const [fonts, setFonts] = useState<FontData[]>([]);

    // Load fonts on mount
    useEffect(() => {
        window.typecoreAPI.getAllFonts().then((data) => {
            setFonts(data || []);
        });
    }, []);

    // Virtualizer instance
    const rowVirtualizer = useVirtualizer({
        count: fonts.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 80, // Fixed row height
        overscan: 5,
    });

    const toggleActivation = async (font: FontData) => {
        if (font.activated) {
            await window.typecoreAPI.deactivateFont(font);
        } else {
            await window.typecoreAPI.activateFont(font);
        }
        // Refresh list local state to update UI
        const newFonts = [...fonts];
        const index = newFonts.findIndex(f => f.path === font.path);
        if (index !== -1) {
            newFonts[index].activated = font.activated ? 0 : 1;
            setFonts(newFonts);
        }
    };

    return (
        <div
            ref={parentRef}
            className="h-full w-full overflow-y-auto bg-gray-900 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
        >
            <div
                style={{
                    height: `${rowVirtualizer.getTotalSize()}px`,
                    width: '100%',
                    position: 'relative',
                }}
            >
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const font = fonts[virtualRow.index];
                    return (
                        <div
                            key={virtualRow.key}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: `${virtualRow.size}px`,
                                transform: `translateY(${virtualRow.start}px)`,
                            }}
                            className="px-4 py-2"
                        >
                            {/* Font Card */}
                            <div className="flex items-center h-full bg-gray-800 rounded-lg px-4 hover:bg-gray-750 border border-transparent hover:border-gray-700 transition-all group">

                                {/* Activation Status */}
                                <button
                                    onClick={() => toggleActivation(font)}
                                    className={`w-4 h-4 rounded-full mr-4 border transition-colors ${font.activated
                                        ? 'bg-green-500 border-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]'
                                        : 'bg-transparent border-gray-600 hover:border-gray-400'
                                        }`}
                                />

                                {/* Font Info */}
                                <div className="w-48 flex-shrink-0">
                                    <div className="text-white font-medium truncate">{font.family}</div>
                                    <div className="text-xs text-gray-500 truncate">
                                        {font.subfamily}
                                        {font.source === 'google' && (
                                            <span className="ml-2 text-blue-400">🌐</span>
                                        )}
                                    </div>
                                </div>

                                {/* Preview Area */}
                                <div className="flex-1 mx-4 h-10 flex items-center overflow-hidden">
                                    <FontPreview path={font.path} family={font.family} source={font.source} />
                                </div>

                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default FontGrid;

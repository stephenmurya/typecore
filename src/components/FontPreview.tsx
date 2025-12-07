import React, { useRef, useEffect } from 'react';

interface Props {
    path: string;
    family: string;
    source: string;
}

const FontPreview: React.FC<Props> = ({ path, family, source }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (source === 'google' || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear previous render
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Visual Placeholder to ensure Layout Integrity:
        ctx.fillStyle = '#e5e7eb'; // gray-200
        ctx.font = '32px Arial'; // Default fallback
        ctx.fillText("The quick brown fox", 0, 35);

    }, [path, source]);

    // Google Fonts: Use web font preview
    if (source === 'google') {
        const fontFamily = family.replace(/\s+/g, '+');

        return (
            <div className="w-full h-full flex items-center">
                <style>
                    {`@import url('https://fonts.googleapis.com/css2?family=${fontFamily}&display=swap');`}
                </style>
                <div
                    style={{ fontFamily: family }}
                    className="text-gray-200 text-2xl"
                >
                    The quick brown fox
                </div>
            </div>
        );
    }

    // Local fonts: Use canvas
    return (
        <canvas
            ref={canvasRef}
            width={800}
            height={50}
            className="w-full h-full object-contain object-left opacity-90"
        />
    );
};

export default FontPreview;

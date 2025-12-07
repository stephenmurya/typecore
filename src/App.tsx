import React, { useState } from 'react';
import FontGrid from './components/FontGrid';

function App() {
    // Simple state for triggering a re-render after scan
    const [refreshKey, setRefreshKey] = useState(0);
    const [isSyncing, setIsSyncing] = useState(false);
    const [showApiKeyModal, setShowApiKeyModal] = useState(false);
    const [apiKey, setApiKey] = useState('');

    const handleScan = async () => {
        const result = await window.typecoreAPI.selectAndScanDirectory();
        if (result && result.success) {
            setRefreshKey(prev => prev + 1);
        }
    };

    const handleSyncGoogle = async () => {
        if (!apiKey.trim()) {
            alert('Please enter a valid API key');
            return;
        }

        setShowApiKeyModal(false);
        setIsSyncing(true);

        try {
            const result = await window.typecoreAPI.syncGoogleFonts(apiKey, 100);
            if (result.success) {
                alert(`✅ Successfully synced ${result.count} Google Fonts!`);
                setRefreshKey(prev => prev + 1);
            } else {
                alert(`❌ Sync failed: ${result.message}`);
            }
        } catch (error) {
            alert(`❌ Error: ${error}`);
        } finally {
            setIsSyncing(false);
            setApiKey('');
        }
    };

    return (
        <div className="flex h-screen w-screen bg-gray-900 text-gray-100 overflow-hidden font-sans">
            {/* API Key Modal */}
            {showApiKeyModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-lg p-6 w-96 border border-gray-700">
                        <h2 className="text-xl font-bold mb-4">Google Fonts API Key</h2>
                        <p className="text-sm text-gray-400 mb-4">
                            Enter your Google Fonts API key to sync fonts.
                        </p>
                        <input
                            type="text"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="AIza..."
                            className="w-full bg-gray-900 text-white px-4 py-2 rounded-md border border-gray-700 focus:outline-none focus:border-blue-500 mb-4"
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSyncGoogle();
                                if (e.key === 'Escape') setShowApiKeyModal(false);
                            }}
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={handleSyncGoogle}
                                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded-md font-medium transition-colors"
                            >
                                Sync
                            </button>
                            <button
                                onClick={() => {
                                    setShowApiKeyModal(false);
                                    setApiKey('');
                                }}
                                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-md font-medium transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* SIDEBAR */}
            <aside className="w-64 flex-shrink-0 bg-gray-950 border-r border-gray-800 flex flex-col">
                <div className="p-4 border-b border-gray-800">
                    <h1 className="text-xl font-bold tracking-tight text-white">TypeCore</h1>
                    <p className="text-xs text-gray-500">Local Font Manager</p>
                </div>

                <div className="p-4 space-y-2">
                    <button
                        onClick={handleScan}
                        className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-sm font-medium transition-colors shadow-sm"
                    >
                        📂 Scan Folder
                    </button>

                    <button
                        onClick={() => setShowApiKeyModal(true)}
                        disabled={isSyncing}
                        className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 text-white rounded-md text-sm font-medium transition-colors shadow-sm"
                    >
                        {isSyncing ? '⏳ Syncing...' : '🌐 Sync Google Fonts'}
                    </button>
                </div>

                <nav className="flex-1 px-2 space-y-1">
                    <div className="px-2 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Collections
                    </div>
                    <a href="#" className="block px-2 py-2 text-sm font-medium text-white bg-gray-800 rounded-md">
                        All Fonts
                    </a>
                    <a href="#" className="block px-2 py-2 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white rounded-md">
                        Favorites
                    </a>
                </nav>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="h-14 bg-gray-900 border-b border-gray-800 flex items-center px-4 justify-between shrink-0">
                    <div className="relative max-w-md w-full">
                        <input
                            type="text"
                            placeholder="Search fonts..."
                            className="w-full bg-gray-800 border-none rounded-md py-1.5 px-3 text-sm text-white focus:ring-1 focus:ring-blue-500 placeholder-gray-500"
                        />
                    </div>
                    <div className="text-xs text-gray-500">
                        v1.0.0
                    </div>
                </header>

                {/* Content Area - KEY: flex-1 allows it to fill space, overflow-hidden keeps scroll internal */}
                <div className="flex-1 overflow-hidden relative">
                    <FontGrid key={refreshKey} />
                </div>
            </main>
        </div>
    );
}

export default App;

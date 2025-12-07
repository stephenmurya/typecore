# TypeCore

> A free, open-source font manager for Windows with Google Fonts integration

![TypeCore](https://img.shields.io/badge/platform-Windows-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Electron](https://img.shields.io/badge/Electron-Latest-47848F)
![React](https://img.shields.io/badge/React-18-61DAFB)

## Why TypeCore?

I wanted a simple way to access Google Fonts on my PC without manually downloading hundreds of font files. **FontBase** is great, but it's paid software. So I built **TypeCore** - a completely free, open-source alternative that anyone can use and contribute to!

## Features

✨ **Google Fonts Integration**
- Sync 1000+ fonts from Google Fonts API
- Lazy downloading - fonts are cached only when activated
- Web font previews for instant visualization

📂 **Local Font Management**
- Scan directories for `.ttf` and `.otf` files
- Extract font metadata with `opentype.js`
- Persistent SQLite database

⚡ **System Integration**
- Activate/deactivate fonts in Windows instantly
- Uses native Windows GDI32 API via `koffi` FFI
- Fonts work immediately in all applications

🎨 **Modern UI**
- Beautiful dark theme with Tailwind CSS
- Virtualized grid for smooth scrolling (1000+ fonts)
- Real-time search and filtering
- Professional sidebar layout

## Screenshots

### Main Interface
![Main Interface](docs/screenshot-main.png)

### Google Fonts Sync
![Google Fonts](docs/screenshot-google.png)

## Installation

### Prerequisites
- **Windows 10/11** (macOS/Linux support coming soon)
- **Node.js 18+** and npm

### Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/typeCore.git
cd typeCore

# Install dependencies
npm install

# Start the app
npm start
```

### Build for Production

```bash
# Create distributable
npm run make

# Find the installer in: out/make/
```

## Usage

### 1. Scan Local Fonts
1. Click **"📂 Scan Folder"**
2. Select a directory containing font files
3. TypeCore will recursively scan for `.ttf` and `.otf` files

### 2. Sync Google Fonts
1. Get a free API key from [Google Cloud Console](https://console.cloud.google.com/)
   - Enable "Google Fonts Developer API"
   - Create credentials → API key
2. Click **"🌐 Sync Google Fonts"**
3. Paste your API key
4. Wait for sync (fetches top 100 fonts by default)

### 3. Activate Fonts
- Click the toggle switch next to any font
- **Local fonts**: Activates immediately
- **Google fonts**: Downloads to cache first, then activates
- Fonts are instantly available in Word, Photoshop, etc.

### 4. Search & Filter
- Use the search bar to filter by font family or subfamily
- Google fonts are marked with a 🌐 icon

## Tech Stack

### Core
- **Electron** - Cross-platform desktop framework
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling

### Backend
- **better-sqlite3** - Fast, synchronous SQLite database
- **koffi** - Native FFI for Windows font activation
- **opentype.js** - Font metadata extraction

### UI Components
- **@tanstack/react-virtual** - Virtualized scrolling
- **Electron Forge** - Build tooling with Webpack

## Architecture

```
typeCore/
├── src/
│   ├── main/
│   │   ├── database/
│   │   │   └── FontDatabase.ts      # SQLite operations
│   │   ├── services/
│   │   │   ├── scanner.ts           # Local font scanning
│   │   │   ├── google-fonts.ts      # Google Fonts API
│   │   │   └── downloader.ts        # Font caching
│   │   └── os-bridge/
│   │       ├── windows.ts           # Windows font activation
│   │       └── index.ts             # Platform abstraction
│   ├── renderer/
│   │   ├── components/
│   │   │   ├── FontGrid.tsx         # Virtualized font list
│   │   │   └── FontPreview.tsx      # Font preview rendering
│   │   └── App.tsx                  # Main UI
│   ├── index.ts                     # Electron main process
│   └── preload.ts                   # IPC bridge
└── package.json
```

## Database Schema

```sql
CREATE TABLE fonts (
  path TEXT PRIMARY KEY,
  family TEXT NOT NULL,
  subfamily TEXT,
  fullName TEXT,
  postscriptName TEXT,
  activated INTEGER DEFAULT 0,
  source TEXT DEFAULT 'local',  -- 'local' or 'google'
  remoteUrl TEXT                -- Google Fonts download URL
);
```

## Configuration

### Google Fonts Sync Limit
Edit `src/main/index.ts`:
```typescript
// Default: 100 fonts
ipcMain.handle('google:sync', async (_event, apiKey: string, limit: number = 100)
```

### Cache Directory
Fonts are cached in:
```
%APPDATA%/typecore/google-cache/
```

### Database Location
```
%APPDATA%/typecore/fonts.db
```

## Development

### Project Structure
- **Main Process** (`src/index.ts`) - Electron backend, IPC handlers
- **Renderer Process** (`src/App.tsx`) - React UI
- **Preload Script** (`src/preload.ts`) - Secure IPC bridge

### Available Scripts

```bash
npm start          # Start development server
npm run package    # Package app (no installer)
npm run make       # Create distributable installer
npm run publish    # Publish to GitHub releases
```

### Adding a New IPC Handler

1. **Main Process** (`src/index.ts`):
```typescript
ipcMain.handle('font:newAction', async (_event, arg) => {
  // Your logic here
  return { success: true };
});
```

2. **Preload** (`src/preload.ts`):
```typescript
contextBridge.exposeInMainWorld('typecoreAPI', {
  newAction: (arg) => ipcRenderer.invoke('font:newAction', arg),
});
```

3. **Renderer** (`src/App.tsx`):
```typescript
const result = await window.typecoreAPI.newAction(arg);
```

## Contributing

Contributions are welcome! Here's how you can help:

### Reporting Bugs
- Use the [Issues](https://github.com/yourusername/typeCore/issues) tab
- Include OS version, steps to reproduce, and screenshots

### Feature Requests
- Open an issue with the `enhancement` label
- Describe the feature and use case

### Pull Requests
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Setup
```bash
git clone https://github.com/yourusername/typeCore.git
cd typeCore
npm install
npm start
```

## Roadmap

- [ ] **macOS Support** - CoreText API integration
- [ ] **Linux Support** - Fontconfig integration
- [ ] **Font Collections** - Group fonts into custom collections
- [ ] **Advanced Search** - Filter by style, weight, width
- [ ] **Font Comparison** - Side-by-side preview
- [ ] **Export/Import** - Share font lists
- [ ] **Auto-Updates** - Electron auto-updater
- [ ] **Themes** - Light mode support

## FAQ

### Why Windows only?
Font activation APIs are platform-specific. Windows support came first because I use Windows. macOS and Linux support are planned!

### Is my API key safe?
Your API key is stored locally and never sent anywhere except Google's API. The app has no analytics or telemetry.

### Can I use this commercially?
Yes! TypeCore is MIT licensed. Use it however you want.

### How do I uninstall?
1. Deactivate all fonts in TypeCore
2. Uninstall via Windows Settings
3. Optionally delete `%APPDATA%/typecore/`

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Acknowledgments

- **Google Fonts** - Amazing free font library
- **FontBase** - Inspiration for this project
- **Electron** - Making desktop apps with web tech possible
- **opentype.js** - Font parsing library

## Support

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/yourusername/typeCore/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/yourusername/typeCore/discussions)
- ⭐ **Star this repo** if you find it useful!

---

**Made with ❤️ by [Your Name]**

*TypeCore is not affiliated with Google or FontBase.*

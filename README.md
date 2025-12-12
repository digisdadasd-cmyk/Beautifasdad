# BeautifyOllama Desktop

Glassmorphism chat interface refactored for an offline Windows desktop build. The app runs on Vite + React + TailwindCSS v4 with an Electron shell and talks only to a local FastAPI backend.

## Features
- Local-only chatting with FastAPI `/ask` (streaming simulated client-side)
- LocalStorage conversation history with sidebar management
- Model selector fed by `/models`
- Dark/Light toggle with persisted preference
- Markdown rendering, copy per message, regenerate, typing indicator, auto-scroll, Ctrl+Enter to send
- Framer Motion micro-animations and shadcn-style components

## Stack
- Vite 5 + React 18 + TypeScript 5
- TailwindCSS v4 with glass UI tokens
- shadcn/ui primitives (Radix) + class-variance-authority, clsx, tailwind-merge
- Axios + @tanstack/react-query
- Electron 31 with electron-builder (NSIS win-x64 target)

## Running the app
1. Start your FastAPI server on `http://localhost:8000` with `/ask` and optional `/models` endpoints.
2. Install dependencies and start Electron + Vite dev mode:
   ```bash
   npm install
   npm run dev
   ```
3. Build production assets:
   ```bash
   npm run build
   ```
4. Package the Windows installer:
   ```bash
   npm run dist
   ```

## Notes
- The app is optimized for Windows; no macOS/Linux conditionals remain.
- All data stays local (localStorage). No telemetry or online APIs are called.

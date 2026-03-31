# ORBITRON — DEPLOY GUIDE

## Files
```
orbitron/
├── index.html      ← Complete app (single file, ~600 lines)
├── manifest.json   ← PWA manifest
├── sw.js           ← Service worker (offline caching)
├── icon-192.svg    ← App icon 192px
├── icon-512.svg    ← App icon 512px
└── DEPLOY.md       ← This file
```

---

## Deploy to Netlify (30 seconds)

1. Go to https://app.netlify.com/drop
2. Drag the entire `orbitron/` folder onto the drop zone
3. Your live URL appears instantly — share it

For custom domain / CI:
```bash
npm install -g netlify-cli
netlify deploy --dir=orbitron --prod
```

---

## Deploy to GitHub Pages

```bash
cd orbitron
git init
git add .
git commit -m "Launch Orbitron"
gh repo create orbitron --public --push --source=.
# Enable GitHub Pages → Settings → Pages → Branch: main → /root
```

Live at: `https://yourusername.github.io/orbitron`

**Important:** GitHub Pages requires HTTPS for PWA install + microphone APIs. It's HTTPS by default on `*.github.io` — no config needed.

---

## Deploy to Vercel

```bash
cd orbitron
npx vercel --prod
```

---

## Local Testing (HTTPS required for mic + SW)

```bash
# Install mkcert for local HTTPS
brew install mkcert   # macOS
mkcert -install
mkcert localhost

# Serve with HTTPS
npx serve . --ssl-cert localhost.pem --ssl-key localhost-key.pem
```

Or use VS Code Live Server with HTTPS enabled.

---

## Architecture

### Voice Pipeline
1. `navigator.mediaDevices.getUserMedia({audio:true})` — single permission request
2. `SpeechRecognition` continuous stream — interim results for real-time display
3. Phonetic fuzzy-match on "Orbitron" using 3 regex patterns (covering mispronunciations)
4. Silent-gap detection (1.2s) triggers intent processing
5. Full audio never transmitted — all processing client-side

### Intelligence Stack
1. **Intent Engine** — regex/pattern matching for 10 action types (WhatsApp, calls, reminders, weather, math, search, app launch, jokes, capabilities, name)
2. **Smart Fallback** — deterministic response layer (greetings, time/date, status queries, self-description)
3. **On-Device LLM** — Transformers.js + SmolLM-135M-Instruct (quantized q4) via WebGPU or WASM fallback. ~80MB, cached after first load via Cache API
4. **Final fallback** — graceful degradation message with suggestion

### Storage
- `orbitron_prefs` — user preferences JSON (localStorage)
- `orbitron_history` — last 20 exchanges (localStorage)
- Model weights — Cache API (browser cache, persists across sessions)

---

## Capabilities

| Command | Result |
|---|---|
| "Orbitron, message mom I'm late" | Opens WhatsApp with pre-filled text |
| "Set a reminder for 10 minutes" | Browser notification in 10 min |
| "Weather in Mumbai" | Opens wttr.in forecast |
| "Tell me a joke" | Space/tech humor + voice response |
| "Open YouTube" | Launches YouTube |
| "Search quantum computing" | Google search |
| "What is 2 to the power of 10" | Calculated: 1024 |
| "My name is Alex" | Remembered across sessions |
| *Shake device* | Random joke (DeviceMotion) |
| *Say "Orbitron"* | Wake activation + audio cue |

---

## Browser Support

| Browser | Voice | AI | PWA Install |
|---|---|---|---|
| Chrome Android | ✅ | ✅ (WebGPU) | ✅ |
| Safari iOS 16.4+ | ✅ | ✅ (WASM) | ✅ |
| Chrome Desktop | ✅ | ✅ | ✅ |
| Firefox | ✅ text | ✅ (WASM) | Partial |
| Samsung Internet | ✅ | ✅ | ✅ |

---

## Privacy Policy Summary

- Zero network requests (except model download on first use from HuggingFace CDN)
- Zero analytics, telemetry, or tracking
- Microphone audio processed entirely in-browser
- All data stored in localStorage — cleared on "Clear All Data"
- Model weights cached locally via Cache API

---

*Orbitron v1.0 — Built for the future, running on your device*

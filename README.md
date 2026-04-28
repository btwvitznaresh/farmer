# 🌾 AgroTalk Assist

> **Voice-first AI assistant helping farmers with agricultural advice in their local language**

![License](https://img.shields.io/badge/license-MIT-green)
![PWA](https://img.shields.io/badge/PWA-Ready-blue)
![Offline](https://img.shields.io/badge/Offline-First-orange)

---

## 🚀 Features

- **🎤 Voice-First Interaction**: Ask questions in Hindi, Tamil, Telugu, Marathi, or English
- **📸 Crop Disease Detection**: AI-powered image analysis to identify plant diseases
- **📊 Market Prices**: Real-time mandi prices from Data.gov.in API
- **🌤️ Weather Integration**: Location-based weather updates and farming advice
- **📚 Library**: Save and review past diagnoses and analyses
- **🌐 Multi-language Support**: Full UI localization in 5 Indian languages
- **📱 PWA/Installable**: Works as a native app on Android, iOS, and Desktop

---

## 🌍 Offline-First Architecture

AgroTalk Assist is designed for low-connectivity rural environments:

### 📱 Progressive Web App (PWA)
- **Installable**: Functions as a native app
- **Asset Caching**: Loads instantly even without internet

### 🗄️ Local Database (IndexedDB)
- **Market Prices**: Cached mandi prices for offline viewing
- **Chat History**: All conversations stored locally
- **Library**: Crop analysis reports persisted locally
- **Weather**: Last known weather report cached

### 🧠 Local Wisdom (Offline AI)
When offline, the AI switches to a **Local Knowledge Base** with 100+ crop-specific Q&A entries covering common diseases, treatments, and farming advice.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS, shadcn/ui |
| State | TanStack Query, React Hooks |
| Backend | Node.js (Express), Python (FastAPI) |
| AI/ML | NVIDIA NIM APIs, OpenRouter |
| TTS | NVIDIA Riva, Edge TTS |
| Database | IndexedDB (idb) |
| PWA | vite-plugin-pwa, Workbox |

---

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/btwvitznaresh/farmer.git

# Navigate to project directory
cd farmer

# Install ALL dependencies (frontend + backend) — run this once after cloning
npm run install:all
```

> **Note:** Run `npm run install:all` once after cloning to install both the root and backend dependencies. You only need to run plain `npm install` again if you add new root packages.

---

## 🔧 Development

```bash
# Start frontend only
npm run dev

# Start backend only (in a separate terminal)
npm run dev:backend

# Start both frontend + backend together
npm run dev:full

# Start Python backend
npm run dev:python
```

---

## 🔧 Environment Variables

Create a `.env` file in the project root:

```env
VITE_MANDI_API_KEY=your_api_key_here
VITE_API_URL=http://localhost:3001
```

---

## 📁 Project Structure

```
farmer/
├── src/
│   ├── components/     # React components
│   ├── pages/          # Page components
│   ├── lib/            # Utilities and API client
│   ├── services/       # IndexedDB and sync services
│   ├── data/           # Offline knowledge base
│   └── hooks/          # Custom React hooks
├── backend/            # Node.js backend
├── backend_py/         # Python FastAPI backend
├── public/             # Static assets
└── docs/               # Documentation
```

---

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run with watch mode
npm run test:watch

# Type checking
npx tsc --noEmit

# Linting
npm run lint
```

---

## 🚀 Deployment

```bash
# Build and deploy to Firebase
npm run deploy
```

---

## 👥 Team

Built with ❤️ for Indian farmers

---

## 📄 License

MIT License — feel free to use this project for educational purposes.
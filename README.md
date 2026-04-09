# Nova Assistant

Nova is a highly capable, proactive, and emotionally intelligent AI assistant for your phone. It features a sleek, futuristic interface and a wide array of advanced capabilities powered by Google's Gemini Live API.

## 🚀 Core Features

### 🎙️ Live Voice Interaction
- **Persistent Listening**: Nova stays active and ready to help, listening for your commands in real-time.
- **Natural Conversation**: Powered by Gemini 3.1 Flash Live, Nova provides concise, natural, and emotionally aware responses.
- **Voice Customization**: Choose from multiple Gemini voices (Puck, Charon, Kore, Fenrir, Aoede) and models.

### 👁️ Visual Intelligence
- **Visual Memory**: Nova can "see" and remember objects or locations via your camera.
- **Fitness Coach**: Real-time analysis of your exercise form.
- **Expense Scanner**: Track spending by scanning receipts.

### 🛠️ Advanced Tools
- **Smart Home Control**: Manage your connected devices (simulated).
- **Health & Productivity**: Track your health data and manage your daily tasks.
- **Interpreter Mode**: Real-time speech translation for multiple languages.
- **Travel Assistant**: Contextual travel information and booking assistance.

### 🧠 Memory & Personalization
- **Fact Learning**: Nova learns about you over time, remembering your preferences and important details.
- **Digital Twin**: Nova can adopt different personas or tones to match your needs.
- **Shadowing Mode**: Act as a language tutor to help you practice new languages.

### 🛡️ Safety & Focus
- **AI Gatekeeper (Focus Mode)**: Filter interruptions and manage your focus.
- **SOS Emergency**: Trigger emergency alerts and share your location.
- **Battery Awareness**: Proactive notifications when your battery is low.

## 🎨 Visual Experience
- **Dynamic Themes**: Choose between Minimalist, Cyberpunk, and Nebula visual styles.
- **AR Overlays**: Visual cues and data overlays in camera mode.
- **Ambient Soundscapes**: Immersive audio environments to enhance your focus or relaxation.

## 🛠️ Technical Overview
- **Frontend**: React, TypeScript, Tailwind CSS, Framer Motion.
- **Backend**: Firebase (Auth, Firestore), Express API proxy.
- **AI**: Google Gemini API (Live API, Generative AI).
- **Audio**: Web Audio API for real-time PCM processing.
- **Testing**: Vitest, React Testing Library.
- **Code Quality**: ESLint, TypeScript.

## 📱 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd Assistant-app

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys
```

### Development
```bash
# Start the API proxy server
npm run server

# Start the development server (in another terminal)
npm run dev

# Or run both together
npm run dev:full
```

### Testing
```bash
# Run tests
npm test

# Run tests with UI
npm run test:ui
```

### Building
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔧 Configuration

### Environment Variables
- `GEMINI_API_KEY`: Your Google Gemini API key (required)
- `PORT`: API server port (default: 3001)
- `FRONTEND_URL`: Frontend URL for CORS (default: http://localhost:3000)

### Permissions Required
- Microphone access for voice interaction
- Camera access for visual features
- Geolocation for travel features
- Screen wake lock for continuous operation

## 🏗️ Project Structure
```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── Assistant.tsx   # Main assistant component
│   ├── Auth.tsx        # Authentication
│   ├── Camera.tsx      # Camera interface
│   └── ...
├── hooks/              # Custom React hooks
├── lib/                # Utilities and services
│   ├── firebase.ts     # Firebase configuration
│   ├── gemini.ts       # Gemini AI integration
│   ├── memory.ts       # User memory management
│   └── sounds.ts       # Audio utilities
├── test/               # Test files
└── types/              # TypeScript type definitions

public/
├── icons/              # PWA icons
├── manifest.json       # PWA manifest
└── sw.js              # Service worker

server.js               # API proxy server
```

## 🔒 Security
- API keys are proxied through a backend server to prevent client-side exposure
- Firebase security rules protect user data
- HTTPS required for production deployment

## 📈 Performance
- Code splitting reduces initial bundle size
- Lazy loading for components
- Optimized service worker caching
- Manual chunking for better loading

## 🤝 Contributing
1. Fork the repository
2. Create a feature branch
3. Run tests: `npm test`
4. Run linting: `npm run lint:js`
5. Submit a pull request

## 📄 License
This project is licensed under the MIT License.

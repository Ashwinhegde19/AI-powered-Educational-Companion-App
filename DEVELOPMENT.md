# Development Guide - AI-powered Educational Companion App

## 🚀 Quick Start

### Backend Development
1. **Start Backend Server:**
   ```bash
   cd backend
   pnpm run dev
   ```
   Backend will run on: http://localhost:3000

2. **Test Backend APIs:**
   ```bash
   # Test health endpoint
   curl http://localhost:3000/api/health
   
   # Run automated tests
   node test-api.js
   ```

### Frontend Development
1. **Start React Native Development:**
   ```bash
   # Option 1: Use the setup script
   ./start-frontend.sh
   
   # Option 2: Manual setup
   cd frontend
   pnpm install
   pnpm start
   ```

2. **Run on Device/Emulator:**
   ```bash
   # Android (requires Android Studio + emulator or connected device)
   cd frontend
   pnpm android
   
   # iOS (macOS only, requires Xcode)
   cd frontend
   pnpm ios
   ```

## 📱 Mobile Development Setup

### Android Setup
1. **Install Android Studio** with Android SDK
2. **Create/Start Android Virtual Device (AVD)**
3. **Configure environment variables:**
   ```bash
   export ANDROID_HOME=$HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/tools
   export PATH=$PATH:$ANDROID_HOME/tools/bin
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```

### iOS Setup (macOS only)
1. **Install Xcode** from App Store
2. **Install iOS Simulator**
3. **Install CocoaPods:**
   ```bash
   sudo gem install cocoapods
   cd frontend/ios
   pod install
   ```

## 🔧 Backend Configuration

### Environment Variables
Copy `/backend/.env.example` to `/backend/.env` and configure:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/ai-educational-app

# AI Services
GEMINI_API_KEY=your_gemini_api_key_here
YOUTUBE_API_KEY=your_youtube_api_key_here

# Vector Database
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=your_qdrant_api_key

# Server
PORT=3000
NODE_ENV=development
```

### Database Setup
The app uses MongoDB. You can run it via Docker:
```bash
docker-compose up -d mongodb
```

Or install locally and start MongoDB service.

## 📱 Frontend Configuration

### API Connection
- **Android Emulator:** Backend accessible at `http://10.0.2.2:3000`
- **iOS Simulator:** Backend accessible at `http://localhost:3000`
- **Physical Device:** Use your computer's IP address

Update `/frontend/src/config/config.js` if needed:
```javascript
const config = {
  API_BASE_URL: 'http://10.0.2.2:3000/api', // Android emulator
  // API_BASE_URL: 'http://localhost:3000/api', // iOS simulator
  // API_BASE_URL: 'http://192.168.1.100:3000/api', // Physical device
};
```

## 🛠️ Development Workflow

### Daily Development
1. **Start Backend:** `cd backend && pnpm run dev`
2. **Start Frontend:** `cd frontend && pnpm start`
3. **Run on Device:** `pnpm android` or `pnpm ios`

### Testing APIs
```bash
# Run comprehensive API tests
node test-api.js

# Test specific endpoints
curl http://localhost:3000/api/videos/random
curl http://localhost:3000/api/channels
curl http://localhost:3000/api/concepts
```

### Code Structure
```
backend/
├── src/
│   ├── controllers/     # API route handlers
│   ├── models/         # MongoDB schemas
│   ├── routes/         # Express routes
│   ├── services/       # Business logic (AI, YouTube, etc.)
│   └── middleware/     # Auth, validation, etc.
└── tests/              # API tests

frontend/
├── src/
│   ├── screens/        # React Native screens
│   ├── components/     # Reusable components
│   ├── navigation/     # React Navigation setup
│   ├── services/       # API calls
│   ├── context/        # React Context (state management)
│   └── theme/          # Colors, styles
└── android/ios/        # Native platform code
```

## 🔍 Debugging

### Backend Debugging
- **Logs:** Check console output when running `pnpm run dev`
- **Database:** Use MongoDB Compass or CLI to inspect data
- **API Testing:** Use `test-api.js` or Postman

### Frontend Debugging
- **React Native Debugger:** Install and use for component inspection
- **Console Logs:** View in Metro bundler terminal
- **Device Logs:** Use `adb logcat` (Android) or Xcode console (iOS)

### Network Issues
1. **Check backend is running:** `curl http://localhost:3000/api/health`
2. **Check frontend config:** Verify API_BASE_URL in config.js
3. **Android emulator:** Use `10.0.2.2` instead of `localhost`
4. **Physical device:** Use computer's IP address

## 📦 Available Scripts

### Backend (`/backend`)
- `pnpm dev` - Start development server with nodemon
- `pnpm start` - Start production server
- `pnpm test` - Run Jest tests
- `pnpm seed` - Populate database with sample data

### Frontend (`/frontend`)
- `pnpm start` - Start Metro bundler
- `pnpm android` - Run on Android
- `pnpm ios` - Run on iOS
- `pnpm lint` - Run ESLint
- `pnpm test` - Run Jest tests

### Root Directory
- `pnpm dev` - Start both backend and frontend
- `pnpm dev:backend` - Start only backend
- `pnpm dev:frontend` - Start only frontend
- `pnpm test` - Run all tests

## 🚨 Troubleshooting

### Common Issues

1. **"Unable to resolve module" errors:**
   ```bash
   cd frontend
   pnpm install
   npx react-native start --reset-cache
   ```

2. **Android build failures:**
   ```bash
   cd frontend/android
   ./gradlew clean
   cd ..
   pnpm android
   ```

3. **iOS build failures:**
   ```bash
   cd frontend/ios
   pod install
   cd ..
   pnpm ios
   ```

4. **Backend connection issues:**
   - Check if backend is running on port 3000
   - Verify API_BASE_URL in frontend config
   - For Android emulator, use `http://10.0.2.2:3000`

5. **Database connection issues:**
   - Ensure MongoDB is running
   - Check MONGODB_URI in .env file
   - Try: `docker-compose up -d mongodb`

## 🎯 Next Steps

1. **Add Real API Keys:** Update `.env` with actual Gemini and YouTube API keys
2. **Test on Physical Device:** Configure network settings for device testing
3. **Implement User Authentication:** Add login/signup functionality
4. **Add More Features:** Video bookmarks, learning progress, etc.
5. **Production Deployment:** Set up CI/CD and deploy to app stores

## 📞 Support

For development issues:
1. Check this guide first
2. Review error logs in terminal
3. Test individual components (backend APIs, frontend screens)
4. Check network connectivity between frontend and backend

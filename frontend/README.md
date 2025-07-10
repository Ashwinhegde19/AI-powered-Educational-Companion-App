# React Native Frontend for AI-powered Educational Companion App

A modern React Native mobile application that integrates YouTube videos with NCERT textbook concepts using AI-powered content mapping.

## 🚀 Features

- **Home Screen**: Random videos and channel-based content sections
- **Video Player**: YouTube integration with NCERT concept overlays
- **Channel Browsing**: Educational channel discovery and filtering
- **Search Functionality**: Smart video search with filters
- **NCERT Concepts**: Browse curriculum topics by grade and subject
- **AI Integration**: Real-time concept mapping and suggestions
- **Modern UI**: Material Design with smooth animations

## 🛠️ Tech Stack

- **React Native 0.72** - Cross-platform mobile framework
- **React Navigation 6** - Navigation library
- **React Native Paper** - Material Design components
- **React Native YouTube iFrame** - YouTube video player
- **Axios** - HTTP client for API calls
- **React Native Vector Icons** - Icon library
- **React Native Linear Gradient** - Gradient components
- **React Native Fast Image** - Optimized image loading

## 📱 Prerequisites

- Node.js >= 18.0.0
- React Native development environment set up
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)
- Backend API running on http://localhost:3000

## 🔧 Installation

1. **Install dependencies:**
   ```bash
   cd frontend
   pnpm install
   ```

2. **iOS Setup (macOS only):**
   ```bash
   cd ios && pod install && cd ..
   ```

3. **Android Setup:**
   - Ensure Android SDK is installed
   - Start Android emulator or connect device

## 🚀 Running the App

1. **Start Metro bundler:**
   ```bash
   pnpm start
   ```

2. **Run on Android:**
   ```bash
   pnpm android
   ```

3. **Run on iOS (macOS only):**
   ```bash
   pnpm ios
   ```

## 📂 Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   ├── screens/            # App screens
│   ├── navigation/         # Navigation configuration
│   ├── context/           # React Context for state management
│   ├── services/          # API services
│   ├── theme/             # Colors and styling
│   └── App.js             # Main app component
├── android/               # Android-specific files
├── ios/                   # iOS-specific files
└── package.json          # Dependencies and scripts
```

## 🎨 Key Components

### Screens
- **HomeScreen**: Dashboard with featured content
- **VideoPlayerScreen**: YouTube player with AI features
- **ChannelsScreen**: Educational channel browser
- **SearchScreen**: Video search with smart suggestions
- **ConceptsScreen**: NCERT curriculum browser
- **ProfileScreen**: User settings and progress

### Services
- **ApiService**: Centralized API communication
- **ApiContext**: Global state management

### Features
- **Pull-to-refresh** on all data screens
- **Infinite scrolling** for large lists
- **Smart search** with recent and popular suggestions
- **Concept overlay** on video player
- **Grade and subject filtering**
- **Modern Material Design UI**

## 🔗 API Integration

The app communicates with the backend at `http://localhost:3000/api`:

- `GET /channels` - Fetch educational channels
- `GET /videos/random` - Get random videos
- `GET /videos/search` - Search videos
- `GET /concepts` - Fetch NCERT concepts
- `GET /ai/health` - Check AI services status

## 🎯 Key Features

### Video Player
- YouTube iframe integration
- NCERT concept overlays
- Timestamp-based concept navigation
- Fullscreen support with orientation lock

### Smart Search
- Recent search history
- Popular search suggestions
- Real-time results
- Search tips and guidance

### NCERT Integration
- Grade-wise filtering (6-12)
- Subject categorization
- Keyword-based search
- Concept difficulty indicators

## 🔧 Configuration

### API Base URL
Update the API base URL in `src/services/ApiService.js`:
```javascript
const API_BASE_URL = 'http://your-backend-url:3000/api';
```

### Development vs Production
- Development: Uses localhost (Android emulator can access via 10.0.2.2)
- Production: Update to your deployed backend URL

## 🧪 Testing

```bash
# Run tests
pnpm test

# Run with coverage
pnpm test --coverage
```

## 📱 Build for Production

### Android
```bash
cd android
./gradlew assembleRelease
```

### iOS
```bash
cd ios
xcodebuild -workspace YourApp.xcworkspace -scheme YourApp -configuration Release
```

## 🤝 Contributing

1. Follow React Native best practices
2. Use TypeScript for type safety (optional)
3. Follow the existing component structure
4. Test on both Android and iOS
5. Update documentation for new features

## 📞 Support

For issues and questions:
- Check the backend API is running
- Ensure proper network connectivity
- Verify React Native environment setup
- Check device/emulator compatibility

---

Built with ❤️ using React Native and modern mobile development practices.

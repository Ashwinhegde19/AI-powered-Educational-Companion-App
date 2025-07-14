# AI-powered Educational Companion App

An AI-powered educational companion app that integrates YouTube videos with NCERT textbook concepts using React Native frontend and Node.js backend.

## 🚀 Features

### Backend (Node.js + Express)
- **Video Processing**: Fetch YouTube video metadata and transcripts
- **AI Integration**: Use Google Gemini for concept mapping and embeddings
- **Vector Database**: Qdrant for semantic search and similarity matching
- **Database**: MongoDB for storing videos, channels, and NCERT concepts
- **RESTful APIs**: Comprehensive API endpoints for all functionality

### Frontend (React Native) 
- **Home Screen**: Random videos and channel-based video sections
- **Video Player**: YouTube player with NCERT concept overlays
- **Dynamic Content**: Real-time NCERT concept suggestions
- **Smooth UI**: Pull-to-refresh and auto-scrolling features

### AI/RAG Pipeline
- **Retrieval-Augmented Generation** using Gemini API
- **Vector Embeddings** for semantic search with Qdrant
- **NCERT Concept Mapping** with timestamp-based suggestions
- **Multi-modal Processing** of video transcripts and textbook content

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **Google Gemini API** for AI operations
- **Qdrant** vector database
- **YouTube Data API v3** for video metadata
- **youtube-transcript** for transcript extraction

### Frontend (Planned)
- **React Native** for cross-platform mobile app
- **React Navigation** for navigation
- **react-native-youtube-iframe** for video player
- **Axios** for API communication

### DevOps & Tools
- **pnpm** for package management
- **Jest** for testing
- **ESLint** for code quality
- **Docker** support for containerization

## 📋 Prerequisites

Before running this project, make sure you have:

- **Node.js** (v18 or higher)
- **pnpm** installed globally
- **MongoDB** instance (local or cloud)
- **Qdrant** vector database instance
- **API Keys**:
  - Google Gemini API key
  - YouTube Data API v3 key
  - Qdrant API key (if using cloud)

## 🏃‍♂️ Quick Start

### Option 1: Automated Setup (Recommended)
```bash
# Clone the repository
git clone <repository-url>
cd AI-powered-Educational-Companion-App

# Run the setup script
./setup.sh
```

### Option 2: Manual Setup

#### 1. Clone the repository
```bash
git clone <repository-url>
cd AI-powered-Educational-Companion-App
```

#### 2. Install dependencies
```bash
# Install root dependencies
pnpm install

# Install backend dependencies
cd backend && pnpm install
```

#### 3. Environment Configuration
```bash
# Copy environment template
cd backend
cp .env.example .env

# Edit .env file with your API keys and configuration
```

#### 4. Required Environment Variables
```env
# Database
MONGODB_URI=mongodb://localhost:27017/ai-educational-companion

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# YouTube Data API
YOUTUBE_API_KEY=your_youtube_api_key_here

# Qdrant Vector Database
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=your_qdrant_api_key_here

# JWT Secret
JWT_SECRET=your_jwt_secret_here
```

#### 5. Start Services

##### Start MongoDB
```bash
# Local MongoDB
mongod

# Or use MongoDB Atlas cloud connection
```

##### Start Qdrant
```bash
# Using Docker
docker run -p 6333:6333 qdrant/qdrant

# Or install locally following Qdrant documentation
```

##### Start Backend Server
```bash
cd backend
pnpm run dev
```

The backend server will start on `http://localhost:3000`

#### 6. Seed Sample Data (Optional)
```bash
cd backend
node src/utils/seedData.js
```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Core Endpoints

#### Health Check
```http
GET /health
```

#### Videos
```http
GET /api/videos/random?limit=5
GET /api/videos/channel/:channelId
GET /api/videos/:videoId
GET /api/videos/:videoId/ncert-mappings?timestamp=120
POST /api/videos/process
```

#### Channels
```http
GET /api/channels
GET /api/channels/:channelId
GET /api/channels/category/:category
POST /api/channels
```

#### AI Services
```http
POST /api/ai/find-ncert-concepts
POST /api/ai/search-similar-videos
GET /api/ai/videos/:videoId/ncert-concepts
POST /api/ai/generate-embedding
GET /api/ai/health
```

### Example API Usage

#### Process a YouTube Video
```bash
curl -X POST http://localhost:3000/api/videos/process \
  -H "Content-Type: application/json" \
  -d '{"videoId": "dQw4w9WgXcQ"}'
```

#### Find NCERT Concepts
```bash
curl -X POST http://localhost:3000/api/ai/find-ncert-concepts \
  -H "Content-Type: application/json" \
  -d '{
    "transcript": "This video explains quadratic equations and their solutions...",
    "subject": "Mathematics",
    "class": 10
  }'
```

## 🗄️ Database Schema

### Video Schema
```javascript
{
  videoId: String (unique),
  title: String,
  channelId: String,
  duration: String,
  transcript: String,
  embeddings: [Number],
  ncertMappings: [{
    concept: String,
    confidence: Number,
    relevantTimestamps: [Object]
  }],
  processingStatus: String
}
```

### Channel Schema
```javascript
{
  channelId: String (unique),
  title: String,
  educationalCategories: [String],
  targetAudience: String,
  videoCount: Number,
  isActive: Boolean
}
```

### NCERT Concept Schema
```javascript
{
  conceptId: String (unique),
  title: String,
  subject: String,
  class: Number,
  chapter: Object,
  content: String,
  embeddings: [Number],
  keywords: [String]
}
```

## 🧪 Testing

### Run Tests
```bash
cd backend
pnpm test
```

### Run Tests with Coverage
```bash
cd backend
pnpm test -- --coverage
```

### Test Individual Services
```bash
# Test specific file
pnpm test tests/api.test.js
```

## 🚀 Deployment

### Using Docker (Recommended)
```bash
# Build and run with Docker Compose
docker-compose up -d
```

### Manual Deployment
```bash
# Build the application
cd backend
pnpm run build

# Start production server
pnpm start
```

## 📱 Frontend Development (Coming Soon)

The React Native frontend is planned with the following screens:

### Planned Screens
1. **Home Screen**: Random videos + channel sections
2. **Video Player Screen**: YouTube player + NCERT concepts
3. **Search Screen**: Video search functionality
4. **Profile Screen**: User preferences and history

### Planned Features
- Pull-to-refresh functionality
- Auto-scrolling video thumbnails
- Real-time NCERT concept suggestions
- Offline video bookmarking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🐛 Known Issues & Limitations

- **YouTube Transcript**: Some videos may not have transcripts available
- **API Rate Limits**: YouTube and Gemini APIs have usage limits
- **NCERT Content**: Limited to sample NCERT concepts (expansion needed)
- **Real-time Processing**: Video processing is currently asynchronous

## 🔮 Future Enhancements

- [ ] Complete React Native frontend
- [ ] Real-time video processing
- [ ] Advanced NCERT textbook parsing
- [ ] Multi-language support
- [ ] User authentication and profiles
- [ ] Video bookmarking and playlists
- [ ] Advanced analytics and reporting
- [ ] WebSocket support for real-time updates


## 🙏 Acknowledgments

- **YouTube Data API** for video metadata
- **Google Gemini** for AI capabilities
- **Qdrant** for vector database
- **NCERT** for educational content reference
- **Educational YouTube Channels**: 3Blue1Brown, Veritasium, Kurzgesagt, Numberphile

---

**Note**: This project is developed for educational purposes and follows all relevant API terms of service and usage guidelines.

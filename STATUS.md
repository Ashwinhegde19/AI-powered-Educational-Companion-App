# 🚀 AI Educational Companion App - Status & Running Guide

## Current Status
✅ **Backend**: Running on port 3000  
✅ **Frontend**: Metro bundler running  
✅ **Database**: MongoDB connection configured  
✅ **AI Services**: Gemini API and Qdrant configured  

## How to Start the App

### Backend (Already Running)
```bash
cd backend && pnpm run dev
# Or use VS Code task: "Start Backend Development Server"
```

### Frontend (Already Running)
```bash
cd frontend && pnpm start
# Metro bundler will start
```

### Run on Device/Emulator

#### Android
1. Make sure Android emulator is running OR device is connected
2. Open new terminal:
```bash
cd frontend && pnpm android
```

#### iOS (macOS only)
1. Make sure iOS Simulator is open
2. Open new terminal:
```bash
cd frontend && pnpm ios
```

## Available Scripts

### Backend Scripts
- `pnpm run dev` - Start development server with nodemon
- `pnpm run start` - Start production server
- `pnpm run test` - Run tests
- `pnpm run seed` - Seed database with sample data

### Frontend Scripts
- `pnpm start` - Start Metro bundler
- `pnpm android` - Run on Android
- `pnpm ios` - Run on iOS (macOS only)
- `pnpm test` - Run tests

## API Endpoints (Backend running on localhost:3000)

### Videos
- `GET /api/videos` - Get all videos
- `GET /api/videos/:id` - Get video by ID
- `POST /api/videos` - Create video

### Channels
- `GET /api/channels` - Get all channels
- `GET /api/channels/:id` - Get channel by ID
- `POST /api/channels` - Create channel

### Concepts (NCERT)
- `GET /api/concepts` - Get all concepts
- `GET /api/concepts/:id` - Get concept by ID
- `POST /api/concepts` - Create concept

### AI Features
- `POST /api/ai/recommend` - Get video recommendations
- `POST /api/ai/explain` - Get concept explanations
- `POST /api/ai/quiz` - Generate quiz questions

## Development Environment

### Tech Stack
- **Backend**: Node.js, Express.js, MongoDB, Mongoose, Gemini AI, Qdrant
- **Frontend**: React Native, React Navigation, Axios
- **Package Manager**: pnpm
- **Database**: MongoDB
- **AI/Vector DB**: Google Gemini API, Qdrant

### Environment Variables
Make sure `.env` file is configured in the backend directory with:
- `MONGODB_URI`
- `GEMINI_API_KEY`
- `QDRANT_URL`
- `YOUTUBE_API_KEY`

## Next Steps
1. 📱 Run `pnpm android` in frontend directory to launch on Android
2. 🔗 Test frontend-backend integration
3. 🎨 Customize UI and add more features
4. 📊 Add analytics and monitoring

## Troubleshooting

### Metro Bundler Issues
```bash
cd frontend
pnpm start --reset-cache
```

### Android Build Issues
```bash
cd frontend/android
./gradlew clean
cd .. && pnpm android
```

### Backend Connection Issues
- Check MongoDB is running
- Verify environment variables
- Check port 3000 is not in use

## Project Structure
```
/backend          - Node.js/Express API server
/frontend         - React Native mobile app
/scripts          - Database initialization scripts
docker-compose.yml - Docker setup for MongoDB/Qdrant
```

**Happy coding! 🎉**

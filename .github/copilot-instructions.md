<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# AI-powered Educational Companion App

This project is an AI-powered educational companion app that integrates YouTube videos with NCERT textbook concepts.

## Tech Stack Instructions for Copilot

### Backend
- Use **Node.js** with **Express.js** for REST API development
- Use **MongoDB** with **Mongoose** for database operations
- Use **Google Gemini API** for AI language model operations
- Use **Qdrant** for vector database operations
- Use **YouTube Data API v3** for video metadata
- Use **youtube-transcript** package for transcript extraction
- Use **pnpm** for package management

### Frontend
- Use **React Native** for mobile app development
- Use **React Navigation** for navigation
- Use **react-native-youtube-iframe** for YouTube video player
- Use **Axios** for API calls
- Follow React Native best practices and modern patterns

### AI/RAG Pipeline
- Implement Retrieval-Augmented Generation using **Gemini API**
- Use **Qdrant** for vector embeddings and similarity search
- Process NCERT textbooks for concept mapping
- Generate embeddings for video transcripts and textbook content

### Code Style
- Use ES6+ features and modern JavaScript/TypeScript patterns
- Implement proper error handling and validation
- Use environment variables for sensitive configuration
- Follow REST API conventions for backend endpoints
- Use proper MongoDB schema design with indexing
- Implement proper logging and monitoring

### Project Structure
- Keep backend and frontend as separate workspaces
- Use shared types and utilities where applicable
- Implement proper separation of concerns
- Use modular architecture for scalability

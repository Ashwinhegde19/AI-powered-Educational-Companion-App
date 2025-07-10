import axios from 'axios';
import config from '../config/config';

class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: config.API_BASE_URL,
      timeout: config.API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('❌ API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        console.log(`✅ API Response: ${response.status} ${response.config.url}`);
        return response.data;
      },
      (error) => {
        console.error('❌ API Response Error:', error.response?.data || error.message);
        const errorMessage = error.response?.data?.message || error.message || 'Network error';
        throw new Error(errorMessage);
      }
    );
  }

  // Health check
  async healthCheck() {
    return this.client.get('/health');
  }

  // Channels API
  async getChannels(params = {}) {
    const {page = 1, limit = 20} = params;
    return this.client.get('/channels', {params: {page, limit}});
  }

  async getChannelById(channelId) {
    return this.client.get(`/channels/${channelId}`);
  }

  async getChannelsByCategory(category) {
    return this.client.get(`/channels/category/${category}`);
  }

  // Videos API
  async getRandomVideos(limit = 10) {
    return this.client.get('/videos/random', {params: {limit}});
  }

  async getVideosByChannel(channelId, params = {}) {
    const {page = 1, limit = 20} = params;
    return this.client.get(`/videos/channel/${channelId}`, {
      params: {page, limit}
    });
  }

  async getVideoDetails(videoId) {
    return this.client.get(`/videos/${videoId}`);
  }

  async searchVideos(query, params = {}) {
    const {limit = 20, page = 1} = params;
    return this.client.get('/videos/search', {
      params: {query, limit, page}
    });
  }

  async processVideo(videoId) {
    return this.client.post('/videos/process', {videoId});
  }

  // NCERT Concepts API
  async getConcepts(params = {}) {
    const {page = 1, limit = 20, grade, subject} = params;
    return this.client.get('/concepts', {
      params: {page, limit, grade, subject}
    });
  }

  async getConceptById(conceptId) {
    return this.client.get(`/concepts/${conceptId}`);
  }

  async searchConcepts(query, params = {}) {
    const {page = 1, limit = 20} = params;
    return this.client.get(`/concepts/search/${query}`, {
      params: {page, limit}
    });
  }

  // AI API
  async getAIHealth() {
    return this.client.get('/ai/health');
  }

  async generateEmbedding(text) {
    return this.client.post('/ai/generate-embedding', {text});
  }

  async findNCERTConcepts(transcript, options = {}) {
    return this.client.post('/ai/find-ncert-concepts', {
      transcript,
      ...options
    });
  }

  async searchSimilarVideos(query, options = {}) {
    return this.client.post('/ai/search-similar-videos', {
      query,
      ...options
    });
  }

  async summarizeVideo(videoId) {
    return this.client.post('/ai/summarize-video', {videoId});
  }

  // Utility methods
  setBaseURL(url) {
    this.client.defaults.baseURL = url;
  }

  setTimeout(timeout) {
    this.client.defaults.timeout = timeout;
  }

  // For development - allows switching between localhost and device IP
  updateBaseURL(baseUrl) {
    this.client.defaults.baseURL = baseUrl;
    console.log(`📱 API Base URL updated to: ${baseUrl}`);
  }
}

export default new ApiService();

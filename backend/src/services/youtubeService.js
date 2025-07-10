const axios = require('axios');

class YouTubeService {
  constructor() {
    this.apiKey = process.env.YOUTUBE_API_KEY;
    this.baseURL = 'https://www.googleapis.com/youtube/v3';
  }

  async getVideoDetails(videoId) {
    try {
      const response = await axios.get(`${this.baseURL}/videos`, {
        params: {
          key: this.apiKey,
          id: videoId,
          part: 'snippet,contentDetails,statistics,status'
        }
      });

      if (response.data.items.length === 0) {
        throw new Error('Video not found');
      }

      return response.data.items[0];
    } catch (error) {
      console.error('Error fetching video details:', error.message);
      throw new Error(`Failed to fetch video details: ${error.message}`);
    }
  }

  async getChannelVideos(channelId, maxResults = 50, pageToken = null) {
    try {
      const params = {
        key: this.apiKey,
        channelId: channelId,
        part: 'snippet',
        order: 'date',
        type: 'video',
        maxResults: maxResults
      };

      if (pageToken) {
        params.pageToken = pageToken;
      }

      const response = await axios.get(`${this.baseURL}/search`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching channel videos:', error.message);
      throw new Error(`Failed to fetch channel videos: ${error.message}`);
    }
  }

  async getChannelDetails(channelId) {
    try {
      const response = await axios.get(`${this.baseURL}/channels`, {
        params: {
          key: this.apiKey,
          id: channelId,
          part: 'snippet,contentDetails,statistics,brandingSettings'
        }
      });

      if (response.data.items.length === 0) {
        throw new Error('Channel not found');
      }

      return response.data.items[0];
    } catch (error) {
      console.error('Error fetching channel details:', error.message);
      throw new Error(`Failed to fetch channel details: ${error.message}`);
    }
  }

  async searchVideos(query, maxResults = 25, channelId = null) {
    try {
      const params = {
        key: this.apiKey,
        q: query,
        part: 'snippet',
        type: 'video',
        maxResults: maxResults,
        order: 'relevance'
      };

      if (channelId) {
        params.channelId = channelId;
      }

      const response = await axios.get(`${this.baseURL}/search`, { params });
      return response.data;
    } catch (error) {
      console.error('Error searching videos:', error.message);
      throw new Error(`Failed to search videos: ${error.message}`);
    }
  }

  // Convert ISO 8601 duration to seconds
  parseDuration(duration) {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    
    const hours = (parseInt(match[1]) || 0);
    const minutes = (parseInt(match[2]) || 0);
    const seconds = (parseInt(match[3]) || 0);
    
    return hours * 3600 + minutes * 60 + seconds;
  }

  // Format duration for display
  formatDuration(duration) {
    const totalSeconds = this.parseDuration(duration);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  }

  // Extract video ID from YouTube URL
  extractVideoId(url) {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  // Extract channel ID from YouTube URL
  extractChannelId(url) {
    const regex = /youtube\.com\/(?:c\/|channel\/|user\/)?([a-zA-Z0-9_-]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }
}

module.exports = new YouTubeService();

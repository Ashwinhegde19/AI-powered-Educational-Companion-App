const Video = require('../models/Video');
const Channel = require('../models/Channel');
const youtubeService = require('../services/youtubeService');
const transcriptService = require('../services/transcriptService');
const geminiService = require('../services/geminiService');
const qdrantService = require('../services/qdrantService');
const { validationResult } = require('express-validator');

class VideoController {
  // Get random videos for home screen
  async getRandomVideos(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 5;
      const videos = await Video.getRandomVideos(limit);
      
      res.json({
        success: true,
        data: videos,
        count: videos.length
      });
    } catch (error) {
      console.error('Error getting random videos:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch random videos',
        error: error.message
      });
    }
  }

  // Get videos by channel
  async getVideosByChannel(req, res) {
    try {
      const { channelId } = req.params;
      const limit = parseInt(req.query.limit) || 10;
      const page = parseInt(req.query.page) || 1;
      const skip = (page - 1) * limit;

      const videos = await Video.find({ channelId })
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-transcript -embeddings'); // Exclude large fields

      const total = await Video.countDocuments({ channelId });

      res.json({
        success: true,
        data: videos,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error getting videos by channel:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch channel videos',
        error: error.message
      });
    }
  }

  // Get video details with NCERT mappings
  async getVideoDetails(req, res) {
    try {
      const { videoId } = req.params;
      
      const video = await Video.findOne({ videoId });
      
      if (!video) {
        return res.status(404).json({
          success: false,
          message: 'Video not found'
        });
      }

      res.json({
        success: true,
        data: video
      });
    } catch (error) {
      console.error('Error getting video details:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch video details',
        error: error.message
      });
    }
  }

  // Process a new video (fetch metadata, transcript, and generate AI mappings)
  async processVideo(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { videoId } = req.body;
      
      // Check if video already exists
      let video = await Video.findOne({ videoId });
      
      if (video && video.processingStatus === 'completed') {
        return res.json({
          success: true,
          message: 'Video already processed',
          data: video
        });
      }

      // Start processing
      if (!video) {
        video = new Video({ videoId, processingStatus: 'processing' });
        await video.save();
      } else {
        video.processingStatus = 'processing';
        await video.save();
      }

      // Process video in background
      this.processVideoInBackground(videoId);

      res.json({
        success: true,
        message: 'Video processing started',
        data: { videoId, status: 'processing' }
      });

    } catch (error) {
      console.error('Error processing video:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to process video',
        error: error.message
      });
    }
  }

  async processVideoInBackground(videoId) {
    try {
      console.log(`🎬 Starting background processing for video: ${videoId}`);
      
      // 1. Fetch video metadata from YouTube
      const videoDetails = await youtubeService.getVideoDetails(videoId);
      
      // 2. Fetch transcript
      const transcriptData = await transcriptService.getTranscript(videoId);
      
      // 3. Generate embeddings
      const embedding = await geminiService.generateEmbedding(transcriptData.fullText);
      
      // 4. Find NCERT concepts using AI
      const ncertConcepts = await geminiService.findNCERTConcepts(transcriptData.fullText);
      
      // 5. Find relevant timestamps for each concept
      const conceptsWithTimestamps = await Promise.all(
        ncertConcepts.map(async (concept) => {
          const timestamps = await geminiService.findRelevantTimestamps(
            transcriptData.chunks, 
            concept.concept
          );
          return { ...concept, relevantTimestamps: timestamps };
        })
      );

      // 6. Update video in database
      const updateData = {
        title: videoDetails.snippet.title,
        description: videoDetails.snippet.description,
        channelId: videoDetails.snippet.channelId,
        channelTitle: videoDetails.snippet.channelTitle,
        duration: videoDetails.contentDetails.duration,
        publishedAt: new Date(videoDetails.snippet.publishedAt),
        thumbnails: videoDetails.snippet.thumbnails,
        transcript: transcriptData.fullText,
        transcriptTimestamps: transcriptData.timestampedSegments,
        statistics: videoDetails.statistics,
        tags: videoDetails.snippet.tags || [],
        categoryId: videoDetails.snippet.categoryId,
        defaultLanguage: videoDetails.snippet.defaultLanguage,
        embeddings: embedding,
        ncertMappings: conceptsWithTimestamps,
        processingStatus: 'completed',
        lastProcessed: new Date()
      };

      await Video.findOneAndUpdate({ videoId }, updateData, { upsert: true });
      
      // 7. Store embedding in Qdrant
      await qdrantService.upsertVideoEmbedding(videoId, embedding, {
        title: videoDetails.snippet.title,
        channelId: videoDetails.snippet.channelId,
        channelTitle: videoDetails.snippet.channelTitle,
        duration: videoDetails.contentDetails.duration
      });

      console.log(`✅ Successfully processed video: ${videoId}`);
      
    } catch (error) {
      console.error(`❌ Error processing video ${videoId}:`, error.message);
      
      // Update video status to failed
      await Video.findOneAndUpdate(
        { videoId }, 
        { processingStatus: 'failed', lastProcessed: new Date() }
      );
    }
  }

  // Search videos
  async searchVideos(req, res) {
    try {
      const { query, channelId, limit = 20, page = 1 } = req.query;
      
      if (!query) {
        return res.status(400).json({
          success: false,
          message: 'Search query is required'
        });
      }

      const searchQuery = {
        $text: { $search: query },
        processingStatus: 'completed'
      };

      if (channelId) {
        searchQuery.channelId = channelId;
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      const videos = await Video.find(searchQuery, { score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' } })
        .skip(skip)
        .limit(parseInt(limit))
        .select('-transcript -embeddings');

      const total = await Video.countDocuments(searchQuery);

      res.json({
        success: true,
        data: videos,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });

    } catch (error) {
      console.error('Error searching videos:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to search videos',
        error: error.message
      });
    }
  }

  // Get NCERT mappings for specific timestamp
  async getNCERTMappingsAtTimestamp(req, res) {
    try {
      const { videoId } = req.params;
      const { timestamp } = req.query;

      if (!timestamp) {
        return res.status(400).json({
          success: false,
          message: 'Timestamp is required'
        });
      }

      const video = await Video.findOne({ videoId });
      
      if (!video) {
        return res.status(404).json({
          success: false,
          message: 'Video not found'
        });
      }

      const currentTime = parseFloat(timestamp);
      const relevantMappings = video.ncertMappings.filter(mapping => 
        mapping.relevantTimestamps.some(ts => 
          currentTime >= ts.start && currentTime <= ts.end
        )
      );

      res.json({
        success: true,
        data: {
          timestamp: currentTime,
          mappings: relevantMappings
        }
      });

    } catch (error) {
      console.error('Error getting NCERT mappings at timestamp:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to get NCERT mappings',
        error: error.message
      });
    }
  }

  // Get processing status
  async getProcessingStatus(req, res) {
    try {
      const { videoId } = req.params;
      
      const video = await Video.findOne({ videoId }).select('processingStatus lastProcessed');
      
      if (!video) {
        return res.status(404).json({
          success: false,
          message: 'Video not found'
        });
      }

      res.json({
        success: true,
        data: {
          videoId,
          status: video.processingStatus,
          lastProcessed: video.lastProcessed
        }
      });

    } catch (error) {
      console.error('Error getting processing status:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to get processing status',
        error: error.message
      });
    }
  }
}

module.exports = new VideoController();

const NCERTConcept = require('../models/NCERTConcept');
const Video = require('../models/Video');
const geminiService = require('../services/geminiService');
const qdrantService = require('../services/qdrantService');
const { validationResult } = require('express-validator');

class AIController {
  // Find NCERT concepts for a video transcript
  async findNCERTConcepts(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { transcript, subject, class: classNumber, maxConcepts = 5 } = req.body;

      const concepts = await geminiService.findNCERTConcepts(transcript, {
        maxConcepts,
        subject,
        class: classNumber
      });

      res.json({
        success: true,
        data: concepts,
        count: concepts.length
      });

    } catch (error) {
      console.error('Error finding NCERT concepts:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to find NCERT concepts',
        error: error.message
      });
    }
  }

  // Semantic search for similar videos
  async searchSimilarVideos(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { query, limit = 10, scoreThreshold = 0.7 } = req.body;

      // Generate embedding for the query
      const queryEmbedding = await geminiService.generateEmbedding(query);

      // Search similar videos in Qdrant
      const similarVideos = await qdrantService.searchSimilarVideos(queryEmbedding, {
        limit: parseInt(limit),
        scoreThreshold: parseFloat(scoreThreshold)
      });

      // Get full video details from MongoDB
      const videoIds = similarVideos.map(v => v.videoId);
      const videos = await Video.find({ 
        videoId: { $in: videoIds },
        processingStatus: 'completed' 
      }).select('-transcript -embeddings');

      // Combine with similarity scores
      const videosWithScores = videos.map(video => {
        const similarVideo = similarVideos.find(sv => sv.videoId === video.videoId);
        return {
          ...video.toObject(),
          similarityScore: similarVideo?.score || 0
        };
      });

      // Sort by similarity score
      videosWithScores.sort((a, b) => b.similarityScore - a.similarityScore);

      res.json({
        success: true,
        data: videosWithScores,
        count: videosWithScores.length
      });

    } catch (error) {
      console.error('Error searching similar videos:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to search similar videos',
        error: error.message
      });
    }
  }

  // Find relevant NCERT concepts for a video
  async findRelevantNCERTConcepts(req, res) {
    try {
      const { videoId } = req.params;
      const { limit = 5, scoreThreshold = 0.6, subject, class: classNumber } = req.query;

      const video = await Video.findOne({ videoId, processingStatus: 'completed' });
      
      if (!video) {
        return res.status(404).json({
          success: false,
          message: 'Video not found or not processed'
        });
      }

      if (!video.embeddings || video.embeddings.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Video embeddings not available'
        });
      }

      // Search for relevant NCERT concepts using video embeddings
      const relevantConcepts = await qdrantService.findRelevantNCERTConcepts(
        video.embeddings,
        {
          limit: parseInt(limit),
          scoreThreshold: parseFloat(scoreThreshold),
          subject,
          classNumber: classNumber ? parseInt(classNumber) : null
        }
      );

      // Get full concept details from MongoDB
      const conceptIds = relevantConcepts.map(c => c.conceptId);
      const concepts = await NCERTConcept.find({ conceptId: { $in: conceptIds } });

      // Combine with similarity scores
      const conceptsWithScores = concepts.map(concept => {
        const relevantConcept = relevantConcepts.find(rc => rc.conceptId === concept.conceptId);
        return {
          ...concept.toObject(),
          similarityScore: relevantConcept?.score || 0
        };
      });

      // Sort by similarity score
      conceptsWithScores.sort((a, b) => b.similarityScore - a.similarityScore);

      res.json({
        success: true,
        data: conceptsWithScores,
        count: conceptsWithScores.length
      });

    } catch (error) {
      console.error('Error finding relevant NCERT concepts:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to find relevant NCERT concepts',
        error: error.message
      });
    }
  }

  // Generate embeddings for text
  async generateEmbedding(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { text } = req.body;

      const embedding = await geminiService.generateEmbedding(text);

      res.json({
        success: true,
        data: {
          embedding,
          dimension: embedding.length
        }
      });

    } catch (error) {
      console.error('Error generating embedding:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to generate embedding',
        error: error.message
      });
    }
  }

  // Summarize video content
  async summarizeVideo(req, res) {
    try {
      const { videoId } = req.params;
      const { maxLength = 200, focusArea } = req.query;

      const video = await Video.findOne({ videoId, processingStatus: 'completed' });
      
      if (!video) {
        return res.status(404).json({
          success: false,
          message: 'Video not found or not processed'
        });
      }

      if (!video.transcript) {
        return res.status(400).json({
          success: false,
          message: 'Video transcript not available'
        });
      }

      const summary = await geminiService.summarizeVideoContent(video.transcript, {
        maxLength: parseInt(maxLength),
        focusArea
      });

      res.json({
        success: true,
        data: {
          videoId,
          summary,
          originalLength: video.transcript.length,
          summaryLength: summary.length
        }
      });

    } catch (error) {
      console.error('Error summarizing video:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to summarize video',
        error: error.message
      });
    }
  }

  // Extract keywords from text
  async extractKeywords(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { text, maxKeywords = 10 } = req.body;

      const keywords = await geminiService.extractKeywords(text, parseInt(maxKeywords));

      res.json({
        success: true,
        data: {
          keywords,
          count: keywords.length
        }
      });

    } catch (error) {
      console.error('Error extracting keywords:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to extract keywords',
        error: error.message
      });
    }
  }

  // Get Qdrant collections info
  async getVectorDBInfo(req, res) {
    try {
      const collectionsInfo = await qdrantService.getAllCollectionsInfo();

      res.json({
        success: true,
        data: collectionsInfo
      });

    } catch (error) {
      console.error('Error getting vector DB info:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to get vector database information',
        error: error.message
      });
    }
  }

  // Health check for AI services
  async healthCheck(req, res) {
    try {
      const health = {
        gemini: {
          configured: geminiService.isConfigured(),
          status: 'unknown'
        },
        qdrant: await qdrantService.healthCheck()
      };

      // Test Gemini if configured
      if (health.gemini.configured) {
        try {
          await geminiService.generateEmbedding('test');
          health.gemini.status = 'healthy';
        } catch (error) {
          health.gemini.status = 'unhealthy';
          health.gemini.error = error.message;
        }
      }

      const allHealthy = health.gemini.status === 'healthy' && 
                        health.qdrant.status === 'healthy';

      res.status(allHealthy ? 200 : 503).json({
        success: allHealthy,
        data: health
      });

    } catch (error) {
      console.error('Error checking AI health:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to check AI services health',
        error: error.message
      });
    }
  }
}

module.exports = new AIController();

const Channel = require('../models/Channel');
const Video = require('../models/Video');
const youtubeService = require('../services/youtubeService');
const { validationResult } = require('express-validator');

class ChannelController {
  // Get all channels with their video counts
  async getAllChannels(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 20;
      const page = parseInt(req.query.page) || 1;
      const skip = (page - 1) * limit;

      const channels = await Channel.find({ isActive: true })
        .sort({ videoCount: -1 })
        .skip(skip)
        .limit(limit)
        .select('-description'); // Exclude description for list view

      const total = await Channel.countDocuments({ isActive: true });

      res.json({
        success: true,
        data: channels,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error getting all channels:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch channels',
        error: error.message
      });
    }
  }

  // Get channel details
  async getChannelDetails(req, res) {
    try {
      const { channelId } = req.params;
      
      const channel = await Channel.findOne({ channelId });
      
      if (!channel) {
        return res.status(404).json({
          success: false,
          message: 'Channel not found'
        });
      }

      res.json({
        success: true,
        data: channel
      });
    } catch (error) {
      console.error('Error getting channel details:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch channel details',
        error: error.message
      });
    }
  }

  // Add a new channel
  async addChannel(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { channelId, educationalCategories, targetAudience } = req.body;
      
      // Check if channel already exists
      const existingChannel = await Channel.findOne({ channelId });
      if (existingChannel) {
        return res.status(409).json({
          success: false,
          message: 'Channel already exists'
        });
      }

      // Fetch channel details from YouTube
      const channelDetails = await youtubeService.getChannelDetails(channelId);
      
      // Create new channel
      const channelData = {
        channelId,
        title: channelDetails.snippet.title,
        description: channelDetails.snippet.description,
        customUrl: channelDetails.snippet.customUrl,
        publishedAt: new Date(channelDetails.snippet.publishedAt),
        thumbnails: channelDetails.snippet.thumbnails,
        statistics: channelDetails.statistics,
        brandingSettings: channelDetails.brandingSettings,
        educationalCategories: educationalCategories || [],
        targetAudience: targetAudience || 'General',
        isActive: true
      };

      const channel = new Channel(channelData);
      await channel.save();

      // Start fetching videos for this channel in background
      this.fetchChannelVideosInBackground(channelId);

      res.status(201).json({
        success: true,
        message: 'Channel added successfully',
        data: channel
      });

    } catch (error) {
      console.error('Error adding channel:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to add channel',
        error: error.message
      });
    }
  }

  // Update channel metadata
  async updateChannel(req, res) {
    try {
      const { channelId } = req.params;
      const { educationalCategories, targetAudience, isActive } = req.body;
      
      const updateData = {};
      if (educationalCategories !== undefined) updateData.educationalCategories = educationalCategories;
      if (targetAudience !== undefined) updateData.targetAudience = targetAudience;
      if (isActive !== undefined) updateData.isActive = isActive;

      const channel = await Channel.findOneAndUpdate(
        { channelId },
        updateData,
        { new: true, runValidators: true }
      );

      if (!channel) {
        return res.status(404).json({
          success: false,
          message: 'Channel not found'
        });
      }

      res.json({
        success: true,
        message: 'Channel updated successfully',
        data: channel
      });

    } catch (error) {
      console.error('Error updating channel:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to update channel',
        error: error.message
      });
    }
  }

  // Refresh channel videos
  async refreshChannelVideos(req, res) {
    try {
      const { channelId } = req.params;
      
      const channel = await Channel.findOne({ channelId });
      if (!channel) {
        return res.status(404).json({
          success: false,
          message: 'Channel not found'
        });
      }

      // Start fetching videos in background
      this.fetchChannelVideosInBackground(channelId);

      res.json({
        success: true,
        message: 'Channel video refresh started',
        data: { channelId, status: 'refreshing' }
      });

    } catch (error) {
      console.error('Error refreshing channel videos:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to refresh channel videos',
        error: error.message
      });
    }
  }

  // Get channels by educational category
  async getChannelsByCategory(req, res) {
    try {
      const { category } = req.params;
      
      const channels = await Channel.find({
        educationalCategories: category,
        isActive: true
      }).sort({ videoCount: -1 });

      res.json({
        success: true,
        data: channels,
        count: channels.length
      });

    } catch (error) {
      console.error('Error getting channels by category:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch channels by category',
        error: error.message
      });
    }
  }

  // Background function to fetch channel videos
  async fetchChannelVideosInBackground(channelId) {
    try {
      console.log(`📺 Starting to fetch videos for channel: ${channelId}`);
      
      let pageToken = null;
      let totalVideos = 0;
      const maxVideos = 100; // Limit to prevent overwhelming

      do {
        const response = await youtubeService.getChannelVideos(channelId, 50, pageToken);
        
        for (const item of response.items) {
          const videoId = item.id.videoId;
          
          // Check if video already exists
          const existingVideo = await Video.findOne({ videoId });
          if (!existingVideo) {
            // Create new video entry
            const videoData = {
              videoId,
              title: item.snippet.title,
              description: item.snippet.description,
              channelId: item.snippet.channelId,
              channelTitle: item.snippet.channelTitle,
              publishedAt: new Date(item.snippet.publishedAt),
              thumbnails: item.snippet.thumbnails,
              processingStatus: 'pending'
            };

            await Video.create(videoData);
            totalVideos++;
          }
        }

        pageToken = response.nextPageToken;
        
        // Break if we've fetched enough videos
        if (totalVideos >= maxVideos) break;
        
      } while (pageToken);

      // Update channel video count
      const channel = await Channel.findOne({ channelId });
      if (channel) {
        await channel.updateVideoCount();
        channel.lastVideoFetch = new Date();
        await channel.save();
      }

      console.log(`✅ Fetched ${totalVideos} new videos for channel: ${channelId}`);

    } catch (error) {
      console.error(`❌ Error fetching videos for channel ${channelId}:`, error.message);
    }
  }

  // Get channel statistics
  async getChannelStats(req, res) {
    try {
      const { channelId } = req.params;
      
      const channel = await Channel.findOne({ channelId });
      if (!channel) {
        return res.status(404).json({
          success: false,
          message: 'Channel not found'
        });
      }

      const videoStats = await Video.aggregate([
        { $match: { channelId } },
        {
          $group: {
            _id: '$processingStatus',
            count: { $sum: 1 }
          }
        }
      ]);

      const stats = {
        channel: {
          title: channel.title,
          subscriberCount: channel.statistics?.subscriberCount,
          videoCount: channel.videoCount,
          processedVideoCount: channel.processedVideoCount
        },
        videos: videoStats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {})
      };

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('Error getting channel stats:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to get channel statistics',
        error: error.message
      });
    }
  }
}

module.exports = new ChannelController();

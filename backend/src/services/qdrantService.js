const { QdrantClient } = require('@qdrant/js-client-rest');

class QdrantService {
  constructor() {
    this.client = new QdrantClient({
      url: process.env.QDRANT_URL || 'http://localhost:6333',
      apiKey: process.env.QDRANT_API_KEY
    });
    
    this.videoCollectionName = 'video_embeddings';
    this.ncertCollectionName = 'ncert_embeddings';
    this.vectorSize = 768; // Gemini embedding dimension
  }

  async initialize() {
    try {
      await this.createCollectionIfNotExists(this.videoCollectionName);
      await this.createCollectionIfNotExists(this.ncertCollectionName);
      console.log('✅ Qdrant collections initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Qdrant collections:', error.message);
      throw error;
    }
  }

  async createCollectionIfNotExists(collectionName) {
    try {
      // Check if collection exists
      const collections = await this.client.getCollections();
      const exists = collections.collections.some(col => col.name === collectionName);
      
      if (!exists) {
        await this.client.createCollection(collectionName, {
          vectors: {
            size: this.vectorSize,
            distance: 'Cosine'
          },
          optimizers_config: {
            default_segment_number: 2
          },
          replication_factor: 1
        });
        console.log(`✅ Created Qdrant collection: ${collectionName}`);
      } else {
        console.log(`📋 Qdrant collection already exists: ${collectionName}`);
      }
    } catch (error) {
      console.error(`❌ Error creating collection ${collectionName}:`, error.message);
      throw error;
    }
  }

  async upsertVideoEmbedding(videoId, embedding, metadata = {}) {
    try {
      const point = {
        id: this.generatePointId(videoId),
        vector: embedding,
        payload: {
          videoId,
          type: 'video',
          createdAt: new Date().toISOString(),
          ...metadata
        }
      };

      await this.client.upsert(this.videoCollectionName, {
        wait: true,
        points: [point]
      });

      console.log(`✅ Upserted video embedding for: ${videoId}`);
      return point.id;
    } catch (error) {
      console.error(`❌ Error upserting video embedding for ${videoId}:`, error.message);
      throw error;
    }
  }

  async upsertNCERTEmbedding(conceptId, embedding, metadata = {}) {
    try {
      const point = {
        id: this.generatePointId(conceptId),
        vector: embedding,
        payload: {
          conceptId,
          type: 'ncert_concept',
          createdAt: new Date().toISOString(),
          ...metadata
        }
      };

      await this.client.upsert(this.ncertCollectionName, {
        wait: true,
        points: [point]
      });

      console.log(`✅ Upserted NCERT embedding for: ${conceptId}`);
      return point.id;
    } catch (error) {
      console.error(`❌ Error upserting NCERT embedding for ${conceptId}:`, error.message);
      throw error;
    }
  }

  async searchSimilarVideos(queryEmbedding, options = {}) {
    const {
      limit = 10,
      scoreThreshold = 0.7,
      filter = null
    } = options;

    try {
      const searchResult = await this.client.search(this.videoCollectionName, {
        vector: queryEmbedding,
        limit,
        score_threshold: scoreThreshold,
        with_payload: true,
        filter
      });

      return searchResult.map(result => ({
        videoId: result.payload.videoId,
        score: result.score,
        metadata: result.payload
      }));
    } catch (error) {
      console.error('❌ Error searching similar videos:', error.message);
      throw error;
    }
  }

  async searchSimilarConcepts(queryEmbedding, options = {}) {
    const {
      limit = 10,
      scoreThreshold = 0.7,
      filter = null
    } = options;

    try {
      const searchResult = await this.client.search(this.ncertCollectionName, {
        vector: queryEmbedding,
        limit,
        score_threshold: scoreThreshold,
        with_payload: true,
        filter
      });

      return searchResult.map(result => ({
        conceptId: result.payload.conceptId,
        score: result.score,
        metadata: result.payload
      }));
    } catch (error) {
      console.error('❌ Error searching similar concepts:', error.message);
      throw error;
    }
  }

  async findRelevantNCERTConcepts(videoEmbedding, options = {}) {
    const {
      limit = 5,
      scoreThreshold = 0.6,
      subject = null,
      classNumber = null
    } = options;

    let filter = null;
    if (subject || classNumber) {
      filter = {
        must: []
      };
      
      if (subject) {
        filter.must.push({
          match: {
            key: 'subject',
            value: subject
          }
        });
      }
      
      if (classNumber) {
        filter.must.push({
          match: {
            key: 'class',
            value: classNumber
          }
        });
      }
    }

    return await this.searchSimilarConcepts(videoEmbedding, {
      limit,
      scoreThreshold,
      filter
    });
  }

  async deleteVideoEmbedding(videoId) {
    try {
      const pointId = this.generatePointId(videoId);
      await this.client.delete(this.videoCollectionName, {
        wait: true,
        points: [pointId]
      });
      console.log(`✅ Deleted video embedding for: ${videoId}`);
    } catch (error) {
      console.error(`❌ Error deleting video embedding for ${videoId}:`, error.message);
      throw error;
    }
  }

  async deleteNCERTEmbedding(conceptId) {
    try {
      const pointId = this.generatePointId(conceptId);
      await this.client.delete(this.ncertCollectionName, {
        wait: true,
        points: [pointId]
      });
      console.log(`✅ Deleted NCERT embedding for: ${conceptId}`);
    } catch (error) {
      console.error(`❌ Error deleting NCERT embedding for ${conceptId}:`, error.message);
      throw error;
    }
  }

  async getCollectionInfo(collectionName) {
    try {
      const info = await this.client.getCollection(collectionName);
      return {
        name: collectionName,
        vectorsCount: info.vectors_count,
        indexedVectorsCount: info.indexed_vectors_count,
        pointsCount: info.points_count,
        status: info.status
      };
    } catch (error) {
      console.error(`❌ Error getting collection info for ${collectionName}:`, error.message);
      throw error;
    }
  }

  async getAllCollectionsInfo() {
    try {
      const videoInfo = await this.getCollectionInfo(this.videoCollectionName);
      const ncertInfo = await this.getCollectionInfo(this.ncertCollectionName);
      
      return {
        video: videoInfo,
        ncert: ncertInfo
      };
    } catch (error) {
      console.error('❌ Error getting all collections info:', error.message);
      throw error;
    }
  }

  // Batch operations
  async batchUpsertVideoEmbeddings(videoEmbeddings) {
    try {
      const points = videoEmbeddings.map(({ videoId, embedding, metadata = {} }) => ({
        id: this.generatePointId(videoId),
        vector: embedding,
        payload: {
          videoId,
          type: 'video',
          createdAt: new Date().toISOString(),
          ...metadata
        }
      }));

      await this.client.upsert(this.videoCollectionName, {
        wait: true,
        points
      });

      console.log(`✅ Batch upserted ${points.length} video embeddings`);
      return points.map(p => p.id);
    } catch (error) {
      console.error('❌ Error batch upserting video embeddings:', error.message);
      throw error;
    }
  }

  async batchUpsertNCERTEmbeddings(conceptEmbeddings) {
    try {
      const points = conceptEmbeddings.map(({ conceptId, embedding, metadata = {} }) => ({
        id: this.generatePointId(conceptId),
        vector: embedding,
        payload: {
          conceptId,
          type: 'ncert_concept',
          createdAt: new Date().toISOString(),
          ...metadata
        }
      }));

      await this.client.upsert(this.ncertCollectionName, {
        wait: true,
        points
      });

      console.log(`✅ Batch upserted ${points.length} NCERT embeddings`);
      return points.map(p => p.id);
    } catch (error) {
      console.error('❌ Error batch upserting NCERT embeddings:', error.message);
      throw error;
    }
  }

  // Utility methods
  generatePointId(id) {
    // Convert string ID to numeric ID (Qdrant requirement)
    return parseInt(this.hashCode(id));
  }

  hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  // Health check
  async healthCheck() {
    try {
      const collections = await this.client.getCollections();
      return {
        status: 'healthy',
        collections: collections.collections.map(col => ({
          name: col.name,
          status: 'active'
        }))
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }
}

module.exports = new QdrantService();

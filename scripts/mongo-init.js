// MongoDB initialization script
db = db.getSiblingDB('ai-educational-companion');

// Create collections with proper indexes
db.createCollection('videos');
db.createCollection('channels');
db.createCollection('ncertconcepts');

// Create indexes for videos collection
db.videos.createIndex({ "videoId": 1 }, { unique: true });
db.videos.createIndex({ "channelId": 1, "publishedAt": -1 });
db.videos.createIndex({ "processingStatus": 1, "createdAt": 1 });
db.videos.createIndex({ "ncertMappings.concept": 1 });
db.videos.createIndex({ "tags": 1 });
db.videos.createIndex({ 
  "title": "text", 
  "description": "text", 
  "transcript": "text" 
});

// Create indexes for channels collection
db.channels.createIndex({ "channelId": 1 }, { unique: true });
db.channels.createIndex({ "educationalCategories": 1 });
db.channels.createIndex({ "targetAudience": 1 });
db.channels.createIndex({ "isActive": 1, "videoCount": -1 });

// Create indexes for NCERT concepts collection
db.ncertconcepts.createIndex({ "conceptId": 1 }, { unique: true });
db.ncertconcepts.createIndex({ "subject": 1, "class": 1, "chapter.number": 1 });
db.ncertconcepts.createIndex({ "keywords": 1 });
db.ncertconcepts.createIndex({ "difficulty": 1, "class": 1 });
db.ncertconcepts.createIndex({ "processingStatus": 1 });
db.ncertconcepts.createIndex({ 
  "title": "text", 
  "description": "text", 
  "content": "text",
  "keywords": "text"
});

print('MongoDB indexes created successfully');

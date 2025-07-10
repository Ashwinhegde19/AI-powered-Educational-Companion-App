const { YoutubeTranscript } = require('youtube-transcript');

class TranscriptService {
  constructor() {
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 second
  }

  async getTranscript(videoId, options = {}) {
    const { lang = 'en', country = 'US' } = options;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`Attempting to fetch transcript for video ${videoId} (attempt ${attempt})`);
        
        // Try to get transcript with specific language
        let transcript = await YoutubeTranscript.fetchTranscript(videoId, {
          lang: lang,
          country: country
        });

        if (!transcript || transcript.length === 0) {
          // Try without language specification
          transcript = await YoutubeTranscript.fetchTranscript(videoId);
        }

        if (!transcript || transcript.length === 0) {
          throw new Error('No transcript available');
        }

        // Process transcript data
        const processedTranscript = this.processTranscript(transcript);
        
        console.log(`✅ Successfully fetched transcript for video ${videoId}`);
        return processedTranscript;

      } catch (error) {
        console.error(`❌ Attempt ${attempt} failed for video ${videoId}:`, error.message);
        
        if (attempt === this.maxRetries) {
          throw new Error(`Failed to fetch transcript after ${this.maxRetries} attempts: ${error.message}`);
        }
        
        // Wait before retrying
        await this.delay(this.retryDelay * attempt);
      }
    }
  }

  processTranscript(rawTranscript) {
    if (!Array.isArray(rawTranscript)) {
      throw new Error('Invalid transcript format');
    }

    // Combine all text
    const fullText = rawTranscript
      .map(item => item.text)
      .join(' ')
      .replace(/\[.*?\]/g, '') // Remove stage directions
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    // Create timestamped segments
    const timestampedSegments = rawTranscript.map(item => ({
      start: parseFloat(item.offset) / 1000, // Convert to seconds
      duration: parseFloat(item.duration) / 1000, // Convert to seconds
      text: item.text.replace(/\[.*?\]/g, '').trim()
    }));

    // Create time-based chunks (30-second segments)
    const chunks = this.createTimeBasedChunks(timestampedSegments, 30);

    return {
      fullText,
      timestampedSegments,
      chunks,
      totalDuration: timestampedSegments.length > 0 
        ? timestampedSegments[timestampedSegments.length - 1].start + 
          timestampedSegments[timestampedSegments.length - 1].duration 
        : 0,
      wordCount: fullText.split(/\s+/).length
    };
  }

  createTimeBasedChunks(segments, chunkDurationSeconds) {
    const chunks = [];
    let currentChunk = {
      startTime: 0,
      endTime: chunkDurationSeconds,
      text: '',
      segments: []
    };

    for (const segment of segments) {
      const segmentStart = segment.start;
      const segmentEnd = segment.start + segment.duration;

      if (segmentStart >= currentChunk.endTime) {
        // Start a new chunk
        if (currentChunk.text.trim()) {
          chunks.push({ ...currentChunk });
        }
        
        currentChunk = {
          startTime: Math.floor(segmentStart / chunkDurationSeconds) * chunkDurationSeconds,
          endTime: Math.floor(segmentStart / chunkDurationSeconds) * chunkDurationSeconds + chunkDurationSeconds,
          text: segment.text,
          segments: [segment]
        };
      } else {
        // Add to current chunk
        currentChunk.text += ' ' + segment.text;
        currentChunk.segments.push(segment);
      }
    }

    // Add the last chunk
    if (currentChunk.text.trim()) {
      chunks.push(currentChunk);
    }

    return chunks.map(chunk => ({
      ...chunk,
      text: chunk.text.trim(),
      duration: chunk.endTime - chunk.startTime
    }));
  }

  // Check if transcript is available for a video
  async isTranscriptAvailable(videoId) {
    try {
      const transcript = await YoutubeTranscript.fetchTranscript(videoId);
      return transcript && transcript.length > 0;
    } catch (error) {
      return false;
    }
  }

  // Search for specific text in transcript with timestamps
  searchInTranscript(transcript, searchQuery) {
    if (!transcript || !transcript.timestampedSegments) {
      return [];
    }

    const query = searchQuery.toLowerCase();
    const results = [];

    transcript.timestampedSegments.forEach((segment, index) => {
      if (segment.text.toLowerCase().includes(query)) {
        results.push({
          timestamp: segment.start,
          text: segment.text,
          contextBefore: index > 0 ? transcript.timestampedSegments[index - 1].text : '',
          contextAfter: index < transcript.timestampedSegments.length - 1 
            ? transcript.timestampedSegments[index + 1].text : ''
        });
      }
    });

    return results;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = new TranscriptService();

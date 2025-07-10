const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
    this.embeddingModel = this.genAI.getGenerativeModel({ model: 'embedding-001' });
  }

  async generateEmbedding(text) {
    try {
      if (!text || text.trim().length === 0) {
        throw new Error('Text cannot be empty');
      }

      const result = await this.embeddingModel.embedContent(text);
      return result.embedding.values;
    } catch (error) {
      console.error('Error generating embedding:', error.message);
      throw new Error(`Failed to generate embedding: ${error.message}`);
    }
  }

  async generateMultipleEmbeddings(texts) {
    try {
      const embeddings = await Promise.all(
        texts.map(text => this.generateEmbedding(text))
      );
      return embeddings;
    } catch (error) {
      console.error('Error generating multiple embeddings:', error.message);
      throw new Error(`Failed to generate multiple embeddings: ${error.message}`);
    }
  }

  async findNCERTConcepts(transcriptText, options = {}) {
    const { 
      maxConcepts = 5, 
      confidenceThreshold = 0.7,
      subject = null,
      class: classNumber = null 
    } = options;

    try {
      const prompt = `
Analyze the following video transcript and identify relevant NCERT textbook concepts. 
For each concept identified, provide:
1. The concept name
2. Subject area
3. Suggested class level (1-12)
4. Chapter/section reference
5. Confidence score (0-1)
6. Brief explanation of relevance

${subject ? `Focus on ${subject} concepts.` : ''}
${classNumber ? `Prioritize class ${classNumber} level concepts.` : ''}

Transcript:
${transcriptText}

Please format your response as a JSON array with the following structure:
[
  {
    "concept": "concept name",
    "subject": "subject name",
    "class": number,
    "chapter": "chapter reference",
    "section": "section reference", 
    "confidence": 0.85,
    "explanation": "why this concept is relevant",
    "keywords": ["key", "words", "from", "transcript"]
  }
]

Only include concepts with confidence >= ${confidenceThreshold}.
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Try to parse JSON response
      try {
        const concepts = JSON.parse(text);
        return Array.isArray(concepts) ? concepts.slice(0, maxConcepts) : [];
      } catch (parseError) {
        console.error('Failed to parse Gemini response as JSON:', parseError.message);
        // Fallback: extract concepts using regex or manual parsing
        return this.parseConceptsFromText(text, maxConcepts);
      }

    } catch (error) {
      console.error('Error finding NCERT concepts:', error.message);
      throw new Error(`Failed to find NCERT concepts: ${error.message}`);
    }
  }

  async findRelevantTimestamps(transcriptChunks, concept, options = {}) {
    const { confidenceThreshold = 0.6 } = options;

    try {
      const prompt = `
Given the NCERT concept "${concept}" and the following video transcript chunks with timestamps,
identify which time segments are most relevant to this concept.

Concept: ${concept}

Transcript chunks:
${transcriptChunks.map((chunk, index) => 
  `[${this.formatTime(chunk.startTime)} - ${this.formatTime(chunk.endTime)}]: ${chunk.text}`
).join('\n\n')}

Please provide a JSON array of relevant timestamp ranges with confidence scores:
[
  {
    "startTime": 120.5,
    "endTime": 180.2, 
    "confidence": 0.85,
    "relevantText": "specific text that relates to the concept",
    "explanation": "why this segment is relevant"
  }
]

Only include segments with confidence >= ${confidenceThreshold}.
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      try {
        const timestamps = JSON.parse(text);
        return Array.isArray(timestamps) ? timestamps : [];
      } catch (parseError) {
        console.error('Failed to parse timestamp response:', parseError.message);
        return [];
      }

    } catch (error) {
      console.error('Error finding relevant timestamps:', error.message);
      throw new Error(`Failed to find relevant timestamps: ${error.message}`);
    }
  }

  async summarizeVideoContent(transcriptText, options = {}) {
    const { maxLength = 200, focusArea = null } = options;

    try {
      const prompt = `
Provide a concise summary of the following video transcript in approximately ${maxLength} words.
${focusArea ? `Focus particularly on ${focusArea} aspects.` : ''}

Transcript:
${transcriptText}

Summary:
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();

    } catch (error) {
      console.error('Error summarizing video content:', error.message);
      throw new Error(`Failed to summarize video content: ${error.message}`);
    }
  }

  async extractKeywords(text, maxKeywords = 10) {
    try {
      const prompt = `
Extract the most important keywords and phrases from the following text.
Return exactly ${maxKeywords} keywords as a JSON array of strings.

Text:
${text}

Keywords (JSON array):
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text_response = response.text();

      try {
        const keywords = JSON.parse(text_response);
        return Array.isArray(keywords) ? keywords : [];
      } catch (parseError) {
        // Fallback: split by common delimiters
        return text_response
          .split(/[,\n]/)
          .map(keyword => keyword.trim().replace(/['"]/g, ''))
          .filter(keyword => keyword.length > 0)
          .slice(0, maxKeywords);
      }

    } catch (error) {
      console.error('Error extracting keywords:', error.message);
      throw new Error(`Failed to extract keywords: ${error.message}`);
    }
  }

  // Helper method to parse concepts from text when JSON parsing fails
  parseConceptsFromText(text, maxConcepts) {
    // This is a fallback method to extract concepts from free-form text
    // Implementation would depend on the actual format returned by Gemini
    const concepts = [];
    
    // Simple pattern matching - this should be enhanced based on actual responses
    const lines = text.split('\n');
    let currentConcept = {};
    
    for (const line of lines) {
      if (line.includes('concept:') || line.includes('Concept:')) {
        if (Object.keys(currentConcept).length > 0) {
          concepts.push(currentConcept);
        }
        currentConcept = { concept: line.split(':')[1]?.trim() };
      } else if (line.includes('subject:') || line.includes('Subject:')) {
        currentConcept.subject = line.split(':')[1]?.trim();
      } else if (line.includes('confidence:') || line.includes('Confidence:')) {
        currentConcept.confidence = parseFloat(line.split(':')[1]?.trim()) || 0.5;
      }
    }
    
    if (Object.keys(currentConcept).length > 0) {
      concepts.push(currentConcept);
    }
    
    return concepts.slice(0, maxConcepts);
  }

  // Helper method to format time in MM:SS format
  formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  // Check if API key is configured
  isConfigured() {
    return !!process.env.GEMINI_API_KEY;
  }
}

module.exports = new GeminiService();

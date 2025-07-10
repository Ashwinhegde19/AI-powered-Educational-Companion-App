const express = require('express');
const router = express.Router();
const NCERTConcept = require('../models/NCERTConcept');

// Get all NCERT concepts
router.get('/', async(req, res) => {
  try {
    const { page = 1, limit = 10, grade, subject } = req.query;
    const query = {};
    
    if (grade) {
      query.grade = grade;
    }
    if (subject) {
      query.subject = subject;
    }

    const concepts = await NCERTConcept.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ grade: 1, chapter: 1 });

    const total = await NCERTConcept.countDocuments(query);

    res.json({
      success: true,
      data: concepts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching NCERT concepts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching NCERT concepts',
      error: error.message
    });
  }
});

// Get concept by ID
router.get('/:id', async(req, res) => {
  try {
    const concept = await NCERTConcept.findById(req.params.id);
    
    if (!concept) {
      return res.status(404).json({
        success: false,
        message: 'NCERT concept not found'
      });
    }

    res.json({
      success: true,
      data: concept
    });
  } catch (error) {
    console.error('Error fetching NCERT concept:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching NCERT concept',
      error: error.message
    });
  }
});

// Search concepts by topic or content
router.get('/search/:query', async(req, res) => {
  try {
    const { query } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const searchQuery = {
      $or: [
        { topic: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } },
        { keywords: { $in: [new RegExp(query, 'i')] } }
      ]
    };

    const concepts = await NCERTConcept.find(searchQuery)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ grade: 1, chapter: 1 });

    const total = await NCERTConcept.countDocuments(searchQuery);

    res.json({
      success: true,
      data: concepts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error searching NCERT concepts:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching NCERT concepts',
      error: error.message
    });
  }
});

module.exports = router;

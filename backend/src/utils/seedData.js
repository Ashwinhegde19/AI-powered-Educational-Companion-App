const mongoose = require('mongoose');
const Channel = require('../models/Channel');
require('dotenv').config();

const sampleChannels = [
  {
    channelId: 'UCYO_jab_esuFRV4b17AJtAw',
    title: '3Blue1Brown',
    description: 'Videos about math and teaching, with an emphasis on intuitive explanations.',
    customUrl: '3blue1brown',
    publishedAt: new Date('2015-03-06'),
    thumbnails: {
      default: {
        url: 'https://yt3.ggpht.com/ytc/AMLnZu-fB-c8gczS81r-VBWgzndcSZgd1zCS4a7fpVe-=s88-c-k-c0x00ffffff-no-rj',
        width: 88,
        height: 88
      },
      medium: {
        url: 'https://yt3.ggpht.com/ytc/AMLnZu-fB-c8gczS81r-VBWgzndcSZgd1zCS4a7fpVe-=s240-c-k-c0x00ffffff-no-rj',
        width: 240,
        height: 240
      },
      high: {
        url: 'https://yt3.ggpht.com/ytc/AMLnZu-fB-c8gczS81r-VBWgzndcSZgd1zCS4a7fpVe-=s800-c-k-c0x00ffffff-no-rj',
        width: 800,
        height: 800
      }
    },
    statistics: {
      viewCount: '500000000',
      subscriberCount: '5000000',
      videoCount: '150'
    },
    educationalCategories: ['Mathematics'],
    targetAudience: 'Higher Secondary',
    isActive: true
  },
  {
    channelId: 'UCHnyfMqiRRG1u-2MsSQLbXA',
    title: 'Veritasium',
    description: 'An element of truth - videos about science, education, and anything else I find interesting.',
    customUrl: 'veritasium',
    publishedAt: new Date('2010-07-21'),
    thumbnails: {
      default: {
        url: 'https://yt3.ggpht.com/ytc/AMLnZu98W9b-FZj8sOPmOZ6DjT8aKFgU1-q1V9c_WJRf=s88-c-k-c0x00ffffff-no-rj',
        width: 88,
        height: 88
      },
      medium: {
        url: 'https://yt3.ggpht.com/ytc/AMLnZu98W9b-FZj8sOPmOZ6DjT8aKFgU1-q1V9c_WJRf=s240-c-k-c0x00ffffff-no-rj',
        width: 240,
        height: 240
      },
      high: {
        url: 'https://yt3.ggpht.com/ytc/AMLnZu98W9b-FZj8sOPmOZ6DjT8aKFgU1-q1V9c_WJRf=s800-c-k-c0x00ffffff-no-rj',
        width: 800,
        height: 800
      }
    },
    statistics: {
      viewCount: '1000000000',
      subscriberCount: '12000000',
      videoCount: '300'
    },
    educationalCategories: ['Physics', 'General Science'],
    targetAudience: 'Higher Secondary',
    isActive: true
  },
  {
    channelId: 'UCsXVk37bltHxD1rDPwtNM8Q',
    title: 'Kurzgesagt – In a Nutshell',
    description: 'Kurzgesagt – In a Nutshell explains complex topics from space and technology to philosophy and psychology.',
    customUrl: 'kurzgesagt',
    publishedAt: new Date('2013-07-09'),
    thumbnails: {
      default: {
        url: 'https://yt3.ggpht.com/ytc/AMLnZu_I9x2O7dJe7L7r1LK9rJ4g-8uW8j6-r2C5C_zM=s88-c-k-c0x00ffffff-no-rj',
        width: 88,
        height: 88
      },
      medium: {
        url: 'https://yt3.ggpht.com/ytc/AMLnZu_I9x2O7dJe7L7r1LK9rJ4g-8uW8j6-r2C5C_zM=s240-c-k-c0x00ffffff-no-rj',
        width: 240,
        height: 240
      },
      high: {
        url: 'https://yt3.ggpht.com/ytc/AMLnZu_I9x2O7dJe7L7r1LK9rJ4g-8uW8j6-r2C5C_zM=s800-c-k-c0x00ffffff-no-rj',
        width: 800,
        height: 800
      }
    },
    statistics: {
      viewCount: '2000000000',
      subscriberCount: '18000000',
      videoCount: '180'
    },
    educationalCategories: ['General Science', 'Biology', 'Physics'],
    targetAudience: 'General',
    isActive: true
  },
  {
    channelId: 'UCoxcjq-8xIDTYp3uz647V5A',
    title: 'Numberphile',
    description: 'Videos about numbers - it\'s that simple. Videos by Brady Haran.',
    customUrl: 'numberphile',
    publishedAt: new Date('2011-09-15'),
    thumbnails: {
      default: {
        url: 'https://yt3.ggpht.com/ytc/AMLnZu_kH8c_3fDL-q2g_r4J8WpC6q3k8_2J3o_4m-0=s88-c-k-c0x00ffffff-no-rj',
        width: 88,
        height: 88
      },
      medium: {
        url: 'https://yt3.ggpht.com/ytc/AMLnZu_kH8c_3fDL-q2g_r4J8WpC6q3k8_2J3o_4m-0=s240-c-k-c0x00ffffff-no-rj',
        width: 240,
        height: 240
      },
      high: {
        url: 'https://yt3.ggpht.com/ytc/AMLnZu_kH8c_3fDL-q2g_r4J8WpC6q3k8_2J3o_4m-0=s800-c-k-c0x00ffffff-no-rj',
        width: 800,
        height: 800
      }
    },
    statistics: {
      viewCount: '800000000',
      subscriberCount: '4500000',
      videoCount: '500'
    },
    educationalCategories: ['Mathematics'],
    targetAudience: 'General',
    isActive: true
  }
];

const sampleNCERTConcepts = [
  {
    conceptId: 'math_10_ch1_real_numbers',
    title: 'Real Numbers',
    description: 'Understanding the concept of real numbers, their properties, and applications',
    subject: 'Mathematics',
    class: 10,
    book: {
      title: 'Mathematics Textbook for Class X',
      isbn: '978-81-7450-649-4',
      publication: 'NCERT'
    },
    chapter: {
      number: 1,
      title: 'Real Numbers',
      description: 'This chapter introduces real numbers and their fundamental properties'
    },
    section: {
      number: '1.1',
      title: 'Introduction to Real Numbers',
      pageNumbers: [1, 2, 3, 4, 5]
    },
    content: 'Real numbers include all rational and irrational numbers. They form a complete ordered field. Properties include closure, commutativity, associativity, distributivity, and the existence of identity and inverse elements.',
    keywords: ['real numbers', 'rational', 'irrational', 'properties', 'field'],
    learningObjectives: [
      'Understand the concept of real numbers',
      'Identify rational and irrational numbers',
      'Apply properties of real numbers in calculations'
    ],
    difficulty: 'Basic',
    processingStatus: 'completed'
  },
  {
    conceptId: 'physics_11_ch2_motion',
    title: 'Motion in a Straight Line',
    description: 'Study of motion in one dimension, including concepts of displacement, velocity, and acceleration',
    subject: 'Physics',
    class: 11,
    book: {
      title: 'Physics Textbook for Class XI',
      isbn: '978-81-7450-646-3',
      publication: 'NCERT'
    },
    chapter: {
      number: 2,
      title: 'Motion in a Straight Line',
      description: 'This chapter covers the fundamental concepts of motion in one dimension'
    },
    section: {
      number: '2.1',
      title: 'Position, Path Length and Displacement',
      pageNumbers: [23, 24, 25, 26]
    },
    content: 'Motion in a straight line involves concepts of position, displacement, velocity, and acceleration. Displacement is the change in position, velocity is the rate of change of displacement, and acceleration is the rate of change of velocity.',
    keywords: ['motion', 'displacement', 'velocity', 'acceleration', 'kinematics'],
    learningObjectives: [
      'Distinguish between distance and displacement',
      'Understand concepts of velocity and acceleration',
      'Solve problems involving uniformly accelerated motion'
    ],
    difficulty: 'Intermediate',
    processingStatus: 'completed'
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing data
    await Channel.deleteMany({});
    console.log('Cleared existing channels');

    // Insert sample channels
    await Channel.insertMany(sampleChannels);
    console.log('Inserted sample channels');

    // Insert sample NCERT concepts
    const NCERTConcept = require('../models/NCERTConcept');
    await NCERTConcept.deleteMany({});
    console.log('Cleared existing NCERT concepts');
    
    await NCERTConcept.insertMany(sampleNCERTConcepts);
    console.log('Inserted sample NCERT concepts');

    console.log('✅ Database seeded successfully');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, sampleChannels, sampleNCERTConcepts };

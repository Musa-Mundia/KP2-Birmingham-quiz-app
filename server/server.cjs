const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'config.env') });

const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended:true}))

const LEADER_USER_IDS = [
  'Joshua',
  'Taiwo',
  'Taiwo Sowole',
  'Amarachi',
  'Abigail',
  'Munashe',
  'Abena',
  'Kenny',
  'Ella',
  'Yoyin'
];

const Db = process.env.ATLAS_URI;
const client = new MongoClient(Db);

let db;


async function connectDB() {
  try {
    await client.connect();
    console.log('Connected successfully to MongoDB!');
    db = client.db('QuizApp');
  } catch (e) {
    console.error('Failed to connect to MongoDB:', e);
    process.exit(1);
  }
}

// Initialize database users — upserts each user so new additions apply on restart
async function initializeUsers() {
  try {
    const usersCollection = db.collection('users');

    const users = [
      { userId: 'user1',        password: 'password123', role: 'member' },
      { userId: 'user2',        password: 'quiz2025',    role: 'member' },
      { userId: 'admin',        password: 'birmingham',  role: 'member' },
      { userId: 'Joshua',       password: 'josh@392',    role: 'leader' },
      { userId: 'Taiwo',        password: 'taiwo#71',    role: 'leader' },
      { userId: 'Taiwo Sowole', password: 'sowole!85',   role: 'leader' },
      { userId: 'Amarachi',     password: 'amara$46',    role: 'leader' },
      { userId: 'Abigail',      password: 'abby&219',    role: 'leader' },
      { userId: 'Munashe',      password: 'muna^503',    role: 'leader' },
      { userId: 'Abena',        password: 'abena*67',    role: 'leader' },
      { userId: 'Kenny',        password: 'kenny%38',    role: 'leader' },
      { userId: 'Ella',         password: 'ella!924',    role: 'leader' },
      { userId: 'Yoyin',        password: 'yoyin#15',    role: 'leader' },
      { userId: 'Jordine',      password: 'jordi@847',   role: 'mentor' },
    ];

    for (const u of users) {
      const existing = await usersCollection.findOne({ userId: u.userId });
      if (!existing) {
        const hashed = await bcrypt.hash(u.password, 10);
        await usersCollection.insertOne({ userId: u.userId, password: hashed, role: u.role });
        console.log(`Added user: ${u.userId}`);
      }
    }

    console.log('User initialization complete');
  } catch (e) {
    console.error('Error initializing users:', e);
  }
}

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { userId, password } = req.body;

    // Validate input
    if (!userId || !password) {
      return res.status(400).json({ success: false, message: 'User ID and password required' });
    }

    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ userId });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid user ID or password' });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid user ID or password' });
    }

    const role = user.role || (LEADER_USER_IDS.includes(user.userId) ? 'leader' : 'member');

    res.json({ success: true, message: 'Login successful', userId: user.userId, role });
  } catch (e) {
    console.error('Login error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Save score endpoint
app.post('/api/scores', async (req, res) => {
  try {
    const { userId, difficulty, score, totalQuestions } = req.body;

    if (!userId || !difficulty || score === undefined || !totalQuestions) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const scoresCollection = db.collection('scores');
    
    // Check if user already has a score for this difficulty
    const existingScore = await scoresCollection.findOne({ userId, difficulty });
    
    if (existingScore) {
      if (score > existingScore.score) {
        await scoresCollection.updateOne(
          { userId, difficulty },
          { 
            $set: { 
              score, 
              totalQuestions,
              updatedAt: new Date() 
            } 
          }
        );
      }
    } else {
      await scoresCollection.insertOne({
        userId,
        difficulty,
        score,
        totalQuestions,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    res.json({ success: true, message: 'Score saved successfully' });
  } catch (e) {
    console.error('Save score error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get scoreboard endpoint
app.get('/api/scoreboard', async (req, res) => {
  try {
    const { difficulty } = req.query;
    const scoresCollection = db.collection('scores');
    
    let query = {};
    if (difficulty && difficulty !== 'all') {
      query.difficulty = difficulty;
    }

    const scores = await scoresCollection
      .find(query)
      .sort({ score: -1, updatedAt: -1 })
      .limit(50)
      .toArray();

    res.json({ success: true, scores });
  } catch (e) {
    console.error('Get scoreboard error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get user's best scores
app.get('/api/scores/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const scoresCollection = db.collection('scores');
    
    const scores = await scoresCollection
      .find({ userId })
      .sort({ difficulty: 1 })
      .toArray();

    res.json({ success: true, scores });
  } catch (e) {
    console.error('Get user scores error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  initializeUsers().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  });
});
import clientPromise from './lib/mongodb.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { difficulty } = req.query;

    const client = await clientPromise;
    const db = client.db('QuizApp');
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
}

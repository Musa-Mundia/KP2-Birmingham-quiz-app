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

  try {
    const client = await clientPromise;
    const db = client.db('QuizApp');
    const scoresCollection = db.collection('scores');

    if (req.method === 'POST') {
      // Save score
      const { userId, difficulty, score, totalQuestions } = req.body;

      if (!userId || !difficulty || score === undefined || !totalQuestions) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
      }

      // Check if user already has a score for this difficulty
      const existingScore = await scoresCollection.findOne({ userId, difficulty });

      if (existingScore) {
        // Update only if new score is higher
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
        // Insert new score
        await scoresCollection.insertOne({
          userId,
          difficulty,
          score,
          totalQuestions,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }

      return res.json({ success: true, message: 'Score saved successfully' });
    }

    if (req.method === 'GET') {
      // Get user's best scores - uses query param for userId
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({ success: false, message: 'User ID required' });
      }

      const scores = await scoresCollection
        .find({ userId })
        .sort({ difficulty: 1 })
        .toArray();

      return res.json({ success: true, scores });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (e) {
    console.error('Scores error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

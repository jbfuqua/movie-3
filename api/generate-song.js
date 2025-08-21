// api/generate-song.js - AI-Generated Song Recommendation
export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const anthropicKey = process.env.ANTHROPIC_API_KEY;
        if (!anthropicKey) {
            throw new Error('ANTHROPIC_API_KEY environment variable is missing');
        }

        const { concept } = req.body;
        
        if (!concept || !concept.title || !concept.synopsis) {
            return res.status(400).json({ 
                success: false, 
                error: 'Movie concept with title and synopsis required' 
            });
        }

        // Create AI prompt for song recommendation
        const prompt = `You are a music expert and film soundtrack consultant. Based on this movie concept, recommend the PERFECT song that would capture the essence and mood of this film.

MOVIE DETAILS:
Title: "${concept.title}"
Genre: ${concept.genre}
Era: ${concept.decade}
Tagline: "${concept.tagline}"
Synopsis: "${concept.synopsis}"

Consider the movie's:
- Emotional tone and atmosphere
- Setting and time period
- Themes and narrative arc
- Target audience for that era
- Cultural context of the ${concept.decade}

REQUIREMENTS:
- Recommend a REAL song that actually exists
- Choose from music that was popular or iconic in the ${concept.decade} OR music that perfectly captures the mood regardless of era
- Provide specific reasoning connecting the song's lyrics, mood, or cultural significance to the movie's themes
- Consider both mainstream hits and deeper cuts that film music supervisors might choose

Return ONLY valid JSON with these exact keys:
{
  "title": "Song Title",
  "artist": "Artist Name", 
  "year": "Release Year",
  "reason": "Detailed explanation of why this song perfectly captures the essence of this movie, connecting specific themes, mood, or lyrics to the film's synopsis and atmosphere"
}

Make the recommendation thoughtful and specific to THIS movie concept.`;

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': anthropicKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: "claude-3-5-sonnet-20241022",
                max_tokens: 500,
                messages: [{ role: "user", content: prompt }]
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`Claude API request failed: ${response.status} - ${errorData}`);
        }

        const result = await response.json();
        const responseText = result?.content?.[0]?.text || '';
        
        // Extract JSON from response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("No valid JSON found in Claude's response");
        }
        
        const songRecommendation = JSON.parse(jsonMatch[0]);
        
        // Validate the response has required fields
        if (!songRecommendation.title || !songRecommendation.artist || !songRecommendation.reason) {
            throw new Error("Invalid song recommendation format");
        }
        
        res.status(200).json({ success: true, recommendation: songRecommendation });
        
    } catch (error) {
        console.error('Error generating song recommendation:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message || 'Failed to generate song recommendation' 
        });
    }
}
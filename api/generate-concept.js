// api/generate-concept.js - Vercel Serverless Function
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
        const { genreFilter = 'any', eraFilter = 'any' } = req.body;
        
        // Enhanced genre mapping
        const genreMap = {
            'horror': '"Horror"',
            'sci-fi': '"Sci-Fi"',
            'fusion': 'a creative fusion of Horror and Sci-Fi'
        };
        
        // Ensure randomness when no filter is specified
        const randomDecades = ['1950s', '1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s'];
        const forceRandomDecade = eraFilter === 'any' ? randomDecades[Math.floor(Math.random() * randomDecades.length)] : null;
        
        const eraConstraint = eraFilter === 'any' ? `MUST be "${forceRandomDecade}"` : `MUST be "${eraFilter}"`;
        const genreConstraint = genreFilter === 'any' ? 
            `The genre MUST be 'Horror', 'Sci-Fi', or a creative fusion of both` : 
            `The genre MUST be ${genreMap[genreFilter]}`;
        
        // Optimized prompt for better results
        const prompt = `Return ONLY valid JSON with these exact keys: "decade","genre","title","tagline","synopsis","visual_elements","cast","director".

Rules:
- ${eraConstraint}
- ${genreConstraint}
- Title should be short, striking, and original
- Visual_elements should describe 1 focal subject and 2-3 scene elements, be concise
- Synopsis should be 1-2 sentences, high-concept

Example format:
{
  "decade":"1980s",
  "genre":"Sci-Fi Horror",
  "title":"Neon Parallax",
  "tagline":"The city blinked—and forgot you existed.",
  "synopsis":"A tech worker discovers their entire reality is a glitching simulation when neon signs start displaying their deepest fears.",
  "visual_elements":"lone figure silhouetted against massive neon cityscape; rain-slicked streets; distant mechanical drones hovering",
  "cast":["Alex Stone","Morgan Cross","Casey Steel"],
  "director":"Jordan Cipher"
}

Create something completely original and compelling.`;

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: "claude-3-5-sonnet-20241022",
                max_tokens: 800,
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
        
        const concept = JSON.parse(jsonMatch[0]);
        res.status(200).json({ success: true, concept });
        
    } catch (error) {
        console.error('Error generating concept:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message || 'Failed to generate movie concept' 
        });
    }
}
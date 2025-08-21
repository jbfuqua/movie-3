// api/generate-image.js - Vercel Serverless Function
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
        const { visualElements = '', concept = {} } = req.body;
        
        // Enhanced prompt construction for DALL-E 3
        function createOptimizedPrompt(concept, visualElements) {
            const genre = (concept.genre || '').toLowerCase();
            const decade = concept.decade || '1980s';
            const artStyle = concept.artStyle || 'authentic';
            
            // Era-specific visual cues (concise but effective)
            const eraCues = {
                '1950s': 'vintage film grain, hand-painted poster art, atomic age design',
                '1960s': 'retro color palettes, subtle halftone poster texture, mod influences',
                '1970s': 'airbrushed realism, muted earth tones, gritty film stock',
                '1980s': 'high contrast rim lighting, neon accents, chrome effects',
                '1990s': 'photographic one-sheet style, early digital effects',
                '2000s': 'digital compositing, metallic textures, Y2K aesthetics',
                '2010s': 'minimalist design, floating heads composition, orange-blue grading',
                '2020s': 'modern premium cinematography, diverse representation'
            };

            // Art style approach
            const styleApproach = {
                'painted': 'hand-painted movie poster art, visible brushwork, artistic illustration',
                'b-movie': 'sensational pulp B-movie poster art, exaggerated melodrama',
                'photo': 'cinematic portrait photography, professional movie lighting',
                'authentic': 'era-authentic movie poster style'
            };

            // Genre mood
            const genreMood = genre.includes('horror') ? 'ominous atmosphere, suspense, tension' :
                             genre.includes('sci-fi') ? 'futuristic mood, clean tech details' :
                             'dramatic cinematic tone';

            // Construct optimized prompt
            const medium = styleApproach[artStyle] || styleApproach['authentic'];
            const eraCue = eraCues[decade] || eraCues['2020s'];
            const visualBeats = (visualElements || '').replace(/\s+/g, ' ').slice(0, 200);
            
            return `${medium}. ${genreMood}. ${visualBeats}. ${eraCue}. Single cohesive scene, strong focal subject, negative space at top and bottom for title placement, no text, no letters, no watermarks, no logos, professional movie poster composition.`;
        }

        const prompt = createOptimizedPrompt(concept, visualElements);
        
        console.log('Optimized prompt length:', prompt.length);

        const response = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "dall-e-3",
                prompt: prompt,
                n: 1,
                size: "1024x1792",
                quality: "hd",
                style: "vivid"
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`DALL-E 3 API request failed: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
        }

        const result = await response.json();
        
        if (result.data && result.data[0]) {
            let base64Image = result.data[0].b64_json;
            let originalUrl = result.data[0].url;
            
            // If we got URL instead of base64, fetch and convert
            if (!base64Image && originalUrl) {
                try {
                    console.log('Converting image URL to base64...');
                    const imageResponse = await fetch(originalUrl);
                    if (!imageResponse.ok) {
                        throw new Error(`Failed to fetch image: ${imageResponse.status}`);
                    }
                    const imageBuffer = await imageResponse.arrayBuffer();
                    const uint8Array = new Uint8Array(imageBuffer);
                    base64Image = Buffer.from(uint8Array).toString('base64');
                } catch (conversionError) {
                    console.error('Error converting image to base64:', conversionError);
                    // Fallback to URL
                    res.status(200).json({ 
                        success: true, 
                        imageUrl: originalUrl,
                        revisedPrompt: result.data[0].revised_prompt,
                        note: 'Image conversion failed, returning original URL'
                    });
                    return;
                }
            }
            
            if (!base64Image) {
                throw new Error("No image data returned from API");
            }
            
            res.status(200).json({ 
                success: true, 
                imageUrl: `data:image/png;base64,${base64Image}`,
                originalUrl: originalUrl,
                revisedPrompt: result.data[0].revised_prompt 
            });
        } else {
            throw new Error("Invalid image response from DALL-E 3 API");
        }
        
    } catch (error) {
        console.error('Error generating image:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message || 'Failed to generate image' 
        });
    }
}
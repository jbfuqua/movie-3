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
        
        // Enhanced prompt construction for DALL-E 3 with safety considerations
        function createOptimizedPrompt(concept, visualElements) {
            const genre = (concept.genre || '').toLowerCase();
            const decade = concept.decade || '1980s';
            const artStyle = concept.artStyle || 'authentic';
            
            // Era-specific visual cues (concise but effective)
            const eraCues = {
                '1950s': 'vintage film grain, hand-painted poster art, atomic age design, retro illustration',
                '1960s': 'retro color palettes, halftone poster texture, mod design influences, pop art style',
                '1970s': 'airbrushed illustration style, earth tone colors, vintage movie poster aesthetic',
                '1980s': 'high contrast lighting, neon color accents, retro-futuristic design elements',
                '1990s': 'photographic movie poster style, professional studio photography',
                '2000s': 'digital art style, metallic textures, early 2000s movie poster aesthetic',
                '2010s': 'minimalist poster design, clean composition, modern movie poster style',
                '2020s': 'contemporary movie poster photography, premium cinematography style'
            };

            // Art style approach (safety-conscious)
            const styleApproach = {
                'painted': 'hand-painted movie poster illustration, artistic poster design',
                'b-movie': 'vintage B-movie poster art style, retro movie advertisement design',
                'photo': 'cinematic portrait photography, professional movie poster photography',
                'authentic': 'authentic movie poster design'
            };

            // Safety-conscious genre mood (avoid triggering words)
            const genreMood = genre.includes('horror') ? 'mysterious atmosphere, dramatic lighting, suspenseful mood' :
                             genre.includes('sci-fi') ? 'futuristic setting, technological elements, otherworldly atmosphere' :
                             'dramatic cinematic atmosphere, movie poster mood';

            // Clean and sanitize visual elements to avoid safety triggers
            const cleanVisualElements = sanitizeVisualElements(visualElements || '', genre);

            // Construct optimized prompt with safety measures
            const medium = styleApproach[artStyle] || styleApproach['authentic'];
            const eraCue = eraCues[decade] || eraCues['2020s'];
            
            return `Professional movie poster design. ${medium}. ${genreMood}. ${cleanVisualElements}. ${eraCue}. Single character portrait or group composition, movie poster layout, cinematic lighting, no text, no letters, no logos, clean professional movie poster style suitable for general audiences.`;
        }

        // Ultra-safe fallback prompt for when main prompt is rejected
        function createUltraSafePrompt(concept) {
            const decade = concept.decade || '1980s';
            const genre = (concept.genre || '').toLowerCase();
            
            // Ultra-safe era styling
            const safeEraStyles = {
                '1950s': 'vintage 1950s movie poster art style, retro illustration',
                '1960s': 'colorful 1960s poster design, mod art style', 
                '1970s': 'classic 1970s movie poster, vintage design',
                '1980s': 'bright 1980s movie poster style, retro design',
                '1990s': 'professional 1990s movie photography style',
                '2000s': 'sleek 2000s movie poster design',
                '2010s': 'modern movie poster photography',
                '2020s': 'contemporary movie poster design'
            };
            
            // Generic safe descriptions
            const safeGenreDesc = genre.includes('horror') ? 'mysterious adventure' :
                                 genre.includes('sci-fi') ? 'futuristic adventure' :
                                 'dramatic adventure';
            
            return `Professional movie poster design featuring a person in ${safeGenreDesc} setting. ${safeEraStyles[decade] || safeEraStyles['2020s']}. Cinematic composition, dramatic lighting, movie poster layout, no text, suitable for all audiences, high quality movie poster art.`;
        }

        // Function to sanitize visual elements and remove potential safety triggers
        function sanitizeVisualElements(visualElements, genre) {
            // Common words that trigger DALL-E safety filters
            const problematicWords = [
                'violence', 'violent', 'blood', 'gore', 'death', 'dying', 'kill', 'murder', 'weapon', 'knife', 'gun',
                'terror', 'terrifying', 'nightmare', 'demon', 'devil', 'hell', 'evil', 'sinister', 'menacing',
                'torture', 'pain', 'suffering', 'scream', 'fear', 'afraid', 'panic', 'dread',
                'monster', 'creature', 'beast', 'zombie', 'ghost', 'spirit', 'haunted', 'possessed',
                'dark', 'darkness', 'shadow', 'lurking', 'stalking', 'threatening', 'dangerous'
            ];
            
            // Safe replacements that maintain cinematic mood
            const safeReplacements = {
                'violence': 'dramatic action',
                'violent': 'intense',
                'blood': 'red lighting',
                'death': 'dramatic scene',
                'terror': 'suspense',
                'terrifying': 'mysterious',
                'nightmare': 'surreal scene',
                'demon': 'mysterious figure',
                'evil': 'mysterious',
                'sinister': 'enigmatic',
                'menacing': 'imposing',
                'monster': 'mysterious being',
                'creature': 'character',
                'dark': 'moody lighting',
                'darkness': 'dramatic lighting',
                'shadow': 'silhouette',
                'haunted': 'atmospheric',
                'possessed': 'transformed',
                'threatening': 'imposing',
                'dangerous': 'intense'
            };
            
            let cleaned = visualElements.toLowerCase();
            
            // Replace problematic words with safe alternatives
            problematicWords.forEach(word => {
                const replacement = safeReplacements[word] || 'dramatic';
                const regex = new RegExp(`\\b${word}\\b`, 'gi');
                cleaned = cleaned.replace(regex, replacement);
            });
            
            // Add positive framing for horror/sci-fi
            if (genre.includes('horror')) {
                cleaned = `Cinematic movie poster featuring ${cleaned}, mysterious atmosphere, dramatic composition`;
            } else if (genre.includes('sci-fi')) {
                cleaned = `Futuristic movie poster showing ${cleaned}, science fiction setting, imaginative design`;
            } else {
                cleaned = `Movie poster depicting ${cleaned}, cinematic composition`;
            }
            
            // Ensure it stays within length limits
            return cleaned.slice(0, 150);
        }

        const prompt = createOptimizedPrompt(concept, visualElements);
        
        console.log('Optimized prompt length:', prompt.length);
        console.log('Sanitized prompt:', prompt);

        // Try main prompt first
        let response = await fetch('https://api.openai.com/v1/images/generations', {
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

        // If prompt rejected for safety, try ultra-safe fallback
        if (!response.ok) {
            const errorData = await response.json();
            
            // Check if it's a safety policy violation
            if (errorData.error?.message?.includes('safety') || errorData.error?.message?.includes('policy')) {
                console.log('Main prompt rejected for safety, trying fallback...');
                
                // Ultra-safe fallback prompt
                const fallbackPrompt = createUltraSafePrompt(concept);
                console.log('Fallback prompt:', fallbackPrompt);
                
                response = await fetch('https://api.openai.com/v1/images/generations', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
                    },
                    body: JSON.stringify({
                        model: "dall-e-3",
                        prompt: fallbackPrompt,
                        n: 1,
                        size: "1024x1792",
                        quality: "hd",
                        style: "vivid"
                    })
                });
                
                if (!response.ok) {
                    const fallbackError = await response.json();
                    throw new Error(`Both main and fallback prompts rejected: ${fallbackError.error?.message || 'Unknown error'}`);
                }
            } else {
                throw new Error(`DALL-E 3 API request failed: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
            }
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
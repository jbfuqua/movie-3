// api/generate-concept.js - Vercel Serverless Function
import { getApiKeys } from './config.js';

export default async function handler(req, res) {
    // Enable CORS and Security Headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
    
    // Mobile-specific headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        // Get API keys using helper function
        const { anthropicKey, hasAnthropic } = getApiKeys();
        
        if (!hasAnthropic) {
            throw new Error('ANTHROPIC_API_KEY environment variable is missing or invalid');
        }
        
        const { genreFilter = 'any', eraFilter = 'any' } = req.body;
        
        // Enhanced genre mapping
        const genreMap = {
            'horror': '"Horror"',
            'sci-fi': '"Sci-Fi"',
            'fusion': 'a creative fusion of Horror and Sci-Fi'
        };
        
        // Enhanced randomization to ensure variety when no filter is specified
        const randomDecades = ['1950s', '1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s'];
        const forceRandomDecade = eraFilter === 'any' ? randomDecades[Math.floor(Math.random() * randomDecades.length)] : null;
        
        // Add creative themes to force variety
        const creativeThemes = [
			'time manipulation', 'parallel dimensions', 'artificial consciousness', 'genetic memories',
			'color psychology', 'mathematical nightmares', 'botanical mutations', 'memory trading', 
			'gravity anomalies', 'digital archaeology', 'weather manipulation', 'architectural haunting', 
			'crystalline entities', 'quantum entanglement', 'molecular dissolution', 'temporal echoes', 
			'geometric demons', 'photographic souls', 'magnetic personalities', 'elastic reality', 
			'transparent beings', 'living architecture', 'vampiric transformations', 'lycanthropic cycles', 
			'demonic possession', 'ancient curses', 'necromantic rituals', 'haunted objects', 
			'spectral manifestations', 'cosmic dread', 'eldritch abominations', 'body horror mutations', 
			'psychological fracturing', 'occult conspiracies', 'sacrificial ceremonies', 'plague manifestations', 
			'witch covens', 'ancestral sins', 'alien invasions', 'space exploration', 'cybernetic implants', 
			'genetic engineering', 'terraforming projects', 'interstellar travel', 'robotic uprising', 
			'clone societies', 'mind uploading', 'cryogenic revival', 'alien first contact', 'space colonies', 
			'technological singularity', 'virtual realities', 'bioengineered viruses', 'energy beings', 
			'sentient furniture', 'backwards aging', 'taste-based telepathy', 'numerical hauntings', 
			'gravity wells in rooms', 'color-eating entities', 'mirror dimension bleeding', 'sentient weather patterns', 
			'backwards speech prophecies', 'emotional parasites', 'dream archaeology', 'smell-based time travel', 
			'texture-shifting materials', 'liquid shadows', 'crystalline thoughts', 'paper-thin realities',
			'dimensional doorways', 'psychic archaeology', 'bone libraries', 'silent apocalypse', 
			'inverse evolution', 'living tattoos', 'forgotten languages', 'stolen childhoods', 
			'clockwork hearts', 'shadow puppetry', 'glass bone syndrome', 'memory viruses'        ];
        
        // Force a random theme to inject into the concept
        const forceTheme = creativeThemes[Math.floor(Math.random() * creativeThemes.length)];
        
        const eraConstraint = eraFilter === 'any' ? `MUST be "${forceRandomDecade}"` : `MUST be "${eraFilter}"`;
        const genreConstraint = genreFilter === 'any' ? 
            `The genre MUST be 'Horror', 'Sci-Fi', or a creative fusion of both. Incorporate the theme of ${forceTheme} into the concept` : 
            `The genre MUST be ${genreMap[genreFilter]}. Incorporate the theme of ${forceTheme} into the concept`;
        
        // Add randomization elements to ensure variety
        const creativeModifiers = [
            'innovative and unexpected',
            'wildly imaginative', 
            'completely unprecedented',
            'genre-bending and unique',
            'surprisingly original',
            'utterly distinctive',
            'remarkably inventive',
            'strikingly unconventional'
        ];
        
        const titleStyles = [
            'cryptic and mysterious',
            'bold and dramatic', 
            'poetic and evocative',
            'sharp and punchy',
            'atmospheric and haunting',
            'edgy and modern',
            'classic but fresh',
            'abstract and intriguing'
        ];
        
        const nameStyles = [
            'diverse international backgrounds',
            'contemporary multicultural names', 
            'classic Hollywood-style names',
            'unique and memorable names',
            'era-appropriate but fresh names',
            'modern and distinctive names'
        ];
        
        // Randomly select modifiers to inject variety
        const randomCreative = creativeModifiers[Math.floor(Math.random() * creativeModifiers.length)];
        const randomTitleStyle = titleStyles[Math.floor(Math.random() * titleStyles.length)];
        const randomNameStyle = nameStyles[Math.floor(Math.random() * nameStyles.length)];
        
        // Add timestamp-based seed for uniqueness
        const timeSeed = Date.now() % 1000;
        
        // Blacklist common repeated elements to force creativity
        const avoidList = [
            // Common titles patterns to avoid
            'containing "Dark", "Shadow", "Night", "Blood", "Death", "Steel", "Cross", "Stone"',
            // Common name patterns  
            'names like Alex, Morgan, Casey, Jordan, Taylor, Riley, Chris, Sam',
            // Overused concepts
            'simulations, matrices, chosen ones, ancient curses, viral outbreaks'
        ];
        
        const avoidInstructions = `ABSOLUTELY AVOID these overused elements: ${avoidList.join(', ')}. 
        Be wildly creative and use completely fresh concepts, names, and titles that haven't appeared in recent generations.`;
        
        // Optimized prompt for better results
        const prompt = `Generate a ${randomCreative} movie concept that has NEVER been created before. Use the timestamp seed ${timeSeed} to ensure complete originality.

STRICT REQUIREMENTS:
- ${eraConstraint}
- ${genreConstraint}
- Title should be ${randomTitleStyle} - avoid common movie title patterns
- Cast names should reflect ${randomNameStyle}
- ${avoidInstructions}
- Create something that would make film critics say "I've never seen anything like this"

INSPIRATION SOURCES (use as creative springboard, don't copy):
- Obscure scientific phenomena
- Forgotten historical events  
- Unusual phobias or psychological concepts
- Emerging technologies
- Cultural folklore from around the world
- Abstract art movements
- Philosophical paradoxes

VISUAL ELEMENTS GUIDANCE:
- Focus on atmospheric, cinematic compositions
- Emphasize lighting, color, and mood over potentially problematic content
- Think movie poster photography rather than explicit scenes
- Keep visual descriptions suitable for general audiences while maintaining intrigue

Return ONLY valid JSON:
{
  "decade":"${forceRandomDecade || eraFilter}",
  "genre":"[creative genre description]",
  "title":"[completely unique ${randomTitleStyle} title]",
  "tagline":"[memorable hook that hasn't been used before]", 
  "synopsis":"[1-2 sentences with a concept so original it could win awards]",
  "visual_elements":"[describe 1 striking focal image and 2-3 unique visual elements - keep family-friendly and focus on composition, lighting, and atmosphere rather than potentially concerning content]",
  "cast":["[${randomNameStyle}]","[unique name]","[distinctive name]"],
  "director":"[${randomNameStyle} director name]"
}

Make this concept so unique that if generated again, it would be completely different.`;

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': anthropicKey,
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
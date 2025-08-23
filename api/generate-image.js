// api/generate-image.js - Vercel Serverless Function (era/genre fidelity)
export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });

    try {
        const { visualElements = '', concept = {} } = req.body || {};

        // Era look templates
        const eraLook = {
            '1950s': { stock: 'vintage film grain, hand-painted poster rendering', lens: '50mm normal perspective', paletteHint: 'muted primaries, cream paper tone' },
            '1960s': { stock: 'retro halftone texture, mod color blocking', lens: '35mm slightly wide', paletteHint: 'pop primaries with off-white' },
            '1970s': { stock: 'airbrushed illustration, earthy low-saturation tones', lens: '85mm portrait compression', paletteHint: 'ochre, burnt orange, olive' },
            '1980s': { stock: 'high-contrast chrome sheen, subtle bloom', lens: '85mm portrait or 35mm neon street', paletteHint: 'teal, magenta, neon accents' },
            '1990s': { stock: 'studio portrait photography, slight grain', lens: '70–200mm telephoto poster style', paletteHint: 'neutral mids, controlled highlights' },
            '2000s': { stock: 'digital composite sheen, clean gradients', lens: '35mm–50mm', paletteHint: 'cool metallics + skin tones' },
            '2010s': { stock: 'minimalist, clean negative space', lens: '50mm, shallow depth of field', paletteHint: 'subtle teal/orange, soft blacks' },
            '2020s': { stock: 'contemporary cinematic HDR, refined grading', lens: '35mm, controlled DOF', paletteHint: 'true blacks, tasteful limited palette' }
        };

        function sanitizeVisualElements(text) {
            if (!text) return '';
            const banned = [
                'gore','gory','blood','bloody','graphic injury','dismemberment',
                'decapitation','suicide','self-harm','sexual','nudity','torture','kill','murder',
                'gun','rifle','pistol','knife','weapon'
            ];
            let t = ` ${text} `.toLowerCase();
            banned.forEach(w => { t = t.replace(new RegExp(`\\b${w}\\b`, 'gi'), ''); });
            return t.replace(/\s+/g, ' ').trim().slice(0, 280);
        }

        function toPaletteText(palette, fallback) {
            if (Array.isArray(palette) && palette.length) {
                return `color palette ${palette.join(', ')}`;
            }
            return fallback || '';
        }

        function createOptimizedPrompt(concept, visualElements) {
            const v = concept.visual_spec || {};
            const decade = concept.decade || '1980s';
            const look = eraLook[decade] || eraLook['2020s'];

            const palette = toPaletteText(v.palette, look.paletteHint);
            const camera = v.camera
                ? `${v.camera.shot || 'portrait'} shot, ${v.camera.lens || look.lens}, ${v.camera.depth_of_field || 'shallow'} depth of field`
                : look.lens;

            const lighting = v.lighting || 'cinematic key light with controlled contrast';
            const composition = v.composition || 'balanced poster composition with clear subject focus';
            const environment = v.environment || 'cinematic environment';
            const wardrobe = v.wardrobe_props || 'era-accurate wardrobe and props';
            const motifs = Array.isArray(v.motifs) && v.motifs.length ? `iconic motifs: ${v.motifs.slice(0,3).join(', ')}` : '';
            const cleanedElements = sanitizeVisualElements(visualElements || (Array.isArray(v.keywords) ? v.keywords.join(', ') : ''));

            const genreDesc = (concept.genre || 'cinematic').toLowerCase().includes('horror')
                ? 'mysterious, suspenseful atmosphere (PG-13)'
                : ((concept.genre || '').toLowerCase().includes('sci') ? 'futuristic, otherworldly atmosphere' : 'dramatic cinematic atmosphere');

            // Final prompt
            return [
                `Professional ${concept.genre || 'cinematic'} movie poster in the ${decade} style.`,
                look.stock,
                camera + ', ' + lighting,
                composition,
                environment + ', ' + wardrobe,
                palette,
                motifs,
                cleanedElements ? `additional visual elements: ${cleanedElements}` : '',
                genreDesc,
                'no text, no letters, no logos, clean professional movie poster style suitable for general audiences.'
            ].filter(Boolean).join(' ');
        }

        
        async function urlToDataUrl(u) {
            try {
                const r = await fetch(u);
                if (!r.ok) throw new Error('fetch image failed ' + r.status);
                const buf = await r.arrayBuffer();
                const b64 = Buffer.from(buf).toString('base64');
                return `data:image/png;base64,${b64}`;
            } catch (e) {
                console.error('urlToDataUrl error:', e);
                return null;
            }
        }

        function createUltraSafePrompt(concept) {
            const decade = concept.decade || '1980s';
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
            const genre = (concept.genre || '').toLowerCase();
            const safeGenreDesc = genre.includes('horror') ? 'mysterious adventure' :
                                  genre.includes('sci') ? 'futuristic adventure' : 'dramatic adventure';
            return `Professional movie poster design featuring a person in ${safeGenreDesc} setting. ${safeEraStyles[decade] || safeEraStyles['2020s']}. Cinematic composition, dramatic lighting, movie poster layout, no text, suitable for all audiences, high quality movie poster art.`;
        }

        const prompt = createOptimizedPrompt(concept, visualElements);

        // Primary request
        let response = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "dall-e-3",
                prompt,
                n: 1,
                size: "1024x1024",
                response_format: "b64_json"
            })
        });

        if (!response.ok) {
            // Fallback to ultra-safe prompt
            const fallbackPrompt = createUltraSafePrompt(concept);
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
                    size: "1024x1024"
                })
            });
        }

        if (!response.ok) {
            const errText = await response.text().catch(()=>'');
            console.error('OpenAI image gen error:', errText);
            throw new Error(`Image generation failed: ${response.status}`);
        }

        const data = await response.json();
        const imageUrl = data?.data?.[0]?.url || data?.data?.[0]?.b64_json || null;
        if (!imageUrl) return res.status(500).json({ success: false, error: 'No image returned' });

        return res.status(200).json({ success: true, imageUrl });
    } catch (error) {
        console.error('Error generating image:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
}

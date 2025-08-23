// api/generate-concept.js - Vercel Serverless Function (enhanced JSON spec)
import { getApiKeys } from './config.js';

export default async function handler(req, res) {
    // CORS & security headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });

    try {
        const { anthropicKey, hasAnthropic } = getApiKeys();
        if (!hasAnthropic) throw new Error('ANTHROPIC_API_KEY environment variable is missing or invalid');

        // Inputs
        const { genreFilter = 'any', eraFilter = 'any' } = req.body || {};

        // Mappings / helpers
        const genreMap = {
            'horror': '"Horror"',
            'sci-fi': '"Sci-Fi"',
            'fusion': 'a tasteful fusion of Horror and Sci-Fi'
        };
        const decades = ['1950s','1960s','1970s','1980s','1990s','2000s','2010s','2020s'];
        const forceRandomDecade = eraFilter === 'any' ? decades[Math.floor(Math.random()*decades.length)] : eraFilter;

        // A pool of creative seeds to avoid repetition
        const creativeThemes = [
            'time manipulation', 'parallel dimensions', 'artificial consciousness', 'genetic memories',
            'color psychology', 'mathematical nightmares', 'botanical mutations', 'memory trading',
            'gravity anomalies', 'digital archaeology', 'weather manipulation', 'architectural haunting',
            'crystalline entities', 'quantum entanglement', 'molecular dissolution', 'temporal echoes',
            'geometric demons', 'photographic souls', 'magnetic personalities', 'elastic reality',
            'transparent beings', 'living architecture', 'cosmic dread', 'eldritch signals',
            'body horror metamorphosis (non-graphic)', 'occult conspiracies (non-graphic)',
            'witch covens (implied)', 'alien first contact', 'robotic uprising (PG-13)',
            'mind uploading', 'cryogenic revival', 'space colonies', 'virtual realities',
            'bioengineered viruses (non-graphic)', 'energy beings', 'mirror dimension bleeding (abstract)',
            'emotional parasites (metaphoric)', 'dream archaeology', 'liquid shadows (lighting motif)',
            'paper-thin realities', 'dimensional doorways', 'bone libraries (symbolic)'
        ];
        const forceTheme = creativeThemes[Math.floor(Math.random()*creativeThemes.length)];
        const seed = Date.now() % 100000;

        // Build the strict JSON-only prompt
        const prompt = `You are a film art director. Produce ONLY valid JSON. No prose.

Constraints:
- Era MUST be "${forceRandomDecade}"
- Genre ${genreFilter === 'any' ? 'MUST be Horror or Sci‑Fi (or a tasteful fusion of both)' : `MUST be ${genreMap[genreFilter]}`}
- Incorporate the creative seed: "${forceTheme}"
- Avoid overused title words: Dark, Shadow, Night, Blood, Death, Steel, Cross, Stone
- Avoid generic names like Alex, Morgan, Casey, Jordan, Taylor, Riley, Chris, Sam
- Keep to PG-13 visual implication level (no graphic injury)

Return JSON with this exact shape:

{
  "title": "Short original title (no banned words)",
  "tagline": "Atmospheric one-liner (PG-13)",
  "decade": "1950s|1960s|1970s|1980s|1990s|2000s|2010s|2020s",
  "genre": "Horror|Sci-Fi|Fusion",
  "synopsis": "1–2 sentences, PG-13, no graphic detail",
  "visual_spec": {
    "subgenre": "cosmic horror|techno-thriller|occult|retro-futurism|...",
    "palette": ["#hex","#hex","#hex"],
    "camera": { "shot": "closeup|medium|wide", "lens": "35mm|50mm|85mm", "depth_of_field": "shallow|medium|deep" },
    "composition": "e.g., rule-of-thirds portrait with strong verticals",
    "lighting": "e.g., low-key rim light / neon edge-light",
    "environment": "e.g., retro lab / rain-slick street / brutalist corridor",
    "wardrobe_props": "era-correct notes & 1–2 props",
    "motifs": ["max 3 short motifs"],
    "keywords": ["poster","no text","cinematic","professional"],
    "banned": ["gore","blood","weapons","graphic injury"]
  },
  "seed": ${seed}
}`;

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': anthropicKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: "claude-3-5-sonnet-20241022",
                max_tokens: 900,
                messages: [{ role: "user", content: prompt }]
            })
        });

        if (!response.ok) {
            const errText = await response.text().catch(()=>'');
            console.error('Claude API error:', errText);
            throw new Error(`Claude API request failed: ${response.status}`);
        }

        const result = await response.json();
        const raw = result?.content?.[0]?.text || '';

        // Robust JSON extraction (mirrors your generate-song.js multi-strategy approach)
        let concept = null;
        try {
            concept = JSON.parse(raw.trim());
        } catch (e) {
            try {
                const m = raw.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/);
                if (m) concept = JSON.parse(m[0]);
            } catch {}
        }

        // Minimal validation/fallbacks
        if (!concept || !concept.title || !concept.visual_spec) {
            concept = {
                title: 'Untitled Project',
                tagline: 'A cinematic mystery unfolds.',
                decade: forceRandomDecade,
                genre: (genreFilter === 'any') ? 'Horror' : (genreFilter === 'fusion' ? 'Fusion' : (genreFilter === 'sci-fi' ? 'Sci-Fi' : 'Horror')),
                synopsis: 'An enigmatic event reshapes ordinary life, revealing something uncanny.',
                visual_spec: {
                    subgenre: 'retro-futurism',
                    palette: ['#111111','#888888','#e50914'],
                    camera: { shot: 'medium', lens: '50mm', depth_of_field: 'shallow' },
                    composition: 'centered portrait with atmospheric background',
                    lighting: 'low-key with rim light',
                    environment: 'urban night street with subtle reflections',
                    wardrobe_props: 'era-accurate outfit, one iconic prop',
                    motifs: ['silhouette', 'reflections'],
                    keywords: ['poster','no text','cinematic','professional'],
                    banned: ['gore','blood','weapons','graphic injury']
                },
                seed
            };
        }

        return res.status(200).json({ success: true, concept });
    } catch (err) {
        console.error('generate-concept error:', err);
        return res.status(200).json({
            success: true,
            // Return a safe, generic concept so the app still works
            concept: {
                title: 'Signal From Elsewhere',
                tagline: 'When the sky speaks, the city listens.',
                decade: eraFilter === 'any' ? '1980s' : eraFilter,
                genre: genreFilter === 'any' ? 'Sci-Fi' : (genreFilter === 'fusion' ? 'Fusion' : (genreFilter === 'sci-fi' ? 'Sci-Fi' : 'Horror')),
                synopsis: 'A strange phenomenon interrupts nightly broadcasts, entangling lives with something not quite human.',
                visual_spec: {
                    subgenre: 'retro-futurism',
                    palette: ['#0a0a0a','#00ffff','#ff00ff'],
                    camera: { shot: 'closeup', lens: '85mm', depth_of_field: 'shallow' },
                    composition: 'rule-of-thirds portrait with strong diagonals',
                    lighting: 'neon edge-light with moody fill',
                    environment: 'rain-slick street with neon signage (abstract)',
                    wardrobe_props: 'era-accurate jacket; small radio prop',
                    motifs: ['CRT glow','silhouette'],
                    keywords: ['poster','no text','cinematic','professional'],
                    banned: ['gore','blood','weapons','graphic injury']
                },
                seed: Date.now() % 100000
            }
        });
    }
}

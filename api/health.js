// api/health.js - Advanced Environment Variable Debugging
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

    // Advanced debugging
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    
    // Check all environment variables that start with relevant prefixes
    const allEnvKeys = Object.keys(process.env);
    const anthropicKeys = allEnvKeys.filter(key => key.toLowerCase().includes('anthropic'));
    const openaiKeys = allEnvKeys.filter(key => key.toLowerCase().includes('openai'));
    
    res.status(200).json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        environment: 'Vercel Serverless',
        vercelEnv: process.env.VERCEL_ENV || 'unknown',
        region: process.env.VERCEL_REGION || 'unknown',
        
        // Main API keys
        apiKeys: {
            anthropic: !!anthropicKey,
            anthropicLength: anthropicKey ? anthropicKey.length : 0,
            anthropicPrefix: anthropicKey ? anthropicKey.substring(0, 15) + '...' : 'MISSING',
            openai: !!openaiKey,
            openaiLength: openaiKey ? openaiKey.length : 0,
            openaiPrefix: openaiKey ? openaiKey.substring(0, 15) + '...' : 'MISSING'
        },
        
        // Debug info
        debug: {
            anthropicEnvKeys: anthropicKeys,
            openaiEnvKeys: openaiKeys,
            totalEnvVars: allEnvKeys.length,
            nodeVersion: process.version,
            platform: process.platform,
            hasVercelKeys: allEnvKeys.filter(k => k.startsWith('VERCEL_')).length
        }
    });
}
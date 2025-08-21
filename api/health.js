// api/health.js - Vercel Health Check
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

    res.status(200).json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        environment: 'Vercel Serverless',
        apiKeys: {
            anthropic: !!process.env.ANTHROPIC_API_KEY,
            openai: !!process.env.OPENAI_API_KEY
        }
    });
}
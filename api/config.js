// api/config.js - Environment Configuration Helper
export function getApiKeys() {
    // Multiple ways to get the API keys
    const anthropicKey = 
        process.env.ANTHROPIC_API_KEY || 
        process.env.anthropic_api_key ||
        process.env.ANTHROPIC_KEY;
        
    const openaiKey = 
        process.env.OPENAI_API_KEY || 
        process.env.openai_api_key ||
        process.env.OPENAI_KEY;
    
    // Validation
    if (!anthropicKey) {
        console.error('❌ Anthropic API key missing from environment');
        console.log('Available env keys:', Object.keys(process.env).filter(k => k.toLowerCase().includes('anthropic')));
    }
    
    if (!openaiKey) {
        console.error('❌ OpenAI API key missing from environment');
        console.log('Available env keys:', Object.keys(process.env).filter(k => k.toLowerCase().includes('openai')));
    }
    
    return {
        anthropicKey,
        openaiKey,
        hasAnthropic: !!anthropicKey,
        hasOpenAI: !!openaiKey
    };
}
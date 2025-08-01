export async function GET() {
    console.log('Testing Google Custom Search API configuration...');
    
    // Check environment variables
    const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
    const cxId = process.env.GOOGLE_CX_ID;
    
    console.log(`API Key exists: ${!!apiKey}`);
    console.log(`API Key length: ${apiKey ? apiKey.length : 0}`);
    console.log(`CX ID exists: ${!!cxId}`);
    console.log(`CX ID: ${cxId ? cxId.substring(0, 10) + '...' : 'missing'}`);
    
    if (!apiKey || !cxId) {
        return Response.json({
            error: 'Missing environment variables',
            hasApiKey: !!apiKey,
            hasCxId: !!cxId
        });
    }
    
    // Test with a simple query
    const testQuery = 'test';
    const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cxId}&q=${encodeURIComponent(testQuery)}&num=1`;
    
    try {
        console.log(`Testing URL: ${searchUrl.replace(apiKey, 'API_KEY_HIDDEN')}`);
        
        const response = await fetch(searchUrl);
        const responseText = await response.text();
        
        console.log(`Response status: ${response.status}`);
        console.log(`Response text: ${responseText}`);
        
        if (response.ok) {
            const data = JSON.parse(responseText);
            return Response.json({
                success: true,
                status: response.status,
                resultCount: data.items ? data.items.length : 0
            });
        } else {
            return Response.json({
                success: false,
                status: response.status,
                error: responseText
            });
        }
    } catch (error) {
        console.error('Test search error:', error);
        return Response.json({
            success: false,
            error: error.message
        });
    }
} 
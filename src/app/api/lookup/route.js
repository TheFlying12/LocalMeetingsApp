import OpenAI from 'openai'
const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

require('dotenv').config();

export async function GET(request) {
    const {searchParams} = new URL(request.url)
    const city = searchParams.get('city');
    const state = searchParams.get('state')
    
    console.log("city: ", city)
    console.log("state: ", state)

    // Step 1: Search for council websites using Google Custom Search
    let searchResults = [];
    const queries = [
        `${city} ${state} city council meetings`,
        `${city} ${state} town hall meetings agenda`,
        `${city} ${state} municipal council meetings`
    ];
    
    try {
        // Try multiple search queries to get better results
        for (const query of queries) {
            console.log(`Searching: ${query}`);
            const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${process.env.GOOGLE_SEARCH_API_KEY}&cx=${process.env.GOOGLE_CX_ID}&q=${encodeURIComponent(query)}&num=3`;
            console.log(`Full search URL: ${searchUrl}`);
            
            const response = await fetch(searchUrl);
            
            console.log(`Response status: ${response.status}`);
            console.log(`Response ok: ${response.ok}`);
            
            if (response.ok) {
                const data = await response.json();
                console.log(`Search results for "${query}":`, data);
                if (data.items) {
                    searchResults.push(...data.items);
                }
            } else {
                // Log the error response to see what's wrong
                const errorData = await response.text();
                console.error(`Google Search API Error (${response.status}):`, errorData);
                console.error(`Failed query: ${query}`);
                console.error(`API Key exists: ${!!process.env.GOOGLE_SEARCH_API_KEY}`);
                console.error(`CX ID exists: ${!!process.env.GOOGLE_CX_ID}`);
            }
        }
    } catch (error) {
        console.log("Google Search API failed:", error);
        // Fallback to OpenAI-only approach if search fails
        return await fallbackToOpenAIOnly(city, state);
    }

    console.log(`Found ${searchResults.length} search results`);

    // Step 2: Use OpenAI to analyze and structure the search results
    if (searchResults.length > 0) {
        const searchResultsText = searchResults.map((item, index) => 
            `${index + 1}. Title: ${item.title}\nURL: ${item.link}\nSnippet: ${item.snippet}\n`
        ).join('\n');

        const systemPrompt = `You are helping to find city council meeting information. Based on the Google search results provided, extract and return a JSON object with the following structure:
        {
            "website": "most relevant official city/town website URL",
            "meetingsPage": "specific meetings/agendas page URL if found",
            "description": "brief description of what was found",
            "nextMeeting": "next meeting date if mentioned in snippets",
            "contactInfo": "contact information if found in snippets"
        }
        
        Prioritize .gov sites and official municipal websites. If no specific meetings page is found, use the main city website. Be accurate and only include information that's clearly present in the search results.`;

        const userPrompt = `Search results for ${city}, ${state} council meetings:\n\n${searchResultsText}`;

        const openaiRes = await client.chat.completions.create({
            model: "gpt-4-1106-preview",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
        });
        
        const aiContent = openaiRes.choices[0].message.content;
        let parsedResponse;
        
        try {
            parsedResponse = JSON.parse(aiContent);
        } catch (error) {
            console.log("Failed to parse OpenAI response as JSON:", error);
            parsedResponse = {
                website: searchResults[0]?.link || null,
                meetingsPage: null,
                description: aiContent,
                nextMeeting: null,
                contactInfo: null
            };
        }

        console.log(`COMBINED SEARCH + AI RESPONSE: ${JSON.stringify(parsedResponse, null, 2)}`);

        return Response.json({
            city,
            state,
            councilInfo: parsedResponse,
            searchResultsCount: searchResults.length
        });
    } else {
        // No search results found, fallback to OpenAI only
        return await fallbackToOpenAIOnly(city, state);
    }
}

// Fallback function when Google Search fails or returns no results
async function fallbackToOpenAIOnly(city, state) {
    const systemPrompt = `Based on your knowledge, provide information about ${city}, ${state} city council meetings. Return a JSON object with this structure:
    {
        "website": "likely official city website URL if known",
        "meetingsPage": "likely meetings page URL if known", 
        "description": "general information about how to find council meetings for this city",
        "nextMeeting": null,
        "contactInfo": "general guidance on finding contact info"
    }
    
    Be honest about limitations - if you don't have current information, say so in the description.`;

    const userPrompt = `${city}, ${state}`;
    
    const openaiRes = await client.chat.completions.create({
        model: "gpt-4-1106-preview",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
        ],
    });
    
    const aiContent = openaiRes.choices[0].message.content;
    let parsedResponse;
    
    try {
        parsedResponse = JSON.parse(aiContent);
    } catch (error) {
        parsedResponse = {
            website: null,
            meetingsPage: null,
            description: `Unable to find current information for ${city}, ${state}. Please visit your city's official website or contact city hall directly.`,
            nextMeeting: null,
            contactInfo: null
        };
    }

    console.log(`FALLBACK AI RESPONSE: ${JSON.stringify(parsedResponse, null, 2)}`);

    return Response.json({
        city,
        state,
        councilInfo: parsedResponse,
        searchResultsCount: 0,
        fallback: true
    });
}
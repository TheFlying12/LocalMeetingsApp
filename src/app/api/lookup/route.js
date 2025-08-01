import { GoogleSearchService } from '../../../lib/googleSearch.js';
import { OpenAIService } from '../../../lib/openaiService.js';

require('dotenv').config();

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const state = searchParams.get('state');
    
    console.log("city: ", city);
    console.log("state: ", state);

    const googleSearch = new GoogleSearchService();
    const openaiService = new OpenAIService();

    try {
        // Step 1: Search for council websites using Google Custom Search
        const searchResults = await googleSearch.searchCouncilMeetings(city, state);
        console.log(`Found ${searchResults.length} search results`);

        // Step 2: Use OpenAI to analyze and structure the search results
        if (searchResults.length > 0) {
            const parsedResponse = await openaiService.parseSearchResults(searchResults, city, state);
            
            console.log(`COMBINED SEARCH + AI RESPONSE: ${JSON.stringify(parsedResponse, null, 2)}`);

            return Response.json({
                city,
                state,
                councilInfo: parsedResponse,
                searchResultsCount: searchResults.length,
                scrapeUrl: parsedResponse.meetingsPage || parsedResponse.website
            });
        } else {
            // No search results found, use fallback
            const fallbackResponse = await openaiService.provideFallbackInfo(city, state);
            
            console.log(`FALLBACK AI RESPONSE: ${JSON.stringify(fallbackResponse, null, 2)}`);

            return Response.json({
                city,
                state,
                councilInfo: fallbackResponse,
                searchResultsCount: 0,
                fallback: true
            });
        }
    } catch (error) {
        console.error("Lookup error:", error);
        
        // Try fallback if search fails
        try {
            const fallbackResponse = await openaiService.provideFallbackInfo(city, state);
            return Response.json({
                city,
                state,
                councilInfo: fallbackResponse,
                searchResultsCount: 0,
                fallback: true,
                error: error.message
            });
        } catch (fallbackError) {
            return Response.json({
                city,
                state,
                error: `Failed to find council information: ${error.message}`,
                fallback: true
            }, { status: 500 });
        }
    }
}
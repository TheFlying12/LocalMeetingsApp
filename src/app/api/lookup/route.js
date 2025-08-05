import { GoogleSearchService } from '../../../lib/googleSearch.js';
import { OpenAIService } from '../../../lib/openaiService.js';
import { IntelligentScrapingService } from '../../../lib/intelligentScraper.js';

require('dotenv').config();

// Reuse service instances for better performance
const googleSearch = new GoogleSearchService();
const openaiService = new OpenAIService();
const intelligentScraper = new IntelligentScrapingService();

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const state = searchParams.get('state');

    try {
        // Step 1: Search for council websites using Google Custom Search
        const searchResults = await googleSearch.searchCouncilMeetings(city, state);

        if (searchResults.length > 0) {
            // Step 2: Use OpenAI to analyze and structure the search results
            const parsedResponse = await openaiService.parseSearchResults(searchResults, city, state);

            let comprehensiveInfo = null;
            
            // Step 3: Always perform intelligent scraping if we have a URL
            if (parsedResponse.website || parsedResponse.meetingsPage) {
                const scrapeUrl = parsedResponse.meetingsPage || parsedResponse.website;
                
                try {
                    comprehensiveInfo = await intelligentScraper.investigateCouncilWebsite(scrapeUrl, city, state);
                } catch (scrapeError) {
                    comprehensiveInfo = {
                        error: "Intelligent scraping failed",
                        fallbackInfo: scrapeError.message
                    };
                }
            }

            return Response.json({
                success: true,
                city,
                state,
                searchResults: parsedResponse,
                comprehensiveInfo,
                timestamp: new Date().toISOString()
            });
        } else {
            return Response.json({
                success: false,
                city,
                state, 
                error: "No search results found",
                searchResults: null,
                comprehensiveInfo: null,
                timestamp: new Date().toISOString()
            });
        }
    } catch (error) {
        return Response.json({
            success: false,
            city,
            state,
            error: error.message,
            searchResults: null,
            comprehensiveInfo: null,
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}
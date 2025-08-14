import { GoogleSearchService } from '../../../lib/googleSearch.js';
import { OpenAIService } from '../../../lib/openaiService.js';
import { WebScrapingService } from '../../../lib/webScraper.js';

require('dotenv').config();

// Reuse service instances for better performance
const googleSearch = new GoogleSearchService();
const openaiService = new OpenAIService();
const webScraper = new WebScrapingService();

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const state = searchParams.get('state');

    try {
        // Step 1: Search for council websites
        const searchResults = await googleSearch.searchCouncilMeetings(city, state);

        if (searchResults.length === 0) {
            return Response.json({
                success: false,
                city,
                state,
                error: "No search results found",
                timestamp: new Date().toISOString()
            });
        }

        // Step 2: Analyze search results and scrape the best URL
        const analysis = await openaiService.analyzeAndScrape(searchResults, city, state, webScraper);

        return Response.json({
            success: true,
            city,
            state,
            ...analysis,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        return Response.json({
            success: false,
            city,
            state,
            error: error.message,
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}
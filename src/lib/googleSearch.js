/**
 * Google Custom Search API utilities
 */

export class GoogleSearchService {
    constructor() {
        this.apiKey = process.env.GOOGLE_SEARCH_API_KEY;
        this.cxId = process.env.GOOGLE_CX_ID;
    }

    /**
     * Search for city council meeting information
     * @param {string} city - City name
     * @param {string} state - State name
     * @returns {Promise<Array>} Array of search results
     */
    async searchCouncilMeetings(city, state) {
        const queries = [
            `${city} ${state} city council meetings`,
            `${city} ${state} town hall meetings agenda`,
            `${city} ${state} municipal council meetings`
        ];

        let searchResults = [];

        try {
            for (const query of queries) {
                console.log(`Searching: ${query}`);
                const results = await this.performSearch(query, 3);
                if (results) {
                    searchResults.push(...results);
                }
            }
        } catch (error) {
            console.error("Google Search API failed:", error);
            throw new Error(`Search failed: ${error.message}`);
        }

        return searchResults;
    }

    /**
     * Perform a single search query
     * @param {string} query - Search query
     * @param {number} numResults - Number of results to return
     * @returns {Promise<Array|null>} Search results or null if failed
     */
    async performSearch(query, numResults = 3) {
        if (!this.apiKey || !this.cxId) {
            throw new Error('Missing Google Search API credentials');
        }

        const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${this.apiKey}&cx=${this.cxId}&q=${encodeURIComponent(query)}&num=${numResults}`;
        
        try {
            const response = await fetch(searchUrl);
            
            if (!response.ok) {
                const errorData = await response.text();
                console.error(`Google Search API Error (${response.status}):`, errorData);
                return null;
            }

            const data = await response.json();
            return data.items || [];
        } catch (error) {
            console.error('Search request failed:', error);
            return null;
        }
    }

   
} 
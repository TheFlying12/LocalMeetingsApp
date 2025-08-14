import OpenAI from 'openai';

/**
 * OpenAI service for parsing and structuring council meeting data
 */
export class OpenAIService {
    constructor() {
        this.client = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
    }

    /**
     * Clean and parse JSON response from OpenAI (removes markdown code blocks)
     * @param {string} content - Raw content from OpenAI
     * @returns {Object} Parsed JSON object
     */
    cleanAndParseJSON(content) {
        let cleanContent = content.trim();
        if (cleanContent.startsWith('```json')) {
            cleanContent = cleanContent.replace(/^```json\s*/, '');
        }
        if (cleanContent.endsWith('```')) {
            cleanContent = cleanContent.replace(/\s*```$/, '');
        }
        return JSON.parse(cleanContent.trim());
    }

    /**
     * Parse Google search results to extract council meeting information
     * @param {Array} searchResults - Array of Google search results
     * @param {string} city - City name
     * @param {string} state - State name
     * @returns {Promise<Object>} Parsed council information
     */
    async parseSearchResults(searchResults, city, state) {
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
        
        Prioritize official municipal websites. If no specific meetings page is found, use the main city website. Be accurate and only include information that's clearly present in the search results.`;

        const userPrompt = `Search results for ${city}, ${state} council meetings:\n\n${searchResultsText}`;

        try {
            const response = await this.client.chat.completions.create({
                model: "gpt-4-1106-preview",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ],
            });

            const aiContent = response.choices[0].message.content;
            return this.cleanAndParseJSON(aiContent);
        } catch (error) {
            console.error("Failed to parse search results with OpenAI:", error);
            return {
                website: searchResults[0]?.link || null,
                meetingsPage: null,
                description: `Found ${searchResults.length} results but failed to parse them automatically.`,
                nextMeeting: null,
                contactInfo: null
            };
        }
    }

    /**
     * Provide fallback information when search fails
     * @param {string} city - City name
     * @param {string} state - State name
     * @returns {Promise<Object>} Fallback council information
     */
    async provideFallbackInfo(city, state) {
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
        
        try {
            const response = await this.client.chat.completions.create({
                model: "gpt-4-1106-preview",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ],
            });

            const aiContent = response.choices[0].message.content;
            return this.cleanAndParseJSON(aiContent);
        } catch (error) {
            console.error("Failed to generate fallback info:", error);
            return {
                website: null,
                meetingsPage: null,
                description: `Unable to find current information for ${city}, ${state}. Please visit your city's official website or contact city hall directly.`,
                nextMeeting: null,
                contactInfo: null
            };
        }
    }

    /**
     * Comprehensive analysis: parse search results, scrape the best URL, and extract meeting info
     * @param {Array} searchResults - Google search results
     * @param {string} city - City name
     * @param {string} state - State name
     * @param {Object} webScraper - Web scraping service instance
     * @returns {Promise<Object>} Complete meeting information
     */
    async analyzeAndScrape(searchResults, city, state, webScraper) {
        // Step 1: Parse search results to find the best URL
        const searchAnalysis = await this.parseSearchResults(searchResults, city, state);
        
        if (!searchAnalysis.website && !searchAnalysis.meetingsPage) {
            return {
                website: null,
                meetingsPage: null,
                description: "No suitable websites found in search results",
                meetingSchedule: null,
                nextMeeting: null,
                location: null,
                contactInfo: null,
                publicParticipation: null,
                documents: [],
                summary: "Unable to find meeting information"
            };
        }

        // Step 2: Scrape the best available URL
        const targetUrl = searchAnalysis.meetingsPage || searchAnalysis.website;
        let scrapedContent = null;
        
        try {
            scrapedContent = await webScraper.scrapePageContent(targetUrl);
        } catch (error) {
            console.error("Scraping failed:", error);
            return {
                ...searchAnalysis,
                meetingSchedule: null,
                nextMeeting: null,
                location: null,
                publicParticipation: null,
                documents: [],
                summary: "Found website but couldn't access meeting details",
                error: "Website scraping failed"
            };
        }

        // Step 3: Extract comprehensive meeting information
        const meetingInfo = await this.extractMeetingInfo(scrapedContent, city, state);
        
        // Step 4: Combine search results with scraped information
        return {
            website: searchAnalysis.website,
            meetingsPage: searchAnalysis.meetingsPage,
            description: searchAnalysis.description,
            contactInfo: meetingInfo.contactInfo || searchAnalysis.contactInfo,
            ...meetingInfo
        };
    }

    /**
     * Extract comprehensive meeting information from scraped content
     * @param {string} pageContent - Raw text content from webpage
     * @param {string} city - City name
     * @param {string} state - State name
     * @returns {Promise<Object>} Structured meeting information
     */
    async extractMeetingInfo(pageContent, city, state) {
        const truncatedContent = pageContent.substring(0, 10000);

        const systemPrompt = `You are an expert at extracting city council meeting information from websites.
        
        Extract comprehensive meeting information and return a JSON object with this structure:
        {
            "meetingSchedule": "when meetings typically occur (e.g., 'First Monday of each month at 7:00 PM')",
            "nextMeeting": "next scheduled meeting date/time if found",
            "location": "where meetings are held",
            "contactInfo": "contact information (phone, email, address)",
            "publicParticipation": "how the public can participate or attend",
            "documents": ["array of important document links or agenda URLs found"],
            "meetingTypes": ["types of meetings - council, planning, etc."],
            "liveStreaming": "information about live streaming or recording if available",
            "summary": "comprehensive summary of meeting information found"
        }
        
        Focus on accuracy. If information is not clearly present, use null for that field.
        Please do not include any other text or characters besides the JSON object.`;

        
        const userPrompt = `Extract meeting information for ${city}, ${state} from this website content:\n\n${truncatedContent}`;

        try {
            const response = await this.client.chat.completions.create({
                model: "gpt-4-1106-preview",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ],
                temperature: 0.1
            });
            console.log("Meeting info:", response.choices[0].message.content);
            return this.cleanAndParseJSON(response.choices[0].message.content);
        } catch (error) {
            console.error("Failed to extract meeting info:", error);
            return {
                meetingSchedule: null,
                nextMeeting: null,
                location: null,
                contactInfo: null,
                publicParticipation: null,
                documents: [],
                meetingTypes: [],
                liveStreaming: null,
                summary: "Could not extract meeting details from website content"
            };
        }
    }
} 
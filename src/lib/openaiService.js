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
     * Parse scraped agenda content into structured data
     * @param {string} pageContent - Raw text content from webpage
     * @returns {Promise<Object>} Structured agenda data
     */
    async parseAgendaContent(pageContent) {
        const truncatedContent = pageContent.substring(0, 8000);

        const systemPrompt = `You are an expert at parsing city council meeting agendas and documents. 
        
        Parse the following webpage content and extract structured information about the meeting agenda. Return a JSON object with this structure:
        {
            "meetingDate": "date of the meeting if found",
            "meetingTime": "time of the meeting if found", 
            "location": "meeting location if found",
            "agendaItems": [
                {
                    "itemNumber": "item number or identifier",
                    "title": "agenda item title",
                    "description": "brief description",
                    "type": "public hearing|discussion|vote|presentation|other"
                }
            ],
            "publicComment": "information about public comment period if mentioned",
            "contactInfo": "contact information for the meeting",
            "documents": ["list of any mentioned documents or attachments"],
            "summary": "brief summary of what this meeting covers"
        }
        
        If information is not clearly present, use null for that field. Focus on accuracy over completeness.`;

        const userPrompt = `Please parse this city council meeting webpage content:\n\n${truncatedContent}`;

        try {
            const response = await this.client.chat.completions.create({
                model: "gpt-4-1106-preview",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ],
                temperature: 0.1
            });

            const aiContent = response.choices[0].message.content;
            return this.cleanAndParseJSON(aiContent);
        } catch (error) {
            console.error("Failed to parse agenda content:", error);
            return {
                error: "Failed to parse agenda",
                rawContent: pageContent.substring(0, 500) + "...",
                summary: "Could not extract structured data from this page"
            };
        }
    }
} 
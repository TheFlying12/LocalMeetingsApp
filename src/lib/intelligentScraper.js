import { WebScrapingService } from './webScraper.js';
import { OpenAIService } from './openaiService.js';
import { PDFAnalyzerService } from './pdfAnalyzer.js';

/**
 * Intelligent scraping service that combines traditional scraping with AI-guided navigation
 */
export class IntelligentScrapingService {
    constructor() {
        this.webScraper = new WebScrapingService();
        this.openaiService = new OpenAIService();
        this.pdfAnalyzer = new PDFAnalyzerService();
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
     * Intelligently extract council meeting information from a website
     * @param {string} baseUrl - Starting URL (usually main city website)
     * @param {string} city - City name for context
     * @param {string} state - State name for context
     * @returns {Promise<Object>} Comprehensive meeting information
     */
    async investigateCouncilWebsite(baseUrl, city, state) {
        console.log(`Starting intelligent investigation of ${baseUrl}`);

        try {
            // Phase 1: Quick reconnaissance - scrape main page and analyze structure
            const mainPageContent = await this.webScraper.scrapePageContent(baseUrl);
            const siteAnalysis = await this.analyzeSiteStructure(mainPageContent, baseUrl);


            // Phase 4: Analyze any PDFs that were found
            let pdfAnalysis = null;
            if (documentInfo.pdfLinks && documentInfo.pdfLinks.length > 0) {
                console.log('Analyzing found PDF documents...');
                pdfAnalysis = await this.pdfAnalyzer.analyzePDFAgendas(documentInfo.pdfLinks);
            }

            // Phase 5: Intelligent synthesis of all gathered information
            const comprehensiveInfo = await this.synthesizeInformation(
                scrapedPages, 
                siteAnalysis, 
                documentInfo,
                pdfAnalysis,
                city, 
                state
            );

            return comprehensiveInfo;

        } catch (error) {
            console.error('Intelligent scraping failed:', error);
            // Fallback to simple scraping
            return await this.fallbackToSimpleScraping(baseUrl);
        }
    }

    /**
     * Analyze website structure to identify where meeting info might be located
     */
    async analyzeSiteStructure(pageContent, baseUrl) {
        const systemPrompt = `You are a web navigation expert. Analyze this city website homepage and identify where council meeting information is likely located.

        Return a JSON object with:
        {
            likelyMeetingPaths: ["array of URL paths that likely contain meeting info"],
            siteStructure: "description of how the site is organized",
            meetingKeywords: ["keywords found that suggest meeting content"],
            hasCalendar: boolean,
            hasPDFs: boolean,
            hasNewsSection: boolean,
            navigationStyle: "description of site navigation"
        }

        Look for links, navigation items, or text mentioning: meetings, agendas, council, calendar, government, city hall, etc.`;

        const userPrompt = `Analyze this city website for ${baseUrl}:\n\n${pageContent.substring(0, 4000)}`;

        try {
            const response = await this.openaiService.client.chat.completions.create({
                model: "gpt-4-1106-preview",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ],
                temperature: 0.1
            });
            return this.cleanAndParseJSON(response.choices[0].message.content);
        } catch (error) {
            console.error('Site analysis failed:', error);
            return {
                likelyMeetingPaths: ['/government', '/council', '/meetings', '/agendas'],
                siteStructure: "Unknown",
                meetingKeywords: [],
                hasCalendar: false,
                hasPDFs: false,
                hasNewsSection: false,
                navigationStyle: "Unknown"
            };
        }
    }


    /**
     * Synthesize information from multiple scraped pages
     */
    async synthesizeInformation(scrapedPages, siteAnalysis, documentInfo, pdfAnalysis, city, state) {
        // Combine all successful scrapes
        const successfulScrapes = scrapedPages.filter(page => page.success);
        const allContent = successfulScrapes
            .map(page => `URL: ${page.url}\nContent: ${page.content}`)
            .join('\n\n---\n\n');

        const systemPrompt = `You are an expert at extracting city council meeting information. Based on multiple pages scraped from a city website, provide comprehensive meeting information.

        Return a JSON object with:
        {
            "meetingSchedule": "when meetings typically occur",
            "nextMeeting": "next scheduled meeting if found",
            "meetingLocation": "where meetings are held",
            "agendaUrls": ["direct links to agendas or agenda pages"],
            "contactInfo": "contact information for meetings/clerk",
            "publicParticipation": "info about public comment/participation",
            "meetingTypes": ["types of meetings held - council, planning, etc"],
            "documents": ["links to important documents found"],
            "liveStreaming": "information about live streaming if available",
            "summary": "comprehensive summary of meeting information found"
        }

        Be thorough but accurate. Only include information clearly present in the content.`;

        const userPrompt = `Extract comprehensive council meeting information for ${city}, ${state} from these website pages:\n\n${allContent.substring(0, 12000)}`;

        try {
            const response = await this.openaiService.client.chat.completions.create({
                model: "gpt-4-1106-preview",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ],
                temperature: 0.1
            });

            const synthesizedInfo = this.cleanAndParseJSON(response.choices[0].message.content);
            
            // Add metadata
            synthesizedInfo.scrapedUrls = successfulScrapes.map(page => page.url);
            synthesizedInfo.totalPagesAnalyzed = successfulScrapes.length;
            synthesizedInfo.siteAnalysis = siteAnalysis;
            synthesizedInfo.documentInfo = documentInfo; // Add document info to synthesis
            synthesizedInfo.pdfAnalysis = pdfAnalysis; // Add PDF analysis to synthesis

            return synthesizedInfo;

        } catch (error) {
            console.error('Information synthesis failed:', error);
            return {
                error: "Failed to synthesize information",
                scrapedUrls: successfulScrapes.map(page => page.url),
                totalPagesAnalyzed: successfulScrapes.length,
                summary: "Multiple pages were scraped but could not be automatically analyzed"
            };
        }
    }

    /**
     * Find and analyze meeting documents (PDFs, agendas, minutes) from scraped pages
     */
    async findMeetingDocuments(scrapedPages, baseUrl) {
        console.log('Searching for meeting documents...');
        
        const allContent = scrapedPages
            .filter(page => page.success)
            .map(page => page.content)
            .join('\n\n');

        // Use AI to identify document links and important information
        const systemPrompt = `You are an expert at finding city council meeting documents and agendas. 
        
        Analyze the following webpage content and identify any links or references to:
        - PDF agendas
        - Meeting minutes
        - Calendar events
        - Upcoming meetings
        - Document archives
        - Live streaming links
        - Meeting recordings
        
        Return a JSON object with:
        {
            "pdfLinks": ["array of PDF URLs found"],
            "agendaLinks": ["array of agenda page URLs"],
            "calendarLinks": ["array of calendar URLs"], 
            "streamingLinks": ["array of streaming/video URLs"],
            "upcomingMeetings": ["array of upcoming meeting dates/times found"],
            "documentTypes": ["types of documents available"],
            "accessibilityInfo": "information about public access to meetings",
            "summary": "summary of document availability and access methods"
        }
        
        Look for patterns like:
        - Links ending in .pdf
        - Text mentioning "agenda", "minutes", "meeting"
        - Calendar or event information
        - Streaming or video links
        - Phone numbers for dial-in access`;

        const userPrompt = `Find meeting documents and access information from this content:\n\n${allContent.substring(0, 8000)}`;

        try {
            const response = await this.openaiService.client.chat.completions.create({
                model: "gpt-4-1106-preview",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ],
                temperature: 0.1
            });

            const documentInfo = this.cleanAndParseJSON(response.choices[0].message.content);
            
            // Convert relative URLs to absolute URLs
            if (documentInfo.pdfLinks) {
                documentInfo.pdfLinks = documentInfo.pdfLinks.map(link => 
                    this.makeAbsoluteUrl(link, baseUrl)
                );
            }
            if (documentInfo.agendaLinks) {
                documentInfo.agendaLinks = documentInfo.agendaLinks.map(link => 
                    this.makeAbsoluteUrl(link, baseUrl)
                );
            }

            console.log(`Found ${documentInfo.pdfLinks?.length || 0} PDFs and ${documentInfo.agendaLinks?.length || 0} agenda links`);
            return documentInfo;

        } catch (error) {
            console.error('Failed to find meeting documents:', error);
            return {
                pdfLinks: [],
                agendaLinks: [],
                calendarLinks: [],
                streamingLinks: [],
                upcomingMeetings: [],
                documentTypes: [],
                accessibilityInfo: null,
                summary: "Could not automatically detect meeting documents"
            };
        }
    }

    /**
     * Convert relative URLs to absolute URLs
     */
    makeAbsoluteUrl(url, baseUrl) {
        try {
            if (url.startsWith('http')) {
                return url; // Already absolute
            }
            return new URL(url, baseUrl).href;
        } catch (error) {
            console.warn(`Invalid URL: ${url}`);
            return url; // Return as-is if can't convert
        }
    }

    /**
     * Fallback to simple scraping if intelligent approach fails
     */
    async fallbackToSimpleScraping(url) {
        try {
            const content = await this.webScraper.scrapePageContent(url);
            const parsed = await this.openaiService.parseAgendaContent(content);
            return {
                ...parsed,
                scrapedUrls: [url],
                totalPagesAnalyzed: 1,
                fallback: true
            };
        } catch (error) {
            return {
                error: "All scraping methods failed",
                summary: `Unable to extract information from ${url}`
            };
        }
    }
} 
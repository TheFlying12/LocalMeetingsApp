import { WebScrapingService } from '../../../lib/webScraper.js';
import { OpenAIService } from '../../../lib/openaiService.js';

export async function POST(request) {
    try {
        const { url } = await request.json();
        
        if (!url) {
            return Response.json({ error: 'URL is required' }, { status: 400 });
        }

        console.log(`Scraping agenda from: ${url}`);

        const webScraper = new WebScrapingService();
        const openaiService = new OpenAIService();

        // Step 1: Scrape the webpage content
        const pageContent = await webScraper.scrapePageContent(url);
        console.log(`Scraped content length: ${pageContent.length} characters`);

        // Step 2: Parse the content with OpenAI
        const parsedAgenda = await openaiService.parseAgendaContent(pageContent);

        return Response.json({
            success: true,
            url,
            agenda: parsedAgenda,
            contentLength: pageContent.length
        });

    } catch (error) {
        console.error("Scraping error:", error);
        return Response.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
} 
import puppeteer from 'puppeteer';

/**
 * Web scraping service for extracting content from council meeting pages
 */
export class WebScrapingService {
    constructor() {
        this.browserOptions = {
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        };
    }

    /**
     * Scrape content from a webpage
     * @param {string} url - URL to scrape
     * @returns {Promise<string>} Extracted text content
     */
    async scrapePageContent(url) {
        let browser;
        
        try {
            browser = await puppeteer.launch(this.browserOptions);
            const page = await browser.newPage();
            
            // Set user agent to avoid blocking
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
            
            // Navigate to the page
            await page.goto(url, { 
                waitUntil: 'networkidle0', 
                timeout: 30000 
            });

            // Extract clean text content
            const pageContent = await page.evaluate(() => {
                // Remove unwanted elements
                const unwantedElements = document.querySelectorAll('script, style, nav, header, footer, aside, .navigation, .menu, .sidebar');
                unwantedElements.forEach(el => el.remove());
                
                // Try to find main content areas in order of preference
                const contentSelectors = [
                    'main',
                    '[role="main"]', 
                    '.content',
                    '.main-content',
                    '#content',
                    '#main',
                    'article',
                    '.agenda',
                    '.meeting',
                    '.council-meeting',
                    '.meeting-agenda'
                ];
                
                let content = '';
                for (const selector of contentSelectors) {
                    const element = document.querySelector(selector);
                    if (element && element.innerText.trim().length > 100) {
                        content = element.innerText;
                        break;
                    }
                }
                
                // Fallback to body if no main content found
                if (!content) {
                    content = document.body.innerText;
                }
                
                // Clean up the content
                return content
                    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
                    .replace(/\n\s*\n/g, '\n') // Remove empty lines
                    .trim();
            });

            return pageContent;
        } catch (error) {
            console.error("Error scraping page:", error);
            throw new Error(`Failed to scrape ${url}: ${error.message}`);
        } finally {
            if (browser) {
                await browser.close();
            }
        }
    }

    /**
     * Scrape multiple URLs concurrently
     * @param {Array<string>} urls - Array of URLs to scrape
     * @param {number} maxConcurrent - Maximum concurrent requests
     * @returns {Promise<Array>} Array of results with url and content
     */
    async scrapeMultiplePages(urls, maxConcurrent = 3) {
        const results = [];
        
        // Process URLs in batches to avoid overwhelming the system
        for (let i = 0; i < urls.length; i += maxConcurrent) {
            const batch = urls.slice(i, i + maxConcurrent);
            const batchPromises = batch.map(async (url) => {
                try {
                    const content = await this.scrapePageContent(url);
                    return { url, content, success: true };
                } catch (error) {
                    console.error(`Failed to scrape ${url}:`, error.message);
                    return { url, content: null, success: false, error: error.message };
                }
            });
            
            const batchResults = await Promise.all(batchPromises);
            results.push(...batchResults);
        }
        
        return results;
    }

    /**
     * Check if a URL is likely to contain meeting agenda content
     * @param {string} url - URL to check
     * @returns {boolean} True if URL likely contains agenda content
     */
    static isLikelyAgendaUrl(url) {
        const agendaKeywords = [
            'agenda', 'meeting', 'council', 'minutes', 'schedule',
            'calendar', 'session', 'hearing', 'municipal'
        ];
        
        const urlLower = url.toLowerCase();
        return agendaKeywords.some(keyword => urlLower.includes(keyword));
    }

    /**
     * Filter URLs to find the most relevant agenda pages
     * @param {Array<Object>} searchResults - Google search results
     * @returns {Array<string>} Filtered array of likely agenda URLs
     */
    static filterAgendaUrls(searchResults) {
        return searchResults
            .filter(result => this.isLikelyAgendaUrl(result.link))
            .map(result => result.link)
            .slice(0, 5); // Limit to top 5 most relevant
    }
} 
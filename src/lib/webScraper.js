import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';

/**
 * High-speed web scraping service with optimized concurrent scraping
 */
export class WebScrapingService {
    constructor() {
        this.browserOptions = {
            headless: true,
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--single-process',
                '--disable-gpu'
            ]
        };
        this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
        this.browserPool = [];
        this.maxBrowsers = 3;
    }


    /**
     * Fast lightweight scraping using Cheerio (no browser needed)
     * @param {string} url - URL to scrape
     * @returns {Promise<string>} Extracted text content
     */
    async scrapeLightweight(url) {
        try {
            console.log("Fast scraping:", url);
            
            const response = await fetch(url, {
                headers: {
                    'User-Agent': this.userAgent,
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                    'Accept-Encoding': 'gzip, deflate',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1',
                },
                timeout: 5000
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const html = await response.text();
            const $ = cheerio.load(html);

            // Remove unwanted elements
            $('script, style, nav, header, footer, aside, .navigation, .menu, .sidebar').remove();

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
                const element = $(selector);
                if (element.length && element.text().trim().length > 100) {
                    content = element.text();
                    break;
                }
            }

            // Fallback to body if no main content found
            if (!content) {
                content = $('body').text();
            }

            // Clean up the content
            return content
                .replace(/\s+/g, ' ') // Replace multiple spaces with single space
                .replace(/\n\s*\n/g, '\n') // Remove empty lines
                .trim();

        } catch (error) {
            console.error("Lightweight scraping failed:", error);
            throw new Error(`Fast scrape failed for ${url}: ${error.message}`);
        }
    }

    /**
     * Get or create a browser from the pool
     * @returns {Promise<puppeteer.Browser>} Browser instance
     */
    async getBrowser() {
        if (this.browserPool.length > 0) {
            return this.browserPool.pop();
        }
        
        return await puppeteer.launch(this.browserOptions);
    }

    /**
     * Return browser to pool or close if pool is full
     * @param {puppeteer.Browser} browser - Browser to return
     */
    async returnBrowser(browser) {
        if (this.browserPool.length < this.maxBrowsers) {
            this.browserPool.push(browser);
        } else {
            await browser.close();
        }
    }

    /**
     * Fast browser scraping using Puppeteer with optimized settings
     * @param {string} url - URL to scrape
     * @returns {Promise<string>} Extracted text content
     */
    async scrapeWithBrowser(url) {
        let browser;
        
        try {
            console.log("Browser scraping:", url);
            
            browser = await this.getBrowser();
            const page = await browser.newPage();
            
            // Optimize page settings for speed
            await page.setUserAgent(this.userAgent);
            await page.setRequestInterception(true);
            
            // Block unnecessary resources for faster loading
            page.on('request', (req) => {
                if (req.resourceType() === 'stylesheet' || req.resourceType() === 'image') {
                    req.abort();
                } else {
                    req.continue();
                }
            });
            
            // Navigate to the page with faster settings
            await page.goto(url, { 
                waitUntil: 'domcontentloaded', 
                timeout: 15000 
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

            await page.close();
            await this.returnBrowser(browser);
            return pageContent;
        } catch (error) {
            console.error("Browser scraping failed:", error);
            if (browser) {
                await this.returnBrowser(browser);
            }
            throw new Error(`Browser scrape failed for ${url}: ${error.message}`);
        }
    }

    /**
     * Fast hybrid scraping: tries lightweight method first, falls back to browser if needed
     * @param {string} url - URL to scrape
     * @returns {Promise<string>} Extracted text content
     */
    async scrapePageContent(url) {
        try {
            // Step 1: Try fast lightweight scraping first
            try {
                const content = await this.scrapeLightweight(url);
                
                // Check if we got meaningful content
                if (content && content.length > 200) {
                    console.log(`✅ Fast scraping successful for ${url}`);
                    return content;
                }
                
                console.log(`⚠️ Fast scraping returned minimal content, trying browser...`);
            } catch (lightweightError) {
                console.log(`⚠️ Fast scraping failed: ${lightweightError.message}, trying browser...`);
            }

            // Step 2: Fallback to full browser scraping
            const content = await this.scrapeWithBrowser(url);
            console.log(`✅ Browser scraping successful for ${url}`);
            return content;

        } catch (error) {
            console.error("All scraping methods failed:", error);
            throw new Error(`Failed to scrape ${url}: ${error.message}`);
        }
    }

    /**
     * Scrape multiple URLs with maximum concurrency for speed
     * @param {Array<string>} urls - Array of URLs to scrape
     * @param {number} maxConcurrent - Maximum concurrent requests
     * @returns {Promise<Array>} Array of results with url and content
     */
    async scrapeMultiplePages(urls, maxConcurrent = 8) {
        const results = [];
        
        // Process URLs in batches with high concurrency
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
            
            const batchResults = await Promise.allSettled(batchPromises);
            const processedResults = batchResults.map((result, index) => {
                const url = batch[index];
                if (result.status === 'fulfilled') {
                    return result.value;
                } else {
                    return { url, content: null, success: false, error: result.reason?.message || 'Unknown error' };
                }
            });
            
            results.push(...processedResults);
        }
        
        return results;
    }

    /**
     * Cleanup method to close all browsers in pool
     */
    async cleanup() {
        const closePromises = this.browserPool.map(browser => browser.close());
        await Promise.all(closePromises);
        this.browserPool = [];
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
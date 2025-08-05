import { OpenAIService } from './openaiService.js';

/**
 * PDF analysis service for extracting and analyzing content from meeting agenda PDFs
 */
export class PDFAnalyzerService {
    constructor() {
        this.openaiService = new OpenAIService();
    }

    /**
     * Clean and parse JSON response from OpenAI (removes markdown code blocks)
     * @param {string} content - Raw content from OpenAI
     * @returns {Object} Parsed JSON object
     */
    cleanAndParseJSON(content) {
        // Remove markdown code block formatting
        let cleanContent = content.trim();
        
        // Remove ```json at the beginning
        if (cleanContent.startsWith('```json')) {
            cleanContent = cleanContent.replace(/^```json\s*/, '');
        }
        
        // Remove ``` at the end
        if (cleanContent.endsWith('```')) {
            cleanContent = cleanContent.replace(/\s*```$/, '');
        }
        
        // Parse the cleaned JSON
        return JSON.parse(cleanContent.trim());
    }

    /**
     * Analyze PDF agendas by URL (note: this is a simplified approach)
     * In production, you'd want to use a proper PDF parsing library
     * @param {Array<string>} pdfUrls - Array of PDF URLs to analyze
     * @returns {Promise<Object>} Analysis of PDF contents
     */
    async analyzePDFAgendas(pdfUrls) {

        if (!pdfUrls || pdfUrls.length === 0) {
            return {
                analyzedPDFs: [],
                summary: "No PDF documents found to analyze"
            };
        }

        // Process PDFs in parallel for better performance
        const pdfPromises = pdfUrls.slice(0, 5).map(async (pdfUrl) => {
            try {
                const analysis = await this.analyzePDFUrl(pdfUrl);
                return {
                    url: pdfUrl,
                    filename: this.extractFilename(pdfUrl),
                    analysis: analysis
                };
            } catch (error) {
                return {
                    url: pdfUrl,
                    filename: this.extractFilename(pdfUrl),
                    analysis: { error: "Failed to analyze PDF" }
                };
            }
        });
        
        const pdfAnalyses = await Promise.all(pdfPromises);

        // Synthesize overall findings
        const overallSummary = await this.synthesizePDFFindings(pdfAnalyses);

        return {
            analyzedPDFs: pdfAnalyses,
            totalPDFs: pdfUrls.length,
            summary: overallSummary
        };
    }

    /**
     * Analyze a single PDF URL to extract meeting information from filename and path
     */
    async analyzePDFUrl(pdfUrl) {
        const filename = this.extractFilename(pdfUrl);
        const urlPath = pdfUrl;

        const systemPrompt = `You are an expert at analyzing city council meeting document URLs and filenames to extract meeting information.

        Based on the PDF URL and filename, extract as much information as possible about the meeting:
        
        Return a JSON object with:
        {
            "meetingDate": "likely meeting date if found in filename/path",
            "meetingType": "type of meeting (council, planning, special, etc.)",
            "documentType": "type of document (agenda, minutes, packet, etc.)",
            "isUpcoming": boolean indicating if this appears to be an upcoming meeting,
            "priority": "high|medium|low based on how recent/relevant this document appears",
            "extractedInfo": "any other information that can be determined from the URL/filename"
        }

        Look for patterns like:
        - Dates in various formats (2023-12-15, 12-15-23, December-15-2023, etc.)
        - Meeting types (council, planning, special, emergency, etc.)
        - Document types (agenda, minutes, packet, summary, etc.)
        - Keywords indicating recency or importance`;

        const userPrompt = `Analyze this PDF document URL and filename:
        URL: ${pdfUrl}
        Filename: ${filename}`;

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
            console.error('Failed to analyze PDF URL:', error);
            return {
                meetingDate: null,
                meetingType: "unknown",
                documentType: "pdf",
                isUpcoming: false,
                priority: "low",
                extractedInfo: "Could not analyze document"
            };
        }
    }

    /**
     * Synthesize findings from multiple PDF analyses
     */
    async synthesizePDFFindings(pdfAnalyses) {
        if (!pdfAnalyses || pdfAnalyses.length === 0) {
            return "No PDF documents were successfully analyzed.";
        }

        const analysisText = pdfAnalyses
            .map(pdf => `PDF: ${pdf.filename}\nAnalysis: ${JSON.stringify(pdf.analysis, null, 2)}`)
            .join('\n\n');

        const systemPrompt = `Based on the analysis of multiple PDF documents from a city council website, provide a comprehensive summary of what meeting information is available.

        Focus on:
        - Most recent/upcoming meetings
        - Types of meetings available
        - Document types found
        - Overall accessibility of meeting information
        
        Provide a helpful summary for citizens looking for council meeting information.`;

        const userPrompt = `Summarize these PDF document analyses:\n\n${analysisText}`;

        try {
            const response = await this.openaiService.client.chat.completions.create({
                model: "gpt-4-1106-preview",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ],
                temperature: 0.2
            });

            return response.choices[0].message.content;
        } catch (error) {
            console.error('Failed to synthesize PDF findings:', error);
            return `Found ${pdfAnalyses.length} PDF documents, but could not provide detailed analysis.`;
        }
    }

    /**
     * Extract filename from URL
     */
    extractFilename(url) {
        try {
            const urlObj = new URL(url);
            const pathname = urlObj.pathname;
            return pathname.split('/').pop() || 'unknown.pdf';
        } catch (error) {
            return url.split('/').pop() || 'unknown.pdf';
        }
    }
} 
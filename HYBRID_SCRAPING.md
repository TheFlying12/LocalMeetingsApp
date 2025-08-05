# 🧠 Hybrid Intelligent Scraping System

## Overview

This system combines traditional web scraping with AI-guided navigation to provide comprehensive council meeting information. It automatically analyzes PDFs and documents without requiring manual intervention.

## Architecture

### 🔧 Service Modules

1. **`GoogleSearchService`** (`src/lib/googleSearch.js`)
   - Searches for council websites using multiple targeted queries
   - Handles API errors and rate limiting

2. **`OpenAIService`** (`src/lib/openaiService.js`)
   - Parses search results into structured data
   - Analyzes scraped content for meeting information
   - Provides fallback information when searches fail

3. **`WebScrapingService`** (`src/lib/webScraper.js`)
   - Traditional Puppeteer-based scraping
   - Smart content extraction (removes navigation, ads, etc.)
   - Batch processing for multiple URLs

4. **`PDFAnalyzerService`** (`src/lib/pdfAnalyzer.js`) 🆕
   - Analyzes PDF agendas and meeting documents
   - Extracts meeting dates, types, and priorities from filenames
   - Provides intelligent document prioritization

5. **`IntelligentScrapingService`** (`src/lib/intelligentScraper.js`) ⭐
   - **Hybrid approach** combining all above services
   - **Automatic PDF analysis** when documents are found
   - Five-phase intelligent investigation process

## 🚀 How It Works

### Phase 1: Reconnaissance
```javascript
// AI analyzes the homepage to understand site structure
const siteAnalysis = await this.analyzeSiteStructure(mainPageContent, baseUrl);
```
- Identifies likely locations of meeting information
- Detects site navigation patterns
- Finds keywords suggesting meeting content

### Phase 2: Targeted Scraping
```javascript
// Scrapes multiple relevant pages based on analysis
const targetUrls = this.identifyTargetUrls(siteAnalysis, baseUrl);
const scrapedPages = await this.webScraper.scrapeMultiplePages(targetUrls, 2);
```
- Generates smart URL targets based on AI analysis
- Scrapes multiple pages concurrently
- Focuses on government/meeting-related pages

### Phase 3: Document Discovery
```javascript
// Finds PDFs, agendas, and other meeting documents
const documentInfo = await this.findMeetingDocuments(scrapedPages, baseUrl);
```
- Identifies PDF agendas and meeting documents
- Finds streaming links and calendar information
- Discovers accessibility and public participation info

### Phase 4: PDF Analysis 🆕
```javascript
// Automatically analyzes any PDFs found
const pdfAnalysis = await this.pdfAnalyzer.analyzePDFAgendas(documentInfo.pdfLinks);
```
- Analyzes PDF filenames and URLs for meeting information
- Extracts dates, meeting types, and document priorities
- Identifies upcoming vs. historical meetings

### Phase 5: Synthesis
```javascript
// AI combines all information into comprehensive report
const comprehensiveInfo = await this.synthesizeInformation(scrapedPages, siteAnalysis, documentInfo, pdfAnalysis, city, state);
```
- Analyzes content from all scraped pages
- Integrates PDF analysis results
- Provides comprehensive summary with prioritized information

## 🎯 User Experience

### ✅ Automatic Process (No Manual Buttons!)
1. User enters city and state
2. System automatically:
   - Searches for council websites
   - Scrapes relevant pages
   - Finds and analyzes PDFs
   - Provides comprehensive results
3. User sees complete information without additional clicks

### 📊 What You Get Automatically:
- **Basic council info** (website, contact, meeting schedule)
- **PDF document analysis** with priorities and dates
- **Upcoming meeting identification**
- **Streaming and accessibility info**
- **Document type classification** (agendas, minutes, packets)

## 📡 API Endpoints

### 1. Basic Lookup (Now with Auto-Analysis)
```
GET /api/lookup?city=Cumming&state=GA
```
Automatically performs comprehensive analysis including PDF analysis.

### 2. Standalone Intelligent Scraping
```
POST /api/intelligent-scrape
Body: { "url": "https://city.gov", "city": "Cumming", "state": "GA" }
```
Performs deep analysis of a specific council website with PDF analysis.

### 3. Test Endpoint
```
GET /api/test-intelligent
```
Verifies that all services are properly configured.

## 🎯 Enhanced Response Structure

### Comprehensive Analysis Response (Now Includes PDF Analysis)
```json
{
  "comprehensiveInfo": {
    "meetingSchedule": "First and third Monday of each month at 6:00 PM",
    "nextMeeting": "December 18, 2023 at 6:00 PM",
    "meetingLocation": "Council Chambers, City Hall",
    "agendaUrls": ["https://city.gov/agendas/current"],
    "contactInfo": "City Clerk: clerk@city.gov, (770) 781-2020",
    "publicParticipation": "Public comment period at beginning of each meeting",
    "meetingTypes": ["City Council", "Planning Commission", "Public Hearings"],
    "liveStreaming": "Meetings are live-streamed on YouTube",
    "documentInfo": {
      "pdfLinks": ["https://city.gov/agenda-2023-12-18.pdf"],
      "streamingLinks": ["https://youtube.com/citycouncil"],
      "upcomingMeetings": ["December 18, 2023 at 6:00 PM"],
      "accessibilityInfo": "ADA accessible, ASL interpretation available"
    },
    "pdfAnalysis": {
      "analyzedPDFs": [
        {
          "filename": "agenda-2023-12-18.pdf",
          "analysis": {
            "meetingDate": "December 18, 2023",
            "meetingType": "City Council",
            "documentType": "agenda",
            "isUpcoming": true,
            "priority": "high"
          }
        }
      ],
      "summary": "Found 3 recent agendas with 1 upcoming meeting"
    },
    "summary": "Comprehensive meeting information with automatic document analysis"
  }
}
```

## 💡 Key Features

### 🤖 Fully Automatic
- **No manual buttons** - everything happens automatically
- **Smart prioritization** - shows most relevant documents first
- **Upcoming meeting detection** - highlights future meetings
- **Document classification** - identifies agendas vs. minutes vs. packets

### 📄 PDF Intelligence
- **Filename analysis** - extracts dates and meeting types from PDF names
- **Priority scoring** - ranks documents by relevance and recency
- **Meeting type detection** - identifies council, planning, special meetings
- **Upcoming vs. historical** - distinguishes future from past meetings

### 🎨 Enhanced UI
- **Automatic loading indicators** - shows analysis progress
- **Color-coded priorities** - high/medium/low priority documents
- **Upcoming meeting badges** - highlights future meetings
- **Document type icons** - visual indicators for different document types

## 📊 Performance Characteristics

| Method | API Calls | Speed | Accuracy | Features |
|--------|-----------|-------|----------|----------|
| **Auto-Analysis** | 4-6 | Medium | Excellent | Full PDF analysis, prioritization |
| Basic Lookup | 1-2 | Fast | Good | Limited document info |

## 🎯 Best Practices

1. **Single search** provides complete information automatically
2. **PDF analysis** happens behind the scenes
3. **Results are prioritized** by relevance and recency
4. **No user interaction required** for comprehensive analysis
5. **Fallback systems** ensure reliable results

## 🔧 Customization

The system is highly modular. You can:
- Modify PDF analysis logic in `PDFAnalyzerService`
- Adjust document prioritization algorithms
- Customize UI display of PDF analysis results
- Add support for additional document types

## 🚦 Rate Limiting & Costs

- Google Search: 100 queries/day (free tier)
- OpenAI: 4-6 API calls per lookup (includes PDF analysis)
- Puppeteer: Limited by target website's rate limiting

The automatic PDF analysis adds 1-2 additional API calls but provides significantly more value to users. 
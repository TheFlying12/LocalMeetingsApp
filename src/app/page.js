'use client';
import { useState } from "react";
import StateDropdown from "../components/StateDropdown";

export default function HomePage() {
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLookup = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/lookup?city=${city}&state=${state}`);
      const data = await res.json();
      setInfo(data);
    } catch (error) {
      setInfo({ error: 'Failed to fetch council information' });
    } finally {
      setLoading(false);
    }
  };



  return (
    <main className="p-6 max-w-6xl mx-auto">
      <center>
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Find Your Local Council Meetings!</h1>
        <div className="mb-6 flex flex-col sm:flex-row gap-3 items-center justify-center">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter CITY name"
            className="border border-gray-300 p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
          />
          <div className="w-full sm:w-64">
            <StateDropdown 
              value={state} 
              onChange={setState}
              placeholder="Select STATE"
            />
          </div>
          <button 
            onClick={handleLookup} 
            disabled={loading || !city || !state}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white p-3 px-6 rounded-lg transition-colors duration-200 font-medium w-full sm:w-auto"
          >
            {loading ? 'Searching...' : 'Lookup'}
          </button>
        </div>
      </center>

      {/* Basic Results */}
      {info && (
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-800">
              Council Information for {info.city}, {info.state}
            </h2>
            <div className="flex items-center space-x-2">
              {info.searchResultsCount !== undefined && (
                <div className="text-sm">
                  {info.fallback ? (
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      Fallback Mode
                    </span>
                  ) : (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                      {info.searchResultsCount} results found
                    </span>
                  )}
                </div>
              )}

            </div>
          </div>
          
          {info.error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700">{info.error}</p>
            </div>
          ) : info.searchResults ? (
            <div className="space-y-4">
              {info.searchResults.description && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-800 mb-2">Description</h3>
                  <p className="text-blue-700">{info.searchResults.description}</p>
                </div>
              )}
              
              {info.searchResults.website && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-800 mb-2">Official Website</h3>
                  <a 
                    href={info.searchResults.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-green-600 hover:text-green-800 underline break-all"
                  >
                    {info.searchResults.website}
                  </a>
                </div>
              )}
              
              {info.searchResults.meetingsPage && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-800 mb-2">Meetings & Agendas</h3>
                  <a 
                    href={info.searchResults.meetingsPage} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:text-purple-800 underline break-all"
                  >
                    {info.searchResults.meetingsPage}
                  </a>
                </div>
              )}
              
              {info.searchResults.nextMeeting && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-800 mb-2">Next Meeting</h3>
                  <p className="text-yellow-700">{info.searchResults.nextMeeting}</p>
                </div>
              )}
              
              {info.searchResults.contactInfo && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Contact Information</h3>
                  <p className="text-gray-700">{info.searchResults.contactInfo}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-gray-600">No council information available.</p>
            </div>
          )}
        </div>
      )}

      {/* Comprehensive Analysis Results */}
      {info?.comprehensiveInfo && (
        <div className="mt-8 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg shadow-lg p-6 border border-purple-200">
          <div className="flex items-center mb-4">
            <h2 className="text-2xl font-semibold text-purple-800">
              🧠 Comprehensive Analysis
            </h2>
            {info.comprehensiveInfo.success && info.comprehensiveInfo.comprehensiveInfo?.totalPagesAnalyzed && (
              <span className="ml-4 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                {info.comprehensiveInfo.info.comprehensiveInfo.totalPagesAnalyzed} pages analyzed
              </span>
            )}
          </div>

          {info.comprehensiveInfo.error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700">{info.comprehensiveInfo.error}</p>
            </div>
          ) : info.comprehensiveInfo.success && info.comprehensiveInfo.comprehensiveInfo ? (
            <div className="space-y-6">
              {info.comprehensiveInfo.info.comprehensiveInfo.summary && (
                <div className="bg-white rounded-lg p-4 border border-purple-200">
                  <h3 className="font-semibold text-purple-800 mb-2">📋 Summary</h3>
                  <p className="text-gray-700">{info.comprehensiveInfo.info.comprehensiveInfo.summary}</p>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                {info.comprehensiveInfo.info.comprehensiveInfo.meetingSchedule && (
                  <div className="bg-white rounded-lg p-4 border border-purple-200">
                    <h3 className="font-semibold text-purple-800 mb-2">📅 Meeting Schedule</h3>
                    <p className="text-gray-700">{info.comprehensiveInfo.info.comprehensiveInfo.meetingSchedule}</p>
                  </div>
                )}

                {info.comprehensiveInfo.info.comprehensiveInfo.meetingLocation && (
                  <div className="bg-white rounded-lg p-4 border border-purple-200">
                    <h3 className="font-semibold text-purple-800 mb-2">📍 Location</h3>
                    <p className="text-gray-700">{info.comprehensiveInfo.info.comprehensiveInfo.meetingLocation}</p>
                  </div>
                )}

                {info.comprehensiveInfo.info.comprehensiveInfo.nextMeeting && (
                  <div className="bg-white rounded-lg p-4 border border-purple-200">
                    <h3 className="font-semibold text-purple-800 mb-2">⏰ Next Meeting</h3>
                    <p className="text-gray-700">{info.comprehensiveInfo.info.comprehensiveInfo.nextMeeting}</p>
                  </div>
                )}

                {info.comprehensiveInfo.info.comprehensiveInfo.publicParticipation && (
                  <div className="bg-white rounded-lg p-4 border border-purple-200">
                    <h3 className="font-semibold text-purple-800 mb-2">🗣️ Public Participation</h3>
                    <p className="text-gray-700">{info.comprehensiveInfo.info.comprehensiveInfo.publicParticipation}</p>
                  </div>
                )}
              </div>

              {info.comprehensiveInfo.info.comprehensiveInfo.agendaUrls && info.comprehensiveInfo.info.comprehensiveInfo.agendaUrls.length > 0 && (
                <div className="bg-white rounded-lg p-4 border border-purple-200">
                  <h3 className="font-semibold text-purple-800 mb-2">📄 Agenda Links</h3>
                  <ul className="space-y-2">
                    {info.comprehensiveInfo.info.comprehensiveInfo.agendaUrls.map((url, index) => (
                      <li key={index}>
                        <a 
                          href={url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-purple-600 hover:text-purple-800 underline break-all"
                        >
                          {url}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {info.comprehensiveInfo.info.comprehensiveInfo.meetingTypes && info.comprehensiveInfo.info.comprehensiveInfo.meetingTypes.length > 0 && (
                <div className="bg-white rounded-lg p-4 border border-purple-200">
                  <h3 className="font-semibold text-purple-800 mb-2">🏛️ Meeting Types</h3>
                  <div className="flex flex-wrap gap-2">
                    {info.comprehensiveInfo.info.comprehensiveInfo.meetingTypes.map((type, index) => (
                      <span key={index} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {info.comprehensiveInfo.info.comprehensiveInfo.liveStreaming && (
                <div className="bg-white rounded-lg p-4 border border-purple-200">
                  <h3 className="font-semibold text-purple-800 mb-2">📺 Live Streaming</h3>
                  <p className="text-gray-700">{info.comprehensiveInfo.info.comprehensiveInfo.liveStreaming}</p>
                </div>
              )}

              {/* Document Information */}
              {info.comprehensiveInfo.info.comprehensiveInfo.documentInfo && (
                <>
                  {info.comprehensiveInfo.info.comprehensiveInfo.documentInfo.pdfLinks && info.comprehensiveInfo.info.comprehensiveInfo.documentInfo.pdfLinks.length > 0 && (
                    <div className="bg-white rounded-lg p-4 border border-purple-200">
                      <h3 className="font-semibold text-purple-800 mb-2">📄 PDF Documents</h3>
                      
                      {/* PDF Analysis Results */}
                      {info.comprehensiveInfo.info.comprehensiveInfo.pdfAnalysis && (
                        <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                          <h4 className="font-medium text-purple-700 mb-2">🧠 Document Analysis</h4>
                          <p className="text-sm text-purple-600 mb-3">{info.comprehensiveInfo.info.comprehensiveInfo.pdfAnalysis.summary}</p>
                          
                          {info.comprehensiveInfo.info.comprehensiveInfo.pdfAnalysis.analyzedPDFs && info.comprehensiveInfo.info.comprehensiveInfo.pdfAnalysis.analyzedPDFs.length > 0 && (
                            <div className="space-y-2">
                              {info.comprehensiveInfo.info.comprehensiveInfo.pdfAnalysis.analyzedPDFs
                                .filter(pdf => pdf.analysis && !pdf.analysis.error)
                                .sort((a, b) => {
                                  // Sort by priority and recency
                                  const priorityOrder = { high: 3, medium: 2, low: 1 };
                                  return (priorityOrder[b.analysis.priority] || 1) - (priorityOrder[a.analysis.priority] || 1);
                                })
                                .map((pdf, index) => (
                                <div key={index} className="bg-white rounded p-2 border border-purple-200">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium text-sm">{pdf.filename}</span>
                                    <div className="flex items-center gap-2">
                                      {pdf.analysis.isUpcoming && (
                                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">Upcoming</span>
                                      )}
                                      <span className={`px-2 py-1 rounded-full text-xs ${
                                        pdf.analysis.priority === 'high' ? 'bg-red-100 text-red-700' :
                                        pdf.analysis.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-gray-100 text-gray-700'
                                      }`}>
                                        {pdf.analysis.priority} priority
                                      </span>
                                    </div>
                                  </div>
                                  <div className="text-xs text-gray-600 space-y-1">
                                    {pdf.analysis.meetingDate && <div>📅 {pdf.analysis.meetingDate}</div>}
                                    {pdf.analysis.meetingType && <div>🏛️ {pdf.analysis.meetingType}</div>}
                                    {pdf.analysis.documentType && <div>📋 {pdf.analysis.documentType}</div>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      
                      <ul className="space-y-2">
                        {info.comprehensiveInfo.info.comprehensiveInfo.documentInfo.pdfLinks.map((url, index) => (
                          <li key={index}>
                            <a 
                              href={url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-purple-600 hover:text-purple-800 underline break-all flex items-center gap-2"
                            >
                              <span>📄</span>
                              {url.split('/').pop() || url}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {info.comprehensiveInfo.info.comprehensiveInfo.documentInfo.streamingLinks && info.comprehensiveInfo.info.comprehensiveInfo.documentInfo.streamingLinks.length > 0 && (
                    <div className="bg-white rounded-lg p-4 border border-purple-200">
                      <h3 className="font-semibold text-purple-800 mb-2">📹 Streaming & Video</h3>
                      <ul className="space-y-2">
                        {info.comprehensiveInfo.info.comprehensiveInfo.documentInfo.streamingLinks.map((url, index) => (
                          <li key={index}>
                            <a 
                              href={url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-purple-600 hover:text-purple-800 underline break-all flex items-center gap-2"
                            >
                              <span>📹</span>
                              {url}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {info.comprehensiveInfo.info.comprehensiveInfo.documentInfo.upcomingMeetings && info.comprehensiveInfo.info.comprehensiveInfo.documentInfo.upcomingMeetings.length > 0 && (
                    <div className="bg-white rounded-lg p-4 border border-purple-200">
                      <h3 className="font-semibold text-purple-800 mb-2">📅 Upcoming Meetings</h3>
                      <ul className="space-y-1">
                        {info.comprehensiveInfo.info.comprehensiveInfo.documentInfo.upcomingMeetings.map((meeting, index) => (
                          <li key={index} className="text-gray-700">
                            • {meeting}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {info.comprehensiveInfo.info.comprehensiveInfo.documentInfo.accessibilityInfo && (
                    <div className="bg-white rounded-lg p-4 border border-purple-200">
                      <h3 className="font-semibold text-purple-800 mb-2">♿ Accessibility & Public Access</h3>
                      <p className="text-gray-700">{info.comprehensiveInfo.info.comprehensiveInfo.documentInfo.accessibilityInfo}</p>
                    </div>
                  )}
                </>
              )}

              {info.comprehensiveInfo.info.comprehensiveInfo.scrapedUrls && info.comprehensiveInfo.info.comprehensiveInfo.scrapedUrls.length > 0 && (
                <div className="bg-white rounded-lg p-4 border border-purple-200">
                  <h3 className="font-semibold text-purple-800 mb-2">🔍 Pages Analyzed</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {info.comprehensiveInfo.info.comprehensiveInfo.scrapedUrls.map((url, index) => (
                      <li key={index} className="truncate">{url}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-gray-600">No comprehensive analysis available.</p>
            </div>
          )}
        </div>
      )}
    </main>
  );
}

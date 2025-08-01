'use client';
import { useState } from "react";

export default function HomePage() {
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [agendaData, setAgendaData] = useState(null);
  const [scrapingAgenda, setScrapingAgenda] = useState(false);

  const handleLookup = async () => {
    setLoading(true);
    setAgendaData(null); // Clear previous agenda data
    try {
      const res = await fetch(`/api/lookup?city=${city}&state=${state}`);
      const data = await res.json();
      setInfo(data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setInfo({ error: 'Failed to fetch council information' });
    } finally {
      setLoading(false);
    }
  };

  const handleScrapeAgenda = async (url) => {
    setScrapingAgenda(true);
    try {
      const res = await fetch('/api/scrape-agenda', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      setAgendaData(data);
    } catch (error) {
      console.error('Error scraping agenda:', error);
      setAgendaData({ success: false, error: 'Failed to scrape agenda' });
    } finally {
      setScrapingAgenda(false);
    }
  };

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <center>
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Find Your Local Council Meetings!</h1>
        <div className="mb-6">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter CITY name"
            className="border border-gray-300 p-3 mr-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            value={state}
            onChange={(e) => setState(e.target.value)}
            placeholder="Enter STATE name"
            className="border border-gray-300 p-3 mr-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button 
            onClick={handleLookup} 
            disabled={loading || !city || !state}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white p-3 px-6 rounded-lg transition-colors duration-200 font-medium"
          >
            {loading ? 'Searching...' : 'Lookup'}
          </button>
        </div>
      </center>

      {/* Display Results */}
      {info && (
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-800">
              Council Information for {info.city}, {info.state}
            </h2>
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
          
          {info.error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700">{info.error}</p>
            </div>
          ) : info.councilInfo ? (
            <div className="space-y-4">
              {info.councilInfo.description && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-800 mb-2">Description</h3>
                  <p className="text-blue-700">{info.councilInfo.description}</p>
                </div>
              )}
              
              {info.councilInfo.website && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-800 mb-2">Official Website</h3>
                  <a 
                    href={info.councilInfo.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-green-600 hover:text-green-800 underline break-all"
                  >
                    {info.councilInfo.website}
                  </a>
                </div>
              )}
              
              {info.councilInfo.meetingsPage && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-800 mb-2">Meetings & Agendas</h3>
                  <div className="flex items-center gap-3">
                    <a 
                      href={info.councilInfo.meetingsPage} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-800 underline break-all"
                    >
                      {info.councilInfo.meetingsPage}
                    </a>
                    <button
                      onClick={() => handleScrapeAgenda(info.councilInfo.meetingsPage)}
                      disabled={scrapingAgenda}
                      className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                    >
                      {scrapingAgenda ? 'Scraping...' : 'View Details'}
                    </button>
                  </div>
                </div>
              )}
              
              {info.councilInfo.nextMeeting && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-800 mb-2">Next Meeting</h3>
                  <p className="text-yellow-700">{info.councilInfo.nextMeeting}</p>
                </div>
              )}
              
              {info.councilInfo.contactInfo && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Contact Information</h3>
                  <p className="text-gray-700">{info.councilInfo.contactInfo}</p>
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

      {/* Display Agenda Details */}
      {agendaData && (
        <div className="mt-6 bg-gray-50 rounded-lg shadow p-6 border border-gray-300">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Meeting Agenda Details</h3>
          
          {agendaData.success ? (
            <div className="space-y-4">
              {agendaData.agenda.meetingDate && (
                <div className="bg-blue-100 p-3 rounded">
                  <strong>Date:</strong> {agendaData.agenda.meetingDate}
                </div>
              )}
              
              {agendaData.agenda.meetingTime && (
                <div className="bg-blue-100 p-3 rounded">
                  <strong>Time:</strong> {agendaData.agenda.meetingTime}
                </div>
              )}
              
              {agendaData.agenda.location && (
                <div className="bg-blue-100 p-3 rounded">
                  <strong>Location:</strong> {agendaData.agenda.location}
                </div>
              )}

              {agendaData.agenda.summary && (
                <div className="bg-green-100 p-3 rounded">
                  <strong>Summary:</strong> {agendaData.agenda.summary}
                </div>
              )}

              {agendaData.agenda.agendaItems && agendaData.agenda.agendaItems.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Agenda Items:</h4>
                  <div className="space-y-2">
                    {agendaData.agenda.agendaItems.map((item, index) => (
                      <div key={index} className="bg-white p-3 rounded border border-gray-200">
                        <div className="flex items-start gap-2">
                          {item.itemNumber && (
                            <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-sm font-mono">
                              {item.itemNumber}
                            </span>
                          )}
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-800">{item.title}</h5>
                            {item.description && (
                              <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                            )}
                            {item.type && (
                              <span className="inline-block mt-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                {item.type}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {agendaData.agenda.publicComment && (
                <div className="bg-yellow-100 p-3 rounded">
                  <strong>Public Comment:</strong> {agendaData.agenda.publicComment}
                </div>
              )}

              {agendaData.agenda.documents && agendaData.agenda.documents.length > 0 && (
                <div>
                  <strong>Documents:</strong>
                  <ul className="list-disc list-inside mt-1 text-gray-700">
                    {agendaData.agenda.documents.map((doc, index) => (
                      <li key={index}>{doc}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded p-4">
              <p className="text-red-700">Failed to scrape agenda: {agendaData.error}</p>
            </div>
          )}
        </div>
      )}
    </main>
  );
}

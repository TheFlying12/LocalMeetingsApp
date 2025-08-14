'use client';
import { useState } from "react";
import StateDropdown from "../components/StateDropdown";
import MeetingInfo from "../components/MeetingInfo";
import Header from "../components/Header";

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
    <>
    <Header githubUrl="https://github.com/TheFlying12" linkedinUrl="https://linkedin.com/in/tejusj"/>
    <main className="p-6 max-w-6xl mx-auto">
      <center>
        <div className="mb-6 flex flex-col sm:flex-row gap-3 items-center justify-center">
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
            placeholder="Enter CITY name"
            className="border border-gray-300 p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-[10vw]"
          />
          <div className="w-[10vw]">
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


      {/* Results */}
                  <div className="flex justify-center">
      {info && <MeetingInfo info={info} />}
                      </div>
      </center>
      </main>
    </>
  );
}
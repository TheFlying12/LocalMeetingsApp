'use client';
import { useEffect, useState } from "react";
import StateDropdown from "../components/StateDropdown";
import MeetingInfo from "../components/MeetingInfo";
import Header from "../components/Header";

export default function HomePage() {
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  // allow Enter to submit when focused in inputs
  useEffect(() => {
    const onEnter = (e) => {
      if (e.key === "Enter" && city && state && !loading) handleLookup();
    };
    window.addEventListener("keydown", onEnter);
    return () => window.removeEventListener("keydown", onEnter);
  }, [city, state, loading]);

  const handleLookup = async () => {
    setLoading(true);
    setInfo(null);
    try {
      const res = await fetch(`/api/lookup?city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}`);
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
      <Header
        brandName="Find Your City Council Meetings"
        brandHref="/"
        githubUrl="https://github.com/TheFlying12"
        linkedinUrl="https://linkedin.com/in/tejusj"
      />

      <main className="relative">
        {/* subtle section background */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-gray-50 via-white to-white" />

        <section className="mx-auto max-w-6xl px-6 py-16 lg:py-24 lg:px-12">
          <div className="text-center space-y-6">
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 leading-tight mx-auto">
              Find council meetings for your city
            </h1>
            <p className="text-gray-600 leading-relaxed text-lg max-w-3xl mx-auto">
              Type a city, pick a state, and get a clean, concise overview:
              schedule, location, live stream, participation, and official links.
            </p>
          </div>

          {/* Search Card */}
          <div className="mx-auto mt-12 w-full max-w-4xl rounded-xl border border-gray-300 bg-white p-6 shadow-md">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_240px_auto]">
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Enter city (e.g., Seattle)"
                className="w-full rounded-md border border-gray-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-smooth"
                aria-label="City"
              />

              <StateDropdown
                value={state}
                onChange={setState}
                placeholder="Select state"
              />

              <button
                onClick={handleLookup}
                disabled={loading || !city || !state}
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 font-medium text-white shadow-sm transition-smooth hover:bg-blue-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:bg-gray-300 disabled:hover:scale-100"
                aria-label="Lookup council info"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="4" />
                      <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="4" />
                    </svg>
                    Searching…
                  </span>
                ) : (
                  "Lookup"
                )}
              </button>
            </div>

            <p className="mt-4 text-sm text-gray-500">
              Tip: you can press Enter to search.
            </p>
          </div>

          {/* Results */}
          <div className="mt-16 flex justify-center">
            {info && <MeetingInfo info={info} />}
          </div>
        </section>
      </main>
    </>
  );
}

'use client';
import { useState } from "react";

export default function HomePage() {
  const [zip, setZip] = useState("")
  const [info, setInfo] = useState(null);


  const handleLookup = async () => {
  const res = await fetch(`/api/lookup?zip=${zip}`);
  const data = await res.json();
  setInfo(data);
  };

  return (
    <main className="p-6">
      <center>
      <h1 className="text-2xl mb-4">Find Your Local Council Meetings!</h1>
      <input
        type="text"
        value={zip}
        onChange={(e) => setZip(e.target.value)}
        placeholder="Enter ZIP code"
        className="border p-2 mr-2"
      />
      <button onClick={handleLookup} className="bg-blue-500 text-white p-2 rounded">
        Lookup
      </button>
      {info && (
        <div className="mt-4">
          <p>📍 City: {info.city}</p>
          <p>🗺️ State: {info.state}</p>
        </div>
      )}
      </center>
    </main>
  );
}

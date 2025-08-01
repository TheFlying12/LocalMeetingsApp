'use client';
import { useState } from "react";

export default function HomePage() {
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [info, setInfo] = useState(null);


  const handleLookup = async () => {
  const res = await fetch(`/api/lookup?city=${city}&state=${state}`);
  const data = await res.json();
  setInfo(data);
  };

  return (
    <main className="p-6">
      <center>
      <h1 className="text-2xl mb-4">Find Your Local Council Meetings!</h1>
      <input
        type="text"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="Enter CITY name"
        className="border p-2 mr-2"/>
      <input
        type="text"
        value={state}
        onChange={(e) => setState(e.target.value)}
        placeholder="Enter STATE name"
        className="border p-2 mr-2"/>
      <button onClick={handleLookup} className="bg-blue-500 text-white p-2 rounded">
        Lookup
      </button>
      
      </center>
    </main>
  );
}

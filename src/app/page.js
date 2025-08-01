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
      <h2 className="text-2xl mb-4">Soon you will just enter your city and state and BAM!</h2>
      </center>
    </main>
  );
}

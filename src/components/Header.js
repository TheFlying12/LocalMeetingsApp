export default function Header({ brandName = 'Find Your City Council Meetings!', brandHref = '/', githubUrl = '#', linkedinUrl = '#' }) {
  return (
    <header className="w-full h-[15vh] bg-white border-b border-gray-100 text-gray-900">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4">
        <a href={brandHref} className="text-xl font-semibold tracking-tight">
          {brandName}
        </a>

        <nav className="flex items-center gap-4">
          <a href={githubUrl} aria-label="GitHub" className="rounded-xl p-2 hover:bg-gray-100 transition">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="#111827">
              <path d="M12 .5a12 12 0 0 0-3.79 23.4c.6.1.82-.27.82-.6v-2.1c-3.34.72-4.04-1.6-4.04-1.6-.54-1.38-1.32-1.75-1.32-1.75-1.08-.74.08-.72.08-.72 1.2.08 1.84 1.24 1.84 1.24 1.06 1.82 2.78 1.3 3.46.99.1-.78.41-1.3.75-1.6-2.67-.3-5.47-1.34-5.47-5.95 0-1.32.47-2.4 1.24-3.24-.12-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.23a11.4 11.4 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.67 1.65.25 2.87.13 3.17.77.84 1.23 1.92 1.23 3.24 0 4.62-2.8 5.64-5.48 5.94.42.36.8 1.06.8 2.15v3.19c0 .34.21.72.83.6A12 12 0 0 0 12 .5Z" />
            </svg>
          </a>
          <a href={linkedinUrl} aria-label="LinkedIn" className="rounded-xl p-2 hover:bg-gray-100 transition">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
              <path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8.5h4V23h-4zM8 8.5h3.8v2h.05c.53-1 1.82-2.05 3.74-2.05 4 0 4.74 2.63 4.74 6.05V23h-4v-6.5c0-1.56-.03-3.56-2.17-3.56-2.17 0-2.5 1.7-2.5 3.45V23H8z" />
            </svg>
          </a>
        </nav>
      </div>
    </header>
  );
}
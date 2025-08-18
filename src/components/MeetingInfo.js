export default function MeetingInfo({ info }) {
  if (!info) return null;

  if (info.error) {
    return (
      <div className="mt-8 w-full max-w-4xl rounded-xl border border-red-300 bg-red-50 p-6 text-center text-red-700 shadow-md">
        <p className="text-base sm:text-lg font-semibold">{info.error}</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl rounded-xl border border-gray-300 bg-white shadow-md overflow-hidden">
      <div className="border-b border-gray-300 bg-gray-50 px-6 py-6 text-center">
        <h3 className="text-xl lg:text-2xl font-bold text-gray-900">
          {info.city}, {info.state}
        </h3>
        <p className="text-base text-gray-600 mt-2">Council Meeting Information</p>
        {info.success && (
          <span className="mt-3 inline-block rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-800">
            Information found
          </span>
        )}
      </div>

      <div className="p-6">
        <div className="space-y-6">
          {info.summary && (
            <Section title="Summary">{info.summary}</Section>
          )}
          {info.meetingSchedule && (
            <Section title="Meeting Schedule">{info.meetingSchedule}</Section>
          )}
          {info.nextMeeting && (
            <Section title="Next Meeting">{info.nextMeeting}</Section>
          )}
          {info.location && (
            <Section title="Location">{info.location}</Section>
          )}
          {info.contactInfo && (
            <Section title="Contact">
              <span className="whitespace-pre-wrap">{info.contactInfo}</span>
            </Section>
          )}
          {info.publicParticipation && (
            <Section title="Public Participation">{info.publicParticipation}</Section>
          )}
          {info.liveStreaming && (
            <Section title="Live Streaming">{info.liveStreaming}</Section>
          )}

          {Array.isArray(info.meetingTypes) && info.meetingTypes.length > 0 && (
            <div className="rounded-xl border border-gray-300 bg-white p-6 shadow-sm">
              <h4 className="mb-4 text-lg font-bold text-gray-900">Meeting Types</h4>
              <div className="flex flex-wrap justify-center gap-2">
                {info.meetingTypes.map((type, idx) => (
                  <span key={idx} className="rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-800">
                    {type}
                  </span>
                ))}
              </div>
            </div>
          )}

          {(info.website || info.meetingsPage) && (
            <div className="rounded-xl border border-gray-300 bg-white p-6 shadow-sm">
              <h4 className="mb-4 text-lg font-bold text-gray-900">Links</h4>
              <div className="space-y-3 break-words text-center">
                {info.website && (
                  <div>
                    <span className="mr-1 font-medium">Official:</span>
                    <a
                      href={info.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline hover:text-blue-800 transition-smooth"
                    >
                      {info.website}
                    </a>
                  </div>
                )}
                {info.meetingsPage && (
                  <div>
                    <span className="mr-1 font-medium">Meetings:</span>
                    <a
                      href={info.meetingsPage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline hover:text-blue-800 transition-smooth"
                    >
                      {info.meetingsPage}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {Array.isArray(info.documents) && info.documents.length > 0 && (
            <div className="rounded-xl border border-gray-300 bg-white p-6 shadow-sm">
              <h4 className="mb-4 text-lg font-bold text-gray-900">Documents &amp; Agendas</h4>
              <ul className="list-inside space-y-3 break-words text-center">
                {info.documents.map((doc, idx) => (
                  <li key={idx}>
                    <a
                      href={doc}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline hover:text-blue-800 transition-smooth"
                    >
                      {doc}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {info.timestamp && (
          <p className="mt-8 text-center text-sm text-gray-500">
            Last updated: {new Date(info.timestamp).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="rounded-xl border border-gray-300 bg-white p-6 shadow-sm">
      <h4 className="mb-3 text-lg font-bold text-gray-900">{title}</h4>
      <p className="leading-relaxed text-gray-700">{children}</p>
    </section>
  );
}

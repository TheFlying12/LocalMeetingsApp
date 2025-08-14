export default function MeetingInfo({ info }) {
  if (!info) return null;

  if (info.error) {
    return (
      <div className="mt-12 w-full max-w-4xl rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700 shadow-sm">
        <p className="text-lg font-semibold">{info.error}</p>
      </div>
    );
  }

  return (
    <div className="mt-12 w-full max-w-4xl rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-gray-100 bg-blue-50 px-6 py-4">
        <div className="flex flex-col items-center gap-1 text-center">
          <h3 className="text-xl font-semibold">
            {info.city}, {info.state}
          </h3>
          <p className="text-sm text-gray-600">Council Meeting Information</p>
          {info.success && (
            <span className="mt-2 inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
              Information Found
            </span>
          )}
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-6">
          {info.summary && (
            <section className="rounded-xl border border-gray-200 p-5">
              <h4 className="mb-2 text-base font-semibold">Summary</h4>
              <p className="text-gray-700 leading-relaxed">{info.summary}</p>
            </section>
          )}

          {info.meetingSchedule && (
            <section className="rounded-xl border border-gray-200 p-5">
              <h4 className="mb-2 text-base font-semibold">Meeting Schedule</h4>
              <p className="text-gray-700">{info.meetingSchedule}</p>
            </section>
          )}

          {info.nextMeeting && (
            <section className="rounded-xl border border-gray-200 p-5">
              <h4 className="mb-2 text-base font-semibold">Next Meeting</h4>
              <p className="text-gray-700">{info.nextMeeting}</p>
            </section>
          )}

          {info.location && (
            <section className="rounded-xl border border-gray-200 p-5">
              <h4 className="mb-2 text-base font-semibold">Location</h4>
              <p className="text-gray-700">{info.location}</p>
            </section>
          )}

          {info.contactInfo && (
            <section className="rounded-xl border border-gray-200 p-5">
              <h4 className="mb-2 text-base font-semibold">Contact</h4>
              <p className="text-gray-700 whitespace-pre-wrap">{info.contactInfo}</p>
            </section>
          )}

          {info.publicParticipation && (
            <section className="rounded-xl border border-gray-200 p-5">
              <h4 className="mb-2 text-base font-semibold">Public Participation</h4>
              <p className="text-gray-700">{info.publicParticipation}</p>
            </section>
          )}

          {info.liveStreaming && (
            <section className="rounded-xl border border-gray-200 p-5">
              <h4 className="mb-2 text-base font-semibold">Live Streaming</h4>
              <p className="text-gray-700">{info.liveStreaming}</p>
            </section>
          )}

          {Array.isArray(info.meetingTypes) && info.meetingTypes.length > 0 && (
            <section className="rounded-xl border border-gray-200 p-5">
              <h4 className="mb-3 text-base font-semibold">Meeting Types</h4>
              <div className="flex flex-wrap justify-center gap-2">
                {info.meetingTypes.map((type, idx) => (
                  <span key={idx} className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                    {type}
                  </span>
                ))}
              </div>
            </section>
          )}

          {(info.website || info.meetingsPage) && (
            <section className="rounded-xl border border-gray-200 p-5">
              <h4 className="mb-2 text-base font-semibold">Links</h4>
              <div className="space-y-2 text-center">
                {info.website && (
                  <div>
                    <span className="mr-2 font-medium">Official Website:</span>
                    <a
                      href={info.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all text-blue-600 underline hover:text-blue-800"
                    >
                      {info.website}
                    </a>
                  </div>
                )}
                {info.meetingsPage && (
                  <div>
                    <span className="mr-2 font-medium">Meetings Page:</span>
                    <a
                      href={info.meetingsPage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all text-blue-600 underline hover:text-blue-800"
                    >
                      {info.meetingsPage}
                    </a>
                  </div>
                )}
              </div>
            </section>
          )}

          {Array.isArray(info.documents) && info.documents.length > 0 && (
            <section className="rounded-xl border border-gray-200 p-5">
              <h4 className="mb-2 text-base font-semibold">Documents & Agendas</h4>
              <ul className="list-inside space-y-2">
                {info.documents.map((doc, idx) => (
                  <li key={idx} className="text-center">
                    <a
                      href={doc}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all text-blue-600 underline hover:text-blue-800"
                    >
                      {doc}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {info.timestamp && (
          <p className="mt-8 text-center text-xs text-gray-500">Last updated: {new Date(info.timestamp).toLocaleString()}</p>
        )}
      </div>
    </div>
  );
}


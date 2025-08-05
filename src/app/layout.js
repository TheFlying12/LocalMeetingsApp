import "./globals.css";

export const metadata = {
  title: "Council Meeting Finder",
  description: "Find your local city council meetings and agendas",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}

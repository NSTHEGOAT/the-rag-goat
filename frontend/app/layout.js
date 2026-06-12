import "./globals.css";

export const metadata = {
  title: "Local RAG — your documents, cited",
  description: "Retrieval-augmented chat over your PDFs and Markdown.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

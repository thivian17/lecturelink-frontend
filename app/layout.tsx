import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LectureLink - AI-Powered Lecture Processing",
  description: "Transform your lectures into structured study guides with AI-powered transcription, slide alignment, and intelligent summaries.",
  keywords: ["lecture", "transcription", "AI", "study", "education", "notes"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

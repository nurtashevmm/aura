import type { Metadata } from "next";
import "./globals.css"; // Импорт стилей
import { AuthProvider } from "./components/AuthProvider";
import Header from "./components/Header";

export const metadata: Metadata = {
  title: "AURA Cloud Gaming",
  description: "Play AAA games on any device",
};

export default function RootLayout({children}: Readonly<{children: React.ReactNode;}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap" rel="stylesheet" />
      </head>
      <body>
        <AuthProvider>
          <Header />
          <main>
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
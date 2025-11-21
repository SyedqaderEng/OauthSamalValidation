import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MockAuth - OAuth & SAML Testing Platform",
  description: "Production-grade OAuth 2.0 and SAML 2.0 testing environment for developers",
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

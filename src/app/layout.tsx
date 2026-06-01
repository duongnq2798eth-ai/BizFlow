import type { Metadata } from "next";
import "./globals.css";
import dynamic from "next/dynamic";

const Providers = dynamic(
  () => import("./providers").then((mod) => mod.Providers),
  { ssr: false }
);

export const metadata: Metadata = {
  title: "BizFlow - B2B API Portal & SME Finance Stack",
  description: "Interactive developer portal and stablecoins commerce stack for B2B payments, unified balance routing, embeddable checkout widgets, and smart contract automation on Arc.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Syne:wght@700;800&family=Geist+Mono:wght@300;400;500;600;700&display=swap" 
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}


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
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}


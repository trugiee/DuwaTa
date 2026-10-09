import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/frontend/components/Providers";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "DuwaTa — Pickleball Tournament Management",
  description:
    "DuwaTa is a pickleball tournament management platform. Teams can register, manage rosters, join tournaments, and track matches and results.",
  keywords: ["pickleball", "tournament", "management", "bracket", "team"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("duwata-theme");if(t!=="dark"&&t!=="light")t="light";document.documentElement.setAttribute("data-theme",t);}catch(e){document.documentElement.setAttribute("data-theme","light");}})();`,
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}


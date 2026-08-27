import type { Metadata, Viewport } from "next";
import { Geist_Mono, Noto_Sans_Thai, Outfit } from "next/font/google";
import { AmbientBackdrop } from "@/components/ambient-backdrop";
import { Providers } from "@/components/providers";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { COPY } from "@/lib/i18n";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoThai = Noto_Sans_Thai({
  variable: "--font-noto-thai",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: `${COPY.brand} — ${COPY.tagline}`,
    template: `%s · ${COPY.brand}`,
  },
  description: COPY.subtitle,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#08060f",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="th"
      suppressHydrationWarning
      className={`dark ${outfit.variable} ${geistMono.variable} ${notoThai.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col text-foreground">
        <AmbientBackdrop />
        <Providers>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}

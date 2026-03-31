import type { Metadata } from "next";
import { Montserrat, Playfair_Display } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://instadiumqr.vercel.app"),
  title: {
    default: "InStadiumQR | Stadium QR Library",
    template: "%s | InStadiumQR",
  },
  description: "Dedicated QR dashboard for InStadium stadium entries.",
  icons: {
    icon: "/Instadiumlogo.png",
    shortcut: "/Instadiumlogo.png",
    apple: "/Instadiumlogo.png",
  },
  openGraph: {
    title: "InStadiumQR | Stadium QR Library",
    description: "Dedicated QR dashboard for InStadium stadium entries.",
    url: "https://instadiumqr.vercel.app",
    siteName: "InStadiumQR",
    images: [
      {
        url: "/Instadiumlogo.png",
        width: 512,
        height: 512,
        alt: "InStadiumQR",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "InStadiumQR | Stadium QR Library",
    description: "Dedicated QR dashboard for InStadium stadium entries.",
    images: ["/Instadiumlogo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${montserrat.variable} ${playfair.variable} antialiased`}>{children}</body>
    </html>
  );
}

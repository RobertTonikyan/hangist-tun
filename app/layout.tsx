import type { Metadata, Viewport } from "next";
import { Heebo } from "next/font/google";
import AuthProvider from "@/components/AuthProvider";
import "./globals.css";

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  variable: "--font-heebo",
});

export const metadata: Metadata = {
  title: "Hangist Tun",
  description: "My quiet home",
  // באייפון: אחרי "הוספה למסך הבית" הפאנל נפתח במסך מלא, עם השם הזה מתחת לאייקון
  appleWebApp: {
    capable: true,
    title: "Hangist Tun",
    statusBarStyle: "black",
  },
};

// הצבע של שורת הסטטוס והדפדפן בטלפון, כמו הרקע של הפאנל
export const viewport: Viewport = {
  themeColor: "#0d1321",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="he" dir="rtl" className={heebo.variable}>
      <body className="font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

import { Geist, Geist_Mono } from "next/font/google";
import { AuthContextProvider } from "@/context/AuthContext";
import { cookieGetter } from "@/lib/cookiesetter";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata = {
  title: "Decision Companion System",
  description: "AI-Powered Job Matching & Career Decisions",
};


export default async function RootLayout({ children }) {
  

  const session = await cookieGetter(); 
  
  let initialUser = null;

  if (session) {
    try {
        initialUser = session.user; 
    } catch (e) {
      console.error("Auth hydration failed:", e);
    }
  }

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthContextProvider initialUser={initialUser}>
          {children}
        </AuthContextProvider>
      </body>
    </html>
  );
}
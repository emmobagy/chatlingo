import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { UILanguageProvider } from "@/contexts/UILanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import AdBlockerBanner from "@/components/shared/AdBlockerBanner";
import SuppressAbortErrors from "@/components/shared/SuppressAbortErrors";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ChatLingo - Practice Real Conversations with AI",
  description:
    "Learn languages through real conversations with your AI tutor. Speaking-first approach from day one.",
  openGraph: {
    title: "ChatLingo",
    description: "Practice real conversations with your AI language tutor",
    type: "website",
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" translate="no" className={`${inter.variable} dark`} suppressHydrationWarning style={{ height: '100%', overflowY: 'auto', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
      <head>
        <meta name="google" content="notranslate" />
        <script dangerouslySetInnerHTML={{ __html: `
(function(){
  function isAbort(err){
    if(!err) return false;
    if(err.name==='AbortError') return true;
    var msg = err.message||'';
    return msg.indexOf('aborted')!==-1||msg.indexOf('abort')!==-1||msg.indexOf('signal')!==-1;
  }
  window.addEventListener('unhandledrejection',function(e){
    if(isAbort(e.reason)){e.preventDefault();e.stopImmediatePropagation();}
  },{capture:true});
  window.addEventListener('error',function(e){
    if(e.error&&isAbort(e.error)){e.preventDefault();e.stopImmediatePropagation();}
  },{capture:true});
  // Apply saved theme before first paint to avoid flash
  try {
    var t = localStorage.getItem('cl-theme');
    var root = document.documentElement;
    if (t === 'light') { root.classList.remove('dark'); root.classList.add('light'); }
    else { root.classList.add('dark'); root.classList.remove('light'); }
  } catch(e) {}
})();
        ` }} />
      </head>
      <body className="antialiased" style={{ fontFamily: 'var(--font-inter)', minHeight: '100%', overflowY: 'auto', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
        {/* Animated mesh background — fixed behind all pages */}
        <div aria-hidden="true" className="mesh-bg" />
        <UILanguageProvider>
          <ThemeProvider>
            <AuthProvider>{children}</AuthProvider>
          </ThemeProvider>
          <AdBlockerBanner />
          <SuppressAbortErrors />
        </UILanguageProvider>
      </body>
    </html>
  );
}

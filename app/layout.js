import { Geist, Geist_Mono } from "next/font/google";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackServerApp } from "../stack";
import "./globals.css";
import Provider from "./provider";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "FuturePrep - AI Learning Platform",
  description: "Transform your learning with AI-powered voice coaching, mock interviews, and personalized education",
  keywords: "AI learning, mock interviews, voice coaching, education platform, personalized learning",
  authors: [{ name: "FuturePrep Team" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#667eea",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="light">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#667eea" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-50 min-h-screen`}
      >
        <StackProvider app={stackServerApp}>
          <StackTheme>
            <Provider>
              <div className="relative">
                {/* Background Decorative Elements */}
                <div className="fixed inset-0 -z-10 overflow-hidden">
                  <div className="absolute -top-40 -right-32 w-96 h-96 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-3xl animate-float"></div>
                  <div className="absolute -bottom-40 -left-32 w-96 h-96 bg-gradient-to-br from-pink-200/30 to-orange-200/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-green-200/20 to-blue-200/20 rounded-full blur-3xl animate-pulse-gentle"></div>
                </div>
                
                {/* Main Content */}
                <main className="relative z-10">
                  {children}
                </main>
              </div>
              
              {/* Enhanced Toaster */}
              <Toaster
                position="top-right"
                toastOptions={{
                  style: {
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(102, 126, 234, 0.2)',
                    borderRadius: '12px',
                    color: '#1e293b',
                    fontSize: '14px',
                    fontWeight: '500',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                  },
                  success: {
                    style: {
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      background: 'rgba(236, 253, 245, 0.95)',
                    },
                  },
                  error: {
                    style: {
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      background: 'rgba(254, 242, 242, 0.95)',
                    },
                  },
                }}
              />
            </Provider>
          </StackTheme>
        </StackProvider>
      </body>
    </html>
  );
}
import type { Metadata } from "next";
import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import { Nav } from "@/components/navigation";
import { FinanceContextProvider } from "@/lib/store/finance-context";
import { AuthContextProvider } from "@/lib/store/auth-context";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Expense-Tracker",
  description: "a simple expense tracker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AuthContextProvider>
              <FinanceContextProvider>
                <div>
                  <Nav />
                  {children}
                  <Toaster />
                </div>
              </FinanceContextProvider>
            </AuthContextProvider>
          </ThemeProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { TrpcProvider } from "@/lib/trpc/provider"
import { ThemeProvider } from "@/providers/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { Footer } from "@/components/footer"
import { cn } from '@/lib/utils'

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
      title: "CareerLog - 의료진을 위한 경력 관리 플랫폼",
  description: "30초 만에 빠른 활동 기록, 전문적인 성과 보고서 생성",
  keywords: ["의료진", "경력관리", "성과보고서", "간호사", "의료진 커리어"],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={cn(inter.variable, 'min-h-screen bg-background font-sans antialiased')}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TrpcProvider>
            <AuthProvider>
              <div className="relative flex min-h-screen flex-col">
                <div className="flex-1">
                  {children}
                </div>
                <Footer />
              </div>
              <Toaster />
            </AuthProvider>
          </TrpcProvider>
        </ThemeProvider>
      </body>
    </html>
  )
} 
import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { QueryClientTanstack } from "./tanstack-provider/QueryClientTanstack"
import { Suspense } from "react"
import { Toaster } from 'react-hot-toast';
import LoadingScreen from "./LoadingScreen/LoadingScreen"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Kanflow - Kanban Board Management",
  description: "Manage your projects with powerful Kanban boards",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryClientTanstack>
          {children}
          <Toaster position="top-right"/>
          <Suspense fallback={<LoadingScreen/>}></Suspense>
        </QueryClientTanstack>
      </body>
    </html>
  )
}

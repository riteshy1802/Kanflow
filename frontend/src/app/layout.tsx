import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { QueryClientTanstack } from "./tanstack-provider/QueryClientTanstack"
import { Suspense } from "react"
import { Toaster } from "react-hot-toast"
import LoadingScreen from "./LoadingScreen/LoadingScreen"
import ConditionalLayout from "./ConditionalLayout"
import { StoreProvider } from "@/redux/StoreProvider"

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
      <body className={`${inter.className} bg-gray-900`}>
        <QueryClientTanstack>
          <StoreProvider>
            <ConditionalLayout>
              <Suspense fallback={<LoadingScreen />}>
                {children}
              </Suspense>
            </ConditionalLayout>
          </StoreProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                fontSize: "14px",
                padding: "12px 16px",
                background: "#333",
                color: "#fff",
              },
              success: {
                style: {
                  fontSize: "14px",
                },
              },
              error: {
                style: {
                  fontSize: "14px",
                },
              },
            }}
          />
        </QueryClientTanstack>
      </body>
    </html>
  )
}
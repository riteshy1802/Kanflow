"use client"

import { usePathname } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname()
  
  const isAuthPage = pathname === "/login" || pathname === "/register"
  
  if (isAuthPage) {
    return (
      <main className="w-full h-screen overflow-hidden">
        {children}
      </main>
    )
  }
  
  return (
    <div className="flex h-screen">
      <AppSidebar />
      <main className="flex-1 w-full overflow-hidden">
        {children}
      </main>
    </div>
  )
}
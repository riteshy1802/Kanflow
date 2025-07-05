"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { useEffect, useState } from "react"

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPrint, setIsPrint] = useState(false)

  const isAuthPage = pathname === "/login" || pathname === "/register"

  useEffect(() => {
    const printParam = searchParams.get("print")
    setIsPrint(printParam === "true")
  }, [searchParams])

  if (isAuthPage) {
    return (
      <main className="w-full h-screen overflow-hidden">
        {children}
      </main>
    )
  }

  return (
    <div className="flex h-screen">
      {!isPrint && <AppSidebar />}
      <main className="flex-1 w-full overflow-hidden">
        {children}
      </main>
    </div>
  )
}

"use client"
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { redirect } from "next/navigation";

export default function HomePage() {
  return (
    <div className="flex items-center justify-center h-screen bg-[#1A1A1A]">
      <div className="text-center">
        <h2 className="text-4xl font-semibold mb-4 text-gray-100">Welcome to Kanflow</h2>
        <p className="text-gray-400 mb-6 text-md">Select a board or create one to get started.</p>
        <Button
          variant="ghost"
          onClick={()=>redirect('/create-workspace')}
          className={`w-full bg-[#4B06C2] cursor-pointer hover:bg-[#4B06C2]/80 text-[0.8rem] text-white justify-center gap-2 hover:text-white`}
        >
          <Plus className="h-4 w-4" />
          Create Kanban
        </Button>
      </div>
    </div>
  )
}

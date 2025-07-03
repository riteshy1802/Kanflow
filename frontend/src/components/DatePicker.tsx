"use client"

import { ChevronDownIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import dayjs from "dayjs"
import { useEffect } from "react"


interface Calendar24Props {
  date: Date | undefined
  onDateChange: (date: Date | undefined) => void
  onBlur?: () => void
}

export function Calendar24({ date, onDateChange, onBlur }: Calendar24Props) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col gap-3">
        <Popover
          onOpenChange={(open)=>{
            if (!open && onBlur) onBlur();
          }}
        >
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-32 justify-between bg-gray-700/50 cursor-pointer border-gray-600 text-gray-100"
            >
              {date ? dayjs(date).format("MMM D, YYYY") : "Select date"}
              <ChevronDownIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0 bg-gray-700 cursor-pointer border-gray-600 text-gray-100" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => onDateChange(d)}
              disabled={(d) => d < new Date() || d < new Date("1900-01-01")}
              captionLayout="dropdown"
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}

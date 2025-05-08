"use client"

import { useEffect, useState } from "react"
import { CalendarIcon } from "lucide-react"

interface CountdownProps {
  startDate: string
  endDate: string
}

export default function CampaignCountdown({ startDate, endDate }: CountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState<{
    days: number
    hours: number
    minutes: number
    seconds: number
    type: "starts" | "ends" | "closed"
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    type: "closed",
  })

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date()
      const start = new Date(startDate)
      const end = new Date(endDate)

      if (now < start) {
        // Campaign hasn't started yet
        const difference = start.getTime() - now.getTime()
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
          type: "starts" as const,
        }
      } else if (now < end) {
        // Campaign is active
        const difference = end.getTime() - now.getTime()
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
          type: "ends" as const,
        }
      } else {
        // Campaign has ended
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          type: "closed" as const,
        }
      }
    }

    setTimeRemaining(calculateTimeRemaining())

    const timer = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining())
    }, 1000)

    return () => clearInterval(timer)
  }, [startDate, endDate])

  if (timeRemaining.type === "closed") {
    return (
      <div className="text-sm text-muted-foreground flex items-center">
        <CalendarIcon className="mr-2 h-4 w-4" />
        <span>Campaign closed</span>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <div className="text-sm font-medium flex items-center">
        <CalendarIcon className="mr-2 h-4 w-4" />
        <span>{timeRemaining.type === "starts" ? "Campaign starts in:" : "Campaign ends in:"}</span>
      </div>
      <div className="grid grid-cols-4 gap-1 text-center">
        <div className="bg-muted rounded p-1">
          <div className="text-lg font-bold">{timeRemaining.days}</div>
          <div className="text-xs text-muted-foreground">Days</div>
        </div>
        <div className="bg-muted rounded p-1">
          <div className="text-lg font-bold">{timeRemaining.hours}</div>
          <div className="text-xs text-muted-foreground">Hours</div>
        </div>
        <div className="bg-muted rounded p-1">
          <div className="text-lg font-bold">{timeRemaining.minutes}</div>
          <div className="text-xs text-muted-foreground">Mins</div>
        </div>
        <div className="bg-muted rounded p-1">
          <div className="text-lg font-bold">{timeRemaining.seconds}</div>
          <div className="text-xs text-muted-foreground">Secs</div>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import ReactConfetti from "react-confetti"
import { useWindowSize } from "react-use"

export function Confetti() {
  const { width, height } = useWindowSize()
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsActive(false)
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  if (!isActive) return null

  return <ReactConfetti width={width} height={height} recycle={false} numberOfPieces={500} gravity={0.1} />
}

"use client"

import { useEffect } from "react"

export default function SentryTestPage() {
  useEffect(() => {
    // Intentional error to test Sentry error tracking
    throw new Error("Sentry Test Error: Este eh um erro proposital para testar o Sentry no WordAI!")
  }, [])

  return (
    <div className="flex items-center justify-center h-screen">
      <h1 className="text-2xl font-bold">Testando Sentry...</h1>
    </div>
  )
}

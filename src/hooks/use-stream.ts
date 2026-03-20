'use client'
import { useState, useCallback } from 'react'

export function useStream() {
  const [content, setContent] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reset = useCallback(() => {
    setContent('')
    setError(null)
  }, [])

  const startStream = useCallback(async (
    url: string,
    body: unknown,
    onLine?: (line: string) => void
  ) => {
    setIsStreaming(true)
    setContent('')
    setError(null)
    let buffer = ''

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || `HTTP ${res.status}`)
      }

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        buffer += chunk
        setContent(prev => prev + chunk)

        if (onLine) {
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''
          lines.filter(l => l.trim()).forEach(line => {
            try { onLine(line) } catch { /* ignore parse errors */ }
          })
        }
      }

      // Process any remaining buffer
      if (onLine && buffer.trim()) {
        try { onLine(buffer) } catch { /* ignore */ }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Stream failed')
    } finally {
      setIsStreaming(false)
    }
  }, [])

  return { content, isStreaming, error, startStream, reset }
}

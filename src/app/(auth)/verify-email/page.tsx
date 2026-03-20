'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const email = searchParams.get('email')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token || !email) {
      setStatus('error')
      setMessage('Invalid verification link.')
      return
    }
    fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`)
      .then(res => res.json())
      .then(data => {
        if (data.message === 'Email verified') {
          setStatus('success')
          setMessage('Your email has been verified! You can now sign in.')
        } else {
          setStatus('error')
          setMessage(data.error || 'Verification failed.')
        }
      })
      .catch(() => {
        setStatus('error')
        setMessage('An error occurred. Please try again.')
      })
  }, [token, email])

  return (
    <div className="rounded-lg border border-border bg-card px-8 py-10 text-center">
      {status === 'loading' && (
        <>
          <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
          <h1 className="text-xl font-bold text-foreground mb-2">Verifying your email...</h1>
        </>
      )}
      {status === 'success' && (
        <>
          <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-xl font-bold text-foreground mb-2">Email Verified!</h1>
          <p className="text-muted-foreground mb-6">{message}</p>
          <Button asChild>
            <Link href="/login">Sign In</Link>
          </Button>
        </>
      )}
      {status === 'error' && (
        <>
          <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h1 className="text-xl font-bold text-foreground mb-2">Verification Failed</h1>
          <p className="text-muted-foreground mb-6">{message}</p>
          <Button variant="outline" asChild>
            <Link href="/login">Back to Sign In</Link>
          </Button>
        </>
      )}
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-lg border border-border bg-card px-8 py-10 text-center">
          <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
          <h1 className="text-xl font-bold text-foreground mb-2">Loading...</h1>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  )
}

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const error_description = requestUrl.searchParams.get('error_description')

  if (error) {
    return NextResponse.redirect(
      `${requestUrl.origin}/login?error=${encodeURIComponent(error_description || error)}`
    )
  }

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    try {
      await supabase.auth.exchangeCodeForSession(code)
    } catch (error) {
      return NextResponse.redirect(
        `${requestUrl.origin}/login?error=Failed to exchange code for session`
      )
    }
  }

  // Redirect to home page after successful auth
  return NextResponse.redirect(`${requestUrl.origin}/`)
}

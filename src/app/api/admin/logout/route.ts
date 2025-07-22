// /api/admin/logout/route.ts
import { NextResponse } from 'next/server'

export async function POST() {
  const res = NextResponse.json({ success: true })
  res.cookies.set('role', '', { path: '/', maxAge: 0 }) // Clear cookie
  return res
}

"use client"

import { useEffect } from "react"
import { redirect, useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/QR_Panel/auth/check")
        if (response.ok) {
          // User is logged in, redirect to home
          router.push("/home")
        } else {
          // User is not logged in, redirect to login
          router.push("/QR_Portal/login")
        }
      } catch (error) {
        // Error checking auth, redirect to login
        router.push("/QR_Portal/login")
      }
    }
    

    checkAuth()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  )
}
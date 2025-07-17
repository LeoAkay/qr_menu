import './Adminglobals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Panel',
  description: 'Admin dashboard login and control panel',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="dashboard-mode">
        {children}
      </body>
    </html>
  )
}
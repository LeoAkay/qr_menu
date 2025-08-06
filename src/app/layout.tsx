import './global.css'
import type { Metadata } from 'next'
import Script from 'next/script'
import { ToastContainer } from 'react-toastify';

export const metadata: Metadata = {
  title: 'Admin Panel',
  description: 'Admin dashboard login and control panel',
}

export default function RootLayout({
  children,
  bodyClassName = '',
}: {
  children: React.ReactNode
  bodyClassName?: string
}) {
  return (
    <html lang="en">
      <head>
        {/* PDF.js global library */}
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
          strategy="beforeInteractive"
        />
        <Script id="pdfjs-worker-setup" strategy="beforeInteractive">
          {`
            if (window && window['pdfjsLib']) {
              window['pdfjsLib'].GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            }
          `}
        </Script>
      </head>
      <body className={`bubble-bg`}>
        {children}
        <ToastContainer/>
      </body>
    </html>
  )
}

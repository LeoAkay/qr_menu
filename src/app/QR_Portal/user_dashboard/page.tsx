'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'

interface UserData {
  id: string
  cId: number
  userName: string
  CreatedAt: string
  UpdatedAt: string
  role?: {
    roleName: string
  }
  company?: {
    id: string
    C_Name?: string
    C_Logo_Image?: any
    C_QR_URL?: string
    pdfMenuFile?: any
    menuType?: string

    Welcoming_Page?: any
    Themes?: Array<{
      style?: string
      backgroundColor?: string
      textColor?: string
      logoAreaColor?: string
      facebookUrl?: string
      instagramUrl?: string
      xUrl?: string
    }>
  }
}

interface Theme {
  backgroundColor?: string
  textColor?: string
  style?: string
}

export default function UserDashboard() {
  const router = useRouter()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'pdf' | 'manual' | 'theme' | 'preview' | 'profile' | ''>('')
  const [menuType, setMenuType] = useState<'pdf' | 'manual' | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [theme, setTheme] = useState<Theme>({
    backgroundColor: '#ffffff',
    textColor: '#000000',
    style: 'modern'
  })

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const userId = localStorage.getItem('userId')
    if (!userId) {
      router.push('/QR_Portal/user_login')
      return
    }

    try {
      const res = await fetch('/api/QR_Panel/user/profile', {
        credentials: 'include'
      })
      
      if (!res.ok) {
        throw new Error('Failed to fetch user data')
      }
      
      const data = await res.json()
      setUserData(data.user)
      
      // Determine menu type based on existing data
      if (data.user.company?.pdfMenuFile) {
        setMenuType('pdf')
      } else if (data.user.company?.Main_Categories?.length > 0) {
        setMenuType('manual')
      }
      
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/QR_Portal/user_login')
    } finally {
      setLoading(false)
    }
  }



  const handleLogout = async () => {
    try {
      await fetch('/api/QR_Panel/user/logout', { method: 'POST', credentials: 'include' })
      localStorage.removeItem('userId')
      localStorage.removeItem('userName')
      router.push('/QR_Portal/user_login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const handleMenuTypeSelect = (type: 'pdf' | 'manual') => {
    setMenuType(type)
    setActiveTab(type)
  }

  const generateQRUrl = () => {
    if (!userData?.company?.id) return ''
    // Use the stored C_QR_URL if available, otherwise generate basic URL
    if (userData.company.C_QR_URL) {
      return userData.company.C_QR_URL
    }
    return `${window.location.origin}/QR_Portal/menu/${userData.company.id}`
  }

  const downloadQR = () => {
    try {
      // QR SVG elementini bul
      const qrContainer = document.getElementById('qr-container')
      const svgElement = qrContainer?.querySelector('svg')
      
      if (svgElement) {
        // SVG'yi canvas'a çevir
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        const svgData = new XMLSerializer().serializeToString(svgElement)
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
        const url = URL.createObjectURL(svgBlob)
        
        const img = new Image()
        img.onload = () => {
          canvas.width = 400
          canvas.height = 400
          
          // Beyaz arka plan ekle
          ctx!.fillStyle = 'white'
          ctx!.fillRect(0, 0, canvas.width, canvas.height)
          
          // QR kodu çiz
          ctx!.drawImage(img, 0, 0, 400, 400)
          
          // Download link oluştur
          const downloadUrl = canvas.toDataURL('image/png')
          const link = document.createElement('a')
          link.href = downloadUrl
          link.download = `${userData?.company?.C_Name || 'menu'}-qr-code.png`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          
          URL.revokeObjectURL(url)
        }
        img.src = url
      } else {
        alert('QR code not found. Please try again.')
      }
    } catch (error) {
      console.error('QR download error:', error)
      alert('Failed to download QR code. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Header */}
      <header className="bg-gradient-to-r from-purple-400 to-purple-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Empty space for alignment */}
            <div className="w-12"></div>
            
            {/* Search Bar */}
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 bg-white bg-opacity-90 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:bg-white transition-all"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Profile Icon */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button
                  onClick={() => setActiveTab('profile')}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition-all mr-2"
                  title="Profile"
                >
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>
            <button
              onClick={handleLogout}
                  className="bg-red-500 bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 transition-all"
                  title="Logout"
            >
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
            </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Menu Section */}
        <div className="mb-8">
          <div className="flex justify-center">
            <button 
              onClick={() => setActiveTab('preview')}
              className="bg-gradient-to-r from-purple-300 to-purple-400 hover:from-purple-400 hover:to-purple-500 text-gray-800 font-semibold py-4 px-12 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-xl"
            >
              Menu
            </button>
          </div>
        </div>

        {/* Main Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Menu Preview Card */}
          <div 
            onClick={() => setActiveTab('preview')}
            className="bg-gradient-to-br from-pink-200 to-pink-300 hover:from-pink-300 hover:to-pink-400 rounded-xl p-8 cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <div className="text-center">
              <div className="text-3xl mb-4">👁️</div>
              <h3 className="text-xl font-semibold text-gray-800">Menu Preview</h3>
            </div>
          </div>

          {/* PDF Upload Card */}
          <div 
            onClick={() => {
              setMenuType('pdf')
              setActiveTab('pdf')
            }}
            className="bg-gradient-to-br from-pink-200 to-pink-300 hover:from-pink-300 hover:to-pink-400 rounded-xl p-8 cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <div className="text-center">
              <div className="text-3xl mb-4">📄</div>
              <h3 className="text-xl font-semibold text-gray-800">PDF Upload</h3>
            </div>
          </div>

          {/* Manual Upload Card */}
          <div 
            onClick={() => {
              setMenuType('manual')
              setActiveTab('manual')
            }}
            className="bg-gradient-to-br from-pink-200 to-pink-300 hover:from-pink-300 hover:to-pink-400 rounded-xl p-8 cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <div className="text-center">
              <div className="text-3xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-800">Manual Upload</h3>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          {activeTab === 'pdf' && (
            <div>
              {!menuType ? (
                <div className="text-center py-12">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-6">PDF Menu Upload</h2>
                  <p className="text-gray-600 mb-8">Follow the steps below to upload your PDF menu</p>
                  <button
                    onClick={() => setMenuType('pdf')}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-medium text-lg transition-colors shadow-lg"
                  >
                    Start PDF Upload
                  </button>
                </div>
              ) : (
                <PDFUploadSection userData={userData} />
              )}
            </div>
          )}

              {activeTab === 'manual' && <ManualMenuSection />}
              {activeTab === 'theme' && <ThemeSection theme={theme} setTheme={setTheme} />}
              {activeTab === 'preview' && (
                <PreviewSection 
                  userData={userData} 
                  theme={theme}
                  qrUrl={generateQRUrl()}
                  onDownloadQR={downloadQR}
                />
              )}
          {activeTab === 'profile' && <ProfileSection userData={userData} />}
          
          {/* Default Welcome Screen */}
          {!activeTab && (
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Welcome!</h2>
              <p className="text-gray-600 mb-8">Select one of the cards above to get started</p>
              <div className="text-6xl mb-4">🍽️</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// PDF Upload Component
function PDFUploadSection({ userData }: { userData: UserData | null }) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showThemeOptions, setShowThemeOptions] = useState(false)
  const [showImageOptions, setShowImageOptions] = useState(false)
  const [selectedLogo, setSelectedLogo] = useState<File | null>(null)
  const [selectedWelcoming, setSelectedWelcoming] = useState<File | null>(null)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [themeSettings, setThemeSettings] = useState({
    backgroundColor: userData?.company?.Themes?.[0]?.backgroundColor || '#ffffff',
    textColor: userData?.company?.Themes?.[0]?.textColor || '#000000',
    logoAreaColor: userData?.company?.Themes?.[0]?.logoAreaColor || '#f8f9fa',
    style: userData?.company?.Themes?.[0]?.style || 'modern'
  })
  const [pdfDisplayMode, setPdfDisplayMode] = useState('flipbook')

  useEffect(() => {
    // Update theme settings when userData loads
    if (userData?.company?.Themes?.[0]) {
      const theme = userData.company.Themes[0]
      setThemeSettings({
        backgroundColor: theme.backgroundColor || '#ffffff',
        textColor: theme.textColor || '#000000',
        logoAreaColor: theme.logoAreaColor || '#f8f9fa',
        style: theme.style || 'modern'
      })
    }
  }, [userData])

  useEffect(() => {
    // Load PDF display mode from company's QR URL or localStorage
    if (userData?.company?.C_QR_URL) {
      const qrUrl = new URL(userData.company.C_QR_URL)
      const modeFromQr = qrUrl.searchParams.get('mode')
      if (modeFromQr && (modeFromQr === 'scroll' || modeFromQr === 'flipbook')) {
        setPdfDisplayMode(modeFromQr)
        return
      }
    }
    
    // Fallback to localStorage
    const savedDisplayMode = localStorage.getItem('pdfDisplayMode')
    if (savedDisplayMode && (savedDisplayMode === 'scroll' || savedDisplayMode === 'flipbook')) {
      setPdfDisplayMode(savedDisplayMode)
    }
  }, [userData])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file)
    } else {
      alert('Please select a valid PDF file')
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    const formData = new FormData()
    formData.append('pdf', selectedFile)

    try {
      const res = await fetch('/api/QR_Panel/user/upload-pdf', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })

      const data = await res.json()

      if (res.ok) {
        alert('PDF uploaded successfully!')
        setSelectedFile(null)
        // Refresh page data
        window.location.reload()
      } else {
        console.error('Upload failed:', data)
        alert(data.error || 'Upload failed. Please try again.')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Network error. Please check your connection and try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleDeletePDF = async () => {
    if (!confirm('Are you sure you want to delete the PDF menu?')) {
      return
    }

    setDeleting(true)
    try {
      const res = await fetch('/api/QR_Panel/user/delete-pdf', {
        method: 'DELETE',
        credentials: 'include'
      })

      if (res.ok) {
        alert('PDF successfully deleted!')
        window.location.reload()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to delete PDF. Please try again.')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Network error. Please check your connection.')
    } finally {
      setDeleting(false)
    }
  }

    const handleSaveTheme = async () => {
    try {
      const res = await fetch('/api/QR_Panel/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          themeData: themeSettings
        }),
        credentials: 'include'
      })

      if (res.ok) {
        alert('Theme settings saved!')
        // Refresh page to show updated theme
        window.location.reload()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to save theme')
      }
    } catch (error) {
      console.error('Theme save error:', error)
      alert('Network error. Please try again.')
    }
  }

  const handleImageUpload = async () => {
    if (!selectedLogo && !selectedWelcoming) {
      alert('Please select at least one image')
      return
    }

    setUploadingImages(true)
    const formData = new FormData()
    
    if (selectedLogo) {
      formData.append('logo', selectedLogo)
    }
    if (selectedWelcoming) {
      formData.append('welcomingPage', selectedWelcoming)
    }

    try {
      const res = await fetch('/api/QR_Panel/user/upload-images', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })

      const data = await res.json()

      if (res.ok) {
        alert('Images uploaded successfully!')
        setSelectedLogo(null)
        setSelectedWelcoming(null)
        window.location.reload()
      } else {
        alert(data.error || 'Image upload failed')
      }
    } catch (error) {
      console.error('Image upload error:', error)
      alert('Network error. Please try again.')
    } finally {
      setUploadingImages(false)
    }
  }

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
      if (allowedTypes.includes(file.type)) {
        setSelectedLogo(file)
      } else {
        alert('Please select a valid image file (JPEG, PNG, WebP)')
      }
    }
  }

  const handleWelcomingSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
      if (allowedTypes.includes(file.type)) {
        setSelectedWelcoming(file)
      } else {
        alert('Please select a valid image file (JPEG, PNG, WebP)')
      }
    }
  }

  const handleDeleteImage = async (imageType: 'logo' | 'welcoming') => {
    if (!confirm(`Are you sure you want to delete the ${imageType === 'logo' ? 'logo' : 'welcome image'}?`)) {
      return
    }

    try {
      const res = await fetch(`/api/QR_Panel/user/delete-image?type=${imageType}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      const data = await res.json()

      if (res.ok) {
        alert(data.message)
        window.location.reload()
      } else {
        alert(data.error || 'Failed to delete image')
      }
    } catch (error) {
      console.error('Image delete error:', error)
      alert('Network error. Please try again.')
    }
  }

  const existingPDF = userData?.company?.pdfMenuFile

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">PDF Menu Management</h2>
      
      {/* Existing PDF Display */}
      {existingPDF && (
        <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="text-4xl mr-4">📄</div>
              <div>
                <h3 className="text-lg font-semibold text-green-800">Current PDF Menu</h3>
                <p className="text-green-600">Your PDF menu has been successfully uploaded</p>
                {userData?.company?.pdfMenuFile && (
                  <a 
                    href={`/api/AdminPanel/company/pdf/${userData.company.id}?t=${Date.now()}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                  >
                    📁 View PDF
                  </a>
                )}
              </div>
            </div>
            <button
              onClick={handleDeletePDF}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:bg-red-400"
            >
              {deleting ? 'Deleting...' : '🗑️ Delete'}
            </button>
          </div>
        </div>
      )}
      
      {/* PDF Upload Section */}
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-purple-400 transition-colors">
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          className="hidden"
          id="pdf-upload"
        />
        <label
          htmlFor="pdf-upload"
          className="cursor-pointer block"
        >
          <div className="text-6xl mb-6">📄</div>
          <div className="text-xl font-medium mb-3 text-gray-800">
            {selectedFile ? selectedFile.name : existingPDF ? 'Select New PDF (Will Replace Current PDF)' : 'Select PDF File'}
          </div>
          <div className="text-gray-500">
            {existingPDF ? 'You can replace your current PDF by selecting a new one' : 'Click to select your menu PDF'}
          </div>
        </label>
      </div>

      {selectedFile && (
        <div className="mt-8 text-center">
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-medium text-lg disabled:bg-gray-400 transition-colors shadow-lg mr-4"
          >
            {uploading ? 'Uploading...' : existingPDF ? 'Update PDF' : 'Upload PDF'}
          </button>
          <button
            onClick={() => setSelectedFile(null)}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {/* PDF Display Mode Selection */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">PDF Display Mode</h3>
        <div className="bg-gray-50 rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Flipbook Mode */}
            <div 
              onClick={() => setPdfDisplayMode('flipbook')}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                pdfDisplayMode === 'flipbook' 
                  ? 'border-purple-500 bg-purple-50' 
                  : 'border-gray-300 hover:border-purple-300'
              }`}
            >
                          <div className="text-center">
              <div className="text-4xl mb-3">📖</div>
              <h4 className="font-semibold text-gray-800 mb-2">Flipbook Style</h4>
              <p className="text-sm text-gray-600">
                Interactive page-turning experience like a real book
              </p>
              <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded text-xs">
                🎨
              </div>
              {pdfDisplayMode === 'flipbook' && (
                <div className="mt-3 text-purple-600 font-medium">
                  ✓ Selected
                </div>
              )}
            </div>
            </div>

            {/* Scroll Mode */}
            <div 
              onClick={() => setPdfDisplayMode('scroll')}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                pdfDisplayMode === 'scroll' 
                  ? 'border-purple-500 bg-purple-50' 
                  : 'border-gray-300 hover:border-purple-300'
              }`}
            >
                          <div className="text-center">
              <div className="text-4xl mb-3">📜</div>
              <h4 className="font-semibold text-gray-800 mb-2">Scroll Style</h4>
              <p className="text-sm text-gray-600">
                Traditional continuous scrolling view
              </p>
              <div className="mt-2 p-2 bg-slate-50 border border-slate-200 rounded text-xs">
                🎨 
              </div>
              {pdfDisplayMode === 'scroll' && (
                <div className="mt-3 text-purple-600 font-medium">
                  ✓ Selected
                </div>
              )}
            </div>
            </div>
          </div>

          {/* Current QR URL Display */}
          <div className="text-center mt-4 p-3 bg-white border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Current QR URL:</p>
            <code className="text-xs bg-gray-100 px-2 py-1 rounded break-all">
              {userData?.company?.C_QR_URL || 'No QR URL generated yet'}
            </code>
            {userData?.company?.C_QR_URL?.includes('localhost') && (
              <div className="mt-2">
                <p className="text-xs text-red-600 mb-2">⚠️ URL uses localhost instead of your IP</p>
                <button
                  onClick={async () => {
                    try {
                      const res = await fetch('/api/QR_Panel/user/update-qr-url', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          displayMode: pdfDisplayMode
                        }),
                        credentials: 'include'
                      })
                      if (res.ok) {
                        alert('QR URL fixed!')
                        window.location.reload()
                      } else {
                        alert('Failed to fix URL')
                      }
                    } catch (error) {
                      console.error('Fix URL error:', error)
                      alert('Failed to fix URL')
                    }
                  }}
                  className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition-colors"
                >
                  🔧 Fix URL
                </button>
              </div>
            )}
          </div>

          {/* Save Display Mode Button */}
          <div className="text-center mt-6">
            <button
              onClick={async () => {
                try {
                  console.log('Updating display mode to:', pdfDisplayMode)
                  
                  // Save to localStorage for session persistence
                  localStorage.setItem('pdfDisplayMode', pdfDisplayMode)
                  
                  // Update QR URL with display mode parameter
                  const res = await fetch('/api/QR_Panel/user/update-qr-url', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      displayMode: pdfDisplayMode
                    }),
                    credentials: 'include'
                  })

                  const data = await res.json()
                  console.log('API Response:', data)

                  if (res.ok) {
                    alert(`PDF display mode saved!\nNew QR URL: ${data.qrUrl}`)
                    // Reload page to show updated QR URL
                    window.location.reload()
                  } else {
                    alert(data.error || 'Failed to update QR code')
                  }
                } catch (error) {
                  console.error('Display mode save error:', error)
                  alert('Network error. Please try again.')
                }
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-lg"
            >
              💾 Save Display Mode
            </button>
          </div>
        </div>
      </div>

      {/* Theme Customization Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Menu Appearance Settings</h3>
          <button
            onClick={() => setShowThemeOptions(!showThemeOptions)}
            className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
          >
            {showThemeOptions ? '📐 Hide' : '🎨 Customize'}
          </button>
        </div>

        {showThemeOptions && (
          <div className="bg-gray-50 rounded-xl p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Background Color */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Background Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={themeSettings.backgroundColor}
                    onChange={(e) => setThemeSettings({...themeSettings, backgroundColor: e.target.value})}
                    className="w-12 h-12 rounded-lg border-2 border-gray-200 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={themeSettings.backgroundColor}
                    onChange={(e) => setThemeSettings({...themeSettings, backgroundColor: e.target.value})}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                    placeholder="#ffffff"
                  />
                </div>
              </div>

              {/* Text Color */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Text Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={themeSettings.textColor}
                    onChange={(e) => setThemeSettings({...themeSettings, textColor: e.target.value})}
                    className="w-12 h-12 rounded-lg border-2 border-gray-200 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={themeSettings.textColor}
                    onChange={(e) => setThemeSettings({...themeSettings, textColor: e.target.value})}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                    placeholder="#000000"
                  />
                </div>
              </div>

              {/* Logo Area Color */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Logo Area Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={themeSettings.logoAreaColor}
                    onChange={(e) => setThemeSettings({...themeSettings, logoAreaColor: e.target.value})}
                    className="w-12 h-12 rounded-lg border-2 border-gray-200 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={themeSettings.logoAreaColor}
                    onChange={(e) => setThemeSettings({...themeSettings, logoAreaColor: e.target.value})}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                    placeholder="#f8f9fa"
                  />
                </div>
              </div>

              {/* Style Selection */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Theme Style
                </label>
                <select
                  value={themeSettings.style}
                  onChange={(e) => setThemeSettings({...themeSettings, style: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                >
                  <option value="modern">Modern</option>
                  <option value="classic">Klasik</option>
                  <option value="elegant">Şık</option>
                  <option value="minimal">Minimal</option>
                </select>
              </div>
            </div>

            {/* Preview */}
            <div className="mt-6">
              <h4 className="text-sm font-medium mb-3 text-gray-700">Preview</h4>
              <div 
                className="border-2 border-gray-300 rounded-lg p-6 text-center"
                style={{
                  backgroundColor: themeSettings.backgroundColor,
                  color: themeSettings.textColor
                }}
              >
                <div 
                  className="inline-block px-4 py-2 rounded-lg mb-4"
                  style={{ backgroundColor: themeSettings.logoAreaColor }}
                >
                  <span className="font-bold text-sm">Logo Area</span>
                </div>
                <h3 className="text-xl font-bold mb-2">
                  {userData?.company?.C_Name || 'Restaurant Name'}
                </h3>
                <p className="text-sm opacity-75">
                  Your PDF menu will be displayed with this theme
                </p>
              </div>
            </div>

            {/* Save Theme Button */}
            <div className="text-center pt-4">
              <button
                onClick={handleSaveTheme}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-lg"
              >
                🎨 Save Theme Settings
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Image Upload Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Logo and Welcome Image</h3>
          <button
            onClick={() => setShowImageOptions(!showImageOptions)}
            className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
          >
            {showImageOptions ? '📷 Hide' : '🖼️ Upload Images'}
          </button>
        </div>

        {/* Current Images Display */}
        {(userData?.company?.C_Logo_Image || userData?.company?.Welcoming_Page) && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
            <h4 className="text-sm font-medium text-green-800 mb-3">Mevcut Resimler</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userData?.company?.C_Logo_Image && (
                <div className="text-center">
                  <p className="text-sm text-green-600 mb-2">Company Logo</p>
                  <img 
                    src={`/api/AdminPanel/company/image/${userData.company.id}/logo`}
                    alt="Company Logo"
                    className="max-w-32 max-h-32 mx-auto rounded-lg border shadow-sm mb-2"
                  />
                  <button
                    onClick={() => handleDeleteImage('logo')}
                    className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md transition-colors"
                  >
                    🗑️ Delete
                  </button>
                </div>
              )}
              {userData?.company?.Welcoming_Page && (
                <div className="text-center">
                  <p className="text-sm text-green-600 mb-2">Welcome Image</p>
                  <img 
                    src={`/api/AdminPanel/company/image/${userData.company.id}/welcoming`}
                    alt="Welcoming Page"
                    className="max-w-32 max-h-32 mx-auto rounded-lg border shadow-sm mb-2"
                  />
                  <button
                    onClick={() => handleDeleteImage('welcoming')}
                    className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md transition-colors"
                  >
                    🗑️ Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {showImageOptions && (
          <div className="bg-gray-50 rounded-xl p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium mb-3 text-gray-700">
                  Company Logo
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoSelect}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label htmlFor="logo-upload" className="cursor-pointer block">
                    <div className="text-4xl mb-3">🏢</div>
                    <div className="text-sm font-medium mb-2 text-gray-800">
                      {selectedLogo ? selectedLogo.name : 'Select Logo'}
                    </div>
                    <div className="text-xs text-gray-500">
                      JPEG, PNG, WebP (Max 5MB)
                    </div>
                  </label>
                </div>
                {selectedLogo && (
                  <div className="mt-3 text-center">
                    <img 
                      src={URL.createObjectURL(selectedLogo)}
                      alt="Logo Preview"
                      className="max-w-24 max-h-24 mx-auto rounded-lg border"
                    />
                    <button
                      onClick={() => setSelectedLogo(null)}
                      className="mt-2 text-xs text-red-600 hover:text-red-800"
                    >
                      Kaldır
                    </button>
                  </div>
                )}
              </div>

              {/* Welcoming Page Upload */}
              <div>
                <label className="block text-sm font-medium mb-3 text-gray-700">
                  Welcome Image
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleWelcomingSelect}
                    className="hidden"
                    id="welcoming-upload"
                  />
                  <label htmlFor="welcoming-upload" className="cursor-pointer block">
                    <div className="text-4xl mb-3">🎉</div>
                    <div className="text-sm font-medium mb-2 text-gray-800">
                      {selectedWelcoming ? selectedWelcoming.name : 'Select Welcome Image'}
                    </div>
                    <div className="text-xs text-gray-500">
                      JPEG, PNG, WebP (Max 5MB)
                    </div>
                  </label>
                </div>
                {selectedWelcoming && (
                  <div className="mt-3 text-center">
                    <img 
                      src={URL.createObjectURL(selectedWelcoming)}
                      alt="Welcoming Preview"
                      className="max-w-24 max-h-24 mx-auto rounded-lg border"
                    />
                    <button
                      onClick={() => setSelectedWelcoming(null)}
                      className="mt-2 text-xs text-red-600 hover:text-red-800"
                    >
                      Kaldır
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Upload Button */}
            {(selectedLogo || selectedWelcoming) && (
              <div className="text-center pt-4">
                <button
                  onClick={handleImageUpload}
                  disabled={uploadingImages}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-lg disabled:bg-purple-400"
                >
                  {uploadingImages ? 'Uploading...' : '🖼️ Upload Images'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Manual Menu Component
function ManualMenuSection() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Manual Menu Builder</h2>
      <div className="text-center py-12 text-gray-500">
        <div className="text-6xl mb-6">🚧</div>
        <h3 className="text-xl font-medium mb-4">Coming Soon</h3>
        <p className="text-lg">Manual menu builder is under development</p>
        <p className="text-sm mt-2">Create categories and subcategories for your menu</p>
      </div>
    </div>
  )
}

// Theme Component
function ThemeSection({ theme, setTheme }: { 
  theme: Theme
  setTheme: (theme: Theme) => void 
}) {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Theme & Logo Customization</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <label className="block text-sm font-medium mb-3 text-gray-700">Background Color</label>
          <input
            type="color"
            value={theme.backgroundColor}
            onChange={(e) => setTheme({ ...theme, backgroundColor: e.target.value })}
            className="w-full h-12 rounded-lg border-2 border-gray-200 cursor-pointer"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-3 text-gray-700">Text Color</label>
          <input
            type="color"
            value={theme.textColor}
            onChange={(e) => setTheme({ ...theme, textColor: e.target.value })}
            className="w-full h-12 rounded-lg border-2 border-gray-200 cursor-pointer"
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-3 text-gray-700">Style</label>
          <select
            value={theme.style}
            onChange={(e) => setTheme({ ...theme, style: e.target.value })}
            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
          >
            <option value="modern">Modern</option>
            <option value="classic">Classic</option>
            <option value="elegant">Elegant</option>
          </select>
        </div>
      </div>
      
      <div className="mt-10">
        <h3 className="text-lg font-medium mb-4 text-gray-800">Company Logo</h3>
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-400 transition-colors">
          <div className="text-4xl mb-4">🖼️</div>
          <p className="text-gray-600">Logo upload feature coming soon...</p>
        </div>
      </div>
    </div>
  )
}

// Preview Component
function PreviewSection({ 
  userData, 
  theme, 
  qrUrl, 
  onDownloadQR 
}: { 
  userData: UserData | null
  theme: Theme
  qrUrl: string
  onDownloadQR: () => void
}) {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Preview & QR Code</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h3 className="text-lg font-medium mb-3 text-gray-700">Menu Preview</h3>
          <div 
            className="border-2 border-gray-200 rounded-xl p-4 min-h-[500px]"
            style={{ 
              backgroundColor: theme.backgroundColor,
              color: theme.textColor 
            }}
          >
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">
                {userData?.company?.C_Name || 'Your Restaurant'}
              </h1>
              <p className="text-base mb-4">Menu preview will appear here</p>
              
              {userData?.company?.id && (
                <div className="mt-4">
                  <a
                    href={`/QR_Portal/menu/${userData.company.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors font-medium text-lg"
                  >
                    🔗 Menu Preview
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-3 text-gray-700">QR Code</h3>
          <div className="text-center">
            {qrUrl && (
              <>
                <div id="qr-container" className="inline-block p-4 bg-white rounded-xl shadow-lg border-2 border-gray-100">
                  <QRCodeSVG value={qrUrl} size={180} />
                </div>
                <div className="mt-4">
                  <button
                    onClick={onDownloadQR}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors font-medium shadow-lg"
                  >
                    📥 Download QR Code
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-3">
                  Scan to view your menu
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Profile Component
function ProfileSection({ userData }: { userData: UserData | null }) {
  const [formData, setFormData] = useState({
    userName: userData?.userName || '',
    companyName: userData?.company?.C_Name || '',
    facebookUrl: '',
    instagramUrl: '',
    xUrl: ''
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (userData) {
      setFormData({
        userName: userData.userName || '',
        companyName: userData.company?.C_Name || '',
        facebookUrl: userData.company?.Themes?.[0]?.facebookUrl || '',
        instagramUrl: userData.company?.Themes?.[0]?.instagramUrl || '',
        xUrl: userData.company?.Themes?.[0]?.xUrl || ''
      })
    }
  }, [userData])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/QR_Panel/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: formData.userName,
          companyName: formData.companyName,
          themeData: {
            facebookUrl: formData.facebookUrl,
            instagramUrl: formData.instagramUrl,
            xUrl: formData.xUrl
          }
        }),
        credentials: 'include'
      })

      if (res.ok) {
        alert('Profile updated successfully!')
        window.location.reload()
      } else {
        const data = await res.json()
        alert(data.error || 'Update failed')
      }
    } catch (error) {
      console.error('Profile update error:', error)
      alert('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Profile Settings</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Basic Information */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-700">Basic Information</h3>
          
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Username
            </label>
            <input
              type="text"
              value={formData.userName}
              onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
              placeholder="Enter your username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Restaurant Name
            </label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
              placeholder="Enter your restaurant name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              User ID
            </label>
            <input
              type="text"
              value={userData?.cId || ''}
              disabled
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">This field cannot be changed</p>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-700">Social Media Links</h3>
          
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Facebook URL
            </label>
            <input
              type="url"
              value={formData.facebookUrl}
              onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
              placeholder="https://facebook.com/yourpage"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Instagram URL
            </label>
            <input
              type="url"
              value={formData.instagramUrl}
              onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
              placeholder="https://instagram.com/yourpage"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              X (Twitter) URL
            </label>
            <input
              type="url"
              value={formData.xUrl}
              onChange={(e) => setFormData({ ...formData, xUrl: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
              placeholder="https://x.com/yourpage"
            />
          </div>
        </div>
      </div>

      {/* Account Info */}
      <div className="mt-8 p-6 bg-gray-50 rounded-xl">
        <h3 className="text-lg font-medium text-gray-700 mb-4">Account Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <span className="font-medium">Registration Date:</span> {userData?.CreatedAt ? new Date(userData.CreatedAt).toLocaleDateString('en-US') : 'Unknown'}
          </div>
          <div>
            <span className="font-medium">Last Update:</span> {userData?.UpdatedAt ? new Date(userData.UpdatedAt).toLocaleDateString('en-US') : 'Unknown'}
          </div>
          <div>
            <span className="font-medium">Rol:</span> {userData?.role?.roleName || 'User'}
          </div>
          <div>
            <span className="font-medium">Menu Type:</span> {userData?.company?.menuType || 'Not Determined Yet'}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-8 text-center">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-medium text-lg disabled:bg-purple-400 transition-colors shadow-lg"
        >
          {saving ? 'Saving...' : '💾 Save Profile'}
        </button>
      </div>
    </div>
  )
} 
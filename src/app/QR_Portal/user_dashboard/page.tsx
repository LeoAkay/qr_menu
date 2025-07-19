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
    Main_Categories?: Array<{
      id: string
      name: string
      categoryNo: number
      subCategories: Array<{
        id: string
        name: string
        orderNo: number
      }>
    }>
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
<div className=" flex items-center space-x-4">
  <div className="flex items-center space-x-2">
    {/* Profile Button */}
<button
  onClick={() => setActiveTab('profile')}
  aria-label="Go to profile"
  className="bg-white absolute right-18 bg-opacity-20 hover:bg-opacity-30 rounded-full p-1.5 transition-all mr-2"
  title="Profile"
>
  <img
    src={
      userData?.company?.C_Logo_Image
        ? `/api/AdminPanel/company/image/${userData.company.id}/logo`
        : '/user-icon-on-transparent-background-free-png.webp' // ✅ Corrected fallback path
    }
    alt="Company Logo"
    className="w-8 h-8 object-cover rounded-full ring-1 ring-white hover:ring-2 transition duration-200"
    loading="lazy"
  />
</button>


    {/* Logout Button */}
    <button
      onClick={handleLogout}
      aria-label="Logout"
      className="bg-red-500 bg-opacity-80 absolute right-5 hover:bg-opacity-100 rounded-full p-2.5 transition-all"
      title="Logout"
    >
      <svg
        className="h-6 w-6 text-white transition-transform duration-200"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
        />
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 justify-center max-w-4xl mx-auto">
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
      <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">PDF Menu Management</h2>
      
      {/* Existing PDF Display */}
      {existingPDF && (
        <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex text-center items-center">
              <div className="text-4xl mr-4">📄</div>
              <div>
                <h3 className="text-lg font-semibold  text-green-800">Current PDF Menu</h3>
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
                <p className="text-xs text-red-600 mb-2">⚠️ URL uses localhost - other devices can't access</p>
                <button
                  onClick={async () => {
                    try {
                      const res = await fetch('/api/QR_Panel/user/fix-qr-urls', {
                        method: 'POST',
                        credentials: 'include'
                      })
                      const data = await res.json()
                      if (res.ok) {
                        alert(`QR URL fixed!\nOld: ${data.oldUrl}\nNew: ${data.newUrl}`)
                        window.location.reload()
                      } else {
                        alert(data.error || 'Failed to fix URL')
                      }
                    } catch (error) {
                      console.error('Fix URL error:', error)
                      alert('Failed to fix URL')
                    }
                  }}
                  className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition-colors"
                >
                  🔧 Fix for Other Devices
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
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [showItemForm, setShowItemForm] = useState<string | null>(null)
  const [showEditCategoryForm, setShowEditCategoryForm] = useState(false)
  const [showEditItemForm, setShowEditItemForm] = useState(false)

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    backgroundImage: null as File | null
  })

  const [itemForm, setItemForm] = useState({
    name: '',
    price: '',
    menuImage: null as File | null
  })

  const [editCategoryForm, setEditCategoryForm] = useState({
    name: '',
    backgroundImage: null as File | null
  })

  const [editItemForm, setEditItemForm] = useState({
    name: '',
    price: '',
    menuImage: null as File | null
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/QR_Panel/user/manual-menu', {
        credentials: 'include'
      })
      if (res.ok) {
        const data = await res.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddCategory = async () => {
    try {
      const formData = new FormData()
      formData.append('name', categoryForm.name)
      if (categoryForm.backgroundImage) {
        formData.append('backgroundImage', categoryForm.backgroundImage)
      }

      const res = await fetch('/api/QR_Panel/user/manual-menu/category', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })

      if (res.ok) {
        alert('Category added successfully!')
        setCategoryForm({ name: '', backgroundImage: null })
        setShowCategoryForm(false)
        fetchCategories()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to add category')
      }
    } catch (error) {
      console.error('Add category error:', error)
      alert('Network error. Please try again.')
    }
  }

  const handleAddItem = async (categoryId: string) => {
    try {
      const formData = new FormData()
      formData.append('name', itemForm.name)
      if (itemForm.price) {
        formData.append('price', itemForm.price)
      }
      formData.append('mainCategoryId', categoryId)
      if (itemForm.menuImage) {
        formData.append('menuImage', itemForm.menuImage)
      }

      const res = await fetch('/api/QR_Panel/user/manual-menu/item', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })

      if (res.ok) {
        alert('Item added successfully!')
        setItemForm({
          name: '', price: '', menuImage: null
        })
        setShowItemForm(null)
        fetchCategories()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to add item')
      }
    } catch (error) {
      console.error('Add item error:', error)
      alert('Network error. Please try again.')
    }
  }

  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    if (!confirm(`Are you sure you want to delete "${categoryName}" category? This will also delete all items in this category.`)) {
      return
    }

    try {
      const res = await fetch(`/api/QR_Panel/user/manual-menu/category?categoryId=${categoryId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (res.ok) {
        alert('Category deleted successfully!')
        fetchCategories()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to delete category')
      }
    } catch (error) {
      console.error('Delete category error:', error)
      alert('Network error. Please try again.')
    }
  }

  const handleDeleteItem = async (itemId: string, itemName: string) => {
    if (!confirm(`Are you sure you want to delete "${itemName}"?`)) {
      return
    }

    try {
      const res = await fetch(`/api/QR_Panel/user/manual-menu/item?itemId=${itemId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (res.ok) {
        alert('Item deleted successfully!')
        fetchCategories()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to delete item')
      }
    } catch (error) {
      console.error('Delete item error:', error)
      alert('Network error. Please try again.')
    }
  }

  const handleEditCategory = (category: any) => {
    setEditingCategory(category)
    setEditCategoryForm({
      name: category.name,
      backgroundImage: null
    })
    setShowEditCategoryForm(true)
  }

  const handleEditItem = (item: any) => {
    setEditingItem(item)
    setEditItemForm({
      name: item.name,
      price: item.price?.toString() || '',
      menuImage: null
    })
    setShowEditItemForm(true)
  }

  const handleUpdateCategory = async () => {
    if (!editingCategory) return

    try {
      const formData = new FormData()
      formData.append('name', editCategoryForm.name)
      if (editCategoryForm.backgroundImage) {
        formData.append('backgroundImage', editCategoryForm.backgroundImage)
      }

      const res = await fetch(`/api/QR_Panel/user/manual-menu/category?categoryId=${editingCategory.id}`, {
        method: 'PUT',
        body: formData,
        credentials: 'include'
      })

      if (res.ok) {
        alert('Category updated successfully!')
        setEditCategoryForm({ name: '', backgroundImage: null })
        setShowEditCategoryForm(false)
        setEditingCategory(null)
        fetchCategories()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to update category')
      }
    } catch (error) {
      console.error('Update category error:', error)
      alert('Network error. Please try again.')
    }
  }

  const handleUpdateItem = async () => {
    if (!editingItem) return

    try {
      const formData = new FormData()
      formData.append('name', editItemForm.name)
      if (editItemForm.price) {
        formData.append('price', editItemForm.price)
      }
      if (editItemForm.menuImage) {
        formData.append('menuImage', editItemForm.menuImage)
      }

      const res = await fetch(`/api/QR_Panel/user/manual-menu/item?itemId=${editingItem.id}`, {
        method: 'PUT',
        body: formData,
        credentials: 'include'
      })

      if (res.ok) {
        alert('Item updated successfully!')
        setEditItemForm({ name: '', price: '', menuImage: null })
        setShowEditItemForm(false)
        setEditingItem(null)
        fetchCategories()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to update item')
      }
    } catch (error) {
      console.error('Update item error:', error)
      alert('Network error. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Manual Menu Builder</h2>
        <button
          onClick={() => setShowCategoryForm(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          + Add Category
        </button>
      </div>

      {/* Add Category Form */}
      {showCategoryForm && (
        <div className="mb-6 p-6 bg-gray-50 border border-gray-200 rounded-xl">
          <h3 className="text-lg font-semibold mb-4">Add New Category</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Category Name</label>
              <input
                type="text"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                placeholder="e.g., Appetizers, Main Courses"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Background Image (Optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCategoryForm({...categoryForm, backgroundImage: e.target.files?.[0] || null})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex space-x-3 mt-4">
            <button
              onClick={handleAddCategory}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Save Category
            </button>
            <button
              onClick={() => setShowCategoryForm(false)}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
              )}

        {/* Edit Category Modal */}
        {showEditCategoryForm && (
          <div className="mb-6 p-6 bg-yellow-50 border border-yellow-200 rounded-xl">
            <h3 className="text-lg font-semibold mb-4">Edit Category: {editingCategory?.name}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Category Name</label>
                <input
                  type="text"
                  value={editCategoryForm.name}
                  onChange={(e) => setEditCategoryForm({...editCategoryForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-yellow-500 focus:outline-none"
                  placeholder="e.g., Appetizers, Main Courses"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Background Image (Optional - Leave empty to keep current)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditCategoryForm({...editCategoryForm, backgroundImage: e.target.files?.[0] || null})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-yellow-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-4">
              <button
                onClick={handleUpdateCategory}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Update Category
              </button>
              <button
                onClick={() => {
                  setShowEditCategoryForm(false)
                  setEditingCategory(null)
                  setEditCategoryForm({ name: '', backgroundImage: null })
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Edit Item Modal */}
        {showEditItemForm && (
          <div className="mb-6 p-6 bg-yellow-50 border border-yellow-200 rounded-xl">
            <h3 className="text-lg font-semibold mb-4">Edit Item: {editingItem?.name}</h3>
                         <div className="space-y-4">
               <div>
                 <label className="block text-sm font-medium mb-2">Item Name</label>
                 <input
                   type="text"
                   value={editItemForm.name}
                   onChange={(e) => setEditItemForm({...editItemForm, name: e.target.value})}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-yellow-500 focus:outline-none"
                   placeholder="e.g., Grilled Chicken"
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium mb-2">Price (₺)</label>
                 <input
                   type="number"
                   step="0.01"
                   value={editItemForm.price}
                   onChange={(e) => setEditItemForm({...editItemForm, price: e.target.value})}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-yellow-500 focus:outline-none"
                   placeholder="e.g., 19.99"
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium mb-2">Item Image (Optional - Leave empty to keep current)</label>
                 <input
                   type="file"
                   accept="image/*"
                   onChange={(e) => setEditItemForm({...editItemForm, menuImage: e.target.files?.[0] || null})}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-yellow-500 focus:outline-none"
                 />
               </div>
             </div>
            <div className="flex space-x-3 mt-4">
              <button
                onClick={handleUpdateItem}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Update Item
              </button>
              <button
                onClick={() => {
                  setShowEditItemForm(false)
                  setEditingItem(null)
                  setEditItemForm({ name: '', price: '', menuImage: null })
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Categories List */}
      {categories.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-6xl mb-4">🍽️</div>
          <h3 className="text-xl font-medium mb-2">No Categories Yet</h3>
          <p className="text-sm">Start by adding your first menu category</p>
        </div>
      ) : (
        <div className="space-y-6">
          {categories.map((category) => (
                         <div key={category.id} className="border border-gray-200 rounded-xl p-6 bg-white">
               <div className="flex justify-between items-center mb-4">
                 <h3 className="text-xl font-semibold text-gray-800">{category.name}</h3>
                 <div className="flex space-x-2">
                   <button
                     onClick={() => setShowItemForm(showItemForm === category.id ? null : category.id)}
                     className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                   >
                     + Add Item
                   </button>
                   <button
                     onClick={() => handleEditCategory(category)}
                     className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                   >
                     ✏️ Edit
                   </button>
                   <button
                     onClick={() => handleDeleteCategory(category.id, category.name)}
                     className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                   >
                     🗑️ Delete
                   </button>
                 </div>
               </div>

              {/* Add Item Form */}
              {showItemForm === category.id && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="text-lg font-medium mb-3">Add New Item to {category.name}</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Item Name</label>
                      <input
                        type="text"
                        value={itemForm.name}
                        onChange={(e) => setItemForm({...itemForm, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                        placeholder="e.g., Grilled Chicken"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Price (₺)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={itemForm.price}
                        onChange={(e) => setItemForm({...itemForm, price: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                        placeholder="e.g., 19.99"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Item Image (Optional)</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setItemForm({...itemForm, menuImage: e.target.files?.[0] || null})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex space-x-3 mt-4">
                    <button
                      onClick={() => handleAddItem(category.id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Save Item
                    </button>
                    <button
                      onClick={() => setShowItemForm(null)}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Items List */}
              <div className="space-y-3">
                                 {category.subCategories?.map((item: any) => (
                   <div key={item.id} className="border border-gray-100 rounded-lg p-4 bg-gray-50">
                     <div className="flex justify-between items-start">
                       <div className="flex-1">
                         <div className="flex items-center space-x-3">
                           <h4 className="font-semibold text-gray-800">{item.name}</h4>
                           {item.price && (
                             <span className="text-green-600 font-bold">₺{item.price}</span>
                           )}
                         </div>
                       </div>
                       <div className="flex items-center space-x-3">
                         {item.menuImage && (
                           <div>
                             <img 
                               src={`/api/QR_Panel/user/manual-menu/image/${item.id}`}
                               alt={item.name}
                               className="w-16 h-16 object-cover rounded-lg"
                             />
                           </div>
                         )}
                         <button
                           onClick={() => handleEditItem(item)}
                           className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-md font-medium transition-colors text-sm"
                         >
                           ✏️
                         </button>
                         <button
                           onClick={() => handleDeleteItem(item.id, item.name)}
                           className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md font-medium transition-colors text-sm"
                         >
                           🗑️
                         </button>
                       </div>
                     </div>
                   </div>
                 )) || (
                  <p className="text-gray-500 text-sm text-center py-4">
                    No items yet. Click "Add Item" to add your first menu item.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
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
  const [selectedMenuType, setSelectedMenuType] = useState<'pdf' | 'manual' | null>(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    // Set initial menu type based on user data
    if (userData?.company?.menuType === 'pdf') {
      setSelectedMenuType('pdf')
    } else if (userData?.company?.menuType === 'manual') {
      setSelectedMenuType('manual')
    }
  }, [userData])

  const handleMenuTypeChange = async (menuType: 'pdf' | 'manual') => {
    if (!userData?.company?.id) return
    
    setUpdating(true)
    try {
      const res = await fetch('/api/QR_Panel/user/update-menu-type', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ menuType }),
        credentials: 'include'
      })

      if (res.ok) {
        const data = await res.json()
        setSelectedMenuType(menuType)
        alert(`Menu type updated to ${menuType}!\nNew QR URL: ${data.qrUrl}`)
        // Refresh page to update QR code
        window.location.reload()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to update menu type')
      }
    } catch (error) {
      console.error('Menu type update error:', error)
      alert('Network error. Please try again.')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-2 text-center text-gray-800">Preview & QR Code</h2>
      
      {/* Menu Type Selector */}
      <div className="mb-6 p-4 bg-gray-50 rounded-xl">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Select Menu Type for QR Code</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {/* PDF Menu Option */}
          <div 
            onClick={() => !updating && handleMenuTypeChange('pdf')}
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all text-center ${
              selectedMenuType === 'pdf' 
                ? 'border-purple-500 bg-purple-50' 
                : 'border-gray-300 hover:border-purple-300'
            } ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="text-4xl mb-3">📄</div>
            <h4 className="font-semibold text-gray-800 mb-2">PDF Menu</h4>
            <p className="text-sm text-gray-600">
              Show uploaded PDF menu
            </p>
            {selectedMenuType === 'pdf' && (
              <div className="mt-3 text-purple-600 font-medium">
                ✓ Active
              </div>
            )}
            {!userData?.company?.pdfMenuFile && (
              <div className="mt-2 text-red-500 text-xs">
                No PDF uploaded yet
              </div>
            )}
          </div>

          {/* Manual Menu Option */}
          <div 
            onClick={() => !updating && handleMenuTypeChange('manual')}
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all text-center ${
              selectedMenuType === 'manual' 
                ? 'border-purple-500 bg-purple-50' 
                : 'border-gray-300 hover:border-purple-300'
            } ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="text-4xl mb-3">📝</div>
            <h4 className="font-semibold text-gray-800 mb-2">Manual Menu</h4>
            <p className="text-sm text-gray-600">
              Show manually created menu
            </p>
            {selectedMenuType === 'manual' && (
              <div className="mt-3 text-purple-600 font-medium">
                ✓ Active
              </div>
            )}
            {(!userData?.company?.Main_Categories || userData.company.Main_Categories.length === 0) && (
              <div className="mt-2 text-red-500 text-xs">
                No categories created yet
              </div>
            )}
          </div>
        </div>
        
        {updating && (
          <div className="text-center mt-4">
            <div className="inline-flex items-center space-x-2 text-purple-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
              <span>Updating menu type...</span>
            </div>
          </div>
        )}
      </div>

  <div className="flex flex-col lg:flex-row gap-6">
    {/* Menu Preview Box */}
    <div
      className="border-2 border-gray-200 rounded-xl p-6 flex-1 flex flex-col items-center justify-center min-h-[500px]"
      style={{
        backgroundColor: theme.backgroundColor,
        color: theme.textColor,
      }}
    >
      <h3 className="text-lg font-medium mb-3 text-gray-700">Menu Preview</h3>

      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">
          {userData?.company?.C_Name || 'Your Restaurant'}
        </h1>
        <p className="text-base mb-4">Menu preview will appear here</p>

        {userData?.company?.id && (
          <a
            href={`/QR_Portal/menu/${userData.company.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors font-medium text-lg"
          >
            🔗 Menu Preview
          </a>
        )}
      </div>
    </div>

    {/* QR Code Box */}
    <div
      className="border-2 border-gray-200 rounded-xl p-6 flex-1 flex flex-col items-center justify-center min-h-[500px]"
      style={{
        backgroundColor: theme.backgroundColor,
        color: theme.textColor,
      }}
    >
      <h3 className="text-lg font-medium mb-3 text-gray-700">QR Code</h3>

      <div className="text-center">
        {qrUrl && (
          <>
            <div
              id="qr-container"
              className="inline-block p-4 bg-white rounded-xl shadow-lg border-2 border-gray-100"
            >
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
            <p className="text-sm text-gray-500 mt-3">Scan to view your menu</p>
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
  const [oldPassword, setOldPassword] = useState('')
const [newPassword, setNewPassword] = useState('')
const [confirmPassword, setConfirmPassword] = useState('')
const [loading, setLoading] = useState(false)
const [showResetDropdown, setShowResetDropdown] = useState(false)

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

 const handlePasswordReset = async () => {
  setLoading(true)
  try {
    const res = await fetch('/api/QR_Panel/user/profile', {
      method: 'PATCH',   // PATCH for password reset
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        oldPassword,
        newPassword,
        confirmPassword,
      }),
      credentials: 'include',
    })

    const data = await res.json()

    if (res.ok) {
      alert(data.message || 'Password updated successfully!')
      // Optionally clear password fields here:
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setShowResetDropdown(false)
    } else {
      alert(data.error || 'Password update failed')
    }
  } catch (error) {
    console.error('Password update error:', error)
    alert('Network error. Please try again.')
  } finally {
    setLoading(false)
  }
}


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
      <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">Profile Settings</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Basic Information */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-black-700">Company Information</h3>
          
          <div>
            <label className="block text-sm font-medium mb-2 text-black-700">
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
            <label className="block text-sm font-medium mb-2 text-black-700">
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
            <label className="block text-sm font-medium mb-2 text-black-700">
              User ID
            </label>
            <input
              type="text"
              value={userData?.cId || ''}
              disabled
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">*This field cannot be changed</p>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-black-700">Social Media Links</h3>
          
          <div>
            <label className="block text-sm font-medium mb-2 text-black-700">
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
            <label className="block text-sm font-medium mb-2 text-black-700">
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
            <label className="block text-sm font-medium mb-2 text-black-700">
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
<div className="mt-8 text-center">
{!showResetDropdown && (
  <button
    className="bg-pink-400 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-medium text-lg disabled:bg-purple-400 transition-colors shadow-lg"
    onClick={() => setShowResetDropdown(true)}
  >
    Reset Password
  </button>
)}
  {showResetDropdown && (
    <div className="mt-6 inline-block text-left w-full max-w-md">
      <div className="bg-white border border-gray-200 rounded-xl shadow-md p-6 space-y-4 mx-auto">
        <div>
          <label htmlFor="oldPassword" className="block text-sm font-medium mb-1 text-gray-700">
            Old Password
          </label>
          <input
            id="oldPassword"
            type="password"
            placeholder="Enter old password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
          />
        </div>

        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium mb-1 text-gray-700">
            New Password
          </label>
          <input
            id="newPassword"
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1 text-gray-700">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="Re-enter new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
          />
        </div>

        <button
          onClick={handlePasswordReset}
          disabled={loading}
          className={`w-full ${
            loading ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
          } text-white py-2 px-4 rounded-lg transition font-semibold`}
        >
          {loading ? 'Updating...' : 'Submit Password Reset'}
        </button>
        <div className="flex justify-center">
  <button
    className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-medium text-lg transition-colors shadow-lg"
    onClick={() => setShowResetDropdown(false)}
  >
    Discard
  </button>
</div>
      </div>
    </div>
  )}
</div>


      {/* Account Info */}
      <div className="mt-8 p-6 bg-gray-50 text-center rounded-xl">
        <h3 className="text-xl font-semibold text-black-700 mb-4">Account Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-l text-black-600">
          <div>
            <span className="font-semibold">Registration Date:</span> {userData?.CreatedAt ? new Date(userData.CreatedAt).toLocaleDateString('en-US') : 'Unknown'}
          </div>
          <div>
            <span className="font-semibold">Last Update:</span> {userData?.UpdatedAt ? new Date(userData.UpdatedAt).toLocaleDateString('en-US') : 'Unknown'}
          </div>
          <div>
            <span className="font-semibold">Role:</span> {userData?.role?.roleName || 'User'}
          </div>
          <div>
            <span className="font-semibold">Menu Type:</span> {userData?.company?.menuType || 'Not Determined Yet'}
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
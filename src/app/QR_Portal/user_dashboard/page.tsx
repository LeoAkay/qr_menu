'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'
import { io } from "socket.io-client";
import { ToastContainer, toast } from 'react-toastify';

// Utility function to format prices with thousand separators
const formatPrice = (price: number): string => {
  return price.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

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
    pdfMenuUrl?: string
    menuType?: string

    Welcoming_Page?: any
    Main_Categories?: Array<{
      id: string
      Mname: string
      categoryNo: number
      subCategories: Array<{
        id: string
        name: string
        orderNo: number
        stock:boolean      }>
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

interface Order {
  id: string
  tableNumber?: string
  note?: string
  orderItems: Array<{
    id: string
    quantity: number
    price: number
    subCategory?: {
      name: string
    }
  }>
  totalAmount: number
  status: string
  isActive: boolean
  createdAt: string
}

export default function UserDashboard() {
  const router = useRouter()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'pdf' | 'manual' | 'theme' | 'preview' | 'profile'| 'contactUs' | 'analytics' | ''>('')
  const [menuType, setMenuType] = useState<'pdf' | 'manual' | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [newOrderNotification, setNewOrderNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState('')
  const [newOrderCount, setNewOrderCount] = useState(0)
  const [activeSection, setActiveSection] = useState<string>('')

  const [theme, setTheme] = useState<Theme>({
    backgroundColor: '#ffffff',
    textColor: '#000000',
    style: 'modern'
  })
  const pdfRef = useRef<HTMLDivElement>(null);
  const manualRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);
  const analyticsRef = useRef<HTMLDivElement>(null);
  const [manualLoaded, setManualLoaded] = useState(false);
  const [themeLoaded, setThemeLoaded] = useState(false);
  const [analyticsLoaded, setAnalyticsLoaded] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!userData?.company?.id) return;
    const interval = setInterval(async () => {
      if (!userData?.company?.id) return;
      const res = await fetch(`/api/QR_Panel/order/${userData.company.id}`);
      if (res.ok) {
        const data = await res.json();
        const activeOrders = data.orders.filter((order: any) => order.isActive !== false);
        setNewOrderCount(activeOrders.length);
      }
    }, 5000); // 5 seconds
    return () => clearInterval(interval);
  }, [userData?.company?.id]);

   const [bannerVisible, setBannerVisible] = useState(false);
  const [bannerOrder, setBannerOrder] = useState<Order | null>(null);

  useEffect(() => {
    const handleNewOrder = (event: Event) => {
      const customEvent = event as CustomEvent<Order>;
      const order = customEvent.detail;
      setBannerOrder(order);
      setBannerVisible(true);

      setTimeout(() => {
        setBannerVisible(false);
      }, 5000); // Hide after 5 seconds
    };

    window.addEventListener('new-order-notification', handleNewOrder);
    return () => window.removeEventListener('new-order-notification', handleNewOrder);
  }, []);

  useEffect(() => {
    checkAuth()
  }, [])

  // Handle navigation from order system page
  useEffect(() => {
    const targetSection = localStorage.getItem('targetSection')
    if (targetSection && userData) {
      // Clear the target section from localStorage
      localStorage.removeItem('targetSection')
      
      // Navigate to the appropriate section
      switch (targetSection) {
        case 'dashboard':
          setActiveTab('')
          setActiveSection('')
          break
        case 'pdf':
          setMenuType('pdf')
          setActiveTab('pdf')
          setActiveSection('PDF Upload')
          setTimeout(() => pdfRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
          break
        case 'manual':
          setMenuType('manual')
          setActiveTab('manual')
          setActiveSection('Manual Menu')
          setTimeout(() => manualRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
          break
        case 'theme':
          setActiveTab('theme')
          setActiveSection('Theme Settings')
          setTimeout(() => themeRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
          break
        case 'analytics':
          setActiveTab('analytics')
          setActiveSection('Analytics')
          break
        case 'preview':
          setActiveTab('preview')
          setActiveSection('Preview & QR Code')
          setTimeout(() => menuRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
          break
        case 'profile':
          setActiveTab('profile')
          setActiveSection('Profile')
          setTimeout(() => profileRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
          break
        case 'contactUs':
          setActiveTab('contactUs')
          setActiveSection('Contact Us')
          break
      }
    }
  }, [userData])

  // WebSocket connection for new order notifications
  useEffect(() => {
    if (!userData?.company?.id) {
      return;
    }
{/*const socketUrl = 'http://172.20.10.3:3000';*/}
    const socketUrl = window.location.origin;

    const socket = io(socketUrl, {
      transports: ['polling', 'websocket'],
      timeout: 20000,
      forceNew: true,
    });

    socket.on('connect', () => {
      if (userData?.company?.id) {
        socket.emit('join', userData.company.id);
      }
    });

    socket.on('disconnect', () => {
      console.log('Dashboard WebSocket disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('Dashboard WebSocket connection error:', error);
    });

    socket.on('new-order', (newOrder: any) => {
      if (newOrder?.tableNumber) {
        toast.info(`New order received for Table ${newOrder.tableNumber}! 🎉`);
        return(<ToastContainer/>)
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [userData]);

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
      // Prefer explicit menuType if available, otherwise infer from data
      if (data.user.company?.menuType === 'pdf') {
        setMenuType('pdf')
      } else if (data.user.company?.menuType === 'manual') {
        setMenuType('manual')
            } else if (data.user.company?.pdfMenuUrl) {
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
    if (!userData?.company?.id) return '';
    
    let baseUrl = userData.company.C_QR_URL || `${window.location.origin}/QR_Portal/menu/${userData.company.id}`;
    
    // Add the display mode parameter for PDF menus
    if (menuType === 'pdf') {
      try {
        const url = new URL(baseUrl);
        if (userData?.company?.menuType === 'pdf') {
          const displayMode = localStorage.getItem('pdfDisplayMode') || 'flipbook';
          url.searchParams.set('mode', displayMode);
        }
        return url.toString();
      } catch {
        // Fallback for invalid URL
        const separator = baseUrl.includes('?') ? '&' : '?';
        if (userData?.company?.menuType === 'pdf') {
          const displayMode = localStorage.getItem('pdfDisplayMode') || 'flipbook';
          return `${baseUrl}${separator}mode=${displayMode}`;
        }
        return baseUrl;
      }
    }
    
    return baseUrl;
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
        toast.error('QR code not found. Please try again.')
      }
    } catch (error) {
      console.error('QR download error:', error)
      toast.error('Failed to download QR code. Please try again.')
    }
  }

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim() && userData?.company?.Main_Categories) {
      setActiveTab('manual');
      setMenuType('manual');
      
    }
  };

  useEffect(() => {
    if (manualLoaded) {
      manualRef.current?.scrollIntoView({ behavior: 'smooth' });
      setManualLoaded(false);
    }
  }, [manualLoaded]);
  useEffect(() => {
    if (themeLoaded) {
      themeRef.current?.scrollIntoView({ behavior: 'smooth' });
      setThemeLoaded(false);
    }
  }, [themeLoaded]);
  useEffect(() => {
    if (analyticsLoaded) {
      analyticsRef.current?.scrollIntoView({ behavior: 'smooth' });
      setAnalyticsLoaded(false);
    }
  }, [analyticsLoaded]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification Popup */}
      {newOrderNotification && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg animate-bounce">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">🎉</div>
            <div>
              <div className="font-semibold">New Order!</div>
              <div className="text-sm opacity-90">{notificationMessage}</div>
            </div>
            <button
              onClick={() => setNewOrderNotification(false)}
              className="ml-4 text-white hover:text-gray-200"
            >
              ✕
            </button>
          </div>
        </div>
      )}



      

    

   
      {/* Header */}
        <header className="bg-gradient-to-r from-purple-500 to-purple-600 shadow-md py-3">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

      {/* Row container for desktop: flex with three parts */}
      <div className="flex items-center w-full sm:justify-between">

        {/* Left: Logo + Company Name */}
        <div className="flex items-center gap-3 sm:gap-5 flex-1 min-w-0">
          <div className="h-12 w-12 sm:h-16 sm:w-16 rounded bg-white p-1 flex-shrink-0">
            <img
              src={
                userData?.company?.C_Logo_Image
                  ? `/api/AdminPanel/company/image/${userData.company.id}/logo?${Date.now()}`
                  : '/user-icon-on-transparent-background-free-png.webp'
              }
              alt="Company Logo"
              className="h-full w-full object-contain rounded"
            />
          </div>
          <button
            onClick={() => {
              setActiveTab('');
              setActiveSection('');
            }}
            className="text-white font-bold text-xl sm:text-2xl whitespace-nowrap truncate min-w-0 hover:text-gray-200 transition-colors cursor-pointer"
          >
            {userData?.company?.C_Name || ''}
          </button>
        </div>

        {/* Center: Search bar */}
         <div className="hidden sm:flex justify-center flex-1 px-4">
          <div className="w-full max-w-xl">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                className="w-full py-2 pl-10 pr-10 rounded-lg bg-white bg-opacity-90 text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Buttons */}
        <div className="flex items-center gap-3 ml-4 flex-1 justify-end">
          <button
            onClick={() => setActiveTab('contactUs')}
            aria-label="Contact Us"
            className="p-2 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-full transition"
          >
            <img
              src="/6ed29fc85c4dad83456b89637af7df.webp"
              alt="Contact"
              className="w-8 h-8 rounded-full object-cover ring-1 ring-white"
            />
          </button>

          <button
            onClick={() => {
              setActiveTab('profile');
              setTimeout(() => profileRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
            }}
            aria-label="Profile"
            className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-1.5 transition-all"
          >
            <img
              src={
                userData?.company?.C_Logo_Image
                  ? `/api/AdminPanel/company/image/${userData.company.id}/logo?${Date.now()}`
                  : '/user-icon-on-transparent-background-free-png.webp'
              }
              alt="Company Logo"
              className="w-8 h-8 object-cover rounded-full ring-1 ring-white hover:ring-2 transition duration-200"
              loading="lazy"
            />
          </button>

          <button
            onClick={handleLogout}
            aria-label="Logout"
            title="Logout"
            className="p-2 bg-red-500 hover:bg-red-600 rounded-full transition"
          >
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile search bar below */}
      <div className="sm:hidden mt-3">
        <div className="w-full">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              className="w-full py-2 pl-10 pr-10 rounded-lg bg-white bg-opacity-90 text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
</header>





      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Menu Section */}
                {/* Action Buttons Bar */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-8">
          <div className="flex items-center">
            <div className="flex-1 flex justify-center">
              <div className="flex flex-wrap gap-4">
                {/* Menu Button */}
                <button 
                  onClick={() => {
                    setActiveTab('preview');
                    setActiveSection('Menu');
                    setTimeout(() => menuRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
                  }}
                  className="flex items-center space-x-3 px-6 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-gray-700 border border-purple-200"
                >
                  <span className="text-2xl">🍽️</span>
                  <span className="font-medium">Menu</span>
                </button>
                {/* PDF Upload Button */}
                <button
                  onClick={() => {
                    setMenuType('pdf');
                    setActiveTab('pdf');
                    setActiveSection('PDF Upload');
                    setTimeout(() => pdfRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
                  }}
                  className="flex items-center space-x-3 px-6 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-gray-700 border border-blue-200"
                >
                  <span className="text-2xl">📄</span>
                  <span className="font-medium">PDF Upload</span>
                </button>
                {/* Manual Menu Button */}
                <button
                  onClick={() => {
                    setMenuType('manual');
                    setActiveTab('manual');
                    setActiveSection('Manual Menu');
                    setTimeout(() => manualRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
                  }}
                  className="flex items-center space-x-3 px-6 py-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-gray-700 border border-green-200"
                >
                  <span className="text-2xl">⚙️</span>
                  <span className="font-medium">Manual Menu</span>
                </button>
                {/* Theme Settings Button */}
                <button
                  onClick={() => {
                    setActiveTab('theme');
                    setActiveSection('Theme Settings');
                    setTimeout(() => themeRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
                  }}
                  className="flex items-center space-x-3 px-6 py-3 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors text-gray-700 border border-yellow-200"
                >
                  <span className="text-2xl">🎨</span>
                  <span className="font-medium">Theme Settings</span>
                </button>
                {/* Order System Button */}
                <button
                  onClick={() => {
                    router.push('/QR_Portal/order_system');
                    setActiveSection('Order System');
                  }}
                  className="flex items-center space-x-3 px-6 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-gray-700 border border-purple-200"
                >
                  <span className="text-2xl">🛒</span>
                  <span className="font-medium">Order System</span>
                </button>
                {/* Analytics Button */}
                <button
                  onClick={() => {
                    setActiveTab('analytics');
                    setActiveSection('Analytics');
                  }}
                  className="flex items-center space-x-3 px-6 py-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors text-gray-700 border border-indigo-200"
                >
                  <span className="text-2xl">📊</span>
                  <span className="font-medium">Analytics</span>
                </button>
              </div>
            </div>
          </div>
        </div>



        {/* Content Area */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          {activeTab === 'pdf' && (
            <div ref={pdfRef}>
            <div>
              {!menuType ? (
                <div className="text-center py-12">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-6">PDF Menu Upload</h2>
                  <p className="text-gray-600 mb-8">Follow the steps below to upload your PDF menu</p>
                  <button
                    onClick={() => setMenuType('pdf')}
                    className="bg-purple-400 hover:bg-purple-500 text-white px-8 py-3 rounded-lg font-medium text-lg transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <svg className="w-6 h-6 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Start PDF Upload
                  </button>
                </div>
              ) : (
                <PDFUploadSection userData={userData} />
              )}
            </div>
            </div>
          )}

              {activeTab === 'manual' && (
  <div ref={manualRef}>
    <ManualMenuSection
      searchQuery={searchQuery}
      onSearchHandled={() => setSearchQuery('')}
      onLoaded={() => setManualLoaded(true)}
    />
  </div>
)}
              {activeTab === 'theme' && (
  <div ref={themeRef}>
    <ThemeSettingsSection
      userData={userData}
      onLoaded={() => setThemeLoaded(true)}
    />
  </div>
)}

              {activeTab === 'preview' && (
                <div ref={menuRef}>
                  <PreviewSection 
                    userData={userData} 
                    theme={theme}
                    qrUrl={generateQRUrl()}
                    onDownloadQR={downloadQR}
                  />
                </div>
              )}
          {activeTab === 'profile' && (
            <div ref={profileRef}>
              <ProfileSection userData={userData} />
            </div>
          )}
          {activeTab === 'contactUs' && <GetStartedPage userData={userData} />}
          {activeTab === 'analytics' && (
  <div ref={analyticsRef}>
    <AnalyticsSection
      userData={userData}
      onLoaded={() => setAnalyticsLoaded(true)}
    />
  </div>
)}
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
     toast.error('Please select a valid PDF file')
    }
  }

  const generateQRUrl = () => {
    if (!userData?.company?.id) return '';
    
    let baseUrl = userData.company.C_QR_URL || `${window.location.origin}/QR_Portal/menu/${userData.company.id}`;
    
    try {
      const url = new URL(baseUrl);
      url.searchParams.set('mode', pdfDisplayMode);
      return url.toString();
    } catch {
      // Fallback for invalid URL
      const separator = baseUrl.includes('?') ? '&' : '?';
      return `${baseUrl}${separator}mode=${pdfDisplayMode}`;
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
        toast.success('PDF uploaded successfully!')
        setSelectedFile(null)
        // Refresh page data
        window.location.reload()
      } else {
        console.error('Upload failed:', data)
        toast.error(data.error || 'Upload failed. Please try again.')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Network error. Please check your connection and try again.')
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
        toast.success('PDF successfully deleted!')
        window.location.reload()
      } else {
        const data = await res.json()
       toast.error(data.error || 'Failed to delete PDF. Please try again.')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Network error. Please check your connection.')
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
        toast.success('Theme settings saved!')
        // Refresh page to show updated theme
        window.location.reload()
      } else {
        const data = await res.json()
       toast.error(data.error || 'Failed to save theme')
      }
    } catch (error) {
      console.error('Theme save error:', error)
      toast.error('Network error. Please try again.')
    }
  }

  const handleImageUpload = async () => {
    if (!selectedLogo && !selectedWelcoming) {
      toast.error('Please select at least one image')
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
        toast.success('Images uploaded successfully!')
        setSelectedLogo(null)
        setSelectedWelcoming(null)
        window.location.reload()
      } else {
        toast.error(data.error || 'Image upload failed')
      }
    } catch (error) {
      console.error('Image upload error:', error)
      toast.error('Network error. Please try again.')
    } finally {
      setUploadingImages(false)
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
        toast.success(data.message)
        window.location.reload()
      } else {
        toast.error(data.error || 'Failed to delete image')
      }
    } catch (error) {
      console.error('Image delete error:', error)
      toast.error('Network error. Please try again.')
    }
  }

  const existingPDF = userData?.company?.pdfMenuUrl

  return (
    <div>
      <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">PDF Menu Management</h2>
      {/* Existing PDF Display */}
      {existingPDF && (
        <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-xl flex items-center space-x-6">
          <div className="flex-1 text-center">
            <h3 className="text-lg font-semibold text-green-800">Current PDF Menu</h3>
            <p className="text-green-600">Your PDF menu has been successfully uploaded</p>
            {userData?.company?.pdfMenuUrl && (
              <a 
                href={`/api/AdminPanel/company/pdf/${userData.company.id}?t=${Date.now()}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-purple-600 hover:text-purple-800 text-sm font-medium inline-block mt-2"
              >
                📁 View PDF
              </a>
            )}
            <div className="mt-4">
              <button
                onClick={handleDeletePDF}
                disabled={deleting}
                className="bg-rose-400 hover:bg-rose-500 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md disabled:bg-rose-300"
                title="Delete PDF menu"
              >
                {deleting ? (
                  <>
                    <svg className="w-4 h-4 inline mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Deleting...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </>
                )}
              </button>
            </div>
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
            {existingPDF ? 'Replace your current PDF by selecting or uploading a new one' : 'Click to select your menu PDF'}
          </div>
        </label>
      </div>
      {selectedFile && (
        <div className="mt-8 text-center">
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="bg-purple-400 hover:bg-purple-500 text-white px-8 py-3 rounded-lg font-medium text-lg disabled:bg-gray-400 transition-all duration-200 shadow-sm hover:shadow-md mr-4"
          >
            <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            {uploading ? 'Uploading...' : existingPDF ? 'Update PDF' : 'Upload PDF'}
          </button>
          <button
            onClick={() => setSelectedFile(null)}
            className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
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
              onClick={() => {
                setPdfDisplayMode('flipbook');
                localStorage.setItem('pdfDisplayMode', 'flipbook');
                const newQrUrl = generateQRUrl();
                fetch('/api/QR_Panel/user/update-qr-url', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ qrUrl: newQrUrl }),
                  credentials: 'include'
                }).catch(error => {
                  console.error('Update QR URL error:', error);
                });
              }}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                pdfDisplayMode === 'flipbook' 
                  ? 'border-purple-500 bg-purple-50' 
                  : 'border-gray-300 hover:border-purple-300'
              }`}
            >
              <div className="text-center">
                <div className="flex justify-center mb-3">
                  <svg className="w-12 h-12 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Flipbook Style</h4>
                <p className="text-sm text-gray-600">
                  Interactive page-turning experience like a real book
                </p>
                <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded text-xs flex items-center justify-center">
                  <svg className="w-4 h-4 text-orange-600 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                  </svg>
                  <span className="text-orange-600">Premium</span>
                </div>
                {pdfDisplayMode === 'flipbook' && (
                  <div className="mt-3 text-purple-600 font-medium flex items-center justify-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Selected
                  </div>
                )}
              </div>
            </div>
            {/* Scroll Mode */}
            <div 
              onClick={() => {
                setPdfDisplayMode('scroll');
                localStorage.setItem('pdfDisplayMode', 'scroll');
                const newQrUrl = generateQRUrl();
                fetch('/api/QR_Panel/user/update-qr-url', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ qrUrl: newQrUrl }),
                  credentials: 'include'
                }).catch(error => {
                  console.error('Update QR URL error:', error);
                });
              }}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                pdfDisplayMode === 'scroll' 
                  ? 'border-purple-500 bg-purple-50' 
                  : 'border-gray-300 hover:border-purple-300'
              }`}
            >
              <div className="text-center">
                <div className="flex justify-center mb-3">
                  <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Scroll Style</h4>
                <p className="text-sm text-gray-600">
                  Traditional continuous scrolling view
                </p>
                <div className="mt-2 p-2 bg-slate-50 border border-slate-200 rounded text-xs flex items-center justify-center">
                  <svg className="w-4 h-4 text-slate-600 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  <span className="text-slate-600">Simple</span>
                </div>
                {pdfDisplayMode === 'scroll' && (
                  <div className="mt-3 text-purple-600 font-medium flex items-center justify-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Selected
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Current QR URL Display */}
          <div className="text-center mt-4 p-3 bg-white border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Current QR URL:</p>
            <code className="text-xs bg-gray-100 px-2 py-1 rounded break-all">
              {generateQRUrl()}
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
                        toast.success(`QR URL fixed!\nOld: ${data.oldUrl}\nNew: ${data.newUrl}`)
                        window.location.reload()
                      } else {
                        toast.error(data.error || 'Failed to fix URL')
                      }
                    } catch (error) {
                      console.error('Fix URL error:', error)
                      toast.error('Failed to fix URL')
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
                  localStorage.setItem('pdfDisplayMode', pdfDisplayMode)
                  const res = await fetch('/api/QR_Panel/user/update-qr-url', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ displayMode: pdfDisplayMode }),
                    credentials: 'include'
                  })
                  const data = await res.json()
                  if (res.ok) {
                    toast.success(`PDF display mode saved!\nNew QR URL: ${data.qrUrl}`)
                    window.location.reload()
                  } else {
                    toast.error(data.error || 'Failed to update QR code')
                  }
                } catch (error) {
                  toast.error('Network error. Please try again.')
                }
              }}
              className="bg-purple-400 hover:bg-purple-500 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
              title="Save PDF display mode"
            >
              <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Save Display Mode
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Manual Menu Component
function ManualMenuSection({ searchQuery, onSearchHandled, onLoaded }: { searchQuery?: string, onSearchHandled?: () => void, onLoaded?: () => void }) {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [showItemForm, setShowItemForm] = useState<string | null>(null)
  const [showEditCategoryForm, setShowEditCategoryForm] = useState(false)
  const [showEditItemForm, setShowEditItemForm] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(null);
  const itemRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  // Restore missing state
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    
  });
  const [itemForm, setItemForm] = useState({
    name: '',
    price: '',
    stock: true,
    menuImage: null as File | null
  });
  const [editCategoryForm, setEditCategoryForm] = useState({
    name: '',
    
  });
  const [editItemForm, setEditItemForm] = useState({
    name: '',
    price: '',
    stock: true,
    menuImage: null as File | null
  });
  const hasCalledOnLoaded = useRef(false);

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
      

      const res = await fetch('/api/QR_Panel/user/manual-menu/category', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })

      if (res.ok) {
        toast.success('Category added successfully!')
        setCategoryForm({ name: '',})
        setShowCategoryForm(false)
        fetchCategories()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to add category')
      }
    } catch (error) {
      console.error('Add category error:', error)
      toast.error('Network error. Please try again.')
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
      formData.append('stock', itemForm.stock ? 'true' : 'false');


      const res = await fetch('/api/QR_Panel/user/manual-menu/item', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })

      if (res.ok) {
        toast.success('Item added successfully!')
        setItemForm({
          name: '', price: '',stock:true, menuImage: null
        })
        setShowItemForm(null)
        fetchCategories()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to add item')
      }
    } catch (error) {
      console.error('Add item error:', error)
      toast.error('Network error. Please try again.')
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
        toast.success('Category deleted successfully!')
        fetchCategories()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to delete category')
      }
    } catch (error) {
      console.error('Delete category error:', error)
      toast.error('Network error. Please try again.')
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
        toast.success('Item deleted successfully!')
        fetchCategories()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to delete item')
      }
    } catch (error) {
      console.error('Delete item error:', error)
      toast.error('Network error. Please try again.')
    }
  }

  const handleEditCategory = (category: any) => {
    setEditingCategory(category)
    setEditCategoryForm({
      name: category.name
    })
    setShowEditCategoryForm(true)
  }

  const handleEditItem = (item: any) => {
    setEditingItem(item)
    setEditItemForm({
      name: item.name,
      price: item.price?.toString() || '',
      stock: item.stock?.true,
      menuImage: null
    })
    setShowEditItemForm(true)
  }

  const handleUpdateCategory = async () => {
    if (!editingCategory) return

    try {
      const formData = new FormData()
      formData.append('name',editCategoryForm.name)
      

      const res = await fetch(`/api/QR_Panel/user/manual-menu/category?categoryId=${editingCategory.id}`, {
        method: 'PUT',
        body: formData,
        credentials: 'include'
      })

      if (res.ok) {
        toast.success('Category updated successfully!')
        setEditCategoryForm({ name: ''})
        setShowEditCategoryForm(false)
        setEditingCategory(null)
        fetchCategories()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to update category')
      }
    } catch (error) {
      console.error('Update category error:', error)
      toast.error('Network error. Please try again.')
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
      formData.append('stock', itemForm.stock ? 'true' : 'false');
      const res = await fetch(`/api/QR_Panel/user/manual-menu/item?itemId=${editingItem.id}`, {
        method: 'PUT',
        body: formData,
        credentials: 'include'
      })

      if (res.ok) {
        toast.success('Item updated successfully!')
        setEditItemForm({ name: '', price: '',stock:true, menuImage: null })
        setShowEditItemForm(false)
        setEditingItem(null)
        fetchCategories()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to update item')
      }
    } catch (error) {
      console.error('Update item error:', error)
      toast.error('Network error. Please try again.')
    }
  }

  useEffect(() => {
    if (searchQuery && categories.length > 0) {
      let foundCat = null;
      let foundItem = null;
      for (const cat of categories) {
        for (const item of cat.subCategories) {
          if (item.name.toLowerCase().includes(searchQuery.toLowerCase())) {
            foundCat = cat;
            foundItem = item;
            break;
          }
        }
        if (foundCat) break;
      }
      if (foundCat && foundItem) {
        setSelectedCategoryId(foundCat.id);
        setHighlightedItemId(foundItem.id);
        setTimeout(() => {
          if (itemRefs.current[foundItem.id]) {
            itemRefs.current[foundItem.id]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 500);
      }
      if (onSearchHandled) onSearchHandled();
    }
  }, [searchQuery, categories]);

  useEffect(() => {
    if (!loading && !hasCalledOnLoaded.current) {
      onLoaded?.();
      hasCalledOnLoaded.current = true;
    }
  }, [loading, onLoaded]);

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
        <h2 className="text-2xl font-semibold text-gray-800"> Builder</h2>
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
                         <div key={category.id} className={`border border-gray-200 rounded-xl p-6 bg-white ${selectedCategoryId === category.id ? 'ring-2 ring-purple-400' : ''}`}>
               <div className="flex justify-between items-center mb-4">
                 <h3 className="text-xl font-semibold text-gray-800">{category.name}</h3>
                 <div className="flex space-x-2">
                   <button
                     onClick={() => setShowItemForm(showItemForm === category.id ? null : category.id)}
                     className="bg-blue-400 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm shadow-sm hover:shadow-md"
                   >
                     <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                     </svg>
                     Add Item
                   </button>
                   <button
                     onClick={() => handleEditCategory(category)}
                     className="bg-amber-400 hover:bg-amber-500 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm shadow-sm hover:shadow-md"
                   >
                     <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                     </svg>
                     Edit
                   </button>
                   <button
                     onClick={() => handleDeleteCategory(category.id, category.name)}
                     className="bg-rose-400 hover:bg-rose-500 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm shadow-sm hover:shadow-md"
                   >
                     <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                     </svg>
                     Delete
                   </button>
                 </div>
               </div>

              {/* Inline Edit Category Form */}
              {editingCategory?.id === category.id && showEditCategoryForm && (
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
                    
                      }}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

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
                    <div>
                      <label className="block text-sm font-medium mb-1">Stock Status</label>
                      <select
                        value={itemForm.stock ? 'true' : 'false'}
                        onChange={(e) => setItemForm({ ...itemForm, stock: e.target.value === 'true' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      >
                        <option value="true">In Stock</option>
                        <option value="false">Out of Stock</option>
                      </select>
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
                   <div key={item.id} ref={el => { itemRefs.current[item.id] = el; }} className={`border border-gray-100 rounded-lg p-4 bg-gray-50 ${highlightedItemId === item.id ? 'ring-4 ring-purple-400' : ''}`}>
                     <div className="flex justify-between items-start">
                       <div className="flex-1">
                         <div className="flex items-center space-x-3">
                           <h4 className="font-semibold text-gray-800">{item.name}</h4>
                           {item.price && (
                             <span className="text-green-600 font-bold">₺{formatPrice(item.price)}</span>
                           )}
                           {item.stock ? (
                            <span className='text-green-600 font-bold'>Available</span>
                           ):(
                            <span className='text-red-600 font-bold'>Out of Stock</span>
                           )}
                         </div>
                       </div>
                       <div className="flex items-center space-x-3">
                         {item.menuImageUrl && (
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
                           className="bg-amber-400 hover:bg-amber-500 text-white p-2 rounded-lg font-medium transition-all duration-200 text-sm shadow-sm hover:shadow-md"
                           title="Edit item"
                         >
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                           </svg>
                         </button>
                         <button
                           onClick={() => handleDeleteItem(item.id, item.name)}
                           className="bg-rose-400 hover:bg-rose-500 text-white p-2 rounded-lg font-medium transition-all duration-200 text-sm shadow-sm hover:shadow-md"
                           title="Delete item"
                         >
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                           </svg>
                         </button>
                       </div>
                     </div>
                     {/* Inline Edit Item Form */}
                     {editingItem?.id === item.id && (
                       <div className="mt-4 mb-2 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
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
                            <div>
                            <label className="block text-sm font-medium mb-1">Stock Status</label>
                            <select
                              value={itemForm.stock ? 'true' : 'false'}
                              onChange={(e) => setItemForm({ ...itemForm, stock: e.target.value === 'true' })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                            >
                              <option value="true">In Stock</option>
                              <option value="false">Out of Stock</option>
                            </select>
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
                               setEditItemForm({ name: '', price: '',stock:true, menuImage: null })
                             }}
                             className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                           >
                             Cancel
                           </button>
                         </div>
                       </div>
                     )}
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
        toast.success(`Menu type updated to ${menuType}!\nNew QR URL: ${data.qrUrl}`)
        // Refresh page to update QR code
        window.location.reload()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to update menu type')
      }
    } catch (error) {
      console.error('Menu type update error:', error)
      toast.error('Network error. Please try again.')
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
                ? 'border-purple-400 bg-purple-50' 
                : 'border-gray-200 hover:border-purple-200'
            } ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex justify-center mb-3">
              <svg className="w-12 h-12 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-800 mb-2">PDF Menu</h4>
            <p className="text-sm text-gray-600">
              Show uploaded PDF menu
            </p>
            {selectedMenuType === 'pdf' && (
              <div className="mt-3 text-purple-500 font-medium flex items-center justify-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Active
              </div>
            )}
            {!userData?.company?.pdfMenuUrl && (
              <div className="mt-2 text-rose-400 text-xs">
                No PDF uploaded yet
              </div>
            )}
          </div>

          {/* Manual Menu Option */}
          <div 
            onClick={() => !updating && handleMenuTypeChange('manual')}
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all text-center ${
              selectedMenuType === 'manual' 
                ? 'border-purple-400 bg-purple-50' 
                : 'border-gray-200 hover:border-purple-200'
            } ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex justify-center mb-3">
              <svg className="w-12 h-12 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-800 mb-2">Order System</h4>
            <p className="text-sm text-gray-600">
              Show manually created menu
            </p>
            {selectedMenuType === 'manual' && (
              <div className="mt-3 text-purple-500 font-medium flex items-center justify-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Active
              </div>
            )}
            {(!userData?.company?.Main_Categories || userData.company.Main_Categories.length === 0) && (
              <div className="mt-2 text-rose-400 text-xs">
                No categories created yet
              </div>
            )}
          </div>
        </div>
        
        {updating && (
          <div className="text-center mt-4">
            <div className="inline-flex items-center space-x-2 text-purple-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
              <span>Updating menu type...</span>
            </div>
          </div>
        )}
      </div>

  <div className="flex flex-col lg:flex-row gap-6">
    {/* Menu Preview Box */}
    <div
      className="border-2 border-gray-100 rounded-xl p-6 flex-1 flex flex-col items-center justify-center min-h-[500px] bg-gray-50"
      style={{
        backgroundColor: theme.backgroundColor,
        color: theme.textColor,
      }}
    >
      <h3 className="text-lg font-medium mb-3 text-gray-600">Menu Preview</h3>

      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">
          {userData?.company?.C_Name || 'Your Restaurant'}
        </h1>
        <p className="text-base mb-4 text-gray-500">Menu preview will appear here</p>

        {userData?.company?.id && (
          <a
            href={`/QR_Portal/menu/${userData.company.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-purple-400 hover:bg-purple-500 text-white px-6 py-3 rounded-lg transition-all duration-200 font-medium text-lg shadow-sm hover:shadow-md"
          >
            <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Menu Preview
          </a>
        )}
      </div>
    </div>

    {/* QR Code Box */}
    <div
      className="border-2 border-gray-100 rounded-xl p-6 flex-1 flex flex-col items-center justify-center min-h-[500px] bg-gray-50"
      style={{
        backgroundColor: theme.backgroundColor,
        color: theme.textColor,
      }}
    >
      <h3 className="text-lg font-medium mb-3 text-gray-600">QR Code</h3>

      <div className="text-center">
        {qrUrl && (
          <>
            <div
              id="qr-container"
              className="inline-block p-4 bg-white rounded-xl shadow-sm border border-gray-100"
            >
              <QRCodeSVG value={qrUrl} size={180} />
            </div>
            <div className="mt-4">
              <button
                onClick={onDownloadQR}
                className="bg-green-400 hover:bg-green-500 text-white px-6 py-3 rounded-lg transition-all duration-200 font-medium shadow-sm hover:shadow-md"
              >
                <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download QR Code
              </button>
            </div>
            <p className="text-sm text-gray-400 mt-3">Scan to view your menu</p>
          </>
        )}
      </div>
    </div>
  </div>
</div>

  )
}

function GetStartedPage({ userData }: { userData: UserData | null }) {
  const [form, setForm] = useState({
    c_Id:  userData?.cId || '',
    restaurant: userData?.company?.C_Name || '',
    message: '',
  })

  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const res = await fetch('/api/QR_Panel/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    if (res.ok) {
      setSubmitted(true)
      setForm({
        c_Id:'',
        restaurant: '',
        message: '',
      })
    } else {
      toast.error('Error sending message.')
    }
  }
    return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-16 relative overflow-hidden">
       {submitted ? (
          <>
    <div className="min-h-screen flex flex-col items-center justify-center space-y-6">
    
    <div className="text-green-600 font-semibold text-4xl text-center">
      Thank you! We'll contact you soon.
    </div><div className="text-green-600 font-semibold text-4xl">
      ✅
    </div>
  </div>

</>
        ) : (
        <div className="max-w-4xl w-full space-y-6 relative z-10">
        <h1 className="text-6xl font-bold text-center text-gray-900">Contact Us</h1>
        <p className="text-center text-gray-700 mb-6">Fill out the form below and we'll get back to you shortly.</p>
          <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { name: 'c_Id', placeholder: 'Restaurant ID' },
                { name: 'restaurant', placeholder: 'Restaurant Name' },
              ].map(({ name, placeholder }) => (
                <input
                  key={name}
                  name={name}
                  value={form[name as keyof typeof form]}
                  onChange={handleChange}
                  required
                  placeholder={placeholder}
                  className="w-full px-5 py-3 rounded-xl bg-white border border-gray-300 placeholder-gray-400 text-gray-900 text-lg transition focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm"
                />
              ))}
            </div>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Optional message or request..."
              rows={5}
              className="w-full px-5 py-4 rounded-xl bg-white border border-gray-300 placeholder-gray-400 text-gray-900 text-lg resize-none transition focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm"
            />
            <button
              type="submit"
              className="w-full py-4 bg-purple-600 text-white text-lg font-semibold rounded-xl hover:bg-purple-700 transition shadow-md"
            >
              Send Message
            </button>
          </form>
          </div>
        )}
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
      toast.success(data.message || 'Password updated successfully!')
      // Optionally clear password fields here:
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setShowResetDropdown(false)
    } else {
      toast.error(data.error || 'Password update failed')
    }
  } catch (error) {
    console.error('Password update error:', error)
    toast.error('Network error. Please try again.')
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
        toast.success('Profile updated successfully!')
        window.location.reload()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Update failed')
      }
    } catch (error) {
      console.error('Profile update error:', error)
      toast.error('Network error. Please try again.')
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

// Theme Settings Section
function ThemeSettingsSection({ userData, onLoaded }: { userData: UserData | null, onLoaded?: () => void }) {
  const [showThemeOptions, setShowThemeOptions] = useState(false)
  const [showImageOptions, setShowImageOptions] = useState(false)
  const [selectedLogo, setSelectedLogo] = useState<File | null>(null)
  const [selectedWelcoming, setSelectedWelcoming] = useState<File | null>(null)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [themeSettings, setThemeSettings] = useState({
    backgroundColor: userData?.company?.Themes?.[0]?.backgroundColor || '#ffffff',
    textColor: userData?.company?.Themes?.[0]?.textColor || '#000000',
    logoAreaColor: userData?.company?.Themes?.[0]?.logoAreaColor || '#f8f9fa',
    style: userData?.company?.Themes?.[0]?.style || 'modern',
  });
  const [loading, setLoading] = useState(true);
  const hasCalledOnLoaded = useRef(false);

  useEffect(() => {
    setLoading(false);
  }, [userData]);

  useEffect(() => {
    if (!loading && !hasCalledOnLoaded.current) {
      onLoaded?.();
      hasCalledOnLoaded.current = true;
    }
  }, [loading, onLoaded]);

  const handleSaveTheme = async () => {
    try {
      const res = await fetch('/api/QR_Panel/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ themeData: themeSettings }),
        credentials: 'include'
      })
      if (res.ok) {
        toast.success('Theme settings saved!')
        window.location.reload()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to save theme')
      }
    } catch (error) {
      toast.error('Network error. Please try again.')
    }
  }

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
      if (allowedTypes.includes(file.type)) {
        setSelectedLogo(file)
      } else {
        toast.warn('Please select a valid image file (JPEG, PNG, WebP)')
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
        toast.warn('Please select a valid image file (JPEG, PNG, WebP)')
      }
    }
  }

  const handleImageUpload = async () => {
    if (!selectedLogo && !selectedWelcoming) {
      toast.warn('Please select at least one image')
      return
    }
    setUploadingImages(true)
    const formData = new FormData()
    if (selectedLogo) formData.append('logo', selectedLogo)
    if (selectedWelcoming) formData.append('welcomingPage', selectedWelcoming)
    try {
      const res = await fetch('/api/QR_Panel/user/upload-images', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('Images uploaded successfully!')
        setSelectedLogo(null)
        setSelectedWelcoming(null)
        window.location.reload()
      } else {
        toast.error(data.error || 'Image upload failed')
      }
    } catch (error) {
      toast.error('Network error. Please try again.')
    } finally {
      setUploadingImages(false)
    }
  }

  const handleDeleteImage = async (imageType: 'logo' | 'welcoming') => {
    if (!confirm(`Are you sure you want to delete the ${imageType === 'logo' ? 'logo' : 'welcome image'}?`)) return
    try {
      const res = await fetch(`/api/QR_Panel/user/delete-image?type=${imageType}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(data.message)
        window.location.reload()
      } else {
        toast.error(data.error || 'Failed to delete image')
      }
    } catch (error) {
      toast.error('Network error. Please try again.')
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">Theme, Logo & Welcome Settings</h2>
      {/* Theme Customization Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Menu Appearance Settings</h3>
          <button
            onClick={() => setShowThemeOptions(!showThemeOptions)}
            className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
          >
            {showThemeOptions ? '⬆️ Hide' : '🎨 Customize'}
          </button>
        </div>
        {showThemeOptions && (
          <div className="bg-gray-50 rounded-xl p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Background Color */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Background Color</label>
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
                <label className="block text-sm font-medium mb-2 text-gray-700">Text Color</label>
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
                <label className="block text-sm font-medium mb-2 text-gray-700">Logo Area Color</label>
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
                <label className="block text-sm font-medium mb-2 text-gray-700">Theme Style</label>
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
                style={{ backgroundColor: themeSettings.backgroundColor, color: themeSettings.textColor }}
              >
                <div 
                  className="inline-block px-4 py-2 rounded-lg mb-4"
                  style={{ backgroundColor: themeSettings.logoAreaColor }}
                >
                  <span className="font-bold text-sm">Logo Area</span>
                </div>
                <h3 className="text-xl font-bold mb-2">{userData?.company?.C_Name || 'Restaurant Name'}</h3>
                <p className="text-sm opacity-75">Your PDF menu will be displayed with this theme</p>
              </div>
            </div>
            {/* Save Theme Button */}
            <div className="text-center pt-4">
              <button
                onClick={handleSaveTheme}
                className="bg-purple-400 hover:bg-purple-500 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save Theme Settings
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
            className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md"
          >
            {showImageOptions ? (
              <>
                <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
                Hide
              </>
            ) : (
              <>
                <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Upload Images
              </>
            )}
          </button>
        </div>
        {/* Current Images Display */}
        {(userData?.company?.C_Logo_Image || userData?.company?.Welcoming_Page) && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
            <h4 className="text-sm font-medium text-green-800 mb-3">Uploaded Images</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userData?.company?.C_Logo_Image && (
                <div className="text-center">
                  <p className="text-sm text-green-600 mb-2">Company Logo</p>
                  <img 
                    src={`/api/AdminPanel/company/image/${userData.company.id}/logo?${Date.now()}`}
                    alt="Company Logo"
                    className="max-w-32 max-h-32 mx-auto rounded-lg border shadow-sm mb-2"
                  />
                  <button
                    onClick={() => handleDeleteImage('logo')}
                    className="text-xs bg-rose-400 hover:bg-rose-500 text-white px-3 py-1 rounded-md transition-all duration-200 shadow-sm hover:shadow-md"
                    title="Delete logo"
                  >
                    <svg className="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              )}
              {userData?.company?.Welcoming_Page && (
                <div className="text-center">
                  <p className="text-sm text-green-600 mb-2">Welcome Image</p>
                  <img 
                    src={`/api/AdminPanel/company/image/${userData.company.id}/welcoming?${Date.now()}`}
                    alt="Welcoming Page"
                    className="max-w-32 max-h-32 mx-auto rounded-lg border shadow-sm mb-2"
                  />
                  <button
                    onClick={() => handleDeleteImage('welcoming')}
                    className="text-xs bg-rose-400 hover:bg-rose-500 text-white px-3 py-1 rounded-md transition-all duration-200 shadow-sm hover:shadow-md"
                    title="Delete welcome image"
                  >
                    <svg className="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
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
                <label className="block text-sm font-medium mb-3 text-gray-700">Company Logo</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoSelect}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label htmlFor="logo-upload" className="cursor-pointer block">
                    <div className="text-sm font-medium mb-2 text-gray-800">{selectedLogo ? selectedLogo.name : 'Select Logo'}</div>
                    <div className="text-xs text-gray-500">JPEG, PNG, WebP (Max 5MB)</div>
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
                      Remove
                    </button>
                  </div>
                )}
              </div>
              {/* Welcoming Page Upload */}
              <div>
                <label className="block text-sm font-medium mb-3 text-gray-700">Welcome Image</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleWelcomingSelect}
                    className="hidden"
                    id="welcoming-upload"
                  />
                  <label htmlFor="welcoming-upload" className="cursor-pointer block">
                    <div className="text-sm font-medium mb-2 text-gray-800">{selectedWelcoming ? selectedWelcoming.name : 'Select Welcome Image'}</div>
                    <div className="text-xs text-gray-500">JPEG, PNG, WebP (Max 5MB)</div>
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
                      Remove
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
                  className="bg-purple-400 hover:bg-purple-500 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md disabled:bg-purple-300"
                >
                  {uploadingImages ? (
                    <>
                      <svg className="w-5 h-5 inline mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      Upload Images
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Analytics Component
function AnalyticsSection({ userData, onLoaded }: { userData: UserData | null, onLoaded?: () => void }) {
  const [analyticsData, setAnalyticsData] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    popularDishes: [] as Array<{name: string, orders: number, revenue: number}>,
    recentOrders: [] as Array<{id: string, tableNumber: number, totalAmount: number, status: string, createdAt: string}>,
    monthlyRevenue: [] as Array<{month: string, revenue: number}>,
    loading: true
  })
  const hasCalledOnLoaded = useRef(false);

 useEffect(() => {
  if (userData?.id) {
    fetchAnalyticsData();
  }
}, [userData])


  const fetchAnalyticsData = async () => {
  try {
    const ordersResponse = await fetch(`/api/QR_Panel/analytics/${userData?.id}`, {
      credentials: 'include'
    });

    const data = await ordersResponse.json(); 
    const orders = (data.orders || []).filter((order: any) => order.isActive === false);


    if (!ordersResponse.ok) {
      throw new Error('Failed to fetch orders');
    }

    // Calculate analytics
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum: number, order: any) => sum + order.totalAmount, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Popular dishes
    const dishCounts: { [key: string]: { orders: number; revenue: number } } = {};
    orders.forEach((order: any) => {
      order.orderItems.forEach((item: any) => {
        const dishName = item.subCategory?.name || 'Unknown Dish';
        if (!dishCounts[dishName]) {
          dishCounts[dishName] = { orders: 0, revenue: 0 };
        }
        dishCounts[dishName].orders += item.quantity;
        dishCounts[dishName].revenue += item.price * item.quantity;
      });
    });

    const popularDishes = Object.entries(dishCounts)
      .map(([name, data]) => ({ name, orders: data.orders, revenue: data.revenue }))
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 5);

    // Recent orders
    const recentOrders = orders
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map((order: any) => ({
        id: order.id,
        tableNumber: order.tableNumber,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt
      }));

    // Monthly revenue
    const monthlyRevenueMap: { [key: string]: number } = {};
    orders.forEach((order: any) => {
      const date = new Date(order.createdAt);
      const month = date.toLocaleDateString('en-US', { month: 'short' });
      monthlyRevenueMap[month] = (monthlyRevenueMap[month] || 0) + order.totalAmount;
    });

    const monthlyRevenueArray = Object.entries(monthlyRevenueMap)
      .map(([month, revenue]) => ({ month, revenue }))
      .sort((a, b) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months.indexOf(a.month) - months.indexOf(b.month);
      });

    setAnalyticsData({
      totalOrders,
      totalRevenue,
      averageOrderValue,
      popularDishes,
      recentOrders,
      monthlyRevenue: monthlyRevenueArray,
      loading: false
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    setAnalyticsData(prev => ({ ...prev, loading: false }));
  }
};

  useEffect(() => {
    if (!analyticsData.loading && !hasCalledOnLoaded.current) {
      onLoaded?.();
      hasCalledOnLoaded.current = true;
    }
  }, [analyticsData.loading, onLoaded]);

  if (analyticsData.loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">Restaurant Analytics</h2>
        <button
          onClick={fetchAnalyticsData}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Key Metrics */}
      <div className="flex justify-center">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
      <div className="flex items-center">
        <div className="p-3 bg-blue-100 rounded-lg">
          <span className="text-2xl">📊</span>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">Total Orders</p>
          <p className="text-2xl font-bold text-gray-900">{analyticsData.totalOrders}</p>
        </div>
      </div>
    </div>

    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
      <div className="flex items-center">
        <div className="p-3 bg-green-100 rounded-lg">
          <span className="text-2xl">💰</span>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">Total Revenue</p>
          <p className="text-2xl font-bold text-gray-900">₺{formatPrice(analyticsData.totalRevenue)}</p>
        </div>
      </div>
    </div>
  </div>
</div>


      {/* Popular Dishes */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">🍽️ Most Popular Dishes</h3>
        <div className="space-y-4">
          {analyticsData.popularDishes.map((dish, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-purple-600">{index + 1}</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{dish.name}</p>
                  <p className="text-sm text-gray-600">{dish.orders} orders</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-green-600">₺{formatPrice(dish.revenue)}</p>
                <p className="text-sm text-gray-500">revenue</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">📋 Recent Orders</h3>
        <div className="space-y-3">
          {analyticsData.recentOrders.map((order) => (
            <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Table no: {order.tableNumber}</p>
                <p className="text-sm text-gray-600">
                  {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">₺{formatPrice(order.totalAmount)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Revenue Chart */}
   <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">📊 Monthly Revenue</h3>
      <div className="flex items-end gap-4 justify-center h-48 overflow-x-auto">
        {analyticsData.monthlyRevenue.map((month, index) => {
          const maxRevenue = Math.max(...analyticsData.monthlyRevenue.map(m => m.revenue), 1);
          const barMaxHeight = 192;
          const barHeight = (month.revenue / maxRevenue) * barMaxHeight;

          return (
            <div key={index} className="flex flex-col items-center w-[40px]">
              <div
                className="w-full bg-gradient-to-t from-purple-500 to-purple-300 rounded-t-lg transition-all"
                style={{ height: `${barHeight}px` }}
              ></div>
              <p className="text-sm font-medium text-gray-600 mt-2 text-center">{month.month}</p>
              <p className="text-xs text-gray-500 text-center">₺{formatPrice(month.revenue)}</p>
            </div>
          );
        })}
      </div>
    </div>
    </div>
  )
}

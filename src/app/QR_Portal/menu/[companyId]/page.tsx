'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import HTMLFlipBook from 'react-pageflip';

interface Company {
  id: string
  C_Name: string
  C_Logo_Image?: any
  Welcoming_Page?: any
  pdfMenuUrl?: string
  menuType?: string

  Main_Categories?: Array<{
    id: string
    name: string
    categoryNo: number
    subCategories: Array<{
      id: string
      name: string
      orderNo: number
      menuImageUrl?: any
      price?: number
    }>
  }>
  Themes?: Array<{
    backgroundColor?: string
    textColor?: string
    logoAreaColor?: string
    style?: string
    facebookUrl?: string
    instagramUrl?: string
    xUrl?: string
  }>
  user?: {
    userName: string;
  };
}

export default function MenuPage() {
  const params = useParams()
  const companyId = params.companyId as string
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showWelcoming, setShowWelcoming] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)
  const [pdfDisplayMode, setPdfDisplayMode] = useState('flipbook')

  useEffect(() => {
    if (companyId) {
      fetchCompanyData()
    }
  }, [companyId])

  useEffect(() => {
    // Load PDF display mode from URL parameter (QR code) or localStorage (fallback)
    const urlParams = new URLSearchParams(window.location.search)
    const modeFromUrl = urlParams.get('mode')
    
    if (modeFromUrl && (modeFromUrl === 'scroll' || modeFromUrl === 'flipbook')) {
      setPdfDisplayMode(modeFromUrl)
    } else {
      // Fallback to localStorage for direct access
      const savedDisplayMode = localStorage.getItem('pdfDisplayMode')
      if (savedDisplayMode && (savedDisplayMode === 'scroll' || savedDisplayMode === 'flipbook')) {
        setPdfDisplayMode(savedDisplayMode)
      }
    }
  }, [])

  // Remove dashboard-mode class from body to prevent background image
  useEffect(() => {
    document.body.classList.remove('dashboard-mode', 'bubble-bg')
    
    return () => {
      // Restore classes when component unmounts
      document.body.classList.add('dashboard-mode', 'bubble-bg')
    }
  }, [])

  useEffect(() => {
    if (company && company.Welcoming_Page && !loading) {
      setShowWelcoming(true)
      
      const fadeTimer = setTimeout(() => {
        setFadeOut(true)
      }, 2500) // 2.5 saniye sonra fade başlat

      const hideTimer = setTimeout(() => {
        setShowWelcoming(false)
      }, 3000) // 3 saniye sonra gizle

      return () => {
        clearTimeout(fadeTimer)
        clearTimeout(hideTimer)
      }
    }
  }, [company, loading])

  const fetchCompanyData = async () => {
    try {
      const res = await fetch(`/api/QR_Panel/menu/${companyId}`)
      
      if (!res.ok) {
        throw new Error('Menu not found')
      }
      
      const data = await res.json()
      setCompany(data.company)
    } catch (err: any) {
      setError(err.message || 'Failed to load menu')
      console.error('Menu fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="text-4xl mb-4">😞</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Menu Not Found</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="text-4xl mb-4">❓</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">No Menu Available</h1>
          <p className="text-gray-600">This restaurant hasn't set up their menu yet.</p>
        </div>
      </div>
    )
  }

  // Tema seçimi - kullanıcının ayarladığı tema öncelikli
  const userTheme = company.Themes?.[0]
  
  // Eğer kullanıcı tema ayarlamışsa onu kullan, yoksa display mode'a göre default tema
  const theme = userTheme ? {
    backgroundColor: userTheme.backgroundColor || '#ffffff',
    textColor: userTheme.textColor || '#000000',
    logoAreaColor: userTheme.logoAreaColor || '#f8f9fa',
    style: userTheme.style || 'modern',
    facebookUrl: userTheme.facebookUrl || '',
    instagramUrl: userTheme.instagramUrl || '',
    xUrl: userTheme.xUrl || ''
  } : {
    // Default tema - display mode'a göre
    ...(company.menuType === 'pdf' && pdfDisplayMode === 'scroll' ? {
      // Scroll modu için sakin/minimal tema
      backgroundColor: '#f8fafc',
      textColor: '#1e293b',
      logoAreaColor: '#e2e8f0',
      style: 'minimal',
      facebookUrl: '',
      instagramUrl: '',
      xUrl: ''
    } : company.menuType === 'pdf' ? {
      // Flipbook modu için warm/elegant tema
      backgroundColor: '#fef7ed',
      textColor: '#92400e',
      logoAreaColor: '#fed7aa',
      style: 'elegant',
      facebookUrl: '',
      instagramUrl: '',
      xUrl: ''
    } : {
      // Manual menu için default tema
      backgroundColor: '#ffffff',
      textColor: '#000000',
      logoAreaColor: '#f8f9fa',
      style: 'modern',
      facebookUrl: '',
      instagramUrl: '',
      xUrl: ''
    })
  }

  const restaurantName = company.C_Name || company.user?.userName ? `${company.user?.userName}'s Restaurant` : 'Restaurant Menu';

  // Get effective menu type - URL parameter overrides company setting
  const getEffectiveMenuType = () => {
    const urlParams = new URLSearchParams(window.location.search)
    const typeFromUrl = urlParams.get('type')
    
    if (typeFromUrl && (typeFromUrl === 'pdf' || typeFromUrl === 'manual')) {
      return typeFromUrl
    }
    
    return company.menuType || 'none'
  }

  // Welcoming screen - 3 saniye tam ekran
  if (company && company.Welcoming_Page && showWelcoming) {
    return (
      <div 
        className={`fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat flex items-center justify-center z-50 transition-opacity duration-500 cursor-pointer ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
        style={{
          backgroundImage: `url(/api/AdminPanel/company/image/${company.id}/welcoming)`,
          backgroundColor: theme.backgroundColor
        }}
        onClick={() => {
          setFadeOut(true)
          setTimeout(() => setShowWelcoming(false), 300)
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <div className="text-center text-white">
            {company.C_Logo_Image && (
              <div className="mb-6">
                <img 
                  src={`/api/AdminPanel/company/image/${company.id}/logo`}
                  alt="Company Logo"
                  className="max-w-32 max-h-32 mx-auto rounded-lg shadow-lg"
                />
              </div>
            )}
            <h1 className="text-5xl md:text-7xl font-bold mb-4 text-shadow-lg">
              {restaurantName}
            </h1>
            <p className="text-xl md:text-2xl opacity-90">
              Welcome
            </p>
                         <div className="mt-8">
               <div className="inline-flex items-center space-x-3">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                 <span className="text-lg font-medium text-gray-600">Loading menu...</span>
               </div>
               <p className="text-sm opacity-75 mt-4 animate-pulse">
                 Click to skip
               </p>
             </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className={`min-h-screen transition-opacity duration-500 ${(showWelcoming || loading) ? 'opacity-0' : 'opacity-100'}`}
      style={{ 
        backgroundColor: theme.backgroundColor,
        color: theme.textColor 
      }}
    >
      {/* Header */}
      <header 
        className="py-2 px-4 text-center bg-opacity-90 backdrop-blur-sm border-b"
        style={{ 
          backgroundColor: theme.logoAreaColor,
          borderBottomColor: theme.textColor + '20' // 20% opacity
        }}
      >
        <div className="max-w-4xl mx-auto">
          {/* Company Logo */}
          {company.C_Logo_Image && (
            <div className="mb-1">
              <img 
                src={`/api/AdminPanel/company/image/${company.id}/logo`}
                alt="Company Logo"
                className="max-w-16 max-h-16 mx-auto rounded-lg shadow-lg"
              />
            </div>
          )}
          
          <h1 
            className="text-2xl font-bold"
            style={{ color: theme.textColor }}
          >
            {restaurantName}
          </h1>
        </div>
      </header>

      <div className={`mx-auto ${getEffectiveMenuType() === 'pdf' ? 'max-w-none p-0 min-h-screen' : 'max-w-4xl px-4'}`}>
        {getEffectiveMenuType() === 'pdf' && company.pdfMenuUrl ? (
          <div 
            className={`w-full min-h-[85vh] flex items-center justify-center transition-all duration-500 ${
              pdfDisplayMode === 'scroll' 
                ? 'bg-slate-50 border-t border-slate-200' 
                : 'bg-orange-50 border-t border-orange-200'
            }`}
          >
            <PDFViewer 
              pdfUrl={`/api/AdminPanel/company/pdf/${company.id}?t=${Date.now()}`}
              displayMode={pdfDisplayMode}
              theme={theme}
            />
          </div>
        ) : getEffectiveMenuType() === 'manual' && company.Main_Categories ? (
          <ManualMenu categories={company.Main_Categories} theme={theme} />
        ) : (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🍽️</div>
            <h2 
              className="text-2xl font-bold mb-4"
              style={{ color: theme.textColor }}
            >
              Menu Coming Soon
            </h2>
            <p 
              className="text-lg opacity-80"
              style={{ color: theme.textColor }}
            >
              This restaurant is still setting up their menu. Please check back later!
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer 
        className="text-center py-1 px-4 border-t mt-1"
        style={{ 
          backgroundColor: theme.logoAreaColor,
          borderTopColor: theme.textColor + '20' // 20% opacity
        }}
      >
        {/* Social Media Links */}
        {(theme.facebookUrl || theme.instagramUrl || theme.xUrl) && (
          <div className="mb-1">
            <h3 
              className="text-xs font-medium mb-1 opacity-80"
              style={{ color: theme.textColor }}
            >
              Follow Us
            </h3>
            <div className="flex justify-center space-x-2">
              {theme.facebookUrl && (
                <a
                  href={theme.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-all duration-300 hover:scale-110 shadow-sm"
                  title="Facebook"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              )}
              
              {theme.instagramUrl && (
                <a
                  href={theme.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full transition-all duration-300 hover:scale-110 shadow-sm"
                  title="Instagram"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              )}
              
              {theme.xUrl && (
                <a
                  href={theme.xUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-8 h-8 bg-black hover:bg-gray-800 text-white rounded-full transition-all duration-300 hover:scale-110 shadow-sm"
                  title="X (Twitter)"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              )}
            </div>
          </div>
        )}
        
        <p 
          className="text-xs opacity-60 leading-tight"
          style={{ color: theme.textColor }}
        >
          Powered by QR Menu System
        </p>
      </footer>
    </div>
  )
}

// Flipbook PDF Viewer Component
function PDFFlipbook({ pdfUrl, theme }: { pdfUrl: string; theme: any }) {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [dimensions, setDimensions] = useState({ width: 800, height: 1200 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Responsive boyutlandırma
  useEffect(() => {
    const updateDimensions = () => {
      if (!containerRef.current) return;
      
      const container = containerRef.current;
      const screenWidth = window.innerWidth;
      const containerWidth = container.clientWidth;
      const containerHeight = window.innerHeight * 0.95;
      
      // Aspect ratio - A4 page ratio (1:√2)
      const aspectRatio = 1 / Math.sqrt(2); // Approximately 0.707
      
      // Initial size based on container width
      let targetWidth = containerWidth * (
        screenWidth >= 1024 ? 0.95 : // Desktop - büyütüldü
        screenWidth >= 768 ? 0.98 :  // Tablet - büyütüldü
        0.98                         // Mobile - büyütüldü
      );
      
      let targetHeight = containerHeight * 0.98; // Daha az margin
      
      // Calculate dimensions while maintaining aspect ratio
      let newWidth = Math.min(targetWidth, targetHeight * aspectRatio);
      let newHeight = Math.min(targetHeight, targetWidth / aspectRatio);
      
      // Ensure minimum dimensions
      newWidth = Math.max(newWidth, 400); // min width - büyütüldü
      newHeight = Math.max(newHeight, 500); // min height - büyütüldü
      
      setDimensions({
        width: Math.round(newWidth), // Required by HTMLFlipBook component
        height: Math.round(newHeight) // Required by HTMLFlipBook component
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // PDF'i yükle ve sayfalara dönüştür
  useEffect(() => {
    let cancelled = false;
    const renderPDF = async () => {
      setLoading(true);
      try {
        const pdfjsLib = (window as any).pdfjsLib;
        if (!pdfjsLib) {
          console.error('pdfjsLib global not found');
          setLoading(false);
          return;
        }

        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;

        const imgs: string[] = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 4 }); // Higher scale for better quality
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          
          if (!context) {
            console.error('Canvas context creation failed');
            continue;
          }
          
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          
          try {
            await page.render({
              canvasContext: context,
              viewport: viewport,
              intent: 'print' // Better quality for text
            }).promise;
            
            imgs.push(canvas.toDataURL('image/jpeg', 0.85)); // Better compression ratio
          } catch (err) {
            console.error(`Failed to render page ${i}:`, err);
          }
        }

        if (!cancelled) {
          setImages(imgs);
          setLoading(false);
        }
      } catch (err) {
        console.error('Flipbook render error:', err);
        if (!cancelled) setLoading(false);
      }
    };
    renderPDF();
    return () => { cancelled = true; };
  }, [pdfUrl]);

  if (loading) {
    return (
      <div 
        className="flex justify-center items-center min-h-screen"
        style={{ 
          backgroundColor: theme?.backgroundColor || '#fef7ed',
          background: `linear-gradient(135deg, ${theme?.backgroundColor || '#fef7ed'}, ${theme?.logoAreaColor || '#fed7aa'})`
        }}
      >
        <div className="text-center">
          <div 
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
            style={{ borderColor: theme?.logoAreaColor || '#92400e' }}
          ></div>
          <span 
            className="text-lg font-medium"
            style={{ color: theme?.textColor || '#92400e' }}
          >
            Loading menu...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="flex justify-center items-center w-full min-h-screen py-2"
      style={{ 
        backgroundColor: theme?.backgroundColor || '#fef7ed',
        background: `linear-gradient(135deg, ${theme?.backgroundColor || '#fef7ed'}, ${theme?.logoAreaColor || '#fed7aa'})`
      }}
    >
      <div ref={containerRef} className="w-full max-w-full mx-auto px-1">
        <div className="relative flex justify-center items-center">
          <div 
            className="relative rounded-lg shadow-2xl p-2 border" 
            style={{ 
              backgroundColor: 'white',
              borderColor: theme?.logoAreaColor || '#fed7aa'
            }}
          >
            <HTMLFlipBook
              width={dimensions.width}
              height={dimensions.height}
              size="stretch"
              minWidth={400}
              maxWidth={1800}
              minHeight={500}
              maxHeight={2200}
              showCover={true}
              drawShadow={true}
              flippingTime={800}
              usePortrait={true}
              startPage={0}
              useMouseEvents={true}
              disableFlipByClick={false}
              mobileScrollSupport={true}
              clickEventForward={false}
              showPageCorners={true}
              swipeDistance={30}
              maxShadowOpacity={0.4}
              startZIndex={20}
              autoSize={true}
              style={{ 
                margin: '0 auto',
                borderRadius: '8px',
                overflow: 'hidden'
              }}
              className="mx-auto"
            >
              {images.map((src, idx) => (
                <div key={idx} className="bg-white flex items-center justify-center h-full overflow-hidden">
                  <div className="relative w-full h-full">
                    <img 
                      src={src} 
                      alt={`Page ${idx + 1}`} 
                      className="w-full h-full object-contain select-none"
                      draggable="false"
                      loading={idx < 2 ? "eager" : "lazy"}
                      style={{ 
                        imageRendering: 'auto',
                        WebkitUserSelect: 'none',
                        userSelect: 'none'
                      }}
                    />
                  </div>
                </div>
              ))}
            </HTMLFlipBook>
          </div>
        </div>
      </div>
    </div>
  );
}

// Scroll PDF Viewer Component
function ScrollPDFViewer({ pdfUrl, theme }: { pdfUrl: string; theme: any }) {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const renderPDF = async () => {
      setLoading(true);
      try {
        const pdfjsLib: any = (window as any).pdfjsLib;
        if (!pdfjsLib) {
          console.error('pdfjsLib global not found');
          setLoading(false);
          return;
        }

        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;

        const imgs: string[] = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          // Optimal kalite için uygun scale
          const viewport = page.getViewport({ scale: 5 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          await page.render({ canvasContext: context!, viewport }).promise;
          imgs.push(canvas.toDataURL());
        }

        if (!cancelled) {
          setImages(imgs);
          setLoading(false);
        }
      } catch (err) {
        console.error('Scroll PDF render error:', err);
        if (!cancelled) setLoading(false);
      }
    };
    renderPDF();
    return () => { cancelled = true; };
  }, [pdfUrl]);

  if (loading) {
    return (
      <div 
        className="text-center py-12 min-h-screen flex items-center justify-center"
        style={{ backgroundColor: theme?.backgroundColor || '#f8fafc' }}
      >
        <div className="inline-flex items-center space-x-3">
          <div 
            className="animate-spin rounded-full h-8 w-8 border-b-2"
            style={{ borderColor: theme?.logoAreaColor || '#1e293b' }}
          ></div>
          <span 
            className="text-lg font-medium"
            style={{ color: theme?.textColor || '#1e293b' }}
          >
            Loading menu...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="w-full max-w-4xl mx-auto px-4 py-6 space-y-4 overflow-auto"
      style={{ 
        blockSize: `${Math.max(window.innerHeight - 120, 600)}px`,
        backgroundColor: theme?.backgroundColor || '#f8fafc'
      }}
    >
      {images.map((src, idx) => (
        <div key={idx} className="w-full flex justify-center">
          <img 
            src={src} 
            alt={`Page ${idx + 1}`} 
            className="max-w-full h-auto shadow-lg rounded-lg border"
            style={{ 
              blockSize: 'max(95vh)',
              borderColor: theme?.logoAreaColor || '#e2e8f0'
            }}
          />
        </div>
      ))}
    </div>
  );
}

// PDFViewer fonksiyonu:
function PDFViewer({ pdfUrl, displayMode, theme }: { pdfUrl: string; displayMode: string; theme: any }) {
  if (displayMode === 'scroll') {
    return <ScrollPDFViewer pdfUrl={pdfUrl} theme={theme} />;
  }
  return <PDFFlipbook pdfUrl={pdfUrl} theme={theme} />;
}

// Manual Menu Component
function ManualMenu({ 
  categories, 
  theme 
}: { 
  categories: Company['Main_Categories']
  theme: { backgroundColor?: string; textColor?: string; logoAreaColor?: string; style?: string }
}) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const sortedCategories = [...(categories || [])].sort((a, b) => a.categoryNo - b.categoryNo)

  // Show first category by default
  useEffect(() => {
    if (sortedCategories.length > 0 && !selectedCategory) {
      setSelectedCategory(sortedCategories[0].id)
    }
  }, [sortedCategories, selectedCategory])

  const getCurrentCategory = () => {
    return sortedCategories.find(cat => cat.id === selectedCategory) || sortedCategories[0]
  }

  const currentCategory = getCurrentCategory()

  if (sortedCategories.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">📝</div>
        <h2 className="text-2xl font-bold mb-2">No Categories Yet</h2>
        <p className="opacity-70">The menu is being prepared.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Category Selection Tabs */}
      <div className="sticky top-0 z-10 bg-white bg-opacity-95 backdrop-blur-sm border-b border-gray-200 py-4 mb-6 rounded-full">
        <div className="flex overflow-x-auto scrollbar-hide space-x-2 px-4">
          {sortedCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex-shrink-0 px-6 py-3 rounded-full font-medium text-sm transition-all ${
                selectedCategory === category.id
                  ? 'bg-black text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Category Content */}
      {currentCategory && (
        <div className="px-4 pb-8">
    {/* Category Header */}
    <div className="text-center mb-8">
      <h1
        className="text-3xl font-bold mb-2"
        style={{ color: theme?.textColor || '#1f2937' }} 
      >
        {currentCategory.name}
      </h1>
      <div className="w-20 h-1 bg-black mx-auto rounded"></div>
    </div>

          {/* Items Grid */}
          {currentCategory.subCategories && currentCategory.subCategories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...currentCategory.subCategories]
                .sort((a, b) => a.orderNo - b.orderNo)
                .map((item) => (
                  <div 
                    key={item.id}
                    className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group hover:-translate-y-1"
                  >
                    {/* Product Image */}
                    <div className="aspect-square w-full bg-gray-100 overflow-hidden">
                      {item.menuImageUrl ? (
                        <img 
                          src={`/api/QR_Panel/user/manual-menu/image/${item.id}`}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                          <div className="text-gray-400 text-center">
                            <div className="text-4xl mb-2">🍽️</div>
                            <div className="text-sm">No Image</div>
                          </div>
                        </div>
                      )}
                    </div>

                                         {/* Product Info */}
                     <div className="p-4">
                       <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2">
                         {item.name}
                       </h3>
                       
                       {/* Price and availability */}
                       <div className="flex items-center justify-between">
                         {item.price ? (
                           <span className="text-lg font-bold text-green-600">
                             ₺{item.price.toFixed(2)}
                           </span>
                         ) : (
                           <span className="text-sm text-gray-500">Price not set</span>
                         )}
                         <div className="w-3 h-3 bg-green-500 rounded-full" title="Available"></div>
                       </div>
                     </div>
                  </div>
                ))
              }
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🍽️</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Items Yet</h3>
              <p className="text-gray-500">Items will appear here once they are added to this category.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
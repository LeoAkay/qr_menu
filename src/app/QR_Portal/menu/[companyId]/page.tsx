'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import HTMLFlipBook from 'react-pageflip';

interface Company {
  id: string
  C_Name: string
  C_Logo_Image?: any
  Welcoming_Page?: any
  pdfMenuFile?: any
  menuType?: string

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
                  src={`/api/AdminPAnel/company/image/${company.id}/logo`}
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
               <div className="inline-flex items-center space-x-2 text-lg">
                 <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                 <span>Loading menu...</span>
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
      <header className="py-2 px-4 text-center border-b bg-opacity-90 backdrop-blur-sm">
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
          
          <h1 className="text-2xl font-bold">
            {restaurantName}
          </h1>
        </div>
      </header>

      <div className={`mx-auto ${company.menuType === 'pdf' ? 'max-w-none p-0 min-h-screen' : 'max-w-4xl px-4'}`}>
        {company.menuType === 'pdf' && company.pdfMenuFile ? (
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
            />
          </div>
        ) : company.menuType === 'manual' && company.Main_Categories ? (
          <ManualMenu categories={company.Main_Categories} theme={theme} />
        ) : (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🍽️</div>
            <h2 className="text-2xl font-bold mb-4">Menu Coming Soon</h2>
            <p className="text-lg opacity-80">
              This restaurant is still setting up their menu. Please check back later!
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="text-center py-1 px-4 border-t mt-1">
        {/* Social Media Links */}
        {(theme.facebookUrl || theme.instagramUrl || theme.xUrl) && (
          <div className="mb-1">
            <h3 className="text-xs font-medium mb-1 opacity-80">Bizi Takip Edin</h3>
            <div className="flex justify-center space-x-2">
              {theme.facebookUrl && (
                <a
                  href={theme.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-6 h-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-all duration-300 hover:scale-110 shadow-sm"
                  title="Facebook"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              )}
              
              {theme.instagramUrl && (
                <a
                  href={theme.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full transition-all duration-300 hover:scale-110 shadow-sm"
                  title="Instagram"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              )}
              
              {theme.xUrl && (
                <a
                  href={theme.xUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-6 h-6 bg-black hover:bg-gray-800 text-white rounded-full transition-all duration-300 hover:scale-110 shadow-sm"
                  title="X (Twitter)"
                >
                  <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              )}
            </div>
          </div>
        )}
        
        <p className="text-xs opacity-60 leading-tight">
          Powered by QR Menu System
        </p>
      </footer>
    </div>
  )
}

// Flipbook PDF Viewer Component (Next.js uyumlu, workerSrc elle ayarlı)
function PDFFlipbook({ pdfUrl }: { pdfUrl: string }) {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [dimensions, setDimensions] = useState({ width: 800, height: 1000 });

  useEffect(() => {
    // Responsive boyutlar ayarla - tam ekran boyutlar
    const updateDimensions = () => {
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      
      // Optimal boyutlar - büyük ama uygun
      if (screenWidth >= 1024) {
        // Desktop - optimal boyut
        setDimensions({ 
          width: 1200, 
          height: 1500
        });
      } else if (screenWidth >= 768) {
        // Tablet - optimal boyut
        setDimensions({ 
          width: 900, 
          height: 1200
        });
      } else {
        // Mobile - optimal boyut
        setDimensions({ 
          width: 550, 
          height: 800
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const renderPDF = async () => {
      setLoading(true);
      try {
        // pdfjs globali layout.tsx ile yüklendi
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
          // Yüksek kalite - büyük boyut
          const viewport = page.getViewport({ scale: 6 });
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
        console.error('Flipbook render error:', err);
        if (!cancelled) setLoading(false);
      }
    };
    renderPDF();
    return () => { cancelled = true; };
  }, [pdfUrl]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="text-lg font-medium text-gray-600">Loading menu...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center w-full overflow-hidden">
      <div className="w-full" style={{ transform: 'scale(1.15)', transformOrigin: 'center' }}>
        <HTMLFlipBook
          width={dimensions.width}
          height={dimensions.height}
          minWidth={400}
          maxWidth={1800}
          minHeight={500}
          maxHeight={2200}
          showCover={true}
          className="shadow-2xl rounded-lg mx-auto"
          style={{ margin: '0 auto', minWidth: '90%', minHeight: '80vh' }}
          size="stretch"
          drawShadow={true}
          flippingTime={800}
          useMouseEvents={true}
          usePortrait={true}
          startPage={0}
          disableFlipByClick={false}
          startZIndex={0}
          autoSize={true}
          maxShadowOpacity={0.6}
          mobileScrollSupport={true}
          clickEventForward={true}
          showPageCorners={true}
          swipeDistance={50}
        >
          {images.map((src, idx) => (
            <div key={idx} className="bg-white flex items-center justify-center h-full overflow-hidden">
              <img 
                src={src} 
                alt={`Page ${idx + 1}`} 
                className="w-full h-full object-contain"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
          ))}
        </HTMLFlipBook>
      </div>
    </div>
  );
}

// Scroll PDF Viewer Component
function ScrollPDFViewer({ pdfUrl }: { pdfUrl: string }) {
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
      <div className="text-center py-12">
        <div className="inline-flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="text-lg font-medium text-gray-600">Loading menu...</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="w-full max-w-4xl mx-auto px-4 py-6 space-y-4"
      style={{ 
        height: `${Math.max(window.innerHeight - 120, 600)}px`,
        overflow: 'auto'
      }}
    >
      {images.map((src, idx) => (
        <div key={idx} className="w-full flex justify-center">
          <img 
            src={src} 
            alt={`Page ${idx + 1}`} 
            className="max-w-full h-auto shadow-lg rounded-lg border border-gray-200"
            style={{ maxHeight: '95vh' }}
          />
        </div>
      ))}
    </div>
  );
}

// PDFViewer fonksiyonu:
function PDFViewer({ pdfUrl, displayMode }: { pdfUrl: string; displayMode: string }) {
  if (displayMode === 'scroll') {
    return <ScrollPDFViewer pdfUrl={pdfUrl} />;
  }
  return <PDFFlipbook pdfUrl={pdfUrl} />;
}

// Manual Menu Component
function ManualMenu({ 
  categories, 
  theme 
}: { 
  categories: Company['Main_Categories']
  theme: { backgroundColor?: string; textColor?: string; logoAreaColor?: string; style?: string }
}) {
  const sortedCategories = [...(categories || [])].sort((a, b) => a.categoryNo - b.categoryNo)

  return (
    <div className="space-y-8">
      {sortedCategories.map((category) => (
        <div key={category.id} className="bg-white bg-opacity-10 rounded-lg p-6 backdrop-blur-sm">
          <h2 className="text-3xl font-bold mb-6 text-center border-b pb-4">
            {category.name}
          </h2>
          
          {category.subCategories && category.subCategories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...category.subCategories]
                .sort((a, b) => a.orderNo - b.orderNo)
                .map((subCategory) => (
                  <div 
                    key={subCategory.id}
                    className="bg-white bg-opacity-20 rounded-lg p-4 hover:bg-opacity-30 transition-all"
                  >
                    <h3 className="text-lg font-semibold">
                      {subCategory.name}
                    </h3>
                  </div>
                ))
              }
            </div>
          ) : (
            <p className="text-center opacity-70">
              No items in this category yet.
            </p>
          )}
        </div>
      ))}
      
      {sortedCategories.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📝</div>
          <h2 className="text-2xl font-bold mb-2">No Categories Yet</h2>
          <p className="opacity-70">The menu is being prepared.</p>
        </div>
      )}
    </div>
  )
} 
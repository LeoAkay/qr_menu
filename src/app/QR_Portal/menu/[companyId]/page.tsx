'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import HTMLFlipBook from 'react-pageflip';
import { ToastContainer, toast } from 'react-toastify';
import Confetti from 'react-confetti';
import { useI18n } from '../../../i18n/I18nContext'
import { Globe } from 'lucide-react'

// Utility function to format prices with thousand separators
const formatPrice = (price: number): string => {
  return price.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

interface Company {
  id: string
  C_Name: string
  C_Logo_Image?: string | null
  Welcoming_Page?: string | null
  pdfMenuUrl?: string | null
  menuType?: string
  orderSystem?: boolean

  Main_Categories?: Array<{
    id: string
    name: string
    categoryNo: number
    subCategories: Array<{
      id: string
      name: string
      orderNo: number
      menuImageUrl?: string | null
      price?: number
      description?: string
      stock: boolean
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

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
}

export default function MenuPage() {
  const { t, locale, setLocale } = useI18n()
  const params = useParams()
  const companyId = params.companyId as string
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showWelcoming, setShowWelcoming] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)
  const [pdfDisplayMode, setPdfDisplayMode] = useState('flipbook')
  
  // Shopping cart state
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCart, setShowCart] = useState(false)
  const [selectedItem, setSelectedItem] = useState<{id: string, quantity: number} | null>(null)
  const [tableNumber, setTableNumber] = useState('')
  const [orderRequest, setOrderRequest] = useState('')

  // Confirmation dialog states
  const [showAddToCartConfirm, setShowAddToCartConfirm] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [showClearCartConfirm, setShowClearCartConfirm] = useState(false)
  const [showOrderConfirm, setShowOrderConfirm] = useState(false)
  const [showRemoveItemConfirm, setShowRemoveItemConfirm] = useState(false)
  const [showFinalOrderConfirm, setShowFinalOrderConfirm] = useState(false)
  const [pendingAction, setPendingAction] = useState<{
    type: 'addToCart' | 'cancel' | 'clearCart' | 'order' | 'removeItem' | 'finalOrder'
    data?: {
      item?: { id: string; name: string; price: number; image?: string }
      quantity?: number
      itemId?: string
      itemName?: string
    }
  } | null>(null)

  // Font mapping function
  const getFontFamily = (style: string) => {
    switch (style) {
      case 'modern':
        return "'Inter', 'Segoe UI', 'Roboto', sans-serif"
      case 'classic':
        return "'Times New Roman', 'Georgia', serif"
      case 'elegant':
        return "'Playfair Display', 'Crimson Text', serif"
      default:
        return "'Inter', 'Segoe UI', 'Roboto', sans-serif"
    }
  }

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
        throw new Error(t('menu.error.menuNotFound'))
      }
      
      const data = await res.json()
      setCompany(data.company)
    } catch (err: any) {
      setError(err.message || t('menu.error.failedToLoad'))
      console.error('Menu fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Shopping cart functions
  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const getCartItemQuantity = (itemId: string) => {
    const cartItem = cart.find(item => item.id === itemId)
    return cartItem ? cartItem.quantity : 0
  }

  const addToCart = (item: { id: string, name: string, price: number, image?: string }, quantity: number) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id)
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        )
      } else {
        return [...prevCart, { ...item, quantity }]
      }
    })
    setSelectedItem(null)
  }

  const updateCartItemQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(prevCart => prevCart.filter(item => item.id !== id))
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.id === id ? { ...item, quantity } : item
        )
      )
    }
  }

  const clearCart = () => {
    setCart([])
    setShowCart(false)
    setTableNumber('')
    setOrderRequest('')
  }

  // Confirmation dialog functions
  const handleAddToCartConfirm = (itemData: any) => {
    setPendingAction({ type: 'addToCart', data: itemData })
    setShowAddToCartConfirm(true)
  }

  const handleCancelConfirm = () => {
    setPendingAction({ type: 'cancel' })
    setShowCancelConfirm(true)
  }

  const handleClearCartConfirm = () => {
    setPendingAction({ type: 'clearCart' })
    setShowClearCartConfirm(true)
  }

  const handleFinalOrderConfirm = () => {
    if (!tableNumber.trim()) {
      toast.warn(t('menu.error.enterTableNumber'))
      return(<ToastContainer/>)
    }
    setPendingAction({ type: 'finalOrder' })
    setShowFinalOrderConfirm(true)
  }

  const handleRemoveItemConfirm = (itemId: string, itemName: string) => {
    setPendingAction({ type: 'removeItem', data: { itemId, itemName } })
    setShowRemoveItemConfirm(true)
  }

  const executePendingAction = () => {
    if (!pendingAction) return

    switch (pendingAction.type) {
      case 'addToCart':
        if (pendingAction.data?.item && pendingAction.data?.quantity) {
          addToCart(pendingAction.data.item, pendingAction.data.quantity)
        }
        break
      case 'cancel':
        setSelectedItem(null)
        break
      case 'clearCart':
        clearCart()
        break
      case 'order':
        placeOrder()
        break
      case 'finalOrder':
        placeOrder()
        break
      case 'removeItem':
        if (pendingAction.data?.itemId) {
          updateCartItemQuantity(pendingAction.data.itemId, 0)
        }
        break
    }

    // Reset confirmation states
    setShowAddToCartConfirm(false)
    setShowCancelConfirm(false)
    setShowClearCartConfirm(false)
    setShowOrderConfirm(false)
    setShowRemoveItemConfirm(false)
    setShowFinalOrderConfirm(false)
    setPendingAction(null)
  }

  const cancelPendingAction = () => {
    setShowAddToCartConfirm(false)
    setShowCancelConfirm(false)
    setShowClearCartConfirm(false)
    setShowOrderConfirm(false)
    setShowRemoveItemConfirm(false)
    setShowFinalOrderConfirm(false)
    setPendingAction(null)
  }

  const placeOrder = async () => {
    try {
      const response = await fetch(`/api/QR_Panel/order/${companyId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tableNumber: parseInt(tableNumber),
          orderRequest: orderRequest.trim(),
          cart: cart.map(item => ({
            id: item.id,
            quantity: item.quantity,
            price: item.price,
          })),
          totalAmount: getTotalPrice(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(t('menu.order.success'));
        clearCart();
        setShowCart(false);
      } else {
        const error = await response.json();
        console.error('Order failed:', error);
        toast.error(t('menu.order.failed'));
      }
    } catch (err) {
      console.error('Error placing order:', err);
      toast.error(t('menu.order.error'));
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
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{t('menu.error.menuNotFoundTitle')}</h1>
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
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{t('menu.error.noMenuAvailableTitle')}</h1>
          <p className="text-gray-600">{t('menu.error.noMenuAvailableDescription')}</p>
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

  const restaurantName = company.C_Name ?? company.user?.userName ?? 'Restaurant Menu';


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
if (company && showWelcoming) {
  return (
 <div
    className={`fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center transition-opacity duration-500 ${
      fadeOut ? 'opacity-0' : 'opacity-100'
    }`}
    onClick={() => {
      setFadeOut(true)
      setTimeout(() => setShowWelcoming(false), 300)
    }}
  >
    <div
      className="relative bg-white rounded-xl overflow-hidden shadow-2xl max-w-sm w-[90%] sm:max-w-md"
      onClick={(e) => e.stopPropagation()} // prevent click-through close
    >
      {/* Close button */}
      <button
        onClick={() => {
          setFadeOut(true)
          setTimeout(() => setShowWelcoming(false), 300)
        }}
        className="absolute top-2 right-2 text-gray-600 hover:text-black bg-gray-200 hover:bg-gray-300 rounded-full w-8 h-8 flex items-center justify-center z-10"
        aria-label={t('menu.welcoming.close')}
      >
        &times;
      </button>

      {/* Welcoming image */}
        <img
          src={`/api/AdminPanel/company/image/${company.id}/welcoming?${Date.now()}`}
          alt={t('menu.welcoming.welcoming')}
          className="w-full h-auto object-cover"
        />
    </div>
  </div>
  )
}

  // Confirmation Dialog Component
  const ConfirmationDialog = ({ 
    isOpen, 
    title, 
    message, 
    confirmText, 
    cancelText, 
    onConfirm, 
    onCancel,
    confirmColor = "bg-red-500 hover:bg-red-600"
  }: {
    isOpen: boolean
    title: string
    message: string
    confirmText: string
    cancelText: string
    onConfirm: () => void
    onCancel: () => void
    confirmColor?: string
  }) => {
    if (!isOpen) return null

    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
        <div className="bg-white rounded-lg max-w-md w-full shadow-xl border border-gray-200">
          <div className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="flex space-x-3">
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors ${confirmColor}`}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className={` transition-opacity duration-500 ${(showWelcoming || loading) ? 'opacity-0' : 'opacity-100'}`}
      style={{ 
        backgroundColor: getEffectiveMenuType() === 'pdf' ? 'transparent' : theme.backgroundColor,
        color: theme.textColor,
        minHeight: getEffectiveMenuType() === 'pdf' ? '100vh' : 'auto',
        fontFamily: getFontFamily(theme.style)
      }}
    >
      {/* Header - Hidden for PDF menus */}
      {getEffectiveMenuType() !== 'pdf' && (
        <header className="py-2 px-4 text-center bg-opacity-90 backdrop-blur-sm relative">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <div className="flex-1"></div>
            <div className="flex-1 text-center">
              {/* Company Logo */}
              {company.C_Logo_Image && (
                <div className="mb-1">
                  <img 
                    src={`/api/AdminPanel/company/image/${company.id}/logo?${Date.now()}`}
                    alt={t('menu.company.logo')}
                    className="max-w-16 max-h-16 mx-auto rounded-lg shadow-lg"
                  />
                </div>
              )}
              
              <h1 className="text-sm font-bold">
                {restaurantName}
              </h1>
            </div>
            <div className="flex-1 flex justify-end">
              <button
                onClick={() => setLocale(locale === 'en' ? 'tr' : 'en')}
                className="bg-black text-white border border-gray-800 rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-800 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
                title={t('language.switch')}
              >
                <Globe className="w-4 h-4" />
                <span className="hidden sm:inline">{locale === 'en' ? 'EN' : 'TR'}</span>
              </button>
            </div>
          </div>
        </header>
      )}
      
      {/* Shopping Cart Icon - Only show if order system is enabled */}
      {company?.orderSystem && (
        <button
          onClick={() => setShowCart(true)}
          className="fixed bottom-4 right-4 z-50 bg-black text-white text-base p-3 rounded-full shadow-xl hover:bg-gray-900 transition-colors focus:outline-none focus:ring-4 focus:ring-black/50"
        >
          <div className="relative">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5A1 1 0 006.9 19H19M9 19a2 2 0 100 4 2 2 0 000-4zm8 0a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
            {getTotalItems() > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {getTotalItems()}
              </span>
            )}
          </div>
        </button>
      )}
      <div className={`mx-auto ${getEffectiveMenuType() === 'pdf' ? ' h-full max-w-none p-0' : 'max-w-4xl px-4'}`}>
        {getEffectiveMenuType() === 'pdf' && company.pdfMenuUrl ? (
          <div className="w-full h-screen flex items-center justify-center bg-transparent">
            <PDFViewer 
              pdfUrl={`/api/AdminPanel/company/pdf/${company.id}?t=${Date.now()}`}
              displayMode={pdfDisplayMode}
            />
          </div>
        ) : getEffectiveMenuType() === 'manual' && company.Main_Categories ? (
          <ManualMenu 
            categories={company.Main_Categories} 
            theme={theme}
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
            addToCart={addToCart}
            onAddToCartConfirm={handleAddToCartConfirm}
            onCancelConfirm={handleCancelConfirm}
            cart={cart}
            getCartItemQuantity={getCartItemQuantity}
            updateCartItemQuantity={updateCartItemQuantity}
            orderSystem={company.orderSystem}
          />
        ) : (
          <div className="text-center py-8 h-full">
            <div className="text-6xl mb-4">🍽️</div>
            <h2 className="text-2xl font-bold mb-4">{t('menu.comingSoon.title')}</h2>
            <p className="text-lg opacity-80">
              {t('menu.comingSoon.description')}
            </p>
          </div>
        )}
      </div>

      {/* Shopping Cart Modal - Only show if order system is enabled */}
      {showCart && company.orderSystem && (
       <div
  className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm h-full"
  style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)' }}
>
          <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold">{t('menu.cart.title')}</h2>
              <button
                onClick={() => setShowCart(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-4 max-h-96 overflow-y-auto">
              {/* Table Number Input */}
              <div className="mb-4">
                <label htmlFor="tableNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('menu.cart.tableNumber')} <span className="text-red-500">{t('menu.cart.tableNumberRequired')}</span>
                </label>
                <input
                  type="text"
                  id="tableNumber"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder={t('menu.cart.tableNumberPlaceholder')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Order Request/Notes Input */}
              <div className="mb-4">
                <label htmlFor="orderRequest" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('menu.cart.specialRequests')}
                </label>
                <textarea
                  id="orderRequest"
                  value={orderRequest}
                  onChange={(e) => setOrderRequest(e.target.value)}
                  placeholder={t('menu.cart.specialRequestsPlaceholder')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-5xl mb-4">🛒</div>
                  <p className="text-gray-500">{t('menu.cart.empty')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-gray-600">₺{formatPrice(item.price)} {t('menu.cart.each')}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            if (item.quantity === 1) {
                              handleRemoveItemConfirm(item.id, item.name)
                            } else {
                              updateCartItemQuantity(item.id, item.quantity - 1)
                            }
                          }}
                          className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                        >
                          -
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">₺{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {cart.length > 0 && (
              <div className="p-4 border-t">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-bold">{t('menu.cart.total')} ₺{formatPrice(getTotalPrice())}</span>
                  <span className="text-sm text-gray-600">{getTotalItems()} {t('menu.cart.items')}</span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleClearCartConfirm}
                    className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    {t('menu.cart.clear')}
                  </button>
                  <button
                    onClick={handleFinalOrderConfirm}
                    disabled={!tableNumber.trim()}
                    className={`flex-1 py-2 rounded-lg transition-colors ${
                      tableNumber.trim()
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {t('menu.cart.confirmOrder')}
                  </button>

                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        isOpen={showAddToCartConfirm}
        title={t('menu.dialog.addToCart.title')}
        message={t('menu.dialog.addToCart.message').replace('{quantity}', String(pendingAction?.data?.quantity || 0)).replace('{itemName}', pendingAction?.data?.item?.name || 'item')}
        confirmText={t('menu.dialog.addToCart.confirm')}
        cancelText={t('menu.dialog.addToCart.cancel')}
        onConfirm={executePendingAction}
        onCancel={cancelPendingAction}
        confirmColor="bg-green-500 hover:bg-green-600"
      />

      <ConfirmationDialog
        isOpen={showCancelConfirm}
        title={t('menu.dialog.cancelSelection.title')}
        message={t('menu.dialog.cancelSelection.message')}
        confirmText={t('menu.dialog.cancelSelection.confirm')}
        cancelText={t('menu.dialog.cancelSelection.cancel')}
        onConfirm={executePendingAction}
        onCancel={cancelPendingAction}
        confirmColor="bg-red-500 hover:bg-red-600"
      />

      <ConfirmationDialog
        isOpen={showClearCartConfirm}
        title={t('menu.dialog.clearCart.title')}
        message={t('menu.dialog.clearCart.message')}
        confirmText={t('menu.dialog.clearCart.confirm')}
        cancelText={t('menu.dialog.clearCart.cancel')}
        onConfirm={executePendingAction}
        onCancel={cancelPendingAction}
        confirmColor="bg-red-500 hover:bg-red-600"
      />

      <ConfirmationDialog
        isOpen={showOrderConfirm}
        title={t('menu.dialog.confirmOrder.title')}
        message={t('menu.dialog.confirmOrder.message').replace('{total}', String(formatPrice(getTotalPrice())))}
        confirmText={t('menu.dialog.confirmOrder.confirm')}
        cancelText={t('menu.dialog.confirmOrder.cancel')}
        onConfirm={executePendingAction}
        onCancel={cancelPendingAction}
        confirmColor="bg-green-500 hover:bg-green-600"
      />

      <ConfirmationDialog
        isOpen={showRemoveItemConfirm}
        title={t('menu.dialog.removeItem.title')}
        message={t('menu.dialog.removeItem.message').replace('{itemName}', pendingAction?.data?.itemName || 'this item')}
        confirmText={t('menu.dialog.removeItem.confirm')}
        cancelText={t('menu.dialog.removeItem.cancel')}
        onConfirm={executePendingAction}
        onCancel={cancelPendingAction}
        confirmColor="bg-red-500 hover:bg-red-600"
      />

      {/* Final Order Confirmation Dialog */}
      <div className={`fixed inset-0 z-[60] flex items-center justify-center p-4 backdrop-blur-sm ${showFinalOrderConfirm ? 'block' : 'hidden'}`}>
        <div className="bg-white rounded-lg max-w-md w-full shadow-xl border border-gray-200 max-h-[80vh] overflow-y-auto">
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">{t('menu.dialog.finalOrder.title')}</h3>
            
            {/* Table Number */}
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-blue-800">{t('menu.dialog.finalOrder.tableNumber')}</span>
                <span className="text-lg font-bold text-blue-900">{tableNumber}</span>
              </div>
            </div>

            {/* Order Items */}
            <div className="mb-4">
              <h4 className="font-semibold text-gray-800 mb-3">{t('menu.dialog.finalOrder.orderItems')}</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div className="flex-1">
                      <span className="font-medium text-gray-800">{item.name}</span>
                      <span className="text-sm text-gray-600 ml-2">x{item.quantity}</span>
                    </div>
                    <span className="font-bold text-gray-900">₺{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Special Requests */}
            {orderRequest.trim() && (
              <div className="mb-4 p-3 bg-yellow-50 rounded-lg">
                                  <div className="flex items-start space-x-2">
                    <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div>
                      <span className="font-semibold text-yellow-800">{t('menu.specialRequests.title')}</span>
                      <p className="text-sm text-yellow-700 mt-1">{orderRequest}</p>
                    </div>
                  </div>
              </div>
            )}

            {/* Total */}
            <div className="mb-6 p-3 bg-green-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-green-800">{t('menu.total.title')}</span>
                <span className="text-xl font-bold text-green-900">₺{formatPrice(getTotalPrice())}</span>
              </div>
              <div className="text-sm text-green-700 mt-1">
                {getTotalItems()} {getTotalItems() !== 1 ? t('menu.total.itemsPlural') : t('menu.total.items')}
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={cancelPendingAction}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                {t('menu.reviewOrder')}
              </button>
              <button
                onClick={executePendingAction}
                className="flex-1 px-4 py-2 text-white bg-green-500 rounded-lg hover:bg-green-600 transition-colors"
              >
                {t('menu.placeOrder')}
              </button>
            </div>
          </div>
        </div>
      </div>
       {/* Footer */}
      <footer className="text-center py-1 px-4 border-t mt-1">
        {/* Social Media Links */}
        {(theme.facebookUrl || theme.instagramUrl || theme.xUrl) && (
          <div className="mb-1">
            <h3 className="text-xs font-medium mb-1 opacity-80">{t('menu.footer.followUs')}</h3>
            <div className="flex justify-center space-x-2">
              {theme.facebookUrl && (
                <a
                  href={theme.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-all duration-300 hover:scale-110 shadow-sm"
                  title={t('menu.footer.facebook')}
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
                  title={t('menu.footer.instagram')}
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
                  title={t('menu.footer.twitter')}
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              )}
            </div>
          </div>
        )}
        
        <p className="text-xs opacity-60 leading-tight">
          {t('menu.footer.poweredBy')}
        </p>
      </footer>
    </div>
  )
}

// Flipbook PDF Viewer Component
function PDFFlipbook({ pdfUrl }: { pdfUrl: string }) {
  const { t } = useI18n()
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [dimensions, setDimensions] = useState({ width: 800, height: 1200 });
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [inputPage, setInputPage] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const flipBookRef = useRef<any>(null);

  // Responsive boyutlandırma
  useEffect(() => {
    const updateDimensions = () => {
      if (!containerRef.current) return;
      
      const container = containerRef.current;
      const screenWidth = window.innerWidth;
      const containerWidth = container.clientWidth;
      const containerHeight = window.innerHeight * 0.8;
      
      // Aspect ratio - A4 page ratio (1:√2)
      const aspectRatio = 1 / Math.sqrt(2); // Approximately 0.707
      
      // Initial size based on container width
      let targetWidth = containerWidth * (
        screenWidth >= 1024 ? 0.8 : // Desktop
        screenWidth >= 768 ? 0.9 :  // Tablet
        0.95                        // Mobile
      );
      
      let targetHeight = containerHeight * 0.9; // Keep some margin
      
      // Calculate dimensions while maintaining aspect ratio
      let newWidth = Math.min(targetWidth, targetHeight * aspectRatio);
      let newHeight = Math.min(targetHeight, targetWidth / aspectRatio);
      
      // Ensure minimum dimensions
      newWidth = Math.max(newWidth, 320); // min width
      newHeight = Math.max(newHeight, 400); // min height
      
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
          setTotalPages(imgs.length);
          setCurrentPage(0); // Reset current page when new PDF is loaded
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

  // Sayfa değiştirme fonksiyonları
  const goToPage = (pageNumber: number) => {
    if (flipBookRef.current && pageNumber >= 0 && pageNumber < totalPages) {
      try {
        flipBookRef.current.pageFlip().turnToPage(pageNumber);
        setCurrentPage(pageNumber);
      } catch (error) {
        console.error('Error turning to page:', error);
      }
    }
  };

  const nextPage = () => {
    if (flipBookRef.current && currentPage < totalPages - 1) {
      try {
        flipBookRef.current.pageFlip().flipNext();
      } catch (error) {
        console.error('Error flipping to next page:', error);
      }
    }
  };

  const prevPage = () => {
    if (flipBookRef.current && currentPage > 0) {
      try {
        flipBookRef.current.pageFlip().flipPrev();
      } catch (error) {
        console.error('Error flipping to previous page:', error);
      }
    }
  };

  const handlePageInput = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(inputPage) - 1; // Convert to 0-based index
    if (pageNum >= 0 && pageNum < totalPages) {
      goToPage(pageNum);
      setInputPage('');
    }
  };

  const onFlip = (e: any) => {
    // HTMLFlipBook returns the current page in e.data
    const newPage = e.data;
    if (typeof newPage === 'number' && newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Handle flipbook state changes
  const onChangeState = (e: any) => {
    // Additional state handling if needed
    // console.log('Flipbook state changed:', e);
  };

  const onChangeOrientation = (e: any) => {
    // Handle orientation changes
    // console.log('Flipbook orientation changed:', e);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-start items-center w-full h-full relative">

      <div ref={containerRef} className="w-full max-w-6xl ">
        <div className="relative ">
          <HTMLFlipBook
            ref={flipBookRef}
            width={dimensions.width}
            height={dimensions.height}
            size="stretch"
            minWidth={500}
            maxWidth={1600}
            minHeight={700}
            maxHeight={2000}
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
            maxShadowOpacity={0.5}
            startZIndex={20}
            autoSize={false}
            className=""
            style={{}}
            onFlip={onFlip}
            onChangeOrientation={onChangeOrientation}
            onChangeState={onChangeState}
          >
            {images.map((src, idx) => (
              <div key={idx} className="flex items-start justify-start h-full overflow-hidden">
                <div className="relative w-full h-full  items-start justify-start">
                  <img 
                    src={src} 
                    alt={`Page ${idx + 1}`} 
                    className="absolute inset-0 w-full h-full "
                    draggable="false"
                    loading={idx < 2 ? "eager" : "lazy"} // Preload first two pages
                  />
                </div>
              </div>
            ))}
          </HTMLFlipBook>
        </div>
      </div>
      {/* Floating Navigation Controls - Positioned over the menu */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-2 flex items-center justify-center space-x-2 z-30 border border-gray-200">
        {/* Previous Page Button */}
        <button
          onClick={prevPage}
          disabled={currentPage === 0}
          className={`p-2 rounded-md transition-colors ${
            currentPage === 0
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Page Input */}
        <form onSubmit={handlePageInput} className="flex items-center space-x-1">
          <span className="text-gray-600 text-xs font-medium">{t('menu.navigation.page')}</span>
          <input
            type="number"
            value={inputPage}
            onChange={e => setInputPage(e.target.value)}
            min={1}
            max={totalPages}
            placeholder={`${currentPage + 1}`}
            className="w-10 px-1 py-1 border border-gray-300 rounded text-center text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
          />
          <span className="text-gray-600 text-xs">/{totalPages}</span>
          <button
            type="submit"
            disabled={!inputPage}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              !inputPage 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {t('menu.navigation.go')}
          </button>
        </form>

        {/* Next Page Button */}
        <button
          onClick={nextPage}
          disabled={currentPage === totalPages - 1}
          className={`p-2 rounded-md transition-colors ${
            currentPage === totalPages - 1
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

    </div>
  );
}

// Scroll PDF Viewer Component
function ScrollPDFViewer({ pdfUrl }: { pdfUrl: string }) {
  const { t } = useI18n()
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [inputPage, setInputPage] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Scroll to specific page
  const scrollToPage = (pageIndex: number) => {
    if (containerRef.current && pageIndex >= 0 && pageIndex < images.length) {
      const pageElement = containerRef.current.children[pageIndex] as HTMLElement;
      if (pageElement) {
        pageElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
        setCurrentPage(pageIndex);
      }
    }
  };

  // Navigation functions
  const nextPage = () => {
    if (currentPage < images.length - 1) {
      scrollToPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      scrollToPage(currentPage - 1);
    }
  };

  const handlePageInput = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(inputPage) - 1; // Convert to 0-based index
    if (pageNum >= 0 && pageNum < images.length) {
      scrollToPage(pageNum);
      setInputPage('');
    }
  };

  // Track current page based on scroll position
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const containerHeight = container.clientHeight;
      
      // Find which page is mostly visible
      let visiblePage = 0;
      for (let i = 0; i < images.length; i++) {
        const pageElement = container.children[i] as HTMLElement;
        if (pageElement) {
          const rect = pageElement.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();
          
          // Check if page is in view
          if (rect.top <= containerRect.top + containerHeight / 2) {
            visiblePage = i;
          }
        }
      }
      setCurrentPage(visiblePage);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [images.length]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          <span className="text-lg font-medium text-gray-600">{t('menu.navigation.loadingMenu')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div 
        ref={containerRef}
        className="w-full h-full overflow-auto"
      >
        {images.map((src, idx) => (
          <div key={idx} className="w-full flex justify-center">
            <img 
              src={src} 
              alt={`Page ${idx + 1}`} 
              className="max-w-full h-auto"
            />
          </div>
        ))}
      </div>

      {/* Floating Navigation Controls - Positioned over the menu */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-2 flex items-center justify-center space-x-2 z-30 border border-gray-200">
        {/* Previous Page Button */}
        <button
          onClick={prevPage}
          disabled={currentPage === 0}
          className={`p-2 rounded-md transition-colors ${
            currentPage === 0
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Page Input */}
        <form onSubmit={handlePageInput} className="flex items-center space-x-1">
          <span className="text-gray-600 text-xs font-medium">{t('menu.navigation.page')}</span>
          <input
            type="number"
            min="1"
            max={images.length}
            value={inputPage}
            onChange={(e) => setInputPage(e.target.value)}
            placeholder={`${currentPage + 1}`}
            className="w-10 px-1 py-1 border border-gray-300 rounded text-center text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
          />
          <span className="text-gray-600 text-xs">/{images.length}</span>
          <button
            type="submit"
            disabled={!inputPage}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              !inputPage 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {t('menu.navigation.go')}
          </button>
        </form>

        {/* Next Page Button */}
        <button
          onClick={nextPage}
          disabled={currentPage === images.length - 1}
          className={`p-2 rounded-md transition-colors ${
            currentPage === images.length - 1
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
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

function useWindowSize() {
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => setSize({ width: window.innerWidth, height: window.innerHeight });

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}

function SpinWheel({ items, onAddToCart }: { 
  items: any[], 
  onAddToCart: (item: any) => void 
}) {
  const { t } = useI18n()
  const [isSpinning, setIsSpinning] = useState(false);
  const [popupItem, setPopupItem] = useState<any | null>(null);
  const { width, height } = useWindowSize(); 
  const duration = 4500; // ms
  const radius = 160;
  const degreesPerItem = 360 / items.length;

  const svgRef = useRef<SVGSVGElement | null>(null);

  // Animation refs
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const startRotationRef = useRef(0);
  const targetRotationRef = useRef(0);
  const lastTickSliceRef = useRef(-1);

  // Current rotation stored in ref (not state)
  const rotationRef = useRef(0);

  // Audio ref (preloaded)
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const finalSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg");
    if (audioRef.current) audioRef.current.volume = 0.15;
  }, []);
  useEffect(() => {
  finalSoundRef.current = new Audio("https://actions.google.com/sounds/v1/cartoon/magic_chime.ogg");
  if (finalSoundRef.current) finalSoundRef.current.volume = 0.3;
}, []);

  const playTick = () => {
    if (!audioRef.current) return;
    const tickSound = audioRef.current.cloneNode() as HTMLAudioElement;
    tickSound.volume = 0.15;
    tickSound.play().catch(() => {});
  };

  const animate = (time: number) => {
    if (!startTimeRef.current) startTimeRef.current = time;
    const elapsed = time - startTimeRef.current;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);

    const currentRotation =
      startRotationRef.current +
      (targetRotationRef.current - startRotationRef.current) * eased;

    rotationRef.current = currentRotation;

    // Update rotation directly on SVG element for smooth animation
    if (svgRef.current) {
      svgRef.current.style.transform = `rotate(${currentRotation}deg)`;
    }

    const normalizedRotation = ((currentRotation % 360) + 360) % 360;
    const pointerAngle = (360 - normalizedRotation) % 360;
    const currentSlice = Math.floor(pointerAngle / degreesPerItem);

    if (currentSlice !== lastTickSliceRef.current) {
      playTick();
      lastTickSliceRef.current = currentSlice;
    }

    if (progress < 1) {
      rafRef.current = requestAnimationFrame(animate);
    } else {
      finishSpin(currentRotation);
    }
  };

const spin = () => {
  if (isSpinning || items.length === 0) return;

  setIsSpinning(true);
  startTimeRef.current = 0;
  startRotationRef.current = rotationRef.current;

  const extraSpins = 5 * 360; // multiple full spins for effect
  const randomIndex = Math.floor(Math.random() * items.length);
  const randomOffset = degreesPerItem / 2; // center pointer on slice

  // Calculate target rotation so that the slice at randomIndex lands at pointer (0 deg)
  targetRotationRef.current =
    rotationRef.current +
    extraSpins +
    randomIndex * degreesPerItem +
    randomOffset;

  lastTickSliceRef.current = -1; // reset tick tracking

  rafRef.current = requestAnimationFrame(animate);
};

const finishSpin = (finalRotation: number) => {
  rotationRef.current = finalRotation;
  if (svgRef.current) {
    svgRef.current.style.transform = `rotate(${finalRotation}deg)`;
  }
  if (finalSoundRef.current) {
    finalSoundRef.current.currentTime = 0;
    finalSoundRef.current.play().catch(() => {});
  }

  setTimeout(() => {
    setIsSpinning(false);

    const normalizedRotation = ((finalRotation % 360) + 360) % 360;
    // pointer at 0 deg means the slice at that angle
    const winningIndex = Math.floor(normalizedRotation / degreesPerItem) % items.length;

    const winner = items[winningIndex];
    setPopupItem(winner);
  }, 300);
};


  const colors = [
    "#FF6B6B",
    "#FFD93D",
    "#6BCB77",
    "#4D96FF",
    "#FF6EC7",
    "#FF974F",
    "#6A67CE",
    "#B3D4FF",
  ];

  const [showConfetti, setShowConfetti] = useState(false);

useEffect(() => {
  if (popupItem) {
    setShowConfetti(true);
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }
}, [popupItem]);


  return (
    <>
      <div className="flex flex-col items-center gap-6 select-none">
        <div className="relative w-[320px] h-[320px]">
          <div className="absolute top-[-24px] left-1/2 -translate-x-1/2 z-20">
            <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-b-[24px] border-b-red-600 drop-shadow-lg"></div>
          </div>

          <svg
            ref={svgRef}
            width="320"
            height="320"
            viewBox="0 0 320 320"
            style={{
              transition: "none",
              transform: `rotate(${rotationRef.current}deg)`, // initial rotation
            }}
          >
            {items.map((item, i) => {
              const sliceAngle = (2 * Math.PI) / items.length;
              const startAngle = i * sliceAngle;
              const endAngle = startAngle + sliceAngle;
              const largeArc = sliceAngle > Math.PI ? 1 : 0;

              const x1 = 160 + radius * Math.cos(startAngle);
              const y1 = 160 + radius * Math.sin(startAngle);
              const x2 = 160 + radius * Math.cos(endAngle);
              const y2 = 160 + radius * Math.sin(endAngle);

              const pathData = `
                M 160 160
                L ${x1} ${y1}
                A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
                Z
              `;

              const textRadius = radius - 40;
              const textPathId = `slice-text-${i}`;
              const startX = 160 + textRadius * Math.cos(startAngle);
              const startY = 160 + textRadius * Math.sin(startAngle);
              const endX = 160 + textRadius * Math.cos(endAngle);
              const endY = 160 + textRadius * Math.sin(endAngle);

              return (
                <g key={item.id || i}>
                  <path
                    d={pathData}
                    fill={colors[i % colors.length]}
                    stroke="#fff"
                    strokeWidth="2"
                  />
                  <path
                    id={textPathId}
                    d={`
                      M ${startX} ${startY}
                      A ${textRadius} ${textRadius} 0 ${largeArc} 1 ${endX} ${endY}
                    `}
                    fill="none"
                  />
                  <text
                    fill="#fff"
                    fontSize="14"
                    fontWeight="bold"
                    textAnchor="middle"
                    style={{ pointerEvents: "none" }}
                  >
                    <textPath href={`#${textPathId}`} startOffset="50%">
                      {item.name}
                    </textPath>
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <button
          onClick={spin}
          disabled={isSpinning}
          className={`px-6 py-3 rounded-full font-semibold text-white shadow-lg transition-all ${
            isSpinning
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {isSpinning ? t('menu.wheel.spinning') : t('menu.wheel.spinForMeal')}
        </button>
      </div>

      {popupItem && (
        <>
         {showConfetti && (
  <Confetti
    width={width}
    height={height}
    numberOfPieces={200}      // Less pieces, lighter burst
    recycle={false}           // One-time burst only
    gravity={0.12}            // Lower gravity to slow fall
    initialVelocityX={{ min: -5, max: 5 }}   // Less horizontal speed
    initialVelocityY={{ min: 5, max: 15 }}   // Slower upward burst
    colors={['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff']}
    wind={0.005}              // Less horizontal drift
    style={{ position: 'fixed', top: 0, left: 0, pointerEvents: 'none', zIndex: 9999 }}
  />
)}
          <div
  className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm  bg-opacity-20"
  onClick={() => setPopupItem(null)}
>

            <div
              className="bg-white rounded-lg p-6 max-w-sm w-full flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Your popup content */}
              <img
                src={popupItem.menuImageUrl || popupItem.image || ""}
                alt={popupItem.name}
                className="w-40 h-40 object-contain mb-4"
              />
              <h2 className="text-xl font-bold mb-2 text-center">{popupItem.name}</h2>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setPopupItem(null)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  {t('menu.wheel.close')}
                </button>
                <button
                  onClick={() => {
                    onAddToCart(popupItem);
                    setPopupItem(null);
                  }}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  {t('menu.wheel.addToCart')}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

    </>
  );
}


// Manual Menu Component
function ManualMenu({ 
  categories, 
  theme,
  addToCart,
  getCartItemQuantity,
  updateCartItemQuantity,
  orderSystem
}: { 
  categories: Company['Main_Categories']
  theme: { backgroundColor?: string; textColor?: string; logoAreaColor?: string; style?: string }
  selectedItem: {id: string, quantity: number} | null
  setSelectedItem: (item: {id: string, quantity: number} | null) => void
  addToCart: (item: { id: string, name: string, price: number, image?: string }, quantity: number) => void
  onAddToCartConfirm: (item: any) => void
  onCancelConfirm: () => void
  cart: CartItem[]
  getCartItemQuantity: (itemId: string) => number
  updateCartItemQuantity: (id: string, quantity: number) => void
  orderSystem?: boolean
}) {
  const { t } = useI18n()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const sortedCategories = [...(categories || [])].sort((a, b) => a.categoryNo - b.categoryNo)
  const [showWheel, setShowWheel] = useState(false);
  const [expandedDescriptions, setExpandedDescriptions] = useState<{ [key: string]: boolean }>({});
const toggleDescription = (itemId: string) => {
  setExpandedDescriptions((prev) => ({
    ...prev,
    [itemId]: !prev[itemId],
  }));
};


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

  const handleAddToCart = (item: any) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.menuImageUrl
    }, 1)
  }

  const handleRemoveFromCart = (itemId: string) => {
    const currentQuantity = getCartItemQuantity(itemId)
    if (currentQuantity > 0) {
      updateCartItemQuantity(itemId, currentQuantity - 1)
    }
  }

  if (sortedCategories.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">📝</div>
        <h2 className="text-2xl font-bold mb-2">{t('menu.categories.noCategories')}</h2>
        <p className="opacity-70">{t('menu.categories.preparing')}</p>
      </div>
    )
  }

  return (
  <div className="">
    {/* Category Selection Tabs */}
{/* Category Selection Tabs */}
{/* Category Selection Tabs */}
<div className="bg-white bg-opacity-90 backdrop-blur-sm border border-gray-200 py-3 mb-4 mx-auto rounded-full shadow-sm overflow-hidden max-w-4xl px-4">
  <div className="overflow-x-auto no-scrollbar">
    <div className="flex gap-3 min-w-max items-center">
      {sortedCategories.map((category) => (
        <button
          key={category.id}
          onClick={() => setSelectedCategory(category.id)}
          className={`px-5 py-2 rounded-full font-medium text-sm sm:text-base whitespace-nowrap transition-all ${
            selectedCategory === category.id
              ? 'bg-black text-white shadow'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  </div>
</div>

    {/* Selected Category Content */}
    {currentCategory && (
      <div className="px-4 pb-8">
        <div className="text-center mb-8">
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: theme?.textColor || '#1f2937' }}
          >
            {currentCategory.name}
          </h1>
          <div className="w-20 h-1 bg-black mx-auto rounded"></div>
        </div>

{currentCategory.subCategories && currentCategory.subCategories.length > 0 ? (
   <>
    {/* Toggle Button */}
    <div className="text-2xl font-extrabold text-center text-white mb-4 leading-snug">
  {t('menu.wheel.cantDecide')} <br />
  <span>{t('menu.wheel.spinWheel')}</span>
</div>

<div className="flex justify-center mb-6">
  <button
    onClick={() => setShowWheel(!showWheel)}
    className="px-6 py-3 bg-black text-white text-lg font-semibold rounded-full shadow-md hover:bg-gray-800 transition-all"
  >
    {showWheel ? t('menu.wheel.showMenu') : t('menu.wheel.spinWheelButton')}
  </button>
</div>


    {/* Conditional Render */}
    {showWheel ? (
    <SpinWheel
  items={currentCategory.subCategories}
  onAddToCart={(item) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.menuImageUrl
    }, 1);
  }}
/>


    ) : (
      <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(160px,1fr))]">
        {[...currentCategory.subCategories]
          .sort((a, b) => a.orderNo - b.orderNo)
          .map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-transform duration-300 overflow-hidden group hover:-translate-y-1 flex flex-col"
              style={expandedDescriptions?.[item.id] ? { alignSelf: 'start' } : {}}
            >
              {/* 🔹 Keep your original card content exactly the same here */}
              {/* Image */}
              <div className="aspect-square w-full bg-gray-100 overflow-hidden relative">
                {item.menuImageUrl ? (
                  <img
                    src={`/api/QR_Panel/user/manual-menu/image/${item.id}`}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                    <div className="text-gray-400 text-center">
                      <div className="text-5xl mb-2">🍽️</div>
                      <div className="text-sm">{t('menu.wheel.noImage')}</div>
                    </div>
                  </div>
                )}
              </div>

          {/* Info */}
          <div className="p-4 flex flex-col flex-1">
            <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2">
              {item.name}
            </h3>

            {/* Improved Description */}
            <div className="relative">
              <div
                className={`text-sm text-gray-600 italic tracking-wide leading-snug transition-all duration-300 ease-in-out overflow-hidden ${
                  expandedDescriptions?.[item.id] ? 'max-h-[500px]' : 'max-h-[4.5rem]'
                }`}
                style={{ whiteSpace: 'pre-wrap' }}
              >
                {item.description}
              </div>

              {item.description && item.description.length > 100 && (
                <button
                  onClick={() => toggleDescription(item.id)}
                  className="text-blue-500 text-xs mt-1 font-medium hover:underline focus:outline-none"
                >
                  {expandedDescriptions?.[item.id] ? t('menu.item.showLess') : t('menu.item.readMore')}
                </button>
              )}
            </div>

            {/* Price and Cart */}
            <div className="mt-auto pt-4 border-t flex items-center justify-between">
              <div>
                {item.stock ? (
                  item.price ? (
                    <span className="text-lg font-bold text-green-600">
                      ₺{formatPrice(item.price)}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-500">{t('menu.item.priceNotSet')}</span>
                  )
                ) : (
                  <span className="text-sm font-semibold text-red-500">
                    {t('menu.item.outOfStock')}
                  </span>
                )}
              </div>
              <div
                className={`w-3 h-3 rounded-full ${
                  item.stock ? 'bg-green-500' : 'bg-red-500'
                }`}
                title={item.stock ? t('menu.item.available') : t('menu.item.outOfStock')}
              ></div>
            </div>

{item.price && item.stock && orderSystem && (
  <div className="pt-2 flex items-center justify-center gap-6">
    <button
      onClick={() => handleRemoveFromCart(item.id)}
      className="w-12 h-12 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-2xl font-bold"
      aria-label={t('menu.item.removeItem')}
    >
      –
    </button>
    <span className="text-lg font-semibold w-10 text-center">
      {getCartItemQuantity(item.id)}
    </span>
    <button
      onClick={() => handleAddToCart(item)}
      className="w-12 h-12 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-2xl font-bold"
      aria-label={t('menu.item.addItem')}
    >
      +
    </button>
  </div>
)}

          </div>
        </div>
      ))}
  </div>
    )}
  </>
) : (
  <div className="text-center py-20">
    <div className="text-6xl mb-4">🍽️</div>
    <h3 className="text-2xl font-semibold text-gray-700 mb-2">{t('menu.categories.noItemsYet')}</h3>
    <p className="text-gray-500">
      {t('menu.categories.noItemsDescription')}
    </p>
  </div>
)}
  </div>
    )}
  </div>
)
}

'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import HTMLFlipBook from 'react-pageflip';

interface Company {
  id: string
  C_Name: string
  C_Logo_Image?: any
  Welcoming_Page?: any
  pdfMenuUrl?: any
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
  const [pendingAction, setPendingAction] = useState<{
    type: 'addToCart' | 'cancel' | 'clearCart' | 'order' | 'removeItem'
    data?: any
  } | null>(null)

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

  // Shopping cart functions
  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
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

  const handleOrderConfirm = () => {
    if (!tableNumber.trim()) {
      alert('Please enter your table number before confirming the order.')
      return
    }
    setPendingAction({ type: 'order' })
    setShowOrderConfirm(true)
  }

  const handleRemoveItemConfirm = (itemId: string, itemName: string) => {
    setPendingAction({ type: 'removeItem', data: { itemId, itemName } })
    setShowRemoveItemConfirm(true)
  }

  const executePendingAction = () => {
    if (!pendingAction) return

    switch (pendingAction.type) {
      case 'addToCart':
        if (pendingAction.data) {
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
      case 'removeItem':
        if (pendingAction.data) {
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
    setPendingAction(null)
  }

  const cancelPendingAction = () => {
    setShowAddToCartConfirm(false)
    setShowCancelConfirm(false)
    setShowClearCartConfirm(false)
    setShowOrderConfirm(false)
    setShowRemoveItemConfirm(false)
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
        alert(`✅ Order confirmed!\nOrder ID: ${data.orderId}`);
        clearCart();
        setShowCart(false);
      } else {
        const error = await response.json();
        console.error('Order failed:', error);
        alert('❌ Failed to place the order. Please try again.');
      }
    } catch (err) {
      console.error('Error placing order:', err);
      alert('❌ Something went wrong. Please try again later.');
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
        aria-label="Close welcome screen"
      >
        &times;
      </button>

      {/* Welcoming image */}
        <img
          src={`/api/AdminPanel/company/image/${company.id}/welcoming?${Date.now()}`}
          alt="Welcoming"
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
        backgroundColor: theme.backgroundColor,
        color: theme.textColor 
      }}
    >
      {/* Header */}
      <header className="py-2 px-4 text-center bg-opacity-90 backdrop-blur-sm relative">
        <div className="max-w-4xl mx-auto">
          {/* Company Logo */}
          {company.C_Logo_Image && (
            <div className="mb-1">
              <img 
                src={`/api/AdminPanel/company/image/${company.id}/logo?${Date.now()}`}
                alt="Company Logo"
                className="max-w-10 max-h-10 mx-auto rounded-lg shadow-lg"
              />
            </div>
          )}
          
          <h1 className="text-sm font-bold">
            {restaurantName}
          </h1>
        </div>

        {/* Shopping Cart Icon */}
        <button
          onClick={() => setShowCart(true)}
          className="absolute top-2 right-4 bg-black text-white text-xs p-1 rounded-full shadow-lg hover:bg-gray-800 transition-colors"
        >
          <div className="relative">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5A1 1 0 006.9 19H19M9 19a2 2 0 100 4 2 2 0 000-4zm8 0a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
            {getTotalItems() > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {getTotalItems()}
              </span>
            )}
          </div>
        </button>
      </header>

      <div className={`mx-auto ${getEffectiveMenuType() === 'pdf' ? ' h-full max-w-none p-0 ' : 'max-w-4xl px-4'}`}>
        {getEffectiveMenuType() === 'pdf' && company.pdfMenuUrl ? (
          <div 
            className={`w-full h-full flex items-center justify-center transition-all duration-500 ${
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
        ) : getEffectiveMenuType() === 'manual' && company.Main_Categories ? (
          <ManualMenu 
            categories={company.Main_Categories} 
            theme={theme}
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
            addToCart={addToCart}
            onAddToCartConfirm={handleAddToCartConfirm}
            onCancelConfirm={handleCancelConfirm}
          />
        ) : (
          <div className="text-center py-8 h-full">
            <div className="text-6xl mb-4">🍽️</div>
            <h2 className="text-2xl font-bold mb-4">Menu Coming Soon</h2>
            <p className="text-lg opacity-80">
              This restaurant is still setting up their menu. Please check back later!
            </p>
          </div>
        )}
      </div>

      {/* Shopping Cart Modal */}
      {showCart && (
       <div
  className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm h-full"
  style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)' }}
>
          <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold">Shopping Cart</h2>
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
                  Table Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="tableNumber"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder="Enter your table number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Order Request/Notes Input */}
              <div className="mb-4">
                <label htmlFor="orderRequest" className="block text-sm font-medium text-gray-700 mb-2">
                  Special Requests or Notes
                </label>
                <textarea
                  id="orderRequest"
                  value={orderRequest}
                  onChange={(e) => setOrderRequest(e.target.value)}
                  placeholder="Any special requests, allergies, or additional notes..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🛒</div>
                  <p className="text-gray-500">Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-gray-600">₺{item.price.toFixed(2)} each</p>
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
                        <p className="font-bold">₺{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {cart.length > 0 && (
              <div className="p-4 border-t">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-bold">Total: ₺{getTotalPrice().toFixed(2)}</span>
                  <span className="text-sm text-gray-600">{getTotalItems()} items</span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleClearCartConfirm}
                    className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Clear Cart
                  </button>
                  <button
  onClick={async () => {
    if (!tableNumber.trim()) {
      alert('Please enter your table number before confirming the order.');
      return;
    }

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
        if (data.isNewOrder) {
          alert(`✅ Order confirmed!\nOrder ID: ${data.orderId}`);
        } else {
          alert(`✅ Items added to existing order!\nOrder ID: ${data.orderId}`);
        }
        clearCart();
        setShowCart(false);
      } else {
        const error = await response.json();
        console.error('Order failed:', error);
        alert('❌ Failed to place the order. Please try again.');
      }
    } catch (err) {
      console.error('Error placing order:', err);
      alert('❌ Something went wrong. Please try again later.');
    }
  }}
  disabled={!tableNumber.trim()}
  className={`flex-1 py-2 rounded-lg transition-colors ${
    tableNumber.trim()
      ? 'bg-green-500 text-white hover:bg-green-600'
      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
  }`}
>
  Confirm Order
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
        title="Add to Cart"
        message={`Are you sure you want to add ${pendingAction?.data?.quantity || 0} ${pendingAction?.data?.item?.name || 'item'} to your cart?`}
        confirmText="Yes, Add to Cart"
        cancelText="Cancel"
        onConfirm={executePendingAction}
        onCancel={cancelPendingAction}
        confirmColor="bg-green-500 hover:bg-green-600"
      />

      <ConfirmationDialog
        isOpen={showCancelConfirm}
        title="Cancel Selection"
        message="Are you sure you want to cancel your selection?"
        confirmText="Yes, Cancel"
        cancelText="Keep Selection"
        onConfirm={executePendingAction}
        onCancel={cancelPendingAction}
        confirmColor="bg-red-500 hover:bg-red-600"
      />

      <ConfirmationDialog
        isOpen={showClearCartConfirm}
        title="Clear Cart"
        message="Are you sure you want to clear your cart? This will remove all items and cannot be undone."
        confirmText="Clear Cart"
        cancelText="Keep Items"
        onConfirm={executePendingAction}
        onCancel={cancelPendingAction}
        confirmColor="bg-red-500 hover:bg-red-600"
      />

      <ConfirmationDialog
        isOpen={showOrderConfirm}
        title="Confirm Order"
        message={`Are you sure you want to place this order for ₺${getTotalPrice().toFixed(2)}? You cannot cancel after this confirmation. This is your final confirmation.`}
        confirmText="Yes, Place Order"
        cancelText="Review Order"
        onConfirm={executePendingAction}
        onCancel={cancelPendingAction}
        confirmColor="bg-green-500 hover:bg-green-600"
      />

      <ConfirmationDialog
        isOpen={showRemoveItemConfirm}
        title="Remove Item"
        message={`Are you sure you want to remove "${pendingAction?.data?.itemName || 'this item'}" from your cart?`}
        confirmText="Yes, Remove"
        cancelText="Keep Item"
        onConfirm={executePendingAction}
        onCancel={cancelPendingAction}
        confirmColor="bg-red-500 hover:bg-red-600"
      />

      {/* Footer */}
      <footer className="text-center py-8 px-4 border-t">
       
        
        <p className="text-xs opacity-60 leading-tight">
         
        </p>
      </footer>
    </div>
  )
}

// Flipbook PDF Viewer Component
function PDFFlipbook({ pdfUrl }: { pdfUrl: string }) {
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
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-start items-center w-full  bg-gray-100 px-1">

      <div ref={containerRef} className="w-full max-w-6xl px-1 ">
        <div className=" relative bg-white rounded-lg shadow-xl">
          <HTMLFlipBook
            width={dimensions.width}
            height={dimensions.height}
            size="stretch"
            minWidth={400}
            maxWidth={1600}
            minHeight={600}
            maxHeight={2000}
            showCover={true}
            drawShadow={true}
            flippingTime={1000}
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
            autoSize={true}
            className="shadow-2xl "
            style={{}}
          >
            {images.map((src, idx) => (
              <div key={idx} className="bg-white flex items-start justify-start h-full overflow-hidden shadow-inner">
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          <span className="text-lg font-medium text-gray-600">Loading menu...</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="w-full max-w-4xl mx-auto px-4 py-6 space-y-4 overflow-auto"
      style={{ 
        blockSize: `${Math.max(window.innerHeight - 120, 600)}px`
      }}
    >
      {images.map((src, idx) => (
        <div key={idx} className="w-full flex justify-center">
          <img 
            src={src} 
            alt={`Page ${idx + 1}`} 
            className="max-w-full h-auto shadow-lg rounded-lg border border-gray-200"
            style={{ blockSize: 'max(95vh)' }}
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
  theme,
  selectedItem,
  setSelectedItem,
  addToCart,
  onAddToCartConfirm,
  onCancelConfirm
}: { 
  categories: Company['Main_Categories']
  theme: { backgroundColor?: string; textColor?: string; logoAreaColor?: string; style?: string }
  selectedItem: {id: string, quantity: number} | null
  setSelectedItem: (item: {id: string, quantity: number} | null) => void
  addToCart: (item: { id: string, name: string, price: number, image?: string }, quantity: number) => void
  onAddToCartConfirm: (item: any) => void
  onCancelConfirm: () => void
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

  const handleQuantityChange = (itemId: string, change: number) => {
    const currentQuantity = selectedItem?.id === itemId ? selectedItem.quantity : 0
    const newQuantity = Math.max(0, currentQuantity + change)
    if (newQuantity === 0) {
      setSelectedItem(null)
    } else {
      setSelectedItem({ id: itemId, quantity: newQuantity })
    }
  }

  const handleAddToCart = (item: any) => {
    if (!selectedItem || selectedItem.id !== item.id) return
    
    onAddToCartConfirm({ item, quantity: selectedItem.quantity })
  }

  const handleCancelSelection = () => {
    onCancelConfirm()
  }

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
  <div className="">
    {/* Category Selection Tabs */}
    <div className="sticky top-0 z-10 bg-white bg-opacity-95 backdrop-blur-sm border-b border-gray-200 py-4 mb-6 rounded-full">
      <div className="flex justify-center">
        <div className="flex flex-wrap justify-center gap-2 px-4">
          {sortedCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-3 rounded-full font-medium text-sm transition-all ${
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

        {/* Items Grid */}
        {currentCategory.subCategories && currentCategory.subCategories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...currentCategory.subCategories]
              .sort((a, b) => a.orderNo - b.orderNo)
              .map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group hover:-translate-y-1 relative"
                style={{ alignSelf: 'start' }}
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
                    <div className="flex items-center justify-between mb-3">
                      {item.stock ? (
                        item.price ? (
                          <span className="text-lg font-bold text-green-600">
                            ₺{item.price.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500">Price not set</span>
                        )
                      ) : (
                        <span className="text-sm font-medium text-red-500">Out of Stock</span>
                      )}

                      <div
                        className={`w-3 h-3 rounded-full ${item.stock ? 'bg-green-500' : 'bg-red-500'}`}
                        title={item.stock ? 'Available' : 'Out of Stock'}
                      ></div>
                    </div>

                    {/* Quantity Controls */}
                    {item.price && item.stock && (
                      <div className="flex items-center justify-center space-x-3">
                        <button
                          onClick={() => handleQuantityChange(item.id, -1)}
                          className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-bold">
                          {selectedItem?.id === item.id ? selectedItem.quantity : 0}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.id, 1)}
                          className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
                        >
                          +
                        </button>
                      </div>
                    )}

                    {/* Action Buttons */}
                    {selectedItem?.id === item.id && selectedItem.quantity > 0 && item.price && (
  <div className="flex gap-x-2 mt-3 transition-all duration-300 ease-in-out opacity-100"  >
    <button
      onClick={handleCancelSelection}
      className="flex-1 bg-red-500 text-black py-2 px-3 rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
    >
     ✖️
    </button>
    <button
      onClick={() => handleAddToCart(item)}
      className="flex-1 bg-green-500 text-black py-2 px-3 rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
    >
     🛒
    </button>
  </div>
)}

                  </div>
                </div>
              ))}
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

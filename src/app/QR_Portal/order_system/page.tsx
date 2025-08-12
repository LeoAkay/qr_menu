'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { io } from 'socket.io-client'
import { toast } from 'react-toastify';


// Utility function to format prices with thousand separators
const formatPrice = (price: number): string => {
  return price.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

interface Order {
  id: string;
  tableNumber: number;
  companyId: string;
  createdAt: string;
  isActive: boolean;
  totalAmount: number;
  note?: string;
  orderItems: OrderItem[];
}

interface OrderItem {
  id: string;
  orderId: string;
  subCategoryId: string;
  quantity: number;
  paidQuantity: number;
  price: number;
  isPaid: boolean;
  subCategory?: {
    name?: string;
  };
}

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
  }
}

export default function OrderSystemPage() {
  const router = useRouter()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  // Handle clicking outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
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
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/QR_Portal/user_login')
    } finally {
      setLoading(false)
    }
  }

  const navigateToSection = (section: string) => {
    // Store the target section in localStorage so the dashboard knows where to navigate
    localStorage.setItem('targetSection', section)
    router.push('/QR_Portal/user_dashboard')
    setShowDropdown(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!userData?.company?.id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No company data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-300 to-pink-300">
      {/* Header */}
      <header className="bg-white bg-opacity-90 backdrop-blur-md shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              {/* Dropdown Menu */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  <svg 
                    className="w-6 h-6" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                
                {showDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="py-2">
                      <button
                        onClick={() => navigateToSection('preview')}
                        className="w-full text-left px-4 py-3 bg-blue-200 hover:bg-blue-300 flex items-center space-x-3 transition-colors"
                      >
                        <span className="text-2xl">🍽️</span>
                        <span className="font-medium text-gray-700">Menu</span>
                      </button>
                      
                      <button
                        onClick={() => navigateToSection('pdf')}
                        className="w-full text-left px-4 py-3 bg-green-200 hover:bg-green-300 flex items-center space-x-3 transition-colors"
                      >
                        <span className="text-2xl">📄</span>
                        <span className="font-medium text-gray-700">PDF Upload</span>
                      </button>
                      
                      <button
                        onClick={() => navigateToSection('manual')}
                        className="w-full text-left px-4 py-3 bg-yellow-200 hover:bg-yellow-300 flex items-center space-x-3 transition-colors"
                      >
                        <span className="text-2xl">⚙️</span>
                        <span className="font-medium text-gray-700">Manual Menu</span>
                      </button>
                      
                      <button
                        onClick={() => navigateToSection('theme')}
                        className="w-full text-left px-4 py-3 bg-pink-200 hover:bg-pink-300 flex items-center space-x-3 transition-colors"
                      >
                        <span className="text-2xl">🎨</span>
                        <span className="font-medium text-gray-700">Theme Settings</span>
                      </button>
                      
                      <button
                        onClick={() => navigateToSection('analytics')}
                        className="w-full text-left px-4 py-3 bg-indigo-200 hover:bg-indigo-300 flex items-center space-x-3 transition-colors"
                      >
                        <span className="text-2xl">📊</span>
                        <span className="font-medium text-gray-700">Analytics</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <h1 className="text-2xl font-bold text-black-800">Order System</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <OrderSystemSection companyId={userData.company.id} />
      </div>
    </div>
  )
}

function OrderSystemSection({ companyId }: { companyId: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const socketRef = useRef<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [newOrderNotification, setNewOrderNotification] = useState(false);
  const [actionCounts, setActionCounts] = useState<Record<string, number>>({});


const handleCountChange = (itemId: string, delta: number, max: number) => {
  setActionCounts((prev) => {
    const current = prev[itemId] || 0;
    const nextCount = Math.min(max, Math.max(0, current + delta));
    return { ...prev, [itemId]: nextCount };
  });
};




  // Load notification sound
  useEffect(() => {
    const audio = new Audio('/sounds/shop-notification-355746.mp3');
    audio.preload = 'auto';
    audioRef.current = audio;
  }, []);

  // Unlock audio on first user interaction
  useEffect(() => {
    const unlockAudio = () => {
      if (audioRef.current) {
        audioRef.current
          .play()
          .then(() => {
            audioRef.current!.pause();
            try {
              audioRef.current!.currentTime = 0;
            } catch (e) {
              console.warn("Error resetting audio:", e);
            }
          })
          .catch((err) => {
            console.warn("Audio unlock failed:", err);
          });
      }
      window.removeEventListener('click', unlockAudio);
    };

    window.addEventListener('click', unlockAudio);
    return () => window.removeEventListener('click', unlockAudio);
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`/api/QR_Panel/order/${companyId}`);
      if (!res.ok) throw new Error('Failed to fetch orders');
      
      const data = await res.json();
      if (Array.isArray(data.orders)) {
        setOrders(data.orders);
      } else {
        setError('Invalid order data received');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  if (newOrderNotification) {
    toast.success('New Order! 🎉', {
      position: 'top-right',
      autoClose: 10000,
    })
  }
}, [newOrderNotification])
  // WebSocket connection + fetch initial orders
useEffect(() => {
  const socketUrl = window.location.origin;
  const socket = io(socketUrl, { /* options */ });
  socketRef.current = socket;

  socket.on('connect', () => {
    setConnectionStatus('connected');
    socket.emit('join', companyId);
  });

  socket.on('disconnect', () => {
    setConnectionStatus('disconnected');
  });

  socket.on('connect_error', (error) => {
    setConnectionStatus('disconnected');
    setError('Failed to connect to real-time updates...');
  });

  socket.on('new-order', (newOrder: Order) => {
    setOrders(prev => prev.some(o => o.id === newOrder.id) ? prev : [newOrder, ...prev]);
    setNewOrderNotification(true);
    setTimeout(() => setNewOrderNotification(false), 3000);
    audioRef.current?.play().catch(console.warn);
  });

  socket.on('order-updated', (updatedOrder: Order) => {
    setOrders(prevOrders => {
      if (!updatedOrder?.orderItems?.length || updatedOrder.isActive === false) {
        return prevOrders.filter(order => order.id !== updatedOrder.id);
      }
      const exists = prevOrders.some(order => order.id === updatedOrder.id);
      if (exists) {
        return prevOrders.map(order => order.id === updatedOrder.id ? updatedOrder : order);
      }
      return [...prevOrders, updatedOrder];
    });
  });

  socket.on('order-deleted', ({ orderId }) => {
    setOrders(prev => prev.filter(order => order.id !== orderId));
  });

  fetchOrders();

  const refreshInterval = setInterval(fetchOrders, 10000);

  return () => {
    socket.disconnect();
    clearInterval(refreshInterval);
  };
}, [companyId]);

  const activeOrders = orders.filter(order => order.isActive !== false);

  // Group orders by table number
  const groupedOrders = activeOrders.reduce<Record<string, Order[]>>((acc, order) => {
    const key = String(order.createdAt);
    if (!acc[key]) acc[key] = [];
    acc[key].push(order);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-600">{error}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-4xl font-bold text-white">Orders</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={fetchOrders}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
          >
            🔄 Refresh
          </button>
          <div className={`flex items-center space-x-1 text-sm ${
            connectionStatus === 'connected' ? 'text-green-600' : 
            connectionStatus === 'connecting' ? 'text-yellow-600' : 'text-red-600'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              connectionStatus === 'connected' ? 'bg-green-500' : 
              connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            <span className="capitalize">{connectionStatus}</span>
          </div>
        </div>
      </div>

      {Object.keys(groupedOrders).length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Active Orders</h3>
          <p className="text-gray-500">Orders will appear here when customers place them.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(groupedOrders).map(([createdAt, tableOrders]) => {
  const allItems = tableOrders.flatMap(order => order.orderItems);
  const totalAmount = tableOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const latestOrder = tableOrders[0];

  return (
    <div
      key={createdAt}
      className="bg-white rounded-xl shadow-lg p-6 border border-purple-100 hover:shadow-xl transition-shadow duration-200"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-lg font-semibold text-purple-700">
          Table #{latestOrder.tableNumber}
        </span>
        <span className="text-sm text-gray-500">
          {new Date(latestOrder.createdAt).toLocaleString()}
        </span>
      </div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium text-gray-700">Total:</span>
                  <span className="font-bold text-green-600">₺{formatPrice(totalAmount)}</span>
                </div>
                <div className="mb-2 text-sm text-gray-600 italic">
                  <span className="font-medium text-purple-600">Special Notes:</span>{' '}
                  {tableOrders.map(o => o.note || 'No special note').join(', ')}
                </div>
                <div>
                  <span className="font-medium text-gray-700">Items:</span>
                  <ul className="mt-2 space-y-1">
{allItems.map((item) => {
  const unpaid = item.quantity - item.paidQuantity;
  const count = actionCounts[item.id] || 0;

  return (
    <li key={item.id} className="grid grid-cols-7 items-center gap-2 bg-purple-50 rounded px-2 py-1">
      <span className="truncate col-span-2">{item.subCategory?.name || 'Unknown'}</span>
      <span className="text-sm text-center">Qty: {item.quantity}</span>
      <span className="text-sm text-center text-green-700">Paid: {item.paidQuantity}</span>

      {/* Counter controls */}
      <div className="flex items-center justify-center space-x-2">
        <button
          onClick={() => handleCountChange(item.id, -1, unpaid)}
          className="px-2 py-1 bg-gray-400 text-white rounded disabled:opacity-50"
          disabled={count <= 0}
        >
          -
        </button>
        <span className="w-4 text-center">{count}</span>
        <button
          onClick={() => handleCountChange(item.id, 1, unpaid)}
          className="px-2 py-1 bg-blue-500 text-white rounded disabled:opacity-50 hover:bg-blue-600"
          disabled={count >= unpaid}
        >
          +
        </button>
      </div>

      {/* Pay and Delete buttons */}
      <button
          disabled={count === 0}
          onClick={async () => {
            await fetch(`/api/QR_Panel/order/${companyId}/cancel-item`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: latestOrder.id,
                cancelItemIds: [item.id],
                cancelCounts: { [item.id]: count },
              }),
            });
            setActionCounts(prev => ({ ...prev, [item.id]: 0 }));
            fetchOrders();
            toast.success(`Deleted ${count} item(s)`);
          }}
          className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded disabled:bg-gray-300"
        >
          Delete
        </button>
      <div className="flex space-x-2">
        <button
          disabled={count === 0}
          onClick={async () => {
            await fetch(`/api/QR_Panel/order/${companyId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: latestOrder.id,
                paidItemIds: [item.id],
                payCounts: { [item.id]: count },
              }),
            });
            setActionCounts(prev => ({ ...prev, [item.id]: 0 }));
            fetchOrders();
            toast.success(`Paid ${count} item(s)`);
          }}
          className="text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded disabled:bg-gray-300"
        >
          Pay
        </button>

        
      </div>
    </li>
  );
})}
                  </ul>
                </div>
<div className="flex justify-end mt-4 space-x-2">
  <button
    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-semibold transition"
    onClick={async () => {
      // Disable button by removing pointer events & reduce opacity while loading
      const btn = document.activeElement as HTMLButtonElement;
      btn.disabled = true;
      btn.style.opacity = '0.6';
      btn.textContent = 'Deleting...';

      let allSuccess = true;
      for (const order of tableOrders) {
        try {
          const res = await fetch(`/api/QR_Panel/order/${companyId}/delete`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: order.id }),
          });
          if (!res.ok) {
            allSuccess = false;
            console.error(`Failed to delete order ${order.id}`, await res.text());
            toast.error(`Failed to delete order ${order.id}`);
          }
        } catch (err) {
          allSuccess = false;
          console.error(`Error deleting order ${order.id}`, err);
          toast.error(`Error deleting order ${order.id}`);
        }
      }

      if (allSuccess) {
        toast.success('All orders deleted successfully');
      }

      fetchOrders();

      // Re-enable button & reset text
      btn.disabled = false;
      btn.style.opacity = '1';
      btn.textContent = 'Delete All';
    }}
  >
    Delete All
  </button>

  <button
    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-semibold transition"
    onClick={async () => {
      const btn = document.activeElement as HTMLButtonElement;
      btn.disabled = true;
      btn.style.opacity = '0.6';
      btn.textContent = 'Paying...';

      for (const order of tableOrders) {
        const fullPayMap: Record<string, number> = {};
        for (const item of order.orderItems) {
          if (!item?.id || item.quantity == null || item.paidQuantity == null) continue;
          fullPayMap[item.id] = item.quantity - item.paidQuantity;
        }

        await fetch(`/api/QR_Panel/order/${companyId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: order.id,
            payCounts: fullPayMap,
            markInactive: true,
          }),
        });
      }

      fetchOrders();

      btn.disabled = false;
      btn.style.opacity = '1';
      btn.textContent = 'Pay All';
    }}
  >
    Pay All
  </button>
</div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
} 
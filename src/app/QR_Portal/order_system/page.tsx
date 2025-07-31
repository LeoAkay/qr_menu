'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { io } from 'socket.io-client'

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
  price: number;
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
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/QR_Portal/user_login')
    } finally {
      setLoading(false)
    }
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
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100">
      {/* Header */}
      <header className="bg-white bg-opacity-90 backdrop-blur-md shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/QR_Portal/user_dashboard')}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-2xl font-bold text-gray-800">Order System</h1>
            </div>
            <div className="flex items-center space-x-4">
             
             
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

  // WebSocket connection + fetch initial orders
  useEffect(() => {
    const socketUrl = window.location.origin;
    console.log('Attempting to connect to WebSocket at:', socketUrl);

    const socket = io(socketUrl, {
      transports: ['polling', 'websocket'],
      timeout: 20000,
      forceNew: true,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('WebSocket connected successfully');
      setConnectionStatus('connected');
      socket.emit('join', companyId);
    });

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setConnectionStatus('disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setConnectionStatus('disconnected');
      setError('Failed to connect to real-time updates. Orders will still be visible but may not update automatically.');
    });

    socket.on('new-order', (newOrder: Order) => {
      console.log('Received new order via WebSocket:', newOrder);
      if (!newOrder?.id) {
        console.warn('Received order without ID:', newOrder);
        return;
      }

      setOrders(prev => {
        console.log('Current orders:', prev.length, 'Adding new order:', newOrder.id);
        if (prev.some(order => order.id === newOrder.id)) {
          console.log('Order already exists, skipping:', newOrder.id);
          return prev;
        }
        const updatedOrders = [newOrder, ...prev];
        console.log('Updated orders count:', updatedOrders.length);
        return updatedOrders;
      });

      setNewOrderNotification(true);
      setTimeout(() => setNewOrderNotification(false), 3000);

      if (audioRef.current) {
        audioRef.current.play().catch(console.warn);
      }
    });

    socket.on('order-updated', (updatedOrder: Order) => {
      console.log('Received updated order via WebSocket:', updatedOrder);
      setOrders(prev => {
        const existingIndex = prev.findIndex(order => order.id === updatedOrder.id);
        if (existingIndex !== -1) {
          const newOrders = [...prev];
          newOrders[existingIndex] = updatedOrder;
          console.log('Updated existing order:', updatedOrder.id);
          return newOrders;
        }
        console.log('Order not found for update, adding as new:', updatedOrder.id);
        return [updatedOrder, ...prev];
      });
    });

    socket.on('test-response', (data) => {
      console.log('Test response received from server:', data);
    });

    fetchOrders();

    // Set up periodic refresh as fallback
    const refreshInterval = setInterval(fetchOrders, 10000); // Refresh every 10 seconds

    return () => {
      socket.disconnect();
      clearInterval(refreshInterval);
    };
  }, [companyId]);

  const activeOrders = orders.filter(order => order.isActive !== false);

  // Group orders by table number
  const groupedOrders = activeOrders.reduce<Record<string, Order[]>>((acc, order) => {
    const key = String(order.tableNumber);
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
        <h2 className="text-2xl font-bold text-purple-700">Orders</h2>
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
          {newOrderNotification && (
            <div className="bg-green-100 border border-green-300 text-green-700 px-3 py-1 rounded-full text-sm animate-pulse">
              New Order! 🎉
            </div>
          )}
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
          {Object.entries(groupedOrders).map(([tableNumber, tableOrders]) => {
            const allItems = tableOrders.flatMap(order => order.orderItems);
            const totalAmount = tableOrders.reduce((sum, o) => sum + o.totalAmount, 0);
            const latestOrder = tableOrders[0];

            return (
              <div
                key={tableNumber}
                className="bg-white rounded-xl shadow-lg p-6 border border-purple-100 hover:shadow-xl transition-shadow duration-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold text-purple-700">
                    Table #{tableNumber}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(latestOrder.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium text-gray-700">Total:</span>
                  <span className="font-bold text-green-600">₺{totalAmount.toFixed(2)}</span>
                </div>
                <div className="mb-2 text-sm text-gray-600 italic">
                  <span className="font-medium text-purple-600">Special Notes:</span>{' '}
                  {tableOrders.map(o => o.note || 'No special note').join(', ')}
                </div>
                <div>
                  <span className="font-medium text-gray-700">Items:</span>
                  <ul className="mt-2 space-y-1">
                    {allItems.map((item, idx) => (
                      <li
                        key={item.id + '-' + idx}
                        className="grid grid-cols-3 items-center bg-purple-50 rounded px-2 py-1"
                      >
                        <span className="text-gray-800 truncate">{item.subCategory?.name || 'Unknown Item'}</span>
                        <span className="text-gray-600 text-sm w-20 text-center">
                          Qty: <span className="font-semibold">{item.quantity}</span>
                        </span>
                        <span className="text-green-700 font-semibold text-right">
                          ₺{item.price.toFixed(2)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex justify-end mt-4">
                  <button
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-semibold transition"
                    onClick={async () => {
                      setOrders(prev => prev.filter(o => o.tableNumber !== Number(tableNumber)));
                      for (const order of tableOrders) {
                        await fetch(`/api/QR_Panel/order/${companyId}`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ orderId: order.id }),
                        });
                      }
                    }}
                  >
                    Paid
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
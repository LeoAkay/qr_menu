// components/GlobalOrderBanner.tsx
import { useEffect, useState } from 'react';

interface Order {
  id: string;
  tableNumber: number;
  totalAmount: number;
}

export default function GlobalOrderBanner() {
  const [order, setOrder] = useState<Order | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleNewOrder = (event: Event) => {
      const customEvent = event as CustomEvent<Order>;
      setOrder(customEvent.detail);
      setVisible(true);

      setTimeout(() => {
        setVisible(false);
        setOrder(null);
      }, 5000);
    };

    window.addEventListener('new-order-notification', handleNewOrder);
    return () => window.removeEventListener('new-order-notification', handleNewOrder);
  }, []);

  if (!visible || !order) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-[9999] transition-all duration-300 animate-pulse">
      🛎️ New Order from Table #{order.tableNumber}
    </div>
  );
}

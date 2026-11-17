import { useState, useEffect } from 'react';
import { Package, Search, Phone, Hash, Clock, CheckCircle2, Truck, XCircle, Loader2 } from 'lucide-react';
import api from '../api/axiosConfig';
import Invoice from '../customer/Invoice';
import toast from 'react-hot-toast';

const TrackOrderPage = () => {
  const [searchInput, setSearchInput] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // পেজ লোড হলে ব্রাউজারে সেভ থাকা গেস্ট অর্ডারগুলোর লাইভ স্ট্যাটাস সার্ভার থেকে নিয়ে আসবে
  useEffect(() => {
    const loadSavedGuestOrders = async () => {
      const localOrders = JSON.parse(localStorage.getItem('guestOrders')) || [];
      if (localOrders.length === 0) return;

      setOrders(localOrders);
      const firstPhone = localOrders[0]?.shippingAddress?.phone;
      if (firstPhone) {
        try {
          const res = await api.post('/orders/track', { phone: firstPhone });
          if (Array.isArray(res.data) && res.data.length > 0) {
            setOrders(res.data);
          }
        } catch (err) {
          console.error('Failed to sync guest orders:', err);
        }
      }
    };

    loadSavedGuestOrders();
  }, []);

  const handleTrackOrder = async (e) => {
    e.preventDefault();
    const query = searchInput.trim();
    if (!query) {
      toast.error('Please enter your Phone Number or Order ID');
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      // ইনপুটটি যদি ফোন নম্বর হয় (০ দিয়ে শুরু বা ১১ ডিজিট) তবে phone হিসেবে পাঠাবে, নাহলে orderId
      const isPhone = /^(\+88)?01[3-9]\d{8}$/.test(query.replace(/\s+/g, ''));
      const payload = isPhone ? { phone: query } : { orderId: query };

      const res = await api.post('/orders/track', payload);
      setOrders(res.data || []);
      if (!res.data || res.data.length === 0) {
        toast.error('No orders found with this information.');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to find order');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Delivered':
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700"><CheckCircle2 className="w-3.5 h-3.5" /> Delivered</span>;
      case 'Shipped':
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700"><Truck className="w-3.5 h-3.5" /> Shipped</span>;
      case 'Processing':
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-cyan-100 text-cyan-700"><Clock className="w-3.5 h-3.5" /> Processing</span>;
      case 'Cancelled':
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700"><XCircle className="w-3.5 h-3.5" /> Cancelled</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700"><Clock className="w-3.5 h-3.5" /> {status || 'Pending'}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-28 pb-20 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Header & Search Box */}
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 mb-8 text-center">
          <div className="w-14 h-14 bg-cyan-50 text-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package className="w-7 h-7" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">Track Your Order</h1>
          <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
            Enter the phone number used during checkout or your 8-character Order ID to view order status and download your invoice.
          </p>

          <form onSubmit={handleTrackOrder} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="e.g. 017XXXXXXXX or Order ID (#A1B2C3D4)"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-cyan-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-cyan-700 transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Track Order'}
            </button>
          </form>
        </div>

        {/* Orders List */}
        {orders.length > 0 ? (
          <div className="space-y-5">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider px-1">
              Your Orders ({orders.length})
            </h2>

            {orders.map((order) => (
              <div key={order._id} className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-gray-900 text-base">
                        #{String(order._id).slice(-8).toUpperCase()}
                      </span>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Placed on {new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} • {order.shippingAddress?.name} ({order.shippingAddress?.phone})
                    </p>
                  </div>

                  {/* Invoice Button */}
                  <Invoice order={order} />
                </div>

                {/* Items */}
                <div className="space-y-3 mb-4">
                  {order.orderItems?.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        {item.image && (
                          <img src={item.image} alt={item.name} className="w-11 h-11 rounded-lg object-contain border border-gray-100" />
                        )}
                        <div>
                          <p className="font-bold text-gray-800">{item.name}</p>
                          <p className="text-xs text-gray-500">Qty: {item.qty || item.quantity || 1} × ৳{item.price}</p>
                        </div>
                      </div>
                      <span className="font-bold text-gray-900">
                        ৳ {((item.qty || item.quantity || 1) * item.price).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-gray-100 text-sm">
                  <span className="text-gray-500">
                    Delivery: <strong className="text-gray-700">{order.shippingAddress?.address}, {order.shippingAddress?.city}</strong>
                  </span>
                  <span className="text-base font-black text-cyan-600">
                    Total: ৳ {order.totalPrice?.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          searched && !loading && (
            <div className="bg-white p-12 rounded-2xl text-center border border-gray-100">
              <p className="text-gray-500 font-medium">No orders found. Please double-check your phone number or Order ID.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default TrackOrderPage;
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api/axiosConfig'; 
import { ShoppingBag, Heart, User, Package, Loader2, Trash2 } from 'lucide-react';

const CustomerDashboard = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const queryClient = useQueryClient();

  // লোকালস্টোরেজ থেকে ইউজারের বেসিক ইনফো এবং টোকেন নেওয়া
  const userStr = localStorage.getItem('user');
  const userInfo = userStr ? JSON.parse(userStr) : {};
  const token = localStorage.getItem('token'); // লগইন টোকেন চেক

  // 🔥 কাস্টমারের নিজের অর্ডারগুলো ফেচ করা
  const { data: myOrders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: async () => {
      try {
        const res = await api.get('/orders/myorders'); 
        return res.data;
      } catch (err) {
        return [];
      }
    }
  });

  // 🔥 ১. হাইব্রিড উইশলিস্ট ফেচ করা (লগইন থাকলে API থেকে, না থাকলে LocalStorage থেকে)
  const { data: dbWishlist = [], isLoading: wishlistLoading } = useQuery({
    queryKey: ['wishlist', token],
    queryFn: async () => {
      if (!token) return [];
      const res = await api.get('/wishlist'); // ব্যাকএন্ড উইশলিস্ট রাউট
      return res.data;
    },
    enabled: !!token, // শুধু টোকেন থাকলেই এপিআই কল হবে
  });

  // গেস্ট ইউজারের জন্য লোকালস্টোরেজ স্টেট
  const [localWishlist, setLocalWishlist] = useState(() => {
    const saved = localStorage.getItem('wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  // ফাইনাল উইশলিস্ট নির্ধারণ (লগইন থাকলে ডেটাবেস, না থাকলে লোকালস্টোরেজ)
  const wishlistItems = token ? dbWishlist : localWishlist;

  // 🔥 ২. উইশলিস্ট থেকে প্রোডাক্ট রিমুভ করার ফাংশন (হাইব্রিড)
  const removeFromWishlist = async (id) => {
    if (token) {
      try {
        await api.delete(`/wishlist/${id}`);
        queryClient.invalidateQueries(['wishlist']);
      } catch (err) {
        console.error("Failed to remove from DB wishlist", err);
      }
    } else {
      const updated = localWishlist.filter(item => item._id !== id);
      setLocalWishlist(updated);
      localStorage.setItem('wishlist', JSON.stringify(updated));
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-28 pb-16 px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Welcome Banner */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-cyan-50 text-cyan-600 rounded-full flex items-center justify-center font-bold text-2xl">
              {userInfo.name ? userInfo.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Hello, {userInfo.name || 'Customer'}! 👋</h1>
              <p className="text-sm text-gray-500">{userInfo.email}</p>
            </div>
          </div>
          <span className="bg-cyan-50 text-cyan-600 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
            {userInfo.role || 'Customer'}
          </span>
        </div>

        {/* Dashboard Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Sidebar Tabs */}
          <div className="md:col-span-1 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 h-fit space-y-2">
            <button 
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition text-sm ${activeTab === 'orders' ? 'bg-cyan-50 text-cyan-600' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Package className="w-4 h-4" /> My Orders
            </button>
            <button 
              onClick={() => setActiveTab('wishlist')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition text-sm ${activeTab === 'wishlist' ? 'bg-cyan-50 text-cyan-600' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Heart className="w-4 h-4" /> Wishlist
            </button>
            <button 
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition text-sm ${activeTab === 'profile' ? 'bg-cyan-50 text-cyan-600' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <User className="w-4 h-4" /> Account Details
            </button>
          </div>

          {/* Main Content Area */}
          <div className="md:col-span-3">
            
            {/* Tab 1: My Orders */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-cyan-600" /> My Order History
                </h2>

                {ordersLoading ? (
                  <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 text-cyan-600 animate-spin" /></div>
                ) : myOrders.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-40" />
                    <p className="font-medium">You haven't placed any orders yet.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* 🔥 Order List with Product Details */}
                    {myOrders.slice().reverse().map((order) => (
                      <div key={order._id} className="border border-gray-100 rounded-xl p-5 hover:border-cyan-200 transition bg-white shadow-sm hover:shadow-md">
                        
                        {/* Order Header Info */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-4 mb-4">
                          <div>
                            <p className="text-xs font-mono text-gray-400">Order #{order._id.substring(order._id.length - 8).toUpperCase()}</p>
                            <p className="text-xs text-gray-500 mt-1">Placed on <span className="font-medium text-gray-700">{new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span></p>
                          </div>
                          <div className="flex flex-col items-start sm:items-end gap-1.5">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${order.isDelivered ? 'bg-cyan-100 text-cyan-700' : 'bg-yellow-50 text-yellow-700'}`}>
                              {order.isDelivered ? 'Delivered' : 'Processing'}
                            </span>
                            <p className="font-bold text-cyan-600 text-sm mt-1">Total: ৳ {order.totalPrice?.toLocaleString()}</p>
                          </div>
                        </div>

                        {/* Order Items Details */}
                        <div className="space-y-3">
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Items in this order</p>
                          {order.orderItems?.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-4 bg-gray-50/50 p-3 rounded-lg border border-gray-100">
                              <div className="w-14 h-14 bg-white rounded-md border border-gray-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                {item.image ? (
                                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                  <Package className="w-6 h-6 text-gray-300" />
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-bold text-gray-800 line-clamp-1">{item.name}</p>
                                <p className="text-xs font-medium text-gray-500 mt-1">
                                  Qty: {item.qty || item.quantity} <span className="mx-1">•</span> ৳{(item.price).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

           {/* Tab 2: Wishlist */}
            {activeTab === 'wishlist' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500 fill-red-500" /> My Wishlist ({wishlistItems.length})
                </h2>

                {!token && (
                  <p className="text-xs text-amber-600 bg-amber-50 p-3 rounded-lg mb-4">
                    ⚠️ You are browsing as a guest. <a href="/login" className="underline font-bold">Log in</a> to sync your wishlist across devices!
                  </p>
                )}

                {wishlistLoading ? (
                  <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 text-cyan-600 animate-spin" /></div>
                ) : wishlistItems.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Heart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">Your wishlist is empty.</p>
                    <p className="text-xs text-gray-400 mt-1">Explore products and add your favorites here!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {wishlistItems.map((product) => (
                      <div key={product._id} className="border border-gray-100 rounded-xl p-4 flex items-center gap-4 hover:border-cyan-200 transition bg-gray-50/50">
                        <img 
                          src={product.image || 'https://placehold.co/100x100'} 
                          alt={product.name} 
                          className="w-16 h-16 rounded-lg object-cover border border-gray-200 bg-white" 
                        />
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 text-sm line-clamp-1">{product.name}</h4>
                          <p className="text-cyan-600 font-bold text-sm mt-1">৳ {product.price}</p>
                        </div>
                        <button 
                          onClick={() => removeFromWishlist(product._id)}
                          className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition"
                          title="Remove from wishlist"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Account Details */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <User className="w-5 h-5 text-cyan-600" /> Account Information
                </h2>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                    <input type="text" readOnly value={userInfo.name || ''} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 font-medium outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email Address</label>
                    <input type="text" readOnly value={userInfo.email || ''} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 font-medium outline-none" />
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
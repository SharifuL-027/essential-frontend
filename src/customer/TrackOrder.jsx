import { useState } from 'react';
import { Search, Package, MapPin, Loader2, AlertCircle, Phone } from 'lucide-react';
import api from '../api/axiosConfig';

const TrackOrder = () => {
  const [orderId, setOrderId] = useState('');
  const [phone, setPhone] = useState('');
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleTrackOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setOrderData(null);

    try {
      // ব্যাকএন্ড থেকে অর্ডার ট্র্যাকিং ডেটা আনা হচ্ছে
      const res = await api.post('/orders/track', { orderId, phone });
      setOrderData(res.data.data || res.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setErrorMsg(error.response?.data?.message || 'Order not found. Please check your Order ID and Phone number.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-32 pb-20 px-4 md:px-6">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-gray-900 flex items-center justify-center gap-3">
            <Search className="w-8 h-8 text-cyan-600" /> Track Your Order
          </h1>
          <p className="text-sm text-gray-500 mt-3 max-w-md mx-auto">
            Enter your Order ID and the phone number you used during checkout to see your order status.
          </p>
        </div>

        {/* Tracking Form */}
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 mb-8">
          <form onSubmit={handleTrackOrder} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Order ID</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. 64f1b2..."
                value={orderId}
                onChange={(e) => setOrderId(e.target.value.trim())}
                className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-cyan-600 transition-colors"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  required 
                  placeholder="017xxxxxxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.trim())}
                  className="w-full pl-10 p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-cyan-600 transition-colors"
                />
              </div>
            </div>
            <div className="md:col-span-1">
              <button 
                type="submit" 
                disabled={loading || !orderId || !phone}
                className="w-full bg-cyan-600 text-white font-bold py-3.5 rounded-xl shadow-md hover:bg-cyan-700 transition-colors flex justify-center items-center gap-2 disabled:opacity-70 text-sm"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Track'}
              </button>
            </div>
          </form>

          {errorMsg && (
            <div className="mt-6 bg-red-50 text-red-600 text-sm p-4 rounded-xl font-medium flex items-start gap-3 border border-red-100">
              <AlertCircle className="w-5 h-5 shrink-0" />
              {errorMsg}
            </div>
          )}
        </div>

        {/* Order Details Result */}
        {orderData && (
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-5 mb-5">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Order #{orderData._id.slice(-8).toUpperCase()}</p>
                <p className="text-sm font-medium text-gray-800 mt-1">Placed on {new Date(orderData.createdAt).toLocaleDateString()}</p>
              </div>
              <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${orderData.isDelivered ? 'bg-cyan-50 text-cyan-600 border border-cyan-100' : 'bg-yellow-50 text-yellow-700 border border-yellow-100'}`}>
                {orderData.isDelivered ? 'Delivered' : 'Processing'}
              </span>
            </div>

            <div className="space-y-4 mb-6">
              {orderData.orderItems?.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                  <div className="w-16 h-16 bg-white rounded-lg border border-gray-200 overflow-hidden flex-shrink-0 flex items-center justify-center p-1">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                    ) : (
                      <Package className="w-6 h-6 text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-900 line-clamp-1">{item.name}</p>
                    <p className="text-xs font-medium text-gray-500 mt-1">
                      Qty: {item.qty || item.quantity} <span className="mx-1">•</span> ৳{(item.price).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-cyan-50/50 p-5 rounded-2xl border border-cyan-100 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <MapPin className="w-5 h-5 text-cyan-600" />
                <span className="font-medium">{orderData.shippingAddress?.city}, {orderData.shippingAddress?.address}</span>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-gray-500 uppercase">Total Amount</p>
                <p className="text-xl font-black text-cyan-600">৳ {orderData.totalPrice?.toLocaleString()}</p>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default TrackOrder;
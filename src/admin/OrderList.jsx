import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axiosConfig';
import { ShoppingCart, Loader2, CheckCircle, XCircle, Truck, Package, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const OrderList = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');

  // 🔥 অপ্টিমাইজড অর্ডার ফেচিং
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const res = await api.get('/orders');
      return Array.isArray(res.data) ? res.data.reverse() : []; 
    },
    staleTime: 5 * 60 * 1000, 
    refetchOnWindowFocus: false, 
  });

  // ডেলিভারি স্ট্যাটাস আপডেট করার মিউটেশন
  const deliverMutation = useMutation({
    mutationFn: async (id) => {
      await api.put(`/orders/${id}/deliver`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-orders']);
      toast.success('Order marked as delivered! 📦', { 
        style: { border: '1px solid #67e8f9', color: '#0891b2' }, 
        iconTheme: { primary: '#06b6d4', secondary: '#fff' } 
      });
    },
    onError: () => {
      toast.error('Failed to update delivery status!');
    }
  });

  // 🔍 সার্চ ফিল্টার লজিক (Order ID, Customer Name, Phone Number দিয়ে সার্চ করা যাবে)
  const filteredOrders = orders.filter((order) => {
    const searchLower = searchQuery.toLowerCase();
    const orderIdMatch = order._id.toLowerCase().includes(searchLower);
    const nameMatch = (order.shippingAddress?.name || 'guest').toLowerCase().includes(searchLower);
    const phoneMatch = order.shippingAddress?.phone?.includes(searchLower);
    
    return orderIdMatch || nameMatch || phoneMatch;
  });

  if (isLoading) return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="w-10 h-10 text-cyan-600 animate-spin" /></div>;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      
      {/* Header & Search Bar */}
      <div className="p-5 md:p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-cyan-600" /> All Orders
          </h2>
          <p className="text-sm text-gray-500 mt-1">Manage and track customer orders.</p>
        </div>
        
        {/* 🔍 Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by ID, name or phone..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* 🔥 Mobile View (Card Layout) */}
      <div className="md:hidden flex flex-col p-4 gap-4 bg-gray-50/30">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-10">
            <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium text-sm">No orders found matching "{searchQuery}"</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order._id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col gap-4">
              
              {/* Card Header: Order ID & Status */}
              <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Order ID</p>
                  <p className="font-black text-gray-900">#{order._id.substring(order._id.length - 8).toUpperCase()}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${order.isPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {order.isPaid ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {order.isPaid ? 'Paid' : 'Unpaid'}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${order.isDelivered ? 'bg-cyan-100 text-cyan-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {order.isDelivered ? 'Delivered' : 'Pending'}
                  </span>
                </div>
              </div>

             {/* Customer & Total Info */}
<div className="flex justify-between items-center text-sm">
  <div>
    <p className="font-bold text-gray-800 capitalize">{order.shippingAddress?.name || 'Guest'}</p>
    <p className="text-xs text-gray-500">{order.shippingAddress?.phone}</p>
  </div>
  <div className="text-right">
    <p className="font-black text-cyan-600 text-base">৳ {order.totalPrice?.toLocaleString()}</p>
    <p className="text-[11px] font-medium text-gray-500 flex items-center justify-end gap-1.5">
      <span>
        {new Date(order.createdAt).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          timeZone: 'Asia/Dhaka',
        })}
      </span>
      <span className="text-gray-300">•</span>
      <span>
        {new Date(order.createdAt).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
          timeZone: 'Asia/Dhaka',
        })}
      </span>
    </p>
  </div>
</div>

              {/* Products List (Mobile) */}
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Ordered Items</p>
                <div className="flex flex-col gap-2">
                  {order.orderItems && order.orderItems.length > 0 ? (
                    order.orderItems.map((item, index) => (
                      <div key={index} className="flex items-center gap-3 bg-white p-2 rounded-lg border border-gray-100 shadow-sm">
                        <div className="w-10 h-10 bg-gray-50 rounded-md border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-800 truncate" title={item.name}>{item.name}</p>
                          <p className="text-[10px] text-gray-500 font-medium">Qty: {item.quantity || 1} × ৳{item.price?.toLocaleString()}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-gray-400 italic">Product info missing</span>
                  )}
                </div>
              </div>

              {/* Action Button (Mobile) */}
              {!order.isDelivered && (
                <button 
                  onClick={() => { if(window.confirm('Are you sure you want to mark this order as delivered?')) deliverMutation.mutate(order._id); }}
                  disabled={deliverMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 bg-cyan-50 text-cyan-600 border border-cyan-200 hover:bg-cyan-600 hover:text-white py-3 rounded-lg text-xs font-bold transition-colors shadow-sm disabled:opacity-50"
                >
                  {deliverMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Truck className="w-4 h-4" />} 
                  Mark as Delivered
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* 💻 Desktop View (Table Layout) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 font-bold border-b border-gray-100">
              <th className="p-4 whitespace-nowrap">Order ID</th>
              <th className="p-4 whitespace-nowrap">Customer</th>
              <th className="p-4 w-72">Products</th>
              <th className="p-4 whitespace-nowrap">Date</th>
              <th className="p-4 whitespace-nowrap">Total</th>
              <th className="p-4 whitespace-nowrap">Status</th>
              <th className="p-4 text-right whitespace-nowrap">Action</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-gray-50">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-16 text-gray-400">
                  <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="font-medium">No orders found matching "{searchQuery}"</p>
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order._id} className="hover:bg-cyan-50/30 transition-colors">
                  
                  <td className="p-4 font-bold text-gray-900 whitespace-nowrap">
                    #{order._id.substring(order._id.length - 8).toUpperCase()}
                  </td>
                  
                  <td className="p-4 whitespace-nowrap">
                    <p className="font-bold text-gray-800 capitalize">{order.shippingAddress?.name || 'Guest'}</p>
                    <p className="text-xs text-gray-500">{order.shippingAddress?.phone}</p>
                  </td>

                  <td className="p-4">
                    <div className="flex flex-col gap-2.5">
                      {order.orderItems && order.orderItems.length > 0 ? (
                        order.orderItems.map((item, index) => (
                          <div key={index} className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg border border-gray-100 transition-colors hover:bg-white hover:border-cyan-100">
                            <div className="w-10 h-10 bg-white rounded-md border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                              {item.image ? (
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                              ) : (
                                <Package className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-gray-800 truncate" title={item.name}>{item.name}</p>
                              <p className="text-[10px] text-gray-500 font-medium">Qty: {item.quantity || 1} × ৳{item.price?.toLocaleString()}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400 italic">Product info missing</span>
                      )}
                    </div>
                  </td>

                 <td className="p-4 whitespace-nowrap">
  <p className="text-xs font-medium text-gray-600">
    {new Date(order.createdAt).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'Asia/Dhaka',
    })}
  </p>
  <p className="text-[11px] text-gray-400 mt-0.5">
    {new Date(order.createdAt).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Dhaka',
    })}
  </p>
</td>
                  
                  <td className="p-4 font-black text-cyan-600 whitespace-nowrap">
                    ৳ {order.totalPrice?.toLocaleString()}
                  </td>
                  
                  <td className="p-4 whitespace-nowrap">
                    <div className="flex flex-col gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider w-max ${order.isPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {order.isPaid ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {order.isPaid ? 'Paid' : 'Unpaid'}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider w-max ${order.isDelivered ? 'bg-cyan-100 text-cyan-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {order.isDelivered ? 'Delivered' : 'Pending'}
                      </span>
                    </div>
                  </td>

                  <td className="p-4 text-right align-middle whitespace-nowrap">
                    {!order.isDelivered && (
                      <button 
                        onClick={() => { if(window.confirm('Are you sure you want to mark this order as delivered?')) deliverMutation.mutate(order._id); }}
                        disabled={deliverMutation.isPending}
                        className="inline-flex items-center justify-center gap-1.5 bg-cyan-50 text-cyan-600 border border-cyan-200 hover:bg-cyan-600 hover:text-white px-4 py-2.5 rounded-lg text-xs font-bold transition-all shadow-sm hover:shadow-md disabled:opacity-50"
                      >
                        {deliverMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Truck className="w-4 h-4" />} 
                        Deliver
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default OrderList;
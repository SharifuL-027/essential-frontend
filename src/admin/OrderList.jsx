import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axiosConfig';
import { ShoppingCart, Loader2, CheckCircle, XCircle, Truck, Package } from 'lucide-react';
import toast from 'react-hot-toast';

const OrderList = () => {
  const queryClient = useQueryClient();

  // 🔥 অপ্টিমাইজড অর্ডার ফেচিং (লোডিং টাইম কমানোর জন্য ক্যাশিং অ্যাড করা হয়েছে)
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const res = await api.get('/orders');
      // ডাটাবেস থেকে না আসলে ফ্রন্টএন্ডেই রিভার্স করে দিচ্ছি যাতে লেটেস্ট আগে থাকে
      return Array.isArray(res.data) ? res.data.reverse() : []; 
    },
    staleTime: 5 * 60 * 1000, // ৫ মিনিট ক্যাশে ধরে রাখবে, বারবার লোড হবে না
    refetchOnWindowFocus: false, // অন্য ট্যাব থেকে ফিরে আসলে রিলোড হবে না
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

  if (isLoading) return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="w-10 h-10 text-cyan-600 animate-spin" /></div>;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 bg-gray-50/50">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-cyan-600" /> All Orders
        </h2>
        <p className="text-sm text-gray-500 mt-1">Manage and track customer orders.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 font-bold border-b border-gray-100">
              <th className="p-4">Order ID</th>
              <th className="p-4">Customer</th>
              <th className="p-4 w-64">Products</th> {/* 🔥 নতুন কলাম */}
              <th className="p-4">Date</th>
              <th className="p-4">Total</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-gray-50">
            {orders.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-10 text-gray-400">No orders found.</td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order._id} className="hover:bg-cyan-50/30 transition">
                  {/* Order ID */}
                  <td className="p-4 font-bold text-gray-900">
                    #{order._id.substring(order._id.length - 8).toUpperCase()}
                  </td>
                  
                  {/* Customer Info */}
                  <td className="p-4">
                    <p className="font-bold text-gray-800">{order.shippingAddress?.name || 'Guest'}</p>
                    <p className="text-xs text-gray-500">{order.shippingAddress?.phone}</p>
                  </td>

                  {/* 🔥 Product Details (Image, Name, Qty) */}
                  <td className="p-4">
                    <div className="flex flex-col gap-3">
                      {order.orderItems && order.orderItems.length > 0 ? (
                        order.orderItems.map((item, index) => (
                          <div key={index} className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg border border-gray-100">
                            <div className="w-10 h-10 bg-white rounded-md border border-gray-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                              {item.image ? (
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                              ) : (
                                <Package className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-gray-800 truncate" title={item.name}>{item.name}</p>
                              <p className="text-[10px] text-gray-500 font-medium">Qty: {item.quantity || 1} × ৳{item.price}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400 italic">Product info missing</span>
                      )}
                    </div>
                  </td>

                  {/* Date */}
                  <td className="p-4 text-gray-500 text-xs font-medium">
                    {new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  
                  {/* Total Price */}
                  <td className="p-4 font-bold text-cyan-600">
                    ৳ {order.totalPrice?.toLocaleString()}
                  </td>
                  
                  {/* Combined Status Badge */}
                  <td className="p-4">
                    <div className="flex flex-col gap-2">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider w-max ${order.isPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {order.isPaid ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {order.isPaid ? 'Paid' : 'Unpaid'}
                      </span>
                      
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider w-max ${order.isDelivered ? 'bg-cyan-100 text-cyan-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {order.isDelivered ? 'Delivered' : 'Pending'}
                      </span>
                    </div>
                  </td>

                  {/* Action */}
                  <td className="p-4 text-right align-middle">
                    {!order.isDelivered && (
                      <button 
                        onClick={() => { if(window.confirm('Are you sure you want to mark this order as delivered?')) deliverMutation.mutate(order._id); }}
                        disabled={deliverMutation.isPending}
                        className="inline-flex items-center justify-center gap-1.5 bg-cyan-50 text-cyan-600 border border-cyan-200 hover:bg-cyan-600 hover:text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors shadow-sm disabled:opacity-50"
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
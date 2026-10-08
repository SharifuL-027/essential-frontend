import { useQuery } from '@tanstack/react-query';
import api from '../api/axiosConfig'; 
import { 
  DollarSign, ShoppingCart, Package, TrendingUp, AlertCircle, 
  Clock, CheckCircle, Loader2
} from 'lucide-react';

const AdminDashboard = () => {

  // 🔥 ড্যাশবোর্ড API কল
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await api.get('/dashboard/stats'); 
      return response.data;
    },
    staleTime: 2 * 60 * 1000, 
    refetchOnWindowFocus: false, 
  });

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-10 h-10 text-cyan-600 animate-spin" />
      </div>
    );
  }

  if (error || !data?.success) {
    return <div className="text-center py-20 text-red-600 font-bold">Failed to load dashboard data!</div>;
  }

  // API থেকে সরাসরি ডেটা বের করে নেওয়া
  const { 
    totalOrders, totalRevenue, totalProducts, 
    lowStockCount, recentOrders, topProducts 
  } = data;

  const topStats = [
    { title: 'Total Revenue', value: `৳ ${totalRevenue.toLocaleString('en-IN')}`, icon: <DollarSign className="w-5 h-5 text-emerald-600" />, bg: 'bg-emerald-50', trend: 'Live' },
    { title: 'Orders', value: totalOrders, icon: <ShoppingCart className="w-5 h-5 text-blue-600" />, bg: 'bg-blue-50', trend: 'Live' },
    { title: 'Total Products', value: totalProducts, icon: <Package className="w-5 h-5 text-orange-600" />, bg: 'bg-orange-50', trend: `Low Stock: ${lowStockCount}` },
  ];

  const getStatusBadge = (order) => {
    if (order.isDelivered) return { text: 'Delivered', style: 'bg-green-100 text-green-700' };
    if (order.isPaid) return { text: 'Paid', style: 'bg-cyan-100 text-cyan-700' };
    return { text: 'Pending', style: 'bg-yellow-100 text-yellow-700' };
  };

  const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="space-y-6 pb-10">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time dynamic data from your store.</p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-gray-600 font-medium">{today}</span>
        </div>
      </div>

      {/* Top Dynamic Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {topStats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-lg ${stat.bg}`}>{stat.icon}</div>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${stat.trend.includes('Low') && lowStockCount > 0 ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                {stat.trend}
              </span>
            </div>
            <h4 className="text-gray-500 text-xs font-bold uppercase tracking-wider">{stat.title}</h4>
            <h2 className="text-3xl font-black text-gray-900 mt-1.5">{stat.value}</h2>
          </div>
        ))}
      </div>

      {/* Alert Section */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-orange-500" /> Action Required (Inventory Alert)
        </h3>
        <div>
          {lowStockCount > 0 ? (
            <div className="flex gap-3 items-center justify-between p-4 bg-red-50 rounded-xl border border-red-100">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-sm font-bold text-red-800">{lowStockCount} products are running out of stock!</p>
                  <span className="text-[10px] text-red-500 flex items-center gap-1 mt-0.5"><Clock className="w-3 h-3" /> Live Alert</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex gap-3 items-center p-4 bg-green-50 rounded-xl border border-green-100">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div><p className="text-sm font-bold text-green-800">Inventory is looking good!</p></div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Recent Orders</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-[10px] uppercase tracking-wider text-gray-500 font-bold border-b border-gray-100">
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {recentOrders.length === 0 ? (
                   <tr><td colSpan="5" className="text-center py-6 text-gray-400">No recent orders found.</td></tr>
                ) : (
                  recentOrders.map((order, i) => {
                    const status = getStatusBadge(order);
                    return (
                      <tr key={order._id || i} className="border-b border-gray-50 hover:bg-gray-50 transition">
                        <td className="p-4 font-bold text-gray-900">...{order._id?.substring(order._id.length - 6).toUpperCase()}</td>
                        <td className="p-4 font-medium text-gray-700">{order.shippingAddress?.name || 'Guest'}</td>
                        <td className="p-4 text-gray-500 text-xs">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="p-4 font-bold text-cyan-600">৳ {order.totalPrice?.toLocaleString()}</td>
                        <td className="p-4 text-right">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${status.style}`}>{status.text}</span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top/Recent Products */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" /> Store Highlights
            </h3>
          </div>
          <div className="space-y-4">
            {topProducts.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">No products found.</p>
            ) : (
              topProducts.map((prod, i) => (
                <div key={prod._id || i} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition border border-transparent hover:border-gray-100">
                  <img src={prod.image || 'https://placehold.co/100x100'} alt={prod.name} className="w-12 h-12 rounded-lg object-cover border border-gray-200" />
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-gray-800 line-clamp-1">{prod.name}</h4>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] font-medium text-gray-500">Stock: {prod.stock}</span>
                      <span className="text-xs font-bold text-cyan-600">৳ {prod.price?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
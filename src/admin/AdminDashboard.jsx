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
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center p-6 bg-red-50 rounded-2xl border border-red-100">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <h3 className="text-red-700 font-bold text-lg">Failed to load dashboard data!</h3>
          <p className="text-red-500 text-sm mt-1">Please check your connection or try again later.</p>
        </div>
      </div>
    );
  }

  // API থেকে সরাসরি ডেটা বের করে নেওয়া
  const { 
    totalOrders, totalRevenue, totalProducts, 
    lowStockCount, recentOrders, topProducts 
  } = data;

  const topStats = [
    { title: 'Total Revenue', value: `৳ ${totalRevenue.toLocaleString('en-IN')}`, icon: <DollarSign className="w-6 h-6 text-emerald-600" />, bg: 'bg-emerald-50', trend: 'Live' },
    { title: 'Orders', value: totalOrders, icon: <ShoppingCart className="w-6 h-6 text-blue-600" />, bg: 'bg-blue-50', trend: 'Live' },
    { title: 'Total Products', value: totalProducts, icon: <Package className="w-6 h-6 text-orange-600" />, bg: 'bg-orange-50', trend: `Low Stock: ${lowStockCount}` },
  ];

  const getStatusBadge = (order) => {
    if (order.isDelivered) return { text: 'Delivered', style: 'bg-green-100 text-green-700' };
    if (order.isPaid) return { text: 'Paid', style: 'bg-cyan-100 text-cyan-700' };
    return { text: 'Pending', style: 'bg-yellow-100 text-yellow-700' };
  };

  const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="space-y-6 pb-10 max-w-7xl mx-auto">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-5 bg-white/50 rounded-t-2xl px-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">Real-time dynamic data from your store.</p>
        </div>
        <div className="flex items-center gap-3 text-sm w-full sm:w-auto">
          <span className="bg-white border border-gray-200 px-4 py-2 rounded-xl text-gray-700 font-bold shadow-sm w-full sm:w-auto text-center">
            {today}
          </span>
        </div>
      </div>

      {/* Top Dynamic Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {topStats.map((stat, i) => (
          <div key={i} className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3.5 rounded-xl ${stat.bg} shadow-inner`}>{stat.icon}</div>
              <span className={`text-[10px] md:text-xs font-bold px-3 py-1 rounded-full shadow-sm ${stat.trend.includes('Low') && lowStockCount > 0 ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-gray-50 text-gray-600 border border-gray-200'}`}>
                {stat.trend}
              </span>
            </div>
            <h4 className="text-gray-500 text-xs md:text-sm font-bold uppercase tracking-wider">{stat.title}</h4>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 mt-1.5 truncate">{stat.value}</h2>
          </div>
        ))}
      </div>

      {/* Alert Section */}
      <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-xs md:text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-orange-500" /> Action Required (Inventory Alert)
        </h3>
        <div>
          {lowStockCount > 0 ? (
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between p-4 bg-red-50 rounded-xl border border-red-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-full shrink-0">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm md:text-base font-bold text-red-800">{lowStockCount} products are running out of stock!</p>
                  <span className="text-[10px] md:text-xs text-red-500 flex items-center gap-1 mt-1 font-medium">
                    <Clock className="w-3 h-3" /> Live Alert
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex gap-3 items-center p-4 bg-green-50 rounded-xl border border-green-100">
              <div className="p-2 bg-green-100 rounded-full shrink-0">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm md:text-base font-bold text-green-800">Inventory is looking good!</p>
                <p className="text-xs text-green-600 mt-0.5">All products are sufficiently stocked.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-5 md:p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-cyan-600" /> Recent Orders
            </h3>
          </div>
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-gray-50 text-[10px] md:text-xs uppercase tracking-wider text-gray-500 font-bold border-b border-gray-100">
                  <th className="p-4 whitespace-nowrap">Order ID</th>
                  <th className="p-4 whitespace-nowrap">Customer</th>
                  <th className="p-4 whitespace-nowrap">Date</th>
                  <th className="p-4 whitespace-nowrap">Amount</th>
                  <th className="p-4 text-right whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-50">
                {recentOrders.length === 0 ? (
                   <tr>
                     <td colSpan="5" className="text-center py-10 text-gray-400 font-medium">
                        No recent orders found.
                     </td>
                   </tr>
                ) : (
                  recentOrders.map((order, i) => {
                    const status = getStatusBadge(order);
                    return (
                      <tr key={order._id || i} className="hover:bg-cyan-50/30 transition-colors">
                        <td className="p-4 font-bold text-gray-900">...{order._id?.substring(order._id.length - 6).toUpperCase()}</td>
                        <td className="p-4 font-medium text-gray-700 capitalize">{order.shippingAddress?.name || 'Guest'}</td>
                        <td className="p-4 text-gray-500 text-xs">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="p-4 font-bold text-cyan-600 whitespace-nowrap">৳ {order.totalPrice?.toLocaleString()}</td>
                        <td className="p-4 text-right">
                          <span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm whitespace-nowrap ${status.style}`}>
                            {status.text}
                          </span>
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
        <div className="lg:col-span-1 bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-5 pb-4 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-green-500" /> Store Highlights
            </h3>
          </div>
          <div className="space-y-4">
            {topProducts.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                <p className="text-gray-400 text-sm font-medium">No products found.</p>
              </div>
            ) : (
              topProducts.map((prod, i) => (
                <div key={prod._id || i} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition border border-transparent hover:border-gray-100 group">
                  <div className="w-14 h-14 shrink-0 rounded-xl border border-gray-200 overflow-hidden bg-white p-1">
                    <img src={prod.image || 'https://placehold.co/100x100'} alt={prod.name} className="w-full h-full object-cover rounded-lg group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm md:text-[15px] font-bold text-gray-800 truncate" title={prod.name}>{prod.name}</h4>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[10px] md:text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">Stock: {prod.stock}</span>
                      <span className="text-xs md:text-sm font-black text-cyan-600">৳ {prod.price?.toLocaleString()}</span>
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
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axiosConfig';
import { 
  ShoppingCart, Loader2, CheckCircle, XCircle, Package, Search, 
  Clock, Truck, CheckCircle2, Trash2, Edit, FileText, Printer, X, Save 
} from 'lucide-react';
import toast from 'react-hot-toast';

const OrderList = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const tabs = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  // Edit Order Modal State
  const [editingOrder, setEditingOrder] = useState(null);

  // Invoice View & Edit Modal State
  const [invoiceOrder, setInvoiceOrder] = useState(null);
  const [invoiceAdjustments, setInvoiceAdjustments] = useState({
    shippingFee: 0,
    discount: 0,
    note: 'Thank you for shopping with Essential Zone!'
  });

  // অর্ডার ফেচিং
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const res = await api.get('/orders');
      return Array.isArray(res.data) ? res.data.reverse() : []; 
    },
    staleTime: 5 * 60 * 1000, 
    refetchOnWindowFocus: false, 
  });

  // স্ট্যাটাস আপডেট মিউটেশন
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      await api.put(`/orders/${id}/status`, { status });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['admin-orders']);
      toast.success(`Order status updated to ${variables.status}! 🚀`);
    },
    onError: () => {
      toast.error('Failed to update order status!');
    }
  });

  // অর্ডার ডিটেইলস এডিট/আপডেট মিউটেশন
  const updateOrderMutation = useMutation({
    mutationFn: async (updatedData) => {
      const res = await api.put(`/orders/${updatedData._id}`, updatedData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-orders']);
      setEditingOrder(null);
      toast.success('Order details updated successfully! ✅');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update order details!');
    }
  });

  // অর্ডার ডিলিট মিউটেশন
  const deleteOrderMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/orders/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-orders']);
      toast.success('Order deleted successfully! 🗑️');
    },
    onError: () => {
      toast.error('Failed to delete order!');
    }
  });

  // Edit Modal ওপেন করার হ্যান্ডলার
  const handleOpenEditModal = (order) => {
    setEditingOrder({
      ...order,
      shippingAddress: {
        name: order.shippingAddress?.name || '',
        phone: order.shippingAddress?.phone || '',
        address: order.shippingAddress?.address || '',
        city: order.shippingAddress?.city || '',
      },
      orderItems: order.orderItems?.map(item => ({
        ...item,
        qty: item.qty || item.quantity || 1
      })) || []
    });
  };

  // Edit Modal-এ আইটেমের পরিমাণ বা দাম পরিবর্তন করলে টোটাল রিক্যালকুলেট
  const handleEditItemChange = (index, field, value) => {
    const updatedItems = [...editingOrder.orderItems];
    updatedItems[index][field] = Number(value) || 0;
    const newTotal = updatedItems.reduce((sum, item) => sum + (item.price * (item.qty || 1)), 0);
    setEditingOrder({
      ...editingOrder,
      orderItems: updatedItems,
      totalPrice: newTotal
    });
  };

  // Invoice Modal ওপেন করার হ্যান্ডলার
  const handleOpenInvoiceModal = (order) => {
    const itemsSubtotal = order.orderItems?.reduce((sum, item) => sum + ((item.price || 0) * (item.qty || item.quantity || 1)), 0) || 0;
    const initialShipping = Math.max(0, (order.totalPrice || 0) - itemsSubtotal);
    
    setInvoiceOrder({
      ...order,
      shippingAddress: {
        name: order.shippingAddress?.name || 'Guest Customer',
        phone: order.shippingAddress?.phone || '',
        address: order.shippingAddress?.address || '',
        city: order.shippingAddress?.city || '',
      },
      orderItems: order.orderItems?.map(item => ({
        ...item,
        qty: item.qty || item.quantity || 1
      })) || []
    });
    setInvoiceAdjustments({
      shippingFee: initialShipping,
      discount: 0,
      note: 'Thank you for shopping with Essential Zone!'
    });
  };

  // ছবিসহ ক্লিন ইনভয়েস প্রিন্ট/পিডিএফ ফাংশন
  const handlePrintInvoice = () => {
    if (!invoiceOrder) return;
    const subtotal = invoiceOrder.orderItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const grandTotal = Math.max(0, subtotal + Number(invoiceAdjustments.shippingFee || 0) - Number(invoiceAdjustments.discount || 0));

    const itemsHTML = invoiceOrder.orderItems.map(item => `
      <tr style="border-bottom: 1px solid #f3f4f6;">
        <td style="padding: 12px; display: flex; align-items: center; gap: 10px;">
          ${item.image ? `<img src="${item.image}" alt="" style="width: 40px; height: 40px; object-fit: contain; border: 1px solid #e5e7eb; border-radius: 6px; padding: 2px;" />` : ''}
          <span style="font-weight: 600; color: #1f2937; font-size: 13px;">${item.name}</span>
        </td>
        <td style="padding: 12px; text-align: center; font-weight: bold; font-size: 13px;">${item.qty}</td>
        <td style="padding: 12px; text-align: right; font-size: 13px;">৳ ${Number(item.price).toLocaleString()}</td>
        <td style="padding: 12px; text-align: right; font-weight: bold; font-size: 13px;">৳ ${(item.qty * item.price).toLocaleString()}</td>
      </tr>
    `).join('');

    const win = window.open('', '_blank', 'width=900,height=750');
    win.document.open();
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice #${invoiceOrder._id.slice(-8).toUpperCase()}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 30px; color: #333; margin: 0; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; margin-bottom: 20px; }
            .billed { background: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 20px; display: flex; justify-content: space-between; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th { background: #f3f4f6; padding: 12px; text-align: left; font-size: 12px; text-transform: uppercase; color: #4b5563; }
            .total-section { display: flex; justify-content: flex-end; }
            .total-box { width: 240px; text-align: right; }
            .total-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; }
            .grand-total { font-weight: bold; color: #0891b2; border-top: 2px solid #e5e7eb; padding-top: 8px; font-size: 16px; }
            .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #6b7280; border-top: 1px solid #f3f4f6; padding-top: 15px; }
            @media print { body { padding: 10px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 style="color: #0891b2; margin: 0; font-size: 24px;">ESSENTIAL ZONE</h1>
              <p style="margin: 4px 0 0; font-size: 12px; color: #6b7280;">Dhaka, Bangladesh</p>
              <p style="margin: 2px 0 0; font-size: 12px; color: #6b7280;">Support: support@essentialzone.com</p>
            </div>
            <div style="text-align: right;">
              <h2 style="margin: 0; font-size: 18px; color: #1f2937;">INVOICE</h2>
              <p style="margin: 4px 0 0; font-size: 12px; color: #6b7280;">ID: #${invoiceOrder._id.slice(-8).toUpperCase()}</p>
              <p style="margin: 2px 0 0; font-size: 12px; color: #6b7280;">Date: ${new Date(invoiceOrder.createdAt).toLocaleDateString('en-GB')}</p>
            </div>
          </div>

          <div class="billed">
            <div>
              <p style="margin: 0 0 4px; font-size: 11px; font-weight: bold; color: #9ca3af; text-transform: uppercase;">Billed To:</p>
              <p style="margin: 0; font-weight: bold; font-size: 14px; text-transform: capitalize;">${invoiceOrder.shippingAddress.name}</p>
              <p style="margin: 2px 0; font-size: 12px; color: #4b5563;">${invoiceOrder.shippingAddress.phone}</p>
              <p style="margin: 0; font-size: 12px; color: #4b5563;">${invoiceOrder.shippingAddress.address}, ${invoiceOrder.shippingAddress.city}</p>
            </div>
            <div style="text-align: right;">
              <p style="margin: 0 0 4px; font-size: 11px; font-weight: bold; color: #9ca3af; text-transform: uppercase;">Payment Info:</p>
              <p style="margin: 0; font-weight: bold; font-size: 13px; color: #0891b2;">${invoiceOrder.paymentMethod || 'Cash on Delivery'}</p>
              <p style="margin: 4px 0 0; font-size: 12px; color: #4b5563;">Status: <b style="color: ${invoiceOrder.isPaid ? '#16a34a' : '#dc2626'};">${invoiceOrder.isPaid ? 'Paid' : 'Unpaid'}</b></p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item Description</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>${itemsHTML}</tbody>
          </table>

          <div class="total-section">
            <div class="total-box">
              <div class="total-row">
                <span>Subtotal:</span>
                <span>৳ ${subtotal.toLocaleString()}</span>
              </div>
              <div class="total-row">
                <span>Shipping Charge:</span>
                <span>৳ ${Number(invoiceAdjustments.shippingFee || 0).toLocaleString()}</span>
              </div>
              ${Number(invoiceAdjustments.discount) > 0 ? `
                <div class="total-row" style="color: #16a34a;">
                  <span>Discount:</span>
                  <span>- ৳ ${Number(invoiceAdjustments.discount).toLocaleString()}</span>
                </div>
              ` : ''}
              <div class="total-row grand-total">
                <span>Grand Total:</span>
                <span>৳ ${grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div class="footer">${invoiceAdjustments.note}</div>

          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 700);
            };
          </script>
        </body>
      </html>
    `);
    win.document.close();
  };

  // ফিল্টার লজিক
  const filteredOrders = orders.filter((order) => {
    const currentStatus = order.status || 'Pending'; 
    const matchesTab = activeTab === 'All' || currentStatus === activeTab;
    const searchLower = searchQuery.toLowerCase();
    const orderIdMatch = order._id.toLowerCase().includes(searchLower);
    const nameMatch = (order.shippingAddress?.name || 'guest').toLowerCase().includes(searchLower);
    const phoneMatch = order.shippingAddress?.phone?.includes(searchLower);
    return matchesTab && (orderIdMatch || nameMatch || phoneMatch);
  });

  const getStatusBadge = (status, isDelivered) => {
    if (isDelivered && !status) return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider w-max bg-green-100 text-green-700"><CheckCircle2 className="w-3.5 h-3.5"/> Delivered</span>;
    switch (status) {
      case 'Processing': return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider w-max bg-blue-100 text-blue-700"><Clock className="w-3.5 h-3.5"/> Processing</span>;
      case 'Shipped': return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider w-max bg-yellow-100 text-yellow-700"><Truck className="w-3.5 h-3.5"/> Shipped</span>;
      case 'Delivered': return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider w-max bg-green-100 text-green-700"><CheckCircle2 className="w-3.5 h-3.5"/> Delivered</span>;
      case 'Cancelled': return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider w-max bg-red-100 text-red-700"><XCircle className="w-3.5 h-3.5"/> Cancelled</span>;
      default: return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider w-max bg-gray-100 text-gray-700"><Package className="w-3.5 h-3.5"/> Pending</span>;
    }
  };

  if (isLoading) return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="w-10 h-10 text-cyan-600 animate-spin" /></div>;

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      
      {/* Header & Search Bar */}
      <div className="p-6 md:p-7 border-b border-gray-100 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
            <ShoppingCart className="w-6 h-6 text-cyan-600" /> All Orders
          </h2>
          <p className="text-sm text-gray-500 mt-1">Manage, edit orders and generate customer invoices.</p>
        </div>
        
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by ID, name or phone..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-cyan-500 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-gray-50/50 border-b border-gray-100 px-5 sm:px-7">
        <div className="flex gap-7 overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 flex items-center gap-2 border-b-2 text-sm font-bold whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === tab ? 'border-cyan-600 text-cyan-700' : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              {tab}
              <span className={`px-2.5 py-0.5 rounded-full text-xs ${
                activeTab === tab ? 'bg-cyan-100 text-cyan-700' : 'bg-gray-200 text-gray-600'
              }`}>
                {tab === 'All' ? orders.length : orders.filter(o => (o.status || 'Pending') === tab).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Mobile View (Card Layout) */}
      <div className="lg:hidden flex flex-col p-4 sm:p-6 gap-4 bg-gray-50/30">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium text-sm">No orders found in "{activeTab}" status.</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order._id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col gap-4">
              <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Order ID</p>
                  <p className="font-black text-gray-900 text-base">#{order._id.slice(-8).toUpperCase()}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${order.isPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {order.isPaid ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    {order.isPaid ? 'Paid' : 'Unpaid'}
                  </span>
                  {getStatusBadge(order.status, order.isDelivered)}
                </div>
              </div>

              <div className="flex justify-between items-center text-sm">
                <div>
                  <p className="font-bold text-gray-800 capitalize text-base">{order.shippingAddress?.name || 'Guest'}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{order.shippingAddress?.phone}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-cyan-600 text-lg">৳ {order.totalPrice?.toLocaleString()}</p>
                  <p className="text-xs font-medium text-gray-500 mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>

              {/* Mobile Products Summary */}
              <div className="space-y-2 bg-gray-50 p-3 rounded-xl">
                {order.orderItems?.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-xs">
                    {item.image && <img src={item.image} alt="" className="w-9 h-9 rounded object-cover border border-gray-200 bg-white" />}
                    <div className="flex-1">
                      <p className="font-bold text-gray-800">{item.name}</p>
                      <p className="text-gray-500">Qty: {item.qty || item.quantity || 1} × ৳{item.price?.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mobile Actions */}
              <div className="pt-2 flex flex-wrap gap-2.5">
                {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                  <select 
                    value={order.status || 'Pending'}
                    onChange={(e) => {
                      if(window.confirm(`Change status to ${e.target.value}?`)) {
                        updateStatusMutation.mutate({ id: order._id, status: e.target.value });
                      }
                    }}
                    className="flex-1 min-w-[130px] bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold rounded-lg px-3 py-2.5 outline-none"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                )}

                <button 
                  onClick={() => handleOpenInvoiceModal(order)}
                  className="flex items-center gap-1.5 bg-cyan-50 text-cyan-700 border border-cyan-200 px-3.5 py-2.5 rounded-lg text-xs font-bold"
                >
                  <FileText className="w-4 h-4" /> Invoice
                </button>

                <button 
                  onClick={() => handleOpenEditModal(order)}
                  className="flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 px-3.5 py-2.5 rounded-lg text-xs font-bold"
                >
                  <Edit className="w-4 h-4" /> Edit
                </button>
                
                <button 
                  onClick={() => {
                    if(window.confirm('Permanently delete this order?')) {
                      deleteOrderMutation.mutate(order._id);
                    }
                  }}
                  className="flex items-center justify-center bg-red-50 text-red-600 border border-red-200 px-3.5 py-2.5 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop View (Spacious Table Layout) */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1200px]">
          <thead>
            <tr className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 font-bold border-b border-gray-100">
              <th className="px-5 py-4 whitespace-nowrap">Order ID</th>
              <th className="px-5 py-4 whitespace-nowrap">Customer Info</th>
              <th className="px-5 py-4 min-w-[300px]">Ordered Products</th>
              <th className="px-5 py-4 whitespace-nowrap">Order Date</th>
              <th className="px-5 py-4 whitespace-nowrap">Total Amount</th>
              <th className="px-5 py-4 whitespace-nowrap">Status</th>
              <th className="px-5 py-4 text-right whitespace-nowrap">Manage & Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-gray-100">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-16 text-gray-400">
                  <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="font-medium">No orders found in "{activeTab}" status.</p>
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order._id} className="hover:bg-cyan-50/30 transition-colors">
                  <td className="px-5 py-4 font-bold text-gray-900 whitespace-nowrap align-top">
                    #{order._id.slice(-8).toUpperCase()}
                  </td>
                  
                  <td className="px-5 py-4 whitespace-nowrap align-top">
                    <p className="font-bold text-gray-800 capitalize text-sm">{order.shippingAddress?.name || 'Guest'}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{order.shippingAddress?.phone}</p>
                    {order.shippingAddress?.city && (
                      <p className="text-xs text-gray-400 mt-0.5">{order.shippingAddress.city}</p>
                    )}
                  </td>

                  <td className="px-5 py-4 align-top">
                    <div className="flex flex-col gap-2.5">
                      {order.orderItems?.map((item, index) => (
                        <div key={index} className="flex items-center gap-3 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                          <div className="w-11 h-11 bg-white rounded-lg border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                            {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <Package className="w-5 h-5 text-gray-400" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-gray-800 leading-snug">{item.name}</p>
                            <p className="text-xs text-gray-500 font-medium mt-0.5">Qty: {item.qty || item.quantity || 1} × ৳{item.price?.toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </td>

                  <td className="px-5 py-4 whitespace-nowrap align-top">
                    <p className="text-xs font-semibold text-gray-700">
                      {new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Dhaka' })}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(order.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Dhaka' })}
                    </p>
                  </td>
                  
                  <td className="px-5 py-4 font-black text-cyan-600 text-base whitespace-nowrap align-top">
                    ৳ {order.totalPrice?.toLocaleString()}
                  </td>
                  
                  <td className="px-5 py-4 whitespace-nowrap align-top">
                    <div className="flex flex-col gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider w-max ${order.isPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {order.isPaid ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {order.isPaid ? 'Paid' : 'Unpaid'}
                      </span>
                      {getStatusBadge(order.status, order.isDelivered)}
                    </div>
                  </td>

                  <td className="px-5 py-4 text-right align-top whitespace-nowrap">
                    <div className="flex flex-col items-end gap-2.5">
                      {/* Status Dropdown */}
                      {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                        <select 
                          value={order.status || 'Pending'}
                          onChange={(e) => {
                            if(window.confirm(`Change order status to ${e.target.value}?`)) {
                              updateStatusMutation.mutate({ id: order._id, status: e.target.value });
                            }
                          }}
                          className="w-36 bg-white border border-cyan-200 text-cyan-700 text-xs font-bold rounded-lg px-3 py-2 outline-none focus:border-cyan-500 cursor-pointer shadow-xs"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      )}

                      {/* Action Buttons with Clear Labels */}
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleOpenInvoiceModal(order)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 bg-cyan-50 text-cyan-700 border border-cyan-200 rounded-lg text-xs font-bold hover:bg-cyan-600 hover:text-white transition-colors cursor-pointer"
                          title="View & Edit Invoice"
                        >
                          <FileText className="w-3.5 h-3.5" /> Invoice
                        </button>

                        <button 
                          onClick={() => handleOpenEditModal(order)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-bold hover:bg-amber-500 hover:text-white transition-colors cursor-pointer"
                          title="Edit Order Details"
                        >
                          <Edit className="w-3.5 h-3.5" /> Edit
                        </button>
                        
                        <button 
                          onClick={() => {
                            if(window.confirm('Are you sure you want to permanently delete this order?')) {
                              deleteOrderMutation.mutate(order._id);
                            }
                          }}
                          className="p-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                          title="Delete Order"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ========================================================= */}
      {/* 1. EDIT ORDER DETAILS MODAL (Spacious Layout)             */}
      {/* ========================================================= */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden my-8">
            <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100 bg-gray-50">
              <h3 className="text-xl font-bold text-gray-900">
                Edit Order #{editingOrder._id.slice(-8).toUpperCase()}
              </h3>
              <button onClick={() => setEditingOrder(null)} className="text-gray-400 hover:text-red-500 p-1">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 sm:p-8 space-y-6 max-h-[78vh] overflow-y-auto">
              {/* Customer & Shipping Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5">Customer Name</label>
                  <input 
                    type="text" 
                    value={editingOrder.shippingAddress.name}
                    onChange={(e) => setEditingOrder({...editingOrder, shippingAddress: {...editingOrder.shippingAddress, name: e.target.value}})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5">Phone Number</label>
                  <input 
                    type="text" 
                    value={editingOrder.shippingAddress.phone}
                    onChange={(e) => setEditingOrder({...editingOrder, shippingAddress: {...editingOrder.shippingAddress, phone: e.target.value}})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5">City / Zone</label>
                  <input 
                    type="text" 
                    value={editingOrder.shippingAddress.city}
                    onChange={(e) => setEditingOrder({...editingOrder, shippingAddress: {...editingOrder.shippingAddress, city: e.target.value}})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5">Payment Status</label>
                  <select 
                    value={editingOrder.isPaid ? 'true' : 'false'}
                    onChange={(e) => setEditingOrder({...editingOrder, isPaid: e.target.value === 'true'})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-cyan-500 bg-white"
                  >
                    <option value="false">Unpaid</option>
                    <option value="true">Paid</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5">Delivery Address</label>
                  <input 
                    type="text" 
                    value={editingOrder.shippingAddress.address}
                    onChange={(e) => setEditingOrder({...editingOrder, shippingAddress: {...editingOrder.shippingAddress, address: e.target.value}})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Order Items Edit */}
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-3">Order Items (Qty & Price)</label>
                <div className="space-y-3">
                  {editingOrder.orderItems.map((item, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <span className="text-sm font-bold text-gray-800 flex-1">{item.name}</span>
                      <div className="flex items-center gap-4">
                        <div>
                          <span className="text-xs text-gray-500 block mb-1">Quantity</span>
                          <input 
                            type="number" 
                            min="1"
                            value={item.qty}
                            onChange={(e) => handleEditItemChange(idx, 'qty', e.target.value)}
                            className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm font-bold bg-white"
                          />
                        </div>
                        <div>
                          <span className="text-xs text-gray-500 block mb-1">Unit Price (৳)</span>
                          <input 
                            type="number" 
                            min="0"
                            value={item.price}
                            onChange={(e) => handleEditItemChange(idx, 'price', e.target.value)}
                            className="w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm font-bold bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grand Total Override */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pt-4 border-t border-gray-200">
                <span className="text-base font-bold text-gray-800">Total Payable Amount (৳):</span>
                <input 
                  type="number" 
                  value={editingOrder.totalPrice}
                  onChange={(e) => setEditingOrder({...editingOrder, totalPrice: Number(e.target.value)})}
                  className="w-full sm:w-48 border-2 border-cyan-300 rounded-xl px-4 py-2.5 text-right font-black text-cyan-600 text-lg outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-5 border-t border-gray-100 bg-gray-50">
              <button 
                onClick={() => setEditingOrder(null)}
                className="px-6 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-xl transition"
              >
                Cancel
              </button>
              <button 
                onClick={() => updateOrderMutation.mutate(editingOrder)}
                disabled={updateOrderMutation.isPending}
                className="flex items-center gap-2 bg-cyan-600 text-white px-7 py-2.5 rounded-xl text-sm font-bold hover:bg-cyan-700 transition cursor-pointer"
              >
                {updateOrderMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. VIEW & EDIT INVOICE MODAL (Extra Wide & Readable)      */}
      {/* ========================================================= */}
      {invoiceOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden my-8">
            <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100 bg-gray-50">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2.5">
                <FileText className="w-6 h-6 text-cyan-600" /> Invoice Preview & Quick Edit
              </h3>
              <button onClick={() => setInvoiceOrder(null)} className="text-gray-400 hover:text-red-500 p-1">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 sm:p-8 max-h-[78vh] overflow-y-auto space-y-6">
              {/* Editable Customer & Payment Section inside Invoice */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-5 rounded-xl border border-gray-200">
                <div className="space-y-3">
                  <p className="text-xs font-bold text-gray-500 uppercase">Billed To (Editable for Invoice)</p>
                  <input 
                    type="text"
                    value={invoiceOrder.shippingAddress.name}
                    onChange={(e) => setInvoiceOrder({...invoiceOrder, shippingAddress: {...invoiceOrder.shippingAddress, name: e.target.value}})}
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-bold"
                    placeholder="Customer Name"
                  />
                  <input 
                    type="text"
                    value={invoiceOrder.shippingAddress.phone}
                    onChange={(e) => setInvoiceOrder({...invoiceOrder, shippingAddress: {...invoiceOrder.shippingAddress, phone: e.target.value}})}
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm"
                    placeholder="Phone"
                  />
                  <input 
                    type="text"
                    value={invoiceOrder.shippingAddress.address}
                    onChange={(e) => setInvoiceOrder({...invoiceOrder, shippingAddress: {...invoiceOrder.shippingAddress, address: e.target.value}})}
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm"
                    placeholder="Address"
                  />
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-bold text-gray-500 uppercase">Invoice Adjustments</p>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-medium text-gray-700">Shipping Fee (৳):</span>
                    <input 
                      type="number"
                      value={invoiceAdjustments.shippingFee}
                      onChange={(e) => setInvoiceAdjustments({...invoiceAdjustments, shippingFee: e.target.value})}
                      className="w-36 bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-right text-sm font-bold"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-medium text-gray-700">Discount (৳):</span>
                    <input 
                      type="number"
                      value={invoiceAdjustments.discount}
                      onChange={(e) => setInvoiceAdjustments({...invoiceAdjustments, discount: e.target.value})}
                      className="w-36 bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-right text-sm font-bold text-green-600"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-medium text-gray-700">Payment Status:</span>
                    <select 
                      value={invoiceOrder.isPaid ? 'true' : 'false'}
                      onChange={(e) => setInvoiceOrder({...invoiceOrder, isPaid: e.target.value === 'true'})}
                      className="w-36 bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-sm font-bold"
                    >
                      <option value="false">Unpaid</option>
                      <option value="true">Paid</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Editable Items Table */}
              <div className="overflow-x-auto border border-gray-200 rounded-xl">
                <table className="w-full text-left border-collapse min-w-[650px]">
                  <thead>
                    <tr className="bg-gray-100 text-xs font-bold text-gray-600 uppercase">
                      <th className="p-4">Product</th>
                      <th className="p-4 text-center w-28">Qty</th>
                      <th className="p-4 text-right w-36">Price (৳)</th>
                      <th className="p-4 text-right w-36">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {invoiceOrder.orderItems.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-4 flex items-center gap-3">
                          {item.image && <img src={item.image} alt="" className="w-11 h-11 object-contain rounded-lg border border-gray-200 shrink-0" />}
                          <input 
                            type="text"
                            value={item.name}
                            onChange={(e) => {
                              const updated = [...invoiceOrder.orderItems];
                              updated[idx].name = e.target.value;
                              setInvoiceOrder({...invoiceOrder, orderItems: updated});
                            }}
                            className="w-full border border-gray-200 focus:border-cyan-500 rounded-lg px-3 py-2 text-sm font-medium outline-none"
                          />
                        </td>
                        <td className="p-4 text-center">
                          <input 
                            type="number"
                            min="1"
                            value={item.qty}
                            onChange={(e) => {
                              const updated = [...invoiceOrder.orderItems];
                              updated[idx].qty = Number(e.target.value) || 1;
                              setInvoiceOrder({...invoiceOrder, orderItems: updated});
                            }}
                            className="w-20 text-center border border-gray-300 rounded-lg py-2 text-sm font-bold"
                          />
                        </td>
                        <td className="p-4 text-right">
                          <input 
                            type="number"
                            value={item.price}
                            onChange={(e) => {
                              const updated = [...invoiceOrder.orderItems];
                              updated[idx].price = Number(e.target.value) || 0;
                              setInvoiceOrder({...invoiceOrder, orderItems: updated});
                            }}
                            className="w-32 text-right border border-gray-300 rounded-lg px-3 py-2 text-sm font-bold"
                          />
                        </td>
                        <td className="p-4 text-right font-bold text-gray-900">
                          ৳ {(item.qty * item.price).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer Note & Final Total */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-5 pt-2">
                <div className="w-full sm:w-1/2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Invoice Footer Note</label>
                  <input 
                    type="text"
                    value={invoiceAdjustments.note}
                    onChange={(e) => setInvoiceAdjustments({...invoiceAdjustments, note: e.target.value})}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-700"
                  />
                </div>
                <div className="text-right space-y-1.5">
                  <p className="text-sm text-gray-600">
                    Subtotal: <span className="font-bold text-gray-900">৳ {invoiceOrder.orderItems.reduce((s, i) => s + (i.price * i.qty), 0).toLocaleString()}</span>
                  </p>
                  <p className="text-xl font-black text-cyan-600">
                    Grand Total: ৳ {Math.max(0, invoiceOrder.orderItems.reduce((s, i) => s + (i.price * i.qty), 0) + Number(invoiceAdjustments.shippingFee || 0) - Number(invoiceAdjustments.discount || 0)).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-5 border-t border-gray-100 bg-gray-50">
              <button 
                onClick={() => setInvoiceOrder(null)}
                className="px-6 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-xl transition"
              >
                Close
              </button>
              <button 
                onClick={handlePrintInvoice}
                className="flex items-center gap-2 bg-cyan-600 text-white px-7 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-cyan-700 transition cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Print / Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default OrderList;
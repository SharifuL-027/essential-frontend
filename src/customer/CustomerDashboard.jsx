import { useState, useEffect } from 'react';
import { Package, User, Heart, Loader2, LogOut, FileText, ShoppingBag, Download } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import html2pdf from 'html2pdf.js';
import api from '../api/axiosConfig';

// Image URL ke base64 e convert kore (CORS/canvas problem avoid korar jonno)
const toDataUrl = async (url) => {
  try {
    const res = await fetch(url, { mode: 'cors' });
    if (!res.ok) throw new Error('Image fetch failed');
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    return null; // load na hole image skip hobe
  }
};

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [userData, setUserData] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');

    if (userStr) {
      const user = JSON.parse(userStr);
      setUserData(user.user || user);
      setIsGuest(false);

      const fetchMyOrders = async () => {
        try {
          const res = await api.get('/orders/myorders');
          setOrders(res.data.data || res.data);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching orders:', error);
          setLoading(false);
        }
      };
      fetchMyOrders();
    } else {
      setIsGuest(true);
      const guestOrders = JSON.parse(localStorage.getItem('guestOrders')) || [];
      setOrders(guestOrders);
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // 🔥 Direct PDF download (product image shoho)
  const handleDownloadInvoice = async (order) => {
    setDownloadingId(order._id);
    let wrapper = null;

    try {
      const source = document.getElementById(`invoice-print-${order._id}`);
      if (!source) throw new Error('Invoice template not found');

      const clone = source.cloneNode(true);

      // Sob image base64 e convert kori
      const imgs = Array.from(clone.querySelectorAll('img'));
      await Promise.all(
        imgs.map(async (img) => {
          const dataUrl = await toDataUrl(img.getAttribute('src'));
          if (dataUrl) {
            img.setAttribute('src', dataUrl);
          } else {
            img.remove();
          }
        })
      );

      // Off-screen container
      wrapper = document.createElement('div');
      wrapper.style.position = 'fixed';
      wrapper.style.left = '-9999px';
      wrapper.style.top = '0';
      wrapper.style.width = '794px';
      wrapper.style.background = '#ffffff';
      wrapper.style.color = '#1f2937';
      wrapper.appendChild(clone);
      document.body.appendChild(wrapper);

      await html2pdf()
        .set({
          margin: 8,
          filename: `Invoice-${order._id.slice(-8).toUpperCase()}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        })
        .from(clone)
        .save();
    } catch (err) {
      console.error('Invoice download error:', err);
      alert('Invoice download korte problem hoyeche. Abar try korun.');
    } finally {
      if (wrapper && wrapper.parentNode) wrapper.parentNode.removeChild(wrapper);
      setDownloadingId(null);
    }
  };

  // Invoice er jonno inline styles (Tailwind oklch color error avoid korar jonno)
  const s = {
    page: { padding: '32px', maxWidth: '720px', margin: '0 auto', background: '#ffffff', fontFamily: 'Arial, Helvetica, sans-serif', color: '#1f2937' },
    topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e5e7eb', paddingBottom: '20px', marginBottom: '20px' },
    brand: { fontSize: '24px', fontWeight: 900, color: '#0891b2', letterSpacing: '1px', margin: 0 },
    small: { fontSize: '11px', color: '#6b7280', margin: '3px 0 0 0' },
    invTitle: { fontSize: '20px', fontWeight: 700, color: '#1f2937', textTransform: 'uppercase', margin: 0 },
    billBox: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px', padding: '14px', background: '#f9fafb', borderRadius: '10px', border: '1px solid #f3f4f6' },
    label: { fontSize: '10px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 4px 0' },
    name: { fontSize: '14px', fontWeight: 700, color: '#1f2937', margin: 0, textTransform: 'capitalize' },
    text: { fontSize: '11px', color: '#4b5563', margin: '2px 0 0 0' },
    table: { width: '100%', borderCollapse: 'collapse', marginBottom: '20px' },
    th: { background: '#f3f4f6', fontSize: '11px', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', padding: '10px', borderBottom: '1px solid #e5e7eb' },
    td: { padding: '10px', fontSize: '12px', borderBottom: '1px solid #f3f4f6', verticalAlign: 'middle' },
    img: { width: '44px', height: '44px', objectFit: 'contain', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '2px', background: '#ffffff' },
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-28 pb-16 px-4 md:px-6">
      <div className="max-w-6xl mx-auto">

        {/* Header Section */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-600 font-bold text-2xl">
              {isGuest ? 'G' : (userData?.name?.charAt(0).toUpperCase() || 'U')}
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                Hello, {isGuest ? 'Guest User!' : `${userData?.name}!`}
                <span className="text-xl">👋</span>
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {isGuest ? 'Track your recent guest orders here.' : userData?.email}
              </p>
            </div>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            {!isGuest && (
              <span className="px-4 py-2 bg-cyan-50 text-cyan-600 text-xs font-bold uppercase tracking-widest rounded-full border border-cyan-100 flex items-center justify-center">
                Customer
              </span>
            )}
            {isGuest ? (
              <Link to="/login" className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-cyan-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-cyan-700 transition">
                <User className="w-4 h-4" /> Sign In / Register
              </Link>
            ) : (
              <button onClick={handleLogout} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-bold shadow-sm hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-32">
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center gap-3 px-6 py-4 text-sm font-bold transition-colors ${activeTab === 'orders' ? 'bg-cyan-50 text-cyan-600 border-l-4 border-cyan-600' : 'text-gray-600 hover:bg-gray-50 border-l-4 border-transparent'}`}
              >
                <Package className="w-5 h-5" /> My Orders
              </button>

              {!isGuest && (
                <>
                  <Link to="/wishlist" className="w-full flex items-center gap-3 px-6 py-4 text-sm font-bold text-gray-600 hover:bg-gray-50 border-l-4 border-transparent transition-colors">
                    <Heart className="w-5 h-5" /> Wishlist
                  </Link>
                  <button
                    onClick={() => setActiveTab('details')}
                    className={`w-full flex items-center gap-3 px-6 py-4 text-sm font-bold transition-colors ${activeTab === 'details' ? 'bg-cyan-50 text-cyan-600 border-l-4 border-cyan-600' : 'text-gray-600 hover:bg-gray-50 border-l-4 border-transparent'}`}
                  >
                    <User className="w-5 h-5" /> Account Details
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 min-h-100">

              {loading ? (
                <div className="h-full flex flex-col items-center justify-center text-cyan-600 space-y-4 pt-20">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <p className="text-sm font-bold animate-pulse">Loading your data...</p>
                </div>
              ) : (
                <>
                  {activeTab === 'orders' && (
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 pb-4 border-b border-gray-100">
                        <FileText className="w-5 h-5 text-cyan-600" /> My Order History
                      </h2>

                      {orders.length === 0 ? (
                        <div className="text-center py-16 px-4">
                          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                            <Package className="w-10 h-10 text-gray-300" />
                          </div>
                          <h3 className="text-lg font-bold text-gray-800 mb-2">No orders found</h3>
                          <p className="text-gray-500 text-sm mb-6">Looks like you haven't placed any orders yet.</p>
                          <Link to="/shop" className="inline-flex items-center gap-2 bg-cyan-600 text-white px-6 py-3 rounded-lg text-sm font-bold hover:bg-cyan-700 transition">
                            <ShoppingBag className="w-4 h-4" /> Start Shopping
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {orders.map((order) => (
                            <div key={order._id} className="border border-gray-100 rounded-xl overflow-hidden hover:border-cyan-200 transition-colors">

                              {/* Order Header */}
                              <div className="bg-gray-50/50 p-4 md:p-5 flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-gray-100">
                                <div>
                                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                                    Order #{order._id.slice(-8).toUpperCase()}
                                  </p>
                                  <p className="text-sm font-medium text-gray-600">
                                    Placed on {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                                  </p>
                                </div>
                                <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-2">
                                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                    order.isDelivered || order.status === 'Delivered' ? 'bg-cyan-50 text-cyan-600 border border-cyan-100' : 'bg-yellow-50 text-yellow-600 border border-yellow-100'
                                  }`}>
                                    {order.status || (order.isDelivered ? 'Delivered' : 'Processing')}
                                  </span>
                                  <p className="text-sm font-bold text-gray-900">
                                    Total: <span className="text-cyan-600">৳ {order.totalPrice?.toLocaleString()}</span>
                                  </p>
                                </div>
                              </div>

                              {/* Order Items */}
                              <div className="p-4 md:p-5">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Items in this order</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  {order.orderItems?.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-4 p-3 border border-gray-50 rounded-lg bg-white">
                                      <div className="w-16 h-16 rounded-md border border-gray-100 p-1 flex-shrink-0 flex items-center justify-center">
                                        {item.image ? (
                                          <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                                        ) : (
                                          <Package className="w-6 h-6 text-gray-200" />
                                        )}
                                      </div>
                                      <div>
                                        <p className="text-sm font-bold text-gray-800 line-clamp-1">{item.name}</p>
                                        <p className="text-xs font-medium text-gray-500 mt-1">
                                          Qty: {item.qty || item.quantity || 1} <span className="mx-1">•</span> ৳{(item.price || 0).toLocaleString()}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                {/* 🔥 Download Invoice Button */}
                                <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
                                  <button
                                    onClick={() => handleDownloadInvoice(order)}
                                    disabled={downloadingId === order._id}
                                    className="flex items-center gap-2 bg-cyan-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md hover:bg-cyan-700 transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                                  >
                                    {downloadingId === order._id ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <Download className="w-4 h-4" />
                                    )}
                                    {downloadingId === order._id ? 'Generating...' : 'Download Invoice'}
                                  </button>
                                </div>
                              </div>

                              {/* 📄 Hidden Invoice Template (inline styles, no Tailwind) */}
                              <div style={{ display: 'none' }}>
                                <div id={`invoice-print-${order._id}`} style={s.page}>
                                  <div style={s.topRow}>
                                    <div>
                                      <h1 style={s.brand}>ESSENTIAL ZONE</h1>
                                      <p style={s.small}>287/10/1 Pirer Bagh, Jheel Per, Road-3, Mirpur, 1216 Bangladesh</p>
                                      <p style={s.small}>Support: info@essentialzonebd.com</p>
                                      <p style={s.small}>Phone: 01411248042</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                      <h2 style={s.invTitle}>INVOICE</h2>
                                      <p style={s.small}>Invoice ID: #{order._id.slice(-8).toUpperCase()}</p>
                                      <p style={s.small}>Date: {new Date(order.createdAt).toLocaleDateString('en-GB')}</p>
                                    </div>
                                  </div>

                                  <div style={s.billBox}>
                                    <div>
                                      <p style={s.label}>Billed To:</p>
                                      <p style={s.name}>{order.shippingAddress?.name || userData?.name || 'Customer'}</p>
                                      <p style={s.text}>{order.shippingAddress?.phone}</p>
                                      <p style={s.text}>{order.shippingAddress?.address}, {order.shippingAddress?.city}</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                      <p style={s.label}>Payment Method:</p>
                                      <p style={{ ...s.name, color: '#0891b2', textTransform: 'none' }}>{order.paymentMethod || 'Cash On Delivery'}</p>
                                      <p style={{ ...s.text, marginTop: '4px' }}>
                                        Status:{' '}
                                        <span style={{ fontWeight: 700, color: order.isPaid ? '#16a34a' : '#dc2626' }}>
                                          {order.isPaid ? 'Paid' : 'Unpaid'}
                                        </span>
                                      </p>
                                    </div>
                                  </div>

                                  <table style={s.table}>
                                    <thead>
                                      <tr>
                                        <th style={{ ...s.th, textAlign: 'left' }}>Item Description</th>
                                        <th style={{ ...s.th, textAlign: 'center' }}>Qty</th>
                                        <th style={{ ...s.th, textAlign: 'right' }}>Price</th>
                                        <th style={{ ...s.th, textAlign: 'right' }}>Total</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {order.orderItems?.map((item, index) => {
                                        const qty = item.qty || item.quantity || 1;
                                        const price = item.price || 0;
                                        return (
                                          <tr key={index}>
                                            <td style={{ ...s.td, fontWeight: 500 }}>
                                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                {item.image && (
                                                  <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    crossOrigin="anonymous"
                                                    style={s.img}
                                                  />
                                                )}
                                                <span>{item.name}</span>
                                              </div>
                                            </td>
                                            <td style={{ ...s.td, textAlign: 'center', fontWeight: 700 }}>{qty}</td>
                                            <td style={{ ...s.td, textAlign: 'right' }}>৳ {price.toLocaleString()}</td>
                                            <td style={{ ...s.td, textAlign: 'right', fontWeight: 700 }}>৳ {(qty * price).toLocaleString()}</td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>

                                  <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #e5e7eb', paddingTop: '14px' }}>
                                    <div style={{ width: '220px' }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#4b5563', marginBottom: '6px' }}>
                                        <span>Subtotal:</span>
                                        <span>৳ {order.totalPrice?.toLocaleString()}</span>
                                      </div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 900, color: '#0891b2', borderTop: '1px solid #e5e7eb', paddingTop: '8px' }}>
                                        <span>Grand Total:</span>
                                        <span>৳ {order.totalPrice?.toLocaleString()}</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div style={{ marginTop: '48px', textAlign: 'center', borderTop: '1px solid #f3f4f6', paddingTop: '14px', fontSize: '10px', color: '#9ca3af' }}>
                                    Thank you for shopping with Essential Zone!
                                  </div>
                                </div>
                              </div>

                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'details' && !isGuest && (
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 pb-4 border-b border-gray-100">
                        <User className="w-5 h-5 text-cyan-600" /> Account Details
                      </h2>
                      <div className="max-w-md space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-800">
                            {userData?.name}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email Address</label>
                          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-800">
                            {userData?.email}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mt-6 italic">Account details update feature is coming soon.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
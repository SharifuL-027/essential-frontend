import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, CheckCircle, Loader2, Truck, User, Phone, Mail, MapPin } from 'lucide-react';
import api from '../api/axiosConfig';
import toast from 'react-hot-toast';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // 🔥 ডাইনামিক ডেলিভারি চার্জ স্টেট
  const [deliverySettings, setDeliverySettings] = useState({ insideDhaka: 60, outsideDhaka: 120 });
  const [shippingCost, setShippingCost] = useState(60); // ডিফল্ট Inside Dhaka

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: 'Inside Dhaka', // ডিফল্ট ভ্যালু
    postalCode: '',
    orderNotes: ''
  });

  // পেজ লোড হওয়ার সময় কার্ট এবং ডেলিভারি সেটিংস ফেচ করা
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
    if (savedCart.length === 0) {
      navigate('/cart');
    }
    setCartItems(savedCart);

    // ব্যাকএন্ড থেকে ডেলিভারি সেটিংস আনা
    const fetchSettings = async () => {
      try {
        const res = await api.get('/settings/delivery');
        if (res.data && res.data.data) {
          setDeliverySettings(res.data.data);
          setShippingCost(res.data.data.insideDhaka); // ডিফল্ট চার্জ সেট করা
        }
      } catch (error) {
        console.error('Failed to fetch delivery settings', error);
      }
    };
    fetchSettings();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // 🔥 ইউজার সিটি পরিবর্তন করলে শিপিং কস্ট আপডেট করা
    if (name === 'city') {
      if (value === 'Inside Dhaka') {
        setShippingCost(deliverySettings.insideDhaka);
      } else if (value === 'Outside Dhaka') {
        setShippingCost(deliverySettings.outsideDhaka);
      }
    }
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);
  const shipping = subtotal > 0 ? shippingCost : 0; 
  const grandTotal = subtotal + shipping;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const orderData = {
      orderItems: cartItems.map(item => ({
        product: item._id,
        name: item.name,
        image: item.image,
        price: item.price,
        qty: item.quantity || 1
      })),
      shippingAddress: {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
        orderNotes: formData.orderNotes
      },
      paymentMethod: 'Cash on Delivery',
      itemsPrice: subtotal,
      shippingPrice: shipping,
      totalPrice: grandTotal
    };

    try {
      await api.post('/orders', orderData);
      localStorage.removeItem('cart');
      window.dispatchEvent(new Event('storage'));
      
      toast.success('Order placed successfully! 🎉', {
        style: { border: '1px solid #67e8f9', color: '#0891b2' },
        iconTheme: { primary: '#06b6d4', secondary: '#fff' }
      });
      
      setLoading(false);
      navigate('/account');
    } catch (error) {
      console.error(error);
      setErrorMsg(error.response?.data?.message || 'Failed to place order. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-28 pb-16 px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex items-center justify-between mb-8 border-b pb-4 border-gray-200">
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-cyan-600" /> Checkout
          </h1>
          <Link to="/cart" className="text-sm font-bold text-gray-600 hover:text-cyan-600 flex items-center gap-1 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Cart
          </Link>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl mb-6 text-sm font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Side: Billing Details */}
          <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-3">
              <Truck className="w-5 h-5 text-cyan-600" /> Billing & Shipping Details
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    name="name" 
                    required 
                    placeholder="e.g. Md. Shariful Islam"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Phone Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                    <input 
                      type="tel" 
                      name="phone" 
                      required 
                      placeholder="017xxxxxxxx"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Email Address (Optional)</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                    <input 
                      type="email" 
                      name="email" 
                      placeholder="example@gmail.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* 🔥 City Dropdown & Postal Code */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Town / City *</label>
                  <select 
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all cursor-pointer font-medium text-gray-700"
                  >
                    <option value="Inside Dhaka">Inside Dhaka (৳{deliverySettings.insideDhaka})</option>
                    <option value="Outside Dhaka">Outside Dhaka (৳{deliverySettings.outsideDhaka})</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Postal Code *</label>
                  <input 
                    type="text" 
                    name="postalCode" 
                    required 
                    placeholder="e.g. 1216"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Street Address *</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                  <textarea 
                    name="address" 
                    required 
                    rows="3"
                    placeholder="House number, street name, area..."
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all resize-none"
                  ></textarea>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Order Notes (Optional)</label>
                <textarea 
                  name="orderNotes" 
                  rows="2"
                  placeholder="Notes about your order, e.g. special notes for delivery."
                  value={formData.orderNotes}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all resize-none"
                ></textarea>
              </div>

            </div>
          </div>

          {/* Right Side: Order Summary */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-3">Your Order</h2>
              
              <div className="space-y-3 max-h-60 overflow-y-auto mb-4 pr-1 custom-scrollbar">
                {cartItems.map((item) => (
                  <div key={item._id} className="flex items-center justify-between gap-3 text-sm">
                    <div className="flex items-center gap-3">
                      <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover border border-gray-100" />
                      <div>
                        <p className="font-bold text-gray-800 line-clamp-1">{item.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity || 1}</p>
                      </div>
                    </div>
                    <span className="font-bold text-gray-900">৳ {item.price * (item.quantity || 1)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-gray-900">৳ {subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping Fee <span className="text-[10px] bg-cyan-50 text-cyan-600 px-2 py-0.5 rounded-full ml-1 font-bold">{formData.city}</span></span>
                  <span className="font-bold text-gray-900">৳ {shipping}</span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between text-base font-black text-gray-900">
                  <span>Total</span>
                  <span className="text-cyan-600">৳ {grandTotal}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-3">Payment Method</h2>
              
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3.5 border-2 border-cyan-500 bg-cyan-50/50 rounded-xl cursor-pointer">
                  <input type="radio" name="payment" defaultChecked className="w-4 h-4 text-cyan-600" />
                  <span className="font-bold text-gray-900 text-sm flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-cyan-600" /> Cash on Delivery
                  </span>
                </label>
                <p className="text-xs text-gray-500 pl-1">
                  Pay with cash upon delivery. Simple and secure!
                </p>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="mt-6 w-full bg-cyan-600 text-white py-4 rounded-xl font-bold text-sm shadow-lg shadow-cyan-600/20 hover:shadow-cyan-600/40 hover:bg-cyan-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Place Order'}
              </button>
            </div>

          </div>

        </form>

      </div>
    </div>
  );
};

export default CheckoutPage;
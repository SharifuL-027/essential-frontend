import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ShoppingCart } from 'lucide-react';
import api from '../api/axiosConfig'; 

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();

  // কুপন সম্পর্কিত স্টেটসমূহ
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');
  const [isCouponApplied, setIsCouponApplied] = useState(false);

  // পেজ লোড হওয়ার সময় লোকালস্টোরেজ থেকে কার্ট ডেটা লোড করা
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
    setCartItems(savedCart);
  }, []);

  // পরিমাণ (Quantity) বাড়ানো
  const increaseQty = (id) => {
    const updated = cartItems.map(item => {
      if (item._id === id) {
        return { ...item, quantity: (item.quantity || 1) + 1 };
      }
      return item;
    });
    setCartItems(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  // পরিমাণ (Quantity) কমানো
  const decreaseQty = (id) => {
    const updated = cartItems.map(item => {
      if (item._id === id && item.quantity > 1) {
        return { ...item, quantity: item.quantity - 1 };
      }
      return item;
    });
    setCartItems(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  // কার্ট থেকে নির্দিষ্ট আইটেম রিমুভ করা
  const removeItem = (id) => {
    const updated = cartItems.filter(item => item._id !== id);
    setCartItems(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  // 🔥 কুপন ভেরিফাই ও অ্যাপ্লাই করার হ্যান্ডলার
  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    setCouponMessage('');

    if (!couponCode.trim()) return;

    try {
      const res = await api.get(`/coupons/${couponCode}`);
      const discountAmount = res.data.discount || 0;
      
      setDiscount(discountAmount);
      setIsCouponApplied(true);
      setCouponMessage(res.data.message || 'Coupon applied successfully! 🎉');
    } catch (error) {
      console.error(error);
      setCouponMessage(error.response?.data?.message || 'Invalid or expired coupon');
      setDiscount(0);
      setIsCouponApplied(false);
    }
  };

  // মোট দাম হিসাব করা
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);
  const shipping = subtotal > 0 ? 100 : 0; 
  const grandTotal = Math.max(0, subtotal - discount + shipping); 

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-28 pb-20 px-4 md:px-6">
      <div className="max-w-300 mx-auto">
        
        <h1 className="text-2xl md:text-3xl roboto-bold text-gray-900 mb-8 flex items-center gap-3">
          <ShoppingBag className="w-7 h-7 text-cyan-600" /> 
          Shopping Cart 
          <span className="text-lg text-gray-500 roboto-medium bg-gray-100 px-3 py-1 rounded-full">
            {cartItems.length} Items
          </span>
        </h1>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 p-16 text-center">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-10 h-10 text-gray-300" />
            </div>
            <h2 className="text-2xl roboto-bold text-gray-800 mb-3">Your cart is empty!</h2>
            <p className="text-sm roboto-medium text-gray-500 mb-8 max-w-md mx-auto">
              Looks like you haven't added anything to your cart yet. Explore our top categories and find something you love.
            </p>
            <Link to="/shop" className="inline-flex items-center justify-center bg-cyan-600 text-white px-8 py-3.5 rounded-xl roboto-bold text-sm shadow-lg shadow-cyan-600/30 hover:shadow-xl hover:shadow-cyan-600/20 hover:bg-cyan-700 transition-all">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
            
            {/* Left Side: Cart Items List */}
            <div className="lg:col-span-2 space-y-5">
              {cartItems.map((item) => (
                <div key={item._id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100/80 flex flex-col sm:flex-row items-center justify-between gap-6 transition-all hover:shadow-md">
                  
                  <div className="flex items-center gap-5 w-full sm:w-auto">
                    
                    {/* 3D Hover Flip Image Container */}
                    <div className="group relative w-24 h-24 rounded-xl shrink-0 cursor-pointer perspective-[1000px]">
                      <div className="w-full h-full transition-transform duration-700 ease-in-out transform-3d group-hover:transform-[rotateY(180deg)]">
                        
                        {/* Front (Main Image) */}
                        <div className="absolute inset-0 backface-hidden">
                          <img 
                            src={item.image || 'https://placehold.co/100x100'} 
                            alt={item.name} 
                            className="w-full h-full object-cover rounded-xl border border-gray-100 bg-white shadow-sm" 
                          />
                        </div>
                        
                        {/* Back (2nd Image) */}
                        <div className="absolute inset-0 backface-hidden transform-[rotateY(180deg)]">
                          <img 
                            src={item.images?.[1] || item.image || 'https://placehold.co/100x100'} 
                            alt={`${item.name} alternate`} 
                            className="w-full h-full object-cover rounded-xl border border-gray-100 bg-white shadow-sm" 
                          />
                        </div>
                        
                      </div>
                    </div>

                    <div className="flex-1">
                      <h3 className="roboto-bold text-gray-900 text-[15px] line-clamp-2 leading-snug hover:text-cyan-600 transition-colors cursor-pointer">
                        {item.name}
                      </h3>
                      <p className="text-cyan-600 roboto-bold text-sm mt-1.5">৳ {item.price?.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Controls & Price */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center border border-gray-200 rounded-xl p-1 bg-gray-50">
                      <button onClick={() => decreaseQty(item._id)} className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition text-gray-600 shadow-sm hover:text-gray-900">
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-10 text-center text-sm roboto-bold text-gray-800">{item.quantity || 1}</span>
                      <button onClick={() => increaseQty(item._id)} className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition text-gray-600 shadow-sm hover:text-gray-900">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Total Item Price */}
                    <div className="text-right min-w-20">
                      <p className="roboto-black text-gray-900 text-base">৳ {(item.price * (item.quantity || 1)).toLocaleString()}</p>
                    </div>

                    {/* Remove Button */}
                    <button 
                      onClick={() => removeItem(item._id)}
                      className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2.5 rounded-xl transition-all"
                      title="Remove item"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                </div>
              ))}
            </div>

            {/* Right Side: Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white p-7 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 sticky top-32">
                <h2 className="text-xl roboto-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-cyan-600 rounded-full"></span>
                  Order Summary
                </h2>
                
                {/* Coupon Input Section */}
                <div className="mb-7 bg-gray-50/80 p-4 rounded-2xl border border-gray-100">
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Coupon Code" 
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      disabled={isCouponApplied}
                      className="flex-1 p-3 border border-gray-200 rounded-xl text-sm uppercase outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 disabled:bg-gray-100 roboto-medium placeholder:normal-case transition-all"
                    />
                    <button 
                      type="submit"
                      disabled={isCouponApplied || !couponCode}
                      className="bg-gray-900 text-white px-5 py-3 rounded-xl text-xs roboto-bold hover:bg-cyan-600 transition-all disabled:opacity-50 cursor-pointer shadow-sm"
                    >
                      {isCouponApplied ? 'Applied' : 'Apply'}
                    </button>
                  </form>
                  {couponMessage && (
                    <p className={`text-xs mt-3 flex items-center gap-1.5 roboto-medium ${isCouponApplied ? 'text-green-600' : 'text-red-500'}`}>
                      {isCouponApplied && <span className="w-2 h-2 rounded-full bg-green-500"></span>}
                      {couponMessage}
                    </p>
                  )}
                </div>

                <div className="space-y-4 text-sm text-gray-600 mb-8 roboto-medium">
                  <div className="flex justify-between items-center">
                    <span>Subtotal</span>
                    <span className="roboto-bold text-gray-900 text-base">৳ {subtotal.toLocaleString()}</span>
                  </div>

                  {/* Discount Display */}
                  {discount > 0 && (
                    <div className="flex justify-between items-center text-green-600">
                      <span>Discount</span>
                      <span className="roboto-bold">- ৳ {discount.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                    <span>Shipping Fee</span>
                    <span className="roboto-bold text-gray-900 text-base">৳ {shipping.toLocaleString()}</span>
                  </div>
                  
                  <div className="pt-2 flex justify-between items-center text-lg">
                    <span className="roboto-bold text-gray-900">Total</span>
                    <span className="roboto-black text-cyan-600 text-xl">৳ {grandTotal.toLocaleString()}</span>
                  </div>
                </div>

                <button 
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-cyan-600 text-white py-4 rounded-xl roboto-bold text-sm uppercase tracking-wider shadow-lg shadow-cyan-600/30 hover:shadow-xl hover:shadow-cyan-600/20 hover:bg-cyan-700 transition-all flex items-center justify-center gap-2"
                >
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </button>

              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default CartPage;
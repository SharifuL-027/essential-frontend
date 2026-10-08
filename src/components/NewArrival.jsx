import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axiosConfig'; // পাথ ঠিক আছে কি না চেক করে নিও
import { Loader2, Heart, Maximize2, Eye, ShoppingBag, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast'; 

const NewArrival = () => {
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    const savedWishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    setWishlist(savedWishlist);
  }, []);

  const { data: productRes, isLoading } = useQuery({
    queryKey: ['new-arrivals'],
    queryFn: async () => {
      const res = await api.get(`/products?limit=100`); 
      return res.data;
    },
  });

  const allProducts = productRes?.products || [];
  // 🔥 শেষের ২০টি প্রোডাক্ট উল্টো করে দেখানো হচ্ছে (যাতে একদম লেটেস্টটা আগে থাকে)
  const newArrivals = [...allProducts].reverse().slice(0, 20);

  const handleToggleWishlist = (product, e) => {
    e.preventDefault();
    let updatedWishlist = [...wishlist];
    const index = updatedWishlist.findIndex((item) => item._id === product._id);
    if (index > -1) {
      updatedWishlist.splice(index, 1);
      toast.error('Removed from Wishlist 💔');
    } else {
      updatedWishlist.push(product);
      toast.success('Added to Wishlist! ❤️');
    }
    setWishlist(updatedWishlist);
    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
    window.dispatchEvent(new Event('storage'));
  };

  const handleAddToCart = (product, e) => {
    e.preventDefault();
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingIndex = cart.findIndex((item) => item._id === product._id);
    if (existingIndex > -1) {
      cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('storage'));
    toast.success('Added to cart successfully! 🛒', { style: { border: '1px solid #67e8f9', color: '#0891b2' }, iconTheme: { primary: '#06b6d4', secondary: '#fff' } });
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-32 pb-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 text-center flex flex-col items-center">
          <div className="w-12 h-12 bg-cyan-100 rounded-full flex justify-center items-center mb-3">
            <Zap className="w-6 h-6 text-cyan-600" />
          </div>
          <h1 className="text-4xl roboto-black text-gray-900">New Arrivals</h1>
          <p className="text-gray-500 roboto-medium mt-2 max-w-2xl mx-auto">
            Check out our latest and trendiest products just added to the store.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-cyan-600" /></div>
        ) : newArrivals.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {newArrivals.map((product) => {
              const isWishlisted = wishlist.some((item) => item._id === product._id);
              const discount = product.oldPrice ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;
              return (
                <div key={product._id} className="group flex flex-col">
                  <div className="relative w-full h-80 bg-[#edf0f5] rounded-xl p-4 flex items-center justify-center overflow-hidden shadow-sm">
                    <span className="absolute top-3 left-3 bg-cyan-600 text-white text-[10px] roboto-bold px-2.5 py-1 rounded shadow-sm uppercase tracking-wider z-10">NEW</span>
                    {discount > 0 && <span className="absolute top-3 left-[56px] bg-[#ff5722] text-white text-[10px] roboto-bold px-2 py-1 rounded-md shadow-sm z-10">-{discount}%</span>}
                    <Link to={`/product/${product._id}`} className="w-full h-full flex items-center justify-center">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover mix-blend-multiply rounded-lg group-hover:scale-105 transition-transform duration-500" />
                    </Link>
                    <div className="absolute top-3 right-3 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                      <button onClick={(e) => handleToggleWishlist(product, e)} className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 text-gray-700 hover:text-red-500 transition-colors">
                        <Heart className={`w-4 h-4 ${isWishlisted ? "text-red-500 fill-red-500" : ""}`} />
                      </button>
                      <button onClick={(e) => { e.preventDefault(); toast('Zoom feature coming soon!', { icon: '🔍', style: { color: '#0891b2' } }); }} className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 text-gray-700 hover:text-cyan-600 transition-colors"><Maximize2 className="w-4 h-4" /></button>
                      <Link to={`/product/${product._id}`} className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 text-gray-700 hover:text-cyan-600 transition-colors flex justify-center items-center"><Eye className="w-4 h-4" /></Link>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-300 z-10">
                      <button onClick={(e) => handleAddToCart(product, e)} className="w-full bg-[#1e293b] text-white py-3 rounded-lg text-xs roboto-bold uppercase tracking-wider shadow-lg hover:bg-cyan-600 transition-colors flex items-center justify-center gap-1.5">
                        <ShoppingBag className="w-4 h-4" /> Add to cart
                      </button>
                    </div>
                  </div>
                  <div className="text-center mt-4">
                    <Link to={`/product/${product._id}`}><h3 className="roboto-semibold text-gray-800 text-sm hover:text-cyan-600 transition-colors line-clamp-1">{product.name}</h3></Link>
                    <div className="flex items-center justify-center gap-2 mt-1.5">
                      <span className="text-cyan-600 roboto-bold text-base">৳ {product.price?.toLocaleString()}</span>
                      {product.oldPrice && <span className="text-gray-400 text-sm line-through roboto-medium">৳ {product.oldPrice?.toLocaleString()}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm"><p className="text-gray-500 roboto-medium">No new products available right now!</p></div>
        )}
      </div>
    </div>
  );
};

export default NewArrival;
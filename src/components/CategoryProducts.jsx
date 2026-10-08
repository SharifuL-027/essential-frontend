import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axiosConfig';
import { Loader2, Heart, Maximize2, Eye, ShoppingBag } from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast'; // 🔥 টোস্ট ইম্পোর্ট করা হলো

const CategoryProducts = () => {
  const { slug } = useParams(); // URL থেকে স্লাগ ধরবে (যেমন: 'tws')

  const [wishlist, setWishlist] = useState([]);

  // লোড হওয়ার সময় লোকালস্টোরেজ থেকে উইশলিস্ট তুলে আনা
  useEffect(() => {
    const savedWishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    setWishlist(savedWishlist);
  }, []);

  // সরাসরি স্লাগ দিয়ে ব্যাকএন্ড থেকে প্রোডাক্ট ফেচ করা
  const { data: productRes, isLoading } = useQuery({
    queryKey: ['category-products', slug],
    queryFn: async () => {
      const res = await api.get(`/products?categorySlug=${slug}`);
      return res.data;
    },
    enabled: !!slug,
  });

  const products = productRes?.products || [];

  // 🔥 উইশলিস্ট টগল হ্যান্ডলার (টোস্ট মেসেজসহ)
  const handleToggleWishlist = (product, e) => {
    e.preventDefault();
    let updatedWishlist = [...wishlist];
    const index = updatedWishlist.findIndex((item) => item._id === product._id);

    if (index > -1) {
      updatedWishlist.splice(index, 1);
      toast.error('Removed from Wishlist 💔', {
        style: { border: '1px solid #fecaca', color: '#ef4444' }
      });
    } else {
      updatedWishlist.push(product);
      toast.success('Added to Wishlist! ❤️', {
        style: { border: '1px solid #fecaca', color: '#ef4444' },
        iconTheme: { primary: '#ef4444', secondary: '#fff' },
      });
    }

    setWishlist(updatedWishlist);
    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
    window.dispatchEvent(new Event('storage')); // ন্যাভবারের কাউন্ট আপডেট করার জন্য
  };

  // 🔥 অ্যাড টু কার্ট হ্যান্ডলার (টোস্ট মেসেজসহ)
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
    window.dispatchEvent(new Event('storage')); // ন্যাভবারের কার্ট কাউন্ট আপডেট করার জন্য
    
    // Alert মুছে সুন্দর টোস্ট নোটিফিকেশন দেওয়া হলো
    toast.success('Added to cart successfully! 🛒', {
      style: { border: '1px solid #d8b4fe', color: '#6b21a8' },
      iconTheme: { primary: '#6b21a8', secondary: '#fff' },
    });
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-32 pb-16 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 border-b pb-4">
          <h1 className="text-3xl roboto-black text-gray-900 capitalize">
            {slug ? slug.replace(/-/g, ' ') : 'Category'} Products
          </h1>
          <p className="text-sm roboto-medium text-gray-500 mt-1">Explore our exclusive collection</p>
        </div>

        {/* Products Grid / Loading / Empty State */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-[#6b21a8]" />
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((product) => {
              const isWishlisted = wishlist.some((item) => item._id === product._id);

              return (
                <div key={product._id} className="group flex flex-col">
                  
                  {/* Image Container with Soft Background */}
                  <div className="relative w-full h-80 bg-[#edf0f5] rounded-xl p-4 flex items-center justify-center overflow-hidden shadow-sm">
                    
                    {/* Pre-Order / Hot Badge */}
                    <span className="absolute top-3 left-3 bg-[#2563eb] text-white text-[10px] roboto-bold px-2.5 py-1 rounded shadow-sm uppercase tracking-wider z-10">
                      Pre-Order
                    </span>

                    {/* Product Image with Zoom on Hover */}
                    <Link to={`/product/${product._id}`} className="w-full h-full flex items-center justify-center">
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-500" 
                      />
                    </Link>

                    {/* Top-Right Action Buttons (Wishlist, Zoom, Quick View) */}
                    <div className="absolute top-3 right-3 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                      
                      {/* Wishlist Button */}
                      <button 
                        onClick={(e) => handleToggleWishlist(product, e)}
                        className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 text-gray-700 hover:text-red-500 transition-colors"
                        title="Wishlist"
                      >
                        <Heart className={`w-4 h-4 ${isWishlisted ? "text-red-500 fill-red-500" : ""}`} />
                      </button>

                      {/* Zoom/Expand Button */}
                      <button 
                        onClick={(e) => { e.preventDefault(); toast('Zoom feature coming soon!', { icon: '🔍' }); }}
                        className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 text-gray-700 transition-colors"
                        title="Zoom Image"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </button>

                      {/* Details / Eye Button */}
                      <Link 
                        to={`/product/${product._id}`}
                        className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 text-gray-700 transition-colors flex items-center justify-center"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>

                    </div>

                    {/* Bottom Slide-up "Add to cart" Button */}
                    <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-300 z-10">
                      <button 
                        onClick={(e) => handleAddToCart(product, e)}
                        className="w-full bg-white text-gray-900 py-3 rounded-lg text-xs roboto-bold uppercase tracking-wider shadow-lg hover:bg-[#6b21a8] hover:text-white transition-colors flex items-center justify-center gap-1.5"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        Add to cart
                      </button>
                    </div>

                  </div>

                  {/* Product Details Below Card */}
                  <div className="text-center mt-4">
                    <Link to={`/product/${product._id}`}>
                      <h3 className="roboto-semibold text-gray-800 text-sm hover:text-[#6b21a8] transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="flex items-center justify-center gap-2 mt-1.5">
                      <span className="text-[#6b21a8] roboto-bold text-base">৳ {product.price?.toLocaleString()}</span>
                      {product.oldPrice && (
                        <span className="text-gray-400 text-sm line-through roboto-medium">৳ {product.oldPrice?.toLocaleString()}</span>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-gray-500 roboto-medium">No products found in this category yet!</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default CategoryProducts;
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axiosConfig';
import { Loader2, Heart, Maximize2, Eye, ShoppingBag } from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const BrandProducts = () => {
  const { brandName } = useParams();
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    const savedWishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    setWishlist(savedWishlist);
  }, []);

  const { data: productRes, isLoading } = useQuery({
    queryKey: ['brand-products', brandName],
    queryFn: async () => {
      const res = await api.get(`/products?brand=${brandName}`);
      return res.data;
    },
    enabled: !!brandName,
  });

  const products = productRes?.products || [];

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
    window.dispatchEvent(new Event('storage'));
  };

  // Strict স্টক ভ্যালিডেশন সহ Add to Cart হ্যান্ডলার
  const handleAddToCart = (product, e) => {
    e.preventDefault();
    const availableStock = Number(product.stock ?? 0);

    if (availableStock <= 0) {
      toast.error('Sorry, this product is out of stock!');
      return;
    }

    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingIndex = cart.findIndex((item) => item._id === product._id);
    const currentQtyInCart = existingIndex > -1 ? Number(cart[existingIndex].quantity || 1) : 0;

    if (currentQtyInCart + 1 > availableStock) {
      toast.error(`Maximum stock reached! Only ${availableStock} item(s) available.`);
      return;
    }
    
    if (existingIndex > -1) {
      cart[existingIndex].quantity = currentQtyInCart + 1;
      cart[existingIndex].stock = availableStock;
    } else {
      cart.push({ ...product, stock: availableStock, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('storage'));
    
    toast.success('Added to cart successfully! 🛒', {
      style: { border: '1px solid #67e8f9', color: '#0891b2' },
      iconTheme: { primary: '#06b6d4', secondary: '#fff' },
    });
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-32 pb-16 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 border-b pb-4">
          <h1 className="text-3xl roboto-black text-gray-900 capitalize">
            {brandName} Products
          </h1>
          <p className="text-sm text-gray-500 roboto-medium mt-1">
            Explore the best from {brandName}
          </p>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((product) => {
              const isWishlisted = wishlist.some((item) => item._id === product._id);
              const availableStock = Number(product.stock ?? 0);
              const isOutOfStock = availableStock <= 0;

              return (
                <div key={product._id} className="group flex flex-col">
                  {/* Image Container */}
                  <div className="relative w-full h-80 bg-[#edf0f5] rounded-xl p-4 flex items-center justify-center overflow-hidden shadow-sm">
                    <div className="absolute top-3 left-3 flex flex-col gap-1 z-10 pointer-events-none">
                      {isOutOfStock ? (
                        <span className="bg-red-600 text-white text-[10px] roboto-bold px-2.5 py-1 rounded shadow-sm uppercase tracking-wider w-max">
                          Out of Stock
                        </span>
                      ) : (
                        <span className="bg-cyan-600 text-white text-[10px] roboto-bold px-2.5 py-1 rounded shadow-sm uppercase tracking-wider w-max">
                          Brand
                        </span>
                      )}
                    </div>

                    <Link to={`/product/${product._id}`} className="w-full h-full flex items-center justify-center">
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className={`w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-500 ${isOutOfStock ? 'opacity-65' : ''}`} 
                      />
                    </Link>

                    {/* Actions */}
                    <div className="absolute top-3 right-3 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                      <button type="button" onClick={(e) => handleToggleWishlist(product, e)} className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 text-gray-700 hover:text-red-500 transition-colors cursor-pointer">
                        <Heart className={`w-4 h-4 ${isWishlisted ? "text-red-500 fill-red-500" : ""}`} />
                      </button>
                      <button type="button" onClick={(e) => { e.preventDefault(); toast('Zoom feature coming soon!', { icon: '🔍' }); }} className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 text-gray-700 transition-colors cursor-pointer">
                        <Maximize2 className="w-4 h-4" />
                      </button>
                      <Link to={`/product/${product._id}`} className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 text-gray-700 transition-colors flex justify-center items-center">
                        <Eye className="w-4 h-4" />
                      </Link>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-300 z-10">
                      <button 
                        type="button"
                        disabled={isOutOfStock}
                        onClick={(e) => handleAddToCart(product, e)} 
                        className="w-full bg-white text-gray-900 py-3 rounded-lg text-xs roboto-bold uppercase tracking-wider shadow-lg hover:bg-cyan-600 hover:text-white transition-colors flex items-center justify-center gap-1.5 disabled:bg-gray-200 disabled:text-gray-500 disabled:hover:bg-gray-200 disabled:hover:text-gray-500 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <ShoppingBag className="w-4 h-4" /> {isOutOfStock ? 'Out of Stock' : 'Add to cart'}
                      </button>
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="text-center mt-4">
                    <Link to={`/product/${product._id}`}>
                      <h3 className="roboto-semibold text-gray-800 text-sm hover:text-cyan-600 transition-colors truncate">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="flex items-center justify-center gap-2 mt-1.5">
                      <span className="text-cyan-600 roboto-bold text-base">৳ {product.price?.toLocaleString()}</span>
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
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
            <p className="text-gray-500 roboto-medium">No products found for this brand yet!</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default BrandProducts;
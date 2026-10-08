import { useState, useEffect } from 'react';
import { Heart, Maximize, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const exists = wishlist.some(item => item._id === product._id);
    setIsWishlisted(exists);
  }, [product._id]);

  const toggleWishlist = (e) => {
    e.preventDefault();
    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const exists = wishlist.some(item => item._id === product._id);

    if (exists) {
      wishlist = wishlist.filter(item => item._id !== product._id);
      setIsWishlisted(false);
      toast.error('Removed from Wishlist 💔', {
        style: { border: '1px solid #fecaca', color: '#ef4444' }
      });
    } else {
      wishlist.push(product);
      setIsWishlisted(true);
      toast.success('Added to Wishlist! ❤️', {
        style: { border: '1px solid #fecaca', color: '#ef4444' },
        iconTheme: { primary: '#ef4444', secondary: '#fff' },
      });
    }
    
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    window.dispatchEvent(new Event('storage'));
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const index = cart.findIndex(item => item._id === product._id);

    if (index > -1) {
      cart[index].quantity = (cart[index].quantity || 1) + 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('storage'));
    
    // 🔥 Cyan থিমের টোস্ট নোটিফিকেশন
    toast.success('Added to cart successfully! 🛒', {
      style: { border: '1px solid #67e8f9', color: '#0891b2' },
      iconTheme: { primary: '#06b6d4', secondary: '#fff' },
    });
  };

  const discount = product.oldPrice ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;

  return (
    <div className="flex flex-col group">
      {/* --- Image Container (Hover Area) --- */}
      <div className="relative bg-[#cfd4dc] aspect-[4/5] flex justify-center items-center overflow-hidden mb-4 rounded-md">
        
        {/* Clickable Image */}
        <Link to={`/product/${product._id}`} className="absolute inset-0 flex justify-center items-center z-0 p-8">
          <img 
            src={product.image || product.images?.[0] || "https://placehold.co/300"} 
            alt={product.name} 
            className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
          />
        </Link>

        {/* Top Left Badges (Cyan Colors) */}
        <div className="absolute top-4 left-4 flex flex-col gap-1 z-10 pointer-events-none">
          <span className="bg-cyan-500 text-white text-[11px] roboto-bold px-2 py-1 shadow-sm uppercase tracking-wider rounded-sm">
            Pre-Order
          </span>
          {discount > 0 && (
            <span className="bg-cyan-600 text-white text-[11px] roboto-bold px-2 py-1 shadow-sm w-max rounded-sm">
              -{discount}%
            </span>
          )}
        </div>

        {/* Action Icons (Hover Effect with Cyan) */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-10 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
          
          <button 
            onClick={toggleWishlist} 
            className={`w-9 h-9 bg-white flex justify-center items-center transition-colors shadow-sm rounded-md ${isWishlisted ? 'text-red-500' : 'text-gray-500 hover:text-cyan-500'}`}
            title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500' : ''}`} />
          </button>
          
          <Link to={`/product/${product._id}`} className="w-9 h-9 bg-white flex justify-center items-center text-gray-500 hover:text-cyan-500 transition-colors shadow-sm rounded-md">
            <Eye className="w-4 h-4" />
          </Link>
        </div>

        {/* Add to Cart Button (Cyan Hover Effect) */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-[85%] z-10 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
          <button 
            onClick={handleAddToCart} 
            className="w-full bg-white text-[#1e293b] roboto-bold uppercase tracking-wider py-2.5 text-xs shadow-lg hover:bg-cyan-500 hover:text-white transition-colors rounded-md"
          >
            Add to cart
          </button>
        </div>
      </div>

      {/* --- Product Details (Cyan Accents) --- */}
      <div className="text-center px-2">
        <Link to={`/product/${product._id}`}>
          <h3 className="text-gray-800 roboto-semibold text-[14px] leading-tight truncate hover:text-cyan-600 transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="mt-2 flex items-center justify-center gap-2">
          <span className="text-cyan-600 roboto-bold text-lg">
            ৳ {product.price?.toLocaleString()}
          </span>
          {product.oldPrice && (
            <span className="text-gray-400 line-through text-xs roboto-medium">
              ৳ {product.oldPrice.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
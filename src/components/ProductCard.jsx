import { useState, useEffect } from 'react';
import { Heart, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);

  // 🔥 স্টক সংখ্যা নিরাপদভাবে বের করা
  const availableStock = Number(product.stock ?? 0);
  const isOutOfStock = availableStock <= 0;

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

  // 🔥 স্টক লিমিট চেক সহ Add to Cart হ্যান্ডলার
  const handleAddToCart = (e) => {
    e.preventDefault();
    
    if (isOutOfStock) {
      toast.error('Sorry, this product is out of stock!');
      return;
    }

    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const index = cart.findIndex(item => item._id === product._id);
    const currentQtyInCart = index > -1 ? Number(cart[index].quantity || 1) : 0;

    // স্টকের চেয়ে বেশি অ্যাড করতে চাইলে ব্লক করবে
    if (currentQtyInCart + 1 > availableStock) {
      toast.error(`Maximum stock reached! Only ${availableStock} item(s) available.`);
      return;
    }

    if (index > -1) {
      cart[index].quantity = currentQtyInCart + 1;
      cart[index].stock = availableStock;
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

  const priceNum = Number(product.price) || 0;
  const oldPriceNum = Number(product.oldPrice) || 0;
  const discount = (oldPriceNum > priceNum) ? Math.round(((oldPriceNum - priceNum) / oldPriceNum) * 100) : 0;

  return (
    <div className="flex flex-col group w-full">
      {/* --- Image Container (Hover Area) --- */}
      <div className="relative bg-[#cfd4dc] aspect-square flex justify-center items-center overflow-hidden mb-3 md:mb-4 rounded-md">
        
        {/* Clickable Image */}
        <Link to={`/product/${product._id}`} className="absolute inset-0 flex justify-center items-center z-0">
          <img 
            src={product.image || product.images?.[0] || "https://placehold.co/300"} 
            alt={product.name} 
            className={`w-full h-full object-cover mix-blend-multiply hover:scale-[1.15] transition-transform duration-500 ease-out ${isOutOfStock ? 'opacity-65' : ''}`}
          />
        </Link>

        {/* Top Left Badges */}
        <div className="absolute top-2 left-2 md:top-4 md:left-4 flex flex-col gap-1 z-10 pointer-events-none">
          {isOutOfStock && (
            <span className="bg-red-600 text-white text-[9px] md:text-[11px] roboto-bold px-1.5 md:px-2 py-0.5 md:py-1 shadow-sm uppercase tracking-wider rounded-sm w-max">
              Out of Stock
            </span>
          )}
          {discount > 0 && !isOutOfStock && (
            <span className="bg-cyan-600 text-white text-[9px] md:text-[11px] roboto-bold px-1.5 md:px-2 py-0.5 md:py-1 shadow-sm w-max rounded-sm">
              -{discount}%
            </span>
          )}
        </div>

        {/* Action Icons */}
        <div className="absolute top-2 right-2 md:top-4 md:right-4 flex flex-col gap-1.5 md:gap-2 z-10 lg:opacity-0 lg:group-hover:opacity-100 lg:translate-x-4 lg:group-hover:translate-x-0 transition-all duration-300">
          <button 
            type="button"
            onClick={toggleWishlist} 
            className={`w-7 h-7 md:w-9 md:h-9 bg-white/90 backdrop-blur-sm md:bg-white flex justify-center items-center transition-colors shadow-sm rounded-md cursor-pointer ${isWishlisted ? 'text-red-500' : 'text-gray-500 hover:text-cyan-500'}`}
            title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart className={`w-3.5 h-3.5 md:w-4 md:h-4 ${isWishlisted ? 'fill-red-500' : ''}`} />
          </button>
          
          <Link to={`/product/${product._id}`} className="w-7 h-7 md:w-9 md:h-9 bg-white/90 backdrop-blur-sm md:bg-white justify-center items-center text-gray-500 hover:text-cyan-500 transition-colors shadow-sm rounded-md hidden md:flex">
            <Eye className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </Link>
        </div>

        {/* Add to Cart Button */}
        <div className="absolute bottom-2 md:bottom-5 left-1/2 -translate-x-1/2 w-[90%] md:w-[85%] z-10 lg:opacity-0 lg:group-hover:opacity-100 lg:translate-y-4 lg:group-hover:translate-y-0 transition-all duration-300">
          <button 
            type="button"
            onClick={handleAddToCart} 
            disabled={isOutOfStock}
            className="w-full bg-white/95 backdrop-blur-sm md:bg-white text-[#1e293b] roboto-bold uppercase tracking-wider py-1.5 md:py-2.5 text-[10px] md:text-xs shadow-lg hover:bg-cyan-500 hover:text-white transition-colors rounded-md disabled:bg-gray-200 disabled:text-gray-500 disabled:hover:bg-gray-200 disabled:hover:text-gray-500 disabled:cursor-not-allowed cursor-pointer"
          >
            {isOutOfStock ? 'Out of Stock' : 'Add to cart'}
          </button>
        </div>
      </div>

      {/* --- Product Details --- */}
      <div className="text-center px-1 md:px-2">
        <Link to={`/product/${product._id}`}>
          <h3 className="text-gray-800 roboto-semibold text-[12px] sm:text-[13px] md:text-[14px] leading-snug line-clamp-2 md:truncate hover:text-cyan-600 transition-colors min-h-[36px] md:min-h-auto">
            {product.name}
          </h3>
        </Link>
        <div className="mt-1 md:mt-2 flex flex-wrap items-center justify-center gap-1.5 md:gap-2">
          <span className="text-cyan-600 roboto-bold text-sm sm:text-base md:text-lg">
            ৳ {priceNum.toLocaleString()}
          </span>
          {oldPriceNum > priceNum && (
            <span className="text-gray-400 line-through text-[10px] md:text-xs roboto-medium">
              ৳ {oldPriceNum.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
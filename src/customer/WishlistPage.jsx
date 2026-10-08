import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';

const WishlistPage = () => {
  const [wishlistItems, setWishlistItems] = useState([]);

  // পেজ লোড হওয়ার সময় লোকালস্টোরেজ থেকে উইশলিস্ট ডেটা ফেচ করা
  useEffect(() => {
    const savedWishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    setWishlistItems(savedWishlist);
  }, []);

  // উইশলিস্ট থেকে রিমুভ করা
  const removeFromWishlist = (id) => {
    const updated = wishlistItems.filter(item => item._id !== id);
    setWishlistItems(updated);
    localStorage.setItem('wishlist', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage')); // নেভবারের ব্যাজ আপডেট করার জন্য
  };

  // উইশলিস্ট থেকে সরাসরি কার্টে অ্যাড করা
  const addToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const index = cart.findIndex(item => item._id === product._id);

    if (index > -1) {
      cart[index].quantity = (cart[index].quantity || 1) + 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('storage')); // নেভবার কার্ট কাউন্ট আপডেট করার জন্য
    alert('Product added to cart successfully! 🛒');
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-28 pb-16 px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8 border-b pb-4">
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Heart className="w-6 h-6 text-red-500 fill-red-500" /> My Wishlist ({wishlistItems.length})
          </h1>
          <Link to="/" className="text-sm font-bold text-gray-600 hover:text-[#6b21a8] flex items-center gap-1 transition">
            <ArrowLeft className="w-4 h-4" /> Continue Shopping
          </Link>
        </div>

        {/* Empty State */}
        {wishlistItems.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">Your wishlist is empty!</h2>
            <p className="text-sm text-gray-500 mb-6">Explore our products and save your favorite items here.</p>
            <Link to="/" className="bg-[#6b21a8] text-white px-6 py-3 rounded-xl font-bold text-sm shadow-sm hover:bg-purple-800 transition">
              Explore Products
            </Link>
          </div>
        ) : (
          /* Wishlist Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlistItems.map((product) => (
              <div key={product._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group">
                
                {/* Product Image & Remove Button */}
                <div className="relative bg-[#cfd4dc] aspect-4/5 flex justify-center items-center overflow-hidden">
                  <Link to={`/product/${product._id}`} className="absolute inset-0 p-6 flex justify-center items-center">
                    <img 
                      src={product.image || 'https://placehold.co/300'} 
                      alt={product.name} 
                      className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>
                  <button 
                    onClick={() => removeFromWishlist(product._id)}
                    className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-red-500 hover:bg-white shadow transition"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Details & Add to Cart */}
                <div className="p-4 flex flex-col flex-1 justify-between">
                  <div>
                    <Link to={`/product/${product._id}`}>
                      <h3 className="font-bold text-gray-900 text-sm line-clamp-1 hover:text-[#6b21a8] transition">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-[#6b21a8] font-black text-base mt-1">৳ {product.price?.toLocaleString()}</p>
                  </div>

                  <button 
                    onClick={() => addToCart(product)}
                    className="mt-4 w-full bg-gray-900 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 hover:bg-[#6b21a8] transition shadow-sm"
                  >
                    <ShoppingBag className="w-4 h-4" /> Add to Cart
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default WishlistPage;
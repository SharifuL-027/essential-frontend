import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Maximize, Eye, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

// ফ্রেমার মোশন ভ্যারিয়েন্ট
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const TrendingProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ব্যাকএন্ড থেকে ডেটা আনার জন্য useEffect (Error Fixed)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        const response = await axios.get(`${apiUrl}/products`); 
        
        // ডেটাটা অ্যারে কি না সেটা চেক করে সেট করছি
        let productsArray = [];
        if (Array.isArray(response.data)) {
            productsArray = response.data;
        } else if (response.data.products && Array.isArray(response.data.products)) {
            productsArray = response.data.products;
        } else if (response.data.data && Array.isArray(response.data.data)) {
            productsArray = response.data.data;
        }

        setProducts(productsArray.slice(0, 4));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="bg-[#FAFAFA] py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="flex justify-center items-center mb-12">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight flex items-center justify-center gap-3">
              <span className="text-4xl">🔥</span> Hot Products 
              <span className="bg-red-100 text-red-600 text-sm font-bold px-3 py-1 rounded-full ml-2">Trending</span>
            </h2>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 text-gray-900 animate-spin" />
          </div>
        ) : (
          /* Dynamic Product Grid */
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            {products.map((product) => {
              // ডিসকাউন্ট ক্যালকুলেশন (যদি oldPrice থাকে)
              const discount = product.oldPrice ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;

              return (
                <motion.div 
                  key={product._id}
                  variants={cardVariants}
                  className="flex flex-col group" // Group class for hover triggers
                >
                  {/* --- Image Container (Hover Area) --- */}
                  <div className="relative bg-[#cfd4dc] aspect-[4/5] flex justify-center items-center overflow-hidden mb-4">
                    
                    {/* 1. Clickable Image (পুরো ছবি জুড়ে লিংক) */}
                    <Link to={`/product/${product._id}`} className="absolute inset-0 flex justify-center items-center z-0 p-8">
                      <img 
                        src={product.image || product.images?.[0] || "https://via.placeholder.com/300"} 
                        alt={product.name} 
                        className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                      />
                    </Link>

                    {/* 2. Top Left Badges (স্থায়ীভাবে থাকবে) */}
                    <div className="absolute top-4 left-4 flex flex-col gap-1 z-10 pointer-events-none">
                      <span className="bg-[#2563eb] text-white text-[11px] font-bold px-2 py-1 shadow-sm">
                        Pre-Order
                      </span>
                      {discount > 0 && (
                        <span className="bg-[#ff5722] text-white text-[11px] font-bold px-2 py-1 shadow-sm w-max">
                          -{discount}%
                        </span>
                      )}
                    </div>

                    {/* 3. Action Icons (Hover করলে ডানদিক থেকে আসবে) */}
                    <div className="absolute top-4 right-4 flex flex-col gap-2 z-10 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                      <button 
                        onClick={(e) => { e.preventDefault(); /* Add Wishlist Logic Here */ }}
                        className="w-9 h-9 bg-white flex justify-center items-center text-gray-500 hover:text-red-500 transition-colors shadow-sm"
                      >
                        <Heart className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => { e.preventDefault(); /* Quick View Logic */ }}
                        className="w-9 h-9 bg-white flex justify-center items-center text-gray-500 hover:text-gray-900 transition-colors shadow-sm"
                      >
                        <Maximize className="w-4 h-4" />
                      </button>
                      <Link 
                        to={`/product/${product._id}`}
                        className="w-9 h-9 bg-white flex justify-center items-center text-gray-500 hover:text-gray-900 transition-colors shadow-sm"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </div>

                    {/* 4. Add to Cart Button (Hover করলে নিচ থেকে উঠবে) */}
                    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-[85%] z-10 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                      <button 
                        onClick={(e) => { e.preventDefault(); /* Add Cart Logic */ }}
                        className="w-full bg-white text-[#1e293b] font-bold py-3 text-sm shadow-lg hover:bg-gray-50 transition-colors"
                      >
                        Add to cart
                      </button>
                    </div>

                  </div>

                  {/* --- Product Details (Text Below Image) --- */}
                  <div className="text-center px-2">
                    <Link to={`/product/${product._id}`}>
                      <h3 className="text-gray-800 font-medium text-[15px] truncate hover:text-blue-600 transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="mt-2 flex items-center justify-center gap-3">
                      <span className="text-gray-900 font-bold text-lg">
                        ৳{product.price?.toLocaleString()}
                      </span>
                      {product.oldPrice && (
                        <span className="text-gray-400 line-through text-sm">
                          ৳{product.oldPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                  
                </motion.div>
              );
            })}
          </motion.div>
        )}
        
        {/* Mobile View All Button */}
        <div className="mt-12 text-center">
          <Link to="/shop" className="inline-block px-8 py-3 border border-gray-300 text-gray-900 hover:bg-gray-900 hover:text-white font-bold uppercase tracking-widest text-sm transition-colors">
            Load More Products
          </Link>
        </div>

      </div>
    </div>
  );
};

export default TrendingProducts;
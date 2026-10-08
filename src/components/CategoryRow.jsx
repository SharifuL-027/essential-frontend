import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import axios from 'axios';
import ProductCard from './ProductCard';

const CategoryRow = ({ title }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        
        // সব প্রোডাক্ট ফেচ করছি
        const response = await axios.get(`${apiUrl}/products`); 
        
        let productsArray = Array.isArray(response.data) ? response.data : 
                            (response.data.products || response.data.data || []);
                            console.log(productsArray,"-------------------")

        // ⚠️ ম্যাজিক এখানে: টাইটেলের সাথে মিলিয়ে প্রোডাক্ট ফিল্টার করা হচ্ছে
        const filteredProducts = productsArray.filter((product) => {
          // ডেটাবেসে category অবজেক্ট হিসেবে থাকলে .name খুঁজবে, না হলে সরাসরি স্ট্রিং
          const categoryName = typeof product.category === 'object' ? product.category?.name : product.category;
          
          // বড়-ছোট হাতের অক্ষরের সমস্যা এড়াতে toLowerCase() ব্যবহার করা হয়েছে
          return categoryName?.toLowerCase() === title.toLowerCase();
        });
console.log(filteredProducts,".........")
        // ফিল্টার করা প্রোডাক্ট থেকে প্রথম ৪টা দেখাচ্ছি
        setProducts(filteredProducts.slice(0, 4));
        setLoading(false);
      } catch (error) {
        console.error("Error:", error);
        setLoading(false);
      }
    };
    fetchProducts();
  }, [title]);

  return (
    <div className="py-8 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800 relative pb-2">
            {title}
            <span className="absolute bottom-0 left-0 w-1/2 h-[2px] bg-cyan-600"></span>
          </h3>
          
          <div className="flex gap-2">
            <button className="p-1.5 border border-gray-200 text-gray-400 hover:text-cyan-600 hover:border-cyan-600 transition-colors rounded-sm">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button className="p-1.5 border border-gray-200 text-gray-400 hover:text-cyan-600 hover:border-cyan-600 transition-colors rounded-sm">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Product Grid বা Empty State */}
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="w-8 h-8 text-cyan-600 animate-spin" />
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          // যদি এই ক্যাটাগরিতে কোনো প্রোডাক্ট না থাকে
          <div className="flex justify-center items-center py-10 text-gray-400">
            এই ক্যাটাগরিতে এখনো কোনো প্রোডাক্ট যোগ করা হয়নি।
          </div>
        )}

      </div>
    </div>
  );
};

export default CategoryRow;
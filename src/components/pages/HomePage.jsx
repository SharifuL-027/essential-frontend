import { useQuery } from '@tanstack/react-query';
import api from '../../api/axiosConfig'; 
import Hero from '../Hero/Hero'; 
import Facilities from '../Facilities/Facilities';
import ProductCard from '../ProductCard'; 
import { Loader2, Filter, X, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect, useMemo, useRef } from 'react';

// 🔥 ডান-বাম স্ক্রল করার জন্য স্পেশাল স্লাইডার কম্পোনেন্ট
const CategorySlider = ({ title, products }) => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      // 🔥 clientWidth ব্যবহার করার ফলে স্ক্রিনে যতগুলো প্রোডাক্ট দেখাচ্ছে, ঠিক ততটুকুই স্লাইড হবে।
      // যেমন: ডেক্সটপে একসাথে ৬টা স্লাইড হবে, মোবাইলে ২টা স্লাইড হবে।
      const containerWidth = scrollRef.current.clientWidth;
      const scrollAmount = direction === 'left' ? -containerWidth : containerWidth;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!products || products.length === 0) return null;

  return (
    <div className="mb-12 bg-white p-4 md:p-6 rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg md:text-2xl roboto-black text-gray-900 uppercase tracking-wide border-l-4 border-[#6b21a8] pl-3">
          {title}
        </h2>
        
        {/* ডান-বাম স্ক্রল বাটন */}
        <div className="flex gap-2">
          <button 
            onClick={() => scroll('left')} 
            className="w-9 h-9 md:w-10 md:h-10 flex justify-center items-center bg-gray-50 border border-gray-200 rounded-full shadow-sm hover:bg-[#6b21a8] hover:text-white hover:border-[#6b21a8] transition-colors text-gray-600"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={() => scroll('right')} 
            className="w-9 h-9 md:w-10 md:h-10 flex justify-center items-center bg-gray-50 border border-gray-200 rounded-full shadow-sm hover:bg-[#6b21a8] hover:text-white hover:border-[#6b21a8] transition-colors text-gray-600"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* 🔥 প্রোডাক্ট কন্টেইনার (Responsive Grid with Flexbox) */}
      <div 
        ref={scrollRef} 
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth"
      >
        {products.map(product => (
          <div 
            key={product._id} 
            /* 
              🔥 রেসপন্সিভ ক্যালকুলেশন: 
              - Mobile (default): ২টি প্রোডাক্ট দেখাবে।
              - md (Tablet): ৩টি প্রোডাক্ট দেখাবে।
              - lg (Small Laptop): ৪টি প্রোডাক্ট দেখাবে।
              - xl (Desktop): ঠিক ৬টি প্রোডাক্ট দেখাবে।
            */
            className="shrink-0 snap-start 
              w-[calc((100%-16px)/2)] 
              md:w-[calc((100%-32px)/3)] 
              lg:w-[calc((100%-48px)/4)] 
              xl:w-[calc((100%-80px)/6)]"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
};


const HomePage = () => {
  // ফিল্টারিং স্টেটস
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  
  // Price Range States
  const [maxPriceLimit, setMaxPriceLimit] = useState(100000);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 });

  const { data: categories = [], isLoading: isCatLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('/categories');
      return res.data;
    }
  });

  const { data: productRes, isLoading: isProdLoading } = useQuery({
    queryKey: ['home-products'],
    queryFn: async () => {
      const res = await api.get(`/products?limit=1000`);
      return res.data;
    }
  });

  const products = productRes?.products || [];
  
  const uniqueBrands = [...new Set(products.map(p => p.brand))].filter(Boolean);

  useEffect(() => {
    if (products.length > 0) {
      const highestPrice = Math.max(...products.map(p => p.price));
      setMaxPriceLimit(highestPrice);
      setPriceRange({ min: 0, max: highestPrice });
    }
  }, [products.length]);

  const filteredProducts = useMemo(() => {
    let result = products;
    if (searchQuery) result = result.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    if (selectedCategory) result = result.filter(p => (p.category?.name || p.category) === selectedCategory);
    if (selectedBrand) result = result.filter(p => p.brand === selectedBrand);
    result = result.filter(p => p.price >= Number(priceRange.min) && p.price <= Number(priceRange.max));
    return result;
  }, [products, searchQuery, selectedCategory, selectedBrand, priceRange]);

  const groupedProducts = useMemo(() => {
    return categories.map(cat => ({
      ...cat,
      products: filteredProducts.filter(p => (p.category?.name || p.category) === cat.name || (p.category?._id || p.category) === cat._id)
    })).filter(cat => cat.products.length > 0); 
  }, [categories, filteredProducts]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedBrand('');
    setPriceRange({ min: 0, max: maxPriceLimit });
  };

  const isLoading = isCatLoading || isProdLoading;

  return (
    <div className="w-full bg-[#FAFAFA]">
      
      <Hero />
      <Facilities />

      {/* 🔥 Width বাড়িয়ে 1400px থেকে 1700px করা হয়েছে যাতে ৬টি প্রোডাক্ট সুন্দরভাবে ফিট হয় */}
      <div className="max-w-[1700px] mx-auto px-4 md:px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
          
          {/* Left Sidebar Filters */}
          <div className={`fixed inset-0 z-50 lg:static lg:z-auto lg:block lg:w-[260px] xl:w-[280px] flex-shrink-0 transition-transform duration-300 ${isMobileFilterOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
            
            <div className="absolute inset-0 bg-black/50 lg:hidden" onClick={() => setIsMobileFilterOpen(false)}></div>

            <div className="absolute top-0 left-0 h-full w-[280px] lg:w-full bg-white lg:bg-transparent lg:h-auto lg:relative overflow-y-auto lg:overflow-visible p-6 lg:p-0 shadow-2xl lg:shadow-none">
              
              <div className="flex justify-between items-center lg:hidden mb-6">
                <h3 className="text-lg roboto-black">Filters</h3>
                <button onClick={() => setIsMobileFilterOpen(false)} className="p-2 bg-gray-100 rounded-full text-gray-600"><X className="w-4 h-4" /></button>
              </div>

              <div className="bg-white lg:p-6 lg:rounded-2xl lg:shadow-sm lg:border border-gray-100 space-y-8 sticky top-24">
                
                {/* Search */}
                <div>
                  <h4 className="text-sm roboto-bold text-gray-900 uppercase tracking-wider mb-3">Search</h4>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Search products..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-sm roboto-medium outline-none focus:border-[#6b21a8] transition"
                    />
                    <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  </div>
                </div>

                {/* Categories */}
                {categories.length > 0 && (
                  <div>
                    <h4 className="text-sm roboto-bold text-gray-900 uppercase tracking-wider mb-3 border-b pb-2">Categories</h4>
                    <div className="space-y-2.5 max-h-48 overflow-y-auto [&::-webkit-scrollbar]:hidden pr-2">
                      {categories.map(cat => (
                        <label key={cat._id} className="flex items-center gap-3 cursor-pointer group">
                          <input 
                            type="radio" name="category"
                            checked={selectedCategory === cat.name}
                            onChange={() => setSelectedCategory(cat.name)}
                            className="w-4 h-4 text-[#6b21a8] border-gray-300 focus:ring-[#6b21a8] cursor-pointer"
                          />
                          <span className="text-sm roboto-medium text-gray-600 group-hover:text-[#6b21a8] transition">{cat.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Brands */}
                {uniqueBrands.length > 0 && (
                  <div>
                    <h4 className="text-sm roboto-bold text-gray-900 uppercase tracking-wider mb-3 border-b pb-2">Brands</h4>
                    <div className="space-y-2.5 max-h-48 overflow-y-auto [&::-webkit-scrollbar]:hidden pr-2">
                      {uniqueBrands.map(brand => (
                        <label key={brand} className="flex items-center gap-3 cursor-pointer group">
                          <input 
                            type="radio" name="brand"
                            checked={selectedBrand === brand}
                            onChange={() => setSelectedBrand(brand)}
                            className="w-4 h-4 text-[#6b21a8] border-gray-300 focus:ring-[#6b21a8] cursor-pointer"
                          />
                          <span className="text-sm roboto-medium text-gray-600 group-hover:text-[#6b21a8] transition">{brand}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Custom Dual Range Price Filter */}
                <div>
                  <h4 className="text-sm roboto-bold text-gray-900 uppercase tracking-wider mb-2 border-b pb-2">Price Range (৳)</h4>
                  
                  <div className="relative h-1.5 bg-gray-200 rounded-full mt-6 mb-5">
                    <div 
                      className="absolute h-full bg-[#6b21a8] rounded-full"
                      style={{
                        left: `${(priceRange.min / maxPriceLimit) * 100}%`,
                        right: `${100 - (priceRange.max / maxPriceLimit) * 100}%`
                      }}
                    ></div>
                    
                    <input 
                      type="range" min="0" max={maxPriceLimit} value={priceRange.min}
                      onChange={(e) => setPriceRange({ ...priceRange, min: Math.min(Number(e.target.value), priceRange.max - 1) })}
                      className="absolute w-full -top-2 h-5 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-[3.5px] [&::-webkit-slider-thumb]:border-[#6b21a8] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer z-10"
                    />
                    
                    <input 
                      type="range" min="0" max={maxPriceLimit} value={priceRange.max}
                      onChange={(e) => setPriceRange({ ...priceRange, max: Math.max(Number(e.target.value), priceRange.min + 1) })}
                      className="absolute w-full -top-2 h-5 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-[3.5px] [&::-webkit-slider-thumb]:border-[#6b21a8] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer z-20"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input 
                      type="number" value={priceRange.min}
                      onChange={(e) => setPriceRange({...priceRange, min: Number(e.target.value)})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm roboto-medium outline-none focus:border-[#6b21a8]"
                    />
                    <span className="text-gray-400">-</span>
                    <input 
                      type="number" value={priceRange.max}
                      onChange={(e) => setPriceRange({...priceRange, max: Number(e.target.value)})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm roboto-medium outline-none focus:border-[#6b21a8]"
                    />
                  </div>
                </div>

                <button 
                  onClick={clearFilters}
                  className="w-full bg-red-50 text-red-600 py-3 rounded-xl text-sm roboto-bold uppercase tracking-wider hover:bg-red-100 transition"
                >
                  Clear All Filters
                </button>

              </div>
            </div>
          </div>

          {/* Right Side: Category Rows (Horizontal Sliders) */}
          <div className="flex-1 min-w-0 overflow-hidden">
            
            {/* Mobile Filter Toggle Button */}
            <div className="flex lg:hidden justify-between items-center mb-6">
              <h2 className="text-xl md:text-2xl roboto-black text-gray-900">Featured Products</h2>
              <button 
                onClick={() => setIsMobileFilterOpen(true)}
                className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl roboto-bold text-sm shadow-sm"
              >
                <Filter className="w-4 h-4" /> Filters
              </button>
            </div>

            {/* Loading State or Sliders */}
            {isLoading ? (
              <div className="flex justify-center items-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <Loader2 className="w-10 h-10 text-[#6b21a8] animate-spin" />
              </div>
            ) : groupedProducts.length > 0 ? (
              groupedProducts.map((category) => (
                <CategorySlider 
                  key={category._id} 
                  title={category.name} 
                  products={category.products} 
                />
              ))
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-xl roboto-bold text-gray-800 mb-2">No products found</h3>
                <p className="text-gray-500 roboto-medium mb-4">Try adjusting your filters or price range.</p>
                <button onClick={clearFilters} className="bg-[#6b21a8] text-white px-6 py-2.5 rounded-xl text-sm roboto-bold hover:bg-purple-800 transition">
                  Clear Filters
                </button>
              </div>
            )}

          </div>

        </div>
      </div>

    </div>
  );
};

export default HomePage;
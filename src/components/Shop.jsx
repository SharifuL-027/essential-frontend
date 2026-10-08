import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axiosConfig';
import { Loader2, Heart, Maximize2, Eye, ShoppingBag, Filter, X, Search, SlidersHorizontal } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast'; 

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlSearch = searchParams.get('search') || '';

  const [wishlist, setWishlist] = useState([]);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // 🔥 ফিল্টারিং স্টেটস
  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  
  // 🔥 Price Slider States
  const [maxPriceLimit, setMaxPriceLimit] = useState(100000);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 });

  useEffect(() => {
    setSearchQuery(searchParams.get('search') || '');
  }, [searchParams]);

  useEffect(() => {
    const savedWishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    setWishlist(savedWishlist);
  }, []);

  // ডাটাবেস থেকে সব প্রোডাক্ট ফেচ করা
  const { data: productRes, isLoading } = useQuery({
    queryKey: ['shop-products'],
    queryFn: async () => {
      const res = await api.get(`/products?limit=1000`);
      return res.data;
    },
  });

  const products = productRes?.products || [];

  // 🔥 প্রোডাক্ট লোড হওয়ার পর স্লাইডারের সর্বোচ্চ দাম অটো-সেট করা
  useEffect(() => {
    if (products.length > 0) {
      const highestPrice = Math.max(...products.map(p => p.price));
      setMaxPriceLimit(highestPrice);
      setPriceRange({ min: 0, max: highestPrice });
    }
  }, [products.length]);

  const uniqueCategories = [...new Set(products.map(p => p.category?.name || p.category))].filter(Boolean);
  const uniqueBrands = [...new Set(products.map(p => p.brand))].filter(Boolean);

  // ফ্রন্টএন্ড ফিল্টারিং লজিক
  const filteredProducts = useMemo(() => {
    let result = products;

    if (searchQuery) {
      result = result.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (selectedCategory) {
      result = result.filter(p => (p.category?.name || p.category) === selectedCategory);
    }
    if (selectedBrand) {
      result = result.filter(p => p.brand === selectedBrand);
    }
    
    // Price Range Filter
    result = result.filter(p => p.price >= Number(priceRange.min) && p.price <= Number(priceRange.max));

    if (sortBy === 'price-low') {
      result = result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result = result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [products, searchQuery, selectedCategory, selectedBrand, priceRange, sortBy]);


  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedBrand('');
    setPriceRange({ min: 0, max: maxPriceLimit });
    setSortBy('newest');
    setSearchParams({});
  };

  const handleToggleWishlist = (product, e) => {
    e.preventDefault();
    let updatedWishlist = [...wishlist];
    const index = updatedWishlist.findIndex((item) => item._id === product._id);

    if (index > -1) {
      updatedWishlist.splice(index, 1);
      toast.error('Removed from Wishlist 💔', { style: { border: '1px solid #fecaca', color: '#ef4444' } });
    } else {
      updatedWishlist.push(product);
      toast.success('Added to Wishlist! ❤️', { style: { border: '1px solid #fecaca', color: '#ef4444' }, iconTheme: { primary: '#ef4444', secondary: '#fff' } });
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
    
    // 🔥 Cyan Toast 
    toast.success('Added to cart successfully! 🛒', { 
      style: { border: '1px solid #67e8f9', color: '#0891b2' }, 
      iconTheme: { primary: '#06b6d4', secondary: '#fff' } 
    });
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-28 pb-16 px-4 md:px-6">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Header Section */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl md:text-3xl roboto-black text-gray-900">Shop Collection</h1>
            <p className="text-sm text-gray-500 roboto-medium mt-1">Showing {filteredProducts.length} results</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button 
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl roboto-bold text-sm hover:bg-gray-200 transition flex-1 justify-center"
            >
              <Filter className="w-4 h-4" /> Filters
            </button>

            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl flex-1 md:flex-none">
              <SlidersHorizontal className="w-4 h-4 text-gray-500 hidden md:block" />
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent outline-none text-sm roboto-bold text-gray-700 w-full cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Filter */}
          <div className={`fixed inset-0 z-50 lg:static lg:z-auto lg:block lg:w-72 flex-shrink-0 transition-transform duration-300 ${isMobileFilterOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
            
            <div className="absolute inset-0 bg-black/50 lg:hidden" onClick={() => setIsMobileFilterOpen(false)}></div>

            <div className="absolute top-0 left-0 h-full w-[280px] bg-white lg:bg-transparent lg:w-full lg:h-auto lg:relative overflow-y-auto lg:overflow-visible p-6 lg:p-0 shadow-2xl lg:shadow-none">
              
              <div className="flex justify-between items-center lg:hidden mb-6">
                <h3 className="text-lg roboto-black">Filters</h3>
                <button onClick={() => setIsMobileFilterOpen(false)} className="p-2 bg-gray-100 rounded-full text-gray-600"><X className="w-4 h-4" /></button>
              </div>

              <div className="bg-white lg:p-6 lg:rounded-2xl lg:shadow-sm lg:border border-gray-100 space-y-8">
                
                {/* Search */}
                <div>
                  <h4 className="text-sm roboto-bold text-gray-900 uppercase tracking-wider mb-3">Search</h4>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Search products..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-sm roboto-medium outline-none focus:border-cyan-600 transition"
                    />
                    <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  </div>
                </div>

                {/* Categories */}
                {uniqueCategories.length > 0 && (
                  <div>
                    <h4 className="text-sm roboto-bold text-gray-900 uppercase tracking-wider mb-3 border-b pb-2">Categories</h4>
                    <div className="space-y-2.5 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                      {uniqueCategories.map(cat => (
                        <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                          <input 
                            type="radio" name="category"
                            checked={selectedCategory === cat}
                            onChange={() => setSelectedCategory(cat)}
                            className="w-4 h-4 text-cyan-600 border-gray-300 focus:ring-cyan-600 cursor-pointer"
                          />
                          <span className="text-sm roboto-medium text-gray-600 group-hover:text-cyan-600 transition">{cat}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Brands */}
                {uniqueBrands.length > 0 && (
                  <div>
                    <h4 className="text-sm roboto-bold text-gray-900 uppercase tracking-wider mb-3 border-b pb-2">Brands</h4>
                    <div className="space-y-2.5 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                      {uniqueBrands.map(brand => (
                        <label key={brand} className="flex items-center gap-3 cursor-pointer group">
                          <input 
                            type="radio" name="brand"
                            checked={selectedBrand === brand}
                            onChange={() => setSelectedBrand(brand)}
                            className="w-4 h-4 text-cyan-600 border-gray-300 focus:ring-cyan-600 cursor-pointer"
                          />
                          <span className="text-sm roboto-medium text-gray-600 group-hover:text-cyan-600 transition">{brand}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* 🔥 Custom Dual Range Price Filter (Draggable + Typable) */}
                <div>
                  <h4 className="text-sm roboto-bold text-gray-900 uppercase tracking-wider mb-2 border-b pb-2">Price Range (৳)</h4>
                  
                  {/* Slider Track and Thumbs */}
                  <div className="relative h-1.5 bg-gray-200 rounded-full mt-6 mb-5">
                    {/* Active Range Color */}
                    <div 
                      className="absolute h-full bg-cyan-600 rounded-full"
                      style={{
                        left: `${(priceRange.min / maxPriceLimit) * 100}%`,
                        right: `${100 - (priceRange.max / maxPriceLimit) * 100}%`
                      }}
                    ></div>
                    
                    {/* Min Thumb */}
                    <input 
                      type="range" 
                      min="0" 
                      max={maxPriceLimit} 
                      value={priceRange.min}
                      onChange={(e) => setPriceRange({ ...priceRange, min: Math.min(Number(e.target.value), priceRange.max - 1) })}
                      className="absolute w-full -top-2 h-5 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-[3.5px] [&::-webkit-slider-thumb]:border-cyan-600 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-[3px] [&::-moz-range-thumb]:border-cyan-600 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer z-10"
                    />
                    
                    {/* Max Thumb */}
                    <input 
                      type="range" 
                      min="0" 
                      max={maxPriceLimit} 
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({ ...priceRange, max: Math.max(Number(e.target.value), priceRange.min + 1) })}
                      className="absolute w-full -top-2 h-5 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-[3.5px] [&::-webkit-slider-thumb]:border-cyan-600 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-[3px] [&::-moz-range-thumb]:border-cyan-600 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer z-20"
                    />
                  </div>

                  {/* Manual Type Inputs */}
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      value={priceRange.min}
                      onChange={(e) => setPriceRange({...priceRange, min: Number(e.target.value)})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm roboto-medium outline-none focus:border-cyan-600"
                    />
                    <span className="text-gray-400">-</span>
                    <input 
                      type="number" 
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({...priceRange, max: Number(e.target.value)})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm roboto-medium outline-none focus:border-cyan-600"
                    />
                  </div>
                </div>

                <button 
                  onClick={clearFilters}
                  className="w-full bg-cyan-50 text-cyan-600 py-3 rounded-xl text-sm roboto-bold uppercase tracking-wider hover:bg-cyan-100 transition"
                >
                  Clear All Filters
                </button>

              </div>
            </div>
          </div>

          {/* Products Grid Area */}
          <div className="flex-1">
            {isLoading ? (
              <div className="flex justify-center items-center h-64 bg-white rounded-2xl shadow-sm border border-gray-100">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => {
                  const isWishlisted = wishlist.some((item) => item._id === product._id);
                  const discount = product.oldPrice ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;

                  return (
                    <div key={product._id} className="group flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                      
                      <div className="relative w-full aspect-[4/5] bg-gray-50 rounded-t-2xl p-4 flex items-center justify-center overflow-hidden">
                        
                        {discount > 0 && (
                          <span className="absolute top-3 left-3 bg-cyan-500 text-white text-[10px] roboto-bold px-2 py-1 rounded-md shadow-sm z-10">
                            -{discount}%
                          </span>
                        )}

                        <Link to={`/product/${product._id}`} className="w-full h-full flex items-center justify-center">
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500" 
                          />
                        </Link>

                        <div className="absolute top-3 right-3 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                          <button onClick={(e) => handleToggleWishlist(product, e)} className="p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 text-gray-600 transition-colors">
                            <Heart className={`w-4 h-4 ${isWishlisted ? "text-red-500 fill-red-500" : "hover:text-red-500"}`} />
                          </button>
                          <button onClick={(e) => { e.preventDefault(); toast('Zoom feature coming soon!', { icon: '🔍', style: { color: '#0891b2' } }); }} className="p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 text-gray-600 hover:text-cyan-600 transition-colors">
                            <Maximize2 className="w-4 h-4" />
                          </button>
                          <Link to={`/product/${product._id}`} className="p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 text-gray-600 hover:text-cyan-600 transition-colors flex justify-center items-center">
                            <Eye className="w-4 h-4" />
                          </Link>
                        </div>

                        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-300 z-10">
                          <button onClick={(e) => handleAddToCart(product, e)} className="w-full bg-[#1e293b] text-white py-2.5 rounded-lg text-xs roboto-bold shadow-lg hover:bg-cyan-600 transition-colors flex items-center justify-center gap-1.5 uppercase tracking-wider">
                            <ShoppingBag className="w-4 h-4" /> Add to cart
                          </button>
                        </div>
                      </div>

                      <div className="p-4 text-center">
                        <Link to={`/product/${product._id}`}>
                          <h3 className="roboto-semibold text-gray-800 text-[14px] leading-snug hover:text-cyan-600 transition-colors line-clamp-2 min-h-[40px]">
                            {product.name}
                          </h3>
                        </Link>
                        <div className="mt-2.5 flex items-center justify-center gap-2">
                          <span className="text-cyan-600 roboto-bold text-lg">৳ {product.price?.toLocaleString()}</span>
                          {product.oldPrice && (
                            <span className="text-gray-400 text-xs line-through roboto-medium">৳ {product.oldPrice?.toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                      
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-24 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-xl roboto-bold text-gray-800 mb-2">No products found</h3>
                <p className="text-gray-500 roboto-medium mb-6">Try adjusting your filters or search query.</p>
                <button onClick={clearFilters} className="bg-cyan-600 text-white px-6 py-2.5 rounded-xl text-sm roboto-bold hover:bg-cyan-700 transition">
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

export default Shop;
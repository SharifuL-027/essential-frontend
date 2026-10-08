import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Lock, Search, ChevronDown, Zap, Flame, Heart, LogOut, LayoutDashboard, User, Loader2, X, ChevronRight, Home, Grid, Tag, Box } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axiosConfig'; 

const staticNavItems = [
  { _id: 'new', name: 'New Arrival', path: '/new-arrival', icon: <Zap className="w-4 h-4 mr-3 text-yellow-500" /> },
  { _id: 'flash', name: 'Flash Sale', path: '/flash-sale', icon: <Flame className="w-4 h-4 mr-3 text-orange-500" />, badge: 'Hot' },
];

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(''); 
  const [categoryDropdown, setCategoryDropdown] = useState(false);
  const [brandDropdown, setBrandDropdown] = useState(false);
  
  // Mobile Menu Accordion States
  const [mobileCatOpen, setMobileCatOpen] = useState(false);
  const [mobileBrandOpen, setMobileBrandOpen] = useState(false);
  
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();

  const { data: categories = [], isLoading: isCategoryLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('/categories');
      return res.data;
    }
  });

  const { data: brands = [], isLoading: isBrandLoading } = useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const res = await api.get('/products/brands');
      return res.data;
    }
  });

  const updateCounts = () => {
    const localWishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    setWishlistCount(localWishlist.length);

    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    const totalCartItems = cartItems.reduce((total, item) => total + (item.quantity || 1), 0);
    setCartCount(totalCartItems);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      setIsLoggedIn(true);
      const parsedData = JSON.parse(userStr);
      setUserRole(parsedData.role || (parsedData.user && parsedData.user.role) || 'Customer');
    } else {
      setIsLoggedIn(false);
      setUserRole('');
    }

    updateCounts();
    window.addEventListener('storage', updateCounts);

    return () => window.removeEventListener('storage', updateCounts);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUserRole(''); 
    navigate('/login');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav 
        className={`fixed w-full top-0 z-50 px-6 transition-all duration-300 flex justify-between items-center text-gray-800 
        ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'}`}
      >
        
        {/* Left Side: Logo */}
        <div className="flex items-center space-x-2">
          <Link to="/" className="flex items-center">
            <img 
              src="https://res.cloudinary.com/dsrs8hryx/image/upload/v1791089487/essential-removebg-preview_vcyjui.png"
              alt="Essential Zone Logo" 
              className="h-10 w-auto object-contain"
            />
          </Link>
          <h2 className="uppercase roboto-bold hidden sm:block">Essential Zone</h2>
        </div>

        {/* 🔥 Center Side: Navigation & Dropdowns (Desktop Only) - Gap and Size Increased */}
        <div className="hidden lg:flex items-center space-x-10 xl:space-x-12 text-base font-bold tracking-wide pt-2">
          
          <Link to="/" className="text-gray-600 hover:text-cyan-600 transition-colors">Home</Link>

          {/* Categories Dropdown */}
          <div 
            className="relative"
            onMouseEnter={() => setCategoryDropdown(true)}
            onMouseLeave={() => setCategoryDropdown(false)}
          >
            <button className="flex items-center text-gray-600 hover:text-cyan-600 transition-colors py-2">
              <span>Categories</span>
              <ChevronDown className={`w-4 h-4 ml-1 transition-transform duration-200 ${categoryDropdown ? 'rotate-180' : ''}`} />
            </button>
            {categoryDropdown && (
              <div className="absolute top-full left-0 w-56 bg-white shadow-xl py-2 border border-gray-100 z-50 rounded-b-md">
                {isCategoryLoading ? (
                  <div className="flex items-center justify-center p-4 text-gray-400 gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-cyan-600" />
                    <span className="text-xs">Loading...</span>
                  </div>
                ) : categories.length > 0 ? (
                  categories.map((cat) => (
                    <Link 
                      key={cat._id} 
                      to={`/category/${cat.slug}`}
                      onClick={() => setCategoryDropdown(false)}
                      className="block px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-600 hover:bg-cyan-50 hover:text-cyan-600 transition-colors"
                    >
                      {cat.name}
                    </Link>
                  ))
                ) : (
                  <div className="px-4 py-2 text-xs text-gray-400">No categories found</div>
                )}
              </div>
            )}
          </div>

          {/* Brands Dropdown */}
          <div 
            className="relative"
            onMouseEnter={() => setBrandDropdown(true)}
            onMouseLeave={() => setBrandDropdown(false)}
          >
            <button className="flex items-center text-gray-600 hover:text-cyan-600 transition-colors py-2">
              <span>Brands</span>
              <ChevronDown className={`w-4 h-4 ml-1 transition-transform duration-200 ${brandDropdown ? 'rotate-180' : ''}`} />
            </button>
            {brandDropdown && (
              <div className="absolute top-full left-0 w-max bg-white shadow-xl py-4 px-2 border border-gray-100 z-50 rounded-b-md">
                {isBrandLoading ? (
                  <div className="flex items-center justify-center p-4 text-gray-400 gap-2 min-w-[14rem]">
                    <Loader2 className="w-4 h-4 animate-spin text-cyan-600" />
                    <span className="text-xs">Loading...</span>
                  </div>
                ) : brands.length > 0 ? (
                  <div className="grid grid-flow-col gap-x-2 gap-y-1" style={{ gridTemplateRows: `repeat(${Math.min(brands.length, 12)}, minmax(0, 1fr))` }}>
                    {brands.map((brand, idx) => (
                      <Link 
                        key={brand._id || idx} 
                        to={`/brand/${brand.name || brand}`}
                        onClick={() => setBrandDropdown(false)}
                        className="block px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-gray-600 hover:bg-cyan-50 hover:text-cyan-600 transition-colors min-w-[14rem]"
                      >
                        {brand.name || brand}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-2 text-xs text-gray-400 min-w-[14rem]">No brands found</div>
                )}
              </div>
            )}
          </div>

          <Link to="/shop" className="text-gray-600 hover:text-cyan-600 transition-colors">
            All Products
          </Link>

          {staticNavItems.map((item) => (
            <Link 
              key={item._id} 
              to={item.path} 
              className="relative flex items-center group text-gray-600 hover:text-cyan-600 transition-colors"
            >
              {item.name}
              {item.badge && (
                <span className="absolute -top-3 -right-5 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                  {item.badge}
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[3px] border-r-[3px] border-t-[4px] border-l-transparent border-r-transparent border-t-orange-500"></span>
                </span>
              )}
            </Link>
          ))}
        </div>

        {/* Right Side: Icons & Mobile Hamburger */}
        <div className="flex items-center space-x-5 pt-1">
          <div className="hidden md:flex items-center space-x-5">
            {isLoggedIn && (
              <Link 
                to={userRole === 'Admin' ? '/admin' : '/account'} 
                className="flex items-center gap-1.5 bg-cyan-600 text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full shadow-sm hover:bg-cyan-700 transition-colors"
              >
                {userRole === 'Admin' ? <LayoutDashboard className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                {userRole === 'Admin' ? 'Dashboard' : 'My Account'}
              </Link>
            )}

            <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="text-gray-500 hover:text-cyan-600 transition-colors">
              {isSearchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
            </button>

            <Link to="/wishlist" className="relative text-gray-600 hover:text-red-500 transition-colors ml-2">
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full shadow-sm">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link to="/cart" className="relative text-gray-600 hover:text-cyan-600 transition-colors ml-2 mr-2">
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-cyan-600 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full shadow-sm">
                  {cartCount}
                </span>
              )}
            </Link>
            
            {isLoggedIn ? (
              <button 
                onClick={handleLogout} 
                title="Logout"
                className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-gray-500 border border-gray-300 px-3 py-1.5 rounded-full hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" /> Logout
              </button>
            ) : (
              <Link to="/login" title="Login" className="text-gray-500 hover:text-cyan-600 transition-colors">
                <Lock className="w-5 h-5" />
              </Link>
            )}
          </div>

          {/* 🔥 Mobile Hamburger Icon */}
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="flex lg:hidden items-center justify-center p-2 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className="flex flex-col space-y-1.5 items-end">
               <span className="w-6 h-[2px] bg-gray-800 transition-colors"></span>
               <span className="w-4 h-[2px] bg-gray-800 transition-colors"></span>
               <span className="w-6 h-[2px] bg-gray-800 transition-colors"></span>
            </div>
          </button>
        </div>
      </nav>

      {/* Dynamic Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="fixed top-[70px] left-0 w-full bg-white shadow-md z-40 border-t border-gray-100 overflow-hidden"
          >
            <form onSubmit={handleSearchSubmit} className="max-w-4xl mx-auto px-6 py-6 flex items-center gap-4">
              <Search className="w-6 h-6 text-gray-400 hidden sm:block" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, brands..." 
                className="flex-1 text-base sm:text-lg outline-none bg-transparent placeholder:text-gray-400 text-gray-800 font-medium"
                autoFocus
              />
              <button type="submit" className="bg-cyan-600 text-white px-5 py-2.5 rounded-md text-xs font-bold tracking-wider hover:bg-cyan-700 transition">
                SEARCH
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🔥 Organized & Left-Aligned Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '-100%' }} // বাম দিক থেকে আসবে
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '-100%' }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 bg-white z-[60] flex flex-col h-screen lg:hidden overflow-hidden"
          >
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-white">
              <span className="text-lg roboto-bold uppercase tracking-widest text-gray-900">Menu</span>
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Menu Items */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-2">
              
              <Link to="/" onClick={() => setIsMenuOpen(false)} className="flex items-center py-3 text-[15px] font-medium text-gray-700 border-b border-gray-50 hover:text-cyan-600 transition-colors">
                <Home className="w-5 h-5 mr-3 text-gray-400" />
                Home
              </Link>

              {/* Mobile Categories Accordion */}
              <div className="border-b border-gray-50">
                <button 
                  onClick={() => setMobileCatOpen(!mobileCatOpen)}
                  className="flex items-center justify-between w-full py-3 text-[15px] font-medium text-gray-700 hover:text-cyan-600 transition-colors"
                >
                  <div className="flex items-center">
                    <Grid className="w-5 h-5 mr-3 text-gray-400" />
                    Categories
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${mobileCatOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {mobileCatOpen && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pl-8 pb-3 space-y-1">
                        {categories.map((cat) => (
                          <Link 
                            key={cat._id} to={`/category/${cat.slug}`} onClick={() => setIsMenuOpen(false)}
                            className="block py-2 text-sm text-gray-500 hover:text-cyan-600 transition-colors"
                          >
                            {cat.name}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Brands Accordion */}
              <div className="border-b border-gray-50">
                <button 
                  onClick={() => setMobileBrandOpen(!mobileBrandOpen)}
                  className="flex items-center justify-between w-full py-3 text-[15px] font-medium text-gray-700 hover:text-cyan-600 transition-colors"
                >
                  <div className="flex items-center">
                    <Tag className="w-5 h-5 mr-3 text-gray-400" />
                    Brands
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${mobileBrandOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {mobileBrandOpen && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pl-8 pb-3 space-y-1">
                        {brands.map((brand, idx) => (
                          <Link 
                            key={brand._id || idx} to={`/brand/${brand.name || brand}`} onClick={() => setIsMenuOpen(false)}
                            className="block py-2 text-sm text-gray-500 uppercase tracking-wide hover:text-cyan-600 transition-colors"
                          >
                            {brand.name || brand}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link to="/shop" onClick={() => setIsMenuOpen(false)} className="flex items-center py-3 text-[15px] font-medium text-gray-700 border-b border-gray-50 hover:text-cyan-600 transition-colors">
                <Box className="w-5 h-5 mr-3 text-gray-400" />
                All Products
              </Link>

              {staticNavItems.map((item) => (
                <Link key={item._id} to={item.path} onClick={() => setIsMenuOpen(false)} className="flex items-center py-3 text-[15px] font-medium text-gray-700 border-b border-gray-50 hover:text-cyan-600 transition-colors">
                  {item.icon}
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Mobile Menu Footer (Account & Logout) */}
            <div className="mt-auto bg-gray-50 p-6 space-y-4 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <Link to="/wishlist" onClick={() => setIsMenuOpen(false)} className="flex flex-col items-center text-gray-600 hover:text-red-500 transition-colors">
                  <div className="relative">
                    <Heart className="w-6 h-6" />
                    {wishlistCount > 0 && <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] h-4 w-4 flex items-center justify-center rounded-full">{wishlistCount}</span>}
                  </div>
                  <span className="text-[10px] uppercase font-bold mt-1">Wishlist</span>
                </Link>
                <Link to="/cart" onClick={() => setIsMenuOpen(false)} className="flex flex-col items-center text-gray-600 hover:text-cyan-600 transition-colors">
                  <div className="relative">
                    <ShoppingBag className="w-6 h-6" />
                    {cartCount > 0 && <span className="absolute -top-1.5 -right-1.5 bg-cyan-600 text-white text-[10px] h-4 w-4 flex items-center justify-center rounded-full">{cartCount}</span>}
                  </div>
                  <span className="text-[10px] uppercase font-bold mt-1">Cart</span>
                </Link>
                
                <button onClick={() => setIsSearchOpen(true)} className="flex flex-col items-center text-gray-600 hover:text-cyan-600 transition-colors">
                  <Search className="w-6 h-6" />
                  <span className="text-[10px] uppercase font-bold mt-1">Search</span>
                </button>
              </div>

              {isLoggedIn ? (
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200">
                  <Link to={userRole === 'Admin' ? '/admin' : '/account'} onClick={() => setIsMenuOpen(false)} className="flex items-center justify-center gap-2 bg-cyan-600 text-white py-2.5 rounded-md text-xs font-bold uppercase hover:bg-cyan-700 transition">
                    {userRole === 'Admin' ? <LayoutDashboard className="w-4 h-4" /> : <User className="w-4 h-4" />} Dashboard
                  </Link>
                  <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="flex items-center justify-center gap-2 border border-gray-300 text-gray-600 py-2.5 rounded-md text-xs font-bold uppercase hover:bg-gray-100 transition-colors">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              ) : (
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-center w-full gap-2 bg-gray-900 text-white py-3 rounded-md text-sm font-bold uppercase hover:bg-gray-800 transition">
                  <Lock className="w-4 h-4" /> Sign In / Register
                </Link>
              )}
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
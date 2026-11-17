import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axiosConfig';
import { ShoppingBag, Heart, Loader2, ShieldCheck, Truck, RefreshCw, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast'; 

const cleanDescription = (html) =>
  (html || '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\u00a0/g, ' ');

const descriptionCss = `
  .product-desc,
  .product-desc * {
    word-break: normal !important;
    overflow-wrap: normal !important;
    white-space: normal !important;
    hyphens: none !important;
    max-width: 100%;
  }
  .product-desc pre {
    white-space: pre-wrap !important;
    overflow-wrap: break-word !important;
  }
  .product-desc img {
    width: 100%;
    height: auto;
  }
  .product-desc table {
    display: block;
    overflow-x: auto;
  }
`;

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeImage, setActiveImage] = useState('');

  const [zoomStyle, setZoomStyle] = useState({
    transformOrigin: 'center center',
    transform: 'scale(1)'
  });

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const res = await api.get(`/products/${id}`);
      return res.data?.data || res.data;
    }
  });

  // প্রোডাক্টের আসল স্টক সংখ্যা
  const availableStock = product ? Number(product.stock ?? 0) : 0;
  const isOutOfStock = availableStock <= 0;

  useEffect(() => {
    if (product) {
      setActiveImage(product.image || product.images?.[0] || '');
      setQuantity(1);
      
      const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
      const exists = wishlist.some(item => item._id === product._id);
      setIsWishlisted(exists);
    }
  }, [product]);

  const toggleWishlist = () => {
    if (!product) return;
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

  // 🔥 Strict '+' বাটন হ্যান্ডলার (স্টকের বেশি কখনোই বাড়বে না)
  const handleIncreaseQty = () => {
    if (isOutOfStock) return;
    if (quantity >= availableStock) {
      toast.error(`Maximum stock reached! Only ${availableStock} available.`);
      return;
    }
    setQuantity((prev) => (prev < availableStock ? prev + 1 : availableStock));
  };

  // '-' বাটন হ্যান্ডলার
  const handleDecreaseQty = () => {
    if (isOutOfStock) return;
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  // Add to Cart হ্যান্ডলার
  const handleAddToCart = () => {
    if (!product) return false;
    if (isOutOfStock) {
      toast.error('This product is out of stock!');
      return false;
    }

    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const index = cart.findIndex(item => item._id === product._id);
    const existingQtyInCart = index > -1 ? Number(cart[index].quantity || 1) : 0;

    if (existingQtyInCart + quantity > availableStock) {
      toast.error(`Stock limit exceeded! You already have ${existingQtyInCart} in cart (Total Stock: ${availableStock}).`);
      return false;
    }

    if (index > -1) {
      cart[index].quantity = existingQtyInCart + quantity;
      cart[index].stock = availableStock;
    } else {
      cart.push({ ...product, stock: availableStock, quantity, image: activeImage });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('storage'));
    
    toast.success('Added to cart successfully! 🛒', {
      style: { border: '1px solid #67e8f9', color: '#0891b2' },
      iconTheme: { primary: '#06b6d4', secondary: '#fff' },
    });
    return true;
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    const added = handleAddToCart();
    if (added) {
      navigate('/cart');
    }
  };

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.target.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: 'scale(2.2)' 
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({
      transformOrigin: 'center center',
      transform: 'scale(1)'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#FAFAFA]">
        <Loader2 className="w-10 h-10 text-cyan-600 animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center text-center px-4 bg-[#FAFAFA]">
        <h2 className="text-2xl roboto-bold text-gray-800 mb-2">Product Not Found</h2>
        <p className="text-gray-500 mb-6 roboto-medium">The product you are looking for does not exist or has been removed.</p>
        <Link to="/" className="bg-cyan-600 text-white px-6 py-3 rounded-xl roboto-bold text-sm shadow-md hover:bg-cyan-700 transition">
          Back to Home
        </Link>
      </div>
    );
  }

  const priceNum = Number(product.price) || 0;
  const oldPriceNum = Number(product.oldPrice) || 0;
  const discount = (oldPriceNum > priceNum) ? Math.round(((oldPriceNum - priceNum) / oldPriceNum) * 100) : 0;
  const allImages = [...new Set([product.image, ...(product.images || [])].filter(Boolean))];

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-28 pb-20 px-4 md:px-6">
      <style>{descriptionCss}</style>

      <div className="max-w-[1200px] mx-auto">
        
        {/* Breadcrumb */}
        <div className="mb-8 flex items-center text-[13px] text-gray-500 gap-2 roboto-medium">
          <Link to="/" className="hover:text-cyan-600 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 opacity-50" />
          <span className="text-gray-800 truncate">{product.name}</span>
        </div>

        {/* Main Top Section */}
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 p-6 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left: Image Gallery */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            <div 
              className="bg-white aspect-square rounded-2xl flex justify-center items-center overflow-hidden border border-gray-100 relative cursor-crosshair group shadow-sm p-4"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <img 
                src={activeImage || 'https://placehold.co/400'} 
                alt={product.name} 
                style={zoomStyle}
                className={`w-full h-full object-contain transition-transform duration-200 ease-out ${isOutOfStock ? 'opacity-60 grayscale-[30%]' : ''}`}
              />
              {discount > 0 && !isOutOfStock && (
                <span className="absolute top-4 left-4 bg-cyan-500 text-white text-xs roboto-bold px-3 py-1.5 rounded-full shadow-md tracking-wide">
                  {discount}% OFF
                </span>
              )}
              {isOutOfStock && (
                <span className="absolute top-4 left-4 bg-red-600 text-white text-xs roboto-bold px-3 py-1.5 rounded-full shadow-md tracking-wide uppercase">
                  Out of Stock
                </span>
              )}
            </div>

            {allImages.length > 1 && (
              <div className="flex gap-4 overflow-x-auto py-2 scrollbar-hide px-1">
                {allImages.map((img, index) => (
                  <button 
                    key={index}
                    type="button"
                    onClick={() => setActiveImage(img)}
                    className={`w-20 h-20 rounded-xl border-2 p-1 flex-shrink-0 transition-all duration-300 bg-white focus:outline-none ${
                      activeImage === img 
                        ? 'border-cyan-600 shadow-md scale-105' 
                        : 'border-transparent hover:border-gray-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className="w-full h-full relative rounded-lg overflow-hidden flex items-center justify-center bg-white">
                      <img src={img} alt="" className="max-w-full max-h-full object-contain" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Info & Actions */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            
            <div className="flex justify-between items-start mb-3">
              <span className="text-[11px] roboto-bold uppercase tracking-widest bg-cyan-50 text-cyan-600 px-3 py-1.5 rounded-full">
                {product.brand || 'Original Brand'}
              </span>
              <span className="text-xs roboto-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                SKU: {product._id.slice(-6).toUpperCase()}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl roboto-bold text-gray-900 leading-tight mb-6">
              {product.name}
            </h1>
            
            {/* Price Section */}
            <div className="flex flex-col gap-1 mb-6">
              <div className="flex items-center gap-4">
                <span className="text-3xl md:text-4xl roboto-bold text-cyan-600">
                  ৳ {priceNum.toLocaleString()}
                </span>
                {oldPriceNum > priceNum && (
                  <span className="text-gray-400 line-through text-lg roboto-medium">
                    ৳ {oldPriceNum.toLocaleString()}
                  </span>
                )}
              </div>
              {discount > 0 && (
                <span className="text-sm roboto-semibold text-green-600 mt-1">
                  You save ৳ {(oldPriceNum - priceNum).toLocaleString()} on this item!
                </span>
              )}
            </div>

            {/* Quick Specs */}
            {product.specifications && product.specifications.length > 0 && (
              <div className="mb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  {product.specifications.slice(0, 6).map((spec, index) => (
                    <div key={index} className="flex items-start gap-2 text-gray-600 bg-gray-50/50 p-2.5 rounded-lg border border-gray-100/80">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-300 mt-1.5 flex-shrink-0"></div>
                      <p>
                        <span className="roboto-semibold text-gray-700">{spec.name}:</span> <span className="roboto-medium">{spec.value}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions / Add to cart */}
            <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
              
              <div className="flex items-center justify-between gap-2 text-sm mb-5">
                {!isOutOfStock ? (
                  <span className="text-green-600 bg-green-50 px-3 py-1 rounded-full roboto-semibold flex items-center gap-1.5 border border-green-100">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    In Stock ({availableStock})
                  </span>
                ) : (
                  <span className="text-red-600 bg-red-50 px-3 py-1 rounded-full roboto-semibold border border-red-200">
                    Out of Stock
                  </span>
                )}

                {!isOutOfStock && quantity >= availableStock && (
                  <span className="text-xs font-bold text-amber-600">
                    Max available stock selected ({availableStock})
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4">
                {/* Quantity Controls (Strictly Clamped to availableStock) */}
                <div className={`flex items-center border border-gray-200 rounded-xl p-1 bg-white shadow-sm h-14 ${isOutOfStock ? 'opacity-50 pointer-events-none' : ''}`}>
                  <button 
                    type="button"
                    onClick={handleDecreaseQty} 
                    disabled={isOutOfStock || quantity <= 1}
                    className="w-10 h-full roboto-medium text-lg text-gray-600 hover:bg-gray-100 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-12 text-center roboto-bold text-base text-gray-900 select-none">
                    {isOutOfStock ? 0 : quantity}
                  </span>
                  <button 
                    type="button"
                    onClick={handleIncreaseQty} 
                    disabled={isOutOfStock || quantity >= availableStock}
                    className="w-10 h-full roboto-medium text-lg text-gray-600 hover:bg-gray-100 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    +
                  </button>
                </div>
                
                <button 
                  type="button"
                  onClick={handleAddToCart} 
                  disabled={isOutOfStock}
                  className="flex-1 h-14 min-w-[140px] bg-white text-gray-900 border-2 border-gray-900 rounded-xl roboto-bold text-[13px] uppercase tracking-wider hover:border-cyan-600 hover:bg-cyan-600 hover:text-white transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-900 disabled:hover:border-gray-900 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" /> Add to Cart
                </button>

                <button 
                  type="button"
                  onClick={handleBuyNow} 
                  disabled={isOutOfStock}
                  className="flex-1 h-14 min-w-[140px] bg-cyan-600 text-white rounded-xl roboto-bold text-[13px] uppercase tracking-wider shadow-lg shadow-cyan-600/30 hover:shadow-xl hover:shadow-cyan-600/20 hover:bg-cyan-700 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:bg-cyan-600 cursor-pointer"
                >
                  {isOutOfStock ? 'Out of Stock' : 'Buy Now'}
                </button>

                <button 
                  type="button"
                  onClick={toggleWishlist} 
                  className={`h-14 w-14 flex items-center justify-center border-2 rounded-xl transition-all shadow-sm cursor-pointer ${isWishlisted ? 'border-red-100 bg-red-50 text-red-500' : 'border-gray-200 bg-white text-gray-400 hover:border-red-200 hover:text-red-400'}`} 
                  title="Add to Wishlist"
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500' : ''}`} />
                </button>
              </div>
            </div>

            {/* Guarantees */}
            <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-gray-100">
              <div className="flex flex-col items-center justify-center text-center gap-2 p-3 rounded-xl bg-gray-50/50">
                <ShieldCheck className="w-6 h-6 text-cyan-600" />
                <span className="text-[11px] roboto-semibold text-gray-600">100% Genuine</span>
              </div>
              <div className="flex flex-col items-center justify-center text-center gap-2 p-3 rounded-xl bg-gray-50/50">
                <Truck className="w-6 h-6 text-cyan-600" />
                <span className="text-[11px] roboto-semibold text-gray-600">Fast Delivery</span>
              </div>
              <div className="flex flex-col items-center justify-center text-center gap-2 p-3 rounded-xl bg-gray-50/50">
                <RefreshCw className="w-6 h-6 text-cyan-600" />
                <span className="text-[11px] roboto-semibold text-gray-600">7 Days Return</span>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {product.description && (
            <div className="lg:col-span-8 min-w-0 overflow-hidden bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 p-6 md:p-10">
              <h3 className="text-lg roboto-bold text-gray-900 mb-8 flex items-center gap-3">
                <span className="w-1.5 h-6 bg-cyan-600 rounded-full"></span>
                Product Overview
              </h3>
              
              <div
                className="product-desc text-gray-600 roboto-medium text-sm leading-loose
                  [&_img]:rounded-2xl [&_img]:my-6 [&_img]:shadow-sm
                  [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-1.5 [&_p]:mb-4"
                dangerouslySetInnerHTML={{ __html: cleanDescription(product.description) }}
              />
            </div>
          )}

          {/* Specifications Table */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 p-8 sticky top-32">
              <h3 className="text-lg roboto-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="w-1.5 h-6 bg-cyan-600 rounded-full"></span>
                Specifications
              </h3>

              {product.specifications && product.specifications.length > 0 ? (
                <div className="flex flex-col border border-gray-100 rounded-xl overflow-hidden">
                  {product.specifications.map((spec, index) => (
                    <div key={index} className={`flex text-sm ${index % 2 === 0 ? 'bg-gray-50/80' : 'bg-white'}`}>
                      <div className="w-2/5 p-3.5 border-r border-gray-100 roboto-semibold text-gray-500">
                        {spec.name}
                      </div>
                      <div className="w-3/5 p-3.5 roboto-medium text-gray-900">
                        {spec.value}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-8 text-center border border-gray-100">
                  <p className="text-sm roboto-medium text-gray-400">No detailed specifications provided.</p>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ProductDetails;
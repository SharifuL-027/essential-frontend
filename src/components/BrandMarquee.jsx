import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

const BrandMarquee = () => {
  const navigate = useNavigate();

  // 🔥 API theke dynamic brand fetch kora
  const { data: brands = [], isLoading } = useQuery({
    queryKey: ['dynamic-brands'],
    queryFn: async () => {
      const res = await api.get('/products');
      const products = res.data.products || res.data;
      const uniqueBrandNames = [...new Set(products.map(p => p.brand?.trim()).filter(Boolean))];
      return uniqueBrandNames.map(brandName => ({ name: brandName }));
    },
    staleTime: 5 * 60 * 1000,
  });

  // 🔥 Sothik route (/brand/Apple) e navigate korar jonno
  const handleBrandClick = (brandName) => {
    navigate(`/brand/${encodeURIComponent(brandName)}`);
  };

  if (isLoading || brands.length === 0) {
    return null;
  }

  return (
    <section className="bg-white py-6 border-y border-gray-100 overflow-hidden select-none">
      
      <style>{`
        @keyframes marqueeScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        .marquee-container {
          display: flex;
          width: max-content;
          animation: marqueeScroll 25s linear infinite;
        }
        .marquee-container:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Marquee Wrapper with Smooth Gradient Fades on Edges */}
      <div className="relative w-full flex overflow-x-hidden">
        
        {/* Left Edge Gradient Fade */}
        <div className="absolute left-0 top-0 bottom-0 w-16 md:w-24 bg-linear-to-r from-white to-transparent z-10 pointer-events-none" />

        {/* Right Edge Gradient Fade */}
        <div className="absolute right-0 top-0 bottom-0 w-16 md:w-24 bg-linear-to-l from-white to-transparent z-10 pointer-events-none" />

        {/* Marquee Infinite Scrolling Track */}
        <div className="flex gap-6 md:gap-10">
          
          {/* Track 1 */}
          <div className="marquee-container flex items-center gap-6 md:gap-10 shrink-0">
            {brands.map((brand, index) => (
              <button
                key={`t1-${brand.name}-${index}`}
                onClick={() => handleBrandClick(brand.name)}
                className="flex items-center justify-center px-6 py-3 rounded-xl bg-gray-50/80 border border-gray-200 hover:border-cyan-400 hover:bg-cyan-50 hover:shadow-sm transition-all duration-300 group/card shrink-0 cursor-pointer"
                title={`View ${brand.name} Products`}
              >
                <span className="text-sm font-bold text-gray-700 group-hover/card:text-cyan-600 tracking-wide uppercase transition-colors whitespace-nowrap">
                  {brand.name}
                </span>
              </button>
            ))}
          </div>

          {/* Track 2 (Duplicate for Seamless Infinite Loop) */}
          <div className="marquee-container flex items-center gap-6 md:gap-10 shrink-0" aria-hidden="true">
            {brands.map((brand, index) => (
              <button
                key={`t2-${brand.name}-${index}`}
                onClick={() => handleBrandClick(brand.name)}
                className="flex items-center justify-center px-6 py-3 rounded-xl bg-gray-50/80 border border-gray-200 hover:border-cyan-400 hover:bg-cyan-50 hover:shadow-sm transition-all duration-300 group/card shrink-0 cursor-pointer"
              >
                <span className="text-sm font-bold text-gray-700 group-hover/card:text-cyan-600 tracking-wide uppercase transition-colors whitespace-nowrap">
                  {brand.name}
                </span>
              </button>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
};

export default BrandMarquee;
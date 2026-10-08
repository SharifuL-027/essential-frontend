import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-cyan-500 text-white pt-16 pb-8 md:pt-20 md:pb-10 border-t border-cyan-400">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">
        
        {/* Top Section: 2 Columns on Mobile/Tablet, 4 Columns on Desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-12 md:mb-16">
          
          {/* Column 1: Brand Info (Full width on mobile to look better, or keep in 1 col) */}
          <div className="col-span-2 md:col-span-1 flex flex-col gap-4 md:gap-6">
            <Link to="/" className="flex flex-col">
              <span className="roboto-bold text-3xl md:text-4xl tracking-tighter leading-none text-white">E.</span>
              {/* 🔥 নাম পরিবর্তন করে ESSENTIAL ZONE করা হলো */}
              <span className="text-[10px] md:text-[11px] tracking-[0.3em] md:tracking-[0.4em] roboto-semibold text-cyan-100 mt-1 uppercase">
                ESSENTIAL ZONE
              </span>
            </Link>
            <p className="roboto-medium text-xs md:text-sm text-cyan-50 leading-relaxed pr-4">
              Your one-stop destination for premium products. We deliver the best quality items straight to your doorstep with uncompromised trust.
            </p>
            <div className="flex items-center gap-3 md:gap-4 mt-2">
              {/* Custom SVG for Facebook */}
              <a href="#" className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-cyan-600 flex items-center justify-center text-cyan-50 hover:bg-white hover:text-cyan-600 transition-colors shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 md:w-4 md:h-4">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
              {/* Custom SVG for Instagram */}
              <a href="#" className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-cyan-600 flex items-center justify-center text-cyan-50 hover:bg-white hover:text-cyan-600 transition-colors shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 md:w-4 md:h-4">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              {/* Custom SVG for Twitter (X) */}
              <a href="#" className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-cyan-600 flex items-center justify-center text-cyan-50 hover:bg-white hover:text-cyan-600 transition-colors shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 md:w-4 md:h-4">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="col-span-1">
            <h3 className="roboto-bold text-base md:text-lg mb-4 md:mb-6 flex items-center gap-2">
              <span className="w-1.5 h-4 md:h-5 bg-white rounded-full"></span>
              Quick Links
            </h3>
            <ul className="flex flex-col gap-2.5 md:gap-3">
              <li><Link to="/shop" className="roboto-medium text-xs md:text-sm text-cyan-100 hover:text-white hover:pl-2 transition-all">Shop All Products</Link></li>
              <li><Link to="/flash-sale" className="roboto-medium text-xs md:text-sm text-cyan-100 hover:text-white hover:pl-2 transition-all">Flash Sales</Link></li>
              <li><Link to="/categories" className="roboto-medium text-xs md:text-sm text-cyan-100 hover:text-white hover:pl-2 transition-all">Top Categories</Link></li>
              <li><Link to="/wishlist" className="roboto-medium text-xs md:text-sm text-cyan-100 hover:text-white hover:pl-2 transition-all">My Wishlist</Link></li>
              <li><Link to="/account" className="roboto-medium text-xs md:text-sm text-cyan-100 hover:text-white hover:pl-2 transition-all">My Account</Link></li>
            </ul>
          </div>

          {/* Column 3: Customer Service */}
          <div className="col-span-1">
            <h3 className="roboto-bold text-base md:text-lg mb-4 md:mb-6 flex items-center gap-2">
              <span className="w-1.5 h-4 md:h-5 bg-white rounded-full"></span>
              Service
            </h3>
            <ul className="flex flex-col gap-3 md:gap-4">
              <li className="flex items-start gap-2.5 text-cyan-50">
                <MapPin className="w-4 h-4 md:w-5 md:h-5 text-white flex-shrink-0 mt-0.5" />
                <span className="roboto-medium text-xs md:text-sm leading-relaxed">287/10/1 Pirer Bagh, Mirpur, Dhaka-1216</span>
              </li>
              <li className="flex items-center gap-2.5 text-cyan-50">
                <Phone className="w-4 h-4 md:w-5 md:h-5 text-white flex-shrink-0" />
                <span className="roboto-medium text-xs md:text-sm">01411-248042</span>
              </li>
              <li className="flex items-center gap-2.5 text-cyan-50 break-all">
                <Mail className="w-4 h-4 md:w-5 md:h-5 text-white flex-shrink-0" />
                <span className="roboto-medium text-xs md:text-sm">support@essentialbd.com</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter (Full width on mobile, 1 col on desktop) */}
          <div className="col-span-2 lg:col-span-1 mt-4 md:mt-0">
            <h3 className="roboto-bold text-base md:text-lg mb-4 md:mb-6 flex items-center gap-2">
              <span className="w-1.5 h-4 md:h-5 bg-white rounded-full"></span>
              Newsletter
            </h3>
            <p className="roboto-medium text-xs md:text-sm text-cyan-50 mb-4 leading-relaxed">
              Subscribe to get special offers, free giveaways, and deals.
            </p>
            <form className="flex flex-col gap-2.5 md:gap-3" onSubmit={(e) => e.preventDefault()}>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 md:left-4 top-1/2 -translate-y-1/2 text-cyan-200" />
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="w-full bg-cyan-600 border border-cyan-400 rounded-lg md:rounded-xl py-2.5 md:py-3 pl-10 md:pl-11 pr-4 text-xs md:text-sm roboto-medium text-white placeholder:text-cyan-200 focus:outline-none focus:border-white transition-colors shadow-inner"
                  required
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-white text-cyan-600 py-2.5 md:py-3 rounded-lg md:rounded-xl roboto-bold text-xs md:text-sm uppercase tracking-wider hover:bg-cyan-50 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/10"
              >
                <span>Subscribe</span>
                <Send className="w-3.5 h-3.5 md:w-4 md:h-4" />
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Section: Copyright & Payment Methods */}
        <div className="pt-6 md:pt-8 border-t border-cyan-400 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="roboto-medium text-xs md:text-sm text-cyan-100 text-center md:text-left leading-relaxed">
            &copy; {new Date().getFullYear()} Essential Zone. All rights reserved. 
            <span className="block md:inline md:ml-2 mt-1 md:mt-0">
              Developed by <a href="https://genesysltd.com/" target="_blank" rel="noopener noreferrer" className="text-white font-bold hover:text-cyan-50 hover:underline decoration-cyan-400 underline-offset-4 transition-all">Genensys Tech</a>
            </span>
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
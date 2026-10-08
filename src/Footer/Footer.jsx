import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-cyan-500 text-white pt-20 pb-10 border-t border-cyan-400">
      <div className="max-w-[1200px] mx-auto px-6">
        
        {/* Top Section: 4 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Column 1: Brand Info */}
          <div className="flex flex-col gap-6">
            <Link to="/" className="flex flex-col">
              <span className="roboto-bold text-4xl tracking-tighter leading-none text-white">E.</span>
              <span className="text-[11px] tracking-[0.4em] roboto-semibold text-cyan-100 mt-1 uppercase">
                ESSENTIAL BD
              </span>
            </Link>
            <p className="roboto-medium text-sm text-cyan-50 leading-relaxed">
              Your one-stop destination for premium products. We deliver the best quality items straight to your doorstep with uncompromised trust.
            </p>
            <div className="flex items-center gap-4">
              {/* Custom SVG for Facebook */}
              <a href="#" className="w-10 h-10 rounded-full bg-cyan-600 flex items-center justify-center text-cyan-50 hover:bg-white hover:text-cyan-600 transition-colors shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
              {/* Custom SVG for Instagram */}
              <a href="#" className="w-10 h-10 rounded-full bg-cyan-600 flex items-center justify-center text-cyan-50 hover:bg-white hover:text-cyan-600 transition-colors shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              {/* Custom SVG for Twitter (X) */}
              <a href="#" className="w-10 h-10 rounded-full bg-cyan-600 flex items-center justify-center text-cyan-50 hover:bg-white hover:text-cyan-600 transition-colors shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="roboto-bold text-lg mb-6 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-white rounded-full"></span>
              Quick Links
            </h3>
            <ul className="flex flex-col gap-3">
              <li><Link to="/shop" className="roboto-medium text-sm text-cyan-100 hover:text-white hover:pl-2 transition-all">Shop All Products</Link></li>
              <li><Link to="/flash-sale" className="roboto-medium text-sm text-cyan-100 hover:text-white hover:pl-2 transition-all">Flash Sales</Link></li>
              <li><Link to="/categories" className="roboto-medium text-sm text-cyan-100 hover:text-white hover:pl-2 transition-all">Top Categories</Link></li>
              <li><Link to="/wishlist" className="roboto-medium text-sm text-cyan-100 hover:text-white hover:pl-2 transition-all">My Wishlist</Link></li>
              <li><Link to="/account" className="roboto-medium text-sm text-cyan-100 hover:text-white hover:pl-2 transition-all">My Account</Link></li>
            </ul>
          </div>

          {/* Column 3: Customer Service */}
          <div>
            <h3 className="roboto-bold text-lg mb-6 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-white rounded-full"></span>
              Customer Service
            </h3>
            <ul className="flex flex-col gap-4">
              <li className="flex items-start gap-3 text-cyan-50">
                <MapPin className="w-5 h-5 text-white flex-shrink-0" />
                <span className="roboto-medium text-sm leading-relaxed">287/10/1 Pirer Bagh, Jheel Per, Road-3, Mirpur,Dhaka-1216</span>
              </li>
              <li className="flex items-center gap-3 text-cyan-50">
                <Phone className="w-5 h-5 text-white flex-shrink-0" />
                <span className="roboto-medium text-sm">01411-248042</span>
              </li>
              <li className="flex items-center gap-3 text-cyan-50">
                <Mail className="w-5 h-5 text-white flex-shrink-0" />
                <span className="roboto-medium text-sm">support@essentialbd.com</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h3 className="roboto-bold text-lg mb-6 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-white rounded-full"></span>
              Newsletter
            </h3>
            <p className="roboto-medium text-sm text-cyan-50 mb-4 leading-relaxed">
              Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
            </p>
            <form className="flex flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-cyan-200" />
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="w-full bg-cyan-600 border border-cyan-400 rounded-xl py-3 pl-11 pr-4 text-sm roboto-medium text-white placeholder:text-cyan-200 focus:outline-none focus:border-white transition-colors shadow-inner"
                  required
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-white text-cyan-600 py-3 rounded-xl roboto-bold text-sm uppercase tracking-wider hover:bg-cyan-50 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/10"
              >
                <span>Subscribe</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Section: Copyright & Payment Methods */}
        <div className="pt-8 border-t border-cyan-400 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="roboto-medium text-sm text-cyan-100 text-center md:text-left">
            &copy; {new Date().getFullYear()} Essential BD. All rights reserved.
          </p>
          <div className="flex items-center gap-3 opacity-80 grayscale hover:grayscale-0 transition-all duration-300">
            {/* Payment Method Icons */}
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Mastercard_2019_logo.svg/200px-Mastercard_2019_logo.svg.png" alt="Mastercard" className="h-6 object-contain" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/200px-Visa_Inc._logo.svg.png" alt="Visa" className="h-4 object-contain" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/200px-PayPal.svg.png" alt="PayPal" className="h-5 object-contain" />
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
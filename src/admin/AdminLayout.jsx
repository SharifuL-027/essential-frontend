import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, Tags, ShoppingCart, Users, Ticket, Settings, Globe } from 'lucide-react';

const AdminLayout = () => {
  const location = useLocation();

  // সাইডবারের মেনু আইটেম
  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
    { name: 'Products', path: '/admin/products', icon: <Package size={20} /> },
    { name: 'Categories', path: '/admin/categories', icon: <Tags size={20} /> },
    { name: 'Orders', path: '/admin/orders', icon: <ShoppingCart size={20} /> },
    { name: 'Users', path: '/admin/users', icon: <Users size={20} /> },
    { name: 'Coupons', path: '/admin/coupons', icon: <Ticket size={20} /> },
    { name: 'Settings', path: '/admin/settings', icon: <Settings size={20} /> }
  ];

  return (
    <div className="flex min-h-screen bg-[#FAFAFA] pt-20 md:pt-24 pb-20 md:pb-0"> 
      
      {/* Sidebar (Desktop Only) */}
      <aside className="w-64 bg-white border-r border-gray-100 hidden md:flex flex-col fixed h-[calc(100vh-6rem)] z-40">
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto mt-4 custom-scrollbar">
          <p className="px-4 text-xs font-bold tracking-widest text-gray-400 mb-4">ADMIN MENU</p>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || (location.pathname.startsWith(item.path) && item.path !== '/admin');
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
                  isActive 
                  ? 'bg-cyan-50 text-cyan-600 shadow-sm' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-cyan-600'
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* 🔥 Visit Store Button (Desktop Bottom) */}
        <div className="p-4 border-t border-gray-100">
          <Link 
            to="/" 
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-gray-500 hover:bg-cyan-50 hover:text-cyan-600 transition-all duration-200 group"
          >
            <Globe size={20} className="text-gray-400 group-hover:text-cyan-600 transition-colors" />
            Visit Store
          </Link>
        </div>
      </aside>

      {/* Bottom Navigation Bar (Mobile Only) */}
      <nav 
        className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 z-50 flex items-center overflow-x-auto shadow-[0_-5px_15px_rgba(0,0,0,0.03)]"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <style>{`nav::-webkit-scrollbar { display: none; }`}</style>
        
        <div className="flex w-max min-w-full justify-between gap-2 px-3 py-2.5">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || (location.pathname.startsWith(item.path) && item.path !== '/admin');
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex flex-col items-center justify-center p-2 min-w-[4rem] rounded-xl transition-all duration-200 ${
                  isActive 
                  ? 'text-cyan-600 bg-cyan-50 shadow-sm' 
                  : 'text-gray-400 hover:text-cyan-600 hover:bg-gray-50'
                }`}
              >
                <div className={`${isActive ? 'scale-110 mb-1' : 'mb-1'} transition-transform duration-200`}>
                  {item.icon}
                </div>
                <span className={`text-[9px] font-bold tracking-wider uppercase ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}

          {/* 🔥 Divider for Mobile */}
          <div className="w-[1px] bg-gray-200 my-2 mx-1"></div>

          {/* 🔥 Visit Store Button (Mobile) */}
          <Link
            to="/"
            className="flex flex-col items-center justify-center p-2 min-w-[4rem] rounded-xl transition-all duration-200 text-gray-400 hover:text-cyan-600 hover:bg-gray-50 group"
          >
            <div className="mb-1 group-hover:scale-110 transition-transform duration-200">
              <Globe size={20} />
            </div>
            <span className="text-[9px] font-bold tracking-wider uppercase opacity-70 group-hover:opacity-100">
              Store
            </span>
          </Link>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto w-full">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
      
    </div>
  );
};

export default AdminLayout;
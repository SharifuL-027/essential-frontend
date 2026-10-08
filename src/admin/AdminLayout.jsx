import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, Tags, ShoppingCart, Users, Ticket, Settings } from 'lucide-react';

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
    <div className="flex min-h-screen bg-[#FAFAFA] pt-24"> 
      {/* pt-24 দেওয়া হয়েছে যাতে উপরের Navbar এর নিচে সাইডবার শুরু হয় */}
      
      {/* Sidebar (Desktop) */}
      <aside className="w-64 bg-white border-r border-gray-100 hidden md:flex flex-col fixed h-[calc(100vh-6rem)] z-40">
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto mt-4">
          <p className="px-4 text-xs font-bold tracking-widest text-gray-400 mb-4">ADMIN MENU</p>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || (location.pathname.startsWith(item.path) && item.path !== '/admin');
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  isActive 
                  ? 'bg-cyan-50 text-cyan-600 shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-cyan-600'
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 p-6 md:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* এখানেই Outlet এর মাধ্যমে ভেতরের পেজগুলো রেন্ডার হবে */}
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
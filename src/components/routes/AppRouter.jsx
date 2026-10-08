import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; 

// Public Components
import HomePage from '../pages/HomePage';
import Navbar from '../Navbar/Navbar'; 
import Login from '../pages/Login';
import Register from '../pages/Register';
import NewArrival from '../NewArrival';
import FlashSale from '../FlashSale';
import Footer from '../../Footer/Footer';

// Customer Pages
import CustomerDashboard from '../../customer/CustomerDashboard';
import CartPage from '../../customer/CartPage';
import WishlistPage from '../../customer/WishlistPage';
import ProductDetails from '../ProductDetails';
import CheckoutPage from '../../customer/CheckoutPage';
import CategoryProducts from '../CategoryProducts';
import Shop from '../Shop';
import BrandProducts from '../BrandProducts';

// Admin Pages & Layouts
import AdminLayout from '../../admin/AdminLayout'; 
import AdminDashboard from '../../admin/AdminDashboard'; 
import AddProduct from '../../admin/AddProduct';
import ProductList from '../../admin/ProductList';
import CategoryManager from '../../admin/CategoryManager';
import OrderList from '../../admin/OrderList';
import UserList from '../../admin/UserList';
import AdminCoupons from '../../admin/AdminCoupons';
import AdminSettings from '../../admin/AdminSetting';

import AdminRoute from '../../admin/AdminRoute'; 

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer/>
    </div>
  );
};

const router = createBrowserRouter([
  // ==========================================
  // 🌐 ১. পাবলিক এবং কাস্টমার রাউট (Navbar ও Footer সহ)
  // ==========================================
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
      { path: "/account", element: <CustomerDashboard /> },
      { path: "/cart", element: <CartPage /> },
      { path: "/wishlist", element: <WishlistPage /> },
      { path: "/product/:id", element: <ProductDetails /> },
      { path: "/checkout", element: <CheckoutPage/> },
      { path: "/category/:slug", element: <CategoryProducts /> },
      { path: "/shop", element: <Shop /> },
      { path: "/brand/:brandName", element: <BrandProducts /> },
      { path: "/new-arrival", element: <NewArrival /> },
      { path: "/flash-sale", element: <FlashSale /> },
    ]
  },

  // ==========================================
  // 🔒 ২. অ্যাডমিন রাউট (সম্পূর্ণ আলাদা লেআউট ও প্রটেকশন)
  // ==========================================
  {
    path: "/admin",
    element: <AdminRoute />, // 🔥 প্রথমে চেক করবে ইউজার অ্যাডমিন কি না
    children: [
      {
        path: "", 
        element: <AdminLayout />, // অ্যাডমিন হলে তবেই AdminLayout রেন্ডার হবে
        children: [
          { index: true, element: <AdminDashboard /> },
          { path: "add-product", element: <AddProduct /> },
          { path: "products", element: <ProductList /> },
          { path: "categories", element: <CategoryManager /> },
          { path: "orders", element: <OrderList /> }, 
          { path: "users", element: <UserList /> }, 
          { path: "coupons", element: <AdminCoupons /> }, 
          { path: "settings", element: <AdminSettings /> } 
        ]
      }
    ]
  }
]);

const AppRouter = () => {
  return (
    <>
      <RouterProvider router={router} />
      
      {/* 🔥 গ্লোবাল টোস্ট নোটিফিকেশন সেটআপ */}
      <Toaster 
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#ffffff',
            color: '#333333',
            fontWeight: '600',
            fontSize: '14px',
            boxShadow: '0 4px 14px 0 rgba(0,0,0,0.1)',
            borderRadius: '12px',
            border: '1px solid #f3f4f6',
          },
        }}
      />
    </>
  );
};

export default AppRouter;
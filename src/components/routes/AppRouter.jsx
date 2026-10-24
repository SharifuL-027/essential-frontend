import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; 
import { HelmetProvider, Helmet } from 'react-helmet-async';

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
import EditProduct from '../../admin/EditProduct';
import AdminRoute from '../../admin/AdminRoute'; 
import WhatsAppButton from '../WhatsAppButton';
import ScrollToTop from '../ScrollToTop';


// 🔥 PageHead Component for Dynamic Title & Meta Tags
const PageHead = ({ title, description }) => {
  return (
    <Helmet>
      <title>{title ? `${title} | Essential Zone` : 'Essential Zone'}</title>
      <meta name="description" content={description || 'Discover premium gadgets and accessories at Essential Zone.'} />
    </Helmet>
  );
};

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar /> 
      <ScrollToTop/>
      <main>
        <WhatsAppButton/>
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
      { 
        path: "/", 
        element: <><PageHead title="Home" description="Explore top-quality tech gadgets, smartwatches, and accessories." /><HomePage /></> 
      },
      { 
        path: "/login", 
        element: <><PageHead title="Login" /><Login /></> 
      },
      { 
        path: "/register", 
        element: <><PageHead title="Register" /><Register /></> 
      },
      { 
        path: "/account", 
        element: <><PageHead title="My Account" /><CustomerDashboard /></> 
      },
      { 
        path: "/cart", 
        element: <><PageHead title="Shopping Cart" /><CartPage /></> 
      },
      { 
        path: "/wishlist", 
        element: <><PageHead title="Wishlist" /><WishlistPage /></> 
      },
      { 
        path: "/product/:id", 
        element: <><PageHead title="Product Details" /><ProductDetails /></> 
      },
      { 
        path: "/checkout", 
        element: <><PageHead title="Checkout" /><CheckoutPage /></> 
      },
      { 
        path: "/category/:slug", 
        element: <><PageHead title="Category Products" /><CategoryProducts /></> 
      },
      { 
        path: "/shop", 
        element: <><PageHead title="Shop All Products" /><Shop /></> 
      },
      { 
        path: "/brand/:brandName", 
        element: <><PageHead title="Brand Products" /><BrandProducts /></> 
      },
      { 
        path: "/new-arrival", 
        element: <><PageHead title="New Arrivals" /><NewArrival /></> 
      },
      { 
        path: "/flash-sale", 
        element: <><PageHead title="Flash Sale" /><FlashSale /></> 
      },
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
          { index: true, element: <><PageHead title="Admin Dashboard" /><AdminDashboard /></> },
          { path: "add-product", element: <><PageHead title="Add Product" /><AddProduct /></> },
          { path: "products", element: <><PageHead title="Manage Products" /><ProductList /></> },
          { path: "categories", element: <><PageHead title="Manage Categories" /><CategoryManager /></> },
          { path: "orders", element: <><PageHead title="Manage Orders" /><OrderList /></> }, 
          { path: "users", element: <><PageHead title="Manage Users" /><UserList /></> }, 
          { path: "coupons", element: <><PageHead title="Manage Coupons" /><AdminCoupons /></> }, 
          { path: "settings", element: <><PageHead title="Admin Settings" /><AdminSettings /></> },
          { path: "edit-product/:id", element: <><PageHead title="Edit Product" /><EditProduct /></> }, 
        ]
      }
    ]
  }
]);

const AppRouter = () => {
  return (
    <HelmetProvider>
      {/* Base Fallback Helmet */}
      <Helmet>
        <title>Essential Zone | Premium E-Commerce Store</title>
        <meta name="description" content="Shop the latest gadgets, electronics, and accessories online." />
      </Helmet>

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
    </HelmetProvider>
  );
};

export default AppRouter;
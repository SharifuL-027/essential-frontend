import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; // 🔥 টোস্ট ইম্পোর্ট করা হলো
import HomePage from '../pages/HomePage';
import Navbar from '../Navbar/Navbar'; 
import Login from '../pages/Login';
import Register from '../pages/Register';
import NewArrival from '../NewArrival';
import FlashSale from '../FlashSale';
// Admin Pages & Layouts
import AdminLayout from '../../admin/AdminLayout'; 
import AdminDashboard from '../../admin/AdminDashboard'; 
import AddProduct from '../../admin/AddProduct';
import ProductList from '../../admin/ProductList';
import CategoryManager from '../../admin/CategoryManager';
import OrderList from '../../admin/OrderList';
import UserList from '../../admin/UserList';
import AdminCoupons from '../../admin/AdminCoupons';

// Customer & Public Pages
import CustomerDashboard from '../../customer/CustomerDashboard';
import CartPage from '../../customer/CartPage';
import WishlistPage from '../../customer/WishListPage';
import ProductDetails from '../ProductDetails';
import CheckoutPage from '../../customer/CheckoutPage';
import CategoryProducts from '../CategoryProducts';
import Shop from '../Shop';
import BrandProducts from '../BrandProducts';
import Footer from '../../Footer/Footer';
import AdminSettings from '../../admin/AdminSetting';

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
  {
    path: "/",
    element: <MainLayout />,
    children: [
      // Public Routes
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/register",
        element: <Register />,
      },
      
      // Admin Routes (Nested)
      {
        path: "/admin",
        element: <AdminLayout/>,
        children: [
          {
            index: true, 
            element: <AdminDashboard />, 
          },
          {
            path: "add-product", 
            element: <AddProduct />,
          },
          { path: "products", element: <ProductList /> },
          { path: "categories", element: <CategoryManager /> },
          { path: "orders", element: <OrderList /> }, 
          { path: "users", element: <UserList /> }, 
          { path: "coupons", element: <AdminCoupons /> }, 
          {path:"settings", element: <AdminSettings/>} 
        ]
      },

      // Customer Routes
      {
        path: "/account",
        element: <CustomerDashboard />,
      },
      {
        path: "/cart",
        element: <CartPage />,
      },
      {
        path: "/wishlist",
        element: <WishlistPage />,
      },
      {
        path: "/product/:id",
        element: <ProductDetails />,
      },
      {
        path: "/checkout",
        element: <CheckoutPage/>,
      },
      {
        path: "/category/:slug",
        element: <CategoryProducts />,
      },
      {
        path: "/shop",
        element: <Shop />,
      },
      {
        path: "/brand/:brandName",
        element: <BrandProducts />,
      },
      {
  path: "/new-arrival",
  element: <NewArrival />,
},
{
  path: "/flash-sale",
  element: <FlashSale />,
},
    ]
  },
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
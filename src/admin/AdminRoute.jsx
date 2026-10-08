import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute = () => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');

  // ১. যদি টোকেন বা ইউজার ডেটা না থাকে, তাহলে লগইন পেজে পাঠিয়ে দেবে
  if (!token || !userStr) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userStr);
    const role = user.role || (user.user && user.user.role);

    // ২. যদি লগইন করা ইউজারের রোল 'Admin' না হয়, তাহলে হোম পেজে পাঠিয়ে দেবে
    if (role !== 'Admin') {
      return <Navigate to="/" replace />;
    }

    // ৩. যদি সে আসল অ্যাডমিন হয়, তাহলেই শুধু ভেতরের পেজগুলো দেখতে দেবে
    return <Outlet />;
    
  } catch (error) {
    // কোনো কারণে JSON parse এ এরর হলে লগইন পেজে পাঠিয়ে দেবে
    return <Navigate to="/login" replace />;
  }
};

export default AdminRoute;
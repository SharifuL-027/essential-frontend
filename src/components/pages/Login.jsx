import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  // 🔥 TanStack Query: useMutation for Login
  const loginMutation = useMutation({
    mutationFn: async (credentials) => {
      // তোমার .env ফাইলে VITE_API_URL=http://localhost:5000/api/v1 সেট করা আছে ধরে নিচ্ছি
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await axios.post(`${apiUrl}/auth/login`, credentials);
      return response.data;
    },
    onSuccess: (data) => {
      // সফল হলে টোকেন এবং ইউজার ডেটা লোকালস্টোরেজে সেভ করা
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      
      // লগইন শেষে হোমপেজে পাঠিয়ে দেওয়া
      navigate('/');
    },
    onError: (error) => {
      // ব্যাকএন্ড থেকে আসা এরর (যেমন: Invalid email or password) দেখানো
      setErrorMsg(error.response?.data?.message || 'Login failed. Please try again.');
    }
  });

  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    // Mutation কল করে ডেটা পাঠানো হচ্ছে
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-gray-950 tracking-tight">Welcome Back!</h2>
          <p className="text-sm text-gray-500 mt-2">Sign in to your account to continue shopping</p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-6 font-medium text-center">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <Mail className="w-5 h-5" />
              </span>
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#6b21a8] transition-colors"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <Lock className="w-5 h-5" />
              </span>
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#6b21a8] transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center text-gray-600 cursor-pointer">
              <input type="checkbox" className="rounded border-gray-300 text-[#6b21a8] focus:ring-[#6b21a8] mr-2" />
              Remember me
            </label>
            <a href="#" className="text-[#6b21a8] font-semibold hover:underline">Forgot password?</a>
          </div>

          <button 
            type="submit" 
            disabled={loginMutation.isPending}
            className="w-full bg-[#6b21a8] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-purple-900/20 hover:bg-purple-800 transition-colors flex justify-center items-center gap-2 disabled:opacity-70 text-sm"
          >
            {loginMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Sign In <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>

        {/* Footer Link */}
        <p className="text-center text-sm text-gray-500 mt-8">
          Don't have an account? <Link to="/register" className="text-[#6b21a8] font-bold hover:underline">Sign up</Link>
        </p>

      </div>
    </div>
  );
};

export default Login;
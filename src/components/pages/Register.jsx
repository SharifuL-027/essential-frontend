import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, Mail, Lock, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // 🔥 পাসওয়ার্ড ভিজিবিলিটির জন্য নতুন স্টেট
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  // 🔥 TanStack Query: useMutation for Registration (লজিক অপরিবর্তিত)
  const registerMutation = useMutation({
    mutationFn: async (userData) => {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
      const response = await axios.post(`${apiUrl}/auth/register`, userData);
      return response.data;
    },
    onSuccess: (data) => {
      // সফল হলে টোকেন এবং ইউজার ডেটা সেভ করা
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      
      // হোমপেজে রিডাইরেক্ট করে দেওয়া
      navigate('/');
    },
    onError: (error) => {
      // ব্যাকএন্ড থেকে আসা এরর মেসেজটা দেখানো
      setErrorMsg(error.response?.data?.message || 'Registration failed. Try again.');
    }
  });

  const handleRegister = (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    // Mutation কল করে ডেটা পাঠানো হচ্ছে
    registerMutation.mutate({ name, email, password });
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-gray-950 tracking-tight">Create Account</h2>
          <p className="text-sm text-gray-500 mt-2">Join Essential BD for the best shopping experience</p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-6 font-medium text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">Full Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <User className="w-5 h-5" />
              </span>
              <input 
                type="text" 
                required 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-cyan-600 transition-colors"
                placeholder="Md. Shariful Islam"
              />
            </div>
          </div>

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
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-cyan-600 transition-colors"
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
                type={showPassword ? "text" : "password"} // 🔥 টগল লজিক
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-cyan-600 transition-colors"
                placeholder="••••••••"
              />
              {/* 🔥 পাসওয়ার্ড শো/হাইড বাটন */}
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-cyan-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={registerMutation.isPending}
            className="w-full bg-cyan-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-cyan-600/30 hover:bg-cyan-700 transition-colors flex justify-center items-center gap-2 disabled:opacity-70 text-sm"
          >
            {registerMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Sign Up <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-8">
          Already have an account? <Link to="/login" className="text-cyan-600 font-bold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
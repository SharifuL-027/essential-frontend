import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  // 🔥 TanStack Query: useMutation for Registration
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
      
      // হোমপেজে রিডাইরেক্ট করে দেওয়া
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
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#6b21a8] transition-colors"
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

          <button 
            type="submit" 
            disabled={registerMutation.isPending}
            className="w-full bg-[#6b21a8] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-purple-900/20 hover:bg-purple-800 transition-colors flex justify-center items-center gap-2 disabled:opacity-70 text-sm"
          >
            {registerMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Sign Up <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-8">
          Already have an account? <Link to="/login" className="text-[#6b21a8] font-bold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
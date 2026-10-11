import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axiosConfig';
import { Users, Loader2, ShieldCheck, User, Search } from 'lucide-react';

const UserList = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      try {
        const res = await api.get('/users');
        return Array.isArray(res.data.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        return []; 
      }
    }
  });

  // 🔍 সার্চ ফিল্টার লজিক
  const filteredUsers = users.filter((user) => 
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="w-10 h-10 text-cyan-600 animate-spin" /></div>;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      
      {/* Header & Search Bar */}
      <div className="p-5 md:p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-600" /> All Users
          </h2>
          <p className="text-sm text-gray-500 mt-1">Manage your customers and admins.</p>
        </div>

        {/* 🔍 Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* 🔥 Mobile View (Card Layout) */}
      <div className="md:hidden flex flex-col p-4 gap-4 bg-gray-50/30">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-10">
            <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium text-sm">No users found matching "{searchQuery}"</p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div key={user._id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-cyan-100 text-cyan-600 rounded-full flex items-center justify-center font-bold text-lg shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 capitalize leading-tight">{user.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
                  </div>
                </div>
                <span className={`flex w-fit items-center gap-1 px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider shrink-0 ${user.role === 'Admin' ? 'bg-cyan-50 text-cyan-700 border border-cyan-100' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                  {user.role === 'Admin' ? <ShieldCheck className="w-3 h-3" /> : <User className="w-3 h-3" />}
                  {user.role}
                </span>
              </div>
              
              <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-xs">
                <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Joined</span>
                <span className="text-gray-600 font-medium">
                  {new Date(user.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 💻 Desktop View (Table Layout) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 font-bold border-b border-gray-100">
              <th className="p-4 whitespace-nowrap">Name</th>
              <th className="p-4 whitespace-nowrap">Email</th>
              <th className="p-4 whitespace-nowrap">Role</th>
              <th className="p-4 whitespace-nowrap">Joined Date</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-gray-50">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-16 text-gray-400">
                  <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="font-medium">No users found.</p>
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-cyan-50/30 transition-colors">
                  <td className="p-4 flex items-center gap-3 whitespace-nowrap">
                    <div className="w-8 h-8 bg-cyan-100 text-cyan-600 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-bold text-gray-900 capitalize">{user.name}</span>
                  </td>
                  <td className="p-4 text-gray-600 whitespace-nowrap">{user.email}</td>
                  <td className="p-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${user.role === 'Admin' ? 'bg-cyan-50 text-cyan-700 border border-cyan-100' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                      {user.role === 'Admin' ? <ShieldCheck className="w-3 h-3" /> : <User className="w-3 h-3" />}
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500 text-xs font-medium whitespace-nowrap">
                    {new Date(user.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default UserList;
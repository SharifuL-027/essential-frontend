import { useQuery } from '@tanstack/react-query';
import api from '../api/axiosConfig';
import { Users, Loader2, ShieldCheck, User } from 'lucide-react';

const UserList = () => {
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      // ব্যাকএন্ডে API রেডি না থাকলে আপাতত এটা Error দিতে পারে, তাই try-catch ইউজ করা হলো
      try {
        const res = await api.get('/users');
        return res.data;
      } catch (error) {
        return []; // এরর হলে খালি অ্যারে দেখাবে
      }
    }
  });

  if (isLoading) return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="w-10 h-10 text-[#6b21a8] animate-spin" /></div>;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 bg-gray-50/50">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-[#6b21a8]" /> All Users
        </h2>
        <p className="text-sm text-gray-500 mt-1">Manage your customers and admins.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 font-bold border-b border-gray-100">
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
              <th className="p-4">Joined Date</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-gray-50">
            {users.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-10 text-gray-400">
                  <p>No users found or API not connected yet.</p>
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50 transition">
                  <td className="p-4 font-bold text-gray-900">{user.name}</td>
                  <td className="p-4 text-gray-600">{user.email}</td>
                  <td className="p-4">
                    <span className={`flex w-fit items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${user.role === 'Admin' ? 'bg-purple-100 text-[#6b21a8]' : 'bg-gray-100 text-gray-700'}`}>
                      {user.role === 'Admin' ? <ShieldCheck className="w-3 h-3" /> : <User className="w-3 h-3" />}
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500 text-xs">
                    {new Date(user.createdAt).toLocaleDateString()}
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
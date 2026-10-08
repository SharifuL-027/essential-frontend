import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axiosConfig';
import { Settings, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminSettings = () => {
  const queryClient = useQueryClient();
  const [insideDhaka, setInsideDhaka] = useState('');
  const [outsideDhaka, setOutsideDhaka] = useState('');

  // ডাটাবেস থেকে বর্তমান ডেলিভারি চার্জ ফেচ করা
  const { data, isLoading } = useQuery({
    queryKey: ['delivery-settings'],
    queryFn: async () => {
      const res = await api.get('/settings/delivery');
      return res.data.data;
    }
  });

  // ফেচ হওয়ার পর ফর্মের স্টেটে সেট করা
  useEffect(() => {
    if (data) {
      setInsideDhaka(data.insideDhaka);
      setOutsideDhaka(data.outsideDhaka);
    }
  }, [data]);

  // নতুন ডাটা সেভ করার মিউটেশন
  const mutation = useMutation({
    mutationFn: async (updatedData) => {
      const res = await api.put('/settings/delivery', updatedData);
      return res.data;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries(['delivery-settings']);
      toast.success('Delivery charge updated successfully! 🚀', {
        style: { border: '1px solid #67e8f9', color: '#0891b2' },
        iconTheme: { primary: '#06b6d4', secondary: '#fff' }
      });
    },
    onError: () => {
      toast.error('Failed to update settings');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!insideDhaka || !outsideDhaka) {
      return toast.error('Fields cannot be empty');
    }
    mutation.mutate({ insideDhaka: Number(insideDhaka), outsideDhaka: Number(outsideDhaka) });
  };

  if (isLoading) {
    return <div className="flex h-[60vh] justify-center items-center"><Loader2 className="w-10 h-10 text-cyan-600 animate-spin" /></div>;
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden max-w-2xl mx-auto mt-10">
      <div className="p-6 border-b border-gray-100 bg-gray-50/50">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Settings className="w-5 h-5 text-cyan-600" /> Delivery Settings
        </h2>
        <p className="text-sm text-gray-500 mt-1">Manage delivery charges for inside and outside Dhaka.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Inside Dhaka */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Inside Dhaka (৳)</label>
            <input 
              type="number" 
              value={insideDhaka} 
              onChange={(e) => setInsideDhaka(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm font-medium outline-none focus:border-cyan-600 transition"
              required
            />
          </div>

          {/* Outside Dhaka */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Outside Dhaka (৳)</label>
            <input 
              type="number" 
              value={outsideDhaka} 
              onChange={(e) => setOutsideDhaka(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm font-medium outline-none focus:border-cyan-600 transition"
              required
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={mutation.isPending}
          className="w-full bg-cyan-600 text-white py-3.5 rounded-xl font-bold uppercase tracking-wider shadow-lg shadow-cyan-600/30 hover:bg-cyan-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {mutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default AdminSettings;
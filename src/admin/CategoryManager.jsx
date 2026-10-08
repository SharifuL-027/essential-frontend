import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axiosConfig';
import { Trash2, Loader2, Plus, Tags } from 'lucide-react';

const CategoryManager = () => {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const queryClient = useQueryClient();

  // ক্যাটাগরি ফেচ করা
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('/categories');
      return res.data;
    }
  });

  // ক্যাটাগরি অ্যাড করা
  const addMutation = useMutation({
    mutationFn: async (newCat) => await api.post('/categories', newCat),
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
      setName(''); setSlug('');
    }
  });

  // ক্যাটাগরি ডিলিট করা
  const deleteMutation = useMutation({
    mutationFn: async (id) => await api.delete(`/categories/${id}`),
    onSuccess: () => queryClient.invalidateQueries(['categories'])
  });

  // নাম লিখলে অটো স্লাগ তৈরি হবে
  const handleNameChange = (e) => {
    const val = e.target.value;
    setName(val);
    setSlug(val.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name && slug) addMutation.mutate({ name, slug });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Add Form */}
      <div className="md:col-span-1">
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Tags className="w-5 h-5 text-[#6b21a8]" /> Add Category</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Name</label>
              <input type="text" value={name} onChange={handleNameChange} required className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:border-[#6b21a8]" placeholder="e.g. Smart Watch" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Slug</label>
              <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} required className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:border-[#6b21a8]" placeholder="smart-watch" />
            </div>
            <button type="submit" disabled={addMutation.isPending} className="w-full bg-[#6b21a8] text-white py-2.5 rounded-lg font-bold hover:bg-purple-800 transition flex justify-center items-center gap-2">
              {addMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" /> Save Category</>}
            </button>
          </div>
        </form>
      </div>

      {/* List */}
      <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
           <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 text-[#6b21a8] animate-spin" /></div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 font-bold border-b border-gray-100">
                <th className="p-4">Category Name</th>
                <th className="p-4">Slug</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-50">
              {categories.map((cat) => (
                <tr key={cat._id} className="hover:bg-gray-50 transition">
                  <td className="p-4 font-bold text-gray-900">{cat.name}</td>
                  <td className="p-4 text-gray-500 font-mono text-xs">{cat.slug}</td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => { if(window.confirm('Delete this category?')) deleteMutation.mutate(cat._id); }}
                      className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default CategoryManager;
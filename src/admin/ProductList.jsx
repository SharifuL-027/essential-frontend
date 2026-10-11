import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axiosConfig';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Loader2, PackageSearch, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const ProductList = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // 📦 প্রোডাক্ট ফেচ করা
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const response = await api.get('/products');
      return response.data.products || response.data;
    }
  });

  // 🗑️ প্রোডাক্ট ডিলিট মিউটেশন
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-products']); // ডিলিট হলে অটো রিফ্রেশ
      toast.success('Product deleted successfully!');
    },
    onError: () => {
      toast.error('Failed to delete product.');
    }
  });

  // 🔍 সার্চ ফিল্টার লজিক
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="w-10 h-10 text-cyan-600 animate-spin" /></div>;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      
      {/* Header Section */}
      <div className="p-5 md:p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50/50">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Products Management</h2>
          <p className="text-sm text-gray-500 mt-1">Total {products.length} products found</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* 🔍 Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          <Link to="/admin/add-product" className="flex items-center justify-center gap-2 bg-cyan-600 text-white px-4 py-2 w-full sm:w-auto rounded-lg font-bold shadow-sm hover:bg-cyan-700 transition whitespace-nowrap">
            <Plus className="w-4 h-4" /> Add Product
          </Link>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 font-bold border-b border-gray-100">
              <th className="p-4">Product</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-gray-50">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-12 text-gray-400">
                  <PackageSearch className="w-12 h-12 mx-auto mb-3 opacity-30 text-cyan-600" />
                  <p className="font-medium text-gray-500">No products found matching "{searchQuery}"</p>
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product._id} className="hover:bg-cyan-50/30 transition">
                  <td className="p-4 flex items-center gap-3">
                    <img src={product.image || 'https://placehold.co/100x100'} alt={product.name} className="w-12 h-12 rounded-lg object-cover border border-gray-100 bg-white" />
                    <div>
                      <p className="font-bold text-gray-900 line-clamp-1">{product.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{product.category?.name || 'Uncategorized'}</p>
                    </div>
                  </td>
                  <td className="p-4 font-bold text-gray-900">৳ {product.price?.toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${product.stock > 5 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {product.stock} in stock
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    {/* ✏️ Edit Button - রিডাইরেক্ট করবে Edit পেজে */}
                    <button 
                      onClick={() => navigate(`/admin/edit-product/${product._id}`)}
                      title="Edit Product"
                      className="p-2 text-cyan-600 hover:bg-cyan-50 rounded-lg transition"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    
                    {/* 🗑️ Delete Button */}
                    <button 
                      onClick={() => { if(window.confirm('Are you sure you want to delete this product?')) deleteMutation.mutate(product._id); }}
                      disabled={deleteMutation.isPending}
                      title="Delete Product"
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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

export default ProductList;
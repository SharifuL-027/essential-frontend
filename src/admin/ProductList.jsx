import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axiosConfig';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Loader2, PackageSearch } from 'lucide-react';

const ProductList = () => {
  const queryClient = useQueryClient();

  // প্রোডাক্ট ফেচ করা
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const response = await api.get('/products');
      return response.data.products || response.data;
    }
  });

  // প্রোডাক্ট ডিলিট মিউটেশন
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-products']); // ডিলিট হলে অটো রিফ্রেশ
    }
  });

  if (isLoading) return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="w-10 h-10 text-[#6b21a8] animate-spin" /></div>;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Products Management</h2>
          <p className="text-sm text-gray-500 mt-1">Total {products.length} products found</p>
        </div>
        <Link to="/admin/add-product" className="flex items-center gap-2 bg-[#6b21a8] text-white px-4 py-2 rounded-lg font-bold shadow-sm hover:bg-purple-800 transition">
          <Plus className="w-4 h-4" /> Add Product
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 font-bold border-b border-gray-100">
              <th className="p-4">Product</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-gray-50">
            {products.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-10 text-gray-400">
                  <PackageSearch className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  No products added yet.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50/50 transition">
                  <td className="p-4 flex items-center gap-3">
                    <img src={product.image || 'https://placehold.co/100x100'} alt={product.name} className="w-12 h-12 rounded-lg object-cover border border-gray-100" />
                    <div>
                      <p className="font-bold text-gray-900 line-clamp-1">{product.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{product.category?.name || 'Uncategorized'}</p>
                    </div>
                  </td>
                  <td className="p-4 font-bold text-gray-900">৳ {product.price}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${product.stock > 5 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {product.stock} in stock
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"><Edit className="w-4 h-4" /></button>
                    <button 
                      onClick={() => { if(window.confirm('Are you sure?')) deleteMutation.mutate(product._id); }}
                      disabled={deleteMutation.isPending}
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
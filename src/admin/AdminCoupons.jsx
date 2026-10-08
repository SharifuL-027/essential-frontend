import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { Plus, Trash2, Tag, Loader2 } from 'lucide-react';

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ code: '', discount: '', expiryDate: '' });

  const fetchCoupons = async () => {
    try {
      const res = await api.get('/coupons');
      setCoupons(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching coupons', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/coupons', formData);
      setFormData({ code: '', discount: '', expiryDate: '' });
      fetchCoupons();
      alert('Coupon created successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating coupon');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        await api.delete(`/coupons/${id}`);
        fetchCoupons();
      } catch (error) {
        alert('Error deleting coupon');
      }
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      <h2 className="text-2xl roboto-bold text-gray-900 mb-8 flex items-center gap-2">
        <Tag className="w-6 h-6 text-[#6b21a8]" /> Manage Coupons
      </h2>

      {/* Create Coupon Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-10 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label className="block text-xs roboto-bold text-gray-600 mb-2 uppercase tracking-wide">Coupon Code</label>
          <input 
            type="text" required value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
            className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-[#6b21a8] uppercase roboto-medium" placeholder="E.g. EID500" 
          />
        </div>
        <div>
          <label className="block text-xs roboto-bold text-gray-600 mb-2 uppercase tracking-wide">Discount Amount (৳)</label>
          <input 
            type="number" required value={formData.discount} onChange={(e) => setFormData({...formData, discount: e.target.value})}
            className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-[#6b21a8] roboto-medium" placeholder="500" 
          />
        </div>
        <div>
          <label className="block text-xs roboto-bold text-gray-600 mb-2 uppercase tracking-wide">Expiry Date</label>
          <input 
            type="date" required value={formData.expiryDate} onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
            className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-[#6b21a8] roboto-medium" 
          />
        </div>
        <button type="submit" className="bg-[#6b21a8] text-white p-3 rounded-xl roboto-bold shadow-sm hover:bg-purple-800 transition flex items-center justify-center gap-2 h-[50px]">
          <Plus className="w-4 h-4" /> Add Coupon
        </button>
      </form>

      {/* Coupons List Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center p-10"><Loader2 className="w-8 h-8 animate-spin text-[#6b21a8]" /></div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 text-xs roboto-bold text-gray-500 uppercase">Code</th>
                <th className="p-4 text-xs roboto-bold text-gray-500 uppercase">Discount</th>
                <th className="p-4 text-xs roboto-bold text-gray-500 uppercase">Expiry Date</th>
                <th className="p-4 text-xs roboto-bold text-gray-500 uppercase">Status</th>
                <th className="p-4 text-xs roboto-bold text-gray-500 uppercase text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                  <td className="p-4 roboto-bold text-gray-900">{coupon.code}</td>
                  <td className="p-4 roboto-medium text-[#6b21a8]">৳ {coupon.discount}</td>
                  <td className="p-4 roboto-medium text-gray-600">{new Date(coupon.expiryDate).toLocaleDateString()}</td>
                  <td className="p-4">
                    <span className={`text-[10px] roboto-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${new Date(coupon.expiryDate) < new Date() ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                      {new Date(coupon.expiryDate) < new Date() ? 'Expired' : 'Active'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleDelete(coupon._id)} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && (
                <tr><td colSpan="5" className="p-8 text-center text-gray-400 roboto-medium">No coupons found. Create one above!</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminCoupons;
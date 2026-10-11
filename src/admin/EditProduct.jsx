import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axiosConfig'; // তোমার API কনফিগ ফাইলের পাথ ঠিক করে নিও
import { Upload, X, Loader2, ArrowLeft, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const EditProduct = () => {
  const { id } = useParams(); // URL থেকে প্রোডাক্টের আইডি নিচ্ছি
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    oldPrice: '',
    stock: '',
    category: '',
    brand: '',
  });

  const [imageFiles, setImageFiles] = useState([]); // নতুন ছবি আপলোড করার জন্য
  const [existingImages, setExistingImages] = useState([]); // আগের ছবিগুলো দেখানোর জন্য
  const [uploading, setUploading] = useState(false);

  // 📦 ক্যাটাগরি ফেচ করা (ড্রপডাউনের জন্য)
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('/categories');
      return res.data;
    }
  });

  // 📦 নির্দিষ্ট প্রোডাক্টের ডেটা ফেচ করা
  const { data: productData, isLoading: isProductLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const res = await api.get(`/products/${id}`);
      return res.data.product || res.data;
    }
  });

  // প্রোডাক্টের ডেটা ফেচ হলে ফর্ম ফিল-আপ করা
  useEffect(() => {
    if (productData) {
      setFormData({
        name: productData.name || '',
        description: productData.description || '',
        price: productData.price || '',
        oldPrice: productData.oldPrice || '',
        stock: productData.stock || '',
        category: productData.category?._id || productData.category || '',
        brand: productData.brand || '',
      });
      
      // ছবিগুলো সেট করা (String array বা image object অনুযায়ী)
      if (productData.images && productData.images.length > 0) {
        setExistingImages(productData.images);
      } else if (productData.image) {
        setExistingImages([productData.image]);
      }
    }
  }, [productData]);

  // ইনপুট চেঞ্জ হ্যান্ডলার
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ছবি সিলেক্ট হ্যান্ডলার
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles((prev) => [...prev, ...files]);
  };

  // নতুন সিলেক্ট করা ছবি রিমুভ হ্যান্ডলার
  const removeNewImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // আগের ছবি রিমুভ হ্যান্ডলার
  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  // ☁️ Cloudinary তে ছবি আপলোড করার ফাংশন
  const uploadImagesToCloudinary = async () => {
    if (imageFiles.length === 0) return [];

    setUploading(true);
    const uploadedUrls = [];
    const uploadPreset = 'unsigned_preset'; // তোমার Cloudinary এর Unsigned Preset নাম দাও
    const cloudName = 'dsrs8hryx'; // তোমার Cloudinary এর Cloud Name

    for (const file of imageFiles) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);

      try {
        const res = await axios.post(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, formData);
        uploadedUrls.push(res.data.secure_url);
      } catch (error) {
        console.error("Image upload failed:", error);
        toast.error("Failed to upload some images");
      }
    }
    setUploading(false);
    return uploadedUrls;
  };

  // 📝 প্রোডাক্ট আপডেট মিউটেশন
  const updateProductMutation = useMutation({
    mutationFn: async (updatedProduct) => {
      const res = await api.put(`/products/${id}`, updatedProduct);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-products']);
      queryClient.invalidateQueries(['product', id]);
      toast.success('Product updated successfully! 🎉');
      navigate('/admin/products');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update product');
    }
  });

  // ফর্ম সাবমিট হ্যান্ডলার
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ছবি আপলোড করা (যদি নতুন ছবি সিলেক্ট করা থাকে)
    let newUploadedUrls = [];
    if (imageFiles.length > 0) {
      newUploadedUrls = await uploadImagesToCloudinary();
    }

    // আগের এবং নতুন ছবির URL গুলো একসাথে করা
    const finalImages = [...existingImages, ...newUploadedUrls];

    if (finalImages.length === 0) {
      toast.error('Please upload at least one product image');
      return;
    }

    const updatedProductData = {
      ...formData,
      image: finalImages[0], // মেইন ইমেজের জন্য প্রথম ছবিটা
      images: finalImages,
    };

    updateProductMutation.mutate(updatedProductData);
  };

  if (isProductLoading) return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="w-10 h-10 text-cyan-600 animate-spin" /></div>;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden my-6">
      
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex items-center gap-4 bg-gray-50/50">
        <Link to="/admin/products" className="p-2 bg-white text-gray-500 hover:text-cyan-600 rounded-lg shadow-sm border border-gray-200 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Edit Product</h2>
          <p className="text-sm text-gray-500 mt-1">Update product information and pricing</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
        
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Product Name *</label>
            <input 
              type="text" name="name" required value={formData.name} onChange={handleChange}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Category *</label>
            <select 
              name="category" required value={formData.category} onChange={handleChange}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-cyan-500 transition-colors cursor-pointer"
            >
              <option value="" disabled>Select Category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Brand</label>
            <input 
              type="text" name="brand" value={formData.brand} onChange={handleChange}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Selling Price (৳) *</label>
            <input 
              type="number" name="price" required min="0" value={formData.price} onChange={handleChange}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Old Price (৳)</label>
            <input 
              type="number" name="oldPrice" min="0" value={formData.oldPrice} onChange={handleChange}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Stock Quantity *</label>
            <input 
              type="number" name="stock" required min="0" value={formData.stock} onChange={handleChange}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
        </div>

        <div className="pt-2">
          <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Product Description *</label>
          <textarea 
            name="description" required rows="4" value={formData.description} onChange={handleChange}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-cyan-500 transition-colors resize-none"
          ></textarea>
        </div>

        {/* Image Upload Section */}
        <div className="pt-4 border-t border-gray-100">
          <label className="block text-xs font-bold text-gray-600 uppercase mb-3">Product Images</label>
          
          <div className="flex flex-wrap gap-4 mb-4">
            {/* Existing Images */}
            {existingImages.map((url, index) => (
              <div key={`existing-${index}`} className="relative w-24 h-24 rounded-xl border border-gray-200 overflow-hidden group">
                <img src={url} alt="product" className="w-full h-full object-cover" />
                <button 
                  type="button" onClick={() => removeExistingImage(index)}
                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-6 h-6 text-white bg-red-500 rounded-full p-1" />
                </button>
              </div>
            ))}
            
            {/* New Selected Images */}
            {imageFiles.map((file, index) => (
              <div key={`new-${index}`} className="relative w-24 h-24 rounded-xl border border-gray-200 overflow-hidden group">
                <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                <button 
                  type="button" onClick={() => removeNewImage(index)}
                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-6 h-6 text-white bg-red-500 rounded-full p-1" />
                </button>
                <span className="absolute bottom-0 left-0 w-full bg-cyan-600/80 text-[9px] text-white font-bold text-center py-0.5">NEW</span>
              </div>
            ))}

            {/* Upload Button */}
            <label className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-cyan-50 hover:border-cyan-400 transition-colors">
              <Upload className="w-6 h-6 text-gray-400 mb-1" />
              <span className="text-[10px] font-bold text-gray-500">Upload</span>
              <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6 border-t border-gray-100 flex justify-end">
          <button 
            type="submit" 
            disabled={updateProductMutation.isPending || uploading}
            className="flex items-center gap-2 bg-cyan-600 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-cyan-600/20 hover:bg-cyan-700 hover:shadow-cyan-600/40 transition-all disabled:opacity-70 text-sm"
          >
            {updateProductMutation.isPending || uploading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Saving Changes...</>
            ) : (
              <><Save className="w-4 h-4" /> Update Product</>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};

export default EditProduct;
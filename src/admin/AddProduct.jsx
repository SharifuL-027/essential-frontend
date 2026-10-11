import { useQuery } from '@tanstack/react-query';
import api from '../api/axiosConfig'; 
import { useState, useRef } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { Plus, Trash2, Loader2, UploadCloud, Wand2, X } from 'lucide-react';

const AddProduct = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef(null);

  const [productData, setProductData] = useState({
    name: '', price: '', oldPrice: '', stock: '', category: '', brand: '',
  });

  // 🔥 মাল্টিপল ইমেজ স্টেট (২ থেকে ৮টি)
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const [description, setDescription] = useState('');
  
  // স্পেসিফিকেশন এবং AI পেস্ট স্টেট
  const [specifications, setSpecifications] = useState([{ name: '', value: '' }]);
  const [aiText, setAiText] = useState('');

  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await api.get('/categories')).data
  });

  const handleInputChange = (e) => setProductData({ ...productData, [e.target.name]: e.target.value });

  // 🔥 মাল্টিপল ইমেজ সিলেক্ট করার লজিক
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (imageFiles.length + files.length > 8) {
      alert("You can only upload a maximum of 8 images!");
      return;
    }

    setImageFiles([...imageFiles, ...files]);
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...previews]);
  };

  const removeImage = (indexToRemove) => {
    setImageFiles(imageFiles.filter((_, index) => index !== indexToRemove));
    setImagePreviews(imagePreviews.filter((_, index) => index !== indexToRemove));
  };

  // স্পেসিফিকেশন হ্যান্ডলার
  const handleSpecChange = (index, field, value) => {
    const newSpecs = [...specifications];
    newSpecs[index][field] = value;
    setSpecifications(newSpecs);
  };
  const addSpecRow = () => setSpecifications([...specifications, { name: '', value: '' }]);
  const removeSpecRow = (index) => {
    const newSpecs = [...specifications];
    newSpecs.splice(index, 1);
    setSpecifications(newSpecs);
  };

  // 🔥 AI থেকে পেস্ট করা টেক্সট অটো-পার্স করার এক্সট্রা স্মার্ট লজিক!
  const handleAiParse = () => {
    if (!aiText.trim()) return;
    
    const cleanText = aiText.replace(/\*/g, '');
    const lines = cleanText.split('\n');
    const parsedSpecs = [];

    lines.forEach(line => {
      let currentLine = line.trim();
      if (!currentLine) return;

      currentLine = currentLine.replace(/^[-•\d\.]+\s+/, '').trim();

      let name = '';
      let value = '';

      if (currentLine.includes(':')) {
        const parts = currentLine.split(':');
        name = parts.shift().trim();
        value = parts.join(':').trim();
      } else if (currentLine.includes(' - ')) { 
        const parts = currentLine.split(' - ');
        name = parts.shift().trim();
        value = parts.join(' - ').trim();
      } else {
        const parts = currentLine.split(/\s{2,}|\t+/); 
        if (parts.length >= 2) {
          name = parts.shift().trim();
          value = parts.join(' ').trim(); 
        }
      }

      if (name && value) {
        parsedSpecs.push({ name, value });
      }
    });

    if (parsedSpecs.length > 0) {
      const existingSpecs = specifications.filter(spec => spec.name.trim() !== '' || spec.value.trim() !== '');
      setSpecifications([...existingSpecs, ...parsedSpecs]);
      
      setAiText(''); 
      alert(`${parsedSpecs.length} Specifications generated successfully!`);
    } else {
      alert("Couldn't parse text. Try format: 'Key: Value', 'Key - Value' or separate them with multiple spaces/tabs.");
    }
  };

  // ফর্ম সাবমিট
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (imageFiles.length < 2 || imageFiles.length > 8) {
      setMessage('Please select between 2 and 8 images!');
      setLoading(false);
      return;
    }

    try {
      const uploadedUrls = [];

      // 🔥 সবগুলো ছবি একটা একটা করে ক্লাউডনারিতে আপলোড করা
      for (const file of imageFiles) {
        const formData = new FormData();
        formData.append('image', file);
        const uploadRes = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        const url = uploadRes.data.image || uploadRes.data.url || uploadRes.data.secure_url || uploadRes.data;
        if (url) uploadedUrls.push(url);
      }

      // ফাইনাল ডেটা রেডি করা
      const finalData = {
        ...productData,
        image: uploadedUrls[0], // প্রথম ছবিটা মেইন কভার হিসেবে থাকবে
        images: uploadedUrls,   // সব ছবির লিস্ট গ্যালারির জন্য
        description,
        specifications: specifications.filter(spec => spec.name !== '' && spec.value !== ''),
        slug: productData.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
      };

      await api.post(`/products`, finalData);
      
      setMessage('Product added successfully with multiple images! 🎉');
      setLoading(false);
      
      // ফর্ম রিসেট
      setProductData({ name: '', price: '', oldPrice: '', stock: '', category: '', brand: '' });
      setImageFiles([]); setImagePreviews([]); setDescription('');
      setSpecifications([{ name: '', value: '' }]);
      if (fileInputRef.current) fileInputRef.current.value = '';
      
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error adding product');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-6 md:py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto bg-white p-5 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
        
        <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-6 border-b border-gray-100 pb-4">Add New Product</h2>
        
        {message && (
          <div className={`p-4 mb-6 rounded-xl text-sm font-bold border ${message.includes('success') ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
          
          {/* Basic Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Product Name *</label>
              <input type="text" name="name" value={productData.name} required onChange={handleInputChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Category *</label>
              <select name="category" required value={productData.category} onChange={handleInputChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all cursor-pointer" disabled={isCategoriesLoading}>
                <option value="" disabled>Select a Category</option>
                {categories.map((cat) => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Brand</label>
              <input type="text" name="brand" value={productData.brand} onChange={handleInputChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Price (৳) *</label>
              <input type="number" name="price" value={productData.price} min="0" required onChange={handleInputChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Old Price (৳)</label>
              <input type="number" name="oldPrice" value={productData.oldPrice} min="0" onChange={handleInputChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Stock *</label>
              <input type="number" name="stock" value={productData.stock} min="0" required onChange={handleInputChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all" />
            </div>
          </div>

          {/* 🔥 Multiple Image Upload Section */}
          <div className="bg-cyan-50/50 p-4 md:p-5 rounded-xl border border-cyan-100">
            <label className="block text-xs font-bold text-gray-700 uppercase mb-3">Product Images (Min: 2, Max: 8) *</label>
            <input 
              type="file" accept="image/*" multiple ref={fileInputRef} onChange={handleImageChange} 
              className="w-full p-2.5 border border-gray-200 rounded-lg bg-white cursor-pointer text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100 transition-all" 
            />
            
            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-4">
                {imagePreviews.map((src, index) => (
                  <div key={index} className="relative w-16 h-16 sm:w-20 sm:h-20 group border border-gray-200 rounded-lg bg-white p-1">
                    <img src={src} alt="Preview" className="w-full h-full object-cover rounded-md" />
                    <button type="button" onClick={() => removeImage(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                      <X className="w-3 h-3" />
                    </button>
                    {index === 0 && <span className="absolute bottom-0 left-0 bg-cyan-600/90 text-white text-[9px] font-bold w-full text-center py-0.5 rounded-b-md">Cover</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Full Description */}
          <div className="mb-14 md:mb-16">
            <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Full Description *</label>
            <div className="h-56 md:h-64 mb-12">
              <ReactQuill theme="snow" value={description} onChange={setDescription} className="h-full rounded-lg" />
            </div>
          </div>

          {/* 🔥 Dynamic Specifications + AI Paste */}
          <div className="pt-6 border-t border-gray-100 mt-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-3">
              <label className="block text-xs font-bold text-gray-600 uppercase">Specifications</label>
              <button type="button" onClick={addSpecRow} className="text-xs font-bold bg-cyan-50 text-cyan-700 border border-cyan-200 px-4 py-2 rounded-lg flex items-center gap-1.5 hover:bg-cyan-100 transition-colors w-full sm:w-auto justify-center">
                <Plus className="w-4 h-4" /> Add Row
              </button>
            </div>

            {/* AI Paste Box */}
            <div className="mb-6 bg-gray-50/50 p-4 rounded-xl border border-gray-200">
              <label className="text-[11px] font-bold text-gray-500 uppercase mb-2 flex items-center gap-1.5">
                <Wand2 className="w-3.5 h-3.5 text-cyan-600" /> Auto-fill from AI (Format: Key : Value)
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <textarea 
                  rows="2" placeholder="Paste specs from ChatGPT here... e.g.&#10;RAM: 8GB&#10;Battery: 5000mAh" 
                  value={aiText} onChange={(e) => setAiText(e.target.value)}
                  className="flex-1 p-3 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all resize-none" 
                />
                <button type="button" onClick={handleAiParse} className="bg-gray-800 text-white px-6 py-3 rounded-lg text-sm font-bold hover:bg-gray-900 transition-colors w-full sm:w-auto flex-shrink-0 flex items-center justify-center">
                  Generate
                </button>
              </div>
            </div>

            {/* Specs Rows */}
            <div className="space-y-3">
              {specifications.map((spec, index) => (
                <div key={index} className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center bg-gray-50 p-3 sm:p-0 sm:bg-transparent rounded-xl border border-gray-100 sm:border-none">
                  <input type="text" placeholder="e.g. RAM" value={spec.name} onChange={(e) => handleSpecChange(index, 'name', e.target.value)} className="flex-1 p-3 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all" />
                  <input type="text" placeholder="e.g. 8GB" value={spec.value} onChange={(e) => handleSpecChange(index, 'value', e.target.value)} className="flex-1 p-3 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all" />
                  <button type="button" onClick={() => removeSpecRow(index)} className="w-full sm:w-auto p-3 text-red-500 bg-red-50 sm:bg-transparent hover:bg-red-100 sm:hover:bg-red-50 rounded-lg flex items-center justify-center gap-2 transition-colors border border-red-100 sm:border-transparent">
                    <Trash2 className="w-4 h-4" /> <span className="sm:hidden text-xs font-bold">Remove</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-8 border-t border-gray-100">
            <button type="submit" disabled={loading} className="w-full bg-cyan-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-cyan-600/20 hover:shadow-cyan-600/40 hover:bg-cyan-700 transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed text-sm uppercase tracking-wider">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UploadCloud className="w-5 h-5" />}
              {loading ? 'Uploading & Saving...' : 'Publish Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
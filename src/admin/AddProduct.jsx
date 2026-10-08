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
        // ১. যদি কোলন থাকে
        const parts = currentLine.split(':');
        name = parts.shift().trim();
        value = parts.join(':').trim();
      } else if (currentLine.includes(' - ')) { 
        // ২. যদি হাইফেন থাকে
        const parts = currentLine.split(' - ');
        name = parts.shift().trim();
        value = parts.join(' - ').trim();
      } else {
        // ৩. 🔥 নতুন লজিক: যদি কোলন বা হাইফেন না থাকে, কিন্তু একাধিক স্পেস বা ট্যাব (Tab) থাকে (টেবিল থেকে কপি করলে যেমন হয়)
        // \s{2,} মানে ২ বা তার বেশি স্পেস, \t মানে ট্যাব
        const parts = currentLine.split(/\s{2,}|\t+/); 
        if (parts.length >= 2) {
          name = parts.shift().trim();
          value = parts.join(' ').trim(); // বাকি অংশগুলো ভ্যালু হিসেবে জুড়ে দেবে
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
    <div className="min-h-screen bg-[#FAFAFA] py-12">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-black text-gray-900 mb-8 border-b pb-4">Add New Product</h2>
        {message && (
          <div className={`p-4 mb-6 rounded-md font-bold ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Product Name *</label>
              <input type="text" name="name" value={productData.name} required onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-md focus:ring-[#6b21a8] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Category *</label>
              <select name="category" required value={productData.category} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-md outline-none focus:ring-[#6b21a8]" disabled={isCategoriesLoading}>
                <option value="">Select a Category</option>
                {categories.map((cat) => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Price (৳) *</label>
              <input type="number" name="price" value={productData.price} required onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-md outline-none focus:ring-[#6b21a8]" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Old Price (৳)</label>
              <input type="number" name="oldPrice" value={productData.oldPrice} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-md outline-none focus:ring-[#6b21a8]" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Stock *</label>
              <input type="number" name="stock" value={productData.stock} required onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-md outline-none focus:ring-[#6b21a8]" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Brand</label>
              <input type="text" name="brand" value={productData.brand} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-md outline-none focus:ring-[#6b21a8]" />
            </div>
          </div>

          {/* 🔥 Multiple Image Upload Section */}
          <div className="bg-purple-50/50 p-4 rounded-lg border border-purple-100">
            <label className="block text-sm font-bold text-gray-700 mb-2">Product Images (Min: 2, Max: 8) *</label>
            <input 
              type="file" accept="image/*" multiple ref={fileInputRef} onChange={handleImageChange} 
              className="w-full p-2 border border-gray-300 rounded-md bg-white cursor-pointer" 
            />
            
            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="flex flex-wrap gap-4 mt-4">
                {imagePreviews.map((src, index) => (
                  <div key={index} className="relative w-20 h-20 group border rounded-md">
                    <img src={src} alt="Preview" className="w-full h-full object-cover rounded-md" />
                    <button type="button" onClick={() => removeImage(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-3 h-3" />
                    </button>
                    {index === 0 && <span className="absolute bottom-0 left-0 bg-[#6b21a8] text-white text-[9px] w-full text-center py-0.5 rounded-b-md">Cover</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mb-10">
            <label className="block text-sm font-bold text-gray-700 mb-2">Full Description *</label>
            <div className="h-64 mb-12">
              <ReactQuill theme="snow" value={description} onChange={setDescription} className="h-full" />
            </div>
          </div>

          {/* 🔥 Dynamic Specifications + AI Paste */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-bold text-gray-700">Specifications</label>
              <button type="button" onClick={addSpecRow} className="text-sm bg-[#6b21a8] text-white px-3 py-1.5 rounded-md flex items-center gap-1 hover:bg-purple-800">
                <Plus className="w-4 h-4" /> Add Row
              </button>
            </div>

            {/* AI Paste Box */}
            <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <label className="text-xs font-bold text-gray-500 mb-2 flex items-center gap-1">
                <Wand2 className="w-3.5 h-3.5" /> Auto-fill from AI (Format: Key : Value)
              </label>
              <div className="flex gap-2">
                <textarea 
                  rows="2" placeholder="Paste specs from ChatGPT here... e.g.&#10;RAM: 8GB&#10;Battery: 5000mAh" 
                  value={aiText} onChange={(e) => setAiText(e.target.value)}
                  className="flex-1 p-2 text-sm border border-gray-300 rounded-md outline-none focus:border-[#6b21a8]" 
                />
                <button type="button" onClick={handleAiParse} className="bg-gray-800 text-white px-4 rounded-md text-sm font-bold hover:bg-black transition-colors">
                  Generate
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {specifications.map((spec, index) => (
                <div key={index} className="flex gap-3 items-center">
                  <input type="text" placeholder="e.g. RAM" value={spec.name} onChange={(e) => handleSpecChange(index, 'name', e.target.value)} className="flex-1 p-3 border border-gray-300 rounded-md outline-none focus:border-[#6b21a8]" />
                  <input type="text" placeholder="e.g. 8GB" value={spec.value} onChange={(e) => handleSpecChange(index, 'value', e.target.value)} className="flex-1 p-3 border border-gray-300 rounded-md outline-none focus:border-[#6b21a8]" />
                  <button type="button" onClick={() => removeSpecRow(index)} className="p-3 text-red-500 hover:bg-red-50 rounded-md">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6">
            <button type="submit" disabled={loading} className="w-full bg-[#6b21a8] text-white font-bold py-4 rounded-md shadow-lg hover:bg-purple-800 transition-colors flex justify-center items-center gap-2 disabled:opacity-70">
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
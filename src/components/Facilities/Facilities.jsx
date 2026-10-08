import { Truck, ShieldCheck, Headphones, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';

const facilities = [
  {
    id: 1,
    icon: <Truck className="w-8 h-8 text-gray-800" />,
    title: "Free Delivery",
    description: "On orders over ৳5000"
  },
  {
    id: 2,
    icon: <ShieldCheck className="w-8 h-8 text-gray-800" />,
    title: "1 Year Warranty",
    description: "Original brand warranty"
  },
  {
    id: 3,
    icon: <Headphones className="w-8 h-8 text-gray-800" />,
    title: "24/7 Support",
    description: "Dedicated support anytime"
  },
  {
    id: 4,
    icon: <CreditCard className="w-8 h-8 text-gray-800" />,
    title: "Secure Payment",
    description: "100% secure checkout"
  }
];

// কন্টেইনারের জন্য ভ্যারিয়েন্ট (এটার কারণে একটার পর একটা এনিমেশন হবে)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2, // প্রতিটি আইটেম ০.২ সেকেন্ড পরপর আসবে
    }
  }
};

// প্রতিটি আলাদা আইটেমের জন্য ভ্যারিয়েন্ট (নিচ থেকে ভেসে উঠবে)
const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: "easeOut" } 
  }
};

const Facilities = () => {
  return (
    <div className="bg-white border-y border-gray-100 py-12 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* motion.div ব্যবহার করে scroll-এ আসার সাথে সাথে অ্যানিমেশন ট্রিগার করানো হলো */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }} // স্ক্রিনের ২০% ভিজিবল হলেই অ্যানিমেশন শুরু হবে
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {facilities.map((item) => (
            <motion.div 
              key={item.id} 
              variants={itemVariants}
              whileHover={{ y: -5, scale: 1.02 }} // হোভার করলে হালকা উপরে উঠবে
              className="flex items-center space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors duration-300 cursor-pointer"
            >
              <div className="flex-shrink-0 bg-gray-100 p-4 rounded-full">
                {item.icon}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 tracking-tight">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500 font-medium mt-1">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
        
      </div>
    </div>
  );
};

export default Facilities;
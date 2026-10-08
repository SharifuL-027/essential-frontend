import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Hero = () => {
  const changingWords = [
    "আরও সহজ ও স্মার্ট।",
    "আরও ফাস্ট ও সিকিউর।",
    "আরও প্রিমিয়াম ও আধুনিক।"
  ];

  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % changingWords.length);
    }, 3000); // 3000 ms = 3 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    // 🔥 min-h-screen সরিয়ে min-h-[60vh] এবং pt-24 pb-12 দেওয়া হয়েছে (হাইট কমানোর জন্য)
    <div className="relative min-h-[60vh] bg-linear-to-br from-gray-50 to-cyan-100 flex items-center overflow-hidden pt-24 pb-12 lg:pt-28 lg:pb-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 w-full">
        {/* 🔥 gap-12 এর বদলে gap-8 দেওয়া হয়েছে যাতে কনটেন্ট চাপা থাকে */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

          {/* Left Side: Minimalist Text Content */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-3xl lg:text-4xl roboto-bold text-gray-900 tracking-tight leading-[1.3] mb-4 flex flex-col" // mb-5 থেকে mb-4
            >
              <span>আপনার ডিজিটাল জীবন হোক</span>
              
              <span className="grid mt-2"> {/* mt-4 থেকে mt-2 */}
                <AnimatePresence>
                  <motion.span
                    key={wordIndex}
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -30, opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="col-start-1 row-start-1 text-transparent bg-clip-text bg-linear-to-r from-gray-900 to-gray-500"
                  >
                    {changingWords[wordIndex]}
                  </motion.span>
                </AnimatePresence>
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-base lg:text-lg text-gray-600 mb-6 max-w-md roboto-medium leading-relaxed" // mb-10 থেকে mb-6
            >
              আধুনিক প্রযুক্তি এবং মিনিমালিস্ট ডিজাইনের এক অপূর্ব সংমিশ্রণ উপভোগ করুন। <span className="roboto-bold text-cyan-400">Essential ZONE</span> এ খুঁজুন আপনার প্রতিদিনের জন্য সেরা সব প্রিমিয়াম গ্যাজেট।
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              {/* 🔥 বাটনের প্যাডিং px-8 py-4 থেকে কমিয়ে px-6 py-3 করা হয়েছে */}
              <Link to="/shop" className="group inline-flex items-center justify-center px-6 py-3 bg-gray-900 text-white roboto-semibold tracking-wide rounded-full hover:bg-cyan-500 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Shop
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>

          {/* Right Side: Modern Vector Illustration */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="relative flex justify-center lg:justify-end items-center mt-8 lg:mt-0" // mt-12 থেকে mt-8
          >
            {/* 🔥 ইমেজের স্কেল xl:scale-125 থেকে কমিয়ে xl:scale-110 করা হয়েছে যাতে হাইট না বাড়িয়ে দেয় */}
            <motion.img
              animate={{ y: [-10, 10, -10] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              src="https://res.cloudinary.com/dsrs8hryx/image/upload/v1791092477/Modern_Gadget_Workspace_Still_Life_ug0rhf.png"
              alt="Tech Illustration"
              className="w-full max-w-[400px] lg:max-w-none lg:w-[100%] xl:scale-110 object-contain drop-shadow-2xl z-10 transform lg:translate-x-4"
            />

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gray-200/60 rounded-full blur-[80px] -z-10"></div>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default Hero;
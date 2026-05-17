import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaHeartbeat, FaLeaf, FaShieldAlt } from 'react-icons/fa';

const Splash = ({ onFinish }) => {
  const [loadingStep, setLoadingStep] = useState(0);
  const loadingMessages = [
    "Setting things up...",
    "Loading health resources...",
    "Connecting to experts...",
    "Almost ready...",
    "Welcome to MASCOT!"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingStep(prev => {
        if (prev >= loadingMessages.length - 1) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 600);

    const timer = setTimeout(() => {
      onFinish();
    }, 3200);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [onFinish]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#04342C] to-[#0A5C4A] flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
      </div>
      
      <div className="absolute inset-0" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 1px)`,
        backgroundSize: '40px 40px'
      }}></div>

      <div className="relative z-10 text-center">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
          className="relative mb-8"
        >
          <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center border-4 border-white/30">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0"
            >
              <div className="w-4 h-4 bg-white rounded-full absolute -top-1 left-1/2 transform -translate-x-1/2"></div>
            </motion.div>
            <FaLeaf className="text-white text-5xl" />
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-4xl font-bold text-white mb-2"
        >
          MASCOT
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-white/70 text-sm"
        >
          Your Health Companion
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-12 w-64 mx-auto"
        >
          <div className="h-1 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: `${((loadingStep + 1) / loadingMessages.length) * 100}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-white rounded-full"
            />
          </div>
          
          <motion.p
            key={loadingStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-white/60 text-xs mt-3"
          >
            {loadingMessages[loadingStep]}
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="flex gap-3 justify-center mt-8"
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-2">
            <FaHeartbeat className="text-white text-xs" />
            <span className="text-white text-xs">HIV Prevention</span>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-2">
            <FaShieldAlt className="text-white text-xs" />
            <span className="text-white text-xs">Pregnancy Support</span>
          </div>
        </motion.div>
      </div>

      <motion.div
        animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-20 left-10 opacity-20"
      >
        <FaLeaf className="text-white text-6xl" />
      </motion.div>
      <motion.div
        animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute top-32 right-10 opacity-20"
      >
        <FaLeaf className="text-white text-4xl transform rotate-45" />
      </motion.div>
    </div>
  );
};

export default Splash;
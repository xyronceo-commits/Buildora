import React, { useEffect } from 'react';
import { motion } from 'motion/react';

interface SplashProps {
 onFinish: () => void;
}

export const Splash: React.FC<SplashProps> = ({ onFinish }) => {
 useEffect(() => {
 const timer = setTimeout(() => {
 onFinish();
 }, 1400);
 return () => clearTimeout(timer);
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, []);

 return (
 <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#111111] text-white p-6">
 <motion.div
 initial={{ scale: 0.85, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 transition={{ duration: 0.5, ease: 'easeOut' }}
 className="flex flex-col items-center text-center space-y-4"
 >
 <img
 src="/constrora-logo.svg"
 alt="CONSTRORA Logo"
 className="h-20 w-20 rounded-lg object-contain "
 />

 <div>
 <h1 className="font-['Cabinet_Grotesk'] text-4xl font-black tracking-tight text-white sm:text-5xl">
 CONSTR<span className="text-[#FBBF24]">ORA</span>
 </h1>

 <p className="mt-2 text-xs uppercase tracking-[0.25em] font-extrabold text-[#FBBF24]">
 Find what you need to build.
 </p>
 </div>

 <div className="pt-4 flex items-center gap-2">
 <span className="h-2 w-2 rounded-full bg-[#FBBF24] animate-ping" />
 <span className="text-xs text-neutral-500 dark:text-neutral-400 font-bold tracking-wider uppercase">DISCOVER · COMPARE · CONNECT</span>
 </div>
 </motion.div>
 </div>
 );
};

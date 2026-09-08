import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { HardHat, Compass } from 'lucide-react';

interface SplashProps {
  onFinish: () => void;
}

export const Splash: React.FC<SplashProps> = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 2200);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0B0C0E] text-white p-6">
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="flex flex-col items-center text-center"
      >
        <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 shadow-2xl shadow-amber-500/10">
          <HardHat className="h-10 w-10 text-amber-400" />
          <Compass className="absolute -bottom-1 -right-1 h-6 w-6 text-amber-500 bg-[#0B0C0E] rounded-full p-0.5 border border-amber-500/40" />
        </div>

        <h1 className="font-['Cabinet_Grotesk'] text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
          BUILD<span className="text-amber-500">ORA</span>
        </h1>

        <p className="mt-3 text-xs uppercase tracking-[0.25em] font-semibold text-slate-400">
          FIND WHAT YOU NEED TO BUILD.
        </p>

        <div className="mt-8 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping" />
          <span className="text-xs text-slate-500 font-medium">DISCOVER · COMPARE · CONNECT</span>
        </div>
      </motion.div>
    </div>
  );
};

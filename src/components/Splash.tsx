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
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0B0C0E] text-white p-6">
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="flex flex-col items-center text-center space-y-4"
      >
        <img
          src="/constrora-logo.svg"
          alt="CONSTRORA Logo"
          className="h-20 w-20 rounded-2xl object-contain shadow-2xl shadow-amber-500/20"
        />

        <div>
          <h1 className="font-['Cabinet_Grotesk'] text-4xl font-black tracking-tight text-white sm:text-5xl">
            CONSTR<span className="text-amber-500">ORA</span>
          </h1>

          <p className="mt-2 text-xs uppercase tracking-[0.25em] font-extrabold text-amber-400">
            Find what you need to build.
          </p>
        </div>

        <div className="pt-4 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
          <span className="text-xs text-slate-400 font-bold tracking-wider uppercase">DISCOVER · COMPARE · CONNECT</span>
        </div>
      </motion.div>
    </div>
  );
};

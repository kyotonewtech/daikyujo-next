"use client";

import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const HERO_IMAGES = ['/hero-image.png', '/hero2.jpg'] as const;

export default function Hero() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 7000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Background Image with Zoom Effect and Slideshow */}
      <AnimatePresence mode="wait">
        <motion.div
          key={HERO_IMAGES[currentImageIndex]}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            opacity: { duration: 1 },
            scale: { duration: 10, ease: "easeOut" }
          }}
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('${HERO_IMAGES[currentImageIndex]}')`
          }}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        />
      </AnimatePresence>

      <div className="absolute inset-0 bg-black/30" />

      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white">
        <div className="flex flex-col md:flex-row items-center justify-center h-[60vh]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="writing-vertical text-upright tracking-[0.4em] flex flex-col items-center h-full border-r-2 border-white/30 pr-8 mr-8 md:mr-12"
          >
            <h1 className="font-shippori text-5xl md:text-7xl drop-shadow-lg whitespace-nowrap leading-relaxed">
              日本の心を引く。
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.5 }}
            className="mt-8 md:mt-0 font-serif text-xl tracking-widest drop-shadow-md writing-vertical text-upright h-[40vh] flex items-center"
          >
            <p>創業百六十余年 園山大弓場</p>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <ChevronDown className="text-white/80" size={32} />
        </motion.div>
      </motion.div>
    </section>
  );
}

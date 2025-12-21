"use client";

import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const HERO_IMAGES = ['/hero-image.jpg', '/hero2.jpg'] as const;

export default function Hero() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

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
          initial={isMounted ? { opacity: 0, scale: 1.1 } : false}
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
        <div className="flex flex-col items-center justify-center h-[70vh] sm:h-[65vh] md:h-[60vh] max-h-[800px]">
          {/* 縦書きレイアウト: 創業百六十余年 / 園山大弓場 / 日本の心を引く。 */}
          <div className="writing-vertical text-upright flex flex-col items-start">
            {/* 創業百六十余年 */}
            <motion.div
              initial={isMounted ? { opacity: 0 } : false}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="font-serif hero-subtitle-text tracking-widest drop-shadow-md mb-4"
            >
              <p>創業百六十余年</p>
            </motion.div>

            {/* 園山大弓場 (メインテキスト) */}
            <motion.div
              initial={isMounted ? { opacity: 0, y: 20 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1 }}
              className="font-shippori hero-main-text drop-shadow-lg ml-8 mb-4"
            >
              <h1 className="tracking-[0.4em] whitespace-nowrap leading-relaxed">
                園山大弓場
              </h1>
            </motion.div>

            {/* 日本の心を引く。 */}
            <motion.div
              initial={isMounted ? { opacity: 0 } : false}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.5 }}
              className="font-serif hero-subtitle-text tracking-widest drop-shadow-md ml-16"
            >
              <p>日本の心を引く。</p>
            </motion.div>
          </div>
        </div>
      </div>

      <motion.div
        initial={isMounted ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={isMounted ? { y: [0, 10, 0] } : {}}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <ChevronDown className="text-white/80" size={32} />
        </motion.div>
      </motion.div>
    </section>
  );
}

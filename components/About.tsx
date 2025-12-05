"use client";

import { motion } from "framer-motion";

export default function About() {
  return (
    <section id="about" className="py-32 px-6 bg-[#fcfaf2]">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          {/* Image Area */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full md:w-1/2"
          >
            <div className="relative aspect-[3/4] overflow-hidden rounded-sm shadow-xl">
              <img
                src="/image1.png"
                alt="弓道の様子"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute -bottom-6 -right-6 w-32 h-32 border-2 border-accent/30 -z-10" />
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-accent/5 -z-10" />
            </div>
          </motion.div>

          {/* Text Area */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full md:w-1/2"
          >
            <div className="mb-8">
              <h2 className="font-shippori text-4xl font-bold mb-4">ご挨拶</h2>
              <span className="block text-xs font-sans text-accent tracking-[0.3em]">INTRODUCTION</span>
            </div>
            
            <div className="space-y-6 text-lg leading-loose font-serif text-gray-700">
              <p>
                京都・東山。円山公園のほど近く。<br />
                園山大弓場は、文久二年（1862年）より続く弓道場です。
              </p>
              <p>
                静寂の中で的を見据え、矢を放つ。<br />
                日常の喧騒を離れ、心静かなひとときをお過ごしください。
              </p>
              <p>
                初めての方でも、手ぶらで気軽にお楽しみいただけます。<br />
                古都の風情と共に、日本の伝統文化に触れてみませんか。
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

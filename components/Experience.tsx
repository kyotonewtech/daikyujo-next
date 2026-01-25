"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const experiences = [
  {
    title: "大弓体験（一般）",
    price: "2,700円 〜",
    unit: "/ 約30分",
    desc: "初心者の方でも安心して体験いただけます。道具は全て貸し出しいたします。伝統的な大弓の感触をお楽しみください。",
    image: "/image2.jpg",
    linkText: "詳しく見る",
  },
  {
    title: "経験者向け利用",
    price: "注意事項",
    unit: "",
    desc: "弓道経験のある方向けの練習利用も可能です。当弓場独自の作法がございますので、ご利用前に必ず注意事項をご確認ください。",
    image: "/image3.jpg",
    linkText: "注意事項を見る",
  },
  {
    title: "For Visitors",
    price: "English Guide",
    unit: "",
    desc: "We offer a traditional Japanese archery experience. Please read the guidelines before visiting. No reservation required for individuals.",
    image: "/image4.png",
    linkText: "Read More",
  },
];

export default function Experience() {
  return (
    <section id="experience" className="py-32 px-6 bg-[#fcfaf2]">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="font-shippori text-3xl font-bold mb-3">体験・料金</h2>
          <span className="block text-xs font-sans text-accent tracking-[0.3em]">EXPERIENCE</span>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {experiences.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="group bg-white rounded-sm overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100"
            >
              <div className="h-56 overflow-hidden relative">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-500 z-10" />
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>
              <div className="p-8">
                <h3 className="font-shippori text-xl mb-4 group-hover:text-accent transition-colors">
                  {item.title}
                </h3>
                <p className="text-accent font-bold text-lg mb-4">
                  {item.price}{" "}
                  <span className="text-sm font-normal text-gray-600">{item.unit}</span>
                </p>
                <p className="text-gray-600 text-sm leading-relaxed mb-8 min-h-[80px]">
                  {item.desc}
                </p>
                <a
                  href={
                    index === 0
                      ? "/beginners"
                      : index === 1
                        ? "/beginners?tab=guide#experienced"
                        : "https://www.the-true-works.com/location-data/enzan-daikyujo"
                  }
                  className="inline-flex items-center text-sm font-medium border-b border-accent pb-1 hover:text-accent transition-colors group/link"
                >
                  {item.linkText}
                  <span className="ml-2 group-hover/link:translate-x-1 transition-transform">
                    →
                  </span>
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

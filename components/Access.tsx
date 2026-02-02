"use client";

import { motion } from "framer-motion";
import { MapPin, Phone } from "lucide-react";

export default function Access() {
  return (
    <section id="access" className="py-32 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="font-shippori text-3xl font-bold mb-3">アクセス</h2>
          <span className="block text-xs font-sans text-accent tracking-[0.3em]">ACCESS</span>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Map Area */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full h-[450px] bg-gray-100 relative group overflow-hidden rounded-sm shadow-inner"
          >
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-100">
              {/* Placeholder for map */}
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3268.123456789012!2d135.780000!3d35.003000!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzXCsDAwJzEwLjgiTiAxMzXCsDQ2JzQ4LjAiRQ!5e0!3m2!1sja!2sjp!4v1620000000000!5m2!1sja!2sjp"
                width="100%"
                height="100%"
                style={{ border: 0, filter: "grayscale(100%) contrast(1.2) opacity(0.8)" }}
                allowFullScreen={false}
                loading="lazy"
                className="group-hover:filter-none transition-all duration-500"
              ></iframe>
            </div>
            <a
              href="https://maps.app.goo.gl/J24bqjqzpJtSQPzM9"
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-8 py-3 shadow-lg rounded-full text-sm font-bold hover:bg-accent hover:text-white transition-all duration-300 transform hover:-translate-y-1"
            >
              Googleマップで開く
            </a>
          </motion.div>

          {/* Info Area */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="space-y-10"
          >
            <div>
              <h3 className="font-shippori text-3xl font-bold mb-8 border-l-4 border-accent pl-4">
                園山大弓場
              </h3>
              <div className="space-y-6">
                <div className="flex items-start gap-5">
                  <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0 text-accent">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">住所</p>
                    <p className="text-lg font-medium">
                      〒605-0071 <br />
                      京都市東山区円山町（円山公園内）
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-5">
                  <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0 text-accent">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">電話番号</p>
                    <p className="text-2xl font-serif tracking-wider">075-561-3568</p>
                    <p className="text-xs text-gray-500 mt-1">
                      ※お電話にて空き状況をご確認ください
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-10">
              <h4 className="font-bold mb-6 flex items-center gap-3 text-lg">
                <span className="w-1.5 h-6 bg-accent rounded-full"></span>
                交通アクセス
              </h4>
              <ul className="space-y-6 text-gray-700">
                <li className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                  <span className="font-bold whitespace-nowrap w-20 bg-gray-100 text-center py-1 text-xs rounded">
                    電車
                  </span>
                  <span>京阪本線「祇園四条駅」より徒歩約15分</span>
                </li>
                <li className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                  <span className="font-bold whitespace-nowrap w-20 bg-gray-100 text-center py-1 text-xs rounded">
                    バス
                  </span>
                  <span>市バス「祇園」停留所より徒歩約10分</span>
                </li>
                <li className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6">
                  <span className="font-bold whitespace-nowrap w-20 bg-gray-100 text-center py-1 text-xs rounded mt-1">
                    お車
                  </span>
                  <span className="flex-1">
                    専用駐車場はございません。
                    <br className="hidden sm:block" />
                    近隣のコインパーキングをご利用ください。
                  </span>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

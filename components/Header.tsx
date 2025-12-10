"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // /seiseki, /beginners ページでは常にスクロール済みスタイルを適用
  const shouldUseScrolledStyle = isScrolled || pathname === '/seiseki' || pathname === '/beginners';

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "初めての方へ", href: "/beginners" },
    { name: "道場について", href: "/#about" },
    { name: "営業案内", href: "/#info" },
    { name: "成績", href: "/seiseki" },
    { name: "料金", href: "/#experience" },
    { name: "アクセス", href: "/#access" },
  ];

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        shouldUseScrolledStyle
          ? "bg-[#fcfaf2]/95 backdrop-blur-md border-b border-gray-200 py-3 shadow-sm"
          : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
        <a
          href="/"
          className={`font-shippori text-2xl font-bold tracking-wider transition-colors ${
            shouldUseScrolledStyle ? "text-foreground" : "text-white"
          }`}
        >
          園山大弓場
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:block">
          <ul className="flex gap-8 items-center">
            {navLinks.map((link) => (
              <li key={link.name}>
                <a
                  href={link.href}
                  className={`text-sm tracking-wide transition-colors hover:text-accent ${
                    shouldUseScrolledStyle ? "text-foreground" : "text-white/90 hover:text-white"
                  }`}
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMenu}
          className={`md:hidden p-2 transition-colors ${
            shouldUseScrolledStyle ? "text-foreground" : "text-white"
          }`}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-full left-0 w-full bg-[#fcfaf2] border-b border-gray-200 shadow-lg py-4 px-6"
          >
            <ul className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="block py-2 text-lg border-b border-gray-100 font-serif"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

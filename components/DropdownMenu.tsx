"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface DropdownOption {
  label: string;
  href: string;
}

interface DropdownMenuProps {
  label: string;
  options: DropdownOption[];
  isScrolled?: boolean;
  isMobile?: boolean;
}

export default function DropdownMenu({
  label,
  options,
  isScrolled = false,
  isMobile = false,
}: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleMouseEnter = () => {
    if (!isMobile) {
      setIsOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setIsOpen(false);
    }
  };

  const handleClick = () => {
    if (isMobile) {
      setIsOpen(!isOpen);
    }
  };

  const handleOptionClick = () => {
    setIsOpen(false);
  };

  return (
    <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <button
        onClick={handleClick}
        className={`flex items-center gap-1 text-sm tracking-wide transition-colors hover:text-accent ${
          isScrolled ? "text-foreground" : "text-white/90 hover:text-white"
        }`}
      >
        {label}
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${isOpen ? "rotate-180" : "rotate-0"}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={`absolute ${
              isMobile ? "left-0 top-full" : "left-0 top-full mt-2"
            } min-w-[150px] bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden z-50`}
          >
            <ul>
              {options.map((option) => (
                <li key={option.label}>
                  <a
                    href={option.href}
                    onClick={handleOptionClick}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    {option.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

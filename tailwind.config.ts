import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#fcfaf2", // 生成り色
        foreground: "#333333", // 墨色
        accent: "#8d3028",     // 檜皮色/エンジ
      },
      fontFamily: {
        sans: ["var(--font-noto-sans)"],
        serif: ["var(--font-noto-serif)"],
      },
      backgroundImage: {
        'hero-pattern': "linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('https://images.unsplash.com/photo-1519926734743-40683f83733a?q=80&w=1920&auto=format&fit=crop')",
      }
    },
  },
  plugins: [],
};
export default config;
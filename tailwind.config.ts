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
        shippori: ["var(--font-shippori)"],
      },
    },
  },
  plugins: [],
};
export default config;
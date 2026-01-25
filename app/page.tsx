"use client";

import About from "@/components/About";
import Access from "@/components/Access";
import Experience from "@/components/Experience";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Info from "@/components/Info";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#fcfaf2]">
      <Header />
      <Hero />
      <About />
      <Info />
      <Experience />
      <Access />
      <Footer />
    </main>
  );
}

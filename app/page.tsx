"use client";

import Header from "@/components/Header";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Info from "@/components/Info";
import Experience from "@/components/Experience";
import Access from "@/components/Access";
import Footer from "@/components/Footer";

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
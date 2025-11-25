"use client";

import { useState } from "react";
import { MapPin, Phone, Clock, AlertCircle, Menu, X, ChevronDown } from "lucide-react";

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const navLinks = [
    { name: "園山について", href: "#about" },
    { name: "営業案内", href: "#info" },
    { name: "体験・料金", href: "#experience" },
    { name: "アクセス", href: "#access" },
  ];

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 w-full bg-[#fcfaf2]/90 backdrop-blur-md z-50 border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <a href="#" className="font-serif text-2xl font-bold tracking-wider">
            園山大弓場
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:block">
            <ul className="flex gap-8">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-sm hover:text-accent transition-colors tracking-wide">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Mobile Menu Button */}
          <button onClick={toggleMenu} className="md:hidden p-2 text-foreground">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Nav Overlay */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-[#fcfaf2] border-b border-gray-200 shadow-lg py-4 px-6 animate-in slide-in-from-top-5">
            <ul className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="block py-2 text-lg border-b border-gray-100"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center bg-hero-pattern bg-cover bg-center bg-no-repeat text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex flex-col items-center h-[60vh]">
          <div className="writing-vertical text-upright tracking-[0.3em] flex flex-col items-center h-full border-r-2 border-accent/80 pr-6 mr-6">
            <h1 className="font-serif text-4xl md:text-6xl drop-shadow-lg whitespace-nowrap">
              一射、一瞬。<br />京で弓引く。
            </h1>
          </div>
          <p className="mt-8 font-serif text-lg tracking-widest drop-shadow-md md:absolute md:bottom-0 md:left-1/2 md:-translate-x-1/2 md:mt-0">
            創業百六十余年 園山大弓場
          </p>
        </div>
        
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="text-white/80" size={32} />
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-3xl font-semibold mb-2">ご挨拶</h2>
          <span className="block text-xs font-sans text-accent tracking-widest mb-10">INTRODUCTION</span>
          <p className="text-lg leading-loose text-gray-700">
            京都・東山。円山公園のほど近く。<br />
            園山大弓場は、文久二年（1862年）より続く弓道場です。<br />
            <br />
            静寂の中で的を見据え、矢を放つ。<br />
            日常の喧騒を離れ、心静かなひとときをお過ごしください。<br />
            初めての方でも、手ぶらで気軽にお楽しみいただけます。
          </p>
        </div>
      </section>

      {/* Information Section */}
      <section id="info" className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-semibold mb-2">営業案内</h2>
            <span className="block text-xs font-sans text-accent tracking-widest">INFORMATION</span>
          </div>

          <div className="bg-[#fcfaf2] p-8 md:p-12 rounded-sm border-l-4 border-accent shadow-sm">
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-start border-b border-gray-200 pb-6">
                <div className="flex items-center gap-2 w-32 font-bold text-accent mb-2 md:mb-0">
                  <Clock size={18} />
                  <span>営業時間</span>
                </div>
                <div>
                  <p className="text-lg">11:00 〜 16:00</p>
                  <p className="text-sm text-gray-500 mt-1">※不定休あり。天候により変更となる場合がございます。</p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-start border-b border-gray-200 pb-6">
                <div className="flex items-center gap-2 w-32 font-bold text-accent mb-2 md:mb-0">
                  <AlertCircle size={18} />
                  <span>お知らせ</span>
                </div>
                <div>
                  <p>現在、平日は予約制となっております。</p>
                  <p>ご来場の際は事前にお電話にてご確認ください。</p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-start">
                <div className="flex items-center gap-2 w-32 font-bold text-accent mb-2 md:mb-0">
                  <AlertCircle size={18} />
                  <span>注意事項</span>
                </div>
                <div className="text-sm text-gray-600 space-y-2">
                  <p>・14歳以下のお子様のご利用は安全上の理由からご遠慮いただいております。</p>
                  <p>・飲酒されている方のご利用はお断りいたします。</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section id="experience" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl font-semibold mb-2">体験・料金</h2>
            <span className="block text-xs font-sans text-accent tracking-widest">EXPERIENCE</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-white group hover:-translate-y-1 transition-transform duration-300 shadow-sm border border-gray-100">
              <div className="h-48 overflow-hidden bg-gray-200">
                 {/* Next/Imageの使用を推奨しますが、簡略化のためimgタグを使用 */}
                <img 
                  src="https://images.unsplash.com/photo-1535581652167-3d6b98c9a7c5?q=80&w=800&auto=format&fit=crop" 
                  alt="大弓体験" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-8">
                <h3 className="font-serif text-xl mb-4 group-hover:text-accent transition-colors">大弓体験（一般）</h3>
                <p className="text-accent font-bold text-lg mb-4">2,700円 〜 <span className="text-sm font-normal text-gray-600">/ 約30分</span></p>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  初心者の方でも安心して体験いただけます。道具は全て貸し出しいたします。伝統的な大弓の感触をお楽しみください。
                </p>
                <a href="#access" className="inline-block text-sm border-b border-accent pb-1 hover:opacity-70">詳しく見る →</a>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white group hover:-translate-y-1 transition-transform duration-300 shadow-sm border border-gray-100">
              <div className="h-48 overflow-hidden bg-gray-200">
                <img 
                  src="https://images.unsplash.com/photo-1528360983277-13d90123552a?q=80&w=800&auto=format&fit=crop" 
                  alt="経験者利用" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-8">
                <h3 className="font-serif text-xl mb-4 group-hover:text-accent transition-colors">経験者向け利用</h3>
                <p className="text-accent font-bold text-lg mb-4">お問い合わせ</p>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  弓道経験のある方向けの練習利用も可能です。的までの距離28m。ご自身の弓の持ち込みについてはご相談ください。
                </p>
                <a href="#access" className="inline-block text-sm border-b border-accent pb-1 hover:opacity-70">お問い合わせ →</a>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white group hover:-translate-y-1 transition-transform duration-300 shadow-sm border border-gray-100">
              <div className="h-48 overflow-hidden bg-gray-200">
                <img 
                  src="https://plus.unsplash.com/premium_photo-1661962692058-d6d849e2719d?q=80&w=800&auto=format&fit=crop" 
                  alt="Inbound" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-8">
                <h3 className="font-serif text-xl mb-4 group-hover:text-accent transition-colors">For Visitors</h3>
                <p className="text-accent font-bold text-lg mb-4">English Guide</p>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  We offer a traditional Japanese archery experience. Please read the guidelines before visiting. No reservation required for individuals.
                </p>
                <a href="#access" className="inline-block text-sm border-b border-accent pb-1 hover:opacity-70">Read More →</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Access Section */}
      <section id="access" className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl font-semibold mb-2">アクセス</h2>
            <span className="block text-xs font-sans text-accent tracking-widest">ACCESS</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Map Area */}
            <div className="w-full h-[400px] bg-gray-100 relative group overflow-hidden rounded-sm">
               {/* 実際のGoogle Maps Embedに置き換えてください */}
              <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-100">
                Google Maps Embed Area
              </div>
              <a 
                href="https://goo.gl/maps/YOUR_MAP_ID" 
                target="_blank" 
                rel="noopener noreferrer"
                className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white px-6 py-3 shadow-lg rounded-full text-sm font-bold hover:bg-gray-50 text-foreground transition-colors"
              >
                Googleマップで開く
              </a>
            </div>

            {/* Info Area */}
            <div className="space-y-8">
              <div>
                <h3 className="font-serif text-2xl font-bold mb-6">園山大弓場</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <MapPin className="text-accent mt-1 flex-shrink-0" />
                    <p>〒605-0071 <br />京都市東山区円山町（円山公園音楽堂前）</p>
                  </div>
                  <div className="flex items-start gap-4">
                    <Phone className="text-accent mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-2xl font-serif">075-561-2284</p>
                      <p className="text-xs text-gray-500 mt-1">※お電話にて空き状況をご確認ください</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-8">
                <h4 className="font-bold mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-accent rounded-full"></span>
                  交通アクセス
                </h4>
                <ul className="space-y-4 text-sm text-gray-700">
                  <li className="flex gap-4">
                    <span className="font-bold whitespace-nowrap w-20">電車</span>
                    <span>京阪本線「祇園四条駅」より徒歩約15分</span>
                  </li>
                  <li className="flex gap-4">
                    <span className="font-bold whitespace-nowrap w-20">バス</span>
                    <span>市バス「祇園」停留所より徒歩約10分</span>
                  </li>
                  <li className="flex gap-4">
                    <span className="font-bold whitespace-nowrap w-20">お車</span>
                    <span>専用駐車場はございません。近隣のコインパーキングをご利用ください。</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#222] text-gray-400 py-12 text-center text-sm">
        <div className="container mx-auto px-6">
          <p className="font-serif mb-4 text-white text-lg">園山大弓場</p>
          <p>© Sonoyama Daikyujyo. All Rights Reserved.</p>
        </div>
      </footer>
    </main>
  );
}
"use client";

import Link from "next/link";

const siteLinks = [
  { name: "ホーム", href: "/" },
  { name: "道場について", href: "/#about" },
  { name: "営業案内", href: "/#info" },
  { name: "料金・体験", href: "/#experience" },
  { name: "アクセス", href: "/#access" },
  { name: "成績", href: "/seiseki" },
  { name: "初めての方へ", href: "/beginners" },
];

export default function Footer() {
  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-ink text-gray-300 relative">
      {/* メインコンテンツ */}
      <div className="max-w-6xl mx-auto px-6 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
          {/* ゾーン1: 道場情報 */}
          <div>
            <p className="font-shippori text-white text-2xl tracking-widest mb-4">園山大弓場</p>
            <p className="text-xs tracking-[0.2em] text-gray-400 mb-6">ENZAN DAIKYUJYO</p>
            <address className="not-italic space-y-2 text-sm leading-relaxed">
              <p>〒605-0073</p>
              <p>京都市東山区円山公園北林</p>
              <p className="mt-3">
                <a href="tel:075-561-3568" className="transition-colors hover:text-white">
                  075-561-3568
                </a>
              </p>
            </address>
          </div>

          {/* ゾーン2: サイトマップ */}
          <div>
            <p className="text-xs tracking-[0.2em] text-gray-400 uppercase mb-4">Site Map</p>
            <nav aria-label="フッターナビゲーション">
              <ul className="space-y-3">
                {siteLinks.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-sm transition-colors hover:text-white">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* ゾーン3: ご利用時間 */}
          <div>
            <p className="text-xs tracking-[0.2em] text-gray-400 uppercase mb-4">Hours</p>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-white font-medium mb-1">営業時間</p>
                <p>10:00 〜 19:00（土日祝）</p>
                <p>13:00 〜 19:00（平日）</p>
                <p className="text-gray-400 text-xs mt-1">※不定休あり</p>
              </div>
              <div className="pt-2">
                <p className="text-white font-medium mb-1">ご予約</p>
                <p>事前にお電話にてご連絡ください</p>
              </div>
            </div>
          </div>
        </div>

        {/* ページ上部へ戻るボタン */}
        <div className="flex justify-end mt-8">
          <button
            type="button"
            onClick={handleScrollTop}
            aria-label="ページ上部へ戻る"
            className="text-xs text-gray-400 border border-gray-600 px-4 py-2 rounded-sm transition-colors hover:text-white hover:border-gray-300"
          >
            ▲ ページ上部へ
          </button>
        </div>
      </div>

      {/* 下段 */}
      <div className="border-t border-gray-700">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p className="font-serif tracking-wider">© Enzan Daikyujyo. All Rights Reserved.</p>
          <Link href="/admin/login" className="transition-opacity opacity-50 hover:opacity-100">
            管理者
          </Link>
        </div>
      </div>
    </footer>
  );
}

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#1a1a1a] text-gray-400 py-16 text-center text-sm relative">
      <div className="container mx-auto px-6">
        <div className="mb-8">
          <p className="font-shippori text-white text-2xl tracking-widest mb-2">園山大弓場</p>
          <p className="text-xs tracking-[0.2em] opacity-50">ENZAN DAIKYUJYO</p>
        </div>

        <div className="w-12 h-[1px] bg-gray-600 mx-auto mb-8"></div>

        <div className="mb-4">
          <Link
            href="/admin/login"
            className="text-xs opacity-50 hover:opacity-100 transition-opacity"
          >
            管理者
          </Link>
        </div>

        <p className="font-serif text-xs tracking-wider">© Enzan Daikyujyo. All Rights Reserved.</p>
      </div>
    </footer>
  );
}

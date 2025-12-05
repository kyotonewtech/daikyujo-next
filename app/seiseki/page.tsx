import { getAvailableYears, getYearSeisekiData } from "@/lib/seiseki";
import { getTaikaiArchiveList, getTaikaiData } from "@/lib/taikai";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SeisekiPageClient from "./SeisekiPageClient";
import type { SeisekiMonth } from "@/types/seiseki";
import type { TaikaiData } from "@/types/taikai";

// キャッシュを無効化し、毎回動的にレンダリング
export const dynamic = 'force-dynamic';

export default async function SeisekiPage() {
  // 通常成績データ取得
  const availableYears = getAvailableYears();
  const yearDataMap = new Map<number, SeisekiMonth[]>();

  // 各年のデータを取得してMapに格納
  for (const year of availableYears) {
    const monthsData = getYearSeisekiData(year);
    if (monthsData.length > 0) {
      yearDataMap.set(year, monthsData);
    }
  }

  // 大会成績データ取得
  const taikaiArchiveList = getTaikaiArchiveList();
  const taikaiList: TaikaiData[] = [];

  // 各年の大会データを取得（降順でソート済み）
  for (const archive of taikaiArchiveList.archives) {
    const taikaiData = getTaikaiData(archive.year);
    if (taikaiData) {
      taikaiList.push(taikaiData);
    }
  }

  console.log('[Server] taikaiArchiveList.archives:', taikaiArchiveList.archives);
  console.log('[Server] taikaiList length:', taikaiList.length);
  console.log('[Server] taikaiList:', taikaiList.map(t => ({ year: t.year, name: t.taikaiName, count: t.participants.length })));

  // データが全くない場合
  if (availableYears.length === 0 && taikaiList.length === 0) {
    return (
      <>
        <Header />
        <section className="py-32 px-6 bg-background min-h-screen">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="font-shippori text-3xl font-bold text-gray-800 mb-2">
              弓術競技会成績
            </h2>
            <span className="block text-xs text-accent tracking-[0.3em] mb-12">
              RESULTS
            </span>
            <p className="text-gray-600 mt-8">
              現在、公開中の成績データはありません。
            </p>
          </div>
        </section>
        <Footer />
      </>
    );
  }

  // Client Componentにデータを渡す
  // MapをObjectに変換してシリアライズ可能にする
  const yearDataObject: Record<number, SeisekiMonth[]> = {};
  yearDataMap.forEach((value, key) => {
    yearDataObject[key] = value;
  });

  return (
    <>
      <Header />
      <section className="py-32 px-6 bg-background min-h-screen">
        <div className="max-w-6xl mx-auto">
          {/* タイトル */}
          <div className="text-center mb-12">
            <h2 className="font-shippori text-3xl font-bold text-gray-800 mb-2">
              弓術競技会成績
            </h2>
            <span className="block text-xs text-accent tracking-[0.3em]">
              RESULTS
            </span>
          </div>

          {/* Client Component */}
          <SeisekiPageClient
            availableYears={availableYears}
            yearDataObject={yearDataObject}
            taikaiList={taikaiList}
          />
        </div>
      </section>
      <Footer />
    </>
  );
}

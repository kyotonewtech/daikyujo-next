"use client";

import { useState } from "react";
import TabNav from "@/components/seiseki/TabNav";
import SeisekiTabContent from "@/components/seiseki/SeisekiTabContent";
import TaikaiTabContent from "@/components/seiseki/TaikaiTabContent";
import type { SeisekiTab, SeisekiTabId, SeisekiMonth } from "@/types/seiseki";
import type { TaikaiData } from "@/types/taikai";

interface SeisekiPageClientProps {
  availableYears: number[];
  yearDataObject: Record<number, SeisekiMonth[]>;
  taikaiList: TaikaiData[];
  latestYear: number | null;
  latestMonth: number | null;
}

const tabs: SeisekiTab[] = [
  { id: "seiseki", label: "通常成績" },
  { id: "taikai", label: "大会成績" },
];

export default function SeisekiPageClient({
  availableYears,
  yearDataObject,
  taikaiList,
  latestYear,
  latestMonth,
}: SeisekiPageClientProps) {
  const [activeTab, setActiveTab] = useState<SeisekiTabId>("seiseki");

  console.log('[Client] Received taikaiList:', taikaiList);
  console.log('[Client] taikaiList length:', taikaiList?.length);
  console.log('[Client] taikaiList data:', taikaiList?.map(t => ({ year: t.year, name: t.taikaiName })));

  // ObjectをMapに変換（SeisekiTabContentで使用）
  const yearDataMap = new Map<number, SeisekiMonth[]>();
  Object.entries(yearDataObject).forEach(([yearStr, months]) => {
    yearDataMap.set(Number(yearStr), months);
  });

  return (
    <>
      {/* タブナビゲーション */}
      <TabNav tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* タブコンテンツ */}
      <div
        role="tabpanel"
        id={`tabpanel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
      >
        {activeTab === "seiseki" && (
          <SeisekiTabContent
            availableYears={availableYears}
            yearDataMap={yearDataMap}
            latestYear={latestYear}
            latestMonth={latestMonth}
          />
        )}
        {activeTab === "taikai" && <TaikaiTabContent taikaiList={taikaiList} />}
      </div>
    </>
  );
}

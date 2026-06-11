"use client";

import { useState } from "react";
import TabNav from "@/components/common/TabNav";
import SeisekiTabContent from "@/components/seiseki/SeisekiTabContent";
import TaikaiTabContent from "@/components/seiseki/TaikaiTabContent";
import type { SeisekiMonth, SeisekiTabId } from "@/types/seiseki";
import type { TaikaiData } from "@/types/taikai";

interface SeisekiPageClientProps {
  availableYears: number[];
  yearDataObject: Record<number, SeisekiMonth[]>;
  taikaiList: TaikaiData[];
  latestYear: number | null;
  latestMonth: number | null;
}

const tabs = [
  { id: "seiseki" as SeisekiTabId, label: "通常成績" },
  { id: "taikai" as SeisekiTabId, label: "大会成績" },
];

export default function SeisekiPageClient({
  availableYears,
  yearDataObject,
  taikaiList,
  latestYear,
  latestMonth,
}: SeisekiPageClientProps) {
  const [activeTab, setActiveTab] = useState<SeisekiTabId>("seiseki");

  // ObjectをMapに変換（SeisekiTabContentで使用）
  const yearDataMap = new Map<number, SeisekiMonth[]>();
  Object.entries(yearDataObject).forEach(([yearStr, months]) => {
    yearDataMap.set(Number(yearStr), months);
  });

  return (
    <>
      {/* タブナビゲーション */}
      <TabNav tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} ariaLabel="成績タブ" />

      {/* タブコンテンツ */}
      <div role="tabpanel" id={`tabpanel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
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

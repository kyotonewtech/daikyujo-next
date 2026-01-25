"use client";

import type { SeisekiTab, SeisekiTabId } from "@/types/seiseki";

interface TabNavProps {
  tabs: SeisekiTab[];
  activeTab: SeisekiTabId;
  onTabChange: (tabId: SeisekiTabId) => void;
}

export default function TabNav({ tabs, activeTab, onTabChange }: TabNavProps) {
  return (
    <div className="mb-12">
      <nav className="flex gap-0 justify-center" aria-label="成績タブ">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 py-3 px-1 whitespace-nowrap transition-all border-b-[3px] ${
                isActive
                  ? "text-accent font-bold border-accent bg-[#f9f9f9]"
                  : "text-gray-600 hover:text-gray-800 border-transparent"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

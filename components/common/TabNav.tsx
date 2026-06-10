"use client";

export interface TabItem<T extends string = string> {
  id: T;
  label: string;
}

interface TabNavProps<T extends string = string> {
  tabs: TabItem<T>[];
  activeTab: T;
  onTabChange: (tabId: T) => void;
  ariaLabel?: string;
}

/** 汎用タブナビゲーション（seiseki・beginners 両方で使用可能） */
export default function TabNav<T extends string = string>({
  tabs,
  activeTab,
  onTabChange,
  ariaLabel = "タブ",
}: TabNavProps<T>) {
  return (
    <div className="mb-12">
      <nav className="flex gap-0 justify-center" aria-label={ariaLabel}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              type="button"
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

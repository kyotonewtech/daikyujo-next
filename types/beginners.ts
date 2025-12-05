export type TabId = "top" | "guide" | "rules" | "history";

export interface Tab {
  id: TabId;
  label: string;
}

export interface NoticeBoxProps {
  variant: "info" | "warning";
  title?: string;
  children: React.ReactNode;
}

export interface InfoCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  delay?: number;
}

export interface ExpandableDetailProps {
  summary: string;
  children: React.ReactNode;
}

export interface ChecklistItemProps {
  text: string;
  delay?: number;
}

export interface TabNavProps {
  tabs: Tab[];
  activeTab: TabId;
  onTabChange: (id: TabId) => void;
}

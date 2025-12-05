"use client";

import type { ArchiveMetadata } from "@/types/seiseki";

interface ArchiveNavProps {
  archives: ArchiveMetadata[];
  currentYear: number;
  currentMonth: number;
}

export default function ArchiveNav({
  archives,
  currentYear,
  currentMonth,
}: ArchiveNavProps) {

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [year, month] = e.target.value.split("-");
    if (year && month) {
      // ページ全体をリロードしてキャッシュを確実にクリア
      window.location.href = `/seiseki?year=${year}&month=${month}`;
    }
  };

  const currentValue = `${currentYear}-${currentMonth}`;

  return (
    <div className="mb-8 flex items-center justify-center">
      <label htmlFor="archive-select" className="mr-3 font-shippori text-gray-700">
        表示期間:
      </label>
      <select
        id="archive-select"
        value={currentValue}
        onChange={handleChange}
        className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
      >
        {archives.map((archive) => (
          <option
            key={`${archive.year}-${archive.month}`}
            value={`${archive.year}-${archive.month}`}
          >
            {archive.year}年{archive.month}月 ({archive.entryCount}件)
          </option>
        ))}
      </select>
    </div>
  );
}

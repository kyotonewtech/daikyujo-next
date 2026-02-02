"use client";

import { useState } from "react";
import type { TaikaiArchiveMetadata } from "@/types/taikai";

interface ArchiveNavProps {
  archives: TaikaiArchiveMetadata[];
  currentYear: number;
}

export default function ArchiveNav({ archives, currentYear }: ArchiveNavProps) {
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const year = parseInt(e.target.value, 10);
    setSelectedYear(year);
    window.location.href = `/taikai?year=${year}`;
  };

  if (archives.length <= 1) {
    return null;
  }

  return (
    <div className="mb-8">
      <label htmlFor="archive-select" className="block text-sm font-medium text-gray-700 mb-2">
        Select Tournament Year
      </label>
      <select
        id="archive-select"
        value={selectedYear}
        onChange={handleChange}
        className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-accent focus:border-accent outline-none"
      >
        {archives.map((archive) => (
          <option key={archive.year} value={archive.year}>
            {archive.taikaiName} ({archive.participantCount} participants)
          </option>
        ))}
      </select>
    </div>
  );
}

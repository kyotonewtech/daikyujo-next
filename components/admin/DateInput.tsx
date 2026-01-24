"use client";

import { useState, useEffect, useRef } from "react";

interface DateInputProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  required?: boolean;
}

interface ParsedDate {
  year: string;
  month: string;
  day: string;
}

const YEAR_LABEL = "\u5e74";
const MONTH_LABEL = "\u6708";
const DAY_LABEL = "\u65e5";

function parseJapaneseDate(japaneseDate: string): ParsedDate {
  const match = japaneseDate.match(/(\d{4})\u5e74(\d{1,2})\u6708(\d{1,2})\u65e5/);
  if (!match) {
    return { year: "", month: "", day: "" };
  }
  return {
    year: match[1],
    month: match[2].padStart(2, "0"),
    day: match[3].padStart(2, "0"),
  };
}

function getMaxDayInMonth(year: number, month: number): number {
  if (month === 2) {
    const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    return isLeapYear ? 29 : 28;
  }
  if ([4, 6, 9, 11].includes(month)) {
    return 30;
  }
  return 31;
}

export default function DateInput({
  value,
  onChange,
  label,
  required = false,
}: DateInputProps) {
  const parsed = parseJapaneseDate(value);

  const [year, setYear] = useState<string>(parsed.year);
  const [month, setMonth] = useState<string>(parsed.month);
  const [day, setDay] = useState<string>(parsed.day);
  const [error, setError] = useState<string>("");

  const yearRef = useRef<HTMLInputElement>(null);
  const monthRef = useRef<HTMLInputElement>(null);
  const dayRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const parsed = parseJapaneseDate(value);
    // 外部からのvalue変更を内部stateに同期（制御されたコンポーネント）
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setYear(parsed.year);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMonth(parsed.month);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDay(parsed.day);
  }, [value]);

  const validateAndUpdate = (newYear: string, newMonth: string, newDay: string) => {
    setError("");

    if (!newYear || !newMonth || !newDay) {
      onChange("");
      return;
    }

    const yearNum = parseInt(newYear);
    const monthNum = parseInt(newMonth);
    const dayNum = parseInt(newDay);

    if (monthNum < 1 || monthNum > 12) {
      setError("Month must be between 1 and 12");
      return;
    }

    const maxDay = getMaxDayInMonth(yearNum, monthNum);

    if (dayNum < 1 || dayNum > maxDay) {
      if (monthNum === 2) {
        const isLeapYear = (yearNum % 4 === 0 && yearNum % 100 !== 0) || (yearNum % 400 === 0);
        if (isLeapYear) {
          setError("February " + yearNum + " has only 29 days");
        } else {
          setError("February " + yearNum + " has only 28 days");
        }
      } else {
        setError("This month has only " + maxDay + " days");
      }
      return;
    }

    const japaneseDate = yearNum + YEAR_LABEL + monthNum + MONTH_LABEL + dayNum + DAY_LABEL;
    onChange(japaneseDate);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/[^0-9]/g, "").slice(0, 4);
    setYear(newValue);
    validateAndUpdate(newValue, month, day);

    if (newValue.length === 4) {
      monthRef.current?.focus();
    }
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/[^0-9]/g, "").slice(0, 2);
    setMonth(newValue);
    validateAndUpdate(year, newValue, day);

    if (newValue.length === 2) {
      dayRef.current?.focus();
    }
  };

  const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/[^0-9]/g, "").slice(0, 2);
    setDay(newValue);
    validateAndUpdate(year, month, newValue);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="flex items-center gap-2">
        <input
          ref={yearRef}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={year}
          onChange={handleYearChange}
          placeholder="2025"
          required={required}
          className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
        <span className="text-gray-600">{YEAR_LABEL}</span>

        <input
          ref={monthRef}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={month}
          onChange={handleMonthChange}
          placeholder="01"
          required={required}
          className="w-16 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
        <span className="text-gray-600">{MONTH_LABEL}</span>

        <input
          ref={dayRef}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={day}
          onChange={handleDayChange}
          placeholder="01"
          required={required}
          className="w-16 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
        <span className="text-gray-600">{DAY_LABEL}</span>
      </div>

      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
}

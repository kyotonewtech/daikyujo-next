import type { SeisekiEntry } from "@/types/seiseki";
import DateInput from "./DateInput";

interface EntryFormProps {
  entry: SeisekiEntry;
  onUpdate: (id: string, field: keyof SeisekiEntry, value: string | number) => void;
  onRemove: (id: string) => void;
  rank: number;
}

const RANK_OPTIONS = [
  { value: "\u4e94\u6bb5", label: "\u4e94\u6bb5" },
  { value: "\u56db\u6bb5", label: "\u56db\u6bb5" },
  { value: "\u4e09\u6bb5", label: "\u4e09\u6bb5" },
  { value: "\u4e8c\u6bb5", label: "\u4e8c\u6bb5" },
  { value: "\u521d\u6bb5", label: "\u521d\u6bb5" },
  { value: "\u4e00\u7d1a", label: "\u4e00\u7d1a" },
  { value: "\u4e8c\u7d1a", label: "\u4e8c\u7d1a" },
  { value: "\u4e09\u7d1a", label: "\u4e09\u7d1a" },
  { value: "\u56db\u7d1a", label: "\u56db\u7d1a" },
  { value: "\u4e94\u7d1a", label: "\u4e94\u7d1a" },
];

export default function EntryForm({
  entry,
  onUpdate,
  onRemove,
  rank,
}: EntryFormProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800">
          Rank {rank}
        </h3>
        <button
          type="button"
          onClick={() => onRemove(entry.id)}
          className="text-red-600 hover:text-red-800 font-medium text-sm"
        >
          Delete
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={entry.name}
            onChange={(e) => onUpdate(entry.id, "name", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="Name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rank Title
          </label>
          <select
            value={entry.rankTitle}
            onChange={(e) => onUpdate(entry.id, "rankTitle", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="">Select rank</option>
            {RANK_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Target Size <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={entry.targetSize}
            onChange={(e) => onUpdate(entry.id, "targetSize", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="Size"
            required
          />
        </div>

        <div>
          <DateInput
            label="Updated Date"
            value={entry.updatedDate}
            onChange={(value) => onUpdate(entry.id, "updatedDate", value)}
            required
          />
        </div>

        <div className="md:col-span-2">
          <DateInput
            label="Expiry Date"
            value={entry.expiryDate}
            onChange={(value) => onUpdate(entry.id, "expiryDate", value)}
            required
          />
        </div>
      </div>
    </div>
  );
}

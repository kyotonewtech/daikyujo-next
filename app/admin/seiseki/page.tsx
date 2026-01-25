"use client";

import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { type FormEvent, useState } from "react";
import EntryForm from "@/components/admin/EntryForm";
import type { SeisekiEntry } from "@/types/seiseki";

export default function AdminSeisekiPage() {
  const router = useRouter();
  const [year, setYear] = useState(2025);
  const [month, setMonth] = useState(1);
  const [entries, setEntries] = useState<SeisekiEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const paddedMonth = String(month).padStart(2, "0");
      const response = await fetch(`/api/seiseki/${year}/${paddedMonth}`);

      if (response.ok) {
        const data = await response.json();
        setEntries(data.entries || []);
        setMessage({
          type: "success",
          text: `Data loaded for ${year}/${month}`,
        });
      } else {
        setMessage({
          type: "error",
          text: "Data not found",
        });
      }
    } catch (_error) {
      setMessage({
        type: "error",
        text: "Error loading data",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createNew = () => {
    setEntries([]);
    setMessage({
      type: "success",
      text: `Creating new data for ${year}/${month}`,
    });
  };

  const addEntry = () => {
    if (entries.length >= 10) {
      setMessage({
        type: "error",
        text: "Maximum 10 entries allowed",
      });
      return;
    }

    const newEntry: SeisekiEntry = {
      id: crypto.randomUUID(),
      rank: entries.length + 1,
      name: "",
      rankTitle: "",
      targetSize: "",
      updatedDate: "",
      expiryDate: "",
      personId: "",
    };

    setEntries([...entries, newEntry]);
  };

  const removeEntry = (id: string) => {
    const updatedEntries = entries
      .filter((entry) => entry.id !== id)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));

    setEntries(updatedEntries);
  };

  const updateEntry = (id: string, field: keyof SeisekiEntry, value: string | number) => {
    setEntries(entries.map((entry) => (entry.id === id ? { ...entry, [field]: value } : entry)));
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    if (entries.length === 0) {
      setMessage({
        type: "error",
        text: "Please add at least one entry",
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/admin/seiseki", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          year,
          month,
          entries,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({
          type: "success",
          text: data.message || "Data saved successfully",
        });
      } else {
        setMessage({
          type: "error",
          text: data.error || "Save failed",
        });
      }
    } catch (_error) {
      setMessage({
        type: "error",
        text: "Error saving data",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: "/admin/login" });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Seiseki Management</h1>
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/admin/taikai")}
              className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md"
            >
              大会成績
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm bg-gray-600 hover:bg-gray-700 text-white rounded-md"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Select Year and Month</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                {Array.from({ length: 7 }, (_, i) => 2024 + i).map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">&nbsp;</label>
              <button
                onClick={loadData}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md"
              >
                Load
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">&nbsp;</label>
              <button
                onClick={createNew}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-md"
              >
                New
              </button>
            </div>
          </div>
        </div>

        {message && (
          <div
            className={
              "rounded-lg p-4 mb-6 " +
              (message.type === "success"
                ? "bg-green-50 border border-green-200 text-green-700"
                : "bg-red-50 border border-red-200 text-red-700")
            }
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSave}>
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Entries ({entries.length}/10)</h2>
              <button
                type="button"
                onClick={addEntry}
                disabled={entries.length >= 10}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md text-sm"
              >
                + Add Entry
              </button>
            </div>

            {entries.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No entries. Click Add Entry button to add.
              </div>
            ) : (
              <div>
                {entries.map((entry) => (
                  <EntryForm
                    key={entry.id}
                    entry={entry}
                    rank={entry.rank}
                    onUpdate={updateEntry}
                    onRemove={removeEntry}
                  />
                ))}
              </div>
            )}
          </div>

          {entries.length > 0 && (
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setEntries([])}
                className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-md font-medium"
              >
                Clear
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md font-medium"
              >
                {isLoading ? "Saving..." : "Save"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

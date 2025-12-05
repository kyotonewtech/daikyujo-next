"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import type { TaikaiParticipant } from "@/types/taikai";
import ParticipantForm from "@/components/admin/ParticipantForm";

export default function AdminTaikaiPage() {
  const router = useRouter();
  const [year, setYear] = useState(2025);
  const [taikaiName, setTaikaiName] = useState("");
  const [participants, setParticipants] = useState<TaikaiParticipant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/taikai/${year}`);

      if (response.ok) {
        const data = await response.json();
        setTaikaiName(data.taikaiName || "");
        setParticipants(data.participants || []);
        setMessage({
          type: "success",
          text: "Data loaded for year " + year,
        });
      } else {
        setMessage({
          type: "error",
          text: "Data not found for year " + year,
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Error loading data",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createNew = () => {
    setTaikaiName("");
    setParticipants([]);
    setMessage({
      type: "success",
      text: "Creating new data for year " + year,
    });
  };

  const addParticipant = () => {
    const newParticipant: TaikaiParticipant = {
      id: crypto.randomUUID(),
      rank: participants.length + 1,
      name: "",
      rankTitle: "",
      score1: "",  // 初期は空欄
      score2: "",  // 初期は空欄
      totalScore: 0,
    };

    setParticipants([...participants, newParticipant]);
  };

  const removeParticipant = (id: string) => {
    const updatedParticipants = participants
      .filter((participant) => participant.id !== id)
      .map((participant, index) => ({
        ...participant,
        rank: index + 1,
      }));

    setParticipants(updatedParticipants);
  };

  const updateParticipant = (
    id: string,
    field: keyof TaikaiParticipant,
    value: string | number
  ) => {
    setParticipants((prevParticipants) =>
      prevParticipants.map((participant) => {
        if (participant.id !== id) return participant;

        const updated = { ...participant, [field]: value };

        // score1またはscore2が更新された場合、totalScoreも自動計算
        // 空文字列は0として扱う
        if (field === "score1" || field === "score2") {
          const score1 = updated.score1 === "" ? 0 : updated.score1;
          const score2 = updated.score2 === "" ? 0 : updated.score2;
          updated.totalScore = score1 + score2;
        }

        return updated;
      })
    );
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    if (!taikaiName.trim()) {
      setMessage({
        type: "error",
        text: "Tournament name is required",
      });
      setIsLoading(false);
      return;
    }

    if (participants.length === 0) {
      setMessage({
        type: "error",
        text: "Please add at least one participant",
      });
      setIsLoading(false);
      return;
    }

    try {
      // 保存時に空文字列を0に変換
      const participantsToSave = participants.map((p) => ({
        ...p,
        score1: p.score1 === "" ? 0 : p.score1,
        score2: p.score2 === "" ? 0 : p.score2,
      }));

      // eventDateをyearから自動生成
      const eventDate = `${year}年`;

      const response = await fetch("/api/admin/taikai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          year,
          taikaiName,
          eventDate,
          participants: participantsToSave,
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
    } catch (error) {
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
          <h1 className="text-3xl font-bold text-gray-800">Taikai Management</h1>
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/admin/seiseki")}
              className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md"
            >
              通常成績
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
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Select Year
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year
              </label>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                &nbsp;
              </label>
              <button
                onClick={loadData}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md"
              >
                Load
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                &nbsp;
              </label>
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
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Tournament Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tournament Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={taikaiName}
                  onChange={(e) => setTaikaiName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Example: 令和7年弓術大会"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Year
                </label>
                <input
                  type="text"
                  value={`${year}年`}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Participants ({participants.length})
              </h2>
              <button
                type="button"
                onClick={addParticipant}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm"
              >
                + Add Participant
              </button>
            </div>

            {participants.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No participants. Click Add Participant button to add.
              </div>
            ) : (
              <div>
                {participants.map((participant) => (
                  <ParticipantForm
                    key={participant.id}
                    participant={participant}
                    rank={participant.rank}
                    onUpdate={updateParticipant}
                    onRemove={removeParticipant}
                  />
                ))}
              </div>
            )}
          </div>

          {participants.length > 0 && (
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setParticipants([])}
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

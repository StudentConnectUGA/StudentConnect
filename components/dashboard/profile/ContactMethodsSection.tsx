// components/profile/ContactMethodsSection.tsx
"use client";

import { useEffect, useState } from "react";

type ContactMethod = {
  id: string;
  platform: string;
  identifier: string;
  isPreferred: boolean;
  visible: boolean;
};

export default function ContactMethodsSection() {
  const [methods, setMethods] = useState<ContactMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newPlatform, setNewPlatform] = useState("");
  const [newIdentifier, setNewIdentifier] = useState("");
  const [newVisible, setNewVisible] = useState(true);
  const [newPreferred, setNewPreferred] = useState(false);

  const fetchMethods = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/contact-methods", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load contact methods");
      }
      setMethods(data.methods as ContactMethod[]);
    } catch (err: any) {
      setError(err.message || "Failed to load contact methods");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchMethods();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlatform.trim() || !newIdentifier.trim()) return;

    try {
      setError(null);
      setLoading(true);

      const res = await fetch("/api/contact-methods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: newPlatform,
          identifier: newIdentifier,
          isPreferred: newPreferred,
          visible: newVisible,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to add contact method");
      }

      setNewPlatform("");
      setNewIdentifier("");
      setNewVisible(true);
      setNewPreferred(false);

      await fetchMethods();
    } catch (err: any) {
      setError(err.message || "Failed to add contact method");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (
    id: string,
    updates: Partial<ContactMethod>,
  ) => {
    try {
      setError(null);

      const res = await fetch(`/api/contact-methods/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update contact method");
      }

      await fetchMethods();
    } catch (err: any) {
      setError(err.message || "Failed to update contact method");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this contact method?")) return;

    try {
      setError(null);

      const res = await fetch(`/api/contact-methods/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete contact method");
      }

      setMethods((prev) => prev.filter((m) => m.id !== id));
    } catch (err: any) {
      setError(err.message || "Failed to delete contact method");
    }
  };

  return (
    <div className="border-t border-slate-100 pt-4">
      <h2 className="text-sm font-semibold text-slate-900">
        Contact methods
      </h2>
      <p className="mt-1 text-[11px] text-slate-500">
        Add ways other students can reach you.  preferred method is
        highlighted when you&apos;re listed as a tutor.
      </p>

      {error && (
        <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-700">
          {error}
        </div>
      )}

      {/* Existing methods */}
      <div className="mt-3 space-y-2">
        {loading && methods.length === 0 && (
          <p className="text-[11px] text-slate-600">
            Loading contact methods…
          </p>
        )}

        {methods.length === 0 && !loading && (
          <p className="text-[11px] text-slate-600">
            You haven&apos;t added any contact methods yet.
          </p>
        )}

        {methods.map((method) => (
          <div
            key={method.id}
            className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-[11px] sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white px-3 py-1 font-semibold text-slate-800 shadow-sm">
                  {method.platform}
                </span>
                <span className="text-slate-700">{method.identifier}</span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <label className="inline-flex items-center gap-1 text-slate-700">
                  <input
                    type="checkbox"
                    checked={method.visible}
                    onChange={(e) =>
                      handleUpdate(method.id, { visible: e.target.checked })
                    }
                  />
                  Visible to other students
                </label>

                <label className="inline-flex items-center gap-1 text-slate-700">
                  <input
                    type="checkbox"
                    checked={method.isPreferred}
                    onChange={(e) =>
                      handleUpdate(method.id, {
                        isPreferred: e.target.checked,
                      })
                    }
                  />
                  Preferred
                </label>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleDelete(method.id)}
                className="rounded-full border border-red-200 px-3 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-50"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add new contact method */}
      <form
        onSubmit={handleAdd}
        className="mt-4 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-[11px]"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-slate-600">Platform</label>
            <input
              type="text"
              placeholder="e.g., Discord, GroupMe, Phone"
              value={newPlatform}
              onChange={(e) => setNewPlatform(e.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 text-xs text-slate-600 outline-none ring-uga-red/40 focus:border-uga-red focus:ring"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-slate-600">Identifier</label>
            <input
              type="text"
              placeholder="e.g., @Handle, (555) 123-4567"
              value={newIdentifier}
              onChange={(e) => setNewIdentifier(e.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 text-xs text-slate-600 outline-none ring-uga-red/40 focus:border-uga-red focus:ring"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <label className="inline-flex items-center gap-2 text-slate-700">
            <input
              type="checkbox"
              checked={newVisible}
              onChange={(e) => setNewVisible(e.target.checked)}
            />
            Visible to other students
          </label>
          <label className="inline-flex items-center gap-2 text-slate-700">
            <input
              type="checkbox"
              checked={newPreferred}
              onChange={(e) => setNewPreferred(e.target.checked)}
            />
            Mark as preferred
          </label>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-uga-red px-4 py-2 text-[11px] font-semibold text-white hover:bg-uga-red-dark disabled:opacity-70"
          >
            {loading ? "Adding…" : "Add contact method"}
          </button>
        </div>
      </form>
    </div>
  );
}

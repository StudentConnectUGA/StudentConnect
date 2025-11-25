// app/courses/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import CourseResultsGrid from "@/components/CourseResultsGrid";
import { useSession } from "next-auth/react";
import { SignedOut } from "@/components/SignedOut";

type Course = {
  id: string;
  prefix: string;
  number: string;
  title: string;
  availableTutors?: number;
};

export default function CoursesSearchPage() {
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const performSearch = async (query: string) => {
    const trimmed = query.trim();

    try {
      setLoading(true);
      setError(null);
      console.log("Performing search for:", trimmed);

      const params = new URLSearchParams({ q: trimmed });
      const res = await fetch(`/api/courses?${params.toString()}`, {
        cache: "no-store",
      });

      const data = await res.json();
      console.log("Search response data:", data);
      if (!res.ok) {
        throw new Error(data.error || "Failed to search courses");
      }

      setResults(data.courses as Course[]);
      setHasSearched(true);
    } catch (err: any) {
      setError(err.message || "Failed to search courses");
      setResults([]);
      setHasSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await performSearch(searchTerm);
  };

  useEffect(() => {
    const q = searchParams.get("q") ?? "";
    setSearchTerm(q);
    void performSearch(q);
  }, [searchParams]);

  console.log("Session status:", status);
  if (status === "loading") {
    return (
      <SignedOut message={"Loading user session, please wait..."} />
    );
  }

  // if (!session?.user?.id) {
  //   return <SignedOut message={"Please sign in to view courses."} />;
  // }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header
        navLinks={[
          { label: "Browse Courses", href: "/courses" },
          { label: "My Courses", href: "/dashboard/courses" },
          { label: "Home", href: "/" },
        ]}
      />

      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-8 lg:px-0 lg:py-10">
          {/* Search card */}
          <section className="rounded-2xl border border-slate-200 bg-white px-4 py-5 sm:px-6 sm:py-6 shadow-sm">
            <h1 className="text-sm font-semibold text-slate-900">Search for a course</h1>
            <p className="mt-1 text-xs text-slate-600">
              Search by subject, number, or title. Example: <span className="font-mono">CSCI&nbsp;1301</span>,{" "}
              <span className="font-mono">MATH&nbsp;2250</span>.
            </p>

            <form onSubmit={handleSearch} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="e.g., CSCI 1301 or Intro to Programming"
                className="flex-1 rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-600 outline-none ring-uga-red/40 focus:border-uga-red focus:ring"
              />
              <button
                type="submit"
                className="rounded-full bg-uga-black px-5 py-2 text-xs font-semibold text-white hover:bg-slate-900 disabled:opacity-70"
                disabled={loading}
              >
                {loading ? "Searching…" : "Search"}
              </button>
            </form>

            {error && <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</div>}
          </section>

          {/* Results */}
          <section className="mt-8">
            {hasSearched && !loading && results.length === 0 && !error && (
              <p className="text-xs text-slate-600">No courses matched that search. Try a different subject, number, or keyword.</p>
            )}

            {results.length > 0 && (
              <>
                <div className="flex items-baseline justify-between">
                  <h2 className="text-sm font-semibold text-slate-900">
                    {results.length} course
                    {results.length !== 1 ? "s" : ""} found
                  </h2>
                  <p className="text-[11px] text-slate-500">Click a course to view available tutors.</p>
                </div>

                <CourseResultsGrid courses={results} />
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

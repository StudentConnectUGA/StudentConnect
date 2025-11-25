// app/tutors/[userId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Link from "next/link";
import { SignedOut } from "@/components/SignedOut";

type ContactMethod = {
  id: string;
  platform: string;
  identifier: string;
  isPreferred: boolean;
};

type Enrollment = {
  id: string;
  grade: string | null;
  showGrade: boolean;
  course: {
    id: string;
    prefix: string;
    number: string;
    title: string;
  };
};

type TutorProfile = {
  id: string;
  email: string | null;
  name: string | null;
  major: string | null;
  year: string | null;
  bio: string | null;
  showGrades: boolean;
  phoneNumber: string | null;
  phoneVisible: boolean;
  meetingPrefs: string | null;
  contactMethods: ContactMethod[];
  enrollments: Enrollment[];
};

const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-slate-50">
    <Header
      navLinks={[
        { label: "Find courses", href: "/courses" },
        { label: "My courses", href: "/dashboard/courses" },
        { label: "Home", href: "/" },
      ]}
    />
    <main className="flex-1 flex items-center justify-center">
      {children}
    </main>
  </div>
);

export default function TutorProfilePage() {
  const params = useParams<{ userId: string }>();
  const userId = params.userId;

  const [user, setUser] = useState<TutorProfile | null>(null);
  const [status, setStatus] = useState<"loading" | "ok" | "unauthorized" | "not-found" | "error">(
    "loading"
  );

  useEffect(() => {
    if (!userId) return;

    const fetchProfile = async () => {
      try {
        setStatus("loading");
        const res = await fetch(`/api/tutors/${userId}`);

        if (res.status === 401) {
          setStatus("unauthorized");
          return;
        }

        if (res.status === 404) {
          setStatus("not-found");
          return;
        }

        if (!res.ok) {
          setStatus("error");
          return;
        }

        const data = (await res.json()) as TutorProfile;
        setUser(data);
        setStatus("ok");
      } catch (err) {
        console.error("Failed to fetch tutor profile:", err);
        setStatus("error");
      }
    };

    fetchProfile();
  }, [userId]);

  // Top-level layout wrapper reused in all states


  // Loading state
  if (status === "loading") {
    return (
      <Shell>
        <p className="text-sm text-slate-600">Loading tutor profile…</p>
      </Shell>
    );
  }

  // Not logged in
  if (status === "unauthorized") {
    return (
        <SignedOut message={"Please sign in to view this tutor's profile."} />
    );
  }

  // Tutor not found / private profile
  if (status === "not-found") {
    return (
      <Shell>
        <p className="text-sm text-slate-600">
          This tutor&apos;s profile is not available.
        </p>
      </Shell>
    );
  }

  // Generic error
  if (status === "error" || !user) {
    return (
      <Shell>
        <p className="text-sm text-red-600">
          Something went wrong while loading this tutor&apos;s profile.
        </p>
      </Shell>
    );
  }

  // Normal loaded state
  const hasEmail = !!user.email?.trim();
  const hasPhone = user.phoneVisible && !!user.phoneNumber?.trim();
  const visibleContacts = user.contactMethods;
  const hasAdditionalContacts = visibleContacts.length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header
        navLinks={[
          { label: "Find courses", href: "/courses" },
          { label: "My courses", href: "/dashboard/courses" },
          { label: "Home", href: "/" },
        ]}
      />

      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-8 lg:px-0 lg:py-10">
          {/* Header */}
          <header className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-lg font-semibold text-slate-900">
                  {user.name ?? "Tutor"}
                </h1>
                <p className="mt-1 text-xs text-slate-600">
                  {[user.major, user.year].filter(Boolean).join(" • ")}
                </p>
              </div>
            </div>

            {user.bio && (
              <p className="mt-4 text-xs text-slate-700">{user.bio}</p>
            )}
          </header>

          {/* Contact & meeting info */}
          <section className="mt-6 grid gap-4 md:grid-cols-2">
            {/* Contact card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs sm:p-5">
              <h2 className="text-sm font-semibold text-slate-900">
                How to contact me
              </h2>
              <p className="mt-1 text-[11px] text-slate-500">
                Use these methods to reach out and schedule a study session.
              </p>

              <div className="mt-3 space-y-4">
                {/* Primary contact info */}
                <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Primary contact
                  </p>

                  {!hasEmail && !hasPhone ? (
                    <p className="text-[11px] text-slate-600">
                      This tutor hasn&apos;t added primary contact details yet.
                    </p>
                  ) : (
                    <>
                      {hasEmail && (
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                            Email
                          </span>
                          <a
                            href={`mailto:${user.email}`}
                            className="text-[11px] text-slate-700 hover:underline break-all"
                          >
                            {user.email}
                          </a>
                        </div>
                      )}

                      {hasPhone && (
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                            Phone
                          </span>
                          <span className="text-[11px] text-slate-700">
                            {user.phoneNumber}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Additional contact methods */}
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Additional contacts
                  </p>

                  {hasAdditionalContacts ? (
                    <div className="mt-2 space-y-1.5">
                      {visibleContacts.map((method) => (
                        <div
                          key={method.id}
                          className="flex flex-wrap items-center gap-1.5"
                        >
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                            {method.platform}
                            {method.isPreferred ? " • Preferred" : ""}
                          </span>
                          <span className="text-[11px] text-slate-700 break-all">
                            {method.identifier}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-1 text-[11px] text-slate-600">
                      No additional contact methods listed.
                    </p>
                  )}
                </div>

                {user.meetingPrefs && (
                  <p className="mt-2 text-[11px] text-slate-600">
                    <span className="font-semibold">Meeting preferences: </span>
                    {user.meetingPrefs}
                  </p>
                )}
              </div>
            </div>

            {/* Courses they tutor */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs sm:p-5">
              <h2 className="text-sm font-semibold text-slate-900">
                Courses I tutor
              </h2>
              <p className="mt-1 text-[11px] text-slate-500">
                These are courses the tutor has completed and opted in to help
                with.
              </p>

              <div className="mt-3 space-y-2">
                {user.enrollments.length === 0 ? (
                  <p className="text-[11px] text-slate-600">
                    No courses are currently listed.
                  </p>
                ) : (
                  user.enrollments.map((enrollment) => {
                    const code = `${enrollment.course.prefix} ${enrollment.course.number}`;
                    const showGrade =
                      user.showGrades &&
                      enrollment.showGrade &&
                      enrollment.grade;

                    return (
                      <div
                        key={enrollment.id}
                        className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                      >
                        <div>
                          <Link href={`/courses/${enrollment.course.id}`}>
                            <p className="text-[11px] font-semibold text-slate-800 hover:underline">
                              {code}
                            </p>
                            <p className="text-[11px] text-slate-600">
                              {enrollment.course.title}
                            </p>
                          </Link>
                        </div>
                        {showGrade && (
                          <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                            Grade: {enrollment.grade}
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

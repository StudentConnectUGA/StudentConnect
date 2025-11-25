// components/tutors/TutorCard.tsx
import Link from "next/link";

type TutorUser = {
  id: string;
  name: string | null;
  major: string | null;
  year: string | null;
  bio: string | null;
  showGrades: boolean;
};

type TutorEnrollment = {
  id: string;
  grade: string | null;
  showGrade: boolean;
  user: TutorUser | null;
};

export default function TutorCard({
  enrollment,
  courseCode,
}: {
  enrollment: TutorEnrollment;
  courseCode: string;
}) {
  const user = enrollment.user;
  if (!user) return null;

  const displayGrade =
    enrollment.showGrade && user.showGrades && enrollment.grade;

  return (
    <article className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 text-xs transition hover:border-uga-red/60 hover:shadow-sm">
      <div>
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-semibold text-slate-900">
              {user.name ?? "Unnamed student"}
            </p>
            <p className="mt-0.5 text-[11px] text-slate-600">
              {[user.major, user.year].filter(Boolean).join(" • ")}
            </p>
          </div>

          {displayGrade && (
            <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
              Grade: {enrollment.grade}
            </span>
          )}
        </div>

        {user.bio && (
          <p className="mt-3 text-xs text-slate-700 line-clamp-3">
            {user.bio}
          </p>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px]">
        <span className="text-slate-500">Peer tutor for {courseCode}</span>
        <Link
          href={`/tutors/${user.id}`}
          className="font-medium text-uga-red hover:underline"
        >
          View profile
        </Link>
      </div>
    </article>
  );
}

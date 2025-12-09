import Link from "next/link";
import Header from "@/components/Header";
import { auth } from "@/lib/auth";
import CourseResultsGrid from "@/components/CourseResultsGrid";
import { PopularCourses } from "@/components/landing/PopularCourses";

export default async function Home() {

  const session = await auth();
  const loggedIn = !!session?.user;
  const isAdmin = session?.user?.role === "ADMIN";
  
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header
        navLinks={
          isAdmin ? [
            { label: "Admin", href: "/admin/courses" },
            { label: "Browse Courses", href: "/courses" },
            { label: "FAQ", href: "/#faq" },
       
          ] : loggedIn ? [
            { label: "Profile", href: "/profile" },
            { label: "Browse Courses", href: "/courses" },
            { label: "FAQ", href: "/#faq" },
          ] : [
            { label: "Sign in", href: "/api/auth/signin" },
            // { label: "Browse Courses", href: "/courses" },
            { label: "FAQ", href: "/#faq" },
          ]
        }
      />

      <main className="flex-1">
        {/* hero/splash section */}
        <section className="bg-white">
          <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10 lg:flex-row lg:items-center lg:py-14 lg:px-0">
            {/* left column */}
            <div className="flex-1 space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-[11px] font-semibold text-uga-red">
                UGA Peer Tutoring · StudentConnect
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                Find the right <span className="text-uga-red">UGA peer tutor</span> in seconds.
              </h1>

              <p className="max-w-xl text-sm text-slate-700 sm:text-base">
                StudentConnect lets you search by course, see tutors&apos; majors and grades (when shared), and connect with classmates
                who&apos;ve already completed the class.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/api/auth/signin"
                  className="inline-flex items-center justify-center rounded-full bg-uga-red px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-uga-red-dark"
                >
                  Sign in with UGA SSO
                </Link>

                <Link
                  href="/courses"
                  className="inline-flex items-center justify-center rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-800 hover:border-uga-red hover:text-uga-red"
                >
                  Browse courses
                </Link>
              </div>

              <p className="text-xs text-slate-500">Only authenticated UGA students can view tutor listings and edit their profiles.</p>
            </div>

            {/* "how it works" card */}
            <div className="flex-1">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
                <h2 className="mb-3 text-sm font-semibold text-slate-900">How StudentConnect works</h2>
                <ol className="space-y-2 text-xs text-slate-700">
                  <li>
                    <span className="font-semibold text-uga-red">1.</span> Sign in with  UGA account.
                  </li>
                  <li>
                    <span className="font-semibold text-uga-red">2.</span> Add completed courses and grades.
                  </li>
                  <li>
                    <span className="font-semibold text-uga-red">3.</span> Opt in as a tutor for any course you&apos;ve completed.
                  </li>
                  <li>
                    <span className="font-semibold text-uga-red">4.</span> Search by course to see all available peer tutors.
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </section>

        {/* search strip */}
        <section className="bg-uga-gray-50">
          <div className="mx-auto max-w-6xl px-4 pb-10 lg:px-0">
            <div className="-mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-md sm:p-6">
              <h2 className="text-sm font-semibold text-slate-900">Search for a course</h2>
              <p className="mt-1 text-xs text-slate-600">
                Search by subject, number, or title. Example: <span className="font-mono text-[11px]">CSCI 1301</span>,{" "}
                <span className="font-mono text-[11px]">MATH 2250</span>.
              </p>

              <form className="mt-3 flex flex-col gap-3 sm:flex-row" action="/courses" method="get">
                <input
                  type="text"
                  name="q"
                  placeholder="e.g., CSCI 1301 or Intro to Programming"
                  className="flex-1 rounded-full border border-slate-300 text-slate-600 px-4 py-2 text-sm outline-none ring-uga-red/40 focus:border-uga-red focus:ring"
                />

                <button type="submit" className="rounded-full bg-uga-black px-6 py-2 text-sm font-semibold text-white hover:bg-slate-900">
                  Search
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* Display features */}
        <section id="how-it-works" className="bg-white border-t border-slate-100">
          <div className="mx-auto max-w-6xl px-4 py-10 lg:px-0 lg:py-14">
            <h2 className="text-xl font-semibold text-slate-900">Built around how UGA students actually study</h2>
            <p className="mt-1 text-sm text-slate-600">
              Whether you&apos;re looking for help or offering it, StudentConnect keeps everything tied to real courses.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {[
                {
                  title: "Course-specific matching",
                  body: "Search by course code and see only tutors who have completed that exact class.",
                },
                {
                  title: "Transparent context",
                  body: "Tutors can share their grade, major, and year so you know who you’re working with.",
                },
                {
                  title: "Privacy controls",
                  body: "You choose which courses and grades are visible and how other students contact you.",
                },
              ].map((card) => (
                <div key={card.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <h3 className="text-sm font-semibold text-slate-900">{card.title}</h3>
                  <p className="mt-2 text-xs text-slate-700">{card.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TODO: change this to be pulling from our data. As of right now, static layout. Perhaps a caurousel? */}
      <PopularCourses />

        {/* privacy statement */}
        <section id="faq" className="bg-white border-t border-slate-100">
          <div className="mx-auto max-w-6xl px-4 py-8 lg:px-0 lg:py-10">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-6">
              <h2 className="text-sm font-semibold text-slate-900"> privacy,  choice.</h2>
              <p className="mt-1 text-xs text-slate-600">
                You control which courses, grades, and tutor details are visible to others. Only authenticated UGA students can see tutor
                listings and edit their own profiles.
              </p>
              <Link href="/help" className="mt-3 inline-flex text-xs font-semibold text-uga-red hover:underline">
                Read more in the FAQ 
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* footer, perhaps move this to a component. */}
      <footer className="border-t border-slate-200 bg-black">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 text-xs text-slate-200 sm:flex-row sm:items-center sm:justify-between lg:px-0">
          <p>© {new Date().getFullYear()} StudentConnect · Built for UGA students</p>

          <div className="flex flex-wrap gap-4">
            <Link href="/terms" className="hover:text-uga-red">
              Terms &amp; Privacy
            </Link>
            <Link href="/help" className="hover:text-uga-red">
              Help &amp; FAQ
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

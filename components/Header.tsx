// components/Header.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

interface NavLink {
  label: string;
  href: string;
}

interface HeaderProps {
  navLinks?: NavLink[];
}

export default function Header({ navLinks = [] }: HeaderProps) {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  const userName = session?.user?.name ?? "Student";
  const isAuthenticated = status === "authenticated";

  const initials =
    userName
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2) || "SC";

  return (
    <header className="border-b border-slate-200 bg-gradient-to-r from-uga-black via-zinc-900 to-uga-red text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 lg:px-0">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-xs font-bold tracking-tight text-uga-red">
            SC
          </span>
          <span className="text-sm font-semibold uppercase tracking-[0.18em]">
            StudentConnect
          </span>
        </Link>

        {/* Nav links (dynamic) */}
        <nav className="hidden items-center gap-6 text-sm md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-red-200"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side: auth controls */}
        <div className="flex items-center gap-3 text-xs">
          {isAuthenticated ? (
            <div
              className="relative flex items-center"
              onMouseEnter={() => setMenuOpen(true)}
              onMouseLeave={() => setMenuOpen(false)}
            >
              {/* Trigger pill */}
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/5 px-2.5 py-1.5 text-xs font-medium shadow-sm hover:bg-white/10"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-[10px] font-semibold uppercase">
                  {initials}
                </span>
                <span className="hidden max-w-[9rem] truncate sm:inline-block">
                  {userName}
                </span>
                <span
                  className={`text-[10px] transition-transform duration-150 ${
                    menuOpen ? "rotate-180" : ""
                  }`}
                >
                  ▾
                </span>
              </button>

              {/* Dropdown */}
              <div
                className={`absolute right-0 top-full w-48 origin-top rounded-xl border border-slate-200 bg-white py-2 text-xs text-slate-800 shadow-lg ring-1 ring-black/5 transition-all duration-150 ease-out
                  ${menuOpen ? "opacity-100 scale-100" : "pointer-events-none opacity-0 scale-95"}
                `}
              >
                <Link
                  href="/account"
                  className="block px-3 py-1.5 hover:bg-slate-50"
                >
                  Edit profile
                </Link>

                <Link
                  href="/dashboard/courses"
                  className="block px-3 py-1.5 hover:bg-slate-50"
                >
                  Edit course listings
                </Link>

                <button
                  type="button"
                  onClick={() => signOut()}
                  className="block w-full px-3 py-1.5 text-left text-red-600 hover:bg-red-50"
                >
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => signIn()}
              className="rounded-full border border-white/60 px-3 py-1.5 text-xs font-semibold shadow-sm hover:bg-white/10"
            >
              Sign in with UGA SSO
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

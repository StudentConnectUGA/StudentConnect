// app/dashboard/profile/page.tsx
"use client";

import { useSession } from "next-auth/react";
import Header from "@/components/Header";
import ProfileContent from "@/components/dashboard/profile/ProfileContent";
import { SignedOut } from "@/components/SignedOut";

export default function ProfilePage() {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";

  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header
          navLinks={[
            { label: "My courses", href: "/dashboard/courses" },
            { label: "Profile", href: "/dashboard/profile" },
            { label: "Home", href: "/" },
          ]}
        />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-sm text-slate-600">Loading session…</p>
        </main>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <SignedOut  message={"Please sign in to view  profile"} />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header
        navLinks={[
          { label: "My courses", href: "/dashboard/courses" },
          { label: "Profile", href: "/dashboard/profile" },
          { label: "Home", href: "/" },
        ]}
      />
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-8 lg:px-0 lg:py-10">
          <ProfileContent />
        </div>
      </main>
    </div>
  );
}

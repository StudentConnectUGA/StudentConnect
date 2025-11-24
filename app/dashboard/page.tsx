"use client";
import { useSession } from "next-auth/react";

export default function DashboardPage() {
  const { data: session, status } = useSession();

  return (
    <div>
      {session ? (
        <p>
          Logged in as name: {session.user.name} Email: {session.user.email}
        </p>
      ) : (
        <p>Not logged in</p>
      )}
    </div>
  );
}
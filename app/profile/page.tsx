import { auth } from "@/lib/auth";

import { redirect } from "next/navigation";


export default async function ProfilePage() {
  const session = await auth();

  if (!session) {
    redirect("/api/auth/signin");
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Profile</h1>
      <div className="mt-4 space-y-2">
        <p>
          <span className="font-semibold">Email:</span> {session.user.email}
        </p>       
      </div>
    </div>
  );
}
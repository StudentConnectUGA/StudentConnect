import Header from "./Header";

export function SignedOut({message}: {message: string}) {

return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header
          navLinks={[
            { label: "Home", href: "/" },
          ]}
        />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-sm text-slate-600">{message}</p>
        </main>
      </div>
    )
}
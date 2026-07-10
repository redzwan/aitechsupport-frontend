export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-6 px-6 text-center">
      <span className="rounded-full border px-3 py-1 text-xs font-medium opacity-70">
        aitechsupport.my
      </span>
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        AI support that answers on your website &amp; WhatsApp
      </h1>
      <p className="max-w-xl text-lg opacity-70">
        Point the bot at your content, connect your WhatsApp number, and let it
        handle customer questions — with human handoff when it matters.
      </p>
      <div className="flex gap-3">
        <a
          href="/register"
          className="rounded-lg bg-black px-5 py-2.5 font-medium text-white dark:bg-white dark:text-black"
        >
          Get started
        </a>
        <a href="/login" className="rounded-lg border px-5 py-2.5 font-medium">
          Sign in
        </a>
      </div>
    </main>
  );
}

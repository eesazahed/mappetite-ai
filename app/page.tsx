import Header from "./components/header";

export default function Home() {
  return (
    <>
      <Header />
      <div className="flex min-h-screen bg-zinc-50 font-sans dark:bg-black p-4">
        <main className="flex min-h-screen w-full max-w-3xl flex-col items-center bg-white dark:bg-black sm:items-start">
          <p>test</p>
        </main>
      </div>
    </>
  );
}

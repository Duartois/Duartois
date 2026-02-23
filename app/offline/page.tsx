export default function OfflinePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 text-center">
      <h1 className="text-4xl font-bold">Você está offline</h1>
      <p className="mt-4 text-base opacity-80">
        Não foi possível carregar esta página sem internet. Tente novamente
        quando a conexão for restabelecida.
      </p>
    </main>
  );
}

export const metadata = { title: 'Admin Help | Iris Kooij Wellness' };

export default function AdminHelpPage() {
  return (
    <section className="p-6">
      <h1 className="text-2xl font-semibold tracking-tight">Admin Help</h1>
      <p className="subtle mt-2 text-sm">Korte gids voor redacteuren en beheerders.</p>
      <div className="mt-6 grid gap-6 max-w-3xl">
        <div className="card">
          <h2 className="text-lg font-semibold">Rituelen beheren</h2>
          <ul className="mt-2 list-disc pl-5 text-sm subtle">
            <li>Ga naar <a className="underline" href="/admin/rituelen">Rituelen</a> en klik op “Bewerken”.</li>
            <li>Prijs in euro invoeren (bijv. 120,00). Leeg laten wist de prijs.</li>
            <li>Contra‑indicaties: elk item op een nieuwe regel; “Wis alles” maakt veld leeg.</li>
            <li>FAQ: voeg items toe met “FAQ‑item toevoegen”.</li>
            <li>Afbeelding: upload via “Presign” flow; genereer thumbnails voor S3‑uploads.</li>
          </ul>
        </div>
        <div className="card">
          <h2 className="text-lg font-semibold">Navigatie & Brand</h2>
          <ul className="mt-2 list-disc pl-5 text-sm subtle">
            <li>Ga naar <a className="underline" href="/admin/brands">Brand Settings</a> voor kleuren/naam/logo.</li>
            <li>Voeg navigatie‑concepten toe onder “Navigation Drafts” en publiceer.</li>
          </ul>
        </div>
        <div className="card">
          <h2 className="text-lg font-semibold">Sneltoetsen & Tips</h2>
          <ul className="mt-2 list-disc pl-5 text-sm subtle">
            <li>Bewaar wijzigingen regelmatig; let op het update‑quotum en reset‑timer.</li>
            <li>Gebruik betekenisvolle alt‑teksten voor toegankelijkheid.</li>
            <li>Boekingslink kan intern (bijv. /contact) of extern zijn.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

export const metadata = { title: 'Privé mentorschap | Iris Kooij Academy' };

export default function MentorschapPage() {
  return (
    <section className="pt-12">
      <div className="container max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight">Privé mentorschap</h1>
        <p className="subtle mt-4">Een 1‑op‑1 traject voor therapeuten en schoonheidsspecialisten die hun praktijk willen verfijnen en laten groeien – op jouw tempo en signatuur.</p>
        <h2 className="font-serif mt-8 text-xl font-semibold tracking-tight">Programma</h2>
        <ul className="mt-3 list-disc pl-6 subtle">
          <li>Intake & positionering</li>
          <li>Praktijkopbouw & klantreis</li>
          <li>Aanbod design & prijsstrategie</li>
          <li>Persoonlijke techniek‑coaching</li>
        </ul>
        <div className="mt-8">
          <a href="/academy/inschrijven" className="btn-primary">Plan kennismaking</a>
        </div>
      </div>
    </section>
  );
}

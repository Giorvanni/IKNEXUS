export const metadata = { title: 'Fascia‑opleiding | Iris Kooij Academy' };

export default function FasciaOpleidingPage() {
  return (
    <section className="pt-12">
      <div className="container max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight">Fascia‑opleiding</h1>
        <p className="subtle mt-4">Een gecertificeerde opleiding met een stevige wetenschappelijke basis. We combineren theorie, anatomie en hands‑on praktijk tot een compleet leertraject.</p>
        <h2 className="font-serif mt-8 text-xl font-semibold tracking-tight">Inhoud</h2>
        <ul className="mt-3 list-disc pl-6 subtle">
          <li>Anatomie & fysiologie van fascia</li>
          <li>Touch methodology & myofascial release principes</li>
          <li>Observatie, body‑analyse en casuïstiek</li>
          <li>Praktijksessies met feedback in kleine groepen</li>
        </ul>
        <h2 className="font-serif mt-8 text-xl font-semibold tracking-tight">Duur & Certificering</h2>
        <p className="subtle mt-3">Modules met heldere leerlijnen. Na afronding ontvang je een certificaat en kun je fascia‑werk verantwoord integreren in je praktijk.</p>
        <div className="mt-8">
          <a href="/academy/inschrijven" className="btn-primary">Vraag studieprogramma aan</a>
        </div>
      </div>
    </section>
  );
}

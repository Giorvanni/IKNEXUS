export const metadata = { title: 'Inschrijven | Iris Kooij Academy' };

export default function InschrijvenPage() {
  return (
    <section className="pt-12">
      <div className="container max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight">Inschrijven</h1>
        <p className="subtle mt-4">Vraag het studieprogramma aan of plan een kennismakingsgesprek. We nemen persoonlijk contact op.</p>
        <form className="mt-8 grid gap-4" aria-label="Inschrijfformulier">
          <div className="grid gap-2">
            <label htmlFor="name" className="text-sm font-medium">Naam</label>
            <input id="name" name="name" type="text" required className="rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2 text-sm" />
          </div>
          <div className="grid gap-2">
            <label htmlFor="email" className="text-sm font-medium">E‑mail</label>
            <input id="email" name="email" type="email" required className="rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2 text-sm" />
          </div>
          <div className="grid gap-2">
            <label htmlFor="interest" className="text-sm font-medium">Interesse</label>
            <select id="interest" name="interest" className="rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2 text-sm">
              <option>Fascia‑opleiding</option>
              <option>Privé mentorschap</option>
              <option>Pharmos‑training</option>
            </select>
          </div>
          <div className="grid gap-2">
            <label htmlFor="message" className="text-sm font-medium">Bericht (optioneel)</label>
            <textarea id="message" name="message" rows={5} className="rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2 text-sm" />
          </div>
          <button type="submit" className="btn-primary text-sm">Verstuur</button>
        </form>
      </div>
    </section>
  );
}

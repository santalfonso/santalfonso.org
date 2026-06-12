import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 bg-stone-800 text-stone-300">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <h3 className="mb-3 font-semibold text-white">
            Parrocchia Sant&apos;Alfonso Maria de&apos; Liguori
          </h3>
          <p className="text-sm leading-relaxed">
            Via della Giustiniana, 227
            <br />
            00188 Roma (RM)
            <br />
            Tel. +39 06 3320803
          </p>
        </div>
        <div>
          <h3 className="mb-3 font-semibold text-white">Orari Sante Messe</h3>
          <p className="text-sm leading-relaxed">
            Feriali: 8:00 e 18:30
            <br />
            Festivi: 8:30 · 10:30 · 12:00 · 18:30
          </p>
          <h3 className="mb-1 mt-4 font-semibold text-white">Ufficio parrocchiale</h3>
          <p className="text-sm leading-relaxed">Feriali: 17:00 – 18:30</p>
        </div>
        <div>
          <h3 className="mb-3 font-semibold text-white">Collegamenti</h3>
          <ul className="space-y-1 text-sm">
            <li>
              <Link href="/news" className="hover:text-white">News</Link>
            </li>
            <li>
              <Link href="/risorse" className="hover:text-white">Risorse</Link>
            </li>
            <li>
              <Link href="/dove-siamo" className="hover:text-white">Dove siamo</Link>
            </li>
            <li>
              <Link href="/contatti" className="hover:text-white">Contatti</Link>
            </li>
            <li>
              <Link href="/admin" className="hover:text-white">Area riservata</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-stone-700 py-4 text-center text-xs text-stone-400">
        © {new Date().getFullYear()} Parrocchia Sant&apos;Alfonso Maria de&apos; Liguori — Roma
      </div>
    </footer>
  );
}

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <Link href="/" className="brand">
              <span className="brand__mark">A</span>
              <span>Sant&apos;Alfonso</span>
            </Link>
            <p className="soft" style={{ marginTop: 18, fontSize: 14, maxWidth: 320 }}>
              La comunità parrocchiale di Sant&apos;Alfonso Maria de&apos;
              Liguori a Prima Porta, Roma: una casa di preghiera, ascolto e
              servizio sulle orme del santo dottore della Chiesa.
            </p>
          </div>
          <div className="footer-col">
            <h5>Visita</h5>
            <ul>
              <li>
                <Link href="/#orari">Orari Sante Messe</Link>
              </li>
              <li>
                <Link href="/dove-siamo">Come arrivare</Link>
              </li>
              <li>
                <Link href="/contatti">Ufficio parrocchiale</Link>
              </li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Comunità</h5>
            <ul>
              <li>
                <Link href="/parrocchia/storia">La nostra storia</Link>
              </li>
              <li>
                <Link href="/parrocchia/gruppi-parrocchiali">Gruppi parrocchiali</Link>
              </li>
              <li>
                <Link href="/news">News &amp; Eventi</Link>
              </li>
              <li>
                <Link href="/risorse">Risorse</Link>
              </li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Contatti</h5>
            <ul>
              <li className="soft">
                Via della Giustiniana, 227
                <br />
                00188 Roma (RM)
              </li>
              <li>
                <a href="tel:+39063320803">+39 06 3320803</a>
              </li>
              <li>
                <Link href="/admin">Area riservata</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            {`© ${new Date().getFullYear()} Parrocchia Sant'Alfonso Maria de' Liguori · Roma`}
          </span>
          <span>
            <Link href="/dove-siamo">Dove siamo</Link> ·{" "}
            <Link href="/contatti">Contatti</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}

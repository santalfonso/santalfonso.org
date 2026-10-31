/**
 * Logo «Scala» di Lodate, lodate Iddio (quattro canne d'organo), inline.
 * I colori vengono dalle variabili --lodate-logo-pipe, -text e -sub impostate da chi
 * lo usa (es. la fascia in home), così segue il tema; il testo usa Inter del sito.
 */
const PIPES = [
  "M22 4h19v102.8H22zM25.8 104.14v-9.12a5.7 5.7 0 0 1 11.4 0v9.12zM22 108.32h19L35.68 122h-8.36z",
  "M51 30h17v78.36H51zM54.4 106.02v-8.16a5.1 5.1 0 0 1 10.2 0v8.16zM51 109.76h17L63.24 122h-7.48z",
  "M78 52h15v57.8H78zM81 107.9v-7.2a4.5 4.5 0 0 1 9 0v7.2zM78 111.2h15L88.8 122h-6.6z",
  "M103 70h13v41.24h-13zM105.6 109.78v-6.24a3.9 3.9 0 0 1 7.8 0v6.24zM103 112.64h13L112.36 122h-5.72z",
];

export default function LodateLogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 690 128"
      width="690"
      height="128"
      role="img"
      aria-label="Lodate, lodate Iddio — canti per le celebrazioni"
    >
      <g transform="translate(4 4) scale(.9375)" fill="var(--lodate-logo-pipe, #3399FF)" fillRule="evenodd">
        {PIPES.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      <g style={{ fontFamily: "var(--sans)" }}>
        <text
          x="150"
          y="66"
          fontSize="40"
          fontWeight="700"
          fill="var(--lodate-logo-text, #17365D)"
          textLength="520"
          lengthAdjust="spacingAndGlyphs"
        >
          LODATE, LODATE IDDIO
        </text>
        <text
          x="152"
          y="104"
          fontSize="20"
          fontWeight="400"
          letterSpacing="1.5"
          fill="var(--lodate-logo-sub, #1561B8)"
        >
          CANTI PER LE CELEBRAZIONI
        </text>
      </g>
    </svg>
  );
}

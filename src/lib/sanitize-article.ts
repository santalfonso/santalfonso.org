import sanitizeHtml from "sanitize-html";
import { sizedImage } from "@/lib/image-url";

/** Allineamenti consentiti nello stile (quelli dell'editor degli articoli). */
const ALIGN = [/^(left|right|center|justify)$/];
const ALIGNED = ["p", "h1", "h2", "h3", "h4", "h5", "h6", "li", "blockquote"];

/**
 * Corpo degli articoli: lascia passare la formattazione dell'editor (paragrafi, titoli,
 * grassetto, corsivo, sottolineato, barrato, elenchi, citazioni, link, a capo, allineamento)
 * e le immagini del markdown, e toglie script, eventi `on…`, iframe e link `javascript:`.
 */
export function sanitizeArticleHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "h1", "h2", "h3", "h4", "h5", "h6"]),
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "title", "class", "width", "height", "loading", "decoding"],
      div: ["class"],
      ...Object.fromEntries(ALIGNED.map((tag) => [tag, ["style"]])),
    },
    allowedClasses: {
      img: ["img-center", "img-left", "img-right", "img-small"],
      div: ["img-wrap"],
    },
    allowedStyles: Object.fromEntries(ALIGNED.map((tag) => [tag, { "text-align": ALIGN }])),
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: { img: ["https"] },
    allowProtocolRelative: false,
    transformTags: {
      // foto nel testo: copia ridotta da Cloudinary e caricata solo quando si arriva a vederla
      img: (tagName, attribs) => ({
        tagName,
        attribs: { ...attribs, src: sizedImage(attribs.src, 1600), loading: "lazy", decoding: "async" },
      }),
      // i link che aprono una nuova scheda non danno accesso alla pagina del sito
      a: (tagName, attribs) => {
        if (attribs.target === "_blank") attribs.rel = "noopener noreferrer";
        else delete attribs.target;
        return { tagName, attribs };
      },
    },
  });
}

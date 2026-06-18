"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import { useEffect, useRef } from "react";

/* ─── Icone SVG inline ─── */
function Icon({ d, size = 16 }: { d: string; size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}

const ICONS = {
  bold: "M6 4h8a4 4 0 0 1 0 8H6zM6 12h9a4 4 0 0 1 0 8H6z",
  italic: "M19 4h-9M14 20H5M15 4 9 20",
  underline: "M6 4v6a6 6 0 0 0 12 0V4M4 20h16",
  strike: "M18 6c0-2.21-2.686-4-6-4S6 3.79 6 6c0 3.43 4.5 4.5 6 6M6 18c0 2.21 2.686 4 6 4s6-1.79 6-4c0-3.43-4.5-4.5-6-6M4 12h16",
  link: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71",
  unlink: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71M4 4l16 16",
  quote: "M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1zM15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z",
  bulletList: "M9 6h11M9 12h11M9 18h11M5 6v.01M5 12v.01M5 18v.01",
  orderedList: "M10 6h11M10 12h11M10 18h11M4 6h1v4M4 10h2M6 18H4c0-1 2-2 2-3s-1-1.5-2-1",
  alignLeft: "M21 6H3M15 12H3M17 18H3",
  alignCenter: "M21 6H3M17 12H7M19 18H5",
  alignRight: "M21 6H3M21 12H9M21 18H11",
  clearFormat: "M4 7V4h16v3M9 20h6M12 4v16M5 4l14 16",
};

/* ─── Bottone toolbar ─── */
function Btn({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 32,
        height: 32,
        borderRadius: "var(--r-sm)",
        border: "none",
        background: active ? "var(--azure-soft)" : "transparent",
        color: active ? "var(--azure-deep)" : "var(--ink-soft)",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 700,
        fontFamily: "var(--sans)",
        lineHeight: 1,
        flexShrink: 0,
        transition: "background 0.1s, color 0.1s",
      }}
    >
      {children}
    </button>
  );
}

function Sep() {
  return (
    <span
      style={{
        display: "inline-block",
        width: 1,
        height: 20,
        background: "var(--rule-strong)",
        margin: "0 3px",
        flexShrink: 0,
        alignSelf: "center",
      }}
    />
  );
}

/* ─── Props ─── */
type Props = {
  name: string;
  value: string;
  onChange: (html: string) => void;
  required?: boolean;
};

/* ─── Editor principale ─── */
export default function RichTextEditor({ name, value, onChange, required }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        code: false,
        codeBlock: false,
      }),
      Underline,
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: "noopener noreferrer" } }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: value,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        style: [
          "min-height: 340px",
          "padding: 16px 18px",
          "font-size: 15px",
          "font-family: var(--sans)",
          "color: var(--ink)",
          "outline: none",
          "line-height: 1.7",
        ].join("; "),
        class: "prose-parish",
      },
    },
  });

  /* Sincronizza quando l'AI aggiorna il body dall'esterno */
  const prevValue = useRef(value);
  useEffect(() => {
    if (!editor) return;
    if (value === prevValue.current) return;
    const current = editor.getHTML();
    if (value !== current) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
    prevValue.current = value;
  }, [editor, value]);

  /* Inserimento link */
  const handleLink = () => {
    if (!editor) return;
    if (editor.isActive("link")) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL del link:", prev ?? "https://");
    if (!url) return;
    editor.chain().focus().setLink({ href: url }).run();
  };

  if (!editor) return null;

  return (
    <div
      style={{
        border: "1px solid var(--rule-strong)",
        borderRadius: "var(--r-sm)",
        background: "var(--bg)",
        overflow: "hidden",
        transition: "border-color var(--t), box-shadow var(--t)",
      }}
      onFocus={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = "var(--azure)";
        el.style.boxShadow = "0 0 0 3px rgba(51,153,255,0.15)";
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          const el = e.currentTarget as HTMLElement;
          el.style.borderColor = "";
          el.style.boxShadow = "";
        }
      }}
    >
      {/* ── Toolbar ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1,
          padding: "6px 8px",
          borderBottom: "1px solid var(--rule)",
          background: "var(--bg-soft)",
        }}
      >
        {/* Formattazione testo */}
        <Btn title="Grassetto (Cmd+B)" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          <strong style={{ fontSize: 14 }}>B</strong>
        </Btn>
        <Btn title="Corsivo (Cmd+I)" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <em style={{ fontSize: 14 }}>I</em>
        </Btn>
        <Btn title="Sottolineato (Cmd+U)" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <span style={{ textDecoration: "underline", fontSize: 14 }}>U</span>
        </Btn>
        <Btn title="Barrato" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
          <span style={{ textDecoration: "line-through", fontSize: 14 }}>S</span>
        </Btn>

        <Sep />

        {/* Citazione */}
        <Btn title="Citazione" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Icon d={ICONS.quote} />
        </Btn>

        <Sep />

        {/* Link */}
        <Btn title={editor.isActive("link") ? "Rimuovi link" : "Inserisci link"} active={editor.isActive("link")} onClick={handleLink}>
          <Icon d={editor.isActive("link") ? ICONS.unlink : ICONS.link} />
        </Btn>

        <Sep />

        {/* Intestazioni */}
        <Btn title="Titolo H2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <span style={{ fontSize: 12 }}>H2</span>
        </Btn>
        <Btn title="Titolo H3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          <span style={{ fontSize: 12 }}>H3</span>
        </Btn>

        <Sep />

        {/* Liste */}
        <Btn title="Elenco puntato" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <Icon d={ICONS.bulletList} />
        </Btn>
        <Btn title="Elenco numerato" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <Icon d={ICONS.orderedList} />
        </Btn>

        <Sep />

        {/* Allineamento */}
        <Btn title="Allinea a sinistra" active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()}>
          <Icon d={ICONS.alignLeft} />
        </Btn>
        <Btn title="Centra" active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()}>
          <Icon d={ICONS.alignCenter} />
        </Btn>
        <Btn title="Allinea a destra" active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()}>
          <Icon d={ICONS.alignRight} />
        </Btn>

        <Sep />

        {/* Rimuovi formattazione */}
        <Btn title="Rimuovi formattazione" onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}>
          <Icon d={ICONS.clearFormat} />
        </Btn>
      </div>

      {/* ── Area di scrittura ── */}
      <EditorContent editor={editor} />

      {/* Campo nascosto per il form submit */}
      <textarea
        name={name}
        required={required}
        value={editor.getHTML()}
        readOnly
        style={{ display: "none" }}
        aria-hidden="true"
      />
    </div>
  );
}

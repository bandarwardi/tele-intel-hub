import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, Languages, Radio } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const links = [
  { to: "/", key: "nav_home" },
  { to: "/about", key: "nav_about" },
  { to: "/methodology", key: "nav_methodology" },
  { to: "/faq", key: "nav_faq" },
  { to: "/blog", key: "nav_blog" },
  { to: "/analytics", key: "nav_analytics" },
  { to: "/contact", key: "nav_contact" },
] as const;

export function Header() {
  const { t, lang, toggle } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 glass border-b border-border/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" className="group flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <span className="grid size-9 place-items-center rounded-xl bg-primary/15 text-primary glow-ring">
            <Radio className="size-5" />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-sm font-semibold tracking-tight text-gradient sm:text-base">
              ENTEC
            </span>
            <span className="block text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Phone Intelligence
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              activeProps={{ className: "bg-primary/15 text-primary" }}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {t(l.key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            aria-label="Toggle language"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-accent/40 px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-accent"
          >
            <Languages className="size-4 text-primary" />
            {lang === "en" ? "العربية" : "English"}
          </button>
          <button
            className="rounded-lg border border-border p-2 lg:hidden"
            aria-label="Menu"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="grid gap-1 border-t border-border/60 bg-popover/95 px-4 py-3 lg:hidden">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              activeOptions={{ exact: l.to === "/" }}
              activeProps={{ className: "bg-primary/15 text-primary" }}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground"
            >
              {t(l.key)}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

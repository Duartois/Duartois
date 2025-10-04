"use client";

import Link from "next/link";
import { useEffect, useMemo, type CSSProperties } from "react";

type MenuProps = {
  isOpen: boolean;
  onClose: () => void;
  id?: string;
};

export default function Menu({ isOpen, onClose, id = "main-navigation-overlay" }: MenuProps) {
  // itens principais â€“ mesmos rÃ³tulos / rotas da referÃªncia
  const items = useMemo(
    () => [
      { href: "/", label: "Home" },
      { href: "/work", label: "Work" },
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
    ],
    []
  );

  // redes sociais â€“ iguais Ã  referÃªncia
  const socials = useMemo(
    () => [
      { href: "https://www.instagram.com/itssharl.ee/", label: "Instagram" },
      { href: "https://www.behance.net/itssharlee", label: "Behance" },
    ],
    []
  );

  // ESC e trava de scroll quando aberto
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.documentElement.style.overflow;
    if (isOpen) document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = prev;
    };
  }, [isOpen, onClose]);

  // animaÃ§Ã£o de entrada 1:1 com a referÃªncia: translateY(-100px) -> 0
  const itemStyle = (i: number): CSSProperties => ({
    transform: isOpen
      ? "translateY(0px) translateZ(0px)"
      : "translateY(-100px) translateZ(0px)",
    transition: "transform 400ms cubic-bezier(.22,.61,.36,1)",
    transitionDelay: `${isOpen ? i * 60 : 0}ms`,
  });

  return (
    // estrutura e classes iguais Ã  referÃªncia
    <div
      id={id}
      className="menu"
      style={{ opacity: isOpen ? 1 : 0.5, display: isOpen ? "block" : "none" }}
      role="dialog"
      aria-modal="true"
      aria-hidden={!isOpen}
    >
      <div className="menu-content fall-down-element" style={{ "--fall-delay": isOpen ? "0.05s" : "0s" } as CSSProperties}>
        <div className="menu-items">
          <nav>
            <ol>
              {items.map((item, i) => (
                <li key={item.href}>
                  <div className="item-inner" style={itemStyle(i)}>
                    <Link href={item.href} onClick={onClose}>
                      <h1 className="fall-down-element" style={{ "--fall-delay": `${i * 0.05}s` } as CSSProperties}>
                        {item.label}
                      </h1>
                    </Link>
                  </div>
                </li>
              ))}
            </ol>
          </nav>
        </div>

        <div className="menu-socials">
          <ul>
            <div>
              <div>
                {socials.map((s, i) => (
                  <li key={s.href}>
                    <div className="item-inner" style={itemStyle(items.length + i)}>
                      <div className="link-wrapper">
                        <div className="link">
                          <a
                            href={s.href}
                            target="_blank"
                            rel="noreferrer"
                            onClick={onClose}
                          >
                            <span
                              className="fall-down-element"
                              style={{ "--fall-delay": `${(items.length + i) * 0.05}s` } as CSSProperties}
                            >
                              ↗ {s.label}
                            </span>
                          </a>
                        </div>
                        {/* underline comeÃ§a em -101% exatamente como na referÃªncia/CSS */}
                        <div
                          className="link-underline"
                          style={{
                            transform: isOpen
                              ? "translateX(0) translateZ(0)"
                              : "translateX(-101%) translateZ(0)",
                          }}
                        />
                      </div>
                    </div>
                  </li>
                ))}
                <br />
              </div>
            </div>
          </ul>
        </div>
      </div>
    </div>
  );
}
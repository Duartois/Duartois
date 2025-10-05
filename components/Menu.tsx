"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";

import {
  FALL_ITEM_TRANSITION_DURATION,
  FALL_ITEM_STAGGER_DELAY,
  getFallItemStyle,
} from "./fallAnimation";

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

  const totalItems = items.length + socials.length;
  const hideTimeoutRef = useRef<number | undefined>(undefined);
  const [isVisible, setIsVisible] = useState(isOpen);

  useEffect(() => {
    if (hideTimeoutRef.current) {
      window.clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = undefined;
    }

    if (isOpen) {
      setIsVisible(true);
      return;
    }

    const totalDelay =
      FALL_ITEM_TRANSITION_DURATION +
      Math.max(totalItems - 1, 0) * FALL_ITEM_STAGGER_DELAY;

    hideTimeoutRef.current = window.setTimeout(() => {
      setIsVisible(false);
    }, totalDelay);

    return () => {
      if (hideTimeoutRef.current) {
        window.clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = undefined;
      }
    };
  }, [isOpen, totalItems]);

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
  const itemStyle = (i: number): CSSProperties =>
    getFallItemStyle(isOpen, i, totalItems);

  return (
    // estrutura e classes iguais Ã  referÃªncia
    <div
      id={id}
      className="menu"
      style={{
        opacity: isOpen ? 1 : 0,
        visibility: isOpen || isVisible ? "visible" : "hidden",
        pointerEvents: isOpen ? "auto" : "none",
        transition: `opacity ${FALL_ITEM_TRANSITION_DURATION}ms cubic-bezier(.22,.61,.36,1)`,
      }}
      role="dialog"
      aria-modal="true"
      aria-hidden={!isOpen}
    >
      <div className="menu-content" style={{ "--fall-delay": isOpen ? "0.05s" : "0s" } as CSSProperties}>
        <div className="menu-items">
          <nav>
            <ol>
              {items.map((item, i) => (
                <li key={item.href}>
                  <div className="item-inner" style={itemStyle(i)}>
                    <Link href={item.href} onClick={onClose}>
                      <h1>
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
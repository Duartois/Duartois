"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { useTranslation } from "react-i18next";

import "@/app/i18n/config";

import {
  FALL_ITEM_TRANSITION_DURATION,
  FALL_ITEM_STAGGER_DELAY,
  getFallItemStyle,
} from "./fallAnimation";
import {
  createVariantState,
  type ShapeId,
  type ShapeOpacityState,
  type VariantState,
  type Vector3Tuple,
} from "@/components/three/types";

type NavKey = "home" | "work" | "about" | "contact";

type MenuItem = {
  key: NavKey;
  href: string;
  label: string;
};

const SHAPE_IDS: readonly ShapeId[] = [
  "torusSpringAzure",
  "waveSpringLime",
  "semiLimeFlamingo",
  "torusFlamingoLime",
  "semiFlamingoAzure",
  "sphereFlamingoSpring",
];

const HOVER_Z_OFFSET = 0.6;
const HOVER_ROTATION_DELTA: Vector3Tuple = [0.18, 0.22, -0.12];

const HOVER_CONFIGS: Record<NavKey, { shapes: readonly ShapeId[]; dimOthers: boolean }> = {
  home: { shapes: SHAPE_IDS, dimOthers: false },
  work: {
    shapes: ["waveSpringLime", "sphereFlamingoSpring"],
    dimOthers: true,
  },
  about: {
    shapes: ["semiLimeFlamingo", "torusSpringAzure"],
    dimOthers: true,
  },
  contact: {
    shapes: ["semiFlamingoAzure", "torusFlamingoLime"],
    dimOthers: true,
  },
};

type MenuProps = {
  isOpen: boolean;
  onClose: () => void;
  id?: string;
};


export default function Menu({ isOpen, onClose, id = "main-navigation-overlay" }: MenuProps) {
  const { t } = useTranslation("common");
  const items = useMemo<MenuItem[]>(
    () => [
      { key: "home", href: "/", label: t("navigation.home") },
      { key: "work", href: "/work", label: t("navigation.work") },
      { key: "about", href: "/about", label: t("navigation.about") },
      { key: "contact", href: "/contact", label: t("navigation.contact") },
    ],
    [t],
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
  const [activeItem, setActiveItem] = useState<NavKey | null>(null);
  const baseVariantRef = useRef<VariantState | null>(null);
  const baseShapeOpacityRef = useRef<ShapeOpacityState | null>(null);


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

  useEffect(() => {
    if (!isOpen) {
      setActiveItem(null);
      baseVariantRef.current = null;
      baseShapeOpacityRef.current = null;
      return;
    }

    const app = window.__THREE_APP__;
    if (!app) {
      return;
    }

    let cancelled = false;
    const frame = window.requestAnimationFrame(() => {
      if (cancelled) {
        return;
      }

      const snapshot = app.bundle.getState();
      const variantSnapshot = createVariantState(snapshot.variant);
      const shapeOpacitySnapshot = { ...snapshot.shapeOpacity };

      baseVariantRef.current = variantSnapshot;
      baseShapeOpacityRef.current = shapeOpacitySnapshot;

      app.setState({
        variant: createVariantState(variantSnapshot),
        shapeOpacity: { ...shapeOpacitySnapshot },
      });
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const app = window.__THREE_APP__;
    const baseVariant = baseVariantRef.current;
    const baseShapeOpacity = baseShapeOpacityRef.current;

    if (!app || !baseVariant || !baseShapeOpacity) {
      return;
    }

    if (!activeItem) {
      app.setState({
        variant: createVariantState(baseVariant),
        shapeOpacity: { ...baseShapeOpacity },
      });
      return;
    }

    const config = HOVER_CONFIGS[activeItem];
    const variant = createVariantState(baseVariant);
    const highlightSet = new Set<ShapeId>(config.shapes);

    config.shapes.forEach((shapeId) => {
      const baseTransform = baseVariant[shapeId];
      const transform = variant[shapeId];
      transform.position = [
        baseTransform.position[0],
        baseTransform.position[1],
        baseTransform.position[2] + HOVER_Z_OFFSET,
      ] as Vector3Tuple;
      transform.rotation = [
        baseTransform.rotation[0] + HOVER_ROTATION_DELTA[0],
        baseTransform.rotation[1] + HOVER_ROTATION_DELTA[1],
        baseTransform.rotation[2] + HOVER_ROTATION_DELTA[2],
      ] as Vector3Tuple;
    });

    const nextShapeOpacity: ShapeOpacityState = { ...baseShapeOpacity };

    if (config.dimOthers) {
      SHAPE_IDS.forEach((shapeId) => {
        if (highlightSet.has(shapeId)) {
          nextShapeOpacity[shapeId] = baseShapeOpacity[shapeId];
          return;
        }

        nextShapeOpacity[shapeId] = baseShapeOpacity[shapeId] * 0.8;
      });
    } else {
      SHAPE_IDS.forEach((shapeId) => {
        nextShapeOpacity[shapeId] = baseShapeOpacity[shapeId];
      });
    }

    app.setState({
      variant,
      shapeOpacity: nextShapeOpacity,
    });
  }, [activeItem, isOpen]);

  const handlePointerEnter = (key: NavKey) => {
    setActiveItem(key);
  };

  const handlePointerLeave = () => {
    setActiveItem(null);
  };

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
                  <div
                    className="item-inner"
                    style={itemStyle(i)}
                    onPointerEnter={() => handlePointerEnter(item.key)}
                    onPointerLeave={handlePointerLeave}
                  >
                    <Link
                      href={item.href}
                      onClick={onClose}
                      onFocus={() => handlePointerEnter(item.key)}
                      onBlur={handlePointerLeave}
                    >
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
                        <div className="link-underline" />
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
"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
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
  SHAPE_IDS,
  SHAPES_GROUP_NAME,
  type ShapeId,
  type VariantState,
  type ThreeAppHandle,
  type ThreeAppState,
} from "@/components/three/types";
import type { Material, Mesh } from "three";

type HoverTarget = "home" | "work" | "about" | "contact" | null;
type MenuLinkTarget = Exclude<HoverTarget, null>;
type HighlightTarget = Exclude<HoverTarget, "home" | null>;

const HOVER_HIGHLIGHTS = {
  work: ["waveSpringLime", "sphereFlamingoSpring"],
  about: ["semiLimeFlamingo", "torusSpringAzure"],
  contact: ["semiFlamingoAzure", "torusFlamingoLime"],
} as const satisfies Record<HighlightTarget, readonly ShapeId[]>;

const FORWARD_OFFSET = 0.45;
const ROTATION_DELTA: [number, number, number] = [0.12, -0.18, 0];
const DIMMED_OPACITY = 0.8;

const moveShapesForward = (
  variant: VariantState,
  ids: readonly ShapeId[],
) => {
  ids.forEach((id) => {
    const transform = variant[id];
    if (!transform) {
      return;
    }

    const [x, y, z] = transform.position;
    const [rx, ry, rz] = transform.rotation;

    transform.position = [x, y, z + FORWARD_OFFSET];
    transform.rotation = [rx + ROTATION_DELTA[0], ry + ROTATION_DELTA[1], rz + ROTATION_DELTA[2]];
  });
};

type MenuProps = {
  isOpen: boolean;
  onClose: () => void;
  id?: string;
};

type MenuItem = {
  href: string;
  label: string;
  hoverTarget: MenuLinkTarget;
};

export default function Menu({ isOpen, onClose, id = "main-navigation-overlay" }: MenuProps) {
  const { t } = useTranslation("common");
  const appRef = useRef<ThreeAppHandle | null>(null);
  const baseVariantRef = useRef<VariantState | null>(null);
  const hoverTargetRef = useRef<HoverTarget>(null);
  const shapeMeshesRef = useRef<Partial<Record<ShapeId, Mesh>> | null>(null);
  const ignoreNextStateChangeRef = useRef(false);

  const ensureShapeMeshes = useCallback(() => {
    if (shapeMeshesRef.current) {
      return true;
    }

    const app = appRef.current;
    if (!app) {
      return false;
    }

    const group = app.bundle.scene.getObjectByName(SHAPES_GROUP_NAME);
    if (!group) {
      return false;
    }

    const meshes: Partial<Record<ShapeId, Mesh>> = {};
    SHAPE_IDS.forEach((id) => {
      const found = group.getObjectByName(id);
      if (found && (found as Mesh).isMesh) {
        meshes[id] = found as Mesh;
      }
    });

    if (Object.keys(meshes).length === 0) {
      return false;
    }

    shapeMeshesRef.current = meshes;
    return true;
  }, []);

  const setShapesOpacity = useCallback(
    (ids: readonly ShapeId[], opacity: number) => {
      if (!ensureShapeMeshes()) {
        return;
      }

      const meshes = shapeMeshesRef.current;
      if (!meshes) {
        return;
      }

      const applyToMaterial = (material: Material | undefined) => {
        if (!material) {
          return;
        }

        material.opacity = opacity;
        material.transparent = opacity < 1;
        material.needsUpdate = true;
      };

      ids.forEach((id) => {
        const mesh = meshes[id];
        if (!mesh) {
          return;
        }

        const material = mesh.material;
        if (Array.isArray(material)) {
          material.forEach((mat) => applyToMaterial(mat));
        } else {
          applyToMaterial(material);
        }
      });
    },
    [ensureShapeMeshes],
  );

  const resetShapesOpacity = useCallback(() => {
    setShapesOpacity(SHAPE_IDS, 1);
  }, [setShapesOpacity]);

  const applyHover = useCallback(
    (target: HoverTarget) => {
      hoverTargetRef.current = target;

      if (target === null || target === "home") {
        resetShapesOpacity();
      } else {
        const highlight = HOVER_HIGHLIGHTS[target];
        setShapesOpacity(SHAPE_IDS, DIMMED_OPACITY);
        setShapesOpacity(highlight, 1);
      }

      const app = appRef.current;
      const baseVariant = baseVariantRef.current;
      if (!app || !baseVariant) {
        return;
      }

      if (target === null) {
        ignoreNextStateChangeRef.current = true;
        app.setState({ variant: createVariantState(baseVariant) });
        return;
      }

      const variant = createVariantState(baseVariant);

      if (target === "home") {
        moveShapesForward(variant, SHAPE_IDS);
      } else {
        const highlight = HOVER_HIGHLIGHTS[target];
        moveShapesForward(variant, highlight);
      }

      ignoreNextStateChangeRef.current = true;
      app.setState({ variant });
    },
    [resetShapesOpacity, setShapesOpacity],
  );

  const handleNavBlur = useCallback(
    (event: FocusEvent<HTMLElement>) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
        applyHover(null);
      }
    },
    [applyHover],
  );

  const handleListMouseLeave = useCallback(() => {
    applyHover(null);
  }, [applyHover]);

  const items = useMemo<MenuItem[]>(
    () => [
      { href: "/", label: t("navigation.home"), hoverTarget: "home" },
      { href: "/work", label: t("navigation.work"), hoverTarget: "work" },
      { href: "/about", label: t("navigation.about"), hoverTarget: "about" },
      { href: "/contact", label: t("navigation.contact"), hoverTarget: "contact" },
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

  useEffect(() => {
    if (!isOpen) {
      applyHover(null);
      hoverTargetRef.current = null;
      ignoreNextStateChangeRef.current = false;
      shapeMeshesRef.current = null;
      return;
    }

    if (typeof window === "undefined") {
      return;
    }

    const app = window.__THREE_APP__;
    if (!app) {
      appRef.current = null;
      baseVariantRef.current = null;
      shapeMeshesRef.current = null;
      return;
    }

    appRef.current = app;

    const snapshot = app.bundle.getState();
    baseVariantRef.current = createVariantState(snapshot.variant);

    ensureShapeMeshes();
    resetShapesOpacity();

    const handleStateChange = (event: Event) => {
      const { detail } = event as CustomEvent<{ state: Readonly<ThreeAppState> }>;
      if (!detail?.state) {
        return;
      }

      if (ignoreNextStateChangeRef.current) {
        ignoreNextStateChangeRef.current = false;
        return;
      }

      baseVariantRef.current = createVariantState(detail.state.variant);

      if (hoverTargetRef.current) {
        applyHover(hoverTargetRef.current);
      }
    };

    const { events } = app.bundle;
    events.addEventListener("statechange", handleStateChange as EventListener);

    return () => {
      events.removeEventListener("statechange", handleStateChange as EventListener);
    };
  }, [isOpen, applyHover, ensureShapeMeshes, resetShapesOpacity]);

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
          <nav onBlur={handleNavBlur}>
            <ol onMouseLeave={handleListMouseLeave}>
              {items.map((item, i) => (
                <li key={item.href}>
                  <div className="item-inner" style={itemStyle(i)}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      onMouseEnter={() => applyHover(item.hoverTarget)}
                      onFocus={() => applyHover(item.hoverTarget)}
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
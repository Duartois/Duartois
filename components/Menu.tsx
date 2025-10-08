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
  MENU_OVERLAY_MONOGRAM,
  createResponsiveHeroVariantState,
  createVariantState,
  type ShapeId,
  type ShapeOpacityState,
  type VariantState,
  type Vector3Tuple,
} from "@/components/three/types";

type MenuProps = {
  isOpen: boolean;
  onClose: () => void;
  id?: string;
};

type HoverTarget = "none" | "home" | "work" | "about" | "contact";

type NavigationItem = {
  href: string;
  label: string;
  hover: Exclude<HoverTarget, "none">;
};

const MENU_MOBILE_BREAKPOINT = 1500;
const DIMMED_OPACITY = 0.35;
const HOME_FORWARD_DISTANCE = 0.95;
const FOCUSED_FORWARD_DISTANCE = 1.2;
const HOME_ROTATION_DELTA: Vector3Tuple = [0.28, -0.24, 0.18];
const FOCUSED_ROTATION_DELTA: Vector3Tuple = [0.32, -0.18, 0.22];
const SHAPE_IDS: readonly ShapeId[] = [
  "torusSpringAzure",
  "waveSpringLime",
  "semiLimeFlamingo",
  "torusFlamingoLime",
  "semiFlamingoAzure",
  "sphereFlamingoSpring",
];


export default function Menu({ isOpen, onClose, id = "main-navigation-overlay" }: MenuProps) {
  const { t } = useTranslation("common");
  const items = useMemo<NavigationItem[]>(
    () => [
      { href: "/", label: t("navigation.home"), hover: "home" },
      { href: "/work", label: t("navigation.work"), hover: "work" },
      { href: "/about", label: t("navigation.about"), hover: "about" },
      { href: "/contact", label: t("navigation.contact"), hover: "contact" },
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
  const baseVariantRef = useRef<VariantState | null>(null);
  const baseOpacityRef = useRef<ShapeOpacityState | null>(null);
  const currentHoverRef = useRef<HoverTarget>("none");

  const computeMenuVariant = useCallback((): VariantState | null => {
    if (typeof window === "undefined") {
      return null;
    }

    return createResponsiveHeroVariantState(
      MENU_OVERLAY_MONOGRAM,
      window.innerWidth,
      window.innerHeight,
      MENU_MOBILE_BREAKPOINT,
      MENU_MOBILE_BREAKPOINT,
    );
  }, []);

  const applyHover = useCallback(
    (target: HoverTarget) => {
      if (typeof window === "undefined") {
        return;
      }

      const app = window.__THREE_APP__;
      if (!app) {
        return;
      }

      if (!baseVariantRef.current) {
        const computed = computeMenuVariant();
        if (!computed) {
          return;
        }
        baseVariantRef.current = createVariantState(computed);
      }

      const snapshot = app.bundle.getState();
      if (!baseOpacityRef.current) {
        baseOpacityRef.current = { ...snapshot.shapeOpacity };
      }

      const baseVariant = baseVariantRef.current;
      if (!baseVariant) {
        return;
      }

      const nextVariant = createVariantState(baseVariant);
      const baseOpacity =
        baseOpacityRef.current ?? ({ ...snapshot.shapeOpacity } as ShapeOpacityState);
      const nextOpacity: ShapeOpacityState = { ...baseOpacity };

      const transformShape = (
        shapeId: ShapeId,
        {
          forwardBy = 0,
          rotationDelta = [0, 0, 0] as Vector3Tuple,
        }: { forwardBy?: number; rotationDelta?: Vector3Tuple },
      ) => {
        const transform = nextVariant[shapeId];
        const [x, y, z] = transform.position;
        const [rx, ry, rz] = transform.rotation;

        nextVariant[shapeId] = {
          ...transform,
          position: [x, y, z - forwardBy] as Vector3Tuple,
          rotation: [rx + rotationDelta[0], ry + rotationDelta[1], rz + rotationDelta[2]] as Vector3Tuple,
        };
      };

      const dimUnfocusedShapes = (highlighted: ShapeId[]) => {
        SHAPE_IDS.forEach((shapeId) => {
          const baseValue = baseOpacity[shapeId] ?? 1;
          nextOpacity[shapeId] = highlighted.includes(shapeId)
            ? baseValue
            : Math.min(baseValue, DIMMED_OPACITY);
        });
      };

      switch (target) {
        case "home":
          SHAPE_IDS.forEach((shapeId) => {
            transformShape(shapeId, {
              forwardBy: HOME_FORWARD_DISTANCE,
              rotationDelta: HOME_ROTATION_DELTA,
            });
            nextOpacity[shapeId] = baseOpacity[shapeId] ?? 1;
          });
          break;
        case "work":
          transformShape("waveSpringLime", {
            forwardBy: FOCUSED_FORWARD_DISTANCE,
            rotationDelta: FOCUSED_ROTATION_DELTA,
          });
          transformShape("sphereFlamingoSpring", {
            forwardBy: FOCUSED_FORWARD_DISTANCE,
            rotationDelta: FOCUSED_ROTATION_DELTA,
          });
          dimUnfocusedShapes(["waveSpringLime", "sphereFlamingoSpring"]);
          break;
        case "about":
          transformShape("semiLimeFlamingo", {
            forwardBy: FOCUSED_FORWARD_DISTANCE,
            rotationDelta: FOCUSED_ROTATION_DELTA,
          });
          transformShape("torusSpringAzure", {
            forwardBy: FOCUSED_FORWARD_DISTANCE,
            rotationDelta: FOCUSED_ROTATION_DELTA,
          });
          dimUnfocusedShapes(["semiLimeFlamingo", "torusSpringAzure"]);
          break;
        case "contact":
          transformShape("semiFlamingoAzure", {
            forwardBy: FOCUSED_FORWARD_DISTANCE,
            rotationDelta: FOCUSED_ROTATION_DELTA,
          });
          transformShape("torusFlamingoLime", {
            forwardBy: FOCUSED_FORWARD_DISTANCE,
            rotationDelta: FOCUSED_ROTATION_DELTA,
          });
          dimUnfocusedShapes(["semiFlamingoAzure", "torusFlamingoLime"]);
          break;
        case "none":
        default:
          SHAPE_IDS.forEach((shapeId) => {
            nextOpacity[shapeId] = baseOpacity[shapeId] ?? 1;
          });
          break;
      }

      const partialUpdate = target === "none"
        ? {
            variant: createVariantState(baseVariant),
            shapeOpacity: { ...baseOpacity },
          }
        : {
            variant: nextVariant,
            shapeOpacity: nextOpacity,
          };

      app.setState(partialUpdate);
      currentHoverRef.current = target;
    },
    [computeMenuVariant],
  );

  useEffect(() => {
    if (!isOpen) {
      currentHoverRef.current = "none";
      baseVariantRef.current = null;
      baseOpacityRef.current = null;
      return;
    }

    if (typeof window === "undefined") {
      return;
    }

    let frame: number | null = null;

    const syncMenuVariant = () => {
      const appHandle = window.__THREE_APP__;
      if (!appHandle) {
        frame = window.requestAnimationFrame(syncMenuVariant);
        return;
      }

      const computed = computeMenuVariant();
      if (!computed) {
        return;
      }

      baseVariantRef.current = createVariantState(computed);
      const snapshot = appHandle.bundle.getState();
      if (!baseOpacityRef.current) {
        baseOpacityRef.current = { ...snapshot.shapeOpacity };
      }

      if (currentHoverRef.current === "none") {
        const baseOpacity =
          baseOpacityRef.current ?? ({ ...snapshot.shapeOpacity } as ShapeOpacityState);
        appHandle.setState({
          variant: createVariantState(computed),
          shapeOpacity: { ...baseOpacity },
        });
      } else {
        applyHover(currentHoverRef.current);
      }

      if (frame !== null) {
        window.cancelAnimationFrame(frame);
        frame = null;
      }
    };

    syncMenuVariant();
    window.addEventListener("resize", syncMenuVariant);

    return () => {
      if (frame !== null) {
        window.cancelAnimationFrame(frame);
      }
      window.removeEventListener("resize", syncMenuVariant);
    };
  }, [isOpen, computeMenuVariant, applyHover]);

  const handleBlurCapture = useCallback(
    (event: FocusEvent<HTMLLIElement>) => {
      const nextTarget = event.relatedTarget as Node | null;
      if (!event.currentTarget.contains(nextTarget)) {
        applyHover("none");
      }
    },
    [applyHover],
  );


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
                <li
                  key={item.href}
                  onMouseEnter={() => applyHover(item.hover)}
                  onMouseLeave={() => applyHover("none")}
                  onFocusCapture={() => applyHover(item.hover)}
                  onBlurCapture={handleBlurCapture}
                >
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
          <ul onMouseEnter={() => applyHover("none")}>
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
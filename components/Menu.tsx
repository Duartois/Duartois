"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
} from "react";
import { useTranslation } from "react-i18next";

import "@/app/i18n/config";

import {
  WORK_ITEM_TRANSITION_DURATION,
  WORK_ITEM_STAGGER_DELAY,
  getFallItemStyle,
} from "./fallAnimation";
import {
  MENU_OVERLAY_MONOGRAM,
  createVariantState,
  type ShapeId,
  type ShapeOpacityState,
  type ThreeAppState,
  type VariantState,
} from "@/components/three/types";
import {
  EXIT_NAVIGATION_ATTRIBUTE,
  navigateWithExit,
} from "@/app/helpers/navigateWithExit";

const MENU_SHAPE_IDS: ShapeId[] = [
  "torusSpringAzure",
  "waveSpringLime",
  "semiLimeFlamingo",
  "torusFlamingoLime",
  "semiFlamingoAzure",
  "sphereFlamingoSpring",
];

const FALLBACK_MENU_VARIANT = createVariantState(MENU_OVERLAY_MONOGRAM);

const FALLBACK_MENU_SHAPE_OPACITY: ShapeOpacityState = {
  torusSpringAzure: 1,
  waveSpringLime: 1,
  semiLimeFlamingo: 1,
  torusFlamingoLime: 1,
  semiFlamingoAzure: 1,
  sphereFlamingoSpring: 1,
};

const DEFAULT_FORWARD_SHIFT = -0.8;
const HOME_FORWARD_SHIFT = -1.1;
const DIMMED_OPACITY_FACTOR = 0.35;

const FORWARD_POSITION_DELTAS: Record<ShapeId, [number, number, number]> = {
  torusSpringAzure: [-0.2, 0.2, 10],
  waveSpringLime: [-0.2, 0.2, 10],
  semiLimeFlamingo: [-0.2, 0.2, 10],
  torusFlamingoLime: [-0.2, 0.2, 10],
  semiFlamingoAzure: [-0.2, 0.2, 10],
  sphereFlamingoSpring: [-0.2, 0.2, 10],
};

const FORWARD_ROTATION_DELTAS: Record<ShapeId, [number, number, number]> = {
  torusSpringAzure: [0.18, -0.2, 0.12],
  waveSpringLime: [-0.22, -0.16, 0.08],
  semiLimeFlamingo: [0.16, 0.22, 0.14],
  torusFlamingoLime: [0.2, -0.24, -0.08],
  semiFlamingoAzure: [-0.24, 0.18, 0.16],
  sphereFlamingoSpring: [0.28, -0.12, 0.22],
};

type MenuItemKey = "home" | "work" | "about" | "contact";

type HoverConfig = {
  forward: ShapeId[];
  shift?: number;
  dimOthers?: boolean;
};

const HOVER_CONFIG: Record<MenuItemKey, HoverConfig> = {
  home: {
    forward: MENU_SHAPE_IDS,
    shift: HOME_FORWARD_SHIFT,
  },
  work: {
    forward: ["waveSpringLime", "sphereFlamingoSpring"],
    dimOthers: true,
  },
  about: {
    forward: ["semiLimeFlamingo", "torusSpringAzure"],
    dimOthers: true,
  },
  contact: {
    forward: ["semiFlamingoAzure", "torusFlamingoLime"],
    dimOthers: true,
  },
};

type MenuItem = {
  key: MenuItemKey;
  href: string;
  label: string;
};

type NavigatorConnection = Navigator & {
  connection?: {
    saveData?: boolean;
    effectiveType?: string;
  };
};

type MenuProps = {
  isOpen: boolean;
  onClose: () => void;
  id?: string;
};


const HOVER_MEDIA_QUERY = "(min-width: 900px)";

export default function Menu({ isOpen, onClose, id = "main-navigation-overlay" }: MenuProps) {
  const { t } = useTranslation("common");
  const pathname = usePathname();
  const router = useRouter();
  const items: MenuItem[] = useMemo(
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
      { href: "https://www.instagram.com/matheus.duarteg/", label: "Instagram" },
      { href: "https://www.behance.net/", label: "Behance" },
    ],
    []
  );

  const totalItems = items.length + socials.length;
  const hideTimeoutRef = useRef<number | undefined>(undefined);
  const [isVisible, setIsVisible] = useState(isOpen);
  const [hoveredItem, setHoveredItem] = useState<MenuItemKey | null>(null);
  const [isHoverEnabled, setIsHoverEnabled] = useState(false);
  const hoveredItemRef = useRef<MenuItemKey | null>(null);
  const baseVariantRef = useRef<VariantState | null>(null);
  const baseOpacityRef = useRef<ShapeOpacityState | null>(null);
  const prefetchedRoutesRef = useRef(new Set<string>());

  const handleMenuLinkClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>, href: string) => {
      const isModifiedClick =
        event.button !== 0 ||
        event.metaKey ||
        event.altKey ||
        event.ctrlKey ||
        event.shiftKey;

      if (event.defaultPrevented || isModifiedClick) {
        return;
      }

      if (href === pathname) {
        event.preventDefault();
        onClose();
        return;
      }

      event.preventDefault();
      navigateWithExit(router, href, {
        onExitStart: onClose,
      });
    },
    [onClose, pathname, router],
  );

  const shouldAllowPrefetch = useCallback(() => {
    if (typeof navigator === "undefined") {
      return false;
    }

    const connection = (navigator as NavigatorConnection).connection;
    return !(connection?.saveData || connection?.effectiveType === "2g");
  }, []);

  const prefetchRoute = useCallback(
    (href: string) => {
      if (typeof window === "undefined") {
        return;
      }

      if (href === pathname || !shouldAllowPrefetch()) {
        return;
      }

      if (prefetchedRoutesRef.current.has(href)) {
        return;
      }

      prefetchedRoutesRef.current.add(href);
      void router.prefetch(href);
    },
    [pathname, router, shouldAllowPrefetch],
  );

  useEffect(() => {
    hoveredItemRef.current = hoveredItem;
  }, [hoveredItem]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    items.forEach((item) => {
      prefetchRoute(item.href);
    });
  }, [isOpen, items, prefetchRoute]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia(HOVER_MEDIA_QUERY);

    const updateHoverState = () => {
      setIsHoverEnabled(mediaQuery.matches);
    };

    updateHoverState();

    if (typeof mediaQuery.addEventListener === "function") {
      const listener = (event: MediaQueryListEvent) => {
        setIsHoverEnabled(event.matches);
      };

      mediaQuery.addEventListener("change", listener);
      return () => mediaQuery.removeEventListener("change", listener);
    }

    const listener = (event: MediaQueryListEvent) => {
      setIsHoverEnabled(event.matches);
    };

    mediaQuery.addListener(listener);
    return () => mediaQuery.removeListener(listener);
  }, []);

  useEffect(() => {
    if (!isHoverEnabled) {
      setHoveredItem(null);
    }
  }, [isHoverEnabled]);

  useEffect(() => {
    if (!isOpen) {
      setHoveredItem(null);
      baseVariantRef.current = null;
      baseOpacityRef.current = null;
      return;
    }

    if (typeof window === "undefined") {
      return;
    }

    const app = window.__THREE_APP__;
    if (!app) {
      return;
    }

    const snapshot = app.bundle.getState();
    baseVariantRef.current = createVariantState(snapshot.variant);
    baseOpacityRef.current = { ...snapshot.shapeOpacity };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || typeof window === "undefined") {
      return;
    }

    const app = window.__THREE_APP__;
    if (!app) {
      return;
    }

    const handleStateChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ state: Readonly<ThreeAppState> }>;
      const nextState = customEvent.detail?.state;

      if (!nextState || hoveredItemRef.current) {
        return;
      }

      baseVariantRef.current = createVariantState(nextState.variant);
      baseOpacityRef.current = { ...nextState.shapeOpacity };
    };

    app.bundle.events.addEventListener("statechange", handleStateChange);

    return () => {
      app.bundle.events.removeEventListener("statechange", handleStateChange);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || typeof window === "undefined") {
      return;
    }

    const app = window.__THREE_APP__;
    if (!app) {
      return;
    }

    const isDesktopViewport = window.matchMedia("(min-width: 900px)").matches;

    const baseVariant = baseVariantRef.current
      ? createVariantState(baseVariantRef.current)
      : createVariantState(FALLBACK_MENU_VARIANT);

    const baseOpacity = baseOpacityRef.current
      ? { ...baseOpacityRef.current }
      : { ...FALLBACK_MENU_SHAPE_OPACITY };

    if (!isDesktopViewport || !hoveredItem) {
      app.setState({
        variant: baseVariant,
        shapeOpacity: baseOpacity,
      });
      return;
    }

    const config = HOVER_CONFIG[hoveredItem];
    const shift = config.shift ?? DEFAULT_FORWARD_SHIFT;
    const forwardSet = new Set(config.forward);

    config.forward.forEach((shapeId) => {
      const transform = baseVariant[shapeId];
      const [x, y, z] = transform.position;
      const [rx, ry, rz] = transform.rotation;
      const [dx, dy, dz] = FORWARD_POSITION_DELTAS[shapeId];
      const [drx, dry, drz] = FORWARD_ROTATION_DELTAS[shapeId];

      transform.position = [
        x + dx,
        y + dy,
        z + shift + dz,
      ] as typeof transform.position;

      transform.rotation = [
        rx + drx,
        ry + dry,
        rz + drz,
      ] as typeof transform.rotation;
    });

    const sourceOpacity = baseOpacityRef.current ?? FALLBACK_MENU_SHAPE_OPACITY;

    if (config.dimOthers) {
      MENU_SHAPE_IDS.forEach((shapeId) => {
        if (forwardSet.has(shapeId)) {
          baseOpacity[shapeId] = sourceOpacity[shapeId];
        } else {
          baseOpacity[shapeId] = sourceOpacity[shapeId] * DIMMED_OPACITY_FACTOR;
        }
      });
    } else {
      MENU_SHAPE_IDS.forEach((shapeId) => {
        baseOpacity[shapeId] = sourceOpacity[shapeId];
      });
    }

    app.setState({
      variant: baseVariant,
      shapeOpacity: baseOpacity,
    });
  }, [hoveredItem, isHoverEnabled, isOpen]);


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
      WORK_ITEM_TRANSITION_DURATION +
      Math.max(totalItems - 1, 0) * WORK_ITEM_STAGGER_DELAY;

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
    getFallItemStyle(isOpen, i, totalItems, { variant: "work" });

  return (
    // estrutura e classes iguais Ã  referÃªncia
    <div
      id={id}
      className="menu"
      style={{
        opacity: isOpen ? 1 : 0,
        visibility: isOpen || isVisible ? "visible" : "hidden",
        pointerEvents: isOpen ? "auto" : "none",
        transition: `opacity ${WORK_ITEM_TRANSITION_DURATION}ms cubic-bezier(.22,.61,.36,1)`,
      }}
      role="dialog"
      aria-modal="true"
      aria-hidden={!isOpen}
    >
      <div className="menu-content" style={{ "--fall-delay": isOpen ? "0.05s" : "0s" } as CSSProperties}>
        <div className="menu-items">
          <nav>
            <ol
              onPointerLeave={() => {
                if (isHoverEnabled) {
                  setHoveredItem(null);
                }
              }}
            >
              {items.map((item, i) => (
                <li key={item.href}>
                  <div
                    className="item-inner"
                    style={itemStyle(i)}
                    onPointerEnter={() => {
                      if (isHoverEnabled) {
                        setHoveredItem(item.key);
                      }
                      prefetchRoute(item.href);
                    }}
                  >
                    <Link
                      href={item.href}
                      {...{ [EXIT_NAVIGATION_ATTRIBUTE]: "true" }}
                      onClick={(event) => handleMenuLinkClick(event, item.href)}
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

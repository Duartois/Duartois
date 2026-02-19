"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import classNames from "classnames";
import { useThreeApp } from "@/app/helpers/threeAppContext";
import { 
  variantMapping, 
  createResponsiveVariantState, 
  type VariantName 
} from "./types";
import CoreCanvas from "./CoreCanvas";
import Noise from "../Noise";

interface GlobalCanvasProps {
  isReady?: boolean;
}

export default function GlobalCanvas({ isReady = true }: GlobalCanvasProps) {
  const pathname = usePathname();
  const { app, setSceneActive } = useThreeApp();
  const lastPathname = useRef<string | null>(null);
  
  const [hasMounted, setHasMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Garante que a cena esteja sempre ativa globalmente e que o componente está montado no cliente
  useEffect(() => {
    setSceneActive(true);
    setHasMounted(true);
    setIsVisible(false);
  }, [setSceneActive]);

  // Controla a visibilidade suave do canvas
  useEffect(() => {
    if (!hasMounted) return;

    const frame = requestAnimationFrame(() => {
      setIsVisible(isReady);
    });

    return () => cancelAnimationFrame(frame);
  }, [hasMounted, isReady]);

  // Reage às mudanças de rota animando o estado 3D
  useEffect(() => {
    // Só executa se o app estiver pronto, se estivermos no navegador e se a rota mudou
    if (!app || typeof window === "undefined" || pathname === lastPathname.current) return;

    let variantName: VariantName = "home";
    if (pathname === "/") variantName = "home";
    else if (pathname.startsWith("/about")) variantName = "about";
    else if (pathname.startsWith("/work")) variantName = "work";
    else if (pathname.startsWith("/contact")) variantName = "contact";

    const responsiveVariant = createResponsiveVariantState(
      variantMapping[variantName],
      window.innerWidth,
      window.innerHeight
    );

    // Atualiza o estado do app 3D sem desmontar o canvas
    app.setState({
      variantName,
      variant: responsiveVariant,
    });

    lastPathname.current = pathname;
  }, [pathname, app]);

  // Não renderiza nada no servidor para evitar erros de hidratação e referências ao window
  if (!hasMounted) return null;

  return (
    <div
      className={classNames(
        "pointer-events-none fixed inset-0 z-0 overflow-visible transition-opacity duration-700",
        isVisible ? "opacity-100" : "opacity-0",
      )}
      aria-hidden={!isVisible}
      data-fall-skip="true"
    >
      <div className="relative h-full w-full">
        <div className="absolute inset-0 z-0">
          <Noise />
          <CoreCanvas isReady={isReady} />
        </div>
      </div>
    </div>
  );
}

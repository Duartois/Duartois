"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useThreeApp } from "@/app/helpers/threeAppContext";
import { 
  variantMapping, 
  createResponsiveVariantState, 
  type VariantName 
} from "./types";
import CanvasRoot from "./CanvasRoot";

export default function GlobalCanvas() {
  const pathname = usePathname();
  const { app, setSceneActive } = useThreeApp();
  const lastPathname = useRef<string | null>(null);

  // Garante que a cena esteja sempre ativa globalmente
  useEffect(() => {
    setSceneActive(true);
  }, [setSceneActive]);

  useEffect(() => {
    if (!app || pathname === lastPathname.current) return;

    // Mapeia a rota para o nome da variante
    let variantName: VariantName = "home";
    if (pathname === "/") variantName = "home";
    else if (pathname.startsWith("/about")) variantName = "about";
    else if (pathname.startsWith("/work")) {
      // Se estiver em um projeto específico (/work/[slug]), podemos usar a variante 'work'
      // ou criar uma específica se desejar.
      variantName = "work";
    }
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
      // Você pode ajustar a duração da transição aqui se desejar
      // variantTransitionMs: 1000 
    });

    lastPathname.current = pathname;
  }, [pathname, app]);

  return <CanvasRoot isReady={true} />;
}

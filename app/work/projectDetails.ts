import type { ProjectKey, ProjectSlug } from "./projects";

export type ProjectMetadataLabel =
  | "category"
  | "year"
  | "awards"
  | "team"
  | "client";

export type ProjectMetadataEntry = {
  label: ProjectMetadataLabel;
  values: string[];
};

export type ProjectContentBlock =
  | {
      type: "heading";
      text: string;
    }
  | {
      type: "paragraph";
      text: string;
    }
  | {
      type: "image";
      src: string;
      alt: string;
    };

export type ProjectDetail = {
  key: ProjectKey;
  slug: ProjectSlug;
  title: string;
  accentColor: string;
  accentColorDark: string;
  heroImage: {
    src: string;
    alt: string;
  };
  metadata: ProjectMetadataEntry[];
  description: string[];
  content: ProjectContentBlock[];
};

const basePlaceholderDescription = [
  "We are preparing the full case study for this project. Please check back soon to explore more details.",
];

export const projectDetails: Record<ProjectSlug, ProjectDetail> = {
  duartois: {
    key: "Duartois",
    slug: "duartois",
    title: "Duartois",
    accentColor: "#606887",
    accentColorDark: "#5bedc7",
    heroImage: {
      src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmh50r86s077108phi5x6kw9j",
      alt: "Cover of the project Duartois",
    },
    metadata: [
      {
        label: "category",
        values: ["Branding"],
      },
      { label: "year", values: ["2022"] },
    ],
    description: [
      "Portfólio pessoal com foco em branding e experiências interativas. Desenvolvido em Next.js (App Router), TypeScript e Tailwind, com testes em Vitest. Inclui alternância de tema e idioma, páginas de Work/About/Contact e uma experiência de navegação com loading e transições voltadas para UI de alto impacto.",
    ],
    content: [
      { type: "heading", text: "Links" },
      {
        type: "paragraph",
        text: "Site: duartois.vercel.app | Repo: github.com/Duartois/Duartois",
      },
      { type: "heading", text: "Stack (evidências do repo)" },
      {
        type: "paragraph",
        text: "Next.js (App Router com pasta app/), TypeScript, Tailwind CSS e Vitest (setup e configuração de testes).",
      },
      { type: "heading", text: "Funcionalidades/Especificações" },
      {
        type: "paragraph",
        text: "UI com Theme toggle e Language toggle (indicador de i18n). Seções Home / Work / About / Contact; Contact com email e links sociais.",
      },
      {
        type: "paragraph",
        text: "Navegação e carregamento com microcopy (“Materializing shapes…”) sugerindo experiência interativa/animada.",
      },
      { type: "heading", text: "Brand Guidelines" },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmh50r86s077108phi5x6kw9j",
        alt: "Brand guidelines (Cover)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8cu6lh707phck9yqylk",
        alt: "Brand guidelines (Table of contents)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8uo6lrs07pl7m2tri0k",
        alt: "Brand guidelines (Concept)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8nb6lre07plyzuhnk9a",
        alt: "Brand guidelines (Shapes)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8lj6lhl07phojmbmsul",
        alt: "Brand guidelines (Shapes)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8js6lr707plqcji84j9",
        alt: "Brand guidelines (Shapes)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8i16lhe07ph1o439el6",
        alt: "Brand guidelines (Shapes)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8su6lhz07ph5htc6stt",
        alt: "Brand guidelines (Logotype)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8qz6lrl07plc7uxw6fv",
        alt: "Brand guidelines (Logotype)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljuts806jg007ph9oy4m1jk",
        alt: "Brand guidelines (Logotypes)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8y46lid07phi3ntuhqx",
        alt: "Brand guidelines (Colours)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8wa6li607phrdepijf4",
        alt: "Brand guidelines (Colours)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8a86lr007pll3o9r0ww",
        alt: "Brand guidelines (Typography)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8zs6lrz07plb6p05dsl",
        alt: "Brand guidelines (Website)",
      }
    ],
  },
  wealthcomplex: {
    key: "WealthComplex",
    slug: "wealthcomplex",
    title: "WealthComplex",
    accentColor: "rgb(231, 163, 167)",
    accentColorDark: "rgb(231, 163, 167)",
    heroImage: {
      src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmh10iy470dyi08ph22lhoqox",
      alt: "Cover of the project WealthComplex",
    },
    metadata: [
      { label: "category", values: ["Web Development"] },
    ],
    description: [
      "Landing page avançada (React + Vite) voltada a conversão, com i18n (pt/en), tema dark, animações (Framer Motion/Lottie/Spline) e captação de leads com EmailJS + HubSpot + Slack. Inclui otimizações de performance (lazy/async sections), carrosséis responsivos e suíte de qualidade (Vitest/Testing Library + ESLint/Prettier).",
    ],
    content: [
      { type: "heading", text: "Links" },
      {
        type: "paragraph",
        text: "Repo: github.com/Duartois/WealthComplex | Deploy: projeto-portifolio-three.vercel.app | Página no portfólio: /work/wealth-complex",
      },
      { type: "heading", text: "Resumo (README)" },
      {
        type: "paragraph",
        text: "Landing inspirada na WealthSimple para apresentar serviços financeiros modernos, com foco em conversão, animações ricas, multilíngue e captação automatizada de leads.",
      },
      { type: "heading", text: "Stack/Ferramentas (README)" },
      {
        type: "paragraph",
        text: "React + Vite, Tailwind CSS + Sass, i18next/react-i18next (pt/en), Framer Motion + Lottie + Spline, Swiper, lucide-react, react-simple-typewriter, EmailJS + HubSpot CRM API + Slack Webhooks, Vitest + Testing Library + ESLint + Prettier, PostCSS.",
      },
      { type: "heading", text: "Funcionalidades/Especificações" },
      {
        type: "paragraph",
        text: "Carregamento assíncrono das seções, tema dark com tipografia personalizada, formulário com honeypot + automações de lead/notificação e navegação contextual com React Router, barra de progresso e atalhos.",
      },
      {
        type: "paragraph",
        text: "Experiência pensada para alta conversão com animações ricas, carrosséis responsivos e performance otimizada desde o primeiro carregamento.",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmkln4kau0fek07pfrnyf7zk6",
        alt: "Brand guidelines (Cover)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8cu6lh707phck9yqylk",
        alt: "Brand guidelines (Table of contents)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8uo6lrs07pl7m2tri0k",
        alt: "Brand guidelines (Concept)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8nb6lre07plyzuhnk9a",
        alt: "Brand guidelines (Shapes)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8lj6lhl07phojmbmsul",
        alt: "Brand guidelines (Shapes)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8js6lr707plqcji84j9",
        alt: "Brand guidelines (Shapes)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8i16lhe07ph1o439el6",
        alt: "Brand guidelines (Shapes)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8su6lhz07ph5htc6stt",
        alt: "Brand guidelines (Logotype)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8qz6lrl07plc7uxw6fv",
        alt: "Brand guidelines (Logotype)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8p76lhs07phbocinrts",
        alt: "Brand guidelines (Logotypes)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8y46lid07phi3ntuhqx",
        alt: "Brand guidelines (Colours)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8wa6li607phrdepijf4",
        alt: "Brand guidelines (Colours)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8a86lr007pll3o9r0ww",
        alt: "Brand guidelines (Typography)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8zs6lrz07plb6p05dsl",
        alt: "Brand guidelines (Website)",
      }
    ],
  },
  retrochroma: {
    key: "RETROCHROMA",
    slug: "retrochroma",
    title: "RETROCHROMA",
    accentColor: "rgb(248, 255, 129)",
    accentColorDark: "rgb(248, 255, 129)",
    heroImage: {
      src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmh10k9ki0do507plnoi22k6r",
      alt: "Cover of the project RETROCHROMA",
    },
    metadata: [{ label: "category", values: ["Portrait"] }],
    description: basePlaceholderDescription,
    content: [
      {
        type: "paragraph",
        text: "RETROCHROMA explores a colourful portrait series. More information about the creative process will be shared soon.",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmh50r86s077108phi5x6kw9j",
        alt: "Brand guidelines (Cover)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8cu6lh707phck9yqylk",
        alt: "Brand guidelines (Table of contents)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8uo6lrs07pl7m2tri0k",
        alt: "Brand guidelines (Concept)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8nb6lre07plyzuhnk9a",
        alt: "Brand guidelines (Shapes)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8lj6lhl07phojmbmsul",
        alt: "Brand guidelines (Shapes)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8js6lr707plqcji84j9",
        alt: "Brand guidelines (Shapes)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8i16lhe07ph1o439el6",
        alt: "Brand guidelines (Shapes)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8su6lhz07ph5htc6stt",
        alt: "Brand guidelines (Logotype)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8qz6lrl07plc7uxw6fv",
        alt: "Brand guidelines (Logotype)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8p76lhs07phbocinrts",
        alt: "Brand guidelines (Logotypes)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8y46lid07phi3ntuhqx",
        alt: "Brand guidelines (Colours)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8wa6li607phrdepijf4",
        alt: "Brand guidelines (Colours)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8a86lr007pll3o9r0ww",
        alt: "Brand guidelines (Typography)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8zs6lrz07plb6p05dsl",
        alt: "Brand guidelines (Website)",
      }
    ],
  },
  "bichinhos-ousados": {
    key: "Bichinhos Ousados",
    slug: "bichinhos-ousados",
    title: "Bichinhos Ousados",
    accentColor: "rgb(137, 223, 214)",
    accentColorDark: "rgb(137, 223, 214)",
    heroImage: {
      src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmgzfbuoz2hf507o09k2nvvdn",
      alt: "Cover of the project Bichinhos Ousados",
    },
    metadata: [{ label: "category", values: ["Web Development"] }],
    description: [
      "Front-end de e-commerce com estética “playful”, estruturado como projeto Vite com Tailwind CSS. A base do repositório inclui pipeline de build (Vite), estilização utilitária (Tailwind/PostCSS) e organização padrão em src/ e public/.",
    ],
    content: [
      {
        type: "paragraph",
        text: "Repo: github.com/Duartois/Bichinhos-Ousados | Página no portfólio: /work/bichinhos-ousados",
      },
      {
        type: "paragraph",
        text: "Resumo: experiência de e-commerce “playful” (front-end).",
      },
      {
        type: "paragraph",
        text: "Stack (evidências do repo): Vite (vite.config.js), Tailwind CSS + PostCSS, estrutura padrão com src/ e public/.",
      },
      {
        type: "paragraph",
        text: "Recomendação (vaga Jr): como o README público não descreve fluxos (catálogo, carrinho, checkout), vale adicionar no repo/portfólio as principais telas, fluxo de compra e o que foi implementado (mesmo que seja somente UI/UX + front).",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmh50r86s077108phi5x6kw9j",
        alt: "Brand guidelines (Cover)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8cu6lh707phck9yqylk",
        alt: "Brand guidelines (Table of contents)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8uo6lrs07pl7m2tri0k",
        alt: "Brand guidelines (Concept)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8nb6lre07plyzuhnk9a",
        alt: "Brand guidelines (Shapes)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8lj6lhl07phojmbmsul",
        alt: "Brand guidelines (Shapes)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8js6lr707plqcji84j9",
        alt: "Brand guidelines (Shapes)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8i16lhe07ph1o439el6",
        alt: "Brand guidelines (Shapes)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8su6lhz07ph5htc6stt",
        alt: "Brand guidelines (Logotype)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8qz6lrl07plc7uxw6fv",
        alt: "Brand guidelines (Logotype)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8p76lhs07phbocinrts",
        alt: "Brand guidelines (Logotypes)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8y46lid07phi3ntuhqx",
        alt: "Brand guidelines (Colours)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8wa6li607phrdepijf4",
        alt: "Brand guidelines (Colours)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8a86lr007pll3o9r0ww",
        alt: "Brand guidelines (Typography)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8zs6lrz07plb6p05dsl",
        alt: "Brand guidelines (Website)",
      }
    ],
  },
  "pov-tessellum": {
    key: "POV.Tessellum",
    slug: "pov-tessellum",
    title: "POV.Tessellum",
    accentColor: "rgb(163, 167, 185)",
    accentColorDark: "rgb(163, 167, 185)",
    heroImage: {
      src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmh10loy30e2b08phhp6mxamw",
      alt: "Cover of the project POV.Tessellum",
    },
    metadata: [{ label: "category", values: ["UX/UI Design"] }],
    description: [
      "Landing page template com parallax scroll suave, construída em Next.js (App Router) + TypeScript + Tailwind. Entrega hero full-screen, transições baseadas em scroll, layout mobile-first e UI minimalista voltada para campanhas e lançamentos. Deploy em Vercel.",
    ],
    content: [
      { type: "heading", text: "Links" },
      {
        type: "paragraph",
        text: "Repo: github.com/Duartois/POV.Tesselum | Deploy: modelo-landing-page-parallax.vercel.app | Página no portfólio: /work/pov-tessellum",
      },
      { type: "heading", text: "Resumo (README)" },
      {
        type: "paragraph",
        text: "Template de landing page moderna com smooth parallax scroll, voltada para lançamentos/marketing.",
      },
      { type: "heading", text: "Stack (README)" },
      {
        type: "paragraph",
        text: "Next.js (App Router) + Tailwind + TypeScript + PostCSS, com Framer Motion como opcional.",
      },
      { type: "heading", text: "Funcionalidades/Especificações" },
      {
        type: "paragraph",
        text: "Hero full-screen, camadas com animação baseada em scroll (parallax), mobile-first e UI minimalista pronta para produção.",
      },
      {
        type: "paragraph",
        text: "Template pensado para campanhas e lançamentos, com transições suaves e foco em impacto visual.",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmh50r86s077108phi5x6kw9j",
        alt: "Brand guidelines (Cover)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8cu6lh707phck9yqylk",
        alt: "Brand guidelines (Table of contents)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8uo6lrs07pl7m2tri0k",
        alt: "Brand guidelines (Concept)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8nb6lre07plyzuhnk9a",
        alt: "Brand guidelines (Shapes)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8lj6lhl07phojmbmsul",
        alt: "Brand guidelines (Shapes)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8js6lr707plqcji84j9",
        alt: "Brand guidelines (Shapes)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8i16lhe07ph1o439el6",
        alt: "Brand guidelines (Shapes)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8su6lhz07ph5htc6stt",
        alt: "Brand guidelines (Logotype)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8qz6lrl07plc7uxw6fv",
        alt: "Brand guidelines (Logotype)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8p76lhs07phbocinrts",
        alt: "Brand guidelines (Logotypes)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8y46lid07phi3ntuhqx",
        alt: "Brand guidelines (Colours)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8wa6li607phrdepijf4",
        alt: "Brand guidelines (Colours)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8a86lr007pll3o9r0ww",
        alt: "Brand guidelines (Typography)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8zs6lrz07plb6p05dsl",
        alt: "Brand guidelines (Website)",
      }
    ],
  },
  evergreen: {
    key: "Evergreen",
    slug: "evergreen",
    title: "Evergreen",
    accentColor: "rgb(173, 188, 186)",
    accentColorDark: "rgb(173, 188, 186)",
    heroImage: {
      src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmh10loxu0dq807plgnfpkgot",
      alt: "Cover of the project Evergreen",
    },
    metadata: [{ label: "category", values: ["SaaS"] }],
    description: [
      "Starter SaaS full-stack para assinatura e acesso a conteúdo premium (e-books), feito em Next.js App Router + TypeScript + Tailwind. Inclui autenticação, controle de acesso por plano (Free/Premium), banco via Prisma (SQLite no dev) e UI componentizada com ShadCN. Estrutura pronta para evolução com Stripe e banco em produção.",
    ],
    content: [
      { type: "heading", text: "Links" },
      {
        type: "paragraph",
        text: "Repo: github.com/Duartois/Evergreen | Demo: saas-ebook-seven.vercel.app | Página no portfólio: /work/evergreen",
      },
      { type: "heading", text: "Resumo (README)" },
      {
        type: "paragraph",
        text: "Template SaaS full-stack para conteúdo pago (e-books/material premium), com autenticação, DB e lógica de assinatura/acesso.",
      },
      { type: "heading", text: "Stack (README)" },
      {
        type: "paragraph",
        text: "Next.js App Router + TypeScript + Tailwind, Prisma ORM (SQLite padrão, substituível por Postgres/MySQL), ShadCN UI.",
      },
      { type: "heading", text: "Funcionalidades/Especificações" },
      {
        type: "paragraph",
        text: "Auth (email/senha ou OAuth-ready), controle de acesso por plano (Free/Premium), backend modular (lib/) e estrutura pronta para integrar Stripe/Supabase.",
      },
      {
        type: "paragraph",
        text: "TODOs incluem integração Stripe “ready for plug-in” e migração de DB para produção.",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmh50r86s077108phi5x6kw9j",
        alt: "Brand guidelines (Cover)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8cu6lh707phck9yqylk",
        alt: "Brand guidelines (Table of contents)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8uo6lrs07pl7m2tri0k",
        alt: "Brand guidelines (Concept)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8nb6lre07plyzuhnk9a",
        alt: "Brand guidelines (Shapes)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8lj6lhl07phojmbmsul",
        alt: "Brand guidelines (Shapes)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8js6lr707plqcji84j9",
        alt: "Brand guidelines (Shapes)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8i16lhe07ph1o439el6",
        alt: "Brand guidelines (Shapes)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8su6lhz07ph5htc6stt",
        alt: "Brand guidelines (Logotype)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8qz6lrl07plc7uxw6fv",
        alt: "Brand guidelines (Logotype)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8p76lhs07phbocinrts",
        alt: "Brand guidelines (Logotypes)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8y46lid07phi3ntuhqx",
        alt: "Brand guidelines (Colours)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8wa6li607phrdepijf4",
        alt: "Brand guidelines (Colours)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8a86lr007pll3o9r0ww",
        alt: "Brand guidelines (Typography)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8zs6lrz07plb6p05dsl",
        alt: "Brand guidelines (Website)",
      }
    ],
  },
  flowly: {
    key: "Flowly",
    slug: "flowly",
    title: "Flowly",
    accentColor: "rgb(233, 220, 97)",
    accentColorDark: "rgb(233, 220, 97)",
    heroImage: {
      src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmh10loxy0e2608phm509dd7f",
      alt: "Cover of the project Flowly",
    },
    metadata: [{ label: "category", values: ["SaaS"] }],
    description: [
      "A página do case está marcada como “in progress / check back later”. Sem repositório público correspondente, não há validação pública de stack ou features no momento.",
    ],
    content: [
      {
        type: "paragraph",
        text: "Bloco mínimo recomendado para completar hoje: problema que resolve (1 frase), público-alvo, módulos (ex.: auth, billing, dashboard, emails), stack real (Next/Vite, DB, auth, payments) e link (repo ou demo) + 3 prints.",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmh50r86s077108phi5x6kw9j",
        alt: "Brand guidelines (Cover)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8cu6lh707phck9yqylk",
        alt: "Brand guidelines (Table of contents)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8uo6lrs07pl7m2tri0k",
        alt: "Brand guidelines (Concept)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8nb6lre07plyzuhnk9a",
        alt: "Brand guidelines (Shapes)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8lj6lhl07phojmbmsul",
        alt: "Brand guidelines (Shapes)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8js6lr707plqcji84j9",
        alt: "Brand guidelines (Shapes)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8i16lhe07ph1o439el6",
        alt: "Brand guidelines (Shapes)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8su6lhz07ph5htc6stt",
        alt: "Brand guidelines (Logotype)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8qz6lrl07plc7uxw6fv",
        alt: "Brand guidelines (Logotype)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8p76lhs07phbocinrts",
        alt: "Brand guidelines (Logotypes)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8y46lid07phi3ntuhqx",
        alt: "Brand guidelines (Colours)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8wa6li607phrdepijf4",
        alt: "Brand guidelines (Colours)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8a86lr007pll3o9r0ww",
        alt: "Brand guidelines (Typography)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8zs6lrz07plb6p05dsl",
        alt: "Brand guidelines (Website)",
      }
    ],
  },
  coverage: {
    key: "Coverage",
    slug: "coverage",
    title: "Coverage",
    accentColor: "rgb(119, 208, 206)",
    accentColorDark: "rgb(119, 208, 206)",
    heroImage: {
      src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmh11p0lj0fi608phg4o006wu",
      alt: "Cover of the project Coverage",
    },
    metadata: [{ label: "category", values: ["UX/UI Design"] }],
    description: [
      "A página do case está marcada como “in progress / check back later”. Sem repositório público correspondente, não há validação pública de stack ou entregáveis no momento.",
    ],
    content: [
      {
        type: "paragraph",
        text: "Bloco mínimo recomendado para completar hoje: objetivo do design (ex.: cobertura/seguros? analytics? health?), entregáveis (sitemap, wireframes, UI kit, protótipo), ferramentas (Figma/Framer/etc.) e principais decisões (grid, tipografia, tokens, componentes).",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmh50r86s077108phi5x6kw9j",
        alt: "Brand guidelines (Cover)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8cu6lh707phck9yqylk",
        alt: "Brand guidelines (Table of contents)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8uo6lrs07pl7m2tri0k",
        alt: "Brand guidelines (Concept)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8nb6lre07plyzuhnk9a",
        alt: "Brand guidelines (Shapes)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8lj6lhl07phojmbmsul",
        alt: "Brand guidelines (Shapes)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8js6lr707plqcji84j9",
        alt: "Brand guidelines (Shapes)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8i16lhe07ph1o439el6",
        alt: "Brand guidelines (Shapes)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8su6lhz07ph5htc6stt",
        alt: "Brand guidelines (Logotype)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8qz6lrl07plc7uxw6fv",
        alt: "Brand guidelines (Logotype)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8p76lhs07phbocinrts",
        alt: "Brand guidelines (Logotypes)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8y46lid07phi3ntuhqx",
        alt: "Brand guidelines (Colours)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8wa6li607phrdepijf4",
        alt: "Brand guidelines (Colours)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8a86lr007pll3o9r0ww",
        alt: "Brand guidelines (Typography)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8zs6lrz07plb6p05dsl",
        alt: "Brand guidelines (Website)",
      }
    ],
  },
  feature: {
    key: "Feature",
    slug: "feature",
    title: "Feature",
    accentColor: "rgb(248, 212, 195)",
    accentColorDark: "rgb(248, 212, 195)",
    heroImage: {
      src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmh11ek7i0ep407plwiaxyc23",
      alt: "Cover of the project Feature",
    },
    metadata: [{ label: "category", values: ["Portrait"] }],
    description: basePlaceholderDescription,
    content: [
      {
        type: "paragraph",
        text: "Feature spotlights a vibrant illustration series. Check back soon for behind-the-scenes sketches and colour studies.",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmh50r86s077108phi5x6kw9j",
        alt: "Brand guidelines (Cover)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8cu6lh707phck9yqylk",
        alt: "Brand guidelines (Table of contents)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8uo6lrs07pl7m2tri0k",
        alt: "Brand guidelines (Concept)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8nb6lre07plyzuhnk9a",
        alt: "Brand guidelines (Shapes)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8lj6lhl07phojmbmsul",
        alt: "Brand guidelines (Shapes)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8js6lr707plqcji84j9",
        alt: "Brand guidelines (Shapes)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8i16lhe07ph1o439el6",
        alt: "Brand guidelines (Shapes)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8su6lhz07ph5htc6stt",
        alt: "Brand guidelines (Logotype)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8qz6lrl07plc7uxw6fv",
        alt: "Brand guidelines (Logotype)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8p76lhs07phbocinrts",
        alt: "Brand guidelines (Logotypes)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8y46lid07phi3ntuhqx",
        alt: "Brand guidelines (Colours)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8wa6li607phrdepijf4",
        alt: "Brand guidelines (Colours)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8a86lr007pll3o9r0ww",
        alt: "Brand guidelines (Typography)",
      },
      {
        type: "image",
        src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8zs6lrz07plb6p05dsl",
        alt: "Brand guidelines (Website)",
      }
    ],
  },
};

export const projectSlugs = Object.keys(projectDetails) as ProjectSlug[];

export function getProjectDetailBySlug(slug: ProjectSlug): ProjectDetail {
  return projectDetails[slug];
}

export function isProjectSlug(value: string): value is ProjectSlug {
  return (projectSlugs as string[]).includes(value);
}

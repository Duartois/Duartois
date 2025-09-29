import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  pt: {
    translation: {
      home: {
        hero: {
          kicker: "PORTFÓLIO DIGITAL DE DUARTOIS",
          title: "Identidades cinéticas para marcas visionárias.",
          subtitle:
            "Crio narrativas digitais que unem arte generativa, movimento e som para lançar experiências inesquecíveis.",
          ctaProjects: "ver meus projetos",
          ctaAbout: "mais sobre mim",
        },
      },
      work: {
        title: "Projetos selecionados",
        subtitle:
          "Passe o cursor ou use o teclado sobre cada projeto para explorar um preview do processo criativo.",
        previewHint: "Preview dinâmico",
        projects: {
          aurora: {
            title: "Aurora Chromatica",
            year: "2024",
            description:
              "Experiência interativa que responde a trilhas sonoras em tempo real, gerando paisagens luminosas para um festival imersivo.",
            previewAlt: "Visualização abstrata do projeto Aurora Chromatica.",
          },
          mare: {
            title: "Maré Atlântica",
            year: "2023",
            description:
              "Narrativa audiovisual que combina dados de marés e poesia para uma instalação em grande escala no litoral português.",
            previewAlt: "Poster conceitual do projeto Maré Atlântica.",
          },
          spectrum: {
            title: "Spectrum Pulse",
            year: "2022",
            description:
              "Sistema de identidade modular para uma plataforma de música generativa, com diretrizes responsivas para print e motion.",
            previewAlt: "Interface dinâmica do projeto Spectrum Pulse.",
          },
        },
      },
      about: {
        kicker: "quem sou",
        title: "Criativo multidisciplinar com foco em futuros visuais.",
        paragraphs: {
          first:
            "Sou Duarte, designer e diretor criativo com raízes em Lisboa e atuação global. Transformo conceitos em experiências digitais unindo JavaScript, React e Three.js à direção de arte cinematográfica.",
          second:
            "No estúdio aplico processos ágeis: prototipagem com Tailwind, integrações Stripe, desenho de APIs e modelagem de dados em MongoDB para escalar produtos expressivos.",
          third:
            "Entre colaborações sigo estudando som, motion e design generativo — explore meu <github>GitHub</github> (@Duartois) para ver protótipos vivos e ferramentas abertas.",
        },
        visualCaption: "Avatar orgânico animado representando Duarte.",
      },
      contact: {
        title: "Vamos criar algo juntos?",
        subtitle:
          "Envie uma mensagem com o que você está planejando ou conecte-se pelas redes abaixo.",
        form: {
          nameLabel: "Nome",
          namePlaceholder: "Ana Silva",
          emailLabel: "E-mail",
          emailPlaceholder: "voce@estudio.com",
          messageLabel: "Mensagem",
          messagePlaceholder: "Conte-me sobre o projeto, prazos e objetivos.",
          submit: "enviar mensagem",
          success: "Mensagem enviada! Vou responder em breve.",
        },
      },
    },
  },
  en: {
    translation: {
      home: {
        hero: {
          kicker: "DUARTOIS DIGITAL PORTFOLIO",
          title: "Kinetic identities for vision-led brands.",
          subtitle:
            "I craft digital narratives that blend generative art, motion, and sound to launch unforgettable experiences.",
          ctaProjects: "see my projects",
          ctaAbout: "more about me",
        },
      },
      work: {
        title: "Selected projects",
        subtitle:
          "Hover or focus each project to explore a glimpse of the creative process.",
        previewHint: "Dynamic preview",
        projects: {
          aurora: {
            title: "Aurora Chromatica",
            year: "2024",
            description:
              "Interactive experience reacting to live soundtracks, generating luminous landscapes for an immersive festival.",
            previewAlt: "Abstract visualization of the Aurora Chromatica project.",
          },
          mare: {
            title: "Atlantic Tide",
            year: "2023",
            description:
              "Audiovisual narrative blending tide data and poetry for a large-scale installation on the Portuguese coast.",
            previewAlt: "Concept poster for the Atlantic Tide project.",
          },
          spectrum: {
            title: "Spectrum Pulse",
            year: "2022",
            description:
              "Modular identity system for a generative music platform, with responsive guidelines for print and motion.",
            previewAlt: "Dynamic interface of the Spectrum Pulse project.",
          },
        },
      },
      about: {
        kicker: "about me",
        title: "Multidisciplinary creative focused on visual futures.",
        paragraphs: {
          first:
            "I'm Duarte, a designer and creative director from Lisbon with a global practice. I turn concepts into digital experiences by pairing JavaScript, React, and Three.js with cinematic art direction.",
          second:
            "Inside the studio I lean on agile workflows — rapid prototyping with Tailwind, Stripe integrations, API design, and MongoDB data modelling to ship expressive products.",
          third:
            "When I'm not co-creating with teams, I'm studying sound, motion, and generative design — browse my <github>GitHub</github> (@Duartois) to see living prototypes and open tools.",
        },
        visualCaption: "Animated organic avatar representing Duarte.",
      },
      contact: {
        title: "Shall we create something together?",
        subtitle:
          "Send a note with what you're planning or connect through the networks below.",
        form: {
          nameLabel: "Name",
          namePlaceholder: "Alex Johnson",
          emailLabel: "Email",
          emailPlaceholder: "you@studio.com",
          messageLabel: "Message",
          messagePlaceholder: "Tell me about the project, timeline, and goals.",
          submit: "send message",
          success: "Message sent! I'll reply soon.",
        },
      },
    },
  },
} as const;

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: "pt",
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    supportedLngs: ["pt", "en"],
    defaultNS: "translation",
  });
}

export default i18n;
export type AppTranslationKeys = keyof typeof resources.pt.translation;

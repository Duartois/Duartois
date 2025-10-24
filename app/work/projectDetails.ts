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
        values: ["Branding", "UX/UI Design", "Web Development"],
      },
      { label: "year", values: ["2022"] },
      {
        label: "awards",
        values: [
          "",
          "",
        ],
      },
    ],
    description: [
      "We are preparing the full case study for this project. Please check back soon to explore more details."
      // "Duartois is the nickname I use on social medias. The goal of this project was to create my own identity, adaptable and modular to work with both my real name and my nickname. First, the identity needed to be defined in brand guidelines and then had to be adapted for digital medias (website, wallpapers, social medias) and physical formats (business cards/stickers, letter paper and resume).",
    ],
    content: [
      // { type: "heading", text: "Brand Guidelines" },
      // {
      //   type: "image",
      //   src: "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmh50r86s077108phi5x6kw9j",
      //   alt: "Brand guidelines (Cover)",
      // },
      // {
      //   type: "image",
      //   src: "https://eu-central-1.graphassets.com/AIsBIpEzjT9776nQrClIuz/cm7rr0csop20m07ukhrfkbcu5",
      //   alt: "Brand guidelines (Table of contents)",
      // },
      // {
      //   type: "image",
      //   src: "https://eu-central-1.graphassets.com/AIsBIpEzjT9776nQrClIuz/cm7rr2pibozzf08urvvzd7moi",
      //   alt: "Brand guidelines (Concept)",
      // },
      // {
      //   type: "image",
      //   src: "https://eu-central-1.graphassets.com/AIsBIpEzjT9776nQrClIuz/cm7rr27huon5c07urcopci56n",
      //   alt: "Brand guidelines (Shapes)",
      // },
      // {
      //   type: "image",
      //   src: "https://eu-central-1.graphassets.com/AIsBIpEzjT9776nQrClIuz/cm7rqstf1os5o07ukivtxjj4d",
      //   alt: "Brand guidelines (Shapes)",
      // },
      // {
      //   type: "image",
      //   src: "https://eu-central-1.graphassets.com/AIsBIpEzjT9776nQrClIuz/cm7rqxdmaosbb08urq3j5m8tc",
      //   alt: "Brand guidelines (Shapes)",
      // },
      // {
      //   type: "image",
      //   src: "https://eu-central-1.graphassets.com/AIsBIpEzjT9776nQrClIuz/cm7rr15q6p31x07uk9qd2cffe",
      //   alt: "Brand guidelines (Shapes)",
      // },
      // {
      //   type: "image",
      //   src: "https://eu-central-1.graphassets.com/AIsBIpEzjT9776nQrClIuz/cm7rqtfdxoo6f08urz81yi9bi",
      //   alt: "Brand guidelines (Logotype)",
      // },
      // {
      //   type: "image",
      //   src: "https://eu-central-1.graphassets.com/AIsBIpEzjT9776nQrClIuz/cm7rqymqtozg607ukfod0qppk",
      //   alt: "Brand guidelines (Logotype)",
      // },
      // {
      //   type: "image",
      //   src: "https://eu-central-1.graphassets.com/AIsBIpEzjT9776nQrClIuz/cm7rquuofoul807ukl2doox5t",
      //   alt: "Brand guidelines (Logotypes)",
      // },
      // {
      //   type: "image",
      //   src: "https://eu-central-1.graphassets.com/AIsBIpEzjT9776nQrClIuz/cm7rqy524ogzi07ur4gqet46n",
      //   alt: "Brand guidelines (Colours)",
      // },
      // {
      //   type: "image",
      //   src: "https://eu-central-1.graphassets.com/AIsBIpEzjT9776nQrClIuz/cm7rqw9f4ovz507uk2zcbja62",
      //   alt: "Brand guidelines (Colours)",
      // },
      // {
      //   type: "image",
      //   src: "https://eu-central-1.graphassets.com/AIsBIpEzjT9776nQrClIuz/cm7rqz37zourw08ureb6njcqr",
      //   alt: "Brand guidelines (Typography)",
      // },
      // {
      //   type: "image",
      //   src: "https://eu-central-1.graphassets.com/AIsBIpEzjT9776nQrClIuz/cm7rqu8zqop0108urxb7afe0a",
      //   alt: "Brand guidelines (Website)",
      // },
      // {
      //   type: "image",
      //   src: "https://eu-central-1.graphassets.com/AIsBIpEzjT9776nQrClIuz/cm7rqzm6rp0ud07uky87bkat0",
      //   alt: "Brand guidelines (Applications)",
      // },
      // {
      //   type: "image",
      //   src: "https://eu-central-1.graphassets.com/AIsBIpEzjT9776nQrClIuz/cm7rqvrdcoveu07uk7360v80j",
      //   alt: "Brand guidelines (Applications)",
      // },
      // {
      //   type: "image",
      //   src: "https://eu-central-1.graphassets.com/AIsBIpEzjT9776nQrClIuz/cm7rqvaygov1m07ukoq2r6mvs",
      //   alt: "Brand guidelines (Applications)",
      // },
      // { type: "heading", text: "Stickers" },
      // {
      //   type: "image",
      //   src: "https://eu-central-1.graphassets.com/AIsBIpEzjT9776nQrClIuz/cm7rqrj7pomkv08urjb1ay41p",
      //   alt: "Stickers",
      // },
      // {
      //   type: "image",
      //   src: "https://eu-central-1.graphassets.com/AIsBIpEzjT9776nQrClIuz/cm7rqs1qlorfc07ukn4p6rh9d",
      //   alt: "Stickers",
      // },
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
    description: basePlaceholderDescription,
    content: [
      {
        type: "paragraph",
        text: "We're working on the detailed case study for WealthComplex. In the meantime, the work page highlights a curated selection of visuals that represent the experience.",
      },
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
    description: basePlaceholderDescription,
    content: [
      {
        type: "paragraph",
        text: "This playful ecommerce experience was crafted for Bichinhos Ousados. The expanded write-up will be available shortly.",
      },
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
    description: basePlaceholderDescription,
    content: [
      {
        type: "paragraph",
        text: "POV.Tessellum reimagines data-driven storytelling. The full breakdown of flows and components is coming soon.",
      },
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
    description: basePlaceholderDescription,
    content: [
      {
        type: "paragraph",
        text: "Evergreen combines product design and growth strategy. Additional deliverables will be showcased soon.",
      },
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
    description: basePlaceholderDescription,
    content: [
      {
        type: "paragraph",
        text: "Flowly streamlines collaboration for product teams. Detailed insights into the workflows will arrive soon.",
      },
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
    description: basePlaceholderDescription,
    content: [
      {
        type: "paragraph",
        text: "Coverage modernises the insurance customer journey. A comprehensive feature list will be published soon.",
      },
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

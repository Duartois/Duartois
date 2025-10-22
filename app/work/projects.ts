import type { VariantName } from "@/components/three/types";

export const workProjects = [
  { key: "Duartois", slug: "duartois" },
  { key: "WealthComplex", slug: "wealthcomplex" },
  { key: "RETROCHROMA", slug: "retrochroma" },
  { key: "Bichinhos Ousados", slug: "bichinhos-ousados" },
  { key: "POV.Tessellum", slug: "pov-tessellum" },
  { key: "Evergreen", slug: "evergreen" },
  { key: "Flowly", slug: "flowly" },
  { key: "Coverage", slug: "coverage" },
  { key: "Feature", slug: "feature" },
] as const;

export type WorkProject = (typeof workProjects)[number];
export type ProjectKey = WorkProject["key"];
export type ProjectSlug = WorkProject["slug"];

export type ProjectPreview = {
  variantName: VariantName;
};

export const projectOrder = workProjects.map((project) => project.key) as ProjectKey[];

export const projectSlugByKey = workProjects.reduce(
  (accumulator, project) => {
    accumulator[project.key] = project.slug;
    return accumulator;
  },
  {} as Record<ProjectKey, ProjectSlug>,
);

export const projectKeyBySlug = workProjects.reduce(
  (accumulator, project) => {
    accumulator[project.slug] = project.key;
    return accumulator;
  },
  {} as Record<ProjectSlug, ProjectKey>,
);

export const projectPreviews: Record<ProjectKey, ProjectPreview> = projectOrder.reduce(
  (previews, key) => {
    previews[key] = { variantName: "work" } satisfies ProjectPreview;
    return previews;
  },
  {} as Record<ProjectKey, ProjectPreview>,
);

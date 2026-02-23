import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProjectPageContent } from "./ProjectPageContent";
import {
  projectSlugs,
  getProjectDetailBySlug,
  isProjectSlug,
} from "../projectDetails";
import type { ProjectSlug } from "../projects";

type WorkProjectPageParams = {
  slug: string;
};

export function generateStaticParams() {
  return projectSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<WorkProjectPageParams>;
}): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = rawSlug.toLowerCase();

  if (!isProjectSlug(slug)) {
    return {};
  }

  const detail = getProjectDetailBySlug(slug as ProjectSlug);
  const description = detail.description[0];

  return {
    title: `${detail.title} | Work`,
    description,
    openGraph: {
      title: detail.title,
      description,
      images: [
        {
          url: detail.heroImage.src,
          alt: detail.heroImage.alt,
        },
      ],
    },
  } satisfies Metadata;
}

export default async function WorkProjectPage({
  params,
}: {
  params: Promise<WorkProjectPageParams>;
}) {
  const { slug: rawSlug } = await params;
  const slug = rawSlug.toLowerCase();

  if (!isProjectSlug(slug)) {
    notFound();
  }

  return <ProjectPageContent slug={slug} />;
}
